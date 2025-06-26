import apiClient, { extractApiData } from './apiClient';
import { USER_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * User management service that matches the backend API endpoints exactly
 * All endpoints require appropriate permissions as defined in the backend
 * Now properly integrated with apiEndpoints constants
 */
const userService = {
  /**
   * Gets paginated list of users with filtering and sorting
   * GET /api/Users
   * Requires: User.Read permission
   */
  async getUsers(params = {}) {
    const queryParams = {
      pageIndex: params.pageIndex || 0,
      pageSize: params.pageSize || 20,
      searchTerm: params.searchTerm || undefined,
      role: params.role || undefined,
      status: params.status || undefined,
      department: params.department || undefined,
      sortBy: params.sortBy || 'LastName',
      SortDescending: params.sortDescending || false
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${USER_ENDPOINTS.BASE}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets user by ID
   * GET /api/Users/{id}
   * Requires: User.Read permission
   */
  async getUserById(id) {
    const response = await apiClient.get(USER_ENDPOINTS.BY_ID(id));
    return extractApiData(response);
  },

  /**
   * Creates a new user
   * POST /api/Users
   * Requires: User.Create permission
   */
  async createUser(userData) {
    const response = await apiClient.post(USER_ENDPOINTS.BASE, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber || null,
      role: userData.role,
      department: userData.department || null,
      jobTitle: userData.jobTitle || null,
      employeeId: userData.employeeId || null,
      timeZone: userData.timeZone || null,
      language: userData.language || null,
      theme: userData.theme || null,
      mustChangePassword: userData.mustChangePassword || false,
      sendWelcomeEmail: userData.sendWelcomeEmail || true
    });
    
    return extractApiData(response);
  },

  /**
   * Updates an existing user
   * PUT /api/Users/{id}
   * Requires: User.Update permission
   */
  async updateUser(id, userData) {
    const response = await apiClient.put(USER_ENDPOINTS.BY_ID(id), {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber || null,
      role: userData.role,
      status: userData.status,
      department: userData.department || null,
      jobTitle: userData.jobTitle || null,
      employeeId: userData.employeeId || null,
      timeZone: userData.timeZone || null,
      language: userData.language || null,
      theme: userData.theme || null
    });
    
    return extractApiData(response);
  },

  /**
   * Deletes a user (soft delete)
   * DELETE /api/Users/{id}
   * Requires: User.Delete permission
   */
  async deleteUser(id) {
    const response = await apiClient.delete(USER_ENDPOINTS.BY_ID(id));
    return extractApiData(response);
  },

  /**
   * Activates a user account
   * POST /api/Users/{id}/activate
   * Requires: User.Activate permission
   */
  async activateUser(id, activationData = {}) {
    const response = await apiClient.post(USER_ENDPOINTS.ACTIVATE(id), {
      reason: activationData.reason || null,
      resetFailedAttempts: activationData.resetFailedAttempts || false
    });
    
    return extractApiData(response);
  },

  /**
   * Deactivates a user account
   * POST /api/Users/{id}/deactivate
   * Requires: User.Deactivate permission
   */
  async deactivateUser(id, deactivationData) {
    const response = await apiClient.post(USER_ENDPOINTS.DEACTIVATE(id), {
      reason: deactivationData.reason,
      revokeAllSessions: deactivationData.revokeAllSessions || false
    });
    
    return extractApiData(response);
  },

  /**
   * Unlocks a user account
   * POST /api/Users/{id}/unlock
   * Requires: User.Unlock permission
   */
  async unlockUser(id, unlockData = {}) {
    const response = await apiClient.post(USER_ENDPOINTS.UNLOCK(id), {
      reason: unlockData.reason || null
    });
    
    return extractApiData(response);
  },

  /**
   * Gets user's activity log
   * GET /api/Users/{id}/activity
   * Requires: User.ViewActivity permission
   */
  async getUserActivity(id, params = {}) {
    const queryParams = {
      pageIndex: params.pageIndex || 0,
      pageSize: params.pageSize || 20,
      days: params.days || 30
    };

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${USER_ENDPOINTS.ACTIVITY(id)}${queryString}`);
    
    return extractApiData(response);
  },

  /**
   * Resets user password (admin function)
   * POST /api/Users/{id}/reset-password
   * Requires: User.ResetPassword permission
   */
  async adminResetPassword(id, resetData) {
    const response = await apiClient.post(USER_ENDPOINTS.RESET_PASSWORD(id), {
      newPassword: resetData.newPassword || null,
      mustChangePassword: resetData.mustChangePassword || true,
      notifyUser: resetData.notifyUser || true
    });
    
    return extractApiData(response);
  },

  /**
   * Gets available roles for assignment
   * GET /api/Users/roles
   * Requires: User.ManageRoles permission
   */
  async getAvailableRoles() {
    const response = await apiClient.get(USER_ENDPOINTS.ROLES);
    return extractApiData(response);
  },

  // Additional utility methods for frontend

  /**
   * Search users with debounced query
   */
  async searchUsers(searchTerm, options = {}) {
    return this.getUsers({
      searchTerm,
      pageSize: options.limit || 10,
      pageIndex: 0
    });
  },

  /**
   * Get users by role
   */
  async getUsersByRole(role, options = {}) {
    return this.getUsers({
      role,
      pageSize: options.pageSize || 50,
      pageIndex: options.pageIndex || 0
    });
  },

  /**
   * Get users by department
   */
  async getUsersByDepartment(department, options = {}) {
    return this.getUsers({
      department,
      pageSize: options.pageSize || 50,
      pageIndex: options.pageIndex || 0
    });
  },

  /**
   * Get user statistics
   */
  async getUserStats() {
    const allUsers = await this.getUsers({ pageSize: 1000 }); // Get large page for stats
    
    if (!allUsers || !allUsers.items) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        locked: 0,
        byRole: {},
        byDepartment: {}
      };
    }

    const stats = {
      total: allUsers.totalCount || allUsers.items.length,
      active: 0,
      inactive: 0,
      locked: 0,
      byRole: {},
      byDepartment: {}
    };

    allUsers.items.forEach(user => {
      // Status counts
      if (user.isActive) {
        stats.active++;
      } else {
        stats.inactive++;
      }
      
      if (user.isLockedOut) {
        stats.locked++;
      }

      // Role counts
      if (user.role) {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      }

      // Department counts
      if (user.department) {
        stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1;
      }
    });

    return stats;
  },

  /**
   * Validate user data before submission
   */
  validateUserData(userData, isUpdate = false) {
    const errors = [];

    // Required fields for creation
    if (!isUpdate) {
      if (!userData.firstName?.trim()) {
        errors.push('First name is required');
      }
      if (!userData.lastName?.trim()) {
        errors.push('Last name is required');
      }
      if (!userData.email?.trim()) {
        errors.push('Email is required');
      }
      if (!userData.role?.trim()) {
        errors.push('Role is required');
      }
    }

    // Email validation
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    // Phone number validation (if provided)
    if (userData.phoneNumber) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(userData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
        errors.push('Please enter a valid phone number');
      }
    }

    // Name length validation
    if (userData.firstName && userData.firstName.length > 50) {
      errors.push('First name cannot exceed 50 characters');
    }
    if (userData.lastName && userData.lastName.length > 50) {
      errors.push('Last name cannot exceed 50 characters');
    }

    // Department and job title length
    if (userData.department && userData.department.length > 100) {
      errors.push('Department cannot exceed 100 characters');
    }
    if (userData.jobTitle && userData.jobTitle.length > 100) {
      errors.push('Job title cannot exceed 100 characters');
    }

    // Employee ID length
    if (userData.employeeId && userData.employeeId.length > 50) {
      errors.push('Employee ID cannot exceed 50 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default userService;