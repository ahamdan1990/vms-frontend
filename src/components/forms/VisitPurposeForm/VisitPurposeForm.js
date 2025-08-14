// src/components/forms/VisitPurposeForm/VisitPurposeForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Visit Purpose Form Component
 * Handles both create and edit operations for visit purposes
 */
const VisitPurposeForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  isEdit = false
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requiresApproval: false,
    isActive: true,
    displayOrder: '',
    colorCode: '#6B7280',
    iconName: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        requiresApproval: initialData.requiresApproval || false,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        displayOrder: initialData.displayOrder?.toString() || '',
        colorCode: initialData.colorCode || '#6B7280',
        iconName: initialData.iconName || ''
      });
    }
  }, [initialData]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Purpose name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Purpose name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      errors.name = 'Purpose name must be less than 100 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    // Display order validation
    if (formData.displayOrder && !/^\d+$/.test(formData.displayOrder)) {
      errors.displayOrder = 'Display order must be a number';
    }

    // Color code validation
    if (formData.colorCode && !/^#[0-9A-F]{6}$/i.test(formData.colorCode)) {
      errors.colorCode = 'Color code must be a valid hex color (e.g., #6B7280)';
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
      ...formData,
      displayOrder: formData.displayOrder ? parseInt(formData.displayOrder, 10) : null
    };

    try {
      await onSubmit(submissionData);
    } catch (error) {
      // Error handling is done by parent component
      console.error('Form submission error:', error);
    }
  };

  // Predefined color options
  const colorOptions = [
    { value: '#6B7280', label: 'Gray', preview: '#6B7280' },
    { value: '#3B82F6', label: 'Blue', preview: '#3B82F6' },
    { value: '#10B981', label: 'Green', preview: '#10B981' },
    { value: '#F59E0B', label: 'Yellow', preview: '#F59E0B' },
    { value: '#EF4444', label: 'Red', preview: '#EF4444' },
    { value: '#8B5CF6', label: 'Purple', preview: '#8B5CF6' },
    { value: '#06B6D4', label: 'Cyan', preview: '#06B6D4' },
    { value: '#F97316', label: 'Orange', preview: '#F97316' }
  ];
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
          
          {/* Purpose Name */}
          <Input
            label="Purpose Name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={touched.name ? formErrors.name : undefined}
            required
            placeholder="e.g., Meeting, Delivery, Interview"
            maxLength={100}
          />

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
              placeholder="Optional description of the visit purpose..."
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

        {/* Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
          
          {/* Approval Requirement */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiresApproval"
              checked={formData.requiresApproval}
              onChange={(e) => handleChange('requiresApproval', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requiresApproval" className="ml-2 block text-sm text-gray-900">
              Requires admin approval
            </label>
          </div>

          {/* Active Status */}
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

          {/* Display Order */}
          <Input
            label="Display Order"
            type="number"
            value={formData.displayOrder}
            onChange={(e) => handleChange('displayOrder', e.target.value)}
            onBlur={() => handleBlur('displayOrder')}
            error={touched.displayOrder ? formErrors.displayOrder : undefined}
            placeholder="Optional sort order (lower numbers appear first)"
            min="0"
            max="9999"
          />
        </div>
        {/* Appearance */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
          
          {/* Color Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="space-y-3">
              {/* Color Picker Grid */}
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleChange('colorCode', color.value)}
                    className={`p-3 rounded-md border-2 transition-all ${
                      formData.colorCode === color.value
                        ? 'border-gray-400 ring-2 ring-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-6 rounded"
                      style={{ backgroundColor: color.preview }}
                    />
                    <div className="text-xs text-gray-600 mt-1">{color.label}</div>
                  </button>
                ))}
              </div>
              
              {/* Custom Color Input */}
              <Input
                label="Custom Color Code"
                type="text"
                value={formData.colorCode}
                onChange={(e) => handleChange('colorCode', e.target.value)}
                onBlur={() => handleBlur('colorCode')}
                error={touched.colorCode ? formErrors.colorCode : undefined}
                placeholder="#6B7280"
                maxLength={7}
              />
            </div>
          </div>

          {/* Icon Name */}
          <Input
            label="Icon Name"
            type="text"
            value={formData.iconName}
            onChange={(e) => handleChange('iconName', e.target.value)}
            onBlur={() => handleBlur('iconName')}
            error={touched.iconName ? formErrors.iconName : undefined}
            placeholder="Optional icon identifier"
            maxLength={50}
            helpText="Single character or icon name for display purposes"
          />
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Preview</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: formData.colorCode || '#6B7280' }}
              >
                {formData.iconName ? formData.iconName.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {formData.name || 'Purpose Name'}
                </div>
                {formData.description && (
                  <div className="text-sm text-gray-500">
                    {formData.description}
                  </div>
                )}
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    formData.requiresApproval 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {formData.requiresApproval ? 'Approval Required' : 'No Approval Required'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    formData.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
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
            {isEdit ? 'Update Purpose' : 'Create Purpose'}
          </Button>
        </div>
      </form>
    </div>
  );
};

// PropTypes validation
VisitPurposeForm.propTypes = {
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

export default VisitPurposeForm;