/**
 * Route constants for consistent navigation throughout the application
 * Defines all route paths, parameters, and navigation structure
 */

// Public routes (no authentication required)
export const PUBLIC_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCESS_DENIED: '/access-denied',
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500'
};

// Authentication routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  LOGOUT: '/logout',
  CHANGE_PASSWORD: '/change-password',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  TWO_FACTOR: '/two-factor'
};

// Dashboard routes (role-based)
export const DASHBOARD_ROUTES = {
  // Default dashboard (redirects based on role)
  DEFAULT: '/dashboard',
  
  // Role-specific dashboards
  STAFF: '/staff/dashboard',
  OPERATOR: '/operator/dashboard',
  ADMIN: '/admin/dashboard',
  
  // New advanced dashboards
  RECEPTIONIST: '/receptionist',
  ANALYTICS: '/analytics',
  INTEGRATED: '/integrated-management',
  EXCEL_MANAGEMENT: '/excel-management'
};

// User management routes
export const USER_ROUTES = {
  BASE: '/users',
  LIST: '/users',
  CREATE: '/users/new',
  DETAIL: '/users/:id',
  EDIT: '/users/:id/edit',
  ACTIVITY: '/users/:id/activity',
  
  // Dynamic route builders
  getDetailRoute: (id) => `/users/${id}`,
  getEditRoute: (id) => `/users/${id}/edit`,
  getActivityRoute: (id) => `/users/${id}/activity`
};

// Invitation management routes (for future implementation)
export const INVITATION_ROUTES = {
  BASE: '/invitations',
  LIST: '/invitations',
  CREATE: '/invitations/new',
  DETAIL: '/invitations/:id',
  EDIT: '/invitations/:id/edit',
  APPROVE: '/invitations/:id/approve',
  BULK: '/invitations/bulk',
  BULK_IMPORT: '/invitations/bulk-import',
  TEMPLATES: '/invitations/templates',
  
  // Dynamic route builders
  getDetailRoute: (id) => `/invitations/${id}`,
  getEditRoute: (id) => `/invitations/${id}/edit`,
  getApproveRoute: (id) => `/invitations/${id}/approve`
};

// Visitor management routes (for future implementation)
export const VISITOR_ROUTES = {
  BASE: '/visitors',
  LIST: '/visitors',
  CREATE: '/visitors/new',
  DETAIL: '/visitors/:id',
  EDIT: '/visitors/:id/edit',
  HISTORY: '/visitors/:id/history',
  DOCUMENTS: '/visitors/:id/documents',
  MERGE: '/visitors/merge',
  SEARCH: '/visitors/search',
  
  // Dynamic route builders
  getDetailRoute: (id) => `/visitors/${id}`,
  getEditRoute: (id) => `/visitors/${id}/edit`,
  getHistoryRoute: (id) => `/visitors/${id}/history`,
  getDocumentsRoute: (id) => `/visitors/${id}/documents`
};

// Camera management routes
export const CAMERA_ROUTES = {
  BASE: '/cameras',
  LIST: '/cameras',
  CREATE: '/cameras/new',
  DETAIL: '/cameras/:id',
  EDIT: '/cameras/:id/edit',
  CONFIGURATION: '/cameras/:id/configuration',
  STREAM: '/cameras/:id/stream',
  HEALTH: '/cameras/health',
  STATISTICS: '/cameras/statistics',
  
  // Dynamic route builders
  getDetailRoute: (id) => `/cameras/${id}`,
  getEditRoute: (id) => `/cameras/${id}/edit`,
  getConfigurationRoute: (id) => `/cameras/${id}/configuration`,
  getStreamRoute: (id) => `/cameras/${id}/stream`
};

// Check-in/out routes (for future implementation)
export const CHECKIN_ROUTES = {
  BASE: '/checkin',
  PROCESS: '/checkin',
  CHECKOUT: '/checkout',
  WALKINS: '/walkins',
  WALKIN_NEW: '/walkins/new',
  WALKIN_DETAIL: '/walkins/:id',
  BADGES: '/badges',
  BADGE_PRINT: '/badges/:id/print',
  OCCUPANCY: '/occupancy',
  EMERGENCY: '/emergency',
  
  // Dynamic route builders
  getWalkInDetailRoute: (id) => `/walkins/${id}`,
  getBadgePrintRoute: (id) => `/badges/${id}/print`
};

