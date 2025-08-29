// src/store/slices/escalationRulesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { escalationRulesService } from '../../services/escalationRulesService';

// Initial state
const initialState = {
  // Data
  escalationRules: [],
  currentEscalationRule: null,
  totalCount: 0,
  
  // Pagination
  pageIndex: 0,
  pageSize: 20,
  totalPages: 0,
  
  // Filtering and search
  filters: {
    alertType: null,
    priority: null,
    isEnabled: null,
    searchTerm: '',
    sortBy: 'ruleName',
    sortDirection: 'asc'
  },
  
  // UI state
  selectedEscalationRules: [],
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showBulkDeleteModal: false,
  showViewModal: false,
  
  // Loading states
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  bulkLoading: false,
  metadataLoading: false,
  
  // Error states
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  bulkError: null,
  
  // Metadata
  alertTypes: {},
  alertPriorities: {},
  escalationActions: {},
  lastSyncTime: null
};

// Async thunks
export const fetchEscalationRules = createAsyncThunk(
  'escalationRules/fetchEscalationRules',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().escalationRules;
      const requestParams = {
        pageIndex: params.pageIndex ?? state.pageIndex,
        pageSize: params.pageSize ?? state.pageSize,
        ...state.filters,
        ...params
      };
      
      const response = await escalationRulesService.getEscalationRules(requestParams);
      return {
        data: response.data,
        params: requestParams
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch escalation rules');
    }
  }
);

export const fetchEscalationRuleById = createAsyncThunk(
  'escalationRules/fetchEscalationRuleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await escalationRulesService.getEscalationRuleById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch escalation rule');
    }
  }
);

