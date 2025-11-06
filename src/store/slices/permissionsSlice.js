import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import permissionService from '../../services/permissionService';
import { handleApiError } from '../../services/errorService';
import { act } from 'react';

// Initial state
const initialState = {
  // Permission list
  list: [],
  categorizedList: [],

  // Loading states
  loading: false,
  categoriesLoading: false,

  // Error states
  error: null,
  categoriesError: null,

  // Filters
  filters: {
    searchTerm: '',
    category: '',
    isActive: true
  },

  // Available categories (extracted from permissions)
  categories: []
};

// Async thunks for permission operations

/**
 * Get all permissions with optional filtering
 */
export const getPermissions = createAsyncThunk(
  'permissions/getPermissions',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const filters = state.permissions.filters;

      const queryParams = {
        searchTerm: params.searchTerm ?? filters.searchTerm,
        category: params.category ?? filters.category,
        isActive: params.isActive ?? filters.isActive
      };

      const response = await permissionService.getPermissions(queryParams);
      return { response, queryParams };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get permissions grouped by category
 */
export const getPermissionsByCategory = createAsyncThunk(
  'permissions/getPermissionsByCategory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await permissionService.getPermissionsByCategory();
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Search permissions
 */
export const searchPermissions = createAsyncThunk(
  'permissions/searchPermissions',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await permissionService.searchPermissions(searchTerm);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice
const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.categoriesError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get permissions
      .addCase(getPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.response;
        state.filters = { ...state.filters, ...action.payload.queryParams };
        
        // Extract unique categories
        const categoriesSet = new Set(action.payload.response.map(p => p.category));
        state.categories = Array.from(categoriesSet).sort();
      })
      .addCase(getPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load permissions';
      })

      // Get permissions by category
      .addCase(getPermissionsByCategory.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(getPermissionsByCategory.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categorizedList = action.payload;
        
        // Extract categories from categorized list
        state.categories = action.payload.map(cat => cat.categoryName).sort();
      })
      .addCase(getPermissionsByCategory.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload?.message || 'Failed to load permission categories';
      })

      // Search permissions
      .addCase(searchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(searchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to search permissions';
      });
  }
});

// Actions
export const {
  setFilters,
  resetFilters,
  clearError
} = permissionsSlice.actions;

// Selectors
export const selectPermissions = (state) => state.permissions.list;
export const selectCategorizedPermissions = (state) => state.permissions.categorizedList;
export const selectPermissionsLoading = (state) => state.permissions.loading;
export const selectCategoriesLoading = (state) => state.permissions.categoriesLoading;
export const selectPermissionsError = (state) => state.permissions.error;
export const selectPermissionFilters = (state) => state.permissions.filters;
export const selectPermissionCategories = (state) => state.permissions.categories;

// Reducer
export default permissionsSlice.reducer;
