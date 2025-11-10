// src/components/visitor/EmergencyContactsList/EmergencyContactsList.js
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../../../hooks/usePermissions';

// Redux actions and selectors
import {
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  setSelectedContacts,
  toggleContactSelection,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  clearError,
  clearContactData
} from '../../../store/slices/emergencyContactsSlice';

import {
  selectSortedEmergencyContacts,
  selectEmergencyContactsListLoading,
  selectEmergencyContactsCreateLoading,
  selectEmergencyContactsUpdateLoading,
  selectEmergencyContactsDeleteLoading,
  selectSelectedContacts,
  selectShowCreateModal,
  selectShowEditModal,
  selectShowDeleteModal,
  selectCurrentContact,
  selectEmergencyContactsCreateError,
  selectEmergencyContactsUpdateError,
  selectEmergencyContactsDeleteError,
  selectHasSelectedContacts,
  selectSelectedContactsCount,
  selectPrimaryEmergencyContact,
  selectEmergencyContactStats,
  selectEmergencyContactSummary
} from '../../../store/selectors/emergencyContactSelectors';

// Components
import Button from '../../common/Button/Button';
import Table from '../../common/Table/Table';
import Modal, { ConfirmModal } from '../../common/Modal/Modal';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Badge from '../../common/Badge/Badge';
import Card from '../../common/Card/Card';
import EmergencyContactForm from '../EmergencyContactForm/EmergencyContactForm';

