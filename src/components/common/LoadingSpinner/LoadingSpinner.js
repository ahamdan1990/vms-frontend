import React from 'react';
import classNames from 'classnames';

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
  overlay = false
}) => {
  const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinnerColors = {
    primary: 'border-primary-500',
    secondary: 'border-gray-500',
    white: 'border-white'
  };

  const spinnerClasses = classNames(
    'loading-spinner',
    'border-2 border-gray-200 border-t-2 rounded-full animate-spin',
    spinnerSizes[size],
    spinnerColors[color],
    className
  );

  const content = (
    <div className="flex items-center justify-center">
      <div className={spinnerClasses} />
      {text && (
        <span className="ml-3 text-sm text-gray-600">{text}</span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;