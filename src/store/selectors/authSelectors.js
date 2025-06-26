import { createSelector } from '@reduxjs/toolkit';
import { 
  USER_PERMISSIONS, 
  INVITATION_PERMISSIONS, 
  VISITOR_PERMISSIONS,
  CHECKIN_PERMISSIONS,
  REPORT_PERMISSIONS,
  DASHBOARD_PERMISSIONS,
  SYSTEM_CONFIG_PERMISSIONS,
  AUDIT_PERMISSIONS,
  FR_SYSTEM_PERMISSIONS,
  BULK_IMPORT_PERMISSIONS,
  CUSTOM_FIELD_PERMISSIONS,
  ROLE_PERMISSIONS
} from '../../constants/permissions';

// Base selectors
export const selectAuthState = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectPermissions = (state) => state.auth.permissions;
export const selectSessions = (state) => state.auth.sessions;

// User info selectors
export const selectUserId = createSelector(
  [selectUser],
  (user) => user?.id
);

export const selectUserEmail = createSelector(
  [selectUser],
  (user) => user?.email
);

export const selectUserFullName = createSelector(
  [selectUser],
  (user) => user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
);

export const selectUserRole = createSelector(
  [selectUser],
  (user) => user?.role
);

export const selectUserStatus = createSelector(
  [selectUser],
  (user) => user?.status
);

export const selectUserDepartment = createSelector(
  [selectUser],
  (user) => user?.department
);

export const selectUserJobTitle = createSelector(
  [selectUser],
  (user) => user?.jobTitle
);

export const selectUserEmployeeId = createSelector(
  [selectUser],
  (user) => user?.employeeId
);

export const selectProfilePhotoUrl = createSelector(
  [selectUser],
  (user) => user?.profilePhotoUrl
);

export const selectUserPreferences = createSelector(
  [selectUser],
  (user) => ({
    timeZone: user?.timeZone,
    language: user?.language,
    theme: user?.theme
  })
);

// Role-based selectors
export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role) => role === 'Administrator'
);

export const selectIsStaff = createSelector(
  [selectUserRole],
  (role) => role === 'Staff'
);

export const selectIsOperator = createSelector(
  [selectUserRole],
  (role) => role === 'Operator'
);

export const selectRoleHierarchy = createSelector(
  [selectUserRole],
  (role) => {
    const hierarchy = {
      'Staff': 1,
      'Operator': 2,
      'Administrator': 3
    };
    return hierarchy[role] || 0;
  }
);

// Permission checking selectors
export const selectHasPermission = createSelector(
  [selectPermissions],
  (permissions) => (permission) => {
    return permissions?.includes(permission) || false;
  }
);

export const selectHasAnyPermission = createSelector(
  [selectPermissions],
  (permissions) => (permissionList) => {
    return permissionList.some(permission => permissions?.includes(permission)) || false;
  }
);

export const selectHasAllPermissions = createSelector(
  [selectPermissions],
  (permissions) => (permissionList) => {
    return permissionList.every(permission => permissions?.includes(permission)) || false;
  }
);

// User management permission selectors
export const selectCanManageUsers = createSelector(
  [selectPermissions],
  (permissions) => {
    return permissions?.some(p => 
      p === USER_PERMISSIONS.CREATE ||
      p === USER_PERMISSIONS.UPDATE ||
      p === USER_PERMISSIONS.DELETE ||
      p === USER_PERMISSIONS.ACTIVATE ||
      p === USER_PERMISSIONS.DEACTIVATE
    ) || false;
  }
);

export const selectCanCreateUsers = createSelector(
  [selectPermissions],
  (permissions) => permissions?.includes(USER_PERMISSIONS.CREATE) || false
);

export const selectCanUpdateUsers = createSelector(
  [selectPermissions],
  (permissions) => permissions?.includes(USER_PERMISSIONS.UPDATE) || false
);

export const selectCanDeleteUsers = createSelector(
  [selectPermissions],
  (permissions) => permissions?.includes(USER_PERMISSIONS.DELETE) || false
);

export const selectCanViewUsers = createSelector(
  [selectPermissions],
  (permissions) => permissions?.includes(USER_PERMISSIONS.READ) || false
);

// Invitation management permission selectors
export const selectCanManageInvitations = createSelector(
  [selectPermissions],
  (permissions) => {
    return permissions?.some(p => 
      p === INVITATION_PERMISSIONS.CREATE_SINGLE ||
      p === INVITATION_PERMISSIONS.CREATE_BULK ||
      p === INVITATION_PERMISSIONS.UPDATE ||
      p === INVITATION_PERMISSIONS.DELETE
    ) || false;
  }
);

