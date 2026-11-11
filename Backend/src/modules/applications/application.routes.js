import express from "express";
import upload from "../../common/middleware/upload.js";

import createApplication from "./createApp.js";            
import deleteApplication from "./deleteApp.js";
import { uploadPdf } from "./cloudconfig.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";
import getAllApplications from "./getAllapp.js"; 

const router = express.Router();

// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // optional
// });

/* ---------- Application Handling ---------- */
router.post("/",createApplication);       
router.delete("/:id",protect, allAccess, deleteApplication);
router.get("/all", protect, allAccess, getAllApplications);    //new      

/* ---------- Resume Upload ---------- */
router.post(
  "/upload-pdf/:slug",upload.single("file"), uploadPdf);

export default router;


