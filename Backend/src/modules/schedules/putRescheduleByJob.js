import Application from "../applications/applicantSchema.js";
import InterviewSchedule from "../interviews/interview.model.js";
import CandidateDetails from "./schedule.model.js";
import Job from "../jobs/job.model.js";
import mongoose from "mongoose";
import { sendEmail } from "../../common/utils/emailService.js";
import { createCalendarEvent, updateCalendarEvent } from "../../common/utils/dashboardCalendar.js";
import { createScheduleNotification } from "../../common/utils/notifications.js";
import { MailTemplates } from "../../common/utils/mailTemaplate.js";
import userModel from "../users/user.model.js";
import UserAndRole from "../users/userandroleSchema.js";
/* ================= HELPERS ================= */

const normalizeTime = (time) => {
  if (!time) return "00:00";
  time = time.trim();

  if (/^\d{2}:\d{2}$/.test(time)) return time;

  const [t, m] = time.split(" ");
  let [h, min] = t.split(":");

  if (m === "PM" && h !== "12") h = String(Number(h) + 12);
  if (m === "AM" && h === "12") h = "00";

  return `${h.padStart(2, "0")}:${min}`;
};

const buildDateTime = (date, time) =>
  new Date(`${date}T${time}:00+05:30`);

/* ================= CONTROLLER ================= */

const putRescheduleByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        error: "Company context missing",
      });
    }

    const {
      scheduleId,
      candidateDetailsId,
      candidateId,
      newDate,
      newTime,
      durationMinutes,
      sendNotification = true,
    } = req.body;

    /* ===== VALIDATION ===== */

    if (
      !mongoose.Types.ObjectId.isValid(jobId) ||
      !mongoose.Types.ObjectId.isValid(scheduleId)
    ) {
      return res.status(400).json({ error: "Invalid IDs provided" });
    }

    if (!newDate || !newTime) {
      return res.status(400).json({
        error: "newDate and newTime are required",
      });
    }

    /* ===== FETCH DATA ===== */

    const job = await Job.findOne({ _id: jobId, companyCode })
      .populate({
        path: "hiringManager.userId"
      })
      .populate("hiringManagers.userId");

    if (!job) return res.status(404).json({ error: "Job not found" });

    const schedule = await InterviewSchedule.findOne({
      _id: scheduleId,
      jobId,
      companyCode,
    });

    if (!schedule) {
      return res.status(404).json({
        error: "Interview schedule not found",
      });
    }

    // Try finding by ID first
    let candidateDetails = null;
    if (mongoose.Types.ObjectId.isValid(candidateDetailsId)) {
      candidateDetails = await CandidateDetails.findOne({
        _id: candidateDetailsId,
        companyCode,
      });
    }

    // Fallback: Find by jobId and candidateId
    const effectiveCandidateId = candidateId || (schedule.candidateIds?.length > 0 ? schedule.candidateIds[0] : null);
    
    if (!candidateDetails && effectiveCandidateId) {
      candidateDetails = await CandidateDetails.findOne({
        jobId,
        candidateId: effectiveCandidateId,
        companyCode,
      });
    }

    if (!candidateDetails) {
      console.warn("Candidate Details not found (Sync error) - Proceeding anyway");
    }

    /* ===== TIME ===== */

    const time24 = normalizeTime(newTime);
    const startDate = buildDateTime(newDate, time24);

    if (startDate.getTime() <= new Date().getTime()) {
      return res.status(400).json({
        error: "Cannot reschedule to past time",
      });
    }

    const duration = durationMinutes || schedule.durationMinutes || 30;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    /* ===== CONFLICT CHECK ===== */

    const conflict = await InterviewSchedule.findOne({
      _id: { $ne: scheduleId },
      jobId,
      companyCode,
      candidateIds: { $in: schedule.candidateIds },
      interviewDate: newDate,
      interviewTime: time24,
      status: { $nin: ["cancelled", "completed"] },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Candidate already has interview at this time",
      });
    }

    /* ===== FETCH CANDIDATES ===== */
    const candidates = await Application.find({
      _id: { $in: schedule.candidateIds },
      companyCode,
    });

    /* ===== GOOGLE CALENDAR UPDATE ===== */

