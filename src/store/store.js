// src/store/store.js - PRODUCTION OPTIMIZED VERSION
import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { hydrateState, validateState } from './rootReducer';
import customMiddleware from './middleware';

const STORAGE_KEY = 'vms_app_state';

// ✅ PRODUCTION FIX: Debounced persistence to prevent too frequent writes
let persistenceTimer = null;
const PERSISTENCE_DELAY = 1000; // 1 second delay

// ✅ PRODUCTION OPTIMIZED: localStorage functions with error handling
const loadPersistedState = () => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return undefined;
    }

    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    
    const persistedState = JSON.parse(serializedState);
    
    if (!validateState(persistedState)) {
      console.warn('❌ Invalid persisted state structure, starting fresh');
      return undefined;
    }
    
    // ✅ PRODUCTION FIX: More reasonable expiry (7 days instead of 30)
    const stateAge = Date.now() - (persistedState.timestamp || 0);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (stateAge > maxAge) {
      console.info('⏰ Persisted state expired, starting fresh');
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
    
    const hydratedState = hydrateState(persistedState);
    console.log('✅ State loaded from localStorage');
    return hydratedState;
  } catch (error) {
    console.error('❌ Failed to load persisted state:', error);
    // Clear corrupted state
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore cleanup errors
    }
    return undefined;
  }
};

// ✅ PRODUCTION FIX: Optimized persistence with size limits
const saveStateToStorage = (state) => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

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
    
    // ✅ PRODUCTION FIX: Check size limit (5MB typical localStorage limit)
    const sizeInMB = new Blob([serializedState]).size / (1024 * 1024);
    if (sizeInMB > 4.5) { // Leave some buffer
      console.warn('⚠️ State too large for localStorage, skipping persistence');
      return;
    }
    
    localStorage.setItem(STORAGE_KEY, serializedState);
    
    // ✅ PRODUCTION FIX: Reduced logging
    if (process.env.NODE_ENV === 'development') {
      console.log('💾 State persisted to localStorage');
    }
    
  } catch (error) {
    console.error('❌ Failed to save state to localStorage:', error);
    
    // ✅ PRODUCTION FIX: Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      console.warn('⚠️ localStorage quota exceeded, clearing old data');
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
};

// ✅ PRODUCTION FIX: Debounced persistence function
const debouncedSaveState = (state) => {
  if (persistenceTimer) {
    clearTimeout(persistenceTimer);
  }
  
  persistenceTimer = setTimeout(() => {
    saveStateToStorage(state);
    persistenceTimer = null;
  }, PERSISTENCE_DELAY);
};

// Configure store with preloaded state
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
          'persist/REHYDRATE', // Ignore persistence actions
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

// ✅ PRODUCTION FIX: Optimized store subscription with smart persistence
let currentState = store.getState();
let lastPersistedAuth = null;
let lastPersistedUI = null;
let lastPersistedNotifications = null;

store.subscribe(() => {
  const nextState = store.getState();
  
  // ✅ PRODUCTION FIX: Only persist if truly important state changed
  if (currentState !== nextState) {
    const nextAuth = nextState.auth;
    const nextUI = nextState.ui;
    const nextNotifications = nextState.notifications;
    
    // ✅ PRODUCTION FIX: Deep comparison for important changes only
    const authChanged = (
      lastPersistedAuth?.user?.id !== nextAuth.user?.id ||
      lastPersistedAuth?.isAuthenticated !== nextAuth.isAuthenticated ||
      lastPersistedAuth?.permissions?.length !== nextAuth.permissions?.length
    );
    
    const uiChanged = (
      lastPersistedUI?.theme !== nextUI.theme ||
      lastPersistedUI?.sidebarCollapsed !== nextUI.sidebarCollapsed ||
      JSON.stringify(lastPersistedUI?.preferences) !== JSON.stringify(nextUI.preferences)
    );
    
    const notificationSettingsChanged = (
      JSON.stringify(lastPersistedNotifications?.settings) !== JSON.stringify(nextNotifications.settings)
    );
    
    if (authChanged || uiChanged || notificationSettingsChanged) {
      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Persisting important state changes...');
      }
      
      // ✅ PRODUCTION FIX: Use debounced persistence
      debouncedSaveState(nextState);
      
      // Update persistence tracking
      lastPersistedAuth = { ...nextAuth };
      lastPersistedUI = { 
        theme: nextUI.theme, 
        sidebarCollapsed: nextUI.sidebarCollapsed,
        preferences: { ...nextUI.preferences }
      };
      lastPersistedNotifications = { 
        settings: { ...nextNotifications.settings } 
      };
    }
    
    currentState = nextState;
  }
});

// ✅ PRODUCTION FIX: Configure API client after store is ready
if (typeof window !== 'undefined') {
  Promise.resolve().then(async () => {
    try {
      const { configureApiClient } = await import('../services/apiClient');
      configureApiClient(store);
    } catch (error) {
      console.error('Failed to configure API client:', error);
    }
  });
}

// Store utilities
export const getStoreState = () => store.getState();
export const dispatchAction = (action) => store.dispatch(action);

// ✅ PRODUCTION FIX: Enhanced storage management utilities
export const clearPersistedState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    
    // Clear debounced persistence
    if (persistenceTimer) {
      clearTimeout(persistenceTimer);
      persistenceTimer = null;
    }
    
    // Reset tracking
    lastPersistedAuth = null;
    lastPersistedUI = null;
    lastPersistedNotifications = null;
    
    console.info('✅ Persisted state cleared');
  } catch (error) {
    console.error('❌ Failed to clear persisted state:', error);
  }
};

export const getStorageInfo = () => {
  try {
    if (typeof localStorage === 'undefined') {
      return { used: 0, total: 0, available: 0, usedPercent: 0, keys: 0, hasData: false };
    }

    const stored = localStorage.getItem(STORAGE_KEY) || '';
    const used = new Blob([stored]).size;
    const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
    
    return {
      used,
      total,
      available: total - used,
      usedPercent: Math.round((used / total) * 100),
      keys: Object.keys(localStorage).length,
      hasData: stored.length > 0,
      sizeInMB: (used / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { used: 0, total: 0, available: 0, usedPercent: 0, keys: 0, hasData: false };
  }
};

// ✅ PRODUCTION FIX: Safe storage operations
export const exportState = () => {
  try {
    return {
      state: store.getState(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  } catch (error) {
    console.error('Failed to export state:', error);
    return null;
  }
};

export const importState = (exportedState) => {
  try {
    if (exportedState && exportedState.state) {
      clearPersistedState();
      saveStateToStorage(exportedState.state);
      window.location.reload(); // Reload to apply imported state
    }
  } catch (error) {
    console.error('Failed to import state:', error);
  }
};

// ✅ PRODUCTION FIX: Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Force save any pending persistence
    if (persistenceTimer) {
      clearTimeout(persistenceTimer);
      saveStateToStorage(store.getState());
    }
  });
}

// Development utilities
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    window.__REDUX_STORE__ = store;
    window.__VMS_STORE_UTILS__ = {
      clearPersistedState,
      getStorageInfo,
      getState: getStoreState,
      exportState,
      importState
    };
  }
  
  console.log('🏪 Redux Store initialized with optimized localStorage persistence');
  console.log('📊 Initial State loaded');
  console.log('💾 Storage Info:', getStorageInfo());
}

export default store;