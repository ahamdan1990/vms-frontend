/**
 * UI-related constants for consistent user interface behavior
 * Works with the uiSlice to manage application UI state
 */

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Layout modes
export const LAYOUT_MODES = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  COMFORTABLE: 'comfortable'
};

// Screen size breakpoints (matches CSS breakpoints)
export const SCREEN_SIZES = {
  XS: 'xs',  // < 576px
  SM: 'sm',  // 576px - 767px
  MD: 'md',  // 768px - 991px
  LG: 'lg',  // 992px - 1199px
  XL: 'xl'   // >= 1200px
};

// Breakpoint values in pixels
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200
};

// Sidebar constants
export const SIDEBAR = {
  WIDTH_EXPANDED: 280,
  WIDTH_COLLAPSED: 64,
  TRANSITION_DURATION: 300, // milliseconds
  MOBILE_BREAKPOINT: BREAKPOINTS.MD
};

// Modal constants
export const MODALS = {
  SIZES: {
    SMALL: 'sm',    // 400px
    MEDIUM: 'md',   // 600px
    LARGE: 'lg',    // 800px
    EXTRA_LARGE: 'xl' // 1200px
  },
  
  VARIANTS: {
    DEFAULT: 'default',
    DANGER: 'danger',
    WARNING: 'warning',
    SUCCESS: 'success',
    INFO: 'info'
  },
  
  ANIMATION_DURATION: 200,
  BACKDROP_BLUR: true,
  CLOSE_ON_ESCAPE: true,
  CLOSE_ON_BACKDROP: true,
  
  Z_INDICES: {
    BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080
  }
};

// Toast notification constants
export const TOAST = {
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    LOADING: 'loading'
  },
  
  POSITIONS: {
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center',
    BOTTOM_RIGHT: 'bottom-right'
  },
  
  DEFAULT_POSITION: 'top-right',
  DEFAULT_DURATION: 4000,
  PERSISTENT_DURATION: 0,
  MAX_TOASTS: 5,
  ANIMATION_DURATION: 300
};

// Loading states
export const LOADING = {
  STATES: {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
  },
  
  TYPES: {
    SPINNER: 'spinner',
    DOTS: 'dots',
    PULSE: 'pulse',
    SKELETON: 'skeleton',
    PROGRESS: 'progress'
  },
  
  SIZES: {
    SMALL: 'sm',
    MEDIUM: 'md',
    LARGE: 'lg'
  }
};

// Table constants
export const TABLE = {
  DENSITIES: {
    COMPACT: 'compact',
    STANDARD: 'standard',
    COMFORTABLE: 'comfortable'
  },
  
  PAGE_SIZES: [10, 20, 50, 100],
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  },
  
  SELECTION_MODES: {
    NONE: 'none',
    SINGLE: 'single',
    MULTIPLE: 'multiple'
  },
  
  ROW_HEIGHTS: {
    COMPACT: 32,
    STANDARD: 48,
    COMFORTABLE: 64
  }
};

// Form constants
export const FORMS = {
  VALIDATION_TRIGGERS: {
    ON_BLUR: 'onBlur',
    ON_CHANGE: 'onChange',
    ON_SUBMIT: 'onSubmit'
  },
  
  INPUT_SIZES: {
    SMALL: 'sm',
    MEDIUM: 'md',
    LARGE: 'lg'
  },
  
  FIELD_TYPES: {
    TEXT: 'text',
    EMAIL: 'email',
    PASSWORD: 'password',
    NUMBER: 'number',
    TEL: 'tel',
    URL: 'url',
    SEARCH: 'search',
    DATE: 'date',
    TIME: 'time',
    DATETIME_LOCAL: 'datetime-local',
    TEXTAREA: 'textarea',
    SELECT: 'select',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    FILE: 'file',
    HIDDEN: 'hidden'
  },
  
  VALIDATION_STATES: {
    VALID: 'valid',
    INVALID: 'invalid',
    PENDING: 'pending'
  }
};

// Button constants
export const BUTTONS = {
  VARIANTS: {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    SUCCESS: 'success',
    DANGER: 'danger',
    WARNING: 'warning',
    INFO: 'info',
    LIGHT: 'light',
    DARK: 'dark',
    OUTLINE: 'outline',
    GHOST: 'ghost',
    LINK: 'link'
  },
  
  SIZES: {
    EXTRA_SMALL: 'xs',
    SMALL: 'sm',
    MEDIUM: 'md',
    LARGE: 'lg',
    EXTRA_LARGE: 'xl'
  },
  
  STATES: {
    DEFAULT: 'default',
    LOADING: 'loading',
    DISABLED: 'disabled',
    ACTIVE: 'active'
  }
};

