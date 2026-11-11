import express from "express";
import getAllJobs from "../jobs/getAllJobs.js";
import getAllOpeningPositionJobs from "../jobs/getAllOpeningPositionJobs.js";
import getAllClosedPositionJobs from "../jobs/getAllClosedPositionJobs.js";

const router = express.Router();

// Jobs Routes
router.get("/all", getAllJobs);
router.get("/open", getAllOpeningPositionJobs);
router.get("/closed", getAllClosedPositionJobs);

export default router;

