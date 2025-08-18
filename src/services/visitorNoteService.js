import apiClient, { extractApiData } from './apiClient';
import { VISITOR_NOTE_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * Visitor Note management service matching the backend API endpoints exactly
 * Handles visitor note CRUD operations with categorization and priority support
 * Requires VisitorNote.* permissions as defined in the backend
 */
const visitorNoteService = {
  /**
   * Gets all notes for a visitor
   * GET /api/visitors/{visitorId}/notes
   * Requires: VisitorNote.Read permission
   */
  async getVisitorNotes(visitorId, params = {}) {
    const queryParams = {
      category: params.category || undefined,
      isFlagged: params.isFlagged || undefined,
      isConfidential: params.isConfidential || undefined,
      includeDeleted: params.includeDeleted || false
    };
    
    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${VISITOR_NOTE_ENDPOINTS.BASE(visitorId)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets note by ID
   * GET /api/visitors/{visitorId}/notes/{id}
   * Requires: VisitorNote.Read permission
   */
  async getVisitorNoteById(visitorId, noteId, includeDeleted = false) {
    const queryParams = { includeDeleted };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${VISITOR_NOTE_ENDPOINTS.BY_ID(visitorId, noteId)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Creates a new visitor note
   * POST /api/visitors/{visitorId}/notes
   * Requires: VisitorNote.Create permission
   */
  async createVisitorNote(visitorId, noteData) {
    const response = await apiClient.post(VISITOR_NOTE_ENDPOINTS.BASE(visitorId), noteData);
    return extractApiData(response);
  },

  /**
   * Updates an existing visitor note
   * PUT /api/visitors/{visitorId}/notes/{id}
   * Requires: VisitorNote.Update permission
   */
  async updateVisitorNote(visitorId, noteId, noteData) {
    const response = await apiClient.put(VISITOR_NOTE_ENDPOINTS.BY_ID(visitorId, noteId), noteData);
    return extractApiData(response);
  },

  /**
   * Deletes a visitor note (soft delete by default)
   * DELETE /api/visitors/{visitorId}/notes/{id}
   * Requires: VisitorNote.Delete permission
   */
  async deleteVisitorNote(visitorId, noteId, permanentDelete = false) {
    const queryParams = { permanentDelete };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.delete(`${VISITOR_NOTE_ENDPOINTS.BY_ID(visitorId, noteId)}${queryString}`);
    return extractApiData(response);
  },

  // Convenience methods

  /**
   * Gets notes by category
   * Convenience method for filtering notes by category
   */
  async getNotesByCategory(visitorId, category) {
    return this.getVisitorNotes(visitorId, { category });
  },

  /**
   * Gets flagged notes
   * Convenience method for filtering flagged notes
   */
  async getFlaggedNotes(visitorId) {
    return this.getVisitorNotes(visitorId, { isFlagged: true });
  },

  /**
   * Gets confidential notes
   * Convenience method for filtering confidential notes
   */
  async getConfidentialNotes(visitorId) {
    return this.getVisitorNotes(visitorId, { isConfidential: true });
  },

  /**
   * Gets public notes
   * Convenience method for filtering non-confidential notes
   */
  async getPublicNotes(visitorId) {
    return this.getVisitorNotes(visitorId, { isConfidential: false });
  },

  /**
   * Creates a security note
   * Convenience method for creating security-related notes
   */
  async createSecurityNote(visitorId, content, title = 'Security Note') {
    return this.createVisitorNote(visitorId, {
      title,
      content,
      category: 'Security',
      priority: 'High',
      isFlagged: true,
      isConfidential: true,
      tags: 'security,important'
    });
  },

  /**
   * Creates a general note
   * Convenience method for creating general notes
   */
  async createGeneralNote(visitorId, content, title = 'General Note') {
    return this.createVisitorNote(visitorId, {
      title,
      content,
      category: 'General',
      priority: 'Medium',
      isFlagged: false,
      isConfidential: false
    });
  },

  /**
   * Creates a check-in note
   * Convenience method for creating check-in related notes
   */
  async createCheckInNote(visitorId, content, title = 'Check-in Note') {
    return this.createVisitorNote(visitorId, {
      title,
      content,
      category: 'Check-in',
      priority: 'Medium',
      isFlagged: false,
      isConfidential: false,
      tags: 'checkin,visit'
    });
  },

  /**
   * Flags a note
   * Convenience method for flagging a note as important
   */
  async flagNote(visitorId, noteId) {
    const note = await this.getVisitorNoteById(visitorId, noteId);
    return this.updateVisitorNote(visitorId, noteId, {
      ...note,
      isFlagged: true
    });
  },

  /**
   * Unflags a note
   * Convenience method for removing flag from a note
   */
  async unflagNote(visitorId, noteId) {
    const note = await this.getVisitorNoteById(visitorId, noteId);
    return this.updateVisitorNote(visitorId, noteId, {
      ...note,
      isFlagged: false
    });
  },

  /**
   * Sets note as confidential
   * Convenience method for marking a note as confidential
   */
  async setNoteConfidential(visitorId, noteId) {
    const note = await this.getVisitorNoteById(visitorId, noteId);
    return this.updateVisitorNote(visitorId, noteId, {
      ...note,
      isConfidential: true
    });
  },

  /**
   * Sets note as public
   * Convenience method for marking a note as public
   */
  async setNotePublic(visitorId, noteId) {
    const note = await this.getVisitorNoteById(visitorId, noteId);
    return this.updateVisitorNote(visitorId, noteId, {
      ...note,
      isConfidential: false
    });
  }
};

export default visitorNoteService;
