/**
 * Role constants that match the backend role system exactly
 * Defines role hierarchy, capabilities, and metadata
 * Works in conjunction with permissions.js for complete RBAC
 */

// Core role definitions (matches backend enum)
export const ROLES = {
  STAFF: 'Staff',
  OPERATOR: 'Operator',
  ADMINISTRATOR: 'Administrator'
};

// Role hierarchy (higher numbers = higher privileges)
export const ROLE_HIERARCHY = {
  [ROLES.STAFF]: 1,
  [ROLES.OPERATOR]: 2,
  [ROLES.ADMINISTRATOR]: 3
};

// Role metadata with descriptions and capabilities
export const ROLE_METADATA = {
  [ROLES.STAFF]: {
    name: 'Staff',
    displayName: 'Staff Member',
    description: 'Basic staff members who can create invitations and manage their own calendar',
    color: '#10b981', // Green
    icon: 'user',
    capabilities: [
      'Create personal invitations',
      'View own calendar',
      'Update own profile',
      'Download templates',
      'Generate personal reports'
    ],
    limitations: [
      'Cannot manage other users',
      'Cannot approve invitations',
      'Cannot access system settings',
      'Cannot view all visitors'
    ],
    dashboardRoute: '/staff/dashboard',
    defaultPermissions: 10
  },
  
  [ROLES.OPERATOR]: {
    name: 'Operator',
    displayName: 'Front Desk Operator',
    description: 'Front desk operators who handle check-ins, walk-ins, and visitor processing',
    color: '#3b82f6', // Blue
    icon: 'clipboard-check',
    capabilities: [
      'Process visitor check-ins/check-outs',
      'Register walk-in visitors',
      'Receive and acknowledge alerts',
      'Print visitor badges',
      'Handle emergency exports',
      'Manual overrides for special cases',
      'QR code scanning',
      'Create FR profiles for walk-ins'
    ],
    limitations: [
      'Cannot manage users',
      'Cannot modify system settings',
      'Cannot approve bulk imports',
      'Limited reporting access'
    ],
    dashboardRoute: '/operator/dashboard',
    defaultPermissions: 18
  },
  
  [ROLES.ADMINISTRATOR]: {
    name: 'Administrator',
    displayName: 'System Administrator',
    description: 'Full system administrators with complete access to all features and settings',
    color: '#ef4444', // Red
    icon: 'shield-check',
    capabilities: [
      'Complete user management',
      'System configuration',
      'Bulk import operations',
      'Facial recognition management',
      'Audit log access',
      'Custom field management',
      'Watchlist management',
      'Report generation and scheduling',
      'System backup and maintenance',
      'Integration management'
    ],
    limitations: [
      'None - full system access'
    ],
    dashboardRoute: '/admin/dashboard',
    defaultPermissions: 52
  }
};

// Role assignment rules and restrictions
export const ROLE_ASSIGNMENT_RULES = {
  // Who can assign which roles
  ASSIGNMENT_MATRIX: {
    [ROLES.ADMINISTRATOR]: [ROLES.STAFF, ROLES.OPERATOR, ROLES.ADMINISTRATOR],
    [ROLES.OPERATOR]: [], // Operators cannot assign roles
    [ROLES.STAFF]: []     // Staff cannot assign roles
  },
  
  // Minimum role required to manage users with specific roles
  MANAGEMENT_REQUIREMENTS: {
    [ROLES.STAFF]: ROLES.ADMINISTRATOR,
    [ROLES.OPERATOR]: ROLES.ADMINISTRATOR,
    [ROLES.ADMINISTRATOR]: ROLES.ADMINISTRATOR
  },
  
  // Special restrictions
  RESTRICTIONS: {
    // Prevent users from demoting themselves below admin
    SELF_DEMOTION_PREVENTION: true,
    
    // Require minimum number of administrators
    MIN_ADMINISTRATORS: 1,
    
    // Prevent deletion of last administrator
    LAST_ADMIN_PROTECTION: true,
    
    // Require admin approval for role changes
    REQUIRE_APPROVAL: {
      [ROLES.STAFF]: false,
      [ROLES.OPERATOR]: false,
      [ROLES.ADMINISTRATOR]: true
    }
  }
};

