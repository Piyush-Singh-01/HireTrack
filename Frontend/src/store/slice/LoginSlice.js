import { createSlice } from "@reduxjs/toolkit";
import getDisplayName from "../../utils/getDisplayName";

// Get stored user once
const storedItem = localStorage.getItem("user");
const storedUser = (storedItem && storedItem !== "undefined") ? JSON.parse(storedItem) : null;

const initialState = {
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  user: storedUser || null,
  username:
    storedUser
      ? getDisplayName(storedUser)
      : localStorage.getItem("displayName") ||
        localStorage.getItem("username") ||
        null,
  userId: storedUser?.id || localStorage.getItem("userId") || null,
  role: storedUser?.role || localStorage.getItem("role") || null,
  businessEmail:
    storedUser?.businessEmail ||
    storedUser?.email ||
    storedUser?.Email ||
    localStorage.getItem("businessEmail") ||
    null,
};

const LoginSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, refreshToken, user } = action.payload;

      state.token = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      state.username = getDisplayName(user);
      state.userId = user?.id || null;
      state.role = user?.role || null;
      state.businessEmail = user?.businessEmail || user?.email || user?.Email || null;

      // Save to localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("displayName", state.username || "");
      if (user?.userName) localStorage.setItem("username", user.userName);
      else if (user?.name) localStorage.setItem("username", user.name);
      else if (user?.fullName) localStorage.setItem("username", user.fullName);
      if (user?.id) localStorage.setItem("userId", user.id);
      if (user?.role) localStorage.setItem("role", user.role);
      if (user?.businessEmail) localStorage.setItem("businessEmail", user.businessEmail);
      if (user?.email) localStorage.setItem("businessEmail", user.email);
      if (user?.Email) localStorage.setItem("businessEmail", user.Email);
    },

    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.username = null;
      state.userId = null;
      state.role = null;
      state.businessEmail = null;

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("displayName");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      localStorage.removeItem("businessEmail");
    },
    updateUser: (state, action) => {
      const user = action.payload;
      state.user = user;
      state.username = getDisplayName(user);
      state.userId = user?.id || user?._id || null;
      state.role = user?.role || user?.Role || null;
      state.businessEmail = user?.businessEmail || user?.email || user?.Email || null;

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("displayName", state.username || "");
      if (user?.userName) localStorage.setItem("username", user.userName);
      else if (user?.name) localStorage.setItem("username", user.name);
      else if (user?.fullName) localStorage.setItem("username", user.fullName);
      if (state.userId) localStorage.setItem("userId", state.userId);
      if (state.role) localStorage.setItem("role", state.role);
      if (user?.businessEmail) localStorage.setItem("businessEmail", user.businessEmail);
      if (user?.email) localStorage.setItem("businessEmail", user.email);
      if (user?.Email) localStorage.setItem("businessEmail", user.Email);
    },
  },
});

export const { setCredentials, logout, updateUser } = LoginSlice.actions;
export default LoginSlice.reducer;
