// import Application from "../../modules/applications/applicantSchema.js";

// export const calculateAverageTimeToHire = async (companyCode) => {
//   if (!companyCode) {
//     throw new Error("companyCode is required");
//   }

//   const applications = await Application.find({
//     profileStatus: "hired",
//     companyCode,
//   })
//     .populate("jobId", "publishedAt")
//     .lean();

//   if (!applications.length) {
//     return {
//       averageTimeToHire: 0,
//       formatted: "0 days",
//     };
//   }

//   let totalDays = 0;
//   let validRecords = 0;

//   for (const doc of applications) {
//     const hiredOn = doc?.hiringDetails?.hiredOn;
//     const publishedAt = doc?.jobId?.publishedAt;

//     if (!hiredOn || !publishedAt) continue;

//     const diffMs = new Date(hiredOn) - new Date(publishedAt);
//     const diffDays = diffMs / (1000 * 60 * 60 * 24);

//     if (diffDays >= 0) {
//       totalDays += diffDays;
//       validRecords++;
//     }
//   }

//   const avg = validRecords
//     ? Math.trunc(totalDays / validRecords)
//     : 0;

//   return {
//     averageTimeToHire: avg,       // numeric (useful for charts)
//     formatted: `${avg} days`,     // ready for UI
//   };
// };

// //  Reusable Date Range Utility
// export const getLastAndPrev30Days = () => {
//   const now = new Date();

//   const last30End = new Date(now);
//   last30End.setHours(23, 59, 59, 999);

//   const last30Start = new Date(now);
//   last30Start.setDate(last30Start.getDate() - 30);
//   last30Start.setHours(0, 0, 0, 0);

//   const prev30End = new Date(last30Start);
//   prev30End.setMilliseconds(-1); // ✅ FIX: avoid overlap

//   const prev30Start = new Date(last30Start);
//   prev30Start.setDate(prev30Start.getDate() - 30);
//   prev30Start.setHours(0, 0, 0, 0);

//   return { last30Start, last30End, prev30Start, prev30End };
// };



// //  Generic Count Function (Reusable Everywhere)
// export const getStatusCounts = async ({ companyCode, startDate, endDate }) => {
//   const baseFilter = {
//     companyCode,
//     createdAt: { $gte: startDate, $lte: endDate }
//   };

//   const [applied, selected, hired] = await Promise.all([
//     Application.countDocuments({ ...baseFilter }),
//     Application.countDocuments({ ...baseFilter, profileStatus: "shortlisted" }),
//     Application.countDocuments({ ...baseFilter, profileStatus: "hired" }),
//   ]);
// console.log(applied, selected, hired);

//   return { applied, selected, hired };
// };

// // Conversion Calculator (Reusable)
// export const calculateConversionRate = ({ applied, hired }) => {
//   if (!applied) return 0;
//   return (hired / applied) * 100;
// };



// //  Full Analytics Builder (Reusable Anywhere)
// export const buildInterviewAnalytics = async (companyCode) => {
//   const { last30Start, last30End, prev30Start, prev30End } = getLastAndPrev30Days();

//   // Current
//   const currentStats = await getStatusCounts({
//     companyCode,
//     startDate: last30Start,
//     endDate: last30End
//   });

//   // Previous
//   const prevStats = await getStatusCounts({
//     companyCode,
//     startDate: prev30Start,
//     endDate: prev30End
//   });

//   // Conversion Rates
//   const currentConversion = calculateConversionRate(currentStats);
//   const prevConversion = calculateConversionRate(prevStats);

//   // Change
//   const change = currentConversion - prevConversion;

//   return {
//     applied: currentStats.selected,
//     selected: currentStats.selected,
//     hired: currentStats.hired,
//     conversionRate: currentConversion.toFixed(2) + "%",
//     last30Days: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
//   };
// };

// utils/dashboardUtils.js

import Application from "../../modules/applications/applicantSchema.js";

export const getCompanyCode = (req) =>
  req.user?.companyCode;

export const getTodayString = () =>
  new Date().toISOString().split("T")[0];

export const getLast28DaysDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 28);
  return date;
};

export const getMonthRange = () => {
  const now = new Date();

  return {
    start: new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ),
    end: new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    ),
  };
};

export const getWeekRange = () => {
  const now = new Date();

  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const calculateAverageTimeToHire =
  async (companyCode, jobIds) => {
    const query = {
      companyCode,
      profileStatus: "hired",
    };
    if (jobIds && jobIds.length > 0) {
      query.jobId = { $in: jobIds };
    }
    const docs = await Application.find(query).populate("jobId");

    if (!docs.length) return 0;

    let total = 0;
    let valid = 0;

    docs.forEach((doc) => {
      const hiredOn =
        doc?.hiringDetails?.hiredOn;
      const publishedAt =
        doc?.jobId?.publishedAt;

      if (!hiredOn || !publishedAt) return;

      const diff =
        (new Date(hiredOn) -
          new Date(publishedAt)) /
        (1000 * 60 * 60 * 24);

      if (diff >= 0) {
        total += diff;
        valid++;
      }
    });

    return valid
      ? Math.trunc(total / valid)
      : 0;
  };

export const buildInterviewRates =
  async (companyCode, jobs, selectedRole) => {
    if (!jobs.length) {
      return {
        total: 0,
        roles: ["All"],
        chartData: [],
      };
    }

    const allRoles = ["All", ...jobs.map((job) => job.jobTitle)];

    let filteredJobIds = jobs.map(
      (job) => job._id
    );

    // If a specific role is selected, filter jobIds
    if (
      selectedRole &&
      selectedRole !== "All Positions" &&
      selectedRole !== "All"
    ) {
      const targetJob = jobs.find(
        (j) => j.jobTitle === selectedRole
      );
      if (targetJob) {
        filteredJobIds = [targetJob._id];
      }
    }

    const stats =
      await Application.aggregate([
        {
          $match: {
            companyCode,
            jobId: {
              $in: filteredJobIds,
            },
          },
        },
        {
          $group: {
            _id: "$profileStatus",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const map = {
      applied: 0,
      shortlisted: 0,
      rejected: 0,
      interview: 0,
      hired: 0,
    };

    let total = 0;

    stats.forEach((item) => {
      const status =
        item._id?.toLowerCase();

      if (status === "applied")
        map.applied += item.count;

      else if (
        status === "shortlisted"
      )
        map.shortlisted += item.count;

      else if (
        status === "rejected"
      )
        map.rejected += item.count;

      else if (status === "hired")
        map.hired += item.count;

      else if (
        status === "interview" ||
        status === "rescheduled"
      )
        map.interview += item.count;

      total += item.count;
    });

    const percent = (count) =>
      total
        ? Number(
            (
              (count / total) *
              100
            ).toFixed(1)
          )
        : 0;

    return {
      total,
      roles: allRoles,
      chartData: [
        {
          label:
            "Application received",
          count: map.applied,
          percentage: percent(
            map.applied
          ),
        },
        {
          label: "CVs Selected",
          count: map.shortlisted,
          percentage: percent(
            map.shortlisted
          ),
        },
        {
          label: "Rejected",
          count: map.rejected,
          percentage: percent(
            map.rejected
          ),
        },
        {
          label: "Interviews",
          count: map.interview,
          percentage: percent(
            map.interview
          ),
        },
        {
          label: "Hired",
          count: map.hired,
          percentage: percent(
            map.hired
          ),
        },
      ],
    };
  };

// ======== FOR POSITIONS PAGE ==============
export const getCurrentMonthRange = () => {
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const monthLabel =
    now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  return {
    startOfMonth,
    endOfMonth,
    monthLabel,
  };
};

