import { configureStore } from "@reduxjs/toolkit";
import jobPostReducer from "./slice/Jobpostslice";
import LoginReducer from "./slice/LoginSlice";
import positionReducer from "./slice/PositionSlice";
import profileReducer from "./slice/ProfileSlice";
import privacyReducer from "./slice/privacySlice";
import appReducer from "./slice/applicationSlice";
import Notificationsettings from "./slice/NotificationSettingslice";
import meetingSettingsReducer from "./slice/MeetingSettingsSlice";
import notifications from "./slice/NotificationsSlice";
import feedbackReducer from "./slice/FeedbackSlice";
import viewApplicantsReducer from "./slice/ViewApplicantsSlice";
import viewDetailsReducer from "./slice/ViewDetailsSlice";
import candidateStatusReducer from "./slice/candidateStatusSlice";
import formReducer from "./slice/FormSlice";

export const store = configureStore({
  reducer: {
    auth: LoginReducer,
    jobPost: jobPostReducer,
    position: positionReducer,
    Profile: profileReducer,
    privacy: privacyReducer,
    app: appReducer,
    notificationsettings: Notificationsettings,
    meetingSettings: meetingSettingsReducer,
    notifications: notifications,
    feedback: feedbackReducer,
    viewApplicants: viewApplicantsReducer,
    viewDetails: viewDetailsReducer,
    candidateStatus: candidateStatusReducer,
    form: formReducer,
  },

});
