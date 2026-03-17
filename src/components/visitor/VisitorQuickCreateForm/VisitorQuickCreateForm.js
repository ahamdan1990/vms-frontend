// src/components/visitor/VisitorQuickCreateForm/VisitorQuickCreateForm.js
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { UserPlusIcon, InformationCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Lightweight visitor creation form for use inside the InvitationForm.
 * Calls onSubmit(visitorData, null, { photoFile: null, documentFiles: [], isEdit: false }).
 */
const VisitorQuickCreateForm = ({
  onSubmit,
  onCancel,
  loading = false,
  error = null
}) => {
  const { t } = useTranslation(['visitors', 'common']);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    phoneCountryCode: '961',
    company: '',
    jobTitle: '',
    language: 'en-US',
    timeZone: 'Asia/Beirut'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const countryCodeOptions = useMemo(() => [
    { value: '961', label: t('quickCreate.countryCodes.lb') },
    { value: '963', label: t('quickCreate.countryCodes.sy') },
    { value: '962', label: t('quickCreate.countryCodes.jo') },
    { value: '972', label: t('quickCreate.countryCodes.il') },
    { value: '90', label: t('quickCreate.countryCodes.tr') },
    { value: '20', label: t('quickCreate.countryCodes.eg') },
    { value: '966', label: t('quickCreate.countryCodes.sa') },
    { value: '971', label: t('quickCreate.countryCodes.ae') },
    { value: '965', label: t('quickCreate.countryCodes.kw') },
    { value: '974', label: t('quickCreate.countryCodes.qa') },
    { value: '1', label: t('quickCreate.countryCodes.us') },
    { value: '44', label: t('quickCreate.countryCodes.gb') },
    { value: '33', label: t('quickCreate.countryCodes.fr') },
    { value: '49', label: t('quickCreate.countryCodes.de') },
    { value: '39', label: t('quickCreate.countryCodes.it') }
  ], [t]);

  const EMAIL_RE = /\S+@\S+\.\S+/;

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        return !value.trim() ? t('quickCreate.validation.firstNameRequired') : null;
      case 'lastName':
        return !value.trim() ? t('quickCreate.validation.lastNameRequired') : null;
      case 'email':
        if (!value.trim()) return t('quickCreate.validation.emailRequired');
        if (!EMAIL_RE.test(value)) return t('quickCreate.validation.emailInvalid');
        return null;
      case 'phoneNumber': {
        if (!value.trim()) return t('quickCreate.validation.phoneRequired');
        const digits = value.replace(/\D/g, '');
        if (digits.length < 7) {
          return t('quickCreate.validation.phoneMinDigits', { count: digits.length });
        }
        if (digits.length > 15) return t('quickCreate.validation.phoneMaxDigits');
        return null;
      }
      default:
        return null;
    }
  };

  const validateAll = () => {
    const required = ['firstName', 'lastName', 'email', 'phoneNumber'];
    const next = {};
    required.forEach((field) => {
      const message = validateField(field, formData[field]);
      if (message) next[field] = message;
    });
    return next;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const message = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: message || undefined }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const message = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: message || undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ firstName: true, lastName: true, email: true, phoneNumber: true });

    const allErrors = validateAll();
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    await onSubmit(
      {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        company: formData.company.trim() || undefined,
        jobTitle: formData.jobTitle.trim() || undefined
      },
      null,
      { photoFile: null, documentFiles: [], isEdit: false }
    );
  };

  const errorMessage = error ? extractErrorMessage(error) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 pb-1">
        <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <UserPlusIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('quickCreate.header.description')}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('fields.firstName')}
            name="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            error={touched.firstName ? errors.firstName : undefined}
            required
            placeholder={t('quickCreate.placeholders.firstName')}
            autoComplete="given-name"
            disabled={loading}
          />
          <Input
            label={t('fields.lastName')}
            name="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            error={touched.lastName ? errors.lastName : undefined}
            required
            placeholder={t('quickCreate.placeholders.lastName')}
            autoComplete="family-name"
            disabled={loading}
          />
        </div>

        <Input
          label={t('fields.email')}
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={touched.email ? errors.email : undefined}
          required
          placeholder={t('quickCreate.placeholders.email')}
          autoComplete="email"
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('fields.phone')} <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              value={formData.phoneCountryCode}
              onChange={(e) => handleChange('phoneCountryCode', e.target.value)}
              disabled={loading}
              className="w-32 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50"
            >
              {countryCodeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <div className="flex-1">
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('phoneNumber')}
                error={touched.phoneNumber ? errors.phoneNumber : undefined}
                placeholder={t('quickCreate.placeholders.phone')}
                autoComplete="tel"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            {t('quickCreate.optional')}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('fields.company')}
              name="company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder={t('quickCreate.placeholders.company')}
              autoComplete="organization"
              disabled={loading}
            />
            <Input
              label={t('fields.jobTitle')}
              name="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder={t('quickCreate.placeholders.jobTitle')}
              autoComplete="organization-title"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
          <InformationCircleIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-400">
            {t('quickCreate.infoNote')}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-1">
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
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {loading ? t('quickCreate.buttons.creating') : t('quickCreate.buttons.create')}
          </Button>
        </div>
      </form>
    </div>
  );
};

VisitorQuickCreateForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array])
};

export default VisitorQuickCreateForm;
