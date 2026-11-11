import Job from "../jobs/job.model.js";

/**
 * Get open positions count (published only)
 * GET /api/positions/open/count
 */
const getOpenPositions = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const filter = {
      companyCode,          // ✅ Critical for SaaS isolation
      isDraft: false,
      jobStatus: "Open",
    };

    const openPositionsCount = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Open positions count retrieved successfully",
      data: {
        openPositionsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching open positions count:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default getOpenPositions;
