import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import User from "../users/user.model.js";
import UserAndRole from "../users/userandroleSchema.js";
import { createGoogleOAuthClient } from "../../common/utils/google.js";

const googleCalendarCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send("Missing code or state");
    }

    const decodedState = JSON.parse(
      Buffer.from(state, "base64").toString("utf-8")
    );

    const { userId, companyCode, role } = decodedState;

    let user;
    if (role === "SuperAdmin") {
      user = await User.findOne({ _id: userId, companyCode });
    } else {
      user = await UserAndRole.findOne({ _id: userId, companyCode });
    }

    if (!user) {
      return res.status(404).send("User not found");
    }
const oauth2Client = createGoogleOAuthClient({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});



    const { tokens } = await oauth2Client.getToken(code);

    // ✅ Preserve refresh token if not returned
    user.googleCalendar.accessToken = tokens.access_token;

    if (tokens.refresh_token) {
      user.googleCalendar.refreshToken = tokens.refresh_token;
    }

    user.googleCalendar.tokenExpiry = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : null;

    oauth2Client.setCredentials(tokens);

    // ✅ Get user email
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const googleUser = await oauth2.userinfo.get();

    user.googleCalendar.googleUser = {
      email: googleUser.data.email,
      name: googleUser.data.name,
      picture: googleUser.data.picture,
    };

    user.googleCalendar.isConnected = true;
    user.googleCalendar.lastSyncTime = new Date();

    await user.save();

    return res.redirect(`${process.env.FRONTEND_URL}dashboard?google=connected`);

  } catch (err) {
    console.error("Google Calendar Callback Error:", err);

    if (err.response?.data?.error === "invalid_grant") {
      return res.status(400).json({
        success: false,
        message: "Authorization expired or already used",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Google connection failed",
    });
  }
};
export default googleCalendarCallback;
