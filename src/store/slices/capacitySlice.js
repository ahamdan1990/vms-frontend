import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import capacityService from '../../services/capacityService';
import { handleApiError } from '../../services/errorService';

// Initial state
const initialState = {
  // Capacity validation
  validation: {
    result: null,
    loading: false,
    error: null
  },

  // Current occupancy
  occupancy: {
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  },

  // Capacity statistics
  statistics: {
    data: null,
    loading: false,
    error: null,
    dateRange: {
      startDate: null,
      endDate: null
    }
  },

  // Alternative time slots
  alternatives: {
    list: [],
    loading: false,
    error: null,
    originalRequest: null
  },

  // Capacity overview (multiple locations)
  overview: {
    data: [],
    loading: false,
    error: null,
    lastUpdated: null
  },

  // Capacity trends
  trends: {
    data: null,
    loading: false,
    error: null,
    parameters: null
  },

  // UI state
  selectedLocationId: null,
  selectedDateRange: {
    startDate: null,
    endDate: null
  },
  refreshInterval: null,
  autoRefresh: false,

  // Modals and dialogs
  showAlternativesModal: false,
  showStatisticsModal: false,
  showTrendsModal: false
};

// Async thunks for capacity operations

/**
 * Validate capacity for a specific request
 */
export const validateCapacity = createAsyncThunk(
  'capacity/validateCapacity',
  async (params, { rejectWithValue }) => {
    try {
      const validation = capacityService.validateCapacityRequest(params);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors);
      }

      const response = await capacityService.validateCapacity(params);
      return { response, params };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get current occupancy for location/time
 */
export const getOccupancy = createAsyncThunk(
  'capacity/getOccupancy',
  async (params, { rejectWithValue }) => {
    try {
      const response = await capacityService.getOccupancy(params);
      return { response, params, timestamp: new Date().toISOString() };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get capacity statistics for date range
 */
export const getStatistics = createAsyncThunk(
  'capacity/getStatistics',
  async (params, { rejectWithValue }) => {
    try {
      const validation = capacityService.validateStatisticsRequest(params);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors);
      }

      const response = await capacityService.getStatistics(params);
      return { response, params };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get alternative time slots
 */
export const getAlternativeTimeSlots = createAsyncThunk(
  'capacity/getAlternativeTimeSlots',
  async (params, { rejectWithValue }) => {
    try {
      const response = await capacityService.getAlternativeTimeSlots(params);
      return { response, params };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get capacity overview for multiple locations
 */
export const getCapacityOverview = createAsyncThunk(
  'capacity/getCapacityOverview',
  async (params, { rejectWithValue }) => {
    try {
      const response = await capacityService.getCapacityOverview(params);
      return { response, params, timestamp: new Date().toISOString() };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get capacity trends
 */
export const getCapacityTrends = createAsyncThunk(
  'capacity/getCapacityTrends',
  async (params, { rejectWithValue }) => {
    try {
      const validation = capacityService.validateTrendsRequest(params);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors);
      }

      const response = await capacityService.getCapacityTrends(params);
      return { response, params };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Capacity slice
const capacitySlice = createSlice({
  name: 'capacity',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state, action) => {
      const { section } = action.payload || {};
      if (section) {
        if (state[section]) {
          state[section].error = null;
        }
      } else {
        // Clear all errors
        state.validation.error = null;
        state.occupancy.error = null;
        state.statistics.error = null;
        state.alternatives.error = null;
        state.overview.error = null;
        state.trends.error = null;
      }
    },

    // Set selected location
    setSelectedLocationId: (state, action) => {
      state.selectedLocationId = action.payload;
    },

    // Set selected date range
    setSelectedDateRange: (state, action) => {
      state.selectedDateRange = action.payload;
    },

    // Toggle auto refresh
    setAutoRefresh: (state, action) => {
      state.autoRefresh = action.payload;
    },

    // Set refresh interval
    setRefreshInterval: (state, action) => {
      state.refreshInterval = action.payload;
    },

    // Clear validation result
    clearValidation: (state) => {
      state.validation.result = null;
      state.validation.error = null;
    },

    // Clear occupancy data
    clearOccupancy: (state) => {
      state.occupancy.data = null;
      state.occupancy.error = null;
      state.occupancy.lastUpdated = null;
    },

    // Clear statistics
    clearStatistics: (state) => {
      state.statistics.data = null;
      state.statistics.error = null;
    },

    // Clear alternatives
    clearAlternatives: (state) => {
      state.alternatives.list = [];
      state.alternatives.error = null;
      state.alternatives.originalRequest = null;
    },

    // Clear overview
    clearOverview: (state) => {
      state.overview.data = [];
      state.overview.error = null;
      state.overview.lastUpdated = null;
    },

    // Clear trends
    clearTrends: (state) => {
      state.trends.data = null;
      state.trends.error = null;
      state.trends.parameters = null;
    },

    // Modal controls
    showAlternativesModal: (state, action) => {
      state.showAlternativesModal = true;
      if (action.payload) {
        state.alternatives.originalRequest = action.payload;
      }
    },

    hideAlternativesModal: (state) => {
      state.showAlternativesModal = false;
      state.alternatives.error = null;
    },

    showStatisticsModal: (state) => {
      state.showStatisticsModal = true;
    },

    hideStatisticsModal: (state) => {
      state.showStatisticsModal = false;
      state.statistics.error = null;
    },

    showTrendsModal: (state) => {
      state.showTrendsModal = true;
    },

    hideTrendsModal: (state) => {
      state.showTrendsModal = false;
      state.trends.error = null;
    },

    // Reset entire state
    resetState: (state) => {
      return initialState;
    },

    // Hydrate state for persistence
    hydrateState: (state, action) => {
      const { 
        selectedLocationId, 
        selectedDateRange, 
        autoRefresh 
      } = action.payload;

      if (selectedLocationId !== undefined) state.selectedLocationId = selectedLocationId;
      if (selectedDateRange) state.selectedDateRange = selectedDateRange;
      if (autoRefresh !== undefined) state.autoRefresh = autoRefresh;
    }
  },
  extraReducers: (builder) => {
    // Validate capacity
    builder
      .addCase(validateCapacity.pending, (state) => {
        state.validation.loading = true;
        state.validation.error = null;
      })
      .addCase(validateCapacity.fulfilled, (state, action) => {
        state.validation.loading = false;
        state.validation.result = action.payload.response;
      })
      .addCase(validateCapacity.rejected, (state, action) => {
        state.validation.loading = false;
        
        if (Array.isArray(action.payload)) {
          state.validation.error = action.payload;
        } else if (typeof action.payload === 'object' && action.payload.message) {
          state.validation.error = [action.payload.message];
        } else if (typeof action.payload === 'string') {
          state.validation.error = [action.payload];
        } else {
          state.validation.error = ['Failed to validate capacity'];
        }
      });

    // Get occupancy
    builder
      .addCase(getOccupancy.pending, (state) => {
        state.occupancy.loading = true;
        state.occupancy.error = null;
      })
      .addCase(getOccupancy.fulfilled, (state, action) => {
        state.occupancy.loading = false;
        state.occupancy.data = action.payload.response;
        state.occupancy.lastUpdated = action.payload.timestamp;
      })
      .addCase(getOccupancy.rejected, (state, action) => {
        state.occupancy.loading = false;
        state.occupancy.error = action.payload?.message || 'Failed to load occupancy data';
      });

    // Get statistics
    builder
      .addCase(getStatistics.pending, (state) => {
        state.statistics.loading = true;
        state.statistics.error = null;
      })
      .addCase(getStatistics.fulfilled, (state, action) => {
        state.statistics.loading = false;
        state.statistics.data = action.payload.response;
        state.statistics.dateRange = {
          startDate: action.payload.params.startDate,
          endDate: action.payload.params.endDate
        };
      })
      .addCase(getStatistics.rejected, (state, action) => {
        state.statistics.loading = false;
        
        if (Array.isArray(action.payload)) {
          state.statistics.error = action.payload;
        } else {
          state.statistics.error = action.payload?.message || 'Failed to load statistics';
        }
      });

    // Get alternative time slots
    builder
      .addCase(getAlternativeTimeSlots.pending, (state) => {
        state.alternatives.loading = true;
        state.alternatives.error = null;
      })
      .addCase(getAlternativeTimeSlots.fulfilled, (state, action) => {
        state.alternatives.loading = false;
        state.alternatives.list = action.payload.response;
        state.alternatives.originalRequest = action.payload.params;
      })
      .addCase(getAlternativeTimeSlots.rejected, (state, action) => {
        state.alternatives.loading = false;
        state.alternatives.error = action.payload?.message || 'Failed to load alternatives';
      });

    // Get capacity overview
    builder
      .addCase(getCapacityOverview.pending, (state) => {
        state.overview.loading = true;
        state.overview.error = null;
      })
      .addCase(getCapacityOverview.fulfilled, (state, action) => {
        state.overview.loading = false;
        state.overview.data = Array.isArray(action.payload.response) 
          ? action.payload.response 
          : [action.payload.response];
        state.overview.lastUpdated = action.payload.timestamp;
      })
      .addCase(getCapacityOverview.rejected, (state, action) => {
        state.overview.loading = false;
        state.overview.error = action.payload?.message || 'Failed to load capacity overview';
      });

    // Get capacity trends
    builder
      .addCase(getCapacityTrends.pending, (state) => {
        state.trends.loading = true;
        state.trends.error = null;
      })
      .addCase(getCapacityTrends.fulfilled, (state, action) => {
        state.trends.loading = false;
        state.trends.data = action.payload.response;
        state.trends.parameters = action.payload.params;
      })
      .addCase(getCapacityTrends.rejected, (state, action) => {
        state.trends.loading = false;
        
        if (Array.isArray(action.payload)) {
          state.trends.error = action.payload;
        } else {
          state.trends.error = action.payload?.message || 'Failed to load trends';
        }
      });
  }
});

// Export actions
export const {
  clearError,
  setSelectedLocationId,
  setSelectedDateRange,
  setAutoRefresh,
  setRefreshInterval,
  clearValidation,
  clearOccupancy,
  clearStatistics,
  clearAlternatives,
  clearOverview,
  clearTrends,
  showAlternativesModal,
  hideAlternativesModal,
  showStatisticsModal,
  hideStatisticsModal,
  showTrendsModal,
  hideTrendsModal,
  resetState,
  hydrateState
} = capacitySlice.actions;

// Export reducer
export default capacitySlice.reducer;