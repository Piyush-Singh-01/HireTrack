import mongoose from "mongoose";
import Application from "./applicantSchema.js";
import Job from "../jobs/job.model.js";
import Candidate from "../interviews/candidateInterview.model.js";
import { sendEmail} from "../../common/utils/emailService.js";
import { MailTemplates } from "../../common/utils/mailTemaplate.js";
import userModel from "../users/user.model.js";
/**
 * POST /shortlist/:jobId
 * Shortlist an application for a job
 */
const postShortListed = async (req, res) => {
  try {
    const companyCode = req.user.companyCode?.trim().toUpperCase();
    const { jobId } = req.params;
    const {
      applicationId,
      reason = "",
      hiringManagerNotes = "",
      shortlistType = "Initial Screening",
    } = req.body;


    // -------------------------
    // Validation
    // -------------------------
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "applicationId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid applicationId format",
      });
    }

    // -------------------------
    // Validate job (published)
    // -------------------------
    const job = await Job.findOne({ 
      _id: jobId, 
      isDraft: false,
      companyCode // ✅ ADDED
    });

    if (!job) {
      const jobExists = await Job.findOne({ _id: jobId });
      if (jobExists) {
        return res.status(403).json({
          success: false,
          message: `You do not have access to this job (companyCode mismatch)`,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }
    }

    // -------------------------
    // Find application
    // -------------------------
    const application = await Application.findOne({
      _id: applicationId,
      jobId,
      companyCode // ✅ ADDED
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found for this job",
      });
    }

    // -------------------------
    // Status guards
    // -------------------------
    if (application.profileStatus === "shortlisted") {
      return res.status(400).json({
        success: false,
        message: "Candidate is already shortlisted",
      });
    }

    if (application.profileStatus === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Cannot shortlist a rejected candidate",
      });
    }

    if (application.profileStatus === "hired") {
      return res.status(400).json({
        success: false,
        message: "Candidate is already hired",
      });
    }

    // -------------------------
    // Fetch candidate identity
    // -------------------------
    const candidate = await Candidate.findById(
      application.candidateId
    ).lean();

    const previousStatus = application.profileStatus;

    // -------------------------
    // Update application
    // -------------------------
    application.profileStatus = "shortlisted";
    application.candidateRating = "Good fit";

    application.shortlistingDetails = {
      shortlistType,
      shortlistedOn: new Date(),
      shortlistReason: reason,
      shortlistNotes: hiringManagerNotes,
    };

    if (hiringManagerNotes) {
      application.candidateFeedback = {
        ...(application.candidateFeedback || {}),
        feedbackDescription: application.candidateFeedback?.feedbackDescription
          ? `${application.candidateFeedback.feedbackDescription}\n\nShortlisted: ${hiringManagerNotes}`
          : `Shortlisted: ${hiringManagerNotes}`,
      };
    }

    await application.save({ validateBeforeSave: false });
    // -------------------------
// Send Email Notification
// -------------------------
try {
  if (candidate?.email) {
    // 🔥 Get organization (tenant)
    const adminUser = await userModel.findOne({
      companyCode,
      role: "SuperAdmin",
    }).lean();

    // 🔥 Generate template
    const template = MailTemplates.shortlisted({
      candidateName: candidate?.name,
      job,
      hiringManagerNotes,
      organizationName: adminUser?.organizationName,
      businessEmail: adminUser?.businessEmail,
      logo: adminUser?.companyLogo,
      reason, // optional (if you want to show)
    });

    // 🔥 Send email
    await sendEmail({
      companyCode,
      to: candidate.email,
      bcc: template.bcc,
      subject: template.subject,
      html: template.html,
    });
  }
} catch (emailError) {
  console.error("Email sending failed:", emailError.message);
}
    // -------------------------
    // Response
    // -------------------------
    return res.status(200).json({
      success: true,
      message: "Candidate shortlisted successfully",
      data: {
        application: {
          applicationId: application._id,
          previousStatus,
          profileStatus: application.profileStatus,
          candidateRating: application.candidateRating,
          shortlistingDetails: application.shortlistingDetails,
        },
        candidate: {
          candidateId: candidate?._id || null,
          name: candidate?.name || "Unknown",
          email: candidate?.email || null,
        },
        job: {
          jobId: job._id,
          jobTitle: job.jobTitle,
          department: job.department,
          hiringManager: job.hiringManager,
        },
      },
    });
  } catch (error) {
    console.error("Error shortlisting candidate:", error);
    return res.status(500).json({
      success: false,
      message: "Error shortlisting candidate",
    });
  }
};

export default postShortListed;
