import mongoose from "mongoose";
import Application from "./applicantSchema.js";
import Job from "../jobs/job.model.js";
import Candidate from "../interviews/candidateInterview.model.js";
import CandidateDetails from "../schedules/schedule.model.js";
import InterviewSchedule from "../interviews/interview.model.js";
import userModel from "../users/user.model.js";

import { sendEmail } from "../../common/utils/emailService.js";
import { MailTemplates } from "../../common/utils/mailTemaplate.js";

const updateCandidateStatus = async (
  req,
  res
) => {
  try {
    const { jobId } = req.params;

    const {
      applicationId,
      action,

      // shortlist
      reason = "",
      shortlistType = "Initial Screening",

      // shared
      hiringManagerNotes = "",

      // reject
      rejectionReason = "",
      cancelInterview = true,

      // hire
      salary = null,
      startDate = null,
      offerLetterSent = false,
    } = req.body;

    const companyCode =
      req.user?.companyCode
        ?.trim()
        .toUpperCase();

    // ==================================
    // VALIDATIONS
    // ==================================
    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized: companyCode missing",
      });
    }

    if (!applicationId || !action) {
      return res.status(400).json({
        success: false,
        message:
          "applicationId and action are required",
      });
    }

    if (
      ![
        "shortlist",
        "reject",
        "hire",
      ].includes(
        action.toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid action",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        jobId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid jobId format",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        applicationId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid applicationId format",
      });
    }

    if (
      salary !== null &&
      (typeof salary !==
        "number" ||
        salary <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Salary must be positive",
      });
    }

    if (
      startDate &&
      isNaN(
        Date.parse(startDate)
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid startDate",
      });
    }

    // ==================================
    // FETCH CORE DATA
    // ==================================
    const job =
      await Job.findOne({
        _id: jobId,
        companyCode,
        isDraft: false,
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Job not found",
      });
    }

    const application =
      await Application.findOne({
        _id: applicationId,
        jobId,
        companyCode,
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found",
      });
    }

    const candidate =
      await Candidate.findById(
        application.candidateId
      ).lean();

    const previousStatus =
      application.profileStatus;

    const mode =
      action.toLowerCase();

    // ==================================
    // STATUS GUARDS
    // ==================================
    if (
      previousStatus ===
        "hired" &&
      mode !== "hire"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Candidate already hired",
      });
    }

    if (
      previousStatus ===
        "rejected" &&
      mode !== "reject"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Candidate already rejected",
      });
    }

    // ==================================
    // SHORTLIST
    // ==================================
    if (
      mode ===
      "shortlist"
    ) {
      application.profileStatus =
        "shortlisted";

      application.candidateRating =
        "Good fit";

      application.shortlistingDetails =
        {
          shortlistType,
          shortlistedOn:
            new Date(),
          shortlistReason:
            reason,
          shortlistNotes:
            hiringManagerNotes,
        };

      if (
        hiringManagerNotes
      ) {
        application.candidateFeedback =
          {
            ...(application.candidateFeedback ||
              {}),
            feedbackDescription:
              application
                .candidateFeedback
                ?.feedbackDescription
                ? `${application.candidateFeedback.feedbackDescription}\n\nShortlisted: ${hiringManagerNotes}`
                : `Shortlisted: ${hiringManagerNotes}`,
          };
      }
    }

    // ==================================
    // REJECT
    // ==================================
    if (
      mode ===
      "reject"
    ) {
      application.profileStatus =
        "rejected";

      application.candidateRating =
        "Not a fit";

      const note = `Rejected: ${rejectionReason}${
        hiringManagerNotes
          ? ` - ${hiringManagerNotes}`
          : ""
      }`;

      application.candidateFeedback =
        {
          ...(application.candidateFeedback ||
            {}),
          feedbackDescription:
            application
              .candidateFeedback
              ?.feedbackDescription
              ? `${application.candidateFeedback.feedbackDescription}\n\n${note}`
              : note,
        };

      await CandidateDetails.updateOne(
        {
          candidateId:
            application._id,
          companyCode,
        },
        {
          $set: {
            Status:
              "rejected",
          },
        }
      );

      if (
        cancelInterview &&
        [
          "interview",
          "shortlisted",
        ].includes(
          previousStatus
        )
      ) {
        const interview =
          await InterviewSchedule.findOne(
            {
              applicationId:
                application._id,
              companyCode,
            }
          );

        if (interview) {
          interview.status =
            "cancelled";

          await interview.save();
        }
      }
    }

    // ==================================
    // HIRE
    // ==================================
    if (
      mode === "hire"
    ) {
      application.profileStatus =
        "hired";

      application.candidateRating =
        "Good fit";

      application.hiringDetails =
        {
          hiredOn:
            new Date(),
          salary,
          startDate:
            startDate
              ? new Date(
                  startDate
                )
              : null,
          hiringNotes:
            hiringManagerNotes,
          offerLetterSent,
        };

      await Candidate.updateOne(
        {
          candidateId:
            application._id,
          companyCode,
        },
        {
          $set: {
            Status:
              "hired",
          },
        }
      );
    }

    await application.save({
      validateBeforeSave:
        false,
    });

    // ==================================
    // EMAILS
    // ==================================
    let emailError = null;
    try {
      const admin =
        await userModel.findOne(
          {
            companyCode,
            role:
              "SuperAdmin",
          }
        ).lean();

      const candidateName =
        `${application?.answers?.firstName || ""} ${application?.answers?.middleName || ""} ${application?.answers?.lastName || ""}`.replace(/\s+/g, ' ').trim() ||
        application?.answers?.full_name ||
        application?.answers?.name ||
        candidate?.name ||
        "Candidate";

      if (
        mode ===
          "shortlist" &&
        candidate?.email
      ) {
        const tpl =
          MailTemplates.shortlisted(
            {
              candidateName,
              job,
              hiringManagerNotes,
              reason,
              organizationName:
                admin?.organizationName,
              businessEmail:
                admin?.businessEmail,
              logo: admin?.companyLogo,
            }
          );

        await sendEmail({
          companyCode,
          to: candidate.email,
          bcc: tpl.bcc,
          subject:
            tpl.subject,
          html: tpl.html,
        });
      }

      if (
        mode ===
          "reject" &&
        application?.answers
          ?.email
      ) {
        const tpl =
          MailTemplates.rejection(
            {
              candidateName,
              job,
              rejectionReason,
              hiringManagerNotes,
              organizationName:
                admin?.organizationName,
              businessEmail:
                admin?.businessEmail,
              logo: admin?.companyLogo,
            }
          );

        await sendEmail({
          companyCode,
          to: application
            .answers
            .email,
          bcc: tpl.bcc,
          subject:
            tpl.subject,
          html: tpl.html,
        });
      }

      if (
        mode ===
          "hire" &&
        application?.answers
          ?.email
      ) {
        const tpl = MailTemplates.selected({
          candidateName,
          job,
          organizationName: admin?.organizationName,
          businessEmail: admin?.businessEmail,
          logo: admin?.companyLogo,
          joiningDate: application.hiringDetails?.startDate?.toDateString() || new Date().toDateString(),
          reportingTime: "9:30 AM",
          workLocation: job.location || "Chennai Office"
        });

        await sendEmail({
          companyCode,
          to: application
            .answers
            .email,
          bcc: tpl.bcc,
          subject: tpl.subject,
          html: tpl.html,
        });
      }
    } catch (mailError) {
      console.error(
        "Email failed:",
        mailError.message
      );
      emailError = mailError.message;
    }

    // ==================================
    // RESPONSE
    // ==================================
    return res.status(200).json({
      success: true,
      message: emailError ? `Candidate ${mode}ed successfully, but email failed: ${emailError}` : `Candidate ${mode}ed successfully`,
      data: {
        applicationId:
          application._id,
        previousStatus,
        currentStatus:
          application.profileStatus,
        candidate: {
          id:
            candidate?._id,
          name:
            candidate?.name,
          email:
            candidate?.email,
        },
        job: {
          id: job._id,
          title:
            job.jobTitle,
        },
      },
    });
  } catch (error) {
    console.error(
      "Status update error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};

export default updateCandidateStatus;