// Icons
import { 
  PlusIcon, 
  TrashIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Utils
import formatters from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Emergency Contacts List Component
 * Manages emergency contacts for a specific visitor
 * Provides CRUD operations with primary contact designation
 */
const EmergencyContactsList = ({ 
  visitorId, 
  visitorName = '',
  showHeader = true,
  isEmbedded = false,
  maxHeight = null 
}) => {
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();

  // Local state
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [viewContact, setViewContact] = useState(null);

  // Permissions
  const canRead = hasPermission('EmergencyContact.Read');
  const canCreate = hasPermission('EmergencyContact.Create');
  const canUpdate = hasPermission('EmergencyContact.Update');
  const canDelete = hasPermission('EmergencyContact.Delete');

  // Redux selectors
  const contacts = useSelector(selectSortedEmergencyContacts);
  const listLoading = useSelector(selectEmergencyContactsListLoading);
  const createLoading = useSelector(selectEmergencyContactsCreateLoading);
  const updateLoading = useSelector(selectEmergencyContactsUpdateLoading);
  const deleteLoading = useSelector(selectEmergencyContactsDeleteLoading);
  const selectedContacts = useSelector(selectSelectedContacts);
  const isShowCreateModal = useSelector(selectShowCreateModal);
  const isShowEditModal = useSelector(selectShowEditModal);
  const isShowDeleteModal = useSelector(selectShowDeleteModal);
  const currentContact = useSelector(selectCurrentContact);
  const createError = useSelector(selectEmergencyContactsCreateError);
  const updateError = useSelector(selectEmergencyContactsUpdateError);
  const deleteError = useSelector(selectEmergencyContactsDeleteError);
  const hasSelected = useSelector(selectHasSelectedContacts);
  const selectedCount = useSelector(selectSelectedContactsCount);
  const primaryContact = useSelector(selectPrimaryEmergencyContact);
  const stats = useSelector(selectEmergencyContactStats);
  const summary = useSelector(selectEmergencyContactSummary);

  // Load contacts when visitor changes
  useEffect(() => {
    if (visitorId && canRead) {
      dispatch(getEmergencyContacts({ visitorId }));
    }
    
    return () => {
      // Clear data when component unmounts
      if (!isEmbedded) {
        dispatch(clearContactData());
      }
    };
  }, [dispatch, visitorId, canRead, isEmbedded]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Event handlers
  const handleCreateContact = async (contactData) => {
    try {
      await dispatch(createEmergencyContact({ visitorId, contactData })).unwrap();
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Create emergency contact failed:', error);
    }
  };

  const handleUpdateContact = async (contactData) => {
    try {
      await dispatch(updateEmergencyContact({ 
        visitorId, 
        contactId: currentContact.id, 
        contactData 
      })).unwrap();
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Update emergency contact failed:', error);
    }
  };

  const handleDeleteContact = async (permanentDelete = false) => {
    try {
      await dispatch(deleteEmergencyContact({ 
        visitorId, 
        contactId: currentContact.id, 
        permanentDelete 
      })).unwrap();
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Delete emergency contact failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedContacts.map(contactId => 
        dispatch(deleteEmergencyContact({ visitorId, contactId, permanentDelete: false })).unwrap()
      );
      await Promise.all(deletePromises);
      dispatch(clearSelections());
      setShowBulkConfirm(false);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  // Helper function to get relationship badge color
  const getRelationshipBadgeVariant = (relationship) => {
    switch (relationship?.toLowerCase()) {
      case 'spouse':
      case 'partner':
        return 'success';
      case 'parent':
      case 'child':
        return 'primary';
      case 'sibling':
        return 'secondary';
      case 'friend':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      header: 'Contact Information',
      sortable: true,
      render: (value, contact) => (
        <div className="flex items-center space-x-3">
          {contact.isPrimary && (
            <StarIconSolid className="w-4 h-4 text-yellow-500" title="Primary Contact" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white">
              {contact.firstName} {contact.lastName}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-300">
              {contact.phoneNumber && (
                <div className="flex items-center space-x-1">
                  <PhoneIcon className="w-3 h-3" />
                  <span>{contact.phoneNumber}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center space-x-1">
                  <EnvelopeIcon className="w-3 h-3" />
                  <span className="truncate">{contact.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'relationship',
      header: 'Relationship',
      sortable: true,
      render: (relationship, contact) => (
        <Badge
          variant={getRelationshipBadgeVariant(relationship)}
          size="sm"
        >
          {relationship || 'Other'}
        </Badge>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (priority, contact) => {
        if (contact.isPrimary) {
          return <Badge variant="warning" size="sm">Primary</Badge>;
        }
        return priority ? (
          <span className="text-sm text-gray-900 dark:text-white">#{priority}</span>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (value, contact) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setViewContact(contact);
            }}
            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>

          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(showEditModal(contact));
              }}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(showDeleteModal(contact));
              }}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];
  if (!canRead) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500 dark:text-gray-300">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You don't have permission to view emergency contacts.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Emergency Contacts</h2>
            {visitorName && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Emergency contacts for {visitorName}
              </p>
            )}
            {summary && (
              <div className="mt-2">
                <Badge
                  variant={summary.urgency === 'high' ? 'danger' : summary.urgency === 'medium' ? 'warning' : 'success'}
                  size="sm"
                >
                  {summary.message}
                </Badge>
              </div>
            )}
          </div>
          <div className="mt-4 sm:mt-0">
            {canCreate && (
              <Button
                onClick={() => dispatch(showCreateModal())}
                loading={createLoading}
                icon={<PlusIcon className="w-5 h-5" />}
              >
                Add Emergency Contact
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Statistics (if not embedded) */}
      {!isEmbedded && stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Contacts</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <StarIconSolid className="w-5 h-5 text-yellow-600 dark:text-yellow-300" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Primary Contact</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.primary > 0 ? 'Set' : 'Missing'}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-green-600 dark:text-green-300" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">With Phone</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.withPhone}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <div className="text-purple-600 dark:text-purple-200 font-bold text-sm">{stats.completionRate}%</div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completion</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    <Badge
                      variant={stats.completionRate >= 80 ? 'success' : stats.completionRate >= 50 ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {stats.completionRate}%
                    </Badge>
                  </dd>
                </dl>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bulk Actions */}
      {hasSelected && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-300">
                {selectedCount} contact{selectedCount !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                Clear Selection
              </Button>
            </div>
            
            {canDelete && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('delete');
                    setShowBulkConfirm(true);
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-500 dark:hover:bg-red-500/10"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Main Table */}
      <Card style={maxHeight ? { maxHeight, overflow: 'auto' } : {}}>
        {listLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <Table
            data={contacts}
            columns={columns}
            loading={listLoading}
            emptyMessage="No emergency contacts found. Add emergency contacts to ensure visitor safety and compliance."
            hover={true}
            striped={false}
            className="emergency-contacts-table"
          />
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={isShowCreateModal}
        onClose={() => dispatch(hideCreateModal())}
        title="Add Emergency Contact"
        size="lg"
      >
        <EmergencyContactForm
          onSubmit={handleCreateContact}
          onCancel={() => dispatch(hideCreateModal())}
          loading={createLoading}
          error={createError}
          existingContacts={contacts}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isShowEditModal}
        onClose={() => dispatch(hideEditModal())}
        title="Edit Emergency Contact"
        size="lg"
      >
        {currentContact && (
          <EmergencyContactForm
            initialData={currentContact}
            onSubmit={handleUpdateContact}
            onCancel={() => dispatch(hideEditModal())}
            loading={updateLoading}
            error={updateError}
            existingContacts={contacts}
            isEdit={true}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewContact}
        onClose={() => setViewContact(null)}
        title="Emergency Contact Details"
        size="lg"
      >
        {viewContact && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  {viewContact.isPrimary && (
                    <Badge variant="warning" size="sm">Primary</Badge>
                  )}
                  {viewContact.relationship && (
                    <Badge variant="secondary" size="sm">{viewContact.relationship}</Badge>
                  )}
                  {viewContact.priority && (
                    <Badge variant="info" size="sm">Priority #{viewContact.priority}</Badge>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                  {viewContact.firstName} {viewContact.lastName}
                </h3>
                {viewContact.notes && (
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    {viewContact.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Phone Number', value: viewContact.phoneNumber },
                { label: 'Alternate Phone', value: viewContact.alternatePhoneNumber },
                { label: 'Email', value: viewContact.email },
                { label: 'Relationship', value: viewContact.relationship },
                { label: 'Priority', value: viewContact.priority ? `#${viewContact.priority}` : 'Not set' },
                { label: 'Primary Contact', value: viewContact.isPrimary ? 'Yes' : 'No' }
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/60"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 break-words">
                    {item.value || '—'}
                  </p>
                </div>
              ))}
            </div>

            {viewContact.address && (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Address
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {viewContact.address}
                </p>
              </div>
            )}

            {viewContact.notes && (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Notes
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 whitespace-pre-wrap">
                  {viewContact.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isShowDeleteModal}
        onClose={() => dispatch(hideDeleteModal())}
        onConfirm={() => handleDeleteContact(false)}
        title="Delete Emergency Contact"
        message={
          currentContact
            ? `Are you sure you want to delete ${currentContact.firstName} ${currentContact.lastName}? This will deactivate the contact but preserve historical data.`
            : 'Are you sure you want to delete this emergency contact?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm && bulkAction === 'delete'}
        onClose={() => {
          setShowBulkConfirm(false);
          setBulkAction('');
        }}
        onConfirm={handleBulkDelete}
        title="Delete Selected Contacts"
        message={`Are you sure you want to delete ${selectedCount} emergency contact${selectedCount !== 1 ? 's' : ''}? This will deactivate the contacts but preserve historical data.`}
        confirmText="Delete Selected"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

// PropTypes validation
EmergencyContactsList.propTypes = {
  visitorId: PropTypes.number.isRequired,
  visitorName: PropTypes.string,
  showHeader: PropTypes.bool,
  isEmbedded: PropTypes.bool,
  maxHeight: PropTypes.string
};

export default EmergencyContactsList;
