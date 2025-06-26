/**
 * Route constants for consistent navigation throughout the application
 * Defines all route paths, parameters, and navigation structure
 */

// Public routes (no authentication required)
export const PUBLIC_ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCESS_DENIED: '/access-denied',
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500'
};

// Authentication routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
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
  ADMIN: '/admin/dashboard'
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
      roles: ['Operator', 'Administrator']
    },
    {
      id: 'checkin',
      label: 'Check-in',
      path: CHECKIN_ROUTES.PROCESS,
      icon: 'clipboard-check',
      roles: ['Operator', 'Administrator']
    },
    {
      id: 'reports',
      label: 'Reports',
      path: REPORT_ROUTES.LIST,
      icon: 'chart-bar',
      roles: ['Staff', 'Operator', 'Administrator']
    },
    {
      id: 'users',
      label: 'Users',
      path: USER_ROUTES.LIST,
      icon: 'user-group',
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
          id: 'system-config',
          label: 'Configuration',
          path: SYSTEM_ROUTES.CONFIG,
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
  CHECKIN_ROUTES,
  REPORT_ROUTES,
  SYSTEM_ROUTES,
  PROFILE_ROUTES,
  ALERT_ROUTES,
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