// Badge/Chip constants
export const BADGES = {
  VARIANTS: {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    SUCCESS: 'success',
    DANGER: 'danger',
    WARNING: 'warning',
    INFO: 'info',
    LIGHT: 'light',
    DARK: 'dark'
  },
  
  SIZES: {
    SMALL: 'sm',
    MEDIUM: 'md',
    LARGE: 'lg'
  }
};

// Alert constants
export const ALERTS = {
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  
  VARIANTS: {
    FILLED: 'filled',
    OUTLINED: 'outlined',
    STANDARD: 'standard'
  },
  
  SEVERITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  }
};

// Navigation constants
export const NAVIGATION = {
  MENU_ITEMS: {
    DASHBOARD: 'dashboard',
    USERS: 'users',
    INVITATIONS: 'invitations',
    VISITORS: 'visitors',
    CHECKIN: 'checkin',
    REPORTS: 'reports',
    SETTINGS: 'settings',
    PROFILE: 'profile'
  },
  
  BREADCRUMB_SEPARATOR: '/',
  MAX_BREADCRUMB_ITEMS: 5,
  
  TRANSITIONS: {
    FADE: 'fade',
    SLIDE: 'slide',
    SCALE: 'scale'
  }
};

// Search constants
export const SEARCH = {
  DEBOUNCE_DELAY: 300, // milliseconds
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  MAX_RESULTS: 50,
  MAX_RECENT_SEARCHES: 10,
  
  HIGHLIGHT_CLASS: 'search-highlight',
  NO_RESULTS_MESSAGE: 'No results found',
  
  SCOPES: {
    ALL: 'all',
    USERS: 'users',
    INVITATIONS: 'invitations',
    VISITORS: 'visitors'
  }
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_VISIBLE_PAGES: 7,
  
  NAVIGATION_TYPES: {
    NUMBERS: 'numbers',
    SIMPLE: 'simple',
    COMPACT: 'compact'
  }
};

// Date/Time constants
export const DATE_TIME = {
  FORMATS: {
    DATE_SHORT: 'MM/dd/yyyy',
    DATE_LONG: 'MMMM dd, yyyy',
    DATE_ISO: 'yyyy-MM-dd',
    TIME_12H: 'h:mm a',
    TIME_24H: 'HH:mm',
    DATETIME_SHORT: 'MM/dd/yyyy h:mm a',
    DATETIME_LONG: 'MMMM dd, yyyy h:mm a',
    DATETIME_ISO: "yyyy-MM-dd'T'HH:mm:ss",
    RELATIVE: 'relative' // e.g., "2 hours ago"
  },
  
  TIMEZONES: {
    UTC: 'UTC',
    LOCAL: 'local'
  },
  
  RELATIVE_TIME_THRESHOLDS: {
    SECONDS: 60,
    MINUTES: 60,
    HOURS: 24,
    DAYS: 30,
    MONTHS: 12
  }
};

// File upload constants
export const FILE_UPLOAD = {
  STATES: {
    IDLE: 'idle',
    DRAGGING: 'dragging',
    UPLOADING: 'uploading',
    SUCCESS: 'success',
    ERROR: 'error'
  },
  
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },
  
  PREVIEW_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
  MAX_PREVIEW_SIZE: 2 * 1024 * 1024, // 2MB
  
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: 'File size exceeds maximum limit',
    INVALID_TYPE: 'File type not supported',
    UPLOAD_FAILED: 'Upload failed, please try again',
    NETWORK_ERROR: 'Network error during upload'
  }
};

// Animation constants
export const ANIMATIONS = {
  DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  
  EASINGS: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    LINEAR: 'linear'
  },
  
  TYPES: {
    FADE: 'fade',
    SLIDE_UP: 'slideUp',
    SLIDE_DOWN: 'slideDown',
    SLIDE_LEFT: 'slideLeft',
    SLIDE_RIGHT: 'slideRight',
    SCALE: 'scale',
    BOUNCE: 'bounce'
  }
};

// Color palette constants
export const COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4'
};

// Spacing constants (in pixels)
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
  XXXL: 64
};

// Border radius constants
export const BORDER_RADIUS = {
  NONE: 0,
  SM: 2,
  MD: 4,
  LG: 8,
  XL: 12,
  FULL: 9999
};

