/**
 * API-related constants for consistent API interaction
 * Complements the apiEndpoints.js file with additional configuration
 */

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Redirection
  MOVED_PERMANENTLY: 301,
  NOT_MODIFIED: 304,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  TEXT_PLAIN: 'text/plain',
  TEXT_HTML: 'text/html',
  XML: 'application/xml',
  PDF: 'application/pdf',
  CSV: 'text/csv',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

// Request timeout configurations
export const TIMEOUT_CONFIG = {
  DEFAULT: 30000, // 30 seconds
  SHORT: 10000,   // 10 seconds
  LONG: 60000,    // 60 seconds
  UPLOAD: 300000, // 5 minutes for file uploads
  DOWNLOAD: 180000 // 3 minutes for downloads
};

// Retry configurations
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 10000,    // 10 seconds
  BACKOFF_FACTOR: 2,   // Exponential backoff
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  RETRYABLE_METHODS: ['GET', 'PUT', 'DELETE'], // POST excluded to prevent duplicates
  JITTER_MAX: 100 // Random jitter up to 100ms
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MIN_PAGE_SIZE: 5,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_INDEX: 0,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Sorting constants
export const SORTING = {
  DEFAULT_SORT_BY: 'CreatedOn',
  DEFAULT_SORT_DESCENDING: true,
  SORTABLE_FIELDS: {
    USERS: ['FirstName', 'LastName', 'Email', 'Role', 'CreatedOn', 'LastLoginDate'],
    INVITATIONS: ['VisitorName', 'HostName', 'VisitDate', 'Status', 'CreatedOn'],
    VISITORS: ['FirstName', 'LastName', 'Company', 'LastVisit', 'VisitCount']
  }
};

// Search constants
export const SEARCH = {
  MIN_SEARCH_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 300,
  MAX_RECENT_SEARCHES: 10,
  SEARCH_FIELDS: {
    USERS: ['firstName', 'lastName', 'email', 'department', 'employeeId'],
    INVITATIONS: ['visitorName', 'visitorEmail', 'hostName', 'company'],
    VISITORS: ['firstName', 'lastName', 'email', 'company', 'phoneNumber']
  }
};

// Filter constants
export const FILTERS = {
  USER_STATUS: {
    ALL: '',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    LOCKED: 'locked'
  },
  USER_ROLES: {
    ALL: '',
    STAFF: 'Staff',
    OPERATOR: 'Operator',
    ADMINISTRATOR: 'Administrator'
  },
  INVITATION_STATUS: {
    ALL: '',
    DRAFT: 'Draft',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    EXPIRED: 'Expired',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  },
  DATE_RANGES: {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    THIS_WEEK: 'thisWeek',
    LAST_WEEK: 'lastWeek',
    THIS_MONTH: 'thisMonth',
    LAST_MONTH: 'lastMonth',
    THIS_YEAR: 'thisYear',
    CUSTOM: 'custom'
  }
};

// API Response wrapper structure (matches backend ApiResponseDto)
export const API_RESPONSE_STRUCTURE = {
  SUCCESS_FIELDS: ['success', 'data', 'message'],
  ERROR_FIELDS: ['success', 'errors', 'message', 'traceId'],
  PAGINATED_FIELDS: ['items', 'totalCount', 'pageIndex', 'pageSize', 'totalPages', 'hasNextPage', 'hasPreviousPage']
};

// File upload constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large file uploads
  MAX_CONCURRENT_UPLOADS: 3
};

// Cache constants
export const CACHE = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  SHORT_TTL: 1 * 60 * 1000,   // 1 minute
  LONG_TTL: 30 * 60 * 1000,   // 30 minutes
  CACHE_KEYS: {
    USER_PERMISSIONS: 'user_permissions',
    AVAILABLE_ROLES: 'available_roles',
    SYSTEM_CONFIG: 'system_config',
    USER_STATS: 'user_stats'
  }
};

// Error message constants
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please wait before trying again.',
  TIMEOUT: 'The request timed out. Please try again.',
  GENERIC: 'An unexpected error occurred. Please try again.',
  
  // Specific operation errors
  LOGIN_FAILED: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Your account has been locked due to multiple failed login attempts.',
  PASSWORD_EXPIRED: 'Your password has expired. Please change it.',
  INVALID_TOKEN: 'Invalid or expired token.',
  USER_NOT_FOUND: 'User not found.',
  EMAIL_ALREADY_EXISTS: 'A user with this email already exists.',
  WEAK_PASSWORD: 'Password does not meet security requirements.',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  
  // Form validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  INVALID_DATE: 'Please enter a valid date.',
  INVALID_TIME: 'Please enter a valid time.'
};

// Success message constants
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PASSWORD_RESET_SENT: 'Password reset instructions have been sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully.',
  
  // User management
  USER_CREATED: 'User created successfully.',
  USER_UPDATED: 'User updated successfully.',
  USER_DELETED: 'User deleted successfully.',
  USER_ACTIVATED: 'User activated successfully.',
  USER_DEACTIVATED: 'User deactivated successfully.',
  USER_UNLOCKED: 'User unlocked successfully.',
  
  // File operations
  FILE_UPLOADED: 'File uploaded successfully.',
  FILE_DELETED: 'File deleted successfully.',
  
  // Data operations
  DATA_EXPORTED: 'Data exported successfully.',
  DATA_IMPORTED: 'Data imported successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.'
};

