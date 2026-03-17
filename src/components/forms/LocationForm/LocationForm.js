// src/components/forms/LocationForm/LocationForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Badge from '../../common/Badge/Badge';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { extractErrorMessage } from '../../../utils/errorUtils';
import { getActiveLocations } from '../../../store/slices/locationsSlice';
import { selectActiveLocationsForDropdown, selectActiveLocationsLoading } from '../../../store/selectors/locationSelectors';

/**
 * Location Form Component
 * Handles both create and edit operations for locations with hierarchical structure
 */
const LocationForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  isEdit = false
}) => {
  const { t } = useTranslation('system');
  const dispatch = useDispatch();

  const availableLocations = useSelector(selectActiveLocationsForDropdown);
  const locationsLoading = useSelector(selectActiveLocationsLoading);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    locationType: 'Room',
    floor: '',
    building: '',
    zone: '',
    parentLocationId: null,
    displayOrder: '',
    maxCapacity: '',
    requiresEscort: false,
    accessLevel: 'Standard',
    isActive: true
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    dispatch(getActiveLocations());
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
        locationType: initialData.locationType || 'Room',
        floor: initialData.floor || '',
        building: initialData.building || '',
        zone: initialData.zone || '',
        parentLocationId: initialData.parentLocationId || null,
        displayOrder: initialData.displayOrder?.toString() || '',
        maxCapacity: initialData.maxCapacity?.toString() || '',
        requiresEscort: initialData.requiresEscort || false,
        accessLevel: initialData.accessLevel || 'Standard',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = t('locations.form.validation.nameRequired');
    } else if (formData.name.length < 2) {
      errors.name = t('locations.form.validation.nameMin');
    } else if (formData.name.length > 100) {
      errors.name = t('locations.form.validation.nameMax');
    }

    if (formData.code && !/^[A-Z0-9-_]+$/i.test(formData.code)) {
      errors.code = t('locations.form.validation.codeInvalid');
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = t('locations.form.validation.descriptionMax');
    }

    if (formData.displayOrder && !/^\d+$/.test(formData.displayOrder)) {
      errors.displayOrder = t('locations.form.validation.displayOrderInvalid');
    }

    if (formData.maxCapacity && (!/^\d+$/.test(formData.maxCapacity) || parseInt(formData.maxCapacity, 10) <= 0)) {
      errors.maxCapacity = t('locations.form.validation.maxCapacityInvalid');
    }

    if (formData.floor && formData.floor.length > 20) {
      errors.floor = t('locations.form.validation.floorMax');
    }

    if (formData.building && formData.building.length > 100) {
      errors.building = t('locations.form.validation.buildingMax');
    }

    if (formData.zone && formData.zone.length > 50) {
      errors.zone = t('locations.form.validation.zoneMax');
    }

    if (formData.parentLocationId && isEdit && initialData && formData.parentLocationId === initialData.id) {
      errors.parentLocationId = t('locations.form.validation.parentSelf');
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
      name: formData.name,
      code: formData.code,
      description: formData.description || null,
      locationType: formData.locationType,
      floor: formData.floor || null,
      building: formData.building || null,
      zone: formData.zone || null,
      parentLocationId: formData.parentLocationId || null,
      displayOrder: formData.displayOrder ? parseInt(formData.displayOrder, 10) : 0,
      maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity, 10) : 0,
      requiresEscort: formData.requiresEscort,
      accessLevel: formData.accessLevel || null
    };

    if (isEdit) {
      submissionData.isActive = formData.isActive;
    }

    try {
      await onSubmit(submissionData);
    } catch (submitError) {
      console.error('Form submission error:', submitError);
    }
  };

  const locationTypes = [
    { value: 'Building', label: t('locations.types.building') },
    { value: 'Floor', label: t('locations.types.floor') },
    { value: 'Room', label: t('locations.types.room') },
    { value: 'Zone', label: t('locations.types.zone') },
    { value: 'Parking', label: t('locations.types.parking') },
    { value: 'Other', label: t('locations.types.other') }
  ];

  const accessLevels = [
    { value: 'Standard', label: t('locations.form.accessLevels.standard') },
    { value: 'Medium', label: t('locations.form.accessLevels.medium') },
    { value: 'High', label: t('locations.form.accessLevels.high') },
    { value: 'Restricted', label: t('locations.form.accessLevels.restricted') }
  ];

  const getAvailableParentLocations = () => {
    if (!isEdit || !initialData) return availableLocations;

    return availableLocations.filter(location => location.id !== initialData.id);
  };

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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('locations.form.sections.basicInfo')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('locations.form.fields.name')}
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              error={touched.name ? formErrors.name : undefined}
              required
              placeholder={t('locations.form.placeholders.name')}
              maxLength={100}
            />

            <Input
              label={t('locations.form.fields.code')}
              type="text"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('code')}
              error={touched.code ? formErrors.code : undefined}
              placeholder={t('locations.form.placeholders.code')}
              maxLength={20}
              helpText={t('locations.form.help.code')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('locations.form.fields.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              rows={3}
              maxLength={500}
              placeholder={t('locations.form.placeholders.description')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.description && formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {touched.description && formErrors.description && (
              <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('locations.form.descriptionCount', { count: formData.description.length })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('locations.form.sections.typeHierarchy')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('locations.form.fields.locationType')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.locationType}
                onChange={(e) => handleChange('locationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {locationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('locations.form.fields.parentLocation')}
              </label>
              <select
                value={formData.parentLocationId || ''}
                onChange={(e) => handleChange('parentLocationId', e.target.value ? parseInt(e.target.value, 10) : null)}
                disabled={locationsLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700"
              >
                <option value="">{t('locations.form.options.noParent')}</option>
                {getAvailableParentLocations().map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.locationType})
                  </option>
                ))}
              </select>
              {locationsLoading && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('locations.form.loadingLocations')}</p>
              )}
              {touched.parentLocationId && formErrors.parentLocationId && (
                <p className="mt-1 text-sm text-red-600">{formErrors.parentLocationId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('locations.form.fields.building')}
              type="text"
              value={formData.building}
              onChange={(e) => handleChange('building', e.target.value)}
              onBlur={() => handleBlur('building')}
              error={touched.building ? formErrors.building : undefined}
              placeholder={t('locations.form.placeholders.building')}
              maxLength={100}
            />

            <Input
              label={t('locations.form.fields.floor')}
              type="text"
              value={formData.floor}
              onChange={(e) => handleChange('floor', e.target.value)}
              onBlur={() => handleBlur('floor')}
              error={touched.floor ? formErrors.floor : undefined}
              placeholder={t('locations.form.placeholders.floor')}
              maxLength={20}
            />

            <Input
              label={t('locations.form.fields.zone')}
              type="text"
              value={formData.zone}
              onChange={(e) => handleChange('zone', e.target.value)}
              onBlur={() => handleBlur('zone')}
              error={touched.zone ? formErrors.zone : undefined}
              placeholder={t('locations.form.placeholders.zone')}
              maxLength={50}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('locations.form.sections.capacityAccess')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('locations.form.fields.maxCapacity')}
              type="number"
              value={formData.maxCapacity}
              onChange={(e) => handleChange('maxCapacity', e.target.value)}
              onBlur={() => handleBlur('maxCapacity')}
              error={touched.maxCapacity ? formErrors.maxCapacity : undefined}
              placeholder={t('locations.form.placeholders.maxCapacity')}
              min="1"
              max="10000"
              helpText={t('locations.form.help.maxCapacity')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('locations.form.fields.accessLevel')}
              </label>
              <select
                value={formData.accessLevel}
                onChange={(e) => handleChange('accessLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {accessLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={t('locations.form.fields.displayOrder')}
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleChange('displayOrder', e.target.value)}
              onBlur={() => handleBlur('displayOrder')}
              error={touched.displayOrder ? formErrors.displayOrder : undefined}
              placeholder={t('locations.form.placeholders.displayOrder')}
              min="0"
              max="9999"
              helpText={t('locations.form.help.displayOrder')}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresEscort"
                checked={formData.requiresEscort}
                onChange={(e) => handleChange('requiresEscort', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresEscort" className="ms-2 block text-sm text-gray-900 dark:text-gray-100">
                {t('locations.form.fields.requiresEscort')}
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
                {t('locations.form.fields.isActive')}
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('locations.form.sections.preview')}</h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {formData.name || t('locations.form.preview.fallbackName')}
                  {formData.code && (
                    <span className="ms-2 text-sm text-gray-500 dark:text-gray-400">({formData.code})</span>
                  )}
                </div>
                <Badge variant="secondary" size="sm">{formData.locationType}</Badge>
              </div>

              {formData.description && (
                <div className="text-sm text-gray-600 dark:text-gray-300">{formData.description}</div>
              )}

              {(formData.building || formData.floor || formData.zone) && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {[formData.building, formData.floor, formData.zone].filter(Boolean).join(' - ')}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                {formData.maxCapacity && (
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4 text-gray-400" />
                    <span>{t('locations.form.preview.maxLabel', { count: formData.maxCapacity })}</span>
                  </span>
                )}

                <Badge
                  variant={formData.accessLevel === 'High' ? 'danger' : formData.accessLevel === 'Medium' ? 'warning' : 'secondary'}
                  size="sm"
                >
                  {t('locations.form.preview.accessBadge', { level: formData.accessLevel })}
                </Badge>

                {formData.requiresEscort && (
                  <span className="text-orange-600 text-xs font-medium">{t('locations.form.preview.escortRequired')}</span>
                )}

                <Badge variant={formData.isActive ? 'success' : 'secondary'} size="sm">
                  {formData.isActive ? t('locations.active') : t('locations.inactive')}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {t('common:buttons.cancel')}
          </Button>
          <Button type="submit" loading={loading} disabled={loading || Object.keys(formErrors).length > 0}>
            {isEdit ? t('locations.form.actions.update') : t('locations.form.actions.create')}
          </Button>
        </div>
      </form>
    </div>
  );
};

LocationForm.propTypes = {
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

export default LocationForm;
