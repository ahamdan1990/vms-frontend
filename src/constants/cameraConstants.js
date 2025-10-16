// Camera Type Constants
export const CAMERA_TYPES = {
  USB: 'USB',
  RTSP: 'RTSP',
  IP: 'IP',
  ONVIF: 'ONVIF'
};

export const CAMERA_TYPE_OPTIONS = [
  { value: CAMERA_TYPES.USB, label: 'USB Camera', description: 'Directly connected USB camera device' },
  { value: CAMERA_TYPES.RTSP, label: 'RTSP Stream', description: 'Network camera with RTSP streaming protocol' },
  { value: CAMERA_TYPES.IP, label: 'IP Camera', description: 'Network IP camera with HTTP/HTTPS access' },
  { value: CAMERA_TYPES.ONVIF, label: 'ONVIF Camera', description: 'ONVIF-compliant network camera' }
];

// Camera Status Constants
export const CAMERA_STATUS = {
  INACTIVE: 'Inactive',
  ACTIVE: 'Active',
  CONNECTING: 'Connecting',
  ERROR: 'Error',
  DISCONNECTED: 'Disconnected',
  MAINTENANCE: 'Maintenance'
};

export const CAMERA_STATUS_OPTIONS = [
  { value: CAMERA_STATUS.INACTIVE, label: 'Inactive', color: 'gray' },
  { value: CAMERA_STATUS.ACTIVE, label: 'Active', color: 'green' },
  { value: CAMERA_STATUS.CONNECTING, label: 'Connecting', color: 'yellow' },
  { value: CAMERA_STATUS.ERROR, label: 'Error', color: 'red' },
  { value: CAMERA_STATUS.DISCONNECTED, label: 'Disconnected', color: 'orange' },
  { value: CAMERA_STATUS.MAINTENANCE, label: 'Maintenance', color: 'blue' }
];

// Camera Priority Levels
export const CAMERA_PRIORITIES = {
  HIGHEST: 1,
  HIGH: 2,
  NORMAL: 5,
  LOW: 8,
  LOWEST: 10
};

export const CAMERA_PRIORITY_OPTIONS = [
  { value: 1, label: 'Highest Priority (1)' },
  { value: 2, label: 'High Priority (2)' },
  { value: 3, label: 'Above Normal (3)' },
  { value: 4, label: 'Medium High (4)' },
  { value: 5, label: 'Normal Priority (5)' },
  { value: 6, label: 'Medium Low (6)' },
  { value: 7, label: 'Below Normal (7)' },
  { value: 8, label: 'Low Priority (8)' },
  { value: 9, label: 'Very Low (9)' },
  { value: 10, label: 'Lowest Priority (10)' }
];

// Default Configuration Values
export const DEFAULT_CAMERA_CONFIG = {
  resolutionWidth: 1920,
  resolutionHeight: 1080,
  frameRate: 30,
  quality: 75,
  autoStart: false,
  maxConnections: 5,
  connectionTimeoutSeconds: 30,
  retryIntervalSeconds: 60,
  maxRetryAttempts: 3,
  enableMotionDetection: false,
  motionSensitivity: 50,
  enableRecording: false,
  recordingDurationMinutes: 0,
  enableFacialRecognition: true,
  facialRecognitionThreshold: 80
};

// Resolution Options
export const RESOLUTION_OPTIONS = [
  { value: { width: 640, height: 480 }, label: '640x480 (VGA)' },
  { value: { width: 800, height: 600 }, label: '800x600 (SVGA)' },
  { value: { width: 1024, height: 768 }, label: '1024x768 (XGA)' },
  { value: { width: 1280, height: 720 }, label: '1280x720 (HD 720p)' },
  { value: { width: 1280, height: 960 }, label: '1280x960 (SXGA)' },
  { value: { width: 1920, height: 1080 }, label: '1920x1080 (Full HD 1080p)' },
  { value: { width: 2560, height: 1440 }, label: '2560x1440 (2K QHD)' },
  { value: { width: 3840, height: 2160 }, label: '3840x2160 (4K UHD)' }
];

// Frame Rate Options
export const FRAME_RATE_OPTIONS = [
  { value: 15, label: '15 FPS' },
  { value: 24, label: '24 FPS' },
  { value: 25, label: '25 FPS' },
  { value: 30, label: '30 FPS' },
  { value: 50, label: '50 FPS' },
  { value: 60, label: '60 FPS' }
];

// Quality Options
export const QUALITY_OPTIONS = [
  { value: 25, label: 'Low (25%)' },
  { value: 50, label: 'Medium (50%)' },
  { value: 75, label: 'High (75%)' },
  { value: 90, label: 'Very High (90%)' },
  { value: 100, label: 'Maximum (100%)' }
];

// View Mode Options
export const VIEW_MODES = {
  LIST: 'list',
  GRID: 'grid',
  MAP: 'map'
};

export const VIEW_MODE_OPTIONS = [
  { value: VIEW_MODES.LIST, label: 'List View', icon: 'list' },
  { value: VIEW_MODES.GRID, label: 'Grid View', icon: 'grid' },
  { value: VIEW_MODES.MAP, label: 'Map View', icon: 'map' }
];

