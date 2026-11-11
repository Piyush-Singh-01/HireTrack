import mongoose from "mongoose";
import InterviewSchedule from "../interviews/interview.model.js";

/**
 * GET /schedules
 */
const getInterviewSchedules = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const { status, jobId, position, fromDate, toDate } = req.query;

    const query = { companyCode };

    /* ================= STATUS FILTER ================= */

    if (status && status !== "All Status") {
      const statusMap = {
        upcoming: "Scheduled",
        completed: "Completed",
        cancelled: "Cancelled",
        rescheduled: "Rescheduled",
      };

      if (!statusMap[status]) {
        return res.status(400).json({
          success: false,
          message: "Invalid interview status",
        });
      }

      query.status = statusMap[status];
    }

    /* ================= JOB FILTER ================= */

    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid jobId",
        });
      }

      query.jobId = jobId;
    }

    /* ================= DATE FILTER (STRING SAFE) ================= */

    if (fromDate || toDate) {
      query.interviewDate = {};

      if (fromDate) query.interviewDate.$gte = fromDate;
      if (toDate) query.interviewDate.$lte = toDate;
    }

    /* ================= FETCH ================= */

    const schedules = await InterviewSchedule.find(query)
      .populate({
        path: "applicationId",
        populate: [
          { path: "jobId", select: "jobTitle department companyCode" },
          { path: "candidateId", select: "name email mobile" },
        ],
      })
      .sort({ interviewDate: 1, interviewTime: 1 })
      .lean();

    /* ================= POSITION FILTER (DB SAFE) ================= */

    let filtered = schedules;

    if (position) {
      const regex = new RegExp(position, "i");

      filtered = schedules.filter((s) =>
        regex.test(s.applicationId?.jobId?.jobTitle || "")
      );
    }

    /* ================= TRANSFORM ================= */

    const data = filtered.map((s) => {
      const uiStatusMap = {
        Scheduled: "upcoming",
        Completed: "completed",
        Cancelled: "cancelled",
        Rescheduled: "rescheduled",
      };

      return {
        scheduleId: s._id,
        interviewDate: s.interviewDate,
        interviewTime: s.interviewTime,
        status: uiStatusMap[s.status] || s.status,
        meetingMode: s.meetingMode,
        recruiterName: s.recruiterName,
        duration: s.durationMinutes,
        rescheduled: s.rescheduled ?? false,

        candidate: {
          candidateId: s.applicationId?.candidateId?._id || null,
          name: s.applicationId?.candidateId?.name || "Unknown",
          email: s.applicationId?.candidateId?.email || null,
          mobile: s.applicationId?.candidateId?.mobile || null,
        },

        job: {
          jobId: s.applicationId?.jobId?._id || null,
          jobTitle: s.applicationId?.jobId?.jobTitle || null,
          department: s.applicationId?.jobId?.department || null,
        },

        action:
          s.meetingMode === "offline"
            ? "View"
            : s.status === "Scheduled"
            ? "Start Interview"
            : "--",
      };
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching interview schedules:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching interview schedules",
      error: error.message,
    });
  }
};

export default getInterviewSchedules;