// Shadow constants
export const SHADOWS = {
  NONE: 'none',
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
};

// Icon constants
export const ICONS = {
  SIZES: {
    XS: 12,
    SM: 16,
    MD: 20,
    LG: 24,
    XL: 32,
    XXL: 48
  },
  
  TYPES: {
    OUTLINE: 'outline',
    FILLED: 'filled',
    DUOTONE: 'duotone'
  }
};

// Performance constants
export const PERFORMANCE = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  VIRTUAL_SCROLL_THRESHOLD: 1000,
  LAZY_LOAD_THRESHOLD: 200,
  
  SLOW_QUERY_THRESHOLD: 1000, // milliseconds
  MEMORY_WARNING_THRESHOLD: 50 * 1024 * 1024, // 50MB
  
  OPTIMIZATION: {
    ENABLE_VIRTUAL_SCROLLING: true,
    ENABLE_LAZY_LOADING: true,
    ENABLE_MEMOIZATION: true,
    ENABLE_CODE_SPLITTING: true
  }
};

// Accessibility constants
export const ACCESSIBILITY = {
  FOCUS_VISIBLE_CLASS: 'focus-visible',
  SKIP_LINK_CLASS: 'skip-link',
  SCREEN_READER_ONLY_CLASS: 'sr-only',
  
  ARIA_LABELS: {
    CLOSE: 'Close',
    OPEN: 'Open',
    MENU: 'Menu',
    SEARCH: 'Search',
    LOADING: 'Loading',
    ERROR: 'Error',
    SUCCESS: 'Success',
    WARNING: 'Warning',
    INFO: 'Information'
  },
  
  KEYBOARD_SHORTCUTS: {
    ESCAPE: 'Escape',
    ENTER: 'Enter',
    SPACE: ' ',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
  }
};

// Local storage keys (for reference, using memory storage in artifacts)
export const STORAGE_KEYS = {
  THEME: 'vms_theme',
  SIDEBAR_COLLAPSED: 'vms_sidebar_collapsed',
  TABLE_PREFERENCES: 'vms_table_preferences',
  USER_PREFERENCES: 'vms_user_preferences',
  SEARCH_HISTORY: 'vms_search_history',
  RECENT_ACTIONS: 'vms_recent_actions'
};

// Helper functions
export const getBreakpointFromWidth = (width) => {
  if (width < BREAKPOINTS.SM) return SCREEN_SIZES.XS;
  if (width < BREAKPOINTS.MD) return SCREEN_SIZES.SM;
  if (width < BREAKPOINTS.LG) return SCREEN_SIZES.MD;
  if (width < BREAKPOINTS.XL) return SCREEN_SIZES.LG;
  return SCREEN_SIZES.XL;
};

export const isMobileScreen = (screenSize) => {
  return screenSize === SCREEN_SIZES.XS || screenSize === SCREEN_SIZES.SM;
};

export const isTabletScreen = (screenSize) => {
  return screenSize === SCREEN_SIZES.MD;
};

export const isDesktopScreen = (screenSize) => {
  return screenSize === SCREEN_SIZES.LG || screenSize === SCREEN_SIZES.XL;
};

export const getColorByVariant = (variant) => {
  const colorMap = {
    primary: COLORS.PRIMARY[500],
    success: COLORS.SUCCESS,
    warning: COLORS.WARNING,
    error: COLORS.ERROR,
    info: COLORS.INFO,
    secondary: COLORS.GRAY[500]
  };
  
  return colorMap[variant] || colorMap.primary;
};

export const getSpacingValue = (size) => {
  return SPACING[size?.toUpperCase()] || SPACING.MD;
};

export default {
  THEMES,
  LAYOUT_MODES,
  SCREEN_SIZES,
  BREAKPOINTS,
  SIDEBAR,
  MODALS,
  TOAST,
  LOADING,
  TABLE,
  FORMS,
  BUTTONS,
  BADGES,
  ALERTS,
  NAVIGATION,
  SEARCH,
  PAGINATION,
  DATE_TIME,
  FILE_UPLOAD,
  ANIMATIONS,
  COLORS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ICONS,
  PERFORMANCE,
  ACCESSIBILITY,
  STORAGE_KEYS,
  
  // Helper functions
  getBreakpointFromWidth,
  isMobileScreen,
  isTabletScreen,
  isDesktopScreen,
  getColorByVariant,
  getSpacingValue
};