// src/components/notifications/ToastContainer.js - UNIFIED TOAST CONTAINER
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import Toast from './Toast';

/**
 * Toast Container Component
 * Renders all active toast notifications with proper positioning
 */
const ToastContainer = ({ 
  position = 'top-right',
  maxToasts = 5,
  className = ''
}) => {
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
    >
      <div className="space-y-2 pointer-events-auto">
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