// src/services/permissionService.js
import apiClient, { extractApiData } from './apiClient';
import { PERMISSION_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * Permission service for managing system permissions
 * All endpoints require appropriate permissions as defined in the backend
 */
const permissionService = {
  /**
   * Gets all permissions with optional filtering
   * GET /api/permissions
   * Requires: Permission.ReadAll permission
   *
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {boolean} params.isActive - Filter by active status
   * @param {string} params.searchTerm - Search term for filtering
   * @returns {Promise<Array>} List of permissions
   */
  async getPermissions(params = {}) {
    const queryParams = {
      category: params.category || undefined,
      isActive: params.isActive !== undefined ? params.isActive : undefined,
      searchTerm: params.searchTerm || undefined
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${PERMISSION_ENDPOINTS.BASE}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets permissions grouped by category
   * GET /api/permissions/categories
   * Requires: Permission.ReadAll permission
   *
   * @returns {Promise<Array>} List of permission categories with their permissions
   */
  async getPermissionsByCategory() {
    const response = await apiClient.get(PERMISSION_ENDPOINTS.CATEGORIES);
    return extractApiData(response);
  },

  /**
   * Searches permissions by search term
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Filtered list of permissions
   */
  async searchPermissions(searchTerm) {
    return this.getPermissions({ searchTerm });
  },

  /**
   * Gets permissions for a specific category
   * @param {string} category - Category name
   * @returns {Promise<Array>} List of permissions in the category
   */
  async getPermissionsBySpecificCategory(category) {
    return this.getPermissions({ category });
  },

  /**
   * Gets all active permissions
   * @returns {Promise<Array>} List of active permissions
   */
  async getActivePermissions() {
    return this.getPermissions({ isActive: true });
  }
};

export default permissionService;
