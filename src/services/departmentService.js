import apiClient, { extractApiData } from './apiClient';
import { DEPARTMENT_ENDPOINTS, buildQueryString, DEFAULT_PAGINATION } from './apiEndpoints';

/**
 * Department management service matching the backend API endpoints exactly
 * Handles department CRUD operations with hierarchical structure support
 * Requires appropriate role-based permissions for administrative operations
 */
const departmentService = {
  /**
   * Gets all departments with pagination and optional hierarchical filtering
   * GET /api/departments
   * @param {Object} params - Query parameters
   * @param {number} params.pageNumber - Page number (1-based), default: 1
   * @param {number} params.pageSize - Page size, default: 10
   * @param {number} params.parentDepartmentId - Optional parent department ID filter
   * @param {string} params.searchTerm - Optional search term for filtering
   * @param {string} params.sortBy - Sort field (Name, Code, CreatedOn, DisplayOrder), default: DisplayOrder
   * @param {string} params.sortDirection - Sort direction (asc, desc), default: asc
   * @returns {Promise} Departments list with pagination metadata
   */
  async getDepartments(params = {}) {
    const queryParams = {
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || DEFAULT_PAGINATION.pageSize,
      parentDepartmentId: params.parentDepartmentId || undefined,
      searchTerm: params.searchTerm || undefined,
      sortBy: params.sortBy || 'DisplayOrder',
      sortDirection: params.sortDirection || 'asc'
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${DEPARTMENT_ENDPOINTS.BASE}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets a specific department by ID
   * GET /api/departments/{id}
   * @param {number} id - Department ID
   * @param {boolean} includeChildren - Whether to include child departments, default: false
   * @returns {Promise} Department details with optional child departments
   */
  async getDepartmentById(id, includeChildren = false) {
    const queryParams = { includeChildren };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${DEPARTMENT_ENDPOINTS.BY_ID(id)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets child departments of a specific parent
   * GET /api/departments/{id}/children
   * @param {number} parentId - Parent department ID
   * @returns {Promise} List of child departments
   */
  async getDepartmentChildren(parentId) {
    const response = await apiClient.get(DEPARTMENT_ENDPOINTS.CHILDREN(parentId));
    return extractApiData(response);
  },

  /**
   * Gets all departments under a specific parent department
   * GET /api/departments/parent/{parentId}
   * @param {number} parentId - Parent department ID
   * @returns {Promise} List of departments with specified parent
   */
  async getDepartmentsByParent(parentId) {
    const response = await apiClient.get(DEPARTMENT_ENDPOINTS.BY_PARENT(parentId));
    return extractApiData(response);
  },

  /**
   * Gets complete department hierarchy
   * GET /api/departments/hierarchy
   * @returns {Promise} Complete hierarchical structure of all departments
   */
  async getDepartmentHierarchy() {
    const response = await apiClient.get(DEPARTMENT_ENDPOINTS.HIERARCHY);
    return extractApiData(response);
  },

  /**
   * Creates a new department
   * POST /api/departments
   * Requires: Administrator role
   * @param {Object} departmentData - Department creation data
   * @returns {Promise} Created department with ID
   */
  async createDepartment(departmentData) {
    const response = await apiClient.post(DEPARTMENT_ENDPOINTS.BASE, departmentData);
    return extractApiData(response);
  },

  /**
   * Updates an existing department
   * PUT /api/departments/{id}
   * Requires: Administrator role
   * @param {number} id - Department ID
   * @param {Object} departmentData - Updated department data
   * @returns {Promise} Updated department details
   */
  async updateDepartment(id, departmentData) {
    const response = await apiClient.put(DEPARTMENT_ENDPOINTS.BY_ID(id), departmentData);
    return extractApiData(response);
  },

  /**
   * Deletes a department (soft delete)
   * DELETE /api/departments/{id}
   * Requires: Administrator role
   * @param {number} id - Department ID
   * @param {string} reason - Optional deletion reason
   * @returns {Promise} Deletion result
   */
  async deleteDepartment(id, reason = null) {
    const queryParams = reason ? { reason } : {};
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.delete(`${DEPARTMENT_ENDPOINTS.BY_ID(id)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets top-level departments (no parent)
   * Convenience method for hierarchy building
   * @returns {Promise} List of top-level departments
   */
  async getRootDepartments() {
    return this.getDepartments({ parentDepartmentId: null });
  },

  /**
   * Gets department tree starting from a specific department
   * Includes all children in nested structure
   * @param {number} rootId - Root department ID, if null returns all root departments
   * @returns {Promise} Department hierarchy tree
   */
  async getDepartmentTree(rootId = null) {
    if (rootId) {
      return this.getDepartmentById(rootId, true);
    }
    return this.getDepartmentHierarchy();
  }
};

export default departmentService;
