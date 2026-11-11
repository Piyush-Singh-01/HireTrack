import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    /* ===============================
       IDENTITY & LINKAGE
    =============================== */
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },
    companyCode: { 
      type: String, 
      required: true, 
      index: true, 
      trim: true 
    },


    /* ===============================
       USER FILLED DATA (DYNAMIC)
       fieldId → value
    =============================== */
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    /* ===============================
       APPLICATION WORKFLOW
    =============================== */
    profileStatus: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "rejected",
        "interview",
        "hired",
        "onhold",
        "failed_screening",
        "Applied",
         "Shortlisted", 
         "Interview", 
         "Rescheduled",
          "Selected", 
          "Rejected"
      ],
      default: "applied",
      index: true,
    },

    /* ===============================
       🔍 SCREENING RESULT (NEW)
       auto + manual evaluation
    =============================== */
    screeningResult: {
      totalScore: { type: Number, default: 0 },
      maxScore: { type: Number, default: 0 },
      autoScore: { type: Number, default: 0 },

      status: {
        type: String,
        enum: ["pending", "passed", "failed"],
        default: "pending",
      },

      evaluatedAt: { type: Date, default: null },
    },
// ==================== candidate feedback ==============

    candidateFeedback: {
      communication: {
        type: String,
        enum: ["Excellent", "Good", "Below Average", "Inadequate"],
        default: null,
      },
      technical: {
        type: String,
        enum: ["Excellent", "Good", "Below Average", "Inadequate"],
        default: null,
      },
      programming: {
        type: String,
        enum: ["Excellent", "Good", "Below Average", "Inadequate"],
        default: null,
      },
      problemSolving: {
        type: String,
        enum: ["Excellent", "Good", "Below Average", "Inadequate"],
        default: null,
      },
      feedbackDescription: {
        type: String,
        default: "",
      },
    },


    /* ===============================
       HR / INTERNAL (NOT FORM DATA)
    =============================== */
    candidateRating: {
      type: String,
      enum: ["Good fit", "Not a fit", "Maybe"],
      default: null,
    },

    interviewDetails: {
      interviewStarted: { type: Boolean, default: false },
      interviewStartedAt: { type: Date, default: null },
      interviewEndedAt: { type: Date, default: null },

      interviewStatus: {
        type: String,
        enum: ["Not Started", "In Progress", "Completed", "Cancelled"],
        default: "Not Started",
      },

      interviewRound: {
        type: String,
        enum: [
          "Initial Screening",
          "Round 1",
          "Round 2",
          "Final Round",
        ],
        default: null,
      },

      interviewer: { type: String, default: null },
      interviewNotes: { type: String, default: "" },
      meetingLink: { type: String, default: null },
      eventId: { type: String, default: null },
    },

    hiringDetails: {
      hiredOn: { type: Date, default: null },
      salary: { type: Number, default: null },
      startDate: { type: Date, default: null },
      offerLetterSent: { type: Boolean, default: false },
    },

    rescheduled: { type: Boolean, default: false },

    consent: { type: Boolean, default: true },
    termsAccepted: { type: Boolean, required: true },
    shortlistingDetails: {
      shortlistType: { type: String, default: null },
      shortlistedOn: { type: Date, default: null },
      shortlistReason: { type: String, default: "" },
      shortlistNotes: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

/* ===============================
   PREVENT DUPLICATE APPLY
=============================== */


export default mongoose.model("Application", ApplicationSchema);
