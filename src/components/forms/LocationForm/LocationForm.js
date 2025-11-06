// src/components/forms/LocationForm/LocationForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Badge from '../../common/Badge/Badge';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { extractErrorMessage } from '../../../utils/errorUtils';
import { getActiveLocations } from '../../../store/slices/locationsSlice';
import { selectActiveLocationsForDropdown, selectActiveLocationsLoading } from '../../../store/selectors/locationSelectors';

/**
 * Location Form Component
 * Handles both create and edit operations for locations with hierarchical structure
 */
const LocationForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  isEdit = false
}) => {
  const dispatch = useDispatch();
  
  // Get available locations for parent selection
  const availableLocations = useSelector(selectActiveLocationsForDropdown);
  const locationsLoading = useSelector(selectActiveLocationsLoading);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    locationType: 'Room',
    floor: '',
    building: '',
    zone: '',
    parentLocationId: null,
    displayOrder: '',
    maxCapacity: '',
    requiresEscort: false,
    accessLevel: 'Standard',
    isActive: true
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Load available locations on mount
  useEffect(() => {
    dispatch(getActiveLocations());
  }, [dispatch]);

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
        locationType: initialData.locationType || 'Room',
        floor: initialData.floor || '',
        building: initialData.building || '',
        zone: initialData.zone || '',
        parentLocationId: initialData.parentLocationId || null,
        displayOrder: initialData.displayOrder?.toString() || '',
        maxCapacity: initialData.maxCapacity?.toString() || '',
        requiresEscort: initialData.requiresEscort || false,
        accessLevel: initialData.accessLevel || 'Standard',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    }
  }, [initialData]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Location name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Location name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      errors.name = 'Location name must be less than 100 characters';
    }

    // Code validation (optional but must be unique if provided)
    if (formData.code && !/^[A-Z0-9-_]+$/i.test(formData.code)) {
      errors.code = 'Location code must contain only letters, numbers, hyphens, and underscores';
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    // Display order validation
    if (formData.displayOrder && !/^\d+$/.test(formData.displayOrder)) {
      errors.displayOrder = 'Display order must be a number';
    }

    // Capacity validation
    if (formData.maxCapacity && (!/^\d+$/.test(formData.maxCapacity) || parseInt(formData.maxCapacity) <= 0)) {
      errors.maxCapacity = 'Max capacity must be a positive number';
    }

    // Floor validation
    if (formData.floor && formData.floor.length > 20) {
      errors.floor = 'Floor must be less than 20 characters';
    }

    // Building validation
    if (formData.building && formData.building.length > 100) {
      errors.building = 'Building name must be less than 100 characters';
    }

    // Zone validation
    if (formData.zone && formData.zone.length > 50) {
      errors.zone = 'Zone must be less than 50 characters';
    }

    // Hierarchy validation - prevent circular references
    if (formData.parentLocationId && isEdit && initialData) {
      if (formData.parentLocationId === initialData.id) {
        errors.parentLocationId = 'A location cannot be its own parent';
      }
      // Additional check for circular reference would require more complex logic
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
    validateForm();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = Object.keys(formData);
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    if (!validateForm()) {
      return;
    }

    // Prepare submission data
    const submissionData = {
      name: formData.name,
      code: formData.code,
      description: formData.description || null,
      locationType: formData.locationType,
      floor: formData.floor || null,
      building: formData.building || null,
      zone: formData.zone || null,
      parentLocationId: formData.parentLocationId || null,
      displayOrder: formData.displayOrder ? parseInt(formData.displayOrder, 10) : 0,
      maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity, 10) : 0,
      requiresEscort: formData.requiresEscort,
      accessLevel: formData.accessLevel || null
    };

    // For edit operations, include isActive
    if (isEdit) {
      submissionData.isActive = formData.isActive;
    }

    try {
      await onSubmit(submissionData);
    } catch (error) {
      // Error handling is done by parent component
      console.error('Form submission error:', error);
    }
  };

  // Location type options
  const locationTypes = [
    { value: 'Building', label: 'Building' },
    { value: 'Floor', label: 'Floor' },
    { value: 'Room', label: 'Room' },
    { value: 'Zone', label: 'Zone' },
    { value: 'Parking', label: 'Parking' },
    { value: 'Other', label: 'Other' }
  ];

  // Access level options
  const accessLevels = [
    { value: 'Standard', label: 'Standard Access' },
    { value: 'Medium', label: 'Medium Security' },
    { value: 'High', label: 'High Security' },
    { value: 'Restricted', label: 'Restricted Access' }
  ];

  // Filter parent locations (exclude self and children if editing)
  const getAvailableParentLocations = () => {
    if (!isEdit || !initialData) return availableLocations;
    
    // For editing, exclude the location itself and its descendants
    return availableLocations.filter(location => {
      if (location.id === initialData.id) return false;
      // TODO: Add logic to exclude descendants
      return true;
    });
  };
  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Name */}
            <Input
              label="Location Name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              error={touched.name ? formErrors.name : undefined}
              required
              placeholder="e.g., Conference Room A, Building 1, Floor 2"
              maxLength={100}
            />

            {/* Location Code */}
            <Input
              label="Location Code"
              type="text"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('code')}
              error={touched.code ? formErrors.code : undefined}
              placeholder="e.g., CONF-A, B1-F2-R101"
              maxLength={20}
              helpText="Optional unique identifier (letters, numbers, hyphens, underscores)"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              rows={3}
              maxLength={500}
              placeholder="Optional description of the location..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.description && formErrors.description
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            {touched.description && formErrors.description && (
              <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>
        </div>

        {/* Location Type and Hierarchy */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Type and Hierarchy</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.locationType}
                onChange={(e) => handleChange('locationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {locationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Location
              </label>
              <select
                value={formData.parentLocationId || ''}
                onChange={(e) => handleChange('parentLocationId', e.target.value ? parseInt(e.target.value) : null)}
                disabled={locationsLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              >
                <option value="">No Parent (Root Location)</option>
                {getAvailableParentLocations().map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.locationType})
                  </option>
                ))}
              </select>
              {locationsLoading && (
                <p className="mt-1 text-sm text-gray-500">Loading locations...</p>
              )}
              {touched.parentLocationId && formErrors.parentLocationId && (
                <p className="mt-1 text-sm text-red-600">{formErrors.parentLocationId}</p>
              )}
            </div>
          </div>

          {/* Geographic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Building"
              type="text"
              value={formData.building}
              onChange={(e) => handleChange('building', e.target.value)}
              onBlur={() => handleBlur('building')}
              error={touched.building ? formErrors.building : undefined}
              placeholder="e.g., Main Building, Tower A"
              maxLength={100}
            />

            <Input
              label="Floor"
              type="text"
              value={formData.floor}
              onChange={(e) => handleChange('floor', e.target.value)}
              onBlur={() => handleBlur('floor')}
              error={touched.floor ? formErrors.floor : undefined}
              placeholder="e.g., 1, 2, B1, Mezzanine"
              maxLength={20}
            />

            <Input
              label="Zone"
              type="text"
              value={formData.zone}
              onChange={(e) => handleChange('zone', e.target.value)}
              onBlur={() => handleBlur('zone')}
              error={touched.zone ? formErrors.zone : undefined}
              placeholder="e.g., North Wing, East Side"
              maxLength={50}
            />
          </div>
        </div>

        {/* Capacity and Access */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Capacity and Access Control</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Max Capacity */}
            <Input
              label="Maximum Capacity"
              type="number"
              value={formData.maxCapacity}
              onChange={(e) => handleChange('maxCapacity', e.target.value)}
              onBlur={() => handleBlur('maxCapacity')}
              error={touched.maxCapacity ? formErrors.maxCapacity : undefined}
              placeholder="Leave empty if no limit"
              min="1"
              max="10000"
              helpText="Maximum number of people allowed"
            />

            {/* Access Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Level
              </label>
              <select
                value={formData.accessLevel}
                onChange={(e) => handleChange('accessLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {accessLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Order */}
            <Input
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleChange('displayOrder', e.target.value)}
              onBlur={() => handleBlur('displayOrder')}
              error={touched.displayOrder ? formErrors.displayOrder : undefined}
              placeholder="Optional sort order"
              min="0"
              max="9999"
              helpText="Lower numbers appear first"
            />
          </div>

          {/* Security Options */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresEscort"
                checked={formData.requiresEscort}
                onChange={(e) => handleChange('requiresEscort', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresEscort" className="ml-2 block text-sm text-gray-900">
                Requires escort for visitors
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active (available for selection)
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Preview</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="font-medium text-gray-900">
                  {formData.name || 'Location Name'}
                  {formData.code && (
                    <span className="ml-2 text-sm text-gray-500">({formData.code})</span>
                  )}
                </div>
                <Badge variant="secondary" size="sm">
                  {formData.locationType}
                </Badge>
              </div>
              
              {formData.description && (
                <div className="text-sm text-gray-600">
                  {formData.description}
                </div>
              )}
              
              {(formData.building || formData.floor || formData.zone) && (
                <div className="text-xs text-gray-500">
                  {[formData.building, formData.floor, formData.zone].filter(Boolean).join(' • ')}
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-sm">
                {formData.maxCapacity && (
                  <span className="flex items-center space-x-1">
                    <UserGroupIcon className="w-4 h-4 text-gray-400" />
                    <span>Max: {formData.maxCapacity}</span>
                  </span>
                )}
                
                <Badge
                  variant={formData.accessLevel === 'High' ? 'danger' : formData.accessLevel === 'Medium' ? 'warning' : 'secondary'}
                  size="sm"
                >
                  {formData.accessLevel} Access
                </Badge>
                
                {formData.requiresEscort && (
                  <span className="text-orange-600 text-xs font-medium">Escort Required</span>
                )}
                
                <Badge
                  variant={formData.isActive ? 'success' : 'secondary'}
                  size="sm"
                >
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
            {isEdit ? 'Update Location' : 'Create Location'}
          </Button>
        </div>
      </form>
    </div>
  );
};

// PropTypes validation
LocationForm.propTypes = {
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

export default LocationForm;