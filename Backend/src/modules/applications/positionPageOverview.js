// controller/positionDashboardController.js

import mongoose from "mongoose";
import Job from "../jobs/job.model.js";
import Application from "./applicantSchema.js";

import {
  getCompanyCode,
  getCurrentMonthRange,
  calculateAverageTimeToHire,
} from "../../common/utils/analytics.js";

const getPositionOverview = async (req, res) => {
  try {
    const companyCode = getCompanyCode(req);

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const { jobId, status } = req.query;

    const applicationFilter = { companyCode };

    // Optional job filter validation
    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid jobId",
        });
      }

      applicationFilter.jobId = jobId;
    }

    // Optional profile status filter
    if (status && status !== "All") {
      applicationFilter.profileStatus = status;
    }

    const { startOfMonth, endOfMonth, monthLabel } =
      getCurrentMonthRange();

    const [
      totalPositions,
      openPositions,
      closedPositions,
      totalApplications,
      hiredThisMonth,
      averageHireTime,
    ] = await Promise.all([
      Job.countDocuments({
        companyCode,
        isDraft: false,
      }),

      Job.countDocuments({
        companyCode,
        isDraft: false,
        jobStatus: "Open",
      }),

      Job.countDocuments({
        companyCode,
        isDraft: false,
        jobStatus: "Closed",
      }),

      Application.countDocuments(applicationFilter),

      Application.countDocuments({
        companyCode,
        profileStatus: "hired",
        "hiringDetails.hiredOn": {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      }),

      calculateAverageTimeToHire(companyCode),
    ]);

    return res.status(200).json({
      success: true,

      summary: {
        totalPositions,
        openPositions,
        closedPositions,
        totalApplications,
        hiredThisMonth,
      },

      metrics: {
        averageTimeToHire:
          averageHireTime.formatted,
      },

      filtersApplied: {
        jobId: jobId || null,
        status: status || "All",
      },

      month: monthLabel,
    });
  } catch (error) {
    console.error(
      "Error fetching position dashboard:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export default getPositionOverview
