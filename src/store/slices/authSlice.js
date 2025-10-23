import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { handleApiError } from '../../services/errorService';
import tokenService from '../../services/tokenService';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  permissions: [],
  sessions: [],
  passwordChangeRequired: false,
  twoFactorRequired: false,
  lockoutTimeRemaining: null
};

// Async thunks for authentication actions

/**
 * Login user
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // If login successful, get current user info and permissions
      if (response.isSuccess) {
        const [userInfo, permissions] = await Promise.all([
          authService.getCurrentUser(),
          authService.getUserPermissions()
        ]);
        
        return {
          loginResponse: response,
          user: userInfo,
          permissions: permissions.permissions || []
        };
      }
      
      return { loginResponse: response };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Logout user
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (logoutFromAllDevices = false, { rejectWithValue }) => {
    try {
      const response = await authService.logout(logoutFromAllDevices);
      return response;
    } catch (error) {
      // Even if logout fails on server, clear local state
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get current user
 */
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const [userInfo, permissions] = await Promise.all([
        authService.getCurrentUser(),
        authService.getUserPermissions()
      ]);
      
      return {
        user: userInfo,
        permissions: permissions.permissions || []
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Change password
 */
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Forgot password
 */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Reset password
 */
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(resetData);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Validate token
 */
export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.validateToken();
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Get user sessions
 */
export const getUserSessions = createAsyncThunk(
  'auth/getUserSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getUserSessions();
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Terminate session
 */
export const terminateSession = createAsyncThunk(
  'auth/terminateSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await authService.terminateSession(sessionId);
      return { sessionId, response };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear all auth state (used for logout)
    clearAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.permissions = [];
      state.sessions = [];
      state.error = null;
      state.passwordChangeRequired = false;
      state.twoFactorRequired = false;
      state.lockoutTimeRemaining = null;
    },
    
    // Update user info
    updateUserInfo: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Update permissions (for real-time permission changes)
    updatePermissions: (state, action) => {
      state.permissions = action.payload;
    },

    // Set authentication state from token validation
    setAuthenticationState: (state, action) => {
      const { isAuthenticated, user, permissions } = action.payload;
      state.isAuthenticated = isAuthenticated;
      if (user) state.user = user;
      if (permissions) state.permissions = permissions;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        
        const { loginResponse, user, permissions } = action.payload;
        
        if (loginResponse.isSuccess) {
          state.isAuthenticated = true;
          state.user = user;
          state.permissions = permissions || [];
          state.passwordChangeRequired = loginResponse.requiresPasswordChange?? false;
          state.twoFactorRequired = loginResponse.requiresTwoFactor?? false;
          state.error = null;
          
          // Clear any remaining lockout time on successful login
          state.lockoutTimeRemaining = null;
        } else {
          state.error = loginResponse.errorMessage || 'Login failed';
          state.lockoutTimeRemaining = loginResponse.lockoutTimeRemaining;
          state.isAuthenticated = false;
          state.user = null;
          state.permissions = [];
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
        state.isAuthenticated = false;
        state.user = null;
        state.permissions = [];
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        // ✅ CRITICAL FIX: Clear auth state immediately on logout
        // This prevents useAuth from seeing stale auth in localStorage
        state.user = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.sessions = [];
        state.passwordChangeRequired = false;
        state.twoFactorRequired = false;

        // Also clear localStorage immediately
        try {
          const stored = localStorage.getItem('vms_app_state');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.auth = {
              user: null,
              isAuthenticated: false,
              permissions: []
            };
            localStorage.setItem('vms_app_state', JSON.stringify(parsed));
          }
        } catch (e) {
          console.warn('Failed to clear auth from localStorage:', e);
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.sessions = [];
        state.error = null;
        state.passwordChangeRequired = false;
        state.twoFactorRequired = false;
        state.lockoutTimeRemaining = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // Clear state even if logout failed on server
        state.user = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.sessions = [];
        state.passwordChangeRequired = false;
        state.twoFactorRequired = false;
        state.lockoutTimeRemaining = null;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.permissions = action.payload.permissions;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get user info';
        state.isAuthenticated = false;
        state.user = null;
        state.permissions = [];
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordChangeRequired = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Password change failed';
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Password reset request failed';
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.[0] || 'Password reset failed';
      });

    // Validate token
    builder
      .addCase(validateToken.fulfilled, (state, action) => {
        if (action.payload.isValid) {
          state.isAuthenticated = true;
          // Update token service
          tokenService.handleTokenRefresh();
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.permissions = [];
          // Clear token service
          tokenService.handleLogout();
        }
      })
      .addCase(validateToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.permissions = [];
        // Clear token service
        tokenService.handleLogout();
      });

    // Get user sessions
    builder
      .addCase(getUserSessions.fulfilled, (state, action) => {
        state.sessions = action.payload || [];
      })
      .addCase(getUserSessions.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to get user sessions';
      });

    // Terminate session
    builder
      .addCase(terminateSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(
          session => session.sessionId !== action.payload.sessionId
        );
      })
      .addCase(terminateSession.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to terminate session';
      });
  }
});

// Export actions
export const { 
  clearError, 
  clearAuthState, 
  updateUserInfo, 
  setLoading,
  updatePermissions,
  setAuthenticationState
} = authSlice.actions;

// Logout action that clears state immediately
export const logout = () => (dispatch) => {
  // Clear token service
  tokenService.handleLogout();
  
  // Clear Redux state
  dispatch(clearAuthState());
  
  // Attempt server logout (don't wait for it)
  dispatch(logoutUser()).catch(() => {
    // Ignore logout errors - local state is already cleared
  });
};

// Action to refresh authentication state
export const refreshAuthState = () => async (dispatch, getState) => {
  const { auth } = getState();
  
  // Only refresh if currently authenticated
  if (!auth.isAuthenticated) return;
  
  try {
    // Validate current session
    const sessionValidation = tokenService.validateSession();
    
    if (!sessionValidation.isValid) {
      dispatch(logout());
      return;
    }
    
    // Refresh user data and permissions
    await dispatch(getCurrentUser());
  } catch (error) {
    console.error('Failed to refresh auth state:', error);
    dispatch(logout());
  }
};

// Action to update session activity
export const updateSessionActivity = () => (dispatch, getState) => {
  const { auth } = getState();
  
  if (auth.isAuthenticated) {
    tokenService.updateLastActivity();
  }
};

// Middleware-like action to handle authentication state changes
export const handleAuthStateChange = (isAuthenticated) => (dispatch) => {
  if (!isAuthenticated) {
    dispatch(logout());
  }
};

// Export reducer
export default authSlice.reducer;