// src/components/forms/VisitPurposeForm/VisitPurposeForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Visit Purpose Form Component
 * Handles both create and edit operations for visit purposes
 */
const VisitPurposeForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  isEdit = false
}) => {
  const { t } = useTranslation('system');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requiresApproval: false,
    isActive: true,
    displayOrder: '',
    colorCode: '#6B7280',
    iconName: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        requiresApproval: initialData.requiresApproval || false,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        displayOrder: initialData.displayOrder?.toString() || '',
        colorCode: initialData.colorCode || '#6B7280',
        iconName: initialData.iconName || ''
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = t('visitPurposes.form.validation.nameRequired');
    } else if (formData.name.length < 2) {
      errors.name = t('visitPurposes.form.validation.nameMin');
    } else if (formData.name.length > 100) {
      errors.name = t('visitPurposes.form.validation.nameMax');
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = t('visitPurposes.form.validation.descriptionMax');
    }

    if (formData.displayOrder && !/^\d+$/.test(formData.displayOrder)) {
      errors.displayOrder = t('visitPurposes.form.validation.displayOrderInvalid');
    }

    if (formData.colorCode && !/^#[0-9A-F]{6}$/i.test(formData.colorCode)) {
      errors.colorCode = t('visitPurposes.form.validation.colorInvalid');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
      displayOrder: formData.displayOrder ? parseInt(formData.displayOrder, 10) : null
    };

    try {
      await onSubmit(submissionData);
    } catch (submitError) {
      console.error('Form submission error:', submitError);
    }
  };

  const colorOptions = [
    { value: '#6B7280', label: t('visitPurposes.form.colors.gray'), preview: '#6B7280' },
    { value: '#3B82F6', label: t('visitPurposes.form.colors.blue'), preview: '#3B82F6' },
    { value: '#10B981', label: t('visitPurposes.form.colors.green'), preview: '#10B981' },
    { value: '#F59E0B', label: t('visitPurposes.form.colors.yellow'), preview: '#F59E0B' },
    { value: '#EF4444', label: t('visitPurposes.form.colors.red'), preview: '#EF4444' },
    { value: '#8B5CF6', label: t('visitPurposes.form.colors.purple'), preview: '#8B5CF6' },
    { value: '#06B6D4', label: t('visitPurposes.form.colors.cyan'), preview: '#06B6D4' },
    { value: '#F97316', label: t('visitPurposes.form.colors.orange'), preview: '#F97316' }
  ];

  return (
    <div className="space-y-6">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('visitPurposes.form.sections.basicInfo')}</h3>

          <Input
            label={t('visitPurposes.form.fields.name')}
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={touched.name ? formErrors.name : undefined}
            required
            placeholder={t('visitPurposes.form.placeholders.name')}
            maxLength={100}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('visitPurposes.form.fields.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              rows={3}
              maxLength={500}
              placeholder={t('visitPurposes.form.placeholders.description')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.description && formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {touched.description && formErrors.description && (
              <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('visitPurposes.form.descriptionCount', { count: formData.description.length })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('visitPurposes.form.sections.configuration')}</h3>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiresApproval"
              checked={formData.requiresApproval}
              onChange={(e) => handleChange('requiresApproval', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requiresApproval" className="ms-2 block text-sm text-gray-900 dark:text-gray-100">
              {t('visitPurposes.form.fields.requiresApproval')}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ms-2 block text-sm text-gray-900 dark:text-gray-100">
              {t('visitPurposes.form.fields.isActive')}
            </label>
          </div>

          <Input
            label={t('visitPurposes.form.fields.displayOrder')}
            type="number"
            value={formData.displayOrder}
            onChange={(e) => handleChange('displayOrder', e.target.value)}
            onBlur={() => handleBlur('displayOrder')}
            error={touched.displayOrder ? formErrors.displayOrder : undefined}
            placeholder={t('visitPurposes.form.placeholders.displayOrder')}
            min="0"
            max="9999"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('visitPurposes.form.sections.appearance')}</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('visitPurposes.form.fields.color')}
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleChange('colorCode', color.value)}
                    className={`p-3 rounded-md border-2 transition-all ${
                      formData.colorCode === color.value
                        ? 'border-gray-400 ring-2 ring-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-6 rounded" style={{ backgroundColor: color.preview }} />
                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{color.label}</div>
                  </button>
                ))}
              </div>

              <Input
                label={t('visitPurposes.form.fields.customColorCode')}
                type="text"
                value={formData.colorCode}
                onChange={(e) => handleChange('colorCode', e.target.value)}
                onBlur={() => handleBlur('colorCode')}
                error={touched.colorCode ? formErrors.colorCode : undefined}
                placeholder="#6B7280"
                maxLength={7}
              />
            </div>
          </div>

          <Input
            label={t('visitPurposes.form.fields.iconName')}
            type="text"
            value={formData.iconName}
            onChange={(e) => handleChange('iconName', e.target.value)}
            onBlur={() => handleBlur('iconName')}
            error={touched.iconName ? formErrors.iconName : undefined}
            placeholder={t('visitPurposes.form.placeholders.iconName')}
            maxLength={50}
            helpText={t('visitPurposes.form.help.iconName')}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('visitPurposes.form.sections.preview')}</h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: formData.colorCode || '#6B7280' }}
              >
                {formData.iconName ? formData.iconName.charAt(0).toUpperCase() : t('visitPurposes.form.preview.defaultIcon')}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {formData.name || t('visitPurposes.form.preview.fallbackName')}
                </div>
                {formData.description && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{formData.description}</div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    formData.requiresApproval ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {formData.requiresApproval
                      ? t('visitPurposes.form.preview.approvalRequired')
                      : t('visitPurposes.form.preview.noApprovalRequired')}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    formData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.isActive ? t('visitPurposes.active') : t('visitPurposes.inactive')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {t('common:buttons.cancel')}
          </Button>
          <Button type="submit" loading={loading} disabled={loading || Object.keys(formErrors).length > 0}>
            {isEdit ? t('visitPurposes.form.actions.update') : t('visitPurposes.form.actions.create')}
          </Button>
        </div>
      </form>
    </div>
  );
};

VisitPurposeForm.propTypes = {
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

export default VisitPurposeForm;
