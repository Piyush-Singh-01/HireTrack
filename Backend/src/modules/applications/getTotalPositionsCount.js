import Job from "../jobs/job.model.js";

/**
 * Get total positions count (published jobs only)
 * GET /api/positions/total/count
 */
const getTotalPositionsCount = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const filter = {
      companyCode,   // ✅ Mandatory tenant isolation
      isDraft: false,
    };

    const totalPositions = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Total positions count retrieved successfully",
      data: {
        totalPositions,
      },
    });
  } catch (error) {
    console.error("Error fetching total positions count:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default getTotalPositionsCount;
