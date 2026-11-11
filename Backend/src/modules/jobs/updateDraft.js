import mongoose from "mongoose";
import Job from "./job.model.js";

/**
 * Update Draft (SaaS multi-tenant)
 * PUT /api/jobs/updateDraft/:id
 */
const updateDraft = async (req, res) => {
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

    // 2️⃣ Allowed draft fields
    const allowedFields = [
      "jobTitle",
      "jobRole",
      "department",
      "jobLocation",
      "jobType",
      "experience",
      "jobCode",
      "hiringManager",
      "hiringManagers",
      "numberOfOpenings",
      "jobStatus",
      "closingDate",
      "about",
      "responsibilities",
      "requirements",
      "preferredQualifications",
      "lookingFor",
      "companyInfo",
      "applicationLink",
      "posterVisuals",
      "formId",
      "screeningId",
      "joiningInstructions",
    ];

    const updateData = {};
    console.log("=== UPDATE DRAFT DEBUG ===");
    console.log("req.body.screeningId:", req.body.screeningId);

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if ((field === "screeningId" || field === "formId") && req.body[field] === null) {
          return;
        }
        updateData[field] = req.body[field];
      }
    });
    console.log("updateData.screeningId after filter:", updateData.screeningId);

    // Enforce draft rules
    updateData.isDraft = true;
    updateData.draftSavedAt = new Date();
    updateData.publishedAt = null;

    // 3️⃣ Tenant-safe update
    const draft = await Job.findOne({ _id: id, isDraft: true, companyCode });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found or you do not have permission",
      });
    }

    Object.keys(updateData).forEach((key) => {
      draft[key] = updateData[key];
    });

    await draft.save();

    res.status(200).json({
      success: true,
      message: "Draft updated successfully",
      data: draft,
    });
  } catch (err) {
    console.error("Update Draft Error:", err);

    if (err.name === "ValidationError") {
      const fields = Object.keys(err.errors || {});
      return res.status(400).json({
        success: false,
        message: `Validation failed for: ${fields.join(", ")}`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error while updating draft",
    });
  }
};

export default updateDraft;
