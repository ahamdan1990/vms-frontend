// src/pages/checkin/CheckInDashboard/CheckInDashboard.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Redux imports
import {
  checkInInvitation,
  checkOutInvitation,
  getActiveInvitations,
  clearError
} from '../../../store/slices/invitationsSlice';

// Selectors
import {
  selectActiveInvitations,
  selectActiveInvitationsLoading,
  selectInvitationsCheckInLoading,
  selectInvitationsCheckInError,
  selectCheckInData
} from '../../../store/selectors/invitationSelectors';

// Components
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Badge from '../../../components/common/Badge/Badge';
import Table from '../../../components/common/Table/Table';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';
import QrCodeScanner from '../../../components/checkin/QrCodeScanner/QrCodeScanner';
import CheckInForm from '../../../components/checkin/CheckInForm/CheckInForm';
import InvitationDetailsModal from '../../../components/checkin/InvitationDetailsModal/InvitationDetailsModal';

// Icons
import {
  QrCodeIcon,
  UserPlusIcon,
  UserMinusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/solid';

// Utils
import formatters from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';
import { createActiveVisitorColumns } from '../../../components/visitor/activeVisitorUtils';

// Services
import invitationService from '../../../services/invitationService';

// Hooks
import { useToast } from '../../../hooks/useNotifications';

/**
 * Check-in Dashboard Component
 * Central hub for visitor check-in/check-out operations
 * Includes QR scanning, manual check-in, and active visitor management
 */
const CheckInDashboard = () => {
  const dispatch = useDispatch();
  const toast = useToast();

  // Redux selectors
  const activeInvitations = useSelector(selectActiveInvitations);
  const activeInvitationsLoading = useSelector(selectActiveInvitationsLoading);
  const checkInLoading = useSelector(selectInvitationsCheckInLoading);
  const checkInError = useSelector(selectInvitationsCheckInError);
  const checkInData = useSelector(selectCheckInData);

  // Local state
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'manual', 'active'
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedInvitationData, setScannedInvitationData] = useState(null);
  const [showInvitationDetailsModal, setShowInvitationDetailsModal] = useState(false);
  const [invitationDetailsData, setInvitationDetailsData] = useState(null);
  const [invitationDetailsError, setInvitationDetailsError] = useState(null);
  const [loadingInvitationDetails, setLoadingInvitationDetails] = useState(false);
  const [autoCheckInMode, setAutoCheckInMode] = useState(false); // Toggle for auto vs manual check-in
  const [checkInStats, setCheckInStats] = useState({
    todayCheckIns: 0,
    activeVisitors: 0,
    pendingCheckOuts: 0,
    averageVisitDuration: 0
  });

  // Load active invitations on mount and refresh every 30 seconds
  useEffect(() => {
    const loadActiveInvitations = () => {
      dispatch(getActiveInvitations());
    };

    loadActiveInvitations();
    //const interval = setInterval(loadActiveInvitations, 30000); // Refresh every 30 seconds

    //return () => clearInterval(interval);
  }, [dispatch]);

  // Helper function to parse UTC dates correctly
  const parseUtcDate = (dateString) => {
    if (!dateString) return null;
    // If the date string doesn't end with 'Z', append it to ensure UTC parsing
    const dateWithZ = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    return new Date(dateWithZ);
  };

  // Calculate stats when active invitations change
  useEffect(() => {
    if (activeInvitations && activeInvitations.length > 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const todayCheckIns = activeInvitations.filter(invitation => {
        if (!invitation.checkedInAt) return false;
        const checkInDate = parseUtcDate(invitation.checkedInAt);
        return checkInDate >= today;
      }).length;

      const activeVisitors = activeInvitations.filter(invitation => {
        return invitation.checkedInAt && !invitation.checkedOutAt;
      }).length;

      const pendingCheckOuts = activeInvitations.filter(invitation => {
        return invitation.checkedInAt && !invitation.checkedOutAt;
      }).length;

      // Calculate average visit duration for completed visits today
      const completedVisitsToday = activeInvitations.filter(invitation => {
        if (!invitation.checkedInAt || !invitation.checkedOutAt) return false;
        const checkInDate = parseUtcDate(invitation.checkedInAt);
        return checkInDate >= today;
      });

      let averageVisitDuration = 0;
      if (completedVisitsToday.length > 0) {
        const totalDuration = completedVisitsToday.reduce((sum, invitation) => {
          const checkIn = parseUtcDate(invitation.checkedInAt);
          const checkOut = parseUtcDate(invitation.checkedOutAt);
          return sum + (checkOut.getTime() - checkIn.getTime());
        }, 0);
        averageVisitDuration = totalDuration / completedVisitsToday.length / (1000 * 60 * 60); // Convert to hours
      }

      setCheckInStats({
        todayCheckIns,
        activeVisitors,
        pendingCheckOuts,
        averageVisitDuration: Math.round(averageVisitDuration * 10) / 10 // Round to 1 decimal
      });
    }
  }, [activeInvitations]);

  // Handle QR code scan
  const handleQrScan = async (qrData) => {
    // Close scanner modal immediately after scan
    setShowScannerModal(false);

    // Small delay to ensure modal is properly closed and body scroll is restored
    await new Promise(resolve => setTimeout(resolve, 100));

    // AUTO CHECK-IN MODE: Process check-in immediately
    if (autoCheckInMode) {
      try {
        const result = await dispatch(checkInInvitation({
          invitationReference: qrData,
          notes: 'QR Code Check-in'
        })).unwrap();

        // Store invitation data
        setScannedInvitationData(result);

        // Show success toast
        const visitorName = result?.visitor?.fullName || 'Visitor';
        const invitationNumber = result?.invitationNumber || 'N/A';

        toast.success(
          'Check-in Successful',
          `${visitorName} has been checked in successfully. Invitation: ${invitationNumber}`,
          { duration: 5000 }
        );

        // Refresh active invitations
        await dispatch(getActiveInvitations());
      } catch (error) {
        console.error('QR check-in failed:', error);
        const errorMessage = extractErrorMessage(error);

        // Try to fetch invitation details to show in the modal with warning banners
        try {
          const invitationDetails = await invitationService.getInvitationByReference(qrData);
          // We got invitation details - show them with the warning banners
          // The modal will display appropriate warnings based on the invitation state
          setInvitationDetailsData(invitationDetails);
          setInvitationDetailsError(null); // Clear error since we have invitation to show
        } catch (fetchError) {
          console.error('Failed to fetch invitation details for error display:', fetchError);
          // If we can't fetch details, show error message
          setInvitationDetailsData(null);
          setInvitationDetailsError({
            message: errorMessage || 'Check-in failed',
            details: getErrorDetails(errorMessage)
          });
        }

        setShowInvitationDetailsModal(true);
      }
    }
    // MANUAL CONFIRMATION MODE: Fetch invitation details first
    else {
      setLoadingInvitationDetails(true);
      setInvitationDetailsError(null);
      setInvitationDetailsData(null);

      try {
        // Fetch invitation details without checking in
        const invitationDetails = await invitationService.getInvitationByReference(qrData);

        if (invitationDetails) {
          setInvitationDetailsData(invitationDetails);
          setShowInvitationDetailsModal(true);
        } else {
          setInvitationDetailsError({
            message: 'Invitation Not Found',
            details: 'The scanned QR code does not match any invitation in the system.'
          });
          setShowInvitationDetailsModal(true);
        }
      } catch (error) {
        console.error('Failed to fetch invitation details:', error);
        const errorMessage = extractErrorMessage(error);

        // Handle 404 specifically - invitation not found
        if (error.response?.status === 404 || errorMessage?.includes('not found') || errorMessage?.includes('404')) {
          setInvitationDetailsError({
            message: `Invitation with reference '${qrData}' not found.`,
            details: 'The scanned QR code does not match any invitation in the system.'
          });
        } else {
          setInvitationDetailsError({
            message: errorMessage || 'Failed to load invitation details',
            details: getErrorDetails(errorMessage)
          });
        }
        setShowInvitationDetailsModal(true);
      } finally {
        setLoadingInvitationDetails(false);
      }
    }
  };

  // Helper function to extract error details
  const getErrorDetails = (errorMessage) => {
    if (!errorMessage) return null;

    if (errorMessage.includes('too early') || errorMessage.includes('scheduled for')) {
      return 'This invitation is scheduled for a future time. Check-in is allowed starting 2 hours before the scheduled time.';
    } else if (errorMessage.includes('expired') || errorMessage.includes('scheduled to end')) {
      return 'This invitation has expired and can no longer be used for check-in.';
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return 'The scanned QR code does not match any invitation in the system.';
    } else if (errorMessage.includes('Only approved invitations') || errorMessage.includes('not been approved') || errorMessage.includes('not approved')) {
      return 'This invitation must be approved before check-in is allowed.';
    } else if (errorMessage.includes('already checked in')) {
      return 'This visitor has already been checked in.';
    }
    return null;
  };

  // Handle manual confirmation of check-in after viewing details
  const handleConfirmCheckIn = async (invitationReference, notes = '') => {
    try {
      const result = await dispatch(checkInInvitation({
        invitationReference,
        notes: notes || 'Manual confirmation check-in'
      })).unwrap();

      // Close details modal
      setShowInvitationDetailsModal(false);
      setInvitationDetailsData(null);
      setInvitationDetailsError(null);

      // Show success toast
      const visitorName = result?.visitor?.fullName || 'Visitor';
      const invitationNumber = result?.invitationNumber || 'N/A';

      toast.success(
        'Check-in Successful',
        `${visitorName} has been checked in successfully. Invitation: ${invitationNumber}`,
        { duration: 5000 }
      );

      // Refresh active invitations
      await dispatch(getActiveInvitations());
    } catch (error) {
      console.error('Confirmed check-in failed:', error);
      const errorMessage = extractErrorMessage(error);

      // Update error in modal
      setInvitationDetailsError({
        message: errorMessage || 'Check-in failed',
        details: getErrorDetails(errorMessage)
      });
    }
  };

  // Handle manual check-in
  const handleManualCheckIn = async (invitationReference, notes = '') => {
    try {
      await dispatch(checkInInvitation({
        invitationReference,
        notes
      })).unwrap();
      
      // Refresh active invitations
      dispatch(getActiveInvitations());
      setShowCheckInForm(false);
    } catch (error) {
      console.error('Manual check-in failed:', error);
    }
  };

  // Handle check-out
  const handleCheckOut = async (invitation, notes = '') => {
    try {
      await dispatch(checkOutInvitation({
        id: invitation.id,
        notes
      })).unwrap();
      
      // Refresh active invitations
      dispatch(getActiveInvitations());
      setSelectedInvitation(null);
    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

  const columns = createActiveVisitorColumns({
    onViewDetails: (invitation) => {
      setSelectedInvitation(invitation);
      setInvitationDetailsData(invitation);
      setShowInvitationDetailsModal(true);
    },
    onQuickCheckIn: (invitation) => {
      setSelectedInvitation(invitation);
      setShowCheckInForm(true);
    },
    onQuickCheckOut: (invitation) => handleCheckOut(invitation, 'Manual check-out'),
    showSelection: true
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Check-in Dashboard</h1>
          <p className="text-gray-600">Manage visitor check-ins and active visits</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => dispatch(getActiveInvitations())}
            icon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
              <CheckCircleIconSolid className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
              <p className="text-2xl font-bold text-gray-900">{checkInStats.todayCheckIns}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{checkInStats.activeVisitors}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-md">
              <ClockIconSolid className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Check-outs</p>
              <p className="text-2xl font-bold text-gray-900">{checkInStats.pendingCheckOuts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {checkInStats.averageVisitDuration > 0 ? `${checkInStats.averageVisitDuration}h` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Error Display */}
      {checkInError && (
        <div className="bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-700 rounded-md p-4">
          <div className="text-sm text-red-700">
            {extractErrorMessage(checkInError)}
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scanner'
                ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <QrCodeIcon className="w-4 h-4" />
              <span>QR Scanner</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manual'
                ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <UserPlusIcon className="w-4 h-4" />
              <span>Manual Check-in</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <EyeIcon className="w-4 h-4" />
              <span>Active Visitors ({checkInStats.activeVisitors})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'scanner' && (
            <Card className="p-6">
              <div className="text-center">
                <QrCodeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">QR Code Scanner</h3>
                <p className="text-gray-600 mb-4">
                  Scan visitor QR codes for quick check-in
                </p>

                {/* Check-in Mode Toggle */}
                <div className="flex items-center justify-center space-x-4 mb-6 p-4 bg-gray-50 dark:bg-slate-900/60 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Check-in Mode:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setAutoCheckInMode(false)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        !autoCheckInMode
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Manual Confirmation
                    </button>
                    <button
                      onClick={() => setAutoCheckInMode(true)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        autoCheckInMode
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Auto Check-in
                    </button>
                  </div>
                </div>

                <div className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                  {autoCheckInMode ? (
                    <p>
                      ✅ <strong>Auto mode:</strong> Visitors will be checked in immediately after QR scan
                    </p>
                  ) : (
                    <p>
                      👤 <strong>Manual mode:</strong> Review visitor details before confirming check-in
                    </p>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowScannerModal(true)}
                  icon={<QrCodeIcon className="h-5 w-5" />}
                  iconPosition="left"
                >
                  Open QR Scanner
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'manual' && (
            <Card className="p-6">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Manual Check-in</h3>
                  <p className="text-gray-600">
                    Enter invitation number or visitor details
                  </p>
                </div>
                <CheckInForm
                  onSubmit={handleManualCheckIn}
                  loading={checkInLoading}
                />
              </div>
            </Card>
          )}

          {activeTab === 'active' && (
            <Card>
              {activeInvitationsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : activeInvitations && activeInvitations.length > 0 ? (
                <Table
                  data={activeInvitations}
                  columns={columns}
                  emptyMessage="No active visitors"
                />
              ) : (
                <div className="text-center py-12">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active visitors</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Visitors will appear here when they check in.
                  </p>
                </div>
              )}
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Check-in Success Display */}
      {checkInData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => dispatch(clearError())}
        >
          <Card className="p-8 max-w-md mx-4">
            <div className="text-center">
              <CheckCircleIconSolid className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Check-in Successful!</h3>
              <p className="text-gray-600 mb-4">
                {checkInData.visitor?.firstName} {checkInData.visitor?.lastName} has been checked in.
              </p>
              <Button
                onClick={() => dispatch(clearError())}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* QR Scanner Modal */}
      {showScannerModal && (
        <Modal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          title="Scan QR Code"
          size="lg"
        >
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Point your camera at the visitor's QR code
            </p>
            <QrCodeScanner
              key={showScannerModal ? 'scanner-open' : 'scanner-closed'}
              onScan={handleQrScan}
              loading={checkInLoading}
            />
          </div>
        </Modal>
      )}

      {/* Invitation Details Modal - For Manual Confirmation Mode */}
      <InvitationDetailsModal
        isOpen={showInvitationDetailsModal}
        onClose={() => {
          setShowInvitationDetailsModal(false);
          setInvitationDetailsData(null);
          setInvitationDetailsError(null);
        }}
        invitation={invitationDetailsData}
        error={invitationDetailsError}
        onConfirmCheckIn={handleConfirmCheckIn}
        loading={checkInLoading || loadingInvitationDetails}
      />

      {/* Invitation Details Modal */}
      {scannedInvitationData && (
        <Modal
          isOpen={!!scannedInvitationData}
          onClose={() => setScannedInvitationData(null)}
          title="Check-in Successful"
          size="xl"
        >
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircleIconSolid className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-green-900 font-medium">Visitor Checked In Successfully</h4>
                <p className="text-green-700 text-sm mt-1">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </div>

            {/* Visitor Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Visitor Information
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-900/60 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {scannedInvitationData.visitor?.fullName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">
                    {scannedInvitationData.visitor?.email?.value || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {scannedInvitationData.visitor?.phoneNumber?.value || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">
                    {scannedInvitationData.visitor?.company || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Invitation Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Invitation Details
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-900/60 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Invitation Number</p>
                  <p className="font-medium text-gray-900">
                    {scannedInvitationData.invitationNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purpose</p>
                  <p className="font-medium text-gray-900">
                    {scannedInvitationData.purpose || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scheduled Time</p>
                  <p className="font-medium text-gray-900">
                    {scannedInvitationData.scheduledStartTime
                      ? new Date(scannedInvitationData.scheduledStartTime).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Host</p>
                  <p className="font-medium text-gray-900">
                    {scannedInvitationData.host?.fullName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {scannedInvitationData.location?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant="success">
                    Checked In
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setScannedInvitationData(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setScannedInvitationData(null);
                  setShowScannerModal(true);
                }}
                icon={<QrCodeIcon className="h-4 w-4" />}
                iconPosition="left"
              >
                Scan Another
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CheckInDashboard;
