// src/utils/navigationHelper.js
/**
 * Navigation helper utilities for programmatic routing
 */

// Route constants (you may need to adjust these based on your routeConstants.js)
export const DASHBOARD_ROUTES = {
  DEFAULT: '/dashboard',
  STAFF: '/staff/dashboard',
  OPERATOR: '/operator/dashboard',
  ADMIN: '/admin/dashboard'
};

export const AUTH_ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password'
};

/**
 * Navigation helper for programmatic routing
 */
export const NavigationHelper = {
  // Get the appropriate dashboard route for a user role
  getDashboardRoute: (userRole) => {
    switch (userRole) {
      case 'Staff':
        return DASHBOARD_ROUTES.STAFF;
      case 'Operator':
        return DASHBOARD_ROUTES.OPERATOR;
      case 'Administrator':
        return DASHBOARD_ROUTES.ADMIN;
      default:
        return DASHBOARD_ROUTES.DEFAULT;
    }
  },

  // Get login redirect path
  getLoginRedirect: (intendedPath) => {
    if (!intendedPath || intendedPath === '/' || intendedPath === AUTH_ROUTES.LOGIN) {
      return AUTH_ROUTES.LOGIN;
    }
    return `${AUTH_ROUTES.LOGIN}?from=${encodeURIComponent(intendedPath)}`;
  },

  // Get post-login redirect path
  getPostLoginRedirect: (searchParams, userRole) => {
    const from = searchParams?.get ? searchParams.get('from') : null;
    
    if (from && from.startsWith('/') && !from.startsWith('//')) {
      try {
        return decodeURIComponent(from);
      } catch (error) {
        console.warn('Invalid redirect URL:', from);
      }
    }
    
    return NavigationHelper.getDashboardRoute(userRole);
  },

  // Get home route based on authentication status
  getHomeRoute: (isAuthenticated, userRole) => {
    if (isAuthenticated) {
      return NavigationHelper.getDashboardRoute(userRole);
    }
    return AUTH_ROUTES.LOGIN;
  },

  // Check if route is a dashboard route
  isDashboardRoute: (path) => {
    return Object.values(DASHBOARD_ROUTES).some(route => path.startsWith(route));
  },

  // Check if route is an auth route
  isAuthRoute: (path) => {
    return Object.values(AUTH_ROUTES).some(route => path.startsWith(route));
  }
};

export default NavigationHelper;