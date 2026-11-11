import userModel from "./user.model.js";

const deactivateAccount = async (req, res) => {
  try {
    const { businessEmail } = req.body;

    if (!businessEmail) {
      return res.status(400).json({ success: false, message: "Business email is required" });
    }

    const role = req.user.role || req.user.Role;
    const companyCode = req.user.companyCode;

    // ✅ Role check
    if (!["SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // ✅ Find user under tenant
    const user = await userModel.findOne({
      businessEmail,
      companyCode,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Deactivate
    user.isDeactivated = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account deactivated temporarily",
      data: { userId: user._id, businessEmail: user.businessEmail },
    });
  } catch (error) {
    console.error("Deactivate Account Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export default deactivateAccount;
