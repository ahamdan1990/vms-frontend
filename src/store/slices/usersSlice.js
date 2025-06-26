import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';
import { handleApiError } from '../../services/errorService'; 

// Initial state
const initialState = {
  // User list
  list: [],
  total: 0,
  pagination: {
    pageIndex: 0,
    pageSize: 20,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  },
  
  // Current user being viewed/edited
  currentUser: null,
  
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
    searchTerm: '',
    role: '',
    status: '',
    department: '',
    sortBy: 'LastName',
    sortDescending: false
  },
  
  // Available options
  availableRoles: [],
  userStats: null,
  
  // User activity
  userActivity: {
    data: [],
    loading: false,
    error: null,
    pagination: {
      pageIndex: 0,
      pageSize: 20,
      totalPages: 0
    }
  },
  
  // UI state
  selectedUsers: [],
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showActivityModal: false
};

// Async thunks for user operations

/**
 * Get users with pagination and filtering
 */
export const getUsers = createAsyncThunk(
  'users/getUsers',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const filters = state.users.filters;
      
      const queryParams = {
        pageIndex: params.pageIndex ?? filters.pageIndex ?? 0,
        pageSize: params.pageSize ?? filters.pageSize ?? 20,
        searchTerm: params.searchTerm ?? filters.searchTerm,
        role: params.role ?? filters.role,
        status: params.status ?? filters.status,
        department: params.department ?? filters.department,
        sortBy: params.sortBy ?? filters.sortBy ?? 'LastName',
        sortDescending: params.sortDescending ?? filters.sortDescending ?? false
      };
      
      const response = await userService.getUsers(queryParams);
      return { response, queryParams };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get user by ID
 */
export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userService.getUserById(id);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Create new user
 */
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const validation = userService.validateUserData(userData, false);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors);
      }
      
      const response = await userService.createUser(userData);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Update user
 */
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const validation = userService.validateUserData(userData, true);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors);
      }
      
      const response = await userService.updateUser(id, userData);
      return { id, user: response };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Delete user
 */
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Activate user
 */
