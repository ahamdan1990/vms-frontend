/**
 * API endpoint constants that match the backend routes exactly
 * Centralized endpoint management for easy maintenance and updates
 */

// Base API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  VERSION: 'v1'
};

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/Auth/login',
  REFRESH: '/api/Auth/refresh',
  LOGOUT: '/api/Auth/logout',
  CHANGE_PASSWORD: '/api/Auth/change-password',
  FORGOT_PASSWORD: '/api/Auth/forgot-password',
  RESET_PASSWORD: '/api/Auth/reset-password',
  ME: '/api/Auth/me',
  PERMISSIONS: '/api/Auth/permissions',
  VALIDATE_TOKEN: '/api/Auth/validate-token',
  SESSIONS: '/api/Auth/sessions',
  TERMINATE_SESSION: (sessionId) => `/api/Auth/sessions/${sessionId}`
};

// User management endpoints
export const USER_ENDPOINTS = {
  BASE: '/api/Users',
  BY_ID: (id) => `/api/Users/${id}`,
  PROFILE: '/api/Users/profile',
  PROFILE_PREFERENCES: '/api/Users/profile/preferences',
  PROFILE_PHOTO: '/api/Users/profile/photo',
  ACTIVATE: (id) => `/api/Users/${id}/activate`,
  DEACTIVATE: (id) => `/api/Users/${id}/deactivate`,
  UNLOCK: (id) => `/api/Users/${id}/unlock`,
  ACTIVITY: (id) => `/api/Users/${id}/activity`,
  RESET_PASSWORD: (id) => `/api/Users/${id}/reset-password`,
  ROLES: '/api/Users/roles'
};

// System administration endpoints (for future implementation)
export const ADMIN_ENDPOINTS = {
  SYSTEM: '/api/System',
  SYSTEM_STATUS: '/api/System/status',
  SYSTEM_INFO: '/api/System/info',
  HEALTH_CHECK: '/api/System/health',
  CONFIG: '/api/System/config',
  MAINTENANCE: '/api/System/maintenance',
  BACKUP: '/api/System/backup',
  RESTORE: '/api/System/restore',
  LOGS: '/api/System/logs',
  PERFORMANCE: '/api/System/performance',
  MONITORING: '/api/System/monitoring',
  ALERTS: '/api/System/alerts',
  LICENSE: '/api/System/license',
  UPDATE: '/api/System/update',
  AUDIT: '/api/Audit',
  AUDIT_BY_ID: (id) => `/api/Audit/${id}`,
  AUDIT_EXPORT: '/api/Audit/export',
  SECURITY: '/api/Security',
  SECURITY_SCAN: '/api/Security/scan',
  VULNERABILITIES: '/api/Security/vulnerabilities',
  COMPLIANCE: '/api/Compliance',
  COMPLIANCE_REPORT: '/api/Compliance/report'
};

// Configuration management endpoints
export const CONFIGURATION_ENDPOINTS = {
  BASE: '/api/admin/configuration',
  BY_CATEGORY: (category) => `/api/admin/configuration/${category}`,
  BY_KEY: (category, key) => `/api/admin/configuration/${category}/${key}`,
  HISTORY: (category, key) => `/api/admin/configuration/${category}/${key}/history`,
  SEARCH: '/api/admin/configuration/search',
  VALIDATE: (category, key) => `/api/admin/configuration/${category}/${key}/validate`,
  CACHE_INVALIDATE: '/api/admin/configuration/cache/invalidate'
};

// File upload endpoints
export const FILE_ENDPOINTS = {
  UPLOAD: '/api/Files/upload',
  DOWNLOAD: (fileId) => `/api/Files/${fileId}`,
  DELETE: (fileId) => `/api/Files/${fileId}`,
  PREVIEW: (fileId) => `/api/Files/${fileId}/preview`,
  METADATA: (fileId) => `/api/Files/${fileId}/metadata`
};


// Visit Purpose endpoints
export const VISIT_PURPOSE_ENDPOINTS = {
  BASE: '/api/visit-purposes',
  BY_ID: (id) => `/api/visit-purposes/${id}`
};

// Location endpoints
export const LOCATION_ENDPOINTS = {
  BASE: '/api/locations',
  BY_ID: (id) => `/api/locations/${id}`
};

// Visitor endpoints
export const VISITOR_ENDPOINTS = {
  BASE: '/api/Visitors',
  BY_ID: (id) => `/api/Visitors/${id}`,
  SEARCH: '/api/Visitors/search',
  VIP: '/api/Visitors/vip',
  BLACKLISTED: '/api/Visitors/blacklisted',
  STATISTICS: '/api/Visitors/statistics',
  BLACKLIST: (id) => `/api/Visitors/${id}/blacklist`,
  MARK_VIP: (id) => `/api/Visitors/${id}/vip`,
  DOCUMENTS: (id) => `/api/Visitors/${id}/documents`,
  NOTES: (id) => `/api/Visitors/${id}/notes`,
  EMERGENCY_CONTACTS: (id) => `/api/Visitors/${id}/emergency-contacts`
};

// Emergency Contact endpoints (nested under visitors)
export const EMERGENCY_CONTACT_ENDPOINTS = {
  BASE: (visitorId) => `/api/visitors/${visitorId}/emergency-contacts`,
  BY_ID: (visitorId, contactId) => `/api/visitors/${visitorId}/emergency-contacts/${contactId}`
};

