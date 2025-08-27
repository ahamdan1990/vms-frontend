// src/store/slices/notificationSlice.js - PRODUCTION VERSION WITH SIGNALR INTEGRATION
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  
  // Settings
  settings: {
    desktop: true,
    email: true,
    sms: false,
    sound: true,
    vibration: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  },
  
  // Toast notifications (temporary)
  toasts: [],
  
  // Push notification state
  pushSupported: false,
  pushPermission: 'default', // 'default' | 'granted' | 'denied'
  pushSubscription: null,
  
  // Real-time state
  isSignalRConnected: false,
  lastSyncTime: null,
  
  // Statistics
  stats: {
    total: 0,
    unread: 0,
    byType: {},
    byPriority: {}
  }
};

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INVITATION: 'invitation',
  CHECK_IN: 'checkin',
  ALERT: 'alert',
  SYSTEM: 'system'
};

// ✅ PRODUCTION FIX: Safe desktop notification function
const showDesktopNotification = (notification, settings) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  if (!settings.desktop) {
    return;
  }

  // Check quiet hours
  if (settings.quietHours.enabled) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (currentTime >= settings.quietHours.start || currentTime <= settings.quietHours.end) {
      return;
    }
  }

  try {
    const options = {
      body: notification.message,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: notification.id,
      timestamp: new Date(notification.timestamp).getTime(),
      requireInteraction: notification.persistent,
      silent: !settings.sound
    };

    const desktopNotification = new Notification(notification.title, options);

    if (!notification.persistent) {
      setTimeout(() => {
        desktopNotification.close();
      }, 5000);
    }

    desktopNotification.onclick = () => {
      window.focus();
      desktopNotification.close();
      
      if (notification.data?.url) {
        window.location.href = notification.data.url;
      }
    };

    desktopNotification.onerror = (error) => {
      console.error('Desktop notification error:', error);
    };

  } catch (error) {
    console.error('Failed to show desktop notification:', error);
  }
};

// API-based async thunks for real-time notifications
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

