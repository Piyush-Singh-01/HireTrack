import mongoose from "mongoose";
import Application from "./applicantSchema.js";

/**
 * Get applications count
 * GET /api/applications/count
 * Optional query params: jobId, status
 */
const getApplicationsCount = async (req, res) => {
  try {
    const { jobId, status } = req.query;

    const companyCode = req.user?.companyCode;   // ✅ CRITICAL

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const filter = { companyCode };              // ✅ Tenant isolation

    // Optional job filter
    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid jobId",
        });
      }
      filter.jobId = jobId;
    }

    // Optional status filter
    if (status && status !== "All") {
      filter.profileStatus = status;
    }

    const totalApplicationsCount = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Applications count retrieved successfully",
      data: {
        totalApplicationsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching applications count:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default getApplicationsCount;
