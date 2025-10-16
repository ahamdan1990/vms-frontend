import apiClient from './apiClient';
import { API_ENDPOINTS } from './apiEndpoints';

/**
 * Camera service for API operations
 * Handles all camera-related HTTP requests with proper error handling and data formatting
 */
class CameraService {
  /**
   * Get paginated list of cameras with optional filters
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} API response with camera list
   */
  async getCameras(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Pagination
    if (params.pageIndex !== undefined) queryParams.append('pageIndex', params.pageIndex);
    if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize);
    
    // Search and filters
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.cameraType) queryParams.append('cameraType', params.cameraType);
    if (params.status) queryParams.append('status', params.status);
    if (params.locationId) queryParams.append('locationId', params.locationId);
    if (params.isActive !== null && params.isActive !== undefined) {
      queryParams.append('isActive', params.isActive);
    }
    if (params.enableFacialRecognition !== null && params.enableFacialRecognition !== undefined) {
      queryParams.append('enableFacialRecognition', params.enableFacialRecognition);
    }
    if (params.minPriority) queryParams.append('minPriority', params.minPriority);
    if (params.maxPriority) queryParams.append('maxPriority', params.maxPriority);
    if (params.includeDeleted) queryParams.append('includeDeleted', params.includeDeleted);
    
    // Sorting
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    
    const url = `${API_ENDPOINTS.CAMERAS.LIST}?${queryParams.toString()}`;
    return await apiClient.get(url);
  }

  /**
   * Get single camera by ID
   * @param {number} id - Camera ID
   * @param {Object} options - Additional options
   * @returns {Promise} API response with camera data
   */
  async getCameraById(id, options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.includeDeleted) queryParams.append('includeDeleted', options.includeDeleted);
    if (options.includeSensitiveData) queryParams.append('includeSensitiveData', options.includeSensitiveData);
    
    const url = queryParams.toString() 
      ? `${API_ENDPOINTS.CAMERAS.BY_ID(id)}?${queryParams.toString()}`
      : API_ENDPOINTS.CAMERAS.BY_ID(id);
      
    return await apiClient.get(url);
  }

  /**
   * Create new camera
   * @param {Object} cameraData - Camera creation data
   * @returns {Promise} API response with created camera
   */
  async createCamera(cameraData) {
    return await apiClient.post(API_ENDPOINTS.CAMERAS.CREATE, cameraData);
  }

  /**
   * Update existing camera
   * @param {number} id - Camera ID
   * @param {Object} cameraData - Camera update data
   * @param {Object} options - Update options
   * @returns {Promise} API response with updated camera
   */
  async updateCamera(id, cameraData, options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.testConnection) queryParams.append('testConnection', options.testConnection);
    
    const url = queryParams.toString()
      ? `${API_ENDPOINTS.CAMERAS.UPDATE(id)}?${queryParams.toString()}`
      : API_ENDPOINTS.CAMERAS.UPDATE(id);
      
    return await apiClient.put(url, cameraData);
  }

  /**
   * Delete camera (soft or permanent)
   * @param {number} id - Camera ID
   * @param {Object} options - Delete options
   * @returns {Promise} API response
   */
  async deleteCamera(id, options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.permanentDelete) queryParams.append('permanentDelete', options.permanentDelete);
    if (options.forceDelete) queryParams.append('forceDelete', options.forceDelete);
    if (options.deletionReason) queryParams.append('deletionReason', options.deletionReason);
    
    const url = queryParams.toString()
      ? `${API_ENDPOINTS.CAMERAS.DELETE(id)}?${queryParams.toString()}`
      : API_ENDPOINTS.CAMERAS.DELETE(id);
      
    return await apiClient.delete(url);
  }

  /**
   * Search cameras with advanced criteria
   * @param {Object} searchCriteria - Advanced search parameters
   * @returns {Promise} API response with search results
   */
  async searchCameras(searchCriteria) {
    return await apiClient.post(API_ENDPOINTS.CAMERAS.SEARCH, searchCriteria);
  }

  /**
   * Test camera connection
   * @param {number} id - Camera ID
   * @param {Object} options - Test options
   * @returns {Promise} API response with test results
   */
  async testConnection(id, options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.updateStatus !== undefined) queryParams.append('updateStatus', options.updateStatus);
    
    const url = queryParams.toString()
      ? `${API_ENDPOINTS.CAMERAS.TEST_CONNECTION(id)}?${queryParams.toString()}`
      : API_ENDPOINTS.CAMERAS.TEST_CONNECTION(id);
      
    return await apiClient.post(url);
  }

  /**
   * Test connection with provided parameters
   * @param {Object} connectionParams - Connection test parameters
   * @returns {Promise} API response with test results
   */
  async testConnectionParameters(connectionParams) {
    return await apiClient.post(API_ENDPOINTS.CAMERAS.TEST_CONNECTION_PARAMS, connectionParams);
  }

  /**
   * Start camera stream
   * @param {number} id - Camera ID
   * @returns {Promise} API response
   */
  async startStream(id) {
    return await apiClient.post(API_ENDPOINTS.CAMERAS.START_STREAM(id));
  }

  /**
   * Stop camera stream
   * @param {number} id - Camera ID
   * @param {Object} options - Stop options
   * @returns {Promise} API response
   */
  async stopStream(id, options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.graceful !== undefined) queryParams.append('graceful', options.graceful);
    
    const url = queryParams.toString()
      ? `${API_ENDPOINTS.CAMERAS.STOP_STREAM(id)}?${queryParams.toString()}`
      : API_ENDPOINTS.CAMERAS.STOP_STREAM(id);
      
    return await apiClient.post(url);
  }

  /**
   * Get camera stream information
   * @param {number} id - Camera ID
   * @returns {Promise} API response with stream info
   */
  async getStreamInfo(id) {
    return await apiClient.get(API_ENDPOINTS.CAMERAS.STREAM_INFO(id));
  }

  /**
   * Perform health check on camera
   * @param {number} id - Camera ID
   * @returns {Promise} API response with health check results
   */
  async performHealthCheck(id) {
    return await apiClient.post(API_ENDPOINTS.CAMERAS.HEALTH_CHECK(id));
  }

  /**
   * Perform health check on all cameras
   * @returns {Promise} API response with all health check results
   */
  async performHealthCheckAll() {
    return await apiClient.post(API_ENDPOINTS.CAMERAS.HEALTH_CHECK_ALL);
  }

  /**
   * Capture frame from camera
   * @param {number} id - Camera ID
   * @returns {Promise} API response with capture result
   */
  async captureFrame(id) {
    return await apiClient.post(API_ENDPOINTS.CAMERAS.CAPTURE_FRAME(id));
  }

  /**
   * Get camera statistics
   * @param {Object} params - Statistics parameters
   * @returns {Promise} API response with statistics
   */
  async getCameraStatistics(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.includeInactive) queryParams.append('includeInactive', params.includeInactive);
    if (params.includeDeleted) queryParams.append('includeDeleted', params.includeDeleted);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);
    
    const url = queryParams.toString()
      ? `${API_ENDPOINTS.CAMERAS.STATISTICS}?${queryParams.toString()}`
      : API_ENDPOINTS.CAMERAS.STATISTICS;
      
    return await apiClient.get(url);
  }

  /**
   * Get cameras by location
   * @param {number} locationId - Location ID
   * @param {Object} options - Query options
   * @returns {Promise} API response with cameras
   */
  async getCamerasByLocation(locationId, options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.includeInactive) queryParams.append('includeInactive', options.includeInactive);
    if (options.includeDeleted) queryParams.append('includeDeleted', options.includeDeleted);
    
    const url = queryParams.toString()
      ? `${API_ENDPOINTS.CAMERAS.BY_LOCATION(locationId)}?${queryParams.toString()}`
      : API_ENDPOINTS.CAMERAS.BY_LOCATION(locationId);
      
    return await apiClient.get(url);
  }

  /**
   * Get cameras by type
   * @param {string} cameraType - Camera type
   * @param {Object} options - Query options
   * @returns {Promise} API response with cameras
   */
  async getCamerasByType(cameraType, options = {}) {
    const queryParams = new URLSearchParams();
    
    queryParams.append('cameraType', cameraType);
    if (options.includeInactive) queryParams.append('includeInactive', options.includeInactive);
    if (options.includeDeleted) queryParams.append('includeDeleted', options.includeDeleted);
    
    return await apiClient.get(`${API_ENDPOINTS.CAMERAS.LIST}?${queryParams.toString()}`);
  }

  /**
   * Get operational cameras (active and healthy)
   * @param {Object} options - Query options
   * @returns {Promise} API response with operational cameras
   */
  async getOperationalCameras(options = {}) {
    const queryParams = new URLSearchParams();
    
    queryParams.append('isActive', 'true');
    queryParams.append('status', 'Active');
    if (options.facialRecognitionOnly) {
      queryParams.append('enableFacialRecognition', 'true');
    }
    
    return await apiClient.get(`${API_ENDPOINTS.CAMERAS.LIST}?${queryParams.toString()}`);
  }

  /**
   * Bulk operations on cameras
   * @param {string} operation - Operation type (delete, activate, deactivate, etc.)
   * @param {Array} cameraIds - Array of camera IDs
   * @param {Object} options - Operation options
   * @returns {Promise} API response
   */
  async bulkOperation(operation, cameraIds, options = {}) {
    const data = {
      operation,
      cameraIds,
      ...options
    };
    
    return await apiClient.post(API_ENDPOINTS.CAMERAS.BULK_OPERATIONS, data);
  }

  /**
   * Export cameras data
   * @param {Object} params - Export parameters
   * @returns {Promise} API response with export data
   */
  async exportCameras(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.format) queryParams.append('format', params.format);
    if (params.includeInactive) queryParams.append('includeInactive', params.includeInactive);
    if (params.includeDeleted) queryParams.append('includeDeleted', params.includeDeleted);
    if (params.fields) queryParams.append('fields', params.fields.join(','));
    
    const url = queryParams.toString()
      ? `${API_ENDPOINTS.CAMERAS.EXPORT}?${queryParams.toString()}`
      : API_ENDPOINTS.CAMERAS.EXPORT;
      
    return await apiClient.get(url, { responseType: 'blob' });
  }

  /**
   * Import cameras from file
   * @param {FormData} formData - Form data containing import file
   * @returns {Promise} API response with import results
   */
  async importCameras(formData) {
    return await apiClient.post(API_ENDPOINTS.CAMERAS.IMPORT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Get camera types and their configurations
   * @returns {Promise} API response with camera type definitions
   */
  async getCameraTypes() {
    return await apiClient.get(API_ENDPOINTS.CAMERAS.TYPES);
  }

  /**
   * Validate camera configuration
   * @param {Object} configuration - Camera configuration to validate
   * @returns {Promise} API response with validation results
   */
  async validateConfiguration(configuration) {
    return await apiClient.post(API_ENDPOINTS.CAMERAS.VALIDATE_CONFIG, configuration);
  }
}

const cameraService = new CameraService();
export default cameraService;