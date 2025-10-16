import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cameraService from '../../services/cameraService';
import { handleApiError } from '../../services/errorService';

// Initial state
const initialState = {
  // Camera list (paginated)
  list: [],
  total: 0,
  pageIndex: 0,
  pageSize: 20,
  
  // Current camera being viewed/edited
  currentCamera: null,
  
  // Loading states
  loading: false,
  listLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  searchLoading: false,
  operationLoading: false, // For test connection, health check, etc.
  
  // Error states
  error: null,
  listError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  searchError: null,
  operationError: null,
  
  // Search and filters
  searchTerm: '',
  filters: {
    cameraType: null,
    status: null,
    locationId: null,
    isActive: null,
    enableFacialRecognition: null,
    minPriority: null,
    maxPriority: null,
  },
  sortBy: 'name',
  sortDirection: 'asc',
  
  // Camera operations
  streamInfo: {},
  healthResults: {},
  connectionTestResults: {},
  
  // Statistics
  statistics: {
    totalCameras: 0,
    activeCameras: 0,
    operationalCameras: 0,
    errorCameras: 0,
    byType: {},
    byStatus: {},
    byLocation: {},
  },
  
  // UI state
  selectedCameraIds: [],
  showFilters: false,
  viewMode: 'list', // 'list', 'grid', 'map'
  
  // Success messages
  lastSuccessMessage: null,
};

// Async thunks for camera operations

