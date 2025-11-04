// src/pages/admin/roles/RoleDetailsPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';

// Redux
import {
  getRoleById,
  updateRolePermissions,
  selectCurrentRole,
  selectRolesLoading,
  selectPermissionLoading,
  selectRolesError,
  clearCurrentRole
} from '../../../store/slices/rolesSlice';

import {
  getPermissionsByCategory,
  selectCategorizedPermissions,
  selectPermissionsLoading
} from '../../../store/slices/permissionsSlice';

// Components
import Button from '../../../components/common/Button/Button';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import Tooltip from '../../../components/common/Tooltip/Tooltip';

// Icons
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Hooks
import { useToast } from '../../../hooks/useNotifications';
import { usePermissions } from '../../../hooks/usePermissions';

/**
 * Role Details Page - View and manage permissions for a specific role
 */
const RoleDetailsPage = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { hasPermission } = usePermissions();

  // Redux state
  const role = useSelector(selectCurrentRole);
  const categorizedPermissions = useSelector(selectCategorizedPermissions);
  const loading = useSelector(selectRolesLoading);
  const permissionsLoading = useSelector(selectPermissionsLoading);
  const permissionUpdating = useSelector(selectPermissionLoading);
  const error = useSelector(selectRolesError);

  // Local state
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hasChanges, setHasChanges] = useState(false);

  // Permissions
  const canManagePermissions = hasPermission('Role.ManagePermissions');

  // Load role and permissions
  useEffect(() => {
    dispatch(getRoleById(roleId));
    dispatch(getPermissionsByCategory());

    return () => {
      dispatch(clearCurrentRole());
    };
  }, [dispatch, roleId]);

  // Initialize selected permissions from role
  useEffect(() => {
    if (role?.permissions) {
      const permissionIds = new Set(role.permissions.map(p => p.id));
      setSelectedPermissions(permissionIds);
    }
  }, [role]);

  // Handle permission toggle
  const handlePermissionToggle = (permissionId) => {
    if (!canManagePermissions || role?.isSystemRole) return;

    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
    setHasChanges(true);
  };

  // Handle category select all
  const handleCategorySelectAll = (categoryPermissions) => {
    if (!canManagePermissions || role?.isSystemRole) return;

    const newSelected = new Set(selectedPermissions);
    categoryPermissions.forEach(p => newSelected.add(p.id));
    setSelectedPermissions(newSelected);
    setHasChanges(true);
  };

  // Handle category deselect all
  const handleCategoryDeselectAll = (categoryPermissions) => {
    if (!canManagePermissions || role?.isSystemRole) return;

    const newSelected = new Set(selectedPermissions);
    categoryPermissions.forEach(p => newSelected.delete(p.id));
    setSelectedPermissions(newSelected);
    setHasChanges(true);
  };

  // Handle save permissions
  const handleSavePermissions = async () => {
    try {
      await dispatch(updateRolePermissions({
        roleId: parseInt(roleId),
        permissionIds: Array.from(selectedPermissions),
        reason: 'Updated permissions via Role Details page'
      })).unwrap();

      toast.success('Role permissions updated successfully');
      setHasChanges(false);

      // Reload role to get updated data
      dispatch(getRoleById(roleId));
    } catch (error) {
      toast.error(error?.message || 'Failed to update permissions');
    }
  };

  // Handle cancel changes
  const handleCancelChanges = () => {
    if (role?.permissions) {
      const permissionIds = new Set(role.permissions.map(p => p.id));
      setSelectedPermissions(permissionIds);
      setHasChanges(false);
    }
  };

  // Filter permissions by search and category
  const filteredPermissions = categorizedPermissions
    .map(category => ({
      ...category,
      permissions: category.permissions.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category =>
      (selectedCategory === 'all' || category.category === selectedCategory) &&
      category.permissions.length > 0
    );

  // Get unique categories
  const categories = ['all', ...new Set(categorizedPermissions.map(c => c.category))];

  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Role not found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The role you're looking for doesn't exist or has been deleted.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/admin/roles')}>
                Back to Roles
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/roles')}
          className="mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Roles
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: role.color || '#3B82F6' }}
            >
              {role.icon ? (
                <span className="text-white text-2xl">{role.icon}</span>
              ) : (
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {role.displayName || role.name}
              </h1>
              <p className="text-gray-600 mt-1">{role.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={role.isActive ? 'success' : 'gray'}>
                  {role.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {role.isSystemRole && (
                  <Badge variant="info">System Role</Badge>
                )}
              </div>
            </div>
          </div>

          {canManagePermissions && !role.isSystemRole && (
            <div className="flex gap-2">
              {hasChanges ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelChanges}
                    disabled={permissionUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSavePermissions}
                    isLoading={permissionUpdating}
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">
                    Click on permission cards below to edit
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-600">Total Permissions</p>
          <p className="text-2xl font-bold text-gray-900">
            {selectedPermissions.size}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Users with Role</p>
          <p className="text-2xl font-bold text-gray-900">{role.userCount || 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Hierarchy Level</p>
          <p className="text-2xl font-bold text-gray-900">{role.hierarchyLevel || 1}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Display Order</p>
          <p className="text-2xl font-bold text-gray-900">{role.displayOrder || 0}</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat, index) => (
                <option key={`category-${index}-${cat}`} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* System Role Warning */}
      {role.isSystemRole && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This is a system role. Permissions cannot be modified directly. Only display properties can be edited.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Permissions by Category */}
      <div className="space-y-6">
        {filteredPermissions.map((category) => {
          const categoryPermissions = category.permissions;
          const selectedCount = categoryPermissions.filter(p =>
            selectedPermissions.has(p.id)
          ).length;
          const allSelected = selectedCount === categoryPermissions.length;

          return (
            <Card key={category.category}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.category}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedCount} of {categoryPermissions.length} selected
                  </p>
                </div>
                {canManagePermissions && !role.isSystemRole && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCategorySelectAll(categoryPermissions)}
                      disabled={allSelected}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCategoryDeselectAll(categoryPermissions)}
                      disabled={selectedCount === 0}
                    >
                      Deselect All
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryPermissions.map((permission) => {
                  const isSelected = selectedPermissions.has(permission.id);
                  const isDisabled = !canManagePermissions || role.isSystemRole;

                  return (
                    <motion.button
                      key={permission.id}
                      onClick={() => handlePermissionToggle(permission.id)}
                      disabled={isDisabled}
                      className={`
                        p-3 rounded-lg border-2 text-left transition-all
                        ${isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                        }
                        ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                      `}
                      whileHover={!isDisabled ? { scale: 1.02 } : {}}
                      whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">
                            {permission.displayName}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {permission.description}
                          </p>
                        </div>
                        <div
                          className={`
                            w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ml-2
                            ${isSelected ? 'bg-blue-500' : 'border-2 border-gray-300'}
                          `}
                        >
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredPermissions.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RoleDetailsPage;
