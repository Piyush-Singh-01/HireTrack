import express from "express";
import getProfile from "./getProfile.js";
import updateProfile from "./updateProfile.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";
import upload from "../../common/middleware/upload.js";

const router = express.Router();

router.get("/get", protect, allAccess, getProfile);
router.put("/update", protect, allAccess, upload.fields([{ name: "profilePhoto", maxCount: 1 }, { name: "companyLogo", maxCount: 1 }]), updateProfile);

export default router;