// Reporting routes (for future implementation)
export const REPORT_ROUTES = {
  BASE: '/reports',
  LIST: '/reports',
  CREATE: '/reports/new',
  DETAIL: '/reports/:id',
  EDIT: '/reports/:id/edit',
  VIEW: '/reports/:id/view',
  EXPORT: '/reports/:id/export',
  SCHEDULED: '/reports/scheduled',
  ANALYTICS: '/analytics',
  DASHBOARD: '/analytics/dashboard',
  
  // Dynamic route builders
  getDetailRoute: (id) => `/reports/${id}`,
  getEditRoute: (id) => `/reports/${id}/edit`,
  getViewRoute: (id) => `/reports/${id}/view`,
  getExportRoute: (id) => `/reports/${id}/export`
};

// System administration routes
export const SYSTEM_ROUTES = {
  BASE: '/system',
  OVERVIEW: '/system',
  CONFIG: '/system/config',
  USERS: '/system/users',
  ROLES: '/system/roles',
  PERMISSIONS: '/system/permissions',
  AUDIT: '/system/audit',
  LOGS: '/system/logs',
  BACKUP: '/system/backup',
  MAINTENANCE: '/system/maintenance',
  INTEGRATIONS: '/system/integrations',
  CUSTOMFIELDS: '/system/custom-fields',
  TEMPLATES: '/system/templates',
  VISIT_PURPOSES: '/system/visit-purposes',
  LOCATIONS: '/system/locations',
  COMPANIES: '/system/companies',
  DEPARTMENTS: '/system/departments',
  TIME_SLOTS: '/system/time-slots',
  MANAGEMENT: '/system/management', // New consolidated management page
  ESCALATION_RULES: '/system/escalation-rules', // New escalation rules page
  
  // Facial Recognition System routes
  FR_SYSTEM: '/system/facial-recognition',
  FR_CONFIG: '/system/facial-recognition/config',
  FR_PROFILES: '/system/facial-recognition/profiles',
  FR_WATCHLISTS: '/system/facial-recognition/watchlists',
  FR_CAMERAS: '/system/facial-recognition/cameras',
  FR_ALERTS: '/system/facial-recognition/alerts',
  FR_SYNC: '/system/facial-recognition/sync',
  
  // Bulk operations
  BULK_IMPORT: '/system/bulk-import',
  BULK_EXPORT: '/system/bulk-export'
};

// Role management routes
export const ROLE_ROUTES = {
  BASE: '/admin/roles',
  LIST: '/admin/roles',
  DETAIL: '/admin/roles/:roleId',
  PERMISSIONS: '/admin/roles/:roleId/permissions',

  // Dynamic route builders
  getDetailRoute: (roleId) => `/admin/roles/${roleId}`,
  getPermissionsRoute: (roleId) => `/admin/roles/${roleId}/permissions`
};

// Capacity management routes
export const CAPACITY_ROUTES = {
  BASE: '/capacity',
  DASHBOARD: '/capacity',
  MONITOR: '/capacity/monitor',
  STATISTICS: '/capacity/statistics',
  TRENDS: '/capacity/trends'
};

// Calendar routes
export const CALENDAR_ROUTES = {
  BASE: '/calendar',
  VIEW: '/calendar',
  WEEK: '/calendar/week',
  DAY: '/calendar/day',
  MONTH: '/calendar/month'
};

// Profile and settings routes
export const PROFILE_ROUTES = {
  BASE: '/profile',
  VIEW: '/profile',
  EDIT: '/profile/edit',
  SECURITY: '/profile/security',
  PREFERENCES: '/profile/preferences',
  SESSIONS: '/profile/sessions',
  ACTIVITY: '/profile/activity'
};

// Alert and notification routes
export const ALERT_ROUTES = {
  BASE: '/alerts',
  LIST: '/alerts',
  DETAIL: '/alerts/:id',
  ACKNOWLEDGE: '/alerts/:id/acknowledge',
  HISTORY: '/alerts/history',
  SETTINGS: '/alerts/settings',
  
  // Dynamic route builders
  getDetailRoute: (id) => `/alerts/${id}`,
  getAcknowledgeRoute: (id) => `/alerts/${id}/acknowledge`
};

