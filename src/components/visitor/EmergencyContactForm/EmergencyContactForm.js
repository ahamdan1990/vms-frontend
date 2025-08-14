// src/components/visitor/EmergencyContactForm/EmergencyContactForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Badge from '../../common/Badge/Badge';
import { extractErrorMessage } from '../../../utils/errorUtils';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

/**
 * Emergency Contact Form Component
 * Handles both create and edit operations for emergency contacts
 */
const EmergencyContactForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  isEdit = false,
  existingContacts = []
}) => {
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    relationship: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    email: '',
    address: '',
    priority: '',
    isPrimary: false,
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        relationship: initialData.relationship || '',
        phoneNumber: initialData.phoneNumber || '',
        alternatePhoneNumber: initialData.alternatePhoneNumber || '',
        email: initialData.email || '',
        address: initialData.address || '',
        priority: initialData.priority?.toString() || '',
        isPrimary: initialData.isPrimary || false,
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (formData.firstName.length > 50) {
      errors.firstName = 'First name must be less than 50 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (formData.lastName.length > 50) {
      errors.lastName = 'Last name must be less than 50 characters';
    }

    // Relationship validation
    if (!formData.relationship.trim()) {
      errors.relationship = 'Relationship is required';
    } else if (formData.relationship.length > 50) {
      errors.relationship = 'Relationship must be less than 50 characters';
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    // Alternate phone number validation (optional)
    if (formData.alternatePhoneNumber && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.alternatePhoneNumber.replace(/\s/g, ''))) {
      errors.alternatePhoneNumber = 'Please enter a valid alternate phone number';
    }

    // Email validation (optional)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Priority validation (optional)
    if (formData.priority) {
      const priority = parseInt(formData.priority, 10);
      if (isNaN(priority) || priority < 1 || priority > 10) {
        errors.priority = 'Priority must be a number between 1 and 10';
      } else {
        // Check if priority is already taken by another contact
        const priorityTaken = existingContacts.some(contact => 
          contact.priority === priority && 
          (!isEdit || contact.id !== initialData?.id)
        );
        if (priorityTaken) {
          errors.priority = `Priority ${priority} is already assigned to another contact`;
        }
      }
    }

    // Primary contact validation
    if (formData.isPrimary) {
      const existingPrimary = existingContacts.find(contact => 
        contact.isPrimary && 
        (!isEdit || contact.id !== initialData?.id)
      );
      if (existingPrimary) {
        // This is just a warning, not an error
        errors._primaryWarning = `${existingPrimary.firstName} ${existingPrimary.lastName} is currently the primary contact. Setting this contact as primary will remove the primary status from the existing contact.`;
      }
    }

    // Notes validation
    if (formData.notes && formData.notes.length > 500) {
      errors.notes = 'Notes must be less than 500 characters';
    }

    // Address validation
    if (formData.address && formData.address.length > 200) {
      errors.address = 'Address must be less than 200 characters';
    }

    setFormErrors(errors);
    
    // Filter out warnings from validation
    const actualErrors = Object.keys(errors).filter(key => !key.startsWith('_'));
    return actualErrors.length === 0;
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
      priority: formData.priority ? parseInt(formData.priority, 10) : null
    };

    try {
      await onSubmit(submissionData);
    } catch (error) {
      // Error handling is done by parent component
      console.error('Form submission error:', error);
    }
  };

  // Relationship options
  const relationships = [
    'Spouse',
    'Partner',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Colleague',
    'Neighbor',
    'Guardian',
    'Other'
  ];

  // Get available priorities
  const getAvailablePriorities = () => {
    const usedPriorities = existingContacts
      .filter(c => c.id !== initialData?.id && c.priority)
      .map(c => c.priority);
    
    const available = [];
    for (let i = 1; i <= 10; i++) {
      if (!usedPriorities.includes(i)) {
        available.push(i);
      }
    }
    return available;
  };

  const availablePriorities = getAvailablePriorities();

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

      {/* Primary Warning */}
      {formErrors._primaryWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="text-sm text-yellow-700">
            <strong>Note:</strong> {formErrors._primaryWarning}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <Input
              label="First Name"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              error={touched.firstName ? formErrors.firstName : undefined}
              required
              maxLength={50}
            />

            {/* Last Name */}
            <Input
              label="Last Name"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              error={touched.lastName ? formErrors.lastName : undefined}
              required
              maxLength={50}
            />
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => handleChange('relationship', e.target.value)}
              onBlur={() => handleBlur('relationship')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.relationship && formErrors.relationship
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select relationship...</option>
              {relationships.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
            {touched.relationship && formErrors.relationship && (
              <p className="mt-1 text-sm text-red-600">{formErrors.relationship}</p>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Contact Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone Number */}
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              onBlur={() => handleBlur('phoneNumber')}
              error={touched.phoneNumber ? formErrors.phoneNumber : undefined}
              required
              placeholder="+1 (555) 123-4567"
            />

            {/* Alternate Phone Number */}
            <Input
              label="Alternate Phone Number"
              type="tel"
              value={formData.alternatePhoneNumber}
              onChange={(e) => handleChange('alternatePhoneNumber', e.target.value)}
              onBlur={() => handleBlur('alternatePhoneNumber')}
              error={touched.alternatePhoneNumber ? formErrors.alternatePhoneNumber : undefined}
              placeholder="+1 (555) 987-6543"
            />
          </div>

          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={touched.email ? formErrors.email : undefined}
            placeholder="contact@example.com"
          />

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              onBlur={() => handleBlur('address')}
              rows={3}
              maxLength={200}
              placeholder="Street address, city, state, zip code..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.address && formErrors.address
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            {touched.address && formErrors.address && (
              <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.address.length}/200 characters
            </p>
          </div>
        </div>

        {/* Priority and Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Priority Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                onBlur={() => handleBlur('priority')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  touched.priority && formErrors.priority
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
              >
                <option value="">No specific priority</option>
                {availablePriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    Priority {priority} {priority === 1 ? '(Highest)' : priority === 10 ? '(Lowest)' : ''}
                  </option>
                ))}
              </select>
              {touched.priority && formErrors.priority && (
                <p className="mt-1 text-sm text-red-600">{formErrors.priority}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Lower numbers indicate higher priority for contact during emergencies
              </p>
            </div>

            {/* Primary Contact */}
            <div className="flex items-start space-x-3 pt-6">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => handleChange('isPrimary', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor="isPrimary" className="text-sm font-medium text-gray-900 flex items-center space-x-1">
                  {formData.isPrimary ? (
                    <StarIconSolid className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <StarIcon className="w-4 h-4 text-gray-400" />
                  )}
                  <span>Primary Emergency Contact</span>
                </label>
                <p className="text-sm text-gray-500">
                  This contact will be called first in case of emergency
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              onBlur={() => handleBlur('notes')}
              rows={3}
              maxLength={500}
              placeholder="Any additional information about this contact..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.notes && formErrors.notes
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            {touched.notes && formErrors.notes && (
              <p className="mt-1 text-sm text-red-600">{formErrors.notes}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.notes.length}/500 characters
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Preview</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              {formData.isPrimary && (
                <StarIconSolid className="w-4 h-4 text-yellow-500" />
              )}
              <div className="font-medium text-gray-900">
                {formData.firstName || 'First'} {formData.lastName || 'Last'}
              </div>
              {formData.relationship && (
                <Badge variant="secondary" size="sm">
                  {formData.relationship}
                </Badge>
              )}
              {formData.priority && (
                <Badge variant="info" size="sm">
                  Priority #{formData.priority}
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              {formData.phoneNumber && (
                <div>📞 {formData.phoneNumber}</div>
              )}
              {formData.email && (
                <div>✉️ {formData.email}</div>
              )}
              {formData.address && (
                <div>🏠 {formData.address}</div>
              )}
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
            disabled={loading || Object.keys(formErrors).filter(key => !key.startsWith('_')).length > 0}
          >
            {isEdit ? 'Update Contact' : 'Add Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
};

// PropTypes validation
EmergencyContactForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object
  ]),
  isEdit: PropTypes.bool,
  existingContacts: PropTypes.array
};

export default EmergencyContactForm;