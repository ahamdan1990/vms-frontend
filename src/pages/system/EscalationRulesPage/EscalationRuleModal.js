// src/pages/system/EscalationRulesPage/EscalationRuleModal.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '../../../components/common/Modal/Modal';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Card from '../../../components/common/Card/Card';
import { extractErrorMessage } from '../../../utils/errorUtils';
import {
  ALERT_TYPES,
  ALERT_PRIORITIES,
  ESCALATION_ACTIONS,
  TARGET_ROLES,
  DEFAULT_ESCALATION_RULE
} from '../../../constants/escalationRules';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  BellIcon
} from '@heroicons/react/24/outline';

/**
 * Escalation Rule Modal Component
 * Handles both create and edit operations for escalation rules
 */
const EscalationRuleModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
  error = null,
  alertTypes = {},
  alertPriorities = {},
  escalationActions = {},
  mode = 'create', // 'create' | 'edit' | 'view'
  readOnly = false
}) => {
  const [formData, setFormData] = useState(DEFAULT_ESCALATION_RULE);

  const [validationErrors, setValidationErrors] = useState({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        ruleName: initialData.ruleName || '',
        alertType: initialData.alertType || '',
        alertPriority: initialData.alertPriority || '',
        targetRole: initialData.targetRole || '',
        locationId: initialData.locationId || null,
        escalationDelayMinutes: initialData.escalationDelayMinutes || 5,
        action: initialData.action || '',
        escalationTargetRole: initialData.escalationTargetRole || '',
        escalationTargetUserId: initialData.escalationTargetUserId || null,
        escalationEmails: initialData.escalationEmails || '',
        escalationPhones: initialData.escalationPhones || '',
        maxAttempts: initialData.maxAttempts || 3,
        isEnabled: initialData.isEnabled ?? true,
        rulePriority: initialData.rulePriority || 10,
        configuration: initialData.configuration || ''
      });
    } else {
      // Reset form for create mode
      setFormData(DEFAULT_ESCALATION_RULE);
    }
    setValidationErrors({});
  }, [initialData, isOpen]);

  // Form handlers
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

  const handleActionChange = (action) => {
    setFormData(prev => ({
      ...prev,
      action,
      // Clear action-specific fields when action changes
      escalationTargetRole: '',
      escalationTargetUserId: null,
      escalationEmails: '',
      escalationPhones: ''
    }));
  };

  // Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.ruleName.trim()) {
      errors.ruleName = 'Rule name is required';
    }

    if (!formData.alertType) {
      errors.alertType = 'Alert type is required';
    }

    if (!formData.alertPriority) {
      errors.alertPriority = 'Alert priority is required';
    }

    if (!formData.action) {
      errors.action = 'Escalation action is required';
    }

    if (formData.escalationDelayMinutes < 0) {
      errors.escalationDelayMinutes = 'Escalation delay cannot be negative';
    }

    if (formData.maxAttempts < 1) {
      errors.maxAttempts = 'Max attempts must be at least 1';
    }

    if (formData.rulePriority < 1) {
      errors.rulePriority = 'Rule priority must be at least 1';
    }

    // Action-specific validation
    if (formData.action === 'EscalateToUser' && !formData.escalationTargetUserId) {
      errors.escalationTargetUserId = 'Target user is required for user escalation';
    }

    if (formData.action === 'EscalateToRole' && !formData.escalationTargetRole) {
      errors.escalationTargetRole = 'Target role is required for role escalation';
    }

    if (formData.action === 'SendEmail' && !formData.escalationEmails) {
      errors.escalationEmails = 'Email addresses are required for email escalation';
    } else if (formData.action === 'SendEmail' && formData.escalationEmails) {
      // Validate email format
      const emails = formData.escalationEmails.split(',').map(e => e.trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        errors.escalationEmails = `Invalid email format: ${invalidEmails.join(', ')}`;
      }
    }

    if (formData.action === 'SendSMS' && !formData.escalationPhones) {
      errors.escalationPhones = 'Phone numbers are required for SMS escalation';
    } else if (formData.action === 'SendSMS' && formData.escalationPhones) {
      // Basic phone number validation
      const phones = formData.escalationPhones.split(',').map(p => p.trim());
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      const invalidPhones = phones.filter(phone => !phoneRegex.test(phone));
      if (invalidPhones.length > 0) {
        errors.escalationPhones = `Invalid phone format: ${invalidPhones.join(', ')}`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Don't submit in view mode
    if (mode === 'view' || readOnly) {
      return;
    }
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData(DEFAULT_ESCALATION_RULE);
    setValidationErrors({});
    setShowAdvancedOptions(false);
    onClose();
  };

  // Merge API data with constants as fallbacks
  const mergedAlertTypes = Object.keys(alertTypes).length > 0 ? alertTypes : ALERT_TYPES;
  const mergedAlertPriorities = Object.keys(alertPriorities).length > 0 ? alertPriorities : ALERT_PRIORITIES;
  const mergedEscalationActions = Object.keys(escalationActions).length > 0 ? escalationActions : ESCALATION_ACTIONS;
  const getActionIcon = (action) => {
    switch (action) {
      case 'EscalateToUser':
      case 'EscalateToRole':
        return <UserGroupIcon className="w-4 h-4" />;
      case 'SendEmail':
        return <EnvelopeIcon className="w-4 h-4" />;
      case 'SendSMS':
        return <PhoneIcon className="w-4 h-4" />;
      default:
        return <BellIcon className="w-4 h-4" />;
    }
  };

  const getActionDescription = (action) => {
    switch (action) {
      case 'EscalateToUser':
        return 'Escalate the alert to a specific user';
      case 'EscalateToRole':
        return 'Escalate the alert to all users with a specific role';
      case 'SendEmail':
        return 'Send email notifications to specified addresses';
      case 'SendSMS':
        return 'Send SMS notifications to specified phone numbers';
      case 'CreateHighPriorityAlert':
        return 'Create a high priority alert in the system';
      case 'LogCriticalEvent':
        return 'Log the event as a critical system event';
      default:
        return '';
    }
  };

  // Render action-specific fields
  const renderActionFields = () => {
    if (!formData.action) return null;

    switch (formData.action) {
      case 'EscalateToRole':
        return (
          <div className="space-y-4">
            <Select
              label="Target Role"
              value={formData.escalationTargetRole}
              onChange={(value) => handleInputChange('escalationTargetRole', value)}
              error={validationErrors.escalationTargetRole}
              required
              disabled={readOnly}
            >
              <option value="">Select Role</option>
              {Object.entries(TARGET_ROLES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Alert will be sent to all users with the selected role.
                </p>
              </div>
            </div>
          </div>
        );

      case 'EscalateToUser':
        return (
          <div className="space-y-4">
            <Input
              type="number"
              label="Target User ID"
              value={formData.escalationTargetUserId || ''}
              onChange={(e) => handleInputChange('escalationTargetUserId', parseInt(e.target.value) || null)}
              error={validationErrors.escalationTargetUserId}
              placeholder="Enter user ID"
              required
              disabled={readOnly}
            />
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  You'll need to know the specific user ID. Consider using role escalation for easier management.
                </p>
              </div>
            </div>
          </div>
        );

      case 'SendEmail':
        return (
          <div className="space-y-4">
            <Input
              type="text"
              label="Email Addresses"
              value={formData.escalationEmails}
              onChange={(e) => handleInputChange('escalationEmails', e.target.value)}
              error={validationErrors.escalationEmails}
              placeholder="email1@company.com, email2@company.com"
              helperText="Separate multiple email addresses with commas"
              required
              disabled={readOnly}
            />
          </div>
        );

      case 'SendSMS':
        return (
          <div className="space-y-4">
            <Input
              type="text"
              label="Phone Numbers"
              value={formData.escalationPhones}
              onChange={(e) => handleInputChange('escalationPhones', e.target.value)}
              error={validationErrors.escalationPhones}
              placeholder="+1234567890, +0987654321"
              helperText="Separate multiple phone numbers with commas. Include country code."
              required
              disabled={readOnly}
            />
          </div>
        );

      default:
        return (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              {getActionDescription(formData.action)}
            </p>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`${mode === 'create' ? 'Create' : mode === 'edit' ? 'Edit' : 'View'} Escalation Rule`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{extractErrorMessage(error)}</p>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Rule Name"
                value={formData.ruleName}
                onChange={(e) => handleInputChange('ruleName', e.target.value)}
                error={validationErrors.ruleName}
                placeholder="Enter rule name"
                required
                disabled={readOnly}
              />
            </div>

            <Select
              label="Alert Type"
              value={formData.alertType}
              onChange={(value) => handleInputChange('alertType', value)}
              error={validationErrors.alertType}
              required
              disabled={readOnly}
            >
              <option value="">Select Alert Type</option>
              {Object.entries(mergedAlertTypes).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>

            <Select
              label="Alert Priority"
              value={formData.alertPriority}
              onChange={(value) => handleInputChange('alertPriority', value)}
              error={validationErrors.alertPriority}
              required
              disabled={readOnly}
            >
              <option value="">Select Priority</option>
              {Object.entries(mergedAlertPriorities).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>

            <Select
              label="Target Role (Optional)"
              value={formData.targetRole}
              onChange={(value) => handleInputChange('targetRole', value)}
              error={validationErrors.targetRole}
              disabled={readOnly}
            >
              <option value="">All Roles</option>
              {Object.entries(TARGET_ROLES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>

            <Input
              type="number"
              label="Escalation Delay (minutes)"
              value={formData.escalationDelayMinutes}
              onChange={(e) => handleInputChange('escalationDelayMinutes', parseInt(e.target.value) || 0)}
              error={validationErrors.escalationDelayMinutes}
              min="0"
              required
              disabled={readOnly}
            />
          </div>
        </Card>

        {/* Escalation Action */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Escalation Action</h3>
          
          <div className="space-y-4">
            <Select
              label="Action"
              value={formData.action}
              onChange={handleActionChange}
              error={validationErrors.action}
              required
              disabled={readOnly}
            >
              <option value="">Select Action</option>
              {Object.entries(mergedEscalationActions).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>

            {formData.action && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  {getActionIcon(formData.action)}
                  <div>
                    <p className="text-sm font-medium text-blue-900">{mergedEscalationActions[formData.action]}</p>
                    <p className="text-xs text-blue-700 mt-1">{getActionDescription(formData.action)}</p>
                  </div>
                </div>
              </div>
            )}

            {renderActionFields()}
          </div>
        </Card>

        {/* Advanced Options */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Advanced Options</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>

          {showAdvancedOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="Max Attempts"
                  value={formData.maxAttempts}
                  onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value) || 1)}
                  error={validationErrors.maxAttempts}
                  min="1"
                  helperText="Number of escalation attempts before giving up"
                  disabled={readOnly}
                />

                <Input
                  type="number"
                  label="Rule Priority"
                  value={formData.rulePriority}
                  onChange={(e) => handleInputChange('rulePriority', parseInt(e.target.value) || 1)}
                  error={validationErrors.rulePriority}
                  min="1"
                  helperText="Lower numbers have higher priority"
                  disabled={readOnly}
                />

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isEnabled}
                      onChange={(e) => handleInputChange('isEnabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={readOnly}
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Rule</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuration (JSON)
                </label>
                <textarea
                  value={formData.configuration}
                  onChange={(e) => handleInputChange('configuration', e.target.value)}
                  error={validationErrors.configuration}
                  placeholder='{"key": "value"}'
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  disabled={readOnly}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional JSON configuration for advanced rule settings
                </p>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          
          {mode !== 'view' && (
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {mode === 'create' ? 'Create Rule' : 'Update Rule'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default EscalationRuleModal;
