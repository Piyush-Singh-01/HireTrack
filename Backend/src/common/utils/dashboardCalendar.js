
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);


/* ================= AUTH ================= */

export const getAuthUrl = () => {
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
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

/* ================= AUTH ================= */

export const getCalendarClient = ({ accessToken, refreshToken }) => {
  if (!refreshToken) {
    throw new Error("Refresh token missing");
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // 🔥 AUTO HANDLE TOKEN REFRESH
  oauth2Client.on("tokens", (tokens) => {
    console.log("🔄 NEW TOKENS RECEIVED:", tokens);

    // TODO: save to DB
    // tokens.access_token
    // tokens.refresh_token (only if exists)
  });

  return google.calendar({
    version: "v3",
    auth: oauth2Client,
  });
};
/* ================= CREATE EVENT ================= */

export const createCalendarEvent = async (data) => {
  const calendar = getCalendarClient({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  const response = await calendar.events.insert({
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

        // ✅ ADD THIS (IMPORTANT)
        attendees: data.interviewerEmails?.length > 0
          ? data.interviewerEmails.map(email => ({ email }))
          : [],

        // ✅ ADD THIS (YOUR MAIN REQUIREMENT)
        guestsCanModify: true,
        guestsCanInviteOthers: true,
        guestsCanSeeOtherGuests: true,

        // ✅ Google Meet link
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      }
  });

  return response.data;
};

/* ================= UPDATE EVENT ================= */

export const updateCalendarEvent = async (eventId, data) => {
  const calendar = getCalendarClient({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  const response = await calendar.events.update({
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

      // ✅ ADD THIS
      attendees: data.interviewerEmails?.length > 0
        ? data.interviewerEmails.map(email => ({ email }))
        : [],

      // ✅ ADD THIS
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
    }
  });

  return response.data;
};