// Default role configurations
export const DEFAULT_ROLE_CONFIG = {
  // Default role for new users
  DEFAULT_ROLE: ROLES.STAFF,
  
  // Role-specific defaults
  ROLE_DEFAULTS: {
    [ROLES.STAFF]: {
      mustChangePassword: true,
      sendWelcomeEmail: true,
      accountExpiry: null,
      sessionTimeout: 30, // minutes
      maxSessions: 3
    },
    
    [ROLES.OPERATOR]: {
      mustChangePassword: true,
      sendWelcomeEmail: true,
      accountExpiry: null,
      sessionTimeout: 60, // minutes
      maxSessions: 2
    },
    
    [ROLES.ADMINISTRATOR]: {
      mustChangePassword: true,
      sendWelcomeEmail: true,
      accountExpiry: null,
      sessionTimeout: 120, // minutes
      maxSessions: 5
    }
  }
};

// Role-based feature access
export const ROLE_FEATURES = {
  [ROLES.STAFF]: {
    navigation: [
      'dashboard',
      'invitations',
      'calendar',
      'profile',
      'reports'
    ],
    
    dashboardWidgets: [
      'myInvitations',
      'upcomingVisits',
      'personalStats',
      'quickActions'
    ],
    
    quickActions: [
      'createInvitation',
      'viewCalendar',
      'downloadTemplate',
      'updateProfile'
    ],
    
    reports: [
      'personalInvitations',
      'personalVisits'
    ]
  },
  
  [ROLES.OPERATOR]: {
    navigation: [
      'dashboard',
      'checkin',
      'visitors',
      'alerts',
      'emergency',
      'profile',
      'reports'
    ],
    
    dashboardWidgets: [
      'todaysVisitors',
      'checkinQueue',
      'activeAlerts',
      'occupancyStatus',
      'quickActions',
      'systemStatus'
    ],
    
    quickActions: [
      'processCheckin',
      'registerWalkin',
      'printBadge',
      'acknowledgeAlerts',
      'emergencyExport'
    ],
    
    reports: [
      'dailyVisitors',
      'checkinSummary',
      'alertHistory'
    ]
  },
  
  [ROLES.ADMINISTRATOR]: {
    navigation: [
      'dashboard',
      'users',
      'invitations',
      'visitors',
      'checkin',
      'alerts',
      'reports',
      'system',
      'audit',
      'profile'
    ],
    
    dashboardWidgets: [
      'systemOverview',
      'userStats',
      'visitorStats',
      'systemHealth',
      'recentActivity',
      'performanceMetrics',
      'alerts',
      'quickActions'
    ],
    
    quickActions: [
      'createUser',
      'bulkImport',
      'systemBackup',
      'viewAuditLogs',
      'systemConfig',
      'generateReport'
    ],
    
    reports: [
      'userActivity',
      'systemUsage',
      'securityAudit',
      'performanceReport',
      'complianceReport',
      'customReports'
    ]
  }
};

// Role-based UI themes and preferences
export const ROLE_UI_PREFERENCES = {
  [ROLES.STAFF]: {
    defaultTheme: 'light',
    compactMode: false,
    showAdvancedFeatures: false,
    defaultPageSize: 20,
    showHelpTips: true
  },
  
  [ROLES.OPERATOR]: {
    defaultTheme: 'light',
    compactMode: true, // More information density
    showAdvancedFeatures: true,
    defaultPageSize: 50,
    showHelpTips: false
  },
  
  [ROLES.ADMINISTRATOR]: {
    defaultTheme: 'dark',
    compactMode: false,
    showAdvancedFeatures: true,
    defaultPageSize: 50,
    showHelpTips: false
  }
};

// Role validation and utility functions
export const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role] || 0;
};

export const canRoleManageRole = (managerRole, targetRole) => {
  const managerLevel = getRoleLevel(managerRole);
  const targetLevel = getRoleLevel(targetRole);
  
  // Administrators can manage all roles
  if (managerRole === ROLES.ADMINISTRATOR) {
    return true;
  }
  
  // Others cannot manage roles
  return false;
};

export const isHigherRole = (role1, role2) => {
  return getRoleLevel(role1) > getRoleLevel(role2);
};

