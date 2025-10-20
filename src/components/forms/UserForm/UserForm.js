// src/components/forms/UserForm/UserForm.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { validateUserData } from '../../../utils/validators';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../hooks/useNotifications';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import PropTypes from 'prop-types';

/**
 * Enhanced User Form Component - Lebanon Specific
 * Features: Lebanon-focused phone codes, addresses, timezones, and languages
 */
const UserForm = ({
  user = null,
  availableRoles = [],
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  className = ''
}) => {

  const { user: userPermissions } = usePermissions();
  const toast = useToast();
  const isEditing = Boolean(user);

  const [formData, setFormData] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',

    // Enhanced phone number fields with Lebanon default
    phoneNumber: user?.phoneNumber ?? '',
    phoneCountryCode: user?.phoneCountryCode ?? '961', // Lebanon default
    phoneType: user?.phoneType ?? 'Mobile',

    role: user?.role ?? 'Staff',
    status: user?.status ?? 'Active',
    department: user?.department ?? '',
    jobTitle: user?.jobTitle ?? '',
    employeeId: user?.employeeId ?? '',
    isActive: user?.isActive ?? true,
    mustChangePassword: !isEditing,

    // User preferences with Lebanon defaults
    timeZone: user?.timeZone ?? 'Asia/Beirut', // Lebanon timezone
    language: user?.language ?? 'en-US', // Default to English, but Arabic available
    theme: user?.theme ?? 'light',

    // Enhanced address fields with Lebanon defaults
    addressType: user?.addressType ?? 'Home',
    street1: user?.street1 ?? '',
    street2: user?.street2 ?? '',
    city: user?.city ?? '',
    governorate: user?.state ?? user?.governorate ?? '', // Lebanon uses governorates instead of states
    postalCode: user?.postalCode ?? '',
    country: user?.country ?? 'Lebanon', // Default to Lebanon
    enableCoordinates: Boolean(user?.latitude && user?.longitude),
    latitude: user?.latitude?.toString() ?? '',
    longitude: user?.longitude?.toString() ?? '',

    // Email preferences
    sendWelcomeEmail: !isEditing
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState(new Set());

  // Lebanon-specific data
  const lebaneseGovernorates = [
    'Beirut',
    'Mount Lebanon',
    'North Lebanon',
    'South Lebanon',
    'Beqaa',
    'Akkar',
    'Baalbek-Hermel',
    'Nabatieh'
  ];

  // Reset form when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phoneNumber: user?.phoneNumber ?? '',
        phoneCountryCode: user.phoneCountryCode ?? '961',
        phoneType: user.phoneType ?? 'Mobile',
        role: user.role ?? 'Staff',
        status: user.status ?? 'Active',
        department: user.department ?? '',
        jobTitle: user.jobTitle ?? '',
        employeeId: user?.employeeId ?? '',
        isActive: user.isActive ?? true,
        mustChangePassword: false,
        timeZone: user.timeZone ?? 'Asia/Beirut',
        language: user.language ?? 'en-US',
        theme: user.theme ?? 'light',
        addressType: user.addressType ?? 'Home',
        street1: user.street1 ?? '',
        street2: user.street2 ?? '',
        city: user.city ?? '',
        governorate: user.state ?? user.governorate ?? '', 
        postalCode: user?.postalCode ?? '',
        country: user.country ?? 'Lebanon',
        enableCoordinates: user.latitude && user.longitude,
        latitude: user?.latitude?.toString() ?? '',
        longitude: user?.longitude?.toString() ?? '',
        sendWelcomeEmail: false
      });
    }
    setErrors({});
    setTouchedFields(new Set());
  }, [user]);

  // Clear global errors when they change
  useEffect(() => {
    if (!error) {
      setErrors(prev => ({ ...prev, global: null }));
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Mark field as touched
    setTouchedFields(prev => new Set([...prev, name]));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => new Set([...prev, name]));
    
    // Validate field on blur if it has been touched
    if (touchedFields.has(name)) {
      validateField(name, formData[name]);
    }
  };

  const validateField = (fieldName, value) => {
    const fieldData = { [fieldName]: value };
    const validation = validateUserData(fieldData, isEditing);
    
    if (validation.errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: validation.errors[fieldName]
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Map governorate to state for backend compatibility
    const submissionData = {
      ...formData,
      state: formData.governorate // Map governorate to state field for backend
    };

    // Validate all fields
    const validation = validateUserData(submissionData, isEditing);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouchedFields(new Set(Object.keys(formData)));
      
      // Show validation error notification
      toast.error(
        'Validation Error',
        'Please fix the errors in the form before submitting.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit(submissionData);
      
      // Show success notification
      toast.success(
        isEditing ? 'User Updated' : 'User Created',
        isEditing 
          ? `${formData.firstName} ${formData.lastName} has been updated successfully.`
          : `${formData.firstName} ${formData.lastName} has been created successfully.${formData.sendWelcomeEmail ? ' Welcome email sent.' : ''}`,
        {
          duration: 6000,
          actions: isEditing ? [] : [
            {
              label: 'Create Another',
              onClick: () => {
                // Reset form for creating another user
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phoneNumber: '',
                  phoneCountryCode: '961',
                  phoneType: 'Mobile',
                  role: 'Staff',
                  department: '',
                  jobTitle: '',
                  employeeId: '',
                  isActive: true,
                  mustChangePassword: true,
                  timeZone: 'Asia/Beirut',
                  language: 'en-US',
                  theme: 'light',
                  addressType: 'Home',
                  street1: '',
                  street2: '',
                  city: '',
                  governorate: '',
                  postalCode: '',
                  country: 'Lebanon',
                  enableCoordinates: false,
                  latitude: '',
                  longitude: '',
                  sendWelcomeEmail: true
                });
                setTouchedFields(new Set());
              },
              dismissOnClick: true
            }
          ]
        }
      );

    } catch (error) {
      // Error handling with notification
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
      
      toast.error(
        isEditing ? 'Update Failed' : 'Creation Failed',
        errorMessage,
        {
          persistent: true,
          actions: [
            {
              label: 'Try Again',
              onClick: () => handleSubmit(e),
              dismissOnClick: true
            }
          ]
        }
      );
      
      setErrors(prev => ({ ...prev, global: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const isFormValid = !Object.values(errors).some(error => error) && 
                     formData.firstName && formData.lastName && formData.email && formData.role;
  const isLoading = loading || isSubmitting;

  // Filter available roles based on permissions
  const selectableRoles = availableRoles.filter(role => {
    if (!userPermissions.canManageRoles) {
      return ['Staff'].includes(role.name);
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {isEditing 
              ? 'Update user information and permissions'
              : 'Add a new user to the system with appropriate access level'
            }
          </p>
        </div>

        {/* Global Error */}
        {(error || errors.global) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 text-sm font-medium">{error || errors.global}</span>
            </div>
          </motion.div>
        )}

        {/* Personal Information Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Input
                type="text"
                name="firstName"
                label="First Name"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touchedFields.has('firstName') ? errors.firstName : null}
                disabled={isLoading}
                required
                autoComplete="given-name"
              />
            </motion.div>

            {/* Last Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              <Input
                type="text"
                name="lastName"
                label="Last Name"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touchedFields.has('lastName') ? errors.lastName : null}
                disabled={isLoading}
                required
                autoComplete="family-name"
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="md:col-span-2"
            >
              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touchedFields.has('email') ? errors.email : null}
                disabled={isLoading}
                required
                autoComplete="email"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />
            </motion.div>

            {/* Enhanced Phone Number - Lebanon Focused */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="md:col-span-2"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              
              <div className="flex space-x-2">
                {/* Country Code Selector - Lebanon First */}
                <select
                  name="phoneCountryCode"
                  value={formData.phoneCountryCode ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className="w-32 px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="961">🇱🇧 +961</option>
                  <option value="963">🇸🇾 +963</option>
                  <option value="962">🇯🇴 +962</option>
                  <option value="972">🇮🇱 +972</option>
                  <option value="90">🇹🇷 +90</option>
                  <option value="20">🇪🇬 +20</option>
                  <option value="966">🇸🇦 +966</option>
                  <option value="971">🇦🇪 +971</option>
                  <option value="965">🇰🇼 +965</option>
                  <option value="974">🇶🇦 +974</option>
                  <option value="1">🇺🇸 +1</option>
                  <option value="44">🇬🇧 +44</option>
                  <option value="33">🇫🇷 +33</option>
                  <option value="49">🇩🇪 +49</option>
                  <option value="39">🇮🇹 +39</option>
                </select>

                {/* Phone Number Input */}
                <div className="flex-1">
                  <Input
                    type="tel"
                    name="phoneNumber"
                    placeholder="71 123 456"
                    value={formData.phoneNumber ?? ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touchedFields.has('phoneNumber') ? errors.phoneNumber : null}
                    disabled={isLoading}
                    autoComplete="tel"
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    }
                  />
                </div>

                {/* Phone Type Selector */}
                <select
                  name="phoneType"
                  value={formData.phoneType ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className="w-32 px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Mobile">📱 Mobile</option>
                  <option value="Landline">☎️ Landline</option>
                  <option value="Unknown">❓ Unknown</option>
                </select>
              </div>
              
              {touchedFields.has('phoneNumber') && errors.phoneNumber && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.phoneNumber}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Work Information Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
            </svg>
            Work Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {selectableRoles.map(role => (
                  <option key={role.name} value={role.name}>
                    {role.displayName || role.name}
                  </option>
                ))}
              </select>
              {touchedFields.has('role') && errors.role && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.role}
                </p>
              )}
            </motion.div>

            {/* Employee ID */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
              <Input
                type="text"
                name="employeeId"
                label="Employee ID"
                placeholder="Enter employee ID"
                value={formData.employeeId ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touchedFields.has('employeeId') ? errors.employeeId : null}
                disabled={isLoading}
                helperText="Optional: Unique identifier for the employee"
              />
            </motion.div>

            {/* Department */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Input
                type="text"
                name="department"
                label="Department"
                placeholder="Enter department"
                value={formData.department ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touchedFields.has('department') ? errors.department : null}
                disabled={isLoading}
              />
            </motion.div>

            {/* Job Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.3 }}
            >
              <Input
                type="text"
                name="jobTitle"
                label="Job Title"
                placeholder="Enter job title"
                value={formData.jobTitle ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touchedFields.has('jobTitle') ? errors.jobTitle : null}
                disabled={isLoading}
              />
            </motion.div>
          </div>
        </div>
        
        {/* Status Field - ADD THIS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
          {touchedFields.has('status') && errors.status && (
            <p className="text-red-600 text-sm mt-1">{errors.status}</p>
          )}
        </div>
        
        {/* Enhanced Address Section - Lebanon Specific */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Address Information
          </h4>

          {/* Address Type Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Type</label>
            <select
              name="addressType"
              value={formData.addressType ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className="w-full md:w-48 px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Home">🏠 Home</option>
              <option value="Work">🏢 Work</option>
              <option value="Billing">💳 Billing</option>
              <option value="Shipping">📦 Shipping</option>
              <option value="Other">📍 Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              name="street1"
              label="Street Address"
              placeholder="Building name, Street name"
              value={formData.street1 ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touchedFields.has('street1') ? errors.street1 : null}
              disabled={isLoading}
            />

            <Input
              type="text" 
              name="street2"
              label="Additional Address (Optional)"
              placeholder="Floor, Apartment, Unit"
              value={formData.street2 ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touchedFields.has('street2') ? errors.street2 : null}
              disabled={isLoading}
            />

            <Input
              type="text"
              name="city"
              label="City"
              placeholder="e.g., Beirut, Tripoli, Sidon"
              value={formData.city ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touchedFields.has('city') ? errors.city : null}
              disabled={isLoading}
            />

            {/* Lebanese Governorates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Governorate
              </label>
              <select
                name="governorate"
                value={formData.governorate ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Governorate</option>
                {lebaneseGovernorates.map(governorate => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </select>
              {touchedFields.has('governorate') && errors.governorate && (
                <p className="text-red-600 text-sm mt-1">{errors.governorate}</p>
              )}
            </div>

            <Input
              type="text"
              name="postalCode"
              label="Postal Code (Optional)"
              placeholder="e.g., 1107-2180"
              value={formData.postalCode ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touchedFields.has('postalCode') ? errors.postalCode : null}
              disabled={isLoading}
              helperText="Lebanon postal codes are optional"
            />

            {/* Enhanced Country Selector - Lebanon and Region First */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Country
              </label>
              <select
                name="country"
                value={formData.country ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Lebanon">🇱🇧 Lebanon</option>
                <option value="">--- Middle East ---</option>
                <option value="Syria">🇸🇾 Syria</option>
                <option value="Jordan">🇯🇴 Jordan</option>
                <option value="Israel">🇮🇱 Israel</option>
                <option value="Turkey">🇹🇷 Turkey</option>
                <option value="Cyprus">🇨🇾 Cyprus</option>
                <option value="Egypt">🇪🇬 Egypt</option>
                <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
                <option value="Kuwait">🇰🇼 Kuwait</option>
                <option value="Qatar">🇶🇦 Qatar</option>
                <option value="Bahrain">🇧🇭 Bahrain</option>
                <option value="Oman">🇴🇲 Oman</option>
                <option value="Iraq">🇮🇶 Iraq</option>
                <option value="Iran">🇮🇷 Iran</option>
                <option value="">--- International ---</option>
                <option value="United States">🇺🇸 United States</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="France">🇫🇷 France</option>
                <option value="Germany">🇩🇪 Germany</option>
                <option value="Italy">🇮🇹 Italy</option>
                <option value="Australia">🇦🇺 Australia</option>
                <option value="Brazil">🇧🇷 Brazil</option>
                <option value="Other">🌍 Other</option>
              </select>
              {touchedFields.has('country') && errors.country && (
                <p className="text-red-600 text-sm mt-1">{errors.country}</p>
              )}
            </div>
          </div>

          {/* Optional: Coordinates for precise location */}
          <div className="mt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="enableCoordinates"
                checked={formData.enableCoordinates}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Add precise location coordinates</span>
            </label>
            
            {formData.enableCoordinates && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Input
                  type="number"
                  name="latitude"
                  label="Latitude"
                  placeholder="33.8938"
                  step="any"
                  value={formData.latitude ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touchedFields.has('latitude') ? errors.latitude : null}
                  disabled={isLoading}
                  helperText="Beirut: ~33.8938"
                />
                <Input
                  type="number"
                  name="longitude"
                  label="Longitude"
                  placeholder="35.5018"
                  step="any"
                  value={formData.longitude ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touchedFields.has('longitude') ? errors.longitude : null}
                  disabled={isLoading}
                  helperText="Beirut: ~35.5018"
                />
              </div>
            )}
          </div>
        </div>

        {/* User Preferences Section - Lebanon Localized */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            User Preferences
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Zone - Lebanon First */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Zone</label>
              <select
                name="timeZone"
                value={formData.timeZone ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Asia/Beirut">🇱🇧 Beirut Time (EET)</option>
                <option value="">--- Regional ---</option>
                <option value="Asia/Damascus">🇸🇾 Damascus</option>
                <option value="Asia/Amman">🇯🇴 Amman</option>
                <option value="Asia/Jerusalem">🇮🇱 Jerusalem</option>
                <option value="Europe/Istanbul">🇹🇷 Istanbul</option>
                <option value="Asia/Riyadh">🇸🇦 Riyadh</option>
                <option value="Asia/Dubai">🇦🇪 Dubai</option>
                <option value="Asia/Kuwait">🇰🇼 Kuwait</option>
                <option value="">--- International ---</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
              </select>
            </div>

            {/* Language - Arabic and English Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
              <select
                name="language"
                value={formData.language ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en-US">🇺🇸 English (US)</option>
                <option value="ar-LB">🇱🇧 Arabic (Lebanon)</option>
                <option value="ar-SA">🇸🇦 Arabic (Standard)</option>
                <option value="en-GB">🇬🇧 English (UK)</option>
                <option value="fr-FR">🇫🇷 French</option>
                <option value="tr-TR">🇹🇷 Turkish</option>
                <option value="es-ES">🇪🇸 Spanish</option>
                <option value="de-DE">🇩🇪 German</option>
                <option value="it-IT">🇮🇹 Italian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Theme</label>
              <select
                name="theme"
                value={formData.theme ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="light">☀️ Light</option>
                <option value="dark">🌙 Dark</option>
                <option value="auto">🔄 Auto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Account Settings
          </h4>

          <div className="space-y-4">
            {/* Active Status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Active Account</span>
                  <p className="text-xs text-gray-500">User can log in and access the system</p>
                </div>
              </label>
            </motion.div>

            {/* Must Change Password */}
            {!isEditing && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55, duration: 0.3 }}
              >
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="mustChangePassword"
                    checked={formData.mustChangePassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Require Password Change</span>
                    <p className="text-xs text-gray-500">User must change password on first login</p>
                  </div>
                </label>
              </motion.div>
            )}

            {/* Send Welcome Email */}
            {!isEditing && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="sendWelcomeEmail"
                    checked={formData.sendWelcomeEmail}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Send Welcome Email</span>
                    <p className="text-xs text-gray-500">Send welcome email with login credentials</p>
                  </div>
                </label>
              </motion.div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="flex justify-end space-x-3 pt-6 border-t border-gray-200"
        >
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            className="transition-all duration-200"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={!isFormValid || isLoading}
            className="transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update User' : 'Create User')
            }
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

UserForm.propTypes = {
  user: PropTypes.object,
  availableRoles: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string
};

export default UserForm;