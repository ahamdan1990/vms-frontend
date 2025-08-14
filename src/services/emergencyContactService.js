import apiClient, { extractApiData } from './apiClient';
import { EMERGENCY_CONTACT_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * Emergency Contact management service matching the backend API endpoints exactly
 * Handles emergency contact CRUD operations for visitor safety compliance
 * Requires EmergencyContact.* permissions as defined in the backend
 */
const emergencyContactService = {
  /**
   * Gets all emergency contacts for a visitor
   * GET /api/visitors/{visitorId}/emergency-contacts
   * Requires: EmergencyContact.Read permission
   */
  async getEmergencyContacts(visitorId, includeDeleted = false) {
    const queryParams = { includeDeleted };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${EMERGENCY_CONTACT_ENDPOINTS.BASE(visitorId)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets emergency contact by ID
   * GET /api/visitors/{visitorId}/emergency-contacts/{id}
   * Requires: EmergencyContact.Read permission
   */
  async getEmergencyContactById(visitorId, contactId, includeDeleted = false) {
    const queryParams = { includeDeleted };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${EMERGENCY_CONTACT_ENDPOINTS.BY_ID(visitorId, contactId)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Creates a new emergency contact
   * POST /api/visitors/{visitorId}/emergency-contacts
   * Requires: EmergencyContact.Create permission
   */
  async createEmergencyContact(visitorId, contactData) {
    const response = await apiClient.post(EMERGENCY_CONTACT_ENDPOINTS.BASE(visitorId), contactData);
    return extractApiData(response);
  },

  /**
   * Updates an existing emergency contact
   * PUT /api/visitors/{visitorId}/emergency-contacts/{id}
   * Requires: EmergencyContact.Update permission
   */
  async updateEmergencyContact(visitorId, contactId, contactData) {
    const response = await apiClient.put(EMERGENCY_CONTACT_ENDPOINTS.BY_ID(visitorId, contactId), contactData);
    return extractApiData(response);
  },

  /**
   * Deletes an emergency contact (soft delete by default)
   * DELETE /api/visitors/{visitorId}/emergency-contacts/{id}
   * Requires: EmergencyContact.Delete permission
   */
  async deleteEmergencyContact(visitorId, contactId, permanentDelete = false) {
    const queryParams = { permanentDelete };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.delete(`${EMERGENCY_CONTACT_ENDPOINTS.BY_ID(visitorId, contactId)}${queryString}`);
    return extractApiData(response);
  },

  // Convenience methods
  
  /**
   * Gets primary emergency contact for a visitor
   * Convenience method that filters for the primary contact
   */
  async getPrimaryEmergencyContact(visitorId) {
    const contacts = await this.getEmergencyContacts(visitorId);
    return contacts.find(contact => contact.isPrimary) || null;
  },

  /**
   * Gets emergency contacts ordered by priority
   * Convenience method for displaying contacts in priority order
   */
  async getEmergencyContactsByPriority(visitorId) {
    const contacts = await this.getEmergencyContacts(visitorId);
    return contacts.sort((a, b) => {
      // Primary contact always first
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      
      // Then by priority (lower number = higher priority)
      return (a.priority || 999) - (b.priority || 999);
    });
  }
};

export default emergencyContactService;