import apiClient, { extractApiData } from './apiClient';
import { VISITOR_DOCUMENT_ENDPOINTS, API_CONFIG, buildQueryString } from './apiEndpoints';

/**
 * Visitor Document management service matching the backend API endpoints exactly
 * Handles visitor document CRUD operations, file uploads, and downloads
 * Requires VisitorDocument.* permissions as defined in the backend
 */
const visitorDocumentService = {
  /**
   * Gets all documents for a visitor
   * GET /api/visitors/{visitorId}/documents
   * Requires: VisitorDocument.Read permission
   */
  async getVisitorDocuments(visitorId, documentType = null, includeDeleted = false) {
    const queryParams = { documentType, includeDeleted };
    
    // Remove null/undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === null || queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${VISITOR_DOCUMENT_ENDPOINTS.BASE(visitorId)}${queryString}`);
    console.log(response)
    return extractApiData(response);
  },

  /**
   * Gets document by ID
   * GET /api/visitors/{visitorId}/documents/{id}
   * Requires: VisitorDocument.Read permission
   */
  async getVisitorDocumentById(visitorId, documentId, includeDeleted = false) {
    const queryParams = { includeDeleted };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${VISITOR_DOCUMENT_ENDPOINTS.BY_ID(visitorId, documentId)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Creates a new visitor document
   * POST /api/visitors/{visitorId}/documents
   * Requires: VisitorDocument.Create permission
   */
  async createVisitorDocument(visitorId, documentData) {
    const response = await apiClient.post(VISITOR_DOCUMENT_ENDPOINTS.BASE(visitorId), documentData);
    return extractApiData(response);
  },

  /**
   * Updates an existing visitor document
   * PUT /api/visitors/{visitorId}/documents/{id}
   * Requires: VisitorDocument.Update permission
   */
  async updateVisitorDocument(visitorId, documentId, documentData) {
    const response = await apiClient.put(VISITOR_DOCUMENT_ENDPOINTS.BY_ID(visitorId, documentId), documentData);
    return extractApiData(response);
  },

  /**
   * Deletes a visitor document (soft delete by default)
   * DELETE /api/visitors/{visitorId}/documents/{id}
   * Requires: VisitorDocument.Delete permission
   */
  async deleteVisitorDocument(visitorId, documentId, permanentDelete = false) {
    const queryParams = { permanentDelete };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.delete(`${VISITOR_DOCUMENT_ENDPOINTS.BY_ID(visitorId, documentId)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Uploads a visitor document file
   * POST /api/visitors/{visitorId}/documents/upload
   * Requires: VisitorDocument.Create permission
   */
  async uploadVisitorDocument(visitorId, file, title, documentType, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('documentType', documentType);
    
    // Optional parameters
    if (options.description) formData.append('description', options.description);
    if (options.isSensitive !== undefined) formData.append('isSensitive', options.isSensitive);
    if (options.isRequired !== undefined) formData.append('isRequired', options.isRequired);
    if (options.expiryDate) formData.append('expiryDate', options.expiryDate.toISOString());
    if (options.tags) formData.append('tags', options.tags);

    const response = await apiClient.post(VISITOR_DOCUMENT_ENDPOINTS.UPLOAD(visitorId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return extractApiData(response);
  },

  /**
   * Previews a visitor document (inline display)
   * GET /api/visitors/{visitorId}/documents/{id}/preview
   * Requires: VisitorDocument.Read permission
   */
  async previewVisitorDocument(visitorId, documentId) {
    const response = await apiClient.get(VISITOR_DOCUMENT_ENDPOINTS.PREVIEW(visitorId, documentId), {
      responseType: 'blob',
    });
    return response.data; // Return blob directly
  },

  /**
   * Gets preview URL for a visitor document
   * Returns the full URL for embedding in iframe or img tags
   * Note: This URL requires authentication (cookies)
   */
  getPreviewUrl(visitorId, documentId) {
    return `${API_CONFIG.BASE_URL}${VISITOR_DOCUMENT_ENDPOINTS.PREVIEW(visitorId, documentId)}`;
  },

  /**
   * Downloads a visitor document
   * GET /api/visitors/{visitorId}/documents/{id}/download
   * Requires: VisitorDocument.Download permission
   */
  async downloadVisitorDocument(visitorId, documentId) {
    const response = await apiClient.get(VISITOR_DOCUMENT_ENDPOINTS.DOWNLOAD(visitorId, documentId), {
      responseType: 'blob',
    });
    return response.data; // Return blob directly
  },

  /**
   * Gets download URL for a visitor document
   * Returns the full URL for direct download links
   */
  getDownloadUrl(visitorId, documentId) {
    return `${API_CONFIG.BASE_URL}${VISITOR_DOCUMENT_ENDPOINTS.DOWNLOAD(visitorId, documentId)}`;
  },

  /**
   * Gets upload information and restrictions
   * GET /api/visitors/{visitorId}/documents/upload-info
   * Requires: VisitorDocument.Read permission
   */
  async getUploadInfo(visitorId) {
    const response = await apiClient.get(VISITOR_DOCUMENT_ENDPOINTS.UPLOAD_INFO(visitorId));
    return extractApiData(response);
  },

  // Convenience methods

  /**
   * Gets documents by type
   * Convenience method for filtering documents by type
   */
  async getDocumentsByType(visitorId, documentType) {
    return this.getVisitorDocuments(visitorId, documentType, false);
  },

  /**
   * Gets sensitive documents
   * Convenience method for filtering sensitive documents
   */
  async getSensitiveDocuments(visitorId) {
    const allDocuments = await this.getVisitorDocuments(visitorId);
    return allDocuments.filter(doc => doc.isSensitive);
  },

  /**
   * Gets required documents
   * Convenience method for filtering required documents
   */
  async getRequiredDocuments(visitorId) {
    const allDocuments = await this.getVisitorDocuments(visitorId);
    return allDocuments.filter(doc => doc.isRequired);
  },

  /**
   * Gets expired documents
   * Convenience method for filtering expired documents
   */
  async getExpiredDocuments(visitorId) {
    const allDocuments = await this.getVisitorDocuments(visitorId);
    const now = new Date();
    return allDocuments.filter(doc => doc.expiryDate && new Date(doc.expiryDate) < now);
  },

  /**
   * Gets photo documents
   * Convenience method for getting visitor photos
   */
  async getVisitorPhotos(visitorId) {
    return this.getDocumentsByType(visitorId, 'Photo');
  },

  /**
   * Uploads visitor photo
   * Convenience method for photo uploads
   */
  async uploadVisitorPhoto(visitorId, photoFile, options = {}) {
    return this.uploadVisitorDocument(visitorId, photoFile, 'Visitor Photo', 'Photo', {
      description: 'Visitor profile photo',
      ...options
    });
  },

  /**
   * Bulk document upload
   * Uploads multiple documents for a visitor
   */
  async uploadMultipleDocuments(visitorId, documentsData) {
    const uploadPromises = documentsData.map(({ file, title, documentType, options }) =>
      this.uploadVisitorDocument(visitorId, file, title, documentType, options)
    );
    
    try {
      const results = await Promise.allSettled(uploadPromises);
      return {
        successful: results.filter(r => r.status === 'fulfilled').map(r => r.value),
        failed: results.filter(r => r.status === 'rejected').map(r => r.reason)
      };
    } catch (error) {
      throw new Error(`Bulk upload failed: ${error.message}`);
    }
  }
};

export default visitorDocumentService;
