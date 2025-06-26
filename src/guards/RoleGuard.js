import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleLevel } from '../constants/permissions';
import PropTypes from 'prop-types';

/**
 * RoleGuard component that protects routes/components based on user roles
 * Supports role hierarchy and multiple role checking
 */
const RoleGuard = ({ 
  children, 
  role = null,
  roles = [],
  requireAll = false,
  allowHigher = true,
  fallback = null,
  redirect = false,
  redirectTo = '/access-denied'
}) => {
  const { userRole, isAdmin, isOperator, isStaff } = useAuth();

  // ✅ FIXED: Use consistent role hierarchy from constants
  const userRoleLevel = getRoleLevel(userRole);

  // Determine if user has required role access
  const hasAccess = React.useMemo(() => {
    // Single role check
    if (role) {
      const requiredLevel = getRoleLevel(role);
      
      if (allowHigher) {
        return userRoleLevel >= requiredLevel;
      } else {
        return userRole === role;
      }
    }

    // Multiple roles check
    if (roles.length > 0) {
      if (requireAll) {
        // User must have ALL specified roles (usually not practical)
        return roles.every(r => {
          if (allowHigher) {
            return userRoleLevel >= getRoleLevel(r);
          } else {
            return userRole === r;
          }
        });
      } else {
        // User must have ANY of the specified roles
        return roles.some(r => {
          if (allowHigher) {
            return userRoleLevel >= getRoleLevel(r);
          } else {
            return userRole === r;
          }
        });
      }
    }

    // No roles specified - allow access
    return true;
  }, [role, roles, requireAll, allowHigher, userRole, userRoleLevel]);

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
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h2>Insufficient Role</h2>
          <p>Your current role ({userRole}) doesn't have access to this resource.</p>
          {role && <p className="text-sm text-gray-600 mt-2">Required role: {role}{allowHigher ? ' or higher' : ''}</p>}
          {roles.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Required roles: {roles.join(requireAll ? ' and ' : ' or ')}{allowHigher ? ' or higher' : ''}
            </p>
          )}
        </div>
      </div>
    );
  }

  return children;
};

RoleGuard.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.string,
  roles: PropTypes.arrayOf(PropTypes.string),
  requireAll: PropTypes.bool,
  allowHigher: PropTypes.bool,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

/**
 * Higher-order component version of RoleGuard
 */
export const withRoleGuard = (Component, guardOptions = {}) => {
  const RoleGuardedComponent = (props) => (
    <RoleGuard {...guardOptions}>
      <Component {...props} />
    </RoleGuard>
  );

  RoleGuardedComponent.displayName = `withRoleGuard(${Component.displayName || Component.name})`;
  return RoleGuardedComponent;
};

/**
 * Hook for conditional role checking
 */
export const useRoleGuard = (guardOptions = {}) => {
  const {
    role = null,
    roles = [],
    requireAll = false,
    allowHigher = true
  } = guardOptions;

  const { userRole, isAdmin, isOperator, isStaff } = useAuth();
  const userRoleLevel = getRoleLevel(userRole);

  const canAccess = React.useMemo(() => {
    if (role) {
      const requiredLevel = getRoleLevel(role);
      return allowHigher ? userRoleLevel >= requiredLevel : userRole === role;
    }

    if (roles.length > 0) {
      if (requireAll) {
        return roles.every(r => {
          return allowHigher ? userRoleLevel >= getRoleLevel(r) : userRole === r;
        });
      } else {
        return roles.some(r => {
          return allowHigher ? userRoleLevel >= getRoleLevel(r) : userRole === r;
        });
      }
    }

    return true;
  }, [role, roles, requireAll, allowHigher, userRole, userRoleLevel]);

  const hasRole = (roleName, allowHigherRole = allowHigher) => {
    const requiredLevel = getRoleLevel(roleName);
    return allowHigherRole ? userRoleLevel >= requiredLevel : userRole === roleName;
  };

  const hasAnyRole = (roleNames, allowHigherRole = allowHigher) => {
    return roleNames.some(r => hasRole(r, allowHigherRole));
  };

  const hasAllRoles = (roleNames, allowHigherRole = allowHigher) => {
    return roleNames.every(r => hasRole(r, allowHigherRole));
  };

  return {
    canAccess,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    userRole,
    userRoleLevel,
    isAdmin,
    isOperator,
    isStaff
  };
};

/**
 * Component for conditional rendering based on roles
 */
export const RoleOnly = ({ 
  children, 
  fallback = null, 
  redirect = false, 
  redirectTo = '/access-denied',
  ...guardOptions 
}) => {
  const { canAccess } = useRoleGuard(guardOptions);

  if (!canAccess) {
    if (redirect) {
      return <Navigate to={redirectTo} replace />;
    }
    return fallback;
  }

  return children;
};

RoleOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string,
  role: PropTypes.string,
  roles: PropTypes.arrayOf(PropTypes.string),
  requireAll: PropTypes.bool,
  allowHigher: PropTypes.bool
};

/**
 * Helper components for specific role checks
 */
export const AdminOnly = ({ children, fallback = null, redirect = false, redirectTo = '/access-denied' }) => (
  <RoleOnly 
    role="Administrator"
    allowHigher={false}
    fallback={fallback}
    redirect={redirect}
    redirectTo={redirectTo}
  >
    {children}
  </RoleOnly>
);

AdminOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

export const OperatorOnly = ({ children, fallback = null, redirect = false, redirectTo = '/access-denied' }) => (
  <RoleOnly 
    role="Operator"
    allowHigher={false}
    fallback={fallback}
    redirect={redirect}
    redirectTo={redirectTo}
  >
    {children}
  </RoleOnly>
);

OperatorOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

export const StaffOnly = ({ children, fallback = null, redirect = false, redirectTo = '/access-denied' }) => (
  <RoleOnly 
    role="Staff"
    allowHigher={false}
    fallback={fallback}
    redirect={redirect}
    redirectTo={redirectTo}
  >
    {children}
  </RoleOnly>
);

StaffOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

export const OperatorOrAdmin = ({ children, fallback = null, redirect = false, redirectTo = '/access-denied' }) => (
  <RoleOnly 
    roles={['Operator', 'Administrator']}
    requireAll={false}
    allowHigher={false}
    fallback={fallback}
    redirect={redirect}
    redirectTo={redirectTo}
  >
    {children}
  </RoleOnly>
);

OperatorOrAdmin.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

export const StaffOrHigher = ({ children, fallback = null, redirect = false, redirectTo = '/access-denied' }) => (
  <RoleOnly 
    role="Staff"
    allowHigher={true}
    fallback={fallback}
    redirect={redirect}
    redirectTo={redirectTo}
  >
    {children}
  </RoleOnly>
);

StaffOrHigher.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

export const OperatorOrHigher = ({ children, fallback = null, redirect = false, redirectTo = '/access-denied' }) => (
  <RoleOnly 
    role="Operator"
    allowHigher={true}
    fallback={fallback}
    redirect={redirect}
    redirectTo={redirectTo}
  >
    {children}
  </RoleOnly>
);

OperatorOrHigher.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirect: PropTypes.bool,
  redirectTo: PropTypes.string
};

export default RoleGuard;