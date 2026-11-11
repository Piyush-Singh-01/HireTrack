import User from "../users/user.model.js";
import { getCalendarClient } from "../../common/utils/google.js";

const updateCalendarEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const companyCode = req.user.companyCode;

    const {
      title,
      description,
      startTime,
      endTime,
      attendees,
    } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
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

    // 🔥 Update event
    const response = await calendar.events.update({
      calendarId: "primary",
      eventId,
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
      },
      sendUpdates: "all", // notify attendees
    });

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: {
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
      },
    });

  } catch (err) {
    console.error("Update Event Error:", err);

    return res.status(500).json({
      success: false,
      message: "Error updating event",
      error: err.message,
    });
  }
};

export default updateCalendarEvent;
