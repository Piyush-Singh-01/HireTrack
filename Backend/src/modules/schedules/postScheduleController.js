import mongoose from "mongoose";
import candidateDetails from "./schedule.model.js";

const postSchedule = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const {
      jobId,
      candidateId,
      Date,
      Time,
      Position,
      Candidate,
      Recruiter,
      Mode,
      Status,
      Reschedule,
    } = req.body;

    /* ================= VALIDATION ================= */

    if (
      !jobId ||
      !candidateId ||
      !Date ||
      !Time ||
      !Position ||
      !Candidate ||
      !Recruiter ||
      !Mode ||
      !Status ||
      Reschedule === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(jobId) ||
      !mongoose.Types.ObjectId.isValid(candidateId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId or candidateId",
      });
    }

    const allowedModes = ["Online", "Offline", "Phone"];
    const allowedStatuses = [
      "Scheduled",
      "Completed",
      "Cancelled",
      "Rescheduled",
    ];

    if (!allowedModes.includes(Mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview mode",
      });
    }

    if (!allowedStatuses.includes(Status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule status",
      });
    }

    /* ================= NORMALIZATION ================= */

    const normalizedPosition = String(Position).trim();
    const normalizedDate = String(Date).trim();
    const normalizedTime = String(Time).trim();

    /* ================= DUPLICATE CHECK ================= */

    const existingSchedule = await candidateDetails.findOne({
      jobId,
      candidateId,
      companyCode, // ✅ tenant-safe
      Date: normalizedDate,
      Time: normalizedTime,
    });

    if (existingSchedule) {
      return res.status(409).json({
        success: false,
        message: "Candidate already has an interview at this time.",
      });
    }

    /* ================= CREATE ================= */

    const newSchedule = await candidateDetails.create({
      jobId,
      candidateId,
      companyCode, // ✅ tenant-safe
      Date: normalizedDate,
      Time: normalizedTime,
      Position: normalizedPosition,
      Candidate,
      Recruiter,
      Mode,
      Status,
      Reschedule,
    });

    /* ================= RESPONSE ================= */

    res.status(201).json({
      success: true,
      message: "Schedule added successfully",
      data: newSchedule,
    });
  } catch (error) {
    console.error("Error saving schedule:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default postSchedule;
