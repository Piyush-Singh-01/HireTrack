import express from "express";
import createJob from "./createJob.js";
import { getJob, getJobById, getJobBySlug, getJobByCode } from "./getJob.js";
import updateJob from "./updateJob.js";
import deleteJob from "./deleteJob.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";
import getJobsLookup from "./getAllJobs.js";
// Draft Controllers
import saveDraft from "./saveDraft.js";
import getDrafts from "./getDrafts.js";
import getDraftById from "./getDraftById.js";
import updateDraft from "./updateDraft.js";
import deleteDraft from "./deleteDraft.js";
import publishDraft from "./publishDraft.js";

import getDraftJobs from "./getJobsDraft.js";

const router = express.Router();

// Regular Job Routes
router.post("/createJob",protect, allAccess, createJob);
router.get("/slug/:slug", getJobBySlug);
router.put("/updateJob/:id",protect, allAccess, updateJob);
router.delete("/deleteJob/:id",protect, allAccess, deleteJob);

router.get("/job-lookup", protect, allAccess, getJobsLookup);


// Draft Routes
router.post("/saveDraft",protect, allAccess, saveDraft);           // Save new draft        // Get specific draft
router.put("/updateDraft/:id",protect, allAccess, updateDraft);    // Update draft
router.delete("/deleteDraft/:id",protect, allAccess, deleteDraft); // Delete draft
router.post("/publishDraft/:id",protect, allAccess, publishDraft); // Publish draft to job

router.get("/job-drafts", protect, allAccess, getDraftJobs);


export default router;
