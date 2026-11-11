import mongoose from "mongoose";
import MeetingSettings from "./settings.model.js";

const updateMeeting = async (req, res) => {
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
        message: "Invalid ID",
      });
    }

    const existingMeeting = await MeetingSettings.findOne({
      _id: id,
      companyCode,
       userId:user,
    });

    if (!existingMeeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const {
      defaultInterviewDuration,
      meetingPlatform,
      interviewTimings,
      maxInterviewPerDay,
      allowRescheduling,
      calendarIntegration,
      defaultCalendarView,
      autoRecord,
      requireConsent,
    } = req.body;

    if (
      !defaultInterviewDuration ||
      !meetingPlatform ||
      !interviewTimings ||
      !maxInterviewPerDay ||
      allowRescheduling === undefined ||
      !calendarIntegration ||
      !defaultCalendarView ||
      autoRecord === undefined ||
      requireConsent === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const updatedMeeting = await MeetingSettings.findOneAndUpdate(
      { _id: id, companyCode,  userId:user, },
      {
        defaultInterviewDuration,
        meetingPlatform,
        interviewTimings,
        maxInterviewPerDay,
        allowRescheduling,
        calendarIntegration,
        defaultCalendarView,
        autoRecord,
        requireConsent,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Meeting updated successfully",
      data: updatedMeeting,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default updateMeeting;
