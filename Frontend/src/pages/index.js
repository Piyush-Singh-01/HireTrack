// Auth Pages
export { default as LoginPage } from "./auth/LoginPage";
export { default as CreateAccountPage } from "./auth/CreateAccountPage";
export { default as ForgotPasswordPage } from "./auth/ForgotPasswordPage";
export { default as ResetEmailSentPage } from "./auth/ResetEmailSentPage";
export { default as ResetPasswordFormPage } from "./auth/ResetPasswordFormPage";
export { default as EmailVerificationPage } from "./auth/EmailVerificationPage";
export { default as VerifyEmailPage } from "./auth/VerifyEmailPage";

// Dashboard Pages
export { default as DashboardPage } from "./dashboard/DashboardPage";

// Position Pages
export {
  PositionsPage,
  PositionDetailsPage,
  ViewApplicantsPage,
  FeedbackPage,
  ViewTaskPage,
  ViewResumePage,
} from "./positions";

// Schedule Pages
export {
  SchedulePage,
  CalendarPage,
  FilterResultsPage,
  ReschedulePage,
  ScheduleFeedbackPostPage,
  ScheduleFeedbackGetPage,
} from "./schedule";

// Job Pages
export { default as JobPostPage } from "./jobs/JobPostPage";
export { default as EditJobPostPage } from "./jobs/EditJobPostPage";
export { default as JobDetailsPage } from "./jobs/JobDetailsPage";
export { default as DraftsPage } from "./jobs/DraftsPage";
export { default as JobApplicationPage } from "./jobs/JobApplicationPage";
export { default as CreateApplicationPage } from "./jobs/CreateApplicationPage";
export { default as CreateApplicationPage2 } from "./jobs/CreateApplicationPage2";
export { default as ScreeningPage } from "./jobs/ScreeningPage";
export { default as ScreeningPerModulePage } from "./jobs/ScreeningPerModulePage";
export { default as MainApplicationPage } from "./jobs/MainApplicationPage";
export { default as ModuleSelectionPage } from "./jobs/ModuleSelectionPage";
export { default as CreateTaskPage } from "./jobs/CreateTaskPage";
export { default as CandidateApplicationPage } from "./jobs/CandidateApplicationPage";

// Settings Pages
export {
  ProfilePage,
  PrivacySecurityPage,
  MeetingSettingsPage,
  NotificationsPage,
} from "./settings";

// User & Role Pages
export { default as UserAndRolePage } from "./users/UserAndRolePage";

// Offer Letter Pages
export { default as OfferLetterPage } from "./offers/OfferLetterPage";
export { default as ReviewAndSendPage } from "./offers/ReviewAndSendPage";
export { default as SelectTemplatePage } from "./offers/SelectTemplatePage";
export { default as OfferLetterTemplatePage } from "./offers/OfferLetterTemplatePage";
export { default as SendOfferLetterPage } from "./offers/SendOfferLetterPage";

// Notification Pages
export { default as NotificationPage } from "./notifications/NotificationPage";
