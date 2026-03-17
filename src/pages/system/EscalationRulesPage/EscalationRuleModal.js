// src/pages/system/EscalationRulesPage/EscalationRuleModal.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('system');
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
      errors.ruleName = t('escalationRules.modal.validation.ruleNameRequired');
    }

    if (!formData.alertType) {
      errors.alertType = t('escalationRules.modal.validation.alertTypeRequired');
    }

    if (!formData.alertPriority) {
      errors.alertPriority = t('escalationRules.modal.validation.alertPriorityRequired');
    }

    if (!formData.action) {
      errors.action = t('escalationRules.modal.validation.actionRequired');
    }

    if (formData.escalationDelayMinutes < 0) {
      errors.escalationDelayMinutes = t('escalationRules.modal.validation.delayNegative');
    }

    if (formData.maxAttempts < 1) {
      errors.maxAttempts = t('escalationRules.modal.validation.maxAttemptsMin');
    }

    if (formData.rulePriority < 1) {
      errors.rulePriority = t('escalationRules.modal.validation.rulePriorityMin');
    }

    // Action-specific validation
    if (formData.action === 'EscalateToUser' && !formData.escalationTargetUserId) {
      errors.escalationTargetUserId = t('escalationRules.modal.validation.targetUserRequired');
    }

    if (formData.action === 'EscalateToRole' && !formData.escalationTargetRole) {
      errors.escalationTargetRole = t('escalationRules.modal.validation.targetRoleRequired');
    }

    if (formData.action === 'SendEmail' && !formData.escalationEmails) {
      errors.escalationEmails = t('escalationRules.modal.validation.emailRequired');
    } else if (formData.action === 'SendEmail' && formData.escalationEmails) {
      // Validate email format
      const emails = formData.escalationEmails.split(',').map(e => e.trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        errors.escalationEmails = t('escalationRules.modal.validation.emailInvalid', { emails: invalidEmails.join(', ') });
      }
    }

    if (formData.action === 'SendSMS' && !formData.escalationPhones) {
      errors.escalationPhones = t('escalationRules.modal.validation.phoneRequired');
    } else if (formData.action === 'SendSMS' && formData.escalationPhones) {
      // Basic phone number validation
      const phones = formData.escalationPhones.split(',').map(p => p.trim());
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      const invalidPhones = phones.filter(phone => !phoneRegex.test(phone));
      if (invalidPhones.length > 0) {
        errors.escalationPhones = t('escalationRules.modal.validation.phoneInvalid', { phones: invalidPhones.join(', ') });
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
        return t('escalationRules.modal.actionDescriptions.escalateToUser');
      case 'EscalateToRole':
        return t('escalationRules.modal.actionDescriptions.escalateToRole');
      case 'SendEmail':
        return t('escalationRules.modal.actionDescriptions.sendEmail');
      case 'SendSMS':
        return t('escalationRules.modal.actionDescriptions.sendSms');
      case 'CreateHighPriorityAlert':
        return t('escalationRules.modal.actionDescriptions.createHighPriorityAlert');
      case 'LogCriticalEvent':
        return t('escalationRules.modal.actionDescriptions.logCriticalEvent');
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
              label={t('escalationRules.modal.targetRole')}
              value={formData.escalationTargetRole}
              onChange={(e) => handleInputChange('escalationTargetRole', e.target.value)}
              error={validationErrors.escalationTargetRole}
              required
              disabled={readOnly}
            >
              <option value="">{t('escalationRules.modal.selectRole')}</option>
              {Object.entries(TARGET_ROLES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  {t('escalationRules.modal.alertWillBeSent')}
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
              label={t('escalationRules.modal.targetUserId')}
              value={formData.escalationTargetUserId || ''}
              onChange={(e) => handleInputChange('escalationTargetUserId', parseInt(e.target.value) || null)}
              error={validationErrors.escalationTargetUserId}
              placeholder={t('escalationRules.modal.enterUserId')}
              required
              disabled={readOnly}
            />
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  {t('escalationRules.modal.userIdNote')}
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
              label={t('escalationRules.modal.emailAddresses')}
              value={formData.escalationEmails}
              onChange={(e) => handleInputChange('escalationEmails', e.target.value)}
              error={validationErrors.escalationEmails}
              placeholder={t('escalationRules.modal.emailPlaceholder')}
              helperText={t('escalationRules.modal.emailHelper')}
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
              label={t('escalationRules.modal.phoneNumbers')}
              value={formData.escalationPhones}
              onChange={(e) => handleInputChange('escalationPhones', e.target.value)}
              error={validationErrors.escalationPhones}
              placeholder={t('escalationRules.modal.phonePlaceholder')}
              helperText={t('escalationRules.modal.phoneHelper')}
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
      title={mode === 'create' ? t('escalationRules.modal.createTitle') : mode === 'edit' ? t('escalationRules.modal.editTitle') : t('escalationRules.modal.viewTitle')}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{extractErrorMessage(error)}</p>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('escalationRules.modal.basicInfo')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label={t('escalationRules.modal.ruleName')}
                value={formData.ruleName}
                onChange={(e) => handleInputChange('ruleName', e.target.value)}
                error={validationErrors.ruleName}
                placeholder={t('escalationRules.modal.ruleNamePlaceholder')}
                required
                disabled={readOnly}
              />
            </div>

            <Select
              label={t('escalationRules.modal.alertType')}
              value={formData.alertType}
              onChange={(e) => handleInputChange('alertType', e.target.value)}
              error={validationErrors.alertType}
              required
              disabled={readOnly}
            >
              <option value="">{t('escalationRules.modal.selectAlertType')}</option>
              {Object.entries(mergedAlertTypes).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>

            <Select
              label={t('escalationRules.modal.alertPriority')}
              value={formData.alertPriority}
              onChange={(e) => handleInputChange('alertPriority', e.target.value)}
              error={validationErrors.alertPriority}
              required
              disabled={readOnly}
            >
              <option value="">{t('escalationRules.modal.selectPriority')}</option>
              {Object.entries(mergedAlertPriorities).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>

            <Select
              label={t('escalationRules.modal.targetRole')}
              value={formData.targetRole}
              onChange={(e) => handleInputChange('targetRole', e.target.value)}
              error={validationErrors.targetRole}
              disabled={readOnly}
            >
              <option value="">{t('escalationRules.modal.allRoles')}</option>
              {Object.entries(TARGET_ROLES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>

            <Input
              type="number"
              label={t('escalationRules.modal.escalationDelay')}
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('escalationRules.modal.escalationAction')}</h3>
          
          <div className="space-y-4">
            <Select
              label={t('escalationRules.modal.action')}
              value={formData.action}
              onChange={(e) => handleActionChange(e.target.value)}
              error={validationErrors.action}
              required
              disabled={readOnly}
            >
              <option value="">{t('escalationRules.modal.selectAction')}</option>
              {Object.entries(mergedEscalationActions).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>

            {formData.action && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
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
            <h3 className="text-lg font-medium text-gray-900">{t('escalationRules.modal.advancedOptions')}</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              {showAdvancedOptions ? t('escalationRules.modal.hideAdvanced') : t('escalationRules.modal.showAdvanced')}
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
                  label={t('escalationRules.modal.maxAttempts')}
                  value={formData.maxAttempts}
                  onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value) || 1)}
                  error={validationErrors.maxAttempts}
                  min="1"
                  helperText={t('escalationRules.modal.maxAttemptsHelper')}
                  disabled={readOnly}
                />

                <Input
                  type="number"
                  label={t('escalationRules.modal.rulePriority')}
                  value={formData.rulePriority}
                  onChange={(e) => handleInputChange('rulePriority', parseInt(e.target.value) || 1)}
                  error={validationErrors.rulePriority}
                  min="1"
                  helperText={t('escalationRules.modal.rulePriorityHelper')}
                  disabled={readOnly}
                />

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isEnabled}
                      onChange={(e) => handleInputChange('isEnabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={readOnly}
                    />
                    <span className="text-sm font-medium text-gray-700">{t('escalationRules.modal.enableRule')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('escalationRules.modal.configJson')}
                </label>
                <textarea
                  value={formData.configuration}
                  onChange={(e) => handleInputChange('configuration', e.target.value)}
                  placeholder={t('escalationRules.modal.configPlaceholder')}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  disabled={readOnly}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('escalationRules.modal.configJsonHelper')}
                </p>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {mode === 'view' ? t('escalationRules.modal.close') : t('escalationRules.modal.cancel')}
          </Button>
          
          {mode !== 'view' && (
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {mode === 'create' ? t('escalationRules.modal.createRule') : t('escalationRules.modal.updateRule')}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default EscalationRuleModal;
