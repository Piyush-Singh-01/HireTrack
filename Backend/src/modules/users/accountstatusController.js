import UserAndRole from "./userandroleSchema.js";
import { sendEmail } from "../../common/utils/emailService.js";

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedRole = req.user.Role; // ✅ FIX
    const companyCode = req.user.companyCode;

    if (!["SuperAdmin", "Admin"].includes(loggedRole)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const user = await UserAndRole.findOne({ _id: id, companyCode });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.Role === "SuperAdmin") {
      return res.status(403).json({ success: false, message: "Cannot change status of SuperAdmin" });
    }

    if (user.Role === "Admin" && loggedRole !== "SuperAdmin") {
      return res.status(403).json({ success: false, message: "Only SuperAdmin can change Admin status" });
    }

    if (["HR", "Interviewer"].includes(user.Role) && !["Admin", "SuperAdmin"].includes(loggedRole)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    user.accountStatus =
      user.accountStatus === "Active" ? "Disabled" : "Active";

    await user.save();

    try {
      const subject =
        user.accountStatus === "Disabled"
          ? "Account Disabled"
          : "Account Activated";

      const html =
        user.accountStatus === "Disabled"
          ? `<p>Hi ${user.Name},</p>
             <p>Your account has been disabled.</p>`
          : `<p>Hi ${user.Name},</p>
             <p>Your account is now active.</p>`;

      await sendEmail({ to: user.Email, subject, html });
    } catch (err) {
      console.warn("Email failed:", err.message);
    }

    return res.status(200).json({
      success: true,
      message: `User status is now ${user.accountStatus}`,
      status: user.accountStatus,
    });

  } catch (error) {
    console.error("Toggle User Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Status update failed",
      error: error.message,
    });
  }
};

export default toggleUserStatus;
