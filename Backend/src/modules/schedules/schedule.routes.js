import express from 'express'
import getSchedulePageTasks from './postTodayScheduleController.js';
import postSchedule from "./postScheduleController.js";
import getInterviewSchedules from './getSchedule.js';
import putRescheduleByJob from './putRescheduleByJob.js';
import scheduleSortByController from './scheduleSortByController.js';
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

const route = express.Router();

// Today's schedule tasks
route.get('/postmethod', protect, allAccess, getSchedulePageTasks);

// General schedule management
route.post('/postschedule', protect, allAccess, postSchedule);
route.put("/post-reschedule/:jobId", protect, allAccess, putRescheduleByJob);
route.get('/interview-schedules/:userId', protect, allAccess, getInterviewSchedules);

// Sorting
route.get('/sortBy', protect, allAccess, scheduleSortByController);

export default route;
