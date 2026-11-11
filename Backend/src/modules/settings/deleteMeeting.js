import mongoose from "mongoose";
import MeetingSettings from "./settings.model.js";

const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const companyCode = req.user?.companyCode;
    const user = req.user?.id;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Meeting ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID",
      });
    }

    const meeting = await MeetingSettings.findOne({
      _id: id,
      companyCode,
      userId:user,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    await MeetingSettings.deleteOne({
      _id: id,
      companyCode,
      userId:user,
    });

    return res.status(200).json({
      success: true,
      message: "Meeting deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default deleteMeeting;
