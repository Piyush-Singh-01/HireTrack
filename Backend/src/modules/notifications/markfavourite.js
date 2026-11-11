import notifications from "../dashboards/dashboardNotification.model.js";
import mongoose from "mongoose";

const toggleFavourite = async (req, res) => {
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

    // 🔹 Step 1: Find existing notification
    const notification = await notifications.findOne({
      _id: id,
      companyCode,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // 🔹 Step 2: Toggle value
    notification.isFavourite = !notification.isFavourite;

    await notification.save();

    res.status(200).json({
      success: true,
      message: notification.isFavourite
        ? "Marked as favourite"
        : "Unmarked as favourite",
      data: notification,
    });

  } catch (err) {
    console.error("Toggle Favourite Error:", err);

    res.status(500).json({
      success: false,
      message: "Error updating favourite status",
    });
  }
};

export default toggleFavourite;
