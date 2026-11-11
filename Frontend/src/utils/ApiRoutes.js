import axiosInstance from "./AxiosInstance.js";
const BASE = axiosInstance.defaults.baseURL;

const ApiRoutes = {
  USERS: {
    LOGIN: "/api/users/v1/login",
    REGISTER: "/api/users/v1/register",
    VERIFY_EMAIL: "/api/users/v1/verify-email/",
    FORGOT_PASSWORD: "/api/users/v1/forgot-password",
    RESET_PASSWORD: "/api/users/v1/reset-password",
  },

  CALENDER: {
    GET_ALL: "/api/google/calendar-all",
    GET: (id) => `/api/google/calendar/${id}`,
  },

  SCHEDULE: {
    GET: (userId) => `/api/dayselector/interview-schedules/${userId}`,
    SCHEDULEID_GET: "/api/dayselector/getallinterview",
    GET_ID: (jobId) => `/api/positions/${jobId}/`,
    BY_STATUS: "/api/dayselector/getStatusSchedule",
    TODAY: "/api/todayschedule",
    FALLBACK: "/api/dayselector/getschedule",
    POST: (jobId) => `/api/positions/${jobId}/schedule`,
    RESCHEDULE: (jobId) => `/api/positions/${jobId}/reschedule`,
    REJECT: (jobId) => `/api/positions/${jobId}/status`,
    RESCHEDULE2: (jobId) => `/api/dayselector/post-reschedule/${jobId}`,
    GET_FEEDBACK: (applicationId) => `/api/applications/all?id=${applicationId}`,
  },

  SCHEDULE_FILTERS: {
    DATE_RANGE: "/api/sortby/date-range",
    BY_FIELDS: "/api/sortby/filter",
  },

  DASHBOARD: {
    UPCOMING_INTERVIEW: "/api/dashboard/upcomingInterview",
    COMPLETED_INTERVIEW: "/api/dashboard/completedInterview",
    TODAY_INTERVIEW_SCHEDULE: "/api/dashboard/todayInterviewSchedule",
    TOTAL_CANDIDATES_MONTH: "/api/dashboard/totalCandidatesInCurrentMonth",
    TOTAL_CANDIDATES_WEEK: "/api/dashboard/totalCandidatesInCurrentWeek",
    IN_PROCESS: "/api/dashboard/inProcess",
    SHORTLISTED: "/api/dashboard/shortlisted",
    REJECTED: "/api/dashboard/rejected",
    HIRED: "/api/dashboard/hired",
    CURRENT_WEEK_HIRED: "/api/dashboard/currentWeekHired",
    TOTAL_HIRING_MANAGERS: "/api/dashboard/totalHiredManager",
    MONTHLY_HIRED: "/api/dashboard/monthlyHired",
    CANDIDATE_RATES: "/api/analytics/interview-rate",
    SUMMARY_ANALYTICS: "/api/dashboard/summary-schedule-analytics",
  },

  POSITION: {
    JOBS: {
      SCREEN: (jobId) => `/api/positions/job-description/${jobId}`,
      ALL: "/api/positions/jobs",
      DISPLAY: "/api/positions/jobs",
      OPEN: "/api/positions/jobs",
      CLOSED: "/api/positions/jobs",
      JOB_DESCRIPTION: (jobId) => `/api/positions/job-description/${jobId}`,
      LOOKUP: "/api/jobs/job-lookup",
      DRAFTS: "/api/jobs/job-drafts",
    },

    ANALYTICS: {
      TOTAL_POSITIONS: "/api/positions/analytics/total-positions",
      OPEN_POSITIONS: "/api/positions/analytics/open-positions",
      APPLICATIONS_COUNT: "/api/positions/analytics/applications-count",
      CLOSED_POSITIONS: "/api/positions/analytics/closed-positions",
      HIRED_THIS_MONTH: "/api/positions/analytics/hired-this-month",
      AVERAGE_TIME_TO_HIRE: "/api/positions/analytics/average-time-to-hire",
      OVERVIEW: "/api/positions/analytics-overview",
    },

    //==========================  Get  ========================/
    CANDIDATES: (jobId, params = {}) => ({
      url: `/api/positions/${jobId}/all`,
      params,
    }),

    //==========================  Post  ========================/
    FEEDBACK: (jobId) => `/api/positions/${jobId}/feedback`,
    SHORTLIST: (jobId) => `/api/positions/${jobId}/status`,
    REJECT: (jobId) => `/api/positions/${jobId}/status`,
    HIRE: (jobId) => `/api/positions/${jobId}/status`, //POST
    ONHOLD: (jobId) => `/api/positions/${jobId}/onhold`,
    STATUS: (jobId) => `/api/positions/${jobId}/status`,
    RESCHEDULE: (jobId) => `/api/positions/${jobId}/reschedule`,
    SCHEDULE_DETAILS: (jobId) => `/api/positions/${jobId}/`,

    //==========================  Put  ========================/
    UPDATEJOB: (jobId) => `/api/jobs/updateJob/${jobId}`,
UPDATEDRAFT: (jobId) => `/api/jobs/updateDraft/${jobId}`,
    DELETEJOB: (jobId) => `/api/jobs/deleteJob/${jobId}`,
    SCHEDULEGD: (jobId) => `/api/positions/${jobId}/gd/schedule`,
    STARTINTERVIEW: "api/interview/start",
  },

  APPLICATION: {
    CREATE: "/api/applications/",
    GET_ALL_APP: "/api/applications/all",
    GET_APP: (id) => `/api/applications/all?id=${id}`,
    EDIT_APP: (id) => `/api/applications/${id}`,
    DELETE_APP: (id) => `/api/applications/${id}`,
  },

  FORM: {
    CREATE: "/api/forms/v1/",
    GET_ALL_FORM: "/api/forms/v1/",
    GET_BY_ID: (id) => `/api/forms/v1/${id}`,
    EDIT_FORM: (id) => `/api/forms/v1/${id}`,
    DELETE_FORM: (id) => `/api/forms/v1/${id}`,
  },

  UPLOADS: {
    FILE: (slug) => `${BASE}/api/applications/upload-pdf/${slug}`,
    HR_POSTER: (slug) => `/api/upload`,
  },

  SCREENING: {
    CREATE: "/api/screening",
    GET_BY_ID: (id) => `/api/screening/${id}`,
  },

  USERANDROLE: {
    GET_ALL: "/api/userandrole/all-Users",
    GET_USER_ID: (id) => `/api/userandrole/all-Users?id=${id}`,
    UPDATE: (id) => `/api/userandrole/update/${id}`,
    ADD: "/api/userandrole/create",
    DELETE: (id) => `/api/userandrole/delete/${id}`,
    DISABLE_AND_ENABLE_TOGGLE: (id) => `/api/userandrole/status/${id}`,
    HIRING_MANAGERS: "/api/userandrole/hiring-managers",
  },

  PROFILE: {
    GET: "/api/profile/get",
    UPDATE: "/api/profile/update",
    DELETE: "/api/profile/delete",
  },

  PRIVACY: {
    CHANGE_PASSWORD: "/api/privacy-security/change-password",
    // DISABLE_ACCOUNT: "/api/privacy-security/disable-account",
    // DELETE_ACCOUNT: "/api/privacy-security/delete-account",

    // TWO FACTOR AUTH
    ENABLE_TWO_FACTOR_AUTH: "/api/privacy-security/enable-2fa",
    CONFIRM_TWO_FACTOR_AUTH: "/api/privacy-security/confirm-2fa",
    DISABLE_TWO_FACTOR_AUTH: "/api/privacy-security/disable-2fa",
  },

  SETTINGSNOTIFICATIONS: {
    CREATE: (userId) => `/api/notificationsettings/create/${userId}`,
    GET: (userId) => `/api/notificationsettings/${userId}`,
    UPDATE: (userId) => `/api/notificationsettings/${userId}`,
    DELETE: (userId) => `/api/notificationsettings/${userId}`,
  },

  GOOGLE_CALENDAR: {
    ADD_CREDENTIALS: "/api/calendar//google/add-credentials",
    CONNECT: "/api/calendar/google/connect-calendar",
  },

  NOTIFICATIONS: {
    GET: "/api/notifications/v1/get",
    UPDATE_MANY: "/api/notifications/v1/updatmany",
    UPDATE_ONE: (id) => `/api/notifications/v1/updateone/${id}`,
    UPDATE_FAVOURITE: (id) => `/api/notifications/v1/updatefavourite/${id}`,
    DELETE_APPLICANT: (id) =>
      `/api/notifications/v1/delete-applicant-notification/${id}`,
    DELETE_REMINDER: (id) => `/api/notifications/v1/deletereminder/${id}`,
  },
  MEETINGS: {
    GET_ALL: "/api/meetings/all/meetings",
    GET_BY_ID: (id) => `/api/meetings/all/meetings?id=${id}`,
    CREATE: "/api/meetings/",
    UPDATE: (id) => `/api/meetings/update/${id}`,
    DELETE: (id) => `/api/meetings/delete/${id}`,
  },

  DRAFT: {
    DELETE: (id) => `/api/jobs/deleteDraft/${id}`,
  },
  OFFER_LETTER_TEMPLATE: {
    GET: "/api/offer-letter-template",
    SAVE: "/api/offer-letter-template",
    SEND: "/api/offer-letter-template/send",
  },
  RESUME_ANALYSIS: {
    GET: (appId) => `/api/resume-analysis/${appId}`,
    ANALYZE: (appId) => `/api/resume-analysis/${appId}/analyze`,
  },
};

export { ApiRoutes };
export default ApiRoutes;
