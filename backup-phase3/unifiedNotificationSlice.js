// src/store/slices/notificationSlice.js - UNIFIED NOTIFICATION SYSTEM
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';

// Notification types with consistent naming
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error', 
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading',
  // Domain-specific types
  VISITOR_CHECKIN: 'visitor_checkin',
  VISITOR_CHECKOUT: 'visitor_checkout', 
  VISITOR_OVERDUE: 'visitor_overdue',
  SECURITY_ALERT: 'security_alert',
  INVITATION_SENT: 'invitation_sent',
  SYSTEM_ALERT: 'system_alert'
};

// Notification priorities
export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency'
};

// Toast positions
export const POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center', 
  BOTTOM_RIGHT: 'bottom-right'
};

const initialState = {
  // Persistent notifications (from API)
  notifications: [],
  unreadCount: 0,
  
  // Temporary toast notifications
  toasts: [],
  
  // System state
  loading: false,
  error: null,
  lastSyncTime: null,
  isSignalRConnected: false,
  
  // Settings
  settings: {
    desktop: true,
    email: true,
    sound: true,
    position: POSITIONS.TOP_RIGHT,
    maxToasts: 5,
    defaultDuration: 4000,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  },
  
  // Push notification state  
  pushPermission: 'default',
  pushSupported: false,
  pushSubscription: null,
  
  // Statistics
  stats: {
    total: 0,
    unread: 0,
    byType: {},
    byPriority: {}
  }
};
// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.acknowledgeNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Desktop notification helper
const showDesktopNotification = (notification, settings) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!settings.desktop) return;

  // Check quiet hours
  if (settings.quietHours.enabled) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (currentTime >= settings.quietHours.start || currentTime <= settings.quietHours.end) return;
  }

  try {
    const desktopNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/logo192.png',
      tag: notification.id,
      requireInteraction: notification.persistent
    });

    if (!notification.persistent) {
      setTimeout(() => desktopNotification.close(), 5000);
    }
  } catch (error) {
    console.error('Desktop notification failed:', error);
  }
};
// Main notification slice
const unifiedNotificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // === PERSISTENT NOTIFICATIONS ===
    addNotification: (state, action) => {
      const notification = {
        id: action.payload.id || Date.now().toString(),
        type: action.payload.type || NOTIFICATION_TYPES.INFO,
        title: action.payload.title,
        message: action.payload.message,
        priority: action.payload.priority || PRIORITIES.MEDIUM,
        timestamp: action.payload.timestamp || new Date().toISOString(),
        read: false,
        persistent: true,
        actions: action.payload.actions || [],
        data: action.payload.data || null
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;
      
      // Limit notifications
      if (state.notifications.length > 100) {
        const removed = state.notifications.slice(100);
        state.notifications = state.notifications.slice(0, 100);
        const removedUnread = removed.filter(n => !n.read).length;
        state.unreadCount = Math.max(0, state.unreadCount - removedUnread);
      }
    },

    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    removeNotification: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      }
    },
    // === TOAST NOTIFICATIONS ===
    addToast: (state, action) => {
      const toast = {
        id: action.payload.id || Date.now().toString() + Math.random(),
        type: action.payload.type || NOTIFICATION_TYPES.INFO,
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration ?? state.settings.defaultDuration,
        persistent: action.payload.persistent || false,
        actions: action.payload.actions || [],
        position: action.payload.position || state.settings.position
      };

      state.toasts.unshift(toast);
      
      // Limit toasts
      if (state.toasts.length > state.settings.maxToasts) {
        state.toasts = state.toasts.slice(0, state.settings.maxToasts);
      }
    },

    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },

    clearToasts: (state) => {
      state.toasts = [];
    },

    // === SETTINGS ===
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // === SYSTEM STATE ===
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setSignalRConnected: (state, action) => {
      state.isSignalRConnected = action.payload;
    },

    updateLastSyncTime: (state) => {
      state.lastSyncTime = new Date().toISOString();
    },
    // === BATCH OPERATIONS ===
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.unreadCount = 0;
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // === REAL-TIME NOTIFICATIONS ===
    addRealTimeNotification: (state, action) => {
      const notification = {
        id: action.payload.id || Date.now().toString(),
        type: action.payload.type || NOTIFICATION_TYPES.INFO,
        title: action.payload.title,
        message: action.payload.message,
        priority: action.payload.priority || PRIORITIES.MEDIUM,
        timestamp: action.payload.timestamp || new Date().toISOString(),
        read: false,
        persistent: true,
        actions: action.payload.actions || [],
        data: action.payload.data || null
      };

      // Add to notifications
      state.notifications.unshift(notification);
      state.unreadCount += 1;

      // Auto-create toast for high-priority items
      if ([PRIORITIES.HIGH, PRIORITIES.CRITICAL, PRIORITIES.EMERGENCY].includes(notification.priority)) {
        const toast = {
          id: notification.id + '_toast',
          type: notification.type,
          title: notification.title,
          message: notification.message,
          duration: notification.priority === PRIORITIES.EMERGENCY ? 0 : 8000,
          persistent: notification.priority === PRIORITIES.EMERGENCY,
          actions: notification.actions
        };
        state.toasts.unshift(toast);
        
        if (state.toasts.length > state.settings.maxToasts) {
          state.toasts = state.toasts.slice(0, state.settings.maxToasts);
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.items;
        state.unreadCount = action.payload.items.filter(n => !n.read).length;
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          notification.acknowledgedOn = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  }
});

