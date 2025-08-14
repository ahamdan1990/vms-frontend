import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import locationService from '../../services/locationService';
import { handleApiError } from '../../services/errorService';

// Initial state
const initialState = {
  // Location list (hierarchical)
  list: [],
  total: 0,
  tree: [], // Hierarchical structure
  
  // Current location being viewed/edited
  currentLocation: null,
  
  // Loading states
  loading: false,
  listLoading: false,
  treeLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  
  // Error states
  error: null,
  listError: null,
  treeError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  
  // Filters and UI state
  filters: {
    locationType: '',
    rootOnly: false,
    includeChildren: true,
    includeInactive: false,
    searchTerm: ''
  },
  
  // Selection state
  selectedLocations: [],
  
  // Modal states
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  
  // Cache for active locations (frequently used in dropdowns)
  activeLocations: [],
  activeLocationsLoading: false,
  activeLocationsError: null,
  activeLocationsLastFetch: null,
  
  // Root locations cache (for hierarchy building)
  rootLocations: [],
  rootLocationsLoading: false,
  rootLocationsError: null,
  rootLocationsLastFetch: null,
  
  // Last updated timestamp
  lastUpdated: null
};
// Async thunks for location operations

// Get all locations with filtering
export const getLocations = createAsyncThunk(
  'locations/getLocations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await locationService.getLocations(params);
      return { data, params };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get location hierarchy tree
export const getLocationTree = createAsyncThunk(
  'locations/getLocationTree',
  async (rootId = null, { rejectWithValue }) => {
    try {
      const data = await locationService.getLocationTree(rootId);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get location by ID
export const getLocationById = createAsyncThunk(
  'locations/getLocationById',
  async ({ id, includeChildren = false }, { rejectWithValue }) => {
    try {
      const data = await locationService.getLocationById(id, includeChildren);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Create new location
export const createLocation = createAsyncThunk(
  'locations/createLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      const data = await locationService.createLocation(locationData);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update existing location
export const updateLocation = createAsyncThunk(
  'locations/updateLocation',
  async ({ id, locationData }, { rejectWithValue }) => {
    try {
      const data = await locationService.updateLocation(id, locationData);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete location
export const deleteLocation = createAsyncThunk(
  'locations/deleteLocation',
  async ({ id, hardDelete = false }, { rejectWithValue }) => {
    try {
      await locationService.deleteLocation(id, hardDelete);
      return { id, hardDelete };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get active locations (for dropdowns)
export const getActiveLocations = createAsyncThunk(
  'locations/getActiveLocations',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if we have recent cached data (5 minutes)
      const state = getState().locations;
      const now = Date.now();
      const cacheTimeout = 5 * 60 * 1000; // 5 minutes
      
      if (state.activeLocationsLastFetch && 
          (now - state.activeLocationsLastFetch) < cacheTimeout &&
          state.activeLocations.length > 0) {
        return state.activeLocations;
      }
      
      const data = await locationService.getActiveLocations();
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get root locations (for hierarchy building)
export const getRootLocations = createAsyncThunk(
  'locations/getRootLocations',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if we have recent cached data (5 minutes)
      const state = getState().locations;
      const now = Date.now();
      const cacheTimeout = 5 * 60 * 1000; // 5 minutes
      
      if (state.rootLocationsLastFetch && 
          (now - state.rootLocationsLastFetch) < cacheTimeout &&
          state.rootLocations.length > 0) {
        return state.rootLocations;
      }
      
      const data = await locationService.getRootLocations();
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);
// Locations slice
const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    // Filter actions
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = {
        locationType: '',
        rootOnly: false,
        includeChildren: true,
        includeInactive: false,
        searchTerm: ''
      };
    },
    
    // Selection actions
    setSelectedLocations: (state, action) => {
      state.selectedLocations = action.payload;
    },
    
    toggleLocationSelection: (state, action) => {
      const id = action.payload;
      const index = state.selectedLocations.indexOf(id);
      if (index === -1) {
        state.selectedLocations.push(id);
      } else {
        state.selectedLocations.splice(index, 1);
      }
    },
    
    clearSelections: (state) => {
      state.selectedLocations = [];
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
      state.currentLocation = action.payload;
    },
    
    hideEditModal: (state) => {
      state.showEditModal = false;
      state.currentLocation = null;
    },
    
    showDeleteModal: (state, action) => {
      state.showDeleteModal = true;
      state.currentLocation = action.payload;
    },
    
    hideDeleteModal: (state) => {
      state.showDeleteModal = false;
      state.currentLocation = null;
    },
    
    // Error clearing
    clearError: (state) => {
      state.error = null;
      state.listError = null;
      state.treeError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.activeLocationsError = null;
      state.rootLocationsError = null;
    },
    
    // Set current location
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    
    // Clear current location
    clearCurrentLocation: (state) => {
      state.currentLocation = null;
    }
  },  extraReducers: (builder) => {
    // Get locations
    builder
      .addCase(getLocations.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getLocations.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.data || [];
        state.total = action.payload.data?.length || 0;
        state.lastUpdated = Date.now();
        state.listError = null;
      })
      .addCase(getLocations.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
        state.list = [];
        state.total = 0;
      })
      
      // Get location tree
      .addCase(getLocationTree.pending, (state) => {
        state.treeLoading = true;
        state.treeError = null;
      })
      .addCase(getLocationTree.fulfilled, (state, action) => {
        state.treeLoading = false;
        state.tree = action.payload || [];
        state.treeError = null;
      })
      .addCase(getLocationTree.rejected, (state, action) => {
        state.treeLoading = false;
        state.treeError = action.payload;
        state.tree = [];
      })
      
      // Get location by ID
      .addCase(getLocationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLocationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLocation = action.payload;
        state.error = null;
      })
      .addCase(getLocationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentLocation = null;
      })      
      // Create location
      .addCase(createLocation.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.createLoading = false;
        state.list.push(action.payload);
        state.total += 1;
        state.showCreateModal = false;
        state.createError = null;
        state.lastUpdated = Date.now();
        // Clear cached data to force refresh
        state.activeLocationsLastFetch = null;
        state.rootLocationsLastFetch = null;
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      // Update location
      .addCase(updateLocation.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.list.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.currentLocation = action.payload;
        state.showEditModal = false;
        state.updateError = null;
        state.lastUpdated = Date.now();
        // Clear cached data to force refresh
        state.activeLocationsLastFetch = null;
        state.rootLocationsLastFetch = null;
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Delete location
      .addCase(deleteLocation.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { id, hardDelete } = action.payload;
        
        if (hardDelete) {
          // Remove from list completely
          state.list = state.list.filter(location => location.id !== id);
          state.total -= 1;
        } else {
          // Mark as inactive (soft delete)
          const index = state.list.findIndex(location => location.id === id);
          if (index !== -1) {
            state.list[index].isActive = false;
          }
        }
        
        state.showDeleteModal = false;
        state.currentLocation = null;
        state.deleteError = null;
        state.lastUpdated = Date.now();
        // Clear cached data to force refresh
        state.activeLocationsLastFetch = null;
        state.rootLocationsLastFetch = null;
        
        // Remove from selections if selected
        state.selectedLocations = state.selectedLocations.filter(selectedId => selectedId !== id);
      })
      .addCase(deleteLocation.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })      
      // Get active locations (for dropdowns)
      .addCase(getActiveLocations.pending, (state) => {
        state.activeLocationsLoading = true;
        state.activeLocationsError = null;
      })
      .addCase(getActiveLocations.fulfilled, (state, action) => {
        state.activeLocationsLoading = false;
        state.activeLocations = action.payload;
        state.activeLocationsLastFetch = Date.now();
        state.activeLocationsError = null;
      })
      .addCase(getActiveLocations.rejected, (state, action) => {
        state.activeLocationsLoading = false;
        state.activeLocationsError = action.payload;
      })
      
      // Get root locations (for hierarchy building)
      .addCase(getRootLocations.pending, (state) => {
        state.rootLocationsLoading = true;
        state.rootLocationsError = null;
      })
      .addCase(getRootLocations.fulfilled, (state, action) => {
        state.rootLocationsLoading = false;
        state.rootLocations = action.payload;
        state.rootLocationsLastFetch = Date.now();
        state.rootLocationsError = null;
      })
      .addCase(getRootLocations.rejected, (state, action) => {
        state.rootLocationsLoading = false;
        state.rootLocationsError = action.payload;
      });
  }
});

// Export actions
export const {
  updateFilters,
  resetFilters,
  setSelectedLocations,
  toggleLocationSelection,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  clearError,
  setCurrentLocation,
  clearCurrentLocation
} = locationsSlice.actions;

// Export reducer
export default locationsSlice.reducer;