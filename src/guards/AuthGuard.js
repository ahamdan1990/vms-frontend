import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setPageLoading } from '../store/slices/uiSlice';
import PropTypes from 'prop-types';

/**
 * AuthGuard component that protects routes requiring authentication
 * Redirects unauthenticated users to login page
 * Preserves the intended destination for post-login redirect
 */
const AuthGuard = ({ children, fallback = null, redirectTo = '/login' }) => {
  const { isAuthenticated, loading, checkAuth, needsPasswordChange, needsTwoFactor } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();

  // Check authentication status on mount
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      checkAuth();
    }
  }, [isAuthenticated, loading, checkAuth]);

  // Manage global loading state
  useEffect(() => {
    dispatch(setPageLoading(loading));
    return () => dispatch(setPageLoading(false));
  }, [loading, dispatch]);

  // Show loading state while checking authentication
  if (loading) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="auth-guard-loading">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Preserve the intended destination
    const from = location.pathname + location.search;
    const loginPath = `${redirectTo}${from !== '/login' ? `?from=${encodeURIComponent(from)}` : ''}`;
    
    return <Navigate to={loginPath} replace />;
  }

  // Handle special authentication states
  if (needsPasswordChange) {
    // Redirect to password change page
    return <Navigate to="/change-password" replace />;
  }

  if (needsTwoFactor) {
    // Redirect to two-factor authentication page
    return <Navigate to="/two-factor" replace />;
  }

  // User is authenticated, render children
  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirectTo: PropTypes.string
};

/**
 * Higher-order component version of AuthGuard
 */
export const withAuthGuard = (Component, options = {}) => {
  const AuthGuardedComponent = (props) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  );

  AuthGuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  return AuthGuardedComponent;
};

/**
 * Hook for conditional authentication checking
 */
export const useAuthGuard = (options = {}) => {
  const { redirectOnFailure = true, redirectTo = '/login' } = options;
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const canAccess = isAuthenticated && !loading;
  
  const getRedirectPath = () => {
    if (!redirectOnFailure) return null;
    
    const from = location.pathname + location.search;
    return `${redirectTo}${from !== '/login' ? `?from=${encodeURIComponent(from)}` : ''}`;
  };

  return {
    canAccess,
    isAuthenticated,
    loading,
    redirectPath: getRedirectPath()
  };
};

/**
 * Component for conditional rendering based on authentication
 */
export const AuthOnly = ({ children, fallback = null, redirect = false, redirectTo = '/login' }) => {
  const { canAccess, redirectPath } = useAuthGuard({ redirectOnFailure: redirect, redirectTo });

  if (redirect && !canAccess && redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (!canAccess) {
    return fallback;
  }

  return children;
};

AuthOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

/**
 * Component for rendering content only for unauthenticated users
 */
export const GuestOnly = ({ children, fallback = null, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return fallback;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

GuestOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirectTo: PropTypes.string
};

export default AuthGuard;