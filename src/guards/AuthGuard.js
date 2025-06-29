// src/guards/AuthGuard.js - PRODUCTION ENHANCED VERSION
import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setPageLoading } from '../store/slices/uiSlice';
import PropTypes from 'prop-types';

/**
 * AuthGuard component - PRODUCTION READY VERSION
 * Optimized for performance and proper redirect handling
 */
const AuthGuard = ({ children, fallback = null, redirectTo = '/login' }) => {
  const { isAuthenticated, loading, needsPasswordChange, needsTwoFactor } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();
  const mountedRef = useRef(true);
  const redirectRef = useRef(false);

  // ✅ PRODUCTION FIX: Debounced loading state management
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        dispatch(setPageLoading(loading));
      }
    }, 50); // Small delay to prevent rapid state changes

    return () => {
      clearTimeout(timer);
      if (mountedRef.current) {
        dispatch(setPageLoading(false));
      }
    };
  }, [loading, dispatch]);

  // ✅ PRODUCTION FIX: Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ✅ PRODUCTION FIX: Optimized loading component
  const LoadingComponent = () => (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Checking authentication...</p>
      </div>
    </div>
  );

  // ✅ PRODUCTION FIX: Show loading state while checking authentication
  if (loading) {
    return fallback || <LoadingComponent />;
  }

  // ✅ PRODUCTION FIX: Handle authentication redirect with cleanup
  if (!isAuthenticated) {
    if (!redirectRef.current) {
      redirectRef.current = true;
      
      // Clean up any query parameters from previous failed redirects
      const currentPath = location.pathname;
      const isAlreadyOnLogin = currentPath === '/login';
      
      if (!isAlreadyOnLogin) {
        // Preserve the intended destination, but clean up the URL
        const from = currentPath === '/' ? '/dashboard' : currentPath;
        const cleanFrom = from.split('?')[0]; // Remove any existing query params
        const loginPath = `${redirectTo}?from=${encodeURIComponent(cleanFrom)}`;
        
        console.log('🚪 Not authenticated, redirecting to:', loginPath);
        return <Navigate to={loginPath} replace />;
      }
      
      // Already on login page, don't redirect
      return <Navigate to="/login" replace />;
    }
  }

  // ✅ PRODUCTION FIX: Handle special authentication states
  if (needsPasswordChange) {
    return <Navigate to="/change-password" replace />;
  }

  if (needsTwoFactor) {
    return <Navigate to="/two-factor" replace />;
  }

  // ✅ PRODUCTION FIX: Reset redirect flag when successfully authenticated
  if (isAuthenticated && redirectRef.current) {
    redirectRef.current = false;
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
 * ✅ PRODUCTION ADDITION: Higher-order component for AuthGuard
 */
export const withAuthGuard = (Component, guardOptions = {}) => {
  const AuthGuardedComponent = (props) => (
    <AuthGuard {...guardOptions}>
      <Component {...props} />
    </AuthGuard>
  );

  AuthGuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  return AuthGuardedComponent;
};

/**
 * ✅ PRODUCTION ADDITION: Hook for conditional auth checking
 */
export const useAuthGuard = (options = {}) => {
  const { redirectOnUnauthenticated = true, redirectTo = '/login' } = options;
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const canAccess = isAuthenticated && !loading;
  
  const getRedirectPath = () => {
    if (!redirectOnUnauthenticated || isAuthenticated) return null;
    
    const from = location.pathname === '/' ? '/dashboard' : location.pathname;
    return `${redirectTo}?from=${encodeURIComponent(from)}`;
  };

  return {
    canAccess,
    isAuthenticated,
    loading,
    redirectPath: getRedirectPath()
  };
};

/**
 * ✅ PRODUCTION ADDITION: Component for conditional rendering
 */
export const AuthenticatedOnly = ({ 
  children, 
  fallback = null, 
  redirect = false, 
  redirectTo = '/login' 
}) => {
  const { canAccess, redirectPath } = useAuthGuard({ 
    redirectOnUnauthenticated: redirect, 
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

AuthenticatedOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

/**
 * ✅ PRODUCTION ADDITION: Utility to clean redirect URLs
 */
export const cleanRedirectUrl = (url) => {
  if (!url) return '/dashboard';
  
  try {
    // Remove any existing query parameters
    const cleanUrl = url.split('?')[0];
    
    // Ensure it starts with / and doesn't have double slashes
    const normalizedUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    
    // Prevent open redirects
    if (normalizedUrl.startsWith('//') || normalizedUrl.includes('://')) {
      return '/dashboard';
    }
    
    return normalizedUrl;
  } catch (error) {
    console.warn('Error cleaning redirect URL:', error);
    return '/dashboard';
  }
};

export default AuthGuard;