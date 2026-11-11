import mongoose from "mongoose";
import Job from "./job.model.js";
import Form from "../forms/form.model.js";

/**
 * Publish Draft
 * POST /api/jobs/publishDraft/:id
 */
const publishDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const additionalData = req.body || {};
    const companyCode = req.user.companyCode;

    // -------------------------
    // Validate ObjectId
    // -------------------------
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid draft id",
      });
    }

    // -------------------------
    // Find tenant-safe draft
    // -------------------------
    const draft = await Job.findOne({ _id: id, isDraft: true, companyCode });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found or already published",
      });
    }

    // -------------------------
    // Merge allowed fields only
    // -------------------------
    const allowedUpdates = [
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
      "screeningId",
      "joiningInstructions",

    ];

    allowedUpdates.forEach((field) => {
      if (additionalData[field] !== undefined) {
        draft[field] = additionalData[field];
      }
    });

    // -------------------------
    // Validate required fields
    // -------------------------
    const requiredFields = [
      "jobTitle",
      "jobRole",
      "department",
      "jobLocation",
      "jobType",
      "numberOfOpenings",
      "closingDate",
      "about",
      "responsibilities",
      "requirements",
      "preferredQualifications",
      "lookingFor",
    ];

    const missingFields = requiredFields.filter((f) => !draft[f]);
    if (!draft.hiringManager && (!draft.hiringManagers || draft.hiringManagers.length === 0)) {
      missingFields.push("hiringManager(s)");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot publish draft. Missing required fields",
        missingFields,
      });
    }

    // -------------------------
    // Validate dynamic form
    // -------------------------
    if (!draft.formId) {
      return res.status(400).json({
        success: false,
        message: "Cannot publish job without an application form",
      });
    }

    const formExists = await Form.findOne({
      _id: draft.formId,
      isActive: true,
      companyCode,
    });

    if (!formExists) {
      return res.status(400).json({
        success: false,
        message: "Attached application form is missing or inactive",
      });
    }

    // -------------------------
    // Publish job
    // -------------------------
    draft.isDraft = false;
    draft.draftSavedAt = null;
    draft.publishedAt = new Date();
    draft.postedOn = new Date();
    draft.jobStatus = draft.jobStatus || "Open";


    await draft.save();

    res.status(200).json({
      success: true,
      message: "Draft published successfully. Job is now live",
      data: draft,
    });
  } catch (err) {
    console.error("Publish Draft Error:", err);

    if (err.name === "ValidationError") {
      const fields = Object.keys(err.errors || {});
      return res.status(400).json({
        success: false,
        message: `Validation failed for: ${fields.join(", ")}`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error while publishing draft",
    });
  }
};

export default publishDraft;