// Export actions
export const {
  // Persistent notifications
  addNotification,
  markNotificationAsRead,
  removeNotification,
  markAllAsRead,
  clearNotifications,
  
  // Toast notifications
  addToast,
  removeToast,
  clearToasts,
  
  // Settings
  updateSettings,
  
  // System state
  setLoading,
  setError,
  clearError,
  setSignalRConnected,
  updateLastSyncTime,
  
  // Real-time
  addRealTimeNotification
} = unifiedNotificationSlice.actions;
// === HELPER ACTION CREATORS ===
export const showSuccessToast = (title, message, options = {}) => 
  addToast({
    type: NOTIFICATION_TYPES.SUCCESS,
    title,
    message,
    duration: 4000,
    ...options
  });

export const showErrorToast = (title, message, options = {}) => 
  addToast({
    type: NOTIFICATION_TYPES.ERROR,
    title,
    message,
    duration: 0,
    persistent: true,
    ...options
  });

export const showWarningToast = (title, message, options = {}) => 
  addToast({
    type: NOTIFICATION_TYPES.WARNING,
    title,
    message,
    duration: 6000,
    ...options
  });

export const showInfoToast = (title, message, options = {}) => 
  addToast({
    type: NOTIFICATION_TYPES.INFO,
    title,
    message,
    duration: 4000,
    ...options
  });

// === DOMAIN-SPECIFIC ACTION CREATORS ===
export const showVisitorCheckedIn = (visitorName, hostName) => 
  addToast({
    type: NOTIFICATION_TYPES.VISITOR_CHECKIN,
    title: 'Visitor Check-in',
    message: `${visitorName} has checked in with ${hostName}`,
    duration: 6000
  });

export const showVisitorOverdue = (visitorName, minutes) => 
  addToast({
    type: NOTIFICATION_TYPES.VISITOR_OVERDUE,
    title: 'Visitor Overdue',
    message: `${visitorName} is ${minutes} minutes overdue`,
    persistent: true,
    actions: [
      { label: 'Contact Visitor', action: 'contact_visitor' },
      { label: 'Extend Visit', action: 'extend_visit' }
    ]
  });
// === THUNK ACTIONS ===
export const addNotificationWithDesktop = (notificationData) => (dispatch, getState) => {
  const { notifications } = getState();
  
  // Add to Redux store
  dispatch(addRealTimeNotification(notificationData));
  
  // Show desktop notification if enabled
  if (notifications.settings.desktop && Notification.permission === 'granted') {
    showDesktopNotification({
      id: notificationData.id || Date.now().toString(),
      title: notificationData.title,
      message: notificationData.message,
      persistent: notificationData.priority === PRIORITIES.EMERGENCY
    }, notifications.settings);
  }
};

export const initializeNotifications = () => async (dispatch) => {
  try {
    // Check browser support
    const pushSupported = 'Notification' in window && 'serviceWorker' in navigator;
    
    // Only check permission, don't request automatically  
    if ('Notification' in window) {
      console.log('Notifications initialized. Permission:', Notification.permission);
    }

    // Load initial notifications
    await dispatch(fetchNotifications());
    
    console.log('✅ Unified notification system initialized');
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    dispatch(setError('Failed to initialize notifications'));
  }
};

export const refreshNotifications = () => async (dispatch) => {
  await dispatch(fetchNotifications());
  dispatch(updateLastSyncTime());
};

// Export reducer
export default unifiedNotificationSlice.reducer;