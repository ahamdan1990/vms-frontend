// src/store/index.js

import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { hydrateState, validateState } from './rootReducer';
import customMiddleware from './middleware';

// ✅ FIXED: Use real localStorage for Windows application
const STORAGE_KEY = 'vms_app_state';

// ✅ Production localStorage functions
const loadPersistedState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    
    const persistedState = JSON.parse(serializedState);
    
    // Validate state structure
    if (!validateState(persistedState)) {
      console.warn('Invalid persisted state structure, starting fresh');
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
    
    // Check if state is too old (optional: expire after 30 days)
    const stateAge = Date.now() - (persistedState.timestamp || 0);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    if (stateAge > maxAge) {
      console.info('Persisted state expired, starting fresh');
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
    
    return hydrateState(persistedState);
  } catch (error) {
    console.error('Failed to load persisted state:', error);
    localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
};

const saveStateToStorage = (state) => {
  try {
    const persistData = {
      auth: {
        user: state.auth.user,
        isAuthenticated: state.auth.isAuthenticated,
        permissions: state.auth.permissions
      },
      ui: {
        theme: state.ui.theme,
        preferences: state.ui.preferences,
        sidebarCollapsed: state.ui.sidebarCollapsed,
        tablePreferences: state.ui.tablePreferences
      },
      notifications: {
        settings: state.notifications.settings
      },
      timestamp: Date.now()
    };
    
    const serializedState = JSON.stringify(persistData);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

// Configure store with preloaded state from localStorage
const preloadedState = loadPersistedState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'auth/loginUser/fulfilled',
          'auth/getCurrentUser/fulfilled',
          'users/getUsers/fulfilled',
          'ui/addNotification',
          'notifications/addNotification',
          'ui/showConfirmDialog',
          'ui/showAlertDialog',
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp', 'payload.onConfirm', 'payload.onCancel'],
        ignoredPaths: [
          'auth.user.lastLoginDate',
          'auth.user.passwordChangedDate',
          'ui.modals.confirmDialog.onConfirm',
          'ui.modals.confirmDialog.onCancel',
          'ui.modals.alertDialog.onClose',
          'notifications.toasts',
          'notifications.pushSubscription',
        ],
      },
      immutableCheck: {
        ignoredPaths: [
          'ui.modals.confirmDialog',
          'ui.modals.alertDialog',
          'notifications.toasts',
        ],
      },
    }).concat(customMiddleware),
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'VMS Store',
    trace: true,
    traceLimit: 25,
  }
});

// ✅ FIXED: Subscribe to store changes and save to localStorage
let currentState = store.getState();
store.subscribe(() => {
  const nextState = store.getState();
  
  // Only persist if state actually changed and is worth persisting
  if (currentState !== nextState) {
    const prevAuth = currentState.auth;
    const nextAuth = nextState.auth;
    const prevUI = currentState.ui;
    const nextUI = nextState.ui;
    const prevNotifications = currentState.notifications;
    const nextNotifications = nextState.notifications;
    
    // Only save if important state changed (not every action)
    const shouldPersist = (
      prevAuth.user !== nextAuth.user ||
      prevAuth.isAuthenticated !== nextAuth.isAuthenticated ||
      prevAuth.permissions !== nextAuth.permissions ||
      prevUI.theme !== nextUI.theme ||
      prevUI.preferences !== nextUI.preferences ||
      prevUI.sidebarCollapsed !== nextUI.sidebarCollapsed ||
      prevUI.tablePreferences !== nextUI.tablePreferences ||
      prevNotifications.settings !== nextNotifications.settings
    );
    
    if (shouldPersist) {
      saveStateToStorage(nextState);
    }
    
    currentState = nextState;
  }
});

// Configure API client with store reference
if (typeof window !== 'undefined') {
  import('../services/apiClient').then(({ configureApiClient }) => {
    configureApiClient(store);
  }).catch(error => {
    console.error('Failed to configure API client:', error);
  });
}

// Store utilities
export const getStoreState = () => store.getState();
export const dispatchAction = (action) => store.dispatch(action);

// ✅ ADDED: Storage management utilities for production
export const clearPersistedState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.info('Persisted state cleared');
  } catch (error) {
    console.error('Failed to clear persisted state:', error);
  }
};

export const exportAppState = () => {
  try {
    const state = store.getState();
    const exportData = {
      ...state,
      timestamp: Date.now(),
      version: process.env.REACT_APP_VERSION || '1.0.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vms-state-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export app state:', error);
  }
};

export const getStorageInfo = () => {
  try {
    const used = new Blob([localStorage.getItem(STORAGE_KEY) || '']).size;
    const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
    
    return {
      used,
      total,
      available: total - used,
      usedPercent: Math.round((used / total) * 100),
      keys: Object.keys(localStorage).length
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return null;
  }
};

// Development utilities
if (process.env.NODE_ENV === 'development') {
  // Enable Redux DevTools Extension
  if (typeof window !== 'undefined') {
    window.__REDUX_STORE__ = store;
    window.__VMS_STORE_UTILS__ = {
      clearPersistedState,
      exportAppState,
      getStorageInfo,
      getState: getStoreState
    };
  }
  
  // Log store initialization
  console.log('🏪 Redux Store initialized with localStorage persistence');
  console.log('📊 Initial State:', store.getState());
  console.log('💾 Storage Info:', getStorageInfo());
}


export default store;