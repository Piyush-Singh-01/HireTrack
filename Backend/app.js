import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import connectDb from "./src/config/dbConfig.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// --- Modular Routes ---
import applicationRoutes from "./src/modules/applications/application.routes.js";
import jobRoutes from "./src/modules/jobs/job.routes.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import profileRoutes from "./src/modules/settings/profile.routes.js";
import meetingSettingsRoutes from "./src/modules/settings/settings.routes.js";
import privacySecurityRoutes from "./src/modules/settings/privacySecurity.routes.js";
import interviewRoutes from "./src/modules/interviews/interview.routes.js";
import scheduleRoutes from "./src/modules/schedules/schedule.routes.js";
import notificationRoutes from "./src/modules/notifications/notification.routes.js";
import notificationSettingsRoutes from "./src/modules/settings/notificationSettings.routes.js";
import positionPageRoutes from "./src/modules/applications/position.routes.js";
import meetingCalendarRoutes from "./src/modules/settings/meetingCalendar.routes.js";
import employeeCalendarRoutes from "./src/modules/google-calendar/employeeCalendar.routes.js";
import userRoutes from "./src/modules/users/user.routes.js";
import formRoutes from "./src/modules/forms/form.routes.js";
import screeningRoutes from "./src/modules/screening/screening.routes.js";
import uploadRoutes from "./src/modules/common/upload.routes.js";
import googleCalendarRoutes from "./src/modules/google-calendar/googleCalendar.routes.js";
import dashboardRoutes from "./src/modules/dashboards/dashboard.routes.js";
import offerLetterRoutes from "./src/modules/common/offerLetter.routes.js";
import resumeAnalysisRoutes from "./src/modules/resume-analysis/routes/resumeAnalysis.routes.js";
import dns from "dns";
dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
dns.setServers(["8.8.8.8"]);
const rawAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  "https://techjose-talentos.techjose.com",
];

const allowedOrigins = rawAllowedOrigins
  .filter(Boolean)
  .map((origin) => origin.replace(/\/+$/, ""));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (
        allowedOrigins.includes(cleanOrigin) ||
        process.env.NODE_ENV !== "production" ||
        cleanOrigin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked this origin: ${origin}`));
    },
    credentials: true,
  })
);
app.set("trust proxy", 1);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again after an hour",
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
// app.use("/api", limiter);

// --- API Mounting ---
app.use("/api/notifications/v1", notificationRoutes);
app.use("/api/users/v1", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/meetings", meetingSettingsRoutes);
app.use("/api/privacy-security", privacySecurityRoutes);
app.use("/api/candidateinterview", interviewRoutes);
app.use("/api/positions", positionPageRoutes);
app.use("/api/dayselector", scheduleRoutes);
app.use("/api/todayschedule", scheduleRoutes);
app.use("/api/notificationsettings", notificationSettingsRoutes);
app.use("/api", employeeCalendarRoutes);
app.use("/api/userandrole", userRoutes);
app.use("/api/forms/v1", formRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/screening", screeningRoutes);
// app.use("/api/admin", googleCalendarRoutes);
app.use("/api/calendar", googleCalendarRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/offer-letter-template", offerLetterRoutes);

// Generic Interview routes
app.use("/api", interviewRoutes);
app.use("/api", meetingCalendarRoutes);


//ATS resume analyze
app.use('/api/resume-analysis', resumeAnalysisRoutes);


// Reset password redirect
app.get("/resetPasswordForm", (req, res) => {
  const clientBaseUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/+$/, "");
  const query = req.originalUrl.split("?")[1];
  const redirectUrl = `${clientBaseUrl}/resetPasswordForm${query ? `?${query}` : ""}`;
  return res.redirect(302, redirectUrl);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status ?? 500).json({
    error: err.message ?? "Internal server error",
  });
});

async function startServer() {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
}

startServer();