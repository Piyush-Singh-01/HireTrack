import mongoose from "mongoose";
import candidateDetails from "./schedule.model.js";
// import Job from "../../model/jobSchema.js";
const getAllSchedule = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const { type, position, status } = req.query;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const now = new Date();

    // ✅ SAFE date helpers (no mutation)
    const startOfDay = (d) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

    const endOfDay = (d) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    const matchStage = {
      companyCode, // ✅ TENANT SAFETY
    };

    /* ================= DATE FILTER ================= */
    if (type) {
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
          message: "Invalid type. Use today, yesterday, or tomorrow",
        });
      }

      matchStage.Date = {
        $gte: startOfDay(targetDate),
        $lte: endOfDay(targetDate),
      };
    }

    /* ================= POSITION FILTER ================= */
    if (position && position !== "All Position") {
      matchStage.Position = { $regex: position, $options: "i" };
    }

    /* ================= STATUS FILTER ================= */
    if (status && status !== "All Status") {
      const statusMap = {
        Completed: "Completed",
        Upcoming: "Scheduled",
        Incomplete: "Cancelled",
        Hired: "Completed",
        Reject: "Cancelled",
      };

      matchStage.Status = statusMap[status] || status;
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const pipeline = [
      { $match: matchStage },

      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },

      // ✅ CORRECT STRING COMPARISON
      {
        $match: {
          "job.hiringManager.userId": objectUserId,
          "job.companyCode": companyCode,
        },
      },

      {
        $sort: {
          Date: 1,
          Time: 1,
        },
      },
    ];

    const schedules = await candidateDetails.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      message: "Schedule fetched successfully",
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error("Get All Schedule Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching schedule",
      error: error.message,
    });
  }
};

export default getAllSchedule;
