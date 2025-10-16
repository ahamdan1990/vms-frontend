/**
 * Alert Component
 * Displays contextual feedback messages for typical user actions
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Alert = ({
  type = 'info',
  title,
  message,
  children,
  dismissible = false,
  onDismiss,
  className,
  icon: CustomIcon,
  actions,
  ...props
}) => {
  const getIconForType = (alertType) => {
    switch (alertType) {
      case 'success':
        return CheckCircleIcon;
      case 'warning':
        return ExclamationCircleIcon;
      case 'error':
        return XCircleIcon;
      case 'info':
      default:
        return InformationCircleIcon;
    }
  };

  const getColorsForType = (alertType) => {
    switch (alertType) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-400',
          title: 'text-green-800',
          message: 'text-green-700'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700'
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700'
        };
    }
  };

  const Icon = CustomIcon || getIconForType(type);
  const colors = getColorsForType(type);

  const alertClasses = classNames(
    'rounded-lg border p-4',
    colors.container,
    className
  );

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className={alertClasses} role="alert" {...props}>
      <div className="flex">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={classNames('h-5 w-5', colors.icon)} />
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={classNames('text-sm font-medium', colors.title)}>
              {title}
            </h3>
          )}
          
          {message && (
            <div className={classNames(
              'text-sm',
              colors.message,
              title ? 'mt-2' : ''
            )}>
              {message}
            </div>
          )}

          {children && (
            <div className={classNames(
              'text-sm',
              colors.message,
              (title || message) ? 'mt-2' : ''
            )}>
              {children}
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="mt-4">
              <div className="flex space-x-3">
                {actions}
              </div>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={classNames(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  {
                    'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600': type === 'success',
                    'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600': type === 'warning',
                    'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600': type === 'error',
                    'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600': type === 'info'
                  }
                )}
                onClick={handleDismiss}
                aria-label="Dismiss alert"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
  title: PropTypes.string,
  message: PropTypes.string,
  children: PropTypes.node,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.elementType,
  actions: PropTypes.node
};

export default Alert;
