// src/services/apiClient.js
import axios from 'axios';
import toast from 'react-hot-toast';
import errorService from './errorService';
import tokenService from './tokenService';
import { AUTH_ENDPOINTS, ADMIN_ENDPOINTS, API_CONFIG } from './apiEndpoints';
import { 
  TIMEOUT_CONFIG, 
  RETRY_CONFIG, 
  HTTP_STATUS,
  ERROR_MESSAGES,
  REQUEST_HEADERS,
  getRetryDelay,
  shouldRetry
} from '../constants/apiConstants';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: TIMEOUT_CONFIG.DEFAULT, 
  withCredentials: true, // Important: Enable cookies for JWT refresh tokens
  headers: {
    [REQUEST_HEADERS.CONTENT_TYPE]: 'application/json',
    [REQUEST_HEADERS.ACCEPT]: 'application/json',
    [REQUEST_HEADERS.X_VMS_CLIENT]: 'web-app',
    [REQUEST_HEADERS.X_VMS_VERSION]: '1.0.0'
  }
});

// Store reference - will be set by configureApiClient
let store = null;

/**
 * Configure apiClient with store to avoid circular dependency
 */
export const configureApiClient = (reduxStore) => {
  store = reduxStore;
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    // Update last activity for session management
    tokenService.updateLastActivity();
    
    // Add request ID for tracking
    config.headers[REQUEST_HEADERS.X_REQUEST_ID] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // ✅ PRODUCTION FIX: Conditional logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ ENHANCED: Response interceptor to handle ApiResponseDto structure and new formats
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
    
    // Update token service on successful requests
    tokenService.handleTokenRefresh();
    
    // ✅ PRODUCTION FIX: Conditional logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    }
    
    // ✅ ENHANCED: Handle ApiResponseDto wrapper structure with better format detection
    if (response.data && typeof response.data === 'object') {
      // Check if it's the standard ApiResponseDto format
      if (response.data.hasOwnProperty('success')) {
        // If the API call failed according to the wrapper
        if (!response.data.success) {
          const errorMessage = response.data.message || ERROR_MESSAGES.GENERIC;
          const errors = response.data.errors || [errorMessage];
          
          // Log to errorService for monitoring
          errorService.logError({
            type: 'API_RESPONSE_ERROR',
            message: errorMessage,
            details: { 
              errors, 
              url: response.config.url,
              correlationId: response.data.correlationId,
              metadata: response.data.metadata 
            },
            timestamp: new Date().toISOString()
          });
          
          // Create an error object that matches our error handling
          const error = new Error(errorMessage);
          error.response = {
            data: response.data,
            status: response.status,
            statusText: response.statusText
          };
          return Promise.reject(error);
        }
        
        // Success case - return the wrapped response for further processing
        return response;
      }
    }
    
    // Return as-is if not ApiResponseDto format
    return response;
  },
  async (error) => {
    const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
    
    // ✅ PRODUCTION FIX: Conditional error logging
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, error);
    }
    
    // Log to errorService for monitoring
    errorService.processApiError(error);
    
    // ✅ FIXED: Handle different types of errors
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED: {
          // ✅ FIXED: Unauthorized - try to refresh token first
          if (error.config.url !== AUTH_ENDPOINTS.REFRESH && !error.config._retry) {
            try {
              error.config._retry = true;
              if (process.env.NODE_ENV === 'development') {
                console.log('🔄 Attempting token refresh...');
              }
              await refreshToken();
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Token refreshed, retrying request');
              }
              return apiClient.request(error.config);
            } catch (refreshError) {
              if (process.env.NODE_ENV === 'development') {
                console.error('❌ Token refresh failed:', refreshError);
              }
              // Refresh failed, logout user
              await handleAuthFailure();
              return Promise.reject(error);
            }
          } else {
            // Refresh token failed or this was already a retry
            if (process.env.NODE_ENV === 'development') {
              console.error('❌ Auth failure - redirecting to login');
            }
            await handleAuthFailure();
          }
          break;
        }
        
        case HTTP_STATUS.FORBIDDEN: {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Access forbidden');
            // Check if this is a configuration or audit permission issue
            if (error.config?.url?.includes('/admin/configuration')) {
              console.warn('Configuration access denied - check Configuration.* permissions');
            }
            if (error.config?.url?.includes('/Audit')) {
              console.warn('Audit access denied - check Audit.* permissions');
            }
          }
          break;
        }
        
        case HTTP_STATUS.NOT_FOUND: {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Resource not found');
          }
          break;
        }
        
        case HTTP_STATUS.TOO_MANY_REQUESTS: {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Rate limit exceeded');
          }
          
          // ✅ ENHANCED: Better rate limit handling with metadata extraction
          const retryAfter = error.response.headers['retry-after'] || 
                           error.response.headers['x-ratelimit-reset'] ||
                           (error.response.data?.metadata?.retryAfter);
          
          const rateLimitInfo = {
            limit: error.response.headers['x-ratelimit-limit'],
            remaining: error.response.headers['x-ratelimit-remaining'], 
            reset: error.response.headers['x-ratelimit-reset'],
            retryAfter: retryAfter
          };
          
          // Show user-friendly rate limit message with retry info
          if (typeof window !== 'undefined' && window.toast) {
            const seconds = retryAfter ? Math.ceil(retryAfter) : 60;
            const message = `Rate limit exceeded. Please try again in ${seconds} seconds.`;
            window.toast.error(message, {
              duration: Math.min(seconds * 1000, 10000), // Cap at 10 seconds display
              id: 'rate-limit' // Prevent duplicate toasts
            });
          }
          
          // Add rate limit info to error for potential retry logic
          error.rateLimitInfo = rateLimitInfo;
          break;
        }
        
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        case HTTP_STATUS.BAD_GATEWAY:
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
        case HTTP_STATUS.GATEWAY_TIMEOUT: {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Server error');
          }
          break;
        }
        
        default: {
          if (process.env.NODE_ENV === 'development') {
            console.error(`❌ API Error: ${status}`);
          }
        }
      }
    } else if (error.request) {
      // Network error
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Network error:', error.message);
      }
    } else {
      // Other error
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Request setup error:', error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Track pending refresh to prevent race conditions - ENHANCED VERSION
let isRefreshing = false;
let failedQueue = [];
let refreshPromise = null;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;
const REFRESH_TIMEOUT = 10000; // 10 seconds

// ✅ ENHANCED: Better queue processing with timeout and cleanup
const processQueue = (error, token = null) => {
  const queue = [...failedQueue]; // Copy queue to prevent modifications during processing
  failedQueue = []; // Clear queue immediately
  
  queue.forEach(({ resolve, reject, timestamp }) => {
    // Check for stale requests (older than 30 seconds)
    if (Date.now() - timestamp > 30000) {
      reject(new Error('Request timed out during token refresh'));
      return;
    }
    
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
};

// ✅ ENHANCED: Create a proper refresh queue with better handling
const createRefreshQueue = () => {
  return new Promise((resolve, reject) => {
    failedQueue.push({ 
      resolve, 
      reject, 
      timestamp: Date.now() // Track when request was queued
    });
  });
};

/**
 * ✅ ENHANCED: Function to refresh token with improved race condition prevention
 */
export const refreshToken = async () => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return createRefreshQueue();
  }

  // Check refresh attempts limit
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    const error = new Error('Maximum refresh attempts exceeded');
    processQueue(error, null);
    refreshAttempts = 0; // Reset for next session
    throw error;
  }

  isRefreshing = true;
  refreshAttempts++;

  // Create refresh promise with timeout
  refreshPromise = new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Token refresh timeout'));
    }, REFRESH_TIMEOUT);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Refreshing token (attempt ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS})...`);
      }
      
      const response = await axios.post(AUTH_ENDPOINTS.REFRESH, {deviceFingerprint: tokenService.getDeviceFingerprint()}, {
        baseURL: API_CONFIG.BASE_URL,
        withCredentials: true,
        timeout: TIMEOUT_CONFIG.SHORT
      });
      
      clearTimeout(timeoutId);
      
      // Update token service
      tokenService.handleTokenRefresh();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Token refresh successful');
      }
      
      // Reset attempts on success
      refreshAttempts = 0;
      processQueue(null, true);
      resolve(response);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Token refresh failed (attempt ${refreshAttempts}):`, error);
      }
      
      // Clear token service on refresh failure
      tokenService.handleLogout();
      processQueue(error, null);
      reject(error);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  });

  return refreshPromise;
};

