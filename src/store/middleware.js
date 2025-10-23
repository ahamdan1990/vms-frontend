// src/store/middleware.js - PRODUCTION OPTIMIZED VERSION
import { isRejectedWithValue } from '@reduxjs/toolkit';
import { logout } from './slices/authSlice';
import { incrementErrorCount, addSlowQuery, resetPerformanceCounters } from './slices/uiSlice';
import { addNotification, showSuccessToast, showErrorToast } from './slices/notificationSlice';
import errorService from '../services/errorService';

/**
 * Authentication middleware - OPTIMIZED
 */
export const authMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Only handle specific auth actions to reduce noise
  if (action.type === 'auth/loginUser/fulfilled') {
    store.dispatch(resetPerformanceCounters());
    store.dispatch(showSuccessToast('Welcome back!', 'Logged in successfully'));
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 User authenticated successfully');
    }
  }

  if (action.type === 'auth/logoutUser/fulfilled' || action.type === 'auth/clearAuthState') {
    store.dispatch({ type: 'users/clearSelections' });
    store.dispatch({ type: 'ui/resetUIState' });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🚪 User logged out');
    }
  }

  if (action.type === 'auth/loginUser/rejected') {
    const errors = Array.isArray(action.payload) ? action.payload : [action.payload];
    const primaryError = errors[0] || 'Login failed';
    
    const processedError = errorService.createErrorObject(
      'AUTHENTICATION_ERROR',
      primaryError,
      'high'
    );
    
    store.dispatch(showErrorToast('Login Failed', processedError.message));
  }

  if (action.type === 'auth/validateToken/rejected') {
    setTimeout(() => {
      store.dispatch(logout());
    }, 100);
  }

  return result;
};

/**
 * Error handling middleware - OPTIMIZED
 */
export const errorMiddleware = (store) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const error = action.payload;
    const actionType = action.type;

    store.dispatch(incrementErrorCount());

    // Extract actual status from error payload
    const actualStatus = error?.status || error?.originalError?.status || 500;

    const processedError = errorService.processApiError({
      response: {
        data: error,
        status: actualStatus
      },
      message: error
    });

    // ✅ PRODUCTION FIX: Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`❌ API Error: ${actionType}`);
      console.error('Processed error:', processedError);
      console.groupEnd();
    }

    // Only dispatch logout if user was authenticated (to prevent infinite logout loop)
    const state = store.getState();
    const wasAuthenticated = state.auth?.isAuthenticated || false;

    if (processedError.type === 'AUTHENTICATION_ERROR' && wasAuthenticated) {
      store.dispatch(logout());
      return next(action);
    }

    // ✅ PRODUCTION FIX: Only show error notifications for important actions
    // BUT exclude getCurrentUser auth errors (401) when user is not authenticated
    const importantActions = [
      'loginUser',
      'createUser',
      'updateUser',
      'deleteUser',
      'getCurrentUser'
    ];

    const isImportantAction = importantActions.some(action => actionType.includes(action));

    // Don't show toast for getCurrentUser auth errors (happens on initial page load)
    const isGetCurrentUserAuthError = actionType.includes('getCurrentUser') &&
                                      processedError.type === 'AUTHENTICATION_ERROR';

    if (isImportantAction && !isGetCurrentUserAuthError) {
      store.dispatch(showErrorToast('Error', processedError.message));
    }
  }

  return next(action);
};

/**
 * Performance monitoring middleware - PRODUCTION OPTIMIZED
 */
export const performanceMiddleware = (store) => (next) => (action) => {
  const startTime = performance.now();
  const result = next(action);
  const endTime = performance.now();
  const duration = endTime - startTime;

  // ✅ PRODUCTION FIX: Higher thresholds and less logging
  const SLOW_ACTION_THRESHOLD = 200; // Increased from 100ms
  const LOG_THRESHOLD = 100; // Increased from 50ms

  if (duration > SLOW_ACTION_THRESHOLD && !action.type.includes('pending')) {
    store.dispatch(addSlowQuery({
      action: action.type,
      duration,
      payload: action.payload ? Object.keys(action.payload) : null,
      timestamp: Date.now()
    }));

    // ✅ PRODUCTION FIX: Only warn in development for very slow actions
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.warn(`🐌 Very slow action: ${action.type} (${duration.toFixed(2)}ms)`);
    }
  }

  return result;
};

/**
 * Notification middleware - OPTIMIZED
 */
export const notificationMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // ✅ PRODUCTION FIX: Only handle important success notifications
  if (action.type.includes('/fulfilled')) {
    const actionType = action.type;

    // User management success notifications
    if (actionType === 'users/createUser/fulfilled') {
      const userName = action.payload.fullName || action.payload.email || 'User';
      store.dispatch(showSuccessToast('User Created', `${userName} has been created successfully.`));
    }

    if (actionType === 'users/updateUser/fulfilled') {
      store.dispatch(showSuccessToast('Success', 'User updated successfully'));
    }

    if (actionType === 'users/deleteUser/fulfilled') {
      store.dispatch(showSuccessToast('Success', 'User deleted successfully'));
    }

    // Auth success notifications
    if (actionType === 'auth/changePassword/fulfilled') {
      store.dispatch(showSuccessToast('Success', 'Password changed successfully'));
    }

    if (actionType === 'auth/forgotPassword/fulfilled') {
      const message = action.payload?.message || 'Password reset instructions sent to your email';
      store.dispatch(showSuccessToast('Email Sent', message));
    }
  }

  return result;
};

