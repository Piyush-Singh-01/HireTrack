import candidateDetails from "./schedule.model.js";

function formatTimeRange(startTime) {
  if (!startTime) return null;

  let date = new Date(`1970-01-01T${startTime}`);
  if (isNaN(date.getTime())) {
    date = new Date(`1970-01-01 ${startTime}`);
  }

  const start = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const endDate = new Date(date.getTime() + 60 * 60 * 1000);
  const end = endDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${start} - ${end}`;
}

const getTodaySchedules = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    /* ===== COMPANY CONTEXT CHECK ===== */
    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }

    /* ===== TODAY RANGE ===== */
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    /* ===== TENANT SAFE QUERY ===== */
    const schedules = await candidateDetails.find({
      companyCode, // ✅ CRITICAL TENANT FILTER
      Date: { $gte: todayStart, $lte: todayEnd },
    });

    const formatted = schedules.map((schedule) => ({
      name: schedule.Candidate,
      interviewTime: formatTimeRange(schedule.Time),
      interviewMode: schedule.Mode,
      action: schedule.Mode === "Offline" ? "View" : "Start Interview",
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Today Schedule Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default getTodaySchedules;
