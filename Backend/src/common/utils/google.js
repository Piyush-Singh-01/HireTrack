import { google } from "googleapis";

/* ================= CREATE OAUTH CLIENT ================= */

export const createGoogleOAuthClient = ({
  clientId,
  clientSecret,
  redirectUri,
  accessToken,
  refreshToken,
}) => {
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing required Google OAuth credentials");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  if (accessToken || refreshToken) {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  return oauth2Client;
};

/* ================= AUTH URL ================= */

export const getAuthUrl = () => {
  const oauth2Client = createGoogleOAuthClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
  });

  return oauth2Client.generateAuthUrl({
    access_type: "offline", // 🔥 required for refresh_token
    prompt: "consent",      // 🔥 ensures refresh_token every time
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });
};

/* ================= GET TOKENS ================= */

export const getTokens = async (code) => {
  const oauth2Client = createGoogleOAuthClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
  });

  const { tokens } = await oauth2Client.getToken(code);

  return tokens;
};

/* ================= REFRESH TOKEN HANDLER ================= */

export const getValidAccessToken = async (userToken) => {
  const oauth2Client = createGoogleOAuthClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
    accessToken: userToken.accessToken,
    refreshToken: userToken.refreshToken,
  });

  const isExpired = userToken.expiryDate <= Date.now();

  if (isExpired) {
    const { credentials } = await oauth2Client.refreshAccessToken();

    return {
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date,
    };
  }

  return {
    accessToken: userToken.accessToken,
    expiryDate: userToken.expiryDate,
  };
};

/* ================= CALENDAR CLIENT ================= */



export const getCalendarClient = async (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: user.googleCalendar.refreshToken,
  });

  // ✅ auto refresh
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      user.googleCalendar.accessToken = tokens.access_token;
    }

    if (tokens.expiry_date) {
      user.googleCalendar.tokenExpiry = new Date(tokens.expiry_date);
    }

    await user.save();
  });

  return google.calendar({
    version: "v3",
    auth: oauth2Client,
  });
};
