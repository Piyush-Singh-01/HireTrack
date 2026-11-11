import express from "express";
import {
 getJobCandidatesAndSchedules,
  postInterviewSchedule,
  postOnHoldStatus,
  postOnReschedule,
} from "../controller/scheduleController/scheduleController.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

const router = express.Router();
router.get("/all",protect, allAccess, getJobCandidatesAndSchedules); // Helper endpoint to list all candidates
router.post("/interview/schedule",protect, allAccess, postInterviewSchedule);
router.post("/onhold",protect, allAccess, postOnHoldStatus);
router.post("/onreschedule",protect, allAccess, postOnReschedule);

export default router;