export const fetchAllNotifications = createAsyncThunk(
  'notifications/fetchAllNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getAllNotifications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acknowledgeNotificationAsync = createAsyncThunk(
  'notifications/acknowledgeNotificationAsync',
  async ({ notificationId, notes }, { rejectWithValue }) => {
    try {
      await notificationService.acknowledgeNotification(notificationId, notes);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNotificationStats = createAsyncThunk(
  'notifications/fetchNotificationStats',
  async ({ fromDate, toDate } = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotificationStats(fromDate, toDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ PRODUCTION FIX: Only request permission when explicitly called by user action
export const requestNotificationPermission = createAsyncThunk(
  'notifications/requestPermission',
  async (_, { rejectWithValue }) => {
    try {
      if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications');
      }

      if (Notification.permission === 'granted') {
        return 'granted';
      }

      if (Notification.permission === 'denied') {
        return 'denied';
      }

      // ✅ CRITICAL: This MUST be called from a user event handler
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Other async thunks remain the same...
export const subscribeToPushNotifications = createAsyncThunk(
  'notifications/subscribeToPush',
  async (_, { rejectWithValue }) => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push messaging is not supported');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      return subscription;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add notification
    addNotification: (state, action) => {
      const notification = {
        id: action.payload.id || Date.now().toString(),
        type: action.payload.type || NOTIFICATION_TYPES.INFO,
        title: action.payload.title,
        message: action.payload.message,
        timestamp: action.payload.timestamp || new Date().toISOString(),
        read: false,
        persistent: action.payload.persistent || false,
        actions: action.payload.actions || [],
        data: action.payload.data || null
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;

      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },

    // Remove notification
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      
      if (notification) {
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== notificationId);
      }
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Add toast notification
    addToast: (state, action) => {
      const toast = {
        id: action.payload.id || Date.now().toString(),
        type: action.payload.type || NOTIFICATION_TYPES.INFO,
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration || 4000,
        persistent: action.payload.persistent || false,
        actions: action.payload.actions || []
      };

      state.toasts.push(toast);

      if (state.toasts.length > 10) {
        state.toasts = state.toasts.slice(-10);
      }
    },

    // Remove toast
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },

    // Clear all toasts
    clearToasts: (state) => {
      state.toasts = [];
    },

    // Update notification settings
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Set push permission status
    setPushPermission: (state, action) => {
      state.pushPermission = action.payload;
    },

    // Set push subscription
    setPushSubscription: (state, action) => {
      state.pushSubscription = action.payload;
    },

    // Set push support status
    setPushSupported: (state, action) => {
      state.pushSupported = action.payload;
    },

    // Mark notification as read (local)
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Batch mark notifications as read
    batchMarkAsRead: (state, action) => {
      const notificationIds = action.payload;
      notificationIds.forEach(id => {
        const notification = state.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
    },

    // Update notification
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      const notification = state.notifications.find(n => n.id === id);
      if (notification) {
        Object.assign(notification, updates);
      }
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // SignalR connection status
    setSignalRConnectionStatus: (state, action) => {
      state.isSignalRConnected = action.payload;
    },

    // Update last sync time
    updateLastSyncTime: (state) => {
      state.lastSyncTime = new Date().toISOString();
    },

    // Add real-time notification from SignalR
    addRealTimeNotification: (state, action) => {
      const notification = {
        id: action.payload.id || Date.now().toString(),
        type: action.payload.type || NOTIFICATION_TYPES.INFO,
        title: action.payload.title,
        message: action.payload.message,
        timestamp: action.payload.timestamp || new Date().toISOString(),
        read: false,
        persistent: action.payload.persistent || false,
        actions: action.payload.actions || [],
        data: action.payload.data || null,
        priority: action.payload.priority || 'medium'
      };

      // Add to beginning of notifications array
      state.notifications.unshift(notification);
      state.unreadCount += 1;

      // Keep only last 100 notifications
      if (state.notifications.length > 100) {
        const removed = state.notifications.slice(100);
        state.notifications = state.notifications.slice(0, 100);
        
        // Adjust unread count for removed unread notifications
        const removedUnread = removed.filter(n => !n.read).length;
        state.unreadCount = Math.max(0, state.unreadCount - removedUnread);
      }

      // Update stats
      state.stats.total += 1;
      state.stats.unread += 1;
      
      if (state.stats.byType[notification.type]) {
        state.stats.byType[notification.type] += 1;
      } else {
        state.stats.byType[notification.type] = 1;
      }
      
      if (state.stats.byPriority[notification.priority]) {
        state.stats.byPriority[notification.priority] += 1;
      } else {
        state.stats.byPriority[notification.priority] = 1;
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
      });

    // Fetch all notifications (admin)
    builder
      .addCase(fetchAllNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.items;
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Acknowledge notification
    builder
      .addCase(acknowledgeNotificationAsync.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          notification.acknowledgedOn = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(acknowledgeNotificationAsync.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Fetch notification stats
    builder
      .addCase(fetchNotificationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchNotificationStats.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Request permission
    builder
      .addCase(requestNotificationPermission.fulfilled, (state, action) => {
        state.pushPermission = action.payload;
      })
      .addCase(requestNotificationPermission.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Subscribe to push
    builder
      .addCase(subscribeToPushNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(subscribeToPushNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.pushSubscription = action.payload;
      })
      .addCase(subscribeToPushNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  addNotification,
  removeNotification,
  clearNotifications,
  addToast,
  removeToast,
  clearToasts,
  updateSettings,
  setPushPermission,
  setPushSubscription,
  setPushSupported,
  markNotificationAsRead,
  setError,
  clearError,
  batchMarkAsRead,
  updateNotification,
  setLoading,
  setSignalRConnectionStatus,
  updateLastSyncTime,
  addRealTimeNotification
} = notificationSlice.actions;

// Helper action creators
export const showSuccessToast = (title, message, options = {}) => 
  addToast({
    type: NOTIFICATION_TYPES.SUCCESS,
    title,
    message,
    ...options
  });

export const showErrorToast = (title, message, options = {}) => 
  addToast({
    type: NOTIFICATION_TYPES.ERROR,
    title,
    message,
    persistent: true,
    ...options
  });

export const showWarningToast = (title, message, options = {}) => 
  addToast({
    type: NOTIFICATION_TYPES.WARNING,
    title,
    message,
    ...options
  });

export const showInfoToast = (title, message, options = {}) => 
  addToast({
    type: NOTIFICATION_TYPES.INFO,
    title,
    message,
    ...options
  });

// Action creator that includes desktop notification (used by SignalR)
export const addNotificationWithDesktop = (notificationData) => (dispatch, getState) => {
  const { notifications } = getState();
  
  // Add to Redux store as real-time notification
  dispatch(addRealTimeNotification(notificationData));
  
  // Show desktop notification if enabled and permitted
  if (notifications.settings.desktop && notifications.pushPermission === 'granted') {
    const notification = {
      id: notificationData.id || Date.now().toString(),
      title: notificationData.title,
      message: notificationData.message,
      timestamp: notificationData.timestamp || new Date().toISOString(),
      persistent: notificationData.persistent || false,
      data: notificationData.data || null
    };
    
    showDesktopNotification(notification, notifications.settings);
  }

  // Auto-add as toast for high-priority items
  if (notificationData.priority === 'high' || notificationData.priority === 'critical' || notificationData.priority === 'emergency') {
    dispatch(addToast({
      type: getToastTypeFromPriority(notificationData.priority),
      title: notificationData.title,
      message: notificationData.message,
      persistent: notificationData.priority === 'emergency',
      actions: notificationData.actions
    }));
  }
};

// Helper function to map priority to toast type
const getToastTypeFromPriority = (priority) => {
  switch (priority) {
    case 'emergency':
    case 'critical':
      return NOTIFICATION_TYPES.ERROR;
    case 'high':
      return NOTIFICATION_TYPES.WARNING;
    default:
      return NOTIFICATION_TYPES.INFO;
  }
};

// ✅ PRODUCTION FIX: Real-time initialization with SignalR (no automatic permission request)
export const initializeNotifications = () => async (dispatch) => {
  try {
    // Check browser support
    const pushSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    dispatch(setPushSupported(pushSupported));
    
    // Only check permission, DON'T request automatically
    if ('Notification' in window) {
      dispatch(setPushPermission(Notification.permission));
      console.log('✅ Notifications initialized. Permission:', Notification.permission);
    }

    // Load initial notifications from API
    await dispatch(fetchNotifications());
    
    // Load notification statistics
    await dispatch(fetchNotificationStats());
    
    console.log('✅ Notification system initialized with real-time support');
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    dispatch(setError('Failed to initialize notifications'));
  }
};

// SignalR connection management
export const setSignalRConnected = (connected) => (dispatch) => {
  dispatch(setSignalRConnectionStatus(connected));
  
  if (connected) {
    // When SignalR connects, sync notifications
    dispatch(fetchNotifications());
  }
};

// Manual refresh from API (fallback when SignalR disconnected)
export const refreshNotifications = () => async (dispatch) => {
  await dispatch(fetchNotifications());
  dispatch(updateLastSyncTime());
};

// ✅ PRODUCTION ADDITION: Manual permission request for user-triggered action
export const requestPermissionManually = () => async (dispatch) => {
  try {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission !== 'default') {
      return Notification.permission;
    }

    // This MUST be called from a user event handler (button click, etc.)
    const result = await dispatch(requestNotificationPermission());
    
    return result.payload;
  } catch (error) {
    console.error('Manual permission request failed:', error);
    dispatch(setError(error.message));
    return 'denied';
  }
};

// Export helper function for external use
export { showDesktopNotification };

// Export reducer
export default notificationSlice.reducer;