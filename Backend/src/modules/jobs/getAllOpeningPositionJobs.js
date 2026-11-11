import Job from "./job.model.js";

/**
 * Get all open (published) jobs
 * GET /api/positions/open
 */
const getAllOpeningPositionJobs = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortBy = "publishedAt",
      sortOrder = "desc",
    } = req.query;

    const companyCode = req.user?.companyCode; // ✅ CRITICAL FOR SAAS

    page = Math.max(parseInt(page), 1);
    limit = Math.min(Math.max(parseInt(limit), 1), 50);

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
    // const todayOnly = new Date();
    // todayOnly.setHours(0, 0, 0, 0);


    const filter = {
      companyCode,
      isDraft: false,
      //  $nor: [
      //   { jobStatus: "Closed" },
      //   { closingDate: { $lt: todayOnly } },
      // ],
      jobStatus: { $ne: "Closed" },
    };

    const openJobs = await Job.find(filter)
      .populate("formId", "_id")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalOpenJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalOpenJobs / limit);

    res.status(200).json({
      success: true,
      message: "Open position jobs retrieved successfully",
      data: {
        jobs: openJobs,
        pagination: {
          currentPage: page,
          totalPages,
          totalJobs: totalOpenJobs,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching open position jobs:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default getAllOpeningPositionJobs;
