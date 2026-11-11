import express from "express";
import createScreening from "./createscreening.js";
import getScreeningById from "./getScreeningById.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

const router = express.Router();

router.post("/",protect, allAccess, createScreening);
router.get("/:id", getScreeningById);

export default router;

