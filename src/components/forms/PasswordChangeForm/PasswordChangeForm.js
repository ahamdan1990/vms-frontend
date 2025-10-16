// src/components/forms/PasswordChangeForm/PasswordChangeForm.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { validatePassword } from '../../../utils/validators';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import PropTypes from 'prop-types';

/**
 * Professional Password Change Form Component
 * Features: Current password validation, new password strength checking, confirmation matching
 */
const PasswordChangeForm = ({
  onSuccess,
  onCancel,
  className = '',
  showCurrentPassword = true,
  title = 'Change Password',
  submitText = 'Update Password'
}) => {
  const { changePassword, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });
  const [touchedFields, setTouchedFields] = useState(new Set());

  // Reset form errors when error prop changes
  useEffect(() => {
    if (!error) {
      setErrors({});
    }
  }, [error]);

  // Validate password strength in real-time
  useEffect(() => {
    if (formData.newPassword) {
      const validation = validatePassword(formData.newPassword);
      setPasswordStrength({
        score: validation.score,
        feedback: validation.feedback
      });
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [formData.newPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'currentPassword':
        if (showCurrentPassword && !value) {
          newErrors.currentPassword = 'Current password is required';
        } else {
          delete newErrors.currentPassword;
        }
        break;

      case 'newPassword':
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) {
          newErrors.newPassword = passwordValidation.message;
        } else {
          delete newErrors.newPassword;
        }
        
        // Re-validate confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your new password';
        } else if (value !== formData.newPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate current password
    if (showCurrentPassword && !formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    // Validate new password
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      newErrors.newPassword = passwordValidation.message;
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if new password is same as current
    if (showCurrentPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    setTouchedFields(new Set(Object.keys(formData)));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      
      if (result.payload) {
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setErrors({});
        setTouchedFields(new Set());
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const getPasswordStrengthColor = (score) => {
    if (score < 2) return 'bg-red-500';
    if (score < 3) return 'bg-yellow-500';
    if (score < 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score) => {
    if (score < 2) return 'Weak';
    if (score < 3) return 'Fair';
    if (score < 4) return 'Good';
    return 'Strong';
  };

  const isFormValid = !Object.values(errors).some(error => error) && 
                     (showCurrentPassword ? formData.currentPassword : true) && 
                     formData.newPassword && 
                     formData.confirmPassword &&
                     passwordStrength.score >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        {title && (
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Update your password to keep your account secure
            </p>
          </div>
        )}

        {/* Global Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 text-sm font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Current Password Field */}
        {showCurrentPassword && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Input
              type="password"
              name="currentPassword"
              label="Current Password"
              placeholder="Enter your current password"
              value={formData.currentPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touchedFields.has('currentPassword') ? errors.currentPassword : null}
              disabled={loading}
              autoComplete="current-password"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              }
              showPasswordToggle={true}
              className="transition-all duration-200"
            />
          </motion.div>
        )}

        {/* New Password Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Input
            type="password"
            name="newPassword"
            label="New Password"
            placeholder="Enter your new password"
            value={formData.newPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touchedFields.has('newPassword') ? errors.newPassword : null}
            disabled={loading}
            autoComplete="new-password"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            showPasswordToggle={true}
            className="transition-all duration-200"
          />
          
          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Password strength:</span>
                <span className={`text-xs font-medium ${passwordStrength.score >= 4 ? 'text-green-600' : passwordStrength.score >= 3 ? 'text-blue-600' : passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {getPasswordStrengthText(passwordStrength.score)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className={`h-2 rounded-full transition-all duration-500 ${getPasswordStrengthColor(passwordStrength.score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                />
              </div>
              {passwordStrength.feedback.length > 0 && (
                <ul className="mt-2 text-xs text-gray-600 space-y-1">
                  {passwordStrength.feedback.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center"
                    >
                      <svg className="w-3 h-3 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Confirm Password Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Input
            type="password"
            name="confirmPassword"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touchedFields.has('confirmPassword') ? errors.confirmPassword : null}
            success={formData.confirmPassword && formData.newPassword === formData.confirmPassword ? "Passwords match" : null}
            disabled={loading}
            autoComplete="new-password"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            showPasswordToggle={true}
            className="transition-all duration-200"
          />
        </motion.div>

        {/* Security Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-blue-800 font-medium text-sm mb-1">Password Requirements</h4>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Mix of uppercase and lowercase letters</li>
                <li>• Include numbers and special characters</li>
                <li>• Avoid common words or personal information</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Form Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex justify-end space-x-3 pt-6 border-t border-gray-200"
        >
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              className="transition-all duration-200"
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!isFormValid || loading}
            className="transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Updating...' : submitText}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

PasswordChangeForm.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
  showCurrentPassword: PropTypes.bool,
  title: PropTypes.string,
  submitText: PropTypes.string
};

export default PasswordChangeForm;