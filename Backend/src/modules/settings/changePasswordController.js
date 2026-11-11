import User from "../users/user.model.js";
import UserAndRole from "../users/userandroleSchema.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../../common/utils/emailService.js";

const changePassword = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;   // ✅ ADD THIS

    if (!companyCode) {
      return res.status(401).json({
        message: "Company context missing",
      });
    }

    const email = req.body.email?.trim();
    const currentPassword = req.body.currentPassword?.trim();
    const newPassword = req.body.newPassword?.trim();

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Find user (TENANT SAFE 🔥)
    let user = await User.findOne({
      businessEmail: email,
      companyCode,                 // ✅ ADD THIS
    });

    if (!user) {
      user = await UserAndRole.findOne({
        Email: email,
        companyCode,
      });
    }


    if (!user)
      return res.status(404).json({ message: "User not found" });

    // ✅ Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current password" });

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // -------- USER MODEL UPDATE --------
    user.password = hashedPassword;
    user.lastActivity = new Date();
    await user.save();

    // -------- USER & ROLE UPDATE (TENANT SAFE 🔥) --------
    const userRole = await UserAndRole.findOne({
      Email: email,
      companyCode,                 // ✅ ADD THIS
    });

    if (userRole) {
      userRole.Password = hashedPassword;
      userRole.password = hashedPassword;
      await userRole.save();
    }

    // ✅ Email notification
    try {
      await sendEmail({
         companyCode:companyCode,
        to: user.businessEmail,
        subject: "Password Changed Successfully",
        html: `<p>Hi ${user.userName},</p>
               <p>Your password has been changed successfully.</p>`
      });
    } catch (err) {
      console.warn("Email failed:", err.message);
    }

    return res.status(200).json({
      message: "Password changed successfully"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export default changePassword;
