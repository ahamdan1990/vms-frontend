// src/components/notifications/NotificationCenter.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Button from '../common/Button/Button';
import Badge from '../common/Badge/Badge';
import Card from '../common/Card/Card';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';

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
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

// Utils
import formatters from '../../utils/formatters';

/**
 * Advanced Notification Center
 * Manages real-time notifications for visitor management events
 * Includes notification filtering, actions, and real-time updates
 */
const NotificationCenter = ({
  isOpen,
  onClose,
  className = ''
}) => {
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'security', 'visitors', 'system'
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sample notification data - in real app, this would come from WebSocket/API
  const sampleNotifications = [
    {
      id: 1,
      type: 'visitor_checkin',
      title: 'Visitor Check-in',
      message: 'John Doe from ABC Corp has checked in',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      priority: 'normal',
      category: 'visitors',
      actions: [
        { label: 'View Profile', action: 'view_visitor', visitorId: 123 },
        { label: 'Send Welcome', action: 'send_welcome', visitorId: 123 }
      ],
      metadata: {
        visitorName: 'John Doe',
        company: 'ABC Corp',
        host: 'Jane Smith',
        location: 'Main Lobby'
      }
    },
    {
      id: 2,
      type: 'security_alert',
      title: 'Security Alert',
      message: 'Visitor exceeded authorized area - Floor 3 Restricted Zone',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: 'high',
      category: 'security',
      actions: [
        { label: 'View Location', action: 'view_location' },
        { label: 'Contact Security', action: 'contact_security' },
        { label: 'Acknowledge', action: 'acknowledge' }
      ],
      metadata: {
        visitorName: 'Unknown Visitor',
        location: 'Floor 3 - Restricted Zone',
        alertType: 'unauthorized_access'
      }
    },
    {
      id: 3,
      type: 'visitor_overdue',
      title: 'Overdue Visitor',
      message: 'Sarah Wilson has not checked in - 30 minutes overdue',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      priority: 'medium',
      category: 'visitors',
      actions: [
        { label: 'Call Visitor', action: 'call_visitor', phone: '+1234567890' },
        { label: 'Cancel Invitation', action: 'cancel_invitation', invitationId: 456 }
      ],
      metadata: {
        visitorName: 'Sarah Wilson',
        company: 'XYZ Industries',
        expectedTime: new Date(Date.now() - 60 * 60 * 1000),
        host: 'Mike Johnson'
      }
    },
    {
      id: 4,
      type: 'system_update',
      title: 'System Update',
      message: 'New features available: Document scanner and enhanced analytics',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      priority: 'low',
      category: 'system',
      actions: [
        { label: 'View Updates', action: 'view_updates' },
        { label: 'Dismiss', action: 'dismiss' }
      ]
    },
    {
      id: 5,
      type: 'invitation_approved',
      title: 'Invitation Approved',
      message: 'Meeting request for tomorrow has been approved',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
      priority: 'normal',
      category: 'visitors',
      actions: [
        { label: 'Send Notification', action: 'notify_visitor' },
        { label: 'View Details', action: 'view_invitation' }
      ],
      metadata: {
        invitationId: 789,
        host: 'Emily Davis',
        meetingTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    }
  ];

  // Initialize notifications
  useEffect(() => {
    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.category === filter;
  });

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      const newNotifications = prev.filter(n => n.id !== notificationId);
      
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      
      return newNotifications;
    });
  }, []);

  // Handle notification action
  const handleNotificationAction = (notification, action) => {
    console.log('Notification action:', action, notification);
    
    // Mark as read when action is taken
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle specific actions
    switch (action.action) {
      case 'acknowledge':
      case 'dismiss':
        removeNotification(notification.id);
        break;
      case 'view_visitor':
        // Navigate to visitor profile
        break;
      case 'call_visitor':
        // Initiate phone call
        if (action.phone) {
          window.open(`tel:${action.phone}`);
        }
        break;
      case 'contact_security':
        // Contact security team
        break;
      default:
        // Handle other actions
        break;
    }
  };

  // Get notification icon
  const getNotificationIcon = (type, priority) => {
    const iconClass = `w-5 h-5 ${priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`;
    
    switch (type) {
      case 'visitor_checkin':
        return <UserPlusIcon className={iconClass} />;
      case 'visitor_checkout':
        return <UserMinusIcon className={iconClass} />;
      case 'visitor_overdue':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'security_alert':
        return <ShieldExclamationIcon className="w-5 h-5 text-red-500" />;
      case 'system_update':
        return <Cog6ToothIcon className={iconClass} />;
      case 'invitation_approved':
        return <CheckIcon className="w-5 h-5 text-green-500" />;
      case 'invitation_rejected':
        return <XMarkIcon className="w-5 h-5 text-red-500" />;
      case 'email_sent':
        return <EnvelopeIcon className={iconClass} />;
      default:
        return <InformationCircleIcon className={iconClass} />;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
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
        { label: 'All', value: 'all' },
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
            <Badge color="red" size="xs">{tab.count}</Badge>
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
                {formatters.formatRelativeTime(notification.timestamp)}
              </p>

              {/* Metadata */}
              {notification.metadata && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  {notification.metadata.visitorName && (
                    <p><strong>Visitor:</strong> {notification.metadata.visitorName}</p>
                  )}
                  {notification.metadata.company && (
                    <p><strong>Company:</strong> {notification.metadata.company}</p>
                  )}
                  {notification.metadata.host && (
                    <p><strong>Host:</strong> {notification.metadata.host}</p>
                  )}
                  {notification.metadata.location && (
                    <p><strong>Location:</strong> {notification.metadata.location}</p>
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
                onClick={() => removeNotification(notification.id)}
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
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
          <span>{filteredNotifications.length} notifications</span>
          <Button
            size="xs"
            variant="ghost"
            icon={<ArchiveBoxIcon className="w-3 h-3" />}
          >
            View Archive
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCenter;
