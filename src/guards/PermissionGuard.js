import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../hooks/useAuth';
import { ROLE_PERMISSIONS } from '../constants/permissions'; 
import PropTypes from 'prop-types';

/**
 * PermissionGuard component that protects routes/components based on user permissions
 * Supports multiple permission checking strategies
 */
const PermissionGuard = ({ 
  children, 
  permission = null,
  permissions = [],
  requireAll = false,
  fallback = null,
  redirect = false,
  redirectTo = '/access-denied',
  allowAdmin = true,
  allowOwner = false,
  ownerId = null,
  currentUserId = null
}) => {
  const { 
    hasAnyPermission, 
    hasAllPermissions,
    isAdmin,
    checkPermission
  } = usePermissions();

  const { userId } = useAuth();
  const effectiveCurrentUserId = currentUserId || userId;

  // Determine if user has required permissions
  const hasAccess = React.useMemo(() => {
    // Admin bypass
    if (allowAdmin && isAdmin) {
      return true;
    }

    // Owner check
    if (allowOwner && ownerId && effectiveCurrentUserId && ownerId === effectiveCurrentUserId) {
      return true;
    }

    // Single permission check
    if (permission) {
      return checkPermission(permission, { 
        allowAdmin, 
        allowOwner, 
        ownerId, 
        currentUserId: effectiveCurrentUserId 
      });
    }

    // Multiple permissions check
    if (permissions.length > 0) {
      return requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    // No permissions specified - allow access
    return true;
  }, [permission, permissions, requireAll, hasAnyPermission, hasAllPermissions, isAdmin, allowAdmin, allowOwner, ownerId, effectiveCurrentUserId, checkPermission]);

  // Handle access denial
  if (!hasAccess) {
    if (redirect) {
      return <Navigate to={redirectTo} replace />;
    }
    
    if (fallback) {
      return fallback;
    }

    // Default access denied message
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <div className="access-denied-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this resource.</p>
          {permission && <p className="text-sm text-gray-600 mt-2">Required permission: {permission}</p>}
          {permissions.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Required permissions: {permissions.join(requireAll ? ' and ' : ' or ')}
            </p>
          )}
        </div>
      </div>
    );
  }

  return children;
};

PermissionGuard.propTypes = {
  children: PropTypes.node.isRequired,
  permission: PropTypes.string,
  permissions: PropTypes.arrayOf(PropTypes.string),
  requireAll: PropTypes.bool,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string,
  allowAdmin: PropTypes.bool,
  allowOwner: PropTypes.bool,
  ownerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

/**
 * Higher-order component version of PermissionGuard
 */
export const withPermissionGuard = (Component, guardOptions = {}) => {
  const PermissionGuardedComponent = (props) => (
    <PermissionGuard {...guardOptions}>
      <Component {...props} />
    </PermissionGuard>
  );

  PermissionGuardedComponent.displayName = `withPermissionGuard(${Component.displayName || Component.name})`;
  return PermissionGuardedComponent;
};

/**
 * Hook for conditional permission checking
 */
export const usePermissionGuard = (guardOptions = {}) => {
  const {
    permission = null,
    permissions = [],
    requireAll = false,
    allowAdmin = true,
    allowOwner = false,
    ownerId = null,
    currentUserId = null
  } = guardOptions;

  const { 
    hasAnyPermission, 
    hasAllPermissions,
    isAdmin,
    checkPermission
  } = usePermissions();
  
  const { userId } = useAuth();
  const effectiveCurrentUserId = currentUserId || userId;

  const canAccess = React.useMemo(() => {
    // Admin bypass
    if (allowAdmin && isAdmin) {
      return true;
    }

    // Owner check
    if (allowOwner && ownerId && effectiveCurrentUserId && ownerId === effectiveCurrentUserId) {
      return true;
    }

    // Single permission check
    if (permission) {
      return checkPermission(permission, { 
        allowAdmin, 
        allowOwner, 
        ownerId, 
        currentUserId: effectiveCurrentUserId 
      });
    }

    // Multiple permissions check
    if (permissions.length > 0) {
      return requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    return true;
  }, [permission, permissions, requireAll, hasAnyPermission, hasAllPermissions, isAdmin, allowAdmin, allowOwner, ownerId, effectiveCurrentUserId, checkPermission]);

  return {
    canAccess,
    hasPermission: (perm) => checkPermission(perm, { 
      allowAdmin, 
      allowOwner, 
      ownerId, 
      currentUserId: effectiveCurrentUserId 
    }),
    isAdmin
  };
};

/**
 * Component for conditional rendering based on permissions
 */
export const PermissionOnly = ({ 
  children, 
  fallback = null, 
  redirect = false, 
  redirectTo = '/access-denied',
  ...guardOptions 
}) => {
  const { canAccess } = usePermissionGuard(guardOptions);

  if (!canAccess) {
    if (redirect) {
      return <Navigate to={redirectTo} replace />;
    }
    return fallback;
  }

  return children;
};

PermissionOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string,
  permission: PropTypes.string,
  permissions: PropTypes.arrayOf(PropTypes.string),
  requireAll: PropTypes.bool,
  allowAdmin: PropTypes.bool,
  allowOwner: PropTypes.bool,
  ownerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

/**
 * Utility function to create permission-based route elements
 */
export const createPermissionRoute = (element, guardOptions = {}) => {
  return (
    <PermissionGuard {...guardOptions}>
      {element}
    </PermissionGuard>
  );
};

/**
 * Helper components for common permission patterns
 */
export const AdminOnly = ({ children, fallback = null, redirect = false, redirectTo = '/access-denied' }) => (
  <PermissionOnly 
    permission={ROLE_PERMISSIONS.ADMIN_ACCESS}
    fallback={fallback}
    redirect={redirect}
    redirectTo={redirectTo}
  >
    {children}
  </PermissionOnly>
);

AdminOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

export const StaffOrHigher = ({ children, fallback = null, redirect = false, redirectTo = '/access-denied' }) => (
  <PermissionOnly 
    permissions={[ROLE_PERMISSIONS.STAFF_ACCESS, ROLE_PERMISSIONS.OPERATOR_ACCESS, ROLE_PERMISSIONS.ADMIN_ACCESS]}
    requireAll={false}
    fallback={fallback}
    redirect={redirect}
    redirectTo={redirectTo}
  >
    {children}
  </PermissionOnly>
);

StaffOrHigher.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

export const OperatorOrHigher = ({ children, fallback = null, redirect = false, redirectTo = '/access-denied' }) => (
  <PermissionOnly 
    permissions={[ROLE_PERMISSIONS.OPERATOR_ACCESS, ROLE_PERMISSIONS.ADMIN_ACCESS]}
    requireAll={false}
    fallback={fallback}
    redirect={redirect}
    redirectTo={redirectTo}
  >
    {children}
  </PermissionOnly>
);

OperatorOrHigher.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

export default PermissionGuard;