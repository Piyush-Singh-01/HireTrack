import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/AxiosInstance";
import ApiRoutes from "../../utils/ApiRoutes"; // Adjust the import path

// Thunks using centralized routes
export const fetchMeetingSettings = createAsyncThunk(
  "meetingSettings/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ApiRoutes.MEETINGS.GET_ALL, { 
        withCredentials: false 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch meeting settings" });
    }
  }
);

export const fetchMeetingSettingsById = createAsyncThunk(
  "meetingSettings/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ApiRoutes.MEETINGS.GET_BY_ID(id), { 
        withCredentials: false 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch meeting settings by id" });
    }
  }
);

export const createMeetingSettings = createAsyncThunk(
  "meetingSettings/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ApiRoutes.MEETINGS.CREATE, payload, { 
        withCredentials: false 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to create meeting settings" });
    }
  }
);

export const updateMeetingSettings = createAsyncThunk(
  "meetingSettings/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(ApiRoutes.MEETINGS.UPDATE(id), payload, { 
        withCredentials: false 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to update meeting settings" });
    }
  }
);

export const deleteMeetingSettings = createAsyncThunk(
  "meetingSettings/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(ApiRoutes.MEETINGS.DELETE(id), { 
        withCredentials: false 
      });
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to delete meeting settings" });
    }
  }
);

const initialState = {
  items: [],
  current: null,
  loading: false,
  error: null,
};

const meetingSettingsSlice = createSlice({
  name: "meetingSettings",
  initialState,
  reducers: {
    clearMeetingSettingsError(state) {
      state.error = null;
    },
    setCurrentMeetingSettings(state, action) {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchMeetingSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetingSettings.fulfilled, (state, action) => {
        state.loading = false;
        // Handle nested data.meetingSettings or direct array/object
        const rawData = action.payload?.data?.meetingSettings || action.payload?.data || action.payload;
        const data = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
        state.items = data;
        if (!state.current && data.length > 0) {
          state.current = data[0];
        }
      })
      .addCase(fetchMeetingSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })
      // fetch by id
      .addCase(fetchMeetingSettingsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetingSettingsById.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data?.meetingSettings || action.payload?.data || action.payload;
        state.current = data;
        const index = state.items.findIndex((x) => x?._id === data?._id);
        if (index >= 0) {
          state.items[index] = data;
        } else if (data) {
          state.items.push(data);
        }
      })
      .addCase(fetchMeetingSettingsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })
      // create
      .addCase(createMeetingSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeetingSettings.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (data) {
          state.items.push(data);
          state.current = data;
        }
      })
      .addCase(createMeetingSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })
      // update
      .addCase(updateMeetingSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeetingSettings.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        if (data) {
          const index = state.items.findIndex((x) => x?._id === data?._id);
          if (index >= 0) state.items[index] = data;
          if (state.current?._id === data?._id || !state.current) state.current = data;
        }
      })
      .addCase(updateMeetingSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })
      // delete
      .addCase(deleteMeetingSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeetingSettings.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload?.id;
        state.items = state.items.filter((x) => x?._id !== id);
        if (state.current?._id === id) state.current = state.items[0] || null;
      })
      .addCase(deleteMeetingSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });
  },
});

export const { clearMeetingSettingsError, setCurrentMeetingSettings } = meetingSettingsSlice.actions;
export default meetingSettingsSlice.reducer;