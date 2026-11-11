import { createSlice } from "@reduxjs/toolkit";
const NotificationSettingslice = createSlice({
  name: "Notification",
  initialState: {
    type: true,
    status: "loading",
     post: null,
  },
  reducers: {
    gettype: (state, action) => {
      state.type = action.payload;
    },
    createProfile: (state, action) => {
      state.post = action.payload;
    },
    updateprofile: (state, action) => {
      state.status = action.payload;
    },
    //  deleteProfile: (state) => {
    //   state.post = null;
    //   state.status = "deleted";
    // },
  },
});
export const { gettype, createProfile, updateprofile } =
  NotificationSettingslice.actions;
export default NotificationSettingslice.reducer;
