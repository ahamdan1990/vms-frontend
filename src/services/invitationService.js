import apiClient, { extractApiData } from './apiClient';
import { INVITATION_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * Invitation management service matching the backend API endpoints exactly
 * Handles invitation CRUD operations, approval workflow, and check-in/check-out
 * Requires Invitation.* permissions as defined in the backend
 */
const invitationService = {
  /**
   * Gets paginated list of invitations with comprehensive filtering
   * GET /api/invitations
   * Requires: Invitation.Read permission
   */
  async getInvitations(params = {}) {
    const queryParams = {
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 20,
      searchTerm: params.searchTerm || undefined,
      status: params.status || undefined,
      type: params.type || undefined,
      hostId: params.hostId || undefined,
      visitorId: params.visitorId || undefined,
      visitPurposeId: params.visitPurposeId || undefined,
      locationId: params.locationId || undefined,
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
      includeDeleted: params.includeDeleted || false,
      pendingApprovalsOnly: params.pendingApprovalsOnly || false,
      activeOnly: params.activeOnly || false,
      expiredOnly: params.expiredOnly || false,
      sortBy: params.sortBy || 'ScheduledStartTime',
      sortDirection: params.sortDirection || 'desc'
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${INVITATION_ENDPOINTS.BASE}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets invitation by ID
   * GET /api/invitations/{id}
   * Requires: Invitation.Read permission
   */
  async getInvitationById(id, includeDeleted = false) {
    const queryParams = { includeDeleted };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${INVITATION_ENDPOINTS.BY_ID(id)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets invitation by reference (ID, invitation number, or QR code)
   * GET /api/invitations/by-reference/{reference}
   * Requires: Invitation.Read permission
   */
  async getInvitationByReference(reference, includeDeleted = false) {
    const queryParams = { includeDeleted };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`/api/invitations/by-reference/${encodeURIComponent(reference)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Creates a new invitation
   * POST /api/invitations
   * Requires: Invitation.Create permission
   */
  async createInvitation(invitationData) {
    console.log(invitationData)
    const response = await apiClient.post(INVITATION_ENDPOINTS.BASE, invitationData);
    return extractApiData(response);
  },

  /**
   * Updates an existing invitation
   * PUT /api/invitations/{id}
   * Requires: Invitation.Update permission
   */
  async updateInvitation(id, invitationData) {
    const response = await apiClient.put(INVITATION_ENDPOINTS.BY_ID(id), invitationData);
    return extractApiData(response);
  },

  /**
   * Deletes an invitation (soft delete by default)
   * DELETE /api/invitations/{id}
   * Requires: Invitation.Delete permission
   */
  async deleteInvitation(id, permanentDelete = false) {
    const queryParams = { permanentDelete };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.delete(`${INVITATION_ENDPOINTS.BY_ID(id)}${queryString}`);
    return extractApiData(response);
  },

  // Approval Workflow Methods

  /**
   * Submits an invitation for approval
   * POST /api/invitations/{id}/submit
   * Requires: Invitation.Create permission
   */
  async submitInvitation(id) {
    const response = await apiClient.post(INVITATION_ENDPOINTS.SUBMIT(id));
    return extractApiData(response);
  },

  /**
   * Approves an invitation
   * POST /api/invitations/{id}/approve
   * Requires: Invitation.Approve permission
   */
  async approveInvitation(id, comments = '') {
    const response = await apiClient.post(INVITATION_ENDPOINTS.APPROVE(id), { comments });
    return extractApiData(response);
  },

  /**
   * Rejects an invitation
   * POST /api/invitations/{id}/reject
   * Requires: Invitation.Approve permission
   */
  async rejectInvitation(id, reason) {
    const response = await apiClient.post(INVITATION_ENDPOINTS.REJECT(id), { reason });
    return extractApiData(response);
  },

  /**
   * Cancels an invitation
   * POST /api/invitations/{id}/cancel
   * Requires: Invitation.CancelAll permission
   */
  async cancelInvitation(id, reason) {
    const response = await apiClient.post(INVITATION_ENDPOINTS.CANCEL(id), { reason });
    return extractApiData(response);
  },

  // QR Code Methods

  /**
   * Gets QR code data for an invitation
   * GET /api/invitations/{id}/qr-code
   * Requires: Invitation.Read permission
   */
  async getQrCode(id) {
    const response = await apiClient.get(INVITATION_ENDPOINTS.QR_CODE(id));
    return extractApiData(response);
  },

  /**
   * Gets QR code image for an invitation
   * GET /api/invitations/{id}/qr-code/image
   * Requires: Invitation.Read permission
   */
  async getQrImage(id, size = 300, branded = false) {
    const queryParams = { size, branded };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${INVITATION_ENDPOINTS.QR_IMAGE(id)}${queryString}`, {
      responseType: 'blob'
    });
    return response.data; // Return blob directly
  },

  /**
   * Gets QR code data for an invitation
   * GET /api/invitations/{id}/qr-code/data
   * Requires: Invitation.Read permission
   */
  async getQrData(id) {
    const response = await apiClient.get(INVITATION_ENDPOINTS.QR_DATA(id));
    return extractApiData(response);
  },

  /**
   * Sends QR code to visitor via email
   * POST /api/invitations/{id}/send-qr-email
   * Requires: Invitation.Read permission
   */
  async sendQrCodeEmail(id, options = {}) {
    const emailData = {
      customMessage: options.customMessage || null,
      includeQrImage: options.includeQrImage !== undefined ? options.includeQrImage : true,
      alternativeEmail: options.alternativeEmail || null
    };
    
    const response = await apiClient.post(INVITATION_ENDPOINTS.QR_EMAIL(id), emailData);
    return extractApiData(response);
  },

  /**
   * Validates QR code data
   * POST /api/invitations/validate-qr
   * Requires: Invitation.Read permission
   */
  async validateQrCode(qrData) {
    const response = await apiClient.post(INVITATION_ENDPOINTS.VALIDATE_QR, { qrData });
    return extractApiData(response);
  },

  // Check-in/Check-out Methods

  /**
   * Checks in a visitor using invitation
   * POST /api/invitations/check-in
   * Requires: CheckIn.Process permission
   */
  async checkInInvitation(invitationReference, notes = '') {
    const response = await apiClient.post(INVITATION_ENDPOINTS.CHECK_IN, {
      invitationReference,
      notes
    });
    return extractApiData(response);
  },

  /**
   * Checks out a visitor
   * POST /api/invitations/{id}/check-out
   * Requires: CheckIn.Process permission
   */
  async checkOutInvitation(id, notes = '') {
    const response = await apiClient.post(INVITATION_ENDPOINTS.CHECK_OUT(id), { notes });
    return extractApiData(response);
  },

  // Utility Methods

  /**
   * Resends invitation notification
   * POST /api/invitations/{id}/resend
   * Requires: Invitation.Create permission
   */
  async resendInvitation(id) {
    const response = await apiClient.post(INVITATION_ENDPOINTS.RESEND(id));
    return extractApiData(response);
  },

  /**
   * Gets invitation templates
   * GET /api/invitations/templates
   * Requires: Template.Read permission
   */
  async getInvitationTemplates() {
    const response = await apiClient.get(INVITATION_ENDPOINTS.TEMPLATES);
    return extractApiData(response);
  },

  /**
   * Creates bulk invitations
   * POST /api/invitations/bulk
   * Requires: Invitation.Create permission
   */
  async createBulkInvitations(invitationsData) {
    const response = await apiClient.post(INVITATION_ENDPOINTS.BULK_CREATE, invitationsData);
    return extractApiData(response);
  },

  /**
   * Exports invitations
   * GET /api/invitations/export
   * Requires: Invitation.Export permission
   */
  async exportInvitations(params = {}) {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${INVITATION_ENDPOINTS.EXPORT}${queryString}`, {
      responseType: 'blob'
    });
    return response.data; // Return blob directly
  },

  /**
   * Gets invitation statistics
   * GET /api/invitations/statistics
   * Requires: Invitation.ReadOwn permission
   */
  async getInvitationStatistics(params = {}) {
    const queryParams = {
      startDate: params.startDate,
      endDate: params.endDate,
      hostId: params.hostId,
      includeDeleted: params.includeDeleted || false
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${INVITATION_ENDPOINTS.STATISTICS}${queryString}`);
    return extractApiData(response);
  },

  // Convenience methods for common operations

  /**
   * Gets pending approvals for current user
   */
  async getPendingApprovals(pageSize = 20) {
    return this.getInvitations({
      pendingApprovalsOnly: true,
      pageSize,
      sortBy: 'ScheduledStartTime',
      sortDirection: 'asc'
    });
  },

  /**
   * Gets active invitations (today's visits)
   */
  async getActiveInvitations() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return this.getInvitations({
      activeOnly: true,
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
      sortBy: 'ScheduledStartTime',
      sortDirection: 'asc'
    });
  },

  /**
   * Gets invitations by visitor
   */
  async getInvitationsByVisitor(visitorId, includeExpired = false) {
    return this.getInvitations({
      visitorId,
      includeDeleted: false,
      expiredOnly: false,
      sortBy: 'ScheduledStartTime',
      sortDirection: 'desc'
    });
  },

  /**
   * Gets invitations by host (current user's invitations)
   */
  async getMyInvitations(params = {}) {
    return this.getInvitations({
      ...params,
      sortBy: 'ScheduledStartTime',
      sortDirection: 'desc'
    });
  },

  /**
   * Gets upcoming invitations (next 7 days)
   */
  async getUpcomingInvitations() {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.getInvitations({
      startDate: today.toISOString(),
      endDate: nextWeek.toISOString(),
      status: 'Approved',
      sortBy: 'ScheduledStartTime',
      sortDirection: 'asc'
    });
  }
};

export default invitationService;