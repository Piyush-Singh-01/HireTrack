import { google } from 'googleapis';
import Application from '../applications/applicantSchema.js';
import InterviewSchedule from './interview.model.js';
import Job from '../jobs/job.model.js';
import userModel from '../users/user.model.js';

const isValidMeetLink = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('placeholder')) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Start Interview Controller (tenant-safe)
 */
const startInterview = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;
    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }

    const { 
      applicantId, 
      interviewRound, 
      interviewer, 
      durationMinutes = 60,
      startImmediately = true 
    } = req.body;

    if (!applicantId) {
      return res.status(400).json({ 
        success: false,
        message: 'applicantId is required' 
      });
    }

    // ✅ Find applicant with companyCode
    const applicant = await Application.findOne({ _id: applicantId, companyCode }).populate('jobId');
    if (!applicant) {
      return res.status(404).json({ 
        success: false,
        message: 'Applicant not found for this company' 
      });
    }

    if (!['Shortlisted', 'Applied', 'Interview', 'Rescheduled'].includes(applicant.profileStatus)) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot start interview. Current status: ${applicant.profileStatus}` 
      });
    }

    if (applicant.interviewDetails?.interviewStatus === 'In Progress') {
      let currentMeetingLink = applicant.interviewDetails.meetingLink;

      // Fallback: If link is missing or invalid in applicant doc, find the latest schedule record
      if (!isValidMeetLink(currentMeetingLink)) {
        const latestSchedule = await InterviewSchedule.findOne({ 
          candidateIds: applicantId, 
          companyCode 
        }).sort({ createdAt: -1 });
        
        currentMeetingLink = latestSchedule?.meetingLink;
      }

      // If still missing or invalid, fallback to valid Google Meet instant link
      if (!isValidMeetLink(currentMeetingLink)) {
        currentMeetingLink = 'https://meet.google.com/new';
      }

      // Repair applicant doc if it held an invalid link
      if (applicant.interviewDetails.meetingLink !== currentMeetingLink) {
        applicant.interviewDetails.meetingLink = currentMeetingLink;
        await applicant.save();
      }

      return res.status(200).json({ 
        success: true,
        message: 'Interview is already in progress for this applicant',
        data: {
          meetingLink: currentMeetingLink,
          startedAt: applicant.interviewDetails.interviewStartedAt
        }
      });
    }

    // ✅ Check for existing schedule for this applicant (today first, then any active)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let existingSchedule = await InterviewSchedule.findOne({
      candidateIds: applicantId,
      companyCode,
      interviewDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Scheduled', 'Start Interview', 'Rescheduled'] }
    });

    if (!existingSchedule) {
      const todayStr = new Date().toISOString().split('T')[0];
      existingSchedule = await InterviewSchedule.findOne({
        candidateIds: applicantId,
        companyCode,
        interviewDate: {
          $gte: new Date(todayStr),
          $lt: new Date(new Date(todayStr).getTime() + 24 * 60 * 60 * 1000)
        },
        status: { $in: ['Scheduled', 'Start Interview', 'Rescheduled'] }
      });
    }

    if (!existingSchedule) {
      existingSchedule = await InterviewSchedule.findOne({
        candidateIds: applicantId,
        companyCode,
        status: { $in: ['Scheduled', 'Start Interview', 'Rescheduled'] }
      }).sort({ createdAt: -1 });
    }

    // Check existing schedule or applicant doc for valid meeting link
    let meetLink = isValidMeetLink(existingSchedule?.meetingLink) ? existingSchedule.meetingLink : null;
    let eventId = existingSchedule?.calendarEventId || applicant.interviewDetails?.eventId || null;

    if (!meetLink && isValidMeetLink(applicant.interviewDetails?.meetingLink)) {
      meetLink = applicant.interviewDetails.meetingLink;
    }

    // Attempt Google Calendar integration if no meeting link exists yet
    if (!meetLink) {
      try {
        const adminUser = await userModel.findOne({ companyCode, role: 'SuperAdmin' }).lean();
        const googleData = adminUser?.googleCalendar;
        const accessToken = googleData?.accessToken || process.env.GOOGLE_ACCESS_TOKEN;
        const refreshToken = googleData?.refreshToken || process.env.GOOGLE_REFRESH_TOKEN;

        if (accessToken || refreshToken) {
          const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
          );
          oAuth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
          const startTime = startImmediately 
            ? new Date(Date.now() + 2 * 60 * 1000)
            : new Date(Date.now() + 30 * 60 * 1000);
          const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

          const candName = `${applicant.answers?.firstName || ''} ${applicant.answers?.lastName || ''}`.trim() || 'Candidate';
          const candEmail = applicant.answers?.email || applicant.answers?.Email;

          const event = {
            summary: `Interview: ${candName} - ${applicant.jobId?.jobTitle || 'Position'}`,
            description: `Interview for ${candName}\nApplicant ID: ${applicantId}\nRound: ${interviewRound || 'Initial Screening'}\nInterviewer: ${interviewer || 'TBD'}`,
            start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Kolkata' },
            end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Kolkata' },
            conferenceData: { createRequest: { requestId: `meet-${applicantId}-${Date.now()}`, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
            attendees: candEmail ? [{ email: candEmail }] : [],
          };

          const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all',
          });

          let extractedLink = null;
          if (response.data?.conferenceData?.entryPoints?.length > 0) {
            const videoEntry = response.data.conferenceData.entryPoints.find(
              (e) => e.entryPointType === 'video'
            );
            extractedLink = videoEntry?.uri;
          }
          if (!extractedLink && response.data?.hangoutLink) {
            extractedLink = response.data.hangoutLink;
          }

          if (isValidMeetLink(extractedLink)) {
            meetLink = extractedLink;
            eventId = response.data?.id;
          }
        }
      } catch (googleError) {
        console.warn('Google Meet creation failed, falling back to instant Meet:', googleError.message);
      }
    }

    // Safe fallback to valid Google Meet link (never an invalid placeholder code)
    if (!isValidMeetLink(meetLink)) {
      meetLink = 'https://meet.google.com/new';
    }

    const VALID_ROUNDS = ["Initial Screening", "Round 1", "Round 2", "Final Round"];
    const safeInterviewRound = VALID_ROUNDS.includes(interviewRound) 
      ? interviewRound 
      : (applicant.interviewDetails?.interviewRound || "Initial Screening");

    // ✅ Update applicant safely
    applicant.interviewDetails = {
      interviewStarted: true,
      interviewStartedAt: new Date(),
      interviewStatus: 'In Progress',
      meetingLink: meetLink,
      eventId: eventId,
      interviewRound: safeInterviewRound,
      interviewer: interviewer || null,
      interviewNotes: applicant.interviewDetails?.interviewNotes || '',
      interviewDuration: durationMinutes,
    };
    applicant.profileStatus = 'Interview';

    await applicant.save();

    let finalSchedule = existingSchedule;
    const applicantFullName = `${applicant.answers?.firstName || ''} ${applicant.answers?.lastName || ''}`.trim() || 'Candidate';

    if (!existingSchedule) {
      // ✅ Include companyCode in interview schedule
      const interviewScheduleData = {
        companyCode, 
        candidateIds: [applicantId],
        jobId: applicant.jobId?._id || applicant.jobId,
        candidateNames: [applicantFullName],
        position: applicant.jobId?.jobTitle || 'Position',
        recruiterName: interviewer || 'HR Team',
        interviewDate: new Date().toISOString().split('T')[0],
        interviewTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
        meetingMode: 'Online',
        durationMinutes,
        sendNotification: true,
        status: 'Scheduled',
        meetingLink: meetLink,
        calendarEventId: eventId,
      };

      finalSchedule = await InterviewSchedule.create(interviewScheduleData);
    } else {
      // Update existing schedule with valid meeting link if it was missing or had a placeholder
      let needsSave = false;
      if (!existingSchedule.meetingLink || !isValidMeetLink(existingSchedule.meetingLink) || (meetLink && existingSchedule.meetingLink !== meetLink)) {
        existingSchedule.meetingLink = meetLink;
        if (eventId) existingSchedule.calendarEventId = eventId;
        needsSave = true;
      }
      if (needsSave) {
        await existingSchedule.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: existingSchedule ? 'Interview resumed successfully' : 'Interview started successfully',
      data: {
        applicantId: applicant._id,
        applicantName: applicantFullName,
        jobTitle: applicant.jobId?.jobTitle,
        interviewStatus: applicant.interviewDetails.interviewStatus,
        meetingLink: applicant.interviewDetails.meetingLink,
        eventId: applicant.interviewDetails.eventId,
        interviewRound: applicant.interviewDetails.interviewRound,
        interviewer: applicant.interviewDetails.interviewer,
        startedAt: applicant.interviewDetails.interviewStartedAt,
        duration: applicant.interviewDetails.interviewDuration,
        scheduleId: finalSchedule?._id
      }
    });

  } catch (error) {
    console.error('startInterview error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to start interview', 
      error: error.message 
    });
  }
};

export default startInterview;