// Visitor Document endpoints (nested under visitors)
export const VISITOR_DOCUMENT_ENDPOINTS = {
  BASE: (visitorId) => `/api/visitors/${visitorId}/documents`,
  BY_ID: (visitorId, docId) => `/api/visitors/${visitorId}/documents/${docId}`,
  UPLOAD: (visitorId) => `/api/visitors/${visitorId}/documents/upload`,
  DOWNLOAD: (visitorId, docId) => `/api/visitors/${visitorId}/documents/${docId}/download`,
  UPLOAD_INFO: (visitorId) => `/api/visitors/${visitorId}/documents/upload-info`
};

// Visitor Note endpoints (nested under visitors)
export const VISITOR_NOTE_ENDPOINTS = {
  BASE: (visitorId) => `/api/visitors/${visitorId}/notes`,
  BY_ID: (visitorId, noteId) => `/api/visitors/${visitorId}/notes/${noteId}`
};

// Invitation endpoints
export const INVITATION_ENDPOINTS = {
  BASE: '/api/invitations',
  BY_ID: (id) => `/api/invitations/${id}`,
  APPROVE: (id) => `/api/invitations/${id}/approve`,
  REJECT: (id) => `/api/invitations/${id}/reject`,
  SUBMIT: (id) => `/api/invitations/${id}/submit`,
  CANCEL: (id) => `/api/invitations/${id}/cancel`,
  QR_CODE: (id) => `/api/invitations/${id}/qr-code`,
  QR_IMAGE: (id) => `/api/invitations/${id}/qr-code/image`, // Fixed path
  QR_DATA: (id) => `/api/invitations/${id}/qr-code/data`, // New endpoint
  QR_EMAIL: (id) => `/api/invitations/${id}/send-qr-email`, // New endpoint
  VALIDATE_QR: '/api/invitations/qr-code/validate', // Fixed path
  CHECK_IN: '/api/invitations/check-in',
  CHECK_OUT: (id) => `/api/invitations/${id}/check-out`,
  RESEND: (id) => `/api/invitations/${id}/resend`,
  TEMPLATES: '/api/invitations/templates',
  BULK_CREATE: '/api/invitations/bulk',
  EXPORT: '/api/invitations/export'
};

// Excel/XLSX endpoints
export const EXCEL_ENDPOINTS = {
  DOWNLOAD_TEMPLATE: '/api/xlsx/invitation-template',
  UPLOAD_INVITATION: '/api/xlsx/upload-invitation',
  SEND_TEMPLATE: '/api/xlsx/send-template',
  VALIDATE: '/api/xlsx/validate'
};

// Capacity endpoints
export const CAPACITY_ENDPOINTS = {
  VALIDATE: '/api/capacity/validate',
  OCCUPANCY: '/api/capacity/occupancy',
  STATISTICS: '/api/capacity/statistics',
  ALTERNATIVES: '/api/capacity/alternatives',
  OVERVIEW: '/api/capacity/overview',
  TRENDS: '/api/capacity/trends'
};

// Time Slots endpoints
export const TIME_SLOTS_ENDPOINTS = {
  BASE: '/api/time-slots',
  BY_ID: (id) => `/api/time-slots/${id}`,
  AVAILABLE: '/api/time-slots/available'
};


// Helper functions for dynamic endpoint generation
export const buildEndpoint = (template, params = {}) => {
  let endpoint = template;
  
  Object.entries(params).forEach(([key, value]) => {
    endpoint = endpoint.replace(`{${key}}`, encodeURIComponent(value));
  });
  
  return endpoint;
};

export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const getFullUrl = (endpoint, baseUrl = API_CONFIG.BASE_URL) => {
  return `${baseUrl}${endpoint}`;
};

// Common query parameters
export const COMMON_PARAMS = {
  PAGE_INDEX: 'pageIndex',
  PAGE_SIZE: 'pageSize',
  SEARCH_TERM: 'searchTerm',
  SORT_BY: 'sortBy',
  SORT_DESCENDING: 'SortDescending',
  FILTER: 'filter',
  INCLUDE: 'include',
  EXPAND: 'expand'
};

// Default pagination parameters
export const DEFAULT_PAGINATION = {
  pageIndex: 0,
  pageSize: 20
};

// Export all endpoints as a single object for easy access
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USERS: USER_ENDPOINTS,
  VISIT_PURPOSES: VISIT_PURPOSE_ENDPOINTS,
  LOCATIONS: LOCATION_ENDPOINTS,
  VISITORS: VISITOR_ENDPOINTS,
  EMERGENCY_CONTACTS: EMERGENCY_CONTACT_ENDPOINTS,
  VISITOR_DOCUMENTS: VISITOR_DOCUMENT_ENDPOINTS,
  VISITOR_NOTES: VISITOR_NOTE_ENDPOINTS,
  INVITATIONS: INVITATION_ENDPOINTS,
  EXCEL: EXCEL_ENDPOINTS,
  CAPACITY: CAPACITY_ENDPOINTS,
  TIME_SLOTS: TIME_SLOTS_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
  CONFIGURATION: CONFIGURATION_ENDPOINTS,
  FILES: FILE_ENDPOINTS,
};

export default API_ENDPOINTS;