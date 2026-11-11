import mongoose from "mongoose";
import Application from "./applicantSchema.js";
import InterviewSchedule from "../interviews/interview.model.js";

const getCandidatesByJobAndStatus = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const { jobId } = req.params;
    let { status, page = 1, limit = 1000 } = req.query;

    /* ---------- VALIDATION ---------- */

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId format",
      });
    }

    const jobObjectId = new mongoose.Types.ObjectId(jobId);

    page = Math.max(parseInt(page), 1);
    limit = Math.min(Math.max(parseInt(limit), 1), 1000);
    const skip = (page - 1) * limit;

    /* ---------- APPLICATION FILTER ---------- */

    const filter = {
      jobId: jobObjectId,
      companyCode,
    };

    if (status) {
      filter.profileStatus = status;
    }

    /* ---------- FETCH APPLICATIONS ---------- */

    const applications = await Application.find(filter)
      .populate("candidateId", "name email mobile")
      .populate("jobId", "jobTitle department hiringManager")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCandidates = await Application.countDocuments(filter);

    if (!applications.length) {
      return res.status(200).json({
        success: true,
        message: "No candidates found",
        data: {
          candidates: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalCandidates: 0,
          },
        },
      });
    }

    /* ---------- GET APPLICATION IDS ---------- */

    const applicationIds = applications.map((app) => app._id);

    /* ---------- FETCH INTERVIEW SCHEDULES ---------- */

    const schedules = await InterviewSchedule.find({
      jobId: jobObjectId,
      companyCode,
      candidateIds: { $in: applicationIds }, // ✅ correct field
    })
      .sort({ updatedAt: -1 })
      .lean();

    /* ---------- CREATE FAST LOOKUP MAP ---------- */

    const scheduleMap = new Map();

    for (const sched of schedules) {
      if (Array.isArray(sched.candidateIds)) {
        for (const candidateId of sched.candidateIds) {
          const key = String(candidateId);

          if (!scheduleMap.has(key)) {
            scheduleMap.set(key, sched);
          }
        }
      }
    }

    /* ---------- BUILD RESPONSE ---------- */

    const candidates = applications.map((app) => {
      const schedule = scheduleMap.get(String(app._id)) || null;

      return {
        applicationId: app._id,
        createdAt: app.createdAt,

        candidateId: app.candidateId?._id || null,

        name:
          `${app.answers?.firstName || ""} ${app.answers?.middleName || ""} ${app.answers?.lastName || ""}`.replace(/\s+/g, ' ').trim() ||
          app.answers?.full_name ||
          app.candidateId?.name ||
          app.answers?.name ||
          "Unknown",

        email: app.candidateId?.email || app.answers?.email || null,

        contactNumber:
          app.candidateId?.mobile || app.answers?.contactNumber || null,

        profileStatus: app.profileStatus,
        lastUpdated: app.updatedAt,

        candidateRating: app.candidateRating ?? null,
        candidateFeedback: app.candidateFeedback ?? null,

        experienceLevel:
          app.answers?.experience ?? app.answers?.experienceLevel ?? null,

        skills: Array.isArray(app.answers?.skills)
          ? app.answers.skills
          : typeof app.answers?.skills === "string"
          ? app.answers.skills.split(/\s*,\s*/)
          : [],

        jobDetails: app.jobId || null,

        interviewSchedule: schedule
          ? {
              scheduleId: schedule._id,
              scheduleType: schedule.scheduleType,
              interviewDate: schedule.interviewDate,
              interviewTime: schedule.interviewTime,
              recruiterName: schedule.recruiterName,
              meetingMode: schedule.meetingMode,
              duration: schedule.durationMinutes,
              status: schedule.status,
              meetingLink: (schedule.meetingLink && !schedule.meetingLink.includes("placeholder")) ? schedule.meetingLink : (schedule.meetingMode === "Online" || !schedule.meetingMode ? "https://meet.google.com/new" : null),
              rescheduled: schedule.rescheduled ?? false,
              updatedAt: schedule.updatedAt,
            }
          : null,
      };
    });

    /* ---------- FINAL RESPONSE ---------- */

    res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data: {
        candidates,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCandidates / limit),
          totalCandidates,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching candidates",
    });
  }
};

export default getCandidatesByJobAndStatus;
