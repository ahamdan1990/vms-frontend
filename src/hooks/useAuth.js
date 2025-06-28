// src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useRef } from 'react';
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
  validateToken,
  getUserSessions,
  terminateSession,
  clearError,
  logout
} from '../store/slices/authSlice';
import { startTokenRefresh, stopTokenRefresh } from '../services/apiClient';
import tokenService from '../services/tokenService';

import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectPermissions,
  selectSessions,
  selectPasswordChangeRequired,
  selectTwoFactorRequired,
  selectLockoutTimeRemaining,
  selectUserId,
  selectUserEmail,
  selectUserFullName,
  selectUserRole,
  selectUserDepartment,
  selectUserJobTitle,
  selectIsAdmin,
  selectIsStaff,
  selectIsOperator,
  selectHasPermission,
  selectHasAnyPermission,
  selectHasAllPermissions,
  selectCanManageUsers,
  selectCanViewReports,
  selectCanManageSystem
} from '../store/selectors/authSelectors';

// ✅ SOLUTION: Module-level lock to prevent multiple initializations
let initializationPromise = null;

/**
 * Custom hook for authentication operations - FINAL FIXED VERSION
 */
export const useAuth = () => {
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const permissions = useSelector(selectPermissions);
  const sessions = useSelector(selectSessions);
  const passwordChangeRequired = useSelector(selectPasswordChangeRequired);
  const twoFactorRequired = useSelector(selectTwoFactorRequired);
  const lockoutTimeRemaining = useSelector(selectLockoutTimeRemaining);

  const isAdmin = useSelector(selectIsAdmin);
  const isStaff = useSelector(selectIsStaff);
  const isOperator = useSelector(selectIsOperator);

  const canManageUsers = useSelector(selectCanManageUsers);
  const canViewReports = useSelector(selectCanViewReports);
  const canManageSystem = useSelector(selectCanManageSystem);

  const userId = useSelector(selectUserId);
  const userEmail = useSelector(selectUserEmail);
  const userName = useSelector(selectUserFullName);
  const userRole = useSelector(selectUserRole);
  const userDepartment = useSelector(selectUserDepartment);
  const userJobTitle = useSelector(selectUserJobTitle);

  const hasPermission = useSelector(selectHasPermission);
  const hasAnyPermission = useSelector(selectHasAnyPermission);
  const hasAllPermissions = useSelector(selectHasAllPermissions);

  // Authentication actions
  const login = useCallback(async (credentials) => {
    try {
      // Create login credentials with device fingerprint
      const loginCredentials = tokenService.createLoginCredentials(
        credentials.email,
        credentials.password,
        credentials.rememberMe
      );

      const result = await dispatch(loginUser(loginCredentials));
      
      // Handle successful login
      if (result.payload?.loginResponse?.isSuccess) {
        tokenService.handleLoginSuccess(result.payload.loginResponse);
        
        // Start automatic token refresh
        startTokenRefresh();
      }
      
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      return { error };
    }
  }, [dispatch]);

  const logoutCurrentUser = useCallback(async (logoutFromAllDevices = false) => {
    try {
      // Stop token refresh
      stopTokenRefresh();
      
      // Handle logout in token service
      tokenService.handleLogout();
      
      // Dispatch logout action
      const result = await dispatch(logoutUser(logoutFromAllDevices));
      
      return result;
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails on server, clear local state
      tokenService.handleLogout();
      dispatch(logout());
      return { error };
    }
  }, [dispatch]);

  const logoutImmediate = useCallback(() => {
    console.log('🚪 Immediate logout triggered');
    // Stop token refresh
    stopTokenRefresh();
    
    // Handle logout in token service
    tokenService.handleLogout();
    
    // Dispatch immediate logout
    dispatch(logout());
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    try {
      console.log('🔍 Checking authentication with server...');
      const result = await dispatch(getCurrentUser());
      
      if (result.payload) {
        console.log('✅ Authentication check successful');
        // Start token refresh if not already running
        startTokenRefresh();
        return result.payload;
      } else {
        console.log('❌ Authentication check failed - no payload');
        logoutImmediate();
        return null;
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      logoutImmediate();
      return null;
    }
  }, [dispatch, logoutImmediate]);

  const updatePassword = useCallback(async (passwordData) => {
    try {
      const result = await dispatch(changePassword(passwordData));
      return result;
    } catch (error) {
      console.error('Password change failed:', error);
      return { error };
    }
  }, [dispatch]);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      const result = await dispatch(forgotPassword(email));
      return result;
    } catch (error) {
      console.error('Password reset request failed:', error);
      return { error };
    }
  }, [dispatch]);

  const resetUserPassword = useCallback(async (resetData) => {
    try {
      const result = await dispatch(resetPassword(resetData));
      return result;
    } catch (error) {
      console.error('Password reset failed:', error);
      return { error };
    }
  }, [dispatch]);

  const checkTokenValidity = useCallback(async () => {
    try {
      const result = await dispatch(validateToken());
      return result;
    } catch (error) {
      console.error('Token validation failed:', error);
      return { error };
    }
  }, [dispatch]);

  const fetchUserSessions = useCallback(async () => {
    try {
      const result = await dispatch(getUserSessions());
      return result;
    } catch (error) {
      console.error('Failed to fetch user sessions:', error);
      return { error };
    }
  }, [dispatch]);

  const endSession = useCallback(async (sessionId) => {
    try {
      const result = await dispatch(terminateSession(sessionId));
      return result;
    } catch (error) {
      console.error('Failed to terminate session:', error);
      return { error };
    }
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // ✅ FINAL FIX: Auto-check authentication status using a module-level lock
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedData = localStorage.getItem('vms_app_state');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData?.auth?.isAuthenticated && parsedData?.auth?.user) {
            console.log('💾 Found stored auth state, validating with server...');
            await checkAuth();
            return;
          }
        }
        console.log('❌ No stored auth state found');
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      }
    };

    if (!isAuthenticated && !loading) {
      if (!initializationPromise) {
        console.log('🚀 Kicking off single authentication initialization...');
        initializationPromise = initializeAuth().finally(() => {
          // Reset the lock once the initialization is complete
          initializationPromise = null;
        });
      }
    }
  }, [isAuthenticated, loading, checkAuth]);

  // Set up token refresh for authenticated users
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('🔄 Starting token refresh for authenticated user');
      startTokenRefresh();
    } else {
      stopTokenRefresh();
    }

    return () => {
      stopTokenRefresh();
    };
  }, [isAuthenticated, loading]);

  const isRole = useCallback((role) => {
    return userRole === role;
  }, [userRole]);

  const isAnyRole = useCallback((roleList) => {
    return roleList.includes(userRole);
  }, [userRole]);

  // Computed properties
  const isLocked = Boolean(lockoutTimeRemaining);
  const needsPasswordChange = passwordChangeRequired;
  const needsTwoFactor = twoFactorRequired;

  // Session management
  const getSessionInfo = useCallback(() => {
    return tokenService.getAuthState();
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const result = await checkTokenValidity();
      if (result.payload) {
        tokenService.handleTokenRefresh();
      }
      return result;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return { error };
    }
  }, [checkTokenValidity]);

  // Get remembered email for login form
  const getRememberedEmail = useCallback(() => {
    return tokenService.getRememberedEmail();
  }, []);

  // Check if session is active
  const isSessionActive = useCallback(() => {
    return tokenService.isSessionActive();
  }, []);

  return {
    // State (from selectors)
    user,
    isAuthenticated,
    loading,
    error,
    permissions,
    sessions,
    isLocked,
    needsPasswordChange,
    needsTwoFactor,
    lockoutTimeRemaining,

    // Actions
    login,
    logout: logoutCurrentUser,
    logoutImmediate,
    checkAuth,
    changePassword: updatePassword,
    forgotPassword: requestPasswordReset,
    resetPassword: resetUserPassword,
    validateToken: checkTokenValidity,
    getUserSessions: fetchUserSessions,
    terminateSession: endSession,
    clearError: clearAuthError,

    // Permission checks (from selectors)
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    isAnyRole,

    // Computed role checks (from selectors)
    isAdmin,
    isStaff,
    isOperator,

    // Computed permission checks (from selectors)
    canManageUsers,
    canViewReports,
    canManageSystem,

    // Session management
    getSessionInfo,
    refreshSession,
    isSessionActive,
    getRememberedEmail,

    // User info shortcuts (from selectors)
    userId,
    userEmail,
    userName,
    userRole,
    userDepartment,
    userJobTitle
  };
};