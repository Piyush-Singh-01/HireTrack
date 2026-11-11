import express from "express";
import { analyzeResume, getResumeAnalysis,} from "../controllers/resumeAnalysis.controller.js";
import protect from "../../../common/middleware/auth.js";

const router = express.Router();

router.post("/:applicationId/analyze",protect,analyzeResume);

router.get("/:applicationId",protect,getResumeAnalysis);

export default router;