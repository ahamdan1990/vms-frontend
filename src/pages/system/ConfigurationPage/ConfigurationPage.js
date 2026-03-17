import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';

// Redux actions and selectors
import {
  fetchAllConfigurations,
  fetchCategoryConfiguration,
  updateConfiguration,
  createConfiguration,
  deleteConfiguration,
  searchConfigurations,
  validateConfiguration,
  invalidateCache,
  clearErrors,
  setSelectedCategory,
  setSearchQuery,
  toggleShowSensitive,
  clearValidationResult
} from '../../../store/slices/configurationSlice';

import {
  selectConfigurations,
  selectSelectedCategory,
  selectSearchQuery,
  selectShowSensitive,
  selectValidationResult,
  selectPendingRestarts,
  selectConfigurationLoading,
  selectConfigurationErrors
} from '../../../store/slices/configurationSlice';

// Permissions
import { SYSTEM_CONFIG_PERMISSIONS } from '../../../constants/permissions';

// Components
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Badge from '../../../components/common/Badge/Badge';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import ConfirmDialog from '../../../components/common/ConfirmDialog/ConfirmDialog';
import Modal from '../../../components/common/Modal/Modal';
import LdapSettingsPanel from '../../../components/system/LdapSettingsPanel';
import LdapUsersPanel from '../../../components/system/LdapUsersPanel';

