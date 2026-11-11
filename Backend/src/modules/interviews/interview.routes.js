import express from 'express';
import startInterview from './startInterview.js';
import endInterview from './endInterview.js';
import getInterviewStatus from './getInterviewStatus.js';
import getAllInterviews from './getAllInterviews.js';
import getMeetingLink from './getMeetingLink.js';
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

const router = express.Router();

// POST /api/interview/start - Start an interview for a candidate
router.post('/interview/start',protect, allAccess, startInterview);

// POST /api/interview/end - End an ongoing interview
router.post('/interview/end',protect, allAccess, endInterview);

// GET /api/interview/status/:applicantId - Get interview status for a specific candidate
router.get('/interview/status/:applicantId',protect, allAccess, getInterviewStatus);

// GET /api/interview/all - Get all interviews with filtering
router.get('/interview/all',protect, allAccess, getAllInterviews);

// GET /api/interview/meeting-link - Get meeting link by applicantId or scheduleId
router.get('/interview/meeting-link',protect, allAccess, getMeetingLink);

export default router;

