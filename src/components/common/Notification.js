// src/components/common/Notification/Notification.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { removeToast } from '../../../store/slices/notificationSlice';
import classNames from 'classnames';

/**
 * Professional Notification/Toast Component
 * Displays toast notifications with animations and auto-dismiss
 */
const Toast = ({ toast, onRemove }) => {
  const { id, type, title, message, duration, persistent, actions } = toast;

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, persistent, onRemove]);

  const typeConfig = {
    success: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-500',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    },
    info: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    },
    loading: {
      icon: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ),
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-500',
      titleColor: 'text-gray-800',
      messageColor: 'text-gray-700'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  const toastClasses = classNames(
    'max-w-sm w-full border rounded-lg shadow-lg pointer-events-auto overflow-hidden',
    config.bgColor,
    config.borderColor
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={toastClasses}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={classNames('flex-shrink-0 mt-0.5', config.iconColor)}>
            {config.icon}
          </div>
          
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className={classNames('text-sm font-medium', config.titleColor)}>
                {title}
              </p>
            )}
            {message && (
              <p className={classNames('text-sm mt-1', config.messageColor)}>
                {message}
              </p>
            )}
            
            {actions && actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    type="button"
                    className={classNames(
                      'text-sm font-medium underline hover:no-underline focus:outline-none',
                      config.titleColor
                    )}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className={classNames(
                'rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.iconColor,
                'hover:opacity-75'
              )}
              onClick={() => onRemove(id)}
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar for timed toasts */}
      {!persistent && duration > 0 && (
        <div className="h-1 bg-gray-200">
          <motion.div
            className={classNames('h-full', {
              'bg-green-500': type === 'success',
              'bg-red-500': type === 'error',
              'bg-yellow-500': type === 'warning',
              'bg-blue-500': type === 'info',
              'bg-gray-500': type === 'loading'
            })}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
};

/**
 * Main Notification Container Component
 * Manages and displays all active toast notifications
 */
const Notification = () => {
  const dispatch = useDispatch();
  const toasts = useSelector(state => state.notifications.toasts);

  const handleRemoveToast = (toastId) => {
    dispatch(removeToast(toastId));
  };

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onRemove={handleRemoveToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Toast helper functions for easy usage
export const toast = {
  success: (title, message, options = {}) => ({
    type: 'success',
    title,
    message,
    duration: 4000,
    ...options
  }),
  
  error: (title, message, options = {}) => ({
    type: 'error',
    title,
    message,
    duration: 0, // Persistent by default for errors
    persistent: true,
    ...options
  }),
  
  warning: (title, message, options = {}) => ({
    type: 'warning',
    title,
    message,
    duration: 6000,
    ...options
  }),
  
  info: (title, message, options = {}) => ({
    type: 'info',
    title,
    message,
    duration: 4000,
    ...options
  }),
  
  loading: (title, message, options = {}) => ({
    type: 'loading',
    title,
    message,
    persistent: true,
    ...options
  })
};

// Higher-order component for toast notifications
export const withToast = (Component) => {
  return function WrappedComponent(props) {
    return (
      <>
        <Component {...props} />
        <Notification />
      </>
    );
  };
};

export default Notification;