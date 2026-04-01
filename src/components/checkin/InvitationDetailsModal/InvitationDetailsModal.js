// src/components/checkin/InvitationDetailsModal/InvitationDetailsModal.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// Components
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';

// Icons
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  BellAlertIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';

// Utils
import formatters from '../../../utils/formatters';
import { InvitationStatus, InvitationStatusLabels } from '../../../constants/invitationStatus';

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
  onRequestLateCheckIn,
  onOverrideCheckIn,
  canOverride = false,
  lateCheckInRequested = false,
  lateCheckInLoading = false,
  loading = false
}) => {
  const { t } = useTranslation('checkin');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  if (error) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('invitationModal.error.title')}
        size="md"
      >
        <div className="text-center py-6">
          <ExclamationTriangleIconSolid className="mx-auto h-16 w-16 text-red-500 dark:text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('invitationModal.error.heading')}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error.message || t('invitationModal.error.defaultMessage')}
          </p>
          {error.details && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-start">
              <p className="text-sm text-red-700 dark:text-red-300">{error.details}</p>
            </div>
          )}
          <Button variant="primary" onClick={onClose} className="w-full">
            {t('common:buttons.close')}
          </Button>
        </div>
      </Modal>
    );
  }

  if (!invitation) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('invitationModal.notFound.title')}
        size="md"
      >
        <div className="text-center py-6">
          <InformationCircleIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('invitationModal.notFound.heading')}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('invitationModal.notFound.description')}
          </p>
          <Button variant="primary" onClick={onClose} className="w-full">
            {t('common:buttons.close')}
          </Button>
        </div>
      </Modal>
    );
  }

  const visitor = invitation.visitor || {};
  const host = invitation.host || {};
  const location = invitation.location || {};
  const visitPurpose = invitation.visitPurpose || {};

  const isCheckedIn = invitation.checkedInAt && !invitation.checkedOutAt;
  const isCompleted = invitation.checkedInAt && invitation.checkedOutAt;

  const now = new Date();
  const scheduledStart = new Date(invitation.scheduledStartTime);
  const scheduledEnd = new Date(invitation.scheduledEndTime);
  const twoHoursBeforeStart = new Date(scheduledStart.getTime() - 2 * 60 * 60 * 1000);

  const isTooEarly = now < twoHoursBeforeStart;
  const isEarlyButAllowed = now >= twoHoursBeforeStart && now < scheduledStart;
  const isLateButAllowed = now > scheduledEnd && invitation.status === InvitationStatus.Approved;

  const isExpired = invitation.isExpired || invitation.status === InvitationStatus.Expired;
  const isApproved = invitation.status === InvitationStatus.Approved;
  const canCheckIn = !isCheckedIn && !isCompleted && !isTooEarly && !isExpired && isApproved;

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge color="gray" size="sm">{t('invitationModal.status.completed')}</Badge>;
    }
    if (isCheckedIn) {
      return <Badge color="green" size="sm">{t('invitationModal.status.checkedIn')}</Badge>;
    }
    if (invitation.status === InvitationStatus.Approved) {
      return <Badge color="blue" size="sm">{t('invitationModal.status.approved')}</Badge>;
    }
    if (invitation.status === InvitationStatus.Submitted || invitation.status === InvitationStatus.UnderReview) {
      return <Badge color="yellow" size="sm">{t('invitationModal.status.pendingApproval')}</Badge>;
    }
    if (invitation.status === InvitationStatus.Expired) {
      return <Badge color="orange" size="sm">{t('invitationModal.status.expired')}</Badge>;
    }
    return <Badge color="gray" size="sm">{InvitationStatusLabels[invitation.status] ?? invitation.status}</Badge>;
  };

  const handleConfirmCheckIn = () => {
    onConfirmCheckIn(invitation.invitationNumber || invitation.qrCode, notes);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('invitationModal.title')}
      size="xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{invitation.invitationNumber}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('invitationModal.invitationReference')}</p>
          </div>
          {getStatusBadge()}
        </div>

        {isTooEarly && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4 flex items-start">
            <ExclamationTriangleIconSolid className="h-6 w-6 text-red-600 dark:text-red-400 me-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-900 dark:text-red-200 font-bold text-sm">{t('invitationModal.tooEarly.title')}</h4>
              <p className="text-red-800 dark:text-red-300 text-sm mt-1 font-medium">{t('invitationModal.tooEarly.description')}</p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                <strong>{t('invitationModal.tooEarly.scheduledTimeLabel')}</strong> {formatters.formatDateTime(scheduledStart)}
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                <strong>{t('invitationModal.tooEarly.allowedFromLabel')}</strong> {formatters.formatDateTime(twoHoursBeforeStart)}
              </p>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4 flex items-start">
            <ExclamationTriangleIconSolid className="h-6 w-6 text-red-600 dark:text-red-400 me-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-900 dark:text-red-200 font-bold text-sm">{t('invitationModal.expired.title')}</h4>
              <p className="text-red-800 dark:text-red-300 text-sm mt-1 font-medium">{t('invitationModal.expired.description')}</p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                <strong>{t('invitationModal.expired.scheduledEndLabel')}</strong> {formatters.formatDateTime(scheduledEnd)}
              </p>
            </div>
          </div>
        )}

        {isEarlyButAllowed && !isCheckedIn && !isCompleted && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-800 rounded-lg p-4 flex items-start">
            <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 me-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-yellow-900 dark:text-yellow-200 font-bold text-sm">{t('invitationModal.earlyArrival.title')}</h4>
              <p className="text-yellow-800 dark:text-yellow-300 text-sm mt-1 font-medium">{t('invitationModal.earlyArrival.description')}</p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                <strong>{t('invitationModal.earlyArrival.scheduledTimeLabel')}</strong> {formatters.formatDateTime(scheduledStart)}
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">{t('invitationModal.earlyArrival.allowedNotice')}</p>
            </div>
          </div>
        )}

        {isLateButAllowed && !isCheckedIn && !isCompleted && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-800 rounded-lg p-4 flex items-start">
            <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400 me-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-orange-900 dark:text-orange-200 font-bold text-sm">{t('invitationModal.lateArrival.title')}</h4>
              <p className="text-orange-800 dark:text-orange-300 text-sm mt-1 font-medium">{t('invitationModal.lateArrival.description')}</p>
              <div className="mt-2 space-y-1">
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  <strong>{t('invitationModal.lateArrival.originalScheduleLabel')}</strong> {formatters.formatDateTime(scheduledStart)} - {formatters.formatTime(scheduledEnd)}
                </p>
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  <strong>{t('invitationModal.lateArrival.scheduledDurationLabel')}</strong> {formatters.formatDuration(Math.round((scheduledEnd - scheduledStart) / (1000 * 60)))}
                </p>
              </div>
              <div className="mt-3 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded p-3">
                <p className="text-orange-900 dark:text-orange-200 text-sm font-medium">{t('invitationModal.lateArrival.whatHappensTitle')}</p>
                <ul className="mt-2 space-y-1 text-orange-800 dark:text-orange-300 text-sm list-disc list-inside">
                  <li>{t('invitationModal.lateArrival.points.recalculateEndTime')}</li>
                  <li>{t('invitationModal.lateArrival.points.adjustedNotifications')}</li>
                  <li>{t('invitationModal.lateArrival.points.contactHost')}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {!isApproved && !isExpired && !isCheckedIn && !isCompleted && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-4 flex items-start">
            <ExclamationTriangleIconSolid className="h-6 w-6 text-red-600 dark:text-red-400 me-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-900 dark:text-red-200 font-bold text-sm">{t('invitationModal.notApproved.title')}</h4>
              <p className="text-red-800 dark:text-red-300 text-sm mt-1 font-medium">
                {t('invitationModal.notApproved.currentStatus', { status: InvitationStatusLabels[invitation.status] ?? invitation.status })}
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{t('invitationModal.notApproved.description')}</p>
            </div>
          </div>
        )}

        {isCheckedIn && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start">
            <CheckCircleIconSolid className="h-5 w-5 text-blue-600 dark:text-blue-400 me-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-900 dark:text-blue-200 font-medium text-sm">{t('invitationModal.alreadyCheckedIn.title')}</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                {t('invitationModal.alreadyCheckedIn.description', { time: formatters.formatDateTime(invitation.checkedInAt) })}
              </p>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 me-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-gray-900 dark:text-gray-200 font-medium text-sm">{t('invitationModal.completedVisit.title')}</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                {t('invitationModal.completedVisit.description', { time: formatters.formatDateTime(invitation.checkedOutAt) })}
              </p>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserIcon className="h-5 w-5 me-2 text-gray-900 dark:text-white" />
            {t('details.visitorInfo')}
          </h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('invitationModal.labels.name')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {visitor.fullName || `${visitor.firstName} ${visitor.lastName}`}
              </p>
            </div>
            {visitor.company && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('details.company')}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{visitor.company}</p>
              </div>
            )}
            {visitor.email && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('details.email')}</p>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 me-1" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{visitor.email}</p>
                </div>
              </div>
            )}
            {visitor.phoneNumber && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('details.phone')}</p>
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 me-1" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{visitor.phoneNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 me-2 text-gray-900 dark:text-white" />
            {t('invitationModal.visitDetailsTitle')}
          </h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('details.scheduledTime')}</p>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 me-1" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatters.formatDateTime(invitation.scheduledStartTime)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('invitationModal.labels.endTime')}</p>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 me-1" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatters.formatDateTime(invitation.scheduledEndTime)}
                </p>
              </div>
            </div>
            {location.name && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('details.location')}</p>
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 me-1" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{location.name}</p>
                </div>
              </div>
            )}
            {visitPurpose.name && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('details.purpose')}</p>
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 me-1" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{visitPurpose.name}</p>
                </div>
              </div>
            )}
            {host.fullName && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('details.host')}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{host.fullName}</p>
              </div>
            )}
          </div>
        </div>

        {!isCheckedIn && !isCompleted && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('invitationModal.notes.label')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('invitationModal.notes.placeholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        )}

        {isExpired && !isCheckedIn && !isCompleted && lateCheckInRequested && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-2">
            <BellAlertIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              {t('invitationModal.lateCheckIn.requestSent')}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={loading || lateCheckInLoading}>
            {canCheckIn ? t('common:buttons.cancel') : t('common:buttons.close')}
          </Button>

          {isExpired && !isCheckedIn && !isCompleted && canOverride && (
            <Button
              variant="danger"
              onClick={() => onOverrideCheckIn && onOverrideCheckIn(notes)}
              loading={lateCheckInLoading}
              icon={<ShieldExclamationIcon className="h-5 w-5" />}
              iconPosition="left"
            >
              {t('invitationModal.actions.overrideCheckIn')}
            </Button>
          )}

          {isExpired && !isCheckedIn && !isCompleted && !canOverride && !lateCheckInRequested && (
            <Button
              variant="warning"
              onClick={() => onRequestLateCheckIn && onRequestLateCheckIn(notes)}
              loading={lateCheckInLoading}
              icon={<BellAlertIcon className="h-5 w-5" />}
              iconPosition="left"
            >
              {t('invitationModal.actions.requestHostConsent')}
            </Button>
          )}

          {canCheckIn && (
            <Button
              variant="primary"
              onClick={handleConfirmCheckIn}
              loading={loading}
              icon={<CheckCircleIcon className="h-5 w-5" />}
              iconPosition="left"
            >
              {t('invitationModal.actions.confirmCheckIn')}
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
  onRequestLateCheckIn: PropTypes.func,
  onOverrideCheckIn: PropTypes.func,
  canOverride: PropTypes.bool,
  lateCheckInRequested: PropTypes.bool,
  lateCheckInLoading: PropTypes.bool,
  loading: PropTypes.bool
};

export default InvitationDetailsModal;
