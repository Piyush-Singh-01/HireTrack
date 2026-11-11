import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  candidates: {},
  status: "idle", // idle, loading, succeeded, failed
  error: null,
  lastUpdated: null,
};

const candidateStatusSlice = createSlice({
  name: "candidateStatus",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state) => {
      state.status = "loading";
      state.error = null;
    },

    // Set error state
    setError: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },

    // Update candidate status
    updateCandidateStatus: (state, action) => {
      const { candidateId, status, data } = action.payload;
      
      if (!state.candidates[candidateId]) {
        state.candidates[candidateId] = {};
      }
      
      state.candidates[candidateId] = {
        ...state.candidates[candidateId],
        status,
        data,
        lastUpdated: new Date().toISOString(),
      };
      
      state.status = "succeeded";
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },

    // Move candidate from one status to another
    moveCandidate: (state, action) => {
      const { candidateId, fromStatus, toStatus, data } = action.payload;
      
      if (state.candidates[candidateId]) {
        state.candidates[candidateId] = {
          ...state.candidates[candidateId],
          status: toStatus,
          data: { ...state.candidates[candidateId].data, ...data },
          lastUpdated: new Date().toISOString(),
        };
      }
      
      state.lastUpdated = new Date().toISOString();
    },

    // Remove candidate from a specific status
    removeCandidateFromStatus: (state, action) => {
      const { candidateId, status } = action.payload;
      
      if (state.candidates[candidateId] && state.candidates[candidateId].status === status) {
        delete state.candidates[candidateId];
      }
      
      state.lastUpdated = new Date().toISOString();
    },

    // Clear all candidate status data
    clearCandidateStatus: (state) => {
      state.candidates = {};
      state.status = "idle";
      state.error = null;
      state.lastUpdated = null;
    },

    // Get candidate status
    getCandidateStatus: (state, action) => {
      const { candidateId } = action.payload;
      return state.candidates[candidateId] || null;
    },

    // Batch update multiple candidates
    batchUpdateCandidates: (state, action) => {
      const { updates } = action.payload;
      
      updates.forEach(({ candidateId, status, data }) => {
        if (!state.candidates[candidateId]) {
          state.candidates[candidateId] = {};
        }
        
        state.candidates[candidateId] = {
          ...state.candidates[candidateId],
          status,
          data,
          lastUpdated: new Date().toISOString(),
        };
      });
      
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const {
  setLoading,
  setError,
  updateCandidateStatus,
  moveCandidate,
  removeCandidateFromStatus,
  clearCandidateStatus,
  getCandidateStatus,
  batchUpdateCandidates,
} = candidateStatusSlice.actions;


export default candidateStatusSlice.reducer;