export const selectCanCreateInvitations = createSelector(
  [selectPermissions],
  (permissions) => {
    return permissions?.some(p => 
      p === INVITATION_PERMISSIONS.CREATE_SINGLE ||
      p === INVITATION_PERMISSIONS.CREATE_SINGLE_OWN ||
      p === INVITATION_PERMISSIONS.CREATE_BULK
    ) || false;
  }
);

export const selectCanApproveInvitations = createSelector(
  [selectPermissions],
  (permissions) => permissions?.includes(INVITATION_PERMISSIONS.APPROVE) || false
);

// Visitor management permission selectors
export const selectCanManageVisitors = createSelector(
  [selectPermissions],
  (permissions) => {
    return permissions?.some(p => 
      p === VISITOR_PERMISSIONS.CREATE ||
      p === VISITOR_PERMISSIONS.UPDATE ||
      p === VISITOR_PERMISSIONS.DELETE
    ) || false;
  }
);

export const selectCanViewVisitors = createSelector(
  [selectPermissions],
  (permissions) => permissions?.includes(VISITOR_PERMISSIONS.READ) || false
);

export const selectCanViewTodaysVisitors = createSelector(
  [selectPermissions],
  (permissions) => permissions?.includes(VISITOR_PERMISSIONS.READ_TODAY) || false
);

// Check-in permission selectors
export const selectCanProcessCheckIn = createSelector(
  [selectPermissions],
  (permissions) => permissions?.includes(CHECKIN_PERMISSIONS.PROCESS) || false
);

export const selectCanManageWalkIns = createSelector(
  [selectPermissions],
  (permissions) => permissions?.includes(CHECKIN_PERMISSIONS.WALK_IN_REGISTER) || false
);

// Reporting permission selectors
export const selectCanViewReports = createSelector(
  [selectPermissions],
  (permissions) => {
    return permissions?.some(p => 
      p === REPORT_PERMISSIONS.VIEW ||
      p === REPORT_PERMISSIONS.GENERATE ||
      p === DASHBOARD_PERMISSIONS.VIEW_ANALYTICS
    ) || false;
  }
);

export const selectCanGenerateReports = createSelector(
  [selectPermissions],
  (permissions) => permissions?.includes(REPORT_PERMISSIONS.GENERATE) || false
);

// System administration permission selectors
export const selectCanManageSystem = createSelector(
  [selectPermissions],
  (permissions) => {
    return permissions?.some(p => 
      p === SYSTEM_CONFIG_PERMISSIONS.MANAGE || 
      p === SYSTEM_CONFIG_PERMISSIONS.UPDATE ||
      p === AUDIT_PERMISSIONS.READ
    ) || false;
  }
);

export const selectCanViewAuditLogs = createSelector(
  [selectPermissions],
  (permissions) => permissions?.includes(AUDIT_PERMISSIONS.READ) || false
);

// Authentication state selectors
export const selectPasswordChangeRequired = createSelector(
  [selectAuthState],
  (authState) => authState.passwordChangeRequired
);

export const selectTwoFactorRequired = createSelector(
  [selectAuthState],
  (authState) => authState.twoFactorRequired
);

export const selectLockoutTimeRemaining = createSelector(
  [selectAuthState],
  (authState) => authState.lockoutTimeRemaining
);

export const selectIsLocked = createSelector(
  [selectLockoutTimeRemaining],
  (lockoutTime) => Boolean(lockoutTime)
);

// Session selectors
export const selectActiveSessions = createSelector(
  [selectSessions],
  (sessions) => sessions?.filter(session => session.isActive) || []
);

export const selectCurrentSession = createSelector(
  [selectSessions],
  (sessions) => sessions?.find(session => session.isCurrent) || null
);

export const selectSessionCount = createSelector(
  [selectActiveSessions],
  (sessions) => sessions.length
);

export const selectHasMultipleSessions = createSelector(
  [selectSessionCount],
  (count) => count > 1
);

// Basic user capabilities
export const selectBasicUserCapabilities = createSelector(
  [selectUserRole, selectPermissions, selectIsAdmin, selectIsStaff, selectIsOperator],
  (role, permissions, isAdmin, isStaff, isOperator) => ({
    // Role-based capabilities
    isAdmin,
    isStaff,
    isOperator,
    
    // Basic access levels
    hasElevatedAccess: isAdmin,
    hasOperationalAccess: isOperator || isAdmin,
    hasBasicAccess: isStaff || isOperator || isAdmin
  })
);

