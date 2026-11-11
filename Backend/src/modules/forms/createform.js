import mongoose from "mongoose";
import Form from "./form.model.js";
import Job from "../jobs/job.model.js";

const createForm = async (req, res) => {
  try {
    const { jobId, title, description, fields, moduleConfig, selectedModules } = req.body;
    const companyCode = req.user.companyCode;

     if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing in user",
      });
    }

    // -------------------------
    // Validate required fields
    // -------------------------
    if (!jobId || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "jobId and fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId",
      });
    }

    // -------------------------
    // Check job exists and belongs to tenant
    // -------------------------
    const jobExists = await Job.findOne({ _id: jobId, companyCode });
    if (!jobExists) {
      return res.status(404).json({
        success: false,
        message: "Job not found or does not belong to your company",
      });
    }

    // -------------------------
    // Prevent multiple active forms per job
    // -------------------------
    const existingForm = await Form.findOne({ jobId, isActive: true, companyCode });
    if (existingForm) {
      return res.status(200).json({
        success: true,
        message: "Active form already exists for this job",
        data: existingForm,
      });
    }

    // -------------------------
    // Create form
    // -------------------------
    const form = await Form.create({
      jobId,
      title: title || "Untitled Form",
      description: description || "",
      fields,
      moduleConfig: moduleConfig || {},
      selectedModules: selectedModules || [],
      companyCode, // important for multi-tenant
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Form created successfully",
      data: form,
    });
  } catch (error) {
    console.error("Create Form Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating form",
      error: error.message,
    });
  }
};

export default createForm;

