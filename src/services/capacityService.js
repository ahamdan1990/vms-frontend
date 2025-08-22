// src/services/capacityService.js
import apiClient, { extractApiData } from './apiClient';
import { CAPACITY_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * Capacity management service for monitoring and validating visitor capacity
 * Matches the backend CapacityController API endpoints exactly
 */
const capacityService = {
  /**
   * Validates capacity for a specific date/time/location
   * GET /api/capacity/validate
   * Requires: Invitation.Create permission
   */
  async validateCapacity(params = {}) {
    const queryParams = {
      locationId: params.locationId,
      timeSlotId: params.timeSlotId,
      dateTime: params.dateTime,
      expectedVisitors: params.expectedVisitors || 1,
      isVipRequest: params.isVipRequest || false,
      excludeInvitationId: params.excludeInvitationId
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${CAPACITY_ENDPOINTS.VALIDATE}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets current occupancy for a specific date/time/location
   * GET /api/capacity/occupancy
   * Requires: Dashboard.ViewBasic permission
   */
  async getOccupancy(params = {}) {
    const queryParams = {
      dateTime: params.dateTime,
      locationId: params.locationId
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${CAPACITY_ENDPOINTS.OCCUPANCY}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets occupancy statistics for a date range
   * GET /api/capacity/statistics
   * Requires: Report.GenerateOwn permission
   */
  async getStatistics(params = {}) {
    const queryParams = {
      startDate: params.startDate,
      endDate: params.endDate,
      locationId: params.locationId
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${CAPACITY_ENDPOINTS.STATISTICS}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets alternative time slots when capacity is unavailable
   * GET /api/capacity/alternatives
   * Requires: Invitation.Create permission
   */
  async getAlternativeTimeSlots(params = {}) {
    const queryParams = {
      originalDateTime: params.originalDateTime,
      expectedVisitors: params.expectedVisitors || 1,
      locationId: params.locationId
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${CAPACITY_ENDPOINTS.ALTERNATIVES}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets real-time capacity overview for multiple locations
   * GET /api/capacity/overview
   * Requires: Dashboard.ViewBasic permission
   */
  async getCapacityOverview(params = {}) {
    const queryParams = {
      dateTime: params.dateTime,
      locationIds: params.locationIds
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${CAPACITY_ENDPOINTS.OVERVIEW}${queryString}`);
    console.log(response)
    return extractApiData(response);
  },

  /**
   * Gets capacity utilization trends for monitoring
   * GET /api/capacity/trends
   * Requires: Report.GenerateOwn permission
   */
  async getCapacityTrends(params = {}) {
    const queryParams = {
      startDate: params.startDate,
      endDate: params.endDate,
      locationId: params.locationId,
      groupBy: params.groupBy || 'day'
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${CAPACITY_ENDPOINTS.TRENDS}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Validates capacity data format and constraints
   * Client-side validation helper
   */
  validateCapacityRequest(data) {
    const errors = [];

    if (!data.dateTime) {
      errors.push('Date and time is required');
    } else {
      const dateTime = new Date(data.dateTime);
      if (dateTime < new Date(Date.now() - 5 * 60 * 1000)) { // 5 minute buffer
        errors.push('Cannot validate capacity for past dates');
      }
    }

    if (data.expectedVisitors && (data.expectedVisitors < 1 || data.expectedVisitors > 1000)) {
      errors.push('Expected visitors must be between 1 and 1000');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates statistics request parameters
   * Client-side validation helper
   */
  validateStatisticsRequest(data) {
    const errors = [];

    if (!data.startDate) {
      errors.push('Start date is required');
    }

    if (!data.endDate) {
      errors.push('End date is required');
    }

    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (startDate > endDate) {
        errors.push('Start date cannot be after end date');
      }

      const maxFutureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      if (endDate > maxFutureDate) {
        errors.push('End date cannot be more than 30 days in the future');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates trends request parameters
   * Client-side validation helper
   */
  validateTrendsRequest(data) {
    const errors = [];

    if (!data.startDate) {
      errors.push('Start date is required');
    }

    if (!data.endDate) {
      errors.push('End date is required');
    }

    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (startDate > endDate) {
        errors.push('Start date cannot be after end date');
      }
    }

    const validGroupBy = ['hour', 'day', 'week'];
    if (data.groupBy && !validGroupBy.includes(data.groupBy.toLowerCase())) {
      errors.push(`Group by must be one of: ${validGroupBy.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Helper to format date for API calls
   */
  formatDateForApi(date) {
    if (!date) return null;
    
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    return new Date(date).toISOString();
  },

  /**
   * Helper to determine occupancy status
   */
  getOccupancyStatus(occupancy) {
    if (!occupancy) return 'unknown';
    
    const { currentOccupancy, maxCapacity } = occupancy;
    
    if (currentOccupancy >= maxCapacity) {
      return 'at-capacity';
    }
    
    if (maxCapacity > 0 && (currentOccupancy / maxCapacity) >= 0.8) {
      return 'warning';
    }
    
    return 'normal';
  },

  /**
   * Helper to get status display text
   */
  getStatusDisplayText(status) {
    const statusMap = {
      'at-capacity': 'At Capacity',
      'warning': 'Warning Level',
      'normal': 'Normal',
      'unknown': 'Unknown'
    };
    
    return statusMap[status] || 'Unknown';
  },

  /**
   * Helper to get status color class
   */
  getStatusColorClass(status) {
    const colorMap = {
      'at-capacity': 'text-red-600 bg-red-100',
      'warning': 'text-yellow-600 bg-yellow-100',
      'normal': 'text-green-600 bg-green-100',
      'unknown': 'text-gray-600 bg-gray-100'
    };
    
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  }
};

export default capacityService;