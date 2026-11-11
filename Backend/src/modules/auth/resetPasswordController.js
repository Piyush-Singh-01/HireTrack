import User from "../users/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const resetPassword = async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token required",
      });
    }

    let { newPassword, confirmPassword } = req.body;

    newPassword = newPassword?.trim();
    confirmPassword = confirmPassword?.trim();

    // ================= VALIDATION =================

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // ================= PASSWORD POLICY =================

    const passwordPolicy = {
      minLength: 8,
      maxLength: 64,
      upper: /[A-Z]/,
      lower: /[a-z]/,
      number: /[0-9]/,
      special: /[@#%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    };

    if (
      newPassword.length < passwordPolicy.minLength ||
      newPassword.length > passwordPolicy.maxLength
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8-64 characters",
      });
    }

    if (!passwordPolicy.upper.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Must contain uppercase",
      });
    }

    if (!passwordPolicy.lower.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Must contain lowercase",
      });
    }

    if (!passwordPolicy.number.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Must contain number",
      });
    }

    if (!passwordPolicy.special.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Must contain special character",
      });
    }

    // ================= VERIFY TOKEN =================

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // ================= FIND USER =================

    const user = await User.findOne({
      _id: decoded.id,
      companyCode: decoded.companyCode,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    // ================= UPDATE PASSWORD =================

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export default resetPassword;
