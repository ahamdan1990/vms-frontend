import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import configurationReducer from './slices/configurationSlice';
import auditReducer from './slices/auditSlice';
import visitPurposesReducer from './slices/visitPurposesSlice';
import locationsReducer from './slices/locationsSlice';
import visitorsReducer from './slices/visitorsSlice';
import emergencyContactsReducer from './slices/emergencyContactsSlice';
import invitationsReducer from './slices/invitationsSlice';

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
  visitPurposes: visitPurposesReducer,
  locations: locationsReducer,
  visitors: visitorsReducer,
  emergencyContacts: emergencyContactsReducer,
  invitations: invitationsReducer,
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
  visitPurposes: {
    list: [],
    total: 0,
    currentVisitPurpose: null,
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
      requiresApproval: null,
      includeInactive: false,
      searchTerm: ''
    },
    selectedVisitPurposes: [],
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    activePurposes: [],
    activePurposesLoading: false,
    activePurposesError: null,
    activePurposesLastFetch: null,
    lastUpdated: null
  },
  locations: {
    list: [],
    total: 0,
    tree: [],
    currentLocation: null,
    loading: false,
    listLoading: false,
    treeLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    error: null,
    listError: null,
    treeError: null,
    createError: null,
    updateError: null,
    deleteError: null,
    filters: {
      locationType: '',
      rootOnly: false,
      includeChildren: true,
      includeInactive: false,
      searchTerm: ''
    },
    selectedLocations: [],
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    activeLocations: [],
    activeLocationsLoading: false,
    activeLocationsError: null,
    activeLocationsLastFetch: null,
    rootLocations: [],
    rootLocationsLoading: false,
    rootLocationsError: null,
    rootLocationsLastFetch: null,
    lastUpdated: null
  },
  visitors: {
    list: [],
    total: 0,
    pageIndex: 0,
    pageSize: 20,
    currentVisitor: null,
    loading: false,
    listLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    searchLoading: false,
    statusChangeLoading: false,
    error: null,
    listError: null,
    createError: null,
    updateError: null,
    deleteError: null,
    searchError: null,
    statusChangeError: null,
    filters: {
      searchTerm: '',
      company: '',
      isVip: null,
      isBlacklisted: null,
      isActive: true,
      nationality: '',
      securityClearance: '',
      sortBy: 'FullName',
      sortDirection: 'asc',
      includeDeleted: false
    },
    advancedSearch: {
      isActive: false,
      results: [],
      loading: false,
      error: null,
      lastSearchParams: null
    },
    selectedVisitors: [],
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    showDetailsModal: false,
    showBlacklistModal: false,
    showAdvancedSearchModal: false,
    vipVisitors: [],
    vipVisitorsLoading: false,
    vipVisitorsError: null,
    vipVisitorsLastFetch: null,
    blacklistedVisitors: [],
    blacklistedVisitorsLoading: false,
    blacklistedVisitorsError: null,
    blacklistedVisitorsLastFetch: null,
    statistics: null,
    statisticsLoading: false,
    statisticsError: null,
    statisticsLastFetch: null,
    quickSearchResults: [],
    quickSearchLoading: false,
    quickSearchTerm: '',
    lastUpdated: null
  },
  emergencyContacts: {
    list: [],
    total: 0,
    currentVisitorId: null,
    currentContact: null,
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
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    selectedContacts: [],
    lastUpdated: null
  },
  invitations: {
    list: [],
    total: 0,
    pageIndex: 0,
    pageSize: 20,
    currentInvitation: null,
    loading: false,
    listLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    approvalLoading: false,
    qrLoading: false,
    checkInLoading: false,
    error: null,
    listError: null,
    createError: null,
    updateError: null,
    deleteError: null,
    approvalError: null,
    qrError: null,
    checkInError: null,
    filters: {
      searchTerm: '',
      status: null,
      type: null,
      hostId: null,
      visitorId: null,
      visitPurposeId: null,
      locationId: null,
      startDate: '',
      endDate: '',
      includeDeleted: false,
      pendingApprovalsOnly: false,
      activeOnly: false,
      expiredOnly: false,
      sortBy: 'ScheduledStartTime',
      sortDirection: 'desc'
    },
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    showDetailsModal: false,
    showApprovalModal: false,
    showQrModal: false,
    selectedInvitations: [],
    pendingApprovals: [],
    pendingApprovalsLoading: false,
    pendingApprovalsError: null,
    pendingApprovalsLastFetch: null,
    activeInvitations: [],
    activeInvitationsLoading: false,
    activeInvitationsError: null,
    activeInvitationsLastFetch: null,
    upcomingInvitations: [],
    upcomingInvitationsLoading: false,
    upcomingInvitationsError: null,
    upcomingInvitationsLastFetch: null,
    templates: [],
    templatesLoading: false,
    templatesError: null,
    templatesLastFetch: null,
    qrCodeData: null,
    checkInData: null,
    statistics: null,
    statisticsLoading: false,
    statisticsError: null,
    statisticsLastFetch: null,
    lastUpdated: null
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
    visitPurposes: {
      ...initialState.visitPurposes,
      // Don't persist visit purpose data (always fresh from server)
      list: [],
      currentVisitPurpose: null,
      activePurposes: [],
      activePurposesLastFetch: null,
      loading: false,
      error: null
    },
    locations: {
      ...initialState.locations,
      // Don't persist location data (always fresh from server)
      list: [],
      tree: [],
      currentLocation: null,
      activeLocations: [],
      activeLocationsLastFetch: null,
      rootLocations: [],
      rootLocationsLastFetch: null,
      loading: false,
      error: null
    },
    visitors: {
      ...initialState.visitors,
      // Don't persist visitor data (always fresh from server)
      list: [],
      currentVisitor: null,
      vipVisitors: [],
      vipVisitorsLastFetch: null,
      blacklistedVisitors: [],
      blacklistedVisitorsLastFetch: null,
      statistics: null,
      statisticsLastFetch: null,
      quickSearchResults: [],
      loading: false,
      error: null
    },
    emergencyContacts: {
      ...initialState.emergencyContacts,
      // Don't persist emergency contact data (always fresh from server)
      list: [],
      currentContact: null,
      currentVisitorId: null,
      selectedContacts: [],
      loading: false,
      error: null
    },
    invitations: {
      ...initialState.invitations,
      // Don't persist invitation data (always fresh from server)
      list: [],
      currentInvitation: null,
      selectedInvitations: [],
      pendingApprovals: [],
      activeInvitations: [],
      upcomingInvitations: [],
      templates: [],
      qrCodeData: null,
      checkInData: null,
      statistics: null,
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
  const requiredSlices = ['auth', 'users', 'ui', 'notifications', 'configuration', 'audit', 'visitPurposes', 'locations', 'visitors', 'emergencyContacts', 'invitations'];
  
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