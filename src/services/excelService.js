import apiClient, { extractApiData } from './apiClient';
import { EXCEL_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * Excel/XLSX service for invitation template management
 * Handles Excel template downloads, uploads, and processing
 * Requires Invitation.* permissions as defined in the backend
 */
const excelService = {
  /**
   * Downloads invitation template (Excel file)
   * GET /api/xlsx/invitation-template
   * Requires: Invitation.Create permission
   */
  async downloadInvitationTemplate(multipleVisitors = true) {
    const queryParams = { multipleVisitors };
    const queryString = buildQueryString(queryParams);
    
    const response = await apiClient.get(`${EXCEL_ENDPOINTS.DOWNLOAD_TEMPLATE}${queryString}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const blob = response.data;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = multipleVisitors 
      ? 'invitation-template-multiple-visitors.xlsx' 
      : 'invitation-template-single-visitor.xlsx';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Template downloaded successfully' };
  },

  /**
   * Uploads filled invitation Excel file and processes it
   * POST /api/xlsx/upload-invitation
   * Requires: Invitation.Create permission
   */
  async uploadFilledInvitation(excelFile) {
    const formData = new FormData();
    formData.append('xlsxFile', excelFile);

    const response = await apiClient.post(EXCEL_ENDPOINTS.UPLOAD_INVITATION, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return extractApiData(response);
  },

  /**
   * Validates Excel file structure before processing
   * POST /api/xlsx/validate
   * Requires: Invitation.Read permission
   */
  async validateExcelFile(excelFile) {
    const formData = new FormData();
    formData.append('xlsxFile', excelFile);

    const response = await apiClient.post(EXCEL_ENDPOINTS.VALIDATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return extractApiData(response);
  },

  /**
   * Sends Excel template via email
   * POST /api/xlsx/send-template
   * Requires: Invitation.Create permission
   */
  async sendTemplateByEmail(emailData) {
    const requestData = {
      hostName: emailData.hostName,
      hostEmail: emailData.hostEmail,
      includeMultipleVisitors: emailData.includeMultipleVisitors || true,
      customMessage: emailData.customMessage || null
    };

    const response = await apiClient.post(EXCEL_ENDPOINTS.SEND_TEMPLATE, requestData);
    return extractApiData(response);
  },

  // Convenience methods

  /**
   * Downloads single visitor template
   * Convenience method for single visitor template
   */
  async downloadSingleVisitorTemplate() {
    return this.downloadInvitationTemplate(false);
  },

  /**
   * Downloads multiple visitors template
   * Convenience method for multiple visitors template
   */
  async downloadMultipleVisitorsTemplate() {
    return this.downloadInvitationTemplate(true);
  },

  /**
   * Validates and uploads Excel file with progress tracking
   * Complete workflow: validate -> upload -> process
   */
  async processExcelFileWithValidation(excelFile, onProgress = null) {
    try {
      // Step 1: Validate file
      if (onProgress) onProgress({ step: 'validating', progress: 25 });
      const validationResult = await this.validateExcelFile(excelFile);
      
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors?.join(', ') || 'Invalid file structure'}`);
      }

      // Step 2: Upload and process
      if (onProgress) onProgress({ step: 'processing', progress: 75 });
      const result = await this.uploadFilledInvitation(excelFile);
      
      if (onProgress) onProgress({ step: 'completed', progress: 100 });
      return result;
    } catch (error) {
      if (onProgress) onProgress({ step: 'error', progress: 0, error: error.message });
      throw error;
    }
  },

  /**
   * Sends template to multiple recipients
   * Convenience method for bulk template sending
   */
  async sendTemplatesToMultipleHosts(hostList, templateOptions = {}) {
    const sendPromises = hostList.map(host => 
      this.sendTemplateByEmail({
        hostName: host.name,
        hostEmail: host.email,
        includeMultipleVisitors: templateOptions.includeMultipleVisitors || true,
        customMessage: templateOptions.customMessage || null
      })
    );

    try {
      const results = await Promise.allSettled(sendPromises);
      return {
        successful: results.filter(r => r.status === 'fulfilled').map(r => r.value),
        failed: results.filter(r => r.status === 'rejected').map(r => r.reason),
        summary: {
          total: hostList.length,
          sent: results.filter(r => r.status === 'fulfilled').length,
          failed: results.filter(r => r.status === 'rejected').length
        }
      };
    } catch (error) {
      throw new Error(`Bulk template sending failed: ${error.message}`);
    }
  },

  /**
   * Gets file validation rules and restrictions
   * Helper method to get upload requirements
   */
  getFileRequirements() {
    return {
      maxSize: '10MB',
      allowedTypes: ['.xlsx'],
      allowedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      requiredSheets: ['Visitor Information', 'Meeting Details'],
      templateStructure: {
        visitorInfo: [
          'First Name', 'Last Name', 'Email', 'Phone Number', 'Company',
          'Government ID', 'Nationality', 'Emergency Contact Name',
          'Emergency Contact Phone', 'Emergency Contact Relationship'
        ],
        meetingDetails: [
          'Subject', 'Start Date', 'Start Time', 'End Date', 'End Time',
          'Location', 'Special Instructions', 'Requires Escort',
          'Requires Badge', 'Parking Instructions'
        ]
      }
    };
  },

  /**
   * Validates file before upload (client-side)
   * Quick validation before sending to server
   */
  validateFileBeforeUpload(file) {
    const requirements = this.getFileRequirements();
    const errors = [];

    // Check file size
    if (file.size > 10 * 1024 * 1024) { // 10MB
      errors.push('File size exceeds 10MB limit');
    }

    // Check file type
    if (!requirements.allowedMimeTypes.includes(file.type) && 
        !requirements.allowedTypes.some(ext => file.name.toLowerCase().endsWith(ext))) {
      errors.push('File must be an Excel (.xlsx) file');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
};

export default excelService;
