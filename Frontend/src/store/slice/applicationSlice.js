import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
  name: "application",
  initialState: {
    application: [],
    loading: false,
    error: null,
  },

  reducers: {
    setApp: (state, action) => {
      state.application = action.payload;
    },
    addApp: (state, action) => {
      state.application.push(action.payload);
    },
    updateApp: (state, action) => {
      const index = state.application.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) state.application[index] = action.payload;
    },
    deleteApp: (state, action) => {
      state.application = state.application.filter(
        (p) => p._id !== action.payload
      );
    },
  },
});

export const { setApp, addApp, updateApp, deleteApp } =
  applicationSlice.actions;
export default applicationSlice.reducer;
