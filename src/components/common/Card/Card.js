import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Enhanced Card Component using Design System
 * 
 * Features:
 * - Design system integration
 * - Multiple variants and sizes
 * - Hover and focus states
 * - Accent colors and borders
 * - Enhanced shadows and animations
 * - Backward compatibility with existing usage
 */
const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'default',
  padding = true, 
  shadow = true,
  hover = false,
  accent = null,
  clickable = false,
  onClick,
  ...props 
}) => {
  // Variant styles using design system with dark mode
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-md',
    outlined: 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600',
    filled: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  };

  // Size variations
  const sizeClasses = {
    xs: padding ? 'p-3' : '',
    sm: padding ? 'p-4' : '',
    default: padding ? 'p-6' : '',
    lg: padding ? 'p-8' : '',
    xl: padding ? 'p-10' : ''
  };

  // Shadow variations
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  // Get shadow class
  const shadowClass = typeof shadow === 'string' ? shadowClasses[shadow] : 
                     shadow ? shadowClasses.default : shadowClasses.none;

  // Accent border styles
  const accentClasses = {
    primary: 'border-l-4 border-l-primary-500',
    success: 'border-l-4 border-l-green-500',
    warning: 'border-l-4 border-l-yellow-500',
    error: 'border-l-4 border-l-red-500',
    info: 'border-l-4 border-l-blue-500',
    purple: 'border-l-4 border-l-purple-500',
    indigo: 'border-l-4 border-l-indigo-500',
    pink: 'border-l-4 border-l-pink-500'
  };

  const cardClasses = classNames(
    // Base styles
    'rounded-lg border transition-all duration-200',
    
    // Variant styles
    variantClasses[variant],
    
    // Size/padding styles
    sizeClasses[size],
    
    // Shadow styles
    shadowClass,
    
    // Hover styles
    {
      'hover:shadow-md hover:-translate-y-0.5 transform': hover,
      'cursor-pointer': clickable || onClick,
      'hover:border-primary-300 dark:hover:border-primary-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-opacity-50':
        clickable || onClick,
    },
    
    // Accent border
    accent && accentClasses[accent],
    
    // Custom classes
    className
  );

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyPress = (e) => {
    if ((clickable || onClick) && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (onClick) {
        onClick(e);
      }
    }
  };

  const cardProps = {
    className: cardClasses,
    ...(clickable || onClick ? {
      tabIndex: 0,
      role: 'button',
      onKeyPress: handleKeyPress,
      onClick: handleClick
    } : {}),
    ...props
  };

  return (
    <div {...cardProps}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    'default', 'elevated', 'outlined', 'filled', 
    'success', 'warning', 'error', 'info'
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'default', 'lg', 'xl']),
  padding: PropTypes.bool,
  shadow: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(['none', 'sm', 'default', 'md', 'lg', 'xl'])
  ]),
  hover: PropTypes.bool,
  accent: PropTypes.oneOf([
    'primary', 'success', 'warning', 'error', 'info', 
    'purple', 'indigo', 'pink'
  ]),
  clickable: PropTypes.bool,
  onClick: PropTypes.func
};


export default Card;