// Notification routes
export const NOTIFICATION_ROUTES = {
  BASE: '/notifications',
  DASHBOARD: '/notifications',
  LIST: '/notifications',
  DETAIL: '/notifications/:id',
  ACKNOWLEDGE: '/notifications/:id/acknowledge',
  STATS: '/notifications/stats',
  
  // Dynamic route builders
  getDetailRoute: (id) => `/notifications/${id}`,
  getAcknowledgeRoute: (id) => `/notifications/${id}/acknowledge`
};

// Help and documentation routes
export const HELP_ROUTES = {
  BASE: '/help',
  GETTING_STARTED: '/help/getting-started',
  USER_GUIDE: '/help/user-guide',
  ADMIN_GUIDE: '/help/admin-guide',
  FAQ: '/help/faq',
  SUPPORT: '/help/support',
  ABOUT: '/help/about'
};

// Route parameters
export const ROUTE_PARAMS = {
  USER_ID: 'id',
  INVITATION_ID: 'id',
  VISITOR_ID: 'id',
  REPORT_ID: 'id',
  ALERT_ID: 'id',
  TOKEN: 'token',
  EMAIL: 'email'
};

// Query parameters
export const QUERY_PARAMS = {
  // Pagination
  PAGE: 'page',
  PAGE_SIZE: 'pageSize',
  
  // Sorting
  SORT_BY: 'sortBy',
  SORT_DESC: 'sortDesc',
  
  // Filtering
  SEARCH: 'search',
  FILTER: 'filter',
  STATUS: 'status',
  ROLE: 'role',
  DATE_FROM: 'dateFrom',
  DATE_TO: 'dateTo',
  
  // Navigation
  TAB: 'tab',
  VIEW: 'view',
  MODE: 'mode',
  
  // Special parameters
  RETURN_URL: 'returnUrl',
  FROM: 'from',
  REDIRECT: 'redirect'
};

