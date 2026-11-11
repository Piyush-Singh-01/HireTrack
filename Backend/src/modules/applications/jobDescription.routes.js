import express from "express";
import getJobDescriptionById from "./getJobDescriptionById.js";

const router = express.Router();

// ============ GET ROUTES - Job Description Operations ============

/**
 * @route GET /:jobId
 * @desc Get complete job description by job ID
 * @access Public
 * @param {string} jobId - MongoDB ObjectId of the job
 * @returns {Object} Complete job description with all details
 */
router.get("/:jobId", getJobDescriptionById);

export default router;

