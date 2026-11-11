import mongoose from "mongoose";
import Application from "../applications/applicantSchema.js";
import InterviewSchedule from "../interviews/interview.model.js";
import Job from "../jobs/job.model.js";
import CandidateDetails from "./schedule.model.js"
import { createCalendarEvent } from "../../common/utils/dashboardCalendar.js";
import { sendEmail } from "../../common/utils/emailService.js";
import { createScheduleNotification } from "../../common/utils/notifications.js";
import NotificationSettings from "../notifications/notification.model.js";
import userModel from "../users/user.model.js";
import UserAndRole from "../users/userandroleSchema.js";
import { MailTemplates } from "../../common/utils/mailTemaplate.js";
const normalizeTime = (time) => {
  if (/^\d{2}:\d{2}$/.test(time)) return time;

  const [t, modifier] = time.split(" ");
  let [hours, minutes] = t.split(":");

  if (modifier === "PM" && hours !== "12") hours = String(+hours + 12);
  if (modifier === "AM" && hours === "12") hours = "00";

  return `${hours.padStart(2, "0")}:${minutes}`;
};

const buildDateTime = (date, time) =>
  new Date(`${date}T${time}:00+05:30`);

export const postGDScheduleByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid jobId" });
    }

    const {
      candidateIds,
      candidateName,
      recruiterName,
      interviewDate,
      interviewTime,
      durationMinutes = 30,
      meetingMode = "Online",
      sendNotification = true,
    } = req.body;

    if (!Array.isArray(candidateIds) || candidateIds.length < 2) {
      return res.status(400).json({
        error: "Minimum 2 candidates required for GD",
      });
    }

    if (!recruiterName || !interviewDate || !interviewTime) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    /* ================= VERIFY JOB OWNERSHIP ================= */
    const job = await Job.findOne({ _id: jobId, companyCode, }).populate({ path:"hiringManager.userId" });

    const businessEmail = job.hiringManager?.userId?.businessEmail || "support@company.com";
    if (!job) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    /* ================= VERIFY APPLICATIONS ================= */
    const candidates = await Application.find({
      _id: { $in: candidateIds },
      jobId,
      companyCode,                // ✅ Tenant enforcement
    });

    if (candidates.length !== candidateIds.length) {
      return res.status(404).json({
        error: "One or more candidates not found",
      });
    }

    const time24 = normalizeTime(interviewTime);

    const startDateTime = buildDateTime(interviewDate, time24);
    const endDateTime = new Date(
      startDateTime.getTime() + durationMinutes * 60000
    );

    /* ================= DUPLICATE SLOT CHECK ================= */
    const existingGDSchedule = await InterviewSchedule.findOne({
      jobId,
      companyCode,                // ✅ Tenant enforcement
      scheduleType: "Group Interview",
      interviewDate,
      interviewTime: time24,
      status: { $nin: ["cancelled", "completed"] },
    });

    if (existingGDSchedule) {
      return res.status(409).json({
        success: false,
        message: "Already Scheduled GD",
      });
    }

    let meetingLink = null;
    let calendarEventId = null;

    const adminUser = await userModel.findOne({
      companyCode,
      role: "SuperAdmin",
    }).lean();

    const googleData = adminUser?.googleCalendar;

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
      if (adminUser) addEmail(adminUser);

      // Add logged-in user who scheduled the interview
      if (req.user) addEmail(req.user);

      // Add candidates so they bypass the lobby
      candidates.forEach(candidate => {
        if (candidate?.answers?.email) {
          addEmail({ email: candidate.answers.email });
        }
      });

      const event = await createCalendarEvent({
        description: `Group Discussion for ${job.jobTitle}`,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        interviewerEmails, // ✅ PASS INTERVIEWER EMAILS

        // ✅ FIX: use DB tokens (NOT env)
        accessToken: googleData.accessToken,
        refreshToken: googleData.refreshToken,
      });

      let link = null;

      if (event?.conferenceData?.entryPoints?.length > 0) {
        const video = event.conferenceData.entryPoints.find(
          (e) => e.entryPointType === "video"
        );
        link = video?.uri;
      }

      if (!link && event?.hangoutLink) link = event.hangoutLink;
      if (!link) link = "https://meet.google.com/new";

      meetingLink = link;
      calendarEventId = event?.id;
    }

    if (!meetingLink && (meetingMode === "Online" || !meetingMode)) {
      meetingLink = "https://meet.google.com/new";
    }

    /* ================= CREATE SCHEDULE ================= */
    const schedule = await InterviewSchedule.create({
      jobId,
      companyCode,               // ✅ Tenant enforcement
      candidateIds,
      candidateNames: candidates.map((c) =>
        c.answers?.name || `${c.answers?.firstName || ""} ${c.answers?.lastName || ""}`
      ),
      recruiterName,
      position: job.jobTitle,
      interviewDate,
      interviewTime: time24,
      durationMinutes,
      meetingMode,
      meetingLink,
      calendarEventId,
      isGroupDiscussion: true,
      scheduleType: "Group Interview",
      status: "Start Interview",
      sendNotification,
    });

    await Application.updateMany(
      {
        _id: { $in: candidateIds },
        companyCode,          
      },
      {
        $set: { profileStatus: "Interview" }, 
      }
    );

    for (const candidate of candidates) {
      const candidateName =
        candidate.answers?.name ||
        `${candidate.answers?.firstName || ""} ${candidate.answers?.lastName || ""}`;
    
      await CandidateDetails.findOneAndUpdate(
        { candidateId: candidate._id, jobId, companyCode },
        {
          jobId,
          companyCode,
          candidateId: candidate._id,
          Candidate: candidateName,
          Time: time24,
          Date: startDateTime, 
          Position: job.jobTitle,
          Recruiter: recruiterName,
          Mode: meetingMode,
          Status: "Start Interview",
          Reschedule: false,
        },
        { upsert: true, new: true }
      );
    }

    if (sendNotification && meetingLink) {
      const candidateNames = candidates.map(c => c.answers?.firstName || c.answers?.name || "Candidate").join(", ");
      const candidateEmails = candidates.map(c => c.answers.email).filter(Boolean);

      if (candidateEmails.length > 0) {
        const emailTemplate = MailTemplates.gdScheduled({
          candidateName: candidateNames,
          jobTitle: job.jobTitle,
          interviewDate,
          time24,
          durationMinutes,
          meetingLink,
          businessEmail,
          recruiterName,
          logo: adminUser?.companyLogo,
          organizationName: adminUser?.organizationName
        });

        await sendEmail({
          companyCode: companyCode,
          from: job.hiringManager?.userId?.businessEmail, // ✅ FIXED TYPO
          to: candidateEmails.join(", "),
          subject: emailTemplate.subject,
          html: emailTemplate.html
        });
      }
    }

    const notificationData = {
      candidateNames: candidates.map((c) =>
        c.answers?.name || `${c.answers?.firstName || ""} ${c.answers?.lastName || ""}`
      ),
      date: schedule.interviewDate,
      time: schedule.interviewTime,
      role: job.jobTitle,
      interviewId: schedule._id,
      jobId: job._id,
      companyCode: companyCode,
      userId: req.user.id
    }

    await createScheduleNotification(notificationData);

    return res.status(201).json({
      success: true,
      message: "Group Discussion scheduled successfully",
      data: {
        scheduleId: schedule._id,
        meetingLink,
        interviewDate,
        interviewTime: time24,
        durationMinutes,
        totalCandidates: candidates.length,
      },
    });

  } catch (err) {
    console.error("GD Schedule Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export default postGDScheduleByJob;
