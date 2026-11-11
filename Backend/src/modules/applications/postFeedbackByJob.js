  import mongoose from "mongoose";
  import Application from "./applicantSchema.js";
  import Job from "../jobs/job.model.js";
  import Candidate from "../interviews/candidateInterview.model.js";
  import CandidateDetails from "../schedules/schedule.model.js";
  import InterviewSchedule from "../interviews/interview.model.js";
  import { sendEmail } from "../../common/utils/emailService.js";
  import userModel from "../users/user.model.js"; // adjust path
  import {MailTemplates} from "../../common/utils/mailTemaplate.js"; // if using

  /**
   * POST /feedback/:jobId
   * Post feedback for a candidate application
   */
  const postFeedbackByJob = async (req, res) => {
    try {
      const { jobId } = req.params;
      const {
        applicationId,
        candidateFeedback = {},
        candidateRating,
        updateStatus = false,
        newStatus = null,
      } = req.body;

      const companyCode = req.user.companyCode; // ✅ ADDED

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

      // ✅ companyCode added
      const job = await Job.findOne({ 
        _id: jobId, 
        isDraft: false,
        companyCode 
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found or not published",
        });
      }

      // ✅ companyCode added
      const application = await Application.findOne({
        _id: applicationId,
        jobId,
        companyCode
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found for this job",
        });
      }

      const candidate = await Candidate.findById(application.candidateId).lean();

      const validSkillRatings = [
        "Excellent",
        "Good",
        "Below Average",
        "Inadequate",
      ];

      const validCandidateRatings = ["Good fit", "Not a fit", "Maybe"];

      const {
        communication,
        technical,
        programming,
        problemSolving,
        feedbackDescription,
      } = candidateFeedback;

      if (communication && !validSkillRatings.includes(communication)) {
        return res.status(400).json({
          success: false,
          message: "Invalid communication rating",
        });
      }

      if (technical && !validSkillRatings.includes(technical)) {
        return res.status(400).json({
          success: false,
          message: "Invalid technical rating",
        });
      }

      if (programming && !validSkillRatings.includes(programming)) {
        return res.status(400).json({
          success: false,
          message: "Invalid programming rating",
        });
      }

      if (problemSolving && !validSkillRatings.includes(problemSolving)) {
        return res.status(400).json({
          success: false,
          message: "Invalid problemSolving rating",
        });
      }

      if (candidateRating && !validCandidateRatings.includes(candidateRating)) {
        return res.status(400).json({
          success: false,
          message: "Invalid candidate rating",
        });
      }

      const allowedStatuses = [
        "applied",
        "shortlisted",
        "interview",
        "onhold",
        "hired",
        "rejected",
      ];

      if (updateStatus && newStatus) {
        if (!allowedStatuses.includes(newStatus)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
          });
        }
      }

      const previousFeedback = application.candidateFeedback;
      const previousRating = application.candidateRating;
      const previousStatus = application.profileStatus;

      application.candidateFeedback = {
        communication:
          communication ?? application.candidateFeedback?.communication ?? null,
        technical:
          technical ?? application.candidateFeedback?.technical ?? null,
        programming:
          programming ?? application.candidateFeedback?.programming ?? null,
        problemSolving:
          problemSolving ??
          application.candidateFeedback?.problemSolving ??
          null,
        feedbackDescription:
          feedbackDescription ??
          application.candidateFeedback?.feedbackDescription ??
          "",
      };

      if (candidateRating) {
        application.candidateRating = candidateRating;
      }

      if (updateStatus && newStatus) {
        application.profileStatus = newStatus;

        if (newStatus === "hired") {
          application.hiringDetails = {
            ...(application.hiringDetails || {}),
            hiredOn: new Date(),
          };
        }
      }

      await application.save({ validateBeforeSave: false });

      // Update the schedule status - map frontend status to schedule model status
      let scheduleStatus = newStatus;
      if (newStatus === "onhold") {
        scheduleStatus = "On Hold";
      }
      
      // Update InterviewSchedule collection (this is what the frontend fetches from)
      await CandidateDetails.updateOne(
        { 
          candidateIds: application._id,
          companyCode
        },   
        {
          $set: {
            status: scheduleStatus,             
          },
        }
      );

      // -------------------------
  // EMAIL TRIGGER (Hired / Rejected)
  // -------------------------
try {
  const candidateEmail =
    application?.answers?.email || candidate?.email;
  const candidateName = 
    `${application?.answers?.firstName || ""} ${application?.answers?.middleName || ""} ${application?.answers?.lastName || ""}`.replace(/\s+/g, ' ').trim() ||
    application?.answers?.full_name ||
    application?.answers?.name ||
    candidate?.name || 
    "Candidate";

  if (
    candidateEmail &&
    updateStatus &&
    newStatus &&
    previousStatus !== newStatus
  ) {
    // Fetch only when needed
    const adminUser = await userModel.findOne({
      companyCode,
      role: "SuperAdmin",
    }).lean();

    // =========================
    // ✅ HIRED
    // =========================
    if (newStatus === "hired") {
      const template = MailTemplates.selected({
        candidateName,
        job,
        organizationName: adminUser?.organizationName,
        businessEmail: adminUser?.businessEmail,
        logo: adminUser?.companyLogo,
        joiningDate: new Date().toDateString(),
        reportingTime: "9:30 AM",
        workLocation: "Chennai Office"
      });
    
      await sendEmail({
        companyCode,
        to: candidateEmail,
        bcc: template.bcc,
        subject: template.subject,
        html: template.html,
      });
    }

    // =========================
    // ❌ REJECTED
    // =========================
    if (newStatus === "rejected") {
      const template = MailTemplates.rejection({
        candidateName,
        job,
        organizationName: adminUser?.organizationName,
        businessEmail: adminUser?.businessEmail,
        logo: adminUser?.companyLogo,
        rejectionReason: "We found other candidates more suitable",
        hiringManagerNotes: "",
      });

      await sendEmail({
        companyCode,
        to: candidateEmail,
        bcc: template.bcc,
        subject: template.subject,
        html: template.html,
      });
    }
  }

} catch (emailError) {
  console.error("Email Sending Failed:", emailError.message);
}

      return res.status(200).json({
        success: true,
        message: "Candidate feedback posted successfully",
        data: {
          application: {
            applicationId: application._id,
            previousStatus,
            profileStatus: application.profileStatus,
            previousRating,
            updatedRating: application.candidateRating,
            previousFeedback,
            updatedFeedback: application.candidateFeedback,
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
      console.error("Error posting candidate feedback:", error);
      return res.status(500).json({
        success: false,
        message: "Error posting candidate feedback",
      });
    }
  };

  export default postFeedbackByJob;
