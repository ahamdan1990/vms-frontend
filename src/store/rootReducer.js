import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import configurationReducer from './slices/configurationSlice';
import auditReducer from './slices/auditSlice';

/**
 * Root reducer that combines all feature slices
 * Follows the established pattern from store configuration
 */
const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  ui: uiReducer,
  notifications: notificationReducer,
  configuration: configurationReducer,
  audit: auditReducer,
});

/**
 * Root state type definition for TypeScript compatibility
 * (Currently using JavaScript but structure ready for TS migration)
 */
export const getInitialState = () => ({
  auth: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    permissions: [],
    sessions: [],
    passwordChangeRequired: false,
    twoFactorRequired: false,
    lockoutTimeRemaining: null
  },
  users: {
    list: [],
    total: 0,
    pagination: {
      pageIndex: 0,
      pageSize: 20,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false
    },
    currentUser: null,
    loading: false,
    listLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    error: null,
    listError: null,
    createError: null,
    updateError: null,
    deleteError: null,
    filters: {
      searchTerm: '',
      role: '',
      status: '',
      department: '',
      sortBy: 'LastName',
      sortDescending: false
    },
    availableRoles: [],
    userStats: null,
    userActivity: {
      data: [],
      loading: false,
      error: null,
      pagination: {
        pageIndex: 0,
        pageSize: 20,
        totalPages: 0
      }
    },
    selectedUsers: [],
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    showActivityModal: false
  },
  configuration: {
    configurations: {},
    currentConfiguration: null,
    configurationHistory: [],
    searchResults: [],
    loading: false,
    listLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    historyLoading: false,
    searchLoading: false,
    validateLoading: false,
    cacheLoading: false,
    error: null,
    listError: null,
    createError: null,
    updateError: null,
    deleteError: null,
    historyError: null,
    searchError: null,
    validateError: null,
    selectedCategory: null,
    searchQuery: '',
    showSensitive: false,
    cacheLastInvalidated: null,
    validationResult: null,
    pendingRestarts: []
  },
  audit: {
    auditLogs: [],
    currentAuditLog: null,
    userActivity: [],
    systemEvents: [],
    securityEvents: [],
    searchResults: [],
    pagination: {
      pageIndex: 0,
      pageSize: 20,
      totalPages: 0,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false
    },
    loading: false,
    listLoading: false,
    detailLoading: false,
    userActivityLoading: false,
    systemEventsLoading: false,
    securityEventsLoading: false,
    searchLoading: false,
    exportLoading: false,
    error: null,
    listError: null,
    detailError: null,
    userActivityError: null,
    systemEventsError: null,
    securityEventsError: null,
    searchError: null,
    exportError: null,
    filters: {
      searchTerm: '',
      category: '',
      userId: null,
      action: '',
      dateFrom: null,
      dateTo: null,
      severity: '',
      eventType: '',
      ipAddress: '',
      riskLevel: '',
      sortBy: 'Timestamp',
      sortDescending: true
    },
    selectedCategory: 'all',
    availableCategories: [],
    statistics: null,
    lastExportUrl: null
  },
  ui: {
    sidebarOpen: true,
    sidebarCollapsed: false,
    theme: 'light',
    systemTheme: 'light',
    layoutMode: 'default',
    pageTitle: 'Dashboard',
    breadcrumbs: [],
    globalLoading: false,
    pageLoading: false,
    overlayLoading: false,
    modals: {
      confirmDialog: {
        open: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: null,
        onCancel: null,
        variant: 'default',
        loading: false
      },
      alertDialog: {
        open: false,
        title: '',
        message: '',
        variant: 'info',
        onClose: null
      },
      imageViewer: {
        open: false,
        images: [],
        currentIndex: 0,
        title: ''
      }
    },
    activeMenuItem: '',
    navigationHistory: [],
    globalSearch: {
      query: '',
      isOpen: false,
      results: [],
      loading: false,
      recentSearches: []
    },
    alerts: [],
    notifications: {
      unreadCount: 0,
      items: []
    },
    tablePreferences: {
      pageSize: 20,
      density: 'standard',
      showGridLines: true,
      stickyHeader: true
    },
    unsavedChanges: false,
    formDirty: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'lg',
    performance: {
      slowQueries: [],
      errorCount: 0,
      lastErrorTime: null
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h',
      currency: 'USD',
      numberFormat: 'US',
      showHelp: true,
      showTips: true,
      autoSave: true,
      soundEnabled: true
    },
    features: {
      darkMode: true,
      betaFeatures: false,
      advancedSearch: true,
      bulkOperations: true,
      exportFeatures: true,
      realTimeUpdates: true
    }
  },
  notifications: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
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
    toasts: [],
    pushSupported: false,
    pushPermission: 'default',
    pushSubscription: null
  }
});

