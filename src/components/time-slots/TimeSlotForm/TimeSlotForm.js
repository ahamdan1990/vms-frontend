// src/components/time-slots/TimeSlotForm/TimeSlotForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

// Components
import Input from '../../common/Input/Input';
import Select from '../../common/Select/Select';
import Button from '../../common/Button/Button';

// Services
import timeSlotsService from '../../../services/timeSlotsService';

// Utils
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Time Slot Form Component for create/edit operations
 */
const TimeSlotForm = ({
  timeSlot = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  submitText = 'Save',
  cancelText = 'Cancel'
}) => {
  // Redux state
  const { list: locations, loading: locationsLoading } = useSelector(state => state.locations);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    maxVisitors: 1,
    activeDays: '',
    locationId: null,
    bufferMinutes: 0,
    displayOrder: 0,
    isActive: true
  });

  const [selectedDays, setSelectedDays] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const isEdit = Boolean(timeSlot);

  // Initialize form data
  useEffect(() => {
    if (timeSlot) {
      setFormData({
        name: timeSlot.name || '',
        startTime: timeSlot.startTime || '',
        endTime: timeSlot.endTime || '',
        maxVisitors: timeSlot.maxVisitors || 1,
        activeDays: timeSlot.activeDays || '',
        locationId: timeSlot.locationId || null,
        bufferMinutes: timeSlot.bufferMinutes || 0,
        displayOrder: timeSlot.displayOrder || 0,
        isActive: timeSlot.isActive !== undefined ? timeSlot.isActive : true
      });

      // Initialize selected days - Backend format: "1,2,3,4,5" (1=Monday, 7=Sunday)
      if (timeSlot.activeDays) {
        try {
          const daysArray = timeSlot.activeDays
            .split(',')
            .map(day => parseInt(day.trim()))
            .filter(day => day >= 1 && day <= 7);
          setSelectedDays(daysArray);
        } catch (error) {
          console.error('Error parsing active days:', error);
          setSelectedDays([]);
        }
      } else {
        setSelectedDays([]);
      }
    } else {
      // Reset form for create mode
      setSelectedDays([]);
    }
  }, [timeSlot]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle day selection
  const handleDayToggle = (dayNumber) => {
    const newSelectedDays = selectedDays.includes(dayNumber)
      ? selectedDays.filter(day => day !== dayNumber)
      : [...selectedDays, dayNumber].sort((a, b) => a - b); // Sort numerically

    setSelectedDays(newSelectedDays);
    
    // Create backend-compatible active days string: "1,2,3,4,5"
    const activeDaysString = newSelectedDays.join(',');
    handleInputChange('activeDays', activeDaysString);
    
    // Clear active days validation error when user selects days
    if (newSelectedDays.length > 0 && validationErrors.activeDays) {
      setValidationErrors(prev => ({
        ...prev,
        activeDays: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Basic field validation
    if (!formData.name.trim()) {
      errors.name = 'Time slot name is required';
    }
    
    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      errors.endTime = 'End time is required';
    }
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.endTime = 'End time must be after start time';
    }
    
    if (!formData.maxVisitors || formData.maxVisitors < 1) {
      errors.maxVisitors = 'Maximum visitors must be at least 1';
    }
    
    // Active days validation - ensure we have selected days and correct format
    if (selectedDays.length === 0) {
      errors.activeDays = 'Please select at least one active day';
    } else {
      // Validate that all selected days are in valid range (1-7)
      const invalidDays = selectedDays.filter(day => day < 1 || day > 7);
      if (invalidDays.length > 0) {
        errors.activeDays = 'Invalid day selection detected. Please reselect days.';
      }
    }
    
    // Call service validation if available
    try {
      const validation = timeSlotsService.validateTimeSlotData(formData, isEdit);
      if (!validation.isValid && validation.errors) {
        validation.errors.forEach(error => {
          // Map error messages to field names
          if (error.includes('name') && !errors.name) errors.name = error;
          else if (error.includes('start time') && !errors.startTime) errors.startTime = error;
          else if (error.includes('end time') && !errors.endTime) errors.endTime = error;
          else if (error.includes('visitors') && !errors.maxVisitors) errors.maxVisitors = error;
          else if (error.includes('days') && !errors.activeDays) errors.activeDays = error;
          else if (error.includes('buffer') && !errors.bufferMinutes) errors.bufferMinutes = error;
          else if (error.includes('order') && !errors.displayOrder) errors.displayOrder = error;
          else if (error.includes('location') && !errors.locationId) errors.locationId = error;
          else if (!errors.general) errors.general = error;
        });
      }
    } catch (serviceError) {
      console.warn('Service validation failed:', serviceError);
      // Continue with client-side validation only
    }
    
    const hasErrors = Object.keys(errors).length > 0;
    setValidationErrors(errors);
    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Ensure activeDays is in correct format before submission
      const activeDaysString = selectedDays.sort((a, b) => a - b).join(',');
      
      const submitData = {
        ...formData,
        activeDays: activeDaysString, // Ensure correct format: "1,2,3,4,5"
        maxVisitors: parseInt(formData.maxVisitors),
        bufferMinutes: parseInt(formData.bufferMinutes),
        displayOrder: parseInt(formData.displayOrder),
        locationId: formData.locationId ? parseInt(formData.locationId) : null
      };

      // Debug log to verify format
      console.log('Submitting time slot data:', {
        ...submitData,
        selectedDaysArray: selectedDays,
        activeDaysString: activeDaysString
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Day options - Backend expects: 1=Monday, 2=Tuesday, ..., 7=Sunday
  const dayOptions = [
    { value: 1, label: 'Monday', short: 'Mon', color: 'blue' },
    { value: 2, label: 'Tuesday', short: 'Tue', color: 'blue' },
    { value: 3, label: 'Wednesday', short: 'Wed', color: 'blue' },
    { value: 4, label: 'Thursday', short: 'Thu', color: 'blue' },
    { value: 5, label: 'Friday', short: 'Fri', color: 'blue' },
    { value: 6, label: 'Saturday', short: 'Sat', color: 'purple' },
    { value: 7, label: 'Sunday', short: 'Sun', color: 'red' }
  ];

  // Location options
  const locationOptions = [
    { value: '', label: 'No specific location' },
    ...locations.map(location => ({
      value: location.id.toString(),
      label: location.name
    }))
  ];

  // Calculate duration
  const duration = formData.startTime && formData.endTime 
    ? timeSlotsService.calculateDuration(formData.startTime, formData.endTime)
    : 0;

  return (
    <div className="space-y-6">
      {/* General Error */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {Array.isArray(error) ? 'Validation Errors' : 'Error'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {Array.isArray(error) ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {error.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{extractErrorMessage(error)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {validationErrors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{validationErrors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Time Slot Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={validationErrors.name}
              required
              placeholder="e.g., Morning Session"
            />

            <Select
              label="Location"
              value={formData.locationId?.toString() || ''}
              onChange={(e) => handleInputChange('locationId', e.target.value || null)}
              options={locationOptions}
              loading={locationsLoading}
              error={validationErrors.locationId}
              helperText="Optional: Assign to specific location"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="time"
              label="Start Time"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              error={validationErrors.startTime}
              required
            />

            <Input
              type="time"
              label="End Time"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              error={validationErrors.endTime}
              required
            />

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
                {duration > 0 ? `${duration} minutes` : 'Select times'}
              </div>
            </div>
          </div>
        </div>

        {/* Capacity and Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Capacity & Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="number"
              label="Maximum Visitors"
              value={formData.maxVisitors}
              onChange={(e) => handleInputChange('maxVisitors', parseInt(e.target.value) || 1)}
              error={validationErrors.maxVisitors}
              required
              min="1"
              max="1000"
            />

            <Input
              type="number"
              label="Buffer Minutes"
              value={formData.bufferMinutes}
              onChange={(e) => handleInputChange('bufferMinutes', parseInt(e.target.value) || 0)}
              error={validationErrors.bufferMinutes}
              min="0"
              max="120"
              helperText="Time between appointments"
            />

            <Input
              type="number"
              label="Display Order"
              value={formData.displayOrder}
              onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
              error={validationErrors.displayOrder}
              min="0"
              helperText="Sort order in lists"
            />
          </div>
        </div>

        {/* Active Days */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Days
                <span className="text-red-500 ml-1">*</span>
              </label>
              <p className="text-sm text-gray-600">
                Select the days when this time slot is available for scheduling
              </p>
            </div>
            
            {validationErrors.activeDays && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{validationErrors.activeDays}</p>
              </div>
            )}
            
            <div className="grid grid-cols-7 gap-3">
              {dayOptions.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                const isWeekend = day.value === 6 || day.value === 7; // Saturday or Sunday
                
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`
                      relative px-3 py-4 text-center font-medium rounded-xl border-2 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      ${isSelected
                        ? isWeekend
                          ? 'bg-purple-600 text-white border-purple-600 shadow-lg transform scale-105'
                          : 'bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105'
                        : isWeekend
                          ? 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50 hover:border-purple-300'
                          : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                      }
                    `}
                  >
                    <div className="text-xs font-semibold tracking-wide uppercase">
                      {day.short}
                    </div>
                    <div className="text-xs mt-1 hidden sm:block">
                      {day.label}
                    </div>
                    
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white">
                        <svg className="w-2 h-2 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {selectedDays.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Selected Days:</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {selectedDays
                        .sort((a, b) => a - b)
                        .map(day => dayOptions.find(d => d.value === day)?.label)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedDays.length === 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    Please select at least one day when this time slot will be available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Status (for edit mode) */}
        {isEdit && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Status</h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-3 block">
                  <span className="text-sm font-medium text-gray-900">Time slot is active</span>
                  <p className="text-sm text-gray-500">
                    Active time slots are available for invitation scheduling
                  </p>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          
          <Button
            type="submit"
            loading={loading}
            disabled={selectedDays.length === 0}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </div>
  );
};

TimeSlotForm.propTypes = {
  timeSlot: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  submitText: PropTypes.string,
  cancelText: PropTypes.string
};

export default TimeSlotForm;