import React from 'react';
import classNames from 'classnames';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className, 
  ...props 
}) => {
  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    primary: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    success: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
    danger: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-transparent'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  const badgeClasses = classNames(
    'inline-flex items-center font-medium rounded-full',
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;