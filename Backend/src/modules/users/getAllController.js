import UserAndRole from "./userandroleSchema.js";
import candidateDetails from "../schedules/schedule.model.js";
import Job from "../jobs/job.model.js";
import Application from "../applications/applicantSchema.js";
// import Profile from "../settings/profile.model.js";

const getUsersAndRoles = async (req, res) => {
  try {
    const companyCode = req.user.companyCode;
    const { id } = req.query; // 👈 ONLY ONE ENTRY POINT

    // =========================
    // SINGLE USER
    // =========================
    if (id) {
      const user = await UserAndRole.findOne({ _id: id, companyCode });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Schedule for the user
      const scheduleList = await candidateDetails.find({
        companyCode,
        Recruiter: user.Name,
      }).sort({ Date: -1 });

      // Calculate 'today' interviews
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todayInterviews = await candidateDetails.countDocuments({
        companyCode,
        Recruiter: user.Name,
        Date: { $gte: startOfDay, $lte: endOfDay },
      });

      // Calculate 'thisMonth' stats
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const userJobs = await Job.find({
        companyCode,
        $or: [
          { "hiringManager.userId": user._id },
          { "hiringManagers.userId": user._id },
        ],
      });

      const userJobIds = userJobs.map(j => j._id);
      
      const positionsOpen = userJobs.filter(j => j.jobStatus === "Open").length;
      const positionsClosed = userJobs.filter(j => j.jobStatus === "Closed").length;

      const hiredCount = await Application.countDocuments({
        companyCode,
        jobId: { $in: userJobIds },
        profileStatus: { $in: ["hired", "Selected", "Hired"] },
        updatedAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: {
          ...user.toObject(),
          status: {
            today: { interviews: todayInterviews },
            thisMonth: {
              positionsOpen,
              positionsClosed,
              hired: hiredCount,
            }
          },
          schedule: scheduleList,
        },
      });
    }

    // =========================
    // ALL USERS
    // =========================
    const users = await UserAndRole.find({ companyCode }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export default getUsersAndRoles;