/**
 * Debug middleware - PRODUCTION OPTIMIZED (Development only)
 */
export const debugMiddleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV !== 'development') {
    return next(action);
  }

  const result = next(action);

  // ✅ PRODUCTION FIX: Only log auth actions and errors, reduce noise significantly
  const isAuthAction = action.type.includes('auth/');
  const isErrorAction = action.type.includes('rejected');
  const isImportantAction = [
    'users/createUser',
    'users/updateUser', 
    'users/deleteUser'
  ].some(actionType => action.type.includes(actionType));

  // Only log important actions
  if (isAuthAction || isErrorAction || isImportantAction) {
    console.group(`🔍 Action: ${action.type} ${isErrorAction ? '❌' : ''}`);
    console.log('Payload:', action.payload);
    console.groupEnd();
  }

  // ✅ PRODUCTION FIX: Detect rapid actions with higher threshold
  const now = Date.now();
  if (debugMiddleware.lastActionTime && (now - debugMiddleware.lastActionTime) < 10) {
    // Only warn for truly problematic rapid actions
    const problematicActions = ['auth/', 'users/'];
    if (problematicActions.some(prefix => action.type.includes(prefix))) {
      console.warn('⚠️  Rapid successive actions detected:', action.type, 
        debugMiddleware.actionCount || 1);
      debugMiddleware.actionCount = (debugMiddleware.actionCount || 1) + 1;
    }
  } else {
    debugMiddleware.actionCount = 1;
  }
  debugMiddleware.lastActionTime = now;

  return result;
};

/**
 * Validation middleware - OPTIMIZED
 */
export const validationMiddleware = (store) => (next) => (action) => {
  // ✅ PRODUCTION FIX: Only validate in development
  if (process.env.NODE_ENV !== 'development') {
    return next(action);
  }

  if (!action || typeof action !== 'object' || !action.type) {
    console.error('❌ Invalid action dispatched:', action);
    return next(action);
  }

  const result = next(action);
  
  // ✅ PRODUCTION FIX: Minimal state validation, only for critical issues
  const state = store.getState();
  
  if (state.auth.isAuthenticated && !state.auth.user) {
    console.warn('⚠️  State inconsistency: authenticated but no user data');
  }

  return result;
};

/**
 * Rate limiting middleware - PRODUCTION OPTIMIZED
 */
export const rateLimitMiddleware = (store) => {
  const actionTimestamps = new Map();
  const appStartTime = Date.now();

  const RATE_LIMITS = {
    default: 200,           // Reduced for better responsiveness
    'auth/loginUser': 2000, // Reduced from 3000ms
    'users/createUser': 500,
    'users/updateUser': 300,
  };

  return (next) => (action) => {
    // Only apply to API actions (exclude UI actions completely)
    if (!action.type.includes('pending')) {
      return next(action);
    }

    const actionKey = action.type.replace('/pending', '');
    const now = Date.now();
    const lastCall = actionTimestamps.get(actionKey);
    const rateLimit = RATE_LIMITS[actionKey] || RATE_LIMITS.default;

    if (lastCall && (now - lastCall) < rateLimit) {
      // Suppress warnings during app initialization (first 5 seconds)
      const isInitializing = (now - appStartTime) < 5000;

      if (process.env.NODE_ENV === 'development' && !isInitializing) {
        console.warn(`⚠️  Rate limited action: ${actionKey}`, (now - lastCall) + 'ms ago');
      }

      return Promise.resolve({
        type: 'RATE_LIMITED',
        originalAction: action,
        retryAfter: rateLimit - (now - lastCall)
      });
    }

    actionTimestamps.set(actionKey, now);

    // ✅ PRODUCTION FIX: Cleanup old timestamps more aggressively
    const twoMinutesAgo = now - (2 * 60 * 1000); // Reduced from 5 minutes
    for (const [key, timestamp] of actionTimestamps.entries()) {
      if (timestamp < twoMinutesAgo) {
        actionTimestamps.delete(key);
      }
    }

    return next(action);
  };
};

/**
 * ✅ PRODUCTION READY: Optimized middleware stack
 */
export const customMiddleware = [
  // Essential middleware only
  validationMiddleware,
  rateLimitMiddleware,
  authMiddleware,
  errorMiddleware,
  notificationMiddleware,
  performanceMiddleware,
  
  // Debug only in development with reduced logging
  ...(process.env.NODE_ENV === 'development' ? [debugMiddleware] : [])
];

export default customMiddleware;