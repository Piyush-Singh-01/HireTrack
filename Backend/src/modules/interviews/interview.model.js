import mongoose from "mongoose";

const interviewScheduleSchema = new mongoose.Schema(
  {
    candidateIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true,
      },
    ],

    candidates: [
      {
        candidateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Application",
        },
        name: String,
        email: String,
      },
    ],

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    scheduleType: {
      type: String,
      enum: ["Interview", "Group Interview"],
      default: "Interview",
    },

    // ✅ Multiple candidate names
    candidateNames: [
      {
        type: String,
        required: true,
      },
    ],

    position: {
      type: String,
      required: true,
    },

    recruiterName: {
      type: String,
      required: true,
    },

    interviewDate: {
      type: Date,
      required: true,
    },

    interviewTime: {
      type: String,
      required: true,
    },

    meetingMode: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },

    durationMinutes: {
      type: Number,
      default: 30,
    },

    sendNotification: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "Start Interview",
        "Scheduled",
        "Cancelled",
        "Completed",
        "Rescheduled",
        "OnHold",
      ],
      default: "Start Interview",
    },

    companyCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    meetingLink: {
      type: String,
      default: null,
    },

    calendarEventId: {
      type: String,
      default: null,
    },

    rescheduled: {
      type: Boolean,
      default: false,
    },

    previousSchedule: {
      interviewDate: Date,
      interviewTime: String,
      updatedAt: Date,
      reason: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("InterviewSchedule", interviewScheduleSchema);
