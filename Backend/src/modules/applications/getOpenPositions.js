import Job from "../jobs/job.model.js";


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
      companyCode,         
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

    res.status(500).json({success: false, message: "Internal server error"});
  }
};

export default getOpenPositions;
