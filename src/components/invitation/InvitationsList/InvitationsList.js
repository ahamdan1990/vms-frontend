// src/components/invitation/InvitationsList/InvitationsList.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

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
  deleteInvitation
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

/**
 * Comprehensive Invitations List Component
 * Displays invitations with filtering, pagination, and management actions
 * Supports bulk operations and approval workflow
 */
const InvitationsList = () => {
  const dispatch = useDispatch();

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
  const showEditModal = useSelector(selectShowEditModal);
  const showDeleteModal = useSelector(selectShowDeleteModal);
  const showDetailsModal = useSelector(selectShowDetailsModal);
  const showApprovalModal = useSelector(selectShowApprovalModal);
  const showQrModal = useSelector(selectShowQrModal);
  const currentInvitation = useSelector(selectCurrentInvitation);

  // Loading states
  const approvalLoading = useSelector(selectInvitationsApprovalLoading);
  const deleteLoading = useSelector(selectInvitationsDeleteLoading);

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

  // Status badge helper
  const getStatusBadge = (invitation) => {
    const statusConfig = {
      Draft: { variant: 'secondary', icon: DocumentDuplicateIcon },
      Submitted: { variant: 'info', icon: ClockIconSolid },
      UnderReview: { variant: 'warning', icon: ExclamationTriangleIconSolid },
      Approved: { variant: 'success', icon: CheckCircleIcon },
      Rejected: { variant: 'danger', icon: XCircleIcon },
      Cancelled: { variant: 'secondary', icon: XMarkIcon },
      Expired: { variant: 'secondary', icon: ClockIcon },
      Active: { variant: 'primary', icon: CheckIcon },
      Completed: { variant: 'success', icon: CheckCircleIcon }
    };

    const config = statusConfig[invitation.status] || statusConfig.Draft;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} size="sm" className="flex items-center space-x-1">
        <IconComponent className="w-3 h-3" />
        <span>{invitation.status}</span>
      </Badge>
    );
  };

  // Type badge helper
  const getTypeBadge = (invitation) => {
    const typeConfig = {
      Single: { variant: 'info', text: 'Single' },
      Group: { variant: 'primary', text: 'Group' },
      Recurring: { variant: 'warning', text: 'Recurring' },
      WalkIn: { variant: 'secondary', text: 'Walk-in' },
      BulkImport: { variant: 'info', text: 'Bulk' }
    };

    const config = typeConfig[invitation.type] || typeConfig.Single;
    return <Badge variant={config.variant} size="sm">{config.text}</Badge>;
  };

  // Visitor display helper
  const formatVisitorInfo = (invitation) => {
    const visitor = invitation.visitor;
    if (!visitor) return 'Unknown Visitor';

    return (
      <div className="flex items-center space-x-2">
        <UserIcon className="w-4 h-4 text-gray-400" />
        <div>
          <div className="font-medium text-gray-900">
            {visitor.firstName} {visitor.lastName}
          </div>
          <div className="text-sm text-gray-500">{visitor.email}</div>
          {visitor.company && (
            <div className="text-sm text-gray-500 flex items-center space-x-1">
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
    if (!host) return 'Unknown Host';

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
        <div className="flex items-center space-x-1 text-gray-900">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span>{formatters.formatDate(invitation.scheduledStartTime)}</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-600">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <span>{formatters.formatTime(invitation.scheduledStartTime)} - {formatters.formatTime(invitation.scheduledEndTime)}</span>
        </div>
        {duration && (
          <div className="text-gray-500">
            Duration: {duration}h
          </div>
        )}
      </div>
    );
  };

  // Location display helper
  const formatLocationInfo = (invitation) => {
    const location = invitation.location;
    if (!location) return 'No location specified';

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
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedInvitations.includes(row.original.id)}
          onChange={() => handleSelectInvitation(row.original.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ),
      enableSorting: false,
      enableResizing: false,
      size: 50
    },
    {
      id: 'invitation',
      header: 'Invitation',
      cell: ({ row }) => {
        const invitation = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
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
      id: 'visitor',
      header: 'Visitor',
      cell: ({ row }) => formatVisitorInfo(row.original)
    },
    {
      id: 'host',
      header: 'Host',
      cell: ({ row }) => formatHostInfo(row.original)
    },
    {
      id: 'schedule',
      header: 'Schedule',
      cell: ({ row }) => formatVisitTime(row.original)
    },
    {
      id: 'location',
      header: 'Location',
      cell: ({ row }) => formatLocationInfo(row.original)
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original)
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const invitation = row.original;
        return (
          <div className="flex items-center space-x-1">
            <Tooltip content="View Details">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetails(invitation)}
                icon={<EyeIcon className="w-4 h-4" />}
              />
            </Tooltip>

            {invitation.canBeModified && (
              <Tooltip content="Edit">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditInvitation(invitation)}
                  icon={<PencilIcon className="w-4 h-4" />}
                />
              </Tooltip>
            )}

            {(invitation.status === 'Submitted' || invitation.status === 'UnderReview') && (
              <Tooltip content="Approve/Reject">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApprovalAction(invitation)}
                  icon={<CheckIcon className="w-4 h-4" />}
                />
              </Tooltip>
            )}

            {invitation.isApproved && (
              <Tooltip content="QR Code">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShowQr(invitation)}
                  icon={<QrCodeIcon className="w-4 h-4" />}
                />
              </Tooltip>
            )}

            {invitation.canBeCancelled && (
              <Tooltip content="Delete">
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
      },
      enableSorting: false,
      size: 200
    }
  ];
  // Main render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
          <p className="text-gray-600">Manage visitor invitations and approvals</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={<FunnelIcon className="w-4 h-4" />}
          >
            Filters
          </Button>
          <Button
            onClick={handleCreateInvitation}
            icon={<PlusIcon className="w-4 h-4" />}
          >
            Create Invitation
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <DocumentDuplicateIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-md">
                <ClockIconSolid className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.pendingApproval}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-md">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.byStatus.approved}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.activeToday}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-md">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
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
            Dismiss
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
                  label="Search"
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Search invitations..."
                  icon={<MagnifyingGlassIcon className="w-4 h-4" />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="UnderReview">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Expired">Expired</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="Single">Single</option>
                    <option value="Group">Group</option>
                    <option value="Recurring">Recurring</option>
                    <option value="WalkIn">Walk-in</option>
                    <option value="BulkImport">Bulk Import</option>
                  </select>
                </div>

                <div className="flex items-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    icon={<ArrowPathIcon className="w-4 h-4" />}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />

                <Input
                  label="End Date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.pendingApprovalsOnly}
                    onChange={(e) => handleFilterChange('pendingApprovalsOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Pending Approvals Only</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.activeOnly}
                    onChange={(e) => handleFilterChange('activeOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Active Only</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.expiredOnly}
                    onChange={(e) => handleFilterChange('expiredOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Expired Only</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.includeDeleted}
                    onChange={(e) => handleFilterChange('includeDeleted', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Include Deleted</span>
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
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                {selectedInvitations.length} invitation{selectedInvitations.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('approve')}
                icon={<CheckIcon className="w-4 h-4" />}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('reject')}
                icon={<XMarkIcon className="w-4 h-4" />}
              >
                Reject
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('cancel')}
                icon={<XMarkIcon className="w-4 h-4" />}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 border-red-300 hover:bg-red-50"
                icon={<TrashIcon className="w-4 h-4" />}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                Clear Selection
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
              emptyMessage="No invitations found"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invitations</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new invitation.
            </p>
            <div className="mt-6">
              <Button
                onClick={handleCreateInvitation}
                icon={<PlusIcon className="w-5 h-5" />}
              >
                Create Invitation
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
        title={`${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} Invitations`}
        message={`Are you sure you want to ${bulkAction} ${selectedInvitations.length} selected invitation${selectedInvitations.length !== 1 ? 's' : ''}?`}
        confirmText={bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)}
        variant={bulkAction === 'delete' ? 'danger' : 'primary'}
        loading={approvalLoading || deleteLoading}
      />
    </div>
  );
};

export default InvitationsList;