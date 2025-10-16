// src/pages/users/UserDetailPage/UserDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { 
  getUserById, 
  updateUser, 
  deleteUser, 
  activateUser, 
  deactivateUser, 
  unlockUser,
  adminResetPassword,
  getUserActivity,
  getAvailableRoles,
  clearError,
  setCurrentUser,
  clearCurrentUser
} from '../../../store/slices/usersSlice';
import { useToast } from '../../../hooks/useNotifications';
import { setPageTitle } from '../../../store/slices/uiSlice';
import { USER_ROUTES } from '../../../constants/routeConstants';
import { formatName, formatDate, formatDateTime } from '../../../utils/formatters';
import { validateUserData } from '../../../utils/validators';

// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import Table from '../../../components/common/Table/Table';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import UserForm from '../../../components/forms/UserForm/UserForm';

/**
 * Professional User Detail Page with comprehensive user management
 * Features: View, Edit, Activity History, Status Management, Security Actions
 */
const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user: currentAuthUser, userId: currentUserId } = useAuth();
  const toast = useToast();
  const { user: userPermissions } = usePermissions();

  // Extract specific permissions for easier use
  const canManageUsers = userPermissions.canManage;
  const canUpdateUsers = userPermissions.canUpdate;
  const canDeleteUsers = userPermissions.canDelete;
  const canActivateUsers = userPermissions.canActivate;
  const canDeactivateUsers = userPermissions.canDeactivate;
  const canUnlockUsers = userPermissions.canUnlock;
  const canResetPasswords = userPermissions.canResetPassword;
  const canViewUserActivity = userPermissions.canViewActivity;

  // Redux state
  const {
    currentUser,
    loading,
    error,
    updateLoading,
    deleteLoading,
    userActivity
  } = useSelector(state => state.users);

  const availableRoles = useSelector(state => state.users.availableRoles || []);

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [activityPage, setActivityPage] = useState(0);
  const [passwordResetData, setPasswordResetData] = useState({
    newPassword: '',
    mustChangePassword: true,
    notifyUser: true,
    reason:''
  });
  const [actionReason, setActionReason] = useState('');

  const isNewUser = id === 'new';
  const isOwnProfile = currentUserId === id;
  const isLoading = loading || !currentUser;

  // Initialize page
  useEffect(() => {
    if (isNewUser) {
      dispatch(setPageTitle('Create User'));
      dispatch(clearCurrentUser());
      setIsEditing(true);
    } else {
      dispatch(setPageTitle('User Details'));
      dispatch(getUserById(id));
    }
    
    // Load available roles for role selection
    dispatch(getAvailableRoles());

    return () => {
      dispatch(clearCurrentUser());
      dispatch(clearError());
    };
  }, [dispatch, id, isNewUser]);

  // Load activity when tab changes
  useEffect(() => {
    if (activeTab === 'activity' && currentUser && canViewUserActivity) {
      dispatch(getUserActivity({ 
        id: currentUser.id, 
        pageIndex: activityPage, 
        pageSize: 20 
      }));
    }
  }, [activeTab, currentUser, canViewUserActivity, activityPage, dispatch]);

  useEffect(() => {
  if (!showPasswordResetModal) {
    // Reset form when modal closes
    setPasswordResetData({
      newPassword: '',
      mustChangePassword: true,
      notifyUser: true,
      reason: ''
    });
  }
}, [showPasswordResetModal]);
  // Handle user actions
  const handleSave = async (userData) => {
    try {
      if (isNewUser) {
        // Handle create logic would go here
        // For now, navigate back as this would be handled by a separate create flow
        navigate(USER_ROUTES.LIST);
      } else {
        await dispatch(updateUser({ id: currentUser.id, userData })).unwrap();
        toast.success('Success', 'User updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Error', 'Failed to save user');
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteUser(currentUser.id)).unwrap();
      toast.success('Success', 'User deleted successfully');
      navigate(USER_ROUTES.LIST);
    } catch (error) {
      toast.error('Error', 'Failed to delete user');
    }
  };

  const handleActivate = async () => {
    try {
      await dispatch(activateUser({ 
        id: currentUser.id, 
        reason: actionReason,
        resetFailedAttempts: true
      })).unwrap();
      toast.success('Success', 'User activated successfully');
      setShowActivateModal(false);
      setActionReason('');
    } catch (error) {
      toast.error('Error', 'Failed to activate user');
    }
  };

  const handleDeactivate = async () => {
    try {
      await dispatch(deactivateUser({ 
        id: currentUser.id, 
        reason: actionReason,
        revokeAllSessions: true
      })).unwrap();
      toast.success('Success', 'User deactivated successfully');
      setShowDeactivateModal(false);
      setActionReason('');
    } catch (error) {
      toast.error('Error', 'Failed to deactivate user');
    }
  };

  const handleUnlock = async () => {
    try {
      await dispatch(unlockUser({ 
        id: currentUser.id, 
        reason: actionReason
      })).unwrap();
      toast.success('Success', 'User unlocked successfully');
      setShowUnlockModal(false);
      setActionReason('');
    } catch (error) {
      toast.error('Error', 'Failed to unlock user');
    }
  };

  const handlePasswordReset = async () => {
    try {
      await dispatch(adminResetPassword({
        id: currentUser.id,
        ...passwordResetData
      })).unwrap();
      toast.success('Success', 'Password reset successfully');
      setShowPasswordResetModal(false);
      setPasswordResetData({
        newPassword: '',
        mustChangePassword: true,
        notifyUser: true,
        reason:''
      });
    } catch (error) {
      toast.error('Error', 'Failed to reset password');
    }
  };

  // Activity table columns
  const activityColumns = [
    {
      key: 'action',
      header: 'Event',
      sortable: true,
      render: (action) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {action}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      sortable: false
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      sortable: false,
      render: (ip) => ip || '-'
    },
    {
      key: 'timestamp',
      header: 'Date & Time',
      sortable: true,
      render: (timestamp) => formatDateTime(timestamp)
    }
  ];

  // Tab configuration
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: '👤' 
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      icon: '📊',
      show: canViewUserActivity && !isNewUser
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: '🔒',
      show: (canManageUsers || canResetPasswords) && !isNewUser
    }
  ].filter(tab => tab.show !== false);

  // Loading state
  if (isLoading && !isNewUser) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="Loading user details..." />
      </div>
    );
  }

  // Error state
  if (error && !isNewUser) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading User</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate(USER_ROUTES.LIST)}>
          Back to Users
        </Button>
      </div>
    );
  }

  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={() => onClick(tab.id)}
      className={`
        flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent'
        }
      `}
    >
      <span className="text-lg">{tab.icon}</span>
      <span>{tab.label}</span>
    </button>
  );

  const StatusBadge = ({ user }) => {
    if (!user) return null;

    const getStatusConfig = () => {
      if (user.isLockedOut) {
        return { text: 'Locked', className: 'bg-red-100 text-red-800 border-red-200' };
      }
      if (!user.isActive) {
        return { text: 'Inactive', className: 'bg-gray-100 text-gray-800 border-gray-200' };
      }
      return { text: 'Active', className: 'bg-green-100 text-green-800 border-green-200' };
    };

    const config = getStatusConfig();

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${
          user.isLockedOut ? 'bg-red-500' : 
          user.isActive ? 'bg-green-500' : 'bg-gray-500'
        }`}></span>
        {config.text}
      </span>
    );
  };

  const ActionButton = ({ onClick, variant, icon, children, disabled = false }) => (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={icon}
      className="transition-all duration-200 hover:scale-105"
    >
      {children}
    </Button>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(USER_ROUTES.LIST)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNewUser ? 'Create New User' : (
                  currentUser ? formatName(currentUser.firstName, currentUser.lastName) : 'Loading...'
                )}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                {!isNewUser && currentUser && (
                  <>
                    <p className="text-gray-600">{currentUser.email}</p>
                    <StatusBadge user={currentUser} />
                    <span className="px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full border border-purple-200">
                      {currentUser.role}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {!isNewUser && currentUser && (
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              {canUpdateUsers && (
                <ActionButton
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "secondary" : "primary"}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  }
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </ActionButton>
              )}

              {canActivateUsers && !currentUser.isActive && (
                <ActionButton
                  onClick={() => setShowActivateModal(true)}
                  variant="success"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                >
                  Activate
                </ActionButton>
              )}

              {canDeactivateUsers && currentUser.isActive && !isOwnProfile && (
                <ActionButton
                  onClick={() => setShowDeactivateModal(true)}
                  variant="warning"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                  }
                >
                  Deactivate
                </ActionButton>
              )}

              {canUnlockUsers && currentUser.isLockedOut && (
                <ActionButton
                  onClick={() => setShowUnlockModal(true)}
                  variant="info"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  Unlock
                </ActionButton>
              )}

              {canDeleteUsers && !isOwnProfile && (
                <ActionButton
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  }
                >
                  Delete
                </ActionButton>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      {!isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={setActiveTab}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100"
        >
          {/* Overview Tab */}
          {(activeTab === 'overview' || isNewUser) && (
            <div className="p-6">
              {isEditing ? (
                <UserForm
                  user={currentUser}
                  availableRoles={availableRoles}
                  onSubmit={handleSave}
                  onCancel={() => {
                    setIsEditing(false);
                    if (isNewUser) navigate(USER_ROUTES.LIST);
                  }}
                  loading={updateLoading}
                  className="max-w-4xl"
                />
              ) : (
                <div className="max-w-4xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">User Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Information
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Full Name</label>
                          <p className="text-gray-900 font-medium">{formatName(currentUser.firstName, currentUser.lastName)}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Email</label>
                          <p className="text-gray-900">{currentUser.email}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                          <p className="text-gray-900">{currentUser.phoneNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Work Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                        </svg>
                        Work Information
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Role</label>
                          <p className="text-gray-900 font-medium">{currentUser.role}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Department</label>
                          <p className="text-gray-900">{currentUser.department || 'Not assigned'}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Job Title</label>
                          <p className="text-gray-900">{currentUser.jobTitle || 'Not specified'}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Employee ID</label>
                          <p className="text-gray-900">{currentUser.employeeId || 'Not assigned'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Account Status
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Status</label>
                          <StatusBadge user={currentUser} />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Created On</label>
                          <p className="text-gray-900">{formatDate(currentUser.createdOn)}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Last Login</label>
                          <p className="text-gray-900">
                            {currentUser.lastLoginDate ? formatDateTime(currentUser.lastLoginDate) : 'Never'}
                          </p>
                        </div>

                        {currentUser.mustChangePassword && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800 text-sm font-medium">
                              ⚠️ Password change required on next login
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Activity Summary */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Activity Summary
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Login Count</span>
                          <span className="font-medium text-gray-900">
                            {currentUser.activitySummary?.loginCount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Failed Login Attempts</span>
                          <span className="font-medium text-gray-900">
                            {currentUser.activitySummary?.failedLoginAttempts || currentUser.failedLoginAttempts || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Invitations Created</span>
                          <span className="font-medium text-gray-900">
                            {currentUser.activitySummary?.invitationsCreated || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Password Changes</span>
                          <span className="font-medium text-gray-900">
                            {currentUser.activitySummary?.passwordChanges || 0}
                          </span>
                        </div>
                        {currentUser.activitySummary?.lastFailedLogin && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Last Failed Login</span>
                            <span className="font-medium text-gray-900">
                              {formatDateTime(currentUser.activitySummary.lastFailedLogin)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">User Activity</h3>
              
              <Table
                columns={activityColumns}
                data={userActivity.data || []}
                loading={userActivity.loading}
                error={userActivity.error}
                emptyMessage="No activity found"
                pagination={{
                  currentPage: activityPage + 1,
                  totalPages: userActivity.pagination?.totalPages || 0,
                  onPageChange: (page) => setActivityPage(page - 1)
                }}
              />
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Management</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Password Management */}
                {canResetPasswords && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Password Management
                    </h4>
                    
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Manage user password and authentication settings.
                      </p>
                      
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowPasswordResetModal(true)}
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        }
                      >
                        Reset Password
                      </Button>
                    </div>
                  </div>
                )}

                {/* Session Management */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Session Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Sessions</span>
                      <span className="font-medium text-gray-900">2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Device</span>
                      <span className="font-medium text-gray-900">Chrome on Windows</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Activity</span>
                      <span className="font-medium text-gray-900">5 minutes ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${currentUser ? formatName(currentUser.firstName, currentUser.lastName) : 'this user'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Activate Modal */}
      <Modal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        title="Activate User"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to activate this user account? This will allow them to log in to the system.
          </p>
          
          <Input
            label="Reason (Optional)"
            placeholder="Enter reason for activation"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowActivateModal(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleActivate}>
              Activate User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deactivate Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate User"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to deactivate this user account? This will prevent them from logging in and revoke all active sessions.
          </p>
          
          <Input
            label="Reason"
            placeholder="Enter reason for deactivation"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            required
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowDeactivateModal(false)}>
              Cancel
            </Button>
            <Button variant="warning" onClick={handleDeactivate} disabled={!actionReason.trim()}>
              Deactivate User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unlock Modal */}
      <Modal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        title="Unlock User"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to unlock this user account? This will reset their failed login attempts and allow them to log in.
          </p>
          
          <Input
            label="Reason (Optional)"
            placeholder="Enter reason for unlocking"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowUnlockModal(false)}>
              Cancel
            </Button>
            <Button variant="info" onClick={handleUnlock}>
              Unlock User
            </Button>
          </div>
        </div>
      </Modal>

  {/* Password Reset Modal */}
  <Modal
    isOpen={showPasswordResetModal}
    onClose={() => setShowPasswordResetModal(false)}
    title="Reset Password"
    size="md"
  >
    <div className="space-y-4">
      <p className="text-gray-600">
        Reset the user's password. They will be required to change it on their next login.
      </p>
      
      <Input
        type="password"
        label="New Password (Optional)"
        placeholder="Leave empty to generate a temporary password"
        value={passwordResetData.newPassword}
        onChange={(e) => setPasswordResetData(prev => ({ ...prev, newPassword: e.target.value }))}
        helperText="If left empty, a secure temporary password will be generated"
      />
      
      <Input
        label="Reason (Optional)"
        placeholder="Enter reason for password reset"
        value={passwordResetData.reason}
        onChange={(e) => setPasswordResetData(prev => ({ ...prev, reason: e.target.value }))}
        helperText="Provide a reason for this password reset action"
      />
      
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={passwordResetData.mustChangePassword}
            onChange={(e) => setPasswordResetData(prev => ({ ...prev, mustChangePassword: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Require password change on next login</span>
        </label>
        
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={passwordResetData.notifyUser}
            onChange={(e) => setPasswordResetData(prev => ({ ...prev, notifyUser: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Send email notification to user</span>
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={() => setShowPasswordResetModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handlePasswordReset}>
          Reset Password
        </Button>
      </div>
    </div>
  </Modal>
    </div>
  );
};

export default UserDetailPage;