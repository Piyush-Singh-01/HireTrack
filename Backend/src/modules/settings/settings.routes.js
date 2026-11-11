import express from "express";
import addMeeting from "./addMeeting.js";
import updateMeeting from "./updateMeeting.js";
import deleteMeeting from "./deleteMeeting.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";
import  getAllMeetings from "./getAllMeetings.js";

const router = express.Router();
router.post("/",protect, allAccess, addMeeting);
router.put("/update/:id",protect, allAccess, updateMeeting);
router.delete("/delete/:id",protect, allAccess, deleteMeeting);

router.get("/all/meetings", protect, allAccess, getAllMeetings); 

export default router;

