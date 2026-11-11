import mongoose from "mongoose";
import Application from "./applicantSchema.js";
import Job from "../jobs/job.model.js";
import Candidate from "../interviews/candidateInterview.model.js";
import CandidateDetails from "../schedules/schedule.model.js";
import InterviewSchedule from "../interviews/interview.model.js";
import { sendEmail } from "../../common/utils/emailService.js";
import { MailTemplates } from "../../common/utils/mailTemaplate.js";
import userModel from "../users/user.model.js";


const postReject = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      applicationId,
      rejectionReason = "",
      hiringManagerNotes = "",
      cancelInterview = true,
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

    if (application.profileStatus === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Candidate is already rejected",
      });
    }

    if (application.profileStatus === "hired") {
      return res.status(400).json({
        success: false,
        message: "Cannot reject a hired candidate",
      });
    }

    const candidate = await Candidate.findById(
      application.candidateId
    ).lean();

    const previousStatus = application.profileStatus;

    application.profileStatus = "rejected";
    application.candidateRating = "Not a fit";

    const rejectionNote = `Rejected: ${rejectionReason}${
      hiringManagerNotes ? ` - ${hiringManagerNotes}` : ""
    }`;

    application.candidateFeedback = {
      ...(application.candidateFeedback || {}),
      feedbackDescription: application.candidateFeedback?.feedbackDescription
        ? `${application.candidateFeedback.feedbackDescription}\n\n${rejectionNote}`
        : rejectionNote,
    };

    await application.save({ validateBeforeSave: false });

    // ✅ companyCode added
    await CandidateDetails.updateOne(
      { 
        candidateId: application._id,
        companyCode
      },
      {
        $set: {
          Status: "rejected",
        },
      }
    );

    let interviewCancellationInfo = null;

    if (
      cancelInterview &&
      (previousStatus === "interview" ||
        previousStatus === "shortlisted")
    ) {
      // ✅ companyCode added
      const interviewSchedule = await InterviewSchedule.findOne({
        applicationId: application._id,
        companyCode
      });

      if (interviewSchedule) {
        interviewSchedule.status = "cancelled";
        await interviewSchedule.save();

        interviewCancellationInfo = {
          scheduleId: interviewSchedule._id,
          interviewDate: interviewSchedule.interviewDate,
          interviewTime: interviewSchedule.interviewTime,
          status: "cancelled",
        };
      }
    }

    const candidateName = application?.answers?.name || `${application?.answers?.firstName || ""} ${application?.answers?.lastName || ""}` || candidate?.name ;

    try {
  if (application?.answers?.email) {
    // 🔥 Get tenant (organization)
    const adminUser = await userModel.findOne({
      companyCode,
      role: "SuperAdmin",
    }).lean();

    const template = MailTemplates.rejection({
      candidateName,
      job,
      organizationName: adminUser?.organizationName,
      businessEmail: adminUser?.businessEmail,
      logo: adminUser?.companyLogo,
      rejectionReason,
      hiringManagerNotes,
    });

    await sendEmail({
      companyCode,
      to: application.answers.email,
      bcc: template.bcc,
      subject: template.subject,
      html: template.html,
    });
  }
} catch (emailError) {
  console.error("Rejection Email Failed:", emailError.message);
}

    return res.status(200).json({
      success: true,
      message: "Candidate rejected successfully",
      data: {
        application: {
          applicationId: application._id,
          previousStatus,
          profileStatus: application.profileStatus,
          candidateRating: application.candidateRating,
          rejectionReason,
          hiringManagerNotes,
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
        interviewCancellation: interviewCancellationInfo,
      },
    });
  } catch (error) {
    console.error("Error rejecting candidate:", error);
    return res.status(500).json({
      success: false,
      message: "Error rejecting candidate",
    });
  }
};

export default postReject;
