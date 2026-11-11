
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../utils/AxiosInstance';

export const fetchSchedules = createAsyncThunk(
  'schedule/fetchSchedules',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (filters.type) params.type = filters.type; // today|yesterday|tomorrow
      if (filters.status && filters.status !== 'All Status') params.status = filters.status;
      if (filters.position && filters.position !== 'All Position') params.position = filters.position;
      if (filters.recruiter) params.recruiter = filters.recruiter;

      const { data } = await axiosInstance.get(`/api/dayselector/getAllSchedules`, { params });
      return Array.isArray(data?.data) ? data.data : data;
    } catch (err) {
      console.error('Error fetching schedules:', err);
      // Fallback to old endpoint if new one fails
      try {
        const { data } = await axiosInstance.get(`/api/dayselector/getschedule`, { params });
        return Array.isArray(data?.data) ? data.data : data;
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        return rejectWithValue(fallbackErr.response?.data || 'Failed to fetch schedules');
      }
    }
  }
);

const initialState = {
  schedules: [],
  loading: false,
  error: null,
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedules.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSchedules.fulfilled, (state, action) => { state.loading = false; state.schedules = action.payload; })
      .addCase(fetchSchedules.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const selectSchedules = (state) => state.schedule.schedules;
export const selectLoading = (state) => state.schedule.loading;
export const selectError = (state) => state.schedule.error;

export default scheduleSlice.reducer;