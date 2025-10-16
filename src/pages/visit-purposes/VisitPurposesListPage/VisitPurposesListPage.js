// src/pages/visit-purposes/VisitPurposesListPage/VisitPurposesListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
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
  const { user: currentUser } = useAuth();
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
      header: 'Purpose Name',
      sortable: true,
      render: (value, purpose) => (
        <div>
          <div className="font-medium text-gray-900">{purpose.name}</div>
          {purpose.description && (
            <div className="text-sm text-gray-500 mt-1">{purpose.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'requirements',
      header: 'Requirements',
      sortable: false,
      render: (value, purpose) => (
        <div className="space-y-1">
          <div>
            <Badge 
              variant={purpose.requiresApproval ? 'warning' : 'success'}
              size="sm"
            >
              {purpose.requiresApproval ? 'Approval Required' : 'No Approval'}
            </Badge>
          </div>
          {purpose.requiresEscort && (
            <div>
              <Badge variant="info" size="sm">
                Escort Required
              </Badge>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'usage',
      header: 'Usage',
      sortable: true,
      render: (value, purpose) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {purpose.usageCount || 0} invitations
          </div>
          {purpose.lastUsed && (
            <div className="text-sm text-gray-500">
              Last used: {formatters.relativeTime(purpose.lastUsed)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, purpose) => (
        <Badge 
          variant={purpose.isActive ? 'success' : 'secondary'}
          size="sm"
        >
          {purpose.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      sortable: false,
      render: (value, purpose) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePurposeAction('view', purpose)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="View details"
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
              title="Edit purpose"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handlePurposeAction('delete', purpose)}
              className="text-red-600 hover:text-red-900 transition-colors"
              title="Delete purpose"
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
          <h1 className="text-2xl font-bold text-gray-900">Visit Purposes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage visit purpose categories for invitation workflows
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              loading={createLoading}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              Add Purpose
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.active}</dd>
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Inactive</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.inactive}</dd>
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approval Required</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.requiresApproval}</dd>
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">No Approval</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.noApprovalRequired}</dd>
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
              placeholder="Search visit purposes..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FunnelIcon className="w-5 h-5" />}
            >
              Filters
            </Button>
            
            {(filters.requiresApproval !== null || filters.includeInactive || filters.searchTerm) && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
              >
                Clear Filters
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Requirement
                  </label>
                  <select
                    value={filters.requiresApproval === null ? '' : filters.requiresApproval.toString()}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : e.target.value === 'true';
                      handleFilterChange('requiresApproval', value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All</option>
                    <option value="true">Required</option>
                    <option value="false">Not Required</option>
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
                  <label htmlFor="includeInactive" className="ml-2 block text-sm text-gray-700">
                    Include inactive purposes
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
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {selectedCount} purpose{selectedCount !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                Clear Selection
              </Button>
            </div>
            
            {canDelete && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('delete');
                    setShowBulkConfirm(true);
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Selected
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
            emptyMessage="No visit purposes found"
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
        title="Visit Purpose Details"
        size="lg"
      >
        {viewingPurpose && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{viewingPurpose.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge variant={viewingPurpose.isActive ? 'success' : 'secondary'} size="sm">
                    {viewingPurpose.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {viewingPurpose.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{viewingPurpose.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Requires Approval</label>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingPurpose.requiresApproval ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Requires Escort</label>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingPurpose.requiresEscort ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            
            {viewingPurpose.usageCount !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Usage Statistics</label>
                <p className="mt-1 text-sm text-gray-900">
                  Used in {viewingPurpose.usageCount || 0} invitation{(viewingPurpose.usageCount || 0) !== 1 ? 's' : ''}
                </p>
                {viewingPurpose.lastUsed && (
                  <p className="text-sm text-gray-500">
                    Last used: {formatters.relativeTime(viewingPurpose.lastUsed)}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingPurpose(null);
                }}
              >
                Close
              </Button>
              {canUpdate && (
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handlePurposeAction('edit', viewingPurpose);
                  }}
                >
                  Edit
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
        title="Create Visit Purpose"
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
        title="Edit Visit Purpose"
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
        title="Delete Visit Purpose"
        message={
          currentPurpose
            ? `Are you sure you want to delete "${currentPurpose.name}"? This will deactivate the purpose but preserve historical data.`
            : 'Are you sure you want to delete this visit purpose?'
        }
        confirmText="Delete"
        cancelText="Cancel"
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
        title="Delete Selected Purposes"
        message={`Are you sure you want to delete ${selectedCount} visit purpose${selectedCount !== 1 ? 's' : ''}? This will deactivate the purposes but preserve historical data.`}
        confirmText="Delete Selected"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default VisitPurposesListPage;