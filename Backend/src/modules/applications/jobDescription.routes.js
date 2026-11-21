import express from "express";
import getJobDescriptionById from "./getJobDescriptionById.js";

const router = express.Router();


router.get("/:jobId", getJobDescriptionById);

export default router;

