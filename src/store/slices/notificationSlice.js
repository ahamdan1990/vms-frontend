// src/store/slices/notificationSlice.js - PRODUCTION FIXED VERSION
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
  pushSubscription: null
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
    }
  },
  extraReducers: (builder) => {
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

    // Mark as read
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // Mark all as read
    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
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
  setLoading
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

// Action creator that includes desktop notification
export const addNotificationWithDesktop = (notificationData) => (dispatch, getState) => {
  const { notifications } = getState();
  
  dispatch(addNotification(notificationData));
  
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
};

// ✅ PRODUCTION FIX: Safe initialization without automatic permission request
export const initializeNotifications = () => async (dispatch) => {
  try {
    // Check browser support
    const pushSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    dispatch(setPushSupported(pushSupported));
    
    // ✅ PRODUCTION FIX: Only check permission, DON'T request automatically
    if ('Notification' in window) {
      dispatch(setPushPermission(Notification.permission));
      console.log('✅ Notifications initialized. Permission:', Notification.permission);
    }
    
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    dispatch(setError('Failed to initialize notifications'));
  }
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