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
import QrCodeScanner from '../../../components/checkin/QrCodeScanner/QrCodeScanner';
import CheckInForm from '../../../components/checkin/CheckInForm/CheckInForm';

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
  BuildingOfficeIcon,
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

/**
 * Check-in Dashboard Component
 * Central hub for visitor check-in/check-out operations
 * Includes QR scanning, manual check-in, and active visitor management
 */
const CheckInDashboard = () => {
  const dispatch = useDispatch();

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
    const interval = setInterval(loadActiveInvitations, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  // Calculate stats when active invitations change
  useEffect(() => {
    if (activeInvitations && activeInvitations.length > 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const todayCheckIns = activeInvitations.filter(invitation => {
        return invitation.checkedInAt && new Date(invitation.checkedInAt) >= today;
      }).length;

      const activeVisitors = activeInvitations.filter(invitation => {
        return invitation.checkedInAt && !invitation.checkedOutAt;
      }).length;

      const pendingCheckOuts = activeInvitations.filter(invitation => {
        return invitation.checkedInAt && !invitation.checkedOutAt;
      }).length;

      // Calculate average visit duration for completed visits today
      const completedVisitsToday = activeInvitations.filter(invitation => {
        return invitation.checkedInAt && invitation.checkedOutAt &&
               new Date(invitation.checkedInAt) >= today;
      });

      let averageVisitDuration = 0;
      if (completedVisitsToday.length > 0) {
        const totalDuration = completedVisitsToday.reduce((sum, invitation) => {
          const checkIn = new Date(invitation.checkedInAt);
          const checkOut = new Date(invitation.checkedOutAt);
          return sum + (checkOut - checkIn);
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
    try {
      await dispatch(checkInInvitation({
        invitationReference: qrData,
        notes: 'QR Code Check-in'
      })).unwrap();
      
      // Refresh active invitations
      dispatch(getActiveInvitations());
    } catch (error) {
      console.error('QR check-in failed:', error);
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

  // Get status badge for invitation
  const getStatusBadge = (invitation) => {
    if (invitation.checkedInAt && !invitation.checkedOutAt) {
      return <Badge variant="success" size="sm">Checked In</Badge>;
    } else if (invitation.checkedInAt && invitation.checkedOutAt) {
      return <Badge variant="secondary" size="sm">Completed</Badge>;
    } else if (invitation.status === 'Approved') {
      return <Badge variant="warning" size="sm">Approved</Badge>;
    } else {
      return <Badge variant="info" size="sm">{invitation.status}</Badge>;
    }
  };

  // Format visitor information
  const formatVisitorInfo = (invitation) => {
    const visitor = invitation.visitor;
    if (!visitor) return 'Unknown Visitor';

    return (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-blue-600" />
        </div>
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

  // Format visit information
  const formatVisitInfo = (invitation) => {
    return (
      <div className="space-y-1">
        <div className="font-medium text-gray-900">{invitation.subject}</div>
        <div className="text-sm text-gray-600 flex items-center space-x-1">
          <CalendarIcon className="w-3 h-3" />
          <span>{formatters.formatDateTime(invitation.scheduledStartTime)}</span>
        </div>
        {invitation.location && (
          <div className="text-sm text-gray-600 flex items-center space-x-1">
            <MapPinIcon className="w-3 h-3" />
            <span>{invitation.location.name}</span>
          </div>
        )}
      </div>
    );
  };

  // Format check-in status
  const formatCheckInStatus = (invitation) => {
    if (invitation.checkedInAt && invitation.checkedOutAt) {
      const duration = new Date(invitation.checkedOutAt) - new Date(invitation.checkedInAt);
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      
      return (
        <div className="space-y-1">
          <div className="text-sm text-gray-900">
            <strong>In:</strong> {formatters.formatTime(invitation.checkedInAt)}
          </div>
          <div className="text-sm text-gray-900">
            <strong>Out:</strong> {formatters.formatTime(invitation.checkedOutAt)}
          </div>
          <div className="text-sm text-gray-500">
            Duration: {hours}h {minutes}m
          </div>
        </div>
      );
    } else if (invitation.checkedInAt) {
      const duration = new Date() - new Date(invitation.checkedInAt);
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      
      return (
        <div className="space-y-1">
          <div className="text-sm text-gray-900">
            <strong>Checked in:</strong> {formatters.formatTime(invitation.checkedInAt)}
          </div>
          <div className="text-sm text-gray-500">
            Duration: {hours}h {minutes}m
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-sm text-gray-500">
          Not checked in
        </div>
      );
    }
  };

  // Table columns for active visitors
  const columns = [
    {
      key: 'selection',
      header: '',
      width: '50px',
      sortable: false,
      render: (value, invitation) => (
        <input
          type="checkbox"
          checked={false} // Add selection state if needed
          onChange={() => {}} // Add selection handler if needed
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      )
    },
    {
      key: 'visitor',
      header: 'Visitor',
      sortable: true,
      render: (value, invitation) => formatVisitorInfo(invitation)
    },
    {
      key: 'visit',
      header: 'Visit Details',
      sortable: true,
      render: (value, invitation) => formatVisitInfo(invitation)
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, invitation) => getStatusBadge(invitation)
    },
    {
      key: 'checkin_status',
      header: 'Check-in Status',
      sortable: false,
      render: (value, invitation) => formatCheckInStatus(invitation)
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '180px',
      sortable: false,
      render: (value, invitation) => {
        const isCheckedIn = invitation.checkedInAt && !invitation.checkedOutAt;
        const canCheckIn = invitation.status === 'Approved' && !invitation.checkedInAt;
        
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedInvitation(invitation);
                // View details functionality
                console.log('View invitation details:', invitation);
              }}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              title="View details"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            
            {canCheckIn && (
              <button
                onClick={() => {
                  setSelectedInvitation(invitation);
                  setShowCheckInForm(true);
                }}
                className="text-green-600 hover:text-green-900 transition-colors"
                title="Check In"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </button>
            )}
            
            {isCheckedIn && (
              <button
                onClick={() => {
                  setSelectedInvitation(invitation);
                  handleCheckOut(invitation, 'Manual check-out');
                }}
                className="text-blue-600 hover:text-blue-900 transition-colors"
                title="Check Out"
              >
                <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

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
            <div className="p-2 bg-green-100 rounded-md">
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
            <div className="p-2 bg-blue-100 rounded-md">
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
            <div className="p-2 bg-yellow-100 rounded-md">
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
            <div className="p-2 bg-purple-100 rounded-md">
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
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scanner'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                <p className="text-gray-600 mb-6">
                  Scan visitor QR codes for quick check-in
                </p>
                <QrCodeScanner
                  onScan={handleQrScan}
                  loading={checkInLoading}
                />
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
    </div>
  );
};

export default CheckInDashboard;