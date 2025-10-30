// src/components/notifications/NotificationCenter.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  acknowledgeNotificationAsync,
  markNotificationAsRead,
  removeNotification,
  fetchNotificationStats,
  clearNotifications
} from '../../store/slices/notificationSlice';
import { useSignalR } from '../../hooks/useSignalR';

// Components
import Button from '../common/Button/Button';
import Badge from '../common/Badge/Badge';
import Card from '../common/Card/Card';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import ConnectionStatus from '../common/ConnectionStatus';

// Icons
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  ClockIcon,
  ShieldExclamationIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

// Utils
import formatters from '../../utils/formatters';

/**
 * Advanced Notification Center with Real-time SignalR Integration
 * Manages real-time notifications for visitor management events
 * Includes notification filtering, actions, and real-time updates
 */
const NotificationCenter = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const dispatch = useDispatch();
  
  // Redux state - FIX: Extract lastSyncTime from root level, not from stats
  const {
    notifications,
    unreadCount,
    loading,
    error,
    isSignalRConnected,
    stats,
    lastSyncTime  // ← ADDED: Extract separately since it's at root level
  } = useSelector(state => state.notifications);

  // SignalR integration
  const { isConnected: signalRConnected, host } = useSignalR();

  // Local state
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'security', 'visitors', 'system'
  const [viewMode, setViewMode] = useState('list'); // 'list', 'card'
  const [notificationActions, setNotificationActions] = useState({}); // { notificationId: 'markRead'|'acknowledge' }

  // Load notifications on mount and when filter changes
  useEffect(() => {
    if (isOpen) {
      const filterParams = {};
      
      if (filter === 'unread') {
        filterParams.isAcknowledged = false;
      } else if (filter !== 'all') {
        filterParams.alertType = filter;
      }

      dispatch(fetchNotifications(filterParams));
      dispatch(fetchNotificationStats());
    }
  }, [dispatch, isOpen, filter]);

  // Real-time connection status indicator
  useEffect(() => {
    if (isOpen && host) {
      // Request notification history when connected
      host.getNotificationHistory(7).catch(console.error);
    }
  }, [isOpen, host]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    
    // Map filter to notification types
    const typeMap = {
      'visitors': ['VisitorArrival', 'VisitorCheckedIn', 'VisitorCheckedOut', 'VisitorOverstay'],
      'security': ['BlacklistAlert', 'UnknownFace', 'EmergencyAlert', 'SecurityAlert'],
      'system': ['SystemAlert', 'FRSystemOffline', 'MaintenanceNotice']
    };
    
    return typeMap[filter]?.includes(notification.type) || false;
  });

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  }, [dispatch]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const unreadNotificationIds = notifications
      .filter(n => !n.read)
      .map(n => n.id);

    unreadNotificationIds.forEach(id => {
      dispatch(markNotificationAsRead(id));
    });
  }, [dispatch, notifications]);

  // Clear all notifications
  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      dispatch(clearNotifications());
    }
  }, [dispatch]);

  // Remove notification
  const removeNotificationHandler = useCallback((notificationId) => {
    dispatch(removeNotification(notificationId));
  }, [dispatch]);

  // Handle notification action
  const handleNotificationAction = useCallback(async (notification, action) => {
    console.log('Notification action:', action, notification);
    
    // Mark as read when action is taken
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle specific actions
    try {
      switch (action.action) {
        case 'acknowledge':
          await dispatch(acknowledgeNotificationAsync({ 
            notificationId: notification.id, 
            notes: 'Acknowledged via notification center' 
          })).unwrap();
          
          // Force refresh notifications after acknowledgment
          dispatch(fetchNotifications());
          
          // Also acknowledge via SignalR if available
          if (host?.acknowledgeNotification) {
            await host.acknowledgeNotification(notification.id);
          }
          break;
          
        case 'dismiss':
          removeNotificationHandler(notification.id);
          break;
          
        case 'view_visitor':
          // Navigate to visitor profile
          if (action.visitorId) {
            window.location.href = `/visitors/${action.visitorId}`;
          }
          break;
          
        case 'call_visitor':
          // Initiate phone call
          if (action.phone) {
            window.open(`tel:${action.phone}`);
          }
          break;
          
        case 'contact_security':
          // Contact security team
          window.location.href = '/security/contact';
          break;
          
        case 'view_invitation':
          if (action.invitationId || notification.data?.invitationId) {
            const invitationId = action.invitationId || notification.data.invitationId;
            window.location.href = `/invitations/${invitationId}`;
          }
          break;
          
        default:
          console.log('Unhandled notification action:', action.action);
          break;
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  }, [dispatch, markAsRead, removeNotificationHandler, host]);

  // Enhanced acknowledge handler for direct acknowledge button
  const handleDirectAcknowledge = useCallback(async (notificationId) => {
    try {
      await dispatch(acknowledgeNotificationAsync({ 
        notificationId, 
        notes: 'Direct acknowledgment from notification center' 
      })).unwrap();
      
      // Force refresh notifications after acknowledgment
      dispatch(fetchNotifications());
      
      // Also acknowledge via SignalR if available
      if (host?.acknowledgeNotification) {
        await host.acknowledgeNotification(notificationId);
      }
      
      console.log('✅ Notification acknowledged successfully');
    } catch (error) {
      console.error('❌ Failed to acknowledge notification:', error);
    }
  }, [dispatch, host]);

  // Get notification icon
  const getNotificationIcon = (type, priority) => {
    const iconClass = `w-5 h-5 ${priority === 'Critical' || priority === 'Emergency' ? 'text-red-500' : priority === 'High' ? 'text-orange-500' : priority === 'Medium' ? 'text-yellow-500' : 'text-blue-500'}`;
    
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
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      case 'MaintenanceNotice':
        return <Cog6ToothIcon className="w-5 h-5 text-gray-500" />;
      case 'InvitationSent':
        return <EnvelopeIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'emergency':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
      default:
        return 'blue';
    }
  };

  // Get selected action for a notification
  const getNotificationAction = (notificationId) => {
    return notificationActions[notificationId] || 'markRead';
  };

  // Set action for a notification
  const setNotificationAction = (notificationId, action) => {
    setNotificationActions(prev => ({
      ...prev,
      [notificationId]: action
    }));
  };

  // Execute the selected action
  const executeNotificationAction = async (notificationId) => {
    const action = getNotificationAction(notificationId);

    if (action === 'acknowledge') {
      await handleDirectAcknowledge(notificationId);
    } else {
      markAsRead(notificationId);
    }
  };

  // Render filter tabs
  const renderFilterTabs = () => {
    const filters = [
      { id: 'all', label: `All (${notifications.length})` },
      { id: 'unread', label: `Unread (${unreadCount})` },
      { id: 'visitors', label: 'Visitors' },
      { id: 'security', label: 'Security' },
      { id: 'system', label: 'System' }
    ];

    return (
      <div className="flex space-x-2 overflow-x-auto">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`
              px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors
              ${filter === f.id
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>
    );
  };

  // Render individual notification
  const renderNotification = (notification) => {
    const isCardView = viewMode === 'card';

    return (
      <motion.div
        key={notification.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className={`p-4 border rounded-lg transition-all duration-200 ${
          notification.read
            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-700'
        } ${isCardView ? 'shadow-sm hover:shadow-md' : 'hover:shadow-sm'}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type, notification.priority)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </h4>
              <Badge
                color={getPriorityColor(notification.priority)}
                size="xs"
              >
                {notification.priority}
              </Badge>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {notification.message}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatters.formatRelativeTime(new Date(notification.timestamp))}
            </p>

            {/* Related Entity Information */}
            {notification.data && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
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

          {/* Enhanced Actions Menu with Dropdown */}
          <div className="flex flex-col items-end space-y-2">
            {!notification.read && !notification.acknowledgedOn && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-600"
              >
                {/* Action Type Selector */}
                <select
                  value={getNotificationAction(notification.id)}
                  onChange={(e) => setNotificationAction(notification.id, e.target.value)}
                  className="text-xs border-0 bg-transparent dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="markRead" className="dark:bg-gray-800">📖 Mark as Read</option>
                  <option value="acknowledge" className="dark:bg-gray-800">✅ Acknowledge</option>
                </select>

                {/* Execute Button */}
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => executeNotificationAction(notification.id)}
                  icon={<CheckIcon className="w-3 h-3" />}
                  title={getNotificationAction(notification.id) === 'acknowledge' ? 'Acknowledge' : 'Mark as Read'}
                  className="shadow-sm"
                />
              </motion.div>
            )}

            {/* Remove Button */}
            <Button
              size="xs"
              variant="ghost"
              onClick={() => removeNotificationHandler(notification.id)}
              icon={<XMarkIcon className="w-3 h-3" />}
              title="Remove notification"
              className="text-gray-400 hover:text-red-500 hover:bg-red-50"
            />

            {/* Acknowledged Status Indicator */}
            {notification.read && notification.acknowledgedOn && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Acknowledged</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {notification.actions.map((action, index) => (
              <Button
                key={index}
                size="xs"
                variant="outline"
                onClick={() => handleNotificationAction(notification, action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-hidden ${className}`}
    >
      {/* Header */}

      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellIconSolid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
            {unreadCount > 0 && (
              <Badge color="red" size="sm">{unreadCount}</Badge>
            )}
            {/* Real-time connection indicator */}
            <ConnectionStatus className="ml-2" />
          </div>

          <div className="flex items-center space-x-1">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden mr-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'card'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="Card view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={markAllAsRead}
                icon={<CheckIcon className="w-4 h-4" />}
                title="Mark all as read"
              />
            )}

            {notifications.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearAll}
                icon={<TrashIcon className="w-4 h-4" />}
                title="Clear all notifications"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              />
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              icon={<XMarkIcon className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4">
          {renderFilterTabs()}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 m-4 rounded-lg">
            <p className="text-red-600 text-sm">
              Error loading notifications: {error}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => dispatch(fetchNotifications())}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-2 text-gray-500">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-sm text-gray-500">
              {filter === 'unread' 
                ? "You're all caught up!" 
                : `No ${filter === 'all' ? '' : filter} notifications to show`
              }
            </p>
            {!signalRConnected && !isSignalRConnected && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-600 text-xs">
                  Real-time updates are currently unavailable. Notifications may be delayed.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className={`p-4 ${viewMode === 'card' ? 'grid grid-cols-1 gap-3' : 'space-y-3'}`}>
            <AnimatePresence>
              {filteredNotifications.map(renderNotification)}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>{filteredNotifications.length} notifications</span>
            {/* FIX: Use lastSyncTime directly from root state, not from stats */}
            {lastSyncTime && (
              <span>Updated: {formatters.formatRelativeTime(new Date(lastSyncTime))}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              size="xs"
              variant="ghost"
              onClick={() => dispatch(fetchNotifications())}
              icon={<ArrowPathIcon className="w-3 h-3" />}
              title="Refresh notifications"
            />
            <Button
              size="xs"
              variant="ghost"
              icon={<ArchiveBoxIcon className="w-3 h-3" />}
              title="View archive"
            >
              Archive
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCenter;
