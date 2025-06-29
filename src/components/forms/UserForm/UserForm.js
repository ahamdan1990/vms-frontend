// src/components/forms/UserForm/UserForm.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { validateUserData } from '../../../utils/validators';
import { usePermissions } from '../../../hooks/usePermissions';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import PropTypes from 'prop-types';

/**
 * Professional User Form Component for Creating/Editing Users
 * Features: Validation, role management, field dependencies, animations
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
  const isEditing = Boolean(user);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'Staff',
    department: '',
    jobTitle: '',
    employeeId: '',
    isActive: true,
    mustChangePassword: !isEditing, // New users must change password
    ...user
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState(new Set());

  // Reset form when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        role: 'Staff',
        department: '',
        jobTitle: '',
        employeeId: '',
        isActive: true,
        mustChangePassword: false,
        ...user
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

    // Validate all fields
    const validation = validateUserData(formData, isEditing);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Mark all fields as touched to show errors
      setTouchedFields(new Set(Object.keys(formData)));
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done by parent component
      setErrors(prev => ({ ...prev, global: error.message }));
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
    // Users can't assign higher roles than their own
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

            {/* Phone Number */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              <Input
                type="tel"
                name="phoneNumber"
                label="Phone Number"
                placeholder="(555) 123-4567"
                value={formData.phoneNumber}
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
                value={formData.role}
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
                value={formData.employeeId}
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
                value={formData.department}
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
                value={formData.jobTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touchedFields.has('jobTitle') ? errors.jobTitle : null}
                disabled={isLoading}
              />
            </motion.div>
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