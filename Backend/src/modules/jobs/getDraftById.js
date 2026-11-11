import mongoose from "mongoose";
import Job from "./job.model.js";

/**
 * Get Single Draft by ID (SaaS multi-tenant)
 * GET /api/jobs/draft/:id
 * Returns a specific draft for editing
 */
const getDraftById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyCode = req.user.companyCode; // tenant isolation

    // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid draft id",
      });
    }

    // 2️⃣ Fetch draft + linked form (if any)
    const draft = await Job.findOne({ _id: id, isDraft: true, companyCode })
      .populate("formId") // important for dynamic form editing
      .lean();

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found for your company",
      });
    }

    res.status(200).json({
      success: true,
      message: "Draft retrieved successfully",
      data: draft,
    });
  } catch (err) {
    console.error("Get Draft By ID Error:", err);

    res.status(500).json({
      success: false,
      message: "Error while fetching draft",
    });
  }
};

export default getDraftById;
