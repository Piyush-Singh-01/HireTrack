
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const createOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

const CALENDAR_TIMEOUT_MS = 5000;

const withTimeout = (promise, ms = CALENDAR_TIMEOUT_MS, label = "Google Calendar request") =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);

/* ================= AUTH ================= */

export const getAuthUrl = () => {
  const oauth2Client = createOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });
};

export const getTokens = async (code) => {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

/* ================= AUTH ================= */

export const getCalendarClient = ({ accessToken, refreshToken }) => {
  if (!refreshToken) {
    throw new Error("Refresh token missing");
  }

  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // 🔥 AUTO HANDLE TOKEN REFRESH
  oauth2Client.on("tokens", (tokens) => {
    console.log("🔄 NEW TOKENS RECEIVED:", tokens);
  });

  return google.calendar({
    version: "v3",
    auth: oauth2Client,
  });
};

export const extractMeetingLink = (event) => {
  if (event?.conferenceData?.entryPoints?.length > 0) {
    const videoEntry = event.conferenceData.entryPoints.find(
      (e) => e.entryPointType === "video"
    );
    if (videoEntry?.uri) return videoEntry.uri;
  }
  return event?.hangoutLink || null;
};

/* ================= CREATE EVENT ================= */

export const createCalendarEvent = async (data) => {
  const calendar = getCalendarClient({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  const response = await withTimeout(
    calendar.events.insert(
      {
        calendarId: "primary",
        conferenceDataVersion: 1,
        sendUpdates: "all",
        requestBody: {
          summary: data.description,
          description: data.description,

          start: {
            dateTime: data.start,
            timeZone: "Asia/Kolkata",
          },

          end: {
            dateTime: data.end,
            timeZone: "Asia/Kolkata",
          },

          attendees:
            data.interviewerEmails?.length > 0
              ? data.interviewerEmails.map((email) => ({ email }))
              : [],

          guestsCanModify: true,
          guestsCanInviteOthers: true,
          guestsCanSeeOtherGuests: true,

          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: {
                type: "hangoutsMeet",
              },
            },
          },
        },
      },
      { timeout: CALENDAR_TIMEOUT_MS }
    ),
    CALENDAR_TIMEOUT_MS,
    "Google Calendar insert"
  );

  return response.data;
};

/* ================= UPDATE EVENT ================= */

export const updateCalendarEvent = async (eventId, data) => {
  const calendar = getCalendarClient({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  const response = await withTimeout(
    calendar.events.update(
      {
        calendarId: "primary",
        eventId,
        conferenceDataVersion: 1,
        sendUpdates: "all",
        requestBody: {
          summary: data.description,
          description: data.description,

          start: {
            dateTime: data.start,
            timeZone: "Asia/Kolkata",
          },

          end: {
            dateTime: data.end,
            timeZone: "Asia/Kolkata",
          },

          attendees:
            data.interviewerEmails?.length > 0
              ? data.interviewerEmails.map((email) => ({ email }))
              : [],

          guestsCanModify: true,
          guestsCanInviteOthers: true,
          guestsCanSeeOtherGuests: true,

          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: {
                type: "hangoutsMeet",
              },
            },
          },
        },
      },
      { timeout: CALENDAR_TIMEOUT_MS }
    ),
    CALENDAR_TIMEOUT_MS,
    "Google Calendar update"
  );

  return response.data;
};
