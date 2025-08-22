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

      // Initialize selected days
      if (timeSlot.activeDays) {
        const daysArray = timeSlotsService.getActiveDaysArray(timeSlot.activeDays);
        setSelectedDays(daysArray);
      }
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
      : [...selectedDays, dayNumber].sort();

    setSelectedDays(newSelectedDays);
    
    const activeDaysString = timeSlotsService.createActiveDaysString(newSelectedDays);
    handleInputChange('activeDays', activeDaysString);
  };

  // Validate form
  const validateForm = () => {
    const validation = timeSlotsService.validateTimeSlotData(formData, isEdit);
    
    if (!validation.isValid) {
      const errors = {};
      validation.errors.forEach(error => {
        // Map error messages to field names
        if (error.includes('name')) errors.name = error;
        else if (error.includes('start time')) errors.startTime = error;
        else if (error.includes('end time')) errors.endTime = error;
        else if (error.includes('visitors')) errors.maxVisitors = error;
        else if (error.includes('days')) errors.activeDays = error;
        else if (error.includes('buffer')) errors.bufferMinutes = error;
        else if (error.includes('order')) errors.displayOrder = error;
        else if (error.includes('location')) errors.locationId = error;
        else errors.general = error;
      });
      
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        maxVisitors: parseInt(formData.maxVisitors),
        bufferMinutes: parseInt(formData.bufferMinutes),
        displayOrder: parseInt(formData.displayOrder),
        locationId: formData.locationId ? parseInt(formData.locationId) : null
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Day options
  const dayOptions = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
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
          <h3 className="text-lg font-medium text-gray-900">Active Days</h3>
          
          {validationErrors.activeDays && (
            <p className="text-sm text-red-600">{validationErrors.activeDays}</p>
          )}
          
          <div className="grid grid-cols-7 gap-2">
            {dayOptions.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayToggle(day.value)}
                className={`
                  p-3 text-center text-sm font-medium rounded-lg border transition-colors
                  ${selectedDays.includes(day.value)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="block md:hidden">{day.short}</div>
                <div className="hidden md:block">{day.label}</div>
              </button>
            ))}
          </div>
          
          <p className="text-sm text-gray-500">
            Select the days when this time slot is available
          </p>
        </div>

        {/* Status (for edit mode) */}
        {isEdit && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Status</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Time slot is active
              </label>
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