import { createSlice } from '@reduxjs/toolkit';
import {
  THEMES,
  LAYOUT_MODES,
  SCREEN_SIZES,
  TABLE,
  TOAST,
  MODALS,
  SIDEBAR,
  PAGINATION,
  DATE_TIME,
  PERFORMANCE
} from '../../constants/uiConstants';

const initialState = {
  // Sidebar state
  sidebarOpen: true,
  sidebarCollapsed: false,
  
  // Theme state
  theme: THEMES.LIGHT, 
  systemTheme: THEMES.LIGHT, 
  
  // Layout state
  layoutMode: LAYOUT_MODES.DEFAULT, 
  pageTitle: 'Dashboard',
  breadcrumbs: [],
  
  // Loading states
  globalLoading: false,
  pageLoading: false,
  overlayLoading: false,
  
  // Modal states using constants
  modals: {
    confirmDialog: {
      open: false,
      title: '',
      message: '',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: null,
      onCancel: null,
      variant: MODALS.VARIANTS.DEFAULT, 
      loading: false
    },
    
    alertDialog: {
      open: false,
      title: '',
      message: '',
      variant: MODALS.VARIANTS.INFO, 
      onClose: null
    },
    
    imageViewer: {
      open: false,
      images: [],
      currentIndex: 0,
      title: ''
    }
  },
  
  // Navigation state
  activeMenuItem: '',
  navigationHistory: [],
  
  // Search state
  globalSearch: {
    query: '',
    isOpen: false,
    results: [],
    loading: false,
    recentSearches: []
  },
  
  // Alerts (notifications moved to notificationSlice)
  alerts: [],
  
  // Table/list preferences using constants
  tablePreferences: {
    pageSize: TABLE.DEFAULT_PAGE_SIZE, 
    density: TABLE.DENSITIES.STANDARD, 
    showGridLines: true,
    stickyHeader: true
  },
  
  // Form state
  unsavedChanges: false,
  formDirty: false,
  
  // Responsive state
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  screenSize: SCREEN_SIZES.LG, 
  
  // Performance monitoring using constants
  performance: {
    slowQueries: [],
    errorCount: 0,
    lastErrorTime: null,
    slowQueryThreshold: PERFORMANCE.SLOW_QUERY_THRESHOLD 
  },
  
  // User preferences
  preferences: {
    language: 'en',
    timezone: 'UTC',
    dateFormat: DATE_TIME.FORMATS.DATE_SHORT, 
    timeFormat: DATE_TIME.FORMATS.TIME_12H, 
    currency: 'USD',
    numberFormat: 'US',
    showHelp: true,
    showTips: true,
    autoSave: true,
    soundEnabled: true
  },
  
  // Feature flags
  features: {
    darkMode: true,
    betaFeatures: false,
    advancedSearch: true,
    bulkOperations: true,
    exportFeatures: true,
    realTimeUpdates: true
  }
};

// Helper function to detect system theme
const detectSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
  }
  return THEMES.LIGHT;
};

// Helper function to store theme preference in memory
let memoryTheme = THEMES.LIGHT;