/**
 * Utility function to reset specific parts of state
 */
export const createResetAction = (sliceName) => ({
  type: `${sliceName}/reset`,
  payload: undefined
});

/**
 * Utility function to get state slice
 */
export const getStateSlice = (state, sliceName) => {
  return state[sliceName] || {};
};

/**
 * State persistence configuration
 * Defines which parts of state should be persisted (in memory storage)
 */
export const PERSIST_CONFIG = {
  auth: ['user', 'isAuthenticated', 'permissions'],
  ui: ['theme', 'preferences', 'sidebarCollapsed', 'tablePreferences'],
  notifications: ['settings']
};

/**
 * State hydration helper
 * Used for restoring state from memory storage
 */
export const hydrateState = (persistedState) => {
  const initialState = getInitialState();
  
  if (!persistedState) return initialState;
  
  return {
    ...initialState,
    ...persistedState,
    // Ensure certain fields are reset on hydration
    auth: {
      ...initialState.auth,
      ...persistedState.auth,
      loading: false,
      error: null
    },
    ui: {
      ...initialState.ui,
      ...persistedState.ui,
      globalLoading: false,
      pageLoading: false,
      overlayLoading: false,
      modals: initialState.ui.modals // Reset modals
    },
    users: {
      ...initialState.users,
      // Don't persist user list data
      loading: false,
      error: null
    },
    configuration: {
      ...initialState.configuration,
      // Don't persist config data (always fresh from server)
      configurations: {},
      currentConfiguration: null,
      configurationHistory: [],
      searchResults: [],
      loading: false,
      error: null
    },
    audit: {
      ...initialState.audit,
      // Don't persist audit data (always fresh from server)
      auditLogs: [],
      currentAuditLog: null,
      userActivity: [],
      systemEvents: [],
      securityEvents: [],
      searchResults: [],
      loading: false,
      error: null
    },
    notifications: {
      ...initialState.notifications,
      ...persistedState.notifications,
      loading: false,
      error: null,
      toasts: [] // Reset toasts
    }
  };
};

/**
 * State validation helper
 * Validates restored state structure
 */
export const validateState = (state) => {
  const requiredSlices = ['auth', 'users', 'ui', 'notifications', 'configuration', 'audit'];
  
  if (!state || typeof state !== 'object') {
    return false;
  }
  
  for (const slice of requiredSlices) {
    if (!state[slice] || typeof state[slice] !== 'object') {
      return false;
    }
  }
  
  return true;
};

/**
 * Selector helpers for cross-slice data access
 */
export const createCrossSliceSelector = (sliceSelectors) => {
  return (state) => {
    const result = {};
    
    Object.entries(sliceSelectors).forEach(([key, selector]) => {
      result[key] = selector(state);
    });
    
    return result;
  };
};

/**
 * State debugging helpers (development only)
 */
export const getStateSize = (state) => {
  if (process.env.NODE_ENV === 'development') {
    return new Blob([JSON.stringify(state)]).size;
  }
  return 0;
};

export const logStateChanges = (prevState, nextState) => {
  if (process.env.NODE_ENV === 'development') {
    const changes = {};
    
    Object.keys(nextState).forEach(key => {
      if (prevState[key] !== nextState[key]) {
        changes[key] = {
          previous: prevState[key],
          current: nextState[key]
        };
      }
    });
    
    if (Object.keys(changes).length > 0) {
      console.group('🔄 State Changes');
      console.table(changes);
      console.groupEnd();
    }
  }
};

/**
 * Performance monitoring helpers
 */
export const getStateMetrics = (state) => {
  return {
    totalSize: getStateSize(state),
    sliceSizes: Object.keys(state).reduce((acc, key) => {
      acc[key] = getStateSize(state[key]);
      return acc;
    }, {}),
    authStatus: state.auth?.isAuthenticated || false,
    userCount: state.users?.list?.length || 0,
    notificationCount: state.notifications?.notifications?.length || 0,
    alertCount: state.ui?.alerts?.length || 0
  };
};

export default rootReducer;