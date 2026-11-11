import express from "express";
import postScheduleByJob from "../schedules/postScheduleByJob.js";
import putRescheduleByJob from "../schedules/putRescheduleByJob.js";
import postOnHoldStatusByJob from "../schedules/postOnHoldStatusByJob.js";
import postGDScheduleByJob from "../schedules/postGDScheduleByJob.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

const router = express.Router();

// ============ SCHEDULE MANAGEMENT ROUTES ============

// Interview Scheduling Operations
router.post("/:jobId/schedule", protect, allAccess, postScheduleByJob);
router.post("/:jobId/gd/schedule", protect, allAccess, postGDScheduleByJob);
router.put("/:jobId/reschedule", protect, allAccess, putRescheduleByJob);
router.post("/:jobId/onhold", protect, allAccess, postOnHoldStatusByJob);

export default router;

