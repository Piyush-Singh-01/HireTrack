import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step 1: Get consent URL
export const getAuthUrl = () => {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
};

// Step 2: Get tokens from code
export const getTokens = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

// Step 3: Create calendar event
export const createCalendarEvent = async (eventData, tokens) => {
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const event = {
    summary: eventData.summary,
    description: eventData.description,
    start: {
      dateTime: eventData.startTime,
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: eventData.endTime,
      timeZone: "Asia/Kolkata",
    },
    conferenceData: {
      createRequest: {
        requestId: "meet-" + Date.now(),
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,

  });

  return response.data;
};

