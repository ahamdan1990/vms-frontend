// src/pages/visitors/VisitorsListPage/VisitorsListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';

// Redux actions and selectors
import {
  getVisitors,
  getVisitorStatistics,
  createVisitor,
  updateVisitor,
  deleteVisitor,
  searchVisitors,
  quickSearchVisitors,
  blacklistVisitor,
  removeBlacklist,
  markAsVip,
  removeVipStatus,
  updateFilters,
  resetFilters,
  setPageIndex,
  setPageSize,
  setSelectedVisitors,
  toggleVisitorSelection,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  showDetailsModal,
  hideDetailsModal,
  showBlacklistModal,
  hideBlacklistModal,
  showAdvancedSearchModal,
  hideAdvancedSearchModal,
  toggleAdvancedSearch,
  clearAdvancedSearch,
  setQuickSearchTerm,
  clearQuickSearch,
  clearError
} from '../../../store/slices/visitorsSlice';

// Invitation actions
import { createInvitation } from '../../../store/slices/invitationsSlice';

import {
  selectSortedVisitors,
  selectVisitorsTotal,
  selectVisitorsPageIndex,
  selectVisitorsPageSize,
  selectVisitorsListLoading,
  selectVisitorsCreateLoading,
  selectVisitorsUpdateLoading,
  selectVisitorsDeleteLoading,
  selectVisitorsStatusChangeLoading,
  selectVisitorsFilters,
  selectSelectedVisitors,
  selectVisitorStatistics,
  selectShowCreateModal,
  selectShowEditModal,
  selectShowDeleteModal,
  selectShowDetailsModal,
  selectShowBlacklistModal,
  selectShowAdvancedSearchModal,
  selectCurrentVisitor,
  selectVisitorsCreateError,
  selectVisitorsUpdateError,
  selectVisitorsDeleteError,
  selectVisitorsStatusChangeError,
  selectHasSelectedVisitors,
  selectSelectedVisitorsCount,
  selectHasPreviousPage,
  selectHasNextPage,
  selectTotalPages,
  selectCurrentPageRange,
  selectAdvancedSearchResults,
  selectAdvancedSearchLoading,
  selectIsAdvancedSearchActive,
  selectQuickSearchResults,
  selectQuickSearchLoading,
  selectQuickSearchTerm
} from '../../../store/selectors/visitorSelectors';

// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Table from '../../../components/common/Table/Table';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Badge from '../../../components/common/Badge/Badge';
import Card from '../../../components/common/Card/Card';
import Pagination from '../../../components/common/Pagination/Pagination';
import EmergencyContactsList from '../../../components/visitor/EmergencyContactsList/EmergencyContactsList';
import VisitorForm from '../../../components/visitor/VisitorForm/VisitorForm';
import AdvancedSearchModal from '../../../components/visitor/AdvancedSearch/AdvancedSearchModal';

// Icons
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  UserIcon,
  StarIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Utils
import { formatDateTime } from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Visitors Management Page
 * Manages visitor CRUD operations with advanced search, VIP/blacklist management
 * Core entity for all visitor management workflows
 */
