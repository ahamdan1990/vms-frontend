import apiClient, { extractApiData } from './apiClient';
import { COMPANY_ENDPOINTS, buildQueryString, DEFAULT_PAGINATION } from './apiEndpoints';

/**
 * Company management service matching the backend API endpoints exactly
 * Handles company CRUD operations with search and verification functionality
 * Requires appropriate role-based permissions for administrative operations
 */
const companyService = {
  /**
   * Gets all companies with pagination and optional filtering
   * GET /api/companies
   * @param {Object} params - Query parameters
   * @param {number} params.pageNumber - Page number (1-based), default: 1
   * @param {number} params.pageSize - Page size, default: 10
   * @param {string} params.searchTerm - Optional search term for filtering
   * @param {boolean} params.isVerified - Optional filter for verified companies
   * @param {string} params.sortBy - Sort field (Name, Code, CreatedOn, VisitorCount), default: Name
   * @param {string} params.sortDirection - Sort direction (asc, desc), default: asc
   * @returns {Promise} Companies list with pagination metadata
   */
  async getCompanies(params = {}) {
    const queryParams = {
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || DEFAULT_PAGINATION.pageSize,
      searchTerm: params.searchTerm || undefined,
      isVerified: params.isVerified !== undefined ? params.isVerified : undefined,
      sortBy: params.sortBy || 'Name',
      sortDirection: params.sortDirection || 'asc'
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${COMPANY_ENDPOINTS.BASE}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets a specific company by ID
   * GET /api/companies/{id}
   * @param {number} id - Company ID
   * @returns {Promise} Company details
   */
  async getCompanyById(id) {
    const response = await apiClient.get(COMPANY_ENDPOINTS.BY_ID(id));
    return extractApiData(response);
  },

  /**
   * Searches for companies across specified fields
   * GET /api/companies/search
   * @param {string} searchTerm - Search term to find companies
   * @param {string} searchField - Field to search (Name, Code, Industry, ContactPersonName, All), default: All
   * @param {number} maxResults - Maximum results to return, default: 20
   * @returns {Promise} Array of matching companies
   */
  async searchCompanies(searchTerm, searchField = 'All', maxResults = 20) {
    const queryParams = {
      searchTerm,
      searchField,
      maxResults
    };

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${COMPANY_ENDPOINTS.SEARCH}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Creates a new company
   * POST /api/companies
   * Requires: Administrator role
   * @param {Object} companyData - Company creation data
   * @returns {Promise} Created company with ID
   */
  async createCompany(companyData) {
    const response = await apiClient.post(COMPANY_ENDPOINTS.BASE, companyData);
    return extractApiData(response);
  },

  /**
   * Updates an existing company
   * PUT /api/companies/{id}
   * Requires: Administrator role
   * @param {number} id - Company ID
   * @param {Object} companyData - Updated company data
   * @returns {Promise} Updated company details
   */
  async updateCompany(id, companyData) {
    const response = await apiClient.put(COMPANY_ENDPOINTS.BY_ID(id), companyData);
    return extractApiData(response);
  },

  /**
   * Deletes a company (soft delete)
   * DELETE /api/companies/{id}
   * Requires: Administrator role
   * @param {number} id - Company ID
   * @param {string} reason - Optional deletion reason
   * @returns {Promise} Deletion result
   */
  async deleteCompany(id, reason = null) {
    const queryParams = reason ? { reason } : {};
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.delete(`${COMPANY_ENDPOINTS.BY_ID(id)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Verifies a company (marks as verified)
   * PUT /api/companies/{id}/verify
   * Requires: Administrator role
   * @param {number} id - Company ID
   * @returns {Promise} Updated company with verified status
   */
  async verifyCompany(id) {
    const response = await apiClient.put(COMPANY_ENDPOINTS.VERIFY(id), {});
    return extractApiData(response);
  },

  /**
   * Blacklists a company
   * PUT /api/companies/{id}/blacklist
   * Requires: Administrator role
   * @param {number} id - Company ID
   * @param {string} reason - Blacklist reason
   * @returns {Promise} Updated company with blacklist status
   */
  async blacklistCompany(id, reason = null) {
    const data = reason ? { reason } : {};
    const response = await apiClient.put(COMPANY_ENDPOINTS.BLACKLIST(id), data);
    return extractApiData(response);
  },

  /**
   * Gets verified companies only
   * Convenience method for filtering verified companies
   * @returns {Promise} List of verified companies
   */
  async getVerifiedCompanies() {
    return this.getCompanies({ isVerified: true });
  },

  /**
   * Gets active companies
   * Convenience method for filtering active companies
   * @returns {Promise} List of active companies
   */
  async getActiveCompanies() {
    return this.getCompanies({ sortBy: 'Name', sortDirection: 'asc' });
  }
};

export default companyService;
