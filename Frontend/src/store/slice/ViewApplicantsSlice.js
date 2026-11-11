import { createSlice } from "@reduxjs/toolkit";

const emptyBuckets = {
  applied: [],
  shortlisted: [],
  interview: [],
  onhold: [],
  rejected: [],
  hired: [],
  rescheduled: [],
};

const initialState = {
  status: null,
  jobId: null,

  tabs: { main: "Applied", secondary: "All" },
  dialogs: { schedule: false, reschedule: false, close: false, scheduleGD: false },

  selectedApplicant: null,
  selectedCandidates: [],
  selectedRows: [],
  activeFilter: null,
  extendDate: false,
  selectedDate: null,
  time: "01:00",
  mode: "Online",

  data: { ...emptyBuckets },
  pagination: {
    applied: null,
    shortlisted: null,
    interview: null,
    onhold: null,
    rejected: null,
    hired: null,
    rescheduled: null,
  },
};

const viewApplicantsSlice = createSlice({
  name: "viewApplicants",
  initialState,
  reducers: {
    setContext(state, action) {
      const { status, jobId } = action.payload || {};
      if (status !== undefined) state.status = status;
      if (jobId !== undefined) state.jobId = jobId;
    },
    setTabs(state, action) {
      state.tabs = { ...state.tabs, ...(action.payload || {}) };
    },
    setDialogs(state, action) {
      state.dialogs = { ...state.dialogs, ...(action.payload || {}) };
    },
    setSelectedApplicant(state, action) {
      state.selectedApplicant = action.payload || null;
    },
    setSelectedCandidates(state, action) {
      state.selectedCandidates = Array.isArray(action.payload) ? action.payload : [];
    },
    setActiveFilter(state, action) {
      state.activeFilter = action.payload || null;
    },
    setExtendDate(state, action) {
      state.extendDate = Boolean(action.payload);
    },
    setSelectedDate(state, action) {
      state.selectedDate = action.payload || null;
    },
    setTime(state, action) {
      state.time = action.payload || "";
    },
    setMode(state, action) {
      state.mode = action.payload || "";
    },
    setSelectedRows(state, action) {
      state.selectedRows = Array.isArray(action.payload) ? action.payload : [];
    },
    setDataForKey(state, action) {
      const { key, list } = action.payload || {};
      if (key && key in state.data) state.data[key] = Array.isArray(list) ? list : [];
    },
    setPaginationForKey(state, action) {
      const { key, page } = action.payload || {};
      if (key && key in state.pagination) state.pagination[key] = page || null;
    },
    resetViewApplicants() {
      return initialState;
    },
  },
});

export const {
  setContext,
  setTabs,
  setDialogs,
  setSelectedApplicant,
  setSelectedCandidates,
  setActiveFilter,
  setExtendDate,
  setSelectedDate,
  setTime,
  setMode,
  setSelectedRows,
  setDataForKey,
  setPaginationForKey,
  resetViewApplicants,
} = viewApplicantsSlice.actions;

export default viewApplicantsSlice.reducer;


