import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportService from '../../services/reportService';
import toast from 'react-hot-toast';

/**
 * Redux slice for report management with comprehensive filtering and statistics
 */

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetch "who is in building" report
 */
export const fetchInBuildingReport = createAsyncThunk(
  'reports/fetchInBuildingReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await reportService.getInBuildingReport(params);
      return data;
    } catch (error) {
      toast.error(error.message || 'Failed to fetch in-building report');
      return rejectWithValue(error.message || 'Failed to fetch in-building report');
    }
  }
);

/**
 * Export "who is in building" report as CSV
 */
export const exportInBuildingReport = createAsyncThunk(
  'reports/exportInBuildingReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      await reportService.exportInBuildingReport(params);
      toast.success('Report exported successfully');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to export report');
      return rejectWithValue(error.message || 'Failed to export report');
    }
  }
);

/**
 * Fetch comprehensive visitor report with filtering and pagination
 */
export const fetchComprehensiveReport = createAsyncThunk(
  'reports/fetchComprehensiveReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await reportService.getComprehensiveReport(params);
      return data;
    } catch (error) {
      toast.error(error.message || 'Failed to fetch comprehensive report');
      return rejectWithValue(error.message || 'Failed to fetch comprehensive report');
    }
  }
);

/**
 * Export comprehensive visitor report as CSV
 */
export const exportComprehensiveReport = createAsyncThunk(
  'reports/exportComprehensiveReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      await reportService.exportComprehensiveReport(params);
      toast.success('Report exported successfully');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to export report');
      return rejectWithValue(error.message || 'Failed to export report');
    }
  }
);

/**
 * Fetch visitor statistics and analytics
 */
export const fetchStatistics = createAsyncThunk(
  'reports/fetchStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await reportService.getStatistics(params);
      return data;
    } catch (error) {
      toast.error(error.message || 'Failed to fetch statistics');
      return rejectWithValue(error.message || 'Failed to fetch statistics');
    }
  }
);

/**
 * Export visitor statistics report as CSV
 */
export const exportStatistics = createAsyncThunk(
  'reports/exportStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      await reportService.exportStatistics(params);
      toast.success('Statistics exported successfully');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to export statistics');
      return rejectWithValue(error.message || 'Failed to export statistics');
    }
  }
);

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  // In-building report
  inBuildingReport: {
    data: null,
    loading: false,
    error: null
  },

  // Comprehensive report
  comprehensiveReport: {
    data: null,
    loading: false,
    error: null
  },

  // Statistics
  statistics: {
    data: null,
    loading: false,
    error: null
  },

  // Export states
  exporting: false,
  exportError: null,

  // Current filter state (persisted for UX)
  filters: {
    locationId: null,
    startDate: null,
    endDate: null,
    status: null,
    searchTerm: '',
    hostId: null,
    visitPurposeId: null,
    department: null,
    checkedInOnly: false,
    checkedOutOnly: false,
    overdueOnly: false
  },

  // Pagination state
  pagination: {
    pageIndex: 0,
    pageSize: 50,
    sortBy: 'CheckedInAt',
    sortDirection: 'desc'
  }
};

// ============================================================================
// SLICE
// ============================================================================

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    /**
     * Update filter values
     */
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },

    /**
     * Reset all filters to initial state
     */
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.pageIndex = 0;
    },

    /**
     * Update pagination settings
     */
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload
      };
    },

    /**
     * Clear comprehensive report data
     */
    clearComprehensiveReport: (state) => {
      state.comprehensiveReport = initialState.comprehensiveReport;
    },

    /**
     * Clear statistics data
     */
    clearStatistics: (state) => {
      state.statistics = initialState.statistics;
    },

    /**
     * Clear in-building report data
     */
    clearInBuildingReport: (state) => {
      state.inBuildingReport = initialState.inBuildingReport;
    },

    /**
     * Clear all errors
     */
    clearErrors: (state) => {
      state.inBuildingReport.error = null;
      state.comprehensiveReport.error = null;
      state.statistics.error = null;
      state.exportError = null;
    }
  },
  extraReducers: (builder) => {
    // In-building report
    builder
      .addCase(fetchInBuildingReport.pending, (state) => {
        state.inBuildingReport.loading = true;
        state.inBuildingReport.error = null;
      })
      .addCase(fetchInBuildingReport.fulfilled, (state, action) => {
        state.inBuildingReport.loading = false;
        state.inBuildingReport.data = action.payload;
        state.inBuildingReport.error = null;
      })
      .addCase(fetchInBuildingReport.rejected, (state, action) => {
        state.inBuildingReport.loading = false;
        state.inBuildingReport.error = action.payload;
      });

    // Export in-building report
    builder
      .addCase(exportInBuildingReport.pending, (state) => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportInBuildingReport.fulfilled, (state) => {
        state.exporting = false;
        state.exportError = null;
      })
      .addCase(exportInBuildingReport.rejected, (state, action) => {
        state.exporting = false;
        state.exportError = action.payload;
      });

    // Comprehensive report
    builder
      .addCase(fetchComprehensiveReport.pending, (state) => {
        state.comprehensiveReport.loading = true;
        state.comprehensiveReport.error = null;
      })
      .addCase(fetchComprehensiveReport.fulfilled, (state, action) => {
        state.comprehensiveReport.loading = false;
        state.comprehensiveReport.data = action.payload;
        state.comprehensiveReport.error = null;
      })
      .addCase(fetchComprehensiveReport.rejected, (state, action) => {
        state.comprehensiveReport.loading = false;
        state.comprehensiveReport.error = action.payload;
      });

    // Export comprehensive report
    builder
      .addCase(exportComprehensiveReport.pending, (state) => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportComprehensiveReport.fulfilled, (state) => {
        state.exporting = false;
        state.exportError = null;
      })
      .addCase(exportComprehensiveReport.rejected, (state, action) => {
        state.exporting = false;
        state.exportError = action.payload;
      });

    // Statistics
    builder
      .addCase(fetchStatistics.pending, (state) => {
        state.statistics.loading = true;
        state.statistics.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.statistics.loading = false;
        state.statistics.data = action.payload;
        state.statistics.error = null;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.statistics.loading = false;
        state.statistics.error = action.payload;
      });

    // Export statistics
    builder
      .addCase(exportStatistics.pending, (state) => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportStatistics.fulfilled, (state) => {
        state.exporting = false;
        state.exportError = null;
      })
      .addCase(exportStatistics.rejected, (state, action) => {
        state.exporting = false;
        state.exportError = action.payload;
      });
  }
});

// ============================================================================
// ACTIONS
// ============================================================================

export const {
  setFilters,
  resetFilters,
  setPagination,
  clearComprehensiveReport,
  clearStatistics,
  clearInBuildingReport,
  clearErrors
} = reportsSlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================

export const selectInBuildingReport = (state) => state.reports.inBuildingReport;
export const selectComprehensiveReport = (state) => state.reports.comprehensiveReport;
export const selectStatistics = (state) => state.reports.statistics;
export const selectFilters = (state) => state.reports.filters;
export const selectPagination = (state) => state.reports.pagination;
export const selectExporting = (state) => state.reports.exporting;
export const selectReportErrors = (state) => ({
  inBuilding: state.reports.inBuildingReport.error,
  comprehensive: state.reports.comprehensiveReport.error,
  statistics: state.reports.statistics.error,
  export: state.reports.exportError
});

// ============================================================================
// EXPORT
// ============================================================================

export default reportsSlice.reducer;
