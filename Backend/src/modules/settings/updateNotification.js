import mongoose from "mongoose";
import notificationSettings from "../notifications/notification.model.js";

const updateNotification = async (req, res) => {
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

    /* ✅ TENANT SAFE UPDATE */
    const updatedSettings = await notificationSettings.findOneAndUpdate(
      { userId, companyCode },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSettings) {
      return res.status(404).json({
        success: false,
        message: "Notification settings not found for this user",
      });
    }

    res.json({
      success: true,
      message: "Notification settings updated successfully",
      data: updatedSettings,
    });
  } catch (err) {
    console.error("Update Notification Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export default updateNotification;
