/**
 * Permission constants that match the backend permission system exactly
 *
 * IMPORTANT: These permission strings MUST match Domain/Constants/Permissions.cs exactly
 * Last updated: Phase 0 Cleanup - Removed unused permission categories
 */

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export const USER_PERMISSIONS = {
  CREATE: 'User.Create',
  READ: 'User.Read',
  READ_ALL: 'User.Read.All',
  UPDATE: 'User.Update',
  UPDATE_ALL: 'User.Update.All',
  DELETE: 'User.Delete',
  DELETE_ALL: 'User.Delete.All',
  ACTIVATE: 'User.Activate',
  DEACTIVATE: 'User.Deactivate',
  MANAGE_ROLES: 'User.ManageRoles',
  MANAGE_PERMISSIONS: 'User.ManagePermissions',
  VIEW_ACTIVITY: 'User.ViewActivity',
  RESET_PASSWORD: 'User.ResetPassword'
};

// ============================================================================
// INVITATION MANAGEMENT
// ============================================================================

export const INVITATION_PERMISSIONS = {
  // Own permissions (Staff)
  CREATE_OWN: 'Invitation.Create.Own',
  READ_OWN: 'Invitation.Read.Own',
  UPDATE_OWN: 'Invitation.Update.Own',
  CANCEL_OWN: 'Invitation.Cancel.Own',

  // All permissions (Administrator)
  CREATE_ALL: 'Invitation.Create.All',
  READ_ALL: 'Invitation.Read.All',
  UPDATE_ALL: 'Invitation.Update.All',
  CANCEL_ALL: 'Invitation.Cancel.All',

  // General permissions
  CREATE: 'Invitation.Create',
  READ: 'Invitation.Read',
  DELETE: 'Invitation.Delete',

  // Approval workflow
  APPROVE: 'Invitation.Approve',
  APPROVE_ALL: 'Invitation.Approve.All',
  DENY_ALL: 'Invitation.Deny.All',
  BULK_APPROVE: 'Invitation.BulkApprove',

  // Additional
  VIEW_PENDING: 'Invitation.View.Pending',
  VIEW_HISTORY: 'Invitation.ViewHistory',
  EXPORT: 'Invitation.Export'
};

// ============================================================================
// VISITOR MANAGEMENT
// ============================================================================

export const VISITOR_PERMISSIONS = {
  CREATE: 'Visitor.Create',
  READ: 'Visitor.Read',
  READ_TODAY: 'Visitor.Read.Today',
  READ_ALL: 'Visitor.Read.All',
  UPDATE: 'Visitor.Update',
  DELETE: 'Visitor.Delete',
  ARCHIVE: 'Visitor.Archive',
  VIEW_HISTORY: 'Visitor.ViewHistory',
  SEARCH: 'Visitor.Search',
  EXPORT: 'Visitor.Export',
  VIEW_PERSONAL_INFO: 'Visitor.ViewPersonalInfo',
  MANAGE_PHOTOS: 'Visitor.ManagePhotos',
  BLACKLIST: 'Visitor.Blacklist',
  REMOVE_BLACKLIST: 'Visitor.RemoveBlacklist',
  MARK_AS_VIP: 'Visitor.MarkAsVip',
  REMOVE_VIP_STATUS: 'Visitor.RemoveVipStatus',
  VIEW_STATISTICS: 'Visitor.ViewStatistics'
};

// ============================================================================
// VISITOR DOCUMENTS
// ============================================================================

export const VISITOR_DOCUMENT_PERMISSIONS = {
  CREATE: 'VisitorDocument.Create',
  READ: 'VisitorDocument.Read',
  UPDATE: 'VisitorDocument.Update',
  DELETE: 'VisitorDocument.Delete',
  DOWNLOAD: 'VisitorDocument.Download',
  UPLOAD: 'VisitorDocument.Upload',
  VIEW_SENSITIVE: 'VisitorDocument.ViewSensitive'
};

// ============================================================================
// VISITOR NOTES
// ============================================================================

