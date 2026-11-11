import express from "express";
import analyticsRoutes from "./analytics.routes.js";
import getPositionOverview from './positionPageOverview.js'
import getJobs from "./getJobsController.js";
import updateCandidateStatus from "./updateCandidateStatus.js";
import getCandidatesByJobAndStatus from "./getall.js";
import postFeedbackByJob from "./postFeedbackByJob.js";
import getJobCandidatesAndSchedules from "../schedules/getalljob.js";
import jobsRoutes from "./jobs.routes.js";
import jobDescriptionRoutes from "./jobDescription.routes.js";
import scheduleRoutes from "./schedule.routes.js";
import postScheduleByJob from "../schedules/postScheduleByJob.js";
import putRescheduleByJob from "../schedules/putRescheduleByJob.js";
import postGDScheduleByJob from "../schedules/postGDScheduleByJob.js";
import postOnHoldStatusByJob from "../schedules/postOnHoldStatusByJob.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

const router = express.Router();


router.use((req, res, next) => {
  // console.log(`[PositionRouter] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// DIRECT ROUTES (HIGH PRIORITY)
// ==========================================
router.get("/analytics-overview", protect, allAccess, getPositionOverview);
router.get("/jobs", protect, allAccess, getJobs);

// Candidate status & feedback
router.post("/:jobId/status", protect, allAccess, updateCandidateStatus);
router.post("/:jobId/feedback", protect, allAccess, postFeedbackByJob);
// Scheduling
router.post("/:jobId/schedule", protect, allAccess, postScheduleByJob);
router.post("/:jobId/gd/schedule", protect, allAccess, postGDScheduleByJob);
router.post("/:jobId/onhold", protect, allAccess, postOnHoldStatusByJob);
router.put("/:jobId/reschedule", protect, allAccess, putRescheduleByJob);
// Candidate listing
router.get("/:jobId/all", protect, allAccess, getCandidatesByJobAndStatus);

// ==========================================
// SUB-ROUTERS
// ==========================================
// router.use("/analytics", protect, allAccess, analyticsRoutes);
router.use("/job-description", protect, allAccess, jobDescriptionRoutes);
// router.use("/jobs-list", protect, allAccess, jobsRoutes);
router.use("/schedule", protect, allAccess, scheduleRoutes);

// Catch-all for job details
router.get("/:jobId", protect, allAccess, getJobCandidatesAndSchedules);

export default router;


