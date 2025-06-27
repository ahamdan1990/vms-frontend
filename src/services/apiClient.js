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
    
    // Log request in development
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

// ✅ FIXED: Response interceptor to handle ApiResponseDto structure
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
    
    // Update token service on successful requests
    tokenService.handleTokenRefresh();
    
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    }
    
    // Handle ApiResponseDto wrapper structure
    if (response.data && typeof response.data === 'object') {
      // Check if it's the standard ApiResponseDto format
      if (response.data.hasOwnProperty('success') && response.data.hasOwnProperty('data')) {
        // If the API call failed according to the wrapper
        if (!response.data.success) {
          const errorMessage = response.data.message || ERROR_MESSAGES.GENERIC;
          const errors = response.data.errors || [errorMessage];
          
          // Log to errorService for monitoring
          errorService.logError({
            type: 'API_RESPONSE_ERROR',
            message: errorMessage,
            details: { errors, url: response.config.url },
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
    
    // Log error in development
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
              console.log('🔄 Attempting token refresh...');
              await refreshToken();
              console.log('✅ Token refreshed, retrying request');
              return apiClient.request(error.config);
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError);
              // Refresh failed, logout user
              await handleAuthFailure();
              return Promise.reject(error);
            }
          } else {
            // Refresh token failed or this was already a retry
            console.error('❌ Auth failure - redirecting to login');
            await handleAuthFailure();
          }
          break;
        }
        
        case HTTP_STATUS.FORBIDDEN: {
          console.warn('⚠️ Access forbidden');
          break;
        }
        
        case HTTP_STATUS.NOT_FOUND: {
          console.warn('⚠️ Resource not found');
          break;
        }
        
        case HTTP_STATUS.TOO_MANY_REQUESTS: {
          console.warn('⚠️ Rate limit exceeded');
          break;
        }
        
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        case HTTP_STATUS.BAD_GATEWAY:
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
        case HTTP_STATUS.GATEWAY_TIMEOUT: {
          console.error('❌ Server error');
          break;
        }
        
        default: {
          console.error(`❌ API Error: ${status}`);
        }
      }
    } else if (error.request) {
      // Network error
      console.error('❌ Network error:', error.message);
    } else {
      // Other error
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * ✅ FIXED: Function to refresh token
 */
const refreshToken = async () => {
  try {
    console.log('🔄 Refreshing token...');
    const response = await axios.post(AUTH_ENDPOINTS.REFRESH, {}, {
      baseURL: API_CONFIG.BASE_URL,
      withCredentials: true,
      timeout: TIMEOUT_CONFIG.SHORT
    });
    
    // Update token service
    tokenService.handleTokenRefresh();
    console.log('✅ Token refresh successful');
    
    return response;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    // Clear token service on refresh failure
    tokenService.handleLogout();
    throw error;
  }
};

/**
 * ✅ FIXED: Handle authentication failure
 */
const handleAuthFailure = async () => {
  console.log('🚪 Handling auth failure...');
  
  // Clear token service
  tokenService.handleLogout();
  
  // Dispatch logout action if store is available
  if (store) {
    try {
      const { logout } = await import('../store/slices/authSlice');
      store.dispatch(logout());
      console.log('✅ Logout dispatched to store');
    } catch (error) {
      console.error('❌ Failed to dispatch logout:', error);
    }
  }
  
  // Only redirect if not already on login page
  if (window.location.pathname !== '/login') {
    console.log('🚪 Redirecting to login page');
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
      console.warn('Automatic token refresh failed:', error);
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
    console.warn('Logout request failed:', error);
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