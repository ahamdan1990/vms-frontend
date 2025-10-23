// src/pages/users/UsersListPage/UsersListPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../../../hooks/usePermissions';

// Redux actions and selectors
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  unlockUser,
  getAvailableRoles,
  getUserStats,
  updateFilters,
  resetFilters,
  setSelectedUsers,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  clearError
} from '../../../store/slices/usersSlice';

import {
  selectUsersTableData,
  selectUsersLoading,
  selectUsersPagination,
  selectUsersFilters,
  selectSelectedUsers,
  selectAvailableRoles,
  selectUsersStatsSummary,
  selectShowCreateModal,
  selectShowEditModal,
  selectShowDeleteModal,
  selectUsersCreateError,
  selectUsersUpdateError,
  selectCanBulkActivate,
  selectCanBulkDeactivate,
  selectCanBulkDelete
} from '../../../store/selectors/userSelectors';

// Notification hook
import { useToast } from '../../../hooks/useNotifications';

// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Table from '../../../components/common/Table/Table';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import Pagination from '../../../components/common/Pagination/Pagination';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import UserForm from '../../../components/forms/UserForm/UserForm';
import Tooltip from '../../../components/common/Tooltip/Tooltip';

// Icons
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  LockClosedIcon,
  LockOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

// Utils
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Professional Users List Page with comprehensive user management
 * Enhanced with notification integration and consistent UI patterns
 */
