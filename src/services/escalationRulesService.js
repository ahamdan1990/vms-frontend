// src/services/escalationRulesService.js
import apiClient from './apiClient';
import { NOTIFICATION_ENDPOINTS } from './apiEndpoints';
import { getMockPaginatedResponse } from '../utils/testData';

// Temporary flag for testing pagination with mock data
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && false; // Set to true to test with mock data

/**
 * Escalation Rules Service for managing alert escalation rules
 * Provides CRUD operations for escalation rule management
 */
class EscalationRulesService {
  constructor() {
    this.baseUrl = NOTIFICATION_ENDPOINTS.ESCALATIONS;
  }

  /**
   * Get escalation rules with filtering and pagination
   */
  async getEscalationRules({
    pageIndex = 0,
    pageSize = 20,
    alertType = null,
    priority = null,
    isEnabled = null,
    searchTerm = null,
    sortBy = null,
    sortDirection = 'asc'
  } = {}) {
    // Use mock data for testing if enabled
    if (USE_MOCK_DATA) {
      console.log('Using mock data for pagination testing');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return getMockPaginatedResponse(pageIndex, pageSize, 32); // 32 total items to match your scenario
    }

    try {
      const params = new URLSearchParams();
      params.append('pageIndex', pageIndex);
      params.append('pageSize', pageSize);
      
      if (alertType) params.append('alertType', alertType);
      if (priority) params.append('priority', priority);
      if (isEnabled !== null) params.append('isEnabled', isEnabled);
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (sortBy) {
        params.append('sortBy', sortBy);
        params.append('sortDirection', sortDirection);
      }

      console.log('API Request - Escalation Rules:', {
        pageIndex,
        pageSize,
        alertType,
        priority,
        isEnabled,
        searchTerm,
        sortBy,
        sortDirection,
        url: `${this.baseUrl}?${params}`
      });

      const response = await apiClient.get(`${this.baseUrl}?${params}`);
      
      console.log('API Response - Escalation Rules:', {
        totalCount: response.data.totalCount,
        itemsLength: response.data.items?.length,
        pageIndex: response.data.pageIndex,
        totalPages: response.data.totalPages
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching escalation rules:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get escalation rule by ID
   */
  async getEscalationRuleById(id) {
    try {
      const response = await apiClient.get(NOTIFICATION_ENDPOINTS.ESCALATION_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching escalation rule:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Create new escalation rule
   */
  async createEscalationRule(escalationRuleData) {
    try {
      const response = await apiClient.post(this.baseUrl, escalationRuleData);
      return response.data;
    } catch (error) {
      console.error('Error creating escalation rule:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Update existing escalation rule
   */
  async updateEscalationRule(id, escalationRuleData) {
    try {
      const response = await apiClient.put(
        NOTIFICATION_ENDPOINTS.ESCALATION_BY_ID(id),
        escalationRuleData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating escalation rule:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Delete escalation rule
   */
  async deleteEscalationRule(id) {
    try {
      const response = await apiClient.delete(NOTIFICATION_ENDPOINTS.ESCALATION_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('Error deleting escalation rule:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get available alert types
   */
  async getAlertTypes() {
    try {
      const response = await apiClient.get(NOTIFICATION_ENDPOINTS.ALERT_TYPES);
      return response.data;
    } catch (error) {
      console.error('Error fetching alert types:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get available alert priorities
   */
  async getAlertPriorities() {
    try {
      const response = await apiClient.get(NOTIFICATION_ENDPOINTS.PRIORITIES);
      return response.data;
    } catch (error) {
      console.error('Error fetching alert priorities:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get available escalation actions
   */
  async getEscalationActions() {
    try {
      const response = await apiClient.get(NOTIFICATION_ENDPOINTS.ESCALATION_ACTIONS);
      return response.data;
    } catch (error) {
      console.error('Error fetching escalation actions:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Toggle escalation rule enabled status
   */
  async toggleEscalationRule(id, isEnabled) {
    try {
      // Get current rule first
      const currentRule = await this.getEscalationRuleById(id);
      
      // Update only the enabled status
      const updatedRule = {
        ...currentRule.data,
        isEnabled: isEnabled
      };
      
      const response = await this.updateEscalationRule(id, updatedRule);
      return response;
    } catch (error) {
      console.error('Error toggling escalation rule:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Bulk operations
   */
  async bulkToggleEscalationRules(ids, isEnabled) {
    try {
      const promises = ids.map(id => this.toggleEscalationRule(id, isEnabled));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return {
        successful,
        failed,
        total: ids.length,
        results
      };
    } catch (error) {
      console.error('Error in bulk toggle escalation rules:', error);
      throw this.handleApiError(error);
    }
  }

  async bulkDeleteEscalationRules(ids) {
    try {
      const promises = ids.map(id => this.deleteEscalationRule(id));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return {
        successful,
        failed,
        total: ids.length,
        results
      };
    } catch (error) {
      console.error('Error in bulk delete escalation rules:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Handle API errors with consistent error formatting
   */
  handleApiError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        status,
        message: data?.message || `HTTP ${status} Error`,
        details: data?.details || null,
        errors: data?.errors || null
      };
    } else if (error.request) {
      // Network error
      return {
        status: 0,
        message: 'Network error - please check your connection',
        details: 'No response received from server'
      };
    } else {
      // Other error
      return {
        status: -1,
        message: error.message || 'Unknown error occurred',
        details: error.toString()
      };
    }
  }

  /**
   * Validate escalation rule data
   */
  validateEscalationRule(escalationRuleData) {
    const errors = {};

    if (!escalationRuleData.ruleName?.trim()) {
      errors.ruleName = 'Rule name is required';
    }

    if (!escalationRuleData.alertType) {
      errors.alertType = 'Alert type is required';
    }

    if (!escalationRuleData.alertPriority) {
      errors.alertPriority = 'Alert priority is required';
    }

    if (!escalationRuleData.action) {
      errors.action = 'Escalation action is required';
    }

    if (escalationRuleData.escalationDelayMinutes < 0) {
      errors.escalationDelayMinutes = 'Escalation delay cannot be negative';
    }

    if (escalationRuleData.maxAttempts < 1) {
      errors.maxAttempts = 'Max attempts must be at least 1';
    }

    if (escalationRuleData.rulePriority < 1) {
      errors.rulePriority = 'Rule priority must be at least 1';
    }

    // Validate action-specific fields
    if (escalationRuleData.action === 'EscalateToUser' && !escalationRuleData.escalationTargetUserId) {
      errors.escalationTargetUserId = 'Target user is required for user escalation';
    }

    if (escalationRuleData.action === 'EscalateToRole' && !escalationRuleData.escalationTargetRole) {
      errors.escalationTargetRole = 'Target role is required for role escalation';
    }

    if (escalationRuleData.action === 'SendEmail' && !escalationRuleData.escalationEmails) {
      errors.escalationEmails = 'Email addresses are required for email escalation';
    }

    if (escalationRuleData.action === 'SendSMS' && !escalationRuleData.escalationPhones) {
      errors.escalationPhones = 'Phone numbers are required for SMS escalation';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Export singleton instance
export const escalationRulesService = new EscalationRulesService();
export default escalationRulesService;
