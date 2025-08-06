import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import configurationService from '../../services/configurationService';
import { handleApiError } from '../../services/errorService';

// Initial state
const initialState = {
  // Configuration data
  configurations: {}, // Grouped by category
  currentConfiguration: null,
  configurationHistory: [],
  searchResults: [],
  
  // Loading states
  loading: false,
  listLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  historyLoading: false,
  searchLoading: false,
  validateLoading: false,
  cacheLoading: false,
  
  // Error states
  error: null,
  listError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  historyError: null,
  searchError: null,
  validateError: null,
  
  // UI states
  selectedCategory: null,
  searchQuery: '',
  showSensitive: false,
  
  // Cache status
  cacheLastInvalidated: null,
  
  // Validation results
  validationResult: null,
  
  // Restart requirements
  pendingRestarts: []
};

// Async thunks
export const fetchAllConfigurations = createAsyncThunk(
  'configuration/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await configurationService.getAllConfigurations();
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchCategoryConfiguration = createAsyncThunk(
  'configuration/fetchCategory',
  async (category, { rejectWithValue }) => {
    try {
      return await configurationService.getCategoryConfiguration(category);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);
export const fetchConfiguration = createAsyncThunk(
  'configuration/fetchOne',
  async ({ category, key }, { rejectWithValue }) => {
    try {
      return await configurationService.getConfiguration(category, key);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateConfiguration = createAsyncThunk(
  'configuration/update',
  async ({ category, key, value, reason }, { rejectWithValue }) => {
    try {
      const result = await configurationService.updateConfiguration(category, key, value, reason);
      return { category, key, result };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createConfiguration = createAsyncThunk(
  'configuration/create',
  async (configData, { rejectWithValue }) => {
    try {
      return await configurationService.createConfiguration(configData);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteConfiguration = createAsyncThunk(
  'configuration/delete',
  async ({ category, key, reason }, { rejectWithValue }) => {
    try {
      await configurationService.deleteConfiguration(category, key, reason);
      return { category, key };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchConfigurationHistory = createAsyncThunk(
  'configuration/fetchHistory',
  async ({ category, key, pageSize }, { rejectWithValue }) => {
    try {
      return await configurationService.getConfigurationHistory(category, key, pageSize);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const searchConfigurations = createAsyncThunk(
  'configuration/search',
  async ({ searchTerm, category }, { rejectWithValue }) => {
    try {
      return await configurationService.searchConfigurations(searchTerm, category);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const validateConfiguration = createAsyncThunk(
  'configuration/validate',
  async ({ category, key, value }, { rejectWithValue }) => {
    try {
      return await configurationService.validateConfiguration(category, key, value);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const invalidateCache = createAsyncThunk(
  'configuration/invalidateCache',
  async (category, { rejectWithValue }) => {
    try {
      const result = await configurationService.invalidateCache(category);
      return { category, result };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const transformConfigurations = (backendData) => {
  const transformed = {};
  
  Object.keys(backendData).forEach(category => {
    const categoryData = backendData[category];
    transformed[category] = Object.keys(categoryData).map(key => ({
      key,
      value: categoryData[key],
      category,
      // Add default properties that your component expects
      dataType: getDataType(categoryData[key]),
      description: null,
      isEncrypted: false,
      isSensitive: key.toLowerCase().includes('secret') || key.toLowerCase().includes('key'),
      isReadOnly: false,
      requiresRestart: false,
      defaultValue: null
    }));
  });
  
  return transformed;
};

const getDataType = (value) => {
  if (typeof value === 'boolean') return 'Boolean';
  if (typeof value === 'number') return Number.isInteger(value) ? 'Integer' : 'Decimal';
  if (value instanceof Date) return 'DateTime';
  try {
    JSON.parse(value);
    return 'JSON';
  } catch {
    return 'String';
  }
};

// Configuration slice
const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.historyError = null;
      state.searchError = null;
      state.validateError = null;
    },
    
    // Clear configuration data
    clearConfigurations: (state) => {
      state.configurations = {};
      state.currentConfiguration = null;
      state.configurationHistory = [];
      state.searchResults = [];
    },
    
    // Set selected category
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    
    // Set search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    
    // Toggle sensitive data visibility
    toggleShowSensitive: (state) => {
      state.showSensitive = !state.showSensitive;
    },
    
    // Clear current configuration
    clearCurrentConfiguration: (state) => {
      state.currentConfiguration = null;
    },
    
    // Clear validation result
    clearValidationResult: (state) => {
      state.validationResult = null;
    },
    
    // Add pending restart
    addPendingRestart: (state, action) => {
      const { category, key } = action.payload;
      const restart = `${category}.${key}`;
      if (!state.pendingRestarts.includes(restart)) {
        state.pendingRestarts.push(restart);
      }
    },
    
    // Clear pending restarts
    clearPendingRestarts: (state) => {
      state.pendingRestarts = [];
    }
  },
  extraReducers: (builder) => {
    // Fetch all configurations
    builder
      .addCase(fetchAllConfigurations.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchAllConfigurations.fulfilled, (state, action) => {
        state.listLoading = false;
        state.configurations = transformConfigurations(action.payload);
      })
      .addCase(fetchAllConfigurations.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      })
      
    // Fetch category configuration
      .addCase(fetchCategoryConfiguration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryConfiguration.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg) {
          state.configurations[action.meta.arg] = action.payload;
        }
      })
      .addCase(fetchCategoryConfiguration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
    // Fetch single configuration
      .addCase(fetchConfiguration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfiguration.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConfiguration = action.payload;
      })
      .addCase(fetchConfiguration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
    // Update configuration
      .addCase(updateConfiguration.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateConfiguration.fulfilled, (state, action) => {
        state.updateLoading = false;
        const { category, key, result } = action.payload;
        
        // Update in configurations if exists
        if (state.configurations[category]) {
          const configIndex = state.configurations[category].findIndex(c => c.key === key);
          if (configIndex !== -1) {
            state.configurations[category][configIndex] = { ...state.configurations[category][configIndex], ...result };
          }
        }
        
        // Update current configuration if it matches
        if (state.currentConfiguration && state.currentConfiguration.category === category && state.currentConfiguration.key === key) {
          state.currentConfiguration = { ...state.currentConfiguration, ...result };
        }
        
        // Add to pending restarts if required
        if (result.requiresRestart) {
          const restart = `${category}.${key}`;
          if (!state.pendingRestarts.includes(restart)) {
            state.pendingRestarts.push(restart);
          }
        }
      })
      .addCase(updateConfiguration.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
    // Create configuration
      .addCase(createConfiguration.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createConfiguration.fulfilled, (state, action) => {
        state.createLoading = false;
        const newConfig = action.payload;
        
        // Add to configurations
        if (!state.configurations[newConfig.category]) {
          state.configurations[newConfig.category] = [];
        }
        state.configurations[newConfig.category].push(newConfig);
        
        // Sort by display order or key
        state.configurations[newConfig.category].sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
          }
          return a.key.localeCompare(b.key);
        });
      })
      .addCase(createConfiguration.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
    // Delete configuration
      .addCase(deleteConfiguration.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteConfiguration.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { category, key } = action.payload;
        
        // Remove from configurations
        if (state.configurations[category]) {
          state.configurations[category] = state.configurations[category].filter(c => c.key !== key);
          
          // Remove category if empty
          if (state.configurations[category].length === 0) {
            delete state.configurations[category];
          }
        }
        
        // Clear current configuration if it matches
        if (state.currentConfiguration && state.currentConfiguration.category === category && state.currentConfiguration.key === key) {
          state.currentConfiguration = null;
        }
        
        // Remove from pending restarts
        const restart = `${category}.${key}`;
        state.pendingRestarts = state.pendingRestarts.filter(r => r !== restart);
      })
      .addCase(deleteConfiguration.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })
      
    // Fetch configuration history
      .addCase(fetchConfigurationHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchConfigurationHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.configurationHistory = action.payload;
      })
      .addCase(fetchConfigurationHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
      })
      
    // Search configurations
      .addCase(searchConfigurations.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchConfigurations.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchConfigurations.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      })
      
    // Validate configuration
      .addCase(validateConfiguration.pending, (state) => {
        state.validateLoading = true;
        state.validateError = null;
      })
      .addCase(validateConfiguration.fulfilled, (state, action) => {
        state.validateLoading = false;
        state.validationResult = action.payload;
      })
      .addCase(validateConfiguration.rejected, (state, action) => {
        state.validateLoading = false;
        state.validateError = action.payload;
      })
      
    // Invalidate cache
      .addCase(invalidateCache.pending, (state) => {
        state.cacheLoading = true;
        state.error = null;
      })
      .addCase(invalidateCache.fulfilled, (state, action) => {
        state.cacheLoading = false;
        state.cacheLastInvalidated = new Date().toISOString();
      })
      .addCase(invalidateCache.rejected, (state, action) => {
        state.cacheLoading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  clearErrors,
  clearConfigurations,
  setSelectedCategory,
  setSearchQuery,
  toggleShowSensitive,
  clearCurrentConfiguration,
  clearValidationResult,
  addPendingRestart,
  clearPendingRestarts
} = configurationSlice.actions;

// Export selectors
export const selectConfigurations = (state) => state.configuration.configurations;
export const selectCurrentConfiguration = (state) => state.configuration.currentConfiguration;
export const selectConfigurationHistory = (state) => state.configuration.configurationHistory;
export const selectSearchResults = (state) => state.configuration.searchResults;
export const selectSelectedCategory = (state) => state.configuration.selectedCategory;
export const selectSearchQuery = (state) => state.configuration.searchQuery;
export const selectShowSensitive = (state) => state.configuration.showSensitive;
export const selectValidationResult = (state) => state.configuration.validationResult;
export const selectPendingRestarts = (state) => state.configuration.pendingRestarts;

// Export loading selectors
export const selectConfigurationLoading = (state) => ({
  loading: state.configuration.loading,
  listLoading: state.configuration.listLoading,
  createLoading: state.configuration.createLoading,
  updateLoading: state.configuration.updateLoading,
  deleteLoading: state.configuration.deleteLoading,
  historyLoading: state.configuration.historyLoading,
  searchLoading: state.configuration.searchLoading,
  validateLoading: state.configuration.validateLoading,
  cacheLoading: state.configuration.cacheLoading
});

// Export error selectors
export const selectConfigurationErrors = (state) => ({
  error: state.configuration.error,
  listError: state.configuration.listError,
  createError: state.configuration.createError,
  updateError: state.configuration.updateError,
  deleteError: state.configuration.deleteError,
  historyError: state.configuration.historyError,
  searchError: state.configuration.searchError,
  validateError: state.configuration.validateError
});

export default configurationSlice.reducer;