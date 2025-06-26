/**
 * Permission constants that match the backend permission system exactly
 * These permissions are used for role-based access control throughout the frontend
 */

// User Management Permissions
export const USER_PERMISSIONS = {
  CREATE: 'User.Create',
  READ: 'User.Read',
  UPDATE: 'User.Update',
  DELETE: 'User.Delete',
  ACTIVATE: 'User.Activate',
  DEACTIVATE: 'User.Deactivate',
  UNLOCK: 'User.Unlock',
  RESET_PASSWORD: 'User.ResetPassword',
  VIEW_ACTIVITY: 'User.ViewActivity',
  MANAGE_ROLES: 'User.ManageRoles'
};

// Invitation Management Permissions
export const INVITATION_PERMISSIONS = {
  CREATE_SINGLE: 'Invitation.Create.Single',
  CREATE_SINGLE_OWN: 'Invitation.Create.Single.Own',
  CREATE_BULK: 'Invitation.Create.Bulk',
  READ: 'Invitation.Read',
  READ_OWN: 'Invitation.Read.Own',
  READ_ALL: 'Invitation.Read.All',
  UPDATE: 'Invitation.Update',
  UPDATE_OWN: 'Invitation.Update.Own',
  UPDATE_OWN_PENDING: 'Invitation.Update.Own.Pending',
  DELETE: 'Invitation.Delete',
  CANCEL: 'Invitation.Cancel',
  CANCEL_OWN_PENDING: 'Invitation.Cancel.Own.Pending',
  APPROVE: 'Invitation.Approve',
  REJECT: 'Invitation.Reject',
  RESEND: 'Invitation.Resend',
  EXPORT: 'Invitation.Export'
};

// Visitor Management Permissions
export const VISITOR_PERMISSIONS = {
  CREATE: 'Visitor.Create',
  READ: 'Visitor.Read',
  READ_TODAY: 'Visitor.Read.Today',
  UPDATE: 'Visitor.Update',
  DELETE: 'Visitor.Delete',
  SEARCH: 'Visitor.Search',
  EXPORT: 'Visitor.Export',
  MERGE: 'Visitor.Merge',
  VIEW_HISTORY: 'Visitor.ViewHistory',
  MANAGE_DOCUMENTS: 'Visitor.ManageDocuments'
};

// Check-in/out Permissions
export const CHECKIN_PERMISSIONS = {
  PROCESS: 'CheckIn.Process',
  CHECKOUT_PROCESS: 'CheckOut.Process',
  WALK_IN_REGISTER: 'WalkIn.Register',
  WALK_IN_CREATE_FR_PROFILE: 'WalkIn.CreateFRProfile',
  WALK_IN_FR_SYNC: 'WalkIn.FRSync',
  BADGE_PRINT: 'Badge.Print',
  QR_CODE_SCAN: 'QRCode.Scan',
  MANUAL_VERIFICATION: 'Manual.Verification',
  MANUAL_OVERRIDE: 'Manual.Override',
  OVERRIDE_LOG_CREATE: 'Override.Log.Create'
};

// Alert & Notification Permissions
export const ALERT_PERMISSIONS = {
  RECEIVE_FR_EVENTS: 'Alert.Receive.FREvents',
  ACKNOWLEDGE: 'Alert.Acknowledge',
  HOST_NOTIFY: 'Host.Notify',
  NOTIFICATION_SEND_HOST: 'Notification.Send.Host',
  NOTIFICATION_READ_OWN: 'Notification.Read.Own'
};

// Emergency Permissions
export const EMERGENCY_PERMISSIONS = {
  EXPORT: 'Emergency.Export',
  ROSTER_GENERATE: 'Emergency.Roster.Generate'
};

// Bulk Import Permissions
export const BULK_IMPORT_PERMISSIONS = {
  UPLOAD: 'BulkImport.Upload',
  PROCESS: 'BulkImport.Process',
  VALIDATE: 'BulkImport.Validate',
  REVIEW: 'BulkImport.Review',
  APPROVE: 'BulkImport.Approve',
  EXPORT_TEMPLATE: 'BulkImport.ExportTemplate'
};

// Template Permissions
export const TEMPLATE_PERMISSIONS = {
  CREATE: 'Template.Create',
  READ: 'Template.Read',
  UPDATE: 'Template.Update',
  DELETE: 'Template.Delete',
  DOWNLOAD_SINGLE: 'Template.Download.Single',
  MANAGE: 'Template.Manage'
};

