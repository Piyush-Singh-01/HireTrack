import Job from "../jobs/job.model.js";
import mongoose from "mongoose";

/**
 * @route GET /api/positions/job-description/:jobId
 * @desc Get job description details by job ID (published jobs only)
 * @access Public
 */
const getJobDescriptionById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const companyCode = req.user?.companyCode; // ✅ ADDED (safe optional access)

    // -------------------------
    // Validate jobId
    // -------------------------
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
        error: "INVALID_JOB_ID",
      });
    }

    // -------------------------
    // Fetch published job only
    // -------------------------
    const job = await Job.findById(jobId)
      .populate("formId")
      .populate("screeningId")
      .select({
        jobTitle: 1,
        jobRole: 1,
        department: 1,
        jobLocation: 1,
        jobType: 1,
        hiringManager: 1,
        numberOfOpenings: 1,
        jobStatus: 1,
        closingDate: 1,
        postedOn: 1,

        about: 1,
        responsibilities: 1,
        requirements: 1,
        preferredQualifications: 1,
        lookingFor: 1,

        applicationLink: 1,
        companyInfo: 1,
        experience: 1,
        isDraft: 1,
        jobCode: 1,
        posterVisuals: 1,
        formId: 1,
        screeningId: 1,
        joiningInstructions: 1,
        createdAt: 1,
      })
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not published",
        error: "JOB_NOT_FOUND",
      });
    }

    // Consolidate screening questions for frontend ease of use
    const screeningQuestionsMap = new Map();
    
    // 1. From Form (isScreening fields)
    if (job.formId?.fields) {
      job.formId.fields.forEach(field => {
        if (field.meta?.isScreening) {
          screeningQuestionsMap.set(field.fieldId, {
            fieldId: field.fieldId,
            label: field.label,
            options: field.options,
            type: field.type,
            required: field.required,
            source: 'form'
          });
        }
      });
    }

    // 2. From Screening model
    if (job.screeningId?.screen) {
      job.screeningId.screen.forEach(q => {
        if (!screeningQuestionsMap.has(q.fieldId)) {
          screeningQuestionsMap.set(q.fieldId, {
            fieldId: q.fieldId,
            label: q.question, // Map 'question' to 'label' for consistency
            options: q.choices, // Map 'choices' to 'options' for consistency
            type: q.type,
            required: q.required,
            source: 'screening'
          });
        }
      });
    }

    // Add to the job object
    job.screeningQuestions = Array.from(screeningQuestionsMap.values());

    const now = new Date();
    const closingDate = job.closingDate ? new Date(job.closingDate) : null;

    const isJobActive =
      job.jobStatus === "Open" &&
      closingDate &&
      closingDate > now;

    const daysRemaining =
      isJobActive && closingDate
        ? Math.ceil((closingDate - now) / (1000 * 60 * 60 * 24))
        : 0;

    return res.status(200).json({
      success: true,
      message: "Job description retrieved successfully",
      data: {
        job,
        isActive: isJobActive,
        daysRemaining,
        canApply: Boolean(job.formId),
      },
    });
  } catch (error) {
    console.error("Error fetching job description:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching job description",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export default getJobDescriptionById;