/* ===== GOOGLE CALENDAR (FIXED) ===== */

     /* ===== GOOGLE CALENDAR (FINAL FIX) ===== */

    let meetingLink = schedule.meetingLink || null;
    let newEventId = schedule.calendarEventId || null;

    const adminUserGoogle = await userModel.findOne({
      companyCode,
      role: "SuperAdmin",
    }).lean();

    const googleData = adminUserGoogle?.googleCalendar;

    console.log("📌 calendarEventId:", schedule.calendarEventId);
    console.log("📌 Google Connected:", googleData?.isConnected);

    let eventResponse = null;

    if (googleData?.isConnected) {
      const interviewerEmails = [];
      const addEmail = (user) => {
        if (!user) return;
        const email = user.Email || user.businessEmail || user.googleCalendar?.googleEmail || user.email;
        if (email && !interviewerEmails.includes(email)) {
          interviewerEmails.push(email);
        }
      };
      if (job.hiringManager?.userId) addEmail(job.hiringManager.userId);
      if (job.hiringManagers?.length > 0) {
        job.hiringManagers.forEach(hm => addEmail(hm.userId));
      }

      // Add Admin users
      const admins = await UserAndRole.find({ companyCode, Role: "Admin" }).lean();
      admins.forEach(admin => addEmail(admin));

      // Add SuperAdmin user
      if (adminUserGoogle) addEmail(adminUserGoogle);

      // Add logged-in user who scheduled the interview
      if (req.user) addEmail(req.user);

      // Add candidates so they bypass the lobby
      candidates.forEach(candidate => {
        if (candidate?.answers?.email) {
          addEmail({ email: candidate.answers.email });
        }
      });

      try {
        if (schedule.calendarEventId) {
          console.log("🔄 Updating event...");

          eventResponse = await updateCalendarEvent(schedule.calendarEventId, {
            description: `Interview Rescheduled for ${schedule.position}`,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            interviewerEmails,

            // 🔥 PASS TOKENS HERE
            accessToken: googleData.accessToken,
            refreshToken: googleData.refreshToken,
          });

        } else {
          console.log("🆕 Creating event...");

          eventResponse = await createCalendarEvent({
            description: `Interview Scheduled for ${schedule.position}`,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            interviewerEmails,

            // 🔥 PASS TOKENS HERE
            accessToken: googleData.accessToken,
            refreshToken: googleData.refreshToken,
          });
        }

        /* ===== EXTRACT MEETING LINK ===== */

        let extractedLink = null;

        if (eventResponse?.conferenceData?.entryPoints?.length > 0) {
          const videoEntry = eventResponse.conferenceData.entryPoints.find(
            (e) => e.entryPointType === "video"
          );
          extractedLink = videoEntry?.uri;
        }

        if (!extractedLink && eventResponse?.hangoutLink) {
          extractedLink = eventResponse.hangoutLink;
        }

        if (!extractedLink) {
          console.log("⚠️ No Meet link → fallback");
          extractedLink = "https://meet.google.com/new";
        }

        meetingLink = extractedLink;
        newEventId = eventResponse?.id;

        console.log("✅ FINAL MEETING LINK:", meetingLink);
      } catch (calError) {
        console.error("⚠️ Google Calendar sync failed during reschedule:", calError.message);
        if (!meetingLink) {
          meetingLink = "https://meet.google.com/new";
        }
      }
    } else {
      console.log("❌ Google Calendar not connected → skipping");
    }

    if (!meetingLink && (schedule.meetingMode === "Online" || !schedule.meetingMode)) {
      meetingLink = "https://meet.google.com/new";
    }

    schedule.previousSchedule = {
      interviewDate: schedule.interviewDate,
      interviewTime: schedule.interviewTime,
      updatedAt: new Date(),
    };

    schedule.interviewDate = newDate;
    schedule.interviewTime = time24;
    schedule.durationMinutes = duration;
    schedule.rescheduled = true;
    schedule.status = "Start Interview";

    if (meetingLink) schedule.meetingLink = meetingLink;
    if (newEventId) schedule.calendarEventId = newEventId;

    await schedule.save();

    /* ===== UPDATE CANDIDATE DETAILS ===== */

    const cidQuery = candidateDetails?._id 
      ? { _id: candidateDetails._id, companyCode } 
      : { jobId, candidateId: effectiveCandidateId, companyCode };

    await CandidateDetails.updateOne(
      cidQuery,
      {
        $set: {
          Date: startDate,
          Time: time24,
          Status: "Start Interview",
          Reschedule: true,
          jobId,
          companyCode,
          candidateId: effectiveCandidateId,
          Position: schedule.position || job.jobTitle,
          Recruiter: (schedule.recruiterName && schedule.recruiterName !== "Unknown") ? schedule.recruiterName : (req.user?.name || "Unknown"),
          Mode: schedule.meetingMode || "Online"
        },
      },
      { upsert: true }
    );

    /* ===== UPDATE APPLICATIONS + EMAIL ===== */

    const isGD = schedule.isGroupDiscussion || schedule.scheduleType === "Group Interview";
    let gdCandidateNames = [];
    let gdCandidateEmails = [];
    let adminUser = null;
    let emailErrors = [];

    for (const candidate of candidates) {
      await Application.updateOne(
        { _id: candidate._id, companyCode },
        {
          $set: {
            profileStatus: "Interview",
            rescheduled: true,
            "interviewDetails.interviewDate": startDate,
            "interviewDetails.interviewTime": time24,
            "interviewDetails.interviewStatus": "Not Started",
          },
        }
      );

      const candidateName =
        `${candidate?.answers?.firstName || ""} ${candidate?.answers?.middleName || ""} ${candidate?.answers?.lastName || ""}`.replace(/\s+/g, ' ').trim() ||
        candidate?.answers?.full_name ||
        candidate?.answers?.name ||
        "Candidate";

      if (isGD) {
        gdCandidateNames.push(candidateName);
        if (candidate.answers?.email) {
          gdCandidateEmails.push(candidate.answers.email);
        }
      } else {
        /* ===== EMAIL (WITH MEET LINK) FOR SINGLE INTERVIEW ===== */
        const candidateEmail =
          candidate.answers?.email ||
          candidate.answers?.Email ||
          candidate.candidateId?.email ||
          candidate.email;

        if (candidateEmail) {
          try {
            adminUser = adminUser || await userModel.findOne({
              companyCode,
              role: "SuperAdmin",
            }).lean();

            const template = MailTemplates.interviewRescheduled({
              candidateName,
              job,
              newDate,
              time24,
              meetingLink,
              organizationName: adminUser?.organizationName,
              businessEmail: adminUser?.businessEmail,
              logo: adminUser?.companyLogo,
            });

            await sendEmail({
              companyCode,
              from: adminUser?.businessEmail,
              to: candidateEmail,
              bcc: template.bcc,
              subject: template.subject,
              html: template.html,
            });

          } catch (err) {
            console.error("Reschedule Email Error:", err.message);
            emailErrors.push(err.message);
          }
        }
      }

      await createScheduleNotification({
        reschedule: true,
        name: candidateName,
        date: newDate,
        time: time24,
        role: job.jobTitle,
        interviewId: schedule._id,
        jobId: job._id,
        companyCode,
        userId: req?.user.id
      });
    }

    /* ===== SEND SINGLE GD EMAIL ===== */
    if (isGD && gdCandidateEmails.length > 0) {
      try {
        adminUser = adminUser || await userModel.findOne({
          companyCode,
          role: "SuperAdmin",
        }).lean();

        const template = MailTemplates.gdRescheduled({
          candidateName: gdCandidateNames.join(", "),
          jobTitle: job.jobTitle,
          interviewDate: newDate,
          time24,
          durationMinutes: duration,
          meetingLink,
          organizationName: adminUser?.organizationName,
          businessEmail: adminUser?.businessEmail,
          recruiterName: (schedule.recruiterName && schedule.recruiterName !== "Unknown") ? schedule.recruiterName : (req.user?.name || "Unknown"),
          logo: adminUser?.companyLogo
        });

        await sendEmail({
          companyCode,
          from: adminUser?.businessEmail,
          to: gdCandidateEmails.join(", "),
          bcc: template.bcc,
          subject: template.subject,
          html: template.html,
        });
      } catch (err) {
        console.error("GD Reschedule Email Error:", err.message);
        emailErrors.push(err.message);
      }
    }

    const emailErrorMessage = emailErrors.length > 0 ? `, but email failed: ${[...new Set(emailErrors)].join(', ')}` : "";

    return res.status(200).json({
      success: true,
      message: `Interview rescheduled successfully${emailErrorMessage}`,
      data: {
        scheduleId: schedule._id,
        newDate,
        newTime: time24,
        meetingLink: schedule.meetingLink,
      },
    });

  } catch (err) {
    console.error("Reschedule Error:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export default putRescheduleByJob;
