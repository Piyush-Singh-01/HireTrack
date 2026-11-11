import express from "express";
import getTotalPositionsCount from "./getTotalPositionsCount.js";
import getOpenPositions from "./getOpenPositions.js";
import getClosedPositionsCount from "./getClosedPositionsCount.js";
import getApplicationsCount from "./getApplicationsCount.js";
import getHiredThisMonthCount from "./getHiredThisMonthCount.js";
import getAverageTimeToHire from "./getAverageTimeToHire.js";

const router = express.Router();

// Position Analytics Routes
router.get("/total-positions", getTotalPositionsCount);
router.get("/open-positions", getOpenPositions);
router.get("/closed-positions", getClosedPositionsCount);
router.get("/applications-count", getApplicationsCount);
router.get("/hired-this-month", getHiredThisMonthCount);
router.get("/average-time-to-hire", getAverageTimeToHire);

export default router;

