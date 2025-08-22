import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import timeSlotsService from '../../services/timeSlotsService';
import { handleApiError } from '../../services/errorService';

// Initial state
const initialState = {
  // Time slot list
  list: [],
  total: 0,
  pagination: {
    pageIndex: 0,
    pageSize: 50,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  },

  // Current time slot being viewed/edited
  currentTimeSlot: null,

  // Loading states
  loading: false,
  listLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  // Error states
  error: null,
  listError: null,
  createError: null,
  updateError: null,
  deleteError: null,

  // Filters and search
  filters: {
    locationId: null,
    activeOnly: true,
    sortBy: 'DisplayOrder',
    sortDirection: 'asc'
  },

  // Available time slots for specific date/location
  availableSlots: {
    list: [],
    loading: false,
    error: null,
    date: null,
    locationId: null
  },

  // UI state
  selectedTimeSlots: [],
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showAvailabilityModal: false
};

// Async thunks for time slot operations

/**
 * Get time slots with pagination and filtering
 */
export const getTimeSlots = createAsyncThunk(
  'timeSlots/getTimeSlots',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const filters = state.timeSlots.filters;

      const queryParams = {
        locationId: params.locationId ?? filters.locationId,
        activeOnly: params.activeOnly ?? filters.activeOnly,
        pageIndex: params.pageIndex ?? 0,
        pageSize: params.pageSize ?? 50,
        sortBy: params.sortBy ?? filters.sortBy ?? 'DisplayOrder',
        sortDirection: params.sortDirection ?? filters.sortDirection ?? 'asc'
      };

      const response = await timeSlotsService.getTimeSlots(queryParams);
      return { response, queryParams };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get time slot by ID
 */
export const getTimeSlotById = createAsyncThunk(
  'timeSlots/getTimeSlotById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await timeSlotsService.getTimeSlotById(id);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Create new time slot
 */
export const createTimeSlot = createAsyncThunk(
  'timeSlots/createTimeSlot',
  async (timeSlotData, { rejectWithValue }) => {
    try {
      const validation = timeSlotsService.validateTimeSlotData(timeSlotData, false);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors);
      }

      const response = await timeSlotsService.createTimeSlot(timeSlotData);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Update time slot
 */
export const updateTimeSlot = createAsyncThunk(
  'timeSlots/updateTimeSlot',
  async ({ id, timeSlotData }, { rejectWithValue }) => {
    try {
      const validation = timeSlotsService.validateTimeSlotData(timeSlotData, true);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors);
      }

      const response = await timeSlotsService.updateTimeSlot(id, timeSlotData);
      return { id, timeSlot: response };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Delete time slot
 */
export const deleteTimeSlot = createAsyncThunk(
  'timeSlots/deleteTimeSlot',
  async ({ id, hardDelete = false }, { rejectWithValue }) => {
    try {
      await timeSlotsService.deleteTimeSlot(id, hardDelete);
      return { id, hardDelete };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get available time slots for specific date/location
 */
export const getAvailableTimeSlots = createAsyncThunk(
  'timeSlots/getAvailableTimeSlots',
  async (params, { rejectWithValue }) => {
    try {
      const response = await timeSlotsService.getAvailableTimeSlots(params);
      return { response, params };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Time slots slice
const timeSlotsSlice = createSlice({
  name: 'timeSlots',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.availableSlots.error = null;
    },

    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Set current time slot
    setCurrentTimeSlot: (state, action) => {
      state.currentTimeSlot = action.payload;
    },

    // Clear current time slot
    clearCurrentTimeSlot: (state) => {
      state.currentTimeSlot = null;
    },

    // Update selected time slots
    setSelectedTimeSlots: (state, action) => {
      state.selectedTimeSlots = action.payload;
    },

    // Toggle time slot selection
    toggleTimeSlotSelection: (state, action) => {
      const timeSlotId = action.payload;
      const index = state.selectedTimeSlots.indexOf(timeSlotId);
      if (index === -1) {
        state.selectedTimeSlots.push(timeSlotId);
      } else {
        state.selectedTimeSlots.splice(index, 1);
      }
    },

    // Clear selections
    clearSelections: (state) => {
      state.selectedTimeSlots = [];
    },

    // Modal controls
    showCreateModal: (state) => {
      state.showCreateModal = true;
    },

    hideCreateModal: (state) => {
      state.showCreateModal = false;
      state.createError = null;
    },

    showEditModal: (state, action) => {
      state.showEditModal = true;
      state.currentTimeSlot = action.payload;
    },

    hideEditModal: (state) => {
      state.showEditModal = false;
      state.currentTimeSlot = null;
      state.updateError = null;
    },

    showDeleteModal: (state, action) => {
      state.showDeleteModal = true;
      state.currentTimeSlot = action.payload;
    },

    hideDeleteModal: (state) => {
      state.showDeleteModal = false;
      state.currentTimeSlot = null;
      state.deleteError = null;
    },

    showAvailabilityModal: (state) => {
      state.showAvailabilityModal = true;
    },

    hideAvailabilityModal: (state) => {
      state.showAvailabilityModal = false;
      state.availableSlots.error = null;
    },

    // Clear available slots
    clearAvailableSlots: (state) => {
      state.availableSlots.list = [];
      state.availableSlots.error = null;
      state.availableSlots.date = null;
      state.availableSlots.locationId = null;
    },

    // Hydrate state for persistence
    hydrateState: (state, action) => {
      const { 
        filters, 
        selectedTimeSlots, 
        showCreateModal, 
        showEditModal, 
        showDeleteModal,
        showAvailabilityModal 
      } = action.payload;

      if (filters) state.filters = { ...state.filters, ...filters };
      if (selectedTimeSlots) state.selectedTimeSlots = selectedTimeSlots;
      if (showCreateModal !== undefined) state.showCreateModal = showCreateModal;
      if (showEditModal !== undefined) state.showEditModal = showEditModal;
      if (showDeleteModal !== undefined) state.showDeleteModal = showDeleteModal;
      if (showAvailabilityModal !== undefined) state.showAvailabilityModal = showAvailabilityModal;
    }
  },
  extraReducers: (builder) => {
    // Get time slots
    builder
      .addCase(getTimeSlots.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getTimeSlots.fulfilled, (state, action) => {
        state.listLoading = false;
        const { response, queryParams } = action.payload;
        console.log(action)
        state.list = response.items || [];
        state.total = response.totalCount || 0;
        state.pagination = {
          pageIndex: response.pageIndex || queryParams.pageIndex,
          pageSize: response.pageSize || queryParams.pageSize,
          totalPages: response.totalPages || 0,
          hasNext: response.hasNextPage || false,
          hasPrevious: response.hasPreviousPage || false
        };

        // Update filters with current query
        state.filters = { ...state.filters, ...queryParams };
      })
      .addCase(getTimeSlots.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload?.message || 'Failed to load time slots';
      });

    // Get time slot by ID
    builder
      .addCase(getTimeSlotById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTimeSlotById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTimeSlot = action.payload;
      })
      .addCase(getTimeSlotById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load time slot';
      });

    // Create time slot
    builder
      .addCase(createTimeSlot.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createTimeSlot.fulfilled, (state, action) => {
        state.createLoading = false;
        state.list.unshift(action.payload);
        state.total += 1;
        state.showCreateModal = false;
      })
      .addCase(createTimeSlot.rejected, (state, action) => {
        state.createLoading = false;

        if (Array.isArray(action.payload)) {
          state.createError = action.payload;
        } else if (typeof action.payload === 'object' && action.payload.message) {
          state.createError = [action.payload.message];
        } else if (typeof action.payload === 'string') {
          state.createError = [action.payload];
        } else {
          state.createError = ['Failed to create time slot'];
        }
      });

    // Update time slot
    builder
      .addCase(updateTimeSlot.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateTimeSlot.fulfilled, (state, action) => {
        state.updateLoading = false;
        const { id, timeSlot } = action.payload;

        // Update in list
        const index = state.list.findIndex(ts => ts.id === id);
        if (index !== -1) {
          state.list[index] = timeSlot;
        }

        // Update current time slot if it's the same
        if (state.currentTimeSlot?.id === id) {
          state.currentTimeSlot = timeSlot;
        }

        state.showEditModal = false;
      })
      .addCase(updateTimeSlot.rejected, (state, action) => {
        state.updateLoading = false;

        if (Array.isArray(action.payload)) {
          state.updateError = action.payload;
        } else if (typeof action.payload === 'object' && action.payload.message) {
          state.updateError = [action.payload.message];
        } else if (typeof action.payload === 'string') {
          state.updateError = [action.payload];
        } else {
          state.updateError = ['Failed to update time slot'];
        }
      });

    // Delete time slot
    builder
      .addCase(deleteTimeSlot.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteTimeSlot.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { id, hardDelete } = action.payload;

        if (hardDelete) {
          // Remove completely from list
          state.list = state.list.filter(ts => ts.id !== id);
          state.total -= 1;
        } else {
          // Update isActive status for soft delete
          const index = state.list.findIndex(ts => ts.id === id);
          if (index !== -1) {
            state.list[index].isActive = false;
          }
        }

        // Clear current time slot if it's the deleted one
        if (state.currentTimeSlot?.id === id) {
          state.currentTimeSlot = null;
        }

        // Remove from selections
        state.selectedTimeSlots = state.selectedTimeSlots.filter(tsId => tsId !== id);

        state.showDeleteModal = false;
      })
      .addCase(deleteTimeSlot.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload?.message || 'Failed to delete time slot';
      });

    // Get available time slots
    builder
      .addCase(getAvailableTimeSlots.pending, (state) => {
        state.availableSlots.loading = true;
        state.availableSlots.error = null;
      })
      .addCase(getAvailableTimeSlots.fulfilled, (state, action) => {
        state.availableSlots.loading = false;
        const { response, params } = action.payload;

        state.availableSlots.list = response || [];
        state.availableSlots.date = params.date;
        state.availableSlots.locationId = params.locationId;
      })
      .addCase(getAvailableTimeSlots.rejected, (state, action) => {
        state.availableSlots.loading = false;
        state.availableSlots.error = action.payload?.message || 'Failed to load available time slots';
      });
  }
});

// Export actions
export const {
  clearError,
  updateFilters,
  resetFilters,
  setCurrentTimeSlot,
  clearCurrentTimeSlot,
  setSelectedTimeSlots,
  toggleTimeSlotSelection,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  showAvailabilityModal,
  hideAvailabilityModal,
  clearAvailableSlots,
  hydrateState
} = timeSlotsSlice.actions;

// Export reducer
export default timeSlotsSlice.reducer;