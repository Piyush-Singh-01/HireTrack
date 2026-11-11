import express from "express";

import getNotifications from "./getAll.js";
import toggleFavourite from "./markfavourite.js";
import updateAllNotifications from "./updateall.js";
import updateSingleNotification from "./updatesingle.js";
import { deleteApplicantNotification, deleteReminderNotification } from "./deleteNotification.js";
import { createApplicantNotification } from "../../common/utils/notifications.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";


const router = express.Router();

router.post("/create", protect, allAccess, createApplicantNotification);
router.get("/get", protect, allAccess, getNotifications);
router.put("/updateone/:id", protect, allAccess, updateSingleNotification);
router.put("/updatmany", protect, allAccess, updateAllNotifications);
router.put("/updatefavourite/:id", protect, allAccess, toggleFavourite);
router.delete("/delete-applicant-notification/:id", protect, allAccess, deleteApplicantNotification);
router.delete("/deletereminder/:id", protect, allAccess, deleteReminderNotification);

export default router;