// API request headers
export const REQUEST_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent',
  X_REQUESTED_WITH: 'X-Requested-With',
  X_API_VERSION: 'X-API-Version',
  X_CLIENT_VERSION: 'X-Client-Version',
  X_REQUEST_ID: 'X-Request-ID',
  X_CORRELATION_ID: 'X-Correlation-ID',
  
  // Custom headers for VMS
  X_VMS_CLIENT: 'X-VMS-Client',
  X_VMS_VERSION: 'X-VMS-Version',
  X_VMS_SESSION: 'X-VMS-Session'
};

// API versioning
export const API_VERSION = {
  CURRENT: 'v1',
  SUPPORTED: ['v1'],
  HEADER_NAME: 'X-API-Version',
  QUERY_PARAM: 'api-version'
};

// Rate limiting constants
export const RATE_LIMITS = {
  // Requests per minute
  ANONYMOUS: 60,
  AUTHENTICATED: 300,
  ADMIN: 1000,
  
  // Specific endpoint limits
  LOGIN_ATTEMPTS: 5, // per 15 minutes
  PASSWORD_RESET: 3, // per hour
  FILE_UPLOAD: 10,   // per minute
  SEARCH: 100,       // per minute
  EXPORT: 5          // per minute
};

// WebSocket/SignalR constants (for real-time features)
export const WEBSOCKET = {
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 30000,
  CONNECTION_TIMEOUT: 10000,
  
  // Hub names
  HUBS: {
    NOTIFICATIONS: 'NotificationHub',
    ALERTS: 'AlertHub',
    SYSTEM_STATUS: 'SystemStatusHub'
  },
  
  // Event names
  EVENTS: {
    NOTIFICATION_RECEIVED: 'NotificationReceived',
    ALERT_TRIGGERED: 'AlertTriggered',
    USER_STATUS_CHANGED: 'UserStatusChanged',
    SYSTEM_STATUS_CHANGED: 'SystemStatusChanged'
  }
};

// Export/Import constants
export const EXPORT_IMPORT = {
  FORMATS: {
    CSV: 'csv',
    EXCEL: 'xlsx',
    PDF: 'pdf',
    JSON: 'json'
  },
  
  MAX_EXPORT_RECORDS: 10000,
  MAX_IMPORT_RECORDS: 5000,
  
  CSV_DELIMITER: ',',
  CSV_QUOTE_CHAR: '"',
  CSV_ESCAPE_CHAR: '"',
  
  EXCEL_SHEET_NAMES: {
    USERS: 'Users',
    INVITATIONS: 'Invitations',
    VISITORS: 'Visitors',
    ERRORS: 'Import Errors'
  }
};

// Notification constants
export const NOTIFICATIONS = {
  TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
  },
  
  DELIVERY_METHODS: {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in-app'
  },
  
  PRIORITIES: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  
  DEFAULT_TIMEOUT: 4000, // 4 seconds
  PERSISTENT_TIMEOUT: 0  // No auto-dismiss
};

// Environment-specific constants
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  
  // Feature flags based on environment
  FEATURES: {
    DEBUG_MODE: process.env.NODE_ENV === 'development',
    API_LOGGING: process.env.NODE_ENV !== 'production',
    PERFORMANCE_MONITORING: true,
    ERROR_REPORTING: process.env.NODE_ENV === 'production'
  }
};

// Helper functions for API constants
export const getTimeoutForOperation = (operation) => {
  const timeoutMap = {
    upload: TIMEOUT_CONFIG.UPLOAD,
    download: TIMEOUT_CONFIG.DOWNLOAD,
    search: TIMEOUT_CONFIG.SHORT,
    default: TIMEOUT_CONFIG.DEFAULT
  };
  
  return timeoutMap[operation] || timeoutMap.default;
};

export const isRetryableStatusCode = (statusCode) => {
  return RETRY_CONFIG.RETRYABLE_STATUS_CODES.includes(statusCode);
};

export const isRetryableMethod = (method) => {
  return RETRY_CONFIG.RETRYABLE_METHODS.includes(method?.toUpperCase());
};

export const getRetryDelay = (attemptNumber, baseDelay = RETRY_CONFIG.INITIAL_DELAY) => {
  const delay = Math.min(
    baseDelay * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, attemptNumber),
    RETRY_CONFIG.MAX_DELAY
  );
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * RETRY_CONFIG.JITTER_MAX;
  return delay + jitter;
};

export const shouldRetry = (error, attemptNumber, method) => {
  if (attemptNumber >= RETRY_CONFIG.MAX_RETRIES) {
    return false;
  }
  
  if (!isRetryableMethod(method)) {
    return false;
  }
  
  if (error.response?.status) {
    return isRetryableStatusCode(error.response.status);
  }
  
  // Retry on network errors
  return !error.response;
};

export default {
  HTTP_METHODS,
  HTTP_STATUS,
  CONTENT_TYPES,
  TIMEOUT_CONFIG,
  RETRY_CONFIG,
  PAGINATION,
  SORTING,
  SEARCH,
  FILTERS,
  API_RESPONSE_STRUCTURE,
  FILE_UPLOAD,
  CACHE,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REQUEST_HEADERS,
  API_VERSION,
  RATE_LIMITS,
  WEBSOCKET,
  EXPORT_IMPORT,
  NOTIFICATIONS,
  ENVIRONMENT,
  
  // Helper functions
  getTimeoutForOperation,
  isRetryableStatusCode,
  isRetryableMethod,
  getRetryDelay,
  shouldRetry
};