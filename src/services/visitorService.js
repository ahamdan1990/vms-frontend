import apiClient, { extractApiData } from './apiClient';
import { VISITOR_ENDPOINTS, buildQueryString } from './apiEndpoints';
import visitorDocumentService from './visitorDocumentService';
import invitationService from './invitationService';

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
    // Check if data is already transformed (has invitation fields)
    const isAlreadyTransformed = visitorData.hasOwnProperty('createInvitation') || 
                                  visitorData.hasOwnProperty('invitationSubject');
    
    // Only transform if not already transformed
    const backendData = isAlreadyTransformed ? 
      visitorData : 
      this.transformVisitorDataForBackend(visitorData);
      
    console.log('Sending to backend:', backendData);
    const response = await apiClient.post(VISITOR_ENDPOINTS.BASE, backendData);
    return extractApiData(response);
  },

  /**
   * Transforms frontend visitor data to backend DTO structure
   * Handles address nesting and field mapping
   */
  transformVisitorDataForBackend(visitorData) {
    return {
      firstName: visitorData.firstName,
      lastName: visitorData.lastName,
      email: visitorData.email,
      
      // Enhanced phone fields
      phoneNumber: visitorData.phoneNumber,
      phoneCountryCode: visitorData.phoneCountryCode,
      phoneType: visitorData.phoneType,
      
      company: visitorData.company,
      jobTitle: visitorData.jobTitle,
      
      // Address structure - map governorate to state for backend compatibility
      address: visitorData.address ? {
        street1: visitorData.address.street1,
        street2: visitorData.address.street2,
        city: visitorData.address.city,
        state: visitorData.address.governorate, // Map governorate to state
        postalCode: visitorData.address.postalCode,
        country: visitorData.address.country,
        addressType: visitorData.address.addressType
      } : null,
      
      // Personal details
      dateOfBirth: visitorData.dateOfBirth ? new Date(visitorData.dateOfBirth).toISOString() : null,
      governmentId: visitorData.governmentId,
      governmentIdType: visitorData.governmentIdType,
      nationality: visitorData.nationality,
      language: visitorData.language,
      
      // New fields for preferences
      preferredLocationId: visitorData.preferredLocationId,
      defaultVisitPurposeId: visitorData.defaultVisitPurposeId,
      timeZone: visitorData.timeZone,
      
      // Special requirements
      dietaryRequirements: visitorData.dietaryRequirements,
      accessibilityRequirements: visitorData.accessibilityRequirements,
      securityClearance: visitorData.securityClearance,
      
      // Status and notes
      isVip: visitorData.isVip || false,
      notes: visitorData.notes,
      externalId: visitorData.externalId,
      
      // Emergency contacts
      emergencyContacts: visitorData.emergencyContacts || []
    };
  },

  /**
   * Updates an existing visitor
   * PUT /api/Visitors/{id}
   * Requires: Visitor.Update permission
   */
  async updateVisitor(id, visitorData) {
    // Transform data to backend format (same as create)
    const backendData = this.transformVisitorDataForBackend(visitorData);
    console.log('Updating visitor with transformed data:', backendData);
    const response = await apiClient.put(VISITOR_ENDPOINTS.BY_ID(id), backendData);
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
    // Backend expects [FromBody] string - send as JSON string
    const response = await apiClient.post(
      VISITOR_ENDPOINTS.BLACKLIST(id),
      JSON.stringify(reason),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
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

  /**
   * Uploads visitor profile photo
   * POST /api/Visitors/{id}/photo
   * Requires: Visitor.Update permission
   */
  async uploadVisitorPhoto(id, photoFile) {
    const formData = new FormData();
    formData.append('file', photoFile);

    const response = await apiClient.post(
      `${VISITOR_ENDPOINTS.BY_ID(id)}/photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return extractApiData(response);
  },

  /**
   * Gets visitor profile photo URL
   * GET /api/Visitors/{id}/photo
   * Requires: Visitor.Read permission
   */
  async getVisitorPhoto(id) {
    const response = await apiClient.get(`${VISITOR_ENDPOINTS.BY_ID(id)}/photo`);
    return extractApiData(response);
  },

  /**
   * Removes visitor profile photo
   * DELETE /api/Visitors/{id}/photo
   * Requires: Visitor.Update permission
   */
  async removeVisitorPhoto(id) {
    const response = await apiClient.delete(`${VISITOR_ENDPOINTS.BY_ID(id)}/photo`);
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
  },

  /**
   * Creates visitor with complete asset upload (photos and documents)
   * Handles the full visitor creation flow with error recovery
   */
  async createVisitorWithAssets(visitorData, photoFile = null, documentFiles = [], invitationData = null) {
    let createdVisitor = null;
    let invitationCreated = false;
    const errors = [];
    
    console.log('🔍 createVisitorWithAssets called with:', {
      hasInvitationData: !!invitationData,
      invitationData: invitationData
    });
    
    try {
      // Transform visitor data to include invitation fields if provided
      const transformedData = this.transformVisitorDataForBackend(visitorData);
      
      console.log('🔍 After transformVisitorDataForBackend:', transformedData);
      
      // Add invitation data to the visitor creation payload
      if (invitationData) {
        console.log('🔍 Adding invitation data to payload...');
        transformedData.createInvitation = true;
        transformedData.invitationSubject = invitationData.subject;
        transformedData.invitationMessage = invitationData.message;
        transformedData.invitationScheduledStartTime = invitationData.scheduledStartTime;
        transformedData.invitationScheduledEndTime = invitationData.scheduledEndTime;
        transformedData.invitationLocationId = invitationData.locationId;
        transformedData.invitationVisitPurposeId = invitationData.visitPurposeId;
        transformedData.invitationExpectedVisitorCount = invitationData.expectedVisitorCount || 1;
        transformedData.invitationSpecialInstructions = invitationData.specialInstructions;
        transformedData.invitationRequiresApproval = invitationData.requiresApproval !== undefined ? invitationData.requiresApproval : true;
        transformedData.invitationRequiresEscort = invitationData.requiresEscort || false;
        transformedData.invitationRequiresBadge = invitationData.requiresBadge !== undefined ? invitationData.requiresBadge : true;
        transformedData.invitationNeedsParking = invitationData.needsParking || false;
        transformedData.invitationParkingInstructions = invitationData.parkingInstructions;
        transformedData.invitationSubmitForApproval = invitationData.submitForApproval || false;
        
        console.log('🔍 Final transformedData with invitation:', transformedData);
      }

      // Step 1: Create the visitor (with invitation if provided)
      createdVisitor = await this.createVisitor(transformedData);
      console.log('Visitor created successfully:', createdVisitor.id);

      // Step 2: Upload photo if provided (using new profile photo endpoint)
      if (photoFile && createdVisitor.id) {
        try {
          await this.uploadVisitorPhoto(createdVisitor.id, photoFile);
          console.log('Profile photo uploaded successfully');
        } catch (photoError) {
          console.error('Profile photo upload failed:', photoError);
          errors.push(`Photo upload failed: ${photoError.message}`);
        }
      }
      
      // Step 3: Upload documents if provided
      if (documentFiles.length > 0 && createdVisitor.id) {
        try {
          const documentsData = documentFiles.map(file => ({
            file,
            title: file.name,
            documentType: 'Other',
            options: {
              description: `Document: ${file.name}`,
              isSensitive: false,
              isRequired: false
            }
          }));
          
          await visitorDocumentService.uploadMultipleDocuments(
            createdVisitor.id, 
            documentsData
          );
          console.log('Documents uploaded successfully');
        } catch (documentsError) {
          console.error('Documents upload failed:', documentsError);
          errors.push(`Documents upload failed: ${documentsError.message}`);
        }
      }
      
      // Note: Invitation creation is now handled by the backend in step 1
      // If invitation was requested, it should have been created with the visitor
      if (invitationData) {
        console.log('Invitation creation requested - handled by backend');
        invitationCreated = true;
      }
      
      // Return result with any non-critical errors
      return {
        visitor: createdVisitor,
        invitationCreated,
        errors: errors.length > 0 ? errors : null,
        success: true
      };
      
    } catch (error) {
      console.error('Visitor creation failed:', error);
      
      // Error recovery: cleanup created visitor if it was created but other steps failed
      if (createdVisitor?.id && (photoFile || documentFiles.length > 0)) {
        try {
          console.log('Attempting to cleanup visitor after partial failure...');
          await this.deleteVisitor(createdVisitor.id, true); // permanent delete for cleanup
          console.log('Visitor cleanup successful');
        } catch (cleanupError) {
          console.warn('Failed to cleanup visitor after error:', cleanupError);
        }
      }
      
      // Re-throw with enhanced error information
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Visitor creation failed: ${errorMessage}`);
    }
  },

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use the backend's integrated invitation creation instead
   */
  async createVisitorWithAssetsLegacy(visitorData, photoFile = null, documentFiles = [], invitationData = null) {
    let createdVisitor = null;
    
    try {
      // Step 1: Create the visitor
      createdVisitor = await this.createVisitor(visitorData);
      
      // Step 2: Upload photo if provided
      if (photoFile && createdVisitor.id) {
        await visitorDocumentService.uploadVisitorPhoto(createdVisitor.id, photoFile, {
          description: 'Visitor profile photo',
          isSensitive: false,
          isRequired: false
        });
      }
      
      // Step 3: Upload documents if provided
      if (documentFiles.length > 0 && createdVisitor.id) {
        const documentsData = documentFiles.map(file => ({
          file,
          title: file.name,
          documentType: 'Other',
          options: {
            description: `Document: ${file.name}`,
            isSensitive: false,
            isRequired: false
          }
        }));
        
        await visitorDocumentService.uploadMultipleDocuments(
          createdVisitor.id, 
          documentsData
        );
      }
      
      // Step 4: Create invitation if requested
      if (invitationData && createdVisitor.id) {
        await invitationService.createInvitation({
          ...invitationData,
          visitorId: createdVisitor.id
        });
      }
      
      return createdVisitor;
      
    } catch (error) {
      // Error recovery: cleanup created visitor if asset upload fails
      if (createdVisitor?.id) {
        try {
          await this.deleteVisitor(createdVisitor.id, true); // permanent delete for cleanup
        } catch (cleanupError) {
          console.warn('Failed to cleanup visitor after asset upload error:', cleanupError);
        }
      }
      
      throw new Error(`Visitor creation failed: ${error.message}`);
    }
  }
};

export default visitorService;