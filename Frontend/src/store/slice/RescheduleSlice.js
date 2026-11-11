import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  candidate: "",
  position: "",
  recruiter: "",
  date: "",
  time: "",
  reminderMinutes: 0,
  sendNotification: false,
};

const rescheduleSlice = createSlice({
  name: "reschedule",
  initialState,
  reducers: {
    setCandidate: (state, action) => {
      state.candidate = action.payload;
    },
    setPosition: (state, action) => {
      state.position = action.payload;
    },
    setRecruiter: (state, action) => {
      state.recruiter = action.payload;
    },
    setDate: (state, action) => {
      state.date = action.payload;
    },
    setTime: (state, action) => {
      state.time = action.payload;
    },
    setReminderMinutes: (state, action) => {
      state.reminderMinutes = action.payload;
    },
    toggleNotification: (state) => {
      state.sendNotification = !state.sendNotification;
    },
    resetReschedule: () => initialState,
  },
});

export const {
  setCandidate,
  setPosition,
  setRecruiter,
  setDate,
  setTime,
  setReminderMinutes,
  toggleNotification,
  resetReschedule,
} = rescheduleSlice.actions;

export default rescheduleSlice.reducer;