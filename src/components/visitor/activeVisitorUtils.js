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

const translate = (t, key, defaultValue, options = {}) => (
  t ? t(key, { defaultValue, ...options }) : defaultValue
);

export const parseUtcDate = (dateString) => {
  if (!dateString) return null;
  const normalized = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  return new Date(normalized);
};

export const getStatusBadge = (invitation, t) => {
  if (invitation.checkedInAt && !invitation.checkedOutAt) {
    return <Badge variant="success" size="sm">{translate(t, 'common:activeVisitors.status.checkedIn', 'Checked In')}</Badge>;
  } else if (invitation.checkedInAt && invitation.checkedOutAt) {
    return <Badge variant="secondary" size="sm">{translate(t, 'common:activeVisitors.status.completed', 'Completed')}</Badge>;
  } else if (invitation.status === 'Approved') {
    return <Badge variant="warning" size="sm">{translate(t, 'common:activeVisitors.status.approved', 'Approved')}</Badge>;
  }
  return <Badge variant="info" size="sm">{invitation.status}</Badge>;
};

export const formatVisitorInfo = (invitation, t) => {
  const visitor = invitation.visitor;
  if (!visitor) return translate(t, 'common:activeVisitors.fallback.unknownVisitor', 'Unknown Visitor');

  const emailValue = visitor.email?.value || visitor.email || translate(t, 'common:activeVisitors.fallback.noEmail', 'No email');

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
        <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <div className="font-medium text-gray-900 dark:text-white">
          {visitor.fullName || `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim() || translate(t, 'common:activeVisitors.fallback.unknownVisitor', 'Unknown Visitor')}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{emailValue}</div>
        {visitor.company && (
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <BuildingOfficeIcon className="w-3 h-3" />
            <span>{visitor.company}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const formatVisitInfo = (invitation, t) => (
  <div className="space-y-1">
    <div className="font-medium text-gray-900 dark:text-white">
      {invitation.subject || invitation.purpose || translate(t, 'common:activeVisitors.fallback.visit', 'Visit')}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
      <CalendarIcon className="w-3 h-3" />
      <span>{formatters.formatDateTime(invitation.scheduledStartTime)}</span>
    </div>
    {invitation.location && (
      <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
        <MapPinIcon className="w-3 h-3" />
        <span>{invitation.location.name}</span>
      </div>
    )}
    {invitation.host?.fullName && (
      <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
        <UserIcon className="w-3 h-3" />
        <span>{translate(t, 'common:activeVisitors.labels.host', 'Host: {{name}}', { name: invitation.host.fullName })}</span>
      </div>
    )}
  </div>
);

export const formatCheckInStatus = (invitation, t) => {
  if (invitation.checkedInAt && invitation.checkedOutAt) {
    const checkInTime = parseUtcDate(invitation.checkedInAt);
    const checkOutTime = parseUtcDate(invitation.checkedOutAt);
    const duration = checkOutTime.getTime() - checkInTime.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <div className="space-y-1">
        <div className="text-sm text-gray-900 dark:text-white">
          <strong>{translate(t, 'common:activeVisitors.labels.in', 'In:')}</strong> {formatters.formatTime(invitation.checkedInAt)}
        </div>
        <div className="text-sm text-gray-900 dark:text-white">
          <strong>{translate(t, 'common:activeVisitors.labels.out', 'Out:')}</strong> {formatters.formatTime(invitation.checkedOutAt)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {translate(t, 'common:activeVisitors.labels.duration', 'Duration: {{hours}}h {{minutes}}m', { hours, minutes })}
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
          <strong>{translate(t, 'common:activeVisitors.labels.checkedIn', 'Checked in:')}</strong> {formatters.formatTime(invitation.checkedInAt)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {translate(t, 'common:activeVisitors.labels.duration', 'Duration: {{hours}}h {{minutes}}m', { hours, minutes })}
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-500 dark:text-gray-400">
      {translate(t, 'common:activeVisitors.labels.notCheckedIn', 'Not checked in')}
    </div>
  );
};

export const createActiveVisitorColumns = ({
  t,
  onViewDetails,
  onQuickCheckIn,
  onQuickCheckOut,
  onVisitorClick,
  showSelection = false,
  selectedIds = null,
  onSelectInvitation = null
} = {}) => {
  const columns = [
    {
      key: 'visitor',
      header: translate(t, 'common:activeVisitors.columns.visitor', 'Visitor'),
      sortable: true,
      render: (value, invitation) => onVisitorClick ? (
        <button
          type="button"
          onClick={() => onVisitorClick(invitation)}
          className="text-start hover:opacity-80 transition-opacity"
        >
          {formatVisitorInfo(invitation, t)}
        </button>
      ) : formatVisitorInfo(invitation, t)
    },
    {
      key: 'visit',
      header: translate(t, 'common:activeVisitors.columns.visitDetails', 'Visit Details'),
      sortable: true,
      render: (value, invitation) => formatVisitInfo(invitation, t)
    },
    {
      key: 'status',
      header: translate(t, 'common:activeVisitors.columns.status', 'Status'),
      sortable: true,
      render: (value, invitation) => getStatusBadge(invitation, t)
    },
    {
      key: 'checkin_status',
      header: translate(t, 'common:activeVisitors.columns.checkInStatus', 'Check-in Status'),
      sortable: false,
      render: (value, invitation) => formatCheckInStatus(invitation, t)
    },
    {
      key: 'actions',
      header: translate(t, 'common:activeVisitors.columns.actions', 'Actions'),
      width: '200px',
      sortable: false,
      render: (value, invitation) => {
        const isCheckedIn = invitation.checkedInAt && !invitation.checkedOutAt;
        const canCheckIn = invitation.status === 'Approved' && !invitation.checkedInAt;

        return (
          <div className="flex items-center gap-2">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(invitation)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title={translate(t, 'common:activeVisitors.actions.viewDetails', 'View details')}
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            )}

            {onQuickCheckIn && canCheckIn && (
              <button
                onClick={() => onQuickCheckIn(invitation)}
                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                title={translate(t, 'common:activeVisitors.actions.checkIn', 'Check In')}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </button>
            )}

            {onQuickCheckOut && isCheckedIn && (
              <button
                onClick={() => onQuickCheckOut(invitation)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                title={translate(t, 'common:activeVisitors.actions.checkOut', 'Check Out')}
              >
                <ArrowLeftOnRectangleIcon className="w-3.5 h-3.5" />
                {translate(t, 'common:activeVisitors.actions.checkOut', 'Check Out')}
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
      render: (value, invitation) => {
        const isCheckedIn = invitation.checkedInAt && !invitation.checkedOutAt;
        if (!isCheckedIn) return null;
        const isSelected = selectedIds ? selectedIds.has(invitation.id) : false;
        return (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectInvitation && onSelectInvitation(invitation.id)}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        );
      }
    });
  }

  return columns;
};
