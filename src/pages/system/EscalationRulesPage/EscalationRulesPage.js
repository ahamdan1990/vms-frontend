// src/pages/system/EscalationRulesPage/EscalationRulesPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../../hooks/usePermissions';

// Redux actions
import {
  fetchEscalationRules,
  fetchAlertTypes,
  fetchAlertPriorities,
  fetchEscalationActions,
  createEscalationRule,
  updateEscalationRule,
  deleteEscalationRule,
  toggleEscalationRule,
  bulkDeleteEscalationRules,
  bulkToggleEscalationRules,
  updateFilters,
  resetFilters,
  setPageIndex,
  setPageSize,
  setSelectedEscalationRules,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  showViewModal,
  hideViewModal,
  clearError,
  setSearchTerm
} from '../../../store/slices/escalationRulesSlice';

// Page title action
import { setPageTitle } from '../../../store/slices/uiSlice';

// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Table from '../../../components/common/Table/Table';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import { ConfirmModal } from '../../../components/common/Modal/Modal';
import EscalationRuleModal from './EscalationRuleModal';

// Icons
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  PowerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BellIcon,
  ShieldExclamationIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon as ExclamationTriangleIconSolid } from '@heroicons/react/24/solid';

// Utils
import { formatDateTime, formatRelativeTime } from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';

// Constants
import { SYSTEM_CONFIG_PERMISSIONS } from '../../../constants/permissions';
import { PRIORITY_COLORS } from '../../../constants/escalationRules';

/**
 * Escalation Rules Management Page
 * Manages CRUD operations for alert escalation rules
 * Allows configuration of when and how alerts are escalated
 */
const EscalationRulesPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('system');
  const { hasPermission } = usePermissions();

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Permissions
  const canRead = hasPermission(SYSTEM_CONFIG_PERMISSIONS.READ);
  const canCreate = hasPermission(SYSTEM_CONFIG_PERMISSIONS.UPDATE);
  const canUpdate = hasPermission(SYSTEM_CONFIG_PERMISSIONS.UPDATE);
  const canDelete = hasPermission(SYSTEM_CONFIG_PERMISSIONS.UPDATE);

  // Redux selectors
  const {
    escalationRules,
    currentEscalationRule,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    filters,
    selectedEscalationRules,
    
    // Modal states
    showCreateModal: isCreateModalOpen,
    showEditModal: isEditModalOpen,
    showDeleteModal: isDeleteModalOpen,
    showViewModal: isViewModalOpen,
    
    // Loading states
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    bulkLoading,
    metadataLoading,
    
    // Error states
    error,
    createError,
    updateError,
    
    // Metadata
    alertTypes,
    alertPriorities,
    escalationActions,
    lastSyncTime
  } = useSelector(state => state.escalationRules);

  // Computed values
  const hasSelectedRules = selectedEscalationRules.length > 0;

  // Initialize page
  useEffect(() => {
    dispatch(setPageTitle(t('escalationRules.title')));
    
    if (canRead) {
      // Load data and metadata
      dispatch(fetchEscalationRules());
      dispatch(fetchAlertTypes());
      dispatch(fetchAlertPriorities());
      dispatch(fetchEscalationActions());
    }
  }, [dispatch, canRead, t]);

  // Debug pagination values
  useEffect(() => {
    console.log('Pagination Debug:', {
      pageIndex,
      pageSize,
      totalCount,
      totalPages,
      escalationRulesLength: escalationRules.length
    });
  }, [pageIndex, pageSize, totalCount, totalPages, escalationRules.length]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.searchTerm) {
        dispatch(setSearchTerm(searchInput));
        dispatch(fetchEscalationRules());
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.searchTerm, dispatch]);

  // Event handlers
  const handlePageChange = (newPage) => {
    // Convert from 1-based pagination to 0-based for our state
    const zeroBasedPage = newPage - 1;
    console.log('Page change:', { newPage, zeroBasedPage, currentPageIndex: pageIndex });
    dispatch(setPageIndex(zeroBasedPage));
    dispatch(fetchEscalationRules());
  };

  const handlePageSizeChange = (newPageSize) => {
    console.log('Page size change:', { newPageSize, currentPageSize: pageSize });
    dispatch(setPageSize(newPageSize));
    dispatch(fetchEscalationRules());
  };

  const handleFilterChange = (filterName, value) => {
    dispatch(updateFilters({ [filterName]: value }));
    dispatch(fetchEscalationRules());
  };

  const handleClearFilters = () => {
    setSearchInput('');
    dispatch(resetFilters());
    dispatch(fetchEscalationRules());
  };

  const handleSort = (column, direction) => {
    dispatch(updateFilters({ sortBy: column, sortDirection: direction }));
    dispatch(fetchEscalationRules());
  };

  const handleSelectionChange = (selectedIds) => {
    dispatch(setSelectedEscalationRules(selectedIds));
  };

  // CRUD handlers
  const handleCreateRule = async (ruleData) => {
    try {
      await dispatch(createEscalationRule(ruleData)).unwrap();
      dispatch(fetchEscalationRules()); // Refresh list
    } catch (error) {
      console.error('Failed to create escalation rule:', error);
    }
  };

  const handleEditRule = (rule) => {
    dispatch(showEditModal(rule));
  };

  const handleViewRule = (rule) => {
    dispatch(showViewModal(rule));
  };

  const handleUpdateRule = async (ruleData) => {
    try {
      await dispatch(updateEscalationRule({ 
        id: currentEscalationRule.id, 
        escalationRuleData: ruleData 
      })).unwrap();
      dispatch(fetchEscalationRules()); // Refresh list
    } catch (error) {
      console.error('Failed to update escalation rule:', error);
    }
  };

  const handleDeleteRule = (rule) => {
    dispatch(showDeleteModal(rule));
  };

  const handleConfirmDelete = async () => {
    if (currentEscalationRule) {
      try {
        await dispatch(deleteEscalationRule(currentEscalationRule.id)).unwrap();
        dispatch(fetchEscalationRules()); // Refresh list
      } catch (error) {
        console.error('Failed to delete escalation rule:', error);
      }
    }
  };

  const handleToggleRule = async (rule) => {
    try {
      await dispatch(toggleEscalationRule({ 
        id: rule.id, 
        isEnabled: !rule.isEnabled 
      })).unwrap();
    } catch (error) {
      console.error('Failed to toggle escalation rule:', error);
    }
  };

  // Bulk operation handlers
  const handleBulkAction = async () => {
    if (!hasSelectedRules) return;

    setShowBulkConfirm(true);
  };

  const handleConfirmBulkAction = async () => {
    try {
      if (bulkAction === 'delete') {
        await dispatch(bulkDeleteEscalationRules(selectedEscalationRules)).unwrap();
      } else if (bulkAction === 'enable') {
        await dispatch(bulkToggleEscalationRules({ 
          ids: selectedEscalationRules, 
          isEnabled: true 
        })).unwrap();
      } else if (bulkAction === 'disable') {
        await dispatch(bulkToggleEscalationRules({ 
          ids: selectedEscalationRules, 
          isEnabled: false 
        })).unwrap();
      }

      dispatch(fetchEscalationRules()); // Refresh list
      dispatch(clearSelections());
      setShowBulkConfirm(false);
      setBulkAction('');
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  // Helper functions
  const getPriorityBadgeColor = (priority) => {
    return PRIORITY_COLORS[priority] || 'blue';
  };

  const getAlertTypeIcon = (alertType) => {
    switch (alertType) {
      case 'SecurityAlert':
      case 'BlacklistAlert':
      case 'EmergencyAlert':
        return <ShieldExclamationIcon className="w-4 h-4" />;
      case 'SystemAlert':
      case 'FRSystemOffline':
        return <Cog6ToothIcon className="w-4 h-4" />;
      case 'VisitorOverstay':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <BellIcon className="w-4 h-4" />;
    }
  };

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

  // Table columns configuration
  const columns = [
    {
      key: 'ruleName',
      header: t('escalationRules.columns.ruleName'),
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getAlertTypeIcon(row.alertType)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {row.alertType} - {row.alertPriority}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'alertType',
      header: t('escalationRules.columns.alertType'),
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          {getAlertTypeIcon(value)}
          <span className="text-sm text-gray-900 dark:text-gray-100">{value}</span>
        </div>
      )
    },
    {
      key: 'alertPriority',
      header: t('escalationRules.columns.priority'),
      sortable: true,
      render: (value) => (
        <Badge color={getPriorityBadgeColor(value)} size="sm">
          {value}
        </Badge>
      )
    },
    {
      key: 'targetRole',
      header: t('escalationRules.columns.targetRole'),
      sortable: false,
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {value || t('escalationRules.allRoles')}
        </span>
      )
    },
    {
      key: 'escalationDelayMinutes',
      header: t('escalationRules.columns.delay'),
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {t('escalationRules.delayMinutes', { count: value })}
        </span>
      )
    },
    {
      key: 'action',
      header: t('escalationRules.columns.action'),
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {getActionIcon(value)}
          <span className="text-sm text-gray-900 dark:text-gray-100">{value}</span>
        </div>
      )
    },
    {
      key: 'isEnabled',
      header: t('escalationRules.columns.status'),
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {value ? (
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
          ) : (
            <XCircleIcon className="w-4 h-4 text-red-500" />
          )}
          <Badge color={value ? 'green' : 'red'} size="sm">
            {value ? t('escalationRules.enabled') : t('escalationRules.disabled')}
          </Badge>
        </div>
      )
    },
    {
      key: 'actions',
      header: t('escalationRules.columns.actions'),
      sortable: false,
      width: '220px',
      render: (_, row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            size="xs"
            variant="outline"
            onClick={() => handleViewRule(row)}
            icon={<EyeIcon className="w-4 h-4" />}
            className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/60"
          >
            {t('escalationRules.view')}
          </Button>

          {canUpdate && (
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleToggleRule(row)}
              disabled={updateLoading}
              icon={<PowerIcon className="w-4 h-4" />}
              className={`text-xs ${
                row.isEnabled
                  ? 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/30'
                  : 'border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-300 dark:hover:bg-yellow-900/30'
              }`}
            >
              {row.isEnabled ? t('escalationRules.disable') : t('escalationRules.enable')}
            </Button>
          )}

          {canUpdate && (
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleEditRule(row)}
              icon={<PencilIcon className="w-4 h-4" />}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30"
            >
              {t('escalationRules.edit')}
            </Button>
          )}

          {canDelete && (
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleDeleteRule(row)}
              disabled={deleteLoading}
              icon={<TrashIcon className="w-4 h-4" />}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              {t('escalationRules.delete')}
            </Button>
          )}
        </div>
      )
    }
  ];

  // Render loading state
  if (!canRead) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md">
          <ExclamationTriangleIconSolid className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('escalationRules.accessDenied')}</h3>
          <p className="text-gray-500 dark:text-gray-400">{t('escalationRules.accessDeniedDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="space-y-6 container mx-auto px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('escalationRules.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('escalationRules.subtitle')}
          </p>
          {lastSyncTime && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {t('escalationRules.lastUpdated', { time: formatRelativeTime(new Date(lastSyncTime)) })}
            </p>
          )}
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button
            variant="outline"
            icon={<FunnelIcon className="w-5 h-5" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {t('escalationRules.filters')}
          </Button>
          
          {canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              {t('escalationRules.createButton')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Cog6ToothIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ms-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('escalationRules.totalRules')}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ms-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('escalationRules.activeRules')}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {escalationRules.filter(rule => rule.isEnabled).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-300" />
            </div>
            <div className="ms-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('escalationRules.criticalPriority')}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {escalationRules.filter(rule => 
                  rule.alertPriority === 'Critical' || rule.alertPriority === 'Emergency'
                ).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="ms-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('escalationRules.alertTypes')}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Object.keys(alertTypes).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={t('escalationRules.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            
            {/* Bulk Actions */}
            {hasSelectedRules && (
              <div className="flex items-center gap-2">
                <Select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  options={[
                    { value: '', label: t('escalationRules.bulkActions') },
                    { value: 'enable', label: t('escalationRules.enableSelected') },
                    { value: 'disable', label: t('escalationRules.disableSelected') },
                    ...(canDelete ? [{ value: 'delete', label: t('escalationRules.deleteSelected') }] : [])
                  ]}
                  size="sm"
                  className="w-40"
                />
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkAction}
                  disabled={!bulkAction || bulkLoading}
                >
                  {t('escalationRules.apply', { count: selectedEscalationRules.length })}
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200"
              >
                <Select
                  label={t('escalationRules.alertType')}
                  value={filters.alertType || ''}
                  onChange={(e) => handleFilterChange('alertType', e.target.value || null)}
                  options={[
                    { value: '', label: t('escalationRules.allAlertTypes') },
                    ...Object.entries(alertTypes).map(([key, value]) => ({ value: key, label: value }))
                  ]}
                  size="sm"
                />

                <Select
                  label={t('escalationRules.priority')}
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value || null)}
                  options={[
                    { value: '', label: t('escalationRules.allPriorities') },
                    ...Object.entries(alertPriorities).map(([key, value]) => ({ value: key, label: value }))
                  ]}
                  size="sm"
                />

                <Select
                  label={t('escalationRules.statusLabel')}
                  value={filters.isEnabled?.toString() || ''}
                  onChange={(e) => handleFilterChange('isEnabled', e.target.value ? e.target.value === 'true' : null)}
                  options={[
                    { value: '', label: t('escalationRules.allStatuses') },
                    { value: 'true', label: t('escalationRules.enabled') },
                    { value: 'false', label: t('escalationRules.disabled') }
                  ]}
                  size="sm"
                />

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="w-full"
                  >
                    {t('escalationRules.clearFilters')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 dark:border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 dark:text-red-300" />
            <p className="text-sm text-red-700 dark:text-red-300">{extractErrorMessage(error)}</p>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => dispatch(clearError())}
            >
              {t('escalationRules.dismiss')}
            </Button>
          </div>
        </Card>
      )}

      {/* Escalation Rules Table */}
      <Card>
        <Table
          data={escalationRules}
          columns={columns}
          loading={loading}
          error={error}
          emptyMessage={t('escalationRules.emptyMessage')}
          sortable={true}
          selectable={canUpdate || canDelete}
          selectedRows={selectedEscalationRules}
          onSelectionChange={handleSelectionChange}
          onSort={handleSort}
          sortBy={filters.sortBy}
          sortDirection={filters.sortDirection}
          hover={true}
          className="border-0"
          pagination={false}
        />
      </Card>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('escalationRules.showing', {
              from: Math.min(pageIndex * pageSize + 1, totalCount),
              to: Math.min((pageIndex + 1) * pageSize, totalCount),
              total: totalCount
            })}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Simple pagination buttons for debugging */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={pageIndex === 0}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-100"
            >
              {t('escalationRules.first')}
            </button>
            
            <button
              onClick={() => handlePageChange(pageIndex)}
              disabled={pageIndex === 0}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-100"
            >
              {t('escalationRules.previous')}
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {t('escalationRules.page', { current: pageIndex + 1, total: totalPages })}
            </span>
            
            <button
              onClick={() => handlePageChange(pageIndex + 2)}
              disabled={pageIndex >= totalPages - 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-100"
            >
              {t('escalationRules.next')}
            </button>
            
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={pageIndex >= totalPages - 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-100"
            >
              {t('escalationRules.last')}
            </button>

            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="ms-4 px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value={10}>{t('escalationRules.perPage', { count: 10 })}</option>
              <option value={20}>{t('escalationRules.perPage', { count: 20 })}</option>
              <option value={50}>{t('escalationRules.perPage', { count: 50 })}</option>
              <option value={100}>{t('escalationRules.perPage', { count: 100 })}</option>
            </select>
          </div>
        </div>
      )}

      {/* Create/Edit Rule Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || isEditModalOpen) && (
          <EscalationRuleModal
            isOpen={isCreateModalOpen || isEditModalOpen}
            onClose={isCreateModalOpen ? () => dispatch(hideCreateModal()) : () => dispatch(hideEditModal())}
            onSubmit={isCreateModalOpen ? handleCreateRule : handleUpdateRule}
            initialData={isEditModalOpen ? currentEscalationRule : null}
            loading={createLoading || updateLoading}
            error={createError || updateError}
            alertTypes={alertTypes}
            alertPriorities={alertPriorities}
            escalationActions={escalationActions}
            mode={isCreateModalOpen ? 'create' : 'edit'}
          />
        )}
      </AnimatePresence>

      {/* View Rule Modal */}
      <AnimatePresence>
        {isViewModalOpen && (
          <EscalationRuleModal
            isOpen={isViewModalOpen}
            onClose={() => dispatch(hideViewModal())}
            onSubmit={() => {}} // No submit for view mode
            initialData={currentEscalationRule}
            loading={false}
            error={null}
            alertTypes={alertTypes}
            alertPriorities={alertPriorities}
            escalationActions={escalationActions}
            mode="view"
            readOnly={true}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => dispatch(hideDeleteModal())}
        onConfirm={handleConfirmDelete}
        title={t('escalationRules.deleteTitle')}
        message={currentEscalationRule ? t('escalationRules.deleteMessage', { name: currentEscalationRule.ruleName }) : ''}
        confirmText={t('escalationRules.delete')}
        variant="danger"
        loading={deleteLoading}
      />

      {/* Bulk Action Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        onClose={() => {
          setShowBulkConfirm(false);
          setBulkAction('');
        }}
        onConfirm={handleConfirmBulkAction}
        title={t('escalationRules.bulkTitle', {
          action: bulkAction === 'delete'
            ? t('escalationRules.delete')
            : bulkAction === 'enable'
              ? t('escalationRules.enable')
              : t('escalationRules.disable')
        })}
        message={`${t('escalationRules.bulkMessage', {
          action: bulkAction === 'delete'
            ? t('escalationRules.delete').toLowerCase()
            : bulkAction === 'enable'
              ? t('escalationRules.enable').toLowerCase()
              : t('escalationRules.disable').toLowerCase(),
          count: selectedEscalationRules.length
        })}${bulkAction === 'delete' ? ` ${t('escalationRules.bulkDeleteWarning')}` : ''}`}
        confirmText={bulkAction === 'delete' ? t('escalationRules.delete') : bulkAction === 'enable' ? t('escalationRules.enable') : t('escalationRules.disable')}
        variant={bulkAction === 'delete' ? 'danger' : 'primary'}
        loading={bulkLoading}
      />
    </div>
    </div>
  );
};

export default EscalationRulesPage;
