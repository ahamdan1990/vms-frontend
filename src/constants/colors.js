/**
 * Color System - Consistent colors across VMS
 * Usage: import { COLORS } from '../constants/colors';
 */

export const COLORS = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',   // Main primary color
    600: '#2563eb',   // Primary hover/active
    700: '#1d4ed8',   // Primary pressed
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Neutral grays
  gray: {
    50: '#f9fafb',    // Page backgrounds
    100: '#f3f4f6',   // Card backgrounds
    200: '#e5e7eb',   // Borders
    300: '#d1d5db',   // Disabled backgrounds
    400: '#9ca3af',   // Placeholders
    500: '#6b7280',   // Secondary text
    600: '#4b5563',   // Primary text secondary
    700: '#374151',   // Primary text
    800: '#1f2937',   // Headers
    900: '#111827',   // Primary text dark
  },
  
  // Semantic colors
  semantic: {
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981',  // Main success color
      600: '#059669',  // Success hover
      700: '#047857',  // Success pressed
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',  // Main warning color
      600: '#d97706',  // Warning hover
      700: '#b45309',  // Warning pressed
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',  // Main error color
      600: '#dc2626',  // Error hover
      700: '#b91c1c',  // Error pressed
    },
    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#06b6d4',  // Main info color
      600: '#0891b2',  // Info hover
      700: '#0e7490',  // Info pressed
    }
  }
};

// Tailwind-ready color classes
export const COLOR_CLASSES = {
  // Background colors
  bg: {
    primary: 'bg-primary-500',
    'primary-hover': 'hover:bg-primary-600',
    'primary-active': 'bg-primary-700',
    'primary-light': 'bg-primary-50',
    
    secondary: 'bg-gray-100',
    'secondary-hover': 'hover:bg-gray-200',
    
    success: 'bg-green-500',
    'success-hover': 'hover:bg-green-600',
    'success-light': 'bg-green-50',
    
    warning: 'bg-yellow-500',
    'warning-hover': 'hover:bg-yellow-600',
    'warning-light': 'bg-yellow-50',
    
    error: 'bg-red-500',
    'error-hover': 'hover:bg-red-600',
    'error-light': 'bg-red-50',
    
    info: 'bg-cyan-500',
    'info-hover': 'hover:bg-cyan-600',
    'info-light': 'bg-cyan-50',
  },
  
  // Text colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    white: 'text-white',
    
    'primary-color': 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-cyan-600',
  },
  
  // Border colors
  border: {
    default: 'border-gray-200',
    light: 'border-gray-100',
    dark: 'border-gray-300',
    
    primary: 'border-primary-500',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500',
    info: 'border-cyan-500',
  }
};

// Button variant color mappings with dark mode support
export const BUTTON_COLORS = {
  primary: {
    base: 'bg-primary-600 text-white dark:bg-primary-500',
    hover: 'hover:bg-primary-700 dark:hover:bg-primary-600',
    active: 'active:bg-primary-800 dark:active:bg-primary-700',
    focus: 'focus:ring-primary-500 dark:focus:ring-primary-400',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500',
  },
  secondary: {
    base: 'bg-gray-100 text-gray-900 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600',
    hover: 'hover:bg-gray-200 dark:hover:bg-gray-600',
    active: 'active:bg-gray-300 dark:active:bg-gray-500',
    focus: 'focus:ring-gray-500 dark:focus:ring-gray-400',
    disabled: 'disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600',
  },
  success: {
    base: 'bg-green-600 text-white dark:bg-green-500',
    hover: 'hover:bg-green-700 dark:hover:bg-green-600',
    active: 'active:bg-green-800 dark:active:bg-green-700',
    focus: 'focus:ring-green-500 dark:focus:ring-green-400',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500',
  },
  danger: {
    base: 'bg-red-600 text-white dark:bg-red-500',
    hover: 'hover:bg-red-700 dark:hover:bg-red-600',
    active: 'active:bg-red-800 dark:active:bg-red-700',
    focus: 'focus:ring-red-500 dark:focus:ring-red-400',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500',
  },
  warning: {
    base: 'bg-yellow-500 text-white dark:bg-yellow-600',
    hover: 'hover:bg-yellow-600 dark:hover:bg-yellow-700',
    active: 'active:bg-yellow-700 dark:active:bg-yellow-800',
    focus: 'focus:ring-yellow-500 dark:focus:ring-yellow-400',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500',
  },
  outline: {
    base: 'border-2 border-primary-600 text-primary-600 bg-transparent dark:border-primary-400 dark:text-primary-400',
    hover: 'hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 dark:hover:border-primary-500',
    active: 'active:bg-primary-700 active:text-white dark:active:bg-primary-600 dark:active:border-primary-600',
    focus: 'focus:ring-primary-500 dark:focus:ring-primary-400',
    disabled: 'disabled:border-gray-300 disabled:text-gray-400 dark:disabled:border-gray-700 dark:disabled:text-gray-600',
  },
  ghost: {
    base: 'text-primary-600 bg-transparent dark:text-primary-400',
    hover: 'hover:bg-primary-50 dark:hover:bg-primary-900/20',
    active: 'active:bg-primary-100 dark:active:bg-primary-900/30',
    focus: 'focus:ring-primary-500 dark:focus:ring-primary-400',
    disabled: 'disabled:text-gray-400 dark:disabled:text-gray-600',
  }
};

// Badge/Status colors with dark mode support
export const BADGE_COLORS = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200',
  secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200',
};

// Utility functions
export const getColorValue = (colorPath) => {
  const path = colorPath.split('.');
  let value = COLORS;
  
  for (const key of path) {
    value = value[key];
    if (!value) return null;
  }
  
  return value;
};

export const getSemanticColor = (type, shade = 500) => {
  return COLORS.semantic[type]?.[shade] || COLORS.gray[500];
};

export default COLORS;