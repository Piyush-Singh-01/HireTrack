import mongoose from "mongoose";
import notifications from "../dashboards/dashboardNotification.model.js";

const updateSingleNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification id",
      });
    }

    const updated = await notifications.findOneAndUpdate(
      { _id: id, companyCode },
      { isSeen: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as seen",
      data: updated,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating notification",
    });
  }
};

export default updateSingleNotification;
