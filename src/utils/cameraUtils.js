/**
 * Camera utility functions
 * Helper functions for camera management operations
 */

import { CAMERA_CONSTANTS } from '../constants/cameraConstants';

/**
 * Validates camera connection string based on camera type
 * @param {string} connectionString - Connection string to validate
 * @param {string} cameraType - Type of camera
 * @returns {boolean|string} - True if valid, error message if invalid
 */
export const validateConnectionString = (connectionString, cameraType) => {
  if (!connectionString || connectionString.trim() === '') {
    return 'Connection string is required';
  }

  const trimmed = connectionString.trim();

  switch (cameraType) {
    case CAMERA_CONSTANTS.TYPES.RTSP:
      if (!CAMERA_CONSTANTS.CONNECTION_PATTERNS.RTSP.test(trimmed)) {
        return 'Invalid RTSP URL format. Expected: rtsp://host:port/path';
      }
      break;

    case CAMERA_CONSTANTS.TYPES.IP:
      if (!CAMERA_CONSTANTS.CONNECTION_PATTERNS.HTTP.test(trimmed)) {
        return 'Invalid IP camera URL format. Expected: http(s)://host:port/path';
      }
      break;

    case CAMERA_CONSTANTS.TYPES.USB:
      if (!CAMERA_CONSTANTS.CONNECTION_PATTERNS.USB_DEVICE.test(trimmed)) {
        return 'Invalid USB device path. Expected: /dev/video0, COM1, or \\\\.\\video0';
      }
      break;

    case CAMERA_CONSTANTS.TYPES.ONVIF:
      if (!CAMERA_CONSTANTS.CONNECTION_PATTERNS.HTTP.test(trimmed)) {
        return 'Invalid ONVIF URL format. Expected: http(s)://host:port/onvif/device_service';
      }
      break;

    default:
      return 'Unknown camera type';
  }

  return true;
};

/**
 * Generates test connection data for API calls
 * @param {Object} cameraData - Camera configuration data
 * @returns {Object} - Test connection parameters
 */
export const generateTestConnectionData = (cameraData) => {
  return {
    cameraType: cameraData.cameraType,
    connectionString: cameraData.connectionString,
    username: cameraData.username || null,
    password: cameraData.password || null,
    timeoutSeconds: cameraData.connectionTimeoutSeconds || 30
  };
};

/**
 * Formats camera configuration for display
 * @param {Object} config - Camera configuration object
 * @returns {Object} - Formatted configuration
 */
export const formatCameraConfiguration = (config) => {
  if (!config) return {};

  return {
    resolution: `${config.resolutionWidth || 'Unknown'} × ${config.resolutionHeight || 'Unknown'}`,
    frameRate: `${config.frameRate || 'Unknown'} FPS`,
    quality: `${config.quality || 'Unknown'}%`,
    maxConnections: config.maxConnections || 'Unknown',
    timeout: `${config.connectionTimeoutSeconds || 'Unknown'}s`,
    autoStart: config.autoStart ? 'Yes' : 'No',
    motionDetection: config.enableMotionDetection ? 'Enabled' : 'Disabled',
    recording: config.enableRecording ? 'Enabled' : 'Disabled',
    facialRecognitionThreshold: `${config.facialRecognitionThreshold || 'Unknown'}%`
  };
};

/**
 * Gets camera status color and icon
 * @param {string} status - Camera status
 * @param {boolean} isOperational - Whether camera is operational
 * @returns {Object} - Status styling information
 */
export const getCameraStatusInfo = (status, isOperational) => {
  const statusConfig = CAMERA_CONSTANTS.STATUS_OPTIONS.find(s => s.value === status);
  
  return {
    label: statusConfig?.label || status,
    color: statusConfig?.color || 'gray',
    isOperational: isOperational,
    severity: isOperational ? 'success' : 'error'
  };
};

/**
 * Calculates camera health score based on various metrics
 * @param {Object} camera - Camera data
 * @returns {number} - Health score (0-100)
 */
export const calculateHealthScore = (camera) => {
  let score = 100;

  // Deduct points for failures
  if (camera.failureCount > 0) {
    score -= Math.min(camera.failureCount * 10, 50); // Max 50 points deduction
  }

  // Deduct points for outdated health checks
  if (camera.minutesSinceLastHealthCheck) {
    const minutes = camera.minutesSinceLastHealthCheck;
    if (minutes > 30) score -= 30;
    else if (minutes > 15) score -= 20;
    else if (minutes > 5) score -= 10;
  } else {
    score -= 25; // No health check data
  }

  // Deduct points for inactive status
  if (!camera.isActive) {
    score -= 20;
  }

  // Deduct points for non-operational status
  if (!camera.isOperational) {
    score -= 25;
  }

  return Math.max(0, Math.min(100, score));
};

/**
 * Determines health status based on health score
 * @param {number} score - Health score (0-100)
 * @returns {Object} - Health status information
 */
export const getHealthStatusFromScore = (score) => {
  if (score >= 90) return CAMERA_CONSTANTS.HEALTH_STATUS.EXCELLENT;
  if (score >= 70) return CAMERA_CONSTANTS.HEALTH_STATUS.HEALTHY;
  if (score >= 50) return CAMERA_CONSTANTS.HEALTH_STATUS.GOOD;
  if (score >= 30) return CAMERA_CONSTANTS.HEALTH_STATUS.STALE;
  if (score > 0) return CAMERA_CONSTANTS.HEALTH_STATUS.OUTDATED;
  return CAMERA_CONSTANTS.HEALTH_STATUS.UNKNOWN;
};

/**
 * Formats camera connection string for safe display (masks sensitive parts)
 * @param {string} connectionString - Original connection string
 * @param {boolean} includeSensitive - Whether to include sensitive data
 * @returns {string} - Safe connection string
 */
