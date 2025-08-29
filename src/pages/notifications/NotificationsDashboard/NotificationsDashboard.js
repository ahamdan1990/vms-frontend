// src/pages/notifications/NotificationsDashboard/NotificationsDashboard.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { Link } from 'react-router-dom';

// Redux actions
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllAsRead,
  clearNotifications,
  acknowledgeNotificationAsync,
  fetchNotificationStats,
  updateSettings,
  addToast,
  removeToast,
  updateLastSyncTime,
  initializeNotifications
} from '../../../store/slices/notificationSlice';

// Page title action
import { setPageTitle } from '../../../store/slices/uiSlice';

// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import Pagination from '../../../components/common/Pagination/Pagination';

// Icons
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  ClockIcon,
  ShieldExclamationIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  EyeIcon,
  TrashIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid, ExclamationTriangleIcon as ExclamationTriangleIconSolid } from '@heroicons/react/24/solid';

// Utils
import { formatDateTime, formatRelativeTime } from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';

// Constants
import { NOTIFICATION_PERMISSIONS } from '../../../constants/permissions';

/**
 * Notifications Dashboard Page
 * Comprehensive notification management with filtering, acknowledgment, and statistics
 * Built on top of existing notification system with enhanced features
 */
const NotificationsDashboard = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'acknowledged'
  const [viewMode, setViewMode] = useState('list'); // 'list', 'cards'
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Permissions
  const canReadOwn = hasPermission(NOTIFICATION_PERMISSIONS.READ_OWN);
  const canReadAll = hasPermission(NOTIFICATION_PERMISSIONS.READ_ALL);
  const canAcknowledge = hasPermission(NOTIFICATION_PERMISSIONS.ACKNOWLEDGE);
  const canViewStats = hasPermission(NOTIFICATION_PERMISSIONS.VIEW_STATS);

  // Redux selectors - using existing notification slice
  const {
    notifications,
    unreadCount,
    loading,
    error,
    isSignalRConnected,
    stats,
    settings,
    lastSyncTime
  } = useSelector(state => state.notifications);

  // Computed values
  const hasSelectedNotifications = selectedNotifications.length > 0;
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.read) return false;
    if (activeTab === 'acknowledged' && !notification.read) return false;
    
    // Search filter
    if (searchInput) {
      const searchTerm = searchInput.toLowerCase();
      return (
        notification.title?.toLowerCase().includes(searchTerm) ||
        notification.message?.toLowerCase().includes(searchTerm) ||
        notification.type?.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });

  // Initialize page and notifications
  useEffect(() => {
    dispatch(setPageTitle('Notifications'));
    
    if (canReadOwn || canReadAll) {
      dispatch(initializeNotifications());
      dispatch(fetchNotifications());
      if (canViewStats) {
        dispatch(fetchNotificationStats());
      }
    }
  }, [dispatch, canReadOwn, canReadAll, canViewStats]);

  // Auto-refresh notifications
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(() => {
      if (canReadOwn || canReadAll) {
        dispatch(fetchNotifications());
        dispatch(updateLastSyncTime());
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [dispatch, refreshInterval, canReadOwn, canReadAll]);

  // Event handlers
  const handleSearch = (value) => {
    setSearchInput(value);
  };

  const handleRefresh = () => {
    dispatch(fetchNotifications());
    if (canViewStats) {
      dispatch(fetchNotificationStats());
    }
    dispatch(addToast({
      type: 'success',
      title: 'Notifications Refreshed',
      message: 'Notification list has been updated',
      duration: 2000
    }));
  };

  const handleMarkAsRead = (notificationId) => {
    if (!canAcknowledge) return;
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleAcknowledge = async (notificationId, notes = '') => {
    if (!canAcknowledge) return;
    
    try {
      await dispatch(acknowledgeNotificationAsync({ notificationId, notes })).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Notification Acknowledged',
        message: 'Notification has been acknowledged successfully',
        duration: 3000
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Acknowledgment Failed',
        message: extractErrorMessage(error),
        duration: 5000
      }));
    }
  };

  const handleMarkAllAsRead = () => {
    if (!canAcknowledge) return;
    dispatch(markAllAsRead());
    dispatch(addToast({
      type: 'success',
      title: 'All Notifications Marked as Read',
      message: `${unreadCount} notifications marked as read`,
      duration: 3000
    }));
  };

  const handleBulkAction = () => {
    if (!hasSelectedNotifications || !bulkAction) return;
    setShowBulkConfirm(true);
  };

  const handleConfirmBulkAction = () => {
    if (bulkAction === 'markRead') {
      selectedNotifications.forEach(id => {
        dispatch(markNotificationAsRead(id));
      });
      dispatch(addToast({
        type: 'success',
        title: 'Bulk Action Complete',
        message: `${selectedNotifications.length} notifications marked as read`,
        duration: 3000
      }));
    } else if (bulkAction === 'acknowledge') {
      selectedNotifications.forEach(id => {
        dispatch(acknowledgeNotificationAsync({ notificationId: id, notes: 'Bulk acknowledgment' }));
      });
      dispatch(addToast({
        type: 'success',
        title: 'Bulk Action Complete',
        message: `${selectedNotifications.length} notifications acknowledged`,
        duration: 3000
      }));
    }
    
    setSelectedNotifications([]);
    setBulkAction('');
    setShowBulkConfirm(false);
  };

  const handleNotificationSelect = (notificationId, checked) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId]);
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  // Helper functions
  const getNotificationIcon = (type, priority) => {
    const iconClass = `w-5 h-5 ${
      priority === 'Critical' || priority === 'Emergency' 
        ? 'text-red-500' 
        : priority === 'High' 
          ? 'text-orange-500' 
          : priority === 'Medium' 
            ? 'text-yellow-500' 
            : 'text-blue-500'
    }`;
    
    switch (type) {
      case 'VisitorArrival':
      case 'VisitorCheckedIn':
        return <UserPlusIcon className={iconClass} />;
      case 'VisitorCheckedOut':
        return <UserMinusIcon className={iconClass} />;
      case 'VisitorOverstay':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'BlacklistAlert':
      case 'UnknownFace':
      case 'EmergencyAlert':
        return <ShieldExclamationIcon className="w-5 h-5 text-red-500" />;
      case 'SystemAlert':
      case 'FRSystemOffline':
        return <Cog6ToothIcon className={iconClass} />;
      case 'InvitationApproved':
        return <CheckIcon className="w-5 h-5 text-green-500" />;
      case 'InvitationRejected':
        return <XMarkIcon className="w-5 h-5 text-red-500" />;
      case 'InvitationPendingApproval':
        return <EnvelopeIcon className={iconClass} />;
      default:
        return <InformationCircleIcon className={iconClass} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'emergency':
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'security_alert':
      case 'BlacklistAlert':
      case 'EmergencyAlert':
        return 'red';
      case 'visitor_checkin':
      case 'VisitorCheckedIn':
        return 'green';
      case 'visitor_overdue':
      case 'VisitorOverstay':
        return 'yellow';
      case 'system_alert':
      case 'SystemAlert':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'all':
        return notifications.length;
      case 'unread':
        return unreadCount;
      case 'acknowledged':
        return notifications.filter(n => n.read).length;
      default:
        return 0;
    }
  };

  // Render functions
  const renderNotificationCard = (notification) => (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
      } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        {/* Selection checkbox */}
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={selectedNotifications.includes(notification.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleNotificationSelect(notification.id, e.target.checked);
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Notification icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type, notification.priority)}
        </div>

        {/* Notification content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {notification.title}
                </h4>
                <Badge color={getPriorityColor(notification.priority)} size="xs">
                  {notification.priority}
                </Badge>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {notification.message}
              </p>
              
              <p className="text-xs text-gray-500">
                {formatRelativeTime(new Date(notification.timestamp || notification.createdOn))}
              </p>

              {/* Related Entity Information */}
              {notification.data && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  {notification.data.visitorName && (
                    <p><strong>Visitor:</strong> {notification.data.visitorName}</p>
                  )}
                  {notification.data.company && (
                    <p><strong>Company:</strong> {notification.data.company}</p>
                  )}
                  {notification.data.hostName && (
                    <p><strong>Host:</strong> {notification.data.hostName}</p>
                  )}
                  {notification.data.location && (
                    <p><strong>Location:</strong> {notification.data.location}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              {!notification.read && canAcknowledge && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id);
                  }}
                  icon={<CheckIcon className="w-3 h-3" />}
                  title="Mark as read"
                />
              )}
              
              {canAcknowledge && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcknowledge(notification.id);
                  }}
                  icon={<CheckCircleIcon className="w-3 h-3" />}
                  title="Acknowledge"
                />
              )}
            </div>
          </div>

          {/* Action Buttons from notification data */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {notification.actions.map((action, index) => (
                <Button
                  key={index}
                  size="xs"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle notification action - you can extend this based on your needs
                    console.log('Notification action:', action, notification);
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Render loading state
  if (!canReadOwn && !canReadAll) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIconSolid className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and acknowledge system notifications
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isSignalRConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {isSignalRConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {lastSyncTime && (
              <span className="text-xs text-gray-400">
                Last updated: {formatRelativeTime(new Date(lastSyncTime))}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            icon={<ArrowPathIcon className="w-5 h-5" />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="outline"
            icon={<FunnelIcon className="w-5 h-5" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          
          {unreadCount > 0 && canAcknowledge && (
            <Button
              onClick={handleMarkAllAsRead}
              icon={<CheckCircleIcon className="w-5 h-5" />}
            >
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {canViewStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BellIconSolid className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total</h3>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIconSolid className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Unread</h3>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIconSolid className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Critical</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => n.priority === 'Critical' || n.priority === 'Emergency').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Last 24h</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.last24Hours || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', label: 'All Notifications' },
            { id: 'unread', label: 'Unread' },
            { id: 'acknowledged', label: 'Acknowledged' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {getTabCount(tab.id) > 0 && (
                <Badge color={activeTab === tab.id ? 'blue' : 'gray'} size="xs">
                  {getTabCount(tab.id)}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Controls */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search notifications by title, message, or type..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">View:</span>
              <Select
                value={viewMode}
                onChange={setViewMode}
                size="sm"
                className="w-24"
              >
                <option value="list">List</option>
                <option value="cards">Cards</option>
              </Select>
            </div>
            
            {/* Bulk Actions */}
            {hasSelectedNotifications && canAcknowledge && (
              <div className="flex items-center space-x-2">
                <Select
                  value={bulkAction}
                  onChange={setBulkAction}
                  placeholder="Bulk actions"
                  size="sm"
                  className="w-40"
                >
                  <option value="markRead">Mark as Read</option>
                  <option value="acknowledge">Acknowledge</option>
                </Select>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                >
                  Apply ({selectedNotifications.length})
                </Button>
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200"
              >
                <Select
                  label="Priority"
                  value=""
                  onChange={() => {}}
                  placeholder="All Priorities"
                  size="sm"
                >
                  <option value="Emergency">Emergency</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Select>

                <Select
                  label="Type"
                  value=""
                  onChange={() => {}}
                  placeholder="All Types"
                  size="sm"
                >
                  <option value="VisitorArrival">Visitor Arrival</option>
                  <option value="VisitorCheckedIn">Visitor Check-in</option>
                  <option value="VisitorOverstay">Visitor Overstay</option>
                  <option value="SystemAlert">System Alert</option>
                  <option value="SecurityAlert">Security Alert</option>
                </Select>

                <Select
                  label="Date Range"
                  value=""
                  onChange={() => {}}
                  placeholder="All Time"
                  size="sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </Select>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchInput('');
                      setActiveTab('all');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selection Controls */}
          {filteredNotifications.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  Select all ({filteredNotifications.length})
                </span>
              </label>
              
              {hasSelectedNotifications && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length} selected
                  </span>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setSelectedNotifications([])}
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{extractErrorMessage(error)}</p>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {/* Clear error if available */}}
            >
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-500">Loading notifications...</span>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={BellIcon}
              title="No notifications found"
              description={
                searchInput 
                  ? `No notifications match your search criteria "${searchInput}"` 
                  : activeTab === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : "No notifications to display"
              }
              action={
                searchInput && (
                  <Button
                    variant="outline"
                    onClick={() => handleSearch('')}
                  >
                    Clear search
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <div className={viewMode === 'cards' ? 'grid gap-4' : 'space-y-2'}>
            <AnimatePresence>
              {filteredNotifications.map(notification => renderNotificationCard(notification))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Settings Panel (if needed later) */}
      {/* You can add notification settings here */}
    </div>
  );
};

export default NotificationsDashboard;
