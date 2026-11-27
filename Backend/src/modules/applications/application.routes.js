import express from "express";
import upload from "../../common/middleware/upload.js";

import createApplication from "./createApp.js";            
import deleteApplication from "./deleteApp.js";
import { uploadPdf } from "./cloudconfig.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";
import getAllApplications from "./getAllapp.js";
import getApplicationResume from "./getApplicationResume.js";

const router = express.Router();



//  Application Handling
router.post("/",createApplication);       
router.delete("/:id",protect, allAccess, deleteApplication);
router.get("/all", protect, allAccess, getAllApplications);
router.get("/:id/resume", protect, allAccess, getApplicationResume);

//  Resume Upload 
router.post("/upload-pdf/:slug",upload.single("file"), uploadPdf);

export default router;


