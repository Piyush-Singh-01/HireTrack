import mongoose from "mongoose";
import InterviewSchedule from "../interviews/interview.model.js";

const getallInterview = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const { type, status, position } = req.query;
    const { userId } = req.params;

    // ✅ ALWAYS VALIDATE
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const pipeline = [];

    /* ================= LOOKUP JOB ================= */
    pipeline.push({
      $lookup: {
        from: "jobs",
        localField: "jobId",
        foreignField: "_id",
        as: "job",
      },
    });

    pipeline.push({ $unwind: "$job" });

    /* ================= HIRING MANAGER FILTER ================= */
    pipeline.push({
      $match: {
        "job.hiringManager.userId": userId, // ✅ STRING compare
        "job.companyCode": companyCode,      // ✅ TENANT SAFETY
        companyCode,                         // ✅ schedule tenant safety
      },
    });

    /* ================= DATE FILTER ================= */
    if (type) {
      const now = new Date();
      let targetDate = new Date();

      if (type === "yesterday") {
        targetDate = new Date(now.getTime() - 86400000);
      } else if (type === "today") {
        targetDate = new Date();
      } else if (type === "tomorrow") {
        targetDate = new Date(now.getTime() + 86400000);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid type. Use today, yesterday, or tomorrow.",
        });
      }

      const dateStr = targetDate.toISOString().split("T")[0];

      pipeline.push({
        $match: {
          interviewDate: dateStr, // ✅ exact match safest for string dates
        },
      });
    }

    /* ================= STATUS FILTER ================= */
    if (status && status !== "All Status") {
      const statusMap = {
        Completed: "Completed",
        Upcoming: "Scheduled",
        Incomplete: "Cancelled",
        Hired: "Completed",
        "On Hold": "OnHold",
        Reject: "Cancelled",
        "Missed Out": "Cancelled",
      };

      pipeline.push({
        $match: {
          status: statusMap[status] || status,
        },
      });
    }

    /* ================= POSITION FILTER ================= */
    if (position && position !== "All Position") {
      pipeline.push({
        $match: {
          position: { $regex: position, $options: "i" },
        },
      });
    }

    /* ================= SORT ================= */
    pipeline.push({
      $sort: {
        interviewDate: 1,
        interviewTime: 1,
      },
    });

    const schedules = await InterviewSchedule.aggregate(pipeline);

    /* ================= FRONTEND TRANSFORM ================= */
    const transformedData = schedules.map((schedule) => {
      const uiStatusMap = {
        Scheduled: "Upcoming",
        Completed: "Completed",
        Cancelled: "Incomplete",
        Rescheduled: "Upcoming",
        OnHold: "On Hold",
      };

      return {
        _id: schedule._id,
        Date: schedule.interviewDate,
        Time: schedule.interviewTime,
        Position: schedule.position,
        Candidate: schedule.candidateName,
        Recruiter: schedule.recruiterName,
        Mode: schedule.meetingMode,
        Status: uiStatusMap[schedule.status] || schedule.status,
        Reschedule: schedule.rescheduled || false,
      };
    });

    res.status(200).json({
      success: true,
      message: "Schedule data fetched successfully.",
      count: transformedData.length,
      data: transformedData,
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching data",
      error: error.message,
    });
  }
};

export default getallInterview;
