// src/hooks/useNotifications.js - UNIFIED NOTIFICATION HOOKS
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  // Actions
  addToast,
  removeToast,
  clearToasts,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  markAllAsRead,
  clearNotifications,
  
  // Helper action creators
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showVisitorCheckedIn,
  showVisitorOverdue,
  
  // Thunk actions
  fetchNotifications,
  markAsRead,
  addNotificationWithDesktop,
  refreshNotifications,
  
  // Constants
  NOTIFICATION_TYPES,
  PRIORITIES
} from '../store/slices/notificationSlice';

/**
 * Primary hook for all notification operations
 * Provides unified API for toasts, persistent notifications, and real-time updates
 */
export const useNotifications = () => {
  const dispatch = useDispatch();
  
  // Select notification state
  const {
    notifications,
    toasts,
    unreadCount,
    loading,
    error,
    isSignalRConnected,
    settings,
    stats
  } = useSelector(state => state.notifications);

  // === TOAST OPERATIONS ===
  const toast = useCallback({
    success: (title, message, options) => dispatch(showSuccessToast(title, message, options)),
    error: (title, message, options) => dispatch(showErrorToast(title, message, options)),
    warning: (title, message, options) => dispatch(showWarningToast(title, message, options)),
    info: (title, message, options) => dispatch(showInfoToast(title, message, options)),
    
    // Custom toast
    show: (toastData) => dispatch(addToast(toastData)),
    remove: (toastId) => dispatch(removeToast(toastId)),
    clear: () => dispatch(clearToasts()),
    
    // Promise-based toast
    promise: async (promise, messages = {}) => {
      const loadingToastId = Date.now().toString();
      
      dispatch(addToast({
        id: loadingToastId,
        type: NOTIFICATION_TYPES.LOADING,
        title: messages.loading || 'Loading...',
        persistent: true
      }));

      try {
        const result = await promise;
        
        dispatch(removeToast(loadingToastId));
        dispatch(showSuccessToast(
          messages.success || 'Success',
          typeof messages.success === 'function' ? messages.success(result) : 'Operation completed successfully'
        ));
        
        return result;
      } catch (error) {
        dispatch(removeToast(loadingToastId));
        dispatch(showErrorToast(
          messages.error || 'Error',
          typeof messages.error === 'function' ? messages.error(error) : error.message
        ));
        throw error;
      }
    }
  }, [dispatch]);
  // === PERSISTENT NOTIFICATION OPERATIONS ===
  const notifications_api = useCallback({
    // Fetch notifications from API
    fetch: (params) => dispatch(fetchNotifications(params)),
    refresh: () => dispatch(refreshNotifications()),
    
    // Add new notification
    add: (notificationData) => dispatch(addNotification(notificationData)),
    
    // Mark as read
    markAsRead: (notificationId) => dispatch(markNotificationAsRead(notificationId)),
    markAsReadAsync: (notificationId) => dispatch(markAsRead(notificationId)),
    markAllAsRead: () => dispatch(markAllAsRead()),
    
    // Remove notifications
    remove: (notificationId) => dispatch(removeNotification(notificationId)),
    clear: () => dispatch(clearNotifications()),
    
    // Real-time notification with desktop support
    addRealTime: (notificationData) => dispatch(addNotificationWithDesktop(notificationData))
  }, [dispatch]);

  // === DOMAIN-SPECIFIC OPERATIONS ===
  const visitor = useCallback({
    checkedIn: (visitorName, hostName) => dispatch(showVisitorCheckedIn(visitorName, hostName)),
    checkedOut: (visitorName) => dispatch(showInfoToast(
      'Visitor Check-out',
      `${visitorName} has checked out`,
      { duration: 4000 }
    )),
    overdue: (visitorName, minutes) => dispatch(showVisitorOverdue(visitorName, minutes)),
    
    // Security alerts
    securityAlert: (message, severity = 'high') => {
      const isHighSeverity = ['high', 'critical', 'emergency'].includes(severity);
      dispatch(isHighSeverity ? showErrorToast : showWarningToast)(
        'Security Alert',
        message,
        {
          persistent: isHighSeverity,
          actions: [
            { label: 'View Details', action: 'view_details' },
            { label: 'Contact Security', action: 'contact_security' }
          ]
        }
      );
    }
  }, [dispatch]);

  // === SYSTEM OPERATIONS ===
  const system = useCallback({
    invitationSent: (email) => dispatch(showSuccessToast(
      'Invitation Sent',
      `Invitation sent to ${email}`
    )),
    
    documentScanned: (count) => dispatch(showSuccessToast(
      'Documents Scanned',
      `${count} document${count > 1 ? 's' : ''} processed successfully`
    )),
    
    excelProcessed: (stats) => dispatch(showSuccessToast(
      'Excel Import Complete',
      `Processed ${stats.visitors} visitors and ${stats.invitations} invitations`,
      { duration: 8000 }
    ))
  }, [dispatch]);
  // === COMPUTED VALUES ===
  const hasUnreadNotifications = unreadCount > 0;
  const hasActiveToasts = toasts.length > 0;
  const isOnline = isSignalRConnected;

  // === RETURN API ===
  return {
    // State
    notifications,
    toasts,
    unreadCount,
    loading,
    error,
    isOnline,
    settings,
    stats,
    
    // Computed
    hasUnreadNotifications,
    hasActiveToasts,
    
    // APIs
    toast,
    notifications: notifications_api,
    visitor,
    system,
    
    // Constants for external use
    TYPES: NOTIFICATION_TYPES,
    PRIORITIES
  };
};

