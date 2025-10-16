// src/components/common/LoadingSpinner/LoadingSpinner.js
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Professional Loading Spinner Component with multiple variants
 * Supports different sizes, colors, and loading patterns
 */
const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  text,
  className = '',
  centered = false,
  overlay = false,
  inline = false
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    white: 'text-white'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl'
  };

  const spinnerClasses = classNames(
    'animate-spin',
    sizeClasses[size],
    colorClasses[variant]
  );

  const containerClasses = classNames(
    {
      'flex items-center justify-center': centered && !inline,
      'flex items-center space-x-2': inline || text,
      'fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center': overlay,
      'min-h-screen': centered && !overlay && !inline
    },
    className
  );

  const SpinnerSVG = () => (
    <svg
      className={spinnerClasses}
      fill="none"
      viewBox="0 0 24 24"
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

  if (overlay) {
    return (
      <div className={containerClasses}>
        <div className="text-center">
          <SpinnerSVG />
          {text && (
            <p className={classNames('mt-2 font-medium', textSizeClasses[size], colorClasses[variant])}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <SpinnerSVG />
      {text && (
        <span className={classNames('font-medium', textSizeClasses[size], colorClasses[variant])}>
          {text}
        </span>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'white']),
  text: PropTypes.string,
  className: PropTypes.string,
  centered: PropTypes.bool,
  overlay: PropTypes.bool,
  inline: PropTypes.bool
};

// Dots Loading Component
export const LoadingDots = ({ 
  size = 'md', 
  variant = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-600',
    white: 'bg-white'
  };

  const dotClasses = classNames(
    'rounded-full animate-pulse',
    sizeClasses[size],
    colorClasses[variant]
  );

  return (
    <div className={classNames('flex items-center space-x-1', className)}>
      <div className={dotClasses} style={{ animationDelay: '0ms' }} />
      <div className={dotClasses} style={{ animationDelay: '150ms' }} />
      <div className={dotClasses} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

LoadingDots.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'white']),
  className: PropTypes.string
};

// Pulse Loading Component
export const LoadingPulse = ({ 
  size = 'md', 
  variant = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  const colorClasses = {
    primary: 'bg-blue-200',
    secondary: 'bg-gray-200',
    success: 'bg-green-200',
    danger: 'bg-red-200',
    warning: 'bg-yellow-200',
    white: 'bg-gray-100'
  };

  const pulseClasses = classNames(
    'rounded-full animate-pulse',
    sizeClasses[size],
    colorClasses[variant]
  );

  return (
    <div className={classNames('flex items-center justify-center', className)}>
      <div className={pulseClasses} />
    </div>
  );
};

LoadingPulse.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'white']),
  className: PropTypes.string
};

// Skeleton Loading Component
export const LoadingSkeleton = ({ 
  height = 4, 
  width = 'full', 
  rounded = 'md',
  className = '',
  lines = 1,
  spacing = 2
}) => {
  const heightClasses = {
    2: 'h-2',
    3: 'h-3',
    4: 'h-4',
    6: 'h-6',
    8: 'h-8',
    12: 'h-12',
    16: 'h-16',
    20: 'h-20'
  };

  const widthClasses = {
    full: 'w-full',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '2/3': 'w-2/3',
    '1/4': 'w-1/4',
    '3/4': 'w-3/4'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const spacingClasses = {
    1: 'space-y-1',
    2: 'space-y-2',
    3: 'space-y-3',
    4: 'space-y-4'
  };

  const skeletonClasses = classNames(
    'bg-gray-200 animate-pulse',
    heightClasses[height],
    widthClasses[width],
    roundedClasses[rounded]
  );

  if (lines === 1) {
    return <div className={classNames(skeletonClasses, className)} />;
  }

  return (
    <div className={classNames(spacingClasses[spacing], className)}>
      {Array.from({ length: lines }, (_, index) => (
        <div key={index} className={skeletonClasses} />
      ))}
    </div>
  );
};

LoadingSkeleton.propTypes = {
  height: PropTypes.oneOf([2, 3, 4, 6, 8, 12, 16, 20]),
  width: PropTypes.oneOf(['full', '1/2', '1/3', '2/3', '1/4', '3/4']),
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', 'full']),
  className: PropTypes.string,
  lines: PropTypes.number,
  spacing: PropTypes.oneOf([1, 2, 3, 4])
};

// Progress Bar Component
export const LoadingProgress = ({ 
  progress = 0, 
  variant = 'primary', 
  size = 'md',
  showPercentage = false,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-600'
  };

  return (
    <div className={className}>
      <div className={classNames('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={classNames('transition-all duration-300 ease-out rounded-full', sizeClasses[size], colorClasses[variant])}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-right mt-1">
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};

LoadingProgress.propTypes = {
  progress: PropTypes.number,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showPercentage: PropTypes.bool,
  className: PropTypes.string
};

export default LoadingSpinner;