// User management capabilities
export const selectUserManagementCapabilities = createSelector(
  [selectPermissions, selectIsAdmin],
  (permissions, isAdmin) => ({
    canManageUsers: permissions?.includes(USER_PERMISSIONS.CREATE) || isAdmin,
    canViewAllUsers: permissions?.includes(USER_PERMISSIONS.READ) || isAdmin,
    canCreateUsers: permissions?.includes(USER_PERMISSIONS.CREATE) || isAdmin,
    canUpdateUsers: permissions?.includes(USER_PERMISSIONS.UPDATE) || isAdmin,
    canDeleteUsers: permissions?.includes(USER_PERMISSIONS.DELETE) || isAdmin,
    canActivateUsers: permissions?.includes(USER_PERMISSIONS.ACTIVATE) || isAdmin,
    canDeactivateUsers: permissions?.includes(USER_PERMISSIONS.DEACTIVATE) || isAdmin,
    canUnlockUsers: permissions?.includes(USER_PERMISSIONS.UNLOCK) || isAdmin,
    canResetPasswords: permissions?.includes(USER_PERMISSIONS.RESET_PASSWORD) || isAdmin,
    canViewUserActivity: permissions?.includes(USER_PERMISSIONS.VIEW_ACTIVITY) || isAdmin
  })
);

// Invitation management capabilities
export const selectInvitationCapabilities = createSelector(
  [selectPermissions, selectIsAdmin],
  (permissions, isAdmin) => ({
    canCreateInvitations: permissions?.some(p => p.includes('Invitation.Create')) || false,
    canApproveInvitations: permissions?.includes(INVITATION_PERMISSIONS.APPROVE) || isAdmin,
    canManageAllInvitations: permissions?.includes(INVITATION_PERMISSIONS.READ_ALL) || isAdmin,
    canCreateBulkInvitations: permissions?.includes(INVITATION_PERMISSIONS.CREATE_BULK) || isAdmin,
    canExportInvitations: permissions?.includes(INVITATION_PERMISSIONS.EXPORT) || isAdmin
  })
);

// Visitor management capabilities
export const selectVisitorCapabilities = createSelector(
  [selectPermissions, selectIsAdmin, selectIsOperator],
  (permissions, isAdmin, isOperator) => ({
    canManageVisitors: permissions?.includes(VISITOR_PERMISSIONS.CREATE) || isAdmin,
    canViewAllVisitors: permissions?.includes(VISITOR_PERMISSIONS.READ) || isAdmin,
    canViewTodaysVisitors: permissions?.includes(VISITOR_PERMISSIONS.READ_TODAY) || isOperator || isAdmin,
    canSearchVisitors: permissions?.includes(VISITOR_PERMISSIONS.SEARCH) || isAdmin,
    canExportVisitors: permissions?.includes(VISITOR_PERMISSIONS.EXPORT) || isAdmin,
    canMergeVisitors: permissions?.includes(VISITOR_PERMISSIONS.MERGE) || isAdmin,
    canManageDocuments: permissions?.includes(VISITOR_PERMISSIONS.MANAGE_DOCUMENTS) || isAdmin
  })
);

// Operational capabilities
export const selectOperationalCapabilities = createSelector(
  [selectPermissions, selectIsAdmin, selectIsOperator],
  (permissions, isAdmin, isOperator) => ({
    canProcessCheckIn: permissions?.includes(CHECKIN_PERMISSIONS.PROCESS) || isOperator || isAdmin,
    canManageWalkIns: permissions?.includes(CHECKIN_PERMISSIONS.WALK_IN_REGISTER) || isOperator || isAdmin,
    canPrintBadges: permissions?.includes(CHECKIN_PERMISSIONS.BADGE_PRINT) || isOperator || isAdmin,
    canScanQRCodes: permissions?.includes(CHECKIN_PERMISSIONS.QR_CODE_SCAN) || isOperator || isAdmin,
    canManualOverride: permissions?.includes(CHECKIN_PERMISSIONS.MANUAL_OVERRIDE) || isOperator || isAdmin
  })
);

// Reporting capabilities
export const selectReportingCapabilities = createSelector(
  [selectPermissions, selectIsAdmin],
  (permissions, isAdmin) => ({
    canViewReports: permissions?.some(p => p.startsWith('Report.')) || isAdmin,
    canGenerateReports: permissions?.includes(REPORT_PERMISSIONS.GENERATE) || isAdmin,
    canScheduleReports: permissions?.includes(REPORT_PERMISSIONS.SCHEDULE) || isAdmin,
    canExportReports: permissions?.includes(REPORT_PERMISSIONS.EXPORT) || isAdmin,
    canManageReports: permissions?.includes(REPORT_PERMISSIONS.MANAGE) || isAdmin
  })
);

