import userModel from "./user.model.js";

const deletePermanentlyAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { businessEmail } = req.body;

    // 1️⃣ Role check
    if (!["SuperAdmin", "Admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // 2️⃣ Validate ID
    if (!id || !businessEmail) {
      return res.status(400).json({ success: false, message: "User ID and email are required" });
    }

    // 3️⃣ Delete user with tenant check
    const deletedUser = await userModel.findOneAndDelete({
      _id: id,
      businessEmail,
      companyCode: req.user.companyCode,
    });

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User account permanently deleted",
      data: { userId: deletedUser._id, email: deletedUser.businessEmail },
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export default deletePermanentlyAccount;
