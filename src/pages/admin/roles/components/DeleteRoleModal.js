// src/pages/admin/roles/components/DeleteRoleModal.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('system');
  const dispatch = useDispatch();
  const toast = useToast();
  const currentRole = useSelector(selectCurrentRole);
  const loading = useSelector(selectUpdateLoading);

  const handleDeactivate = async () => {
    if (!currentRole) {
      toast.error(t('roles.deactivate.noRoleSelected'));
      return;
    }

    if (currentRole.isSystemRole) {
      toast.error(t('roles.deactivate.systemRoleError'));
      return;
    }

    if (currentRole.userCount > 0) {
      toast.error(t('roles.deactivate.usersAssignedError', { count: currentRole.userCount }));
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
          icon: currentRole.icon || '\uD83D\uDEE1\uFE0F',
          isActive: false
        }
      })).unwrap();

      toast.success(t('roles.deactivate.deactivatedSuccess', { name: currentRole.displayName || currentRole.name }));
      onClose();

      // Refresh roles list
      dispatch(getRoles({ includeCounts: true }));
    } catch (error) {
      toast.error(error?.message || t('roles.deactivate.failedDeactivate'));
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
      title={t('roles.deactivate.title')}
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
            <div className="ms-3">
              <h3 className="text-sm font-medium text-red-800">
                {t('roles.deactivate.confirmQuestion')}
              </h3>
              <p className="mt-2 text-sm text-red-700">
                {t('roles.deactivate.confirmDesc', { name: currentRole.displayName || currentRole.name })}
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
              <div className="ms-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {t('roles.deactivate.systemRoleTitle')}
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  {t('roles.deactivate.systemRoleDesc')}
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
              <div className="ms-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {t('roles.deactivate.usersAssignedTitle')}
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  {t('roles.deactivate.usersAssignedDesc', { count: currentRole.userCount })}
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
                <dt className="text-gray-500">{t('roles.deactivate.roleName')}</dt>
                <dd className="font-medium text-gray-900">{currentRole.displayName || currentRole.name}</dd>
              </div>
              {currentRole.description && (
                <div>
                  <dt className="text-gray-500">{t('roles.deactivate.description')}</dt>
                  <dd className="text-gray-700">{currentRole.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">{t('roles.deactivate.permissions')}</dt>
                <dd className="text-gray-700">{t('roles.deactivate.permissionsValue', { count: currentRole.permissionCount || 0 })}</dd>
              </div>
              <div>
                <dt className="text-gray-500">{t('roles.deactivate.users')}</dt>
                <dd className="text-gray-700">{t('roles.deactivate.usersValue', { count: currentRole.userCount || 0 })}</dd>
              </div>
            </dl>
          </div>
        )}

        {/* Note about reactivation */}
        {!isSystemRole && !hasUsers && (
          <p className="text-sm text-gray-500">
            {t('roles.deactivate.reactivateNote')}
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
            {t('roles.deactivate.cancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDeactivate}
            loading={loading}
            disabled={isSystemRole || hasUsers}
          >
            {t('roles.deactivate.deactivate')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteRoleModal;

