import mongoose from "mongoose";

const notificationSettings = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAndRole", 
      required: true,
      unique: true,
    },
    companyCode: { 
      type: String, 
      required: true, 
      index: true, 
      trim: true 
    },
    desktopNotification: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: false },
    notifyBeforeInterview: { type: Boolean, default: false },
    firstReminder: { type: Number, default: 0 },
    secondReminder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model(
  "NotificationSetting",
  notificationSettings
);

