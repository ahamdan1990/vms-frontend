// src/components/checkin/CheckInForm/CheckInForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

// Components
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import AutocompleteInput from '../../common/AutocompleteInput/AutocompleteInput';
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

/**
 * Manual Check-in Form Component
 * Allows staff to manually check in visitors by searching for invitations
 */
const CheckInForm = ({
  onSubmit,
  loading = false,
  className = ''
}) => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const invitations = useSelector(selectInvitationsList);
  
  // Local state
  const [searchMode, setSearchMode] = useState('invitation'); // 'invitation' or 'visitor'
  const [invitationNumber, setInvitationNumber] = useState('');
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [visitorSearchTerm, setVisitorSearchTerm] = useState('');

  // Load approved invitations on mount
  useEffect(() => {
    dispatch(getInvitations({
      status: 'Approved',
      pageSize: 100,
      sortBy: 'ScheduledStartTime',
      sortDirection: 'asc'
    }));
  }, [dispatch]);

  // Filter invitations based on search
  useEffect(() => {
    if (invitations && visitorSearchTerm.length > 2) {
      const filtered = invitations.filter(invitation => {
        const visitor = invitation.visitor;
        const searchLower = visitorSearchTerm.toLowerCase();
        console.log(invitation)
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

  // Handle invitation number search
  const handleInvitationNumberSearch = () => {
    if (!invitationNumber.trim()) return;

    const found = invitations?.find(invitation => 
      invitation.invitationNumber?.toLowerCase() === invitationNumber.toLowerCase().trim()
    );

    if (found) {
      setSelectedInvitation(found);
    } else {
      // Could show error or try to search more broadly
      alert('Invitation not found. Please check the number and try again.');
    }
  };

  // Handle invitation selection from search results
  const handleInvitationSelect = (invitation) => {
    setSelectedInvitation(invitation);
    setVisitorSearchTerm('');
    setSearchResults([]);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedInvitation) {
      await onSubmit(selectedInvitation.invitationNumber, checkInNotes);
      // Reset form
      setSelectedInvitation(null);
      setInvitationNumber('');
      setCheckInNotes('');
      setVisitorSearchTerm('');
    } else if (invitationNumber.trim()) {
      await onSubmit(invitationNumber.trim(), checkInNotes);
      // Reset form
      setInvitationNumber('');
      setCheckInNotes('');
    }
  };

  // Format invitation display
  const formatInvitationOption = (invitation) => {
    const visitor = invitation.visitor;
    return {
      label: `${visitor?.firstName} ${visitor?.lastName} - ${invitation.subject}`,
      sublabel: `#${invitation.invitationNumber} • ${formatters.formatDateTime(invitation.scheduledStartTime)}`,
      value: invitation
    };
  };

  // Get status badge
  const getStatusBadge = (invitation) => {
    if (invitation.checkedInAt && !invitation.checkedOutAt) {
      return <Badge variant="success" size="sm">Checked In</Badge>;
    } else if (invitation.status === 'Approved') {
      return <Badge variant="warning" size="sm">Approved</Badge>;
    } else {
      return <Badge variant="info" size="sm">{invitation.status}</Badge>;
    }
  };

  // Check if invitation can be checked in
  const canCheckIn = (invitation) => {
    return invitation && 
           invitation.status === 'approved' && 
           !invitation.checkedInAt &&
           new Date(invitation.scheduledStartTime) <= new Date() &&
           new Date(invitation.scheduledEndTime) >= new Date();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Mode Selector */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant={searchMode === 'invitation' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSearchMode('invitation')}
          icon={<DocumentTextIcon className="w-4 h-4" />}
        >
          By Invitation #
        </Button>
        <Button
          variant={searchMode === 'visitor' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSearchMode('visitor')}
          icon={<UserIcon className="w-4 h-4" />}
        >
          By Visitor
        </Button>
      </div>

      {/* Invitation Number Search */}
      {searchMode === 'invitation' && (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              label="Invitation Number"
              type="text"
              value={invitationNumber}
              onChange={(e) => setInvitationNumber(e.target.value)}
              placeholder="Enter invitation number..."
              onKeyPress={(e) => e.key === 'Enter' && handleInvitationNumberSearch()}
              className="flex-1"
            />
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleInvitationNumberSearch}
                disabled={!invitationNumber.trim()}
                icon={<MagnifyingGlassIcon className="w-4 h-4" />}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Visitor Search */}
      {searchMode === 'visitor' && (
        <div className="space-y-4">
          <Input
            label="Search Visitors"
            type="text"
            value={visitorSearchTerm}
            onChange={(e) => setVisitorSearchTerm(e.target.value)}
            placeholder="Search by name, email, company, or subject..."
            icon={<MagnifyingGlassIcon className="w-4 h-4" />}
          />

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
              {searchResults.map((invitation) => {
                const visitor = invitation.visitor;
                return (
                  <div
                    key={invitation.id}
                    onClick={() => handleInvitationSelect(invitation)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {visitor?.firstName} {visitor?.lastName}
                          </span>
                          {getStatusBadge(invitation)}
                        </div>
                        <div className="text-sm text-gray-600">{invitation.subject}</div>
                        <div className="text-sm text-gray-500">
                          #{invitation.invitationNumber} • {formatters.formatDateTime(invitation.scheduledStartTime)}
                        </div>
                        {visitor?.company && (
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
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

      {/* Selected Invitation Display */}
      {selectedInvitation && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Selected Invitation</h4>
              {getStatusBadge(selectedInvitation)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Visitor Information */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <UserIcon className="w-4 h-4" />
                  <span>Visitor</span>
                </h5>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>{selectedInvitation.visitor?.firstName} {selectedInvitation.visitor?.lastName}</strong>
                  </div>
                  <div className="text-gray-600">{selectedInvitation.visitor?.email}</div>
                  {selectedInvitation.visitor?.company && (
                    <div className="text-gray-600">{selectedInvitation.visitor?.company}</div>
                  )}
                </div>
              </div>

              {/* Visit Information */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Visit Details</span>
                </h5>
                <div className="space-y-1 text-sm">
                  <div><strong>{selectedInvitation.subject}</strong></div>
                  <div className="text-gray-600 flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{formatters.formatDateTime(selectedInvitation.scheduledStartTime)}</span>
                  </div>
                  {selectedInvitation.location && (
                    <div className="text-gray-600 flex items-center space-x-1">
                      <MapPinIcon className="w-3 h-3" />
                      <span>{selectedInvitation.location.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Check-in Validation */}
            {!canCheckIn(selectedInvitation) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="text-sm text-yellow-700">
                  {selectedInvitation.checkedInAt ? 
                    'This visitor is already checked in.' :
                    selectedInvitation.status !== 'approved' ?
                    'This invitation is not approved for check-in.' :
                    'This invitation is not within the scheduled time window.'
                  }
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Check-in Notes */}
      {(selectedInvitation || invitationNumber.trim()) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Notes (Optional)
          </label>
          <textarea
            value={checkInNotes}
            onChange={(e) => setCheckInNotes(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Add any notes about the check-in process..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            {checkInNotes.length}/500 characters
          </p>
        </div>
      )}

      {/* Submit Button */}
      {(selectedInvitation || invitationNumber.trim()) && (
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={loading || (selectedInvitation && !canCheckIn(selectedInvitation))}
            loading={loading}
            size="lg"
            icon={<UserPlusIcon className="w-5 h-5" />}
          >
            Check In Visitor
          </Button>
        </div>
      )}

      {/* Instructions */}
      {!selectedInvitation && !invitationNumber.trim() && (
        <div className="text-center text-sm text-gray-500">
          {searchMode === 'invitation' ? (
            <p>Enter the invitation number to search for a specific invitation.</p>
          ) : (
            <p>Search for visitors by name, email, company, or invitation subject.</p>
          )}
        </div>
      )}
    </div>
  );
};

// PropTypes validation
CheckInForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default CheckInForm;