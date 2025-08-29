// src/components/notifications/NotificationCenter.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchNotifications, 
  acknowledgeNotificationAsync, 
  markNotificationAsRead,
  removeNotification,
  fetchNotificationStats
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
  ArrowPathIcon
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
  
  // Redux state
  const {
    notifications,
    unreadCount,
    loading,
    error,
    isSignalRConnected,
    stats
  } = useSelector(state => state.notifications);

  // SignalR integration
  const { isConnected: signalRConnected, host } = useSignalR();

  // Local state
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'security', 'visitors', 'system'

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

  // Get priority badge color
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

  // Render filter tabs
  const renderFilterTabs = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
      {[
        { label: 'All', value: 'all', count: notifications.length },
        { label: 'Unread', value: 'unread', count: unreadCount },
        { label: 'Visitors', value: 'visitors' },
        { label: 'Security', value: 'security' },
        { label: 'System', value: 'system' }
      ].map(tab => (
        <button
          key={tab.value}
          onClick={() => setFilter(tab.value)}
          className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
            filter === tab.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && tab.count > 0 && (
            <Badge color={tab.value === 'unread' ? 'red' : 'gray'} size="xs">
              {tab.count}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );

  // Render notification item
  const renderNotification = (notification) => (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Notification Icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type, notification.priority)}
        </div>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {notification.title}
                </h4>
                <Badge 
                  color={getPriorityColor(notification.priority)} 
                  size="xs"
                >
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
                {formatters.formatRelativeTime(new Date(notification.timestamp))}
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

            {/* Actions Menu */}
            <div className="flex items-center space-x-1">
              {!notification.read && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => markAsRead(notification.id)}
                  icon={<CheckIcon className="w-3 h-3" />}
                  title="Mark as read"
                />
              )}
              
              <Button
                size="xs"
                variant="ghost"
                onClick={() => removeNotificationHandler(notification.id)}
                icon={<XMarkIcon className="w-3 h-3" />}
                title="Remove notification"
              />
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
        </div>
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 overflow-hidden ${className}`}
    >
      {/* Header */}

      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellIconSolid className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <Badge color="red" size="sm">{unreadCount}</Badge>
            )}
            {/* Real-time connection indicator */}
            <ConnectionStatus className="ml-2" />
          </div>
          
          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={markAllAsRead}
                icon={<CheckIcon className="w-4 h-4" />}
                title="Mark all as read"
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
          <div className="p-4 space-y-3">
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
            {stats.lastSyncTime && (
              <span>Updated: {formatters.formatRelativeTime(new Date(stats.lastSyncTime))}</span>
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
