import express from "express";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";
import addCredentials from "./addCredentials.js";
import connectGoogleCalendar from "./connectCalendar.js";
import googleCalendarCallback from "./connectCallback.js";

const router = express.Router();

router.put("/google/add-credentials", addCredentials);
router.get(
  "/google/connect-calendar",
  protect,
  allAccess,
  connectGoogleCalendar,
);
router.get("/google/callback", googleCalendarCallback);

export default router;
