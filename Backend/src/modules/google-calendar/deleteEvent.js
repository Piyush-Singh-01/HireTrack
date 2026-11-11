import User from "../users/user.model.js";
import { getCalendarClient } from "../../common/utils/google.js";

const deleteCalendarEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const companyCode = req.user.companyCode;

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

    // 🔹 Get calendar client (auto refresh handled)
    const calendar = await getCalendarClient(user);

    // 🔥 Delete event
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
      sendUpdates: "all", // notify attendees
    });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      eventId,
    });
  } catch (err) {
    console.error("Delete Event Error:", err);

    return res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: err.message,
    });
  }
};

export default deleteCalendarEvent;