/**
 * Specialized hook for toast notifications only
 * Lightweight alternative when only toasts are needed
 */
export const useToast = () => {
  const dispatch = useDispatch();
  const toasts = useSelector(state => state.notifications.toasts);

  // Helper to extract a string from error objects
  const getErrorMessage = (error) => {
    if (!error) return "An unexpected error occurred";

    if (typeof error === "string") return error;

    if (Array.isArray(error?.details?.errors)) {
      return error.details.errors.join(", ");
    }

    if (error?.message) return error.message;

    return "An unexpected error occurred";
  };

  return {
    toasts,
    hasToasts: toasts.length > 0,
    
    // Toast methods
    success: useCallback((title, message, options) => 
      dispatch(showSuccessToast(title, message, options)), [dispatch]),
    
    error: useCallback((title, error, options) => {
        const message = getErrorMessage(error);
        dispatch(showErrorToast(title, message, options));
      }, [dispatch]),
    
    warning: useCallback((title, message, options) => 
      dispatch(showWarningToast(title, message, options)), [dispatch]),
    
    info: useCallback((title, message, options) => 
      dispatch(showInfoToast(title, message, options)), [dispatch]),
    
    show: useCallback((toastData) => dispatch(addToast(toastData)), [dispatch]),
    remove: useCallback((toastId) => dispatch(removeToast(toastId)), [dispatch]),
    clear: useCallback(() => dispatch(clearToasts()), [dispatch]),
    
    // Promise wrapper
    promise: useCallback(async (promise, messages = {}) => {
      const loadingToastId = Date.now().toString();
      
      dispatch(addToast({
        id: loadingToastId,
        type: NOTIFICATION_TYPES.LOADING,
        title: messages.loading || 'Loading...',
        persistent: true
      }));

      try {
        const result = await promise;
        dispatch(removeToast(loadingToastId));
        dispatch(showSuccessToast(messages.success || 'Success', 'Operation completed'));
        return result;
      } catch (error) {
        dispatch(removeToast(loadingToastId));
        dispatch(showErrorToast(messages.error || 'Error', error.message));
        throw error;
      }
    }, [dispatch])
  };
};

export default useNotifications;