// Icons
import {
  CogIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../../hooks/useNotifications';

const ConfigurationPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const toast = useToast();
  const { t } = useTranslation('system');

  // Selectors
  const configurations = useSelector(selectConfigurations);
  const selectedCategory = useSelector(selectSelectedCategory);
  const searchQuery = useSelector(selectSearchQuery);
  const showSensitive = useSelector(selectShowSensitive);
  const validationResult = useSelector(selectValidationResult);
  const pendingRestarts = useSelector(selectPendingRestarts);
  const loading = useSelector(selectConfigurationLoading);
  const errors = useSelector(selectConfigurationErrors);
  const isLdapSelected = (selectedCategory || '').toLowerCase() === 'ldap';

  // Local state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [ldapTab, setLdapTab] = useState('settings');

  // Permissions
  const canRead = hasPermission(SYSTEM_CONFIG_PERMISSIONS.READ);
  const canReadAll = hasPermission(SYSTEM_CONFIG_PERMISSIONS.READ);
  const canUpdate = hasPermission(SYSTEM_CONFIG_PERMISSIONS.UPDATE);
  const canViewSensitive = hasPermission(SYSTEM_CONFIG_PERMISSIONS.READ);
  const canInvalidateCache = hasPermission(SYSTEM_CONFIG_PERMISSIONS.UPDATE);

  // Load configurations on mount
  useEffect(() => {
    if (canRead || canReadAll) {
      dispatch(fetchAllConfigurations());
    }
  }, [dispatch, canRead, canReadAll]);

  // Get categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(Object.keys(configurations));
    uniqueCategories.add('LDAP');
    return Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b));
  }, [configurations]);

  // Get filtered configurations
  const filteredConfigurations = useMemo(() => {
    let configs = configurations;
    
    // Filter by selected category
    if (selectedCategory) {
      if (configurations[selectedCategory]) {
        configs = { [selectedCategory]: configurations[selectedCategory] };
      } else if (selectedCategory.toLowerCase() === 'ldap') {
        configs = configurations.LDAP ? { LDAP: configurations.LDAP } : {};
      } else {
        configs = {};
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const filtered = {};
      Object.keys(configs).forEach(category => {
        const categoryConfigs = configs[category].filter(config =>
          config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          config.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          config.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (categoryConfigs.length > 0) {
          filtered[category] = categoryConfigs;
        }
      });
      configs = filtered;
    }
    
    return configs;
  }, [configurations, selectedCategory, searchQuery]);

  // Handle category selection
  const handleCategoryChange = (category) => {
    dispatch(setSelectedCategory(category === 'all' ? null : category));
  };

  // Handle search
  const handleSearch = (query) => {
    dispatch(setSearchQuery(query));
  };

  // Handle cache invalidation
  const handleInvalidateCache = async (category = null) => {
    if (!canInvalidateCache) return;
    
    try {
      await dispatch(invalidateCache(category)).unwrap();
      toast.success(category ? t('configuration.toast.cacheInvalidated', { category }) : t('configuration.toast.allCacheInvalidated'));
    } catch (error) {
      toast.error(t('configuration.toast.cacheError'));
    }
  };

  // Handle configuration update
  const handleUpdateConfig = async (category, key, value, reason) => {
    if (!canUpdate) return;
    
    try {
      await dispatch(updateConfiguration({ category, key, value, reason })).unwrap();
      toast.success(t('configuration.toast.updated'));
      setShowEditModal(false);
      setEditingConfig(null);
      dispatch(fetchAllConfigurations());
    } catch (error) {
      toast.error(t('configuration.toast.updateError'));
    }
  };

  if (!canRead && !canReadAll) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('configuration.accessDenied')}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('configuration.accessDeniedDesc')}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('configuration.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('configuration.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Pending Restarts Badge */}
          {pendingRestarts.length > 0 && (
            <Badge variant="warning" className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {t('configuration.restartRequired', { count: pendingRestarts.length })}
            </Badge>
          )}
          
          {/* Cache Actions */}
          {canInvalidateCache && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInvalidateCache()}
              disabled={loading.cacheLoading}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              {t('configuration.clearCache')}
            </Button>
          )}
          
          {/* Create Button - Disabled per requirements */}
          {/*canCreate && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Configuration
            </Button>
          )*/}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <Select
              label={t('configuration.category')}
              value={selectedCategory || 'all'}
              onChange={(e) => handleCategoryChange(e.target.value)}
              options={[
                { value: 'all', label: t('configuration.allCategories') },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
            />
          </div>
          
          {/* Search */}
          <div className="flex-1">
            <Input
              label={t('configuration.search')}
              type="text"
              placeholder={t('configuration.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              icon={MagnifyingGlassIcon}
            />
          </div>
          
          {/* Show Sensitive Toggle */}
          {canViewSensitive && (
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => dispatch(toggleShowSensitive())}
                className="flex items-center gap-2"
              >
                {showSensitive ? (
                  <>
                    <EyeSlashIcon className="h-4 w-4" />
                    {t('configuration.hideSensitive')}
                  </>
                ) : (
                  <>
                    <EyeIcon className="h-4 w-4" />
                    {t('configuration.showSensitive')}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {loading.listLoading && (
        <Card>
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      )}

      {/* Error State */}
      {errors.listError && (
        <Card className="border-red-200 bg-red-50">
          <div className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span className="font-medium">{t('configuration.errorLoading')}</span>
            </div>
            <p className="text-red-700 mt-1">
              {Array.isArray(errors.listError) 
                ? errors.listError[0] 
                : typeof errors.listError === 'object' 
                  ? errors.listError.message || t('configuration.errorOccurred')
                  : errors.listError
              }
            </p>
          </div>
        </Card>
      )}

      {/* LDAP Configuration Panel with Tabs */}
      {isLdapSelected && (
        <Card className="p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto custom-scrollbar">
            <nav className="-mb-px inline-flex min-w-max gap-8">
              <button
                onClick={() => setLdapTab('settings')}
                className={`${
                  ldapTab === 'settings'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {t('configuration.ldapTabs.settings')}
              </button>
              <button
                onClick={() => setLdapTab('users')}
                className={`${
                  ldapTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {t('configuration.ldapTabs.users')}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {ldapTab === 'settings' && <LdapSettingsPanel canEdit={canUpdate} />}
          {ldapTab === 'users' && <LdapUsersPanel canEdit={canUpdate} />}
        </Card>
      )}

      {/* Empty State */}
      {!isLdapSelected && !loading.listLoading && Object.keys(filteredConfigurations).length === 0 && (
        <EmptyState
          icon={CogIcon}
          title={t('configuration.noConfigurations')}
          description={searchQuery || selectedCategory ? t('configuration.noConfigurationsDesc') : t('configuration.noConfigurationsEmpty')}
        />
      )}

      {/* Configurations List */}
      {!isLdapSelected && !loading.listLoading && Object.keys(filteredConfigurations).length > 0 && (
        <div className="space-y-6">
          {Object.keys(filteredConfigurations).map(category => (
            <ConfigurationCategory
              key={category}
              category={category}
              configurations={filteredConfigurations[category]}
              showSensitive={showSensitive}
              canUpdate={canUpdate}
              onEdit={(config) => {
                setEditingConfig(config);
                setShowEditModal(true);
              }}
              onInvalidateCache={() => handleInvalidateCache(category)}
              canInvalidateCache={canInvalidateCache}
            />
          ))}
        </div>
      )}
      
      {/* Configuration Edit Modal */}
      {showEditModal && editingConfig && (
        <ConfigurationEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingConfig(null);
          }}
          config={editingConfig}
          onSave={handleUpdateConfig}
          loading={loading.updateLoading}
        />
      )}
    </div>
  );
};
// Configuration Category Component
const ConfigurationCategory = ({
  category,
  configurations,
  showSensitive,
  canUpdate,
  onEdit,
  onInvalidateCache,
  canInvalidateCache
}) => {
  const { t } = useTranslation('system');
  return (
    <Card>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{category}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('configuration.countConfigurations', { count: configurations.length })}</p>
          </div>

          {canInvalidateCache && (
            <Button
              variant="outline"
              size="sm"
              onClick={onInvalidateCache}
              className="flex items-center gap-1"
            >
              <ArrowPathIcon className="h-3 w-3" />
              {t('configuration.clearCache')}
            </Button>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {(configurations || []).map(config => (
          <ConfigurationItem
            key={`${config.category}-${config.key}`}
            config={config}
            showSensitive={showSensitive}
            canUpdate={canUpdate}
            onEdit={() => onEdit(config)}
          />
        ))}
      </div>
    </Card>
  );
};

// Configuration Item Component
const ConfigurationItem = ({
  config,
  showSensitive,
  canUpdate,
  onEdit
}) => {
  const { t } = useTranslation('system');
  const formatValue = (value, dataType, isSensitive) => {
    if (isSensitive && !showSensitive) {
      return t('configuration.maskedValue');
    }
    
    switch (dataType) {
      case 'Boolean':
        return value === true ? t('configuration.editModal.boolTrue') : t('configuration.editModal.boolFalse');
      case 'DateTime':
        return new Date(value).toLocaleString();
      case 'JSON':
        try {
          return JSON.stringify(JSON.parse(value), null, 2);
        } catch {
          return value;
        }
      default:
        return value;
    }
  };

  const getDataTypeBadge = (dataType) => {
    const colors = {
      'String': 'bg-blue-100 text-blue-800',
      'Integer': 'bg-green-100 text-green-800',
      'Boolean': 'bg-purple-100 text-purple-800',
      'Decimal': 'bg-yellow-100 text-yellow-800',
      'DateTime': 'bg-indigo-100 text-indigo-800',
      'JSON': 'bg-pink-100 text-pink-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[dataType] || 'bg-gray-100 text-gray-800'}`}>
        {dataType}
      </span>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{config.key}</h4>
            {getDataTypeBadge(config.dataType)}
            
            {config.isEncrypted && (
              <Badge variant="secondary" size="sm">{t('configuration.encrypted')}</Badge>
            )}

            {config.isSensitive && (
              <Badge variant="warning" size="sm">{t('configuration.sensitive')}</Badge>
            )}

            {config.isReadOnly && (
              <Badge variant="outline" size="sm">{t('configuration.readOnly')}</Badge>
            )}

            {config.requiresRestart && (
              <Badge variant="danger" size="sm">{t('configuration.requiresRestart')}</Badge>
            )}
          </div>
          
          {config.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{config.description}</p>
          )}
          
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('configuration.currentValue')}</div>
            <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
              {config.dataType === 'JSON' ? (
                <pre className="whitespace-pre-wrap">
                  {formatValue(config.value, config.dataType, config.isSensitive)}
                </pre>
              ) : (
                formatValue(config.value, config.dataType, config.isSensitive)
              )}
            </div>
          </div>
          
          {config.defaultValue && (
            <div className="mt-2 text-xs text-gray-500">
              {t('configuration.default')} <span className="font-mono">{config.defaultValue}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 ms-4">
          {canUpdate && !config.isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex items-center gap-1"
            >
              <PencilIcon className="h-3 w-3" />
              {t('common:buttons.edit')}
            </Button>
          )}
          
          {/* Delete button removed per requirements */}
        </div>
      </div>
    </div>
  );
};

// Configuration Edit Modal Component
const ConfigurationEditModal = ({ isOpen, onClose, config, onSave, loading }) => {
  const { t } = useTranslation('system');
  const [formData, setFormData] = useState({
    value: config?.value || '',
    reason: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Update form when config changes
  useEffect(() => {
    if (config) {
      // For boolean values, ensure we store them as strings
      let initialValue = config.value;
      if (config.dataType === 'Boolean') {
        initialValue = String(config.value);
      }

      setFormData({
        value: initialValue || '',
        reason: ''
      });
      setFormErrors({});
    }
  }, [config]);

  const handleSubmit = () => {
    // Basic validation
    const errors = {};
    if (!formData.value && formData.value !== '') {
      errors.value = t('configuration.editModal.valueRequired');
    }
    // if (!formData.reason.trim()) {
    //   errors.reason = 'Reason for change is required';
    // }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSave(config.category, config.key, formData.value, formData.reason);
  };

  const handleValueChange = (value) => {
    setFormData(prev => ({ ...prev, value }));
    if (formErrors.value) {
      setFormErrors(prev => ({ ...prev, value: null }));
    }
  };

  const handleReasonChange = (reason) => {
    setFormData(prev => ({ ...prev, reason }));
    if (formErrors.reason) {
      setFormErrors(prev => ({ ...prev, reason: null }));
    }
  };

  const renderValueInput = () => {
    switch (config?.dataType) {
      case 'Boolean':
        return (
          <Select
            label={t('configuration.editModal.value')}
            value={formData.value}
            onChange={(e) => handleValueChange(e.target.value)}
            error={formErrors.value}
            options={[
              { value: 'true', label: t('configuration.editModal.boolTrue') },
              { value: 'false', label: t('configuration.editModal.boolFalse') }
            ]}
            required
          />
        );
        
      case 'Integer':
      case 'Decimal':
        return (
          <Input
            label={t('configuration.editModal.value')}
            type="number"
            value={formData.value}
            onChange={(e) => handleValueChange(e.target.value)}
            error={formErrors.value}
            required
            step={config.dataType === 'Decimal' ? '0.01' : '1'}
          />
        );
        
      case 'DateTime':
        return (
          <Input
            label={t('configuration.editModal.value')}
            type="datetime-local"
            value={formData.value}
            onChange={(e) => handleValueChange(e.target.value)}
            error={formErrors.value}
            required
          />
        );
        
      case 'JSON':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('configuration.editModal.value')} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={8}
              value={formData.value}
              onChange={(e) => handleValueChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.value ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('configuration.editModal.jsonPlaceholder')}
            />
            {formErrors.value && (
              <p className="mt-1 text-sm text-red-600">{formErrors.value}</p>
            )}
          </div>
        );
        
      default: // String
        return (
          <Input
            label={t('configuration.editModal.value')}
            type={config?.isSensitive ? 'password' : 'text'}
            value={formData.value}
            onChange={(e) => handleValueChange(e.target.value)}
            error={formErrors.value}
            required
          />
        );
    }
  };

  if (!config) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('configuration.editModal.title')} size="md">
      <div className="space-y-6">
        {/* Configuration Info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">{t('configuration.editModal.key')}</span>
              <span className="ms-2 text-gray-900 dark:text-gray-100">{config.key}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">{t('configuration.editModal.categoryLabel')}</span>
              <span className="ms-2 text-gray-900 dark:text-gray-100">{config.category}</span>
            </div>
            
          </div>
          
          {config.description && (
            <div className="mt-3">
              <span className="font-medium text-gray-700 dark:text-gray-300">{t('configuration.editModal.description')}</span>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{config.description}</p>
            </div>
          )}

          {config.requiresRestart && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{t('configuration.requiresRestart')}</span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                {t('configuration.editModal.restartWarning')}
              </p>
            </div>
          )}
        </div>

        {/* Value Input */}
        {renderValueInput()}

        {/* Reason Input */}
        <div>
          <Input
            label={t('configuration.editModal.reasonLabel')}
            type="text"
            value={formData.reason}
            onChange={(e) => handleReasonChange(e.target.value)}
            error={formErrors.reason}
            placeholder={t('configuration.editModal.reasonPlaceholder')}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('configuration.editModal.auditNote')}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {t('common:buttons.cancel')}
        </Button>
        <Button onClick={handleSubmit} loading={loading}>
          {t('configuration.editModal.saveChanges')}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfigurationPage;

