import Application from "../applications/applicantSchema.js";
import InterviewSchedule from "../interviews/interview.model.js";
import Job from "../jobs/job.model.js";
import mongoose from "mongoose";

// POST /onhold/:jobId
export const postOnHoldStatusByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { candidateId, scheduleId, reason = "" } = req.body;

    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        error: "Company context missing",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid jobId format",
      });
    }

    if (!candidateId && !scheduleId) {
      return res.status(400).json({
        success: false,
        error: "Either candidateId or scheduleId is required",
      });
    }

    // ✅ Tenant-safe job lookup
    const job = await Job.findOne({
      _id: jobId,
      companyCode,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    let responseData = {
      jobDetails: {
        jobId: job._id,
        jobTitle: job.jobTitle,
        department: job.department,
      },
    };

    /**
     * ===============================
     * UPDATE INTERVIEW SCHEDULE
     * ===============================
     */
    if (scheduleId) {
      if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid scheduleId format",
        });
      }

      // ✅ Tenant-safe schedule lookup
      const schedule = await InterviewSchedule.findOne({
        _id: scheduleId,
        jobId,
        companyCode,
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: "Interview schedule not found",
        });
      }

      const previousStatus = schedule.status;

      schedule.status = "OnHold";
      schedule.onHoldReason = reason;

      await schedule.save();

      responseData.scheduleUpdate = {
        scheduleId: schedule._id,
        previousStatus,
        newStatus: "OnHold",
        interviewDate: schedule.interviewDate,
        interviewTime: schedule.interviewTime,
        reason,
      };
    }

    /**
     * ===============================
     * UPDATE APPLICATION (CANDIDATE)
     * ===============================
     */
    if (candidateId) {
      if (!mongoose.Types.ObjectId.isValid(candidateId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid candidateId format",
        });
      }

      // ✅ Tenant-safe candidate lookup
      const candidate = await Application.findOne({
        _id: candidateId,
        jobId,
        companyCode,
      });

      if (!candidate) {
        return res.status(404).json({
          success: false,
          error: "Candidate not found for this job",
        });
      }

      const previousStatus = candidate.profileStatus;

      candidate.profileStatus = "OnHold";
      candidate.onHoldReason = reason;

      await candidate.save();

      responseData.candidateUpdate = {
        candidateId: candidate._id,
        name: `${candidate.answers.firstName} ${candidate.answers.lastName}`,
        email: candidate.answers.email,
        previousStatus,
        newStatus: "OnHold",
        reason,
      };
    }

    return res.status(200).json({
      success: true,
      message: "Status updated to OnHold successfully",
      data: responseData,
    });
  } catch (err) {
    console.error("OnHold Status Error:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export default postOnHoldStatusByJob;
