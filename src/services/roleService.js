// src/services/roleService.js
import apiClient, { extractApiData } from './apiClient';
import { ROLE_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * Role service for managing system roles and their permissions
 * All endpoints require appropriate permissions as defined in the backend
 */
const roleService = {
  /**
   * Gets all roles with optional counts
   * GET /api/roles
   * Requires: Role.ReadAll permission
   *
   * @param {Object} params - Query parameters
   * @param {boolean} params.includeCounts - Include permission and user counts
   * @returns {Promise<Array>} List of roles
   */
  async getRoles(params = {}) {
    const queryParams = {
      includeCounts: params.includeCounts !== undefined ? params.includeCounts : true
    };

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${ROLE_ENDPOINTS.BASE}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets a specific role by ID with all its permissions
   * GET /api/roles/{id}
   * Requires: Role.ReadAll permission
   *
   * @param {number} id - Role ID
   * @returns {Promise<Object>} Role with permissions
   */
  async getRoleById(id) {
    const response = await apiClient.get(ROLE_ENDPOINTS.BY_ID(id));
    return extractApiData(response);
  },

  /**
   * Creates a new role
   * POST /api/roles
   * Requires: Role.Create permission
   *
   * @param {Object} roleData - Role creation data
   * @param {string} roleData.name - Role name (unique)
   * @param {string} roleData.displayName - Display name
   * @param {string} roleData.description - Role description
   * @param {number} roleData.hierarchyLevel - Hierarchy level (1-10)
   * @param {boolean} roleData.isActive - Active status
   * @param {number} roleData.displayOrder - Display order
   * @param {string} roleData.color - Color for UI display
   * @param {string} roleData.icon - Icon name for UI display
   * @param {Array<number>} roleData.permissionIds - List of permission IDs to assign
   * @returns {Promise<Object>} Created role
   */
  async createRole(roleData) {
    const response = await apiClient.post(ROLE_ENDPOINTS.BASE, roleData);
    return extractApiData(response);
  },

  /**
   * Updates an existing role
   * PUT /api/roles/{id}
   * Requires: Role.Update permission
   *
   * Note: System roles have limited editability (only display properties can be updated)
   *
   * @param {number} id - Role ID
   * @param {Object} roleData - Role update data
   * @param {string} roleData.displayName - Display name
   * @param {string} roleData.description - Role description
   * @param {boolean} roleData.isActive - Active status
   * @param {number} roleData.displayOrder - Display order
   * @param {string} roleData.color - Color for UI display
   * @param {string} roleData.icon - Icon name for UI display
   * @param {number} roleData.hierarchyLevel - Hierarchy level (only for custom roles)
   * @returns {Promise<Object>} Updated role
   */
  async updateRole(id, roleData) {
    const response = await apiClient.put(ROLE_ENDPOINTS.BY_ID(id), roleData);
    return extractApiData(response);
  },

  /**
   * Grants permissions to a role
   * POST /api/roles/{id}/permissions/grant
   * Requires: Role.ManagePermissions permission
   *
   * @param {number} roleId - Role ID
   * @param {Array<number>} permissionIds - List of permission IDs to grant
   * @param {string} reason - Reason for granting permissions (for audit)
   * @returns {Promise<number>} Number of permissions granted
   */
  async grantPermissions(roleId, permissionIds, reason = '') {
    const response = await apiClient.post(
      ROLE_ENDPOINTS.GRANT_PERMISSIONS(roleId),
      {
        permissionIds,
        reason
      }
    );
    return extractApiData(response);
  },

  /**
   * Revokes permissions from a role
   * POST /api/roles/{id}/permissions/revoke
   * Requires: Role.ManagePermissions permission
   *
   * @param {number} roleId - Role ID
   * @param {Array<number>} permissionIds - List of permission IDs to revoke
   * @param {string} reason - Reason for revoking permissions (for audit)
   * @returns {Promise<number>} Number of permissions revoked
   */
  async revokePermissions(roleId, permissionIds, reason = '') {
    const response = await apiClient.post(
      ROLE_ENDPOINTS.REVOKE_PERMISSIONS(roleId),
      {
        permissionIds,
        reason
      }
    );
    return extractApiData(response);
  },

  /**
   * Bulk updates role permissions (revokes all and grants new ones)
   * @param {number} roleId - Role ID
   * @param {Array<number>} permissionIds - List of permission IDs to set
   * @param {string} reason - Reason for the change
   * @returns {Promise<Object>} Result with granted and revoked counts
   */
  async updateRolePermissions(roleId, permissionIds, reason = 'Bulk permission update') {
    // First, get the current role with permissions
    const role = await this.getRoleById(roleId);
    const currentPermissionIds = role.permissions.map(p => p.id);

    // Determine which permissions to add and which to remove
    const permissionsToGrant = permissionIds.filter(id => !currentPermissionIds.includes(id));
    const permissionsToRevoke = currentPermissionIds.filter(id => !permissionIds.includes(id));

    const results = {
      granted: 0,
      revoked: 0
    };

    // Revoke permissions that should be removed
    if (permissionsToRevoke.length > 0) {
      results.revoked = await this.revokePermissions(roleId, permissionsToRevoke, reason);
    }

    // Grant new permissions
    if (permissionsToGrant.length > 0) {
      results.granted = await this.grantPermissions(roleId, permissionsToGrant, reason);
    }

    return results;
  },

  /**
   * Gets all non-system roles (custom roles only)
   * @returns {Promise<Array>} List of custom roles
   */
  async getCustomRoles() {
    const allRoles = await this.getRoles({ includeCounts: true });
    return allRoles.filter(role => !role.isSystemRole);
  },

  /**
   * Gets all system roles
   * @returns {Promise<Array>} List of system roles
   */
  async getSystemRoles() {
    const allRoles = await this.getRoles({ includeCounts: true });
    return allRoles.filter(role => role.isSystemRole);
  }
};

export default roleService;
