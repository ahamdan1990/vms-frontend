import apiClient, { extractApiData } from './apiClient';
import { VISITOR_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * Visitor management service matching the backend API endpoints exactly
 * Handles visitor CRUD operations, VIP/blacklist management, and advanced search
 * Requires Visitor.* permissions as defined in the backend
 */
const visitorService = {
  /**
   * Gets paginated list of visitors with filtering and sorting
   * GET /api/Visitors
   * Requires: Visitor.Read permission
   */
  async getVisitors(params = {}) {
    const queryParams = {
      pageIndex: params.pageIndex || 0,
      pageSize: params.pageSize || 20,
      searchTerm: params.searchTerm || undefined,
      company: params.company || undefined,
      isVip: params.isVip || undefined,
      isBlacklisted: params.isBlacklisted || undefined,
      isActive: params.isActive !== undefined ? params.isActive : true,
      sortBy: params.sortBy || 'FullName',
      sortDirection: params.sortDirection || 'asc',
      includeDeleted: params.includeDeleted || false
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${VISITOR_ENDPOINTS.BASE}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets visitor by ID
   * GET /api/Visitors/{id}
   * Requires: Visitor.Read permission
   */
  async getVisitorById(id, includeDeleted = false) {
    const queryParams = { includeDeleted };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${VISITOR_ENDPOINTS.BY_ID(id)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Creates a new visitor
   * POST /api/Visitors
   * Requires: Visitor.Create permission
   */
  async createVisitor(visitorData) {
    const response = await apiClient.post(VISITOR_ENDPOINTS.BASE, visitorData);
    return extractApiData(response);
  },

  /**
   * Updates an existing visitor
   * PUT /api/Visitors/{id}
   * Requires: Visitor.Update permission
   */
  async updateVisitor(id, visitorData) {
    const response = await apiClient.put(VISITOR_ENDPOINTS.BY_ID(id), visitorData);
    return extractApiData(response);
  },

  /**
   * Deletes a visitor (soft delete by default)
   * DELETE /api/Visitors/{id}
   * Requires: Visitor.Delete permission
   */
  async deleteVisitor(id, permanentDelete = false) {
    const queryParams = { permanentDelete };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.delete(`${VISITOR_ENDPOINTS.BY_ID(id)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Advanced search for visitors
   * POST /api/Visitors/search
   * Requires: Visitor.Read permission
   */
  async searchVisitors(searchParams) {
    const response = await apiClient.post(VISITOR_ENDPOINTS.SEARCH, searchParams);
    return extractApiData(response);
  },

  /**
   * Blacklists a visitor
   * POST /api/Visitors/{id}/blacklist
   * Requires: Visitor.Blacklist permission
   */
  async blacklistVisitor(id, reason) {
    const response = await apiClient.post(VISITOR_ENDPOINTS.BLACKLIST(id), reason, {
      headers: { 'Content-Type': 'application/json' }
    });
    return extractApiData(response);
  },

  /**
   * Removes blacklist status from a visitor
   * DELETE /api/Visitors/{id}/blacklist
   * Requires: Visitor.RemoveBlacklist permission
   */
  async removeBlacklist(id) {
    const response = await apiClient.delete(VISITOR_ENDPOINTS.BLACKLIST(id));
    return extractApiData(response);
  },

  /**
   * Marks a visitor as VIP
   * POST /api/Visitors/{id}/vip
   * Requires: Visitor.MarkAsVip permission
   */
  async markAsVip(id) {
    const response = await apiClient.post(VISITOR_ENDPOINTS.MARK_VIP(id));
    return extractApiData(response);
  },

  /**
   * Removes VIP status from a visitor
   * DELETE /api/Visitors/{id}/vip
   * Requires: Visitor.RemoveVipStatus permission
   */
  async removeVipStatus(id) {
    const response = await apiClient.delete(VISITOR_ENDPOINTS.MARK_VIP(id));
    return extractApiData(response);
  },

  /**
   * Gets VIP visitors
   * GET /api/Visitors/vip
   * Requires: Visitor.Read permission
   */
  async getVipVisitors(includeDeleted = false) {
    const queryParams = { includeDeleted };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${VISITOR_ENDPOINTS.VIP}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets blacklisted visitors
   * GET /api/Visitors/blacklisted
   * Requires: Visitor.Read permission
   */
  async getBlacklistedVisitors(includeDeleted = false) {
    const queryParams = { includeDeleted };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${VISITOR_ENDPOINTS.BLACKLISTED}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets visitor statistics
   * GET /api/Visitors/statistics
   * Requires: Visitor.ViewStatistics permission
   */
  async getVisitorStatistics(includeDeleted = false) {
    const queryParams = { includeDeleted };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${VISITOR_ENDPOINTS.STATISTICS}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets visitor's documents
   * GET /api/Visitors/{id}/documents
   * Requires: VisitorDocument.Read permission
   */
  async getVisitorDocuments(id) {
    const response = await apiClient.get(VISITOR_ENDPOINTS.DOCUMENTS(id));
    return extractApiData(response);
  },

  /**
   * Gets visitor's notes
   * GET /api/Visitors/{id}/notes
   * Requires: VisitorNote.Read permission
   */
  async getVisitorNotes(id) {
    const response = await apiClient.get(VISITOR_ENDPOINTS.NOTES(id));
    return extractApiData(response);
  },

  /**
   * Gets visitor's emergency contacts
   * GET /api/Visitors/{id}/emergency-contacts
   * Requires: EmergencyContact.Read permission
   */
  async getEmergencyContacts(id) {
    const response = await apiClient.get(VISITOR_ENDPOINTS.EMERGENCY_CONTACTS(id));
    return extractApiData(response);
  },

  // Convenience methods
  
  /**
   * Gets active visitors only
   * Convenience method for dropdown/selection components
   */
  async getActiveVisitors(params = {}) {
    return this.getVisitors({ ...params, isActive: true, includeDeleted: false });
  },

  /**
   * Quick search visitors by name or company
   * Simplified search method for autocomplete
   */
  async quickSearchVisitors(searchTerm, limit = 10) {
    return this.getVisitors({
      searchTerm,
      pageSize: limit,
      pageIndex: 0,
      isActive: true
    });
  },

  /**
   * Gets visitors by company
   * Convenience method for company-based filtering
   */
  async getVisitorsByCompany(company, params = {}) {
    return this.getVisitors({ ...params, company });
  }
};

export default visitorService;