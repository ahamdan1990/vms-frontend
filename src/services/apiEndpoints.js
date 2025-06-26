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
  ACTIVATE: (id) => `/api/Users/${id}/activate`,
  DEACTIVATE: (id) => `/api/Users/${id}/deactivate`,
  UNLOCK: (id) => `/api/Users/${id}/unlock`,
  ACTIVITY: (id) => `/api/Users/${id}/activity`,
  RESET_PASSWORD: (id) => `/api/Users/${id}/reset-password`,
  ROLES: '/api/Users/roles'
};

// Invitation endpoints (for future implementation)
export const INVITATION_ENDPOINTS = {
  BASE: '/api/Invitations',
  BY_ID: (id) => `/api/Invitations/${id}`,
  APPROVE: (id) => `/api/Invitations/${id}/approve`,
  REJECT: (id) => `/api/Invitations/${id}/reject`,
  CANCEL: (id) => `/api/Invitations/${id}/cancel`,
  RESEND: (id) => `/api/Invitations/${id}/resend`,
  BULK: '/api/Invitations/bulk',
  BULK_APPROVE: '/api/Invitations/bulk-approve',
  EXPORT: '/api/Invitations/export',
  TEMPLATES: '/api/InvitationTemplates',
  TEMPLATE_BY_ID: (id) => `/api/InvitationTemplates/${id}`,
  PENDING_APPROVALS: '/api/InvitationApprovals',
  APPROVAL_BY_ID: (id) => `/api/InvitationApprovals/${id}`,
  VISIT_PURPOSES: '/api/VisitPurposes'
};

// Visitor endpoints (for future implementation)
export const VISITOR_ENDPOINTS = {
  BASE: '/api/Visitors',
  BY_ID: (id) => `/api/Visitors/${id}`,
  SEARCH: '/api/Visitors/search',
  MERGE: '/api/Visitors/merge',
  DOCUMENTS: (id) => `/api/Visitors/${id}/documents`,
  DOCUMENT_BY_ID: (visitorId, documentId) => `/api/Visitors/${visitorId}/documents/${documentId}`,
  EXPORT: '/api/Visitors/export',
  HISTORY: (id) => `/api/Visitors/${id}/history`,
  NOTES: (id) => `/api/Visitors/${id}/notes`,
  NOTE_BY_ID: (visitorId, noteId) => `/api/Visitors/${visitorId}/notes/${noteId}`
};

// Check-in/out endpoints (for future implementation)
export const CHECKIN_ENDPOINTS = {
  CHECKIN: '/api/CheckIn',
  CHECKOUT: '/api/CheckIn/checkout',
  WALKINS: '/api/WalkIns',
  WALKIN_BY_ID: (id) => `/api/WalkIns/${id}`,
  BADGES: '/api/Badges',
  BADGE_BY_ID: (id) => `/api/Badges/${id}`,
  BADGE_PRINT: (id) => `/api/Badges/${id}/print`,
  QRCODES: '/api/QrCodes',
  QRCODE_BY_ID: (id) => `/api/QrCodes/${id}`,
  OCCUPANCY: '/api/Occupancy',
  OCCUPANCY_CURRENT: '/api/Occupancy/current',
  EMERGENCY: '/api/Emergency',
  EMERGENCY_ROSTER: '/api/Emergency/roster',
  EMERGENCY_EXPORT: '/api/Emergency/export'
};

// Facial Recognition endpoints (for future implementation)
export const FR_ENDPOINTS = {
  PROFILES: '/api/FRProfiles',
  PROFILE_BY_ID: (id) => `/api/FRProfiles/${id}`,
  PROFILE_SYNC: (id) => `/api/FRProfiles/${id}/sync`,
  WATCHLISTS: '/api/Watchlists',
  WATCHLIST_BY_ID: (id) => `/api/Watchlists/${id}`,
  WATCHLIST_ASSIGN: (watchlistId, profileId) => `/api/Watchlists/${watchlistId}/profiles/${profileId}`,
  CAMERAS: '/api/Cameras',
  CAMERA_BY_ID: (id) => `/api/Cameras/${id}`,
  ALERTS: '/api/FRAlerts',
  ALERT_BY_ID: (id) => `/api/FRAlerts/${id}`,
  ALERT_ACKNOWLEDGE: (id) => `/api/FRAlerts/${id}/acknowledge`,
  EVENTS: '/api/FREvents',
  EVENT_BY_ID: (id) => `/api/FREvents/${id}`,
  SYNC_STATUS: '/api/FRSync/status',
  SYNC_QUEUE: '/api/FRSync/queue',
  SYNC_CONFLICTS: '/api/FRSync/conflicts',
  HEALTH: '/api/FRSystem/health',
  CONFIG: '/api/FRSystem/config'
};

