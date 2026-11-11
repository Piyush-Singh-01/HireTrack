import User from "../users/user.model.js";
import UserAndRole from "../users/userandroleSchema.js";
import { createGoogleOAuthClient } from "../../common/utils/google.js";

const connectGoogleCalendar = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    const { id, companyCode, Role } = req.user;

    let user;
    if (Role === "SuperAdmin") {
      user = await User.findOne({ _id: id, companyCode });
    } else {
      user = await UserAndRole.findOne({ _id: id, companyCode });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oauth2Client = createGoogleOAuthClient({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    const statePayload = Buffer.from(
      JSON.stringify({
        userId: user._id,
        companyCode: user.companyCode,
        role: Role,
      }),
    ).toString("base64");

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent select_account",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      state: statePayload,
    });
    console.log("REDIRECT USED:", process.env.GOOGLE_REDIRECT_URI);
    console.log("AUTH URL:", authUrl);
    return res.redirect(authUrl);
  } catch (err) {
    console.error("Connect Google Calendar Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate Google auth URL",
    });
  }
};

export default connectGoogleCalendar;