// Custom Field Permissions
export const CUSTOM_FIELD_PERMISSIONS = {
  CREATE: 'CustomField.Create',
  READ: 'CustomField.Read',
  UPDATE: 'CustomField.Update',
  DELETE: 'CustomField.Delete',
  MANAGE: 'CustomField.Manage'
};

// Watchlist Permissions
export const WATCHLIST_PERMISSIONS = {
  CREATE: 'Watchlist.Create',
  READ: 'Watchlist.Read',
  UPDATE: 'Watchlist.Update',
  DELETE: 'Watchlist.Delete',
  ASSIGN: 'Watchlist.Assign',
  MANAGE: 'Watchlist.Manage'
};

// Facial Recognition System Permissions
export const FR_SYSTEM_PERMISSIONS = {
  CONFIGURE: 'FRSystem.Configure',
  MANAGE: 'FRSystem.Manage',
  SYNC: 'Sync.Manage',
  SYNC_PROFILES: 'Sync.Profiles',
  SYNC_WATCHLISTS: 'Sync.Watchlists',
  OFFLINE_MANAGE: 'Offline.Manage',
  OFFLINE_QUEUE: 'Offline.Queue'
};

// Reporting Permissions
export const REPORT_PERMISSIONS = {
  VIEW: 'Report.View',
  GENERATE: 'Report.Generate',
  GENERATE_OWN: 'Report.Generate.Own',
  EXPORT: 'Report.Export',
  SCHEDULE: 'Report.Schedule',
  MANAGE: 'Report.Manage'
};

// Dashboard Permissions
export const DASHBOARD_PERMISSIONS = {
  VIEW_BASIC: 'Dashboard.View.Basic',
  VIEW_OPERATIONS: 'Dashboard.View.Operations',
  VIEW_ADMIN: 'Dashboard.View.Admin',
  VIEW_ANALYTICS: 'Dashboard.View.Analytics'
};

// Calendar Permissions
export const CALENDAR_PERMISSIONS = {
  VIEW_OWN: 'Calendar.View.Own',
  VIEW_ALL: 'Calendar.View.All',
  MANAGE: 'Calendar.Manage'
};

// System Configuration Permissions
export const SYSTEM_CONFIG_PERMISSIONS = {
  READ: 'SystemConfig.Read',
  UPDATE: 'SystemConfig.Update',
  MANAGE: 'SystemConfig.Manage',
  BACKUP: 'SystemConfig.Backup',
  RESTORE: 'SystemConfig.Restore',
  MAINTAIN: 'SystemConfig.Maintain'
};

// Audit Permissions
export const AUDIT_PERMISSIONS = {
  READ: 'Audit.Read',
  EXPORT: 'Audit.Export',
  MANAGE: 'Audit.Manage'
};

// Integration Permissions
export const INTEGRATION_PERMISSIONS = {
  CONFIGURE: 'Integration.Configure',
  MANAGE: 'Integration.Manage',
  TEST: 'Integration.Test'
};

// Profile Permissions
export const PROFILE_PERMISSIONS = {
  UPDATE_OWN: 'Profile.Update.Own'
};

// Role-based Access Permissions
export const ROLE_PERMISSIONS = {
  ADMIN_ACCESS: 'Admin.Access',
  OPERATOR_ACCESS: 'Operator.Access',
  STAFF_ACCESS: 'Staff.Access'
};

// ✅ ADDED: Role hierarchy and utilities (needed by guards)
export const ROLE_HIERARCHY = {
  'Staff': 1,
  'Operator': 2,
  'Administrator': 3
};

export const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role] || 0;
};

export const isHigherRole = (role1, role2) => {
  return getRoleLevel(role1) > getRoleLevel(role2);
};

export const isEqualOrHigherRole = (role1, role2) => {
  return getRoleLevel(role1) >= getRoleLevel(role2);
};

// All permissions grouped for easy access
export const ALL_PERMISSIONS = {
  ...USER_PERMISSIONS,
  ...INVITATION_PERMISSIONS,
  ...VISITOR_PERMISSIONS,
  ...CHECKIN_PERMISSIONS,
  ...ALERT_PERMISSIONS,
  ...EMERGENCY_PERMISSIONS,
  ...BULK_IMPORT_PERMISSIONS,
  ...TEMPLATE_PERMISSIONS,
  ...CUSTOM_FIELD_PERMISSIONS,
  ...WATCHLIST_PERMISSIONS,
  ...FR_SYSTEM_PERMISSIONS,
  ...REPORT_PERMISSIONS,
  ...DASHBOARD_PERMISSIONS,
  ...CALENDAR_PERMISSIONS,
  ...SYSTEM_CONFIG_PERMISSIONS,
  ...AUDIT_PERMISSIONS,
  ...INTEGRATION_PERMISSIONS,
  ...PROFILE_PERMISSIONS,
  ...ROLE_PERMISSIONS
};

