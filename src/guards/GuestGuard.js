import React from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PropTypes from 'prop-types';

/**
 * GuestGuard component that protects routes that should only be accessible to unauthenticated users
 * Redirects authenticated users to appropriate dashboard or intended destination
 */
const GuestGuard = ({ 
  children, 
  fallback = null, 
  redirectTo = '/dashboard',
  checkIntendedDestination = true
}) => {
  const { isAuthenticated, loading, userRole } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Show loading state while checking authentication
  if (loading) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="guest-guard-loading">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users
  if (isAuthenticated) {
    let destination = redirectTo;

    // Check for intended destination from query params
    if (checkIntendedDestination) {
      const from = searchParams.get('from');
      if (from) {
        try {
          destination = decodeURIComponent(from);
          
          // Validate the destination to prevent open redirects
          if (!destination.startsWith('/') || destination.startsWith('//')) {
            destination = redirectTo;
          }
        } catch (error) {
          console.warn('Failed to decode intended destination:', error);
          destination = redirectTo;
        }
      }
    }

    // Role-based default redirects
    if (destination === '/dashboard') {
      destination = getRoleBasedRedirect(userRole);
    }

    console.log('🔄 Authenticated user on guest page, redirecting to:', destination);
    return <Navigate to={destination} replace />;
  }

  // User is not authenticated, render children
  return children;
};

GuestGuard.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirectTo: PropTypes.string,
  checkIntendedDestination: PropTypes.bool
};

/**
 * Higher-order component version of GuestGuard
 */
export const withGuestGuard = (Component, options = {}) => {
  const GuestGuardedComponent = (props) => (
    <GuestGuard {...options}>
      <Component {...props} />
    </GuestGuard>
  );

  GuestGuardedComponent.displayName = `withGuestGuard(${Component.displayName || Component.name})`;
  return GuestGuardedComponent;
};

/**
 * Hook for conditional guest checking
 */
export const useGuestGuard = (options = {}) => {
  const { redirectOnAuthenticated = true, redirectTo = '/dashboard' } = options;
  const { isAuthenticated, loading, userRole } = useAuth();
  const [searchParams] = useSearchParams();

  const canAccess = !isAuthenticated && !loading;
  
  const getRedirectPath = () => {
    if (!redirectOnAuthenticated || !isAuthenticated) return null;
    
    let destination = redirectTo;

    // Check for intended destination
    const from = searchParams.get('from');
    if (from) {
      try {
        const decodedFrom = decodeURIComponent(from);
        // Validate the destination to prevent open redirects
        if (decodedFrom.startsWith('/') && !decodedFrom.startsWith('//')) {
          destination = decodedFrom;
        }
      } catch (error) {
        console.warn('Failed to decode intended destination:', error);
      }
    }

    // Role-based default redirects
    if (destination === '/dashboard') {
      return getRoleBasedRedirect(userRole);
    }

    return destination;
  };

  return {
    canAccess,
    isAuthenticated,
    loading,
    redirectPath: getRedirectPath()
  };
};

/**
 * Component for conditional rendering for guests only
 */
export const GuestOnly = ({ 
  children, 
  fallback = null, 
  redirect = false, 
  redirectTo = '/dashboard',
  checkIntendedDestination = true 
}) => {
  const { canAccess, redirectPath } = useGuestGuard({ 
    redirectOnAuthenticated: redirect, 
    redirectTo 
  });

  if (redirect && !canAccess && redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (!canAccess) {
    return fallback;
  }

  return children;
};

GuestOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string,
  checkIntendedDestination: PropTypes.bool
};

/**
 * Component for rendering different content based on authentication status
 */
export const AuthSwitch = ({ 
  authenticated, 
  unauthenticated, 
  loading = null,
  fallback = null 
}) => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return loading || fallback;
  }

  return isAuthenticated ? authenticated : unauthenticated;
};

AuthSwitch.propTypes = {
  authenticated: PropTypes.node.isRequired,
  unauthenticated: PropTypes.node.isRequired,
  loading: PropTypes.node,
  fallback: PropTypes.node
};

/**
 * Utility function to get role-based redirect path
 */
export const getRoleBasedRedirect = (userRole, defaultPath = '/dashboard') => {
  switch (userRole) {
    case 'Administrator':
      return '/admin/dashboard';
    case 'Operator':
      return '/operator/dashboard';
    case 'Staff':
      return '/staff/dashboard';
    default:
      return defaultPath;
  }
};

/**
 * Utility function to create guest-only route elements
 */
export const createGuestRoute = (element, guardOptions = {}) => {
  return (
    <GuestGuard {...guardOptions}>
      {element}
    </GuestGuard>
  );
};

/**
 * Component for protecting login/register pages
 */
export const LoginPageGuard = ({ children }) => {
  return (
    <GuestGuard
      redirectTo="/dashboard"
      checkIntendedDestination={true}
      fallback={
        <div className="login-loading">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      }
    >
      {children}
    </GuestGuard>
  );
};

LoginPageGuard.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Component for welcome/landing pages that redirect authenticated users
 */
export const LandingPageGuard = ({ children, redirectTo = '/dashboard' }) => {
  return (
    <GuestGuard
      redirectTo={redirectTo}
      checkIntendedDestination={false}
    >
      {children}
    </GuestGuard>
  );
};

LandingPageGuard.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string
};

/**
 * Hook to check if current page should be accessible to guests
 */
export const useGuestPageValidation = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  const guestOnlyPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email'
  ];
  
  const isGuestOnlyPage = guestOnlyPaths.some(path => 
    location.pathname.startsWith(path)
  );
  
  const shouldRedirect = isAuthenticated && !loading && isGuestOnlyPage;
  
  return {
    isGuestOnlyPage,
    shouldRedirect,
    redirectPath: shouldRedirect ? getRoleBasedRedirect() : null
  };
};

export default GuestGuard;