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

// Response interceptor to handle ApiResponseDto structure
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
          
          // Show error toast for failed API calls
          toast.error(errors[0] || errorMessage);
          
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
    
    // Handle different types of errors with immediate user feedback
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED: {
          // Unauthorized - try to refresh token first
          if (error.config.url !== AUTH_ENDPOINTS.REFRESH && !error.config._retry) {
            try {
              error.config._retry = true;
              await refreshToken();
              return apiClient.request(error.config);
            } catch (refreshError) {
              // Refresh failed, logout user
              await handleAuthFailure();
              toast.error(ERROR_MESSAGES.UNAUTHORIZED); 
              return Promise.reject(error);
            }
          } else {
            // Refresh token failed or this was already a retry
            await handleAuthFailure();
            toast.error(ERROR_MESSAGES.UNAUTHORIZED); 
          }
          break;
        }
        
        case HTTP_STATUS.FORBIDDEN: {
          toast.error(ERROR_MESSAGES.FORBIDDEN); 
          break;
        }
        
        case HTTP_STATUS.NOT_FOUND: {
          toast.error(ERROR_MESSAGES.NOT_FOUND); 
          break;
        }
        
        case HTTP_STATUS.TOO_MANY_REQUESTS: {
          toast.error(ERROR_MESSAGES.RATE_LIMIT); 
          break;
        }
        
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        case HTTP_STATUS.BAD_GATEWAY:
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
        case HTTP_STATUS.GATEWAY_TIMEOUT: {
          toast.error(ERROR_MESSAGES.SERVER_ERROR); 
          break;
        }
        
        default: {
          // Handle ApiResponseDto error format
          if (data && data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(errorMsg => toast.error(errorMsg));
          } else if (data && data.message) {
            toast.error(data.message);
          } else {
            toast.error(`Request failed with status ${status}`);
          }
        }
      }
    } else if (error.request) {
      // Network error
      toast.error(ERROR_MESSAGES.NETWORK_ERROR); 
    } else {
      // Other error
      toast.error(error.message || ERROR_MESSAGES.GENERIC); 
    }
    
    return Promise.reject(error);
  }
);

/**
 * Function to refresh token
 */
const refreshToken = async () => {
  try {
    const response = await axios.post(AUTH_ENDPOINTS.REFRESH, {}, {
      baseURL: API_CONFIG.BASE_URL,
      withCredentials: true,
      timeout: TIMEOUT_CONFIG.SHORT
    });
    
    // Update token service
    tokenService.handleTokenRefresh();
    
    return response;
  } catch (error) {
    // Clear token service on refresh failure
    tokenService.handleLogout();
    throw error;
  }
};

/**
 * Handle authentication failure
 */
const handleAuthFailure = async () => {
  // Clear token service
  tokenService.handleLogout();
  
  // Dispatch logout action if store is available
  if (store) {
    const { logout } = await import('../store/slices/authSlice');
    store.dispatch(logout());
  }
  
  // Redirect to login if not already there
  if (window.location.pathname !== '/login') {
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
      console.warn('Token refresh failed:', error);
      // Don't handle auth failure here as it will be handled by interceptor
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

/**
 * Check if request should be retried using constants
 */
export const shouldRetryRequest = (error, attemptNumber, maxRetries = RETRY_CONFIG.MAX_RETRIES) => {
  if (attemptNumber >= maxRetries) return false;
  return shouldRetry(error, attemptNumber, error.config?.method);
};

/**
 * Get retry delay using constants
 */
export const getRetryDelayTime = (attemptNumber, error) => {
  return getRetryDelay(attemptNumber, RETRY_CONFIG.INITIAL_DELAY);
};

/**
 * Create API client with custom timeout
 */
export const createApiClientWithTimeout = (timeout) => {
  return axios.create({
    ...apiClient.defaults,
    timeout: timeout || TIMEOUT_CONFIG.DEFAULT
  });
};

/**
 * ✅ ADDED: Upload-specific API client
 */
export const createUploadClient = () => {
  const uploadClient = axios.create({
    ...apiClient.defaults,
    timeout: TIMEOUT_CONFIG.UPLOAD,
    headers: {
      ...apiClient.defaults.headers,
      [REQUEST_HEADERS.CONTENT_TYPE]: 'multipart/form-data'
    }
  });
  
  // Add progress tracking
  uploadClient.interceptors.request.use((config) => {
    if (config.onUploadProgress) {
      config.onUploadProgress = (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        config.onUploadProgress({ progress, loaded: progressEvent.loaded, total: progressEvent.total });
      };
    }
    return config;
  });
  
  return uploadClient;
};

/**
 * ✅ ADDED: Download-specific API client
 */
export const createDownloadClient = () => {
  return axios.create({
    ...apiClient.defaults,
    timeout: TIMEOUT_CONFIG.DOWNLOAD,
    responseType: 'blob'
  });
};

export default apiClient;