export const VISITOR_NOTE_PERMISSIONS = {
  CREATE: 'VisitorNote.Create',
  READ: 'VisitorNote.Read',
  UPDATE: 'VisitorNote.Update',
  DELETE: 'VisitorNote.Delete',
  VIEW_CONFIDENTIAL: 'VisitorNote.ViewConfidential',
  VIEW_FLAGGED: 'VisitorNote.ViewFlagged'
};

// ============================================================================
// EMERGENCY CONTACTS
// ============================================================================

export const EMERGENCY_CONTACT_PERMISSIONS = {
  CREATE: 'EmergencyContact.Create',
  READ: 'EmergencyContact.Read',
  UPDATE: 'EmergencyContact.Update',
  DELETE: 'EmergencyContact.Delete',
  VIEW_PERSONAL_INFO: 'EmergencyContact.ViewPersonalInfo'
};

// ============================================================================
// CHECK-IN / CHECK-OUT
// ============================================================================

export const CHECKIN_PERMISSIONS = {
  PROCESS: 'CheckIn.Process',
  PROCESS_OUT: 'CheckOut.Process',
  OVERRIDE: 'CheckIn.Override',
  VIEW_QUEUE: 'CheckIn.ViewQueue',
  MANUAL_ENTRY: 'CheckIn.ManualEntry',
  VIEW_HISTORY: 'CheckIn.ViewHistory',
  PRINT_BADGE: 'CheckIn.PrintBadge',
  QR_SCAN: 'CheckIn.QRScan',
  PHOTO_CAPTURE: 'CheckIn.PhotoCapture',
  MANUAL_VERIFICATION: 'CheckIn.ManualVerification'
};

// ============================================================================
// WALK-IN REGISTRATION
// ============================================================================

export const WALKIN_PERMISSIONS = {
  REGISTER: 'WalkIn.Register',
  CHECK_IN: 'WalkIn.CheckIn',
  CONVERT: 'WalkIn.Convert',
  VIEW_LIST: 'WalkIn.ViewList',
  UPDATE: 'WalkIn.Update',
  DELETE: 'WalkIn.Delete',
  FR_SYNC: 'WalkIn.FRSync',
  QUICK_REGISTER: 'WalkIn.QuickRegister',
  VIEW_HISTORY: 'WalkIn.ViewHistory'
};

// ============================================================================
// BULK IMPORT
// ============================================================================

export const BULK_IMPORT_PERMISSIONS = {
  CREATE: 'BulkImport.Create',
  PROCESS: 'BulkImport.Process',
  VALIDATE: 'BulkImport.Validate',
  CANCEL: 'BulkImport.Cancel',
  VIEW_BATCHES: 'BulkImport.ViewBatches',
  VIEW_ERRORS: 'BulkImport.ViewErrors',
  CORRECT_ERRORS: 'BulkImport.CorrectErrors',
  VIEW_HISTORY: 'BulkImport.ViewHistory',
  EXPORT: 'BulkImport.Export',
  RETRY_FAILED: 'BulkImport.RetryFailed'
};

// ============================================================================
// WATCHLIST (BLACKLIST + VIP) - SIMPLIFIED
// ============================================================================

export const WATCHLIST_PERMISSIONS = {
  VIEW: 'Watchlist.View',
  MANAGE_BLACKLIST: 'Watchlist.ManageBlacklist',
  MANAGE_VIP: 'Watchlist.ManageVIP'
};

// ============================================================================
// CUSTOM FIELDS (Not yet implemented)
// ============================================================================

export const CUSTOM_FIELD_PERMISSIONS = {
  CREATE: 'CustomField.Create',
  READ_ALL: 'CustomField.Read.All',
  UPDATE: 'CustomField.Update',
  DELETE: 'CustomField.Delete',
  REORDER: 'CustomField.Reorder',
  CONFIGURE: 'CustomField.Configure',
  VIEW_USAGE: 'CustomField.ViewUsage',
  MANAGE_VALIDATION: 'CustomField.ManageValidation',
  BUILD_FORMS: 'CustomField.BuildForms'
};