// Route metadata for navigation and breadcrumbs
export const ROUTE_METADATA = {
  [PUBLIC_ROUTES.LOGIN]: {
    title: 'Login',
    breadcrumb: 'Login',
    requiresAuth: false,
    roles: []
  },
  
  [DASHBOARD_ROUTES.DEFAULT]: {
    title: 'Dashboard',
    breadcrumb: 'Dashboard',
    requiresAuth: true,
    roles: ['Staff', 'Operator', 'Administrator']
  },

  [DASHBOARD_ROUTES.RECEPTIONIST]: {
    title: 'Receptionist Dashboard',
    breadcrumb: 'Receptionist',
    requiresAuth: true,
    roles: ['Operator', 'Administrator'],
    permissions: ['CheckIn.Process']
  },

  [DASHBOARD_ROUTES.ANALYTICS]: {
    title: 'Visitor Analytics',
    breadcrumb: 'Analytics',
    requiresAuth: true,
    roles: ['Staff', 'Operator', 'Administrator'],
    permissions: ['Visitor.Read']
  },

  [DASHBOARD_ROUTES.EXCEL_MANAGEMENT]: {
    title: 'Excel Management',
    breadcrumb: 'Excel Management',
    requiresAuth: true,
    roles: ['Administrator'],
    permissions: ['Invitation.BulkImport']
  },

  [DASHBOARD_ROUTES.INTEGRATED]: {
    title: 'Integrated Management',
    breadcrumb: 'Integrated Management',
    requiresAuth: true,
    roles: ['Operator', 'Administrator'],
    permissions: ['Visitor.Read']
  },
  
  [USER_ROUTES.LIST]: {
    title: 'Users',
    breadcrumb: 'Users',
    requiresAuth: true,
    roles: ['Administrator'],
    permissions: ['User.Read']
  },
  
  [USER_ROUTES.CREATE]: {
    title: 'Create User',
    breadcrumb: 'Create User',
    requiresAuth: true,
    roles: ['Administrator'],
    permissions: ['User.Create']
  },
  
  [VISITOR_ROUTES.LIST]: {
    title: 'Visitors',
    breadcrumb: 'Visitors',
    requiresAuth: true,
    roles: ['Staff', 'Operator', 'Administrator'],
    permissions: ['Visitor.Read']
  },
  
  [VISITOR_ROUTES.CREATE]: {
    title: 'Create Visitor',
    breadcrumb: 'Create Visitor',
    requiresAuth: true,
    roles: ['Staff', 'Operator', 'Administrator'],
    permissions: ['Visitor.Create']
  },

  [CAMERA_ROUTES.LIST]: {
    title: 'Camera Management',
    breadcrumb: 'Cameras',
    requiresAuth: true,
    roles: ['Operator', 'Administrator'],
    permissions: ['Camera.Read']
  },

  [CAMERA_ROUTES.DETAIL]: {
    title: 'Camera Details',
    breadcrumb: 'Camera Details',
    requiresAuth: true,
    roles: ['Operator', 'Administrator'],
    permissions: ['Camera.Read']
  },

  [PROFILE_ROUTES.VIEW]: {
    title: 'Profile',
    breadcrumb: 'Profile',
    requiresAuth: true,
    roles: ['Staff', 'Operator', 'Administrator']
  },
  
  [SYSTEM_ROUTES.OVERVIEW]: {
    title: 'System Administration',
    breadcrumb: 'System',
    requiresAuth: true,
    roles: ['Administrator'],
    permissions: ['SystemConfig.Read']
  },
  
  [SYSTEM_ROUTES.VISIT_PURPOSES]: {
    title: 'Visit Purposes',
    breadcrumb: 'Visit Purposes',
    requiresAuth: true,
    roles: ['Administrator'],
    permissions: ['SystemConfig.Read']
  },
  
  [SYSTEM_ROUTES.LOCATIONS]: {
    title: 'Locations',
    breadcrumb: 'Locations',
    requiresAuth: true,
    roles: ['Administrator'],
    permissions: ['SystemConfig.Read']
  },
  
  [SYSTEM_ROUTES.TIME_SLOTS]: {
    title: 'Time Slots',
    breadcrumb: 'Time Slots',
    requiresAuth: true,
    roles: ['Administrator'],
    permissions: ['SystemConfig.ManageCapacity']
  },

  [SYSTEM_ROUTES.ESCALATION_RULES]: {
    title: 'Escalation Rules',
    breadcrumb: 'Escalation Rules',
    requiresAuth: true,
    roles: ['Administrator'],
    permissions: ['Configuration.Read']
  },

  [ROLE_ROUTES.LIST]: {
    title: 'Role Management',
    breadcrumb: 'Roles',
    requiresAuth: true,
    roles: ['Administrator'],
    permissions: ['Role.ReadAll']
  },

  [ROLE_ROUTES.DETAIL]: {
    title: 'Role Details',
    breadcrumb: 'Role Details',
    requiresAuth: true,
    roles: ['Administrator'],
    permissions: ['Role.ReadAll']
  },

  [NOTIFICATION_ROUTES.DASHBOARD]: {
    title: 'Notifications',
    breadcrumb: 'Notifications',
    requiresAuth: true,
    roles: ['Staff', 'Operator', 'Administrator']
  },
  
  [CAPACITY_ROUTES.DASHBOARD]: {
    title: 'Capacity Dashboard',
    breadcrumb: 'Capacity',
    requiresAuth: true,
    roles: ['Staff', 'Operator', 'Administrator'],
    permissions: ['Dashboard.ViewBasic']
  }
};

