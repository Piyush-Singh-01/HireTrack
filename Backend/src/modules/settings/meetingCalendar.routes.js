import express from "express";
import { getAuthUrl, getTokens } from "../../common/utils/meetingCalendarService.js";

const router = express.Router();

router.get("/google/auth", (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code found");

  const tokens = await getTokens(code);
  console.log("Access tokens: ", tokens);

  res.send("Google Calendar connected successfully!");
});

export default router;

