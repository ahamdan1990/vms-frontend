// src/pages/users/UsersListPage/UsersListPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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

import { setPageTitle } from '../../../store/slices/uiSlice';

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
  const { t } = useTranslation(['users', 'common']);
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

  // Load initial data and set page title
  useEffect(() => {
    dispatch(setPageTitle(t('users:pageTitle')));
    dispatch(getUsers());
    dispatch(getAvailableRoles());
    dispatch(getUserStats());
  }, [dispatch, t]);

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
          t('users:notifications.createSuccess'),
          t('users:notifications.createSuccessBody', {
            name: `${formData.firstName} ${formData.lastName}`,
            emailNote: formData.sendWelcomeEmail ? t('users:notifications.welcomeEmailSent') : ''
          }),
          {
            duration: 6000,
            actions: [
              {
                label: t('users:actions.createAnother'),
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
        t('users:notifications.createError'),
        extractErrorMessage(error) || t('common:errors.unexpected'),
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
            t('users:notifications.updateSuccess'),
            t('users:notifications.updateSuccessBody', { name: `${formData.firstName} ${formData.lastName}` }),
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
        t('users:notifications.updateError'),
        extractErrorMessage(error) || t('common:errors.unexpected'),
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
          t('users:notifications.deleteSuccess'),
          t('users:notifications.deleteSuccessBody', { name: userName || t('common:labels.user') }),
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
        t('users:notifications.deleteError'),
        extractErrorMessage(error) || t('common:errors.deleteFailed'),
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
            t('users:notifications.activateSuccess'),
            t('users:notifications.activateSuccessBody', { name: userName })
          );
          // Refresh data
          dispatch(getUsers());
          dispatch(getUserStats());
          break;

        case 'deactivate':
          await dispatch(deactivateUser({ id: user.id, reason: 'Manual deactivation', revokeAllSessions: true }));
          toast.warning(
            t('users:notifications.deactivateSuccess'),
            t('users:notifications.deactivateSuccessBody', { name: userName })
          );
          // Refresh data
          dispatch(getUsers());
          dispatch(getUserStats());
          break;

        case 'unlock':
          await dispatch(unlockUser({ id: user.id, reason: 'Manual unlock' }));
          toast.success(
            t('users:notifications.unlockSuccess'),
            t('users:notifications.unlockSuccessBody', { name: userName })
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
        t('users:notifications.actionFailed'),
        extractErrorMessage(error) || t('users:notifications.actionFailedBody', { action }),
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
        t('users:notifications.bulkSuccess'),
        t('users:notifications.bulkSuccessBody', { count: selectedUsers.length }),
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
        t('users:notifications.bulkError'),
        t('users:notifications.bulkErrorBody'),
        {
          persistent: true
        }
      );
    }
  };

  // Helper function to get user status badge
  const getUserStatusBadge = (user) => {
    if (user.isLockedOut) {
      return <Badge variant="danger" size="sm">{t('common:status.locked')}</Badge>;
    }
    if (!user.isActive) {
      return <Badge variant="secondary" size="sm">{t('common:status.inactive')}</Badge>;
    }
    return <Badge variant="success" size="sm">{t('common:status.active')}</Badge>;
  };

  // Helper function to get role badge
  const getRoleBadge = (role) => {
    const roleConfig = {
      Administrator: { variant: 'primary' },
      Operator: { variant: 'info' },
      Staff: { variant: 'success' }
    };

    const config = roleConfig[role] || { variant: 'secondary' };
    return <Badge variant={config.variant} size="sm">{t(`users:roles.${role}`, role)}</Badge>;
  };

  // Helper function to format user name
  const formatUserName = (user) => {
    const fullName = `${user.firstName || user.FirstName || ''} ${user.lastName || user.LastName || ''}`.trim();
    return (
      <div>
        <div className="font-medium text-gray-900">{fullName || t('users:table.unknownUser')}</div>
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
      header: t('users:table.columns.name'),
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
      header: t('users:table.columns.role'),
      sortable: true,
      className: 'min-w-[120px]',
      render: (value, user) => getRoleBadge(user.role)
    },
    {
      key: 'department',
      header: t('users:table.columns.department'),
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
      header: t('common:labels.status'),
      sortable: true,
      className: 'min-w-[100px]',
      render: (value, user) => getUserStatusBadge(user)
    },
    {
      key: 'lastLoginDate',
      header: t('users:table.columns.lastLogin'),
      sortable: true,
      className: 'min-w-[120px]',
      render: (value, user) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {user.lastLoginFormatted || t('users:table.never')}
        </span>
      )
    },
    {
      key: 'actions',
      header: t('common:labels.actions'),
      sortable: false,
      className: 'min-w-[200px]',
      render: (value, user) => (
        <div className="flex items-center gap-1">
          {/* View Details */}
          <Tooltip content={t('common:buttons.view')}>
            <Link
              to={`/users/${user.id}`}
              className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded"
              title={t('common:buttons.view')}
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
          </Tooltip>

          {/* Edit User */}
          {userPermissions.canUpdate && (
            <Tooltip content={t('common:buttons.edit')}>
              <button
                onClick={() => handleUserAction('edit', user)}
                className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded"
                title={t('common:buttons.edit')}
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          {/* Activate/Deactivate */}
          {userPermissions.canUpdate && !user.isLockedOut && (
            <>
              {!user.isActive ? (
                <Tooltip content={t('users:actions.activate')}>
                  <button
                    onClick={() => handleUserAction('activate', user)}
                    className="text-green-600 hover:text-green-900 transition-colors p-1 rounded"
                    title={t('users:actions.activate')}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                  </button>
                </Tooltip>
              ) : (
                <Tooltip content={t('users:actions.deactivate')}>
                  <button
                    onClick={() => handleUserAction('deactivate', user)}
                    className="text-yellow-600 hover:text-yellow-900 transition-colors p-1 rounded"
                    title={t('users:actions.deactivate')}
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
            </>
          )}

          {/* Unlock User */}
          {user.isLockedOut && userPermissions.canUnlock && (
            <Tooltip content={t('users:actions.unlock')}>
              <button
                onClick={() => handleUserAction('unlock', user)}
                className="text-orange-600 hover:text-orange-900 transition-colors p-1 rounded"
                title={t('users:actions.unlock')}
              >
                <LockOpenIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          {/* Delete User */}
          {user.role !== 'Administrator' && userPermissions.canDelete && (
            <Tooltip content={t('common:buttons.delete')}>
              <button
                onClick={() => handleUserAction('delete', user)}
                className="text-red-600 hover:text-red-900 transition-colors p-1 rounded"
                title={t('common:buttons.delete')}
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('users:pageTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('users:pageSubtitle')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {userPermissions.canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              loading={loading}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              {t('users:createButton')}
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
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t('users:stats.total')}</dt>
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
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t('users:stats.active')}</dt>
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
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t('users:stats.inactive')}</dt>
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
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t('users:stats.locked')}</dt>
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
              placeholder={t('users:search.placeholder')}
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
              {t('common:buttons.filter')}
            </Button>

            {Object.values(filters).some(v => v && v !== '') && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                icon={<ArrowPathIcon className="w-5 h-5" />}
              >
                {t('common:buttons.clearFilters')}
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
                    {t('users:table.columns.role')}
                  </label>
                  <select
                    value={filters.role || ''}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('users:filters.allRoles')}</option>
                    {availableRoles.map(role => (
                      <option key={role.name} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('common:labels.status')}
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('users:filters.allStatuses')}</option>
                    <option value="Active">{t('common:status.active')}</option>
                    <option value="Inactive">{t('common:status.inactive')}</option>
                    <option value="Locked">{t('common:status.locked')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('users:table.columns.department')}
                  </label>
                  <select
                    value={filters.department || ''}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('users:filters.allDepartments')}</option>
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('users:bulk.selected', { count: selectedUsers.length })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                {t('users:bulk.clearSelection')}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {canBulkActivate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  icon={<CheckCircleIcon className="w-4 h-4" />}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  {t('users:bulk.activateSelected')}
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
                  {t('users:bulk.deactivateSelected')}
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
                  {t('users:bulk.deleteSelected')}
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
          emptyMessage={t('users:table.emptyMessage')}
          hover
          bordered
          className="users-table"
          />
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {t('users:pagination.showing', { start: pageRange.start, end: pageRange.end, total: pageRange.total })}
                </span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-2 py-1 text-sm w-full sm:w-auto"
                >
                  {[10, 20, 50, 100].map(n => (
                    <option key={n} value={n}>{t('users:pagination.perPage', { count: n })}</option>
                  ))}
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
                  {t('common:buttons.previous')}
                </Button>

                <div className="hidden sm:flex items-center gap-1">
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
                  {t('common:pagination.page', { page: pagination.pageIndex + 1, total: totalPages })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.pageIndex + 1)}
                  disabled={!hasNextPage}
                  icon={<ChevronRightIcon className="w-4 h-4" />}
                >
                  {t('common:buttons.next')}
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
        title={t('users:modals.createTitle')}
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
        title={`${t('users:modals.editTitle')}${currentEditUser ? ` - ${currentEditUser.firstName || currentEditUser.FirstName || ''} ${currentEditUser.lastName || currentEditUser.LastName || ''}` : ''}`}
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
        title={t('users:modals.deleteTitle')}
        message={t('users:confirmations.delete', {
          name: currentDeleteUser
            ? `${currentDeleteUser.firstName || currentDeleteUser.FirstName || ''} ${currentDeleteUser.lastName || currentDeleteUser.LastName || ''}`.trim()
            : t('common:labels.thisUser')
        })}
        confirmText={t('common:buttons.delete')}
        cancelText={t('common:buttons.cancel')}
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
        title={t('users:bulk.confirmTitle', {
          action: bulkAction?.charAt(0).toUpperCase() + bulkAction?.slice(1)
        })}
        message={t('users:bulk.confirmMessage', {
          action: bulkAction,
          count: selectedUsers.length
        })}
        confirmText={t(`users:actions.${bulkAction}`, bulkAction?.charAt(0).toUpperCase() + bulkAction?.slice(1))}
        variant={bulkAction === 'delete' ? 'danger' : 'warning'}
        loading={loading}
      />
    </div>
  );
};

export default UsersListPage;
