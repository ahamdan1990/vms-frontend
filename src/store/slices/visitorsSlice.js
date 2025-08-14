import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import visitorService from '../../services/visitorService';
import { handleApiError } from '../../services/errorService';

// Initial state
const initialState = {
  // Visitor list (paginated)
  list: [],
  total: 0,
  pageIndex: 0,
  pageSize: 20,
  
  // Current visitor being viewed/edited
  currentVisitor: null,
  
  // Loading states
  loading: false,
  listLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  searchLoading: false,
  statusChangeLoading: false, // VIP, blacklist operations
  
  // Error states
  error: null,
  listError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  searchError: null,
  statusChangeError: null,
  
  // Filters and search
  filters: {
    searchTerm: '',
    company: '',
    isVip: null,
    isBlacklisted: null,
    isActive: true,
    nationality: '',
    securityClearance: '',
    sortBy: 'FullName',
    sortDirection: 'asc',
    includeDeleted: false
  },
  
  // Advanced search state
  advancedSearch: {
    isActive: false,
    results: [],
    loading: false,
    error: null,
    lastSearchParams: null
  },
  
  // Selection state
  selectedVisitors: [],
  
  // Modal states
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showDetailsModal: false,
  showBlacklistModal: false,
  showAdvancedSearchModal: false,
  
  // Special visitor lists (cached)
  vipVisitors: [],
  vipVisitorsLoading: false,
  vipVisitorsError: null,
  vipVisitorsLastFetch: null,
  
  blacklistedVisitors: [],
  blacklistedVisitorsLoading: false,
  blacklistedVisitorsError: null,
  blacklistedVisitorsLastFetch: null,
  
  // Statistics
  statistics: null,
  statisticsLoading: false,
  statisticsError: null,
  statisticsLastFetch: null,
  
  // Quick search (for autocomplete)
  quickSearchResults: [],
  quickSearchLoading: false,
  quickSearchTerm: '',
  
  // Last updated timestamp
  lastUpdated: null
};
// Async thunks for visitor operations