const VisitorsListPage = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');

  // Permissions
  const canRead = hasPermission('Visitor.Read');
  const canCreate = hasPermission('Visitor.Create');
  const canUpdate = hasPermission('Visitor.Update');
  const canDelete = hasPermission('Visitor.Delete');
  const canBlacklist = hasPermission('Visitor.Blacklist');
  const canRemoveBlacklist = hasPermission('Visitor.RemoveBlacklist');
  const canMarkVip = hasPermission('Visitor.MarkAsVip');
  const canRemoveVip = hasPermission('Visitor.RemoveVipStatus');
  const canViewStats = hasPermission('Visitor.ViewStatistics');
  // Redux selectors
  const visitors = useSelector(selectSortedVisitors);
  const total = useSelector(selectVisitorsTotal);
  const pageIndex = useSelector(selectVisitorsPageIndex);
  const pageSize = useSelector(selectVisitorsPageSize);
  const listLoading = useSelector(selectVisitorsListLoading);
  const createLoading = useSelector(selectVisitorsCreateLoading);
  const updateLoading = useSelector(selectVisitorsUpdateLoading);
  const deleteLoading = useSelector(selectVisitorsDeleteLoading);
  const statusChangeLoading = useSelector(selectVisitorsStatusChangeLoading);
  const filters = useSelector(selectVisitorsFilters);
  const selectedVisitors = useSelector(selectSelectedVisitors);
  const statistics = useSelector(selectVisitorStatistics);
  const showCreateModalState = useSelector(selectShowCreateModal);
  const showEditModalState = useSelector(selectShowEditModal);
  const showDeleteModalState = useSelector(selectShowDeleteModal);
  const showDetailsModalState = useSelector(selectShowDetailsModal);
  const showBlacklistModal = useSelector(selectShowBlacklistModal);
  const currentVisitor = useSelector(selectCurrentVisitor);
  const createError = useSelector(selectVisitorsCreateError);
  const updateError = useSelector(selectVisitorsUpdateError);
  const deleteError = useSelector(selectVisitorsDeleteError);
  const statusChangeError = useSelector(selectVisitorsStatusChangeError);
  const hasSelected = useSelector(selectHasSelectedVisitors);
  const selectedCount = useSelector(selectSelectedVisitorsCount);
  const hasPreviousPage = useSelector(selectHasPreviousPage);
  const hasNextPage = useSelector(selectHasNextPage);
  const totalPages = useSelector(selectTotalPages);
  const pageRange = useSelector(selectCurrentPageRange);
  const advancedSearchResults = useSelector(selectAdvancedSearchResults);
  const advancedSearchLoading = useSelector(selectAdvancedSearchLoading);
  const isAdvancedSearchActive = useSelector(selectIsAdvancedSearchActive);
  const quickSearchResults = useSelector(selectQuickSearchResults);
  const quickSearchLoading = useSelector(selectQuickSearchLoading);
  const quickSearchTerm = useSelector(selectQuickSearchTerm);

  // Load visitors on mount and when filters/pagination change
  useEffect(() => {
    const params = {
      ...filters,
      pageIndex,
      pageSize
    };
    dispatch(getVisitors(params));
    
    // Load statistics if permitted
    if (canViewStats) {
      dispatch(getVisitorStatistics());
    }
  }, [dispatch, filters, pageIndex, pageSize, canViewStats]);

  // Handle search input changes with debouncing
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

  // Local state for form change tracking
  const [hasUnsavedCreateChanges, setHasUnsavedCreateChanges] = useState(false);
  const [hasUnsavedEditChanges, setHasUnsavedEditChanges] = useState(false);

  // Event handlers
  const handleCreateVisitor = async (visitorData, invitationData = null) => {
    try {
      // Create the visitor first
      const createdVisitor = await dispatch(createVisitor(visitorData)).unwrap();
      
      // If invitation data provided, create invitation for the new visitor
      if (invitationData) {
        const invitationPayload = {
          ...invitationData,
          visitorId: createdVisitor.id
        };
        await dispatch(createInvitation(invitationPayload)).unwrap();
        console.log('✅ Visitor and invitation created successfully!');
      } else {
        console.log('✅ Visitor created successfully!');
      }
      
      // Reset form change tracking and close modal
      setHasUnsavedCreateChanges(false);
      dispatch(hideCreateModal());
      
      // Refresh the list to show the new item with proper filtering/sorting
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Create visitor failed:', error);
    }
  };

  const handleUpdateVisitor = async (visitorData) => {
    try {
      await dispatch(updateVisitor({ 
        id: currentVisitor.id, 
        visitorData 
      })).unwrap();
      
      // Reset form change tracking and close modal
      setHasUnsavedEditChanges(false);
      dispatch(hideEditModal());
      
      // Refresh the list to show the updated item
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Update visitor failed:', error);
    }
  };

  const handleDeleteVisitor = async (permanentDelete = false) => {
    try {
      await dispatch(deleteVisitor({ 
        id: currentVisitor.id, 
        permanentDelete 
      })).unwrap();
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Delete visitor failed:', error);
    }
  };

  const handleBlacklistVisitor = async () => {
    try {
      await dispatch(blacklistVisitor({ 
        id: currentVisitor.id, 
        reason: blacklistReason 
      })).unwrap();
      setBlacklistReason('');
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Blacklist visitor failed:', error);
    }
  };

  const handleRemoveBlacklist = async (id) => {
    try {
      await dispatch(removeBlacklist(id)).unwrap();
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Remove blacklist failed:', error);
    }
  };

  const handleMarkAsVip = async (id) => {
    try {
      await dispatch(markAsVip(id)).unwrap();
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Mark as VIP failed:', error);
    }
  };

  const handleRemoveVipStatus = async (id) => {
    try {
      await dispatch(removeVipStatus(id)).unwrap();
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Remove VIP status failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedVisitors.map(id => 
        dispatch(deleteVisitor({ id, permanentDelete: false })).unwrap()
      );
      await Promise.all(deletePromises);
      dispatch(clearSelections());
      setShowBulkConfirm(false);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleBulkBlacklist = async () => {
    try {
      const blacklistPromises = selectedVisitors.map(id => 
        dispatch(blacklistVisitor({ id, reason: blacklistReason })).unwrap()
      );
      await Promise.all(blacklistPromises);
      dispatch(clearSelections());
      setShowBulkConfirm(false);
      setBulkAction('');
      setBlacklistReason('');
    } catch (error) {
      console.error('Bulk blacklist failed:', error);
    }
  };

  const handleFilterChange = (filterName, value) => {
    dispatch(updateFilters({ [filterName]: value }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    dispatch(resetFilters());
  };

  const handlePageChange = (newPageIndex) => {
    dispatch(setPageIndex(newPageIndex));
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(newPageSize));
  };
  // Helper function to get visitor status icons and colors
  const getVisitorStatusBadge = (visitor) => {
    if (visitor.isBlacklisted) {
      return <Badge variant="danger" size="sm">Blacklisted</Badge>;
    }
    if (visitor.isVip) {
      return <Badge variant="warning" size="sm">VIP</Badge>;
    }
    if (!visitor.isActive) {
      return <Badge variant="secondary" size="sm">Inactive</Badge>;
    }
    return <Badge variant="success" size="sm">Active</Badge>;
  };

  // Helper function to format visitor name with title
  const formatVisitorName = (visitor) => {
    const fullName = `${visitor.fullName}`;
    return (
      <div className="flex items-center space-x-2">
        {visitor.isVip && (
          <StarIconSolid className="w-4 h-4 text-yellow-500" title="VIP Visitor" />
        )}
        <div>
          <div className="font-medium text-gray-900">{fullName}</div>
          {visitor.jobTitle && visitor.company && (
            <div className="text-sm text-gray-500">
              {visitor.jobTitle} at {visitor.company}
            </div>
          )}
          {(!visitor.jobTitle && visitor.company) && (
            <div className="text-sm text-gray-500">{visitor.company}</div>
          )}
        </div>
      </div>
    );
  };

  // Handle visitor actions
  const handleVisitorAction = (action, visitor) => {
    switch (action) {
      case 'view':
        dispatch(showDetailsModal(visitor));
        break;
      case 'edit':
        dispatch(showEditModal(visitor));
        break;
      case 'delete':
        dispatch(showDeleteModal(visitor));
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
      render: (value, visitor) => (
        <input
          type="checkbox"
          checked={selectedVisitors.includes(visitor.id)}
          onChange={(e) => {
            if (e.target.checked) {
              dispatch(setSelectedVisitors([...selectedVisitors, visitor.id]));
            } else {
              dispatch(setSelectedVisitors(selectedVisitors.filter(id => id !== visitor.id)));
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      )
    },
    {
      key: 'name',
      header: 'Visitor',
      sortable: true,
      render: (value, visitor) => formatVisitorName(visitor)
    },
    {
      key: 'contact',
      header: 'Contact',
      sortable: false,
      render: (value, visitor) => (
        <div className="space-y-1">
          {visitor.email && (
            <div className="flex items-center space-x-1 text-sm">
              <EnvelopeIcon className="w-4 h-4 text-gray-400" />
              <span className="truncate">{visitor.email}</span>
            </div>
          )}
          {visitor.phoneNumber && (
            <div className="flex items-center space-x-1 text-sm">
              <PhoneIcon className="w-4 h-4 text-gray-400" />
              <span>{visitor.phoneNumber}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      render: (value, visitor) => (
        <div className="space-y-1">
          {visitor.company && (
            <div className="font-medium text-gray-900">{visitor.company}</div>
          )}
          {visitor.jobTitle && (
            <div className="text-sm text-gray-500">{visitor.jobTitle}</div>
          )}
        </div>
      )
    },
    {
      key: 'nationality',
      header: 'Nationality',
      sortable: true,
      render: (value, visitor) => visitor.nationality || '-'
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, visitor) => (
        <Badge 
          variant={visitor.isActive ? 'success' : 'secondary'}
          size="sm"
        >
          {visitor.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      sortable: false,
      render: (value, visitor) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleVisitorAction('view', visitor)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="View details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {canUpdate && (
            <button
              onClick={() => handleVisitorAction('edit', visitor)}
              className="text-blue-600 hover:text-blue-900 transition-colors"
              title="Edit visitor"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleVisitorAction('delete', visitor)}
              className="text-red-600 hover:text-red-900 transition-colors"
              title="Delete visitor"
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
          <h1 className="text-2xl font-bold text-gray-900">Visitors</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage visitor information, VIP status, and blacklist entries
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {/* Advanced Search Toggle */}
          <Button
            variant="outline"
            onClick={() => dispatch(showAdvancedSearchModal())}
            className={isAdvancedSearchActive ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
          >
            Advanced Search
          </Button>
          
          {canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              loading={createLoading}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              Add Visitor
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Visitors</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistics.totalVisitors || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistics.activeVisitors || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <StarIconSolid className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">VIP Visitors</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistics.vipVisitors || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Blacklisted</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistics.blacklistedVisitors || 0}</dd>
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
              placeholder="Search visitors by name, email, company..."
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
            
            {(filters.company || filters.isVip !== null || filters.isBlacklisted !== null || 
              filters.nationality || filters.securityClearance || filters.searchTerm || !filters.isActive) && (
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
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <Input
                    type="text"
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                    placeholder="Filter by company"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VIP Status
                  </label>
                  <select
                    value={filters.isVip === null ? '' : filters.isVip.toString()}
                    onChange={(e) => handleFilterChange('isVip', e.target.value === '' ? null : e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Visitors</option>
                    <option value="true">VIP Only</option>
                    <option value="false">Non-VIP Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blacklist Status
                  </label>
                  <select
                    value={filters.isBlacklisted === null ? '' : filters.isBlacklisted.toString()}
                    onChange={(e) => handleFilterChange('isBlacklisted', e.target.value === '' ? null : e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Visitors</option>
                    <option value="true">Blacklisted Only</option>
                    <option value="false">Not Blacklisted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <Input
                    type="text"
                    value={filters.nationality}
                    onChange={(e) => handleFilterChange('nationality', e.target.value)}
                    placeholder="Filter by nationality"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Clearance
                  </label>
                  <select
                    value={filters.securityClearance}
                    onChange={(e) => handleFilterChange('securityClearance', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Levels</option>
                    <option value="Standard">Standard</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Top Secret">Top Secret</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeInactive"
                    checked={!filters.isActive}
                    onChange={(e) => handleFilterChange('isActive', !e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeInactive" className="ml-2 block text-sm text-gray-700">
                    Include inactive visitors
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeDeleted"
                    checked={filters.includeDeleted}
                    onChange={(e) => handleFilterChange('includeDeleted', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeDeleted" className="ml-2 block text-sm text-gray-700">
                    Include deleted visitors
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
                {selectedCount} visitor{selectedCount !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                Clear Selection
              </Button>
            </div>
            
            <div className="flex space-x-2">
              {canBlacklist && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('blacklist');
                    setShowBulkConfirm(true);
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  Blacklist Selected
                </Button>
              )}
              
              {canMarkVip && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('vip');
                    setShowBulkConfirm(true);
                  }}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  <StarIcon className="w-4 h-4 mr-2" />
                  Mark as VIP
                </Button>
              )}
              
              {canDelete && (
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
              )}
            </div>
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
          <>
            <Table
              data={visitors}
              columns={columns}
              loading={listLoading}
              onRowSelectionChange={(selectedRowIds) => {
                const selectedIds = Object.keys(selectedRowIds).filter(id => selectedRowIds[id]);
                dispatch(setSelectedVisitors(selectedIds.map(Number)));
              }}
              emptyMessage="No visitors found"
              className="visitors-table"
            />
            
            {/* Pagination */}
            {total > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>
                      Showing {pageRange.start} to {pageRange.end} of {pageRange.total} visitors
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pageIndex - 1)}
                      disabled={!hasPreviousPage}
                      icon={<ChevronLeftIcon className="w-4 h-4" />}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (pageIndex < 3) {
                          pageNum = i;
                        } else if (pageIndex > totalPages - 4) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = pageIndex - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 text-sm rounded ${
                              pageNum === pageIndex
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pageIndex + 1)}
                      disabled={!hasNextPage}
                      icon={<ChevronRightIcon className="w-4 h-4" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModalState}
        onClose={() => dispatch(hideCreateModal())}
        title="Create Visitor"
        size="full"
        hasUnsavedChanges={hasUnsavedCreateChanges}
        confirmCloseMessage="You have unsaved visitor information. Are you sure you want to close without saving?"
      >
        <VisitorForm
          onSubmit={handleCreateVisitor}
          onCancel={() => dispatch(hideCreateModal())}
          onFormChange={setHasUnsavedCreateChanges}
          loading={createLoading}
          error={createError}
          isEdit={false}
        />
      </Modal>

      {/* Edit Modal */}
      {currentVisitor && (
        <Modal
          isOpen={showEditModalState}
          onClose={() => dispatch(hideEditModal())}
          title="Edit Visitor"
          size="full"
          hasUnsavedChanges={hasUnsavedEditChanges}
          confirmCloseMessage="You have unsaved changes to this visitor. Are you sure you want to close without saving?"
        >

            <VisitorForm
              initialData={currentVisitor}
              onSubmit={handleUpdateVisitor}
              onCancel={() => dispatch(hideEditModal())}
              onFormChange={setHasUnsavedEditChanges}
              loading={updateLoading}
              error={updateError}
              isEdit={true}
            />

        </Modal>
      )}

      {/* Details Modal */}
      {currentVisitor && (
      <Modal
        isOpen={showDetailsModalState}
        onClose={() => dispatch(hideDetailsModal())}
        title="Visitor Details"
        size="xl"
      >
          <div>
            {/* Visitor Information */}
            <div className="p-6 border-b border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {formatVisitorName(currentVisitor)}
                  {getVisitorStatusBadge(currentVisitor)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Email:</span>
                    <div>{currentVisitor.email || 'Not provided'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Phone:</span>
                    <div>{currentVisitor.phoneNumber || 'Not provided'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Company:</span>
                    <div>{currentVisitor.company || 'Not provided'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Nationality:</span>
                    <div>{currentVisitor.nationality || 'Not provided'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Security Clearance:</span>
                    <div>{currentVisitor.securityClearance || 'Standard'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Last Visit:</span>
                    <div>
                      {currentVisitor.lastVisitAt 
                        ? formatDateTime(currentVisitor.lastVisitAt)
                        : 'Never'
                      }
                    </div>
                  </div>
                </div>
                
                {currentVisitor.notes && (
                  <div>
                    <span className="font-medium text-gray-500">Notes:</span>
                    <div className="mt-1 text-gray-900">{currentVisitor.notes}</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Emergency Contacts Section */}
            <div className="p-6">
              <EmergencyContactsList
                visitorId={currentVisitor.id}
                visitorName={`${currentVisitor.firstName} ${currentVisitor.lastName}`}
                showHeader={true}
                isEmbedded={true}
                maxHeight="400px"
              />
            </div>
          </div>
      </Modal>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModalState}
        onClose={() => dispatch(hideDeleteModal())}
        onConfirm={() => handleDeleteVisitor(false)}
        title="Delete Visitor"
        message={
          currentVisitor
            ? `Are you sure you want to delete "${currentVisitor.firstName} ${currentVisitor.lastName}"? This will deactivate the visitor but preserve historical data.`
            : 'Are you sure you want to delete this visitor?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Blacklist Modal */}
      <Modal
        isOpen={showBlacklistModal}
        onClose={() => {
          dispatch(hideBlacklistModal());
          setBlacklistReason('');
        }}
        title="Add to Blacklist"
        size="md"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {currentVisitor && 
                `You are about to blacklist ${currentVisitor.firstName} ${currentVisitor.lastName}. 
                Please provide a reason for this action.`
              }
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for blacklisting <span className="text-red-500">*</span>
            </label>
            <textarea
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              rows={3}
              placeholder="Please provide a detailed reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                dispatch(hideBlacklistModal());
                setBlacklistReason('');
              }}
              disabled={statusChangeLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleBlacklistVisitor}
              loading={statusChangeLoading}
              disabled={!blacklistReason.trim()}
            >
              Add to Blacklist
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Action Confirmation Modals */}
      <ConfirmModal
        isOpen={showBulkConfirm && bulkAction === 'delete'}
        onClose={() => {
          setShowBulkConfirm(false);
          setBulkAction('');
        }}
        onConfirm={handleBulkDelete}
        title="Delete Selected Visitors"
        message={`Are you sure you want to delete ${selectedCount} visitor${selectedCount !== 1 ? 's' : ''}? This will deactivate the visitors but preserve historical data.`}
        confirmText="Delete Selected"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Bulk Blacklist Modal */}
      <Modal
        isOpen={showBulkConfirm && bulkAction === 'blacklist'}
        onClose={() => {
          setShowBulkConfirm(false);
          setBulkAction('');
          setBlacklistReason('');
        }}
        title="Blacklist Selected Visitors"
        size="md"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              You are about to blacklist {selectedCount} visitor{selectedCount !== 1 ? 's' : ''}. 
              Please provide a reason for this action.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for blacklisting <span className="text-red-500">*</span>
            </label>
            <textarea
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              rows={3}
              placeholder="Please provide a detailed reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkConfirm(false);
                setBulkAction('');
                setBlacklistReason('');
              }}
              disabled={statusChangeLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleBulkBlacklist}
              loading={statusChangeLoading}
              disabled={!blacklistReason.trim()}
            >
              Blacklist Selected
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk VIP Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm && bulkAction === 'vip'}
        onClose={() => {
          setShowBulkConfirm(false);
          setBulkAction('');
        }}
        onConfirm={async () => {
          try {
            const vipPromises = selectedVisitors.map(id => 
              dispatch(markAsVip(id)).unwrap()
            );
            await Promise.all(vipPromises);
            dispatch(clearSelections());
            setShowBulkConfirm(false);
            setBulkAction('');
          } catch (error) {
            console.error('Bulk VIP marking failed:', error);
          }
        }}
        title="Mark as VIP"
        message={`Are you sure you want to mark ${selectedCount} visitor${selectedCount !== 1 ? 's' : ''} as VIP?`}
        confirmText="Mark as VIP"
        cancelText="Cancel"
        variant="warning"
        loading={statusChangeLoading}
      />
      
      {/* Advanced Search Modal */}
      <AdvancedSearchModal />
    </div>
  );
};

export default VisitorsListPage;