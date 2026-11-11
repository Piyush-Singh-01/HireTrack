import mongoose from "mongoose";
import NotificationSettings from "../notifications/notification.model.js";
import Notification from '../dashboards/dashboardNotification.model.js';

const createNotificationSettings = async (req, res) => {
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

    const {
      desktopNotification,
      emailNotification,
      notifyBeforeInterview,
      firstReminder,
      secondReminder,
    } = req.body;

    /* TENANT SAFE EXISTENCE CHECK */
    const exists = await NotificationSettings.findOne({
      userId,
      companyCode,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Settings already exist for this user",
      });
    }

    const settings = await NotificationSettings.create({
      userId,
      companyCode, // CRITICAL TENANT FIELD
      desktopNotification,
      emailNotification,
      notifyBeforeInterview,
      firstReminder,
      secondReminder,
    });

    res.status(201).json({
      success: true,
      message: "Notification settings created successfully",
      data: settings,
    });
  } catch (err) {
    console.error("Create Notification Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export default createNotificationSettings;
