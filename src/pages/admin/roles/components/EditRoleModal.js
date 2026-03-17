// src/pages/admin/roles/components/EditRoleModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Modal from '../../../../components/common/Modal/Modal';
import Button from '../../../../components/common/Button/Button';
import Input from '../../../../components/common/Input/Input';
import {
  updateRole,
  toggleEditModal,
  selectShowEditModal,
  selectCurrentRole,
  selectUpdateLoading,
  getRoles,
  updateRolePermissions,
  selectPermissionLoading
} from '../../../../store/slices/rolesSlice';
import {
  getPermissionsByCategory,
  selectCategorizedPermissions,
  selectCategoriesLoading,
  selectPermissionCategories
} from '../../../../store/slices/permissionsSlice';
import { useToast } from '../../../../hooks/useNotifications';
import { CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const PRESET_COLORS = [
  { key: 'blue', value: '#3B82F6' },
  { key: 'green', value: '#10B981' },
  { key: 'purple', value: '#8B5CF6' },
  { key: 'red', value: '#EF4444' },
  { key: 'yellow', value: '#F59E0B' },
  { key: 'pink', value: '#EC4899' },
  { key: 'indigo', value: '#6366F1' },
  { key: 'gray', value: '#6B7280' }
];

const EditRoleModal = () => {
  const { t } = useTranslation('system');
  const dispatch = useDispatch();
  const toast = useToast();
  const isOpen = useSelector(selectShowEditModal);
  const currentRole = useSelector(selectCurrentRole);
  const loading = useSelector(selectUpdateLoading);
  const categorizedPermissions = useSelector(selectCategorizedPermissions);
  const permissionsLoading = useSelector(selectCategoriesLoading);
  const permissionUpdateLoading = useSelector(selectPermissionLoading);
  const availableCategories = useSelector(selectPermissionCategories);

  const [currentTab, setCurrentTab] = useState('details'); // 'details' or 'permissions'
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [initialPermissions, setInitialPermissions] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    displayName: '',
    description: '',
    displayOrder: 0,
    color: '#3B82F6',
    icon: '\uD83D\uDEE1\uFE0F',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  // Load permissions when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getPermissionsByCategory());
    }
  }, [isOpen, dispatch]);

  // Populate form and permissions when role is loaded
  useEffect(() => {
    if (currentRole && isOpen) {
      setFormData({
        displayName: currentRole.displayName || currentRole.name || '',
        description: currentRole.description || '',
        displayOrder: currentRole.displayOrder || 0,
        color: currentRole.color || '#3B82F6',
        icon: currentRole.icon || '\uD83D\uDEE1\uFE0F',
        isActive: currentRole.isActive !== undefined ? currentRole.isActive : true
      });
      setErrors({});

      // Initialize selected permissions from current role
      if (currentRole.permissions && Array.isArray(currentRole.permissions)) {
        const permissionIds = new Set(currentRole.permissions.map(p => p.id));
        setSelectedPermissions(permissionIds);
        setInitialPermissions(permissionIds);
      }
    }
  }, [currentRole, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setCurrentTab('details');
      setSelectedPermissions(new Set());
      setInitialPermissions(new Set());
      setSearchTerm('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = t('roles.edit.validation.displayNameRequired');
    } else if (formData.displayName.length > 150) {
      newErrors.displayName = t('roles.edit.validation.displayNameLengthError');
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = t('roles.edit.validation.descriptionLengthError');
    }

    if (formData.color && !/^#([A-Fa-f0-9]{6})$/.test(formData.color)) {
      newErrors.color = t('roles.edit.validation.colorError');
    }

    if (formData.icon && formData.icon.length > 50) {
      newErrors.icon = t('roles.edit.validation.iconLengthError');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePermissionToggle = (permissionId) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleCategorySelectAll = (categoryPermissions) => {
    const newSelected = new Set(selectedPermissions);
    categoryPermissions.forEach(p => newSelected.add(p.id));
    setSelectedPermissions(newSelected);
  };

  const handleCategoryDeselectAll = (categoryPermissions) => {
    const newSelected = new Set(selectedPermissions);
    categoryPermissions.forEach(p => newSelected.delete(p.id));
    setSelectedPermissions(newSelected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error(t('roles.edit.validationError'));
      return;
    }

    if (!currentRole) {
      toast.error(t('roles.edit.noRoleSelected'));
      return;
    }

    try {
      // Update role details
      await dispatch(updateRole({
        roleId: currentRole.id,
        roleData: formData
      })).unwrap();

      // Check if permissions have changed
      const currentPermissionIds = Array.from(selectedPermissions);
      const initialPermissionIds = Array.from(initialPermissions);

      const permissionsChanged =
        currentPermissionIds.length !== initialPermissionIds.length ||
        !currentPermissionIds.every(id => initialPermissionIds.includes(id));

      // Update permissions if they changed
      if (permissionsChanged) {
        await dispatch(updateRolePermissions({
          roleId: currentRole.id,
          permissionIds: currentPermissionIds,
          reason: t('roles.edit.permissionUpdateReason', { name: formData.displayName })
        })).unwrap();

        toast.success(t('roles.edit.updatedSuccess', { name: formData.displayName, count: currentPermissionIds.length }));
      } else {
        toast.success(t('roles.edit.updatedSuccessSimple', { name: formData.displayName }));
      }

      dispatch(toggleEditModal());

      // Refresh roles list
      dispatch(getRoles({ includeCounts: true }));
    } catch (error) {
      toast.error(error?.message || t('roles.edit.failedUpdate'));
    }
  };

  const handleClose = () => {
    dispatch(toggleEditModal());
  };

  if (!currentRole) {
    return null;
  }

  const isSystemRole = currentRole.isSystemRole;
  const selectedCount = selectedPermissions.size;

  // Filter permissions by search and category
  const filteredPermissions = categorizedPermissions
    .map(category => ({
      ...category,
      permissions: category.permissions.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category =>
      (selectedCategory === 'all' || category.categoryName === selectedCategory) &&
      category.permissions.length > 0
    );

  // Get categories from Redux (includes all available categories)
  const categories = ['all', ...(availableCategories || [])];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('roles.edit.title', { name: currentRole.name })}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto custom-scrollbar">
          <nav className="-mb-px inline-flex min-w-max gap-8">
            <button
              type="button"
              onClick={() => setCurrentTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentTab === 'details'
                  ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('roles.edit.roleDetails')}
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('permissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentTab === 'permissions'
                  ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('roles.edit.permissionsTab', { count: selectedCount })}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {currentTab === 'details' ? (
            <div className="space-y-6 pe-2">
              {/* System Role Warning */}
              {isSystemRole && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ms-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {t('roles.edit.systemRoleWarning')}
                      </h3>
                      <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-100">
                        {t('roles.edit.systemRoleDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Role Name (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('roles.edit.roleNameReadonly')}
                </label>
                <input
                  type="text"
                  value={currentRole.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Display Name */}
              <Input
                label={t('roles.edit.displayName')}
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                error={errors.displayName}
                required
                placeholder={t('roles.edit.displayName')}
                helperText={t('roles.edit.displayNameHelper')}
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('roles.edit.description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.description
                      ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                  placeholder={t('roles.edit.descriptionPlaceholder')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
              </div>

              {/* Display Order */}
              <Input
                type="number"
                label={t('roles.edit.displayOrder')}
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                error={errors.displayOrder}
                helperText={t('roles.edit.displayOrderHelper')}
              />

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('roles.edit.color')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-800"
                  />
                  <Input
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    error={errors.color}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color.value }}
                      title={color.value}
                    />
                  ))}
                </div>
              </div>

              {/* Icon */}
              <Input
                label={t('roles.edit.icon')}
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                error={errors.icon}
                placeholder="\uD83D\uDEE1\uFE0F"
                maxLength={50}
                helperText={t('roles.edit.iconHelper')}
              />

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ms-2 block text-sm text-gray-700 dark:text-gray-200">
                  {t('roles.edit.activeLabel')}
                </label>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t('roles.edit.preview')}</p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: formData.color }}
                >
                  <span className="text-xl">{formData.icon || '\uD83D\uDEE1\uFE0F'}</span>
                  <span>{formData.displayName || currentRole.name}</span>
                  {!formData.isActive && (
                    <span className="text-xs bg-white bg-opacity-30 px-2 py-0.5 rounded dark:text-white">
                      {t('roles.edit.inactive')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pe-2">
              {/* Search and Filter */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute start-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder={t('roles.edit.searchPermissions')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full ps-9 pe-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                >
                  {categories.map((cat, index) => (
                    <option key={`category-${cat}-${index}`} value={cat}>
                      {cat === 'all' ? t('roles.edit.allCategories') : cat}
                    </option>
                  ))}
                </select>
              </div>

              {permissionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredPermissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">{t('roles.edit.noPermissions')}</p>
                  <p className="text-xs mt-1">{t('roles.edit.adjustSearch')}</p>
                </div>
              ) : (
                filteredPermissions.map((category) => {
                  const categoryPermissions = category.permissions;
                  const selectedInCategory = categoryPermissions.filter(p =>
                    selectedPermissions.has(p.id)
                  ).length;
                  const allSelected = selectedInCategory === categoryPermissions.length;

                  return (
                    <div key={category.category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900/30">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {category.category}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('roles.edit.selectedOf', { selected: selectedInCategory, total: categoryPermissions.length })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategorySelectAll(categoryPermissions)}
                            disabled={allSelected}
                          >
                            {t('roles.edit.selectAll')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategoryDeselectAll(categoryPermissions)}
                            disabled={selectedInCategory === 0}
                          >
                            {t('roles.edit.deselectAll')}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPermissions.map((permission) => {
                          const isSelected = selectedPermissions.has(permission.id);

                          return (
                            <motion.button
                              key={permission.id}
                              type="button"
                              onClick={() => handlePermissionToggle(permission.id)}
                              className={`
                                p-3 rounded-lg border-2 text-start transition-all
                                ${isSelected
                                  ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-500'
                                }
                              `}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                                    {permission.displayName}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                                    {permission.description}
                                  </p>
                                </div>
                                <div
                                  className={`
                                    w-4 h-4 rounded flex items-center justify-center flex-shrink-0
                                    ${isSelected ? 'bg-primary-500' : 'border-2 border-gray-300 dark:border-gray-600'}
                                  `}
                                >
                                  {isSelected && (
                                    <CheckIcon className="w-3 h-3 text-white" />
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('roles.edit.permissionsSelected', { count: selectedCount })}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading || permissionUpdateLoading}
            >
              {t('roles.edit.cancel')}
            </Button>
            {currentTab === 'permissions' && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentTab('details')}
              >
                {t('roles.edit.backToDetails')}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={loading || permissionUpdateLoading}
            >
              {t('roles.edit.updateRole')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditRoleModal;

