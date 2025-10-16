// src/hooks/useAuth.js - PRODUCTION FIXED VERSION
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo } from 'react';
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

// ✅ PRODUCTION FIX: Single global initialization lock
let globalInitializationPromise = null;
let isInitialized = false;

/**
 * Custom hook for authentication operations - PRODUCTION READY VERSION
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const initRef = useRef(false);

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
      const loginCredentials = tokenService.createLoginCredentials(
        credentials.email,
        credentials.password,
        credentials.rememberMe
      );

      const result = await dispatch(loginUser(loginCredentials));
      
      if (result.payload?.loginResponse?.isSuccess) {
        tokenService.handleLoginSuccess(result.payload.loginResponse);
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
      stopTokenRefresh();
      tokenService.handleLogout();
      const result = await dispatch(logoutUser(logoutFromAllDevices));
      return result;
    } catch (error) {
      console.error('Logout failed:', error);
      tokenService.handleLogout();
      dispatch(logout());
      return { error };
    }
  }, [dispatch]);

  const logoutImmediate = useCallback(() => {
    stopTokenRefresh();
    tokenService.handleLogout();
    dispatch(logout());
  }, [dispatch]);

  // ✅ PRODUCTION FIX: Stable checkAuth function
  const checkAuth = useCallback(async () => {
    try {
      const result = await dispatch(getCurrentUser());
      
      if (result.payload) {
        startTokenRefresh();
        return result.payload;
      } else {
        logoutImmediate();
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logoutImmediate();
      return null;
    }
  }, [dispatch, logoutImmediate]);

  // ✅ PRODUCTION FIX: Single initialization with proper dependency management
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if already initialized globally
        if (isInitialized || initRef.current) {
          return;
        }

        initRef.current = true;

        // Check for stored auth state
        const storedData = localStorage.getItem('vms_app_state');
        if (!storedData) {
          isInitialized = true;
          return;
        }

        const parsedData = JSON.parse(storedData);
        if (parsedData?.auth?.isAuthenticated && parsedData?.auth?.user) {
          await checkAuth();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        isInitialized = true;
      }
    };

    // Only initialize if not authenticated and not loading
    if (!isAuthenticated && !loading && !isInitialized) {
      if (!globalInitializationPromise) {
        globalInitializationPromise = initializeAuth().finally(() => {
          globalInitializationPromise = null;
        });
      }
    }
  }, []); // Empty dependency array - only run once per component mount

  // ✅ PRODUCTION FIX: Separate effect for token refresh with proper timing
  useEffect(() => {
    let refreshTimeout;

    if (isAuthenticated && !loading) {
      // Delay token refresh start to avoid race conditions
      refreshTimeout = setTimeout(() => {
        if (isAuthenticated) { // Double-check auth state
          startTokenRefresh();
        }
      }, 500); // Longer delay to ensure auth state is stable
    } else {
      stopTokenRefresh();
    }

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      stopTokenRefresh(); // Always stop on cleanup
    };
  }, [isAuthenticated, loading]); // Proper dependencies

  // Other authentication methods remain the same...
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

  const getRememberedEmail = useCallback(() => {
    return tokenService.getRememberedEmail();
  }, []);

  const isSessionActive = useCallback(() => {
    return tokenService.isSessionActive();
  }, []);

  return {
    // State
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

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    isAnyRole,

    // Role checks
    isAdmin,
    isStaff,
    isOperator,

    // Permission checks
    canManageUsers,
    canViewReports,
    canManageSystem,

    // Session management
    getSessionInfo,
    refreshSession,
    isSessionActive,
    getRememberedEmail,

    // User info shortcuts
    userId,
    userEmail,
    userName,
    userRole,
    userDepartment,
    userJobTitle
  };
};