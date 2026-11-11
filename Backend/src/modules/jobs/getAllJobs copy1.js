import mongoose from "mongoose";
import Application from "../../../model/applicantSchema.js";
import InterviewSchedule from "../../../model/InterviewScheduleSchema.js";
import Job from "../../../model/jobSchema.js";

const getJobCandidatesAndSchedules = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      type = "candidates",
      status,
      rescheduled,
      page = 1,
      limit = 10,
      position,
    } = req.query;

    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId",
      });
    }

    const jobObjectId = new mongoose.Types.ObjectId(jobId);
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 50);

    /* ================= VERIFY JOB OWNERSHIP ================= */
    const job = await Job.findOne({
      _id: jobObjectId,
      companyCode,              // âœ… Tenant enforcement
    }).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    /* ================= CANDIDATES ================= */
    if (type === "candidates") {
      const allowedStatuses = [
        "applied",
        "shortlisted",
        "interview",
        "onhold",
        "hired",
        "rejected",
      ];

      const filter = {
        companyCode,           // âœ… CRITICAL FIX
        jobId: jobObjectId,
      };

      if (status) {
        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
          });
        }

        filter.profileStatus = status;
      }

      const skip = (pageNum - 1) * limitNum;

      const applications = await Application.find(filter)
        .populate("candidateId", "name email mobile")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await Application.countDocuments(filter);

      const applicationIds = applications.map(app => app._id);

      const scheduleQuery = {
        companyCode,           // âœ… Tenant enforcement
        jobId: jobObjectId,
        candidateIds: { $in: applicationIds },
      };

      if (rescheduled === "true") {
        scheduleQuery.rescheduled = true;
      }

      const schedules = applicationIds.length
        ? await InterviewSchedule.find(scheduleQuery).lean()
        : [];

      const scheduleMap = new Map();

      schedules.forEach(schedule => {
        (schedule.candidateIds || []).forEach(appId => {
          const key = String(appId);

          if (!scheduleMap.has(key)) {
            scheduleMap.set(key, []);
          }

          scheduleMap.get(key).push(schedule);
        });
      });

      const data = applications.map(app => {
        const appSchedules = scheduleMap.get(String(app._id)) || [];

        const latestSchedule = appSchedules.sort((a, b) => {
          const dateA = new Date(`${a.interviewDate}T${a.interviewTime}`);
          const dateB = new Date(`${b.interviewDate}T${b.interviewTime}`);
          return dateB - dateA;
        })[0];

        return {
          applicationId: app._id,
          status: app.profileStatus,

          candidate: {
            candidateId: app.candidateId?._id || null,
            name: app.candidateId?.name || "Unknown",
            email: app.candidateId?.email || null,
            mobile: app.candidateId?.mobile || null,
          },

          interviewSchedule: latestSchedule
            ? {
                scheduleId: latestSchedule._id,
                scheduleType: latestSchedule.scheduleType, 
                interviewDate: latestSchedule.interviewDate,
                interviewTime: latestSchedule.interviewTime,
                recruiterName: latestSchedule.recruiterName,
                meetingMode: latestSchedule.meetingMode,
                status: latestSchedule.status,
                rescheduled: latestSchedule.rescheduled ?? false,
                meetingLink: latestSchedule.meetingLink || null,
              }
            : null,

          updatedAt: app.updatedAt,
        };
      });

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalCandidates: total,
        },
      });
    }

    /* ================= SCHEDULES ================= */
    if (type === "schedules") {
      const scheduleQuery = {
        companyCode,          // âœ… CRITICAL FIX
        jobId: jobObjectId,
      };

      if (position) {
        scheduleQuery.position = {
          $regex: position,
          $options: "i",
        };
      }

      if (rescheduled === "true") {
        scheduleQuery.rescheduled = true;
      }

      const schedules = await InterviewSchedule.find(scheduleQuery)
        .populate({
          path: "candidateIds",
          populate: {
            path: "candidateId",
            select: "name email mobile",
          },
        })
        .sort({ interviewDate: 1, interviewTime: 1 })
        .lean();

      const data = schedules.map(s => ({
        scheduleId: s._id,
        scheduledType:s.scheduleType,
        interviewDate: s.interviewDate,
        interviewTime: s.interviewTime,
        recruiterName: s.recruiterName,
        meetingMode: s.meetingMode,
        status: s.status,
        rescheduled: s.rescheduled ?? false,

        applications: (s.candidateIds || []).map(app => ({
          applicationId: app?._id || null,
          candidate: {
            candidateId: app?.candidateId?._id || null,
            name: app?.candidateId?.name || "Unknown",
            email: app?.candidateId?.email || null,
            profileStatus: app?.profileStatus || null,
          },
        })),
      }));

      return res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid type",
    });

  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export default getJobCandidatesAndSchedules;

