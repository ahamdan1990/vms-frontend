// src/components/visitor/VisitorQuickCreateForm/VisitorQuickCreateForm.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { UserPlusIcon, InformationCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Lightweight visitor creation form for use inside the InvitationForm.
 * Collects only the essential fields. Full profile can be completed later
 * from the Visitors page.
 *
 * Calls onSubmit(visitorData, null, { photoFile: null, documentFiles: [], isEdit: false })
 * matching the same signature as VisitorForm's onSubmit so the parent handler
 * (InvitationForm.handleCreateVisitor) works without changes.
 */
const VisitorQuickCreateForm = ({
  onSubmit,
  onCancel,
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    phoneCountryCode: '961',
    company: '',
    jobTitle: '',
    // Required by backend / service layer — sensible defaults
    language: 'en-US',
    timeZone: 'Asia/Beirut'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ─── Validation ───────────────────────────────────────────────────────────

  const EMAIL_RE = /\S+@\S+\.\S+/;

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        return !value.trim() ? 'First name is required' : null;
      case 'lastName':
        return !value.trim() ? 'Last name is required' : null;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!EMAIL_RE.test(value)) return 'Enter a valid email address';
        return null;
      case 'phoneNumber': {
        if (!value.trim()) return 'Phone number is required';
        const digits = value.replace(/\D/g, '');
        if (digits.length < 7) return `Phone must have at least 7 digits (${digits.length} entered)`;
        if (digits.length > 15) return 'Phone must not exceed 15 digits';
        return null;
      }
      default:
        return null;
    }
  };

  const validateAll = () => {
    const required = ['firstName', 'lastName', 'email', 'phoneNumber'];
    const next = {};
    required.forEach(f => {
      const msg = validateField(f, formData[f]);
      if (msg) next[f] = msg;
    });
    return next;
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const msg = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: msg || undefined }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const msg = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: msg || undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all required fields as touched
    setTouched({ firstName: true, lastName: true, email: true, phoneNumber: true });

    const allErrors = validateAll();
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    // Matches the signature of VisitorForm.onSubmit so InvitationForm.handleCreateVisitor
    // works without any changes.
    await onSubmit(
      {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        company: formData.company.trim() || undefined,
        jobTitle: formData.jobTitle.trim() || undefined
      },
      null,                                                 // no invitation
      { photoFile: null, documentFiles: [], isEdit: false } // no assets
    );
  };

  const errorMessage = error ? extractErrorMessage(error) : null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start gap-3 pb-1">
        <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <UserPlusIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter the essentials to register this visitor. You can fill in their full profile later from the Visitors page.
          </p>
        </div>
      </div>

      {/* API error */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={e => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            error={touched.firstName ? errors.firstName : undefined}
            required
            placeholder="John"
            autoComplete="given-name"
            disabled={loading}
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={e => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            error={touched.lastName ? errors.lastName : undefined}
            required
            placeholder="Doe"
            autoComplete="family-name"
            disabled={loading}
          />
        </div>

        {/* Email */}
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={touched.email ? errors.email : undefined}
          required
          placeholder="john.doe@example.com"
          autoComplete="email"
          disabled={loading}
        />

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              value={formData.phoneCountryCode}
              onChange={e => handleChange('phoneCountryCode', e.target.value)}
              disabled={loading}
              className="w-32 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50"
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
            <div className="flex-1">
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={e => handleChange('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('phoneNumber')}
                error={touched.phoneNumber ? errors.phoneNumber : undefined}
                placeholder="71 123 456"
                autoComplete="tel"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Optional fields */}
        <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Optional
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company"
              name="company"
              value={formData.company}
              onChange={e => handleChange('company', e.target.value)}
              placeholder="Acme Corp"
              autoComplete="organization"
              disabled={loading}
            />
            <Input
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={e => handleChange('jobTitle', e.target.value)}
              placeholder="Engineer"
              autoComplete="organization-title"
              disabled={loading}
            />
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
          <InformationCircleIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Photo, documents, address, and other details can be added from the visitor&apos;s profile page after registration.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
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
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Visitor'}
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