// Navigation menu structure
export const NAVIGATION_MENU = {
  main: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: DASHBOARD_ROUTES.DEFAULT,
      icon: 'home',
      roles: ['Staff', 'Operator', 'Administrator']
    },
    {
      id: 'integrated-management',
      label: 'Integrated Management',
      path: DASHBOARD_ROUTES.INTEGRATED,
      icon: 'squares-2x2',
      roles: ['Operator', 'Administrator']
    },
    {
      id: 'receptionist',
      label: 'Receptionist',
      path: DASHBOARD_ROUTES.RECEPTIONIST,
      icon: 'user-check',
      roles: ['Operator', 'Administrator']
    },
    {
      id: 'invitations',
      label: 'Invitations',
      path: INVITATION_ROUTES.LIST,
      icon: 'mail',
      roles: ['Staff', 'Operator', 'Administrator'],
      children: [
        {
          id: 'invitations-list',
          label: 'All Invitations',
          path: INVITATION_ROUTES.LIST,
          roles: ['Operator', 'Administrator']
        },
        {
          id: 'invitations-create',
          label: 'Create Invitation',
          path: INVITATION_ROUTES.CREATE,
          roles: ['Staff', 'Operator', 'Administrator']
        },
        {
          id: 'invitations-bulk',
          label: 'Bulk Import',
          path: INVITATION_ROUTES.BULK_IMPORT,
          roles: ['Administrator']
        }
      ]
    },
    {
      id: 'visitors',
      label: 'Visitors',
      path: VISITOR_ROUTES.LIST,
      icon: 'users',
      roles: ['Staff', 'Operator', 'Administrator'],
      children: [
        {
          id: 'visitors-list',
          label: 'All Visitors',
          path: VISITOR_ROUTES.LIST,
          roles: ['Staff', 'Operator', 'Administrator']
        },
        {
          id: 'visitors-create',
          label: 'Add Visitor',
          path: VISITOR_ROUTES.CREATE,
          roles: ['Staff', 'Operator', 'Administrator']
        }
      ]
    },
    {
      id: 'cameras',
      label: 'Cameras',
      path: CAMERA_ROUTES.LIST,
      icon: 'video-camera',
      roles: ['Operator', 'Administrator'],
      children: [
        {
          id: 'cameras-list',
          label: 'All Cameras',
          path: CAMERA_ROUTES.LIST,
          roles: ['Operator', 'Administrator']
        },
        {
          id: 'cameras-health',
          label: 'Health Monitor',
          path: CAMERA_ROUTES.HEALTH,
          roles: ['Operator', 'Administrator']
        },
        {
          id: 'cameras-statistics',
          label: 'Statistics',
          path: CAMERA_ROUTES.STATISTICS,
          roles: ['Administrator']
        }
      ]
    },
    {
      id: 'checkin',
      label: 'Check-in',
      path: CHECKIN_ROUTES.PROCESS,
      icon: 'clipboard-check',
      roles: ['Operator', 'Administrator']
    },
    {
      id: 'capacity',
      label: 'Capacity Monitor',
      path: CAPACITY_ROUTES.DASHBOARD,
      icon: 'chart-pie',
      roles: ['Staff', 'Operator', 'Administrator']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: DASHBOARD_ROUTES.ANALYTICS,
      icon: 'chart-bar',
      roles: ['Staff', 'Operator', 'Administrator']
    },
    {
      id: 'reports',
      label: 'Reports',
      path: REPORT_ROUTES.LIST,
      icon: 'document-chart-bar',
      roles: ['Administrator']
    },
    {
      id: 'users',
      label: 'Users',
      path: USER_ROUTES.LIST,
      icon: 'user-group',
      roles: ['Administrator']
    },
    {
      id: 'excel-management',
      label: 'Excel Management',
      path: DASHBOARD_ROUTES.EXCEL_MANAGEMENT,
      icon: 'document-arrow-down',
      roles: ['Administrator']
    },
    {
      id: 'system',
      label: 'System',
      path: SYSTEM_ROUTES.OVERVIEW,
      icon: 'cog',
      roles: ['Administrator'],
      children: [
        {
          id: 'system-management',
          label: 'Management',
          path: SYSTEM_ROUTES.MANAGEMENT,
          roles: ['Administrator']
        },
        {
          id: 'system-config',
          label: 'Configuration',
          path: SYSTEM_ROUTES.CONFIG,
          roles: ['Administrator']
        },
        {
          id: 'system-visit-purposes',
          label: 'Visit Purposes',
          path: SYSTEM_ROUTES.VISIT_PURPOSES,
          roles: ['Administrator']
        },
        {
          id: 'system-locations',
          label: 'Locations',
          path: SYSTEM_ROUTES.LOCATIONS,
          roles: ['Administrator']
        },
        {
          id: 'system-time-slots',
          label: 'Time Slots',
          path: SYSTEM_ROUTES.TIME_SLOTS,
          roles: ['Administrator']
        },
        {
          id: 'system-escalation-rules',
          label: 'Escalation Rules',
          path: SYSTEM_ROUTES.ESCALATION_RULES,
          roles: ['Administrator']
        },
        {
          id: 'system-roles',
          label: 'Roles',
          path: ROLE_ROUTES.LIST,
          roles: ['Administrator']
        },
        {
          id: 'system-audit',
          label: 'Audit Logs',
          path: SYSTEM_ROUTES.AUDIT,
          roles: ['Administrator']
        },
        {
          id: 'system-fr',
          label: 'Facial Recognition',
          path: SYSTEM_ROUTES.FR_SYSTEM,
          roles: ['Administrator']
        }
      ]
    }
  ],
  
  user: [
    {
      id: 'profile',
      label: 'Profile',
      path: PROFILE_ROUTES.VIEW,
      icon: 'user'
    },
    {
      id: 'settings',
      label: 'Settings',
      path: PROFILE_ROUTES.PREFERENCES,
      icon: 'cog'
    },
    {
      id: 'help',
      label: 'Help',
      path: HELP_ROUTES.BASE,
      icon: 'question-mark-circle'
    }
  ]
};