export const activateUser = createAsyncThunk(
  'users/activateUser',
  async ({ id, reason, resetFailedAttempts }, { rejectWithValue }) => {
    try {
      const response = await userService.activateUser(id, { reason, resetFailedAttempts });
      return { id, user: response };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Deactivate user
 */
export const deactivateUser = createAsyncThunk(
  'users/deactivateUser',
  async ({ id, reason, revokeAllSessions }, { rejectWithValue }) => {
    try {
      const response = await userService.deactivateUser(id, { reason, revokeAllSessions });
      return { id, user: response };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Unlock user
 */
export const unlockUser = createAsyncThunk(
  'users/unlockUser',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await userService.unlockUser(id, { reason });
      return { id, user: response };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Reset user password (admin)
 */
export const adminResetPassword = createAsyncThunk(
  'users/adminResetPassword',
  async ({ id, newPassword, mustChangePassword, notifyUser }, { rejectWithValue }) => {
    try {
      const response = await userService.adminResetPassword(id, {
        newPassword,
        mustChangePassword,
        notifyUser
      });
      return { id, result: response };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get available roles
 */
export const getAvailableRoles = createAsyncThunk(
  'users/getAvailableRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getAvailableRoles();
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get user activity
 */
export const getUserActivity = createAsyncThunk(
  'users/getUserActivity',
  async ({ id, pageIndex = 0, pageSize = 20, days = 30 }, { rejectWithValue }) => {
    try {
      const response = await userService.getUserActivity(id, { pageIndex, pageSize, days });
      return { userId: id, response, pageIndex, pageSize };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get user statistics
 */
export const getUserStats = createAsyncThunk(
  'users/getUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserStats();
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Users slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.userActivity.error = null;
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Set current user
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    
    // Clear current user
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    
    // Update selected users
    setSelectedUsers: (state, action) => {
      state.selectedUsers = action.payload;
    },
    
    // Toggle user selection
    toggleUserSelection: (state, action) => {
      const userId = action.payload;
      const index = state.selectedUsers.indexOf(userId);
      if (index === -1) {
        state.selectedUsers.push(userId);
      } else {
        state.selectedUsers.splice(index, 1);
      }
    },
    
    // Clear selections
    clearSelections: (state) => {
      state.selectedUsers = [];
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
      state.currentUser = action.payload;
    },
    
    hideEditModal: (state) => {
      state.showEditModal = false;
      state.currentUser = null;
      state.updateError = null;
    },
    
    showDeleteModal: (state, action) => {
      state.showDeleteModal = true;
      state.currentUser = action.payload;
    },
    
    hideDeleteModal: (state) => {
      state.showDeleteModal = false;
      state.currentUser = null;
      state.deleteError = null;
    },
    
    showActivityModal: (state, action) => {
      state.showActivityModal = true;
      state.currentUser = action.payload;
    },
    
    hideActivityModal: (state) => {
      state.showActivityModal = false;
      state.currentUser = null;
      state.userActivity.data = [];
      state.userActivity.error = null;
    },

    hydrateState: (state, action) => {
      const { filters, selectedUsers, showCreateModal, showEditModal, showDeleteModal, showActivityModal } = action.payload;
      
      if (filters) state.filters = { ...state.filters, ...filters };
      if (selectedUsers) state.selectedUsers = selectedUsers;
      if (showCreateModal !== undefined) state.showCreateModal = showCreateModal;
      if (showEditModal !== undefined) state.showEditModal = showEditModal;
      if (showDeleteModal !== undefined) state.showDeleteModal = showDeleteModal;
      if (showActivityModal !== undefined) state.showActivityModal = showActivityModal;
    }
  },
  extraReducers: (builder) => {
    // Get users
    builder
      .addCase(getUsers.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.listLoading = false;
        const { response, queryParams } = action.payload;
        
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
      .addCase(getUsers.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload?.[0] || 'Failed to load users';
      });

    // Get user by ID
    builder
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.[0] || 'Failed to load user';
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createLoading = false;
        state.list.unshift(action.payload);
        state.total += 1;
        state.showCreateModal = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = Array.isArray(action.payload) ? 
          action.payload : [action.payload || 'Failed to create user'];
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoading = false;
        const { id, user } = action.payload;
        
        // Update in list
        const index = state.list.findIndex(u => u.id === id);
        if (index !== -1) {
          state.list[index] = user;
        }
        
        // Update current user if it's the same
        if (state.currentUser?.id === id) {
          state.currentUser = user;
        }
        
        state.showEditModal = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = Array.isArray(action.payload) ? 
          action.payload : [action.payload || 'Failed to update user'];
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const userId = action.payload;
        
        // Remove from list
        state.list = state.list.filter(u => u.id !== userId);
        state.total -= 1;
        
        // Clear current user if it's the deleted one
        if (state.currentUser?.id === userId) {
          state.currentUser = null;
        }
        
        // Remove from selections
        state.selectedUsers = state.selectedUsers.filter(id => id !== userId);
        
        state.showDeleteModal = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload?.[0] || 'Failed to delete user';
      });

    // Activate user
    builder
      .addCase(activateUser.fulfilled, (state, action) => {
        const { id, user } = action.payload;
        const index = state.list.findIndex(u => u.id === id);
        if (index !== -1) {
          state.list[index] = user;
        }
        if (state.currentUser?.id === id) {
          state.currentUser = user;
        }
      });

    // Deactivate user
    builder
      .addCase(deactivateUser.fulfilled, (state, action) => {
        const { id, user } = action.payload;
        const index = state.list.findIndex(u => u.id === id);
        if (index !== -1) {
          state.list[index] = user;
        }
        if (state.currentUser?.id === id) {
          state.currentUser = user;
        }
      });

    // Unlock user
    builder
      .addCase(unlockUser.fulfilled, (state, action) => {
        const { id, user } = action.payload;
        const index = state.list.findIndex(u => u.id === id);
        if (index !== -1) {
          state.list[index] = user;
        }
        if (state.currentUser?.id === id) {
          state.currentUser = user;
        }
      });

    // Get available roles
    builder
      .addCase(getAvailableRoles.fulfilled, (state, action) => {
        state.availableRoles = action.payload || [];
      });

    // Get user activity
    builder
      .addCase(getUserActivity.pending, (state) => {
        state.userActivity.loading = true;
        state.userActivity.error = null;
      })
      .addCase(getUserActivity.fulfilled, (state, action) => {
        state.userActivity.loading = false;
        const { response, pageIndex, pageSize } = action.payload;
        
        state.userActivity.data = response.items || [];
        state.userActivity.pagination = {
          pageIndex: response.pageIndex || pageIndex,
          pageSize: response.pageSize || pageSize,
          totalPages: response.totalPages || 0,
          hasNext: response.hasNextPage || false,
          hasPrevious: response.hasPreviousPage || false
        };
      })
      .addCase(getUserActivity.rejected, (state, action) => {
        state.userActivity.loading = false;
        state.userActivity.error = action.payload?.[0] || 'Failed to load user activity';
      });

    // Get user stats
    builder
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload;
      });
  }
});

// Export actions
export const {
  clearError,
  updateFilters,
  resetFilters,
  setCurrentUser,
  clearCurrentUser,
  setSelectedUsers,
  toggleUserSelection,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  showActivityModal,
  hideActivityModal,
  hydrateState
} = usersSlice.actions;

// Export reducer
export default usersSlice.reducer;