// Bulk import endpoints (for future implementation)
export const BULK_IMPORT_ENDPOINTS = {
  BASE: '/api/BulkImport',
  UPLOAD: '/api/BulkImport/upload',
  VALIDATE: '/api/BulkImport/validate',
  PREVIEW: '/api/BulkImport/preview',
  PROCESS: '/api/BulkImport/process',
  STATUS: (batchId) => `/api/BulkImport/${batchId}/status`,
  RESULTS: (batchId) => `/api/BulkImport/${batchId}/results`,
  TEMPLATES: '/api/BulkImport/templates',
  TEMPLATE_DOWNLOAD: (templateType) => `/api/BulkImport/templates/${templateType}`,
  HISTORY: '/api/BulkImport/history',
  BATCH_BY_ID: (batchId) => `/api/BulkImport/batches/${batchId}`
};

// Custom fields endpoints (for future implementation)
export const CUSTOM_FIELD_ENDPOINTS = {
  BASE: '/api/CustomFields',
  BY_ID: (id) => `/api/CustomFields/${id}`,
  FORM_BUILDER: '/api/FormBuilder',
  FORM_BY_ID: (id) => `/api/FormBuilder/${id}`,
  VALIDATION_RULES: '/api/ValidationRules',
  VALIDATION_RULE_BY_ID: (id) => `/api/ValidationRules/${id}`,
  CONDITIONAL_LOGIC: '/api/ConditionalLogic',
  DEPENDENCIES: '/api/FieldDependencies',
  TEMPLATES: '/api/FormTemplates',
  TEMPLATE_BY_ID: (id) => `/api/FormTemplates/${id}`,
  ANALYTICS: '/api/FormAnalytics'
};

// Reporting endpoints (for future implementation)
export const REPORT_ENDPOINTS = {
  BASE: '/api/Reports',
  BY_ID: (id) => `/api/Reports/${id}`,
  GENERATE: '/api/Reports/generate',
  EXPORT: (id) => `/api/Reports/${id}/export`,
  SCHEDULED: '/api/Reports/scheduled',
  SCHEDULE_BY_ID: (id) => `/api/Reports/scheduled/${id}`,
  TEMPLATES: '/api/Reports/templates',
  TEMPLATE_BY_ID: (id) => `/api/Reports/templates/${id}`,
  ANALYTICS: '/api/Analytics',
  DASHBOARD: '/api/Analytics/dashboard',
  METRICS: '/api/Analytics/metrics',
  KPI: '/api/Analytics/kpi',
  CHARTS: '/api/Analytics/charts',
  CHART_DATA: (chartType) => `/api/Analytics/charts/${chartType}/data`
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

// File upload endpoints
export const FILE_ENDPOINTS = {
  UPLOAD: '/api/Files/upload',
  DOWNLOAD: (fileId) => `/api/Files/${fileId}`,
  DELETE: (fileId) => `/api/Files/${fileId}`,
  PREVIEW: (fileId) => `/api/Files/${fileId}/preview`,
  METADATA: (fileId) => `/api/Files/${fileId}/metadata`
};

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  BASE: '/api/Notifications',
  BY_ID: (id) => `/api/Notifications/${id}`,
  MARK_READ: (id) => `/api/Notifications/${id}/read`,
  MARK_ALL_READ: '/api/Notifications/read-all',
  SEND: '/api/Notifications/send',
  SETTINGS: '/api/Notifications/settings',
  TEMPLATES: '/api/Notifications/templates',
  TEMPLATE_BY_ID: (id) => `/api/Notifications/templates/${id}`
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
  INVITATIONS: INVITATION_ENDPOINTS,
  VISITORS: VISITOR_ENDPOINTS,
  CHECKIN: CHECKIN_ENDPOINTS,
  FR: FR_ENDPOINTS,
  BULK_IMPORT: BULK_IMPORT_ENDPOINTS,
  CUSTOM_FIELDS: CUSTOM_FIELD_ENDPOINTS,
  REPORTS: REPORT_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
  FILES: FILE_ENDPOINTS,
  NOTIFICATIONS: NOTIFICATION_ENDPOINTS
};

export default API_ENDPOINTS;