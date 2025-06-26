import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { 
  selectPermissions, 
  selectUserRole,
  selectUserCapabilities,
  selectDashboardAccess,
  selectNavigationAccess,
  selectFormAccess
} from '../store/selectors/authSelectors';
import { 
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
  PROFILE_PERMISSIONS
} from '../constants/permissions';

/**
 * Custom hook for permission checking and role-based access control
 * Provides a comprehensive interface for checking permissions throughout the app
 */
export const usePermissions = () => {
  const permissions = useSelector(selectPermissions);
  const userRole = useSelector(selectUserRole);
  const capabilities = useSelector(selectUserCapabilities);
  const dashboardAccess = useSelector(selectDashboardAccess);
  const navigationAccess = useSelector(selectNavigationAccess);
  const formAccess = useSelector(selectFormAccess);

  // Core permission checking functions
  const hasPermission = useMemo(() => {
    return (permission) => {
      if (!permissions || !permission) return false;
      return permissions.includes(permission);
    };
  }, [permissions]);

  const hasAnyPermission = useMemo(() => {
    return (permissionList) => {
      if (!permissions || !Array.isArray(permissionList)) return false;
      return permissionList.some(permission => permissions.includes(permission));
    };
  }, [permissions]);

  const hasAllPermissions = useMemo(() => {
    return (permissionList) => {
      if (!permissions || !Array.isArray(permissionList)) return false;
      return permissionList.every(permission => permissions.includes(permission));
    };
  }, [permissions]);

  // Role checking functions
  const isRole = useMemo(() => {
    return (role) => userRole === role;
  }, [userRole]);

  const isAnyRole = useMemo(() => {
    return (roleList) => {
      if (!Array.isArray(roleList)) return false;
      return roleList.includes(userRole);
    };
  }, [userRole]);

  // Specific role checks
  const isAdmin = useMemo(() => userRole === 'Administrator', [userRole]);
  const isStaff = useMemo(() => userRole === 'Staff', [userRole]);
  const isOperator = useMemo(() => userRole === 'Operator', [userRole]);

  // User Management Permissions
  const userPermissions = useMemo(() => ({
    canCreate: hasPermission(USER_PERMISSIONS.CREATE),
    canRead: hasPermission(USER_PERMISSIONS.READ),
    canUpdate: hasPermission(USER_PERMISSIONS.UPDATE),
    canDelete: hasPermission(USER_PERMISSIONS.DELETE),
    canActivate: hasPermission(USER_PERMISSIONS.ACTIVATE),
    canDeactivate: hasPermission(USER_PERMISSIONS.DEACTIVATE),
    canUnlock: hasPermission(USER_PERMISSIONS.UNLOCK),
    canResetPassword: hasPermission(USER_PERMISSIONS.RESET_PASSWORD),
    canViewActivity: hasPermission(USER_PERMISSIONS.VIEW_ACTIVITY),
    canManageRoles: hasPermission(USER_PERMISSIONS.MANAGE_ROLES),
    canManage: hasAnyPermission([
      USER_PERMISSIONS.CREATE,
      USER_PERMISSIONS.UPDATE,
      USER_PERMISSIONS.DELETE
    ])
  }), [hasPermission, hasAnyPermission]);

  // Invitation Management Permissions
  const invitationPermissions = useMemo(() => ({
    canCreateSingle: hasPermission(INVITATION_PERMISSIONS.CREATE_SINGLE),
    canCreateSingleOwn: hasPermission(INVITATION_PERMISSIONS.CREATE_SINGLE_OWN),
    canCreateBulk: hasPermission(INVITATION_PERMISSIONS.CREATE_BULK),
    canCreate: hasAnyPermission([
      INVITATION_PERMISSIONS.CREATE_SINGLE,
      INVITATION_PERMISSIONS.CREATE_SINGLE_OWN,
      INVITATION_PERMISSIONS.CREATE_BULK
    ]),
    canRead: hasPermission(INVITATION_PERMISSIONS.READ),
    canReadOwn: hasPermission(INVITATION_PERMISSIONS.READ_OWN),
    canReadAll: hasPermission(INVITATION_PERMISSIONS.READ_ALL),
    canUpdate: hasPermission(INVITATION_PERMISSIONS.UPDATE),
    canUpdateOwn: hasPermission(INVITATION_PERMISSIONS.UPDATE_OWN),
    canUpdateOwnPending: hasPermission(INVITATION_PERMISSIONS.UPDATE_OWN_PENDING),
    canDelete: hasPermission(INVITATION_PERMISSIONS.DELETE),
    canCancel: hasPermission(INVITATION_PERMISSIONS.CANCEL),
    canCancelOwnPending: hasPermission(INVITATION_PERMISSIONS.CANCEL_OWN_PENDING),
    canApprove: hasPermission(INVITATION_PERMISSIONS.APPROVE),
    canReject: hasPermission(INVITATION_PERMISSIONS.REJECT),
    canResend: hasPermission(INVITATION_PERMISSIONS.RESEND),
    canExport: hasPermission(INVITATION_PERMISSIONS.EXPORT),
    canManage: hasAnyPermission([
      INVITATION_PERMISSIONS.CREATE_SINGLE,
      INVITATION_PERMISSIONS.UPDATE,
      INVITATION_PERMISSIONS.DELETE,
      INVITATION_PERMISSIONS.APPROVE
    ])
  }), [hasPermission, hasAnyPermission]);

  // Visitor Management Permissions
  const visitorPermissions = useMemo(() => ({
    canCreate: hasPermission(VISITOR_PERMISSIONS.CREATE),
    canRead: hasPermission(VISITOR_PERMISSIONS.READ),
    canReadToday: hasPermission(VISITOR_PERMISSIONS.READ_TODAY),
    canUpdate: hasPermission(VISITOR_PERMISSIONS.UPDATE),
    canDelete: hasPermission(VISITOR_PERMISSIONS.DELETE),
    canSearch: hasPermission(VISITOR_PERMISSIONS.SEARCH),
    canExport: hasPermission(VISITOR_PERMISSIONS.EXPORT),
    canMerge: hasPermission(VISITOR_PERMISSIONS.MERGE),
    canViewHistory: hasPermission(VISITOR_PERMISSIONS.VIEW_HISTORY),
    canManageDocuments: hasPermission(VISITOR_PERMISSIONS.MANAGE_DOCUMENTS),
    canManage: hasAnyPermission([
      VISITOR_PERMISSIONS.CREATE,
      VISITOR_PERMISSIONS.UPDATE,
      VISITOR_PERMISSIONS.DELETE
    ])
  }), [hasPermission, hasAnyPermission]);

  // Check-in/out Permissions
  const checkinPermissions = useMemo(() => ({
    canProcess: hasPermission(CHECKIN_PERMISSIONS.PROCESS),
    canCheckout: hasPermission(CHECKIN_PERMISSIONS.CHECKOUT_PROCESS),
    canWalkInRegister: hasPermission(CHECKIN_PERMISSIONS.WALK_IN_REGISTER),
    canWalkInCreateFR: hasPermission(CHECKIN_PERMISSIONS.WALK_IN_CREATE_FR_PROFILE),
    canWalkInFRSync: hasPermission(CHECKIN_PERMISSIONS.WALK_IN_FR_SYNC),
    canPrintBadge: hasPermission(CHECKIN_PERMISSIONS.BADGE_PRINT),
    canScanQR: hasPermission(CHECKIN_PERMISSIONS.QR_CODE_SCAN),
    canManualVerify: hasPermission(CHECKIN_PERMISSIONS.MANUAL_VERIFICATION),
    canManualOverride: hasPermission(CHECKIN_PERMISSIONS.MANUAL_OVERRIDE),
    canLogOverride: hasPermission(CHECKIN_PERMISSIONS.OVERRIDE_LOG_CREATE),
    canManage: hasAnyPermission([
      CHECKIN_PERMISSIONS.PROCESS,
      CHECKIN_PERMISSIONS.WALK_IN_REGISTER,
      CHECKIN_PERMISSIONS.MANUAL_OVERRIDE
    ])
  }), [hasPermission, hasAnyPermission]);

  // Alert Permissions
  const alertPermissions = useMemo(() => ({
    canReceiveFREvents: hasPermission(ALERT_PERMISSIONS.RECEIVE_FR_EVENTS),
    canAcknowledge: hasPermission(ALERT_PERMISSIONS.ACKNOWLEDGE),
    canNotifyHost: hasPermission(ALERT_PERMISSIONS.HOST_NOTIFY),
    canSendNotifications: hasPermission(ALERT_PERMISSIONS.NOTIFICATION_SEND_HOST),
    canReadOwnNotifications: hasPermission(ALERT_PERMISSIONS.NOTIFICATION_READ_OWN)
  }), [hasPermission]);

  // Emergency Permissions
  const emergencyPermissions = useMemo(() => ({
    canExport: hasPermission(EMERGENCY_PERMISSIONS.EXPORT),
    canGenerateRoster: hasPermission(EMERGENCY_PERMISSIONS.ROSTER_GENERATE)
  }), [hasPermission]);

  // Bulk Import Permissions
  const bulkImportPermissions = useMemo(() => ({
    canUpload: hasPermission(BULK_IMPORT_PERMISSIONS.UPLOAD),
    canProcess: hasPermission(BULK_IMPORT_PERMISSIONS.PROCESS),
    canValidate: hasPermission(BULK_IMPORT_PERMISSIONS.VALIDATE),
    canReview: hasPermission(BULK_IMPORT_PERMISSIONS.REVIEW),
    canApprove: hasPermission(BULK_IMPORT_PERMISSIONS.APPROVE),
    canExportTemplate: hasPermission(BULK_IMPORT_PERMISSIONS.EXPORT_TEMPLATE),
    canManage: hasAnyPermission([
      BULK_IMPORT_PERMISSIONS.UPLOAD,
      BULK_IMPORT_PERMISSIONS.PROCESS,
      BULK_IMPORT_PERMISSIONS.APPROVE
    ])
  }), [hasPermission, hasAnyPermission]);

  // Template Permissions
  const templatePermissions = useMemo(() => ({
    canCreate: hasPermission(TEMPLATE_PERMISSIONS.CREATE),
    canRead: hasPermission(TEMPLATE_PERMISSIONS.READ),
    canUpdate: hasPermission(TEMPLATE_PERMISSIONS.UPDATE),
    canDelete: hasPermission(TEMPLATE_PERMISSIONS.DELETE),
    canDownloadSingle: hasPermission(TEMPLATE_PERMISSIONS.DOWNLOAD_SINGLE),
    canManage: hasPermission(TEMPLATE_PERMISSIONS.MANAGE)
  }), [hasPermission]);

  // Custom Field Permissions
  const customFieldPermissions = useMemo(() => ({
    canCreate: hasPermission(CUSTOM_FIELD_PERMISSIONS.CREATE),
    canRead: hasPermission(CUSTOM_FIELD_PERMISSIONS.READ),
    canUpdate: hasPermission(CUSTOM_FIELD_PERMISSIONS.UPDATE),
    canDelete: hasPermission(CUSTOM_FIELD_PERMISSIONS.DELETE),
    canManage: hasPermission(CUSTOM_FIELD_PERMISSIONS.MANAGE)
  }), [hasPermission]);

  // Watchlist Permissions
  const watchlistPermissions = useMemo(() => ({
    canCreate: hasPermission(WATCHLIST_PERMISSIONS.CREATE),
    canRead: hasPermission(WATCHLIST_PERMISSIONS.READ),
    canUpdate: hasPermission(WATCHLIST_PERMISSIONS.UPDATE),
    canDelete: hasPermission(WATCHLIST_PERMISSIONS.DELETE),
    canAssign: hasPermission(WATCHLIST_PERMISSIONS.ASSIGN),
    canManage: hasPermission(WATCHLIST_PERMISSIONS.MANAGE)
  }), [hasPermission]);

  // Facial Recognition System Permissions
  const frSystemPermissions = useMemo(() => ({
    canConfigure: hasPermission(FR_SYSTEM_PERMISSIONS.CONFIGURE),
    canManage: hasPermission(FR_SYSTEM_PERMISSIONS.MANAGE),
    canSyncManage: hasPermission(FR_SYSTEM_PERMISSIONS.SYNC),
    canSyncProfiles: hasPermission(FR_SYSTEM_PERMISSIONS.SYNC_PROFILES),
    canSyncWatchlists: hasPermission(FR_SYSTEM_PERMISSIONS.SYNC_WATCHLISTS),
    canOfflineManage: hasPermission(FR_SYSTEM_PERMISSIONS.OFFLINE_MANAGE),
    canOfflineQueue: hasPermission(FR_SYSTEM_PERMISSIONS.OFFLINE_QUEUE)
  }), [hasPermission]);

  // Reporting Permissions
  const reportPermissions = useMemo(() => ({
    canView: hasPermission(REPORT_PERMISSIONS.VIEW),
    canGenerate: hasPermission(REPORT_PERMISSIONS.GENERATE),
    canGenerateOwn: hasPermission(REPORT_PERMISSIONS.GENERATE_OWN),
    canExport: hasPermission(REPORT_PERMISSIONS.EXPORT),
    canSchedule: hasPermission(REPORT_PERMISSIONS.SCHEDULE),
    canManage: hasPermission(REPORT_PERMISSIONS.MANAGE)
  }), [hasPermission]);

  // Dashboard Permissions
  const dashboardPermissions = useMemo(() => ({
    canViewBasic: hasPermission(DASHBOARD_PERMISSIONS.VIEW_BASIC),
    canViewOperations: hasPermission(DASHBOARD_PERMISSIONS.VIEW_OPERATIONS),
    canViewAdmin: hasPermission(DASHBOARD_PERMISSIONS.VIEW_ADMIN),
    canViewAnalytics: hasPermission(DASHBOARD_PERMISSIONS.VIEW_ANALYTICS)
  }), [hasPermission]);

  // System Configuration Permissions
  const systemConfigPermissions = useMemo(() => ({
    canRead: hasPermission(SYSTEM_CONFIG_PERMISSIONS.READ),
    canUpdate: hasPermission(SYSTEM_CONFIG_PERMISSIONS.UPDATE),
    canManage: hasPermission(SYSTEM_CONFIG_PERMISSIONS.MANAGE),
    canBackup: hasPermission(SYSTEM_CONFIG_PERMISSIONS.BACKUP),
    canRestore: hasPermission(SYSTEM_CONFIG_PERMISSIONS.RESTORE),
    canMaintain: hasPermission(SYSTEM_CONFIG_PERMISSIONS.MAINTAIN)
  }), [hasPermission]);

  // Audit Permissions
  const auditPermissions = useMemo(() => ({
    canRead: hasPermission(AUDIT_PERMISSIONS.READ),
    canExport: hasPermission(AUDIT_PERMISSIONS.EXPORT),
    canManage: hasPermission(AUDIT_PERMISSIONS.MANAGE)
  }), [hasPermission]);

  // Integration Permissions
  const integrationPermissions = useMemo(() => ({
    canConfigure: hasPermission(INTEGRATION_PERMISSIONS.CONFIGURE),
    canManage: hasPermission(INTEGRATION_PERMISSIONS.MANAGE),
    canTest: hasPermission(INTEGRATION_PERMISSIONS.TEST)
  }), [hasPermission]);

  // Profile Permissions
  const profilePermissions = useMemo(() => ({
    canUpdateOwn: hasPermission(PROFILE_PERMISSIONS.UPDATE_OWN)
  }), [hasPermission]);

  // Calendar Permissions
  const calendarPermissions = useMemo(() => ({
    canViewOwn: hasPermission(CALENDAR_PERMISSIONS.VIEW_OWN),
    canViewAll: hasPermission(CALENDAR_PERMISSIONS.VIEW_ALL),
    canManage: hasPermission(CALENDAR_PERMISSIONS.MANAGE)
  }), [hasPermission]);

  // High-level capability checks
  const canAccessAdminFeatures = useMemo(() => {
    return isAdmin || hasAnyPermission([
      USER_PERMISSIONS.CREATE,
      SYSTEM_CONFIG_PERMISSIONS.MANAGE,
      AUDIT_PERMISSIONS.READ
    ]);
  }, [isAdmin, hasAnyPermission]);

  const canAccessOperatorFeatures = useMemo(() => {
    return isOperator || isAdmin || hasAnyPermission([
      CHECKIN_PERMISSIONS.PROCESS,
      VISITOR_PERMISSIONS.READ_TODAY,
      ALERT_PERMISSIONS.RECEIVE_FR_EVENTS
    ]);
  }, [isOperator, isAdmin, hasAnyPermission]);

  const canAccessStaffFeatures = useMemo(() => {
    return isStaff || isOperator || isAdmin || hasAnyPermission([
      INVITATION_PERMISSIONS.CREATE_SINGLE_OWN,
      INVITATION_PERMISSIONS.READ_OWN,
      CALENDAR_PERMISSIONS.VIEW_OWN
    ]);
  }, [isStaff, isOperator, isAdmin, hasAnyPermission]);

  // Permission utility functions
  const checkPermission = useMemo(() => {
    return (permission, options = {}) => {
      const { allowAdmin = true, allowOwner = false, ownerId = null, currentUserId = null } = options;
      
      // Admin bypass
      if (allowAdmin && isAdmin) return true;
      
      // Owner check
      if (allowOwner && ownerId && currentUserId && ownerId === currentUserId) return true;
      
      // Regular permission check
      return hasPermission(permission);
    };
  }, [hasPermission, isAdmin]);

  const getPermissionLevel = useMemo(() => {
    return (permissionCategory) => {
      const categoryPermissions = permissions?.filter(p => p.startsWith(permissionCategory)) || [];
      
      if (categoryPermissions.length === 0) return 'none';
      if (categoryPermissions.some(p => p.includes('Create') || p.includes('Delete'))) return 'full';
      if (categoryPermissions.some(p => p.includes('Update'))) return 'modify';
      if (categoryPermissions.some(p => p.includes('Read'))) return 'read';
      
      return 'limited';
    };
  }, [permissions]);

  return {
    // Core functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    isAnyRole,
    checkPermission,
    getPermissionLevel,

    // Role checks
    isAdmin,
    isStaff,
    isOperator,

    // Feature access
    canAccessAdminFeatures,
    canAccessOperatorFeatures,
    canAccessStaffFeatures,

    // Specific permission groups
    user: userPermissions,
    invitation: invitationPermissions,
    visitor: visitorPermissions,
    checkin: checkinPermissions,
    alert: alertPermissions,
    emergency: emergencyPermissions,
    bulkImport: bulkImportPermissions,
    template: templatePermissions,
    customField: customFieldPermissions,
    watchlist: watchlistPermissions,
    frSystem: frSystemPermissions,
    report: reportPermissions,
    dashboard: dashboardPermissions,
    systemConfig: systemConfigPermissions,
    audit: auditPermissions,
    integration: integrationPermissions,
    profile: profilePermissions,
    calendar: calendarPermissions,

    // From selectors
    capabilities,
    dashboardAccess,
    navigationAccess,
    formAccess,

    // Raw data
    permissions,
    userRole
  };
};