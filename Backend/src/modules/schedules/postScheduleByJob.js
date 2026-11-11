import Application from "../applications/applicantSchema.js";
import InterviewSchedule from "../interviews/interview.model.js";
import Job from "../jobs/job.model.js";
import MeetingSettings from "../settings/settings.model.js";
import mongoose from "mongoose";
import CandidateDetails from "./schedule.model.js";
import { createCalendarEvent } from "../../common/utils/dashboardCalendar.js";
import { sendEmail } from "../../common/utils/emailService.js";
import NotificationSettings from "../notifications/notification.model.js";
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

  h = (h || "0").padStart(2, "0");
  min = (min || "0").padStart(2, "0");

  if (m === "PM" && h !== "12") h = String(+h + 12).padStart(2, "0");
  if (m === "AM" && h === "12") h = "00";

  return `${h}:${min}`;
};

/* ================= CONTROLLER ================= */

const postScheduleByJob = async (req, res) => {
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
      candidateId,
      recruiterName,
      interviewDate,
      interviewTime,
      meetingMode,
      durationMinutes = 30,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid jobId" });
    }

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ error: "Invalid candidateId" });
    }

    /* ===== FETCH DATA ===== */

    const job = await Job.findOne({ _id: jobId, companyCode })
      .populate("hiringManager.userId")
      .populate("hiringManagers.userId");

    const candidate = await Application.findOne({
      _id: candidateId,
      jobId,
      companyCode,
    }).populate("candidateId");

    if (!job || !candidate) {
      return res.status(404).json({
        error: "Job or Candidate not found",
      });
    }

    /* ===== FULL NAME ===== */
    const candidateFullName = 
      `${candidate.answers?.firstName || ""} ${candidate.answers?.middleName || ""} ${candidate.answers?.lastName || ""}`.replace(/\s+/g, ' ').trim() || 
      candidate.answers?.full_name || 
      candidate.answers?.name || 
      "Candidate";

    if (
      candidate.profileStatus?.toLowerCase().replace(/\s/g, "") !==
      "shortlisted"
    ) {
      return res.status(400).json({
        message: "Candidate must be shortlisted before scheduling interview",
      });
    }

    /* ===== TIME ===== */

    const time24 = normalizeTime(interviewTime);

    //  const start = new Date(interviewDate);
    // const [hour, minute] = time24.split(":");
    // start.setHours(hour, minute, 0, 0);
    let datePart;
    if (typeof interviewDate === "string") {
      datePart = interviewDate.split("T")[0];
    } else {
      datePart = new Date(interviewDate).toISOString().split("T")[0];
    }
    
    const istDateTimeString = `${datePart}T${time24}:00+05:30`;
    const start = new Date(istDateTimeString);

    if (start.getTime() <= new Date().getTime()) {
      return res.status(400).json({
        error: "Cannot schedule interview in the past",
      });
    }

    const end = new Date(start.getTime() + durationMinutes * 60000);

    /* ===== GOOGLE CALENDAR FIRST (IMPORTANT FIX) ===== */

    let meetingLink = null;
    let calendarEventId = null;

    const adminUser = await userModel.findOne({
      companyCode,
      role: "SuperAdmin",
    }).lean();

    const googleData = adminUser?.googleCalendar;
    const accessToken = googleData?.accessToken || process.env.GOOGLE_ACCESS_TOKEN;
    const refreshToken = googleData?.refreshToken || process.env.GOOGLE_REFRESH_TOKEN;
    const hasGoogleTokens = Boolean(accessToken || refreshToken);

    if (googleData?.isConnected || hasGoogleTokens) {
      try {
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
        if (adminUser) addEmail(adminUser);

        // Add logged-in user who scheduled the interview
        if (req.user) addEmail(req.user);

        // Add candidate so they bypass the lobby
        if (candidate?.answers?.email) {
          addEmail({ email: candidate.answers.email });
        }

        const event = await createCalendarEvent({
          description: `Interview Scheduled for ${job.jobTitle}`,
          start: start.toISOString(),
          end: end.toISOString(),
          interviewerEmails,

          // 🔥 PASS TOKENS (with env fallback)
          accessToken,
          refreshToken,
        });

        let extractedLink = null;

        if (event?.conferenceData?.entryPoints?.length > 0) {
          const videoEntry = event.conferenceData.entryPoints.find(
            (e) => e.entryPointType === "video"
          );
          extractedLink = videoEntry?.uri;
        }

        if (!extractedLink && event?.hangoutLink) {
          extractedLink = event.hangoutLink;
        }

        meetingLink = extractedLink || null;
        calendarEventId = event?.id;
      } catch (calErr) {
        console.error("Google Calendar event creation warning:", calErr.message);
      }
    }

    // 🔥 Online Interview Fallback: Ensure a valid Google Meet link is always provided
    if ((meetingMode === "Online" || !meetingMode) && !meetingLink) {
      meetingLink = "https://meet.google.com/new";
    }

    /* ===== CREATE SCHEDULE AFTER MEET ===== */

    const finalRecruiterName = (recruiterName && recruiterName !== "Unknown") 
      ? recruiterName 
      : (req.user?.name || job.hiringManager?.name || "HR");

    const schedule = await InterviewSchedule.create({
      jobId,
      companyCode,
      candidateIds: [candidate._id],
      recruiterName: finalRecruiterName,
      candidateName: candidateFullName,
      position: job.jobTitle,
      interviewDate,
      interviewTime: time24,
      meetingMode,
      durationMinutes,
      meetingLink,
      calendarEventId,
      scheduleType: "Interview",
      status: "Start Interview",
    });

    /* ===== UPDATE APPLICATION ===== */

    await Application.updateOne(
      { _id: candidateId, companyCode },
      {
        $set: {
          profileStatus: "Interview",
          "interviewDetails.interviewStatus": "Not Started",
          "interviewDetails.meetingLink": meetingLink,
        },
      }
    );

    await CandidateDetails.findOneAndUpdate(
      { candidateId: candidate._id, jobId, companyCode },
      {
        jobId,
        companyCode,
        candidateId: candidate._id,
        candidateName: candidateFullName,   
        Date: start,
        Time: time24,
        Position: job.jobTitle,
        Recruiter: finalRecruiterName,
        Mode: meetingMode,
        Status: "Start Interview",
        Reschedule: false,
      },
      { upsert: true }
    );

    /* ===== EMAIL ===== */
    let emailError = null;

    const candidateEmail =
      candidate.answers?.email ||
      candidate.answers?.Email ||
      candidate.candidateId?.email;

    if (candidateEmail) {
      try {
        const template = MailTemplates.interviewScheduled({
          candidateName: candidateFullName,
          job,
          interviewDate,
          time24,
          meetingLink,
          recruiterName: finalRecruiterName,
          organizationName: adminUser?.organizationName,
          businessEmail: adminUser?.businessEmail,
          logo: adminUser?.companyLogo,
        });

        await sendEmail({
          companyCode,
          to: candidateEmail,
          bcc: template.bcc,
          subject: template.subject,
          html: template.html,
        });

      } catch (err) {
        console.error("Email Error:", err.message);
        emailError = err.message;
      }
    }

    /* ===== NOTIFICATION ===== */

    const notificationData = {
      name: candidate.answers?.name,
      date: interviewDate,
      time: time24,
      role: job.jobTitle,
      interviewId: schedule._id,
      jobId: job._id,
      companyCode,
      userId: req.user.id,
    };

    await createScheduleNotification(notificationData);

    return res.status(201).json({
      success: true,
      message: emailError ? `Interview scheduled successfully, but email failed: ${emailError}` : "Interview scheduled successfully",
      data: schedule,
    });

  } catch (err) {
    console.error("Schedule Error:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export default postScheduleByJob;

