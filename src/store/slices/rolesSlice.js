import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roleService from '../../services/roleService';
import { handleApiError } from '../../services/errorService';

// Initial state
const initialState = {
  // Role list
  list: [],
  systemRoles: [],
  customRoles: [],

  // Current role being viewed/edited
  currentRole: null,

  // Loading states
  loading: false,
  listLoading: false,
  createLoading: false,
  updateLoading: false,
  permissionLoading: false,

  // Error states
  error: null,
  listError: null,
  createError: null,
  updateError: null,
  permissionError: null,

  // UI state
  selectedRoleId: null,
  showCreateModal: false,
  showEditModal: false,
  showPermissionModal: false
};

// Async thunks for role operations

/**
 * Get all roles
 */
export const getRoles = createAsyncThunk(
  'roles/getRoles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = {
        includeCounts: params.includeCounts ?? true
      };

      const response = await roleService.getRoles(queryParams);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get role by ID with permissions
 */
export const getRoleById = createAsyncThunk(
  'roles/getRoleById',
  async (roleId, { rejectWithValue }) => {
    try {
      const response = await roleService.getRoleById(roleId);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Create new role
 */
export const createRole = createAsyncThunk(
  'roles/createRole',
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await roleService.createRole(roleData);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Update existing role
 */
export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ roleId, roleData }, { rejectWithValue }) => {
    try {
      const response = await roleService.updateRole(roleId, roleData);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Grant permissions to role
 */
export const grantPermissions = createAsyncThunk(
  'roles/grantPermissions',
  async ({ roleId, permissionIds, reason }, { rejectWithValue }) => {
    try {
      const response = await roleService.grantPermissions(roleId, permissionIds, reason);
      return { roleId, grantedCount: response };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Revoke permissions from role
 */
export const revokePermissions = createAsyncThunk(
  'roles/revokePermissions',
  async ({ roleId, permissionIds, reason }, { rejectWithValue }) => {
    try {
      const response = await roleService.revokePermissions(roleId, permissionIds, reason);
      return { roleId, revokedCount: response };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Update role permissions (bulk update)
 */
export const updateRolePermissions = createAsyncThunk(
  'roles/updateRolePermissions',
  async ({ roleId, permissionIds, reason }, { rejectWithValue }) => {
    try {
      const response = await roleService.updateRolePermissions(roleId, permissionIds, reason);
      return { roleId, ...response };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get custom roles only
 */
export const getCustomRoles = createAsyncThunk(
  'roles/getCustomRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roleService.getCustomRoles();
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get system roles only
 */
export const getSystemRoles = createAsyncThunk(
  'roles/getSystemRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roleService.getSystemRoles();
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice
const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    // Set current role
    setCurrentRole: (state, action) => {
      state.currentRole = action.payload;
    },

    // Clear current role
    clearCurrentRole: (state) => {
      state.currentRole = null;
    },

    // Set selected role ID
    setSelectedRoleId: (state, action) => {
      state.selectedRoleId = action.payload;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.permissionError = null;
    },

    // Toggle modals
    toggleCreateModal: (state) => {
      state.showCreateModal = !state.showCreateModal;
    },

    toggleEditModal: (state) => {
      state.showEditModal = !state.showEditModal;
    },

    togglePermissionModal: (state) => {
      state.showPermissionModal = !state.showPermissionModal;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get roles
      .addCase(getRoles.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;

        // Separate system and custom roles
        state.systemRoles = action.payload.filter(role => role.isSystemRole);
        state.customRoles = action.payload.filter(role => !role.isSystemRole);
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload?.message || 'Failed to load roles';
      })

      // Get role by ID
      .addCase(getRoleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRole = action.payload;
      })
      .addCase(getRoleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load role';
      })

      // Create role
      .addCase(createRole.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.createLoading = false;
        state.list.push(action.payload);

        // Add to custom roles
        state.customRoles.push(action.payload);
        state.showCreateModal = false;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload?.message || 'Failed to create role';
      })

      // Update role
      .addCase(updateRole.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.updateLoading = false;

        // Update role in list
        const index = state.list.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }

        // Update current role if it's the one being edited
        if (state.currentRole?.id === action.payload.id) {
          state.currentRole = action.payload;
        }

        // Update in system/custom roles lists
        if (action.payload.isSystemRole) {
          const sysIndex = state.systemRoles.findIndex(role => role.id === action.payload.id);
          if (sysIndex !== -1) {
            state.systemRoles[sysIndex] = action.payload;
          }
        } else {
          const customIndex = state.customRoles.findIndex(role => role.id === action.payload.id);
          if (customIndex !== -1) {
            state.customRoles[customIndex] = action.payload;
          }
        }

        state.showEditModal = false;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload?.message || 'Failed to update role';
      })

      // Grant permissions
      .addCase(grantPermissions.pending, (state) => {
        state.permissionLoading = true;
        state.permissionError = null;
      })
      .addCase(grantPermissions.fulfilled, (state, action) => {
        state.permissionLoading = false;
        // Permissions will be refreshed by re-fetching the role
      })
      .addCase(grantPermissions.rejected, (state, action) => {
        state.permissionLoading = false;
        state.permissionError = action.payload?.message || 'Failed to grant permissions';
      })

      // Revoke permissions
      .addCase(revokePermissions.pending, (state) => {
        state.permissionLoading = true;
        state.permissionError = null;
      })
      .addCase(revokePermissions.fulfilled, (state, action) => {
        state.permissionLoading = false;
        // Permissions will be refreshed by re-fetching the role
      })
      .addCase(revokePermissions.rejected, (state, action) => {
        state.permissionLoading = false;
        state.permissionError = action.payload?.message || 'Failed to revoke permissions';
      })

      // Update role permissions (bulk)
      .addCase(updateRolePermissions.pending, (state) => {
        state.permissionLoading = true;
        state.permissionError = null;
      })
      .addCase(updateRolePermissions.fulfilled, (state, action) => {
        state.permissionLoading = false;
        state.showPermissionModal = false;
        // Permissions will be refreshed by re-fetching the role
      })
      .addCase(updateRolePermissions.rejected, (state, action) => {
        state.permissionLoading = false;
        state.permissionError = action.payload?.message || 'Failed to update permissions';
      })

      // Get custom roles
      .addCase(getCustomRoles.fulfilled, (state, action) => {
        state.customRoles = action.payload;
      })

      // Get system roles
      .addCase(getSystemRoles.fulfilled, (state, action) => {
        state.systemRoles = action.payload;
      });
  }
});

// Actions
export const {
  setCurrentRole,
  clearCurrentRole,
  setSelectedRoleId,
  clearError,
  toggleCreateModal,
  toggleEditModal,
  togglePermissionModal
} = rolesSlice.actions;

// Selectors
export const selectRoles = (state) => state.roles.list;
export const selectSystemRoles = (state) => state.roles.systemRoles;
export const selectCustomRoles = (state) => state.roles.customRoles;
export const selectCurrentRole = (state) => state.roles.currentRole;
export const selectRolesLoading = (state) => state.roles.loading || state.roles.listLoading;
export const selectRolesError = (state) => state.roles.error || state.roles.listError;
export const selectCreateLoading = (state) => state.roles.createLoading;
export const selectUpdateLoading = (state) => state.roles.updateLoading;
export const selectPermissionLoading = (state) => state.roles.permissionLoading;
export const selectShowCreateModal = (state) => state.roles.showCreateModal;
export const selectShowEditModal = (state) => state.roles.showEditModal;
export const selectShowPermissionModal = (state) => state.roles.showPermissionModal;

// Reducer
export default rolesSlice.reducer;
