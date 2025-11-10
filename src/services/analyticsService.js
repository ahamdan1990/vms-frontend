import apiClient, { extractApiData } from './apiClient';
import { ANALYTICS_ENDPOINTS } from './apiEndpoints';
import { buildQueryString } from '../utils/helpers';

/**
 * Analytics service for comprehensive dashboard metrics and insights
 * Provides production-ready real-time analytics data
 */
const analyticsService = {
  /**
   * Get comprehensive analytics for dashboard
   * @param {Object} params - Optional parameters
   * @param {Date} params.startDate - Start date for trend data
   * @param {Date} params.endDate - End date for trend data
   * @param {number} params.locationId - Optional location filter
   * @param {string} params.timeZone - Time zone (default: UTC)
   * @returns {Promise<Object>} Comprehensive analytics data
   */
  async getComprehensiveAnalytics(params = {}) {
    try {
      const queryString = buildQueryString({
        startDate: params.startDate?.toISOString(),
        endDate: params.endDate?.toISOString(),
        locationId: params.locationId,
        timeZone: params.timeZone || 'UTC'
      });

      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.COMPREHENSIVE}${queryString}`);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to fetch comprehensive analytics:', error);
      throw error;
    }
  },

  /**
   * Get real-time metrics for dashboard overview
   * @param {number} locationId - Optional location filter
   * @returns {Promise<Object>} Real-time metrics
   */
  async getRealTimeMetrics(locationId = null) {
    try {
      const queryString = buildQueryString({ locationId });
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.REALTIME}${queryString}`);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to fetch real-time metrics:', error);
      throw error;
    }
  },

  /**
   * Get capacity metrics and utilization
   * @param {number} locationId - Optional location filter
   * @returns {Promise<Object>} Capacity metrics
   */
  async getCapacityMetrics(locationId = null) {
    try {
      const queryString = buildQueryString({ locationId });
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.CAPACITY}${queryString}`);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to fetch capacity metrics:', error);
      throw error;
    }
  },

  /**
   * Get visitor metrics and statistics
   * @param {number} locationId - Optional location filter
   * @returns {Promise<Object>} Visitor metrics
   */
  async getVisitorMetrics(locationId = null) {
    try {
      const queryString = buildQueryString({ locationId });
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.VISITORS}${queryString}`);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to fetch visitor metrics:', error);
      throw error;
    }
  },

  /**
   * Get invitation metrics and statistics
   * @param {number} locationId - Optional location filter
   * @returns {Promise<Object>} Invitation metrics
   */
  async getInvitationMetrics(locationId = null) {
    try {
      const queryString = buildQueryString({ locationId });
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.INVITATIONS}${queryString}`);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to fetch invitation metrics:', error);
      throw error;
    }
  },

  /**
   * Get trend analytics
   * @param {Object} params - Parameters
   * @param {Date} params.startDate - Start date
   * @param {Date} params.endDate - End date
   * @param {number} params.locationId - Optional location filter
   * @returns {Promise<Object>} Trend analytics
   */
  async getTrendAnalytics(params = {}) {
    try {
      const queryString = buildQueryString({
        startDate: params.startDate?.toISOString(),
        endDate: params.endDate?.toISOString(),
        locationId: params.locationId
      });

      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.TRENDS}${queryString}`);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to fetch trend analytics:', error);
      throw error;
    }
  },

  /**
   * Get insights and recommendations
   * @param {number} locationId - Optional location filter
   * @returns {Promise<Object>} Insights and recommendations
   */
  async getInsights(locationId = null) {
    try {
      const queryString = buildQueryString({ locationId });
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.INSIGHTS}${queryString}`);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      throw error;
    }
  },

  /**
   * Get peak hours data
   * @param {Object} params - Parameters
   * @param {Date} params.date - Date to analyze (default: today)
   * @param {number} params.locationId - Optional location filter
   * @returns {Promise<Array>} Peak hours data
   */
  async getPeakHours(params = {}) {
    try {
      const queryString = buildQueryString({
        date: params.date?.toISOString(),
        locationId: params.locationId
      });

      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.PEAK_HOURS}${queryString}`);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to fetch peak hours:', error);
      throw error;
    }
  },

  /**
   * Get popular locations ranking
   * @param {Object} params - Parameters
   * @param {Date} params.startDate - Start date
   * @param {Date} params.endDate - End date
   * @param {number} params.top - Number of top locations (default: 10)
   * @returns {Promise<Array>} Popular locations
   */
  async getPopularLocations(params = {}) {
    try {
      const queryString = buildQueryString({
        startDate: params.startDate?.toISOString(),
        endDate: params.endDate?.toISOString(),
        top: params.top || 10
      });

      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.POPULAR_LOCATIONS}${queryString}`);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to fetch popular locations:', error);
      throw error;
    }
  },

  /**
   * Get daily visitor trend
   * @param {Object} params - Parameters
   * @param {number} params.days - Number of days to include (default: 30)
   * @param {number} params.locationId - Optional location filter
   * @returns {Promise<Array>} Daily visitor trend
   */
  async getDailyTrend(params = {}) {
    try {
      const queryString = buildQueryString({
        days: params.days || 30,
        locationId: params.locationId
      });

      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.DAILY_TREND}${queryString}`);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to fetch daily trend:', error);
      throw error;
    }
  },

  /**
   * Broadcast analytics update to all connected clients (Admin only)
   * @returns {Promise<Object>} Success response
   */
  async broadcastUpdate() {
    try {
      const response = await apiClient.post(ANALYTICS_ENDPOINTS.BROADCAST_UPDATE);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to broadcast analytics update:', error);
      throw error;
    }
  },

  /**
   * Export analytics data
   * @param {Object} params - Export parameters
   * @param {Date} params.startDate - Start date
   * @param {Date} params.endDate - End date
   * @param {string} params.format - Export format (json, csv)
   * @returns {Promise<Object>} Analytics data in requested format
   */
  async exportAnalytics(params = {}) {
    try {
      const queryString = buildQueryString({
        startDate: params.startDate?.toISOString(),
        endDate: params.endDate?.toISOString(),
        format: params.format || 'json'
      });

      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.EXPORT}${queryString}`);
      return extractApiData(response);
    } catch (error) {
      console.error('Failed to export analytics:', error);
      throw error;
    }
  }
};

export default analyticsService;
