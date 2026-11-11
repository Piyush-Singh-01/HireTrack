import mongoose from "mongoose";
import MeetingSettings from "./settings.model.js";

const getAllMeetings = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;
    const userId = req.user?.id;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }

    const { id } = req.query;

    //  single meeting
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }

      const meeting = await MeetingSettings.findOne({
        _id: id,
        companyCode,
        userId,
      }).lean();

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Meeting not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: meeting,
      });
    }

    //Get all 
    const meeting = await MeetingSettings.findOne({
      companyCode,
      userId,
    }).lean();

    return res.status(200).json({
      success: true,
      data: {
        meetingSettings: meeting || null,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default getAllMeetings;
