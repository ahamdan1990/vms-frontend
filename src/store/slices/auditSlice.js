import { createSlice, createAsyncThunk, createSelector  } from '@reduxjs/toolkit';
import auditService from '../../services/auditService';
import { handleApiError } from '../../services/errorService';

// Initial state
const initialState = {
  // Audit data
  auditLogs: [],
  currentAuditLog: null,
  userActivity: [],
  systemEvents: [],
  securityEvents: [],
  searchResults: [],
  
  // Pagination
  pagination: {
    pageIndex: 0,
    pageSize: 20,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  },
  
  // Loading states
  loading: false,
  listLoading: false,
  detailLoading: false,
  userActivityLoading: false,
  systemEventsLoading: false,
  securityEventsLoading: false,
  searchLoading: false,
  exportLoading: false,
  
  // Error states
  error: null,
  listError: null,
  detailError: null,
  userActivityError: null,
  systemEventsError: null,
  securityEventsError: null,
  searchError: null,
  exportError: null,
  
  // Filters
  filters: {
    searchTerm: '',
    category: '',
    userId: null,
    action: '',
    dateFrom: null,
    dateTo: null,
    severity: '',
    eventType: '',
    ipAddress: '',
    riskLevel: '',
    sortBy: 'Timestamp',
    sortDescending: true
  },
  
  // UI state
  selectedCategory: 'all',
  availableCategories: [],
  statistics: null,
  
  // Export state
  lastExportUrl: null
};

