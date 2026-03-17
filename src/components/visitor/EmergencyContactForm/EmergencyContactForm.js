// src/components/visitor/EmergencyContactForm/EmergencyContactForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['visitors', 'common']);

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

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = t('emergencyContactForm.validation.firstNameRequired');
    } else if (formData.firstName.length < 2) {
      errors.firstName = t('emergencyContactForm.validation.firstNameMin');
    } else if (formData.firstName.length > 50) {
      errors.firstName = t('emergencyContactForm.validation.firstNameMax');
    }

    if (!formData.lastName.trim()) {
      errors.lastName = t('emergencyContactForm.validation.lastNameRequired');
    } else if (formData.lastName.length < 2) {
      errors.lastName = t('emergencyContactForm.validation.lastNameMin');
    } else if (formData.lastName.length > 50) {
      errors.lastName = t('emergencyContactForm.validation.lastNameMax');
    }

    if (!formData.relationship.trim()) {
      errors.relationship = t('emergencyContactForm.validation.relationshipRequired');
    } else if (formData.relationship.length > 50) {
      errors.relationship = t('emergencyContactForm.validation.relationshipMax');
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = t('emergencyContactForm.validation.phoneRequired');
    } else if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = t('emergencyContactForm.validation.phoneInvalid');
    }

    if (formData.alternatePhoneNumber && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.alternatePhoneNumber.replace(/\s/g, ''))) {
      errors.alternatePhoneNumber = t('emergencyContactForm.validation.alternatePhoneInvalid');
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('emergencyContactForm.validation.emailInvalid');
    }

    if (formData.priority) {
      const priority = parseInt(formData.priority, 10);
      if (isNaN(priority) || priority < 1 || priority > 10) {
        errors.priority = t('emergencyContactForm.validation.priorityRange');
      } else {
        const priorityTaken = existingContacts.some(contact =>
          contact.priority === priority &&
          (!isEdit || contact.id !== initialData?.id)
        );
        if (priorityTaken) {
          errors.priority = t('emergencyContactForm.validation.priorityTaken', { priority });
        }
      }
    }

    if (formData.isPrimary) {
      const existingPrimary = existingContacts.find(contact =>
        contact.isPrimary &&
        (!isEdit || contact.id !== initialData?.id)
      );
      if (existingPrimary) {
        errors._primaryWarning = t('emergencyContactForm.validation.primaryWarning', {
          name: `${existingPrimary.firstName} ${existingPrimary.lastName}`
        });
      }
    }

    if (formData.notes && formData.notes.length > 500) {
      errors.notes = t('emergencyContactForm.validation.notesMax');
    }

    if (formData.address && formData.address.length > 200) {
      errors.address = t('emergencyContactForm.validation.addressMax');
    }

    setFormErrors(errors);
    const actualErrors = Object.keys(errors).filter(key => !key.startsWith('_'));
    return actualErrors.length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFields = Object.keys(formData);
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    if (!validateForm()) {
      return;
    }

    const submissionData = {
      ...formData,
      priority: formData.priority ? parseInt(formData.priority, 10) : null
    };

    try {
      await onSubmit(submissionData);
    } catch (submissionError) {
      console.error('Form submission error:', submissionError);
    }
  };

  const relationships = [
    { value: 'Spouse', label: t('emergencyContactForm.relationships.spouse') },
    { value: 'Partner', label: t('emergencyContactForm.relationships.partner') },
    { value: 'Parent', label: t('emergencyContactForm.relationships.parent') },
    { value: 'Child', label: t('emergencyContactForm.relationships.child') },
    { value: 'Sibling', label: t('emergencyContactForm.relationships.sibling') },
    { value: 'Friend', label: t('emergencyContactForm.relationships.friend') },
    { value: 'Colleague', label: t('emergencyContactForm.relationships.colleague') },
    { value: 'Neighbor', label: t('emergencyContactForm.relationships.neighbor') },
    { value: 'Guardian', label: t('emergencyContactForm.relationships.guardian') },
    { value: 'Other', label: t('emergencyContactForm.relationships.other') }
  ];

  const getAvailablePriorities = () => {
    const usedPriorities = existingContacts
      .filter(c => c.id !== initialData?.id && c.priority)
      .map(c => c.priority);

    const available = [];
    for (let i = 1; i <= 10; i += 1) {
      if (!usedPriorities.includes(i)) {
        available.push(i);
      }
    }
    return available;
  };

  const availablePriorities = getAvailablePriorities();

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/30 dark:border-red-700">
          <div className="text-sm text-red-700 dark:text-red-200">
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

      {formErrors._primaryWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 dark:bg-yellow-900/30 dark:border-yellow-600">
          <div className="text-sm text-yellow-700 dark:text-yellow-200">
            <strong>{t('emergencyContactForm.labels.notePrefix')}</strong> {formErrors._primaryWarning}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('emergencyContactForm.sections.contactInformation')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('fields.firstName')}
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              error={touched.firstName ? formErrors.firstName : undefined}
              required
              maxLength={50}
            />

            <Input
              label={t('fields.lastName')}
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              error={touched.lastName ? formErrors.lastName : undefined}
              required
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('emergencyContactForm.fields.relationship')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => handleChange('relationship', e.target.value)}
              onBlur={() => handleBlur('relationship')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.relationship && formErrors.relationship
                  ? 'border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 dark:bg-slate-900/60'
              } text-gray-900 dark:text-gray-100`}
              required
            >
              <option value="">{t('emergencyContactForm.placeholders.relationship')}</option>
              {relationships.map((relationship) => (
                <option key={relationship.value} value={relationship.value}>
                  {relationship.label}
                </option>
              ))}
            </select>
            {touched.relationship && formErrors.relationship && (
              <p className="mt-1 text-sm text-red-600">{formErrors.relationship}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t('emergencyContactForm.sections.contactDetails')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('fields.phone')}
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              onBlur={() => handleBlur('phoneNumber')}
              error={touched.phoneNumber ? formErrors.phoneNumber : undefined}
              required
              placeholder={t('emergencyContactForm.placeholders.phoneNumber')}
            />

            <Input
              label={t('emergencyContactForm.fields.alternatePhone')}
              type="tel"
              value={formData.alternatePhoneNumber}
              onChange={(e) => handleChange('alternatePhoneNumber', e.target.value)}
              onBlur={() => handleBlur('alternatePhoneNumber')}
              error={touched.alternatePhoneNumber ? formErrors.alternatePhoneNumber : undefined}
              placeholder={t('emergencyContactForm.placeholders.alternatePhone')}
            />
          </div>

          <Input
            label={t('fields.email')}
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={touched.email ? formErrors.email : undefined}
            placeholder={t('emergencyContactForm.placeholders.email')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.address')}
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              onBlur={() => handleBlur('address')}
              rows={3}
              maxLength={200}
              placeholder={t('emergencyContactForm.placeholders.address')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.address && formErrors.address
                  ? 'border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 dark:bg-slate-900/60'
              } text-gray-900 dark:text-gray-100`}
            />
            {touched.address && formErrors.address && (
              <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('emergencyContactForm.characters', { current: formData.address.length, max: 200 })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('emergencyContactForm.sections.prioritySettings')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('emergencyContactForm.fields.contactPriority')}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                onBlur={() => handleBlur('priority')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  touched.priority && formErrors.priority
                    ? 'border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 dark:bg-slate-900/60'
                } text-gray-900 dark:text-gray-100`}
              >
                <option value="">{t('emergencyContactForm.placeholders.noSpecificPriority')}</option>
                {availablePriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {t('emergencyContactForm.priorityOption', {
                      priority,
                      suffix: priority === 1
                        ? t('emergencyContactForm.priorityHighest')
                        : priority === 10
                          ? t('emergencyContactForm.priorityLowest')
                          : ''
                    })}
                  </option>
                ))}
              </select>
              {touched.priority && formErrors.priority && (
                <p className="mt-1 text-sm text-red-600">{formErrors.priority}</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('emergencyContactForm.help.priority')}
              </p>
            </div>

            <div className="flex items-start gap-3 pt-6">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => handleChange('isPrimary', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-900"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor="isPrimary" className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  {formData.isPrimary ? (
                    <StarIconSolid className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <StarIcon className="w-4 h-4 text-gray-400" />
                  )}
                  <span>{t('emergencyContactForm.fields.primaryEmergencyContact')}</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('emergencyContactForm.help.primaryContact')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('emergencyContactForm.sections.additionalInformation')}</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('notes.title')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              onBlur={() => handleBlur('notes')}
              rows={3}
              maxLength={500}
              placeholder={t('emergencyContactForm.placeholders.notes')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.notes && formErrors.notes
                  ? 'border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 dark:bg-slate-900/60'
              } text-gray-900 dark:text-gray-100`}
            />
            {touched.notes && formErrors.notes && (
              <p className="mt-1 text-sm text-red-600">{formErrors.notes}</p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('emergencyContactForm.characters', { current: formData.notes.length, max: 500 })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('emergencyContactForm.sections.preview')}</h3>
          <div className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              {formData.isPrimary && (
                <StarIconSolid className="w-4 h-4 text-yellow-500" />
              )}
              <div className="font-medium text-gray-900 dark:text-white">
                {formData.firstName || t('emergencyContactForm.preview.firstNameFallback')} {formData.lastName || t('emergencyContactForm.preview.lastNameFallback')}
              </div>
              {formData.relationship && (
                <Badge variant="secondary" size="sm">
                  {formData.relationship}
                </Badge>
              )}
              {formData.priority && (
                <Badge variant="info" size="sm">
                  {t('emergencyContactForm.preview.priorityBadge', { priority: formData.priority })}
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              {formData.phoneNumber && (
                <div>{t('emergencyContactForm.preview.phone', { value: formData.phoneNumber })}</div>
              )}
              {formData.email && (
                <div>{t('emergencyContactForm.preview.email', { value: formData.email })}</div>
              )}
              {formData.address && (
                <div>{t('emergencyContactForm.preview.address', { value: formData.address })}</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {t('common:buttons.cancel')}
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading || Object.keys(formErrors).filter(key => !key.startsWith('_')).length > 0}
          >
            {isEdit ? t('emergencyContactForm.actions.updateContact') : t('emergencyContactForm.actions.addContact')}
          </Button>
        </div>
      </form>
    </div>
  );
};

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
