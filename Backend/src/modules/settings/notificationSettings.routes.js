import express from "express";
import createNotificationSettings from "./createNotificationSetting.js";
import getNotification from "./getNotification.js";
import updateNotification from "./updateNotification.js";
import deleteNotification from "./deleteNotification.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

const router = express.Router();

router.post("/create/:userId", protect, allAccess, createNotificationSettings);
router.get("/:userId", protect, allAccess, getNotification);
router.put("/:userId", protect, allAccess, updateNotification);
router.delete("/:userId", protect, allAccess, deleteNotification);

export default router;

