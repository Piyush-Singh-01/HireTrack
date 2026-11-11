import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["reminder", "applicant"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    dateTime: {
      type: Date,
      default: Date.now,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },

    isSeen: {
      type: Boolean,
      default: false,
    }, 

    companyCode: { 
      type: String, 
      required: true, 
      index: true, 
      trim: true 
    },
    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAndRole",
      required: true
    },
    // For applicant type
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application", 
      required: function () {
        return this.type === "applicant";
      },
    },

    //For reminder type
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSchedule",
      required: function () { return this.type === "reminder" },
    },

    // For Both 
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },

    notifyBeforeInterview: { type: Boolean, default: false },
    reminders: {
      type: [{
        minutesBefore: { type: Number },
        pushAt : { type: Date },
        notified: { type: Boolean, default: false },
      }],
      required: function () {
        return this.notifyBeforeInterview === true;
      },
      validate: {
        validator: function (val) {
          if (!this.notifyBeforeInterview) return true; 
          return val.length > 0 && val.length <= 2;
        },
        message: "Maximum of 1-2 reminders when enabled",
      },
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);

