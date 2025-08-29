// src/pages/system/EscalationRulesPage/EscalationRulesPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
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
  toggleEscalationRuleSelection,
  clearSelections,
  selectAllEscalationRules,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  showBulkDeleteModal,
  hideBulkDeleteModal,
  showViewModal,
  hideViewModal,
  clearError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearBulkError,
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
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Pagination from '../../../components/common/Pagination/Pagination';
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
import { CONFIGURATION_PERMISSIONS } from '../../../constants/permissions';
import { PRIORITY_COLORS } from '../../../constants/escalationRules';

/**
 * Escalation Rules Management Page
 * Manages CRUD operations for alert escalation rules
 * Allows configuration of when and how alerts are escalated
 */
const EscalationRulesPage = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Permissions
  const canRead = hasPermission(CONFIGURATION_PERMISSIONS.READ);
  const canCreate = hasPermission(CONFIGURATION_PERMISSIONS.CREATE);
  const canUpdate = hasPermission(CONFIGURATION_PERMISSIONS.UPDATE);
  const canDelete = hasPermission(CONFIGURATION_PERMISSIONS.DELETE);

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
    showBulkDeleteModal: isBulkDeleteModalOpen,
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
    deleteError,
    bulkError,
    
    // Metadata
    alertTypes,
    alertPriorities,
    escalationActions,
    lastSyncTime
  } = useSelector(state => state.escalationRules);

  // Computed values
  const hasSelectedRules = selectedEscalationRules.length > 0;
  const isAllSelected = selectedEscalationRules.length === escalationRules.length && escalationRules.length > 0;
  const isIndeterminate = selectedEscalationRules.length > 0 && selectedEscalationRules.length < escalationRules.length;

  // Initialize page
  useEffect(() => {
    dispatch(setPageTitle('Escalation Rules'));
    
    if (canRead) {
      // Load data and metadata
      dispatch(fetchEscalationRules());
      dispatch(fetchAlertTypes());
      dispatch(fetchAlertPriorities());
      dispatch(fetchEscalationActions());
    }
  }, [dispatch, canRead]);

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

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      dispatch(selectAllEscalationRules());
    } else {
      dispatch(clearSelections());
    }
  };

  const handleSelectRule = (ruleId, checked) => {
    dispatch(toggleEscalationRuleSelection(ruleId));
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
      title: 'Rule Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getAlertTypeIcon(row.alertType)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {value}
            </div>
            <div className="text-xs text-gray-500">
              {row.alertType} - {row.alertPriority}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'alertType',
      title: 'Alert Type',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getAlertTypeIcon(value)}
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'alertPriority',
      title: 'Priority',
      sortable: true,
      render: (value) => (
        <Badge color={getPriorityBadgeColor(value)} size="sm">
          {value}
        </Badge>
      )
    },
    {
      key: 'targetRole',
      title: 'Target Role',
      render: (value) => value || 'All Roles'
    },
    {
      key: 'escalationDelayMinutes',
      title: 'Delay',
      sortable: true,
      render: (value) => `${value} min`
    },
    {
      key: 'action',
      title: 'Action',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {getActionIcon(value)}
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'isEnabled',
      title: 'Status',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {value ? (
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
          ) : (
            <XCircleIcon className="w-4 h-4 text-red-500" />
          )}
          <Badge color={value ? 'green' : 'red'} size="sm">
            {value ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '120px',
      render: (_, row) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleViewRule(row)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
            title="View rule details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          
          {canUpdate && (
            <button
              onClick={() => handleToggleRule(row)}
              className={`p-1 rounded transition-colors ${
                row.isEnabled 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={row.isEnabled ? 'Disable rule' : 'Enable rule'}
              disabled={updateLoading}
            >
              <PowerIcon className="w-4 h-4" />
            </button>
          )}
          
          {canUpdate && (
            <button
              onClick={() => handleEditRule(row)}
              className="p-1 text-blue-600 hover:text-blue-700 rounded transition-colors"
              title="Edit rule"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={() => handleDeleteRule(row)}
              className="p-1 text-red-600 hover:text-red-700 rounded transition-colors"
              title="Delete rule"
              disabled={deleteLoading}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Render loading state
  if (!canRead) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIconSolid className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view escalation rules.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Escalation Rules</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure alert escalation and notification rules
          </p>
          {lastSyncTime && (
            <p className="mt-1 text-xs text-gray-400">
              Last updated: {formatRelativeTime(new Date(lastSyncTime))}
            </p>
          )}
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            icon={<FunnelIcon className="w-5 h-5" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          
          {canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              Create Rule
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Cog6ToothIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Rules</h3>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Active Rules</h3>
              <p className="text-2xl font-bold text-gray-900">
                {escalationRules.filter(rule => rule.isEnabled).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Critical Priority</h3>
              <p className="text-2xl font-bold text-gray-900">
                {escalationRules.filter(rule => 
                  rule.alertPriority === 'Critical' || rule.alertPriority === 'Emergency'
                ).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Alert Types</h3>
              <p className="text-2xl font-bold text-gray-900">
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
                placeholder="Search rules by name, alert type, or action..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            
            {/* Bulk Actions */}
            {hasSelectedRules && (
              <div className="flex items-center space-x-2">
                <Select
                  value={bulkAction}
                  onChange={(value) => setBulkAction(value)}
                  placeholder="Bulk actions"
                  size="sm"
                  className="w-40"
                >
                  <option value="enable">Enable Selected</option>
                  <option value="disable">Disable Selected</option>
                  {canDelete && <option value="delete">Delete Selected</option>}
                </Select>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkAction}
                  disabled={!bulkAction || bulkLoading}
                >
                  Apply ({selectedEscalationRules.length})
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
                  label="Alert Type"
                  value={filters.alertType || ''}
                  onChange={(value) => handleFilterChange('alertType', value || null)}
                  placeholder="All Alert Types"
                  size="sm"
                >
                  {Object.entries(alertTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </Select>

                <Select
                  label="Priority"
                  value={filters.priority || ''}
                  onChange={(value) => handleFilterChange('priority', value || null)}
                  placeholder="All Priorities"
                  size="sm"
                >
                  {Object.entries(alertPriorities).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </Select>

                <Select
                  label="Status"
                  value={filters.isEnabled?.toString() || ''}
                  onChange={(value) => handleFilterChange('isEnabled', value ? value === 'true' : null)}
                  placeholder="All Statuses"
                  size="sm"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </Select>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{extractErrorMessage(error)}</p>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => dispatch(clearError())}
            >
              Dismiss
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
          emptyMessage="No escalation rules found"
          sortable={true}
          selectable={canUpdate || canDelete}
          selectedRows={selectedEscalationRules}
          onSelectionChange={setSelectedEscalationRules}
          onRowSelect={handleSelectRule}
          onSelectAll={handleSelectAll}
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
          <div className="text-sm text-gray-500">
            Showing {Math.min(pageIndex * pageSize + 1, totalCount)} to{' '}
            {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount} rules
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Simple pagination buttons for debugging */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={pageIndex === 0}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              First
            </button>
            
            <button
              onClick={() => handlePageChange(pageIndex)}
              disabled={pageIndex === 0}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {pageIndex + 1} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pageIndex + 2)}
              disabled={pageIndex >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
            
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={pageIndex >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Last
            </button>

            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="ml-4 px-2 py-1 text-sm border rounded"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
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
        title="Delete Escalation Rule"
        message={
          currentEscalationRule && (
            <>
              Are you sure you want to delete the escalation rule "
              <span className="font-medium">{currentEscalationRule.ruleName}</span>"?
              This action cannot be undone.
            </>
          )
        }
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        error={deleteError}
      />

      {/* Bulk Action Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        onClose={() => {
          setShowBulkConfirm(false);
          setBulkAction('');
        }}
        onConfirm={handleConfirmBulkAction}
        title={`Bulk ${bulkAction === 'delete' ? 'Delete' : bulkAction === 'enable' ? 'Enable' : 'Disable'} Rules`}
        message={
          <>
            Are you sure you want to {bulkAction} {selectedEscalationRules.length} selected escalation rule
            {selectedEscalationRules.length === 1 ? '' : 's'}?
            {bulkAction === 'delete' && ' This action cannot be undone.'}
          </>
        }
        confirmText={bulkAction === 'delete' ? 'Delete' : bulkAction === 'enable' ? 'Enable' : 'Disable'}
        confirmVariant={bulkAction === 'delete' ? 'danger' : 'primary'}
        loading={bulkLoading}
        error={bulkError}
      />
    </div>
  );
};

export default EscalationRulesPage;