// System administration capabilities
export const selectSystemAdminCapabilities = createSelector(
  [selectPermissions, selectIsAdmin],
  (permissions, isAdmin) => ({
    canManageSystem: permissions?.some(p => p.startsWith('SystemConfig.')) || isAdmin,
    canViewAuditLogs: permissions?.includes(AUDIT_PERMISSIONS.READ) || isAdmin,
    canBackupSystem: permissions?.includes(SYSTEM_CONFIG_PERMISSIONS.BACKUP) || isAdmin,
    canRestoreSystem: permissions?.includes(SYSTEM_CONFIG_PERMISSIONS.RESTORE) || isAdmin,
    canManageFR: permissions?.some(p => p.startsWith('FRSystem.')) || isAdmin,
    canBulkImport: permissions?.includes(BULK_IMPORT_PERMISSIONS.PROCESS) || isAdmin,
    canManageCustomFields: permissions?.includes(CUSTOM_FIELD_PERMISSIONS.MANAGE) || isAdmin
  })
);

// Combined user capabilities selector
export const selectUserCapabilities = createSelector(
  [
    selectBasicUserCapabilities,
    selectUserManagementCapabilities,
    selectInvitationCapabilities,
    selectVisitorCapabilities,
    selectOperationalCapabilities,
    selectReportingCapabilities,
    selectSystemAdminCapabilities
  ],
  (basic, userMgmt, invitation, visitor, operational, reporting, systemAdmin) => ({
    ...basic,
    ...userMgmt,
    ...invitation,
    ...visitor,
    ...operational,
    ...reporting,
    ...systemAdmin
  })
);

// Dashboard access selectors
export const selectDashboardAccess = createSelector(
  [selectUserRole, selectPermissions],
  (role, permissions) => ({
    canViewBasicDashboard: permissions?.includes(DASHBOARD_PERMISSIONS.VIEW_BASIC) || Boolean(role),
    canViewOperationsDashboard: permissions?.includes(DASHBOARD_PERMISSIONS.VIEW_OPERATIONS) || role === 'Operator' || role === 'Administrator',
    canViewAdminDashboard: permissions?.includes(DASHBOARD_PERMISSIONS.VIEW_ADMIN) || role === 'Administrator',
    canViewAnalytics: permissions?.includes(DASHBOARD_PERMISSIONS.VIEW_ANALYTICS) || role === 'Administrator'
  })
);

// Navigation access selectors
export const selectNavigationAccess = createSelector(
  [selectUserCapabilities, selectDashboardAccess],
  (capabilities, dashboardAccess) => ({
    // Main navigation items
    showDashboard: dashboardAccess.canViewBasicDashboard,
    showInvitations: capabilities.canCreateInvitations || capabilities.canManageAllInvitations,
    showVisitors: capabilities.canManageVisitors || capabilities.canViewAllVisitors || capabilities.canViewTodaysVisitors,
    showCheckIn: capabilities.canProcessCheckIn,
    showReports: capabilities.canViewReports,
    showUsers: capabilities.canManageUsers || capabilities.canViewAllUsers,
    showSystem: capabilities.canManageSystem,
    
    // Sub-navigation items
    showUserManagement: capabilities.canManageUsers,
    showSystemConfig: capabilities.canManageSystem,
    showAuditLogs: capabilities.canViewAuditLogs,
    showAnalytics: dashboardAccess.canViewAnalytics,
    showBulkImport: capabilities.canBulkImport,
    showCustomFields: capabilities.canManageCustomFields,
    showFRManagement: capabilities.canManageFR
  })
);

// Form access selectors
export const selectFormAccess = createSelector(
  [selectUserCapabilities],
  (capabilities) => ({
    // User forms
    canCreateUserForm: capabilities.canCreateUsers,
    canEditUserForm: capabilities.canUpdateUsers,
    
    // Invitation forms
    canCreateInvitationForm: capabilities.canCreateInvitations,
    canEditInvitationForm: capabilities.canManageAllInvitations,
    canApproveInvitationForm: capabilities.canApproveInvitations,
    
    // Visitor forms
    canCreateVisitorForm: capabilities.canManageVisitors,
    canEditVisitorForm: capabilities.canManageVisitors,
    
    // System forms
    canEditSystemConfig: capabilities.canManageSystem,
    canManageCustomFieldForms: capabilities.canManageCustomFields
  })
);

// Complete user profile selector
export const selectUserProfile = createSelector(
  [selectUser, selectUserCapabilities, selectDashboardAccess, selectNavigationAccess],
  (user, capabilities, dashboardAccess, navigationAccess) => ({
    ...user,
    capabilities,
    dashboardAccess,
    navigationAccess,
    displayName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email,
    initials: user?.firstName && user?.lastName ? 
      `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : 
      user?.email?.charAt(0).toUpperCase() || '?'
  })
);