// Permission groups for role-based access
export const STAFF_PERMISSIONS = [
  INVITATION_PERMISSIONS.CREATE_SINGLE_OWN,
  INVITATION_PERMISSIONS.READ_OWN,
  INVITATION_PERMISSIONS.UPDATE_OWN_PENDING,
  INVITATION_PERMISSIONS.CANCEL_OWN_PENDING,
  TEMPLATE_PERMISSIONS.DOWNLOAD_SINGLE,
  CALENDAR_PERMISSIONS.VIEW_OWN,
  DASHBOARD_PERMISSIONS.VIEW_BASIC,
  PROFILE_PERMISSIONS.UPDATE_OWN,
  ALERT_PERMISSIONS.NOTIFICATION_READ_OWN,
  REPORT_PERMISSIONS.GENERATE_OWN,
  ROLE_PERMISSIONS.STAFF_ACCESS
];

export const OPERATOR_PERMISSIONS = [
  ...STAFF_PERMISSIONS,
  VISITOR_PERMISSIONS.READ_TODAY,
  ALERT_PERMISSIONS.RECEIVE_FR_EVENTS,
  CHECKIN_PERMISSIONS.PROCESS,
  CHECKIN_PERMISSIONS.CHECKOUT_PROCESS,
  CHECKIN_PERMISSIONS.WALK_IN_REGISTER,
  CHECKIN_PERMISSIONS.WALK_IN_CREATE_FR_PROFILE,
  CHECKIN_PERMISSIONS.BADGE_PRINT,
  ALERT_PERMISSIONS.HOST_NOTIFY,
  EMERGENCY_PERMISSIONS.EXPORT,
  ALERT_PERMISSIONS.ACKNOWLEDGE,
  CHECKIN_PERMISSIONS.MANUAL_OVERRIDE,
  CHECKIN_PERMISSIONS.OVERRIDE_LOG_CREATE,
  DASHBOARD_PERMISSIONS.VIEW_OPERATIONS,
  ALERT_PERMISSIONS.NOTIFICATION_SEND_HOST,
  CHECKIN_PERMISSIONS.QR_CODE_SCAN,
  CHECKIN_PERMISSIONS.MANUAL_VERIFICATION,
  EMERGENCY_PERMISSIONS.ROSTER_GENERATE,
  CHECKIN_PERMISSIONS.WALK_IN_FR_SYNC,
  ROLE_PERMISSIONS.OPERATOR_ACCESS
];

export const ADMIN_PERMISSIONS = [
  ...Object.values(ALL_PERMISSIONS),
  ROLE_PERMISSIONS.ADMIN_ACCESS
];

