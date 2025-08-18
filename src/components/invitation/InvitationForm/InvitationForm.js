// src/components/invitation/InvitationForm/InvitationForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Card from '../../common/Card/Card';
import Badge from '../../common/Badge/Badge';
import AutocompleteInput from '../../common/AutocompleteInput/AutocompleteInput';

// Selectors
import { selectVisitorsList } from '../../../store/selectors/visitorSelectors';
import { selectLocationsList } from '../../../store/selectors/locationSelectors';
import { selectVisitPurposesList } from '../../../store/selectors/visitPurposeSelectors';

// Icons
import {
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  StarIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Utils
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Comprehensive Invitation Form Component
 * Handles both create and edit operations for invitations
 * Multi-step form with validation and visitor/location selection
 */
const InvitationForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  isEdit = false
}) => {
  
  // Redux selectors for autocomplete data
  const visitors = useSelector(selectVisitorsList);
  const locations = useSelector(selectLocationsList);
  const visitPurposes = useSelector(selectVisitPurposesList);

  // Form state
  const [formData, setFormData] = useState({
    // Required fields
    visitorId: null,
    visitorIds: [], // For group invitations
    subject: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    
    // Optional fields
    visitPurposeId: null,
    locationId: null,
    type: 'Single',
    message: '',
    expectedVisitorCount: 1,
    specialInstructions: '',
    
    // Requirements
    requiresApproval: true,
    requiresEscort: false,
    requiresBadge: true,
    needsParking: false,
    parkingInstructions: '',
    
    // Template and submission
    templateId: null,
    submitForApproval: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [selectedVisitors, setSelectedVisitors] = useState([]); // For group invitations
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedVisitPurpose, setSelectedVisitPurpose] = useState(null);

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        visitorId: initialData.visitorId || null,
        subject: initialData.subject || '',
        scheduledStartTime: formatDateTimeForInput(initialData.scheduledStartTime),
        scheduledEndTime: formatDateTimeForInput(initialData.scheduledEndTime),
        visitPurposeId: initialData.visitPurposeId || null,
        locationId: initialData.locationId || null,
        type: initialData.type || 'Single',
        message: initialData.message || '',
        expectedVisitorCount: initialData.expectedVisitorCount || 1,
        specialInstructions: initialData.specialInstructions || '',
        requiresApproval: initialData.requiresApproval ?? true,
        requiresEscort: initialData.requiresEscort ?? false,
        requiresBadge: initialData.requiresBadge ?? true,
        needsParking: initialData.needsParking ?? false,
        parkingInstructions: initialData.parkingInstructions || '',
        templateId: initialData.templateId || null,
        submitForApproval: false
      });

      // Set selected objects for autocomplete
      if (initialData.visitor) {
        setSelectedVisitor(initialData.visitor);
      }
      if (initialData.location) {
        setSelectedLocation(initialData.location);
      }
      if (initialData.visitPurpose) {
        setSelectedVisitPurpose(initialData.visitPurpose);
      }
    }
  }, [initialData]);

  // Validation functions
  const validateField = (field, value) => {
    switch (field) {
      case 'visitorId':
        if (!value && formData.type === 'Single') return 'Visitor is required';
        break;
      case 'visitorIds':
        if (formData.type === 'Group' && (!value || value.length === 0)) return 'At least one visitor is required for group invitations';
        break;
      case 'subject':
        if (!value?.trim()) return 'Subject is required';
        if (value.length > 200) return 'Subject must be less than 200 characters';
        break;
      case 'scheduledStartTime':
        if (!value) return 'Start time is required';
        if (new Date(value) <= new Date()) return 'Start time must be in the future';
        break;
      case 'scheduledEndTime':
        if (!value) return 'End time is required';
        if (formData.scheduledStartTime && new Date(value) <= new Date(formData.scheduledStartTime)) {
          return 'End time must be after start time';
        }
        break;
      case 'expectedVisitorCount':
        if (value < 1) return 'Must have at least 1 visitor';
        if (value > 100) return 'Cannot exceed 100 visitors';
        break;
      case 'message':
        if (value && value.length > 1000) return 'Message must be less than 1000 characters';
        break;
      case 'specialInstructions':
        if (value && value.length > 500) return 'Special instructions must be less than 500 characters';
        break;
      case 'parkingInstructions':
        if (value && value.length > 200) return 'Parking instructions must be less than 200 characters';
        break;
      default:
        break;
    }
    return null;
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all required and conditional fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    // Cross-field validation
    if (formData.scheduledStartTime && formData.scheduledEndTime) {
      const startTime = new Date(formData.scheduledStartTime);
      const endTime = new Date(formData.scheduledEndTime);
      const durationHours = (endTime - startTime) / (1000 * 60 * 60);
      
      if (durationHours > 24) {
        errors.scheduledEndTime = 'Visit duration cannot exceed 24 hours';
      } else if (durationHours < 0.25) {
        errors.scheduledEndTime = 'Visit duration must be at least 15 minutes';
      }
    }

    // Parking validation
    if (formData.needsParking && !formData.parkingInstructions?.trim()) {
      errors.parkingInstructions = 'Parking instructions are required when parking is needed';
    }

    return errors;
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle field blur
  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate field on blur
    const error = validateField(field, formData[field]);
    if (error) {
      setFormErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  // Handle visitor selection with auto-population of preferences
  const handleVisitorSelect = (visitor) => {
    setSelectedVisitor(visitor);
    handleChange('visitorId', visitor?.id || null);
    
    // Auto-populate location and visit purpose from visitor preferences
    if (visitor) {
      // Set preferred location if available and not already set
      if (visitor.preferredLocation && !selectedLocation) {
        setSelectedLocation(visitor.preferredLocation);
        handleChange('locationId', visitor.preferredLocation.id);
      }
      
      // Set default visit purpose if available and not already set
      if (visitor.defaultVisitPurpose && !selectedVisitPurpose) {
        setSelectedVisitPurpose(visitor.defaultVisitPurpose);
        handleChange('visitPurposeId', visitor.defaultVisitPurpose.id);
      }
    }
  };

  // Handle adding visitor to group
  const handleAddVisitorToGroup = (visitor) => {
    if (visitor && !selectedVisitors.find(v => v.id === visitor.id)) {
      const updatedVisitors = [...selectedVisitors, visitor];
      setSelectedVisitors(updatedVisitors);
      handleChange('visitorIds', updatedVisitors.map(v => v.id));
      handleChange('expectedVisitorCount', updatedVisitors.length);
    }
  };

  // Handle removing visitor from group
  const handleRemoveVisitorFromGroup = (visitorId) => {
    const updatedVisitors = selectedVisitors.filter(v => v.id !== visitorId);
    setSelectedVisitors(updatedVisitors);
    handleChange('visitorIds', updatedVisitors.map(v => v.id));
    handleChange('expectedVisitorCount', Math.max(1, updatedVisitors.length));
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    handleChange('locationId', location?.id || null);
  };

  // Handle visit purpose selection
  const handleVisitPurposeSelect = (visitPurpose) => {
    setSelectedVisitPurpose(visitPurpose);
    handleChange('visitPurposeId', visitPurpose?.id || null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare submission data
    const submissionData = {
      ...formData,
      scheduledStartTime: new Date(formData.scheduledStartTime).toISOString(),
      scheduledEndTime: new Date(formData.scheduledEndTime).toISOString()
    };

    try {
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Helper to set preset times
  const setPresetTime = (startHour, durationHours) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(startHour, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startHour + durationHours, 0, 0, 0);

    handleChange('scheduledStartTime', formatDateTimeForInput(startDate));
    handleChange('scheduledEndTime', formatDateTimeForInput(endDate));
  };

  // Helper to format datetime for display
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Helper to calculate visit duration
  const getVisitDuration = () => {
    if (formData.scheduledStartTime && formData.scheduledEndTime) {
      const start = new Date(formData.scheduledStartTime);
      const end = new Date(formData.scheduledEndTime);
      const durationMs = end - start;
      const durationHours = durationMs / (1000 * 60 * 60);
      return durationHours > 0 ? durationHours.toFixed(1) : 0;
    }
    return 0;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">
            {Array.isArray(error) ? (
              <ul className="list-disc list-inside space-y-1">
                {error.map((err, index) => (
                  <li key={index}>{extractErrorMessage(err)}</li>
                ))}
              </ul>
            ) : (
              extractErrorMessage(error)
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              onBlur={() => handleBlur('subject')}
              error={touched.subject ? formErrors.subject : undefined}
              required
              maxLength={200}
              placeholder="Meeting with John Doe"
            />

            {/* Visitor Selection */}
            {formData.type === 'Single' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visitor <span className="text-red-500">*</span>
                </label>
                <AutocompleteInput
                  options={visitors}
                  value={selectedVisitor}
                  onChange={handleVisitorSelect}
                  getOptionLabel={(visitor) => `${visitor.firstName} ${visitor.lastName}`}
                  getOptionDescription={(visitor) => visitor.email}
                  placeholder="Search for a visitor..."
                  error={touched.visitorId ? formErrors.visitorId : undefined}
                  required
                />
                {touched.visitorId && formErrors.visitorId && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.visitorId}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visitors <span className="text-red-500">*</span>
                </label>
                
                {/* Add Visitor Input */}
                <div className="mb-3">
                  <AutocompleteInput
                    options={visitors}
                    value={null}
                    onChange={handleAddVisitorToGroup}
                    getOptionLabel={(visitor) => `${visitor.firstName} ${visitor.lastName}`}
                    getOptionDescription={(visitor) => visitor.email}
                    placeholder="Search and add visitors to group..."
                  />
                </div>

                {/* Selected Visitors List */}
                {selectedVisitors.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Selected Visitors ({selectedVisitors.length})
                    </p>
                    <div className="border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                      {selectedVisitors.map((visitor) => (
                        <div
                          key={visitor.id}
                          className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {visitor.firstName?.[0]}{visitor.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {visitor.firstName} {visitor.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{visitor.email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVisitorFromGroup(visitor.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expected Visitor Count Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Total Visitors
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.expectedVisitorCount}
                    onChange={(e) => handleChange('expectedVisitorCount', parseInt(e.target.value) || 1)}
                    className="w-full"
                    placeholder="Total number of expected visitors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include visitors not yet added to the list above
                  </p>
                </div>

                {touched.visitorIds && formErrors.visitorIds && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.visitorIds}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Purpose
                </label>
                <AutocompleteInput
                  options={visitPurposes}
                  value={selectedVisitPurpose}
                  onChange={handleVisitPurposeSelect}
                  getOptionLabel={(purpose) => purpose.name}
                  getOptionDescription={(purpose) => purpose.description}
                  placeholder="Select visit purpose..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <AutocompleteInput
                  options={locations}
                  value={selectedLocation}
                  onChange={handleLocationSelect}
                  getOptionLabel={(location) => location.name}
                  getOptionDescription={(location) => location.description}
                  placeholder="Select location..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Single">Single Visitor</option>
                  <option value="Group">Group Visit</option>
                  <option value="Recurring">Recurring Visit</option>
                  <option value="WalkIn">Walk-in</option>
                </select>
              </div>

              <Input
                label="Expected Visitor Count"
                type="number"
                min="1"
                max="100"
                value={formData.expectedVisitorCount}
                onChange={(e) => handleChange('expectedVisitorCount', parseInt(e.target.value) || 1)}
                onBlur={() => handleBlur('expectedVisitorCount')}
                error={touched.expectedVisitorCount ? formErrors.expectedVisitorCount : undefined}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                rows={3}
                maxLength={1000}
                placeholder="Additional details about the visit..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  touched.message && formErrors.message
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              {touched.message && formErrors.message && (
                <p className="mt-1 text-sm text-red-600">{formErrors.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.message.length}/1000 characters
              </p>
            </div>
          </div>
        </Card>

        {/* Schedule */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              📅 <strong>Date & Time Selection:</strong> Click on the date field to select a date, then click on the time portion to set the specific time for your visit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Start Date & Time"
                type="datetime-local"
                value={formData.scheduledStartTime}
                onChange={(e) => handleChange('scheduledStartTime', e.target.value)}
                onBlur={() => handleBlur('scheduledStartTime')}
                error={touched.scheduledStartTime ? formErrors.scheduledStartTime : undefined}
                min={new Date().toISOString().slice(0, 16)} // Prevent past dates
                // Removed step constraint for maximum flexibility
                required
                placeholder="YYYY-MM-DDTHH:MM"
              />
              <p className="mt-1 text-xs text-gray-500">
                Select both date and time for visit start
              </p>
            </div>

            <div>
              <Input
                label="End Date & Time"
                type="datetime-local"
                value={formData.scheduledEndTime}
                onChange={(e) => handleChange('scheduledEndTime', e.target.value)}
                onBlur={() => handleBlur('scheduledEndTime')}
                error={touched.scheduledEndTime ? formErrors.scheduledEndTime : undefined}
                min={formData.scheduledStartTime || new Date().toISOString().slice(0, 16)} // Must be after start time
                // Removed step constraint for maximum flexibility
                required
                placeholder="YYYY-MM-DDTHH:MM"
              />
              <p className="mt-1 text-xs text-gray-500">
                Select both date and time for visit end
              </p>
            </div>
          </div>

          {/* Quick Time Presets */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Time Presets (Today):</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPresetTime(9, 1)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                9:00 AM - 10:00 AM
              </button>
              <button
                type="button"
                onClick={() => setPresetTime(10, 2)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                10:00 AM - 12:00 PM
              </button>
              <button
                type="button"
                onClick={() => setPresetTime(14, 1)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                2:00 PM - 3:00 PM
              </button>
              <button
                type="button"
                onClick={() => setPresetTime(15, 2)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                3:00 PM - 5:00 PM
              </button>
            </div>
          </div>

          {getVisitDuration() > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Visit Duration: {getVisitDuration()} hours
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Requirements */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Requirements & Access</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.requiresApproval}
                    onChange={(e) => handleChange('requiresApproval', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Requires Approval</span>
                    <p className="text-sm text-gray-500">Must be approved before visit</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.requiresEscort}
                    onChange={(e) => handleChange('requiresEscort', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Requires Escort</span>
                    <p className="text-sm text-gray-500">Visitor must be escorted at all times</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.requiresBadge}
                    onChange={(e) => handleChange('requiresBadge', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Requires Badge</span>
                    <p className="text-sm text-gray-500">Visitor badge will be printed</p>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.needsParking}
                    onChange={(e) => handleChange('needsParking', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Needs Parking</span>
                    <p className="text-sm text-gray-500">Visitor requires parking space</p>
                  </div>
                </label>

                {isEdit && (
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.submitForApproval}
                      onChange={(e) => handleChange('submitForApproval', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Submit for Approval</span>
                      <p className="text-sm text-gray-500">Submit immediately after saving</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {formData.needsParking && (
              <Input
                label="Parking Instructions"
                type="text"
                value={formData.parkingInstructions}
                onChange={(e) => handleChange('parkingInstructions', e.target.value)}
                onBlur={() => handleBlur('parkingInstructions')}
                error={touched.parkingInstructions ? formErrors.parkingInstructions : undefined}
                maxLength={200}
                placeholder="Parking lot A, visitor spaces 1-10"
                required={formData.needsParking}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => handleChange('specialInstructions', e.target.value)}
                onBlur={() => handleBlur('specialInstructions')}
                rows={3}
                maxLength={500}
                placeholder="Any special requirements or instructions for the visit..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  touched.specialInstructions && formErrors.specialInstructions
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              {touched.specialInstructions && formErrors.specialInstructions && (
                <p className="mt-1 text-sm text-red-600">{formErrors.specialInstructions}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.specialInstructions.length}/500 characters
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading || Object.keys(formErrors).length > 0}
          >
            {isEdit ? 'Update Invitation' : 'Create Invitation'}
          </Button>
        </div>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && Object.keys(formErrors).length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
            <strong>Form Validation Errors ({Object.keys(formErrors).length}):</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {Object.entries(formErrors).map(([field, error]) => (
                <li key={field}>
                  <strong>{field}:</strong> {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

// PropTypes validation
InvitationForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object
  ]),
  isEdit: PropTypes.bool
};

export default InvitationForm;