/**
 * Error handling service for consistent error processing throughout the application
 * Handles API errors, validation errors, and provides user-friendly error messages
 */

import { ERROR_MESSAGES, HTTP_STATUS } from '../constants/apiConstants';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class ErrorService {
  constructor() {
    this.errorLog = [];
    this.errorHandlers = new Map();
    this.maxLogSize = 100;
    this.onErrorCallback = null;
  }

  /**
   * Set callback for error notifications (used by apiClient)
   */
  setErrorCallback(callback) {
    this.onErrorCallback = callback;
  }

  /**
   * Process API error response
   */
  processApiError(error) {
    if (!error) {
      return this.createErrorObject(ERROR_TYPES.UNKNOWN, ERROR_MESSAGES.GENERIC);
    }

    // Network error (no response)
    if (!error.response && error.request) {
      return this.createErrorObject(
        ERROR_TYPES.NETWORK,
        ERROR_MESSAGES.NETWORK_ERROR, 
        ERROR_SEVERITY.HIGH,
        error
      );
    }

    // No response at all
    if (!error.response) {
      return this.createErrorObject(
        ERROR_TYPES.UNKNOWN,
        error.message || ERROR_MESSAGES.GENERIC, 
        ERROR_SEVERITY.MEDIUM,
        error
      );
    }

    const { status, data } = error.response;

    // Handle different HTTP status codes with constants
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST: {
        return this.createErrorObject(
          ERROR_TYPES.VALIDATION,
          this.extractErrorMessage(data, ERROR_MESSAGES.VALIDATION_ERROR), 
          ERROR_SEVERITY.LOW,
          error,
          this.extractErrorDetails(data)
        );
      }

      case HTTP_STATUS.UNAUTHORIZED: {
        return this.createErrorObject(
          ERROR_TYPES.AUTH,
          ERROR_MESSAGES.UNAUTHORIZED, 
          ERROR_SEVERITY.HIGH,
          error
        );
      }

      case HTTP_STATUS.FORBIDDEN: {
        return this.createErrorObject(
          ERROR_TYPES.PERMISSION,
          ERROR_MESSAGES.FORBIDDEN, 
          ERROR_SEVERITY.MEDIUM,
          error
        );
      }

      case HTTP_STATUS.NOT_FOUND: {
        return this.createErrorObject(
          ERROR_TYPES.NOT_FOUND,
          ERROR_MESSAGES.NOT_FOUND, 
          ERROR_SEVERITY.LOW,
          error
        );
      }

      case HTTP_STATUS.TOO_MANY_REQUESTS: {
        return this.createErrorObject(
          ERROR_TYPES.RATE_LIMIT,
          ERROR_MESSAGES.RATE_LIMIT, 
          ERROR_SEVERITY.MEDIUM,
          error
        );
      }

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
      case HTTP_STATUS.GATEWAY_TIMEOUT: {
        return this.createErrorObject(
          ERROR_TYPES.SERVER,
          ERROR_MESSAGES.SERVER_ERROR, 
          ERROR_SEVERITY.HIGH,
          error
        );
      }

      default: {
        return this.createErrorObject(
          ERROR_TYPES.UNKNOWN,
          this.extractErrorMessage(data, `Request failed with status ${status}`),
          ERROR_SEVERITY.MEDIUM,
          error,
          this.extractErrorDetails(data)
        );
      }
    }
  }

  /**
   * Extract error message from API response
   */
  extractErrorMessage(data, defaultMessage) {
    if (!data) return defaultMessage;

    // Check for ApiResponseDto format
    if (data.message) {
      return data.message;
    }

    // Check for errors array
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0];
    }

    // Check for error string
    if (typeof data.error === 'string') {
      return data.error;
    }

    // Check for title (sometimes used in validation errors)
    if (data.title) {
      return data.title;
    }

    return defaultMessage;
  }

  /**
   * Extract detailed error information
   */
  extractErrorDetails(data) {
    if (!data) return null;

    const details = {};

    // Validation errors
    if (data.errors) {
      if (Array.isArray(data.errors)) {
        details.errors = data.errors;
      } else if (typeof data.errors === 'object') {
        details.validationErrors = data.errors;
      }
    }

    // Additional metadata
    if (data.traceId) {
      details.traceId = data.traceId;
    }

    if (data.instance) {
      details.instance = data.instance;
    }

    return Object.keys(details).length > 0 ? details : null;
  }

  /**
   * Create standardized error object
   */
  createErrorObject(type, message, severity = ERROR_SEVERITY.MEDIUM, originalError = null, details = null) {
    const errorObj = {
      id: this.generateErrorId(),
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      details,
      originalError: originalError ? {
        message: originalError.message,
        stack: originalError.stack,
        status: originalError.response?.status,
        statusText: originalError.response?.statusText
      } : null
    };

    this.logError(errorObj);
    
    // Call registered handlers
    this.handleError(errorObj);
    
    return errorObj;
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log error to internal store
   */
  logError(errorObj) {
    this.errorLog.unshift(errorObj);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${errorObj.type}] - ${errorObj.severity.toUpperCase()}`);
      console.error('Message:', errorObj.message);
      if (errorObj.details) {
        console.error('Details:', errorObj.details);
      }
      if (errorObj.originalError) {
        console.error('Original Error:', errorObj.originalError);
      }
      console.groupEnd();
    }

    // Notify external callback (apiClient notifications)
    if (this.onErrorCallback && typeof this.onErrorCallback === 'function') {
      try {
        this.onErrorCallback(errorObj);
      } catch (callbackError) {
        console.error('Error callback failed:', callbackError);
      }
    }
  }

  /**
   * Register error handler for specific error types
   */
  registerErrorHandler(errorType, handler) {
    if (!this.errorHandlers.has(errorType)) {
      this.errorHandlers.set(errorType, []);
    }
    this.errorHandlers.get(errorType).push(handler);
  }

  /**
   * Handle error with registered handlers
   */
  handleError(errorObj) {
    const handlers = this.errorHandlers.get(errorObj.type) || [];
    handlers.forEach(handler => {
      try {
        handler(errorObj);
      } catch (error) {
        console.error('Error handler failed:', error);
      }
    });
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error) {
    if (!error?.response) return true; // Network errors are retryable

    const retryableStatuses = [
      HTTP_STATUS.REQUEST_TIMEOUT,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.BAD_GATEWAY,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      HTTP_STATUS.GATEWAY_TIMEOUT
    ];
    return retryableStatuses.includes(error.response.status);
  }

  /**
   * Get retry delay for retryable errors
   */
  getRetryDelay(attemptNumber, error) {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds

    if (error?.response?.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
      // Rate limit - longer delay
      return Math.min(5000 * attemptNumber, maxDelay);
    }

    // Exponential backoff with jitter
    const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
    const jitter = Math.random() * 0.1 * delay;
    
    return delay + jitter;
  }

  /**
   * Format validation errors for display using constants
   */
  formatValidationErrors(errors) {
    if (!errors) return [];

    if (Array.isArray(errors)) {
      return errors;
    }

    if (typeof errors === 'object') {
      return Object.entries(errors).map(([field, messages]) => {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
        const errorMessages = Array.isArray(messages) ? messages : [messages];
        return `${fieldName}: ${errorMessages.join(', ')}`;
      });
    }

    return [errors.toString()];
  }

  /**
   * ✅ ENHANCED: Get user-friendly error message using constants
   */
  getUserFriendlyMessage(error) {
    if (!error) return ERROR_MESSAGES.GENERIC;

    const processedError = typeof error === 'string' ? 
      { message: error, type: ERROR_TYPES.UNKNOWN } : 
      this.processApiError(error);

    // Map technical errors to user-friendly messages using constants
    const friendlyMessages = {
      [ERROR_TYPES.NETWORK]: ERROR_MESSAGES.NETWORK_ERROR,
      [ERROR_TYPES.AUTH]: ERROR_MESSAGES.UNAUTHORIZED,
      [ERROR_TYPES.PERMISSION]: ERROR_MESSAGES.FORBIDDEN,
      [ERROR_TYPES.VALIDATION]: ERROR_MESSAGES.VALIDATION_ERROR,
      [ERROR_TYPES.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND,
      [ERROR_TYPES.RATE_LIMIT]: ERROR_MESSAGES.RATE_LIMIT,
      [ERROR_TYPES.SERVER]: ERROR_MESSAGES.SERVER_ERROR,
      [ERROR_TYPES.TIMEOUT]: ERROR_MESSAGES.TIMEOUT,
      [ERROR_TYPES.UNKNOWN]: ERROR_MESSAGES.GENERIC
    };

    return friendlyMessages[processedError.type] || processedError.message;
  }

  /**
   * ✅ ADDED: Get specific error messages for common scenarios
   */
  getSpecificErrorMessage(errorType, context = {}) {
    const specificMessages = {
      // Authentication errors
      LOGIN_FAILED: ERROR_MESSAGES.LOGIN_FAILED,
      ACCOUNT_LOCKED: ERROR_MESSAGES.ACCOUNT_LOCKED,
      PASSWORD_EXPIRED: ERROR_MESSAGES.PASSWORD_EXPIRED,
      INVALID_TOKEN: ERROR_MESSAGES.INVALID_TOKEN,
      
      // User management errors
      USER_NOT_FOUND: ERROR_MESSAGES.USER_NOT_FOUND,
      EMAIL_ALREADY_EXISTS: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      WEAK_PASSWORD: ERROR_MESSAGES.WEAK_PASSWORD,
      
      // File upload errors
      FILE_TOO_LARGE: ERROR_MESSAGES.FILE_TOO_LARGE,
      INVALID_FILE_TYPE: ERROR_MESSAGES.INVALID_FILE_TYPE,
      UPLOAD_FAILED: ERROR_MESSAGES.UPLOAD_FAILED,
      
      // Form validation errors
      REQUIRED_FIELD: ERROR_MESSAGES.REQUIRED_FIELD,
      INVALID_EMAIL: ERROR_MESSAGES.INVALID_EMAIL,
      INVALID_PHONE: ERROR_MESSAGES.INVALID_PHONE,
      PASSWORD_MISMATCH: ERROR_MESSAGES.PASSWORD_MISMATCH,
      INVALID_DATE: ERROR_MESSAGES.INVALID_DATE,
      INVALID_TIME: ERROR_MESSAGES.INVALID_TIME
    };

    return specificMessages[errorType] || ERROR_MESSAGES.GENERIC;
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count = 10) {
    return this.errorLog.slice(0, count);
  }

  /**
   * Get errors by type
   */
  getErrorsByType(errorType) {
    return this.errorLog.filter(error => error.type === errorType);
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Export error log for debugging
   */
  exportErrorLog() {
    return {
      errors: this.errorLog,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }
}

// Export singleton instance
const errorService = new ErrorService();

// Helper functions for easy use
export const handleApiError = (error) => {
  return errorService.processApiError(error);
};

export const getUserFriendlyMessage = (error) => {
  return errorService.getUserFriendlyMessage(error);
};

export const formatValidationErrors = (errors) => {
  return errorService.formatValidationErrors(errors);
};

export const isRetryableError = (error) => {
  return errorService.isRetryable(error);
};

export const getRetryDelay = (attemptNumber, error) => {
  return errorService.getRetryDelay(attemptNumber, error);
};

// ✅ ADDED: Export specific error message getter
export const getSpecificErrorMessage = (errorType, context) => {
  return errorService.getSpecificErrorMessage(errorType, context);
};

export default errorService;