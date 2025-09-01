// src/components/common/Button/Button.js
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// Design System Integration
import { BUTTON_COLORS } from '../../../constants/colors';

/**
 * Enhanced Button Component with Design System Integration
 * 
 * Features:
 * - Full design system integration
 * - Loading and disabled states
 * - Icons with proper positioning
 * - Multiple variants and sizes
 * - Accessibility improvements
 * - Enhanced hover and focus states
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  onClick,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) => {
  // Base classes with enhanced typography from design system
  const baseClasses = classNames(
    'inline-flex items-center justify-center font-medium rounded-lg',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed',
    'transform active:scale-95'
  );
  
  // Enhanced variant classes using design system colors
  const variantClasses = {
    primary: classNames(
      BUTTON_COLORS.primary.base,
      BUTTON_COLORS.primary.hover,
      BUTTON_COLORS.primary.active,
      BUTTON_COLORS.primary.focus,
      BUTTON_COLORS.primary.disabled,
      'shadow-sm hover:shadow-md'
    ),
    secondary: classNames(
      BUTTON_COLORS.secondary.base,
      BUTTON_COLORS.secondary.hover,
      BUTTON_COLORS.secondary.active,
      BUTTON_COLORS.secondary.focus,
      BUTTON_COLORS.secondary.disabled,
      'shadow-sm hover:shadow'
    ),
    success: classNames(
      BUTTON_COLORS.success.base,
      BUTTON_COLORS.success.hover,
      BUTTON_COLORS.success.active,
      BUTTON_COLORS.success.focus,
      BUTTON_COLORS.success.disabled,
      'shadow-sm hover:shadow-md'
    ),
    danger: classNames(
      BUTTON_COLORS.danger.base,
      BUTTON_COLORS.danger.hover,
      BUTTON_COLORS.danger.active,
      BUTTON_COLORS.danger.focus,
      BUTTON_COLORS.danger.disabled,
      'shadow-sm hover:shadow-md'
    ),
    warning: classNames(
      BUTTON_COLORS.warning.base,
      BUTTON_COLORS.warning.hover,
      BUTTON_COLORS.warning.active,
      BUTTON_COLORS.warning.focus,
      BUTTON_COLORS.warning.disabled,
      'shadow-sm hover:shadow-md'
    ),
    outline: classNames(
      BUTTON_COLORS.outline.base,
      BUTTON_COLORS.outline.hover,
      BUTTON_COLORS.outline.active,
      BUTTON_COLORS.outline.focus,
      BUTTON_COLORS.outline.disabled,
      'transition-colors duration-200'
    ),
    ghost: classNames(
      BUTTON_COLORS.ghost.base,
      BUTTON_COLORS.ghost.hover,
      BUTTON_COLORS.ghost.active,
      BUTTON_COLORS.ghost.focus,
      BUTTON_COLORS.ghost.disabled,
      'transition-colors duration-200'
    ),
    // Additional variants
    info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 shadow-sm hover:shadow-md disabled:bg-gray-300 disabled:text-gray-500',
    link: 'text-primary-600 hover:text-primary-800 underline-offset-4 hover:underline focus:ring-primary-500 disabled:text-gray-400'
  };
  
  // Enhanced size classes with better typography integration
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs font-medium',
    sm: 'px-3 py-2 text-sm font-medium',
    md: 'px-4 py-2.5 text-sm font-medium',
    lg: 'px-6 py-3 text-base font-medium',
    xl: 'px-8 py-4 text-lg font-semibold'
  };
  
  // Icon size classes
  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  // Combined classes
  const classes = classNames(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      'w-full': fullWidth,
      'cursor-not-allowed opacity-50': disabled,
      'cursor-wait opacity-75': loading && !disabled
    },
    className
  );

  // Enhanced loading spinner with better animation
  const LoadingSpinner = () => (
    <svg 
      className={classNames(
        'animate-spin mr-2', 
        iconSizeClasses[size]
      )} 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Enhanced icon component with better spacing
  const IconComponent = icon && React.cloneElement(icon, {
    className: classNames(
      icon.props.className, // keep passed classes
      iconSizeClasses[size],
      {
        'mr-2': iconPosition === 'left' && children,
        'ml-2': iconPosition === 'right' && children
      }
    ),
    'aria-hidden': 'true'
  });

  // Enhanced click handler
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    
    // Add haptic feedback for supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    onClick?.(e);
  };

  // Enhanced keyboard handling
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && (disabled || loading)) {
      e.preventDefault();
    }
  };

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && IconComponent}
      
      {/* Content wrapper for better alignment */}
      <span className={classNames(
        'inline-flex items-center',
        { 'sr-only': loading && !children }
      )}>
        {children}
      </span>
      
      {!loading && icon && iconPosition === 'right' && IconComponent}
      
      {/* Screen reader loading text */}
      {loading && (
        <span className="sr-only">Loading...</span>
      )}
    </button>
  );
};

// Button.propTypes = {
//   children: PropTypes.node,
//   variant: PropTypes.oneOf([
//     'primary', 'secondary', 'success', 'danger', 
//     'warning', 'info', 'outline', 'ghost', 'link'
//   ]),
//   size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
//   disabled: PropTypes.bool,
//   loading: PropTypes.bool,
//   type: PropTypes.oneOf(['button', 'submit', 'reset']),
//   className: PropTypes.string,
//   onClick: PropTypes.func,
//   icon: PropTypes.element,
//   iconPosition: PropTypes.oneOf(['left', 'right']),
//   fullWidth: PropTypes.bool
// };


export default Button;