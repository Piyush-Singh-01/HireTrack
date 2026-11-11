import mongoose from "mongoose";

const userandroleSchema = new mongoose.Schema(
  {
    // -------------------------------
    // Existing Fields (UNCHANGED)
    // -------------------------------
    Name: {
      type: String,
      required: true,
      trim: true,
    },

    Position: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String
    },


    Email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // ❌ removed unique:true (SaaS fix)
    },

    password: {
      type: String,
      required: true,
      // select: false, // 🔒 hide password
    },

    companyCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    Role: {
      type: String,
      enum: ["Admin", "HR", "Interviewer"],
      required: true,
    },

    ContactNumber: {
      type: String,
      required: true,
    },

    accountStatus: {
      type: String,
      enum: ["Active", "Disabled"],
      default: "Active",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // -------------------------------
    // NEW FIELDS (SAFE ADDITIONS)
    // -------------------------------

    // 🔗 Link to Admin (important for SaaS ownership)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 🔐 Fine-grained access control
    permissions: [
      {
        type: String,
      },
    ],

    // 📊 Activity tracking
    lastLogin: {
      type: Date,
    },

    lastActivity: {
      type: Date,
      default: Date.now,
    },

    // -------------------------------
    // Google Calendar Integration
    // -------------------------------
    googleCalendar: {
      isConnected: { type: Boolean, default: false },

      googleEmail: { type: String },

      googleUser: {
        googleId: { type: String, index: true },
        email: { type: String },
        name: { type: String },
        picture: { type: String },
      },

      accessToken: { type: String },
      refreshToken: { type: String },
      scope: { type: String },

      tokenExpiry: { type: Date },
      tokenIssuedAt: { type: Date },

      calendarId: { type: String, default: "primary" },

      syncEnabled: { type: Boolean, default: true },
      lastSyncTime: { type: Date },
    },
  },
  { timestamps: true }
);

// ✅ Correct SaaS uniqueness (per company)

const UserAndRole = mongoose.model("UserAndRole", userandroleSchema);
export default UserAndRole;
