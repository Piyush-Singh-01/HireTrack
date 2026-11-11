import Job from "../jobs/job.model.js";

const getClosedPositionsCount = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const closedPositionsCount = await Job.countDocuments({
      jobStatus: "Closed",
      isDraft: false,
      companyCode, 
    });

    res.status(200).json({
      success: true,
      data: {
        closedPositionsCount,
      },
      message: "Closed positions count retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching closed positions count:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default getClosedPositionsCount;
