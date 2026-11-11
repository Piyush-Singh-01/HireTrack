import Job from "./job.model.js";

/**
 * Get all closed (published) jobs
 * GET /api/positions/closed
 */
const getAllClosedPositionJobs = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortBy = "publishedAt",
      sortOrder = "desc",
    } = req.query;

    const companyCode = req.user?.companyCode; // ✅ ADDED

    page = Math.max(parseInt(page), 1);
    limit = Math.min(Math.max(parseInt(limit), 1), 50);

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    
    // const todayOnly = new Date();
    // todayOnly.setHours(0, 0, 0, 0);
    const filter = {
      isDraft: false,
      companyCode,
      //  $or: [
      //   { jobStatus: "Closed" },
      //   { closingDate: { $lt: todayOnly } },
      // ],
      jobStatus: "Closed",
    };

    const closedJobs = await Job.find(filter)
      .populate("formId", "_id")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalClosedJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalClosedJobs / limit);

    res.status(200).json({
      success: true,
      message: "Closed position jobs retrieved successfully",
      data: {
        jobs: closedJobs,
        pagination: {
          currentPage: page,
          totalPages,
          totalJobs: totalClosedJobs,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching closed position jobs:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default getAllClosedPositionJobs;