export const isEqualOrHigherRole = (role1, role2) => {
  return getRoleLevel(role1) >= getRoleLevel(role2);
};

export const getAvailableRolesForAssignment = (currentUserRole) => {
  return ROLE_ASSIGNMENT_RULES.ASSIGNMENT_MATRIX[currentUserRole] || [];
};

export const getRoleMetadata = (role) => {
  return ROLE_METADATA[role] || null;
};

export const getRoleColor = (role) => {
  return ROLE_METADATA[role]?.color || '#6b7280';
};

export const getRoleIcon = (role) => {
  return ROLE_METADATA[role]?.icon || 'user';
};

export const getRoleDashboard = (role) => {
  return ROLE_METADATA[role]?.dashboardRoute || '/dashboard';
};

export const getRoleFeatures = (role) => {
  return ROLE_FEATURES[role] || ROLE_FEATURES[ROLES.STAFF];
};

export const getRoleUIPreferences = (role) => {
  return ROLE_UI_PREFERENCES[role] || ROLE_UI_PREFERENCES[ROLES.STAFF];
};

export const validateRoleAssignment = (assignerRole, targetRole, isNewUser = false) => {
  const errors = [];
  
  // Check if assigner can assign this role
  const availableRoles = getAvailableRolesForAssignment(assignerRole);
  if (!availableRoles.includes(targetRole)) {
    errors.push(`You do not have permission to assign the ${targetRole} role`);
  }
  
  // Additional validations can be added here
  if (targetRole === ROLES.ADMINISTRATOR && !isNewUser) {
    // Could add additional checks for admin role assignment
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getMinimumRoleForAction = (action) => {
  const actionRoleMap = {
    // User management
    'createUser': ROLES.ADMINISTRATOR,
    'updateUser': ROLES.ADMINISTRATOR,
    'deleteUser': ROLES.ADMINISTRATOR,
    'viewUsers': ROLES.ADMINISTRATOR,
    
    // System management
    'systemConfig': ROLES.ADMINISTRATOR,
    'viewAuditLogs': ROLES.ADMINISTRATOR,
    'bulkImport': ROLES.ADMINISTRATOR,
    
    // Operations
    'processCheckin': ROLES.OPERATOR,
    'viewTodaysVisitors': ROLES.OPERATOR,
    'receiveAlerts': ROLES.OPERATOR,
    
    // Basic features
    'createInvitation': ROLES.STAFF,
    'viewOwnInvitations': ROLES.STAFF,
    'updateProfile': ROLES.STAFF
  };
  
  return actionRoleMap[action] || ROLES.ADMINISTRATOR;
};

// Role-based security settings
export const ROLE_SECURITY = {
  [ROLES.STAFF]: {
    passwordComplexity: 'medium',
    sessionTimeout: 30,
    maxFailedLogins: 5,
    lockoutDuration: 15, // minutes
    requireMFA: false,
    ipRestriction: false,
    auditLevel: 'basic'
  },
  
  [ROLES.OPERATOR]: {
    passwordComplexity: 'high',
    sessionTimeout: 60,
    maxFailedLogins: 3,
    lockoutDuration: 30, // minutes
    requireMFA: false,
    ipRestriction: true,
    auditLevel: 'detailed'
  },
  
  [ROLES.ADMINISTRATOR]: {
    passwordComplexity: 'very_high',
    sessionTimeout: 120,
    maxFailedLogins: 3,
    lockoutDuration: 60, // minutes
    requireMFA: true,
    ipRestriction: true,
    auditLevel: 'comprehensive'
  }
};

// Export all role-related utilities as a single object
export const RoleUtils = {
  getRoleLevel,
  canRoleManageRole,
  isHigherRole,
  isEqualOrHigherRole,
  getAvailableRolesForAssignment,
  getRoleMetadata,
  getRoleColor,
  getRoleIcon,
  getRoleDashboard,
  getRoleFeatures,
  getRoleUIPreferences,
  validateRoleAssignment,
  getMinimumRoleForAction
};

export default {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_METADATA,
  ROLE_ASSIGNMENT_RULES,
  DEFAULT_ROLE_CONFIG,
  ROLE_FEATURES,
  ROLE_UI_PREFERENCES,
  ROLE_SECURITY,
  ...RoleUtils
};