// src/pages/users/UsersListPage/UsersListPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import '../../../styles/mobile-table.css'; // Import mobile responsive styles

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
  toggleUserSelection,
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
  selectUsersDeleteError,
  selectCanBulkActivate,
  selectCanBulkDeactivate,
  selectCanBulkDelete
} from '../../../store/selectors/userSelectors';

// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Table from '../../../components/common/Table/Table';
import Pagination from '../../../components/common/Pagination/Pagination';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';

// Utils
import { formatters } from '../../../utils/formatters';
import { validateUserData } from '../../../utils/validators';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Professional Users List Page with comprehensive user management
 */
const UsersListPage = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { user: userPermissions } = usePermissions();

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
  const deleteError = useSelector(selectUsersDeleteError);

  // Bulk action permissions
  const canBulkActivate = useSelector(selectCanBulkActivate);
  const canBulkDeactivate = useSelector(selectCanBulkDeactivate);
  const canBulkDelete = useSelector(selectCanBulkDelete);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'Staff',
    status: 'Active',
    department: '',
    jobTitle: '',
    employeeId: '',
    theme: 'light',
    language: 'en-US',
    timeZone: 'UTC',
    mustChangePassword: true,
    sendWelcomeEmail: true
  });

  const [formErrors, setFormErrors] = useState({});
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

  // Watch for edit modal opening and ensure form data is populated
  useEffect(() => {
    if (isEditModalOpen && currentEditUser) {
      
      const populatedData = {
        id: currentEditUser.id,
        firstName: currentEditUser.firstName || currentEditUser.FirstName || '',
        lastName: currentEditUser.lastName || currentEditUser.LastName || '',
        email: currentEditUser.email || currentEditUser.Email || '',
        phoneNumber: currentEditUser.phoneNumber || currentEditUser.PhoneNumber || '',
        role: currentEditUser.role || currentEditUser.Role || 'Staff',
        status: currentEditUser.isActive !== undefined ? (currentEditUser.isActive ? 'Active' : 'Inactive') : 'Active',
        department: currentEditUser.department || currentEditUser.Department || '',
        jobTitle: currentEditUser.jobTitle || currentEditUser.JobTitle || '',
        employeeId: currentEditUser.employeeId || currentEditUser.EmployeeId || '',
        theme: currentEditUser.theme || currentEditUser.Theme || 'light',
        language: currentEditUser.language || currentEditUser.Language || 'en-US',
        timeZone: currentEditUser.timeZone || currentEditUser.TimeZone || 'UTC',
        mustChangePassword: false,
        sendWelcomeEmail: false
      };
      
      setFormData(populatedData);
    }
  }, [isEditModalOpen, currentEditUser]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    dispatch(updateFilters({ [filterName]: value, pageIndex: 0 }));
    dispatch(getUsers());
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    dispatch(updateFilters({ pageIndex: newPage - 1 }));
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
  const handleUserSelection = (selectedRows) => {
    dispatch(setSelectedUsers(selectedRows));
  };

  // Form handlers
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleCreateUser = async () => {
    dispatch(clearError());
    const validation = validateUserData(formData, false);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      const result = await dispatch(createUser(formData));
      if (result.type === 'users/createUser/fulfilled') {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          role: 'Staff',
          department: '',
          jobTitle: '',
          employeeId: '',
          mustChangePassword: true,
          sendWelcomeEmail: true,
          // Add missing required fields
          theme: 'light',
          language: 'en-US',
          timeZone: 'UTC'
        });
        setFormErrors({});
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    setBulkAction(action);
    setShowBulkConfirm(true);
  };

  const confirmBulkAction = async () => {
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
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    dispatch(clearError());
    const validation = validateUserData(formData, true);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      if (currentEditUser) {
        await dispatch(updateUser({ id: currentEditUser.id, userData: formData })).unwrap();
        dispatch(hideEditModal());
        setCurrentEditUser(null);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          role: 'Staff',
          department: '',
          jobTitle: '',
          employeeId: '',
          mustChangePassword: true,
          sendWelcomeEmail: true,
          theme: 'light',
          language: 'en-US',
          timeZone: 'UTC'
        });
        setFormErrors({});
        // Refresh users list
        dispatch(getUsers());
        dispatch(getUserStats());
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      if (currentDeleteUser) {
        await dispatch(deleteUser(currentDeleteUser.id)).unwrap();
        dispatch(hideDeleteModal());
        setCurrentDeleteUser(null);
        // Refresh users list
        dispatch(getUsers());
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // User actions
  const handleUserAction = async (action, user) => {
    try {
      switch (action) {
        case 'activate':
          await dispatch(activateUser({ id: user.id, reason: 'Manual activation' }));
          break;
        case 'deactivate':
          await dispatch(deactivateUser({ id: user.id, reason: 'Manual deactivation', revokeAllSessions: true }));
          break;
        case 'unlock':
          await dispatch(unlockUser({ id: user.id, reason: 'Manual unlock' }));
          break;
        case 'edit':
          setCurrentEditUser(user);
          const editFormData = {
            id: user.id,
            firstName: user.firstName || user.FirstName || user.first_name || '',
            lastName: user.lastName || user.LastName || user.last_name || '',
            email: user.email || user.Email || '',
            phoneNumber: user.phoneNumber || user.PhoneNumber || user.phone_number || '',
            role: user.role || user.Role || 'Staff',
            status: user.isActive !== undefined ? (user.isActive ? 'Active' : 'Inactive') : 'Active',
            department: user.department || user.Department || '',
            jobTitle: user.jobTitle || user.JobTitle || user.job_title || '',
            employeeId: user.employeeId || user.EmployeeId || user.employee_id || '',
            theme: user.theme || user.Theme || 'light',
            language: user.language || user.Language || 'en-US',
            timeZone: user.timeZone || user.TimeZone || user.time_zone || 'UTC',
            mustChangePassword: user.mustChangePassword !== undefined ? user.mustChangePassword : false,
            sendWelcomeEmail: false
          };
          
          setFormData(editFormData);
          
          // Force re-render after a small delay to ensure state is set
          setTimeout(() => {
            dispatch(showEditModal(user));
          }, 10);
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
    }
  };

  // Table columns configuration
  const columns = useMemo(() => [
    {
      key: 'avatar',
      header: '',
      width: '60px',
      className: 'sticky-left',
      render: (_, user) => (
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {user.initials}
        </div>
      )
    },
    {
      key: 'fullName',
      header: 'Name',
      sortable: true,
      className: 'min-w-[200px]',
      render: (_, user) => (
        <div>
          <Link 
            to={`/users/${user.id}`}
            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            {user.displayName}
          </Link>
          <p className="text-sm text-gray-500">{user.email}</p>
          {/* Show role on mobile */}
          <div className="sm:hidden">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
              user.role === 'Administrator' ? 'bg-purple-100 text-purple-800' :
              user.role === 'Operator' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user.role}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      className: 'hidden sm:table-cell',
      render: (role) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          role === 'Administrator' ? 'bg-purple-100 text-purple-800' :
          role === 'Operator' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {role}
        </span>
      )
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (department) => department || <span className="text-gray-400">—</span>
    },
    {
      key: 'isActive',
      header: 'Status',
      className: 'hidden sm:table-cell',
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          {user.statusBadge && (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              user.statusBadge.variant === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {user.statusBadge.text}
            </span>
          )}
          {user.lockBadge && (
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              {user.lockBadge.text}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'lastLoginDate',
      header: 'Last Login',
      sortable: true,
      className: 'hidden lg:table-cell',
      render: (_, user) => (
        <span className="text-sm text-gray-600">{user.lastLoginFormatted}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '200px',
      className: 'sticky-right',
      render: (_, user) => (
        <div className="flex items-center justify-center space-x-1">
          <Link
            to={`/users/${user.id}`}
            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
            title="View user details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>

          {userPermissions.canUpdate && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUserAction('edit', user);
              }}
              className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
              title="Edit user"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {user.isLockedOut && userPermissions.canUnlock && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUserAction('unlock', user);
              }}
              className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-green-600 transition-colors rounded-md hover:bg-green-50"
              title="Unlock user"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          
          {user.role !== 'Administrator' && userPermissions.canDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUserAction('delete', user);
              }}
              className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
              title="Delete user"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )
    }
  ], [userPermissions]);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            {userPermissions.canCreate && (
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={() => dispatch(showCreateModal())}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Create User
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {userStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.inactive}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Locked Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.locked}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <Input
                type="text"
                placeholder="Search users by name, email, or department..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                }
                className="w-full sm:w-auto"
              >
                Filters
              </Button>
              
              {Object.values(filters).some(v => v && v !== '') && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    dispatch(resetFilters());
                    setSearchInput('');
                    dispatch(getUsers());
                  }}
                  className="w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={filters.role || ''}
                      onChange={(e) => handleFilterChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Roles</option>
                      {availableRoles.map(role => (
                        <option key={role.name} value={role.name}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Locked">Locked</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      value={filters.department || ''}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        </motion.div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-900">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                {canBulkActivate && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleBulkAction('activate')}
                    className="w-full sm:w-auto"
                  >
                    Activate
                  </Button>
                )}
                
                {canBulkDeactivate && (
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleBulkAction('deactivate')}
                    className="w-full sm:w-auto"
                  >
                    Deactivate
                  </Button>
                )}
                
                {canBulkDelete && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleBulkAction('delete')}
                    className="w-full sm:w-auto"
                  >
                    Delete
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => dispatch(clearSelections())}
                  className="w-full sm:w-auto"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="mobile-table">
            <Table
              data={users}
              columns={columns}
              loading={loading}
              selectable={userPermissions.canUpdate || userPermissions.canDelete}
              selectedRows={selectedUsers}
              onSelectionChange={handleUserSelection}
              onSort={handleSort}
              sortBy={filters.sortBy}
              sortDirection={filters.sortDescending ? 'desc' : 'asc'}
              emptyMessage="No users found. Try adjusting your search or filters."
              hover
              bordered
              className="min-w-full"
            />
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.pageIndex + 1}
                totalItems={pagination.totalPages * pagination.pageSize}
                pageSize={pagination.pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showPageSizeSelector
                showItemsInfo
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => dispatch(hideCreateModal())}
        title="Create New User"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => handleFormChange('firstName', e.target.value)}
              error={formErrors.firstName}
            />
            
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => handleFormChange('lastName', e.target.value)}
              error={formErrors.lastName}
            />
          </div>
          
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            error={formErrors.email}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
              error={formErrors.phoneNumber}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleFormChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableRoles.map(role => (
                  <option key={role.name} value={role.name}>{role.name}</option>
                ))}
              </select>
              {formErrors.role && (
                <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => handleFormChange('department', e.target.value)}
              error={formErrors.department}
            />
            
            <Input
              label="Job Title"
              value={formData.jobTitle}
              onChange={(e) => handleFormChange('jobTitle', e.target.value)}
              error={formErrors.jobTitle}
            />
          </div>
          
          <Input
            label="Employee ID"
            value={formData.employeeId}
            onChange={(e) => handleFormChange('employeeId', e.target.value)}
            error={formErrors.employeeId}
          />
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.mustChangePassword}
                onChange={(e) => handleFormChange('mustChangePassword', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Require password change on first login</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sendWelcomeEmail}
                onChange={(e) => handleFormChange('sendWelcomeEmail', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Send welcome email to user</span>
            </label>
          </div>
          
          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error creating user</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {createError.map((error, index) => (
                        <li key={index}>
                          {extractErrorMessage(error)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-6">
          <Button
            variant="outline"
            onClick={() => dispatch(hideCreateModal())}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateUser}
            loading={loading}
          >
            Create User
          </Button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          dispatch(hideEditModal());
          setCurrentEditUser(null);
          setFormErrors({});
        }}
        title={`Edit User${currentEditUser ? ` - ${currentEditUser.firstName || currentEditUser.FirstName || ''} ${currentEditUser.lastName || currentEditUser.LastName || ''}` : ''}`}
        size="lg"
      >
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.firstName || ''}
              onChange={(e) => handleFormChange('firstName', e.target.value)}
              error={formErrors.firstName}
            />
            
            <Input
              label="Last Name"
              required
              value={formData.lastName || ''}
              onChange={(e) => handleFormChange('lastName', e.target.value)}
              error={formErrors.lastName}
            />
          </div>
          
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email || ''}
            onChange={(e) => handleFormChange('email', e.target.value)}
            error={formErrors.email}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={formData.phoneNumber || ''}
              onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
              error={formErrors.phoneNumber}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role || 'Staff'}
                onChange={(e) => handleFormChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableRoles.map(role => (
                  <option key={role.name} value={role.name}>{role.name}</option>
                ))}
              </select>
              {formErrors.role && (
                <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status || 'Active'}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {formErrors.status && (
                <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>
              )}
            </div>

            <Input
              label="Employee ID"
              value={formData.employeeId || ''}
              onChange={(e) => handleFormChange('employeeId', e.target.value)}
              error={formErrors.employeeId}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Department"
              value={formData.department || ''}
              onChange={(e) => handleFormChange('department', e.target.value)}
              error={formErrors.department}
            />
            
            <Input
              label="Job Title"
              value={formData.jobTitle || ''}
              onChange={(e) => handleFormChange('jobTitle', e.target.value)}
              error={formErrors.jobTitle}
            />
          </div>
          
          {updateError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error updating user</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {updateError.map((error, index) => (
                        <li key={index}>
                          {extractErrorMessage(error)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-6">
          <Button
            variant="outline"
            onClick={() => {
              dispatch(hideEditModal());
              setCurrentEditUser(null);
              setFormErrors({});
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateUser}
            loading={loading}
          >
            Update User
          </Button>
        </div>
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
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />

      {/* Bulk Action Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={confirmBulkAction}
        title={`Confirm Bulk ${bulkAction}`}
        message={`Are you sure you want to ${bulkAction} ${selectedUsers.length} selected user${selectedUsers.length > 1 ? 's' : ''}?`}
        confirmText={bulkAction}
        variant={bulkAction === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default UsersListPage;