import apiClient, { extractApiData } from './apiClient';
import { LOCATION_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * Location management service matching the backend API endpoints exactly
 * Handles location CRUD operations with hierarchical structure support
 * Requires SystemConfig.* permissions as defined in the backend
 */
const locationService = {
  /**
   * Gets all locations with optional filtering
   * GET /api/locations
   * Requires: SystemConfig.Read permission
   */
  async getLocations(params = {}) {
    const queryParams = {
      locationType: params.locationType || undefined,
      rootOnly: params.rootOnly || false,
      includeChildren: params.includeChildren !== undefined ? params.includeChildren : true,
      includeInactive: params.includeInactive || false
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${LOCATION_ENDPOINTS.BASE}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets location by ID
   * GET /api/locations/{id}
   * Requires: SystemConfig.Read permission
   */
  async getLocationById(id, includeChildren = false) {
    const queryParams = { includeChildren };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${LOCATION_ENDPOINTS.BY_ID(id)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Creates a new location
   * POST /api/locations
   * Requires: SystemConfig.Update permission
   */
  async createLocation(locationData) {
    const response = await apiClient.post(LOCATION_ENDPOINTS.BASE, locationData);
    return extractApiData(response);
  },

  /**
   * Updates an existing location
   * PUT /api/locations/{id}
   * Requires: SystemConfig.Update permission
   */
  async updateLocation(id, locationData) {
    const response = await apiClient.put(LOCATION_ENDPOINTS.BY_ID(id), locationData);
    return extractApiData(response);
  },

  /**
   * Deletes a location (soft delete by default)
   * DELETE /api/locations/{id}
   * Requires: SystemConfig.Delete permission
   */
  async deleteLocation(id, hardDelete = false) {
    const queryParams = { hardDelete };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.delete(`${LOCATION_ENDPOINTS.BY_ID(id)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets root locations only (no parent)
   * Convenience method for hierarchy building
   */
  async getRootLocations() {
    return this.getLocations({ rootOnly: true, includeInactive: false });
  },

  /**
   * Gets active locations for dropdown/selection components
   * Convenience method that filters for active locations only
   */
  async getActiveLocations() {
    return this.getLocations({ includeInactive: false });
  },

  /**
   * Gets locations by type (Building, Floor, Room, etc.)
   * Convenience method for type-specific filtering
   */
  async getLocationsByType(locationType) {
    return this.getLocations({ locationType, includeInactive: false });
  },

  /**
   * Gets location hierarchy tree starting from a specific location
   * Includes all children in nested structure
   */
  async getLocationTree(rootId = null) {
    if (rootId) {
      return this.getLocationById(rootId, true);
    }
    return this.getLocations({ rootOnly: true, includeChildren: true });
  }
};

export default locationService;