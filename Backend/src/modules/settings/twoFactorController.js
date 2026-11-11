import User from "../users/user.model.js";
import crypto from "crypto";
import { sendEmail } from "../../common/utils/emailService.js";

// ================= ENABLE 2FA =================
export const enable2FA = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;   // ✅ ADD THIS

    if (!companyCode) {
      return res.status(401).json({ message: "Company context missing" });
    }

    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({
      businessEmail: email.toLowerCase(),
      companyCode,                               // ✅ ADD THIS
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Generate 6 digit code
    const code = crypto
      .randomInt(0, 1000000)
      .toString()
      .padStart(6, "0");

    user.twoFACode = code;
    user.twoFACodeExpiry = Date.now() + 5 * 60 * 1000;
    user.is2FAVerified = false;

    await user.save();

    await sendEmail({
       companyCode:companyCode,
      to: email,
      subject: "2FA Verification Code",
      html: `
        <p>Hi ${user.userName},</p>
        <p>Your 2FA code: <b>${code}</b></p>
        <p>Expires in 5 minutes.</p>
      `,
    });

    res.json({ message: "2FA code sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= VERIFY 2FA =================
export const verify2FA = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;   // ✅ ADD THIS

    if (!companyCode) {
      return res.status(401).json({ message: "Company context missing" });
    }

    const { email, code } = req.body;

    const user = await User.findOne({
      businessEmail: email.toLowerCase(),
      companyCode,                               // ✅ ADD THIS
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (
      user.twoFACode !== code ||
      !user.twoFACodeExpiry ||
      user.twoFACodeExpiry < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired code" });
    }

    user.is2FAEnabled = true;
    user.is2FAVerified = true;
    user.lastActivity = new Date();

    await user.save();

    res.json({ message: "2FA enabled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= DISABLE 2FA =================
export const disable2FA = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;   // ✅ ADD THIS

    if (!companyCode) {
      return res.status(401).json({ message: "Company context missing" });
    }

    const { email } = req.body;

    const user = await User.findOne({
      businessEmail: email.toLowerCase(),
      companyCode,                               // ✅ ADD THIS
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.is2FAEnabled = false;
    user.is2FAVerified = false;

    // Clear code only when disabling
    user.twoFACode = null;
    user.twoFACodeExpiry = null;

    await user.save();

    res.json({ message: "2FA disabled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
