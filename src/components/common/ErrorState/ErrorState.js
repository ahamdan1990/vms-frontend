// src/components/common/ErrorState/ErrorState.js
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { TEXT_STYLES } from '../../../constants/typography';
import Button from '../Button/Button';
import Card from '../Card/Card';
import { 
  ExclamationTriangleIcon,
  NoSymbolIcon,
  WifiIcon,
  ArrowPathIcon,
  HomeIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Professional Error State Components
 * Handles different error scenarios with appropriate messaging and actions
 */

// Error Icon Component
const ErrorIcon = ({ type, className = '' }) => {
  const iconClass = classNames('w-16 h-16 mx-auto', className);
  
  switch (type) {
    case 'network':
      return <WifiIcon className={classNames(iconClass, 'text-red-400')} />;
    case 'forbidden':
      return <NoSymbolIcon className={classNames(iconClass, 'text-red-400')} />;
    case 'notfound':
      return <QuestionMarkCircleIcon className={classNames(iconClass, 'text-gray-400')} />;
    case 'server':
      return <ExclamationTriangleIcon className={classNames(iconClass, 'text-yellow-400')} />;
    default:
      return <ExclamationTriangleIcon className={classNames(iconClass, 'text-red-400')} />;
  }
};

// Generic Error State Component
export const ErrorState = ({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  type = 'general',
  showRetry = true,
  showHome = false,
  onRetry,
  onHome,
  className = '',
  actions = []
}) => {
  const defaultActions = [
    ...(showRetry ? [{
      label: 'Try Again',
      onClick: onRetry,
      variant: 'primary',
      icon: <ArrowPathIcon className="w-4 h-4" />
    }] : []),
    ...(showHome ? [{
      label: 'Go Home',
      onClick: onHome,
      variant: 'outline',
      icon: <HomeIcon className="w-4 h-4" />
    }] : []),
    ...actions
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={classNames('text-center py-12', className)}
    >
      <ErrorIcon type={type} />
      
      <h3 className={`${TEXT_STYLES.cardTitle} mt-6 text-gray-900`}>
        {title}
      </h3>
      
      <p className={`${TEXT_STYLES.bodyText} mt-2 max-w-md mx-auto`}>
        {message}
      </p>

      {defaultActions.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {defaultActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
              icon={action.icon}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Network Error Component
export const NetworkError = ({ onRetry, className = '' }) => {
  return (
    <ErrorState
      type="network"
      title="Connection Problem"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      showRetry={true}
      className={className}
    />
  );
};

// 403 Forbidden Error
export const ForbiddenError = ({ onHome, className = '' }) => {
  return (
    <ErrorState
      type="forbidden"
      title="Access Denied"
      message="You don't have permission to access this resource. Contact your administrator if you believe this is an error."
      onHome={onHome || (() => window.location.href = '/')}
      showHome={true}
      showRetry={false}
      className={className}
    />
  );
};

// 404 Not Found Error
export const NotFoundError = ({ onHome, className = '' }) => {
  return (
    <ErrorState
      type="notfound"
      title="Page Not Found"
      message="The page you're looking for doesn't exist. It may have been moved or deleted."
      onHome={onHome || (() => window.location.href = '/')}
      showHome={true}
      showRetry={false}
      className={className}
    />
  );
};

// Server Error (5xx)
export const ServerError = ({ onRetry, className = '' }) => {
  return (
    <ErrorState
      type="server"
      title="Server Error"
      message="The server is experiencing issues. Our team has been notified and is working on a fix."
      onRetry={onRetry}
      showRetry={true}
      className={className}
    />
  );
};

// Inline Error Component (for forms, fields, etc.)
export const InlineError = ({ 
  message, 
  onRetry,
  size = 'sm',
  className = '' 
}) => {
  return (
    <div className={classNames('flex items-center space-x-2 text-red-600', className)}>
      <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
      <span className={`${TEXT_STYLES.body[size]} flex-1`}>
        {message}
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-600 hover:text-red-800 underline text-sm"
        >
          Retry
        </button>
      )}
    </div>
  );
};

// Card Error Component
export const CardError = ({ 
  title = "Error Loading Data",
  message = "Unable to load the requested information.",
  onRetry,
  className = ''
}) => {
  return (
    <Card className={classNames('text-center py-8', className)}>
      <ErrorIcon type="general" className="w-12 h-12 text-red-400" />
      
      <h4 className={`${TEXT_STYLES.cardTitle} mt-4 text-gray-900`}>
        {title}
      </h4>
      
      <p className={`${TEXT_STYLES.body.sm} mt-2 text-gray-600`}>
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4"
          icon={<ArrowPathIcon className="w-4 h-4" />}
        >
          Try Again
        </Button>
      )}
    </Card>
  );
};

// Empty State Component (when no errors, but no data)
export const EmptyState = ({ 
  title = "No Data Available",
  message = "There's nothing to display here yet.",
  icon = null,
  actions = [],
  className = ''
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={classNames('text-center py-12', className)}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        {icon || (
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      
      <h3 className={`${TEXT_STYLES.cardTitle} text-gray-900`}>
        {title}
      </h3>
      
      <p className={`${TEXT_STYLES.bodyText} mt-2 max-w-md mx-auto`}>
        {message}
      </p>

      {actions.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              icon={action.icon}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Form Validation Error Summary
export const ValidationErrorSummary = ({ errors = [], className = '' }) => {
  if (!errors.length) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={classNames(
        'bg-red-50 border border-red-200 rounded-lg p-4 mb-6',
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className={`${TEXT_STYLES.body.md} font-medium text-red-800`}>
            Please correct the following errors:
          </h4>
          <ul className="mt-2 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className={`${TEXT_STYLES.body.sm} text-red-700`}>
                • {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

// Error Boundary Fallback
export const ErrorBoundaryFallback = ({ 
  error, 
  resetError, 
  className = '' 
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className={classNames('min-h-screen flex items-center justify-center bg-gray-50', className)}>
      <Card className="max-w-md mx-4 text-center">
        <ErrorIcon type="general" className="text-red-400" />
        
        <h1 className={`${TEXT_STYLES.cardTitle} mt-6 text-gray-900`}>
          Application Error
        </h1>
        
        <p className={`${TEXT_STYLES.bodyText} mt-2`}>
          Something unexpected happened. We've been notified and are looking into it.
        </p>

        {isDevelopment && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto text-red-600">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={resetError}
            icon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Try Again
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            icon={<HomeIcon className="w-4 h-4" />}
          >
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Main Error State Component with type detection
const ErrorStateMain = ({ 
  type = 'general',
  error,
  onRetry,
  onHome,
  className = '',
  ...props 
}) => {
  // Auto-detect error type from error object
  if (error) {
    if (error.status === 404 || error.message?.includes('Not Found')) {
      return <NotFoundError onHome={onHome} className={className} {...props} />;
    }
    if (error.status === 403 || error.message?.includes('Forbidden')) {
      return <ForbiddenError onHome={onHome} className={className} {...props} />;
    }
    if (error.status >= 500 || error.message?.includes('Server Error')) {
      return <ServerError onRetry={onRetry} className={className} {...props} />;
    }
    if (error.name === 'NetworkError' || error.message?.includes('Network')) {
      return <NetworkError onRetry={onRetry} className={className} {...props} />;
    }
  }

  // Fallback to type-specific components
  switch (type) {
    case 'network':
      return <NetworkError onRetry={onRetry} className={className} {...props} />;
    case 'forbidden':
      return <ForbiddenError onHome={onHome} className={className} {...props} />;
    case 'notfound':
      return <NotFoundError onHome={onHome} className={className} {...props} />;
    case 'server':
      return <ServerError onRetry={onRetry} className={className} {...props} />;
    case 'empty':
      return <EmptyState className={className} {...props} />;
    case 'card':
      return <CardError onRetry={onRetry} className={className} {...props} />;
    case 'inline':
      return <InlineError onRetry={onRetry} className={className} {...props} />;
    default:
      return <ErrorState onRetry={onRetry} onHome={onHome} className={className} {...props} />;
  }
};

// PropTypes
ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.oneOf(['general', 'network', 'forbidden', 'notfound', 'server']),
  showRetry: PropTypes.bool,
  showHome: PropTypes.bool,
  onRetry: PropTypes.func,
  onHome: PropTypes.func,
  className: PropTypes.string,
  actions: PropTypes.array
};

EmptyState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  icon: PropTypes.node,
  actions: PropTypes.array,
  className: PropTypes.string
};

export default ErrorStateMain;