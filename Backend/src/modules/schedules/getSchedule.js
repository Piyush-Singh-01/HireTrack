// merged previous controller + new /schedules sort/filter features

import mongoose from "mongoose";
import InterviewSchedule from "../interviews/interview.model.js";
import candidateDetails from "./schedule.model.js";

const getInterviewSchedules = async (
  req,
  res
) => {
  try {
    const companyCode =
      req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized: companyCode missing",
      });
    }

    const { userId } =
      req.params;

    const {
      scheduleType = "interview",

      // existing filters
      type,
      status,
      position,

      // new filters
      jobId,
      fromDate,
      toDate,

      // new sorting
      sortBy = "date",
      sortOrder = "asc",
    } = req.query;

    // optional userId mode
    if (
      userId &&
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid userId",
      });
    }

    // validate jobId
    if (
      jobId &&
      !mongoose.Types.ObjectId.isValid(
        jobId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid jobId",
      });
    }

    const allowedSort = [
      "date",
      "time",
      "status",
      "position",
      "createdAt",
    ];

    if (
      !allowedSort.includes(
        sortBy
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid sortBy",
      });
    }

    const direction =
      sortOrder === "desc"
        ? -1
        : 1;

    // =====================================================
    // MODE 1 : MAIN INTERVIEW SCHEDULE COLLECTION
    // =====================================================

    if (
      scheduleType ===
      "interview"
    ) {
      const pipeline =
        [];

      pipeline.push({
        $lookup: {
          from: "jobs",
          localField:
            "jobId",
          foreignField:
            "_id",
          as: "job",
        },
      });

      pipeline.push({
        $unwind:
          "$job",
      });

      pipeline.push({
        $lookup: {
          from: "applications",
          localField: "candidateIds",
          foreignField: "_id",
          as: "applicationsData",
        },
      });

      const match =
        {
          companyCode,
          "job.companyCode":
            companyCode,
        };

      if (userId && !["SuperAdmin", "Admin", "HR"].includes(req.user.Role)) {
        match[
          "job.hiringManager.userId"
        ] = new mongoose.Types.ObjectId(userId);
      }

      if (jobId) {
        match.jobId =
          new mongoose.Types.ObjectId(
            jobId
          );
      }

      pipeline.push({
        $match: match,
      });

      // ----------------------------------
      // relative date filter
      // ----------------------------------
      if (type) {
        // Use IST (GMT+5:30) for date calculation to match server/user context
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + istOffset);

        let startDate, endDate;

        if (type === "today") {
          startDate = new Date(istNow);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(istNow);
          endDate.setHours(23, 59, 59, 999);
        } else if (type === "yesterday") {
          startDate = new Date(istNow);
          startDate.setDate(istNow.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
        } else if (type === "tomorrow") {
          startDate = new Date(istNow);
          startDate.setDate(istNow.getDate() + 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
        } else if (type === "week") {
          // Current week (Monday to Sunday)
          startDate = new Date(istNow);
          const day = istNow.getDay(); // 0 (Sun) to 6 (Sat)
          const diff = istNow.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
          startDate.setDate(diff);
          startDate.setHours(0, 0, 0, 0);
          
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
        } else if (type === "month") {
          // Current month
          startDate = new Date(istNow.getFullYear(), istNow.getMonth(), 1);
          endDate = new Date(istNow.getFullYear(), istNow.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
        } else {
          return res.status(400).json({
            success: false,
            message: "Invalid type",
          });
        }

        // Convert IST-calculated dates back to UTC strings for matching with DB storage (which is midnight UTC)
        const startStr = startDate.toISOString().split("T")[0];
        const endStr = endDate.toISOString().split("T")[0];

        pipeline.push({
          $match: {
            interviewDate: {
              $gte: new Date(startStr),
              $lte: new Date(endStr),
            },
          },
        });
      }

      // ----------------------------------
      // range filter
      // ----------------------------------
      if (
        fromDate ||
        toDate
      ) {
        const dateMatch =
          {};

        if (fromDate)
          dateMatch.$gte =
            fromDate;

        if (toDate)
          dateMatch.$lte =
            toDate;

        pipeline.push({
          $match: {
            interviewDate:
              dateMatch,
          },
        });
      }

      // ----------------------------------
      // status filter
      // ----------------------------------
      if (status && status !== "All Status") {
        const interviewStatusMap = {
          schedule: ["Scheduled", "Start Interview"],
          upcoming: ["Scheduled", "Start Interview"],
          Upcoming: ["Scheduled", "Start Interview"],
          reschedule: "Rescheduled",
          rescheduled: "Rescheduled",
          completed: "Completed",
          Completed: "Completed",
          cancelled: "Cancelled",
          Cancelled: "Cancelled",
        };

        const appStatusMap = {
          hired: "hired",
          rejected: "rejected",
          onhold: "onhold",
        };

        if (interviewStatusMap[status]) {
          const val = interviewStatusMap[status];
          pipeline.push({
            $match: {
              status: Array.isArray(val) ? { $in: val } : val,
              // Only show as "Scheduled" if the application isn't already in a final state
              "applicationsData.profileStatus": {
                $nin: ["hired", "rejected", "onhold"],
              },
            },
          });
        } else if (appStatusMap[status]) {
          pipeline.push({
            $match: {
              "applicationsData.profileStatus": appStatusMap[status],
            },
          });
        } else {
          // Fallback
          pipeline.push({
            $match: {
              status: status,
            },
          });
        }
      }

      // ----------------------------------
      // position filter
      // ----------------------------------
      if (
        position &&
        position !==
          "All Position"
      ) {
        pipeline.push({
          $match: {
            position:
              {
                $regex:
                  position,
                $options:
                  "i",
              },
          },
        });
      }

      // ----------------------------------
      // dynamic sort
      // ----------------------------------
      const sortMap =
        {
          date:
            "interviewDate",
          time:
            "interviewTime",
          status:
            "status",
          position:
            "position",
          createdAt:
            "createdAt",
        };

      pipeline.push({
        $sort: {
          [sortMap[
            sortBy
          ]]:
            direction,
        },
      });

      const rows =
        await InterviewSchedule.aggregate(
          pipeline
        );

      const uiMap = {
        Scheduled: "upcoming",
        "Start Interview": "upcoming",
        Completed: "completed",
        Cancelled: "cancelled",
        Rescheduled: "rescheduled",
      };

      const data =
        rows.map(
          (
            s
          ) => ({
            scheduleId:
              s._id,
            interviewDate:
              s.interviewDate,
            interviewTime:
              s.interviewTime,
            status: (() => {
              const appStatus = s.applicationsData?.[0]?.profileStatus?.toLowerCase();
              if (["hired", "rejected", "onhold"].includes(appStatus)) {
                return s.applicationsData[0].profileStatus;
              }
              return uiMap[s.status] || s.status;
            })(),
            meetingMode:
              s.meetingMode,
            recruiterName:
              (s.recruiterName && s.recruiterName !== "Unknown") ? s.recruiterName : (s.job?.hiringManager?.name || "Unknown"),
            duration:
              s.durationMinutes,
            rescheduled:
              s.rescheduled ??
              false,
            meetingLink:
              (s.meetingLink && !s.meetingLink.includes("placeholder")) ? s.meetingLink : (s.meetingMode === "Online" || !s.meetingMode ? "https://meet.google.com/new" : null),
            scheduleType:
              s.scheduleType || "Interview",
            candidateId:
              (s.candidateIds && s.candidateIds[0]) || (s.candidates && s.candidates[0] && s.candidates[0].candidateId) || null,
            applicationId:
              (s.candidateIds && s.candidateIds[0]) || (s.candidates && s.candidates[0] && s.candidates[0].candidateId) || null,
            candidateEmail:
              (s.applicationsData && s.applicationsData[0] && s.applicationsData[0].answers && s.applicationsData[0].answers.email) ||
              (s.candidates && s.candidates[0] && s.candidates[0].email) || null,

            candidate:
              {
                name: (() => {
                  let names = [];
                  if (s.applicationsData && s.applicationsData.length > 0) {
                    names = s.applicationsData.map(a => 
                      `${a.answers?.firstName || ""} ${a.answers?.middleName || ""} ${a.answers?.lastName || ""}`.replace(/\s+/g, ' ').trim() || 
                      a.answers?.full_name || 
                      a.answers?.name || 
                      "Unknown"
                    );
                  } else if (s.candidateNames && s.candidateNames.length > 0) {
                    names = s.candidateNames;
                  } else if (s.candidates && s.candidates.length > 0) {
                    names = s.candidates.map(c => c.name || "Unknown");
                  }
                  
                  if (s.scheduleType === "Group Interview" && names.length > 0) {
                    return names.join(", ");
                  }
                  
                  return names[0] || s.candidateName || "Unknown";
                })(),
              },
              
            allApplications: s.scheduleType === "Group Interview" ? (() => {
              if (s.applicationsData && s.applicationsData.length > 0) {
                return s.applicationsData.map(a => ({
                  applicationId: a._id,
                  candidateId: a.candidateId,
                  name: `${a.answers?.firstName || ""} ${a.answers?.middleName || ""} ${a.answers?.lastName || ""}`.replace(/\s+/g, ' ').trim() || a.answers?.full_name || a.answers?.name || "Unknown",
                  email: a.answers?.email || "Unknown"
                }));
              } else if (s.candidates && s.candidates.length > 0) {
                return s.candidates.map(c => ({
                  applicationId: c.candidateId,
                  candidateId: c.candidateId,
                  name: c.name || "Unknown",
                  email: c.email || "Unknown"
                }));
              }
              return [];
            })() : undefined,

            job: {
              jobId:
                s.jobId,
              jobTitle:
                s.position,
            },

            action:
              s.meetingMode === "offline"
                ? "View"
                : ["Scheduled", "Start Interview"].includes(s.status)
                ? "Start Interview"
                : "--",
          })
        );

      return res
        .status(200)
        .json({
          success:
            true,
          count:
            data.length,
          data,
        });
    }

    // =====================================================
    // MODE 2 / MODE 3 : candidateDetails
    // =====================================================

    const matchStage =
      {
        companyCode,
      };

    if (
      status &&
      status !==
        "All Status"
    ) {
      matchStage.Status =
        status;
    }

    if (
      position &&
      position !==
        "All Position"
    ) {
      matchStage.Position =
        {
          $regex:
            position,
          $options:
            "i",
        };
    }

    const pipeline =
      [
        {
          $match:
            matchStage,
        },
        {
          $lookup:
            {
              from: "jobs",
              localField:
                "jobId",
              foreignField:
                "_id",
              as: "job",
            },
        },
        {
          $unwind:
            "$job",
        },
      ];

    const second =
      {
        "job.companyCode":
          companyCode,
      };

    if (userId && !["SuperAdmin", "Admin", "HR"].includes(req.user.Role)) {
      second[
        "job.hiringManager.userId"
      ] = new mongoose.Types.ObjectId(userId);
    }

    if (jobId) {
      second[
        "job._id"
      ] =
        new mongoose.Types.ObjectId(
          jobId
        );
    }

    pipeline.push({
      $match:
        second,
    });

    pipeline.push({
      $sort: {
        [sortBy]:
          direction,
      },
    });

    const data =
      await candidateDetails.aggregate(
        pipeline
      );

    return res
      .status(200)
      .json({
        success:
          true,
        count:
          data.length,
        data,
      });
  } catch (error) {
    console.error(
      "Interview fetch error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};

export default getInterviewSchedules;
