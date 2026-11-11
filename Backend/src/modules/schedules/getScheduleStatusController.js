import candidateDetails from "./schedule.model.js";
import mongoose from "mongoose";

const getScheduleByStatus = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const { status } = req.query;
    const { userId } = req.params;

    const allowedStatuses = ["Completed", "Upcoming", "Incomplete"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Use one of: ${allowedStatuses.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const pipeline = [
      /* 1️⃣ Tenant-safe schedule filter */
      {
        $match: {
          Status: status,
          companyCode, // ✅ CRITICAL for SaaS
        },
      },

      /* 2️⃣ Join job */
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },

      /* 3️⃣ Hiring manager filter */
      {
        $match: {
          "job.hiringManager.userId": userId, // ✅ STRING comparison (correct)
          "job.companyCode": companyCode,      // ✅ double tenant safety
        },
      },

      /* 4️⃣ Sort */
      {
        $sort: { createdAt: -1 },
      },
    ];

    const results = await candidateDetails.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      message: `Schedule data with status '${status}' fetched successfully.`,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Get Schedule By Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching data by status.",
      error: error.message,
    });
  }
};

export default getScheduleByStatus;
