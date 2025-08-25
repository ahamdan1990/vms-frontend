/**
 * Typography System - Consistent text styles across VMS
 * Usage: import { TYPOGRAPHY } from '../constants/typography';
 */

export const TYPOGRAPHY = {
  display: {
    1: 'text-4xl font-bold leading-tight tracking-tight',      // 36px - Main page titles
    2: 'text-3xl font-semibold leading-tight tracking-tight',  // 30px - Section titles
  },
  heading: {
    1: 'text-2xl font-semibold leading-tight',  // 24px - Card headers
    2: 'text-xl font-medium leading-tight',     // 20px - Subsections
    3: 'text-lg font-medium leading-tight',     // 18px - Small sections
  },
  body: {
    lg: 'text-base font-normal leading-relaxed',    // 16px - Primary text
    md: 'text-sm font-normal leading-relaxed',     // 14px - Secondary text
    sm: 'text-xs font-normal leading-relaxed',     // 12px - Helper text
  },
  label: {
    lg: 'text-sm font-medium leading-tight',       // 14px - Form labels
    md: 'text-xs font-medium leading-tight',       // 12px - Small labels
    sm: 'text-xs font-medium leading-tight',       // 11px - Tiny labels
  },
  code: {
    md: 'text-sm font-mono leading-normal',        // 14px - Code blocks
    sm: 'text-xs font-mono leading-normal',        // 12px - Inline code
  }
};

// Color-specific typography classes
export const TYPOGRAPHY_COLORS = {
  primary: 'text-gray-900 dark:text-gray-100',
  secondary: 'text-gray-600 dark:text-gray-400', 
  muted: 'text-gray-500 dark:text-gray-500',
  error: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
};

// Helper function to combine typography with color
export const getTypographyClasses = (type, variant, color = 'primary') => {
  const baseClasses = TYPOGRAPHY[type]?.[variant] || TYPOGRAPHY.body.md;
  const colorClasses = TYPOGRAPHY_COLORS[color] || TYPOGRAPHY_COLORS.primary;
  return `${baseClasses} ${colorClasses}`;
};

// Pre-defined combinations for common use cases
export const TEXT_STYLES = {
  pageTitle: `${TYPOGRAPHY.display[1]} ${TYPOGRAPHY_COLORS.primary}`,
  sectionTitle: `${TYPOGRAPHY.heading[1]} ${TYPOGRAPHY_COLORS.primary}`,
  cardTitle: `${TYPOGRAPHY.heading[2]} ${TYPOGRAPHY_COLORS.primary}`,
  bodyText: `${TYPOGRAPHY.body.md} ${TYPOGRAPHY_COLORS.secondary}`,
  label: `${TYPOGRAPHY.label.md} ${TYPOGRAPHY_COLORS.primary}`,
  helpText: `${TYPOGRAPHY.body.sm} ${TYPOGRAPHY_COLORS.muted}`,
  errorText: `${TYPOGRAPHY.body.sm} ${TYPOGRAPHY_COLORS.error}`,
  successText: `${TYPOGRAPHY.body.sm} ${TYPOGRAPHY_COLORS.success}`,
};

export default TYPOGRAPHY;