const getStoredTheme = () => memoryTheme;
const storeTheme = (theme) => { memoryTheme = theme; };

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    ...initialState,
    theme: getStoredTheme(),
    systemTheme: detectSystemTheme()
  },
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    
    // Theme actions using constants
    setTheme: (state, action) => {
      const theme = action.payload;

      if (Object.values(THEMES).includes(theme)) {
        state.theme = theme;
        storeTheme(theme);
      }
    },
    
    toggleTheme: (state) => {
      const newTheme = state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT; 
      state.theme = newTheme;
      storeTheme(newTheme);
    },
    
    setSystemTheme: (state, action) => {
      const theme = action.payload;
      if (Object.values(THEMES).includes(theme)) {
        state.systemTheme = theme;
      }
    },
    
    // Layout actions using constants
    setLayoutMode: (state, action) => {
      const mode = action.payload;
      if (Object.values(LAYOUT_MODES).includes(mode)) {
        state.layoutMode = mode;
      }
    },
    
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload;
      if (typeof window !== 'undefined') {
        document.title = `${action.payload} - Visitor Management System`;
      }
    },
    
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
    },
    
    setOverlayLoading: (state, action) => {
      state.overlayLoading = action.payload;
    },
    
    // Modal actions using constants
    showConfirmDialog: (state, action) => {
      state.modals.confirmDialog = {
        open: true,
        title: action.payload.title || 'Confirm Action',
        message: action.payload.message || 'Are you sure?',
        confirmText: action.payload.confirmText || 'Confirm',
        cancelText: action.payload.cancelText || 'Cancel',
        variant: action.payload.variant || MODALS.VARIANTS.DEFAULT, 
        onConfirm: action.payload.onConfirm || null,
        onCancel: action.payload.onCancel || null,
        loading: false
      };
    },
    
    hideConfirmDialog: (state) => {
      state.modals.confirmDialog.open = false;
    },
    
    setConfirmDialogLoading: (state, action) => {
      state.modals.confirmDialog.loading = action.payload;
    },
    
    showAlertDialog: (state, action) => {
      state.modals.alertDialog = {
        open: true,
        title: action.payload.title || 'Alert',
        message: action.payload.message || '',
        variant: action.payload.variant || MODALS.VARIANTS.INFO, 
        onClose: action.payload.onClose || null
      };
    },
    
    hideAlertDialog: (state) => {
      state.modals.alertDialog.open = false;
    },
    
    showImageViewer: (state, action) => {
      state.modals.imageViewer = {
        open: true,
        images: action.payload.images || [],
        currentIndex: action.payload.currentIndex || 0,
        title: action.payload.title || ''
      };
    },
    
    hideImageViewer: (state) => {
      state.modals.imageViewer.open = false;
    },
    
    setImageViewerIndex: (state, action) => {
      state.modals.imageViewer.currentIndex = action.payload;
    },
    
    // Navigation actions
    setActiveMenuItem: (state, action) => {
      state.activeMenuItem = action.payload;
    },
    
    addToNavigationHistory: (state, action) => {
      const { path, title } = action.payload;
      state.navigationHistory.unshift({ path, title, timestamp: Date.now() });
      
      // Keep only last 10 items
      if (state.navigationHistory.length > 10) {
        state.navigationHistory = state.navigationHistory.slice(0, 10);
      }
    },
    
    clearNavigationHistory: (state) => {
      state.navigationHistory = [];
    },
    
    // Search actions
    setGlobalSearchQuery: (state, action) => {
      state.globalSearch.query = action.payload;
    },
    
    setGlobalSearchOpen: (state, action) => {
      state.globalSearch.isOpen = action.payload;
    },
    
    setGlobalSearchResults: (state, action) => {
      state.globalSearch.results = action.payload;
    },
    
    setGlobalSearchLoading: (state, action) => {
      state.globalSearch.loading = action.payload;
    },
    
    addRecentSearch: (state, action) => {
      const query = action.payload;
      if (query && !state.globalSearch.recentSearches.includes(query)) {
        state.globalSearch.recentSearches.unshift(query);
        
        // Keep only last 10 searches
        if (state.globalSearch.recentSearches.length > 10) {
          state.globalSearch.recentSearches = state.globalSearch.recentSearches.slice(0, 10);
        }
      }
    },
    
    clearRecentSearches: (state) => {
      state.globalSearch.recentSearches = [];
    },
    
    // Alert actions
    addAlert: (state, action) => {
      const alert = {
        id: Date.now().toString(),
        type: action.payload.type || 'info',
        title: action.payload.title,
        message: action.payload.message,
        timestamp: new Date().toISOString(),
        read: false,
        persistent: action.payload.persistent || false
      };
      
      state.alerts.unshift(alert);
      
      // Keep only last 50 alerts
      if (state.alerts.length > 50) {
        state.alerts = state.alerts.slice(0, 50);
      }
    },
    
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    
    markAlertAsRead: (state, action) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.read = true;
      }
    },
    
    clearAlerts: (state) => {
      state.alerts = [];
    },
    
    // Table preferences using constants
    setTablePreferences: (state, action) => {
      const newPrefs = { ...state.tablePreferences, ...action.payload };
      
      // Validate using constants
      if (newPrefs.pageSize && TABLE.PAGE_SIZES.includes(newPrefs.pageSize)) {
        state.tablePreferences.pageSize = newPrefs.pageSize;
      }
      if (newPrefs.density && Object.values(TABLE.DENSITIES).includes(newPrefs.density)) {
        state.tablePreferences.density = newPrefs.density;
      }
      if (typeof newPrefs.showGridLines === 'boolean') {
        state.tablePreferences.showGridLines = newPrefs.showGridLines;
      }
      if (typeof newPrefs.stickyHeader === 'boolean') {
        state.tablePreferences.stickyHeader = newPrefs.stickyHeader;
      }
    },
    
    // Form state
    setUnsavedChanges: (state, action) => {
      state.unsavedChanges = action.payload;
    },
    
    setFormDirty: (state, action) => {
      state.formDirty = action.payload;
    },
    
    // Responsive state using constants
    setScreenSize: (state, action) => {
      const size = action.payload;
      if (Object.values(SCREEN_SIZES).includes(size)) {
        state.screenSize = size;
        state.isMobile = size === SCREEN_SIZES.XS || size === SCREEN_SIZES.SM;
        state.isTablet = size === SCREEN_SIZES.MD; 
        state.isDesktop = size === SCREEN_SIZES.LG || size === SCREEN_SIZES.XL; 
        
        // Auto-collapse sidebar on mobile
        if (state.isMobile) {
          state.sidebarOpen = false;
        }
      }
    },
    
    // Performance monitoring using constants
    addSlowQuery: (state, action) => {
      const query = {
        ...action.payload,
        timestamp: Date.now()
      };
      
      // Only add if it's actually slow
      if (query.duration > state.performance.slowQueryThreshold) {
        state.performance.slowQueries.unshift(query);
        
        // Keep only last 20 slow queries
        if (state.performance.slowQueries.length > 20) {
          state.performance.slowQueries = state.performance.slowQueries.slice(0, 20);
        }
      }
    },
    
    incrementErrorCount: (state) => {
      state.performance.errorCount += 1;
      state.performance.lastErrorTime = Date.now();
    },
    
    resetPerformanceCounters: (state) => {
      state.performance.errorCount = 0;
      state.performance.lastErrorTime = null;
      state.performance.slowQueries = [];
    },
    
    // User preferences with validation
    setPreferences: (state, action) => {
      const newPrefs = action.payload;
      
      // Validate date/time formats using constants
      if (newPrefs.dateFormat && Object.values(DATE_TIME.FORMATS).includes(newPrefs.dateFormat)) {
        state.preferences.dateFormat = newPrefs.dateFormat;
      }
      if (newPrefs.timeFormat && Object.values(DATE_TIME.FORMATS).includes(newPrefs.timeFormat)) {
        state.preferences.timeFormat = newPrefs.timeFormat;
      }
      
      // Set other preferences
      Object.keys(newPrefs).forEach(key => {
        if (state.preferences.hasOwnProperty(key) && key !== 'dateFormat' && key !== 'timeFormat') {
          state.preferences[key] = newPrefs[key];
        }
      });
    },
    
    setPreference: (state, action) => {
      const { key, value } = action.payload;
      if (state.preferences.hasOwnProperty(key)) {
        state.preferences[key] = value;
      }
    },
    
    // Feature flags
    setFeatureFlag: (state, action) => {
      const { feature, enabled } = action.payload;
      if (state.features.hasOwnProperty(feature)) {
        state.features[feature] = enabled;
      }
    },
    
    setFeatureFlags: (state, action) => {
      state.features = { ...state.features, ...action.payload };
    },
    
    // Bulk preference updates
    updatePreferences: (state, action) => {
      const updates = action.payload;
      Object.entries(updates).forEach(([key, value]) => {
        if (state.preferences.hasOwnProperty(key)) {
          state.preferences[key] = value;
        }
      });
    },
    
    // Reset specific sections
    resetAlerts: (state) => {
      state.alerts = [];
    },
    
    resetSearch: (state) => {
      state.globalSearch = {
        query: '',
        isOpen: false,
        results: [],
        loading: false,
        recentSearches: []
      };
    },
    
    resetModals: (state) => {
      state.modals = initialState.modals;
    },
    
    // Batch actions for performance
    batchUpdateUI: (state, action) => {
      const updates = action.payload;
      Object.entries(updates).forEach(([key, value]) => {
        if (state.hasOwnProperty(key)) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            state[key] = { ...state[key], ...value };
          } else {
            state[key] = value;
          }
        }
      });
    },
    
    // Reset UI state
    resetUIState: (state) => {
      Object.assign(state, {
        ...initialState,
        theme: state.theme, // Preserve theme
        preferences: state.preferences, // Preserve user preferences
        features: state.features // Preserve feature flags
      });
    },
    
    // System theme detection
    updateSystemTheme: (state) => {
      state.systemTheme = detectSystemTheme();
    },

    // Hydrate state for persistence
    hydrateState: (state, action) => {
      const { theme, preferences, sidebarCollapsed, tablePreferences } = action.payload;
      
      if (theme && Object.values(THEMES).includes(theme)) {
        state.theme = theme;
        storeTheme(theme);
      }
      if (preferences) state.preferences = { ...state.preferences, ...preferences };
      if (sidebarCollapsed !== undefined) state.sidebarCollapsed = sidebarCollapsed;
      if (tablePreferences) {
        // Validate table preferences using constants
        const validTablePrefs = {};
        if (tablePreferences.pageSize && TABLE.PAGE_SIZES.includes(tablePreferences.pageSize)) {
          validTablePrefs.pageSize = tablePreferences.pageSize;
        }
        if (tablePreferences.density && Object.values(TABLE.DENSITIES).includes(tablePreferences.density)) {
          validTablePrefs.density = tablePreferences.density;
        }
        if (typeof tablePreferences.showGridLines === 'boolean') {
          validTablePrefs.showGridLines = tablePreferences.showGridLines;
        }
        if (typeof tablePreferences.stickyHeader === 'boolean') {
          validTablePrefs.stickyHeader = tablePreferences.stickyHeader;
        }
        
        state.tablePreferences = { ...state.tablePreferences, ...validTablePrefs };
      }
    }
  }
});

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  setTheme,
  toggleTheme,
  setSystemTheme,
  setLayoutMode,
  setPageTitle,
  setBreadcrumbs,
  setGlobalLoading,
  setPageLoading,
  setOverlayLoading,
  showConfirmDialog,
  hideConfirmDialog,
  setConfirmDialogLoading,
  showAlertDialog,
  hideAlertDialog,
  showImageViewer,
  hideImageViewer,
  setImageViewerIndex,
  setActiveMenuItem,
  addToNavigationHistory,
  clearNavigationHistory,
  setGlobalSearchQuery,
  setGlobalSearchOpen,
  setGlobalSearchResults,
  setGlobalSearchLoading,
  addRecentSearch,
  clearRecentSearches,
  addAlert,
  removeAlert,
  markAlertAsRead,
  clearAlerts,
  setTablePreferences,
  setUnsavedChanges,
  setFormDirty,
  setScreenSize,
  addSlowQuery,
  incrementErrorCount,
  resetPerformanceCounters,
  setPreferences,
  setPreference,
  setFeatureFlag,
  setFeatureFlags,
  updatePreferences,
  resetAlerts,
  resetSearch,
  resetModals,
  batchUpdateUI,
  resetUIState,
  updateSystemTheme,
  hydrateState
} = uiSlice.actions;

// Thunk actions for complex operations
export const initializeUI = () => (dispatch) => {
  // Detect system theme
  dispatch(updateSystemTheme());
  
  // Set up system theme listener
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => dispatch(updateSystemTheme());
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Return cleanup function
    return () => mediaQuery.removeEventListener('change', handleChange);
  }
};

export const setPageTitleWithBreadcrumbs = (title, breadcrumbs = []) => (dispatch) => {
  dispatch(setPageTitle(title));
  dispatch(setBreadcrumbs(breadcrumbs));
  dispatch(addToNavigationHistory({ 
    path: window.location.pathname, 
    title 
  }));
};

// Export reducer
export default uiSlice.reducer;