// Async thunks
export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchLogs',
  async (params, { rejectWithValue }) => {
    try {
      return await auditService.getAuditLogs(params);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchAuditLog = createAsyncThunk(
  'audit/fetchLog',
  async (id, { rejectWithValue }) => {
    try {
      return await auditService.getAuditLog(id);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'audit/fetchUserActivity',
  async (params, { rejectWithValue }) => {
    try {
      return await auditService.getUserActivity(params);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchSystemEvents = createAsyncThunk(
  'audit/fetchSystemEvents',
  async (params, { rejectWithValue }) => {
    try {
      return await auditService.getSystemEvents(params);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchSecurityEvents = createAsyncThunk(
  'audit/fetchSecurityEvents',
  async (params, { rejectWithValue }) => {
    try {
      return await auditService.getSecurityEvents(params);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const searchAuditLogs = createAsyncThunk(
  'audit/search',
  async ({ searchTerm, params }, { rejectWithValue }) => {
    try {
      return await auditService.searchAuditLogs(searchTerm, params);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const exportAuditLogs = createAsyncThunk(
  'audit/export',
  async (params, { rejectWithValue }) => {
    try {
      const blob = await auditService.exportAuditLogs(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.${params.format || 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { url, success: true };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchAuditStatistics = createAsyncThunk(
  'audit/fetchStatistics',
  async ({ dateFrom, dateTo }, { rejectWithValue }) => {
    try {
      return await auditService.getAuditStatistics(dateFrom, dateTo);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchAuditCategories = createAsyncThunk(
  'audit/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await auditService.getAuditCategories();
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);
// Audit slice
const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.listError = null;
      state.detailError = null;
      state.userActivityError = null;
      state.systemEventsError = null;
      state.securityEventsError = null;
      state.searchError = null;
      state.exportError = null;
    },
    
    // Clear audit data
    clearAuditData: (state) => {
      state.auditLogs = [];
      state.currentAuditLog = null;
      state.userActivity = [];
      state.systemEvents = [];
      state.securityEvents = [];
      state.searchResults = [];
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Set selected category
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    
    // Clear current audit log
    clearCurrentAuditLog: (state) => {
      state.currentAuditLog = null;
    },
    
    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  
  extraReducers: (builder) => {
    // Fetch audit logs
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.listLoading = false;
        state.auditLogs = action.payload.items || action.payload;
        
        console.log('🔄 Redux: fetchAuditLogs.fulfilled', {
          itemsReceived: state.auditLogs.length,
          payloadStructure: action.payload,
          paginationData: {
            pageIndex: action.payload.pageIndex,
            pageSize: action.payload.pageSize,
            totalPages: action.payload.totalPages,
            totalCount: action.payload.totalCount
          }
        });
        
        // Update pagination if provided
        if (action.payload.pageIndex !== undefined) {
          state.pagination = {
            pageIndex: action.payload.pageIndex,
            pageSize: action.payload.pageSize,
            totalPages: action.payload.totalPages,
            totalCount: action.payload.totalCount,
            hasNext: action.payload.hasNext,
            hasPrevious: action.payload.hasPrevious
          };
        }
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      })
      
    // Fetch single audit log
      .addCase(fetchAuditLog.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchAuditLog.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentAuditLog = action.payload;
      })
      .addCase(fetchAuditLog.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })
      
    // Fetch user activity
      .addCase(fetchUserActivity.pending, (state) => {
        state.userActivityLoading = true;
        state.userActivityError = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.userActivityLoading = false;
        state.userActivity = action.payload.items || action.payload;
        
        // Update pagination if provided
        if (action.payload.pageIndex !== undefined) {
          state.pagination = {
            pageIndex: action.payload.pageIndex,
            pageSize: action.payload.pageSize,
            totalPages: action.payload.totalPages,
            totalCount: action.payload.totalCount,
            hasNext: action.payload.hasNext,
            hasPrevious: action.payload.hasPrevious
          };
        }
        console.log('🔄 Redux: fetchUserActivity.fulfilled', {
          itemsReceived: state.userActivity.length,
          payloadStructure: action.payload,
          paginationData: {
            pageIndex: action.payload.pageIndex,
            pageSize: action.payload.pageSize,
            totalPages: action.payload.totalPages,
            totalCount: action.payload.totalCount
          }
        });
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.userActivityLoading = false;
        state.userActivityError = action.payload;
      })
      
    // Fetch system events
      .addCase(fetchSystemEvents.pending, (state) => {
        state.systemEventsLoading = true;
        state.systemEventsError = null;
      })
      .addCase(fetchSystemEvents.fulfilled, (state, action) => {
        state.systemEventsLoading = false;
        state.systemEvents = action.payload.items || action.payload;
        
        // Update pagination if provided
        if (action.payload.pageIndex !== undefined) {
          state.pagination = {
            pageIndex: action.payload.pageIndex,
            pageSize: action.payload.pageSize,
            totalPages: action.payload.totalPages,
            totalCount: action.payload.totalCount,
            hasNext: action.payload.hasNext,
            hasPrevious: action.payload.hasPrevious
          };
        }
      })
      .addCase(fetchSystemEvents.rejected, (state, action) => {
        state.systemEventsLoading = false;
        state.systemEventsError = action.payload;
      })
      
    // Fetch security events
      .addCase(fetchSecurityEvents.pending, (state) => {
        state.securityEventsLoading = true;
        state.securityEventsError = null;
      })
      .addCase(fetchSecurityEvents.fulfilled, (state, action) => {
        state.securityEventsLoading = false;
        state.securityEvents = action.payload.items || action.payload;
        
        // Update pagination if provided
        if (action.payload.pageIndex !== undefined) {
          state.pagination = {
            pageIndex: action.payload.pageIndex,
            pageSize: action.payload.pageSize,
            totalPages: action.payload.totalPages,
            totalCount: action.payload.totalCount,
            hasNext: action.payload.hasNext,
            hasPrevious: action.payload.hasPrevious
          };
        }
      })
      .addCase(fetchSecurityEvents.rejected, (state, action) => {
        state.securityEventsLoading = false;
        state.securityEventsError = action.payload;
      })
      
    // Search audit logs
      .addCase(searchAuditLogs.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchAuditLogs.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.items || action.payload;
        
        // Update pagination if provided
        if (action.payload.pageIndex !== undefined) {
          state.pagination = {
            pageIndex: action.payload.pageIndex,
            pageSize: action.payload.pageSize,
            totalPages: action.payload.totalPages,
            totalCount: action.payload.totalCount,
            hasNext: action.payload.hasNext,
            hasPrevious: action.payload.hasPrevious
          };
        }
      })
      .addCase(searchAuditLogs.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      })
      
    // Export audit logs
      .addCase(exportAuditLogs.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportAuditLogs.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.lastExportUrl = action.payload.url;
      })
      .addCase(exportAuditLogs.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
      })
      
    // Fetch audit statistics
      .addCase(fetchAuditStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchAuditStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
    // Fetch audit categories
      .addCase(fetchAuditCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuditCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.availableCategories = action.payload;
        console.log(state.availableCategories)
      })
      .addCase(fetchAuditCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  clearErrors,
  clearAuditData,
  updateFilters,
  resetFilters,
  setSelectedCategory,
  clearCurrentAuditLog,
  setPagination
} = auditSlice.actions;

// Export selectors
export const selectAuditLogs = (state) => state.audit.auditLogs;
export const selectCurrentAuditLog = (state) => state.audit.currentAuditLog;
export const selectUserActivity = (state) => state.audit.userActivity;
export const selectSystemEvents = (state) => state.audit.systemEvents;
export const selectSecurityEvents = (state) => state.audit.securityEvents;
export const selectSearchResults = (state) => state.audit.searchResults;
export const selectAuditPagination = (state) => state.audit.pagination;
export const selectAuditFilters = (state) => state.audit.filters;
export const selectSelectedCategory = (state) => state.audit.selectedCategory;
export const selectAvailableCategories = (state) => state.audit.availableCategories;
export const selectAuditStatistics = (state) => state.audit.statistics;

// Export loading selectors
export const selectAuditLoading = createSelector(
  [selectAuditLogs],
  (audit) => ({
    loading: audit.loading,
    listLoading: audit.listLoading,
    detailLoading: audit.detailLoading,
    userActivityLoading: audit.userActivityLoading,
    systemEventsLoading: audit.systemEventsLoading,
    securityEventsLoading: audit.securityEventsLoading,
    searchLoading: audit.searchLoading,
    exportLoading: audit.exportLoading
  })
);

// Export error selectors
export const selectAuditErrors = createSelector(
  [selectAuditLogs],
  (audit) => ({
    error: audit.error,
    listError: audit.listError,
    detailError: audit.detailError,
    userActivityError: audit.userActivityError,
    systemEventsError: audit.systemEventsError,
    securityEventsError: audit.securityEventsError,
    searchError: audit.searchError,
    exportError: audit.exportError
  })
);
export default auditSlice.reducer;