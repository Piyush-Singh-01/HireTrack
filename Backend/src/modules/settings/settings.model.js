import mongoose from "mongoose";

const meetingSettingsSchema = new mongoose.Schema(
  {
    defaultInterviewDuration: {
      type: String,
      required: true,
    },
    meetingPlatform: {
      type: String,
      enum: ["Zoom", "Google Meet", "Teams", "Other"],
      required: true,
    },
    interviewTimings: {
      startBefore : { type: Number, enum: [ 5, 10 ] },
      endAfter : { type: Number, enum: [ 5, 10 ] }
    },
    maxInterviewPerDay: {
      type: Number,
      required: true,
      default: 1,
    },
    allowRescheduling: {
      type: Boolean,
      default: false,
    },
    calendarIntegration: {
      type: String, 
    },
    defaultCalendarView: {
      type: String,
      enum: ["Day", "Week", "Month"],
      default: "Week",
    },
    companyCode: { 
      type: String, 
      required: true, 
      index: true, 
      trim: true 
    },
    autoRecord: {
      type: Boolean,
      default: false,
    },
    requireConsent: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAndRole",
      required: true
    },
  },
  { timestamps: true }
);

const meetingSettings = mongoose.model("MeetingSettings", meetingSettingsSchema);

export default meetingSettings;

