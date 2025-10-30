// src/components/notifications/ToastContainer.js - UNIFIED TOAST CONTAINER
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { clearToasts } from '../../store/slices/notificationSlice';
import Toast from './Toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Toast Container Component
 * Renders all active toast notifications with proper positioning
 */
const ToastContainer = ({
  position = 'top-right',
  maxToasts = 5,
  className = ''
}) => {
  const dispatch = useDispatch();
  const toasts = useSelector(state => state.notifications.toasts);

  // Get position classes
  const getPositionClasses = (pos) => {
    const baseClasses = 'fixed z-50 pointer-events-none';
    
    switch (pos) {
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  // Don't render if no toasts
  if (!toasts || toasts.length === 0) {
    return null;
  }

  // Limit toasts to maxToasts
  const visibleToasts = toasts.slice(0, maxToasts);

  return (
    <div
      className={`${getPositionClasses(position)} ${className}`}
      aria-live="assertive"
      role="region"
      aria-label="Notifications"
      style={
        {width:'20rem'}
      }
    >
      <div className="flex flex-col gap-3 pointer-events-auto">
        {/* Clear All Toasts Button */}
        {toasts.length > 1 && (
          <button
            onClick={() => dispatch(clearToasts())}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg transition-colors duration-200"
            title="Clear all toasts"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Clear All ({toasts.length})</span>
          </button>
        )}

        <AnimatePresence mode="sync">
          {visibleToasts.map((toast, index) => (
            <Toast
              key={toast.id}
              toast={toast}
              index={index}
              position={position}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ToastContainer;