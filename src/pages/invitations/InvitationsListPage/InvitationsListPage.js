// src/pages/invitations/InvitationsListPage/InvitationsListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Services
import invitationService from '../../../services/invitationService';

// Redux imports
import {
  getInvitations,
  createInvitation,
  updateInvitation,
  deleteInvitation,
  hideCreateModal,
  hideEditModal,
  hideDeleteModal,
  hideDetailsModal,
  hideApprovalModal,
  hideQrModal,
  clearError,
  getQrCode,
  getInvitationQrCodeImage,
  approveInvitation,
  rejectInvitation,
  updateFilters,
  resetFilters,
  setPageIndex,
  setPageSize,
  setSelectedInvitations,
  toggleInvitationSelection,
  clearSelections,
  showCreateModal,
  showEditModal,
  showDeleteModal,
  showDetailsModal,
  showApprovalModal,
  showQrModal,
  getInvitationStatistics
} from '../../../store/slices/invitationsSlice';

// Also need to load supporting data
import { getVisitors } from '../../../store/slices/visitorsSlice';
import { getLocations } from '../../../store/slices/locationsSlice';
import { getVisitPurposes } from '../../../store/slices/visitPurposesSlice';

// Selectors
import {
  selectInvitationsList,
  selectInvitationsTotal,
  selectInvitationsPageIndex,
  selectInvitationsPageSize,
  selectInvitationsLoading,
  selectInvitationsError,
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
  selectInvitationsCreateLoading,
  selectInvitationsCreateError,
  selectInvitationsUpdateLoading,
  selectInvitationsUpdateError,
  selectInvitationsDeleteLoading,
  selectInvitationsDeleteError,
  selectInvitationsApprovalLoading,
  selectInvitationsApprovalError,
  selectQrCodeData,
  selectInvitationsQrLoading,
  selectInvitationsQrError,
  selectQrCodeImage
} from '../../../store/selectors/invitationSelectors';

// Components
import InvitationForm from '../../../components/invitation/InvitationForm/InvitationForm';
import Modal from '../../../components/common/Modal/Modal';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Table from '../../../components/common/Table/Table';
import Badge from '../../../components/common/Badge/Badge';
import Card from '../../../components/common/Card/Card';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Pagination from '../../../components/common/Pagination/Pagination';
import Tooltip from '../../../components/common/Tooltip/Tooltip';

// Icons
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  QrCodeIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  StarIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon
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
 * Main Invitations List Page
 * Coordinates all invitation management functionality including:
 * - List display with filtering and pagination
 * - Create/Edit forms in modals
 * - Approval workflow with both bulk and individual actions
 * - QR code generation
 * - Deletion management
 */
const InvitationsListPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Invitations data
  const invitations = useSelector(selectInvitationsList);
  const totalInvitations = useSelector(selectInvitationsTotal);
  const pageIndex = useSelector(selectInvitationsPageIndex);
  const pageSize = useSelector(selectInvitationsPageSize);
  const loading = useSelector(selectInvitationsLoading);
  const error = useSelector(selectInvitationsError);
  const filters = useSelector(selectInvitationsFilters);
  const selectedInvitations = useSelector(selectSelectedInvitations);
  const statistics = useSelector(selectInvitationStatistics);

  // Modal states
  const showCreateModalState = useSelector(selectShowCreateModal);
  const showEditModalState = useSelector(selectShowEditModal);
  const showDeleteModalState = useSelector(selectShowDeleteModal);
  const showDetailsModalState = useSelector(selectShowDetailsModal);
  const showApprovalModalState = useSelector(selectShowApprovalModal);
  const showQrModalState = useSelector(selectShowQrModal);
  const currentInvitation = useSelector(selectCurrentInvitation);

  // Loading and error states
  const createLoading = useSelector(selectInvitationsCreateLoading);
  const createError = useSelector(selectInvitationsCreateError);
  const updateLoading = useSelector(selectInvitationsUpdateLoading);
  const updateError = useSelector(selectInvitationsUpdateError);
  const deleteLoading = useSelector(selectInvitationsDeleteLoading);
  const deleteError = useSelector(selectInvitationsDeleteError);
  const approvalLoading = useSelector(selectInvitationsApprovalLoading);
  const approvalError = useSelector(selectInvitationsApprovalError);
  const qrCodeImage = useSelector(selectQrCodeImage);
  const qrCodeData = useSelector(selectQrCodeData);
  const qrLoading = useSelector(selectInvitationsQrLoading);
  const qrError = useSelector(selectInvitationsQrError);

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  
  // Approval modal state
  const [approvalComments, setApprovalComments] = useState('');
  const [approvalReason, setApprovalReason] = useState('');
  const [approvalAction, setApprovalAction] = useState('approve'); // 'approve' or 'reject'
  
  // QR Email state
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Pre-selected data from calendar navigation
  const [preselectedData, setPreselectedData] = useState(null);

  // Load initial data on mount
  useEffect(() => {
    const params = {
      pageNumber: pageIndex + 1, // Convert to 1-based for API
      pageSize,
      ...filters
    };
    dispatch(getInvitations(params));
    dispatch(getVisitors({ pageSize: 1000, isActive: true }));
    dispatch(getLocations({ pageSize: 1000, isActive: true }));
    dispatch(getVisitPurposes({ pageSize: 1000, isActive: true }));
  }, [dispatch, pageIndex, pageSize, filters]);

  // Load statistics
  useEffect(() => {
    dispatch(getInvitationStatistics());
  }, [dispatch]);

  // Handle search input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.searchTerm) {
        dispatch(updateFilters({ searchTerm: searchInput }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.searchTerm, dispatch]);
  // Load QR code when QR modal opens
  useEffect(() => {
    if (showQrModalState && currentInvitation && !qrCodeData) {
      console.log(currentInvitation)
      dispatch(getQrCode(currentInvitation.id));
      dispatch(getInvitationQrCodeImage({ id: currentInvitation.id }));
    }
  }, [showQrModalState, currentInvitation, qrCodeData, dispatch]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle navigation from calendar with pre-selected data
  useEffect(() => {
    if (location.state?.preselectedTimeSlotId || location.state?.preselectedDate || location.state?.preselectedLocationId) {
      // Store the pre-selected data
      setPreselectedData({
        timeSlotId: location.state.preselectedTimeSlotId,
        scheduledDate: location.state.preselectedDate,
        locationId: location.state.preselectedLocationId
      });

      // Open the create modal
      dispatch(showCreateModal());

      // Clear the navigation state to prevent reopening the modal on re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, dispatch, navigate, location.pathname]);

  // Action handlers
  const handleCreateInvitation = async (invitationData) => {
    try {
      await dispatch(createInvitation(invitationData)).unwrap();
      // Modal will be closed by the reducer

      // Refresh the invitations list and statistics
      const params = {
        pageNumber: pageIndex + 1,
        pageSize,
        ...filters
      };
      dispatch(getInvitations(params));
      dispatch(getInvitationStatistics());
    } catch (error) {
      console.error('Create invitation failed:', error);
    }
  };

  const handleUpdateInvitation = async (invitationData) => {
    try {
      await dispatch(updateInvitation({
        id: currentInvitation.id,
        invitationData
      })).unwrap();
      // Modal will be closed by the reducer

      // Refresh the invitations list
      const params = {
        pageNumber: pageIndex + 1,
        pageSize,
        ...filters
      };
      dispatch(getInvitations(params));
    } catch (error) {
      console.error('Update invitation failed:', error);
    }
  };

  const handleDeleteInvitation = async () => {
    try {
      await dispatch(deleteInvitation({
        id: currentInvitation.id,
        permanentDelete: false
      })).unwrap();
      // Modal will be closed by the reducer
      dispatch(getInvitations());
    } catch (error) {
      console.error('Delete invitation failed:', error);
    }
  };

  const handleApproveInvitation = async (invitationId, comments = '') => {
    try {
      await dispatch(approveInvitation({
        id: invitationId,
        comments
      })).unwrap();
      // Refresh the list and statistics after approval
      const params = {
        pageNumber: pageIndex + 1,
        pageSize,
        ...filters
      };
      dispatch(getInvitations(params));
      dispatch(getInvitationStatistics());
    } catch (error) {
      console.error('Approve invitation failed:', error);
    }
  };

  const handleRejectInvitation = async (invitationId, reason) => {
    try {
      await dispatch(rejectInvitation({
        id: invitationId,
        reason
      })).unwrap();
      // Refresh the list and statistics after rejection
      const params = {
        pageNumber: pageIndex + 1,
        pageSize,
        ...filters
      };
      dispatch(getInvitations(params));
      dispatch(getInvitationStatistics());
    } catch (error) {
      console.error('Reject invitation failed:', error);
    }
  };

  const handleApprove = async (comments = '') => {
    try {
      await dispatch(approveInvitation({
        id: currentInvitation.id,
        comments
      })).unwrap();
      // Modal will be closed by the reducer

      // Refresh the invitations list
      const params = {
        pageNumber: pageIndex + 1,
        pageSize,
        ...filters
      };
      dispatch(getInvitations(params));
    } catch (error) {
      console.error('Approve invitation failed:', error);
    }
  };

  const handleReject = async (reason) => {
    try {
      await dispatch(rejectInvitation({
        id: currentInvitation.id,
        reason
      })).unwrap();
      // Modal will be closed by the reducer

      // Refresh the invitations list
      const params = {
        pageNumber: pageIndex + 1,
        pageSize,
        ...filters
      };
      dispatch(getInvitations(params));
    } catch (error) {
      console.error('Reject invitation failed:', error);
    }
  };

  // Filter handlers
  const handleFilterChange = (filterName, value) => {
    dispatch(updateFilters({ [filterName]: value }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
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
  const handleSelectionChange = (selectedIds) => {
    dispatch(setSelectedInvitations(selectedIds));
  };

  // Bulk action handlers
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

      // Refresh the list and statistics
      const params = {
        pageNumber: pageIndex + 1,
        pageSize,
        ...filters
      };
      dispatch(getInvitations(params));
      dispatch(getInvitationStatistics());

    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  // Modal close handlers
  const handleCloseCreateModal = () => {
    dispatch(hideCreateModal());
    dispatch(clearError());
    setPreselectedData(null); // Clear pre-selected data
  };

  const handleCloseEditModal = () => {
    dispatch(hideEditModal());
    dispatch(clearError());
  };

  const handleCloseDeleteModal = () => {
    dispatch(hideDeleteModal());
    dispatch(clearError());
  };

  const handleCloseDetailsModal = () => {
    dispatch(hideDetailsModal());
  };

  const handleCloseApprovalModal = () => {
    dispatch(hideApprovalModal());
    dispatch(clearError());
  };

  const handleCloseQrModal = () => {
    dispatch(hideQrModal());
    setEmailError(null);
    setEmailSuccess(false);
  };

  // Handle QR code email sending
  const handleSendQrEmail = async () => {
    if (!currentInvitation?.id) return;
    
    try {
      setEmailSending(true);
      setEmailError(null);
      setEmailSuccess(false);

      await invitationService.sendQrCodeEmail(currentInvitation.id, {
        customMessage: `Please use this QR code for your visit on ${formatters.formatDate(currentInvitation.scheduledStartTime)}.`,
        includeQrImage: true
      });

      setEmailSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (error) {
      setEmailError(extractErrorMessage(error));
    } finally {
      setEmailSending(false);
    }
  };

  // Helper to normalize status for case-insensitive matching
  const normalizeStatus = (status) => {
    if (!status) return 'draft';
    return status.toLowerCase();
  };

  // Helper to check if invitation is pending approval
  const isPendingApproval = (invitation) => {
    const status = normalizeStatus(invitation.status);
    return status === 'submitted' || status === 'underreview';
  };

  // Helper to check if invitation can be approved (includes rejected invitations)
  const canBeApproved = (invitation) => {
    const status = normalizeStatus(invitation.status);
    return status === 'submitted' || status === 'underreview' || status === 'rejected';
  };

  // Status badge helper
  const getStatusBadge = (invitation) => {
    const statusConfig = {
      draft: { variant: 'secondary', icon: DocumentDuplicateIcon, text: 'Draft' },
      submitted: { variant: 'info', icon: ClockIconSolid, text: 'Submitted' },
      underreview: { variant: 'warning', icon: ExclamationTriangleIconSolid, text: 'Under Review' },
      approved: { variant: 'success', icon: CheckCircleIcon, text: 'Approved' },
      rejected: { variant: 'danger', icon: XCircleIcon, text: 'Rejected' },
      cancelled: { variant: 'secondary', icon: XMarkIcon, text: 'Cancelled' },
      expired: { variant: 'secondary', icon: ClockIcon, text: 'Expired' },
      active: { variant: 'primary', icon: CheckIcon, text: 'Active' },
      completed: { variant: 'success', icon: CheckCircleIcon, text: 'Completed' }
    };

    const normalizedStatus = normalizeStatus(invitation.status);
    const config = statusConfig[normalizedStatus] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} size="sm" className="flex items-center space-x-1">
        <IconComponent className="w-3 h-3" />
        <span>{config.text}</span>
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
        {invitation.visitDurationHours && (
          <div className="text-gray-500">
            Duration: {invitation.visitDurationHours}h
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

  // Handle invitation actions
  const handleInvitationAction = (action, invitation) => {
    switch (action) {
      case 'view':
        dispatch(showDetailsModal(invitation));
        break;
      case 'edit':
        dispatch(showEditModal(invitation));
        break;
      case 'delete':
        dispatch(showDeleteModal(invitation));
        break;
      case 'approve':
        handleApproveInvitation(invitation.id, 'Quick approval');
        break;
      case 'approval':
        dispatch(showApprovalModal(invitation));
        break;
      case 'qr':
        dispatch(showQrModal(invitation));
        break;
      default:
        break;
    }
  };
  // Table columns configuration - MINIMAL DESIGN
  const columns = [
    {
      key: 'selection',
      header: '',
      width: '50px',
      sortable: false,
      render: (value, invitation) => (
        <input
          type="checkbox"
          checked={selectedInvitations.includes(invitation.id)}
          onChange={(e) => {
            if (e.target.checked) {
              dispatch(setSelectedInvitations([...selectedInvitations, invitation.id]));
            } else {
              dispatch(setSelectedInvitations(selectedInvitations.filter(id => id !== invitation.id)));
            }
          }}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
      headerRender: () => (
        <input
          type="checkbox"
          checked={invitations.length > 0 && selectedInvitations.length === invitations.length}
          onChange={(e) => {
            if (e.target.checked) {
              const allIds = invitations.map(invitation => invitation.id);
              dispatch(setSelectedInvitations(allIds));
            } else {
              dispatch(clearSelections());
            }
          }}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      )
    },
    {
      key: 'invitationNumber',
      header: 'Invitation #',
      sortable: true,
      className: 'min-w-[180px]',
      render: (value, invitation) => (
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900 dark:text-white">#{invitation.invitationNumber}</span>
        </div>
      )
    },
    {
      key: 'visitor',
      header: 'Visitor',
      sortable: true,
      className: 'min-w-[200px]',
      render: (value, invitation) => (
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white text-sm">
              {invitation.visitor?.firstName} {invitation.visitor?.lastName}
            </div>
            {invitation.visitor?.company && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <BuildingOfficeIcon className="w-3 h-3" />
                <span>{invitation.visitor?.company}</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'schedule',
      header: 'Schedule',
      sortable: true,
      className: 'min-w-[180px]',
      render: (value, invitation) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1 text-gray-900 dark:text-white font-medium">
            <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>{formatters.formatDate(invitation.scheduledStartTime)}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <ClockIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>{formatters.formatTime(invitation.scheduledStartTime)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'min-w-[140px]',
      render: (value, invitation) => (
        <div className="flex flex-col space-y-2">
          {getStatusBadge(invitation)}
          {getTypeBadge(invitation)}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'min-w-[300px]',
      render: (value, invitation) => {
        const isSelected = selectedInvitations.includes(invitation.id);
        return (
          <div className={`flex items-center justify-end space-x-2 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 -mx-2 px-2 py-2 rounded' : ''}`}>
            {/* View Button - Always visible */}
            <button
              onClick={() => handleInvitationAction('view', invitation)}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="View details"
            >
              <EyeIcon className="w-5 h-5" />
              <span>View</span>
            </button>

            {/* Edit Button - Conditional */}
            {invitation.canBeModified && (
              <button
                onClick={() => handleInvitationAction('edit', invitation)}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                title="Edit invitation"
              >
                <PencilIcon className="w-5 h-5" />
                <span>Edit</span>
              </button>
            )}

            {/* Approve Button - For pending and rejected invitations */}
            {canBeApproved(invitation) && (
              <>
                <button
                  onClick={() => handleInvitationAction('approve', invitation)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-green-600 border border-green-700 rounded-md hover:bg-green-700 transition-colors shadow-sm"
                  title={normalizeStatus(invitation.status) === 'rejected' ? 'Re-approve invitation' : 'Approve invitation'}
                  disabled={approvalLoading}
                >
                  <CheckIcon className="w-5 h-5 stroke-2" />
                  <span>{normalizeStatus(invitation.status) === 'rejected' ? 'Re-approve' : 'Approve'}</span>
                </button>
                {/* Only show reject button for pending invitations, not rejected ones */}
                {isPendingApproval(invitation) && (
                  <button
                    onClick={() => dispatch(showApprovalModal(invitation))}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-red-600 border border-red-700 rounded-md hover:bg-red-700 transition-colors shadow-sm"
                    title="Reject invitation"
                  >
                    <XMarkIcon className="w-5 h-5 stroke-2" />
                    <span>Reject</span>
                  </button>
                )}
              </>
            )}

            {/* QR Code Button - For approved invitations */}
            {invitation.isApproved && (
              <button
                onClick={() => handleInvitationAction('qr', invitation)}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                title="View QR Code"
              >
                <QrCodeIcon className="w-5 h-5" />
                <span>QR</span>
              </button>
            )}

            {/* Delete Button - Conditional */}
            {invitation.canBeCancelled && (
              <button
                onClick={() => handleInvitationAction('delete', invitation)}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                title="Delete invitation"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  // Handle table sorting
  const handleSort = (sortBy, sortDirection) => {
    dispatch(updateFilters({ 
      sortBy, 
      sortDirection,
      pageIndex: 0 // Reset to first page when sorting
    }));
  };

  // Calculate pagination info
  const hasPreviousPage = pageIndex > 0;
  const hasNextPage = (pageIndex + 1) * pageSize < totalInvitations;
  const totalPages = Math.ceil(totalInvitations / pageSize);
  const currentPageStart = pageIndex * pageSize + 1;
  const currentPageEnd = Math.min((pageIndex + 1) * pageSize, totalInvitations);

  const pageRange = {
    start: currentPageStart,
    end: currentPageEnd,
    total: totalInvitations
  };
  // Main render
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Invitations</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage visitor invitations and approvals
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            onClick={() => dispatch(showCreateModal())}
            loading={createLoading}
            icon={<PlusIcon className="w-5 h-5" />}
          >
            Create Invitation
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <DocumentDuplicateIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{statistics.totalInvitations || statistics.total || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <ClockIconSolid className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{statistics.pendingApprovals || statistics.pendingApproval || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Approved</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{statistics.approvedInvitations || statistics.byStatus?.approved || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Today</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{statistics.activeVisitors || statistics.activeToday || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Rejected</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{statistics.cancelledInvitations || statistics.byStatus?.rejected || 0}</dd>
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
              placeholder="Search invitations by number, subject, visitor..."
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
            
            {(filters.status || filters.type || filters.startDate || filters.endDate || 
              filters.searchTerm || filters.pendingApprovalsOnly || filters.activeOnly || 
              filters.expiredOnly || filters.includeDeleted) && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                icon={<ArrowPathIcon className="w-5 h-5" />}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pendingApprovalsOnly"
                    checked={filters.pendingApprovalsOnly || false}
                    onChange={(e) => handleFilterChange('pendingApprovalsOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pendingApprovalsOnly" className="ml-2 block text-sm text-gray-700">
                    Pending Approvals Only
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activeOnly"
                    checked={filters.activeOnly || false}
                    onChange={(e) => handleFilterChange('activeOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="activeOnly" className="ml-2 block text-sm text-gray-700">
                    Active Only
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="expiredOnly"
                    checked={filters.expiredOnly || false}
                    onChange={(e) => handleFilterChange('expiredOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="expiredOnly" className="ml-2 block text-sm text-gray-700">
                    Expired Only
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeDeleted"
                    checked={filters.includeDeleted || false}
                    onChange={(e) => handleFilterChange('includeDeleted', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeDeleted" className="ml-2 block text-sm text-gray-700">
                    Include Deleted
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
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

      {/* Bulk Actions - Enhanced */}
      <AnimatePresence>
        {selectedInvitations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold text-sm">
                    {selectedInvitations.length}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedInvitations.length} invitation{selectedInvitations.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(clearSelections())}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Clear
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                    icon={<CheckIcon className="w-4 h-4" />}
                    className="bg-white text-green-700 border-green-300 hover:bg-green-50 font-medium"
                  >
                    Approve
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('reject')}
                    icon={<XMarkIcon className="w-4 h-4" />}
                    className="bg-white text-orange-700 border-orange-300 hover:bg-orange-50 font-medium"
                  >
                    Reject
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="bg-white text-red-700 border-red-300 hover:bg-red-50 font-medium"
                    icon={<TrashIcon className="w-4 h-4" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <Table
              data={invitations}
              columns={columns}
              loading={loading}
              onRowSelectionChange={(selectedRowIds) => {
                const selectedIds = Object.keys(selectedRowIds).filter(id => selectedRowIds[id]);
                dispatch(setSelectedInvitations(selectedIds.map(Number)));
              }}
              onSort={handleSort}
              sortBy={filters.sortBy}
              sortDirection={filters.sortDirection}
              emptyMessage="No invitations found"
              hover
              bordered
              className="invitations-table"
            />
            
            {/* Pagination */}
            {totalInvitations > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>
                      Showing {pageRange.start} to {pageRange.end} of {pageRange.total} invitations
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
        onClose={handleCloseCreateModal}
        title="Create Invitation"
        size="full"
      >
        <InvitationForm
          onSubmit={handleCreateInvitation}
          onCancel={handleCloseCreateModal}
          loading={createLoading}
          error={createError}
          isEdit={false}
          preselectedData={preselectedData}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModalState}
        onClose={handleCloseEditModal}
        title="Edit Invitation"
        size="full"
      >
        {currentInvitation && (
          <InvitationForm
            initialData={currentInvitation}
            onSubmit={handleUpdateInvitation}
            onCancel={handleCloseEditModal}
            loading={updateLoading}
            error={updateError}
            isEdit={true}
          />
        )}
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModalState}
        onClose={handleCloseDetailsModal}
        title="Invitation Details"
        size="responsive"
      >
        {renderInvitationDetails()}
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModalState}
        onClose={handleCloseApprovalModal}
        title="Manage Approval"
        size="md"
      >
        {renderApprovalModal()}
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQrModalState}
        onClose={handleCloseQrModal}
        title="QR Code"
        size="md"
      >
        {renderQrModal()}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModalState}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteInvitation}
        title="Delete Invitation"
        message={currentInvitation ? 
          `Are you sure you want to delete the invitation "${currentInvitation.subject}"? This action cannot be undone.` :
          'Are you sure you want to delete this invitation?'
        }
        confirmText="Delete Invitation"
        variant="danger"
        loading={deleteLoading}
        error={deleteError}
        icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
      />

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

  // Render invitation details modal content
  function renderInvitationDetails() {
    if (!currentInvitation) return null;

    return (
      <div className="space-y-6">
        {/* Enhanced Header with Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 -m-6 mb-6 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {currentInvitation.invitationNumber}
                </h3>
                {getStatusBadge(currentInvitation)}
                {getTypeBadge(currentInvitation)}
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1 break-words">{currentInvitation.subject}</h4>
              {currentInvitation.message && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 sm:line-clamp-none">{currentInvitation.message}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 lg:ml-4 shrink-0">
              {/* Approve/Reject for pending and rejected invitations */}
              {canBeApproved(currentInvitation) && (
                <>
                  <button
                    onClick={() => handleApproveInvitation(currentInvitation.id, normalizeStatus(currentInvitation.status) === 'rejected' ? 'Re-approved from details' : 'Approved from details')}
                    className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-green-600 border border-green-700 rounded-lg hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
                    disabled={approvalLoading}
                  >
                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{normalizeStatus(currentInvitation.status) === 'rejected' ? 'Re-approve' : 'Approve'}</span>
                    <span className="sm:hidden">OK</span>
                  </button>
                  {/* Only show reject button for pending invitations, not rejected ones */}
                  {isPendingApproval(currentInvitation) && (
                    <button
                      onClick={() => {
                        handleCloseDetailsModal();
                        setTimeout(() => dispatch(showApprovalModal(currentInvitation)), 100);
                      }}
                      className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-red-600 border border-red-700 rounded-lg hover:bg-red-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                      <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Reject</span>
                    </button>
                  )}
                </>
              )}

              {/* QR Code for approved invitations */}
              {currentInvitation.isApproved && (
                <button
                  onClick={() => {
                    handleCloseDetailsModal();
                    setTimeout(() => handleInvitationAction('qr', currentInvitation), 100);
                  }}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-100 border border-indigo-300 rounded-lg hover:bg-indigo-200 transition-colors whitespace-nowrap"
                >
                  <QrCodeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">View QR Code</span>
                  <span className="sm:hidden">QR</span>
                </button>
              )}

              {/* Edit Button */}
              {currentInvitation.canBeModified && (
                <button
                  onClick={() => {
                    handleCloseDetailsModal();
                    setTimeout(() => handleInvitationAction('edit', currentInvitation), 100);
                  }}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors whitespace-nowrap"
                >
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Visitor Information */}
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Visitor Information</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="break-words">
                <strong className="text-gray-700 dark:text-gray-300">Name:</strong> <span className="text-gray-900 dark:text-white">{currentInvitation.visitor?.firstName} {currentInvitation.visitor?.lastName}</span>
              </div>
              <div className="break-all">
                <strong className="text-gray-700 dark:text-gray-300">Email:</strong> <span className="text-gray-900 dark:text-white">{currentInvitation.visitor?.email}</span>
              </div>
              {currentInvitation.visitor?.phoneNumber && (
                <div className="break-words">
                  <strong className="text-gray-700 dark:text-gray-300">Phone:</strong> <span className="text-gray-900 dark:text-white">{currentInvitation.visitor?.phoneNumber}</span>
                </div>
              )}
              {currentInvitation.visitor?.company && (
                <div className="break-words">
                  <strong className="text-gray-700 dark:text-gray-300">Company:</strong> <span className="text-gray-900 dark:text-white">{currentInvitation.visitor?.company}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Host Information */}
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span>Host Information</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="break-words">
                <strong className="text-gray-700 dark:text-gray-300">Name:</strong> <span className="text-gray-900 dark:text-white">{currentInvitation.host?.firstName} {currentInvitation.host?.lastName}</span>
              </div>
              <div className="break-all">
                <strong className="text-gray-700 dark:text-gray-300">Email:</strong> <span className="text-gray-900 dark:text-white">{currentInvitation.host?.email}</span>
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span>Schedule</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="break-words">
                <strong className="text-gray-700 dark:text-gray-300">Date:</strong> <span className="text-gray-900 dark:text-white">{formatters.formatDate(currentInvitation.scheduledStartTime)}</span>
              </div>
              <div className="break-words">
                <strong className="text-gray-700 dark:text-gray-300">Time:</strong> <span className="text-gray-900 dark:text-white">{formatters.formatTime(currentInvitation.scheduledStartTime)} - {formatters.formatTime(currentInvitation.scheduledEndTime)}</span>
              </div>
              <div>
                <strong className="text-gray-700 dark:text-gray-300">Duration:</strong> <span className="text-gray-900 dark:text-white">{currentInvitation.visitDurationHours}h</span>
              </div>
            </div>
          </Card>

          {/* Location & Purpose */}
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <MapPinIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span>Location & Purpose</span>
            </h4>
            <div className="space-y-2 text-sm">
              {currentInvitation.location && (
                <div className="break-words">
                  <strong className="text-gray-700 dark:text-gray-300">Location:</strong> <span className="text-gray-900 dark:text-white">{currentInvitation.location.name}</span>
                </div>
              )}
              {currentInvitation.visitPurpose && (
                <div className="break-words">
                  <strong className="text-gray-700 dark:text-gray-300">Purpose:</strong> <span className="text-gray-900 dark:text-white">{currentInvitation.visitPurpose.name}</span>
                </div>
              )}
              <div>
                <strong className="text-gray-700 dark:text-gray-300">Expected Visitors:</strong> <span className="text-gray-900 dark:text-white">{currentInvitation.expectedVisitorCount}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Message */}
        {currentInvitation.message && (
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span>Message</span>
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">{currentInvitation.message}</p>
          </Card>
        )}

        {/* Requirements */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <InformationCircleIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span>Requirements</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${currentInvitation.requiresApproval ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
              <span className="truncate text-gray-900 dark:text-white">Requires Approval</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${currentInvitation.requiresEscort ? 'bg-red-500 dark:bg-red-400' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
              <span className="truncate text-gray-900 dark:text-white">Requires Escort</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${currentInvitation.requiresBadge ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
              <span className="truncate text-gray-900 dark:text-white">Requires Badge</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${currentInvitation.needsParking ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
              <span className="truncate text-gray-900 dark:text-white">Needs Parking</span>
            </div>
          </div>

          {currentInvitation.specialInstructions && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <strong className="text-gray-900 dark:text-blue-200 flex items-center space-x-1 mb-2">
                <InformationCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Special Instructions:</span>
              </strong>
              <p className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">{currentInvitation.specialInstructions}</p>
            </div>
          )}

          {currentInvitation.parkingInstructions && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <strong className="text-gray-900 dark:text-green-200 flex items-center space-x-1 mb-2">
                <MapPinIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>Parking Instructions:</span>
              </strong>
              <p className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">{currentInvitation.parkingInstructions}</p>
            </div>
          )}
        </Card>

        {/* Approval Information */}
        {(currentInvitation.approvedOn || currentInvitation.rejectedOn) && (
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentInvitation.approvedOn ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                {currentInvitation.approvedOn ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <span>Approval Status</span>
            </h4>
            <div className="space-y-3 text-sm">
              {currentInvitation.approvedOn && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="break-words">
                    <strong className="text-gray-700 dark:text-gray-300">Approved:</strong> <span className="text-gray-900 dark:text-white">{formatters.formatDateTime(currentInvitation.approvedOn)}</span>
                  </div>
                  {currentInvitation.approvalComments && (
                    <div className="mt-2 break-words">
                      <strong className="text-gray-700 dark:text-gray-300">Comments:</strong> <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">{currentInvitation.approvalComments}</p>
                    </div>
                  )}
                </div>
              )}
              {currentInvitation.rejectedOn && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="break-words">
                    <strong className="text-gray-700 dark:text-gray-300">Rejected:</strong> <span className="text-gray-900 dark:text-white">{formatters.formatDateTime(currentInvitation.rejectedOn)}</span>
                  </div>
                  {currentInvitation.rejectionReason && (
                    <div className="mt-2 break-words">
                      <strong className="text-gray-700 dark:text-gray-300">Reason:</strong> <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">{currentInvitation.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    );
  }
  // Render approval modal content
  function renderApprovalModal() {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {approvalAction === 'approve' ? 'Approve Invitation' : 'Reject Invitation'}
          </h3>
          <p className="text-sm text-gray-600">
            {currentInvitation?.subject} - #{currentInvitation?.invitationNumber}
          </p>
        </div>

        <div className="flex justify-center space-x-3 mb-4">
          <Button
            variant={approvalAction === 'approve' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setApprovalAction('approve')}
            icon={<CheckIcon className="w-4 h-4" />}
          >
            Approve
          </Button>
          <Button
            variant={approvalAction === 'reject' ? 'danger' : 'outline'}
            size="sm"
            onClick={() => setApprovalAction('reject')}
            icon={<XMarkIcon className="w-4 h-4" />}
          >
            Reject
          </Button>
        </div>

        {approvalAction === 'approve' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Comments (Optional)
            </label>
            <textarea
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Add any comments about the approval..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">{approvalComments.length}/500 characters</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={approvalReason}
              onChange={(e) => setApprovalReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Please provide a reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">{approvalReason.length}/500 characters</p>
          </div>
        )}

        {approvalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-sm text-red-700">
              {extractErrorMessage(approvalError)}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCloseApprovalModal}
            disabled={approvalLoading}
          >
            Cancel
          </Button>
          <Button
            variant={approvalAction === 'approve' ? 'primary' : 'danger'}
            onClick={() => approvalAction === 'approve' ? handleApprove(approvalComments) : handleReject(approvalReason)}
            loading={approvalLoading}
            disabled={approvalLoading || (approvalAction === 'reject' && !approvalReason.trim())}
            icon={approvalAction === 'approve' ? <CheckIcon className="w-4 h-4" /> : <XMarkIcon className="w-4 h-4" />}
          >
            {approvalAction === 'approve' ? 'Approve Invitation' : 'Reject Invitation'}
          </Button>
        </div>
      </div>
    );
  }

  // Render QR code modal content
  function renderQrModal() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            QR Code for Invitation
          </h3>
          <p className="text-sm text-gray-600">
            {currentInvitation?.subject} - #{currentInvitation?.invitationNumber}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Visitor: {currentInvitation?.visitor?.fullName}
          </p>
        </div>

        {qrLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {qrError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">
              {extractErrorMessage(qrError)}
            </div>
          </div>
        )}

        {emailError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">
              Email Error: {emailError}
            </div>
          </div>
        )}

        {emailSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-sm text-green-700">
              QR code sent successfully to {currentInvitation?.visitor?.email}!
            </div>
          </div>
        )}

        {qrCodeData && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                <img
                  src={`data:image/png;base64,${qrCodeImage}`}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Scan this QR code to check in for the visit
              </p>
            </div>

            {/* QR Code Actions */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4">QR Code Actions</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Download QR Code */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `data:image/png;base64,${qrCodeImage}`;
                    link.download = `invitation-${currentInvitation.invitationNumber}-qr.png`;
                    link.click();
                  }}
                  icon={<DocumentTextIcon className="w-4 h-4" />}
                  className="justify-center"
                >
                  Download QR Code
                </Button>

                {/* Send QR Code via Email */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendQrEmail}
                  loading={emailSending}
                  disabled={emailSending || !currentInvitation?.visitor?.email}
                  icon={<EnvelopeIcon className="w-4 h-4" />}
                  className="justify-center"
                >
                  {emailSending ? 'Sending...' : 'Email to Visitor'}
                </Button>
              </div>

              {/* Email recipient info */}
              {currentInvitation?.visitor?.email && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Will be sent to: {currentInvitation.visitor.email}
                </p>
              )}
              
              {!currentInvitation?.visitor?.email && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  No email address available for this visitor
                </p>
              )}
            </div>

            {/* QR Code Data */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">QR Code Data</h4>
              <div className="bg-gray-50 rounded-md p-3">
                <code className="text-xs text-gray-600 break-all">
                  {qrCodeData.qrCode?.substring(0, 100)}...
                </code>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This code contains encrypted invitation details for secure check-in
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default InvitationsListPage;