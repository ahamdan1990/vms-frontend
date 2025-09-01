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
  StarIcon
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
  const showCreateModal = useSelector(selectShowCreateModal);
  const showEditModal = useSelector(selectShowEditModal);
  const showDeleteModal = useSelector(selectShowDeleteModal);
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
      id: 'selection',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50
    },
    {
      id: 'name',
      header: 'Contact Information',
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex items-center space-x-3">
            {contact.isPrimary && (
              <StarIconSolid className="w-4 h-4 text-yellow-500" title="Primary Contact" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">
                {contact.firstName} {contact.lastName}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
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
        );
      }
    },
    {
      id: 'relationship',
      header: 'Relationship',
      accessorKey: 'relationship',
      cell: ({ row }) => (
        <Badge
          variant={getRelationshipBadgeVariant(row.original.relationship)}
          size="sm"
        >
          {row.original.relationship || 'Other'}
        </Badge>
      )
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorKey: 'priority',
      cell: ({ row }) => {
        const contact = row.original;
        if (contact.isPrimary) {
          return <Badge variant="warning" size="sm">Primary</Badge>;
        }
        return contact.priority ? (
          <span className="text-sm text-gray-900">#{contact.priority}</span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex items-center space-x-2">
            {canUpdate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(showEditModal(contact))}
                className="text-blue-600 hover:text-blue-800"
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
            )}
            
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(showDeleteModal(contact))}
                className="text-red-600 hover:text-red-800"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 100
    }
  ];
  if (!canRead) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
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
            <h2 className="text-xl font-bold text-gray-900">Emergency Contacts</h2>
            {visitorName && (
              <p className="mt-1 text-sm text-gray-500">
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
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <StarIconSolid className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Primary Contact</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.primary > 0 ? 'Set' : 'Missing'}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">With Phone</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.withPhone}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <div className="text-purple-600 font-bold text-sm">{stats.completionRate}%</div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completion</dt>
                  <dd className="text-lg font-medium text-gray-900">
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
              <span className="text-sm text-gray-500">
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
                  className="text-red-600 border-red-300 hover:bg-red-50"
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
            onRowSelectionChange={(selectedRowIds) => {
              const selectedIds = Object.keys(selectedRowIds).filter(id => selectedRowIds[id]);
              dispatch(setSelectedContacts(selectedIds.map(Number)));
            }}
            emptyMessage={
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No emergency contacts</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add emergency contacts to ensure visitor safety and compliance.
                </p>
                {canCreate && (
                  <div className="mt-6">
                    <Button
                      onClick={() => dispatch(showCreateModal())}
                      icon={<PlusIcon className="w-5 h-5" />}
                    >
                      Add Emergency Contact
                    </Button>
                  </div>
                )}
              </div>
            }
            className="emergency-contacts-table"
          />
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
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
        isOpen={showEditModal}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
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