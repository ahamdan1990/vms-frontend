// src/pages/admin/roles/components/DeleteRoleModal.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../../../components/common/Modal/Modal';
import Button from '../../../../components/common/Button/Button';
import {
  updateRole,
  selectCurrentRole,
  selectUpdateLoading,
  getRoles
} from '../../../../store/slices/rolesSlice';
import { useToast } from '../../../../hooks/useNotifications';

/**
 * DeleteRoleModal - Deactivates a role (soft delete)
 * Note: Roles are never hard-deleted from the database for audit purposes
 */
const DeleteRoleModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const currentRole = useSelector(selectCurrentRole);
  const loading = useSelector(selectUpdateLoading);

  const handleDeactivate = async () => {
    if (!currentRole) {
      toast.error('No role selected');
      return;
    }

    if (currentRole.isSystemRole) {
      toast.error('System roles cannot be deactivated');
      return;
    }

    if (currentRole.userCount > 0) {
      toast.error(`Cannot deactivate role with ${currentRole.userCount} assigned user(s)`);
      return;
    }

    try {
      await dispatch(updateRole({
        roleId: currentRole.id,
        roleData: {
          displayName: currentRole.displayName || currentRole.name,
          description: currentRole.description || '',
          displayOrder: currentRole.displayOrder || 0,
          color: currentRole.color || '#3B82F6',
          icon: currentRole.icon || '🛡️',
          isActive: false
        }
      })).unwrap();

      toast.success(`Role "${currentRole.displayName || currentRole.name}" deactivated successfully`);
      onClose();

      // Refresh roles list
      dispatch(getRoles({ includeCounts: true }));
    } catch (error) {
      toast.error(error?.message || 'Failed to deactivate role');
    }
  };

  if (!currentRole) {
    return null;
  }

  const isSystemRole = currentRole.isSystemRole;
  const hasUsers = (currentRole.userCount || 0) > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deactivate Role"
      size="md"
    >
      <div className="space-y-4">
        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Are you sure you want to deactivate this role?
              </h3>
              <p className="mt-2 text-sm text-red-700">
                This action will deactivate the role <strong>"{currentRole.displayName || currentRole.name}"</strong>.
                The role will no longer be available for assignment, but historical data will be preserved.
              </p>
            </div>
          </div>
        </div>

        {/* System Role Warning */}
        {isSystemRole && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  System Role Protection
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  This is a system role and cannot be deactivated. System roles are required for core functionality.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users Assigned Warning */}
        {hasUsers && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Users Assigned
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  This role has <strong>{currentRole.userCount}</strong> user(s) assigned. Please reassign these users to another role before deactivating.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Role Info */}
        {!isSystemRole && !hasUsers && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Role Name:</dt>
                <dd className="font-medium text-gray-900">{currentRole.displayName || currentRole.name}</dd>
              </div>
              {currentRole.description && (
                <div>
                  <dt className="text-gray-500">Description:</dt>
                  <dd className="text-gray-700">{currentRole.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Permissions:</dt>
                <dd className="text-gray-700">{currentRole.permissionCount || 0} permissions assigned</dd>
              </div>
              <div>
                <dt className="text-gray-500">Users:</dt>
                <dd className="text-gray-700">{currentRole.userCount || 0} users with this role</dd>
              </div>
            </dl>
          </div>
        )}

        {/* Note about reactivation */}
        {!isSystemRole && !hasUsers && (
          <p className="text-sm text-gray-500">
            <strong>Note:</strong> You can reactivate this role later from the role details page.
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDeactivate}
            loading={loading}
            disabled={isSystemRole || hasUsers}
          >
            Deactivate Role
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteRoleModal;
