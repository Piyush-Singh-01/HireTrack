import { createSlice } from "@reduxjs/toolkit";

const privacySlice = createSlice({
  name: "privacy",
  initialState: {
    data: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPrivacyData: (state, action) => {
      state.data = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    clearPrivacy: (state) => {
      state.data = null;
      state.error = null;
      state.message = null;
    },
  },
});

export const {
  setLoading,
  setPrivacyData,
  setError,
  setMessage,
  clearPrivacy,
} = privacySlice.actions;

export default privacySlice.reducer;
