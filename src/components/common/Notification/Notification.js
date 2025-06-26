import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { removeToast } from '../../../store/slices/notificationSlice';

const Notification = () => {
  const dispatch = useDispatch();
  const toasts = useSelector(state => state.notifications.toasts);

  return createPortal(
    <div className="fixed top-4 right-4 z-toast space-y-2">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>,
    document.body
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const { id, type, title, message, duration, persistent, actions } = toast;

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        onRemove();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [persistent, duration, onRemove]);

  const toastClasses = classNames(
    'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 animate-slide-down',
    {
      'border-l-4 border-success-500': type === 'success',
      'border-l-4 border-error-500': type === 'error',
      'border-l-4 border-warning-500': type === 'warning',
      'border-l-4 border-info-500': type === 'info'
    }
  );

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const iconColorMap = {
    success: 'text-success-500',
    error: 'text-error-500',
    warning: 'text-warning-500',
    info: 'text-info-500'
  };

  return (
    <div className={toastClasses}>
      <div className="p-4">
        <div className="flex items-start">
          <div className={classNames('flex-shrink-0', iconColorMap[type])}>
            <span className="text-lg">{iconMap[type]}</span>
          </div>
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className="text-sm font-medium text-gray-900">
                {title}
              </p>
            )}
            {message && (
              <p className={classNames(
                'text-sm text-gray-500',
                title ? 'mt-1' : ''
              )}>
                {message}
              </p>
            )}
            {actions && actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.handler}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onRemove}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="sr-only">Close</span>
              <span className="h-5 w-5">✕</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
