import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  jobId: null,
  candidateId: null,
  candidate: null,
  ratings: {
    communication: "Excellent",
    technical: "Excellent",
    programming: "Excellent",
    problemSolving: "Excellent",
  },
  comments: "",
  overallRating: "Good fit",
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    setContext(state, action) {
      const { jobId, candidateId, candidate } = action.payload || {};
      if (jobId !== undefined) state.jobId = jobId;
      if (candidateId !== undefined) state.candidateId = candidateId;
      if (candidate !== undefined) state.candidate = candidate;
    },
    setRatings(state, action) {
      state.ratings = { ...state.ratings, ...(action.payload || {}) };
    },
    updateRating(state, action) {
      const { key, value } = action.payload || {};
      if (key) state.ratings[key] = value;
    },
    setComments(state, action) {
      state.comments = action.payload || "";
    },
    setOverallRating(state, action) {
      state.overallRating = action.payload || "";
    },
    resetFeedback() {
      return initialState;
    },
  },
});

export const {
  setContext,
  setRatings,
  updateRating,
  setComments,
  setOverallRating,
  resetFeedback,
} = feedbackSlice.actions;

export default feedbackSlice.reducer;


