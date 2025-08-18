// src/pages/invitations/InvitationsListPage/InvitationsListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
  rejectInvitation
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
import InvitationsList from '../../../components/invitation/InvitationsList/InvitationsList';
import InvitationForm from '../../../components/invitation/InvitationForm/InvitationForm';
import Modal from '../../../components/common/Modal/Modal';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';
import Card from '../../../components/common/Card/Card';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';

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
  EnvelopeIcon
} from '@heroicons/react/24/outline';

// Utils
import formatters from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Main Invitations List Page
 * Coordinates all invitation management functionality including:
 * - List display with filtering and pagination
 * - Create/Edit forms in modals
 * - Approval workflow
 * - QR code generation
 * - Deletion management
 */
const InvitationsListPage = () => {
  const dispatch = useDispatch();

  // Invitations data
  const invitations = useSelector(selectInvitationsList);
  const totalInvitations = useSelector(selectInvitationsTotal);
  const pageIndex = useSelector(selectInvitationsPageIndex);
  const pageSize = useSelector(selectInvitationsPageSize);
  const loading = useSelector(selectInvitationsLoading);
  const error = useSelector(selectInvitationsError);

  // Modal states
  const showCreateModalState = useSelector(selectShowCreateModal);
  const showEditModalState = useSelector(selectShowEditModal);
  const showDeleteModal = useSelector(selectShowDeleteModal);
  const showDetailsModalState = useSelector(selectShowDetailsModal);
  const showApprovalModal = useSelector(selectShowApprovalModal);
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

  // Approval modal state
  const [approvalComments, setApprovalComments] = React.useState('');
  const [approvalReason, setApprovalReason] = React.useState('');
  const [approvalAction, setApprovalAction] = React.useState('approve'); // 'approve' or 'reject'
  
  // QR Email state
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Load initial data on mount
  useEffect(() => {
    dispatch(getInvitations());
    dispatch(getVisitors({ pageSize: 1000, isActive: true }));
    dispatch(getLocations({ pageSize: 1000, isActive: true }));
    dispatch(getVisitPurposes({ pageSize: 1000, isActive: true }));
  }, [dispatch]);

  // Load QR code when QR modal opens
  useEffect(() => {
    if (showQrModalState && currentInvitation && !qrCodeData) {
      console.log(currentInvitation)
      dispatch(getQrCode(currentInvitation.id));
      dispatch(getInvitationQrCodeImage({ id: currentInvitation.id }));
    }
  }, [showQrModalState, currentInvitation, qrCodeData, dispatch]);

  // Action handlers
  const handleCreateInvitation = async (invitationData) => {
    try {
      await dispatch(createInvitation(invitationData)).unwrap();
      // Modal will be closed by the reducer
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
    } catch (error) {
      console.error('Delete invitation failed:', error);
    }
  };

  const handleApprove = async (comments = '') => {
    try {
      await dispatch(approveInvitation({
        id: currentInvitation.id,
        comments
      })).unwrap();
      // Modal will be closed by the reducer
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
    } catch (error) {
      console.error('Reject invitation failed:', error);
    }
  };

  // Modal close handlers
  const handleCloseCreateModal = () => {
    dispatch(hideCreateModal());
    dispatch(clearError());
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

  // Status badge helper
  const getStatusBadge = (invitation) => {
    const statusConfig = {
      Draft: { variant: 'secondary', text: 'Draft' },
      Submitted: { variant: 'info', text: 'Submitted' },
      UnderReview: { variant: 'warning', text: 'Under Review' },
      Approved: { variant: 'success', text: 'Approved' },
      Rejected: { variant: 'danger', text: 'Rejected' },
      Cancelled: { variant: 'secondary', text: 'Cancelled' },
      Expired: { variant: 'secondary', text: 'Expired' },
      Active: { variant: 'primary', text: 'Active' },
      Completed: { variant: 'success', text: 'Completed' }
    };

    const config = statusConfig[invitation.status] || statusConfig.Draft;
    return <Badge variant={config.variant} size="sm">{config.text}</Badge>;
  };

  // Render invitation details modal content
  const renderInvitationDetails = () => {
    if (!currentInvitation) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-medium text-gray-900">
                #{currentInvitation.invitationNumber}
              </h3>
              {getStatusBadge(currentInvitation)}
            </div>
            <p className="text-gray-600 mt-1">{currentInvitation.subject}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visitor Information */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <UserIcon className="w-4 h-4" />
              <span>Visitor Information</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Name:</strong> {currentInvitation.visitor?.firstName} {currentInvitation.visitor?.lastName}
              </div>
              <div>
                <strong>Email:</strong> {currentInvitation.visitor?.email}
              </div>
              {currentInvitation.visitor?.phoneNumber && (
                <div>
                  <strong>Phone:</strong> {currentInvitation.visitor?.phoneNumber}
                </div>
              )}
              {currentInvitation.visitor?.company && (
                <div>
                  <strong>Company:</strong> {currentInvitation.visitor?.company}
                </div>
              )}
            </div>
          </Card>

          {/* Host Information */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <UserIcon className="w-4 h-4" />
              <span>Host Information</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Name:</strong> {currentInvitation.host?.firstName} {currentInvitation.host?.lastName}
              </div>
              <div>
                <strong>Email:</strong> {currentInvitation.host?.email}
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <span>Schedule</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Date:</strong> {formatters.formatDate(currentInvitation.scheduledStartTime)}
              </div>
              <div>
                <strong>Time:</strong> {formatters.formatTime(currentInvitation.scheduledStartTime)} - {formatters.formatTime(currentInvitation.scheduledEndTime)}
              </div>
              <div>
                <strong>Duration:</strong> {currentInvitation.visitDurationHours}h
              </div>
            </div>
          </Card>

          {/* Location & Purpose */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4" />
              <span>Location & Purpose</span>
            </h4>
            <div className="space-y-2 text-sm">
              {currentInvitation.location && (
                <div>
                  <strong>Location:</strong> {currentInvitation.location.name}
                </div>
              )}
              {currentInvitation.visitPurpose && (
                <div>
                  <strong>Purpose:</strong> {currentInvitation.visitPurpose.name}
                </div>
              )}
              <div>
                <strong>Expected Visitors:</strong> {currentInvitation.expectedVisitorCount}
              </div>
            </div>
          </Card>
        </div>

        {/* Message */}
        {currentInvitation.message && (
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <DocumentTextIcon className="w-4 h-4" />
              <span>Message</span>
            </h4>
            <p className="text-sm text-gray-700">{currentInvitation.message}</p>
          </Card>
        )}

        {/* Requirements */}
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <InformationCircleIcon className="w-4 h-4" />
            <span>Requirements</span>
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${currentInvitation.requiresApproval ? 'bg-yellow-500' : 'bg-gray-300'}`}></span>
              <span>Requires Approval</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${currentInvitation.requiresEscort ? 'bg-red-500' : 'bg-gray-300'}`}></span>
              <span>Requires Escort</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${currentInvitation.requiresBadge ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
              <span>Requires Badge</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${currentInvitation.needsParking ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span>Needs Parking</span>
            </div>
          </div>
          
          {currentInvitation.specialInstructions && (
            <div className="mt-4">
              <strong>Special Instructions:</strong>
              <p className="mt-1 text-gray-700">{currentInvitation.specialInstructions}</p>
            </div>
          )}
          
          {currentInvitation.parkingInstructions && (
            <div className="mt-4">
              <strong>Parking Instructions:</strong>
              <p className="mt-1 text-gray-700">{currentInvitation.parkingInstructions}</p>
            </div>
          )}
        </Card>

        {/* Approval Information */}
        {(currentInvitation.approvedOn || currentInvitation.rejectedOn) && (
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Approval Status</h4>
            <div className="space-y-2 text-sm">
              {currentInvitation.approvedOn && (
                <>
                  <div>
                    <strong>Approved:</strong> {formatters.formatDateTime(currentInvitation.approvedOn)}
                  </div>
                  {currentInvitation.approvalComments && (
                    <div>
                      <strong>Comments:</strong> {currentInvitation.approvalComments}
                    </div>
                  )}
                </>
              )}
              {currentInvitation.rejectedOn && (
                <>
                  <div>
                    <strong>Rejected:</strong> {formatters.formatDateTime(currentInvitation.rejectedOn)}
                  </div>
                  {currentInvitation.rejectionReason && (
                    <div>
                      <strong>Reason:</strong> {currentInvitation.rejectionReason}
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    );
  };
  // Render approval modal content
  const renderApprovalModal = () => {
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
  };

  // Render QR code modal content
  const renderQrModal = () => {
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
  };

  // Main render
  return (
    <div className="space-y-6">
      <InvitationsList />

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
        size="xl"
      >
        {renderInvitationDetails()}
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
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
        isOpen={showDeleteModal}
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
    </div>
  );
};

export default InvitationsListPage;