// Get paginated visitors with filtering and sorting
export const getVisitors = createAsyncThunk(
  'visitors/getVisitors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await visitorService.getVisitors(params);
      return { data, params };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get visitor by ID
export const getVisitorById = createAsyncThunk(
  'visitors/getVisitorById',
  async ({ id, includeDeleted = false }, { rejectWithValue }) => {
    try {
      const data = await visitorService.getVisitorById(id, includeDeleted);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Create new visitor
export const createVisitor = createAsyncThunk(
  'visitors/createVisitor',
  async (visitorData, { rejectWithValue }) => {
    try {
      const data = await visitorService.createVisitor(visitorData);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update existing visitor
export const updateVisitor = createAsyncThunk(
  'visitors/updateVisitor',
  async ({ id, visitorData }, { rejectWithValue }) => {
    try {
      const data = await visitorService.updateVisitor(id, visitorData);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete visitor
export const deleteVisitor = createAsyncThunk(
  'visitors/deleteVisitor',
  async ({ id, permanentDelete = false }, { rejectWithValue }) => {
    try {
      await visitorService.deleteVisitor(id, permanentDelete);
      return { id, permanentDelete };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Advanced search
export const searchVisitors = createAsyncThunk(
  'visitors/searchVisitors',
  async (searchParams, { rejectWithValue }) => {
    try {
      const data = await visitorService.searchVisitors(searchParams);
      return { data, searchParams };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Quick search for autocomplete
export const quickSearchVisitors = createAsyncThunk(
  'visitors/quickSearchVisitors',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const data = await visitorService.quickSearchVisitors(searchTerm, 10);
      return { data: data.items || data, searchTerm };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Alias for advanced search modal compatibility
export const advancedSearchVisitors = searchVisitors;

// Blacklist visitor
export const blacklistVisitor = createAsyncThunk(
  'visitors/blacklistVisitor',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const data = await visitorService.blacklistVisitor(id, reason);
      return { id, data };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove blacklist
export const removeBlacklist = createAsyncThunk(
  'visitors/removeBlacklist',
  async (id, { rejectWithValue }) => {
    try {
      const data = await visitorService.removeBlacklist(id);
      return { id, data };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Mark as VIP
export const markAsVip = createAsyncThunk(
  'visitors/markAsVip',
  async (id, { rejectWithValue }) => {
    try {
      const data = await visitorService.markAsVip(id);
      return { id, data };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove VIP status
export const removeVipStatus = createAsyncThunk(
  'visitors/removeVipStatus',
  async (id, { rejectWithValue }) => {
    try {
      const data = await visitorService.removeVipStatus(id);
      return { id, data };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get VIP visitors
export const getVipVisitors = createAsyncThunk(
  'visitors/getVipVisitors',
  async (includeDeleted = false, { rejectWithValue, getState }) => {
    try {
      // Check if we have recent cached data (5 minutes)
      const state = getState().visitors;
      const now = Date.now();
      const cacheTimeout = 5 * 60 * 1000; // 5 minutes
      
      if (state.vipVisitorsLastFetch && 
          (now - state.vipVisitorsLastFetch) < cacheTimeout &&
          state.vipVisitors.length > 0) {
        return state.vipVisitors;
      }
      
      const data = await visitorService.getVipVisitors(includeDeleted);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get blacklisted visitors
export const getBlacklistedVisitors = createAsyncThunk(
  'visitors/getBlacklistedVisitors',
  async (includeDeleted = false, { rejectWithValue, getState }) => {
    try {
      // Check if we have recent cached data (5 minutes)
      const state = getState().visitors;
      const now = Date.now();
      const cacheTimeout = 5 * 60 * 1000; // 5 minutes
      
      if (state.blacklistedVisitorsLastFetch && 
          (now - state.blacklistedVisitorsLastFetch) < cacheTimeout &&
          state.blacklistedVisitors.length > 0) {
        return state.blacklistedVisitors;
      }
      
      const data = await visitorService.getBlacklistedVisitors(includeDeleted);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get visitor statistics
export const getVisitorStatistics = createAsyncThunk(
  'visitors/getVisitorStatistics',
  async (includeDeleted = false, { rejectWithValue, getState }) => {
    try {
      // Check if we have recent cached data (5 minutes)
      const state = getState().visitors;
      const now = Date.now();
      const cacheTimeout = 5 * 60 * 1000; // 5 minutes
      
      if (state.statisticsLastFetch && 
          (now - state.statisticsLastFetch) < cacheTimeout &&
          state.statistics) {
        return state.statistics;
      }
      
      const data = await visitorService.getVisitorStatistics(includeDeleted);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);
// Visitors slice
const visitorsSlice = createSlice({
  name: 'visitors',
  initialState,
  reducers: {
    // Filter actions
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset pagination when filters change
      state.pageIndex = 0;
    },
    
    resetFilters: (state) => {
      state.filters = {
        searchTerm: '',
        company: '',
        isVip: null,
        isBlacklisted: null,
        isActive: true,
        nationality: '',
        securityClearance: '',
        sortBy: 'FullName',
        sortDirection: 'asc',
        includeDeleted: false
      };
      state.pageIndex = 0;
    },
    
    // Pagination actions
    setPageIndex: (state, action) => {
      state.pageIndex = action.payload;
    },
    
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.pageIndex = 0; // Reset to first page
    },
    
    // Selection actions
    setSelectedVisitors: (state, action) => {
      state.selectedVisitors = action.payload;
    },
    
    toggleVisitorSelection: (state, action) => {
      const id = action.payload;
      const index = state.selectedVisitors.indexOf(id);
      if (index === -1) {
        state.selectedVisitors.push(id);
      } else {
        state.selectedVisitors.splice(index, 1);
      }
    },
    
    clearSelections: (state) => {
      state.selectedVisitors = [];
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
      state.currentVisitor = action.payload;
    },
    
    hideEditModal: (state) => {
      state.showEditModal = false;
      state.currentVisitor = null;
    },
    
    showDeleteModal: (state, action) => {
      state.showDeleteModal = true;
      state.currentVisitor = action.payload;
    },
    
    hideDeleteModal: (state) => {
      state.showDeleteModal = false;
      state.currentVisitor = null;
    },
    
    showDetailsModal: (state, action) => {
      state.showDetailsModal = true;
      state.currentVisitor = action.payload;
    },
    
    hideDetailsModal: (state) => {
      state.showDetailsModal = false;
      state.currentVisitor = null;
    },
    
    showBlacklistModal: (state, action) => {
      state.showBlacklistModal = true;
      state.currentVisitor = action.payload;
    },
    
    hideBlacklistModal: (state) => {
      state.showBlacklistModal = false;
      state.currentVisitor = null;
    },
    
    showAdvancedSearchModal: (state) => {
      state.showAdvancedSearchModal = true;
    },
    
    hideAdvancedSearchModal: (state) => {
      state.showAdvancedSearchModal = false;
    },
    
    // Advanced search actions
    toggleAdvancedSearch: (state) => {
      state.advancedSearch.isActive = !state.advancedSearch.isActive;
      if (!state.advancedSearch.isActive) {
        state.advancedSearch.results = [];
        state.advancedSearch.lastSearchParams = null;
      }
    },
    
    clearAdvancedSearch: (state) => {
      state.advancedSearch.isActive = false;
      state.advancedSearch.results = [];
      state.advancedSearch.lastSearchParams = null;
      state.advancedSearch.error = null;
    },

    // Alias for modal compatibility
    clearAdvancedSearchResults: (state) => {
      state.advancedSearch.results = [];
      state.advancedSearch.error = null;
    },
    
    // Quick search actions
    setQuickSearchTerm: (state, action) => {
      state.quickSearchTerm = action.payload;
    },
    
    clearQuickSearch: (state) => {
      state.quickSearchResults = [];
      state.quickSearchTerm = '';
    },
    
    // Error clearing
    clearError: (state) => {
      state.error = null;
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.searchError = null;
      state.statusChangeError = null;
      state.advancedSearch.error = null;
    },
    
    // Set current visitor
    setCurrentVisitor: (state, action) => {
      state.currentVisitor = action.payload;
    },
    
    // Clear current visitor
    clearCurrentVisitor: (state) => {
      state.currentVisitor = null;
    }
  },  extraReducers: (builder) => {
    // Get visitors
    builder
      .addCase(getVisitors.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getVisitors.fulfilled, (state, action) => {
        state.listLoading = false;
        const { data, params } = action.payload;
        
        // Handle paginated response
        if (data.items) {
          state.list = data.items;
          state.total = data.totalCount || data.total || 0;
          state.pageIndex = data.pageIndex || params.pageIndex || 0;
          state.pageSize = data.pageSize || params.pageSize || 20;
        } else {
          // Handle non-paginated response
          state.list = data || [];
          state.total = data?.length || 0;
        }
        
        state.lastUpdated = Date.now();
        state.listError = null;
      })
      .addCase(getVisitors.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
        state.list = [];
        state.total = 0;
      })
      
      // Get visitor by ID
      .addCase(getVisitorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVisitorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVisitor = action.payload;
        state.error = null;
      })
      .addCase(getVisitorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentVisitor = null;
      })
      
      // Create visitor
      .addCase(createVisitor.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createVisitor.fulfilled, (state, action) => {
        state.createLoading = false;
        
        // Add to list if we're on the first page
        if (state.pageIndex === 0) {
          state.list.unshift(action.payload);
          // Remove last item if we exceed page size
          if (state.list.length > state.pageSize) {
            state.list.pop();
          }
        }
        
        state.total += 1;
        state.showCreateModal = false;
        state.createError = null;
        state.lastUpdated = Date.now();
        
        // Clear cached data to force refresh
        state.vipVisitorsLastFetch = null;
        state.blacklistedVisitorsLastFetch = null;
        state.statisticsLastFetch = null;
      })
      .addCase(createVisitor.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })      
      // Update visitor
      .addCase(updateVisitor.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateVisitor.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedVisitor = action.payload;
        
        // Update in list
        const index = state.list.findIndex(visitor => visitor.id === updatedVisitor.id);
        if (index !== -1) {
          state.list[index] = updatedVisitor;
        }
        
        // Update current visitor if it's the same
        if (state.currentVisitor && state.currentVisitor.id === updatedVisitor.id) {
          state.currentVisitor = updatedVisitor;
        }
        
        state.showEditModal = false;
        state.updateError = null;
        state.lastUpdated = Date.now();
        
        // Clear cached data to force refresh
        state.vipVisitorsLastFetch = null;
        state.blacklistedVisitorsLastFetch = null;
        state.statisticsLastFetch = null;
      })
      .addCase(updateVisitor.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Delete visitor
      .addCase(deleteVisitor.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteVisitor.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { id, permanentDelete } = action.payload;
        
        if (permanentDelete) {
          // Remove from list completely
          state.list = state.list.filter(visitor => visitor.id !== id);
          state.total -= 1;
        } else {
          // Mark as inactive (soft delete)
          const index = state.list.findIndex(visitor => visitor.id === id);
          if (index !== -1) {
            state.list[index].isActive = false;
          }
        }
        
        state.showDeleteModal = false;
        state.currentVisitor = null;
        state.deleteError = null;
        state.lastUpdated = Date.now();
        
        // Clear cached data to force refresh
        state.vipVisitorsLastFetch = null;
        state.blacklistedVisitorsLastFetch = null;
        state.statisticsLastFetch = null;
        
        // Remove from selections if selected
        state.selectedVisitors = state.selectedVisitors.filter(selectedId => selectedId !== id);
      })
      .addCase(deleteVisitor.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })
      
      // Advanced search
      .addCase(searchVisitors.pending, (state) => {
        state.advancedSearch.loading = true;
        state.advancedSearch.error = null;
      })
      .addCase(searchVisitors.fulfilled, (state, action) => {
        state.advancedSearch.loading = false;
        const { data, searchParams } = action.payload;
        
        state.advancedSearch.results = data.items || data || [];
        state.advancedSearch.lastSearchParams = searchParams;
        state.advancedSearch.error = null;
      })
      .addCase(searchVisitors.rejected, (state, action) => {
        state.advancedSearch.loading = false;
        state.advancedSearch.error = action.payload;
        state.advancedSearch.results = [];
      })
      
      // Quick search
      .addCase(quickSearchVisitors.pending, (state) => {
        state.quickSearchLoading = true;
      })
      .addCase(quickSearchVisitors.fulfilled, (state, action) => {
        state.quickSearchLoading = false;
        const { data, searchTerm } = action.payload;
        
        // Only update if this is still the current search term
        if (searchTerm === state.quickSearchTerm) {
          state.quickSearchResults = data || [];
        }
      })
      .addCase(quickSearchVisitors.rejected, (state, action) => {
        state.quickSearchLoading = false;
        state.quickSearchResults = [];
      })      
      // Blacklist visitor
      .addCase(blacklistVisitor.pending, (state) => {
        state.statusChangeLoading = true;
        state.statusChangeError = null;
      })
      .addCase(blacklistVisitor.fulfilled, (state, action) => {
        state.statusChangeLoading = false;
        const { id } = action.payload;
        
        // Update in list
        const index = state.list.findIndex(visitor => visitor.id === id);
        if (index !== -1) {
          state.list[index].isBlacklisted = true;
        }
        
        // Update current visitor
        if (state.currentVisitor && state.currentVisitor.id === id) {
          state.currentVisitor.isBlacklisted = true;
        }
        
        state.showBlacklistModal = false;
        state.statusChangeError = null;
        state.lastUpdated = Date.now();
        
        // Clear cached data
        state.blacklistedVisitorsLastFetch = null;
        state.statisticsLastFetch = null;
      })
      .addCase(blacklistVisitor.rejected, (state, action) => {
        state.statusChangeLoading = false;
        state.statusChangeError = action.payload;
      })
      
      // Remove blacklist
      .addCase(removeBlacklist.pending, (state) => {
        state.statusChangeLoading = true;
        state.statusChangeError = null;
      })
      .addCase(removeBlacklist.fulfilled, (state, action) => {
        state.statusChangeLoading = false;
        const { id } = action.payload;
        
        // Update in list
        const index = state.list.findIndex(visitor => visitor.id === id);
        if (index !== -1) {
          state.list[index].isBlacklisted = false;
        }
        
        // Update current visitor
        if (state.currentVisitor && state.currentVisitor.id === id) {
          state.currentVisitor.isBlacklisted = false;
        }
        
        state.statusChangeError = null;
        state.lastUpdated = Date.now();
        
        // Clear cached data
        state.blacklistedVisitorsLastFetch = null;
        state.statisticsLastFetch = null;
      })
      .addCase(removeBlacklist.rejected, (state, action) => {
        state.statusChangeLoading = false;
        state.statusChangeError = action.payload;
      })
      
      // Mark as VIP
      .addCase(markAsVip.pending, (state) => {
        state.statusChangeLoading = true;
        state.statusChangeError = null;
      })
      .addCase(markAsVip.fulfilled, (state, action) => {
        state.statusChangeLoading = false;
        const { id } = action.payload;
        
        // Update in list
        const index = state.list.findIndex(visitor => visitor.id === id);
        if (index !== -1) {
          state.list[index].isVip = true;
        }
        
        // Update current visitor
        if (state.currentVisitor && state.currentVisitor.id === id) {
          state.currentVisitor.isVip = true;
        }
        
        state.statusChangeError = null;
        state.lastUpdated = Date.now();
        
        // Clear cached data
        state.vipVisitorsLastFetch = null;
        state.statisticsLastFetch = null;
      })
      .addCase(markAsVip.rejected, (state, action) => {
        state.statusChangeLoading = false;
        state.statusChangeError = action.payload;
      })
      
      // Remove VIP status
      .addCase(removeVipStatus.pending, (state) => {
        state.statusChangeLoading = true;
        state.statusChangeError = null;
      })
      .addCase(removeVipStatus.fulfilled, (state, action) => {
        state.statusChangeLoading = false;
        const { id } = action.payload;
        
        // Update in list
        const index = state.list.findIndex(visitor => visitor.id === id);
        if (index !== -1) {
          state.list[index].isVip = false;
        }
        
        // Update current visitor
        if (state.currentVisitor && state.currentVisitor.id === id) {
          state.currentVisitor.isVip = false;
        }
        
        state.statusChangeError = null;
        state.lastUpdated = Date.now();
        
        // Clear cached data
        state.vipVisitorsLastFetch = null;
        state.statisticsLastFetch = null;
      })
      .addCase(removeVipStatus.rejected, (state, action) => {
        state.statusChangeLoading = false;
        state.statusChangeError = action.payload;
      })      
      // Get VIP visitors
      .addCase(getVipVisitors.pending, (state) => {
        state.vipVisitorsLoading = true;
        state.vipVisitorsError = null;
      })
      .addCase(getVipVisitors.fulfilled, (state, action) => {
        state.vipVisitorsLoading = false;
        state.vipVisitors = action.payload || [];
        state.vipVisitorsLastFetch = Date.now();
        state.vipVisitorsError = null;
      })
      .addCase(getVipVisitors.rejected, (state, action) => {
        state.vipVisitorsLoading = false;
        state.vipVisitorsError = action.payload;
      })
      
      // Get blacklisted visitors
      .addCase(getBlacklistedVisitors.pending, (state) => {
        state.blacklistedVisitorsLoading = true;
        state.blacklistedVisitorsError = null;
      })
      .addCase(getBlacklistedVisitors.fulfilled, (state, action) => {
        state.blacklistedVisitorsLoading = false;
        state.blacklistedVisitors = action.payload || [];
        state.blacklistedVisitorsLastFetch = Date.now();
        state.blacklistedVisitorsError = null;
      })
      .addCase(getBlacklistedVisitors.rejected, (state, action) => {
        state.blacklistedVisitorsLoading = false;
        state.blacklistedVisitorsError = action.payload;
      })
      
      // Get visitor statistics
      .addCase(getVisitorStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.statisticsError = null;
      })
      .addCase(getVisitorStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.statistics = action.payload;
        state.statisticsLastFetch = Date.now();
        state.statisticsError = null;
      })
      .addCase(getVisitorStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.statisticsError = action.payload;
      });
  }
});

// Export actions
export const {
  updateFilters,
  resetFilters,
  setPageIndex,
  setPageSize,
  setSelectedVisitors,
  toggleVisitorSelection,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  showDetailsModal,
  hideDetailsModal,
  showBlacklistModal,
  hideBlacklistModal,
  showAdvancedSearchModal,
  hideAdvancedSearchModal,
  toggleAdvancedSearch,
  clearAdvancedSearch,
  clearAdvancedSearchResults,
  setQuickSearchTerm,
  clearQuickSearch,
  clearError,
  setCurrentVisitor,
  clearCurrentVisitor
} = visitorsSlice.actions;

// Export reducer
export default visitorsSlice.reducer;