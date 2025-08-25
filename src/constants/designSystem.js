// src/constants/designSystem.js
// QUICK WIN #1: Implement Design System Constants (30 minutes)

export const TYPOGRAPHY = {
  display: {
    1: 'text-4xl font-bold leading-tight tracking-tight',      // Main page titles
    2: 'text-3xl font-semibold leading-tight tracking-tight',  // Section titles
  },
  heading: {
    1: 'text-2xl font-semibold leading-tight',  // Card headers  
    2: 'text-xl font-medium leading-tight',     // Subsections
    3: 'text-lg font-medium leading-tight',     // Small sections
  },
  body: {
    lg: 'text-base font-normal leading-relaxed',  // Primary text
    md: 'text-sm font-normal leading-relaxed',   // Secondary text  
    sm: 'text-xs font-normal leading-relaxed',   // Helper text
  }
};

export const COLORS = {
  primary: {
    50: '#eff6ff',   // Light backgrounds
    100: '#dbeafe',  // Hover states
    500: '#3b82f6',  // Default primary
    600: '#2563eb',  // Active states
    700: '#1d4ed8',  // Pressed states
  },
  semantic: {
    success: '#059669',  // Green-600
    warning: '#d97706',  // Amber-600
    error: '#dc2626',    // Red-600
    info: '#0891b2',     // Cyan-600
  },
  neutral: {
    50: '#f9fafb',   // Page backgrounds
    100: '#f3f4f6',  // Card backgrounds
    200: '#e5e7eb',  // Borders
    400: '#9ca3af',  // Placeholders
    600: '#4b5563',  // Secondary text
    900: '#111827',  // Primary text
  }
};

export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
};

// Usage helper functions
export const text = (variant) => TYPOGRAPHY[variant] || TYPOGRAPHY.body.md;
export const color = (variant) => COLORS[variant] || COLORS.neutral[600];
export const space = (size) => SPACING[size] || SPACING.md;