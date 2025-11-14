// Shared helpers for rendering Active Visitors tables/cards across dashboards
import React from 'react';
import {
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  MapPinIcon,
  EyeIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import Badge from '../common/Badge/Badge';
import formatters from '../../utils/formatters';

export const parseUtcDate = (dateString) => {
  if (!dateString) return null;
  const normalized = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  return new Date(normalized);
};

export const getStatusBadge = (invitation) => {
  if (invitation.checkedInAt && !invitation.checkedOutAt) {
    return <Badge variant="success" size="sm">Checked In</Badge>;
  } else if (invitation.checkedInAt && invitation.checkedOutAt) {
    return <Badge variant="secondary" size="sm">Completed</Badge>;
  } else if (invitation.status === 'Approved') {
    return <Badge variant="warning" size="sm">Approved</Badge>;
  }
  return <Badge variant="info" size="sm">{invitation.status}</Badge>;
};

export const formatVisitorInfo = (invitation) => {
  const visitor = invitation.visitor;
  if (!visitor) return 'Unknown Visitor';

  const emailValue = visitor.email?.value || visitor.email || 'No email';

  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
        <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <div className="font-medium text-gray-900 dark:text-white">
          {visitor.fullName || `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim() || 'Unknown Visitor'}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{emailValue}</div>
        {visitor.company && (
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
            <BuildingOfficeIcon className="w-3 h-3" />
            <span>{visitor.company}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const formatVisitInfo = (invitation) => (
  <div className="space-y-1">
    <div className="font-medium text-gray-900 dark:text-white">
      {invitation.subject || invitation.purpose || 'Visit'}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-1">
      <CalendarIcon className="w-3 h-3" />
      <span>{formatters.formatDateTime(invitation.scheduledStartTime)}</span>
    </div>
    {invitation.location && (
      <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-1">
        <MapPinIcon className="w-3 h-3" />
        <span>{invitation.location.name}</span>
      </div>
    )}
    {invitation.host?.fullName && (
      <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-1">
        <UserIcon className="w-3 h-3" />
        <span>Host: {invitation.host.fullName}</span>
      </div>
    )}
  </div>
);

export const formatCheckInStatus = (invitation) => {
  if (invitation.checkedInAt && invitation.checkedOutAt) {
    const checkInTime = parseUtcDate(invitation.checkedInAt);
    const checkOutTime = parseUtcDate(invitation.checkedOutAt);
    const duration = checkOutTime.getTime() - checkInTime.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <div className="space-y-1">
        <div className="text-sm text-gray-900 dark:text-white">
          <strong>In:</strong> {formatters.formatTime(invitation.checkedInAt)}
        </div>
        <div className="text-sm text-gray-900 dark:text-white">
          <strong>Out:</strong> {formatters.formatTime(invitation.checkedOutAt)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Duration: {hours}h {minutes}m
        </div>
      </div>
    );
  }

  if (invitation.checkedInAt) {
    const checkInTime = parseUtcDate(invitation.checkedInAt);
    const now = new Date();
    const duration = now.getTime() - checkInTime.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <div className="space-y-1">
        <div className="text-sm text-gray-900 dark:text-white">
          <strong>Checked in:</strong> {formatters.formatTime(invitation.checkedInAt)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Duration: {hours}h {minutes}m
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-500 dark:text-gray-400">
      Not checked in
    </div>
  );
};

export const createActiveVisitorColumns = ({
  onViewDetails,
  onQuickCheckIn,
  onQuickCheckOut,
  showSelection = false
} = {}) => {
  const columns = [
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
      width: '200px',
      sortable: false,
      render: (value, invitation) => {
        const isCheckedIn = invitation.checkedInAt && !invitation.checkedOutAt;
        const canCheckIn = invitation.status === 'Approved' && !invitation.checkedInAt;

        return (
          <div className="flex items-center space-x-2">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(invitation)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="View details"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            )}

            {onQuickCheckIn && canCheckIn && (
              <button
                onClick={() => onQuickCheckIn(invitation)}
                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                title="Check In"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </button>
            )}

            {onQuickCheckOut && isCheckedIn && (
              <button
                onClick={() => onQuickCheckOut(invitation)}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
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

  if (showSelection) {
    columns.unshift({
      key: 'selection',
      header: '',
      width: '50px',
      sortable: false,
      render: () => (
        <input
          type="checkbox"
          checked={false}
          onChange={() => {}}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      )
    });
  }

  return columns;
};