const UsersListPage = () => {
  const dispatch = useDispatch();
  const { user: userPermissions } = usePermissions();
  const toast = useToast();

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Redux state
  const users = useSelector(selectUsersTableData);
  const loading = useSelector(selectUsersLoading);
  const pagination = useSelector(selectUsersPagination);
  const filters = useSelector(selectUsersFilters);
  const selectedUsers = useSelector(selectSelectedUsers);
  const availableRoles = useSelector(selectAvailableRoles);
  const userStats = useSelector(selectUsersStatsSummary);
  
  // Modal states
  const isCreateModalOpen = useSelector(selectShowCreateModal);
  const isEditModalOpen = useSelector(selectShowEditModal);
  const isDeleteModalOpen = useSelector(selectShowDeleteModal);
  
  // Error states
  const createError = useSelector(selectUsersCreateError);
  const updateError = useSelector(selectUsersUpdateError);

  // Bulk action permissions
  const canBulkActivate = useSelector(selectCanBulkActivate);
  const canBulkDeactivate = useSelector(selectCanBulkDeactivate);
  const canBulkDelete = useSelector(selectCanBulkDelete);

  // Form state for edit
  const [currentEditUser, setCurrentEditUser] = useState(null);
  const [currentDeleteUser, setCurrentDeleteUser] = useState(null);

  // Load initial data
  useEffect(() => {
    dispatch(getUsers());
    dispatch(getAvailableRoles());
    dispatch(getUserStats());
  }, [dispatch]);

  // Handle search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchInput !== filters.searchTerm) {
        dispatch(updateFilters({ searchTerm: searchInput, pageIndex: 0 }));
        dispatch(getUsers());
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchInput, filters.searchTerm, dispatch]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    dispatch(updateFilters({ [filterName]: value, pageIndex: 0 }));
    dispatch(getUsers());
  };

  const handleResetFilters = () => {
    setSearchInput('');
    dispatch(resetFilters());
    dispatch(getUsers());
  };

  // Handle pagination
  const handlePageChange = (newPageIndex) => {
    dispatch(updateFilters({ pageIndex: newPageIndex }));
    dispatch(getUsers());
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(updateFilters({ pageSize: newPageSize, pageIndex: 0 }));
    dispatch(getUsers());
  };

  // Handle sorting
  const handleSort = (sortBy, sortDirection) => {
    dispatch(updateFilters({ sortBy, sortDescending: sortDirection === 'desc' }));
    dispatch(getUsers());
  };

  // Handle user selection
  const handleSelectionChange = (selectedIds) => {
    dispatch(setSelectedUsers(selectedIds));
  };
  // Enhanced user creation handler
  const handleCreateUser = async (formData) => {
    try {
      dispatch(clearError());
      const result = await dispatch(createUser(formData));
      
      if (result.type === 'users/createUser/fulfilled') {
        dispatch(hideCreateModal());
        
        // Show success notification
        toast.success(
          'User Created Successfully',
          `${formData.firstName} ${formData.lastName} has been created.${formData.sendWelcomeEmail ? ' Welcome email sent.' : ''}`,
          {
            duration: 6000,
            actions: [
              {
                label: 'Create Another',
                onClick: () => {
                  dispatch(showCreateModal());
                },
                dismissOnClick: true
              }
            ]
          }
        );

        // Refresh data
        dispatch(getUsers());
        dispatch(getUserStats());
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(
        'User Creation Failed',
        extractErrorMessage(error) || 'An unexpected error occurred',
        {
          persistent: true
        }
      );
      throw error; // Re-throw to let UserForm handle it
    }
  };

  // Enhanced user update handler
  const handleUpdateUser = async (formData) => {
    try {
      dispatch(clearError());
      
      if (currentEditUser) {
        const result = await dispatch(updateUser({ 
          id: currentEditUser.id, 
          userData: formData 
        }));
        
        if (result.type === 'users/updateUser/fulfilled') {
          dispatch(hideEditModal());
          setCurrentEditUser(null);
          
          // Show success notification
          toast.success(
            'User Updated Successfully',
            `${formData.firstName} ${formData.lastName} has been updated.`,
            {
              duration: 5000
            }
          );

          // Refresh data
          dispatch(getUsers());
          dispatch(getUserStats());
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(
        'User Update Failed',
        extractErrorMessage(error) || 'An unexpected error occurred',
        {
          persistent: true
        }
      );
      throw error; // Re-throw to let UserForm handle it
    }
  };

  // Handle delete user with notification
  const handleDeleteUser = async () => {
    try {
      if (currentDeleteUser) {
        await dispatch(deleteUser(currentDeleteUser.id)).unwrap();
        dispatch(hideDeleteModal());
        
        const userName = `${currentDeleteUser.firstName || currentDeleteUser.FirstName || ''} ${currentDeleteUser.lastName || currentDeleteUser.LastName || ''}`.trim();
        
        // Show success notification
        toast.success(
          'User Deleted',
          `${userName || 'User'} has been deleted successfully.`,
          {
            duration: 5000
          }
        );

        setCurrentDeleteUser(null);
        dispatch(getUsers());
        dispatch(getUserStats());
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(
        'Delete Failed',
        extractErrorMessage(error) || 'Failed to delete user',
        {
          persistent: true
        }
      );
    }
  };

  // Individual user actions with notifications
  const handleUserAction = async (action, user) => {
    try {
      const userName = `${user.firstName || user.FirstName || ''} ${user.lastName || user.LastName || ''}`.trim();
      
      switch (action) {
        case 'activate':
          await dispatch(activateUser({ id: user.id, reason: 'Manual activation' }));
          toast.success(
            'User Activated',
            `${userName} has been activated successfully.`
          );
          // Refresh data
          dispatch(getUsers());
          dispatch(getUserStats());
          break;
          
        case 'deactivate':
          await dispatch(deactivateUser({ id: user.id, reason: 'Manual deactivation', revokeAllSessions: true }));
          toast.warning(
            'User Deactivated',
            `${userName} has been deactivated. All sessions revoked.`
          );
          // Refresh data
          dispatch(getUsers());
          dispatch(getUserStats());
          break;
          
        case 'unlock':
          await dispatch(unlockUser({ id: user.id, reason: 'Manual unlock' }));
          toast.success(
            'User Unlocked',
            `${userName} account has been unlocked.`
          );
          // Refresh data
          dispatch(getUsers());
          dispatch(getUserStats());
          break;
          
        case 'edit':
          setCurrentEditUser(user);
          dispatch(showEditModal(user));
          break;
          
        case 'delete':
          setCurrentDeleteUser(user);
          dispatch(showDeleteModal(user));
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('User action failed:', error);
      toast.error(
        'Action Failed',
        extractErrorMessage(error) || `Failed to ${action} user`,
        {
          persistent: true
        }
      );
    }
  };

  // Bulk actions with notifications
  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;
    setBulkAction(action);
    setShowBulkConfirm(true);
  };

  const handleConfirmBulkAction = async () => {
    const promises = selectedUsers.map(userId => {
      switch (bulkAction) {
        case 'activate':
          return dispatch(activateUser({ id: userId, reason: 'Bulk activation' }));
        case 'deactivate':
          return dispatch(deactivateUser({ id: userId, reason: 'Bulk deactivation', revokeAllSessions: true }));
        case 'delete':
          return dispatch(deleteUser(userId));
        default:
          return Promise.resolve();
      }
    });

    try {
      await Promise.all(promises);
      dispatch(clearSelections());
      setShowBulkConfirm(false);
      setBulkAction('');

      // Show success notification
      toast.success(
        'Bulk Action Completed',
        `Successfully ${bulkAction}d ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}.`,
        {
          duration: 5000
        }
      );

      // Refresh data
      dispatch(getUsers());
      dispatch(getUserStats());
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error(
        'Bulk Action Failed',
        `Failed to ${bulkAction} some users. Please try again.`,
        {
          persistent: true
        }
      );
    }
  };

  // Helper function to get user status badge
  const getUserStatusBadge = (user) => {
    if (user.isLockedOut) {
      return <Badge variant="danger" size="sm">Locked</Badge>;
    }
    if (!user.isActive) {
      return <Badge variant="secondary" size="sm">Inactive</Badge>;
    }
    return <Badge variant="success" size="sm">Active</Badge>;
  };

  // Helper function to get role badge
  const getRoleBadge = (role) => {
    const roleConfig = {
      Administrator: { variant: 'primary', text: 'Administrator' },
      Operator: { variant: 'info', text: 'Operator' },
      Staff: { variant: 'success', text: 'Staff' }
    };

    const config = roleConfig[role] || { variant: 'secondary', text: role };
    return <Badge variant={config.variant} size="sm">{config.text}</Badge>;
  };

  // Helper function to format user name
  const formatUserName = (user) => {
    const fullName = `${user.firstName || user.FirstName || ''} ${user.lastName || user.LastName || ''}`.trim();
    return (
      <div>
        <div className="font-medium text-gray-900">{fullName || 'Unknown User'}</div>
        <div className="text-sm text-gray-500">{user.email}</div>
      </div>
    );
  };

  // Calculate pagination info
  const hasPreviousPage = pagination.pageIndex > 0;
  const hasNextPage = (pagination.pageIndex + 1) * pagination.pageSize < pagination.totalPages * pagination.pageSize;
  const totalPages = pagination.totalPages;
  const currentPageStart = pagination.pageIndex * pagination.pageSize + 1;
  const currentPageEnd = Math.min((pagination.pageIndex + 1) * pagination.pageSize, pagination.totalPages * pagination.pageSize);

  const pageRange = {
    start: currentPageStart,
    end: currentPageEnd,
    total: pagination.totalPages * pagination.pageSize
  };
  // Table columns configuration
  const columns = [
    {
      key: 'selection',
      header: '',
      width: '50px',
      sortable: false,
      render: (value, user) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={(e) => {
            if (e.target.checked) {
              dispatch(setSelectedUsers([...selectedUsers, user.id]));
            } else {
              dispatch(setSelectedUsers(selectedUsers.filter(id => id !== user.id)));
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      headerRender: () => (
        <input
          type="checkbox"
          checked={users.length > 0 && selectedUsers.length === users.length}
          onChange={(e) => {
            if (e.target.checked) {
              const allIds = users.map(user => user.id);
              dispatch(setSelectedUsers(allIds));
            } else {
              dispatch(clearSelections());
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      )
    },
    {
      key: 'avatar',
      header: '',
      width: '60px',
      sortable: false,
      render: (value, user) => (
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {user.initials || (user.firstName ? user.firstName.charAt(0) : 'U')}
        </div>
      )
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      className: 'min-w-[200px]',
      render: (value, user) => (
        <div>
          <Link
            to={`/users/${user.id}`}
            className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {user.displayName || formatUserName(user)}
          </Link>
          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      className: 'min-w-[120px]',
      render: (value, user) => getRoleBadge(user.role)
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      className: 'min-w-[150px]',
      render: (value, user) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {user.department || <span className="text-gray-400 dark:text-gray-600">—</span>}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'min-w-[100px]',
      render: (value, user) => getUserStatusBadge(user)
    },
    {
      key: 'lastLoginDate',
      header: 'Last Login',
      sortable: true,
      className: 'min-w-[120px]',
      render: (value, user) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {user.lastLoginFormatted || 'Never'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'min-w-[200px]',
      render: (value, user) => (
        <div className="flex items-center space-x-1">
          {/* View Details */}
          <Tooltip content="View Details">
            <Link
              to={`/users/${user.id}`}
              className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded"
              title="View user details"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
          </Tooltip>

          {/* Edit User */}
          {userPermissions.canUpdate && (
            <Tooltip content="Edit">
              <button
                onClick={() => handleUserAction('edit', user)}
                className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded"
                title="Edit user"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          {/* Activate/Deactivate */}
          {userPermissions.canUpdate && !user.isLockedOut && (
            <>
              {!user.isActive ? (
                <Tooltip content="Activate User">
                  <button
                    onClick={() => handleUserAction('activate', user)}
                    className="text-green-600 hover:text-green-900 transition-colors p-1 rounded"
                    title="Activate user"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                  </button>
                </Tooltip>
              ) : (
                <Tooltip content="Deactivate User">
                  <button
                    onClick={() => handleUserAction('deactivate', user)}
                    className="text-yellow-600 hover:text-yellow-900 transition-colors p-1 rounded"
                    title="Deactivate user"
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
            </>
          )}

          {/* Unlock User */}
          {user.isLockedOut && userPermissions.canUnlock && (
            <Tooltip content="Unlock User">
              <button
                onClick={() => handleUserAction('unlock', user)}
                className="text-orange-600 hover:text-orange-900 transition-colors p-1 rounded"
                title="Unlock user"
              >
                <LockOpenIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          {/* Delete User */}
          {user.role !== 'Administrator' && userPermissions.canDelete && (
            <Tooltip content="Delete">
              <button
                onClick={() => handleUserAction('delete', user)}
                className="text-red-600 hover:text-red-900 transition-colors p-1 rounded"
                title="Delete user"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  // Main render
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {userPermissions.canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              loading={loading}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              Create User
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {userStats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{userStats.total || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Users</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{userStats.active || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <XCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Inactive Users</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{userStats.inactive || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <LockClosedIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Locked Users</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{userStats.locked || 0}</dd>
                </dl>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search users by name, email, or department..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FunnelIcon className="w-5 h-5" />}
            >
              Filters
            </Button>

            {Object.values(filters).some(v => v && v !== '') && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                icon={<ArrowPathIcon className="w-5 h-5" />}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={filters.role || ''}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Roles</option>
                    {availableRoles.map(role => (
                      <option key={role.name} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Locked">Locked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <select
                    value={filters.department || ''}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Departments</option>
                    {userStats?.byDepartment && Object.keys(userStats.byDepartment).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                Clear Selection
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:space-x-0">
              {canBulkActivate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  icon={<CheckCircleIcon className="w-4 h-4" />}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  Activate Selected
                </Button>
              )}
              
              {canBulkDeactivate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                  icon={<XCircleIcon className="w-4 h-4" />}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  Deactivate Selected
                </Button>
              )}
              
              {canBulkDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  icon={<TrashIcon className="w-4 h-4" />}
                >
                  Delete Selected
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table
          data={users}
          columns={columns}
          loading={loading}
          onRowSelectionChange={(selectedRowIds) => {
            const selectedIds = Object.keys(selectedRowIds).filter(id => selectedRowIds[id]);
            dispatch(setSelectedUsers(selectedIds.map(Number)));
          }}
          onSort={handleSort}
          sortBy={filters.sortBy}
          sortDirection={filters.sortDescending ? 'desc' : 'asc'}
          emptyMessage="No users found. Try adjusting your search or filters."
          hover
          bordered
          className="users-table"
          />
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 sm:space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Showing {pageRange.start} to {pageRange.end} of {pageRange.total} users
                </span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-2 py-1 text-sm w-full sm:w-auto"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.pageIndex - 1)}
                  disabled={!hasPreviousPage}
                  icon={<ChevronLeftIcon className="w-4 h-4" />}
                >
                  Previous
                </Button>

                <div className="hidden sm:flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (pagination.pageIndex < 3) {
                      pageNum = i;
                    } else if (pagination.pageIndex > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = pagination.pageIndex - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded ${
                          pageNum === pagination.pageIndex
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile: Show current page indicator */}
                <div className="sm:hidden flex items-center px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.pageIndex + 1} of {totalPages}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.pageIndex + 1)}
                  disabled={!hasNextPage}
                  icon={<ChevronRightIcon className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => dispatch(hideCreateModal())}
        title="Create New User"
        size="4xl"
        className="max-h-[90vh]"
      >
        <UserForm
          availableRoles={availableRoles}
          onSubmit={handleCreateUser}
          onCancel={() => dispatch(hideCreateModal())}
          loading={loading}
          error={createError}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          dispatch(hideEditModal());
          setCurrentEditUser(null);
        }}
        title={`Edit User${currentEditUser ? ` - ${currentEditUser.firstName || currentEditUser.FirstName || ''} ${currentEditUser.lastName || currentEditUser.LastName || ''}` : ''}`}
        size="4xl"
        className="max-h-[90vh]"
      >
        <UserForm
          user={currentEditUser}
          availableRoles={availableRoles}
          onSubmit={handleUpdateUser}
          onCancel={() => {
            dispatch(hideEditModal());
            setCurrentEditUser(null);
          }}
          loading={loading}
          error={updateError}
        />
      </Modal>

      {/* Delete User Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          dispatch(hideDeleteModal());
          setCurrentDeleteUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${currentDeleteUser ? `${currentDeleteUser.firstName || currentDeleteUser.FirstName || ''} ${currentDeleteUser.lastName || currentDeleteUser.LastName || ''}` : 'this user'}? This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
        icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
      />

      {/* Bulk Action Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        onClose={() => {
          setShowBulkConfirm(false);
          setBulkAction('');
        }}
        onConfirm={handleConfirmBulkAction}
        title={`Confirm Bulk ${bulkAction?.charAt(0).toUpperCase() + bulkAction?.slice(1)}`}
        message={`Are you sure you want to ${bulkAction} ${selectedUsers.length} selected user${selectedUsers.length > 1 ? 's' : ''}?`}
        confirmText={bulkAction?.charAt(0).toUpperCase() + bulkAction?.slice(1)}
        variant={bulkAction === 'delete' ? 'danger' : 'warning'}
        loading={loading}
      />
    </div>
  );
};

export default UsersListPage;