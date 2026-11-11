import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // -------------------------------
    // Basic User Info
    // -------------------------------
    userName: { type: String, required: true },
    businessEmail: { type: String, required: true },
    organizationName: { type: String },

    role: {
      type: String,
      required: true,
      default: "SuperAdmin",
    },

    contactNumber: { type: String, required: true },
    password: { type: String, required: true },

    department: { type: String },
    noOfEmployees: { type: String },

    // -------------------------------
    // Tenant Isolation
    // -------------------------------
    companyCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    // -------------------------------
    // Account Status
    // -------------------------------
    isVerified: { type: Boolean, default: false },
    lastActivity: { type: Date, default: Date.now },

    profilePhoto: { type: String },
    companyLogo: { type: String },

    // -------------------------------
    // Cloudinary (Optional)
    // -------------------------------
    cloudinary: {
      cloudName: String,
      apiKey: String,
      apiSecret: String,
    },

    // -------------------------------
    // Subscription
    // -------------------------------
    subscription: {
      plan: {
        type: String,
        enum: ["yearly", "quarterly", "half-yearly", "trial"],
        default: "trial",
      },
      isSubscribed: { type: Boolean, default: true },
      isRestricted: { type: Boolean, default: false },
      startDate: { type: Date },
      endDate: { type: Date },
      trialUsed: { type: Boolean, default: false },
    },

    // -------------------------------
    // Email Configuration
    // -------------------------------
    emailConfig: {
      provider: {
        type: String,
        default: "hostinger",
      },

      authEmail: { type: String },
      authPassword: { type: String }, // ⚠️ encrypt later

      smtpHost: { type: String },
      smtpPort: { type: Number },
      smtpSecure: { type: Boolean, default: false },
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

    // -------------------------------
    // 2FA
    // -------------------------------
    is2FAEnabled: { type: Boolean, default: false },
    is2FAVerified: { type: Boolean, default: false },
    twoFACode: { type: String },
    twoFACodeExpiry: { type: Date },

    // -------------------------------
    // Password Reset
    // -------------------------------
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true },
);

// Prevent duplicate users per tenant

export default mongoose.model("User", userSchema);
