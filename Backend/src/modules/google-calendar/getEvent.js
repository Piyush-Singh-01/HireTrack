import User from "../users/user.model.js";
import { getCalendarClient } from "../../common/utils/google.js";

const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyCode = req.user.companyCode;
    const { eventId } = req.params;

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

    // =========================
    // 🔸 GET SINGLE EVENT
    // =========================
    if (eventId) {
      const event = await calendar.events.get({
        calendarId: "primary",
        eventId,
      });

      return res.status(200).json({
        success: true,
        message: "Event fetched successfully",
        data: event.data,
      });
    }

    // =========================
    // 🔸 GET ALL EVENTS
    // =========================
    const events = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(), // upcoming events
      maxResults: 20,
      singleEvents: true,
      orderBy: "startTime",
    });

    return res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events.data.items,
    });

  } catch (err) {
    console.error("Get Events Error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: err.message,
    });
  }
};

export default getCalendarEvents;
