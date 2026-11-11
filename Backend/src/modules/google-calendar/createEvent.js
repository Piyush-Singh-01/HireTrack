import User from "../users/user.model.js";
import { getCalendarClient } from "../../common/utils/google.js";

const createGoogleCalendarEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyCode = req.user.companyCode;

    const {
      title,
      description,
      startTime,
      endTime,
      attendees, // array of emails
    } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Title, startTime, endTime required",
      });
    }

    // 🔹 Get user
    const user = await User.findOne({
      _id: userId,
      companyCode,
    });

    if (!user || !user.googleCalendar?.refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Google Calendar not connected",
      });
    }

    // 🔹 Get calendar client
    const calendar = await getCalendarClient(user);

    // 🔥 Create event
    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: title,
        description: description || "",
        
        start: {
          dateTime: new Date(startTime),
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: new Date(endTime),
          timeZone: "Asia/Kolkata",
        },

        attendees: attendees?.map(email => ({ email })) || [],

        conferenceData: {
          createRequest: {
            requestId: new Date().getTime().toString(),
            conferenceSolutionKey: {
              type: "hangoutsMeet", // 🔥 Google Meet
            },
          },
        },
      },
      conferenceDataVersion: 1,
    });

    const meetLink =
      event.data.conferenceData?.entryPoints?.[0]?.uri || null;

    return res.status(200).json({
      success: true,
      message: "Event created successfully",
      data: {
        eventId: event.data.id,
        meetLink,
        htmlLink: event.data.htmlLink,
      },
    });
  } catch (err) {
    console.error("Create Event Error:", err);

    return res.status(500).json({
      success: false,
      message: "Error creating calendar event",
      error: err.message,
    });
  }
};

export default createGoogleCalendarEvent;
