import Job from "./job.model.js";

/**
 * Get All Drafts (SaaS multi-tenant)
 * GET /api/jobs/drafts
 */
const getDrafts = async (req, res) => {
  try {
    let { page = 1, limit = 10, sortBy = "draftSavedAt", order = "desc" } = req.query;
    const companyCode = req.user.companyCode; // tenant isolation

    page = Math.max(parseInt(page), 1);
    limit = Math.min(Math.max(parseInt(limit), 1), 50); // cap limit
    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    // Tenant-safe filter
    const filter = { isDraft: true, companyCode };

    const drafts = await Job.find(filter)
      .populate("formId") // dynamic form awareness
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalDrafts = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Drafts retrieved successfully",
      pagination: {
        count: drafts.length,
        totalDrafts,
        currentPage: page,
        totalPages: Math.ceil(totalDrafts / limit),
      },
      data: drafts,
    });
  } catch (err) {
    console.error("Get Drafts Error:", err);
    res.status(500).json({
      success: false,
      message: "Error while fetching drafts",
    });
  }
};

export default getDrafts;
