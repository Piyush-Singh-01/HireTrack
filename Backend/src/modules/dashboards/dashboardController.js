// controller/dashboardController.js

import Application from "../applications/applicantSchema.js";
import InterviewSchedule from "../interviews/interview.model.js";
import UserandRole from "../users/userandroleSchema.js";
import Job from "../jobs/job.model.js";

import {
  getCompanyCode,
  getTodayString,
  getWeekRange,
  getMonthRange,
  getLast28DaysDate,
  buildInterviewRates,
  calculateAverageTimeToHire,
} from "../../common/utils/analytics.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const companyCode = getCompanyCode(req);

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }

    const today = getTodayString();
    const week = getWeekRange();
    const month = getMonthRange();
    const last28Days = getLast28DaysDate();

    const { position } = req.query;

    const isInterviewer = req.user?.Role === "Interviewer";
    let interviewerJobIds = null;

    if (isInterviewer) {
      const myJobs = await Job.find({
        companyCode,
        "hiringManager.userId": req.user.id,
      }).select("_id");
      interviewerJobIds = myJobs.map((job) => job._id);
    }

    const [
      upcomingInterviews,
      completedInterviews,
      todayInterviewSchedule,

      monthCandidates,
      weekCandidates,

      inProcess,
      shortlisted,
      rejected,
      hired,
      weekHired,

      employees,

      monthlyHiredByRole,

      conversionApplied,
      conversionHired,

      jobs,
    ] = await Promise.all([
      // Upcoming Interviews
      Application.find({
        companyCode,
        profileStatus: {
       // $in: [/^interview$/i, /^rescheduled$/i],
          $in: ["interview", "Interview", "Rescheduled", "rescheduled"],
        },
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }).populate("jobId"),

      // Completed Interviews
      Application.find({
        companyCode,
        profileStatus: {
       // $in: [/^hired$/i, /^rejected$/i, /^onhold$/i],
          $in: ["hired", "rejected", "Rejected", "onhold"],
        },
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }).populate("jobId"),

      // Today Schedule
      InterviewSchedule.find({
        companyCode,
        interviewDate: today,
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }),

      // Month Candidates
      Application.countDocuments({
        companyCode,
        createdAt: {
          $gte: month.start,
          $lte: month.end,
        },
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }),

      // Week Candidates
      Application.countDocuments({
        companyCode,
        createdAt: {
          $gte: week.start,
          $lte: week.end,
        },
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }),

      // In Process
      Application.countDocuments({
        companyCode,
        profileStatus: {
          //           $in: [
          //   /^applied$/i,
          //   /^rescheduled$/i,
          //   /^onhold$/i,
          //   /^interview$/i,
          // ],
          $in: ["applied", "Applied", "Rescheduled", "rescheduled", "onhold", "interview", "Interview"],
        },
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }),

      // Shortlisted
      Application.countDocuments({
        companyCode,
        // profileStatus: /^shortlisted$/i,
        profileStatus: { $in: ["shortlisted", "Shortlisted", "Selected"] },
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }),

      // Rejected
      Application.countDocuments({
        companyCode,
        // profileStatus: /^rejected$/i,
        profileStatus: { $in: ["rejected", "Rejected"] },
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }),

      // Hired
      Application.countDocuments({
        companyCode,
        // profileStatus: /^hired$/i,
        profileStatus: "hired",
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }),

      // Week Hired
      Application.countDocuments({
        companyCode,
        // profileStatus: /^hired$/i,
        profileStatus: "hired",
        updatedAt: {
          $gte: week.start,
          $lte: week.end,
        },
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }),

      // Employees / Managers
      isInterviewer
        ? Promise.resolve(1)
        : UserandRole.countDocuments({
            companyCode,
          }),

      // Monthly Hired By Role
      Application.aggregate([
        {
          $match: {
            companyCode,
            profileStatus: "hired",
            updatedAt: { $gte: last28Days },
            ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
          },
        },
        {
          $lookup: {
            from: "jobs",
            localField: "jobId",
            foreignField: "_id",
            as: "job",
          },
        },
        { $unwind: "$job" },
        {
          $group: {
            _id: "$job.jobTitle",
            count: { $sum: 1 },
          },
        },
      ]),

      // Conversion Applied
      Application.countDocuments({
        companyCode,
        createdAt: {
          $gte: month.start,
          $lte: month.end,
        },
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }),

      // Conversion Hired
      Application.countDocuments({
        companyCode,
        profileStatus: "hired",
        createdAt: {
          $gte: month.start,
          $lte: month.end,
        },
        ...(isInterviewer ? { jobId: { $in: interviewerJobIds } } : {}),
      }),

      // Jobs for Interview Funnel
      Job.find({
        companyCode,
        ...(isInterviewer ? { _id: { $in: interviewerJobIds } } : {}),
      }).select("_id jobTitle"),
    ]);

    const averageTimeToHire =
      await calculateAverageTimeToHire(companyCode, interviewerJobIds);

    const conversionRate = conversionApplied
      ? Number(
          (
            (conversionHired / conversionApplied) *
            100
          ).toFixed(2)
        )
      : 0;

    const interviewRate = await buildInterviewRates(
      companyCode,
      jobs,
      position
    );

    const monthlyRoles = {};
    monthlyHiredByRole.forEach((item) => {
      monthlyRoles[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,

      summary: {
        totalCandidatesCurrentMonth: monthCandidates,
        totalCandidatesCurrentWeek: weekCandidates,
        inProcess,
        shortlisted,
        rejected,
        hired,
        currentWeekHired: weekHired,
        totalEmployees: employees,
      },

      interviews: {
        upcoming: upcomingInterviews,
        completed: completedInterviews,
        today: todayInterviewSchedule,
      },

      charts: {
        monthlyHired: {
          roles: monthlyRoles,
          totalRoles: monthlyHiredByRole.length,
        },

        conversionRate: {
          applied: conversionApplied,
          hired: conversionHired,
          percentage: conversionRate,
        },

        interviewRate,
      },

      metrics: {
        averageTimeToHire,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
