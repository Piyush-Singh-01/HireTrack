import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  positions: [],
  selectedPosition: null,
  status: "idle", // idle, loading, succeeded, failed
  error: null,
  filters: {
    status: "All", // All, Open, Closed
    role: "All Position",
  },
  kpiData: {
    totalPositions: 0,
    openPositions: 0,
    closedPositions: 0,
    applications: 0,
    hiredThisMonth: 0,
    avgTimeToHire: 0,
  },
};

const PositionSlice = createSlice({
  name: "position",
  initialState,
  reducers: {
    // Set positions data
    setPositions: (state, action) => {
      state.positions = action.payload;
      state.status = "succeeded";
      state.error = null;
      
      // Update KPI data based on positions
      const positions = action.payload || [];
      state.kpiData.totalPositions = positions.length;
      state.kpiData.openPositions = positions.filter(
        (p) => (p.status || "").toLowerCase() === "open"
      ).length;
      state.kpiData.closedPositions = positions.filter(
        (p) => (p.status || "").toLowerCase() === "closed"
      ).length;
    },

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

    // Set selected position
    setSelectedPosition: (state, action) => {
      state.selectedPosition = action.payload;
    },

    // Clear selected position
    clearSelectedPosition: (state) => {
      state.selectedPosition = null;
    },

    // Update filters
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },

    setRoleFilter: (state, action) => {
      state.filters.role = action.payload;
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = {
        status: "All",
        role: "All Position",
      };
    },

    // Add new position
    addPosition: (state, action) => {
      state.positions.push(action.payload);
      state.kpiData.totalPositions = state.positions.length;
      
      // Update open/closed counts based on new position status
      const status = (action.payload.status || "").toLowerCase();
      if (status === "open") {
        state.kpiData.openPositions += 1;
      } else if (status === "closed") {
        state.kpiData.closedPositions += 1;
      }
    },

    // Update existing position
    updatePosition: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.positions.findIndex(
        (pos) => pos.id === id || pos._id === id || pos.positionId === id
      );
      
      if (index !== -1) {
        const oldStatus = (state.positions[index].status || "").toLowerCase();
        const newStatus = (updates.status || "").toLowerCase();
        
        // Update position
        state.positions[index] = { ...state.positions[index], ...updates };
        
        // Update KPI counts if status changed
        if (oldStatus !== newStatus) {
          if (oldStatus === "open") {
            state.kpiData.openPositions -= 1;
          } else if (oldStatus === "closed") {
            state.kpiData.closedPositions -= 1;
          }
          
          if (newStatus === "open") {
            state.kpiData.openPositions += 1;
          } else if (newStatus === "closed") {
            state.kpiData.closedPositions += 1;
          }
        }
      }
    },

    // Delete position
    deletePosition: (state, action) => {
      const id = action.payload;
      const index = state.positions.findIndex(
        (pos) => pos.id === id || pos._id === id || pos.positionId === id
      );
      
      if (index !== -1) {
        const position = state.positions[index];
        const status = (position.status || "").toLowerCase();
        
        // Remove position
        state.positions.splice(index, 1);
        state.kpiData.totalPositions = state.positions.length;
        
        // Update KPI counts
        if (status === "open") {
          state.kpiData.openPositions -= 1;
        } else if (status === "closed") {
          state.kpiData.closedPositions -= 1;
        }
      }
    },

    // Update KPI data manually
    updateKpiData: (state, action) => {
      state.kpiData = { ...state.kpiData, ...action.payload };
    },

    // Reset position state
    resetPositionState: (state) => {
      return initialState;
    },
  },
});

export const {
  setPositions,
  setLoading,
  setError,
  setSelectedPosition,
  clearSelectedPosition,
  setStatusFilter,
  setRoleFilter,
  resetFilters,
  addPosition,
  updatePosition,
  deletePosition,
  updateKpiData,
  resetPositionState,
} = PositionSlice.actions;

// Selectors
export const selectAllPositions = (state) => state.position.positions;
export const selectPositionStatus = (state) => state.position.status;
export const selectPositionError = (state) => state.position.error;
export const selectSelectedPosition = (state) => state.position.selectedPosition;
export const selectPositionFilters = (state) => state.position.filters;
export const selectKpiData = (state) => state.position.kpiData;

// Filtered positions selector
export const selectFilteredPositions = (state) => {
  const { positions, filters } = state.position;
  
  return positions.filter((position) => {
    const normalizedPosition = {
      id: position.id ?? position._id ?? position.positionId ?? Math.random().toString(36).slice(2),
      title: position.title ?? position.name ?? "Untitled",
      status: (position.status ?? "").charAt(0).toUpperCase() + (position.status ?? "").slice(1),
    };
    
    if (filters.status !== "All" && normalizedPosition.status !== filters.status) {
      return false;
    }
    
    if (filters.role !== "All Position" && normalizedPosition.title !== filters.role) {
      return false;
    }
    
    return true;
  });
};

// Loading state selectors
export const selectIsLoading = (state) => state.position.status === "loading";
export const selectIsError = (state) => state.position.status === "failed";
export const selectIsSuccess = (state) => state.position.status === "succeeded";

export default PositionSlice.reducer;
