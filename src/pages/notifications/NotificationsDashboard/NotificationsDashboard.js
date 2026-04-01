// src/pages/notifications/NotificationsDashboard/NotificationsDashboard.js
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useSignalR } from '../../../hooks/useSignalR';
import { useNavigate } from 'react-router-dom';

// Redux actions
import {
  fetchNotifications,
  clearNotifications,
  acknowledgeNotificationAsync,
  deleteNotificationAsync,
  fetchNotificationStats,
  updateSettings,
  addToast,
  removeToast,
  updateLastSyncTime
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
  ArchiveBoxIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid, ExclamationTriangleIcon as ExclamationTriangleIconSolid } from '@heroicons/react/24/solid';

// Utils
import { formatDateTime, formatRelativeTime } from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';
import { getNotificationNavigationPath, matchesNotificationKey, normalizeNotificationKey } from '../../../utils/notificationUtils';

// Constants
import { NOTIFICATION_PERMISSIONS } from '../../../constants/permissions';

const NOTIFICATIONS_PAGE_FETCH_PARAMS = {
  pageSize: 100,
  includeExpired: true
};

const PRIORITY_FILTER_OPTIONS = ['emergency', 'critical', 'high', 'medium', 'low'];

const humanizeNotificationLabel = (value) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return '';
  }

  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

/**
 * Notifications Dashboard Page
 * Comprehensive notification management with filtering, acknowledgment, and statistics
 * Built on top of existing notification system with enhanced features
 */
const NotificationsDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const { t } = useTranslation('notifications');

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'acknowledged'
  const [viewMode, setViewMode] = useState('cards'); // 'list', 'cards'
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  
  // New state for individual notification action selection
  const [notificationActions, setNotificationActions] = useState({}); // { notificationId: 'markRead'|'acknowledge' }
  const [showActionDropdowns, setShowActionDropdowns] = useState({}); // { notificationId: boolean }

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
    stats,
    settings,
    lastSyncTime
  } = useSelector(state => state.notifications);

  const refreshNotifications = useCallback(() => {
    return dispatch(fetchNotifications(NOTIFICATIONS_PAGE_FETCH_PARAMS));
  }, [dispatch]);

  // Get real-time SignalR connection status with reactive polling
  const { areConnectionsHealthy, getConnectionHealth } = useSignalR();
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);

  // Poll connection status every 2 seconds for reactive updates
  useEffect(() => {
    const checkConnection = () => {
      const connected = areConnectionsHealthy();
      const health = getConnectionHealth();

      // Debug logging
      console.log('SignalR Health Check:', {
        connected,
        health
      });

      setIsSignalRConnected(connected);
    };

    // Initial check
    checkConnection();

    // Set up polling interval
    const intervalId = setInterval(checkConnection, 2000);

    return () => clearInterval(intervalId);
  }, [areConnectionsHealthy, getConnectionHealth]);

  // Computed values
  const hasSelectedNotifications = selectedNotifications.length > 0;
  const isNotificationAcknowledged = (notification) => Boolean(notification?.read || notification?.acknowledged);
  const getNotificationDate = (notification) => {
    const notificationDate = new Date(notification.timestamp || notification.createdOn);
    return Number.isNaN(notificationDate.getTime()) ? null : notificationDate;
  };
  const getNotificationPriorityLabel = (priority) => {
    const normalizedPriority = normalizeNotificationKey(priority);

    if (!normalizedPriority) {
      return humanizeNotificationLabel(priority);
    }

    return t(`priority.${normalizedPriority}`, {
      defaultValue: humanizeNotificationLabel(priority)
    });
  };
  const getNotificationTypeLabel = (type) => {
    const normalizedType = normalizeNotificationKey(type);

    switch (normalizedType) {
      case 'invitationcreated':
        return t('types.invitationCreated', { defaultValue: humanizeNotificationLabel(type) });
      case 'invitationapproved':
        return t('types.invitationApproved', { defaultValue: humanizeNotificationLabel(type) });
      case 'invitationrejected':
        return t('types.invitationRejected', { defaultValue: humanizeNotificationLabel(type) });
      case 'invitationpendingapproval':
        return t('types.approvalRequired', { defaultValue: humanizeNotificationLabel(type) });
      case 'visitorarrival':
        return t('types.visitorArrival', { defaultValue: humanizeNotificationLabel(type) });
      case 'visitorcheckedin':
        return t('types.visitorCheckedIn', { defaultValue: humanizeNotificationLabel(type) });
      case 'visitorcheckedout':
        return t('types.visitorCheckedOut', { defaultValue: humanizeNotificationLabel(type) });
      case 'visitoroverstay':
        return t('types.visitorOverstay', { defaultValue: humanizeNotificationLabel(type) });
      case 'systemalert':
      case 'frsystemoffline':
        return t('types.systemAlert', { defaultValue: humanizeNotificationLabel(type) });
      case 'securityalert':
      case 'blacklistalert':
      case 'unknownface':
      case 'emergencyalert':
        return t('types.securityAlert', { defaultValue: humanizeNotificationLabel(type) });
      default:
        return humanizeNotificationLabel(type);
    }
  };
  const typeFilterOptions = notifications
    .reduce((options, notification) => {
      const rawType = notification?.type;
      const normalizedType = normalizeNotificationKey(rawType);

      if (!normalizedType || options.some((option) => option.key === normalizedType)) {
        return options;
      }

      return [
        ...options,
        {
          key: normalizedType,
          value: rawType,
          label: getNotificationTypeLabel(rawType)
        }
      ];
    }, [])
    .sort((left, right) => left.label.localeCompare(right.label));
  const selectedNotificationItems = notifications.filter(notification => selectedNotifications.includes(notification.id));
  const canClearSelected = selectedNotificationItems.length > 0 &&
    selectedNotificationItems.every(notification => isNotificationAcknowledged(notification));
  const hasActiveFilters = Boolean(searchInput || priorityFilter || typeFilter || dateRangeFilter);
  const filteredNotifications = notifications.filter(notification => {
    const notificationIsAcknowledged = isNotificationAcknowledged(notification);

    if (activeTab === 'unread' && notificationIsAcknowledged) return false;
    if (activeTab === 'acknowledged' && !notificationIsAcknowledged) return false;
    if (priorityFilter && !matchesNotificationKey(notification.priority, priorityFilter)) return false;
    if (typeFilter && !matchesNotificationKey(notification.type, typeFilter)) return false;

    if (dateRangeFilter) {
      const notificationDate = getNotificationDate(notification);
      if (!notificationDate) return false;

      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      if (dateRangeFilter === 'today' && notificationDate < startOfToday) return false;

      if (dateRangeFilter === 'week') {
        const startOfWeek = new Date(startOfToday);
        const dayOfWeek = startOfWeek.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(startOfWeek.getDate() - daysFromMonday);

        if (notificationDate < startOfWeek) return false;
      }

      if (dateRangeFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        if (notificationDate < startOfMonth) return false;
      }
    }

    if (searchInput) {
      const searchTerm = searchInput.toLowerCase();
      const notificationTypeLabel = getNotificationTypeLabel(notification.type).toLowerCase();

      if (!(
        notification.title?.toLowerCase().includes(searchTerm) ||
        notification.message?.toLowerCase().includes(searchTerm) ||
        notification.type?.toLowerCase().includes(searchTerm) ||
        notificationTypeLabel.includes(searchTerm)
      )) {
        return false;
      }
    }

    return true;
  });
  const allFilteredSelected = filteredNotifications.length > 0 &&
    filteredNotifications.every(notification => selectedNotifications.includes(notification.id));

  // Initialize page and notifications
  useEffect(() => {
    dispatch(setPageTitle(t('pageTitle')));
    
    if (canReadOwn || canReadAll) {
      refreshNotifications();
      if (canViewStats) {
        dispatch(fetchNotificationStats());
      }
    }
  }, [dispatch, canReadOwn, canReadAll, canViewStats, refreshNotifications, t]);

  // Auto-refresh notifications
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(() => {
      if (canReadOwn || canReadAll) {
        refreshNotifications();
        dispatch(updateLastSyncTime());
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [dispatch, refreshInterval, canReadOwn, canReadAll, refreshNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        setShowActionDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedNotifications(prev => {
      const nextSelection = prev.filter(id => notifications.some(notification => notification.id === id));
      return nextSelection.length === prev.length ? prev : nextSelection;
    });
  }, [notifications]);

  useEffect(() => {
    if (bulkAction === 'clear' && !canClearSelected) {
      setBulkAction('');
    }
  }, [bulkAction, canClearSelected]);

  // Event handlers
  const handleSearch = (value) => {
    setSearchInput(value);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setActiveTab('all');
    setPriorityFilter('');
    setTypeFilter('');
    setDateRangeFilter('');
  };

  const handleRefresh = () => {
    refreshNotifications();
    if (canViewStats) {
      dispatch(fetchNotificationStats());
    }
    dispatch(addToast({
      type: 'success',
      title: t('toast.refreshTitle'),
      message: t('toast.refreshMessage'),
      duration: 2000
    }));
  };

  const handleAcknowledge = async (notificationId, notes = '') => {
    if (!canAcknowledge) return;
    
    try {
      // First, acknowledge via Redux action
      await dispatch(acknowledgeNotificationAsync({ notificationId, notes })).unwrap();
      
      // Force refresh notifications to ensure UI reflects backend state
      await refreshNotifications();
      
      // Update statistics
      if (canViewStats) {
        dispatch(fetchNotificationStats());
      }
      
      // Show success toast
      dispatch(addToast({
        type: 'success',
        title: t('toast.acknowledgedTitle'),
        message: t('toast.acknowledgedMessage'),
        duration: 3000
      }));
      
      // Clear any selected notifications if this was one of them
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
      
    } catch (error) {
      console.error('Acknowledgment failed:', error);
      dispatch(addToast({
        type: 'error',
        title: t('toast.acknowledgeFailed'),
        message: extractErrorMessage(error),
        duration: 5000
      }));
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    if (!canAcknowledge) return;

    await handleAcknowledge(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    if (!canAcknowledge) return;

    const unreadNotificationIds = notifications
      .filter(notification => !isNotificationAcknowledged(notification))
      .map(notification => notification.id);

    if (unreadNotificationIds.length === 0) {
      return;
    }

    try {
      await Promise.all(
        unreadNotificationIds.map(notificationId =>
          dispatch(acknowledgeNotificationAsync({ notificationId })).unwrap()
        )
      );

      await refreshNotifications();

      if (canViewStats) {
        dispatch(fetchNotificationStats());
      }

      dispatch(addToast({
        type: 'success',
        title: t('toast.markAllReadTitle'),
        message: t('toast.markAllReadMessage', { count: unreadNotificationIds.length }),
        duration: 3000
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: t('toast.acknowledgeFailed'),
        message: extractErrorMessage(error),
        duration: 5000
      }));
    }
  };

  const handleBulkAction = () => {
    if (!hasSelectedNotifications || !bulkAction) return;
    if (bulkAction === 'clear' && !canClearSelected) return;
    setShowBulkConfirm(true);
  };

  const handleConfirmBulkAction = async () => {
    const count = selectedNotifications.length;

      try {
        if (bulkAction === 'markRead') {
          const promises = selectedNotifications.map(id =>
            dispatch(acknowledgeNotificationAsync({ notificationId: id })).unwrap()
          );

          await Promise.all(promises);

          await refreshNotifications();

          dispatch(addToast({
            type: 'success',
          title: t('bulk.complete'),
          message: t('bulk.markedRead', { count }),
          duration: 3000
        }));
      } else if (bulkAction === 'acknowledge') {
        // Acknowledge all notifications with proper async handling
        const promises = selectedNotifications.map(id =>
          dispatch(acknowledgeNotificationAsync({ notificationId: id, notes: 'Bulk acknowledgment' })).unwrap()
        );

        // Wait for all acknowledgments to complete
        await Promise.all(promises);

        // Refresh notifications to reflect backend state
        await refreshNotifications();

        dispatch(addToast({
          type: 'success',
          title: t('bulk.complete'),
          message: t('bulk.acknowledgedAll', { count }),
          duration: 3000
        }));
      } else if (bulkAction === 'clear') {
        const promises = selectedNotifications.map(id =>
          dispatch(deleteNotificationAsync(id)).unwrap()
        );

        await Promise.all(promises);
        await refreshNotifications();

        dispatch(addToast({
          type: 'success',
          title: t('bulk.complete'),
          message: t('bulk.cleared', { count }),
          duration: 3000
        }));
      }

      // Update statistics after bulk action
      if (canViewStats) {
        dispatch(fetchNotificationStats());
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      dispatch(addToast({
        type: 'error',
        title: t('bulk.failed'),
        message: extractErrorMessage(error),
        duration: 5000
      }));
    } finally {
      // Always clear selections and close modal
      setSelectedNotifications([]);
      setBulkAction('');
      setShowBulkConfirm(false);
    }
  };

  const handleClearNotification = async (notificationId) => {
    try {
      await dispatch(deleteNotificationAsync(notificationId)).unwrap();
      await refreshNotifications();

      if (canViewStats) {
        dispatch(fetchNotificationStats());
      }

      dispatch(addToast({
        type: 'success',
        title: t('toast.clearedTitle'),
        message: t('toast.clearedMessage'),
        duration: 3000
      }));

      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: t('toast.clearFailed'),
        message: extractErrorMessage(error),
        duration: 5000
      }));
    }
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

  // Helper functions for notification action management
  const getNotificationAction = (notificationId) => {
    return notificationActions[notificationId] || 'markRead';
  };

  const setNotificationAction = (notificationId, action) => {
    setNotificationActions(prev => ({
      ...prev,
      [notificationId]: action
    }));
  };

  const toggleActionDropdown = (notificationId) => {
    setShowActionDropdowns(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

  const executeNotificationAction = async (notificationId) => {
    const action = getNotificationAction(notificationId);
    
    if (action === 'acknowledge') {
      await handleAcknowledge(notificationId);
    } else {
      handleMarkAsRead(notificationId);
    }
    
    // Close dropdown after action
    setShowActionDropdowns(prev => ({
      ...prev,
      [notificationId]: false
    }));
  };

  const handleNotificationOpen = async (notification) => {
    if (!isNotificationAcknowledged(notification) && canAcknowledge) {
      await handleAcknowledge(notification.id);
    }

    const navigationPath = getNotificationNavigationPath(notification);
    if (navigationPath) {
      navigate(navigationPath);
    }
  };

  const handleNotificationActionClick = async (notification, action) => {
    if (action?.action === 'acknowledge') {
      await handleAcknowledge(notification.id);
      return;
    }

    const overrideNotification = {
      ...notification,
      data: {
        ...(notification.data || {}),
        invitationId: action?.invitationId || notification.data?.invitationId,
        visitorId: action?.visitorId || notification.data?.visitorId
      }
    };

    await handleNotificationOpen(overrideNotification);
  };

  // Helper functions
  const getNotificationIcon = (type, priority) => {
    const normalizedType = normalizeNotificationKey(type);
    const normalizedPriority = normalizeNotificationKey(priority);
    const iconClass = `w-5 h-5 ${
      normalizedPriority === 'critical' || normalizedPriority === 'emergency' 
        ? 'text-red-500' 
        : normalizedPriority === 'high' 
          ? 'text-orange-500' 
          : normalizedPriority === 'medium' 
            ? 'text-yellow-500' 
            : 'text-blue-500'
    }`;
    
    switch (normalizedType) {
      case 'visitorarrival':
      case 'visitorcheckedin':
        return <UserPlusIcon className={iconClass} />;
      case 'visitorcheckedout':
        return <UserMinusIcon className={iconClass} />;
      case 'visitoroverstay':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'blacklistalert':
      case 'unknownface':
      case 'emergencyalert':
      case 'securityalert':
        return <ShieldExclamationIcon className="w-5 h-5 text-red-500" />;
      case 'systemalert':
      case 'frsystemoffline':
        return <Cog6ToothIcon className={iconClass} />;
      case 'invitationapproved':
        return <CheckIcon className="w-5 h-5 text-green-500" />;
      case 'invitationrejected':
        return <XMarkIcon className="w-5 h-5 text-red-500" />;
      case 'invitationpendingapproval':
      case 'invitationcreated':
      case 'invitationsent':
        return <EnvelopeIcon className={iconClass} />;
      default:
        return <InformationCircleIcon className={iconClass} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (normalizeNotificationKey(priority)) {
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
    const normalizedType = normalizeNotificationKey(type);

    switch (normalizedType) {
      case 'securityalert':
      case 'blacklistalert':
      case 'emergencyalert':
        return 'red';
      case 'visitorcheckin':
      case 'visitorcheckedin':
        return 'green';
      case 'visitoroverdue':
      case 'visitoroverstay':
        return 'yellow';
      case 'systemalert':
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
        return notifications.filter(notification => !isNotificationAcknowledged(notification)).length;
      case 'acknowledged':
        return notifications.filter(notification => isNotificationAcknowledged(notification)).length;
      default:
        return 0;
    }
  };

  // Render functions
  const renderNotificationCard = (notification) => {
    const notificationIsAcknowledged = isNotificationAcknowledged(notification);

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
          !notificationIsAcknowledged ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
        onClick={() => handleNotificationOpen(notification)}
      >
        <div className="flex items-start gap-3">
          {/* Selection checkbox */}
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              checked={selectedNotifications.includes(notification.id)}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => {
                event.stopPropagation();
                handleNotificationSelect(notification.id, event.target.checked);
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
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </h4>
                  <Badge color={getPriorityColor(notification.priority)} size="xs">
                    {getNotificationPriorityLabel(notification.priority)}
                  </Badge>
                  {!notificationIsAcknowledged && (
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {notification.message}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(new Date(notification.timestamp || notification.createdOn))}
                </p>

                {/* Related Entity Information */}
                {notification.data && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {notification.data.visitorName && (
                      <p><strong>{t('card.visitor')}</strong> {notification.data.visitorName}</p>
                    )}
                    {notification.data.company && (
                      <p><strong>{t('card.company')}</strong> {notification.data.company}</p>
                    )}
                    {notification.data.hostName && (
                      <p><strong>{t('card.host')}</strong> {notification.data.hostName}</p>
                    )}
                    {notification.data.location && (
                      <p><strong>{t('card.location')}</strong> {notification.data.location}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Enhanced Actions with Dropdown */}
              <div className="flex items-center gap-1 ms-2">
                {!notificationIsAcknowledged && canAcknowledge && (
                  <div className="relative notification-dropdown">
                    {/* Action Dropdown Toggle */}
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActionDropdown(notification.id);
                      }}
                      className="flex items-center gap-1"
                    >
                      <span className="text-xs">
                        {getNotificationAction(notification.id) === 'acknowledge' ? t('card.acknowledge') : t('card.markAsRead')}
                      </span>
                      <ChevronDownIcon className="w-3 h-3" />
                    </Button>

                    {/* Dropdown Menu */}
                    {showActionDropdowns[notification.id] && (
                      <div className="absolute end-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotificationAction(notification.id, 'markRead');
                              setShowActionDropdowns(prev => ({ ...prev, [notification.id]: false }));
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${
                              getNotificationAction(notification.id) === 'markRead' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <CheckIcon className="w-3 h-3" />
                            <span>{t('card.markAsRead')}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotificationAction(notification.id, 'acknowledge');
                              setShowActionDropdowns(prev => ({ ...prev, [notification.id]: false }));
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${
                              getNotificationAction(notification.id) === 'acknowledge' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>{t('card.acknowledge')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Execute Action Button */}
                {!notificationIsAcknowledged && canAcknowledge && (
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      executeNotificationAction(notification.id);
                    }}
                    className="ms-2"
                  >
                    {t('card.execute')}
                  </Button>
                )}

                {/* Show acknowledged status */}
                {notificationIsAcknowledged && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="text-xs">{t('card.acknowledged')}</span>
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClearNotification(notification.id);
                      }}
                      className="flex items-center gap-1"
                    >
                      <TrashIcon className="w-3 h-3" />
                      <span>{t('card.clear')}</span>
                    </Button>
                  </div>
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
                      handleNotificationActionClick(notification, action);
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
  };

  // Render loading state
  if (!canReadOwn && !canReadAll) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIconSolid className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('accessDenied')}</h3>
          <p className="text-gray-500">{t('accessDeniedDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('pageTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('pageSubtitle')}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isSignalRConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isSignalRConnected ? t('connected') : t('disconnected')}
              </span>
            </div>
            {lastSyncTime && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {t('lastUpdated')} {formatRelativeTime(new Date(lastSyncTime))}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button
            variant="outline"
            icon={<ArrowPathIcon className="w-5 h-5" />}
            onClick={handleRefresh}
            disabled={loading}
          >
            {t('refresh')}
          </Button>

          <Button
            variant="outline"
            icon={<FunnelIcon className="w-5 h-5" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {t('filters')}
          </Button>

          {unreadCount > 0 && canAcknowledge && (
            <Button
              onClick={handleMarkAllAsRead}
              icon={<CheckCircleIcon className="w-5 h-5" />}
            >
              {t('markAllRead_count', { count: unreadCount })}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {canViewStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BellIconSolid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ms-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('stats.total')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIconSolid className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ms-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('stats.unread')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIconSolid className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ms-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('stats.critical')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {notifications.filter(n => matchesNotificationKey(n.priority, ['critical', 'emergency'])).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ms-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('stats.last24h')}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.last24Hours || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-8">
          {[
            { id: 'all', label: t('tabs.all') },
            { id: 'unread', label: t('tabs.unread') },
            { id: 'acknowledged', label: t('tabs.acknowledged') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
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
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('view')}</span>
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                size="sm"
                className="w-24"
              >
                <option value="list">{t('viewList')}</option>
                <option value="cards">{t('viewCards')}</option>
              </Select>
            </div>

            {/* Bulk Actions */}
            {hasSelectedNotifications && canAcknowledge && (
              <div className="flex items-center gap-2">
                <Select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  placeholder={t('bulkActions.selectAction')}
                  size="sm"
                  className="w-40"
                >
                  <option value="">{t('bulkActions.selectAction')}</option>
                  <option value="markRead">{t('bulkActions.markAsRead')}</option>
                  <option value="acknowledge">{t('bulkActions.acknowledge')}</option>
                  {canClearSelected && (
                    <option value="clear">{t('bulkActions.clear')}</option>
                  )}
                </Select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                >
                  {t('bulkActions.apply', { count: selectedNotifications.length })}
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
                  label={t('filters_panel.priority')}
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  placeholder={t('filters_panel.allPriorities')}
                  size="sm"
                >
                  <option value="">{t('filters_panel.allPriorities')}</option>
                  {PRIORITY_FILTER_OPTIONS.map(priority => (
                    <option key={priority} value={priority}>
                      {getNotificationPriorityLabel(priority)}
                    </option>
                  ))}
                </Select>

                <Select
                  label={t('filters_panel.type')}
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  placeholder={t('filters_panel.allTypes')}
                  size="sm"
                >
                  <option value="">{t('filters_panel.allTypes')}</option>
                  {typeFilterOptions.map(option => (
                    <option key={option.key} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <Select
                  label={t('filters_panel.dateRange')}
                  value={dateRangeFilter}
                  onChange={(event) => setDateRangeFilter(event.target.value)}
                  placeholder={t('filters_panel.allTime')}
                  size="sm"
                >
                  <option value="">{t('filters_panel.allTime')}</option>
                  <option value="today">{t('filters_panel.today')}</option>
                  <option value="week">{t('filters_panel.thisWeek')}</option>
                  <option value="month">{t('filters_panel.thisMonth')}</option>
                </Select>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="w-full"
                  >
                    {t('filters_panel.clearFilters')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selection Controls */}
          {filteredNotifications.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {t('bulkActions.selectAll', { count: filteredNotifications.length })}
                </span>
              </label>

              {hasSelectedNotifications && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {t('bulkActions.selected', { count: selectedNotifications.length })}
                  </span>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setSelectedNotifications([])}
                  >
                    {t('bulkActions.clearSelection')}
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
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{extractErrorMessage(error)}</p>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {/* Clear error if available */}}
            >
              {t('card.dismiss')}
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
              <span className="ms-3 text-gray-500">{t('loading')}</span>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={BellIcon}
              title={t('noNotifications')}
              description={
                searchInput
                  ? t('noNotificationsSearch', { search: searchInput })
                  : hasActiveFilters
                    ? t('noNotificationsFiltered')
                  : activeTab === 'unread'
                    ? t('allCaughtUp')
                    : t('noNotificationsDisplay')
              }
              action={
                hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    {searchInput ? t('clearSearch') : t('filters_panel.clearFilters')}
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <div className={viewMode === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
            <AnimatePresence>
              {filteredNotifications.map(notification => renderNotificationCard(notification))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bulk Action Confirmation Modal */}
      <AnimatePresence>
        {showBulkConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('bulk.confirmTitle')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {t('bulk.confirmDesc', {
                      action: bulkAction === 'markRead'
                        ? t('bulk.actionMarkRead')
                        : bulkAction === 'acknowledge'
                          ? t('bulk.actionAcknowledge')
                          : t('bulk.actionClear'),
                      count: selectedNotifications.length,
                    })}
                  </p>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowBulkConfirm(false)}
                    >
                      {t('common:buttons.cancel')}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleConfirmBulkAction}
                    >
                      {t('bulk.confirm')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel (if needed later) */}
      {/* You can add notification settings here */}
    </div>
  );
};

export default NotificationsDashboard;
