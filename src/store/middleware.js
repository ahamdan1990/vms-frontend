// src/store/middleware.js
import { isRejectedWithValue } from '@reduxjs/toolkit';
import { logout } from './slices/authSlice';
import { incrementErrorCount, addSlowQuery, resetPerformanceCounters } from './slices/uiSlice';
import { addNotification, showSuccessToast, showErrorToast } from './slices/notificationSlice';
import errorService from '../services/errorService';

/**
 * Authentication middleware
 * Handles auth state changes and token management
 */
export const authMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Handle authentication state changes
  if (action.type.includes('auth/')) {
    // Monitor authentication status
    if (action.type === 'auth/loginUser/fulfilled') {
      // Clear any existing error counts on successful login
      store.dispatch(resetPerformanceCounters());
      
      // Show success notification
      store.dispatch(showSuccessToast('Welcome back!', `Logged in successfully`));
      
      // Log successful authentication
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 User authenticated successfully');
      }
    }

    if (action.type === 'auth/logoutUser/fulfilled' || action.type === 'auth/clearAuthState') {
      // Clear sensitive data on logout
      store.dispatch({ type: 'users/clearSelections' });
      store.dispatch({ type: 'ui/resetUIState' });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🚪 User logged out');
      }
    }

    // Handle authentication errors with proper error service integration
    if (action.type === 'auth/loginUser/rejected') {
      const errors = Array.isArray(action.payload) ? action.payload : [action.payload];
      const primaryError = errors[0] || 'Login failed';
      
      // Let errorService determine the appropriate message
      const processedError = errorService.createErrorObject(
        'AUTHENTICATION_ERROR',
        primaryError,
        'high'
      );
      
      // Show appropriate error message
      store.dispatch(showErrorToast('Login Failed', processedError.message));
    }

    // Monitor token refresh failures
    if (action.type === 'auth/validateToken/rejected') {
      // Silent logout on token validation failure
      setTimeout(() => {
        store.dispatch(logout());
      }, 100);
    }
  }

  return result;
};

/**
 * Error handling middleware
 */
export const errorMiddleware = (store) => (next) => (action) => {
  // Handle rejected actions with API errors
  if (isRejectedWithValue(action)) {
    const error = action.payload;
    const actionType = action.type;

    // Increment error count for monitoring
    store.dispatch(incrementErrorCount());

    // Use errorService to process the error consistently
    const processedError = errorService.processApiError({
      response: {
        data: error,
        status: 500 // Default, will be overridden by errorService if available
      },
      message: error
    });

    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`❌ API Error: ${actionType}`);
      console.error('Processed error:', processedError);
      console.error('Original payload:', error);
      console.groupEnd();
    }

    // Handle specific error types
    if (processedError.type === 'AUTHENTICATION_ERROR') {
      store.dispatch(logout());
      return next(action);
    }

    // Show error notification for non-validation errors
    if (!actionType.includes('create') && !actionType.includes('update')) {
      store.dispatch(showErrorToast('Error', processedError.message));
    }
  }

  return next(action);
};

/**
 * Performance monitoring middleware
 */
export const performanceMiddleware = (store) => (next) => (action) => {
  const startTime = performance.now();
  const result = next(action);
  const endTime = performance.now();
  const duration = endTime - startTime;

  // Configurable thresholds
  const SLOW_ACTION_THRESHOLD = 100; // milliseconds
  const LOG_THRESHOLD = 50; // milliseconds

  // Track slow actions
  if (duration > SLOW_ACTION_THRESHOLD && !action.type.includes('pending')) {
    store.dispatch(addSlowQuery({
      action: action.type,
      duration,
      payload: action.payload ? Object.keys(action.payload) : null,
      timestamp: Date.now()
    }));

    if (process.env.NODE_ENV === 'development') {
      console.warn(`🐌 Slow action detected: ${action.type} (${duration.toFixed(2)}ms)`);
    }
  }

  // Log performance metrics in development
  if (process.env.NODE_ENV === 'development' && duration > LOG_THRESHOLD) {
    console.log(`⚡ Action ${action.type}: ${duration.toFixed(2)}ms`);
  }

  return result;
};

/**
 * Notification middleware
 */
export const notificationMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Handle successful operations that should show notifications
  if (action.type.includes('/fulfilled')) {
    const actionType = action.type;

    // User management success notifications
    if (actionType === 'users/createUser/fulfilled') {
      const userName = action.payload.fullName || action.payload.email || 'User';
      store.dispatch(showSuccessToast('User Created', `${userName} has been created successfully.`));
      
      store.dispatch(addNotification({
        type: 'success',
        title: 'User Created',
        message: `User ${userName} has been created successfully.`,
        persistent: false
      }));
    }

    if (actionType === 'users/updateUser/fulfilled') {
      store.dispatch(showSuccessToast('Success', 'User updated successfully'));
    }

    if (actionType === 'users/deleteUser/fulfilled') {
      store.dispatch(showSuccessToast('Success', 'User deleted successfully'));
    }

    if (actionType === 'users/activateUser/fulfilled') {
      store.dispatch(showSuccessToast('Success', 'User activated successfully'));
    }

    if (actionType === 'users/deactivateUser/fulfilled') {
      store.dispatch(showSuccessToast('Success', 'User deactivated successfully'));
    }

    if (actionType === 'users/unlockUser/fulfilled') {
      store.dispatch(showSuccessToast('Success', 'User unlocked successfully'));
    }

    // Authentication success notifications
    if (actionType === 'auth/changePassword/fulfilled') {
      store.dispatch(showSuccessToast('Success', 'Password changed successfully'));
    }

    if (actionType === 'auth/forgotPassword/fulfilled') {
      store.dispatch(showSuccessToast('Email Sent', 'Password reset instructions sent to your email'));
    }

    if (actionType === 'auth/resetPassword/fulfilled') {
      store.dispatch(showSuccessToast('Success', 'Password reset successfully'));
    }
  }

  return result;
};

