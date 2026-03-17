// src/pages/admin/roles/components/CreateRoleModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Modal from '../../../../components/common/Modal/Modal';
import Button from '../../../../components/common/Button/Button';
import Input from '../../../../components/common/Input/Input';
import {
  createRole,
  toggleCreateModal,
  selectShowCreateModal,
  selectCreateLoading,
  getRoles
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

const CreateRoleModal = () => {
  const { t } = useTranslation('system');
  const dispatch = useDispatch();
  const toast = useToast();
  const isOpen = useSelector(selectShowCreateModal);
  const loading = useSelector(selectCreateLoading);
  const categorizedPermissions = useSelector(selectCategorizedPermissions);
  const permissionsLoading = useSelector(selectCategoriesLoading);
  const availableCategories = useSelector(selectPermissionCategories);

  const [currentTab, setCurrentTab] = useState('details'); // 'details' or 'permissions'
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    hierarchyLevel: 1,
    displayOrder: 0,
    color: '#3B82F6',
    icon: '\uD83D\uDEE1\uFE0F'
  });

  const [errors, setErrors] = useState({});

  // Load permissions when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getPermissionsByCategory());
    }
  }, [isOpen, dispatch]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        displayName: '',
        description: '',
        hierarchyLevel: 1,
        displayOrder: 0,
        color: '#3B82F6',
        icon: '\uD83D\uDEE1\uFE0F'
      });
      setErrors({});
      setCurrentTab('details');
      setSelectedPermissions(new Set());
      setSearchTerm('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
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

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('roles.create.validation.nameRequired');
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = t('roles.create.validation.nameLengthError');
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = t('roles.create.validation.displayNameRequired');
    } else if (formData.displayName.length > 150) {
      newErrors.displayName = t('roles.create.validation.displayNameLengthError');
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = t('roles.create.validation.descriptionLengthError');
    }

    if (formData.hierarchyLevel < 1 || formData.hierarchyLevel > 10) {
      newErrors.hierarchyLevel = t('roles.create.validation.hierarchyLevelError');
    }

    if (formData.color && !/^#([A-Fa-f0-9]{6})$/.test(formData.color)) {
      newErrors.color = t('roles.create.validation.colorError');
    }

    if (formData.icon && formData.icon.length > 50) {
      newErrors.icon = t('roles.create.validation.iconLengthError');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error(t('roles.create.validationError'));
      return;
    }

    try {
      const permissionIds = Array.from(selectedPermissions);

      await dispatch(createRole({
        ...formData,
        permissionIds
      })).unwrap();

      toast.success(t('roles.create.createdSuccess', { name: formData.displayName, count: permissionIds.length }));
      dispatch(toggleCreateModal());
      dispatch(getRoles({ includeCounts: true }));
    } catch (error) {
      toast.error(error?.message || t('roles.create.failedCreate'));
    }
  };

  const handleClose = () => {
    dispatch(toggleCreateModal());
  };

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
      (selectedCategory === 'all' || category.category === selectedCategory) &&
      category.permissions.length > 0
    );

  // Get categories from Redux (includes all available categories)
  const categories = ['all', ...(availableCategories || [])];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('roles.create.title')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 overflow-x-auto custom-scrollbar">
          <nav className="-mb-px inline-flex min-w-max gap-8">
            <button
              type="button"
              onClick={() => setCurrentTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentTab === 'details'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('roles.create.roleDetails')}
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('permissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentTab === 'permissions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('roles.create.permissionsTab', { count: selectedCount })}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {currentTab === 'details' ? (
            <div className="space-y-6 pe-2">
              {/* Role Name */}
              <Input
                label={t('roles.create.roleName')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder={t('roles.create.roleName')}
                helperText={t('roles.create.roleNameHelper')}
              />

              {/* Display Name */}
              <Input
                label={t('roles.create.displayName')}
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                error={errors.displayName}
                required
                placeholder={t('roles.create.displayName')}
                helperText={t('roles.create.displayNameHelper')}
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('roles.create.description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('roles.create.descriptionPlaceholder')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Hierarchy Level */}
              <Input
                type="number"
                label={t('roles.create.hierarchyLevel')}
                name="hierarchyLevel"
                value={formData.hierarchyLevel}
                onChange={handleChange}
                error={errors.hierarchyLevel}
                required
                min={1}
                max={10}
                helperText={t('roles.create.hierarchyLevelHelper')}
              />

              {/* Display Order */}
              <Input
                type="number"
                label={t('roles.create.displayOrder')}
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                error={errors.displayOrder}
                helperText={t('roles.create.displayOrderHelper')}
              />

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('roles.create.color')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
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
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color.value }}
                      title={color.value}
                    />
                  ))}
                </div>
              </div>

              {/* Icon */}
              <Input
                label={t('roles.create.icon')}
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                error={errors.icon}
                placeholder="\uD83D\uDEE1\uFE0F"
                maxLength={50}
                helperText={t('roles.create.iconHelper')}
              />

              {/* Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{t('roles.create.preview')}</p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: formData.color }}
                >
                  <span className="text-xl">{formData.icon || '\uD83D\uDEE1\uFE0F'}</span>
                  <span>{formData.displayName || t('roles.create.newRole')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pe-2">
              {/* Search and Filter */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute start-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('roles.create.searchPermissions')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full ps-9 pe-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map((cat, index) => (
                    <option key={`category-${cat}-${index}`} value={cat}>
                      {cat === 'all' ? t('roles.create.allCategories') : cat}
                    </option>
                  ))}
                </select>
              </div>

              {permissionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredPermissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">{t('roles.create.noPermissions')}</p>
                  <p className="text-xs mt-1">{t('roles.create.adjustSearch')}</p>
                </div>
              ) : (
                filteredPermissions.map((category) => {
                  const categoryPermissions = category.permissions;
                  const selectedInCategory = categoryPermissions.filter(p =>
                    selectedPermissions.has(p.id)
                  ).length;
                  const allSelected = selectedInCategory === categoryPermissions.length;

                  return (
                    <div key={category.category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {category.category}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {t('roles.create.selectedOf', { selected: selectedInCategory, total: categoryPermissions.length })}
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
                            {t('roles.create.selectAll')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategoryDeselectAll(categoryPermissions)}
                            disabled={selectedInCategory === 0}
                          >
                            {t('roles.create.deselectAll')}
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
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                                }
                              `}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs text-gray-900 truncate">
                                    {permission.displayName}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                    {permission.description}
                                  </p>
                                </div>
                                <div
                                  className={`
                                    w-4 h-4 rounded flex items-center justify-center flex-shrink-0
                                    ${isSelected ? 'bg-primary-500' : 'border-2 border-gray-300'}
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
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {t('roles.create.permissionsSelected', { count: selectedCount })}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {t('roles.create.cancel')}
            </Button>
            {currentTab === 'permissions' && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentTab('details')}
              >
                {t('roles.create.backToDetails')}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              {t('roles.create.createRole')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRoleModal;

