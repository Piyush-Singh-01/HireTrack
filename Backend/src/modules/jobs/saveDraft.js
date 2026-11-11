import mongoose from "mongoose";
import Job from "./job.model.js";

/**
 * Save Job as Draft (tenant-safe)
 * POST /api/jobs/saveDraft
 */
const saveDraft = async (req, res) => {
  try {
    const { draftId, ...payload } = req.body;
    const companyCode = req.user.companyCode; // tenant isolation

    // -------------------------
    // Fields allowed in draft
    // -------------------------
      const allowedFields = [
        "jobTitle",
        "jobRole",
        "department",
        "jobLocation",
        "jobType",
        "experience",
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
        "joiningInstructions",
      ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (payload[field] !== undefined) {
        updateData[field] = payload[field];
      }
    });

    // Enforce draft state
    updateData.isDraft = true;
    updateData.draftSavedAt = new Date();
    updateData.publishedAt = null;
    updateData.companyCode = companyCode; // tenant-safe

    let draft;

    // -------------------------
    // Update existing draft
    // -------------------------
    if (draftId) {
      if (!mongoose.Types.ObjectId.isValid(draftId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid draftId",
        });
      }

      draft = await Job.findOne({ _id: draftId, isDraft: true, companyCode });

      if (!draft) {
        return res.status(404).json({
          success: false,
          message: "Draft not found or you do not have permission",
        });
      }

      Object.assign(draft, updateData);
      await draft.save();
    } 
    // -------------------------
    // Create new draft
    // -------------------------
    else {
      draft = new Job(updateData);
      await draft.save();
    }


    res.status(200).json({
      success: true,
      message: "Draft saved successfully",
      data: draft,
    });
  } catch (err) {
    console.error("Save Draft Error:", err);

    if (err.name === "ValidationError") {
      const fields = Object.keys(err.errors || {});
      return res.status(400).json({
        success: false,
        message: `Validation failed for: ${fields.join(", ")}`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error while saving draft",
    });
  }
};

export default saveDraft;
