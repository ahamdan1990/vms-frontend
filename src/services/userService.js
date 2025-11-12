// src/services/userService.js
import apiClient, { extractApiData } from './apiClient';
import { USER_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * User management service that matches the backend API endpoints exactly
 * All endpoints require appropriate permissions as defined in the backend
 * Enhanced with phone number and address support
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
   * Search hosts across local staff users and the corporate directory.
   */
  async searchHosts(searchTerm, options = {}) {
    const queryString = buildQueryString({
      searchTerm,
      maxResults: options.limit || 10,
      includeDirectory: options.includeDirectory ?? true
    });

    const response = await apiClient.get(`${USER_ENDPOINTS.HOST_SEARCH}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Ensure a host exists by provisioning them from the directory when necessary.
   */
  async ensureHostFromDirectory(payload) {
    const response = await apiClient.post(USER_ENDPOINTS.ENSURE_HOST, {
      identifier: payload.identifier,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role
    });

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
   * Creates a new user with enhanced phone and address support
   * POST /api/Users
   * Requires: User.Create permission
   */
  async createUser(userData) {
    const response = await apiClient.post(USER_ENDPOINTS.BASE, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      
      // Enhanced phone fields
      phoneNumber: userData.phoneNumber || null,
      phoneCountryCode: userData.phoneCountryCode || null,
      phoneType: userData.phoneType || 'Mobile',
      
      role: userData.role,
      department: userData.department || null,
      jobTitle: userData.jobTitle || null,
      employeeId: userData.employeeId || null,
      
      // User preferences
      timeZone: userData.timeZone || 'UTC',
      language: userData.language || 'en-US',
      theme: userData.theme || 'light',
      
      // Enhanced address fields
      addressType: userData.addressType || 'Home',
      street1: userData.street1 || null,
      street2: userData.street2 || null,
      city: userData.city || null,
      state: userData.state || null,
      postalCode: userData.postalCode || null,
      country: userData.country || null,
      latitude: userData.latitude || null,
      longitude: userData.longitude || null,
      
      mustChangePassword: userData.mustChangePassword || false,
      sendWelcomeEmail: userData.sendWelcomeEmail || true
    });
    
    return extractApiData(response);
  },

  /**
   * Updates an existing user with enhanced phone and address support
   * PUT /api/Users/{id}
   * Requires: User.Update permission
   */
  async updateUser(id, userData) {
    const response = await apiClient.put(USER_ENDPOINTS.BY_ID(id), {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      
      // Enhanced phone fields
      phoneNumber: userData.phoneNumber || null,
      phoneCountryCode: userData.phoneCountryCode || null,
      phoneType: userData.phoneType || 'Mobile',
      
      role: userData.role,
      status: userData.status,
      department: userData.department || null,
      jobTitle: userData.jobTitle || null,
      employeeId: userData.employeeId || null,
      
      // User preferences
      timeZone: userData.timeZone || 'UTC',
      language: userData.language || 'en-US',
      theme: userData.theme || 'light',
      
      // Enhanced address fields
      addressType: userData.addressType || 'Home',
      street1: userData.street1 || null,
      street2: userData.street2 || null,
      city: userData.city || null,
      state: userData.state || null,
      postalCode: userData.postalCode || null,
      country: userData.country || null,
      latitude: userData.latitude || null,
      longitude: userData.longitude || null
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
      mustChangePassword: resetData.mustChangePassword ?? true,
      notifyUser: resetData.notifyUser ?? true,
      reason: resetData.reason
    });
    
    return extractApiData(response);
  },

  /**
   * Gets current user's profile
   * GET /api/Users/profile
   */
  async getCurrentUserProfile() {
    const response = await apiClient.get(USER_ENDPOINTS.PROFILE);
    console.log(response)
    return extractApiData(response);
  },

  /**
   * Updates current user's profile (self-service)
   * PUT /api/Users/profile
   */
  async updateCurrentUserProfile(profileData) {
    const response = await apiClient.put(USER_ENDPOINTS.PROFILE, {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber || null,
      phoneCountryCode: profileData.phoneCountryCode || null,
      phoneType: profileData.phoneType || 'Mobile',
      department: profileData.department || null,
      jobTitle: profileData.jobTitle || null,
      employeeId: profileData.employeeId || null,
      street1: profileData.street1 || null,
      street2: profileData.street2 || null,
      city: profileData.city || null,
      state: profileData.state || null,
      postalCode: profileData.postalCode || null,
      country: profileData.country || null,
      latitude: profileData.latitude || null,
      longitude: profileData.longitude || null
    });
    return extractApiData(response);
  },

  /**
   * Updates current user's preferences
   * PUT /api/Users/profile/preferences
   */
  async updateCurrentUserPreferences(preferences) {
    const response = await apiClient.put(USER_ENDPOINTS.PROFILE_PREFERENCES, {
      timeZone: preferences.timeZone || 'UTC',
      language: preferences.language || 'en-US',
      theme: preferences.theme || 'light'
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
   * Enhanced validation for user data including phone and address
   */
  validateUserData(userData, isUpdate = false) {
    const errors = {};

    // Required fields for creation
    if (!isUpdate) {
      if (!userData.firstName?.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!userData.lastName?.trim()) {
        errors.lastName = 'Last name is required';
      }
      if (!userData.email?.trim()) {
        errors.email = 'Email is required';
      }
      if (!userData.role?.trim()) {
        errors.role = 'Role is required';
      }
    }

    // Email validation
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Enhanced phone number validation
    if (userData.phoneNumber) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(userData.phoneNumber)) {
        errors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    // Address validation
    if (userData.street1 && userData.street1.length > 100) {
      errors.street1 = 'Street address cannot exceed 100 characters';
    }
    if (userData.street2 && userData.street2.length > 100) {
      errors.street2 = 'Street address line 2 cannot exceed 100 characters';
    }
    if (userData.city && userData.city.length > 50) {
      errors.city = 'City cannot exceed 50 characters';
    }
    if (userData.state && userData.state.length > 50) {
      errors.state = 'State cannot exceed 50 characters';
    }
    if (userData.postalCode && userData.postalCode.length > 20) {
      errors.postalCode = 'Postal code cannot exceed 20 characters';
    }
    if (userData.country && userData.country.length > 50) {
      errors.country = 'Country cannot exceed 50 characters';
    }

    // Coordinate validation
    if (userData.latitude !== null && userData.latitude !== undefined && userData.latitude !== '') {
      const lat = parseFloat(userData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = 'Latitude must be between -90 and 90 degrees';
      }
    }
    if (userData.longitude !== null && userData.longitude !== undefined && userData.longitude !== '') {
      const lng = parseFloat(userData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = 'Longitude must be between -180 and 180 degrees';
      }
    }

    // Name length validation
    if (userData.firstName && userData.firstName.length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters';
    }
    if (userData.lastName && userData.lastName.length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters';
    }

    // Department and job title length
    if (userData.department && userData.department.length > 100) {
      errors.department = 'Department cannot exceed 100 characters';
    }
    if (userData.jobTitle && userData.jobTitle.length > 100) {
      errors.jobTitle = 'Job title cannot exceed 100 characters';
    }

    // Employee ID length
    if (userData.employeeId && userData.employeeId.length > 50) {
      errors.employeeId = 'Employee ID cannot exceed 50 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default userService;
