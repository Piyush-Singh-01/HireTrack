import mongoose from "mongoose";
import notificationSettings from "../notifications/notification.model.js";

const getNotification = async (req, res) => {
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

    /* ✅ TENANT SAFE QUERY */
    const settings = await notificationSettings.findOne({
      userId,
      companyCode,
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: `Notification settings not found for user : ${userId}`,
      });
    }

    res.json({
      success: true,
      message: "Notification settings fetched successfully",
      data: settings,
    });
  } catch (err) {
    console.error("Get Notification Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export default getNotification;
