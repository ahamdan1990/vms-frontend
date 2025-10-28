// src/components/checkin/InvitationDetailsModal/InvitationDetailsModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// Components
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';
import Input from '../../common/Input/Input';

// Icons
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';

// Utils
import formatters from '../../../utils/formatters';

/**
 * Invitation Details Modal Component
 * Shows invitation and visitor details with check-in decision options
 */
const InvitationDetailsModal = ({
  isOpen,
  onClose,
  invitation,
  error,
  onConfirmCheckIn,
  loading = false
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Error state - show error dialog
  if (error) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Check-in Error"
        size="md"
      >
        <div className="text-center py-6">
          <ExclamationTriangleIconSolid className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Check-in Failed</h3>
          <p className="text-gray-600 mb-6">
            {error.message || 'Unable to process check-in at this time.'}
          </p>
          {error.details && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-red-700">
                {error.details}
              </p>
            </div>
          )}
          <Button
            variant="primary"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  // No invitation data - show not found
  if (!invitation) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Invitation Not Found"
        size="md"
      >
        <div className="text-center py-6">
          <InformationCircleIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invitation Not Found</h3>
          <p className="text-gray-600 mb-6">
            The scanned QR code does not match any invitation in the system.
          </p>
          <Button
            variant="primary"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  // Get visitor info
  const visitor = invitation.visitor || {};
  const host = invitation.host || {};
  const location = invitation.location || {};
  const visitPurpose = invitation.visitPurpose || {};

  // Check if invitation is already checked in
  const isCheckedIn = invitation.checkedInAt && !invitation.checkedOutAt;
  const isCompleted = invitation.checkedInAt && invitation.checkedOutAt;

  // Check timing issues
  const now = new Date();
  const scheduledStart = new Date(invitation.scheduledStartTime);
  const scheduledEnd = new Date(invitation.scheduledEndTime);
  const twoHoursBeforeStart = new Date(scheduledStart.getTime() - 2 * 60 * 60 * 1000);
  const twentyFourHoursAfterEnd = new Date(scheduledEnd.getTime() + 24 * 60 * 60 * 1000);

  const isTooEarly = now < twoHoursBeforeStart;
  const isExpired = now > twentyFourHoursAfterEnd;
  const isEarlyButAllowed = now >= twoHoursBeforeStart && now < scheduledStart;
  const isLateButAllowed = now > scheduledEnd && now <= twentyFourHoursAfterEnd;

  // Check if status is approved (case-insensitive)
  const isApproved = invitation.status?.toLowerCase() === 'approved';
  const canCheckIn = !isCheckedIn && !isCompleted && !isTooEarly && !isExpired && isApproved;

  // Get status badge
  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge color="gray" size="sm">Completed</Badge>;
    }
    if (isCheckedIn) {
      return <Badge color="green" size="sm">Checked In</Badge>;
    }
    if (invitation.status?.toLowerCase() === 'approved') {
      return <Badge color="blue" size="sm">Approved</Badge>;
    }
    if (invitation.status?.toLowerCase() === 'pending') {
      return <Badge color="yellow" size="sm">Pending</Badge>;
    }
    return <Badge color="gray" size="sm">{invitation.status}</Badge>;
  };

  // Handle check-in confirmation
  const handleConfirmCheckIn = () => {
    onConfirmCheckIn(invitation.invitationNumber || invitation.qrCode, notes);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Visitor Check-in Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header with Status */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {invitation.invitationNumber}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Invitation Reference
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Too Early Warning - Cannot Check In */}
        {isTooEarly && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start">
            <ExclamationTriangleIconSolid className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-900 font-bold text-sm">⚠️ TOO EARLY - CANNOT CHECK IN</h4>
              <p className="text-red-800 text-sm mt-1 font-medium">
                This visitor is arriving too early.
              </p>
              <p className="text-red-700 text-sm mt-1">
                <strong>Scheduled time:</strong> {formatters.formatDateTime(scheduledStart)}
              </p>
              <p className="text-red-700 text-sm mt-1">
                <strong>Check-in allowed from:</strong> {formatters.formatDateTime(twoHoursBeforeStart)}
              </p>
            </div>
          </div>
        )}

        {/* Expired Warning - Cannot Check In */}
        {isExpired && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start">
            <ExclamationTriangleIconSolid className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-900 font-bold text-sm">⚠️ EXPIRED - CANNOT CHECK IN</h4>
              <p className="text-red-800 text-sm mt-1 font-medium">
                This invitation has expired.
              </p>
              <p className="text-red-700 text-sm mt-1">
                <strong>Scheduled end time:</strong> {formatters.formatDateTime(scheduledEnd)}
              </p>
              <p className="text-red-700 text-sm mt-1">
                <strong>Expired on:</strong> {formatters.formatDateTime(twentyFourHoursAfterEnd)}
              </p>
            </div>
          </div>
        )}

        {/* Early Arrival Notice - Can Still Check In */}
        {isEarlyButAllowed && !isCheckedIn && !isCompleted && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 flex items-start">
            <ClockIcon className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-yellow-900 font-bold text-sm">🕐 EARLY ARRIVAL</h4>
              <p className="text-yellow-800 text-sm mt-1 font-medium">
                Visitor arrived early!
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                <strong>Scheduled time:</strong> {formatters.formatDateTime(scheduledStart)}
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                ✅ They can be checked in now, but please notify the host that the visitor has arrived early.
              </p>
            </div>
          </div>
        )}

        {/* Late Arrival Notice - Can Still Check In */}
        {isLateButAllowed && !isCheckedIn && !isCompleted && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 flex items-start">
            <ClockIcon className="h-6 w-6 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-orange-900 font-bold text-sm">🕐 LATE ARRIVAL</h4>
              <p className="text-orange-800 text-sm mt-1 font-medium">
                Visitor arrived late!
              </p>
              <p className="text-orange-700 text-sm mt-1">
                <strong>Scheduled time:</strong> {formatters.formatDateTime(scheduledStart)}
              </p>
              <p className="text-orange-700 text-sm mt-1">
                ⚠️ They can still be checked in. Consider contacting the host to confirm.
              </p>
            </div>
          </div>
        )}

        {/* Not Approved Warning */}
        {!isApproved && !isCheckedIn && !isCompleted && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start">
            <ExclamationTriangleIconSolid className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-900 font-bold text-sm">⚠️ NOT APPROVED - CANNOT CHECK IN</h4>
              <p className="text-red-800 text-sm mt-1 font-medium">
                Current status: <strong>{invitation.status}</strong>
              </p>
              <p className="text-red-700 text-sm mt-1">
                This invitation must be approved before check-in is allowed.
              </p>
            </div>
          </div>
        )}

        {/* Already Checked In Warning */}
        {isCheckedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <CheckCircleIconSolid className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-900 font-medium text-sm">Already Checked In</h4>
              <p className="text-blue-700 text-sm mt-1">
                This visitor has already been checked in at {formatters.formatDateTime(invitation.checkedInAt)}
              </p>
            </div>
          </div>
        )}

        {/* Completed Visit Warning */}
        {isCompleted && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-gray-900 font-medium text-sm">Visit Completed</h4>
              <p className="text-gray-700 text-sm mt-1">
                This visitor checked out at {formatters.formatDateTime(invitation.checkedOutAt)}
              </p>
            </div>
          </div>
        )}

        {/* Visitor Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Visitor Information
          </h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-sm font-medium text-gray-900">
                {visitor.fullName || `${visitor.firstName} ${visitor.lastName}`}
              </p>
            </div>
            {visitor.company && (
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="text-sm font-medium text-gray-900">{visitor.company}</p>
              </div>
            )}
            {visitor.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-sm font-medium text-gray-900">{visitor.email}</p>
                </div>
              </div>
            )}
            {visitor.phoneNumber && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-sm font-medium text-gray-900">{visitor.phoneNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visit Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Visit Details
          </h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Scheduled Time</p>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                <p className="text-sm font-medium text-gray-900">
                  {formatters.formatDateTime(invitation.scheduledStartTime)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Time</p>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                <p className="text-sm font-medium text-gray-900">
                  {formatters.formatDateTime(invitation.scheduledEndTime)}
                </p>
              </div>
            </div>
            {location.name && (
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-sm font-medium text-gray-900">{location.name}</p>
                </div>
              </div>
            )}
            {visitPurpose.name && (
              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-sm font-medium text-gray-900">{visitPurpose.name}</p>
                </div>
              </div>
            )}
            {host.fullName && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Host</p>
                <p className="text-sm font-medium text-gray-900">{host.fullName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes Input (only if not checked in yet) */}
        {!isCheckedIn && !isCompleted && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this check-in..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {canCheckIn ? 'Cancel' : 'Close'}
          </Button>
          {canCheckIn && (
            <Button
              variant="primary"
              onClick={handleConfirmCheckIn}
              loading={loading}
              icon={<CheckCircleIcon className="h-5 w-5" />}
              iconPosition="left"
            >
              Confirm Check-in
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

InvitationDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  invitation: PropTypes.object,
  error: PropTypes.object,
  onConfirmCheckIn: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default InvitationDetailsModal;