// Route guards configuration
export const ROUTE_GUARDS = {
  // Routes that require authentication
  PROTECTED_ROUTES: [
    DASHBOARD_ROUTES.DEFAULT,
    USER_ROUTES.BASE,
    INVITATION_ROUTES.BASE,
    VISITOR_ROUTES.BASE,
    CHECKIN_ROUTES.BASE,
    REPORT_ROUTES.BASE,
    SYSTEM_ROUTES.BASE,
    PROFILE_ROUTES.BASE,
    ALERT_ROUTES.BASE
  ],
  
  // Routes that redirect authenticated users
  GUEST_ONLY_ROUTES: [
    PUBLIC_ROUTES.LOGIN,
    PUBLIC_ROUTES.SIGNUP,
    AUTH_ROUTES.FORGOT_PASSWORD,
    AUTH_ROUTES.RESET_PASSWORD
  ],
  
  // Routes with specific role requirements
  ROLE_PROTECTED_ROUTES: {
    [USER_ROUTES.BASE]: ['Administrator'],
    [SYSTEM_ROUTES.BASE]: ['Administrator'],
    [CHECKIN_ROUTES.BASE]: ['Operator', 'Administrator'],
    [VISITOR_ROUTES.BASE]: ['Operator', 'Administrator']
  }
};

// Utility functions for route handling
export const buildRoute = (routeTemplate, params = {}) => {
  let route = routeTemplate;
  
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, value);
  });
  
  return route;
};

export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const buildRouteWithQuery = (route, queryParams = {}) => {
  return route + buildQueryString(queryParams);
};

export const getRouteMetadata = (path) => {
  return ROUTE_METADATA[path] || null;
};

export const isProtectedRoute = (path) => {
  return ROUTE_GUARDS.PROTECTED_ROUTES.some(route => 
    path.startsWith(route.replace('/*', ''))
  );
};

export const isGuestOnlyRoute = (path) => {
  return ROUTE_GUARDS.GUEST_ONLY_ROUTES.includes(path);
};

export const getRequiredRoles = (path) => {
  for (const [route, roles] of Object.entries(ROUTE_GUARDS.ROLE_PROTECTED_ROUTES)) {
    if (path.startsWith(route.replace('/*', ''))) {
      return roles;
    }
  }
  return [];
};

export const getNavItemsForRole = (userRole) => {
  const filterByRole = (items) => {
    return items.filter(item => {
      if (item.roles && !item.roles.includes(userRole)) {
        return false;
      }
      
      if (item.children) {
        item.children = filterByRole(item.children);
      }
      
      return true;
    });
  };
  
  return {
    main: filterByRole(NAVIGATION_MENU.main),
    user: NAVIGATION_MENU.user
  };
};

export default {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  USER_ROUTES,
  INVITATION_ROUTES,
  VISITOR_ROUTES,
  CAMERA_ROUTES,
  CHECKIN_ROUTES,
  REPORT_ROUTES,
  SYSTEM_ROUTES,
  ROLE_ROUTES,
  CAPACITY_ROUTES,
  CALENDAR_ROUTES,
  PROFILE_ROUTES,
  ALERT_ROUTES,
  NOTIFICATION_ROUTES,
  HELP_ROUTES,
  ROUTE_PARAMS,
  QUERY_PARAMS,
  ROUTE_METADATA,
  NAVIGATION_MENU,
  ROUTE_GUARDS,

  // Utility functions
  buildRoute,
  buildQueryString,
  buildRouteWithQuery,
  getRouteMetadata,
  isProtectedRoute,
  isGuestOnlyRoute,
  getRequiredRoles,
  getNavItemsForRole
};