// Permission categories for easier management
export const PERMISSION_CATEGORIES = {
  USER_MANAGEMENT: {
    name: 'User Management',
    permissions: Object.values(USER_PERMISSIONS)
  },
  INVITATION_MANAGEMENT: {
    name: 'Invitation Management',
    permissions: Object.values(INVITATION_PERMISSIONS)
  },
  VISITOR_MANAGEMENT: {
    name: 'Visitor Management',
    permissions: Object.values(VISITOR_PERMISSIONS)
  },
  CHECK_IN_OPERATIONS: {
    name: 'Check-in Operations',
    permissions: Object.values(CHECKIN_PERMISSIONS)
  },
  ALERTS_NOTIFICATIONS: {
    name: 'Alerts & Notifications',
    permissions: Object.values(ALERT_PERMISSIONS)
  },
  EMERGENCY_OPERATIONS: {
    name: 'Emergency Operations',
    permissions: Object.values(EMERGENCY_PERMISSIONS)
  },
  BULK_OPERATIONS: {
    name: 'Bulk Operations',
    permissions: Object.values(BULK_IMPORT_PERMISSIONS)
  },
  TEMPLATE_MANAGEMENT: {
    name: 'Template Management',
    permissions: Object.values(TEMPLATE_PERMISSIONS)
  },
  CUSTOM_FIELDS: {
    name: 'Custom Fields',
    permissions: Object.values(CUSTOM_FIELD_PERMISSIONS)
  },
  WATCHLIST_MANAGEMENT: {
    name: 'Watchlist Management',
    permissions: Object.values(WATCHLIST_PERMISSIONS)
  },
  FACIAL_RECOGNITION: {
    name: 'Facial Recognition',
    permissions: Object.values(FR_SYSTEM_PERMISSIONS)
  },
  REPORTING: {
    name: 'Reporting',
    permissions: Object.values(REPORT_PERMISSIONS)
  },
  DASHBOARD: {
    name: 'Dashboard',
    permissions: Object.values(DASHBOARD_PERMISSIONS)
  },
  CALENDAR: {
    name: 'Calendar',
    permissions: Object.values(CALENDAR_PERMISSIONS)
  },
  SYSTEM_ADMINISTRATION: {
    name: 'System Administration',
    permissions: Object.values(SYSTEM_CONFIG_PERMISSIONS)
  },
  AUDIT: {
    name: 'Audit',
    permissions: Object.values(AUDIT_PERMISSIONS)
  },
  INTEGRATIONS: {
    name: 'Integrations',
    permissions: Object.values(INTEGRATION_PERMISSIONS)
  },
  PROFILE: {
    name: 'Profile',
    permissions: Object.values(PROFILE_PERMISSIONS)
  }
};

// Helper functions
export const getPermissionsByRole = (role) => {
  switch (role) {
    case 'Staff':
      return STAFF_PERMISSIONS;
    case 'Operator':
      return OPERATOR_PERMISSIONS;
    case 'Administrator':
      return ADMIN_PERMISSIONS;
    default:
      return [];
  }
};

export const hasPermission = (userPermissions, permission) => {
  return userPermissions?.includes(permission) || false;
};

export const hasAnyPermission = (userPermissions, permissions) => {
  return permissions.some(permission => userPermissions?.includes(permission)) || false;
};

export const hasAllPermissions = (userPermissions, permissions) => {
  return permissions.every(permission => userPermissions?.includes(permission)) || false;
};

export const getPermissionCategory = (permission) => {
  for (const [categoryKey, category] of Object.entries(PERMISSION_CATEGORIES)) {
    if (category.permissions.includes(permission)) {
      return {
        key: categoryKey,
        ...category
      };
    }
  }
  return null;
};

export const canRoleAccessPermission = (userRole, permission) => {
  const rolePermissions = getPermissionsByRole(userRole);
  return rolePermissions.includes(permission);
};

export const getHigherRoles = (currentRole) => {
  const allRoles = ['Staff', 'Operator', 'Administrator'];
  const currentLevel = getRoleLevel(currentRole);
  
  return allRoles.filter(role => getRoleLevel(role) > currentLevel);
};

export const getLowerRoles = (currentRole) => {
  const allRoles = ['Staff', 'Operator', 'Administrator'];
  const currentLevel = getRoleLevel(currentRole);
  
  return allRoles.filter(role => getRoleLevel(role) < currentLevel);
};

export default {
  USER_PERMISSIONS,
  INVITATION_PERMISSIONS,
  VISITOR_PERMISSIONS,
  CHECKIN_PERMISSIONS,
  ALERT_PERMISSIONS,
  EMERGENCY_PERMISSIONS,
  BULK_IMPORT_PERMISSIONS,
  TEMPLATE_PERMISSIONS,
  CUSTOM_FIELD_PERMISSIONS,
  WATCHLIST_PERMISSIONS,
  FR_SYSTEM_PERMISSIONS,
  REPORT_PERMISSIONS,
  DASHBOARD_PERMISSIONS,
  CALENDAR_PERMISSIONS,
  SYSTEM_CONFIG_PERMISSIONS,
  AUDIT_PERMISSIONS,
  INTEGRATION_PERMISSIONS,
  PROFILE_PERMISSIONS,
  ROLE_PERMISSIONS,
  ALL_PERMISSIONS,
  STAFF_PERMISSIONS,
  OPERATOR_PERMISSIONS,
  ADMIN_PERMISSIONS,
  PERMISSION_CATEGORIES,
  ROLE_HIERARCHY,
  getPermissionsByRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionCategory,
  getRoleLevel,
  isHigherRole,
  isEqualOrHigherRole,
  canRoleAccessPermission,
  getHigherRoles,
  getLowerRoles
};