export const formatSafeConnectionString = (connectionString, includeSensitive = false) => {
  if (!connectionString) return 'Not configured';

  if (includeSensitive) {
    return connectionString;
  }

  // Mask passwords and sensitive information in URLs
  try {
    const url = new URL(connectionString);
    if (url.password) {
      url.password = '*'.repeat(url.password.length);
    }
    if (url.username && url.password) {
      return url.toString();
    }
  } catch {
    // If not a valid URL, check for other sensitive patterns
    const maskedString = connectionString
      .replace(/password=([^&\s]+)/gi, 'password=***')
      .replace(/pwd=([^&\s]+)/gi, 'pwd=***')
      .replace(/pass=([^&\s]+)/gi, 'pass=***');
    
    return maskedString;
  }

  return connectionString;
};

/**
 * Validates camera configuration object
 * @param {Object} config - Camera configuration
 * @returns {Object} - Validation result with errors
 */
export const validateCameraConfiguration = (config) => {
  const errors = {};

  if (config.resolutionWidth && (config.resolutionWidth < 320 || config.resolutionWidth > 7680)) {
    errors.resolutionWidth = 'Width must be between 320 and 7680 pixels';
  }

  if (config.resolutionHeight && (config.resolutionHeight < 240 || config.resolutionHeight > 4320)) {
    errors.resolutionHeight = 'Height must be between 240 and 4320 pixels';
  }

  if (config.frameRate && (config.frameRate < 1 || config.frameRate > 120)) {
    errors.frameRate = 'Frame rate must be between 1 and 120 FPS';
  }

  if (config.quality && (config.quality < 1 || config.quality > 100)) {
    errors.quality = 'Quality must be between 1 and 100%';
  }

  if (config.maxConnections && (config.maxConnections < 1 || config.maxConnections > 50)) {
    errors.maxConnections = 'Max connections must be between 1 and 50';
  }

  if (config.connectionTimeoutSeconds && (config.connectionTimeoutSeconds < 5 || config.connectionTimeoutSeconds > 300)) {
    errors.connectionTimeoutSeconds = 'Timeout must be between 5 and 300 seconds';
  }

  if (config.retryIntervalSeconds && (config.retryIntervalSeconds < 5 || config.retryIntervalSeconds > 300)) {
    errors.retryIntervalSeconds = 'Retry interval must be between 5 and 300 seconds';
  }

  if (config.maxRetryAttempts && (config.maxRetryAttempts < 1 || config.maxRetryAttempts > 20)) {
    errors.maxRetryAttempts = 'Max retry attempts must be between 1 and 20';
  }

  if (config.motionSensitivity && (config.motionSensitivity < 1 || config.motionSensitivity > 100)) {
    errors.motionSensitivity = 'Motion sensitivity must be between 1 and 100%';
  }

  if (config.facialRecognitionThreshold && (config.facialRecognitionThreshold < 50 || config.facialRecognitionThreshold > 95)) {
    errors.facialRecognitionThreshold = 'Recognition threshold must be between 50 and 95%';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Generates example connection strings for different camera types
 * @param {string} cameraType - Type of camera
 * @returns {Array} - Array of example connection strings
 */
export const getConnectionStringExamples = (cameraType) => {
  switch (cameraType) {
    case CAMERA_CONSTANTS.TYPES.RTSP:
      return [
        'rtsp://192.168.1.100:554/stream1',
        'rtsp://username:password@192.168.1.100:554/cam1/stream1',
        'rtsp://camera.example.com/live.sdp'
      ];

    case CAMERA_CONSTANTS.TYPES.IP:
      return [
        'http://192.168.1.100:8080/video',
        'https://192.168.1.100:8443/mjpeg.cgi',
        'http://camera.example.com/video.mjpeg'
      ];

    case CAMERA_CONSTANTS.TYPES.USB:
      return [
        '/dev/video0',  // Linux
        'COM1',         // Windows
        '\\\\.\\video0' // Windows alternative
      ];

    case CAMERA_CONSTANTS.TYPES.ONVIF:
      return [
        'http://192.168.1.100:80/onvif/device_service',
        'http://192.168.1.100:8080/onvif/device_service',
        'https://camera.example.com/onvif/device_service'
      ];

    default:
      return [];
  }
};

/**
 * Formats camera metadata for display
 * @param {string} metadataJson - JSON string of metadata
 * @returns {Object} - Parsed and formatted metadata
 */
export const formatCameraMetadata = (metadataJson) => {
  if (!metadataJson) return null;

  try {
    return JSON.parse(metadataJson);
  } catch {
    return { raw: metadataJson };
  }
};

/**
 * Checks if camera supports streaming based on type and configuration
 * @param {Object} camera - Camera object
 * @returns {boolean} - Whether camera supports streaming
 */
export const doesCameraSupportStreaming = (camera) => {
  if (!camera) return false;

  // USB cameras typically don't support network streaming
  if (camera.cameraType === CAMERA_CONSTANTS.TYPES.USB) {
    return false;
  }

  // Must be active and operational
  if (!camera.isActive || !camera.isOperational) {
    return false;
  }

  // Must have valid connection string
  const validation = validateConnectionString(camera.connectionString, camera.cameraType);
  return validation === true;
};

export default {
  validateConnectionString,
  generateTestConnectionData,
  formatCameraConfiguration,
  getCameraStatusInfo,
  calculateHealthScore,
  getHealthStatusFromScore,
  formatSafeConnectionString,
  validateCameraConfiguration,
  getConnectionStringExamples,
  formatCameraMetadata,
  doesCameraSupportStreaming
};