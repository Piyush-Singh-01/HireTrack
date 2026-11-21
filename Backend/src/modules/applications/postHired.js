import mongoose from "mongoose";
import Application from "./applicantSchema.js";
import Job from "../jobs/job.model.js";
import Candidate from "../interviews/candidateInterview.model.js";
import { sendEmail } from "../../common/utils/emailService.js";


const postHired = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      applicationId,
      salary = null,
      startDate = null,
      hiringNotes = "",
      offerLetterSent = false,
    } = req.body;

    const companyCode = req.user.companyCode;

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

    if (application.profileStatus === "hired") {
      return res.status(400).json({
        success: false,
        message: "Candidate is already hired for this job",
      });
    }

    if (application.profileStatus === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Cannot hire a rejected candidate",
      });
    }

    if (salary !== null && (typeof salary !== "number" || salary <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Salary must be a positive number",
      });
    }

    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate format (use YYYY-MM-DD)",
      });
    }

    const candidate = await Candidate.findById(
      application.candidateId
    ).lean();

    const previousStatus = application.profileStatus;

    application.profileStatus = "hired";
    application.candidateRating = "Good fit";

    application.hiringDetails = {
      hiredOn: new Date(),
      salary,
      startDate: startDate ? new Date(startDate) : null,
      hiringNotes,
      offerLetterSent,
    };

    if (hiringNotes) {
      application.candidateFeedback = {
        ...(application.candidateFeedback || {}),
        feedbackDescription: application.candidateFeedback?.feedbackDescription
          ? `${application.candidateFeedback.feedbackDescription}\n\nHired: ${hiringNotes}`
          : `Hired: ${hiringNotes}`,
      };
    }

    await application.save({ validateBeforeSave: false });

    await Candidate.updateOne(
      { 
        candidateId: application._id,
        companyCode
      },
      {
        $set: {
          Status: "hired",
        },
      }
    );



    return res.status(200).json({ success: true, message: "Candidate hired successfully",
      data: {
        application: {
          applicationId: application._id,
          previousStatus,
          profileStatus: application.profileStatus,
          candidateRating: application.candidateRating,
          hiringDetails: application.hiringDetails,
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
        email: `Offer letter sent via email to ${candidate?.email}`
      },
    });
  } catch (error) {
    console.error("Error hiring candidate:", error);

    return res.status(500).json({ success: false, message: "Error hiring candidate" });
  }
};

export default postHired;
