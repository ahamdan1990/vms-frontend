import apiClient, { extractApiData } from './apiClient';
import { VISIT_PURPOSE_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * Visit Purpose management service matching the backend API endpoints exactly
 * Handles visit purpose CRUD operations for invitation workflows
 * Requires SystemConfig.* permissions as defined in the backend
 */
const visitPurposeService = {
  /**
   * Gets all visit purposes with optional filtering
   * GET /api/visit-purposes
   * Requires: SystemConfig.Read permission
   */
  async getVisitPurposes(params = {}) {
    const queryParams = {
      requiresApproval: params.requiresApproval || undefined,
      includeInactive: params.includeInactive || false
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${VISIT_PURPOSE_ENDPOINTS.BASE}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets visit purpose by ID
   * GET /api/visit-purposes/{id}
   * Requires: SystemConfig.Read permission
   */
  async getVisitPurposeById(id) {
    const response = await apiClient.get(VISIT_PURPOSE_ENDPOINTS.BY_ID(id));
    return extractApiData(response);
  },

  /**
   * Creates a new visit purpose
   * POST /api/visit-purposes
   * Requires: SystemConfig.Create permission
   */
  async createVisitPurpose(visitPurposeData) {
    const response = await apiClient.post(VISIT_PURPOSE_ENDPOINTS.BASE, visitPurposeData);
    return extractApiData(response);
  },

  /**
   * Updates an existing visit purpose
   * PUT /api/visit-purposes/{id}
   * Requires: SystemConfig.Update permission
   */
  async updateVisitPurpose(id, visitPurposeData) {
    const response = await apiClient.put(VISIT_PURPOSE_ENDPOINTS.BY_ID(id), visitPurposeData);
    return extractApiData(response);
  },

  /**
   * Deletes a visit purpose (soft delete by default)
   * DELETE /api/visit-purposes/{id}
   * Requires: SystemConfig.Delete permission
   */
  async deleteVisitPurpose(id, hardDelete = false) {
    const queryParams = { hardDelete };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.delete(`${VISIT_PURPOSE_ENDPOINTS.BY_ID(id)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets active visit purposes for dropdown/selection components
   * Convenience method that filters for active purposes only
   */
  async getActiveVisitPurposes() {
    return this.getVisitPurposes({ includeInactive: false });
  },

  /**
   * Gets visit purposes that require approval
   * Convenience method for approval workflow components
   */
  async getApprovalRequiredPurposes() {
    return this.getVisitPurposes({ requiresApproval: true, includeInactive: false });
  }
};

export default visitPurposeService;