/**
 * ✅ REMOVED: persistenceMiddleware - let store.js handle persistence
 * This was causing conflicts with the main localStorage persistence
 */

/**
 * Debug middleware (development only)
 */
export const debugMiddleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV !== 'development') {
    return next(action);
  }

  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  // ✅ REDUCED: Only log important auth actions to reduce noise
  if (action.type !== '@@redux/INIT' && action.type !== '@@INIT') {
    const isErrorAction = action.type.includes('rejected');
    const isAuthAction = action.type.includes('auth/');
    const isSlowAction = debugMiddleware.lastActionTime && 
      (Date.now() - debugMiddleware.lastActionTime) > 1000;

    // Only log auth actions, errors, or slow actions
    if (isAuthAction || isErrorAction || isSlowAction) {
      console.group(`🔍 Action: ${action.type} ${isErrorAction ? '❌' : isSlowAction ? '🐌' : ''}`);
      console.log('Payload:', action.payload);
      // Check for state changes
      const stateChanged = prevState !== nextState;
      if (stateChanged) {
        console.log('State changed');
      }
      
      console.groupEnd();
    }
  }

  // Monitor for rapid successive actions
  const now = Date.now();
  if (debugMiddleware.lastActionTime && (now - debugMiddleware.lastActionTime) < 10) {
    console.warn('⚠️  Rapid successive actions detected:', action.type);
  }
  debugMiddleware.lastActionTime = now;

  return result;
};

/**
 * Validation middleware
 */
export const validationMiddleware = (store) => (next) => (action) => {
  // Validate action structure
  if (!action || typeof action !== 'object' || !action.type) {
    const validationError = errorService.createErrorObject(
      'VALIDATION_ERROR',
      'Invalid action dispatched',
      'medium',
      null,
      { action }
    );
    console.error('❌ Invalid action dispatched:', validationError);
    return next(action);
  }

  // Validate specific action payloads
  if (action.type === 'users/createUser' && action.payload) {
    const user = action.payload;
    if (!user.email || !user.firstName || !user.lastName) {
      console.error('❌ Invalid user data in createUser action:', user);
    }
  }

  if (action.type === 'auth/loginUser' && action.payload) {
    const credentials = action.payload;
    if (!credentials.email || !credentials.password) {
      console.error('❌ Invalid credentials in loginUser action:', credentials);
    }
  }

  const result = next(action);
  
  // Validate state integrity after action
  const state = store.getState();
  
  // Check for common state issues
  if (state.auth.isAuthenticated && !state.auth.user) {
    console.warn('⚠️  State inconsistency: authenticated but no user data');
  }

  if (state.users.list && !Array.isArray(state.users.list)) {
    console.error('❌ State corruption: users.list is not an array');
  }

  return result;
};

/**
 * API rate limiting middleware
 */
export const rateLimitMiddleware = (store) => {
  const actionTimestamps = new Map();
  const RATE_LIMITS = {
    default: 1000,          // 1 second
    'auth/loginUser': 5000, // 5 seconds for login attempts
    'users/createUser': 2000, // 2 seconds for user creation
    'users/updateUser': 1000, // 1 second for user updates
  };

  return (next) => (action) => {
    // Only apply to API actions
    if (!action.type.includes('pending')) {
      return next(action);
    }

    const actionKey = action.type.replace('/pending', '');
    const now = Date.now();
    const lastCall = actionTimestamps.get(actionKey);
    const rateLimit = RATE_LIMITS[actionKey] || RATE_LIMITS.default;

    if (lastCall && (now - lastCall) < rateLimit) {
      console.warn(`⚠️  Rate limited action: ${actionKey} (${rateLimit}ms limit)`);
      
      // Return a resolved promise to prevent errors
      return Promise.resolve({ 
        type: 'RATE_LIMITED', 
        originalAction: action,
        retryAfter: rateLimit - (now - lastCall)
      });
    }

    actionTimestamps.set(actionKey, now);
    
    // Clean up old timestamps (keep only last hour)
    const oneHourAgo = now - (60 * 60 * 1000);
    for (const [key, timestamp] of actionTimestamps.entries()) {
      if (timestamp < oneHourAgo) {
        actionTimestamps.delete(key);
      }
    }

    return next(action);
  };
};

/**
 * ✅ FIXED: Combined custom middleware - removed persistenceMiddleware
 */
export const customMiddleware = [
  // Order is important - validation first, then rate limiting
  validationMiddleware,
  rateLimitMiddleware,
  
  // Core business logic middleware
  authMiddleware,
  errorMiddleware,
  notificationMiddleware,
  
  // Performance and debugging
  performanceMiddleware,
  // ✅ REMOVED: persistenceMiddleware - conflicts with store persistence
  
  // Debug only in development
  ...(process.env.NODE_ENV === 'development' ? [debugMiddleware] : [])
];

export default customMiddleware;