import mongoose from "mongoose";
import Screening from "./screening.model.js";
import Job from "../jobs/job.model.js";

const createScreening = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }

    const { jobId, screen, ratingThresholds } = req.body;

    /* ===== VALIDATION ===== */

    if (!jobId || !Array.isArray(screen) || screen.length === 0) {
      return res.status(400).json({
        success: false,
        message: "jobId and screen questions are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId",
      });
    }

    /* ===== TENANT SAFE JOB LOOKUP ===== */

    const job = await Job.findOne({
      _id: jobId,
      companyCode,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    /* ===== PREVENT DUPLICATE SCREENING ===== */

    const existingScreening = await Screening.findOne({
      jobId,
      companyCode,
    });

    if (existingScreening) {
      // UPSERT: Update existing screening instead of throwing 409
      existingScreening.screen = screen;
      if (ratingThresholds) {
        existingScreening.ratingThresholds = ratingThresholds;
      }
      await existingScreening.save();

      // Ensure Job is linked just in case it got detached
      await Job.updateOne(
        { _id: jobId, companyCode },
        { $set: { screeningId: existingScreening._id } }
      );

      return res.status(200).json({
        success: true,
        message: "Screening updated successfully",
        data: existingScreening,
      });
    }

    /* ===== CREATE SCREENING ===== */

    const screening = await Screening.create({
      jobId,
      companyCode,               // ✅ tenant isolation
      screen,
      ratingThresholds: ratingThresholds || undefined,
    });

    /* ===== SAFE JOB UPDATE ===== */

    await Job.updateOne(
      { _id: jobId, companyCode },
      { $set: { screeningId: screening._id } }
    );

    return res.status(201).json({
      success: true,
      message: "Screening created successfully",
      data: screening,
    });
  } catch (err) {
    console.error("Create Screening Error:", err);

    return res.status(500).json({
      success: false,
      message: "Error creating screening",
    });
  }
};

export default createScreening;
