import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  jobId: null,
  jobDescription: null,
  isLoading: false,
  error: null,
};

const viewDetailsSlice = createSlice({
  name: "viewDetails",
  initialState,
  reducers: {
    setJobId(state, action) {
      state.jobId = action.payload || null;
    },
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    setJobDescription(state, action) {
      state.jobDescription = action.payload || null;
      state.isLoading = false;
    },
    setError(state, action) {
      state.error = action.payload || null;
      state.isLoading = false;
    },
    resetViewDetails() {
      return initialState;
    },
  },
});

export const {
  setJobId,
  startLoading,
  setJobDescription,
  setError,
  resetViewDetails,
} = viewDetailsSlice.actions;

export default viewDetailsSlice.reducer;


