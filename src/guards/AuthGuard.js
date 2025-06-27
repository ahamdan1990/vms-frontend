// src/guards/AuthGuard.js
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setPageLoading } from '../store/slices/uiSlice';
import PropTypes from 'prop-types';

/**
 * AuthGuard component - FIXED VERSION
 */
const AuthGuard = ({ children, fallback = null, redirectTo = '/login' }) => {
  const { isAuthenticated, loading, needsPasswordChange, needsTwoFactor } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();

  // Manage global loading state
  useEffect(() => {
    dispatch(setPageLoading(loading));
    return () => dispatch(setPageLoading(false));
  }, [loading, dispatch]);

  // ✅ FIXED: Show loading state while checking authentication
  if (loading) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Preserve the intended destination
    const from = location.pathname + location.search;
    const loginPath = `${redirectTo}${from !== '/login' ? `?from=${encodeURIComponent(from)}` : ''}`;
    
    console.log('🚪 Not authenticated, redirecting to:', loginPath);
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

  // ✅ User is authenticated, render children
  console.log('✅ User authenticated, rendering protected content');
  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirectTo: PropTypes.string
};

export default AuthGuard;