export const createEscalationRule = createAsyncThunk(
  'escalationRules/createEscalationRule',
  async (escalationRuleData, { rejectWithValue }) => {
    try {
      // Validate data first
      const validation = escalationRulesService.validateEscalationRule(escalationRuleData);
      if (!validation.isValid) {
        return rejectWithValue({
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const response = await escalationRulesService.createEscalationRule(escalationRuleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create escalation rule');
    }
  }
);

export const updateEscalationRule = createAsyncThunk(
  'escalationRules/updateEscalationRule',
  async ({ id, escalationRuleData }, { rejectWithValue }) => {
    try {
      // Validate data first
      const validation = escalationRulesService.validateEscalationRule(escalationRuleData);
      if (!validation.isValid) {
        return rejectWithValue({
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const response = await escalationRulesService.updateEscalationRule(id, escalationRuleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update escalation rule');
    }
  }
);

export const deleteEscalationRule = createAsyncThunk(
  'escalationRules/deleteEscalationRule',
  async (id, { rejectWithValue }) => {
    try {
      await escalationRulesService.deleteEscalationRule(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete escalation rule');
    }
  }
);

export const bulkDeleteEscalationRules = createAsyncThunk(
  'escalationRules/bulkDeleteEscalationRules',
  async (ids, { rejectWithValue }) => {
    try {
      const result = await escalationRulesService.bulkDeleteEscalationRules(ids);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to bulk delete escalation rules');
    }
  }
);

export const toggleEscalationRule = createAsyncThunk(
  'escalationRules/toggleEscalationRule',
  async ({ id, isEnabled }, { rejectWithValue }) => {
    try {
      const response = await escalationRulesService.toggleEscalationRule(id, isEnabled);
      return { id, isEnabled, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to toggle escalation rule');
    }
  }
);

export const bulkToggleEscalationRules = createAsyncThunk(
  'escalationRules/bulkToggleEscalationRules',
  async ({ ids, isEnabled }, { rejectWithValue }) => {
    try {
      const result = await escalationRulesService.bulkToggleEscalationRules(ids, isEnabled);
      return { ids, isEnabled, result };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to bulk toggle escalation rules');
    }
  }
);

// Metadata async thunks
export const fetchAlertTypes = createAsyncThunk(
  'escalationRules/fetchAlertTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await escalationRulesService.getAlertTypes();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch alert types');
    }
  }
);

export const fetchAlertPriorities = createAsyncThunk(
  'escalationRules/fetchAlertPriorities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await escalationRulesService.getAlertPriorities();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch alert priorities');
    }
  }
);

export const fetchEscalationActions = createAsyncThunk(
  'escalationRules/fetchEscalationActions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await escalationRulesService.getEscalationActions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch escalation actions');
    }
  }
);

// Escalation Rules slice
const escalationRulesSlice = createSlice({
  name: 'escalationRules',
  initialState,
  reducers: {
    // Pagination
    setPageIndex: (state, action) => {
      state.pageIndex = action.payload;
    },
    
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.pageIndex = 0; // Reset to first page when page size changes
    },
    
    // Filtering and search
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pageIndex = 0; // Reset to first page when filters change
    },
    
    resetFilters: (state) => {
      state.filters = {
        alertType: null,
        priority: null,
        isEnabled: null,
        searchTerm: '',
        sortBy: 'ruleName',
        sortDirection: 'asc'
      };
      state.pageIndex = 0;
    },
    
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
      state.pageIndex = 0;
    },
    
    // Selection
    setSelectedEscalationRules: (state, action) => {
      state.selectedEscalationRules = action.payload;
    },
    
    toggleEscalationRuleSelection: (state, action) => {
      const id = action.payload;
      const isSelected = state.selectedEscalationRules.includes(id);
      
      if (isSelected) {
        state.selectedEscalationRules = state.selectedEscalationRules.filter(selectedId => selectedId !== id);
      } else {
        state.selectedEscalationRules.push(id);
      }
    },
    
    clearSelections: (state) => {
      state.selectedEscalationRules = [];
    },
    
    selectAllEscalationRules: (state) => {
      state.selectedEscalationRules = state.escalationRules.map(rule => rule.id);
    },
    // Modal controls
    showCreateModal: (state) => {
      state.showCreateModal = true;
      state.createError = null;
    },
    
    hideCreateModal: (state) => {
      state.showCreateModal = false;
      state.createError = null;
    },
    
    showEditModal: (state, action) => {
      state.showEditModal = true;
      state.currentEscalationRule = action.payload;
      state.updateError = null;
    },
    
    hideEditModal: (state) => {
      state.showEditModal = false;
      state.currentEscalationRule = null;
      state.updateError = null;
    },
    
    showDeleteModal: (state, action) => {
      state.showDeleteModal = true;
      state.currentEscalationRule = action.payload;
      state.deleteError = null;
    },
    
    hideDeleteModal: (state) => {
      state.showDeleteModal = false;
      state.currentEscalationRule = null;
      state.deleteError = null;
    },
    
    showBulkDeleteModal: (state) => {
      state.showBulkDeleteModal = true;
      state.bulkError = null;
    },
    
    hideBulkDeleteModal: (state) => {
      state.showBulkDeleteModal = false;
      state.bulkError = null;
    },
    
    showViewModal: (state, action) => {
      state.showViewModal = true;
      state.currentEscalationRule = action.payload;
    },
    
    hideViewModal: (state) => {
      state.showViewModal = false;
      state.currentEscalationRule = null;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    
    clearCreateError: (state) => {
      state.createError = null;
    },
    
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    
    clearBulkError: (state) => {
      state.bulkError = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch escalation rules
    builder
      .addCase(fetchEscalationRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEscalationRules.fulfilled, (state, action) => {
        state.loading = false;
        state.escalationRules = action.payload.data.items || [];
        state.totalCount = action.payload.data.totalCount || 0;
        state.totalPages = Math.ceil(state.totalCount / state.pageSize);
        state.pageIndex = action.payload.params.pageIndex;
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(fetchEscalationRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch escalation rule by ID
      .addCase(fetchEscalationRuleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEscalationRuleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEscalationRule = action.payload;
      })
      .addCase(fetchEscalationRuleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create escalation rule
      .addCase(createEscalationRule.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createEscalationRule.fulfilled, (state, action) => {
        state.createLoading = false;
        state.escalationRules.unshift(action.payload);
        state.totalCount += 1;
        state.showCreateModal = false;
      })
      .addCase(createEscalationRule.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      // Update escalation rule
      .addCase(updateEscalationRule.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateEscalationRule.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.escalationRules.findIndex(rule => rule.id === action.payload.id);
        if (index !== -1) {
          state.escalationRules[index] = action.payload;
        }
        state.showEditModal = false;
        state.currentEscalationRule = null;
      })
      .addCase(updateEscalationRule.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Delete escalation rule
      .addCase(deleteEscalationRule.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteEscalationRule.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.escalationRules = state.escalationRules.filter(rule => rule.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
        state.selectedEscalationRules = state.selectedEscalationRules.filter(id => id !== action.payload);
        state.showDeleteModal = false;
        state.currentEscalationRule = null;
      })
      .addCase(deleteEscalationRule.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })
      
      // Toggle escalation rule
      .addCase(toggleEscalationRule.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(toggleEscalationRule.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.escalationRules.findIndex(rule => rule.id === action.payload.id);
        if (index !== -1) {
          state.escalationRules[index].isEnabled = action.payload.isEnabled;
        }
      })
      .addCase(toggleEscalationRule.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Bulk delete escalation rules
      .addCase(bulkDeleteEscalationRules.pending, (state) => {
        state.bulkLoading = true;
        state.bulkError = null;
      })
      .addCase(bulkDeleteEscalationRules.fulfilled, (state, action) => {
        state.bulkLoading = false;
        const deletedIds = action.meta.arg; // The IDs that were passed to the action
        state.escalationRules = state.escalationRules.filter(rule => !deletedIds.includes(rule.id));
        state.totalCount = Math.max(0, state.totalCount - action.payload.successful);
        state.selectedEscalationRules = [];
        state.showBulkDeleteModal = false;
      })
      .addCase(bulkDeleteEscalationRules.rejected, (state, action) => {
        state.bulkLoading = false;
        state.bulkError = action.payload;
      })
      
      // Bulk toggle escalation rules
      .addCase(bulkToggleEscalationRules.pending, (state) => {
        state.bulkLoading = true;
        state.bulkError = null;
      })
      .addCase(bulkToggleEscalationRules.fulfilled, (state, action) => {
        state.bulkLoading = false;
        const { ids, isEnabled } = action.payload;
        state.escalationRules.forEach(rule => {
          if (ids.includes(rule.id)) {
            rule.isEnabled = isEnabled;
          }
        });
        state.selectedEscalationRules = [];
      })
      .addCase(bulkToggleEscalationRules.rejected, (state, action) => {
        state.bulkLoading = false;
        state.bulkError = action.payload;
      })
      
      // Metadata - Alert Types
      .addCase(fetchAlertTypes.pending, (state) => {
        state.metadataLoading = true;
      })
      .addCase(fetchAlertTypes.fulfilled, (state, action) => {
        state.metadataLoading = false;
        state.alertTypes = action.payload;
      })
      .addCase(fetchAlertTypes.rejected, (state, action) => {
        state.metadataLoading = false;
        state.error = action.payload;
      })
      
      // Metadata - Alert Priorities
      .addCase(fetchAlertPriorities.pending, (state) => {
        state.metadataLoading = true;
      })
      .addCase(fetchAlertPriorities.fulfilled, (state, action) => {
        state.metadataLoading = false;
        state.alertPriorities = action.payload;
      })
      .addCase(fetchAlertPriorities.rejected, (state, action) => {
        state.metadataLoading = false;
        state.error = action.payload;
      })
      
      // Metadata - Escalation Actions
      .addCase(fetchEscalationActions.pending, (state) => {
        state.metadataLoading = true;
      })
      .addCase(fetchEscalationActions.fulfilled, (state, action) => {
        state.metadataLoading = false;
        state.escalationActions = action.payload;
      })
      .addCase(fetchEscalationActions.rejected, (state, action) => {
        state.metadataLoading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  // Pagination
  setPageIndex,
  setPageSize,
  
  // Filtering and search
  updateFilters,
  resetFilters,
  setSearchTerm,
  
  // Selection
  setSelectedEscalationRules,
  toggleEscalationRuleSelection,
  clearSelections,
  selectAllEscalationRules,
  
  // Modal controls
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  showBulkDeleteModal,
  hideBulkDeleteModal,
  showViewModal,
  hideViewModal,
  
  // Error handling
  clearError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearBulkError
} = escalationRulesSlice.actions;

// Export reducer
export default escalationRulesSlice.reducer;
