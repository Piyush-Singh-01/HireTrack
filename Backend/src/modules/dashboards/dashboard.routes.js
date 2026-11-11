
import express from "express";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";
import { getDashboardAnalytics } from "./dashboardController.js";

const router = express.Router();

router.get(
  "/summary-schedule-analytics",
  protect,
  allAccess,
  getDashboardAnalytics
);

export default router;
