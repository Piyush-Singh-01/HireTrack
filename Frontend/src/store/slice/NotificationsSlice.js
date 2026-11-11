import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  applicants: [],
  favourites: [],
  reminders: [],
  status: "idle", // 'loading', 'success', 'error'
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // ---------------- Setters ----------------
    setApplicants: (state, action) => {
      state.applicants = action.payload;
    },
    setFavourites: (state, action) => {
      state.favourites = action.payload;
    },
    setReminders: (state, action) => {
      state.reminders = action.payload;
    },

    // ---------------- Applicant Actions ----------------
    markApplicantSeen: (state, action) => {
      state.applicants = state.applicants.map((applicant) =>
        applicant.applicantId === action.payload
          ? { ...applicant, isSeen: true }
          : applicant
      );
    },
    deleteApplicant: (state, action) => {
      state.applicants = state.applicants.filter(
        (applicant) => applicant.applicantId !== action.payload
      );
    },

    // ---------------- Favourite Actions ----------------
    addFavourite: (state, action) => {
      state.favourites.push(action.payload);
    },
    removeFavourite: (state, action) => {
      state.favourites = state.favourites.filter(
        (fav) => fav.applicantId !== action.payload
      );
    },
    markFavouriteSeen: (state, action) => {
      state.favourites = state.favourites.map((fav) =>
        fav.applicantId === action.payload ? { ...fav, isSeen: true } : fav
      );
    },

    // ---------------- Reminder Actions ----------------
    addReminder: (state, action) => {
      state.reminders.push(action.payload);
    },
    deleteReminder: (state, action) => {
      state.reminders = state.reminders.filter(
        (reminder) => reminder.applicantId !== action.payload
      );
    },
    markReminderSeen: (state, action) => {
      state.reminders = state.reminders.map((reminder) =>
        reminder.applicantId === action.payload
          ? { ...reminder, isSeen: true }
          : reminder
      );
    },
  },
});

export const {
  setApplicants,
  setFavourites,
  setReminders,
  markApplicantSeen,
  deleteApplicant,
  addFavourite,
  removeFavourite,
  markFavouriteSeen,
  addReminder,
  deleteReminder,
  markReminderSeen,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
