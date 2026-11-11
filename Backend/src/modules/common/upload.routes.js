import express from "express";
import upload from "../../common/middleware/upload.js";
import uploadFile from "./uploadcontroller.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

const router = express.Router();

router.post("/",protect, allAccess, upload.single("file"), uploadFile);

export default router;

