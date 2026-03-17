// src/components/invitation/InvitationsList/InvitationsList.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Redux imports
import {
  getInvitations,
  updateFilters,
  resetFilters,
  setPageIndex,
  setPageSize,
  showCreateModal,
  showEditModal,
  showDeleteModal,
  showDetailsModal,
  showApprovalModal,
  showQrModal,
  setSelectedInvitations,
  toggleInvitationSelection,
  clearSelections,
  clearError,
  approveInvitation,
  rejectInvitation,
  cancelInvitation,
  deleteInvitation,
  assignInvitationToReview
} from '../../../store/slices/invitationsSlice';

// Selectors
import {
  selectInvitationsList,
  selectInvitationsTotal,
  selectInvitationsPageIndex,
  selectInvitationsPageSize,
  selectInvitationsListLoading,
  selectInvitationsListError,
  selectInvitationsFilters,
  selectSelectedInvitations,
  selectInvitationStatistics,
  selectShowCreateModal,
  selectShowEditModal,
  selectShowDeleteModal,
  selectShowDetailsModal,
  selectShowApprovalModal,
  selectShowQrModal,
  selectCurrentInvitation,
  selectInvitationsApprovalLoading,
  selectInvitationsDeleteLoading,
  selectInvitationsPagination
} from '../../../store/selectors/invitationSelectors';
import { selectIsAdmin } from '../../../store/selectors/authSelectors';

// Components
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Table from '../../common/Table/Table';
import Badge from '../../common/Badge/Badge';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../common/Modal/Modal';
import Pagination from '../../common/Pagination/Pagination';
import ConfirmModal from '../../common/ConfirmModal/ConfirmModal';
import Tooltip from '../../common/Tooltip/Tooltip';

// Icons
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  QrCodeIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';

// Utils
import formatters from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';
import { InvitationStatus } from '../../../constants/invitationStatus';

/**
 * Comprehensive Invitations List Component
 * Displays invitations with filtering, pagination, and management actions
 * Supports bulk operations and approval workflow
 */
