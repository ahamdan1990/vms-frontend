// src/pages/visit-purposes/VisitPurposesListPage/VisitPurposesListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../../hooks/usePermissions';

// Redux actions and selectors
import {
  getVisitPurposes,
  createVisitPurpose,
  updateVisitPurpose,
  deleteVisitPurpose,
  updateFilters,
  resetFilters,
  setSelectedVisitPurposes,
  toggleVisitPurposeSelection,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  clearError
} from '../../../store/slices/visitPurposesSlice';

import {
  selectSortedVisitPurposes,
  selectVisitPurposesListLoading,
  selectVisitPurposesCreateLoading,
  selectVisitPurposesUpdateLoading,
  selectVisitPurposesDeleteLoading,
  selectVisitPurposesFilters,
  selectSelectedVisitPurposes,
  selectVisitPurposeStats,
  selectShowCreateModal,
  selectShowEditModal,
  selectShowDeleteModal,
  selectCurrentVisitPurpose,
  selectVisitPurposesCreateError,
  selectVisitPurposesUpdateError,
  selectVisitPurposesDeleteError,
  selectHasSelectedVisitPurposes,
  selectSelectedVisitPurposesCount
} from '../../../store/selectors/visitPurposeSelectors';
// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Table from '../../../components/common/Table/Table';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Badge from '../../../components/common/Badge/Badge';
import Card from '../../../components/common/Card/Card';
import VisitPurposeForm from '../../../components/forms/VisitPurposeForm/VisitPurposeForm';

// Icons (assuming you have an icon system)
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Utils
import formatters from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Visit Purposes Management Page
 * Manages visit purpose CRUD operations for invitation workflows
 * Foundation component required by all invitation systems
 */
const VisitPurposesListPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('system');
  const { hasPermission } = usePermissions();

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPurpose, setViewingPurpose] = useState(null);

  // Permissions
  const canRead = hasPermission('SystemConfig.Read');
  const canCreate = hasPermission('SystemConfig.Create');
  const canUpdate = hasPermission('SystemConfig.Update');
  const canDelete = hasPermission('SystemConfig.Delete');

  // Redux selectors
  const visitPurposes = useSelector(selectSortedVisitPurposes);
  const listLoading = useSelector(selectVisitPurposesListLoading);
  const createLoading = useSelector(selectVisitPurposesCreateLoading);
  const updateLoading = useSelector(selectVisitPurposesUpdateLoading);
  const deleteLoading = useSelector(selectVisitPurposesDeleteLoading);
  const filters = useSelector(selectVisitPurposesFilters);
  const selectedPurposes = useSelector(selectSelectedVisitPurposes);
  const stats = useSelector(selectVisitPurposeStats);
  const showCreateModalState = useSelector(selectShowCreateModal);
  const showEditModalState = useSelector(selectShowEditModal);
  const showDeleteModalState = useSelector(selectShowDeleteModal);
  const currentPurpose = useSelector(selectCurrentVisitPurpose);
  const createError = useSelector(selectVisitPurposesCreateError);
  const updateError = useSelector(selectVisitPurposesUpdateError);
  const deleteError = useSelector(selectVisitPurposesDeleteError);
  const hasSelected = useSelector(selectHasSelectedVisitPurposes);
  const selectedCount = useSelector(selectSelectedVisitPurposesCount);

  // Load visit purposes on mount and when filters change
  useEffect(() => {
    dispatch(getVisitPurposes(filters));
  }, [dispatch, filters]);

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.searchTerm) {
        dispatch(updateFilters({ searchTerm: searchInput }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.searchTerm, dispatch]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Event handlers
  const handleCreatePurpose = async (purposeData) => {
    try {
      await dispatch(createVisitPurpose(purposeData)).unwrap();
      // Refresh the list to show the new item with proper filtering/sorting
      dispatch(getVisitPurposes(filters));
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Create visit purpose failed:', error);
    }
  };

  const handleUpdatePurpose = async (purposeData) => {
    try {
      await dispatch(updateVisitPurpose({ 
        id: currentPurpose.id, 
        visitPurposeData: purposeData 
      })).unwrap();
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Update visit purpose failed:', error);
    }
  };

  const handleDeletePurpose = async (hardDelete = false) => {
    try {
      await dispatch(deleteVisitPurpose({ 
        id: currentPurpose.id, 
        hardDelete 
      })).unwrap();
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Delete visit purpose failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedPurposes.map(id => 
        dispatch(deleteVisitPurpose({ id, hardDelete: false })).unwrap()
      );
      await Promise.all(deletePromises);
      dispatch(clearSelections());
      setShowBulkConfirm(false);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleFilterChange = (filterName, value) => {
    dispatch(updateFilters({ [filterName]: value }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    dispatch(resetFilters());
  };

  // Handle purpose actions (view, edit, delete)
  const handlePurposeAction = (action, purpose) => {
    switch (action) {
      case 'view':
        setViewingPurpose(purpose);
        setShowViewModal(true);
        break;
      case 'edit':
        dispatch(showEditModal(purpose));
        break;
      case 'delete':
        dispatch(showDeleteModal(purpose));
        break;
      default:
        break;
    }
  };
  // Table columns configuration
  const columns = [
    {
      key: 'selection',
      header: '',
      width: '50px',
      sortable: false,
      render: (value, purpose) => (
        <input
          type="checkbox"
          checked={selectedPurposes.includes(purpose.id)}
          onChange={(e) => {
            if (e.target.checked) {
              dispatch(setSelectedVisitPurposes([...selectedPurposes, purpose.id]));
            } else {
              dispatch(setSelectedVisitPurposes(selectedPurposes.filter(id => id !== purpose.id)));
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      )
    },
    {
      key: 'name',
      header: t('visitPurposes.columns.purposeName'),
      sortable: true,
      render: (value, purpose) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-300">{purpose.name}</div>
          {purpose.description && (
            <div className="text-sm text-gray-500 mt-1">{purpose.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'requirements',
      header: t('visitPurposes.columns.requirements'),
      sortable: false,
      render: (value, purpose) => (
        <div className="space-y-1">
          <div>
            <Badge 
              variant={purpose.requiresApproval ? 'warning' : 'success'}
              size="sm"
            >
              {purpose.requiresApproval ? t('visitPurposes.approvalRequired') : t('visitPurposes.noApproval')}
            </Badge>
          </div>
          {purpose.requiresEscort && (
            <div>
              <Badge variant="info" size="sm">
                {t('visitPurposes.escortRequired')}
              </Badge>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'usage',
      header: t('visitPurposes.columns.usage'),
      sortable: true,
      render: (value, purpose) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
            {t('visitPurposes.invitations', { count: purpose.usageCount || 0 })}
          </div>
          {purpose.lastUsed && (
            <div className="text-sm text-gray-500">
              {t('visitPurposes.lastUsed', { time: formatters.relativeTime(purpose.lastUsed) })}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: t('visitPurposes.columns.status'),
      sortable: true,
      render: (value, purpose) => (
        <Badge 
          variant={purpose.isActive ? 'success' : 'secondary'}
          size="sm"
        >
          {purpose.isActive ? t('visitPurposes.active') : t('visitPurposes.inactive')}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('visitPurposes.columns.actions'),
      width: '120px',
      sortable: false,
      render: (value, purpose) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePurposeAction('view', purpose)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title={t('common:buttons.view')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {canUpdate && (
            <button
              onClick={() => handlePurposeAction('edit', purpose)}
              className="text-blue-600 hover:text-blue-900 transition-colors"
              title={t('common:buttons.edit')}
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handlePurposeAction('delete', purpose)}
              className="text-red-600 hover:text-red-900 transition-colors"
              title={t('common:buttons.delete')}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('visitPurposes.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('visitPurposes.subtitle')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              loading={createLoading}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              {t('visitPurposes.createButton')}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{t('visitPurposes.statTotal')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-300">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{t('visitPurposes.statActive')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-300">{stats.active}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <XCircleIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{t('visitPurposes.statInactive')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-300">{stats.inactive}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{t('visitPurposes.statApprovalRequired')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-300">{stats.requiresApproval}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{t('visitPurposes.statNoApproval')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-300">{stats.noApprovalRequired}</dd>
                </dl>
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={t('visitPurposes.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FunnelIcon className="w-5 h-5" />}
            >
              {t('visitPurposes.filters')}
            </Button>
            
            {(filters.requiresApproval !== null || filters.includeInactive || filters.searchTerm) && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
              >
                {t('visitPurposes.clearFilters')}
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    {t('visitPurposes.approvalRequirement')}
                  </label>
                  <select
                    value={filters.requiresApproval === null ? '' : filters.requiresApproval.toString()}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : e.target.value === 'true';
                      handleFilterChange('requiresApproval', value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('visitPurposes.all')}</option>
                    <option value="true">{t('visitPurposes.required')}</option>
                    <option value="false">{t('visitPurposes.notRequired')}</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeInactive"
                    checked={filters.includeInactive}
                    onChange={(e) => handleFilterChange('includeInactive', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeInactive" className="ms-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('visitPurposes.includeInactive')}
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Bulk Actions */}
      {hasSelected && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {t('visitPurposes.bulkSelected', { count: selectedCount })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                {t('visitPurposes.clearSelection')}
              </Button>
            </div>
            
            {canDelete && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('delete');
                    setShowBulkConfirm(true);
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 me-2" />
                  {t('visitPurposes.deleteSelected')}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
      {/* Main Table */}
      <Card>
        {listLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <Table
            data={visitPurposes}
            columns={columns}
            loading={listLoading}
            onRowSelectionChange={(selectedRowIds) => {
              const selectedIds = Object.keys(selectedRowIds).filter(id => selectedRowIds[id]);
              dispatch(setSelectedVisitPurposes(selectedIds.map(Number)));
            }}
            emptyMessage={t('visitPurposes.emptyMessage')}
            className="visit-purposes-table"
          />
        )}
      </Card>

      {/* View Purpose Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingPurpose(null);
        }}
        title={t('visitPurposes.details.title')}
        size="lg"
      >
        {viewingPurpose && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('visitPurposes.details.name')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">{viewingPurpose.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('visitPurposes.details.status')}</label>
                <div className="mt-1">
                  <Badge variant={viewingPurpose.isActive ? 'success' : 'secondary'} size="sm">
                    {viewingPurpose.isActive ? t('visitPurposes.active') : t('visitPurposes.inactive')}
                  </Badge>
                </div>
              </div>
            </div>
            
            {viewingPurpose.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('visitPurposes.details.description')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-300">{viewingPurpose.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('visitPurposes.details.requiresApproval')}</label>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingPurpose.requiresApproval ? t('visitPurposes.details.yes') : t('visitPurposes.details.no')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('visitPurposes.details.requiresEscort')}</label>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingPurpose.requiresEscort ? t('visitPurposes.details.yes') : t('visitPurposes.details.no')}
                </p>
              </div>
            </div>
            
            {viewingPurpose.usageCount !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('visitPurposes.details.usageStats')}</label>
                <p className="mt-1 text-sm text-gray-900">
                  {t('visitPurposes.details.usedIn', {
                    count: viewingPurpose.usageCount || 0
                  })}
                </p>
                {viewingPurpose.lastUsed && (
                  <p className="text-sm text-gray-500">
                    {t('visitPurposes.details.lastUsed', { time: formatters.relativeTime(viewingPurpose.lastUsed) })}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingPurpose(null);
                }}
              >
                {t('visitPurposes.details.close')}
              </Button>
              {canUpdate && (
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handlePurposeAction('edit', viewingPurpose);
                  }}
                >
                  {t('visitPurposes.details.edit')}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModalState}
        onClose={() => dispatch(hideCreateModal())}
        title={t('visitPurposes.createTitle')}
        size="lg"
      >
        <VisitPurposeForm
          onSubmit={handleCreatePurpose}
          onCancel={() => dispatch(hideCreateModal())}
          loading={createLoading}
          error={createError}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModalState}
        onClose={() => dispatch(hideEditModal())}
        title={t('visitPurposes.editTitle')}
        size="lg"
      >
        {currentPurpose && (
          <VisitPurposeForm
            initialData={currentPurpose}
            onSubmit={handleUpdatePurpose}
            onCancel={() => dispatch(hideEditModal())}
            loading={updateLoading}
            error={updateError}
            isEdit={true}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModalState}
        onClose={() => dispatch(hideDeleteModal())}
        onConfirm={() => handleDeletePurpose(false)}
        title={t('visitPurposes.deleteTitle')}
        message={
          currentPurpose
            ? t('visitPurposes.deleteMessage', { name: currentPurpose.name })
            : t('visitPurposes.deleteMessageGeneric')
        }
        confirmText={t('visitPurposes.deleteConfirm')}
        cancelText={t('visitPurposes.cancel')}
        variant="danger"
        loading={deleteLoading}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm && bulkAction === 'delete'}
        onClose={() => {
          setShowBulkConfirm(false);
          setBulkAction('');
        }}
        onConfirm={handleBulkDelete}
        title={t('visitPurposes.bulkDeleteTitle')}
        message={t('visitPurposes.bulkDeleteMessage', { count: selectedCount })}
        confirmText={t('visitPurposes.deleteSelected')}
        cancelText={t('visitPurposes.cancel')}
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default VisitPurposesListPage;
