/**
 * Authentication and authorization utilities
 * Provides helper functions for user authentication, permissions, and roles
 */

// Get current user from various sources
export const getCurrentUser = (auth, localStorage, sessionStorage) => {
  // Try auth state first (Redux)
  if (auth && auth.user) {
    return auth.user;
  }
  
  // Try localStorage
  try {
    const stored = localStorage?.getItem('currentUser') || sessionStorage?.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Error parsing stored user data:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (auth, localStorage, sessionStorage) => {
  const user = getCurrentUser(auth, localStorage, sessionStorage);
  const token = getAuthToken(localStorage, sessionStorage);
  
  return !!(user && token && !isTokenExpired(token));
};

// Get authentication token
export const getAuthToken = (localStorage, sessionStorage) => {
  return localStorage?.getItem('authToken') || 
         sessionStorage?.getItem('authToken') ||
         localStorage?.getItem('token') ||
         sessionStorage?.getItem('token');
};

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp < currentTime;
  } catch (error) {
    console.warn('Error parsing token:', error);
    return true;
  }
};

// Check user permissions
export const hasPermission = (user, permission) => {
  if (!user || !permission) return false;
  
  // Admin users have all permissions
  if (user.role === 'Admin' || user.isAdmin) return true;
  
  // Check explicit permissions
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }
  
  // Check role-based permissions
  return checkRolePermission(user.role, permission);
};

// Check multiple permissions (user must have all)
export const hasAllPermissions = (user, permissions) => {
  if (!permissions || !Array.isArray(permissions)) return false;
  return permissions.every(permission => hasPermission(user, permission));
};

// Check multiple permissions (user must have at least one)
export const hasAnyPermission = (user, permissions) => {
  if (!permissions || !Array.isArray(permissions)) return false;
  return permissions.some(permission => hasPermission(user, permission));
};

// Role-based permission mapping
export const checkRolePermission = (role, permission) => {
  const rolePermissions = {
    'Admin': [
      'Camera.Read', 'Camera.Create', 'Camera.Update', 'Camera.Delete',
      'Camera.TestConnection', 'Camera.StartStream', 'Camera.StopStream',
      'Camera.ViewStream', 'Camera.HealthCheck', 'Camera.CaptureFrame',
      'Camera.ViewSensitiveData', 'Location.Read', 'Location.Create',
      'Location.Update', 'Location.Delete', 'User.Read', 'User.Create',
      'User.Update', 'User.Delete', 'Visitor.Read', 'Visitor.Create',
      'Visitor.Update', 'Visitor.Delete'
    ],
    'Manager': [
      'Camera.Read', 'Camera.Create', 'Camera.Update',
      'Camera.TestConnection', 'Camera.StartStream', 'Camera.StopStream',
      'Camera.ViewStream', 'Camera.HealthCheck', 'Camera.CaptureFrame',
      'Location.Read', 'Location.Create', 'Location.Update',
      'User.Read', 'Visitor.Read', 'Visitor.Create', 'Visitor.Update'
    ],
    'Operator': [
      'Camera.Read', 'Camera.StartStream', 'Camera.StopStream',
      'Camera.ViewStream', 'Camera.HealthCheck', 'Camera.CaptureFrame',
      'Location.Read', 'Visitor.Read', 'Visitor.Create', 'Visitor.Update'
    ],
    'Viewer': [
      'Camera.Read', 'Camera.ViewStream', 'Location.Read', 'Visitor.Read'
    ]
  };
  
  return rolePermissions[role]?.includes(permission) || false;
};

// Check if user can access route
export const canAccessRoute = (user, route, requiredPermissions = []) => {
  if (!isAuthenticated(user)) return false;
  if (!requiredPermissions.length) return true;
  
  return hasAllPermissions(user, requiredPermissions);
};

// Get user display name
export const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  if (user.lastName) return user.lastName;
  if (user.username) return user.username;
  if (user.email) return user.email.split('@')[0];
  
  return 'User';
};

// Get user initials for avatar
export const getUserInitials = (user) => {
  if (!user) return 'U';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  
  const name = getUserDisplayName(user);
  const nameParts = name.split(' ').filter(part => part.length > 0);
  
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  
  return name[0]?.toUpperCase() || 'U';
};

// Check if user is in specific role
export const hasRole = (user, role) => {
  if (!user || !role) return false;
  return user.role === role || user.roles?.includes(role);
};

// Check if user has any of the specified roles
export const hasAnyRole = (user, roles) => {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.some(role => hasRole(user, role));
};

// Clear authentication data
export const clearAuthData = (localStorage, sessionStorage) => {
  // Clear tokens
  localStorage?.removeItem('authToken');
  localStorage?.removeItem('token');
  sessionStorage?.removeItem('authToken');
  sessionStorage?.removeItem('token');
  
  // Clear user data
  localStorage?.removeItem('currentUser');
  sessionStorage?.removeItem('currentUser');
  
  // Clear refresh tokens
  localStorage?.removeItem('refreshToken');
  sessionStorage?.removeItem('refreshToken');
};

// Format user role for display
export const formatRole = (role) => {
  if (!role) return '';
  
  // Handle camelCase and PascalCase
  return role
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Check if user account is active
export const isUserActive = (user) => {
  if (!user) return false;
  
  // Check various active flags
  if (user.isActive === false || user.active === false) return false;
  if (user.isBlocked === true || user.blocked === true) return false;
  if (user.isDeleted === true || user.deleted === true) return false;
  if (user.status === 'inactive' || user.status === 'blocked' || user.status === 'deleted') return false;
  
  return true;
};

// Get user's last activity
export const getLastActivity = (user) => {
  if (!user) return null;
  
  return user.lastActivity || user.lastLogin || user.lastAccess || null;
};

// Check if user session is valid
export const isValidSession = (user, token, maxSessionAge = 24 * 60 * 60 * 1000) => {
  if (!isAuthenticated(user)) return false;
  if (!isUserActive(user)) return false;
  
  const lastActivity = getLastActivity(user);
  if (lastActivity) {
    const sessionAge = Date.now() - new Date(lastActivity).getTime();
    if (sessionAge > maxSessionAge) return false;
  }
  
  return true;
};

export default {
  getCurrentUser,
  isAuthenticated,
  getAuthToken,
  isTokenExpired,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  checkRolePermission,
  canAccessRoute,
  getUserDisplayName,
  getUserInitials,
  hasRole,
  hasAnyRole,
  clearAuthData,
  formatRole,
  isUserActive,
  getLastActivity,
  isValidSession
};