/**
 * ✅ FIXED: Handle authentication failure
 */
const handleAuthFailure = async () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚪 Handling auth failure...');
  }
  
  // Clear token service
  tokenService.handleLogout();
  
  // Dispatch logout action if store is available
  // if (store) {
  //   try {
  //     const { logout } = await import('../store/slices/authSlice');
  //     store.dispatch(logout());
  //     console.log('✅ Logout dispatched to store');
  //   } catch (error) {
  //     console.error('❌ Failed to dispatch logout:', error);
  //   }
  // }
  
  // Only redirect if not already on login page
  if (window.location.pathname !== '/login') {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚪 Redirecting to login page');
    }
    window.location.href = '/login';
  }
};

/**
 * Helper function to extract data from ApiResponseDto
 */
export const extractApiData = (response) => {
  if (response.data && response.data.hasOwnProperty('data')) {
    return response.data.data;
  }
  return response.data;
};

/**
 * Helper function to handle API errors (legacy support)
 */
export const handleApiError = (error) => {
  if (error.response?.data?.errors) {
    return error.response.data.errors;
  }
  if (error.response?.data?.message) {
    return [error.response.data.message];
  }
  return [error.message || ERROR_MESSAGES.GENERIC]; 
};

/**
 * Start automatic token refresh
 */
export const startTokenRefresh = () => {
  tokenService.startRefreshTimer(async () => {
    try {
      await refreshToken();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Automatic token refresh failed:', error);
      }
      // Auth failure will be handled by the interceptor
    }
  });
};

/**
 * Stop automatic token refresh
 */
export const stopTokenRefresh = () => {
  tokenService.stopRefreshTimer();
};

/**
 * Get authentication state
 */
export const getAuthState = () => {
  return tokenService.getAuthState();
};

/**
 * Manual logout function
 */
export const logout = async () => {
  try {
    await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
  } catch (error) {
    // Ignore logout errors
    if (process.env.NODE_ENV === 'development') {
      console.warn('Logout request failed:', error);
    }
  } finally {
    await handleAuthFailure();
  }
};

/**
 * Health check function
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get(ADMIN_ENDPOINTS.HEALTH_CHECK);
    return extractApiData(response);
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

export default apiClient;