// ============================================================================
// FACIAL RECOGNITION SYSTEM
// ============================================================================

export const FR_SYSTEM_PERMISSIONS = {
  CONFIGURE: 'FRSystem.Configure',
  SYNC: 'FRSystem.Sync',
  MONITOR: 'FRSystem.Monitor',
  VIEW_HEALTH: 'FRSystem.ViewHealth',
  MANAGE_PROFILES: 'FRSystem.ManageProfiles',
  PROCESS_EVENTS: 'FRSystem.ProcessEvents',
  VIEW_SYNC_QUEUE: 'FRSystem.ViewSyncQueue',
  RECONCILE: 'FRSystem.Reconcile',
  VIEW_LOGS: 'FRSystem.ViewLogs',
  CONFIGURE_WEBHOOKS: 'FRSystem.ConfigureWebhooks'
};

// ============================================================================
// VISIT PURPOSE MANAGEMENT
// ============================================================================

export const VISIT_PURPOSE_PERMISSIONS = {
  READ: 'VisitPurpose.Read',
  READ_ALL: 'VisitPurpose.Read.All',
  CREATE: 'VisitPurpose.Create',
  UPDATE: 'VisitPurpose.Update',
  DELETE: 'VisitPurpose.Delete'
};

// ============================================================================
// LOCATION MANAGEMENT
// ============================================================================

export const LOCATION_PERMISSIONS = {
  READ: 'Location.Read',
  READ_ALL: 'Location.Read.All',
  CREATE: 'Location.Create',
  UPDATE: 'Location.Update',
  DELETE: 'Location.Delete'
};

// ============================================================================
// SYSTEM CONFIGURATION - SIMPLIFIED
// ============================================================================

export const SYSTEM_CONFIG_PERMISSIONS = {
  READ: 'SystemConfig.Read',
  UPDATE: 'SystemConfig.Update'
};

// ============================================================================
// REPORTS - SIMPLIFIED
// ============================================================================

export const REPORT_PERMISSIONS = {
  GENERATE_OWN: 'Report.Generate.Own',
  GENERATE_ALL: 'Report.Generate.All',
  EXPORT: 'Report.Export',
  VIEW_HISTORY: 'Report.ViewHistory'
};

// ============================================================================
// AUDIT
// ============================================================================

export const AUDIT_PERMISSIONS = {
  READ_ALL: 'Audit.Read.All',
  EXPORT: 'Audit.Export',
  VIEW_USER_ACTIVITY: 'Audit.ViewUserActivity',
  VIEW_SYSTEM_EVENTS: 'Audit.ViewSystemEvents',
  VIEW_SECURITY_EVENTS: 'Audit.ViewSecurityEvents',
  SEARCH: 'Audit.Search',
  REVIEW: 'Audit.Review',
  ARCHIVE: 'Audit.Archive',
  PURGE: 'Audit.Purge'
};

// ============================================================================
// TEMPLATES (Not yet implemented)
// ============================================================================

export const TEMPLATE_PERMISSIONS = {
  DOWNLOAD_SINGLE: 'Template.Download.Single',
  DOWNLOAD_BULK: 'Template.Download.Bulk',
  CREATE: 'Template.Create',
  UPDATE: 'Template.Update',
  DELETE: 'Template.Delete',
  VIEW_ALL: 'Template.ViewAll',
  SHARE: 'Template.Share',
  CUSTOMIZE: 'Template.Customize',
  MANAGE_BADGE: 'Template.ManageBadge'
};

// ============================================================================
// DASHBOARD - SIMPLIFIED
// ============================================================================

export const DASHBOARD_PERMISSIONS = {
  VIEW_BASIC: 'Dashboard.View.Basic',
  VIEW_OPERATIONS: 'Dashboard.View.Operations',
  VIEW_ADMIN: 'Dashboard.View.Admin'
};

// ============================================================================
// PROFILE
// ============================================================================