const InvitationsList = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['invitations', 'common']);

  // Redux selectors
  const invitations = useSelector(selectInvitationsList);
  const total = useSelector(selectInvitationsTotal);
  const pageIndex = useSelector(selectInvitationsPageIndex);
  const pageSize = useSelector(selectInvitationsPageSize);
  const loading = useSelector(selectInvitationsListLoading);
  const error = useSelector(selectInvitationsListError);
  const filters = useSelector(selectInvitationsFilters);
  const selectedInvitations = useSelector(selectSelectedInvitations);
  const statistics = useSelector(selectInvitationStatistics);
  const pagination = useSelector(selectInvitationsPagination);

  // Modal states
  const showCreateModalState = useSelector(selectShowCreateModal);
  const showEditModalState = useSelector(selectShowEditModal);
  const showDeleteModal = useSelector(selectShowDeleteModal);
  const showDetailsModalState = useSelector(selectShowDetailsModal);
  const showApprovalModal = useSelector(selectShowApprovalModal);
  const showQrModalState = useSelector(selectShowQrModal);
  const currentInvitation = useSelector(selectCurrentInvitation);

  // Loading states
  const approvalLoading = useSelector(selectInvitationsApprovalLoading);
  const deleteLoading = useSelector(selectInvitationsDeleteLoading);

  // Auth
  const isAdmin = useSelector(selectIsAdmin);

  // Local state
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Load invitations on mount and when filters change
  useEffect(() => {
    const params = {
      pageNumber: pageIndex + 1, // Convert to 1-based for API
      pageSize,
      ...filters
    };
    dispatch(getInvitations(params));
  }, [dispatch, pageIndex, pageSize, filters]);

  // Filter handlers
  const handleFilterChange = (field, value) => {
    dispatch(updateFilters({ [field]: value }));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  // Pagination handlers
  const handlePageChange = (newPageIndex) => {
    dispatch(setPageIndex(newPageIndex));
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(newPageSize));
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = invitations.map(invitation => invitation.id);
      dispatch(setSelectedInvitations(allIds));
    } else {
      dispatch(clearSelections());
    }
  };

  const handleSelectInvitation = (id) => {
    dispatch(toggleInvitationSelection(id));
  };

  // Table handlers for consistency with Table component expectations
  const handleSelectionChange = (selectedIds) => {
    dispatch(setSelectedInvitations(selectedIds));
  };

  const handleSort = (sortBy, sortDirection) => {
    dispatch(updateFilters({ 
      sortBy, 
      sortDirection,
      pageIndex: 0 // Reset to first page when sorting
    }));
  };

  // Action handlers
  const handleCreateInvitation = () => {
    dispatch(showCreateModal());
  };

  const handleEditInvitation = (invitation) => {
    dispatch(showEditModal(invitation));
  };

  const handleDeleteInvitation = (invitation) => {
    dispatch(showDeleteModal(invitation));
  };

  const handleViewDetails = (invitation) => {
    dispatch(showDetailsModal(invitation));
  };

  const handleApprovalAction = (invitation) => {
    dispatch(showApprovalModal(invitation));
  };

  const handleShowQr = (invitation) => {
    dispatch(showQrModal(invitation));
  };

  const handleAssignToReview = async (invitation) => {
    try {
      await dispatch(assignInvitationToReview({ id: invitation.id })).unwrap();
    } catch (err) {
      console.error('Assign to review failed:', err);
    }
  };

  const handleBulkAction = (action) => {
    setBulkAction(action);
    setShowBulkConfirm(true);
  };

  const handleConfirmBulkAction = async () => {
    if (selectedInvitations.length === 0) return;

    try {
      switch (bulkAction) {
        case 'approve':
          for (const id of selectedInvitations) {
            await dispatch(approveInvitation({ id, comments: 'Bulk approval' })).unwrap();
          }
          break;
        case 'reject':
          for (const id of selectedInvitations) {
            await dispatch(rejectInvitation({ id, reason: 'Bulk rejection' })).unwrap();
          }
          break;
        case 'cancel':
          for (const id of selectedInvitations) {
            await dispatch(cancelInvitation({ id, reason: 'Bulk cancellation' })).unwrap();
          }
          break;
        case 'delete':
          for (const id of selectedInvitations) {
            await dispatch(deleteInvitation({ id, permanentDelete: false })).unwrap();
          }
          break;
        default:
          break;
      }

      // Clear selections and refresh data
      dispatch(clearSelections());
      setShowBulkConfirm(false);
      setBulkAction('');
      
      // Refresh the list
      const params = {
        pageNumber: pageIndex + 1,
        pageSize,
        ...filters
      };
      dispatch(getInvitations(params));

    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  // Status badge helper — status values from API are camelCase strings
  const getStatusBadge = (invitation) => {
    const statusLabelKeys = {
      [InvitationStatus.Draft]: 'common:status.draft',
      [InvitationStatus.Submitted]: 'common:status.submitted',
      [InvitationStatus.UnderReview]: 'common:status.underReview',
      [InvitationStatus.Approved]: 'common:status.approved',
      [InvitationStatus.Rejected]: 'common:status.rejected',
      [InvitationStatus.Cancelled]: 'common:status.cancelled',
      [InvitationStatus.Expired]: 'common:status.expired',
      [InvitationStatus.Active]: 'common:status.active',
      [InvitationStatus.Completed]: 'common:status.completed'
    };

    const statusConfig = {
      [InvitationStatus.Draft]: { variant: 'secondary', icon: DocumentDuplicateIcon },
      [InvitationStatus.Submitted]: { variant: 'info', icon: ClockIconSolid },
      [InvitationStatus.UnderReview]: { variant: 'warning', icon: ExclamationTriangleIconSolid },
      [InvitationStatus.Approved]: { variant: 'success', icon: CheckCircleIcon },
      [InvitationStatus.Rejected]: { variant: 'danger', icon: XCircleIcon },
      [InvitationStatus.Cancelled]: { variant: 'secondary', icon: XMarkIcon },
      [InvitationStatus.Expired]: { variant: 'secondary', icon: ClockIcon },
      [InvitationStatus.Active]: { variant: 'primary', icon: CheckIcon },
      [InvitationStatus.Completed]: { variant: 'success', icon: CheckCircleIcon },
    };

    const config = statusConfig[invitation.status] || statusConfig[InvitationStatus.Draft];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} size="sm" className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        <span>{t(statusLabelKeys[invitation.status] || 'common:status.draft')}</span>
      </Badge>
    );
  };

  // Type badge helper
  const getTypeBadge = (invitation) => {
    const typeConfig = {
      Single: { variant: 'info', text: t('type.single') },
      Group: { variant: 'primary', text: t('type.group') },
      Recurring: { variant: 'warning', text: t('type.recurring') },
      WalkIn: { variant: 'secondary', text: t('type.walkIn') },
      BulkImport: { variant: 'info', text: t('type.bulk') }
    };

    const config = typeConfig[invitation.type] || typeConfig.Single;
    return <Badge variant={config.variant} size="sm">{config.text}</Badge>;
  };

  // Visitor display helper
  const formatVisitorInfo = (invitation) => {
    const visitor = invitation.visitor;
    if (!visitor) return t('unknownVisitor');

    return (
      <div className="flex items-center gap-2">
        <UserIcon className="w-4 h-4 text-gray-400" />
        <div>
          <div className="font-medium text-gray-900">
            {visitor.firstName} {visitor.lastName}
          </div>
          <div className="text-sm text-gray-500">{visitor.email}</div>
          {visitor.company && (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <BuildingOfficeIcon className="w-3 h-3" />
              <span>{visitor.company}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Host display helper
  const formatHostInfo = (invitation) => {
    const host = invitation.host;
    if (!host) return t('unknownHost');

    return (
      <div className="text-sm">
        <div className="font-medium text-gray-900">
          {host.firstName} {host.lastName}
        </div>
        <div className="text-gray-500">{host.email}</div>
      </div>
    );
  };

  // Visit time display helper
  const formatVisitTime = (invitation) => {
    const start = formatters.formatDateTime(invitation.scheduledStartTime);
    const end = formatters.formatDateTime(invitation.scheduledEndTime);
    const duration = invitation.visitDurationHours;

    return (
      <div className="text-sm">
        <div className="flex items-center gap-1 text-gray-900">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span>{formatters.formatDate(invitation.scheduledStartTime)}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <span>{formatters.formatTime(invitation.scheduledStartTime)} - {formatters.formatTime(invitation.scheduledEndTime)}</span>
        </div>
        {duration && (
          <div className="text-gray-500">
            {t('details.fields.durationHours', { hours: duration })}
          </div>
        )}
      </div>
    );
  };

  // Location display helper
  const formatLocationInfo = (invitation) => {
    const location = invitation.location;
    if (!location) return t('noLocation');

    return (
      <div className="text-sm">
        <div className="font-medium text-gray-900">{location.name}</div>
        {location.description && (
          <div className="text-gray-500">{location.description}</div>
        )}
      </div>
    );
  };

  // Table columns definition
  const columns = [
    {
      key: 'select',
      header: '',
      width: '50px',
      render: (_, invitation) => (
        <input
          type="checkbox"
          checked={selectedInvitations.includes(invitation.id)}
          onChange={() => handleSelectInvitation(invitation.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ),
      headerRender: () => (
        <input
          type="checkbox"
          checked={invitations.length > 0 && selectedInvitations.length === invitations.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ),
      sortable: false
    },
    {
      key: 'invitation',
      header: t('table.columns.invitation'),
      sortable: true,
      className: 'min-w-[250px]',
      render: (_, invitation) => {
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">#{invitation.invitationNumber}</span>
              {getTypeBadge(invitation)}
            </div>
            <div className="text-sm font-medium text-gray-700">{invitation.subject}</div>
            {invitation.message && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {invitation.message}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'visitor',
      header: t('table.columns.visitor'),
      sortable: true,
      className: 'min-w-[200px]',
      render: (_, invitation) => formatVisitorInfo(invitation)
    },
    {
      key: 'host',
      header: t('table.columns.host'),
      sortable: true,
      className: 'min-w-[150px]',
      render: (_, invitation) => formatHostInfo(invitation)
    },
    {
      key: 'schedule',
      header: t('table.columns.schedule'),
      sortable: true,
      className: 'min-w-[180px]',
      render: (_, invitation) => formatVisitTime(invitation)
    },
    {
      key: 'location',
      header: t('table.columns.location'),
      sortable: true,
      className: 'min-w-[150px]',
      render: (_, invitation) => formatLocationInfo(invitation)
    },
    {
      key: 'status',
      header: t('table.columns.status'),
      sortable: true,
      className: 'min-w-[120px]',
      render: (_, invitation) => getStatusBadge(invitation)
    },
    {
      key: 'actions',
      header: t('table.columns.actions'),
      sortable: false,
      className: 'min-w-[120px]',
      render: (_, invitation) => {
        return (
          <div className="flex items-center gap-1">
            <Tooltip content={t('tooltips.viewDetails')}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetails(invitation)}
                icon={<EyeIcon className="w-4 h-4" />}
              />
            </Tooltip>

            {invitation.canBeModified && (
              <Tooltip content={t('actions.edit')}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditInvitation(invitation)}
                  icon={<PencilIcon className="w-4 h-4" />}
                />
              </Tooltip>
            )}

            {isAdmin && invitation.status === InvitationStatus.Submitted && (
              <Tooltip content={t('actions.assignToReview')}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAssignToReview(invitation)}
                  disabled={approvalLoading}
                  icon={<ClockIcon className="w-4 h-4" />}
                />
              </Tooltip>
            )}

            {(invitation.status === InvitationStatus.Submitted || invitation.status === InvitationStatus.UnderReview) && (
              <Tooltip content={t('actions.approveReject')}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApprovalAction(invitation)}
                  icon={<CheckIcon className="w-4 h-4" />}
                />
              </Tooltip>
            )}

            {invitation.isApproved && (
              <Tooltip content={t('actions.qr')}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShowQr(invitation)}
                  icon={<QrCodeIcon className="w-4 h-4" />}
                />
              </Tooltip>
            )}

            {invitation.canBeCancelled && (
              <Tooltip content={t('actions.delete')}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteInvitation(invitation)}
                  className="text-red-600 hover:text-red-800"
                  icon={<TrashIcon className="w-4 h-4" />}
                />
              </Tooltip>
            )}
          </div>
        );
      }
    }
  ];

  const bulkActionLabel = bulkAction
    ? t(`actions.${bulkAction}`, { defaultValue: bulkAction })
    : '';
  // Main render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('pageTitle')}</h1>
          <p className="text-gray-600">{t('pageSubtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={<FunnelIcon className="w-4 h-4" />}
          >
            {t('filters.title')}
          </Button>
          <Button
            onClick={handleCreateInvitation}
            icon={<PlusIcon className="w-4 h-4" />}
          >
            {t('createButton')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <DocumentDuplicateIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-md">
                <ClockIconSolid className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.pending')}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.pendingApproval}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-md">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.approved')}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.byStatus.approved}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.activeToday')}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.activeToday}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-md">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.rejected')}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.byStatus.rejected}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">
            {extractErrorMessage(error)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(clearError())}
            className="mt-2 text-red-600"
          >
            {t('common:buttons.dismiss')}
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label={t('common:buttons.search')}
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder={t('search.placeholder')}
                  leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('filters.status')}
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('filters.allStatuses')}</option>
                    <option value={InvitationStatus.Draft}>{t('common:status.draft')}</option>
                    <option value={InvitationStatus.Submitted}>{t('common:status.submitted')}</option>
                    <option value={InvitationStatus.UnderReview}>{t('common:status.underReview')}</option>
                    <option value={InvitationStatus.Approved}>{t('common:status.approved')}</option>
                    <option value={InvitationStatus.Rejected}>{t('common:status.rejected')}</option>
                    <option value={InvitationStatus.Cancelled}>{t('common:status.cancelled')}</option>
                    <option value={InvitationStatus.Expired}>{t('common:status.expired')}</option>
                    <option value={InvitationStatus.Active}>{t('common:status.active')}</option>
                    <option value={InvitationStatus.Completed}>{t('common:status.completed')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('filters.type')}
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('filters.allTypes')}</option>
                    <option value="Single">{t('type.single')}</option>
                    <option value="Group">{t('type.group')}</option>
                    <option value="Recurring">{t('type.recurring')}</option>
                    <option value="WalkIn">{t('type.walkIn')}</option>
                    <option value="BulkImport">{t('type.bulk')}</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    icon={<ArrowPathIcon className="w-4 h-4" />}
                  >
                    {t('actions.reset')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label={t('filters.startDate')}
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />

                <Input
                  label={t('filters.endDate')}
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.pendingApprovalsOnly}
                    onChange={(e) => handleFilterChange('pendingApprovalsOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{t('filters.pendingOnly')}</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.activeOnly}
                    onChange={(e) => handleFilterChange('activeOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{t('filters.activeOnly')}</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.expiredOnly}
                    onChange={(e) => handleFilterChange('expiredOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{t('filters.expiredOnly')}</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.includeDeleted}
                    onChange={(e) => handleFilterChange('includeDeleted', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{t('filters.includeDeleted')}</span>
                </label>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions */}
      {selectedInvitations.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {selectedInvitations.length === 1
                  ? t('bulk.selected', { count: selectedInvitations.length })
                  : t('bulk.selected_plural', { count: selectedInvitations.length })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('approve')}
                icon={<CheckIcon className="w-4 h-4" />}
              >
                {t('bulk.approve')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('reject')}
                icon={<XMarkIcon className="w-4 h-4" />}
              >
                {t('bulk.reject')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('cancel')}
                icon={<XMarkIcon className="w-4 h-4" />}
              >
                {t('bulk.cancel')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 border-red-300 hover:bg-red-50"
                icon={<TrashIcon className="w-4 h-4" />}
              >
                {t('bulk.delete')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                {t('bulk.clearSelection')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : invitations.length > 0 ? (
          <>
            <Table
              data={invitations}
              columns={columns}
              loading={loading}
              selectable={true}
              selectedRows={selectedInvitations}
              onSelectionChange={handleSelectionChange}
              onSort={handleSort}
              sortBy={filters.sortBy}
              sortDirection={filters.sortDirection}
              emptyMessage={t('table.emptyMessage')}
              hover
              bordered
              className="invitations-table"
            />
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.pageIndex}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalItems={pagination.total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showInfo={true}
                showPageSizeSelector={true}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('empty.noInvitations')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('empty.getStarted')}
            </p>
            <div className="mt-6">
              <Button
                onClick={handleCreateInvitation}
                icon={<PlusIcon className="w-5 h-5" />}
              >
                {t('createButton')}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Bulk Action Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        onClose={() => {
          setShowBulkConfirm(false);
          setBulkAction('');
        }}
        onConfirm={handleConfirmBulkAction}
        title={t('confirmBulk.title', { action: bulkActionLabel })}
        message={selectedInvitations.length === 1
          ? t('confirmBulk.message', { action: bulkActionLabel, count: selectedInvitations.length })
          : t('confirmBulk.message_plural', { action: bulkActionLabel, count: selectedInvitations.length })}
        confirmText={t(`actions.${bulkAction}`, { defaultValue: bulkAction })}
        variant={bulkAction === 'delete' ? 'danger' : 'primary'}
        loading={approvalLoading || deleteLoading}
      />
    </div>
  );
};

export default InvitationsList;