// Search and Filter Constants
export const CAMERA_SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'cameraType', label: 'Type' },
  { value: 'status', label: 'Status' },
  { value: 'location', label: 'Location' },
  { value: 'priority', label: 'Priority' },
  { value: 'createdOn', label: 'Created Date' },
  { value: 'modifiedOn', label: 'Modified Date' },
  { value: 'lastHealthCheck', label: 'Last Health Check' },
  { value: 'failureCount', label: 'Failure Count' }
];

// Health Status Indicators
export const HEALTH_STATUS = {
  EXCELLENT: { label: 'Excellent', color: 'green', score: 90 },
  HEALTHY: { label: 'Healthy', color: 'green', score: 70 },
  GOOD: { label: 'Good', color: 'yellow', score: 50 },
  STALE: { label: 'Stale', color: 'orange', score: 30 },
  OUTDATED: { label: 'Outdated', color: 'red', score: 10 },
  UNKNOWN: { label: 'Unknown', color: 'gray', score: 0 }
};

// Validation Rules
export const CAMERA_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  CONNECTION_STRING_MIN_LENGTH: 1,
  CONNECTION_STRING_MAX_LENGTH: 500,
  USERNAME_MAX_LENGTH: 100,
  PASSWORD_MAX_LENGTH: 200,
  MIN_PRIORITY: 1,
  MAX_PRIORITY: 10,
  MIN_TIMEOUT: 5,
  MAX_TIMEOUT: 300,
  MIN_RETRY_INTERVAL: 5,
  MAX_RETRY_INTERVAL: 300,
  MIN_RETRY_ATTEMPTS: 1,
  MAX_RETRY_ATTEMPTS: 20,
  MIN_CONNECTIONS: 1,
  MAX_CONNECTIONS: 50
};

// Connection String Patterns
export const CONNECTION_PATTERNS = {
  RTSP: /^rtsp:\/\/.+/i,
  HTTP: /^https?:\/\/.+/i,
  IP_ADDRESS: /^(\d{1,3}\.){3}\d{1,3}$/,
  USB_DEVICE: /^(\/dev\/video\d+|COM\d+|\\\\.\\video\d+)$/i
};

// Default Values for Forms
export const FORM_DEFAULTS = {
  cameraType: CAMERA_TYPES.IP,
  priority: CAMERA_PRIORITIES.NORMAL,
  isActive: true,
  enableFacialRecognition: true,
  configuration: DEFAULT_CAMERA_CONFIG
};

// Polling Intervals (in milliseconds)
export const POLLING_INTERVALS = {
  HEALTH_CHECK: 30000, // 30 seconds
  STREAM_STATUS: 5000,  // 5 seconds
  STATISTICS: 60000,    // 1 minute
  CONNECTION_TEST: 2000 // 2 seconds
};

// Error Messages
export const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Failed to connect to camera',
  INVALID_RTSP_URL: 'Invalid RTSP URL format',
  INVALID_IP_URL: 'Invalid IP camera URL format',
  STREAM_START_FAILED: 'Failed to start camera stream',
  STREAM_STOP_FAILED: 'Failed to stop camera stream',
  HEALTH_CHECK_FAILED: 'Camera health check failed',
  CAPTURE_FAILED: 'Failed to capture frame',
  CONFIGURATION_INVALID: 'Camera configuration is invalid',
  NAME_REQUIRED: 'Camera name is required',
  CONNECTION_STRING_REQUIRED: 'Connection string is required',
  LOCATION_REQUIRED: 'Location must be selected'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CAMERA_CREATED: 'Camera created successfully',
  CAMERA_UPDATED: 'Camera updated successfully',
  CAMERA_DELETED: 'Camera deleted successfully',
  CONNECTION_SUCCESSFUL: 'Connection test successful',
  STREAM_STARTED: 'Camera stream started',
  STREAM_STOPPED: 'Camera stream stopped',
  HEALTH_CHECK_PASSED: 'Health check completed successfully',
  FRAME_CAPTURED: 'Frame captured successfully',
  CONFIGURATION_SAVED: 'Configuration saved successfully'
};

// Export all constants as a single object for convenience
export const CAMERA_CONSTANTS = {
  TYPES: CAMERA_TYPES,
  TYPE_OPTIONS: CAMERA_TYPE_OPTIONS,
  STATUS: CAMERA_STATUS,
  STATUS_OPTIONS: CAMERA_STATUS_OPTIONS,
  PRIORITIES: CAMERA_PRIORITIES,
  PRIORITY_OPTIONS: CAMERA_PRIORITY_OPTIONS,
  DEFAULT_CONFIG: DEFAULT_CAMERA_CONFIG,
  RESOLUTION_OPTIONS,
  FRAME_RATE_OPTIONS,
  QUALITY_OPTIONS,
  VIEW_MODES,
  VIEW_MODE_OPTIONS,
  SORT_OPTIONS: CAMERA_SORT_OPTIONS,
  HEALTH_STATUS,
  VALIDATION: CAMERA_VALIDATION,
  CONNECTION_PATTERNS,
  FORM_DEFAULTS,
  POLLING_INTERVALS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};

export default CAMERA_CONSTANTS;