import MeetingSettings from "./settings.model.js";
import { createCalendarEvent } from "../../common/utils/meetingCalendarService.js";

const addMeeting = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode; 
    const userId = req.user.id;
    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }


    const {
      defaultInterviewDuration,
      meetingPlatform,
      interviewTimings,
      maxInterviewPerDay,
      allowRescheduling,
      calendarIntegration,
      defaultCalendarView,
      autoRecord,
      requireConsent
    } = req.body;

    if (
      !defaultInterviewDuration ||
      !meetingPlatform ||
      !interviewTimings ||
      !maxInterviewPerDay ||
      allowRescheduling === undefined ||
      !calendarIntegration ||
      !defaultCalendarView ||
      autoRecord === undefined ||
      requireConsent === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const newMeeting = new MeetingSettings({
      companyCode, 
      userId,
      defaultInterviewDuration,
      meetingPlatform,
      interviewTimings,
      maxInterviewPerDay,
      allowRescheduling,
      calendarIntegration,
      defaultCalendarView,
      autoRecord,
      requireConsent
    });

    await newMeeting.save();

    // If Google Calendar is enabled, create a calendar event
    if (calendarIntegration === "Google Calendar") {
      const tokens = {
        access_token: process.env.GOOGLE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      };

      const eventData = {
        summary: `Interview (${meetingPlatform})`,
        description: "Auto-created from Meeting Settings",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + defaultInterviewDuration * 60000).toISOString(),
      };

      try {
        const calendarEvent = await createCalendarEvent(eventData, tokens);
        console.log("Event created in Google Calendar:", calendarEvent.htmlLink);
      } catch (err) {
        console.error("Error creating calendar event:", err);
      }
    }

    res.status(201).json({
      success: true,
      message: "Meeting settings created successfully",
      data: newMeeting
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

export default addMeeting;

