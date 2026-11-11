import mongoose from "mongoose";
import notification from "../dashboards/dashboardNotification.model.js";
import "../applications/applicantSchema.js";
import "../interviews/candidateInterview.model.js";
import "../jobs/job.model.js";
import "../interviews/interview.model.js";

const getNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, isFavourite } = req.query;
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }

    // 🔹 Base filter (ONLY company)
    let filter = { companyCode };

    // 🔹 Apply type filter ONLY if given
    if (type && type !== "all") {
      filter.type = type; // reminder | applicant
    }

    // 🔹 Apply favourite filter (independent)
    if (isFavourite === "true") {
      filter.isFavourite = true;
    }

    // -------------------------
    // 🔸 Get Single Notification
    // -------------------------
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid notification id",
        });
      }

      const Notification = await notification.findOne({
        _id: id,
        ...filter,
      })
        .populate({
          path: "applicantId",
          populate: { path: "candidateId", select: "name email mobile" }
        })
        .populate("interviewId")
        .populate("jobId", "jobTitle department")
        .lean();

      if (!Notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification fetched successfully",
        data: Notification,
      });
    }

    // -------------------------
    // 🔸 Get All Notifications
    // -------------------------
    const notifications = await notification.find(filter)
      .populate({
        path: "applicantId",
        populate: { path: "candidateId", select: "name email mobile" }
      })
      .populate("interviewId")
      .populate("jobId", "jobTitle department")
      .sort({ dateTime: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
    });

  } catch (err) {
    console.error("Get Notifications Error:", err);

    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
};

export default getNotifications;
