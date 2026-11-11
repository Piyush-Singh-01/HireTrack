import Notification from "../../modules/dashboards/dashboardNotification.model.js";
import { validateObjectIds, checkMissingFields } from "./validateRequiredFields.js";
import NotificationSettings from "../../modules/settings/settings.model.js";

export const createApplicantNotification = async (
    {name, jobTitle, applicantId, jobId, userId, companyCode}
) => {
  try {
    const missingFields = checkMissingFields({ name, jobTitle, applicantId, jobId, userId, companyCode,});

    if (missingFields.length) {
      return {
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    // Validate ObjectIds
    let checkIds = validateObjectIds({ applicantId, userId, jobId })
    if(!checkIds.isValid) {
      return {
        message: `Invalid ObjectIds for ${checkIds.invalidFields}`
      }
    }

    // Construct message
    const message = `${name} applied for ${jobTitle}`;

    // Create notification (tenant safe)
    const notification = await Notification.create({
      type: "applicant",
      message,
      applicantId,
      jobId,
      userId,
      companyCode,
      dateTime: new Date(),
    });

    return{
      success: true,
      message: "Applicant Notification created successfully",
      data: notification,
    }
  } catch (err) {
    console.error("Create Applicant Notification Error:", err);
    return{
      success: false,
      message: "Error creating notification",
      error: err
    };
  }
};

const calculateReminderPushTime = (date, time, minutesBefore) => {
  const [hours, minutes] = time.split(":").map(Number);
  const eventTime = new Date(date);
  eventTime.setHours(hours, minutes, 0, 0);
  
  const pushData = minutesBefore.map(t => {
    return {
      minutesBefore: t,
      pushAt: new Date(eventTime.getTime() - t * 60 * 1000)
    }
  })

  return pushData;
}

const formatTo12Hour = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const createScheduleNotification = async (
  { name = null, candidateNames = null , reschedule = false, date, time, role, interviewId, jobId, companyCode , userId }
) => {
  try {
    let message = "";
    const missing = checkMissingFields({ date, time, role, interviewId, jobId, companyCode, userId });
    if(missing.length > 0){
      return {
        message: `Please provide missing fields ${missing.join(", ")}`
      }
    }

    const checkIds = validateObjectIds({ interviewId, jobId, userId })
    if(!checkIds.isValid){
      return {
        message: `Invalid ObjectIds for ${checkIds.invalidFields}`
      }
    }

    const formattedTime = formatTo12Hour(time);

    if(name){
      message = `Interview with ${name} on ${date} at ${formattedTime} for ${role}.`;
    }else if(candidateNames){
      message = `GD with ${candidateNames.join(", ")} on ${date} at ${formattedTime} for ${role}.`;
    }else if(reschedule){
      message = `Interview rescheduled for ${role} on ${date} at ${formattedTime}.`;
    }

    const notificationData = {
      type: "reminder",
      message: message,
      interviewId,
      jobId,
      companyCode,
      userId
    }

    const notifyBeforeInterview = await NotificationSettings.findOne({ userId: userId})

    if(notifyBeforeInterview){
      const reminderSetting = await NotificationSettings.findOne({ userId: userId});
      if(!reminderSetting) return { error: "Notification settings not found for the given user"};
      const minutesBefore = [ reminderSetting.firstReminder, reminderSetting.secondReminder ];
      const pushData = calculateReminderPushTime(date, time, minutesBefore);
      notificationData.notifyBeforeInterview = notifyBeforeInterview;
      notificationData.reminders = pushData;
    }

    const reminder = await Notification.create(notificationData);

    if(!reminder)
      return {
        error: "In creating reminder notification."
      }

    return {
      success: true,
      message: "Reminder Notification created successfully",
      data: reminder,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};

