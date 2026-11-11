import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profiles",
  initialState: {
    profiles: [],
    loading: false,
    error: null,
  },
  reducers: {
    setProfiles: (state, action) => {
      state.profiles = action.payload;
    },
    addProfile: (state, action) => {
      state.profiles.push(action.payload);
    },
    updateProfile: (state, action) => {
      const index = state.profiles.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) state.profiles[index] = action.payload;
    },
    deleteProfile: (state, action) => {
      state.profiles = state.profiles.filter((p) => p._id !== action.payload);
    },
  },
});

export const { setProfiles, addProfile, updateProfile, deleteProfile } =
  profileSlice.actions;

export default profileSlice.reducer;
