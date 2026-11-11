import mongoose from "mongoose";
import Notification from "../dashboards/dashboardNotification.model.js";

const deleteNotificationByType = async (req, res, type) => {
  try {
    const { id } = req.params;
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({ success: false, message: "Company context missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid notification id" });
    }

    const deleted = await Notification.findOneAndDelete({
      _id: id,
      companyCode,
      type,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, message: "Notification deleted successfully", data: deleted });
  } catch (err) {
    console.error("Delete Notification Error:", err);
    return res.status(500).json({ success: false, message: "Error deleting notification" });
  }
};

export const deleteApplicantNotification = async (req, res) => deleteNotificationByType(req, res, "applicant");
export const deleteReminderNotification = async (req, res) => deleteNotificationByType(req, res, "reminder");