export const PROFILE_PERMISSIONS = {
  UPDATE_OWN: 'Profile.Update.Own',
  UPDATE_ALL: 'Profile.Update.All',
  VIEW_OWN: 'Profile.View.Own',
  VIEW_ALL: 'Profile.View.All',
  CHANGE_PASSWORD: 'Profile.ChangePassword',
  MANAGE_PREFERENCES: 'Profile.ManagePreferences',
  UPLOAD_PHOTO: 'Profile.UploadPhoto',
  VIEW_ACTIVITY: 'Profile.ViewActivity'
};

// ============================================================================
// NOTIFICATIONS & ALERTS - CONSOLIDATED
// ============================================================================

export const NOTIFICATION_PERMISSIONS = {
  READ_OWN: 'Notification.Read.Own',
  READ_ALL: 'Notification.Read.All',
  SEND_SYSTEM: 'Notification.Send.System',
  SEND_BULK: 'Notification.SendBulk',
  RECEIVE: 'Notification.Receive',
  ACKNOWLEDGE: 'Notification.Acknowledge'
};

// ============================================================================
// CALENDAR
// ============================================================================

export const CALENDAR_PERMISSIONS = {
  VIEW_OWN: 'Calendar.View.Own',
  VIEW_ALL: 'Calendar.View.All',
  MANAGE: 'Calendar.Manage',
  EXPORT: 'Calendar.Export',
  VIEW_AVAILABILITY: 'Calendar.ViewAvailability',
  BOOK_SLOTS: 'Calendar.BookSlots',
  VIEW_CONFLICTS: 'Calendar.ViewConflicts'
};

// ============================================================================
// EMERGENCY OPERATIONS
// ============================================================================

export const EMERGENCY_PERMISSIONS = {
  EXPORT: 'Emergency.Export',
  GENERATE_ROSTER: 'Emergency.GenerateRoster',
  VIEW_ROSTER: 'Emergency.ViewRoster',
  PRINT_ROSTER: 'Emergency.PrintRoster',
  LOCKDOWN: 'Emergency.Lockdown',
  EVACUATE: 'Emergency.Evacuate',
  VIEW_EVACUATION_LIST: 'Emergency.ViewEvacuationList'
};

// ============================================================================
// BADGE - SIMPLIFIED
// ============================================================================

export const BADGE_PERMISSIONS = {
  PRINT: 'Badge.Print',
  REPRINT_LOST: 'Badge.ReprintLost'
};

// ============================================================================
// QR CODE
// ============================================================================

export const QR_CODE_PERMISSIONS = {
  SCAN: 'QRCode.Scan',
  GENERATE: 'QRCode.Generate',
  VALIDATE: 'QRCode.Validate',
  VIEW_HISTORY: 'QRCode.ViewHistory',
  CONFIGURE: 'QRCode.Configure'
};

// ============================================================================
// ROLE MANAGEMENT
// ============================================================================

export const ROLE_MANAGEMENT_PERMISSIONS = {
  CREATE: 'Role.Create',
  READ: 'Role.Read',
  READ_ALL: 'Role.ReadAll',
  UPDATE: 'Role.Update',
  DELETE: 'Role.Delete',
  MANAGE_PERMISSIONS: 'Role.ManagePermissions',
  VIEW_USERS: 'Role.ViewUsers'
};

// ============================================================================
// PERMISSION MANAGEMENT
// ============================================================================

export const PERMISSION_MANAGEMENT_PERMISSIONS = {
  READ: 'Permission.Read',
  READ_ALL: 'Permission.ReadAll',
  GRANT: 'Permission.Grant',
  REVOKE: 'Permission.Revoke'
};

// ============================================================================
// ROLE HIERARCHY (Updated - Operator removed, Receptionist added)
// ============================================================================

