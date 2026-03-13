// src/pages/visitors/VisitorsListPage/VisitorsListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';

// Route constants
import { VISITOR_ROUTES } from '../../../constants/routeConstants';

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
  clearError,
  getVisitorById
} from '../../../store/slices/visitorsSlice';

// UI slice
import { setPageTitle } from '../../../store/slices/uiSlice';

// Invitation actions
import { createInvitation } from '../../../store/slices/invitationsSlice';

// Services
import visitorService from '../../../services/visitorService';

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
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Badge from '../../../components/common/Badge/Badge';
import Card from '../../../components/common/Card/Card';
import Pagination from '../../../components/common/Pagination/Pagination';
import EmergencyContactsList from '../../../components/visitor/EmergencyContactsList/EmergencyContactsList';
import VisitorForm from '../../../components/visitor/VisitorForm/VisitorForm';
import VisitorGrid from '../../../components/visitor/VisitorGrid/VisitorGrid';
import AdvancedSearchModal from '../../../components/visitor/AdvancedSearch/AdvancedSearchModal';
import InvitationForm from '../../../components/invitation/InvitationForm/InvitationForm';

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
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const { t } = useTranslation(['visitors', 'common']);

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'grid', 'list', 'compact'
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [selectedVisitorForInvitation, setSelectedVisitorForInvitation] = useState(null);

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
    dispatch(setPageTitle(t('visitors:pageTitle')));

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
  const handleCreateVisitor = async (visitorData, invitationData = null, assetData = {}) => {
    try {
      const { photoFile, documentFiles, isEdit } = assetData;

      if (isEdit) {
        // For editing, use the standard Redux update pattern
        await dispatch(updateVisitor({
          id: currentVisitor.id,
          visitorData
        })).unwrap();

        // Handle invitation separately if provided (edit mode invitation creation)
        if (invitationData) {
          const invitationPayload = {
            ...invitationData,
            visitorId: currentVisitor.id
          };
          await dispatch(createInvitation(invitationPayload)).unwrap();
          console.log('✅ Visitor updated and invitation created successfully!');
        } else {
          console.log('✅ Visitor updated successfully!');
        }

        // Reset form change tracking and close modal
        setHasUnsavedEditChanges(false);
        dispatch(hideEditModal());
      } else {
        // For new visitor creation, use the comprehensive service method that handles:
        // 1. Visitor creation with invitation data integrated
        // 2. Photo upload
        // 3. Document uploads
        // 4. Error recovery and cleanup
        const result = await visitorService.createVisitorWithAssets(
          visitorData,
          photoFile,
          documentFiles || [],
          invitationData
        );

        // Handle partial success scenarios (visitor created but some uploads failed)
        if (result.errors && result.errors.length > 0) {
          console.warn('Visitor created with some warnings:', result.errors);

          // Show user-friendly toast notification for non-critical errors
          // This allows the operation to succeed while informing user of minor issues
          const errorMessages = result.errors.join(', ');
          console.info(`Visitor created successfully! Note: ${errorMessages}`);
        }

        console.log('✅ Visitor and associated assets created successfully!');

        // Reset form change tracking and close modal
        setHasUnsavedCreateChanges(false);
        dispatch(hideCreateModal());
      }

      // Refresh the visitor list to show the new/updated item with proper filtering/sorting
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));

      // Refresh statistics if available
      if (canViewStats) {
        dispatch(getVisitorStatistics());
      }

    } catch (error) {
      // Enhanced error handling with specific error categorization
      console.error('Create/Update visitor failed:', error);

      const errorMessage = error.response?.data?.message || error.message;

      // Provide user-friendly error messages based on error type
      if (errorMessage.includes('email')) {
        console.error('Email validation error:', errorMessage);
        // Error will be handled by VisitorForm to show field-specific error
      } else if (errorMessage.includes('invitation')) {
        console.error('Invitation creation failed:', errorMessage);
        // Partial success - visitor may have been created but invitation failed
      } else if (errorMessage.includes('upload')) {
        console.error('File upload error:', errorMessage);
        // Partial success - visitor created but file uploads failed
      } else {
        console.error('General creation error:', errorMessage);
      }

      // Re-throw to let VisitorForm handle error display and validation
      throw error;
    }
  };

  const handleUpdateVisitor = async (visitorData, invitationData = null, assetData = {}) => {
    try {
      // Update visitor using Redux pattern for consistency with list management
      await dispatch(updateVisitor({
        id: currentVisitor.id,
        visitorData
      })).unwrap();

      // Handle invitation creation if provided (useful for adding invitations during edit)
      if (invitationData) {
        const invitationPayload = {
          ...invitationData,
          visitorId: currentVisitor.id
        };
        await dispatch(createInvitation(invitationPayload)).unwrap();
        console.log('✅ Visitor updated and invitation created successfully!');
      } else {
        console.log('✅ Visitor updated successfully!');
      }

      // Reset form change tracking and close modal
      setHasUnsavedEditChanges(false);
      dispatch(hideEditModal());

      // Refresh the list to show the updated item
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));

      // Refresh statistics if available
      if (canViewStats) {
        dispatch(getVisitorStatistics());
      }

    } catch (error) {
      // Enhanced error handling with categorization
      console.error('Update visitor failed:', error);

      const errorMessage = error.response?.data?.message || error.message;

      if (errorMessage.includes('email')) {
        console.error('Email validation error during update:', errorMessage);
      } else if (errorMessage.includes('invitation')) {
        console.error('Invitation creation failed during update:', errorMessage);
      }

      // Re-throw to let VisitorForm handle error display
      throw error;
    }
  };

  const handleDeleteVisitor = async (permanentDelete = false) => {
    try {
      await dispatch(deleteVisitor({
        id: currentVisitor.id,
        permanentDelete
      })).unwrap();

      // Close the delete modal
      dispatch(hideDeleteModal());

      // Refresh the visitor list to show updated data
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));

      // Refresh statistics if available
      if (canViewStats) {
        dispatch(getVisitorStatistics());
      }

      console.log('✅ Visitor deleted successfully!');
    } catch (error) {
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

      // Close the blacklist modal
      dispatch(hideBlacklistModal());

      // Refresh the visitor list
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));

      // Refresh statistics if available
      if (canViewStats) {
        dispatch(getVisitorStatistics());
      }

      console.log('✅ Visitor blacklisted successfully!');
    } catch (error) {
      console.error('Blacklist visitor failed:', error);
    }
  };

  const handleRemoveBlacklist = async (id) => {
    try {
      await dispatch(removeBlacklist(id)).unwrap();

      // Refresh the visitor list
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));

      // Refresh statistics if available
      if (canViewStats) {
        dispatch(getVisitorStatistics());
      }

      console.log('✅ Blacklist removed successfully!');
    } catch (error) {
      console.error('Remove blacklist failed:', error);
    }
  };

  const handleMarkAsVip = async (id) => {
    try {
      await dispatch(markAsVip(id)).unwrap();

      // Refresh the visitor list
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));

      // Refresh statistics if available
      if (canViewStats) {
        dispatch(getVisitorStatistics());
      }

      console.log('✅ Visitor marked as VIP successfully!');
    } catch (error) {
      console.error('Mark as VIP failed:', error);
    }
  };

  const handleRemoveVipStatus = async (id) => {
    try {
      await dispatch(removeVipStatus(id)).unwrap();

      // Refresh the visitor list
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));

      // Refresh statistics if available
      if (canViewStats) {
        dispatch(getVisitorStatistics());
      }

      console.log('✅ VIP status removed successfully!');
    } catch (error) {
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

      // Refresh the visitor list to show updated data
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));

      // Refresh statistics if available
      if (canViewStats) {
        dispatch(getVisitorStatistics());
      }

      console.log('✅ Bulk delete completed successfully!');
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

      // Refresh the visitor list to show updated data
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));

      // Refresh statistics if available
      if (canViewStats) {
        dispatch(getVisitorStatistics());
      }

      console.log('✅ Bulk blacklist completed successfully!');
    } catch (error) {
      console.error('Bulk blacklist failed:', error);
    }
  };

  // Handle bulk VIP operations
  const handleBulkMarkVip = async () => {
    try {
      const vipPromises = selectedVisitors.map(id =>
        dispatch(markAsVip(id)).unwrap()
      );
      await Promise.all(vipPromises);
      dispatch(clearSelections());

      // Refresh the visitor list to show updated data
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));

      // Refresh statistics if available
      if (canViewStats) {
        dispatch(getVisitorStatistics());
      }

      console.log('✅ Bulk VIP marking completed successfully!');
    } catch (error) {
      console.error('Bulk mark VIP failed:', error);
    }
  };

  const handleBulkRemoveVip = async () => {
    try {
      const removeVipPromises = selectedVisitors.map(id =>
        dispatch(removeVipStatus(id)).unwrap()
      );
      await Promise.all(removeVipPromises);
      dispatch(clearSelections());

      // Refresh the visitor list to show updated data
      const params = { ...filters, pageIndex, pageSize };
      dispatch(getVisitors(params));

      // Refresh statistics if available
      if (canViewStats) {
        dispatch(getVisitorStatistics());
      }

      console.log('✅ Bulk VIP removal completed successfully!');
    } catch (error) {
      console.error('Bulk remove VIP failed:', error);
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

  // Handle create invitation for visitor
  const handleCreateInvitationForVisitor = (visitor) => {
    setSelectedVisitorForInvitation(visitor);
    setShowInvitationModal(true);
  };

  // Handle submit invitation
  const handleSubmitInvitation = async (invitationData) => {
    try {
      await dispatch(createInvitation({
        ...invitationData,
        visitorId: selectedVisitorForInvitation.id
      })).unwrap();

      setShowInvitationModal(false);
      setSelectedVisitorForInvitation(null);
      console.log('✅ Invitation created successfully!');
    } catch (error) {
      console.error('Failed to create invitation:', error);
      throw error;
    }
  };
  // Helper function to get visitor status icons and colors
  const getVisitorStatusBadge = (visitor) => {
    if (visitor.isBlacklisted) {
      return <Badge variant="danger" size="sm">{t('visitors:status.blacklisted')}</Badge>;
    }
    if (visitor.isVip) {
      return <Badge variant="warning" size="sm">{t('visitors:vipBadge')}</Badge>;
    }
    if (!visitor.isActive) {
      return <Badge variant="secondary" size="sm">{t('common:status.inactive')}</Badge>;
    }
    return <Badge variant="success" size="sm">{t('common:status.active')}</Badge>;
  };

  // Helper function to format visitor name with photo and title
  const formatVisitorName = (visitor) => {
    const fullName = `${visitor.fullName}`;
    const photoUrl = visitor.profilePhotoUrl;

    return (
      <div className="flex items-center gap-3">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${photoUrl ? 'hidden' : 'flex'}`}
          >
            <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        {/* Name and VIP badge */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {visitor.isVip && (
            <StarIconSolid className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" title={t('visitors:vipVisitorTitle')} />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{fullName}</div>
            {visitor.jobTitle && visitor.company && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {t('visitors:jobTitleAt', { jobTitle: visitor.jobTitle, company: visitor.company })}
              </div>
            )}
            {(!visitor.jobTitle && visitor.company) && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{visitor.company}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handle visitor actions
  const handleVisitorAction = (action, visitor) => {
    switch (action) {
      case 'view':
        navigate(VISITOR_ROUTES.getDetailRoute(visitor.id));
        break;
      case 'edit':
        dispatch(getVisitorById(visitor.id));

        dispatch(showEditModal(currentVisitor));
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
      header: t('visitors:table.columns.name'),
      sortable: true,
      render: (value, visitor) => formatVisitorName(visitor)
    },
    {
      key: 'contact',
      header: t('visitors:table.columns.email'),
      sortable: false,
      render: (value, visitor) => (
        <div className="space-y-1">
          {visitor.email && (
            <div className="flex items-center gap-1 text-sm">
              <EnvelopeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="truncate text-gray-900 dark:text-gray-100">{visitor.email}</span>
            </div>
          )}
          {visitor.phoneNumber && (
            <div className="flex items-center gap-1 text-sm">
              <PhoneIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-900 dark:text-gray-100">{visitor.phoneNumber}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'company',
      header: t('visitors:table.columns.company'),
      sortable: true,
      render: (value, visitor) => (
        <div className="space-y-1">
          {visitor.company && (
            <div className="font-medium text-gray-900 dark:text-gray-100">{visitor.company}</div>
          )}
          {visitor.jobTitle && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{visitor.jobTitle}</div>
          )}
        </div>
      )
    },
    {
      key: 'nationality',
      header: t('visitors:table.columns.nationality'),
      sortable: true,
      render: (value, visitor) => <span className="text-gray-900 dark:text-gray-100">{visitor.nationality || '-'}</span>
    },
    {
      key: 'status',
      header: t('common:labels.status'),
      sortable: true,
      render: (value, visitor) => (
        <Badge
          variant={visitor.isActive ? 'success' : 'secondary'}
          size="sm"
        >
          {visitor.isActive ? t('common:status.active') : t('common:status.inactive')}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('common:labels.actions'),
      width: '120px',
      sortable: false,
      render: (value, visitor) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVisitorAction('view', visitor)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            title={t('common:buttons.view')}
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {canUpdate && (
            <button
              onClick={() => handleVisitorAction('edit', visitor)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
              title={t('common:buttons.edit')}
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleVisitorAction('delete', visitor)}
              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('visitors:pageTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('visitors:pageSubtitle')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Advanced Search Toggle */}
          <Button
            variant="outline"
            onClick={() => dispatch(showAdvancedSearchModal())}
            className={isAdvancedSearchActive ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
          >
            {t('visitors:advancedSearch')}
          </Button>

          {canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              loading={createLoading}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              {t('visitors:createButton')}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t('visitors:stats.total')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{statistics.totalVisitors || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t('visitors:stats.active')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{statistics.activeVisitors || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <StarIconSolid className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t('visitors:stats.vip')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{statistics.vipVisitors || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t('visitors:stats.blacklisted')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{statistics.blacklistedVisitors || 0}</dd>
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
              placeholder={t('visitors:search.placeholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>


          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FunnelIcon className="w-5 h-5" />}
            >
              {t('common:buttons.filter')}
            </Button>

            {(filters.company || filters.isVip !== null || filters.isBlacklisted !== null ||
              filters.nationality || filters.securityClearance || filters.searchTerm || !filters.isActive) && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
              >
                {t('common:buttons.clearFilters')}
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
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('common:labels.company')}
                  </label>
                  <Input
                    type="text"
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                    placeholder={t('visitors:filters.filterByCompany')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('visitors:filters.vipStatus')}
                  </label>
                  <select
                    value={filters.isVip === null ? '' : filters.isVip.toString()}
                    onChange={(e) => handleFilterChange('isVip', e.target.value === '' ? null : e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                  >
                    <option value="">{t('visitors:filters.allVisitors')}</option>
                    <option value="true">{t('visitors:filters.vipOnly')}</option>
                    <option value="false">{t('visitors:filters.nonVipOnly')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('visitors:filters.blacklistStatus')}
                  </label>
                  <select
                    value={filters.isBlacklisted === null ? '' : filters.isBlacklisted.toString()}
                    onChange={(e) => handleFilterChange('isBlacklisted', e.target.value === '' ? null : e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                  >
                    <option value="">{t('visitors:filters.allVisitors')}</option>
                    <option value="true">{t('visitors:filters.blacklistedOnly')}</option>
                    <option value="false">{t('visitors:filters.notBlacklisted')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('visitors:filters.nationality')}
                  </label>
                  <Input
                    type="text"
                    value={filters.nationality}
                    onChange={(e) => handleFilterChange('nationality', e.target.value)}
                    placeholder={t('visitors:filters.filterByNationality')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('visitors:filters.securityClearance')}
                  </label>
                  <select
                    value={filters.securityClearance}
                    onChange={(e) => handleFilterChange('securityClearance', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                  >
                    <option value="">{t('visitors:filters.securityLevels.all')}</option>
                    <option value="Standard">{t('visitors:filters.securityLevels.standard')}</option>
                    <option value="Medium">{t('visitors:filters.securityLevels.medium')}</option>
                    <option value="High">{t('visitors:filters.securityLevels.high')}</option>
                    <option value="Top Secret">{t('visitors:filters.securityLevels.topSecret')}</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeInactive"
                    checked={!filters.isActive}
                    onChange={(e) => handleFilterChange('isActive', !e.target.checked)}
                    className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                  <label htmlFor="includeInactive" className="ms-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('visitors:filters.includeInactive')}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeDeleted"
                    checked={filters.includeDeleted}
                    onChange={(e) => handleFilterChange('includeDeleted', e.target.checked)}
                    className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                  <label htmlFor="includeDeleted" className="ms-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('visitors:filters.includeDeleted')}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('visitors:bulk.selected', { count: selectedCount })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                {t('common:buttons.clear')}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:gap-0">
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
                  <ExclamationTriangleIcon className="w-4 h-4 me-2" />
                  {t('visitors:actions.blacklist')}
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
                  <StarIcon className="w-4 h-4 me-2" />
                  {t('visitors:actions.markVip')}
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
                  <TrashIcon className="w-4 h-4 me-2" />
                  {t('common:buttons.delete')}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Visitors Display */}
      <VisitorGrid
        visitors={visitors}
        loading={listLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onEdit={canUpdate ? (visitor) => handleVisitorAction('edit', visitor) : undefined}
        onDelete={canDelete ? (visitor) => handleVisitorAction('delete', visitor) : undefined}
        onCreateInvitation={hasPermission('Invitation.Create') ? handleCreateInvitationForVisitor : undefined}
        // Bulk operations
        selectedVisitors={selectedVisitors}
        onSelectionChange={(newSelection) => dispatch(setSelectedVisitors(newSelection))}
        onBulkMarkVip={canMarkVip ? handleBulkMarkVip : undefined}
        onBulkRemoveVip={canRemoveVip ? handleBulkRemoveVip : undefined}
        onBulkBlacklist={canBlacklist ? handleBulkBlacklist : undefined}
        onBulkDelete={canDelete ? handleBulkDelete : undefined}
        bulkLoading={statusChangeLoading || deleteLoading}
        // Display options
        showActions={true}
        showViewToggle={true}
        showBulkActions={true}
        allowBulkSelection={true}
        emptyMessage={t('visitors:table.emptyMessage')}
        emptyDescription={t('visitors:table.emptyDescription')}
        className="mb-6"
      />

      {/* Pagination */}
      {total > 0 && (
        <Card>
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {t('visitors:pagination.showing', { start: pageRange.start, end: pageRange.end, total: pageRange.total })}
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1 text-sm w-full sm:w-auto transition-colors duration-200"
                >
                  <option value={10}>{t('visitors:pagination.perPage', { count: 10 })}</option>
                  <option value={20}>{t('visitors:pagination.perPage', { count: 20 })}</option>
                  <option value={50}>{t('visitors:pagination.perPage', { count: 50 })}</option>
                  <option value={100}>{t('visitors:pagination.perPage', { count: 100 })}</option>
                </select>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageIndex - 1)}
                  disabled={!hasPreviousPage}
                >
                  {t('common:buttons.previous')}
                </Button>

                <div className="hidden sm:flex items-center gap-1">
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
                        className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                          pageNum === pageIndex
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile: Show current page indicator */}
                <div className="sm:hidden flex items-center px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {t('visitors:pagination.pageOf', { current: pageIndex + 1, total: totalPages })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageIndex + 1)}
                  disabled={!hasNextPage}
                >
                  {t('common:buttons.next')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModalState}
        onClose={() => dispatch(hideCreateModal())}
        title={t('visitors:modals.createTitle')}
        size="full"
        hasUnsavedChanges={hasUnsavedCreateChanges}
        confirmCloseMessage={t('visitors:modals.confirmUnsavedCreate')}
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
          title={t('visitors:modals.editTitle')}
          size="full"
          hasUnsavedChanges={hasUnsavedEditChanges}
          confirmCloseMessage={t('visitors:modals.confirmUnsavedEdit')}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModalState}
        onClose={() => dispatch(hideDeleteModal())}
        onConfirm={() => handleDeleteVisitor(false)}
        title={t('visitors:modals.deleteTitle')}
        message={
          currentVisitor
            ? t('visitors:modals.deleteVisitorMessage', { name: `${currentVisitor.firstName} ${currentVisitor.lastName}` })
            : t('visitors:modals.deleteMessage')
        }
        confirmText={t('common:buttons.delete')}
        cancelText={t('common:buttons.cancel')}
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
        title={t('visitors:modals.blacklistTitle')}
        size="md"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentVisitor &&
                t('visitors:modals.blacklistAboutTo', { name: `${currentVisitor.firstName} ${currentVisitor.lastName}` })
              }
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('visitors:modals.blacklistReason')} <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <textarea
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              rows={3}
              placeholder={t('visitors:modals.blacklistReasonPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                dispatch(hideBlacklistModal());
                setBlacklistReason('');
              }}
              disabled={statusChangeLoading}
            >
              {t('common:buttons.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleBlacklistVisitor}
              loading={statusChangeLoading}
              disabled={!blacklistReason.trim()}
            >
              {t('visitors:modals.blacklistTitle')}
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
        title={t('visitors:bulk.deleteTitle')}
        message={t('visitors:bulk.deleteMessage', { count: selectedCount })}
        confirmText={t('visitors:bulk.deleteConfirm')}
        cancelText={t('common:buttons.cancel')}
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
        title={t('visitors:bulk.blacklistTitle')}
        size="md"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('visitors:bulk.blacklistMessage', { count: selectedCount })}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('visitors:modals.blacklistReason')} <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <textarea
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              rows={3}
              placeholder={t('visitors:modals.blacklistReasonPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkConfirm(false);
                setBulkAction('');
                setBlacklistReason('');
              }}
              disabled={statusChangeLoading}
            >
              {t('common:buttons.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleBulkBlacklist}
              loading={statusChangeLoading}
              disabled={!blacklistReason.trim()}
            >
              {t('visitors:bulk.blacklistConfirm')}
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
        title={t('visitors:actions.markVip')}
        message={t('visitors:bulk.vipMessage', { count: selectedCount })}
        confirmText={t('visitors:actions.markVip')}
        cancelText={t('common:buttons.cancel')}
        variant="warning"
        loading={statusChangeLoading}
      />

      {/* Advanced Search Modal */}
      <AdvancedSearchModal />

      {/* Create Invitation Modal */}
      {selectedVisitorForInvitation && (
        <Modal
          isOpen={showInvitationModal}
          onClose={() => {
            setShowInvitationModal(false);
            setSelectedVisitorForInvitation(null);
          }}
          title={t('visitors:modals.createInvitationTitle', { name: selectedVisitorForInvitation.fullName || `${selectedVisitorForInvitation.firstName} ${selectedVisitorForInvitation.lastName}` })}
          size="full"
        >
          <InvitationForm
            initialData={{
              visitorId: selectedVisitorForInvitation.id
            }}
            onSubmit={handleSubmitInvitation}
            onCancel={() => {
              setShowInvitationModal(false);
              setSelectedVisitorForInvitation(null);
            }}
            loading={false}
            isEdit={false}
          />
        </Modal>
      )}
    </div>
  );
};

export default VisitorsListPage;
