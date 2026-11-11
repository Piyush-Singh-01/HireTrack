import mongoose from "mongoose";
import notificationSettings from "../notifications/notification.model.js";

const deleteNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    /* ✅ TENANT SAFE DELETE */
    const deleted = await notificationSettings.findOneAndDelete({
      userId,
      companyCode,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification settings not found for this user",
      });
    }

    res.json({
      success: true,
      message: "Notification settings deleted successfully",
      data: deleted,
    });
  } catch (err) {
    console.error("Delete Notification Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export default deleteNotification;
