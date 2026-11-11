import mongoose from "mongoose";
import Application from "./applicantSchema.js";
import Job from "../jobs/job.model.js";
import Form from "../forms/form.model.js";
import Screening from "../screening/screening.model.js";
import Candidate from "../interviews/candidateInterview.model.js";
import validator from "validator";
import { createApplicantNotification } from "../../common/utils/notifications.js";
import userModel from "../users/user.model.js";
import { sendEmail } from "../../common/utils/emailService.js"; // make sure added
import { MailTemplates } from "../../common/utils/mailTemaplate.js";

const createApplication = async (req, res) => {
  try {
    const { jobId, formId, answers, termsAccepted, consent = true } = req.body;

    // -------------------------
    // BASIC VALIDATIONS
    // -------------------------
    if (!jobId || !formId || !answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "jobId, formId and answers are required",
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: "Terms must be accepted",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId or formId",
      });
    }

    // -------------------------
    // JOB & FORM CHECK
    // -------------------------
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const companyCode = req.user?.companyCode || job.companyCode;

    const form = await Form.findOne({ _id: formId, companyCode });
    if (!form || String(form.jobId) !== String(jobId)) {
      return res.status(404).json({
        success: false,
        message: "Form not found for this job",
      });
    }

    // -------------------------
    // CANDIDATE FIND OR CREATE
    // -------------------------
    const email = answers.email ? String(answers.email).toLowerCase().trim() : null;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email required",
      });
    }

    const name = `${answers?.firstName || ""} ${answers?.middleName || ""} ${answers?.lastName || ""}`.replace(/\s+/g, ' ').trim() || answers.full_name || answers.name || "";

    let candidate = await Candidate.findOne({ email, companyCode });
    if (!candidate) {
      candidate = await Candidate.create({
        name,
        email,
        mobile: answers.mobile || answers.contactNumber || "",
        companyCode,
        jobId,
      });
    }

    // -------------------------
    // REQUIRED FIELD VALIDATION
    // -------------------------
    for (const field of form.fields) {
      if (field.required && (answers[field.fieldId] === undefined || answers[field.fieldId] === "")) {
        return res.status(400).json({
          success: false,
          message: `${field.label} is required`,
        });
      }
    }

    // -------------------------
    // DUPLICATE APPLICATION CHECK
    // -------------------------
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: candidate._id,
      companyCode,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "Already applied",
      });
    }

    // -------------------------
    // SCREENING EVALUATION
    // -------------------------
    let screeningResult = {
      totalScore: 0,
      maxScore: 0,
      autoScore: 0,
      status: "pending",
      evaluatedAt: null,
    };

    let applicationStatus = "applied";
    let candidateRating = null;

    if (job.screeningId) {
      console.log("=== SCREENING DEBUG ===");
      console.log("job.screeningId:", job.screeningId);
      const screeningDoc = await Screening.findOne({ _id: job.screeningId, companyCode });
      console.log("screeningDoc found:", !!screeningDoc);
      console.log("screeningDoc questions:", screeningDoc?.screen?.length, "questions");
      if (screeningDoc) {
        console.log("Question fieldIds:", screeningDoc.screen.map(q => q.fieldId));
        console.log("Question correctAnswers:", screeningDoc.screen.map(q => ({ fieldId: q.fieldId, type: q.type, correctAnswer: q.correctAnswer })));
        console.log("Answer keys:", Object.keys(answers));
        const result = screeningDoc.validateAnswersAndRate(answers);
        console.log("Scoring result:", JSON.stringify(result, null, 2));
        candidateRating = result.candidateRating || null;

        const derivedStatus =
          result.candidateRating === "Not a fit"
            ? "failed"
            : result.candidateRating === "pending"
            ? "pending"
            : "passed";

        screeningResult = {
          totalScore: result.totalScore ?? result.correctAnswers,
          maxScore: result.maxScore ?? result.totalQuestions,
          autoScore: result.totalScore ?? result.correctAnswers,
          status: derivedStatus,
          evaluatedAt: result.totalQuestions > 0 ? new Date() : null,
        };

        if (derivedStatus === "failed") {
          applicationStatus = "rejected";

          // 🔹 Send rejection mail (non-blocking)
          (async () => {
            try {
              const adminUser = await userModel.findOne({ companyCode });

              if (!adminUser || !adminUser.emailConfig?.authEmail) {
                console.log("Email config missing, skipping mail");
                return;
              }

              const template = MailTemplates.rejection({
                candidateName: name,
                job,
                organizationName: adminUser?.organizationName,
                businessEmail: adminUser?.businessEmail,
                logo: adminUser?.companyLogo,
              });

              await sendEmail({
                companyCode,
                to: email,
                subject: template.subject,
                html: template.html,
              });

            } catch (err) {
              console.error("Rejection mail error:", err.message);
            }
          })();
        }
      }
    } else {
      console.log("=== NO SCREENING: job.screeningId is", job.screeningId, "===");
    }

    // -------------------------
    // CREATE APPLICATION
    // -------------------------
    const newApplication = await Application.create({
      jobId,
      formId,
      candidateId: candidate._id,
      answers,
      consent,
      termsAccepted,
      profileStatus: applicationStatus,
      screeningResult,
      candidateRating,
      companyCode,
    });

    // -------------------------
    // UPDATE JOB APPLICANT COUNT
    // -------------------------
    await Job.updateOne(
      { _id: jobId },
      { $inc: { applicantsCount: 1 } }
    );

    await createApplicantNotification({ 
      name: name, 
      jobTitle: job.jobTitle,
      applicantId: newApplication._id,
      jobId: job._id,
      userId: job?.hiringManager?.userId,
      companyCode: companyCode
    })

    return res.status(201).json({
      success: true,
      message: "Application submitted",
      data: {
        applicationId: newApplication._id,
        candidateId: candidate._id,
        screening: newApplication.screeningResult,
        status: newApplication.profileStatus,
      },
    });
  } catch (err) {
    console.error("Create Application Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export default createApplication;
