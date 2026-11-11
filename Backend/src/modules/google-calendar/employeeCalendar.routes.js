import express from "express";
import createGoogleCalendarEvent from "./createEvent.js";
import getCalendarEvents from "./getEvent.js";
import updateCalendarEvent from './updateEvent.js';
import deleteCalendarEvent from "./deleteEvent.js";
import { getAuthUrl, getTokens } from "../../common/utils/dashboardCalendar.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

const router = express.Router();

/* ================= AUTH ================= */

router.get("/google/auth", (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: "Code missing" });

    const tokens = await getTokens(code);
    res.json({
      success: true,
      message: "Google Calendar connected",
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= CRUD ROUTES ================= */

router.get("/google/calendar/event/:eventId", protect, allAccess, getCalendarEvents);
router.get("/google/calendar/:userId", protect, allAccess, getCalendarEvents);
router.get("/google/calendar-all", protect, allAccess, getCalendarEvents);
router.post("/google/calendar/create", protect, allAccess, createGoogleCalendarEvent);
router.patch("/google/calendar/update/:id", protect, allAccess, updateCalendarEvent);
router.delete("/google/calendar/delete/:id", protect, allAccess, deleteCalendarEvent);

export default router;
