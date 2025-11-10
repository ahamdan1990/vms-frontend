// src/services/notificationService.js
import apiClient from './apiClient';
import { API_CONFIG } from './apiEndpoints';

/**
 * Notification Service for real-time notification management
 * Replaces polling-based logic with SignalR real-time updates
 */
class NotificationService {
  constructor() {
    this.baseUrl = '/api/notifications';
  }

  /**
   * Get user notifications with filtering and pagination
   */
  async getNotifications({
    pageIndex = 0,
    pageSize = 20,
    isAcknowledged = null,
    alertType = null,
    priority = null,
    fromDate = null,
    toDate = null,
    includeExpired = false
  } = {}) {
    try {
      const params = new URLSearchParams();
      params.append('pageIndex', pageIndex);
      params.append('pageSize', pageSize);
      
      if (isAcknowledged !== null) params.append('isAcknowledged', isAcknowledged);
      if (alertType) params.append('alertType', alertType);
      if (priority) params.append('priority', priority);
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());
      if (includeExpired) params.append('includeExpired', includeExpired);

      const response = await apiClient.get(`${this.baseUrl}?${params}`);
      console.log(response)
      return response.data;
    } catch (error) {
      // Only log error if user is authenticated (has refresh token cookie)
      const hasRefreshToken = document.cookie.includes('refreshToken=');
      const isAuthError = error.response?.status === 401;

      if (process.env.NODE_ENV === 'development' && !(isAuthError && !hasRefreshToken)) {
        console.error('Error fetching notifications:', error);
      }
      throw this.handleApiError(error);
    }
  }

  /**
   * Get all notifications (admin only)
   */
  async getAllNotifications({
    pageIndex = 0,
    pageSize = 20,
    userId = null,
    isAcknowledged = null,
    alertType = null,
    priority = null,
    fromDate = null,
    toDate = null,
    includeExpired = false
  } = {}) {
    try {
      const params = new URLSearchParams();
      params.append('pageIndex', pageIndex);
      params.append('pageSize', pageSize);
      
      if (userId) params.append('userId', userId);
      if (isAcknowledged !== null) params.append('isAcknowledged', isAcknowledged);
      if (alertType) params.append('alertType', alertType);
      if (priority) params.append('priority', priority);
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());
      if (includeExpired) params.append('includeExpired', includeExpired);

      const response = await apiClient.get(`${this.baseUrl}/all?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Acknowledge a specific notification
   */
  async acknowledgeNotification(notificationId, notes = null) {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/${notificationId}/acknowledge`,
        { notes }
      );
      return response.data;
    } catch (error) {
      console.error('Error acknowledging notification:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Delete a specific notification
   */
  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(
        `${this.baseUrl}/${notificationId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Delete all notifications for the current user
   */
  async deleteAllNotifications() {
    try {
      const response = await apiClient.delete(`${this.baseUrl}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(fromDate = null, toDate = null) {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());

      const response = await apiClient.get(`${this.baseUrl}/stats?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get system-wide notification statistics (admin only)
   */
  async getSystemNotificationStats(fromDate = null, toDate = null) {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());

      const response = await apiClient.get(`${this.baseUrl}/stats/system?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system notification stats:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get alert escalation rules
   */
  async getAlertEscalations({
    pageIndex = 0,
    pageSize = 20,
    alertType = null,
    priority = null,
    isEnabled = null,
    searchTerm = null
  } = {}) {
    try {
      const params = new URLSearchParams();
      params.append('pageIndex', pageIndex);
      params.append('pageSize', pageSize);
      
      if (alertType) params.append('alertType', alertType);
      if (priority) params.append('priority', priority);
      if (isEnabled !== null) params.append('isEnabled', isEnabled);
      if (searchTerm) params.append('searchTerm', searchTerm);

      const response = await apiClient.get(`${this.baseUrl}/escalations?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alert escalations:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Create alert escalation rule
   */
  async createAlertEscalation(escalationData) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/escalations`, escalationData);
      return response.data;
    } catch (error) {
      console.error('Error creating alert escalation:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Update alert escalation rule
   */
  async updateAlertEscalation(escalationId, escalationData) {
    try {
      const response = await apiClient.put(
        `${this.baseUrl}/escalations/${escalationId}`, 
        escalationData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating alert escalation:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Delete alert escalation rule
   */
  async deleteAlertEscalation(escalationId) {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/escalations/${escalationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting alert escalation:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get available notification alert types
   */
  async getAlertTypes() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/alert-types`);
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
      const response = await apiClient.get(`${this.baseUrl}/priorities`);
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
      const response = await apiClient.get(`${this.baseUrl}/escalation-actions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching escalation actions:', error);
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
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
