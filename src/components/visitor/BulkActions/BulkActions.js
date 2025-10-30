// src/components/visitor/BulkActions/BulkActions.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import Input from '../../common/Input/Input';

// Icons
import {
  StarIcon,
  ShieldExclamationIcon,
  TrashIcon,
  EnvelopeIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * Bulk Actions Component
 * Provides bulk operations for selected visitors
 */
const BulkActions = ({
  selectedCount = 0,
  onClearSelection,
  onMarkVip,
  onRemoveVip,
  onBlacklist,
  onRemoveBlacklist,
  onDelete,
  onSendInvitation,
  loading = false,
  className = ''
}) => {
  // Modal states
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [inviteDetails, setInviteDetails] = useState({
    subject: '',
    message: '',
    visitDate: '',
    visitPurpose: ''
  });

  // Handle blacklist action
  const handleBlacklist = () => {
    if (!blacklistReason.trim()) return;
    
    onBlacklist(blacklistReason);
    setShowBlacklistModal(false);
    setBlacklistReason('');
  };

  // Handle delete action
  const handleDelete = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  // Handle send invitation
  const handleSendInvitation = () => {
    if (!inviteDetails.subject.trim()) return;
    
    onSendInvitation(inviteDetails);
    setShowInviteModal(false);
    setInviteDetails({ subject: '', message: '', visitDate: '', visitPurpose: '' });
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <CheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedCount} visitor{selectedCount !== 1 ? 's' : ''} selected
                </p>
                <button
                  onClick={onClearSelection}
                  className="text-xs text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline"
                >
                  Clear selection
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* VIP Actions */}
              {onMarkVip && (
                <Button
                  onClick={onMarkVip}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  <StarIcon className="w-4 h-4 mr-1" />
                  Mark VIP
                </Button>
              )}

              {onRemoveVip && (
                <Button
                  onClick={onRemoveVip}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  <StarIcon className="w-4 h-4 mr-1" />
                  Remove VIP
                </Button>
              )}

              {/* Blacklist Actions */}
              {onBlacklist && (
                <Button
                  onClick={() => setShowBlacklistModal(true)}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <ShieldExclamationIcon className="w-4 h-4 mr-1" />
                  Blacklist
                </Button>
              )}

              {onRemoveBlacklist && (
                <Button
                  onClick={onRemoveBlacklist}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <ShieldExclamationIcon className="w-4 h-4 mr-1" />
                  Remove Blacklist
                </Button>
              )}

              {/* Send Invitation */}
              {onSendInvitation && (
                <Button
                  onClick={() => setShowInviteModal(true)}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <EnvelopeIcon className="w-4 h-4 mr-1" />
                  Send Invite
                </Button>
              )}

              {/* Delete */}
              {onDelete && (
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Blacklist Modal */}
      <Modal
        isOpen={showBlacklistModal}
        onClose={() => setShowBlacklistModal(false)}
        title="Blacklist Visitors"
        size="md"
      >
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Blacklist {selectedCount} visitor{selectedCount !== 1 ? 's' : ''}?
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Blacklisted visitors will be restricted from future visits. Please provide a reason for this action.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blacklist Reason *
            </label>
            <Input
              type="text"
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              placeholder="Enter reason for blacklisting..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowBlacklistModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBlacklist}
              variant="danger"
              disabled={!blacklistReason.trim() || loading}
              loading={loading}
            >
              Blacklist {selectedCount} Visitor{selectedCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Visitors"
        size="md"
      >
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Delete {selectedCount} visitor{selectedCount !== 1 ? 's' : ''}?
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This action cannot be undone. All visitor data, including documents and visit history, will be permanently removed.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              loading={loading}
            >
              Delete {selectedCount} Visitor{selectedCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Send Invitation Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Send Invitations"
        size="lg"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send invitations to {selectedCount} selected visitor{selectedCount !== 1 ? 's' : ''}.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <Input
                type="text"
                value={inviteDetails.subject}
                onChange={(e) => setInviteDetails(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Invitation subject..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={inviteDetails.message}
                onChange={(e) => setInviteDetails(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Invitation message..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visit Date
                </label>
                <Input
                  type="date"
                  value={inviteDetails.visitDate}
                  onChange={(e) => setInviteDetails(prev => ({ ...prev, visitDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visit Purpose
                </label>
                <Input
                  type="text"
                  value={inviteDetails.visitPurpose}
                  onChange={(e) => setInviteDetails(prev => ({ ...prev, visitPurpose: e.target.value }))}
                  placeholder="Meeting, conference, etc."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setShowInviteModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvitation}
              variant="primary"
              disabled={!inviteDetails.subject.trim() || loading}
              loading={loading}
            >
              Send {selectedCount} Invitation{selectedCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

BulkActions.propTypes = {
  selectedCount: PropTypes.number,
  onClearSelection: PropTypes.func,
  onMarkVip: PropTypes.func,
  onRemoveVip: PropTypes.func,
  onBlacklist: PropTypes.func,
  onRemoveBlacklist: PropTypes.func,
  onDelete: PropTypes.func,
  onSendInvitation: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default BulkActions;
