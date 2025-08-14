import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import visitPurposeService from '../../services/visitPurposeService';
import { handleApiError } from '../../services/errorService';

// Initial state
const initialState = {
  // Visit purpose list
  list: [],
  total: 0,
  
  // Current visit purpose being viewed/edited
  currentVisitPurpose: null,
  
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
  
  // Filters and UI state
  filters: {
    requiresApproval: null,
    includeInactive: false,
    searchTerm: ''
  },
  
  // Selection state
  selectedVisitPurposes: [],
  
  // Modal states
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  
  // Cache for active purposes (frequently used in dropdowns)
  activePurposes: [],
  activePurposesLoading: false,
  activePurposesError: null,
  activePurposesLastFetch: null,
  
  // Last updated timestamp
  lastUpdated: null
};
// Async thunks for visit purpose operations

// Get all visit purposes with filtering
export const getVisitPurposes = createAsyncThunk(
  'visitPurposes/getVisitPurposes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await visitPurposeService.getVisitPurposes(params);
      return { data, params };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get visit purpose by ID
export const getVisitPurposeById = createAsyncThunk(
  'visitPurposes/getVisitPurposeById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await visitPurposeService.getVisitPurposeById(id);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Create new visit purpose
export const createVisitPurpose = createAsyncThunk(
  'visitPurposes/createVisitPurpose',
  async (visitPurposeData, { rejectWithValue }) => {
    try {
      const data = await visitPurposeService.createVisitPurpose(visitPurposeData);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update existing visit purpose
export const updateVisitPurpose = createAsyncThunk(
  'visitPurposes/updateVisitPurpose',
  async ({ id, visitPurposeData }, { rejectWithValue }) => {
    try {
      const data = await visitPurposeService.updateVisitPurpose(id, visitPurposeData);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete visit purpose
export const deleteVisitPurpose = createAsyncThunk(
  'visitPurposes/deleteVisitPurpose',
  async ({ id, hardDelete = false }, { rejectWithValue }) => {
    try {
      await visitPurposeService.deleteVisitPurpose(id, hardDelete);
      return { id, hardDelete };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get active visit purposes (for dropdowns)
export const getActiveVisitPurposes = createAsyncThunk(
  'visitPurposes/getActiveVisitPurposes',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if we have recent cached data (5 minutes)
      const state = getState().visitPurposes;
      const now = Date.now();
      const cacheTimeout = 5 * 60 * 1000; // 5 minutes
      
      if (state.activePurposesLastFetch && 
          (now - state.activePurposesLastFetch) < cacheTimeout &&
          state.activePurposes.length > 0) {
        return state.activePurposes;
      }
      
      const data = await visitPurposeService.getActiveVisitPurposes();
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);
// Visit Purposes slice
const visitPurposesSlice = createSlice({
  name: 'visitPurposes',
  initialState,
  reducers: {
    // Filter actions
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = {
        requiresApproval: null,
        includeInactive: false,
        searchTerm: ''
      };
    },
    
    // Selection actions
    setSelectedVisitPurposes: (state, action) => {
      state.selectedVisitPurposes = action.payload;
    },
    
    toggleVisitPurposeSelection: (state, action) => {
      const id = action.payload;
      const index = state.selectedVisitPurposes.indexOf(id);
      if (index === -1) {
        state.selectedVisitPurposes.push(id);
      } else {
        state.selectedVisitPurposes.splice(index, 1);
      }
    },
    
    clearSelections: (state) => {
      state.selectedVisitPurposes = [];
    },
    
    // Modal actions
    showCreateModal: (state) => {
      state.showCreateModal = true;
    },
    
    hideCreateModal: (state) => {
      state.showCreateModal = false;
    },
    
    showEditModal: (state, action) => {
      state.showEditModal = true;
      state.currentVisitPurpose = action.payload;
    },
    
    hideEditModal: (state) => {
      state.showEditModal = false;
      state.currentVisitPurpose = null;
    },
    
    showDeleteModal: (state, action) => {
      state.showDeleteModal = true;
      state.currentVisitPurpose = action.payload;
    },
    
    hideDeleteModal: (state) => {
      state.showDeleteModal = false;
      state.currentVisitPurpose = null;
    },
    
    // Error clearing
    clearError: (state) => {
      state.error = null;
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.activePurposesError = null;
    },
    
    // Set current visit purpose
    setCurrentVisitPurpose: (state, action) => {
      state.currentVisitPurpose = action.payload;
    },
    
    // Clear current visit purpose
    clearCurrentVisitPurpose: (state) => {
      state.currentVisitPurpose = null;
    }
  },  extraReducers: (builder) => {
    // Get visit purposes
    builder
      .addCase(getVisitPurposes.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getVisitPurposes.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.data || [];
        state.total = action.payload.data?.length || 0;
        state.lastUpdated = Date.now();
        state.listError = null;
      })
      .addCase(getVisitPurposes.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
        state.list = [];
        state.total = 0;
      })
      
      // Get visit purpose by ID
      .addCase(getVisitPurposeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVisitPurposeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVisitPurpose = action.payload;
        state.error = null;
      })
      .addCase(getVisitPurposeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentVisitPurpose = null;
      })
      
      // Create visit purpose
      .addCase(createVisitPurpose.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createVisitPurpose.fulfilled, (state, action) => {
        state.createLoading = false;
        state.list.push(action.payload);
        state.total += 1;
        state.showCreateModal = false;
        state.createError = null;
        state.lastUpdated = Date.now();
        // Clear active purposes cache to force refresh
        state.activePurposesLastFetch = null;
      })
      .addCase(createVisitPurpose.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })      
      // Update visit purpose
      .addCase(updateVisitPurpose.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateVisitPurpose.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.list.findIndex(purpose => purpose.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.currentVisitPurpose = action.payload;
        state.showEditModal = false;
        state.updateError = null;
        state.lastUpdated = Date.now();
        // Clear active purposes cache to force refresh
        state.activePurposesLastFetch = null;
      })
      .addCase(updateVisitPurpose.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Delete visit purpose
      .addCase(deleteVisitPurpose.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteVisitPurpose.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { id, hardDelete } = action.payload;
        
        if (hardDelete) {
          // Remove from list completely
          state.list = state.list.filter(purpose => purpose.id !== id);
          state.total -= 1;
        } else {
          // Mark as inactive (soft delete)
          const index = state.list.findIndex(purpose => purpose.id === id);
          if (index !== -1) {
            state.list[index].isActive = false;
          }
        }
        
        state.showDeleteModal = false;
        state.currentVisitPurpose = null;
        state.deleteError = null;
        state.lastUpdated = Date.now();
        // Clear active purposes cache to force refresh
        state.activePurposesLastFetch = null;
        
        // Remove from selections if selected
        state.selectedVisitPurposes = state.selectedVisitPurposes.filter(selectedId => selectedId !== id);
      })
      .addCase(deleteVisitPurpose.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })      
      // Get active visit purposes (for dropdowns)
      .addCase(getActiveVisitPurposes.pending, (state) => {
        state.activePurposesLoading = true;
        state.activePurposesError = null;
      })
      .addCase(getActiveVisitPurposes.fulfilled, (state, action) => {
        state.activePurposesLoading = false;
        state.activePurposes = action.payload;
        state.activePurposesLastFetch = Date.now();
        state.activePurposesError = null;
      })
      .addCase(getActiveVisitPurposes.rejected, (state, action) => {
        state.activePurposesLoading = false;
        state.activePurposesError = action.payload;
      });
  }
});

// Export actions
export const {
  updateFilters,
  resetFilters,
  setSelectedVisitPurposes,
  toggleVisitPurposeSelection,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  clearError,
  setCurrentVisitPurpose,
  clearCurrentVisitPurpose
} = visitPurposesSlice.actions;

// Export reducer
export default visitPurposesSlice.reducer;