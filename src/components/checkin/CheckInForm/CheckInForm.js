// src/components/checkin/CheckInForm/CheckInForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

// Components
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Badge from '../../common/Badge/Badge';
import Card from '../../common/Card/Card';

// Redux
import { getInvitations } from '../../../store/slices/invitationsSlice';
import { selectInvitationsList } from '../../../store/selectors/invitationSelectors';

// Icons
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Utils
import formatters from '../../../utils/formatters';
import { useToast } from '../../../hooks/useNotifications';

/**
 * Manual Check-in Form Component
 * Allows staff to manually check in visitors by searching for invitations
 */
const CheckInForm = ({
  onSubmit,
  loading = false,
  className = ''
}) => {
  const { t } = useTranslation('checkin');
  const dispatch = useDispatch();
  const toast = useToast();

  const invitations = useSelector(selectInvitationsList);

  const [searchMode, setSearchMode] = useState('invitation');
  const [invitationNumber, setInvitationNumber] = useState('');
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [visitorSearchTerm, setVisitorSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getInvitations({
      status: 'Approved',
      pageSize: 100,
      sortBy: 'ScheduledStartTime',
      sortDirection: 'asc'
    }));
  }, [dispatch]);

  useEffect(() => {
    if (invitations && visitorSearchTerm.length > 2) {
      const filtered = invitations.filter(invitation => {
        const visitor = invitation.visitor;
        const searchLower = visitorSearchTerm.toLowerCase();

        return (
          visitor?.firstName?.toLowerCase().includes(searchLower) ||
          visitor?.lastName?.toLowerCase().includes(searchLower) ||
          visitor?.email?.toLowerCase().includes(searchLower) ||
          visitor?.company?.toLowerCase().includes(searchLower) ||
          invitation.subject?.toLowerCase().includes(searchLower) ||
          invitation.invitationNumber?.toLowerCase().includes(searchLower)
        );
      });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [invitations, visitorSearchTerm]);

  const handleInvitationNumberSearch = () => {
    if (!invitationNumber.trim()) return;

    const found = invitations?.find(
      invitation => invitation.invitationNumber?.toLowerCase() === invitationNumber.toLowerCase().trim()
    );

    if (found) {
      setSelectedInvitation(found);
    } else {
      toast.error(t('manualForm.errors.notFound'));
    }
  };

  const handleInvitationSelect = (invitation) => {
    setSelectedInvitation(invitation);
    setVisitorSearchTerm('');
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (selectedInvitation) {
      await onSubmit(selectedInvitation.invitationNumber, checkInNotes);
      setSelectedInvitation(null);
      setInvitationNumber('');
      setCheckInNotes('');
      setVisitorSearchTerm('');
    } else if (invitationNumber.trim()) {
      await onSubmit(invitationNumber.trim(), checkInNotes);
      setInvitationNumber('');
      setCheckInNotes('');
    }
  };

  const getStatusBadge = (invitation) => {
    if (invitation.checkedInAt && !invitation.checkedOutAt) {
      return <Badge variant="success" size="sm">{t('manualForm.status.checkedIn')}</Badge>;
    }
    if ((invitation.status || '').toLowerCase() === 'approved') {
      return <Badge variant="warning" size="sm">{t('manualForm.status.approved')}</Badge>;
    }
    return <Badge variant="info" size="sm">{invitation.status}</Badge>;
  };

  const canCheckIn = (invitation) => {
    const normalizedStatus = (invitation?.status || '').toLowerCase();
    return (
      invitation &&
      normalizedStatus === 'approved' &&
      !invitation.checkedInAt &&
      new Date(invitation.scheduledStartTime) <= new Date() &&
      new Date(invitation.scheduledEndTime) >= new Date()
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={searchMode === 'invitation' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSearchMode('invitation')}
          icon={<DocumentTextIcon className="w-4 h-4" />}
        >
          {t('manualForm.searchModes.byInvitation')}
        </Button>
        <Button
          variant={searchMode === 'visitor' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSearchMode('visitor')}
          icon={<UserIcon className="w-4 h-4" />}
        >
          {t('manualForm.searchModes.byVisitor')}
        </Button>
      </div>

      {searchMode === 'invitation' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              label={t('manualForm.fields.invitationNumber')}
              type="text"
              value={invitationNumber}
              onChange={(e) => setInvitationNumber(e.target.value)}
              placeholder={t('manualForm.placeholders.invitationNumber')}
              onKeyDown={(e) => e.key === 'Enter' && handleInvitationNumberSearch()}
              className="flex-1"
            />
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleInvitationNumberSearch}
                disabled={!invitationNumber.trim()}
                icon={<MagnifyingGlassIcon className="w-4 h-4" />}
              >
                {t('common:buttons.search')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {searchMode === 'visitor' && (
        <div className="space-y-4">
          <Input
            label={t('manualForm.fields.searchVisitors')}
            type="text"
            value={visitorSearchTerm}
            onChange={(e) => setVisitorSearchTerm(e.target.value)}
            placeholder={t('manualForm.placeholders.searchVisitors')}
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
          />

          {searchResults.length > 0 && (
            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
              {searchResults.map((invitation) => {
                const visitor = invitation.visitor;
                return (
                  <div
                    key={invitation.id}
                    onClick={() => handleInvitationSelect(invitation)}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {visitor?.firstName} {visitor?.lastName}
                          </span>
                          {getStatusBadge(invitation)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{invitation.subject}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t('manualForm.meta.invitationEntry', {
                            number: invitation.invitationNumber,
                            time: formatters.formatDateTime(invitation.scheduledStartTime)
                          })}
                        </div>
                        {visitor?.company && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <BuildingOfficeIcon className="w-3 h-3" />
                            <span>{visitor.company}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedInvitation && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{t('manualForm.selectedInvitation')}</h4>
              {getStatusBadge(selectedInvitation)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  <span>{t('manualForm.labels.visitor')}</span>
                </h5>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>{selectedInvitation.visitor?.firstName} {selectedInvitation.visitor?.lastName}</strong>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">{selectedInvitation.visitor?.email}</div>
                  {selectedInvitation.visitor?.company && (
                    <div className="text-gray-600 dark:text-gray-300">{selectedInvitation.visitor?.company}</div>
                  )}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{t('manualForm.labels.visitDetails')}</span>
                </h5>
                <div className="space-y-1 text-sm">
                  <div><strong>{selectedInvitation.subject}</strong></div>
                  <div className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{formatters.formatDateTime(selectedInvitation.scheduledStartTime)}</span>
                  </div>
                  {selectedInvitation.location && (
                    <div className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      <span>{selectedInvitation.location.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!canCheckIn(selectedInvitation) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="text-sm text-yellow-700">
                  {selectedInvitation.checkedInAt
                    ? t('manualForm.validation.alreadyCheckedIn')
                    : (selectedInvitation.status || '').toLowerCase() !== 'approved'
                      ? t('manualForm.validation.notApproved')
                      : t('manualForm.validation.outsideWindow')}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {(selectedInvitation || invitationNumber.trim()) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('manualForm.fields.notes')}
          </label>
          <textarea
            value={checkInNotes}
            onChange={(e) => setCheckInNotes(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={t('manualForm.placeholders.notes')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('manualForm.notesCount', { count: checkInNotes.length })}
          </p>
        </div>
      )}

      {(selectedInvitation || invitationNumber.trim()) && (
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={loading || (selectedInvitation && !canCheckIn(selectedInvitation))}
            loading={loading}
            size="lg"
            icon={<UserPlusIcon className="w-5 h-5" />}
          >
            {t('manualForm.buttons.checkInVisitor')}
          </Button>
        </div>
      )}

      {!selectedInvitation && !invitationNumber.trim() && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {searchMode === 'invitation'
            ? <p>{t('manualForm.instructions.byInvitation')}</p>
            : <p>{t('manualForm.instructions.byVisitor')}</p>}
        </div>
      )}
    </div>
  );
};

CheckInForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default CheckInForm;