// Fetch cameras with pagination and filters
export const fetchCameras = createAsyncThunk(
  'cameras/fetchCameras',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const camerasState = state.cameras;
      
      const searchParams = {
        pageIndex: params.pageIndex ?? camerasState.pageIndex,
        pageSize: params.pageSize ?? camerasState.pageSize,
        searchTerm: params.searchTerm ?? camerasState.searchTerm,
        ...camerasState.filters,
        ...params.filters,
        sortBy: params.sortBy ?? camerasState.sortBy,
        sortDirection: params.sortDirection ?? camerasState.sortDirection,
        includeDeleted: params.includeDeleted ?? false,
      };

      const response = await cameraService.getCameras(searchParams);
      console.log(response)
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Fetch single camera by ID
export const fetchCameraById = createAsyncThunk(
  'cameras/fetchCameraById',
  async ({ id, includeDeleted = false, includeSensitiveData = false }, { rejectWithValue }) => {
    try {
      const response = await cameraService.getCameraById(id, { includeDeleted, includeSensitiveData });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Create new camera
export const createCamera = createAsyncThunk(
  'cameras/createCamera',
  async (cameraData, { rejectWithValue }) => {
    try {
      const response = await cameraService.createCamera(cameraData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Update existing camera
export const updateCamera = createAsyncThunk(
  'cameras/updateCamera',
  async ({ id, cameraData, testConnection = false }, { rejectWithValue }) => {
    try {
      const response = await cameraService.updateCamera(id, cameraData, { testConnection });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Delete camera
export const deleteCamera = createAsyncThunk(
  'cameras/deleteCamera',
  async ({ id, permanentDelete = false, forceDelete = false, deletionReason }, { rejectWithValue }) => {
    try {
      const response = await cameraService.deleteCamera(id, { 
        permanentDelete, 
        forceDelete, 
        deletionReason 
      });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Search cameras with advanced filters
export const searchCameras = createAsyncThunk(
  'cameras/searchCameras',
  async (searchCriteria, { rejectWithValue }) => {
    try {
      const response = await cameraService.searchCameras(searchCriteria);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Test camera connection
export const testCameraConnection = createAsyncThunk(
  'cameras/testConnection',
  async ({ id, updateStatus = true }, { rejectWithValue }) => {
    try {
      const response = await cameraService.testConnection(id, { updateStatus });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Test connection with parameters
export const testConnectionParameters = createAsyncThunk(
  'cameras/testConnectionParameters',
  async (connectionParams, { rejectWithValue }) => {
    try {
      const response = await cameraService.testConnectionParameters(connectionParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Start camera stream
export const startCameraStream = createAsyncThunk(
  'cameras/startStream',
  async (id, { rejectWithValue }) => {
    try {
      const response = await cameraService.startStream(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Stop camera stream
export const stopCameraStream = createAsyncThunk(
  'cameras/stopStream',
  async ({ id, graceful = true }, { rejectWithValue }) => {
    try {
      const response = await cameraService.stopStream(id, { graceful });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Get stream information
export const getStreamInfo = createAsyncThunk(
  'cameras/getStreamInfo',
  async (id, { rejectWithValue }) => {
    try {
      const response = await cameraService.getStreamInfo(id);
      return { id, streamInfo: response.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Perform health check
export const performHealthCheck = createAsyncThunk(
  'cameras/performHealthCheck',
  async (id, { rejectWithValue }) => {
    try {
      const response = await cameraService.performHealthCheck(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Perform health check on all cameras
export const performHealthCheckAll = createAsyncThunk(
  'cameras/performHealthCheckAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cameraService.performHealthCheckAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Capture frame
export const captureFrame = createAsyncThunk(
  'cameras/captureFrame',
  async (id, { rejectWithValue }) => {
    try {
      const response = await cameraService.captureFrame(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Camera slice
const camerasSlice = createSlice({
  name: 'cameras',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.searchError = null;
      state.operationError = null;
    },
    
    // Clear current camera
    clearCurrentCamera: (state) => {
      state.currentCamera = null;
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchTerm = '';
    },
    
    // Update search term
    updateSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    
    // Update sorting
    updateSorting: (state, action) => {
      const { sortBy, sortDirection } = action.payload;
      state.sortBy = sortBy;
      state.sortDirection = sortDirection;
    },
    
    // Toggle filters visibility
    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    
    // Set view mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    // Select/deselect cameras
    selectCamera: (state, action) => {
      const id = action.payload;
      if (!state.selectedCameraIds.includes(id)) {
        state.selectedCameraIds.push(id);
      }
    },
    
    deselectCamera: (state, action) => {
      const id = action.payload;
      state.selectedCameraIds = state.selectedCameraIds.filter(cameraId => cameraId !== id);
    },
    
    selectAllCameras: (state) => {
      state.selectedCameraIds = state.list.map(camera => camera.id);
    },
    
    deselectAllCameras: (state) => {
      state.selectedCameraIds = [];
    },
    
    // Clear success message
    clearSuccessMessage: (state) => {
      state.lastSuccessMessage = null;
    },
    
    // Update pagination
    updatePagination: (state, action) => {
      const { pageIndex, pageSize } = action.payload;
      if (pageIndex !== undefined) state.pageIndex = pageIndex;
      if (pageSize !== undefined) state.pageSize = pageSize;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cameras
      .addCase(fetchCameras.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchCameras.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.items || [];
        state.total = action.payload.totalCount || 0;
        state.pageIndex = action.payload.pageIndex || 0;
        state.pageSize = action.payload.pageSize || 20;
        
        // Update statistics
        state.statistics.totalCameras = state.total;
        state.statistics.activeCameras = state.list.filter(c => c.isActive).length;
        state.statistics.operationalCameras = state.list.filter(c => c.isOperational).length;
        state.statistics.errorCameras = state.list.filter(c => c.status === 'Error').length;
      })
      .addCase(fetchCameras.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      })
      
      // Fetch single camera
      .addCase(fetchCameraById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCameraById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCamera = action.payload;
      })
      .addCase(fetchCameraById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create camera
      .addCase(createCamera.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createCamera.fulfilled, (state, action) => {
        state.createLoading = false;
        state.list.unshift(action.payload);
        state.total += 1;
        state.lastSuccessMessage = `Camera "${action.payload.name}" created successfully`;
      })
      .addCase(createCamera.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      // Update camera
      .addCase(updateCamera.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateCamera.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.list.findIndex(camera => camera.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentCamera && state.currentCamera.id === action.payload.id) {
          state.currentCamera = action.payload;
        }
        state.lastSuccessMessage = `Camera "${action.payload.name}" updated successfully`;
      })
      .addCase(updateCamera.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Delete camera
      .addCase(deleteCamera.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteCamera.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.list = state.list.filter(camera => camera.id !== action.payload.id);
        state.total -= 1;
        state.selectedCameraIds = state.selectedCameraIds.filter(id => id !== action.payload.id);
        state.lastSuccessMessage = action.payload.message || 'Camera deleted successfully';
      })
      .addCase(deleteCamera.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })
      
      // Search cameras
      .addCase(searchCameras.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchCameras.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.list = action.payload.items || [];
        state.total = action.payload.totalCount || 0;
        state.pageIndex = action.payload.pageIndex || 0;
        state.pageSize = action.payload.pageSize || 20;
      })
      .addCase(searchCameras.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      })
      
      // Camera operations
      .addCase(testCameraConnection.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(testCameraConnection.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.connectionTestResults[action.payload.cameraId] = action.payload;
        
        // Update camera status in list if needed
        const index = state.list.findIndex(camera => camera.id === action.payload.cameraId);
        if (index !== -1 && action.payload.success) {
          state.list[index].status = 'Active';
          state.list[index].isOperational = true;
        }
      })
      .addCase(testCameraConnection.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })
      
      .addCase(performHealthCheck.fulfilled, (state, action) => {
        state.healthResults[action.payload.cameraId] = action.payload;
        
        // Update camera in list
        const index = state.list.findIndex(camera => camera.id === action.payload.cameraId);
        if (index !== -1) {
          state.list[index].status = action.payload.status;
          state.list[index].isOperational = action.payload.isHealthy;
        }
      })
      
      .addCase(getStreamInfo.fulfilled, (state, action) => {
        state.streamInfo[action.payload.id] = action.payload.streamInfo;
      })
      
      .addCase(startCameraStream.fulfilled, (state, action) => {
        state.streamInfo[action.payload.id] = {
          isStreaming: true,
          startedAt: new Date().toISOString(),
        };
      })
      
      .addCase(stopCameraStream.fulfilled, (state, action) => {
        if (state.streamInfo[action.payload.id]) {
          state.streamInfo[action.payload.id].isStreaming = false;
        }
      });
  },
});

export const {
  clearErrors,
  clearCurrentCamera,
  updateFilters,
  clearFilters,
  updateSearchTerm,
  updateSorting,
  toggleFilters,
  setViewMode,
  selectCamera,
  deselectCamera,
  selectAllCameras,
  deselectAllCameras,
  clearSuccessMessage,
  updatePagination,
} = camerasSlice.actions;

export default camerasSlice.reducer;