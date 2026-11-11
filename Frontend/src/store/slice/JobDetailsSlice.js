import { createSlice } from "@reduxjs/toolkit";

const jobDetailsSlice = createSlice({
  name: "jobDetails",
  initialState: {
    job: null,
    status: "loading",
    error: null,
  },
  reducers: {
    setJobDetails: (state, action) => {
      state.job = action.payload;
    },
  },
});

export const { setJobDetails } = jobDetailsSlice.actions;
export default jobDetailsSlice.reducer;
