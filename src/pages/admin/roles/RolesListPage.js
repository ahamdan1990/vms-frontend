// src/pages/admin/roles/RolesListPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';

// Redux actions and selectors
import {
  getRoles,
  getRoleById,
  clearError,
  toggleCreateModal,
  toggleEditModal,
  setCurrentRole,
  selectRoles,
  selectSystemRoles,
  selectCustomRoles,
  selectRolesLoading,
  selectRolesError
} from '../../../store/slices/rolesSlice';

// Components
import Button from '../../../components/common/Button/Button';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import Tooltip from '../../../components/common/Tooltip/Tooltip';

// Icons
import {
  PlusIcon,
  ShieldCheckIcon,
  UsersIcon,
  KeyIcon,
  LockClosedIcon,
  Cog6ToothIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Hooks
import { useToast } from '../../../hooks/useNotifications';
import { usePermissions } from '../../../hooks/usePermissions';

// Modal Components
import CreateRoleModal from './components/CreateRoleModal';
import EditRoleModal from './components/EditRoleModal';
import DeleteRoleModal from './components/DeleteRoleModal';

/**
 * Roles List Page - Displays and manages all system and custom roles
 */
const RolesListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { hasPermission } = usePermissions();

  // Redux state
  const roles = useSelector(selectRoles);
  const systemRoles = useSelector(selectSystemRoles);
  const customRoles = useSelector(selectCustomRoles);
  const loading = useSelector(selectRolesLoading);
  const error = useSelector(selectRolesError);

  // Local state
  const [activeTab, setActiveTab] = useState('all'); // all, system, custom
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Permissions
  const canCreate = hasPermission('Role.Create');
  const canUpdate = hasPermission('Role.Update');
  const canDelete = hasPermission('Role.Delete');

  // Load roles on mount
  useEffect(() => {
    dispatch(getRoles({ includeCounts: true }));
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  // Handle view role details
  const handleViewRole = (role) => {
    navigate(`/admin/roles/${role.id}`);
  };

  // Handle edit role
  const handleEditRole = async (role) => {
    await dispatch(getRoleById(role.id));
    dispatch(toggleEditModal());
  };

  // Handle delete role
  const handleDeleteRole = async (role) => {
    await dispatch(getRoleById(role.id));
    dispatch(setCurrentRole(role));
    setShowDeleteModal(true);
  };

  // Get roles to display based on active tab
  const displayedRoles = activeTab === 'system' ? systemRoles
    : activeTab === 'custom' ? customRoles
    : roles;

  // Role card component
  const RoleCard = ({ role }) => {
    const isSystemRole = role.isSystemRole;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: role.color || '#3B82F6' }}
              >
                {role.icon ? (
                  <span className="text-white text-xl">{role.icon}</span>
                ) : (
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {role.displayName || role.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={role.isActive ? 'success' : 'gray'}
                    size="sm"
                  >
                    {role.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {isSystemRole && (
                    <Badge variant="info" size="sm">
                      <LockClosedIcon className="w-3 h-3 mr-1" />
                      System Role
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {role.description || 'No description available'}
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Tooltip content="Number of permissions assigned to this role">
                <div className="flex items-center gap-2">
                  <KeyIcon className="w-4 h-4" />
                  <span className="font-medium">{role.permissionCount || 0}</span>
                  <span>Permissions</span>
                </div>
              </Tooltip>
              <Tooltip content="Number of users with this role">
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  <span className="font-medium">{role.userCount || 0}</span>
                  <span>Users</span>
                </div>
              </Tooltip>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Level:</span>
                <span className="font-medium">{role.hierarchyLevel || 1}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Tooltip content="View and manage role details">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleViewRole(role)}
              >
                View
              </Button>
            </Tooltip>

            {canUpdate && (
              <Tooltip content={isSystemRole ? "Edit display properties only" : "Edit role details"}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditRole(role)}
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </Tooltip>
            )}

            {canDelete && !isSystemRole && (
              <Tooltip content="Deactivate role">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteRole(role)}
                  className="text-red-600 hover:text-red-700 hover:border-red-600"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-2">
            Manage system and custom roles with their permissions
          </p>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            onClick={() => dispatch(toggleCreateModal())}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Role
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
            <ShieldCheckIcon className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Roles</p>
              <p className="text-2xl font-bold text-gray-900">{systemRoles.length}</p>
            </div>
            <LockClosedIcon className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Custom Roles</p>
              <p className="text-2xl font-bold text-gray-900">{customRoles.length}</p>
            </div>
            <Cog6ToothIcon className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Roles', count: roles.length },
              { key: 'system', label: 'System Roles', count: systemRoles.length },
              { key: 'custom', label: 'Custom Roles', count: customRoles.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : displayedRoles.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'custom'
                ? 'Create a custom role to get started.'
                : 'No roles available in this category.'}
            </p>
            {canCreate && activeTab === 'custom' && (
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => dispatch(toggleCreateModal())}
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Custom Role
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedRoles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateRoleModal />
      <EditRoleModal />
      <DeleteRoleModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default RolesListPage;
