// src/components/visitor/VisitorForm/VisitorForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Badge from '../../common/Badge/Badge';
import Card from '../../common/Card/Card';
import { extractErrorMessage } from '../../../utils/errorUtils';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  IdentificationIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

/**
 * Comprehensive Visitor Form Component
 * Handles both create and edit operations for visitors
 * Multi-step form with validation and emergency contacts
 */
const VisitorForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  isEdit = false
}) => {
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    company: '',
    jobTitle: '',
    
    // Address Information
    address: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      addressType: 'Home'
    },
    
    // Personal Details
    dateOfBirth: '',
    governmentId: '',
    governmentIdType: 'Passport',
    nationality: '',
    language: 'en-US',
    
    // Special Requirements
    dietaryRequirements: '',
    accessibilityRequirements: '',
    securityClearance: '',
    
    // Status & Notes
    isVip: false,
    notes: '',
    externalId: '',
    
    // Emergency Contacts
    emergencyContacts: []
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        company: initialData.company || '',
        jobTitle: initialData.jobTitle || '',
        address: {
          street1: initialData.address?.street1 || '',
          street2: initialData.address?.street2 || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          postalCode: initialData.address?.postalCode || '',
          country: initialData.address?.country || '',
          addressType: initialData.address?.addressType || 'Home'
        },
        dateOfBirth: initialData.dateOfBirth ? 
          new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        governmentId: initialData.governmentId || '',
        governmentIdType: initialData.governmentIdType || 'Passport',
        nationality: initialData.nationality || '',
        language: initialData.language || 'en-US',
        dietaryRequirements: initialData.dietaryRequirements || '',
        accessibilityRequirements: initialData.accessibilityRequirements || '',
        securityClearance: initialData.securityClearance || '',
        isVip: initialData.isVip || false,
        notes: initialData.notes || '',
        externalId: initialData.externalId || '',
        emergencyContacts: initialData.emergencyContacts || []
      });
    }
  }, [initialData]);

  // Form steps configuration
  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: UserIcon,
      description: 'Name, contact details, and company information'
    },
    {
      id: 'address',
      title: 'Address',
      icon: GlobeAltIcon,
      description: 'Physical address information'
    },
    {
      id: 'personal',
      title: 'Personal Details',
      icon: IdentificationIcon,
      description: 'ID, nationality, and personal information'
    },
    {
      id: 'requirements',
      title: 'Special Requirements',
      icon: ShieldCheckIcon,
      description: 'Dietary, accessibility, and security requirements'
    },
    {
      id: 'emergency',
      title: 'Emergency Contacts',
      icon: UserGroupIcon,
      description: 'Emergency contact information (required)'
    },
    {
      id: 'review',
      title: 'Review & Submit',
      icon: CheckCircleIcon,
      description: 'Review all information before submitting'
    }
  ];

  // Validation functions for each step
  const validateStep = (stepId) => {
    const errors = {};

    switch (stepId) {
      case 'basic':
        if (!formData.firstName.trim()) {
          errors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
          errors.firstName = 'First name must be at least 2 characters';
        } else if (formData.firstName.length > 50) {
          errors.firstName = 'First name must be less than 50 characters';
        }

        if (!formData.lastName.trim()) {
          errors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
          errors.lastName = 'Last name must be at least 2 characters';
        } else if (formData.lastName.length > 50) {
          errors.lastName = 'Last name must be less than 50 characters';
        }

        if (!formData.email.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Please enter a valid email address';
        }

        if (formData.phoneNumber && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
          errors.phoneNumber = 'Please enter a valid phone number';
        }

        if (formData.company && formData.company.length > 100) {
          errors.company = 'Company name must be less than 100 characters';
        }

        if (formData.jobTitle && formData.jobTitle.length > 100) {
          errors.jobTitle = 'Job title must be less than 100 characters';
        }
        break;

      case 'address':
        // Address is optional, but validate format if provided
        if (formData.address.street1 && formData.address.street1.length > 100) {
          errors['address.street1'] = 'Street address must be less than 100 characters';
        }
        if (formData.address.city && formData.address.city.length > 50) {
          errors['address.city'] = 'City must be less than 50 characters';
        }
        if (formData.address.state && formData.address.state.length > 50) {
          errors['address.state'] = 'State must be less than 50 characters';
        }
        if (formData.address.postalCode && formData.address.postalCode.length > 20) {
          errors['address.postalCode'] = 'Postal code must be less than 20 characters';
        }
        if (formData.address.country && formData.address.country.length > 50) {
          errors['address.country'] = 'Country must be less than 50 characters';
        }
        break;

      case 'personal':
        if (formData.dateOfBirth) {
          const birthDate = new Date(formData.dateOfBirth);
          const today = new Date();
          const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
          
          if (age < 16) {
            errors.dateOfBirth = 'Visitor must be at least 16 years old';
          } else if (age > 120) {
            errors.dateOfBirth = 'Please enter a valid date of birth';
          }
        }

        if (formData.governmentId && formData.governmentId.length > 50) {
          errors.governmentId = 'Government ID must be less than 50 characters';
        }

        if (formData.nationality && formData.nationality.length > 50) {
          errors.nationality = 'Nationality must be less than 50 characters';
        }
        break;

      case 'requirements':
        if (formData.dietaryRequirements && formData.dietaryRequirements.length > 500) {
          errors.dietaryRequirements = 'Dietary requirements must be less than 500 characters';
        }

        if (formData.accessibilityRequirements && formData.accessibilityRequirements.length > 500) {
          errors.accessibilityRequirements = 'Accessibility requirements must be less than 500 characters';
        }

        if (formData.securityClearance && formData.securityClearance.length > 50) {
          errors.securityClearance = 'Security clearance must be less than 50 characters';
        }

        if (formData.notes && formData.notes.length > 1000) {
          errors.notes = 'Notes must be less than 1000 characters';
        }
        break;

      case 'emergency':
        if (formData.emergencyContacts.length === 0) {
          errors.emergencyContacts = 'At least one emergency contact is required';
        } else {
          // Validate each emergency contact
          formData.emergencyContacts.forEach((contact, index) => {
            if (!contact.firstName?.trim()) {
              errors[`emergencyContacts.${index}.firstName`] = 'First name is required';
            }
            if (!contact.lastName?.trim()) {
              errors[`emergencyContacts.${index}.lastName`] = 'Last name is required';
            }
            if (!contact.relationship?.trim()) {
              errors[`emergencyContacts.${index}.relationship`] = 'Relationship is required';
            }
            if (!contact.phoneNumber?.trim()) {
              errors[`emergencyContacts.${index}.phoneNumber`] = 'Phone number is required';
            } else if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(contact.phoneNumber.replace(/\s/g, ''))) {
              errors[`emergencyContacts.${index}.phoneNumber`] = 'Please enter a valid phone number';
            }
            if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
              errors[`emergencyContacts.${index}.email`] = 'Please enter a valid email address';
            }
          });

          // Check for primary contact
          const primaryContacts = formData.emergencyContacts.filter(contact => contact.isPrimary);
          if (primaryContacts.length === 0) {
            errors.primaryContact = 'Please designate at least one primary emergency contact';
          } else if (primaryContacts.length > 1) {
            errors.primaryContact = 'Only one emergency contact can be designated as primary';
          }
        }
        break;
    }

    return errors;
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested object updates (e.g., address.street1)
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

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
  };

  // Handle step navigation
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const goToNextStep = () => {
    const currentStepId = steps[currentStep].id;
    const stepErrors = validateStep(currentStepId);
    
    if (Object.keys(stepErrors).length === 0) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setFormErrors({});
      goToStep(currentStep + 1);
    } else {
      setFormErrors(stepErrors);
      // Mark all fields in this step as touched
      Object.keys(stepErrors).forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }));
      });
    }
  };

  const goToPreviousStep = () => {
    goToStep(currentStep - 1);
  };

  // Emergency contact management
  const addEmergencyContact = () => {
    const newContact = {
      id: Date.now(), // Temporary ID for frontend
      firstName: '',
      lastName: '',
      relationship: '',
      phoneNumber: '',
      alternatePhoneNumber: '',
      email: '',
      address: '',
      priority: formData.emergencyContacts.length + 1,
      isPrimary: formData.emergencyContacts.length === 0, // First contact is primary by default
      notes: ''
    };

    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact]
    }));
  };

  const removeEmergencyContact = (index) => {
    setFormData(prev => {
      const newContacts = prev.emergencyContacts.filter((_, i) => i !== index);
      
      // If we removed the primary contact, make the first remaining contact primary
      if (newContacts.length > 0 && !newContacts.some(contact => contact.isPrimary)) {
        newContacts[0].isPrimary = true;
      }
      
      return {
        ...prev,
        emergencyContacts: newContacts
      };
    });
  };

  const updateEmergencyContact = (index, field, value) => {
    setFormData(prev => {
      const newContacts = [...prev.emergencyContacts];
      
      if (field === 'isPrimary' && value) {
        // If setting this contact as primary, unset all others
        newContacts.forEach((contact, i) => {
          contact.isPrimary = i === index;
        });
      } else {
        newContacts[index] = {
          ...newContacts[index],
          [field]: value
        };
      }
      
      return {
        ...prev,
        emergencyContacts: newContacts
      };
    });
  };
  // Handle form submission
  const handleSubmit = async () => {
    // Validate all steps
    let allErrors = {};
    steps.forEach(step => {
      const stepErrors = validateStep(step.id);
      allErrors = { ...allErrors, ...stepErrors };
    });

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      // Go to first step with errors
      const firstStepWithError = steps.findIndex(step => {
        const stepErrors = validateStep(step.id);
        return Object.keys(stepErrors).length > 0;
      });
      if (firstStepWithError !== -1) {
        goToStep(firstStepWithError);
      }
      return;
    }

    // Prepare submission data
    const submissionData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
      emergencyContacts: formData.emergencyContacts.map((contact, index) => ({
        firstName: contact.firstName,
        lastName: contact.lastName,
        relationship: contact.relationship,
        phoneNumber: contact.phoneNumber,
        alternatePhoneNumber: contact.alternatePhoneNumber || null,
        email: contact.email || null,
        address: contact.address ? {
          street1: contact.address,
          addressType: 'Emergency Contact'
        } : null,
        priority: contact.priority || index + 1,
        isPrimary: contact.isPrimary,
        notes: contact.notes || null
      }))
    };

    try {
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Step completion check
  const isStepCompleted = (stepIndex) => {
    return completedSteps.has(stepIndex);
  };

  const isStepValid = (stepId) => {
    const stepErrors = validateStep(stepId);
    return Object.keys(stepErrors).length === 0;
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isActive = currentStep === index;
        const isCompleted = isStepCompleted(index);
        const isValid = isStepValid(step.id);
        const IconComponent = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : isCompleted || isValid
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
              onClick={() => goToStep(index)}
            >
              {isCompleted || (isValid && !isActive) ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <IconComponent className="w-6 h-6" />
              )}
            </div>
            
            {/* Step title and description */}
            <div className="ml-3 hidden sm:block">
              <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                isCompleted || currentStep > index ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  // Common form sections
  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <UserIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        {formData.isVip && <StarIconSolid className="w-5 h-5 text-yellow-500" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <Input
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
        error={touched.email ? formErrors.email : undefined}
        required
        maxLength={256}
      />

      <Input
        label="Phone Number"
        type="tel"
        value={formData.phoneNumber}
        onChange={(e) => handleChange('phoneNumber', e.target.value)}
        onBlur={() => handleBlur('phoneNumber')}
        error={touched.phoneNumber ? formErrors.phoneNumber : undefined}
        placeholder="+1 (555) 123-4567"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company"
          type="text"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          onBlur={() => handleBlur('company')}
          error={touched.company ? formErrors.company : undefined}
          maxLength={100}
        />

        <Input
          label="Job Title"
          type="text"
          value={formData.jobTitle}
          onChange={(e) => handleChange('jobTitle', e.target.value)}
          onBlur={() => handleBlur('jobTitle')}
          error={touched.jobTitle ? formErrors.jobTitle : undefined}
          maxLength={100}
        />
      </div>

      {/* VIP Status */}
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id="isVip"
            checked={formData.isVip}
            onChange={(e) => handleChange('isVip', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="isVip" className="text-sm font-medium text-gray-900 flex items-center space-x-1">
            {formData.isVip ? (
              <StarIconSolid className="w-4 h-4 text-yellow-500" />
            ) : (
              <StarIcon className="w-4 h-4 text-gray-400" />
            )}
            <span>VIP Visitor</span>
          </label>
          <p className="text-sm text-gray-500">
            VIP visitors receive special treatment and priority handling
          </p>
        </div>
      </div>
    </div>
  );

  const renderAddressInformation = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <GlobeAltIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
        <Badge variant="info" size="sm">Optional</Badge>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Type
        </label>
        <select
          value={formData.address.addressType}
          onChange={(e) => handleChange('address.addressType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Home">Home</option>
          <option value="Work">Work</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <Input
        label="Street Address 1"
        type="text"
        value={formData.address.street1}
        onChange={(e) => handleChange('address.street1', e.target.value)}
        onBlur={() => handleBlur('address.street1')}
        error={touched['address.street1'] ? formErrors['address.street1'] : undefined}
        maxLength={100}
      />

      <Input
        label="Street Address 2"
        type="text"
        value={formData.address.street2}
        onChange={(e) => handleChange('address.street2', e.target.value)}
        maxLength={100}
        placeholder="Apartment, suite, etc."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="City"
          type="text"
          value={formData.address.city}
          onChange={(e) => handleChange('address.city', e.target.value)}
          onBlur={() => handleBlur('address.city')}
          error={touched['address.city'] ? formErrors['address.city'] : undefined}
          maxLength={50}
        />

        <Input
          label="State/Province"
          type="text"
          value={formData.address.state}
          onChange={(e) => handleChange('address.state', e.target.value)}
          onBlur={() => handleBlur('address.state')}
          error={touched['address.state'] ? formErrors['address.state'] : undefined}
          maxLength={50}
        />

        <Input
          label="Postal Code"
          type="text"
          value={formData.address.postalCode}
          onChange={(e) => handleChange('address.postalCode', e.target.value)}
          onBlur={() => handleBlur('address.postalCode')}
          error={touched['address.postalCode'] ? formErrors['address.postalCode'] : undefined}
          maxLength={20}
        />
      </div>

      <Input
        label="Country"
        type="text"
        value={formData.address.country}
        onChange={(e) => handleChange('address.country', e.target.value)}
        onBlur={() => handleBlur('address.country')}
        error={touched['address.country'] ? formErrors['address.country'] : undefined}
        maxLength={50}
        placeholder="United States"
      />
    </div>
  );

  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <IdentificationIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Personal Details</h3>
        <Badge variant="info" size="sm">Optional</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          onBlur={() => handleBlur('dateOfBirth')}
          error={touched.dateOfBirth ? formErrors.dateOfBirth : undefined}
        />

        <Input
          label="Nationality"
          type="text"
          value={formData.nationality}
          onChange={(e) => handleChange('nationality', e.target.value)}
          onBlur={() => handleBlur('nationality')}
          error={touched.nationality ? formErrors.nationality : undefined}
          maxLength={50}
          placeholder="American"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Government ID Type
          </label>
          <select
            value={formData.governmentIdType}
            onChange={(e) => handleChange('governmentIdType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Passport">Passport</option>
            <option value="Driver License">Driver's License</option>
            <option value="National ID">National ID</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <Input
          label="Government ID Number"
          type="text"
          value={formData.governmentId}
          onChange={(e) => handleChange('governmentId', e.target.value)}
          onBlur={() => handleBlur('governmentId')}
          error={touched.governmentId ? formErrors.governmentId : undefined}
          maxLength={50}
          placeholder="ID number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Language
        </label>
        <select
          value={formData.language}
          onChange={(e) => handleChange('language', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
          <option value="de-DE">German</option>
          <option value="it-IT">Italian</option>
          <option value="pt-PT">Portuguese</option>
          <option value="zh-CN">Chinese (Simplified)</option>
          <option value="ja-JP">Japanese</option>
          <option value="ko-KR">Korean</option>
          <option value="ar-SA">Arabic</option>
        </select>
      </div>

      <Input
        label="External System ID"
        type="text"
        value={formData.externalId}
        onChange={(e) => handleChange('externalId', e.target.value)}
        maxLength={100}
        placeholder="ID from external system (optional)"
      />
    </div>
  );
  const renderSpecialRequirements = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Special Requirements</h3>
        <Badge variant="info" size="sm">Optional</Badge>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Security Clearance Level
        </label>
        <select
          value={formData.securityClearance}
          onChange={(e) => handleChange('securityClearance', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Standard (No special clearance)</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Top Secret">Top Secret</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Security clearance level required for facility access
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dietary Requirements
        </label>
        <textarea
          value={formData.dietaryRequirements}
          onChange={(e) => handleChange('dietaryRequirements', e.target.value)}
          onBlur={() => handleBlur('dietaryRequirements')}
          rows={3}
          maxLength={500}
          placeholder="Any dietary restrictions, allergies, or special meal requirements..."
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            touched.dietaryRequirements && formErrors.dietaryRequirements
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300'
          }`}
        />
        {touched.dietaryRequirements && formErrors.dietaryRequirements && (
          <p className="mt-1 text-sm text-red-600">{formErrors.dietaryRequirements}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.dietaryRequirements.length}/500 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Accessibility Requirements
        </label>
        <textarea
          value={formData.accessibilityRequirements}
          onChange={(e) => handleChange('accessibilityRequirements', e.target.value)}
          onBlur={() => handleBlur('accessibilityRequirements')}
          rows={3}
          maxLength={500}
          placeholder="Wheelchair access, mobility aids, visual/hearing assistance needs..."
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            touched.accessibilityRequirements && formErrors.accessibilityRequirements
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300'
          }`}
        />
        {touched.accessibilityRequirements && formErrors.accessibilityRequirements && (
          <p className="mt-1 text-sm text-red-600">{formErrors.accessibilityRequirements}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.accessibilityRequirements.length}/500 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          onBlur={() => handleBlur('notes')}
          rows={4}
          maxLength={1000}
          placeholder="Any additional information about the visitor..."
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
          {formData.notes.length}/1000 characters
        </p>
      </div>
    </div>
  );

  const renderEmergencyContacts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Emergency Contacts</h3>
          <Badge variant="danger" size="sm">Required</Badge>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEmergencyContact}
          icon={<PlusIcon className="w-4 h-4" />}
        >
          Add Contact
        </Button>
      </div>

      {formErrors.emergencyContacts && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{formErrors.emergencyContacts}</div>
        </div>
      )}

      {formErrors.primaryContact && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="text-sm text-yellow-700">{formErrors.primaryContact}</div>
        </div>
      )}

      <div className="space-y-4">
        {formData.emergencyContacts.map((contact, index) => (
          <Card key={contact.id || index} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">Emergency Contact {index + 1}</h4>
                {contact.isPrimary && (
                  <Badge variant="warning" size="sm">Primary</Badge>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEmergencyContact(index)}
                className="text-red-600 hover:text-red-800"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                value={contact.firstName}
                onChange={(e) => updateEmergencyContact(index, 'firstName', e.target.value)}
                error={formErrors[`emergencyContacts.${index}.firstName`]}
                required
                maxLength={50}
              />

              <Input
                label="Last Name"
                type="text"
                value={contact.lastName}
                onChange={(e) => updateEmergencyContact(index, 'lastName', e.target.value)}
                error={formErrors[`emergencyContacts.${index}.lastName`]}
                required
                maxLength={50}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <select
                  value={contact.relationship}
                  onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors[`emergencyContacts.${index}.relationship`]
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select relationship...</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Partner">Partner</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors[`emergencyContacts.${index}.relationship`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors[`emergencyContacts.${index}.relationship`]}
                  </p>
                )}
              </div>

              <Input
                label="Phone Number"
                type="tel"
                value={contact.phoneNumber}
                onChange={(e) => updateEmergencyContact(index, 'phoneNumber', e.target.value)}
                error={formErrors[`emergencyContacts.${index}.phoneNumber`]}
                required
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="Alternate Phone"
                type="tel"
                value={contact.alternatePhoneNumber}
                onChange={(e) => updateEmergencyContact(index, 'alternatePhoneNumber', e.target.value)}
                placeholder="+1 (555) 987-6543"
              />

              <Input
                label="Email Address"
                type="email"
                value={contact.email}
                onChange={(e) => updateEmergencyContact(index, 'email', e.target.value)}
                error={formErrors[`emergencyContacts.${index}.email`]}
                placeholder="contact@example.com"
              />
            </div>

            <div className="mt-4">
              <Input
                label="Address"
                type="text"
                value={contact.address}
                onChange={(e) => updateEmergencyContact(index, 'address', e.target.value)}
                placeholder="Street address, city, state"
                maxLength={200}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`isPrimary-${index}`}
                  checked={contact.isPrimary}
                  onChange={(e) => updateEmergencyContact(index, 'isPrimary', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`isPrimary-${index}`} className="text-sm font-medium text-gray-900">
                  Primary Emergency Contact
                </label>
              </div>

              <div className="text-sm text-gray-500">
                Priority: #{contact.priority || index + 1}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={contact.notes}
                onChange={(e) => updateEmergencyContact(index, 'notes', e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Additional information about this contact..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </Card>
        ))}

        {formData.emergencyContacts.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No emergency contacts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add at least one emergency contact for safety compliance.
            </p>
            <div className="mt-6">
              <Button
                type="button"
                onClick={addEmergencyContact}
                icon={<PlusIcon className="w-5 h-5" />}
              >
                Add Emergency Contact
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderReviewAndSubmit = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <DocumentTextIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Review & Submit</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information Summary */}
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <UserIcon className="w-4 h-4" />
            <span>Basic Information</span>
            {formData.isVip && <StarIconSolid className="w-4 h-4 text-yellow-500" />}
          </h4>
          <div className="space-y-2 text-sm">
            <div><strong>Name:</strong> {formData.firstName} {formData.lastName}</div>
            <div><strong>Email:</strong> {formData.email}</div>
            {formData.phoneNumber && <div><strong>Phone:</strong> {formData.phoneNumber}</div>}
            {formData.company && <div><strong>Company:</strong> {formData.company}</div>}
            {formData.jobTitle && <div><strong>Job Title:</strong> {formData.jobTitle}</div>}
            {formData.isVip && <div><Badge variant="warning" size="sm">VIP Visitor</Badge></div>}
          </div>
        </Card>

        {/* Personal Details Summary */}
        {(formData.nationality || formData.governmentId || formData.dateOfBirth) && (
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <IdentificationIcon className="w-4 h-4" />
              <span>Personal Details</span>
            </h4>
            <div className="space-y-2 text-sm">
              {formData.nationality && <div><strong>Nationality:</strong> {formData.nationality}</div>}
              {formData.dateOfBirth && <div><strong>Date of Birth:</strong> {formData.dateOfBirth}</div>}
              {formData.governmentId && (
                <div><strong>{formData.governmentIdType}:</strong> {formData.governmentId}</div>
              )}
              {formData.securityClearance && (
                <div><strong>Security Clearance:</strong> {formData.securityClearance}</div>
              )}
            </div>
          </Card>
        )}

        {/* Address Summary */}
        {formData.address.street1 && (
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <GlobeAltIcon className="w-4 h-4" />
              <span>Address</span>
            </h4>
            <div className="text-sm">
              <div>{formData.address.street1}</div>
              {formData.address.street2 && <div>{formData.address.street2}</div>}
              <div>
                {formData.address.city && formData.address.city + ', '}
                {formData.address.state && formData.address.state + ' '}
                {formData.address.postalCode}
              </div>
              {formData.address.country && <div>{formData.address.country}</div>}
            </div>
          </Card>
        )}

        {/* Emergency Contacts Summary */}
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <UserGroupIcon className="w-4 h-4" />
            <span>Emergency Contacts</span>
            <Badge variant={formData.emergencyContacts.length > 0 ? 'success' : 'danger'} size="sm">
              {formData.emergencyContacts.length} contact{formData.emergencyContacts.length !== 1 ? 's' : ''}
            </Badge>
          </h4>
          <div className="space-y-2">
            {formData.emergencyContacts.map((contact, index) => (
              <div key={index} className="text-sm">
                <div className="flex items-center space-x-2">
                  <strong>{contact.firstName} {contact.lastName}</strong>
                  {contact.isPrimary && <Badge variant="warning" size="xs">Primary</Badge>}
                </div>
                <div className="text-gray-600">
                  {contact.relationship} • {contact.phoneNumber}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Special Requirements Summary */}
      {(formData.dietaryRequirements || formData.accessibilityRequirements || formData.notes) && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Special Requirements & Notes</span>
          </h4>
          <div className="space-y-3 text-sm">
            {formData.dietaryRequirements && (
              <div>
                <strong>Dietary Requirements:</strong>
                <div className="mt-1 text-gray-600">{formData.dietaryRequirements}</div>
              </div>
            )}
            {formData.accessibilityRequirements && (
              <div>
                <strong>Accessibility Requirements:</strong>
                <div className="mt-1 text-gray-600">{formData.accessibilityRequirements}</div>
              </div>
            )}
            {formData.notes && (
              <div>
                <strong>Additional Notes:</strong>
                <div className="mt-1 text-gray-600">{formData.notes}</div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
  // Main render function
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

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Form Content */}
      <Card className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep].id === 'basic' && renderBasicInformation()}
            {steps[currentStep].id === 'address' && renderAddressInformation()}
            {steps[currentStep].id === 'personal' && renderPersonalDetails()}
            {steps[currentStep].id === 'requirements' && renderSpecialRequirements()}
            {steps[currentStep].id === 'emergency' && renderEmergencyContacts()}
            {steps[currentStep].id === 'review' && renderReviewAndSubmit()}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-6">
        <div>
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={loading}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={goToNextStep}
              disabled={loading}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              loading={loading}
              disabled={loading || Object.keys(formErrors).length > 0}
            >
              {isEdit ? 'Update Visitor' : 'Create Visitor'}
            </Button>
          )}
        </div>
      </div>

      {/* Step Navigation Footer */}
      <div className="mt-4 flex justify-center">
        <div className="flex space-x-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentStep === index
                  ? 'bg-blue-600'
                  : isStepCompleted(index) || isStepValid(step.id)
                  ? 'bg-green-600'
                  : 'bg-gray-300'
              }`}
              title={step.title}
            />
          ))}
        </div>
      </div>

      {/* Form Progress */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
      </div>
    </div>
  );
};

// PropTypes validation
VisitorForm.propTypes = {
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

export default VisitorForm;