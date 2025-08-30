// src/services/timeSlotsService.js
import apiClient, { extractApiData } from './apiClient';
import { TIME_SLOTS_ENDPOINTS, buildQueryString } from './apiEndpoints';

/**
 * Time slots management service for CRUD operations and availability checking
 * Matches the backend TimeSlotsController API endpoints exactly
 */
const timeSlotsService = {
  /**
   * Gets all time slots with optional filtering
   * GET /api/time-slots
   * Requires: Invitation.ReadOwn permission
   */
  async getTimeSlots(params = {}) {
    const queryParams = {
      locationId: params.locationId,
      activeOnly: params.activeOnly !== undefined ? params.activeOnly : true,
      pageIndex: params.pageIndex || 0,
      pageSize: Math.min(params.pageSize || 50, 100),
      sortBy: params.sortBy || 'DisplayOrder',
      sortDirection: params.sortDirection || 'asc'
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${TIME_SLOTS_ENDPOINTS.BASE}${queryString}`);
    console.log(response)
    return extractApiData(response);
  },

  /**
   * Gets a specific time slot by ID
   * GET /api/time-slots/{id}
   * Requires: Invitation.ReadOwn permission
   */
  async getTimeSlotById(id) {
    const response = await apiClient.get(TIME_SLOTS_ENDPOINTS.BY_ID(id));
    return extractApiData(response);
  },

  /**
   * Creates a new time slot
   * POST /api/time-slots
   * Requires: SystemConfig.ManageCapacity permission
   */
  async createTimeSlot(timeSlotData) {
    const validation = this.validateTimeSlotData(timeSlotData, false);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const response = await apiClient.post(TIME_SLOTS_ENDPOINTS.BASE, timeSlotData);
    return extractApiData(response);
  },

  /**
   * Updates an existing time slot
   * PUT /api/time-slots/{id}
   * Requires: SystemConfig.ManageCapacity permission
   */
  async updateTimeSlot(id, timeSlotData) {
    const validation = this.validateTimeSlotData(timeSlotData, true);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const response = await apiClient.put(TIME_SLOTS_ENDPOINTS.BY_ID(id), timeSlotData);
    return extractApiData(response);
  },

  /**
   * Deletes a time slot (soft delete by default)
   * DELETE /api/time-slots/{id}
   * Requires: SystemConfig.ManageCapacity permission
   */
  async deleteTimeSlot(id, hardDelete = false) {
    const queryParams = hardDelete ? { hardDelete: true } : {};
    const queryString = buildQueryString(queryParams);
    
    const response = await apiClient.delete(`${TIME_SLOTS_ENDPOINTS.BY_ID(id)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets available time slots for a specific date and location
   * GET /api/time-slots/available
   * Requires: Invitation.Create permission
   */
  async getAvailableTimeSlots(params = {}) {
    const queryParams = {
      date: params.date,
      locationId: params.locationId
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${TIME_SLOTS_ENDPOINTS.AVAILABLE}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Validates time slot data for create/update operations
   * Client-side validation helper
   */
  validateTimeSlotData(data, isUpdate = false) {
    const errors = [];

    // Name validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Time slot name is required');
    } else if (data.name.trim().length > 100) {
      errors.push('Time slot name cannot exceed 100 characters');
    }

    // Start time validation
    if (!data.startTime) {
      errors.push('Start time is required');
    }

    // End time validation
    if (!data.endTime) {
      errors.push('End time is required');
    }

    // Time range validation
    if (data.startTime && data.endTime) {
      const startTime = this.parseTimeOnly(data.startTime);
      const endTime = this.parseTimeOnly(data.endTime);
      
      if (startTime >= endTime) {
        errors.push('End time must be after start time');
      }
    }

    // Max visitors validation
    if (data.maxVisitors === undefined || data.maxVisitors === null) {
      errors.push('Maximum visitors is required');
    } else if (!Number.isInteger(data.maxVisitors) || data.maxVisitors < 1 || data.maxVisitors > 1000) {
      errors.push('Maximum visitors must be between 1 and 1000');
    }

    // Active days validation
    if (!data.activeDays || typeof data.activeDays !== 'string') {
      errors.push('Active days configuration is required');
    } else {
      const validDaysPattern = /^[0-6,]*$/; // Comma-separated numbers 0-6
      if (!validDaysPattern.test(data.activeDays)) {
        errors.push('Active days must be comma-separated numbers 0-6 (0=Sunday, 6=Saturday)');
      }
    }

    // Buffer minutes validation
    if (data.bufferMinutes !== undefined && data.bufferMinutes !== null) {
      if (!Number.isInteger(data.bufferMinutes) || data.bufferMinutes < 0 || data.bufferMinutes > 120) {
        errors.push('Buffer minutes must be between 0 and 120');
      }
    }

    // Display order validation
    if (data.displayOrder !== undefined && data.displayOrder !== null) {
      if (!Number.isInteger(data.displayOrder) || data.displayOrder < 0) {
        errors.push('Display order must be a non-negative integer');
      }
    }

    // Location ID validation (optional)
    if (data.locationId !== undefined && data.locationId !== null) {
      if (!Number.isInteger(parseInt(data.locationId)) || data.locationId <= 0) {
        errors.push('Location ID must be a positive integer');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Helper to parse time string to minutes for comparison
   */
  parseTimeOnly(timeString) {
    if (!timeString) return 0;
    
    // Handle both "HH:mm" and "HH:mm:ss" formats
    const timeParts = timeString.split(':');
    if (timeParts.length < 2) return 0;
    
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    
    return hours * 60 + minutes;
  },

  /**
   * Helper to format time for display
   */
  formatTimeForDisplay(timeString) {
    if (!timeString) return '';
    
    const timeParts = timeString.split(':');
    if (timeParts.length < 2) return timeString;
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    // Format as 12-hour time
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
  },

  /**
   * Helper to get active days as array
   */
  getActiveDaysArray(activeDaysString) {
    if (!activeDaysString) return [];
    
    return activeDaysString
      .split(',')
      .map(day => parseInt(day.trim(), 10))
      .filter(day => !isNaN(day) && day >= 0 && day <= 6);
  },

  /**
   * Helper to get day names from active days string
   */
  getActiveDayNames(activeDaysString) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const activeDays = this.getActiveDaysArray(activeDaysString);
    
    return activeDays.map(day => dayNames[day]).join(', ');
  },

  /**
   * Helper to create active days string from array
   */
  createActiveDaysString(daysArray) {
    if (!Array.isArray(daysArray)) return '';
    
    return daysArray
      .filter(day => Number.isInteger(day) && day >= 0 && day <= 6)
      .sort()
      .join(',');
  },

  /**
   * Helper to check if time slot is active on a given date
   */
  isActiveOnDate(timeSlot, date) {
    if (!timeSlot.activeDays || !date) return false;
    
    const dayOfWeek = new Date(date).getDay();
    const activeDays = this.getActiveDaysArray(timeSlot.activeDays);
    
    return activeDays.includes(dayOfWeek);
  },

  /**
   * Helper to calculate duration in minutes
   */
  calculateDuration(startTime, endTime) {
    const startMinutes = this.parseTimeOnly(startTime);
    const endMinutes = this.parseTimeOnly(endTime);
    
    return endMinutes - startMinutes;
  },

  /**
   * Helper to get time slot status based on availability
   */
  getTimeSlotStatus(timeSlot) {
    if (!timeSlot.isActive) return 'inactive';
    
    if (timeSlot.currentBookings === undefined) return 'unknown';
    
    const utilizationRate = timeSlot.maxVisitors > 0 ? timeSlot.currentBookings / timeSlot.maxVisitors : 0;
    
    if (utilizationRate >= 1) return 'full';
    if (utilizationRate >= 0.8) return 'warning';
    
    return 'available';
  },

  /**
   * Helper to get status display text
   */
  getStatusDisplayText(status) {
    const statusMap = {
      'available': 'Available',
      'warning': 'Limited',
      'full': 'Full',
      'inactive': 'Inactive',
      'unknown': 'Unknown'
    };
    
    return statusMap[status] || 'Unknown';
  },

  /**
   * Helper to get status color class
   */
  getStatusColorClass(status) {
    const colorMap = {
      'available': 'text-green-600 bg-green-100',
      'warning': 'text-yellow-600 bg-yellow-100',
      'full': 'text-red-600 bg-red-100',
      'inactive': 'text-gray-600 bg-gray-100',
      'unknown': 'text-gray-600 bg-gray-100'
    };
    
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  }
};

export default timeSlotsService;