export const ROLE_HIERARCHY = {
  'Staff': 1,
  'Receptionist': 2,
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

// ============================================================================
// PERMISSION GROUPS BY ROLE (Phase 1 - To be updated with correct mappings)
// ============================================================================

export const STAFF_PERMISSIONS = [
  // Profile
  PROFILE_PERMISSIONS.VIEW_OWN,
  PROFILE_PERMISSIONS.UPDATE_OWN,
  PROFILE_PERMISSIONS.CHANGE_PASSWORD,

  // Invitations (Own only)
  INVITATION_PERMISSIONS.CREATE_OWN,
  INVITATION_PERMISSIONS.READ_OWN,
  INVITATION_PERMISSIONS.UPDATE_OWN,
  INVITATION_PERMISSIONS.CANCEL_OWN,

  // Visitors (Own only)
  VISITOR_PERMISSIONS.CREATE,
  VISITOR_PERMISSIONS.READ,

  // Dashboard
  DASHBOARD_PERMISSIONS.VIEW_BASIC,

  // Reports
  REPORT_PERMISSIONS.GENERATE_OWN,
  REPORT_PERMISSIONS.VIEW_HISTORY,

  // Calendar
  CALENDAR_PERMISSIONS.VIEW_OWN,
  CALENDAR_PERMISSIONS.VIEW_AVAILABILITY,

  // Notifications
  NOTIFICATION_PERMISSIONS.READ_OWN,
  NOTIFICATION_PERMISSIONS.RECEIVE,
  NOTIFICATION_PERMISSIONS.ACKNOWLEDGE,

  // QR Code
  QR_CODE_PERMISSIONS.GENERATE
];

export const RECEPTIONIST_PERMISSIONS = [
  // Profile
  PROFILE_PERMISSIONS.VIEW_OWN,
  PROFILE_PERMISSIONS.UPDATE_OWN,
  PROFILE_PERMISSIONS.CHANGE_PASSWORD,

  // Check-in/out
  ...Object.values(CHECKIN_PERMISSIONS),

  // Walk-in
  ...Object.values(WALKIN_PERMISSIONS),

  // Badge
  ...Object.values(BADGE_PERMISSIONS),

  // Invitations (Read-only, including pending)
  INVITATION_PERMISSIONS.READ_ALL,
  INVITATION_PERMISSIONS.VIEW_PENDING,
  INVITATION_PERMISSIONS.VIEW_HISTORY,

  // Visitors (Read all)
  VISITOR_PERMISSIONS.READ_ALL,
  VISITOR_PERMISSIONS.READ_TODAY,
  VISITOR_PERMISSIONS.VIEW_HISTORY,
  VISITOR_PERMISSIONS.CREATE, // For walk-ins

  // QR Code
  QR_CODE_PERMISSIONS.SCAN,
  QR_CODE_PERMISSIONS.VALIDATE,
  QR_CODE_PERMISSIONS.VIEW_HISTORY,

  // Notifications
  NOTIFICATION_PERMISSIONS.READ_OWN,
  NOTIFICATION_PERMISSIONS.READ_ALL,
  NOTIFICATION_PERMISSIONS.RECEIVE,
  NOTIFICATION_PERMISSIONS.ACKNOWLEDGE,

  // Dashboard
  DASHBOARD_PERMISSIONS.VIEW_BASIC,
  DASHBOARD_PERMISSIONS.VIEW_OPERATIONS,

  // Reports
  REPORT_PERMISSIONS.GENERATE_ALL,
  REPORT_PERMISSIONS.EXPORT,
  REPORT_PERMISSIONS.VIEW_HISTORY,

  // Calendar
  CALENDAR_PERMISSIONS.VIEW_ALL,
  CALENDAR_PERMISSIONS.VIEW_AVAILABILITY,

  // Emergency
  EMERGENCY_PERMISSIONS.EXPORT,
  EMERGENCY_PERMISSIONS.VIEW_ROSTER,
  EMERGENCY_PERMISSIONS.PRINT_ROSTER
];

export const ADMIN_PERMISSIONS = [
  // Administrator has ALL permissions - assigned dynamically from backend
];

// ============================================================================
// ALL PERMISSIONS (for reference)
// ============================================================================

export const ALL_PERMISSIONS = {
  ...USER_PERMISSIONS,
  ...INVITATION_PERMISSIONS,
  ...VISITOR_PERMISSIONS,
  ...VISITOR_DOCUMENT_PERMISSIONS,
  ...VISITOR_NOTE_PERMISSIONS,
  ...EMERGENCY_CONTACT_PERMISSIONS,
  ...CHECKIN_PERMISSIONS,
  ...WALKIN_PERMISSIONS,
  ...BULK_IMPORT_PERMISSIONS,
  ...WATCHLIST_PERMISSIONS,
  ...CUSTOM_FIELD_PERMISSIONS,
  ...FR_SYSTEM_PERMISSIONS,
  ...VISIT_PURPOSE_PERMISSIONS,
  ...LOCATION_PERMISSIONS,
  ...SYSTEM_CONFIG_PERMISSIONS,
  ...REPORT_PERMISSIONS,
  ...AUDIT_PERMISSIONS,
  ...TEMPLATE_PERMISSIONS,
  ...DASHBOARD_PERMISSIONS,
  ...PROFILE_PERMISSIONS,
  ...NOTIFICATION_PERMISSIONS,
  ...CALENDAR_PERMISSIONS,
  ...EMERGENCY_PERMISSIONS,
  ...BADGE_PERMISSIONS,
  ...QR_CODE_PERMISSIONS,
  ...ROLE_MANAGEMENT_PERMISSIONS,
  ...PERMISSION_MANAGEMENT_PERMISSIONS
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getPermissionsByRole = (role) => {
  switch (role) {
    case 'Staff':
      return STAFF_PERMISSIONS;
    case 'Receptionist':
      return RECEPTIONIST_PERMISSIONS;
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

export const getHigherRoles = (currentRole) => {
  const allRoles = ['Staff', 'Receptionist', 'Administrator'];
  const currentLevel = getRoleLevel(currentRole);

  return allRoles.filter(role => getRoleLevel(role) > currentLevel);
};

export const getLowerRoles = (currentRole) => {
  const allRoles = ['Staff', 'Receptionist', 'Administrator'];
  const currentLevel = getRoleLevel(currentRole);

  return allRoles.filter(role => getRoleLevel(role) < currentLevel);
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  USER_PERMISSIONS,
  INVITATION_PERMISSIONS,
  VISITOR_PERMISSIONS,
  VISITOR_DOCUMENT_PERMISSIONS,
  VISITOR_NOTE_PERMISSIONS,
  EMERGENCY_CONTACT_PERMISSIONS,
  CHECKIN_PERMISSIONS,
  WALKIN_PERMISSIONS,
  BULK_IMPORT_PERMISSIONS,
  WATCHLIST_PERMISSIONS,
  CUSTOM_FIELD_PERMISSIONS,
  FR_SYSTEM_PERMISSIONS,
  VISIT_PURPOSE_PERMISSIONS,
  LOCATION_PERMISSIONS,
  SYSTEM_CONFIG_PERMISSIONS,
  REPORT_PERMISSIONS,
  AUDIT_PERMISSIONS,
  TEMPLATE_PERMISSIONS,
  DASHBOARD_PERMISSIONS,
  PROFILE_PERMISSIONS,
  NOTIFICATION_PERMISSIONS,
  CALENDAR_PERMISSIONS,
  EMERGENCY_PERMISSIONS,
  BADGE_PERMISSIONS,
  QR_CODE_PERMISSIONS,
  ROLE_MANAGEMENT_PERMISSIONS,
  PERMISSION_MANAGEMENT_PERMISSIONS,
  ALL_PERMISSIONS,
  STAFF_PERMISSIONS,
  RECEPTIONIST_PERMISSIONS,
  ADMIN_PERMISSIONS,
  ROLE_HIERARCHY,
  getPermissionsByRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRoleLevel,
  isHigherRole,
  isEqualOrHigherRole,
  getHigherRoles,
  getLowerRoles
};
