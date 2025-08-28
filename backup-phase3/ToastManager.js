// src/components/notifications/ToastManager.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import ToastNotification from './ToastNotification';

// Toast Context
const ToastContext = createContext();

/**
 * Toast Manager Hook
 * Provides methods to show different types of toast notifications
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toast Provider Component
 * Manages multiple toast notifications with stacking and positioning
 */
export const ToastProvider = ({ children, maxToasts = 5, position = 'top-right' }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      ...toast,
      position
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      // Limit the number of toasts
      return updated.slice(0, maxToasts);
    });

    return id;
  }, [maxToasts, position]);

  // Remove a toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      ...options
    });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      persistent: true, // Errors should be persistent by default
      ...options
    });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      duration: 7000, // Warnings should last longer
      ...options
    });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      ...options
    });
  }, [addToast]);

  // Advanced toast methods
  const promise = useCallback((promise, options = {}) => {
    const {
      loading = 'Loading...',
      success: successMessage = 'Success!',
      error: errorMessage = 'Something went wrong'
    } = options;

    // Show loading toast
    const loadingToastId = addToast({
      type: 'info',
      message: loading,
      persistent: true,
      ...options.loading
    });

    promise
      .then((result) => {
        // Remove loading toast
        removeToast(loadingToastId);
        
        // Show success toast
        addToast({
          type: 'success',
          message: typeof successMessage === 'function' ? successMessage(result) : successMessage,
          ...options.success
        });
        
        return result;
      })
      .catch((err) => {
        // Remove loading toast
        removeToast(loadingToastId);
        
        // Show error toast
        addToast({
          type: 'error',
          message: typeof errorMessage === 'function' ? errorMessage(err) : errorMessage,
          persistent: true,
          ...options.error
        });
        
        throw err;
      });

    return promise;
  }, [addToast, removeToast]);

  // Visitor-specific notifications
  const visitorCheckedIn = useCallback((visitorName, host) => {
    return success(`${visitorName} has checked in`, {
      title: 'Visitor Check-in',
      actions: [
        {
          label: 'View Profile',
          onClick: () => console.log('View visitor profile'),
          dismissOnClick: true
        },
        {
          label: 'Send Welcome',
          onClick: () => console.log('Send welcome message'),
          dismissOnClick: true
        }
      ]
    });
  }, [success]);

  const visitorCheckedOut = useCallback((visitorName) => {
    return info(`${visitorName} has checked out`, {
      title: 'Visitor Check-out'
    });
  }, [info]);

  const visitorOverdue = useCallback((visitorName, minutesLate) => {
    return warning(`${visitorName} is ${minutesLate} minutes overdue`, {
      title: 'Overdue Visitor',
      persistent: true,
      actions: [
        {
          label: 'Call Visitor',
          onClick: () => console.log('Call visitor'),
          dismissOnClick: false
        },
        {
          label: 'Cancel Meeting',
          onClick: () => console.log('Cancel meeting'),
          dismissOnClick: true
        }
      ]
    });
  }, [warning]);

  const securityAlert = useCallback((message, severity = 'high') => {
    return (severity === 'high' ? error : warning)(message, {
      title: 'Security Alert',
      persistent: true,
      actions: [
        {
          label: 'View Details',
          onClick: () => console.log('View security alert details'),
          dismissOnClick: false
        },
        {
          label: 'Contact Security',
          onClick: () => console.log('Contact security team'),
          dismissOnClick: false
        }
      ]
    });
  }, [error, warning]);

  const invitationSent = useCallback((recipientEmail) => {
    return success(`Invitation sent to ${recipientEmail}`, {
      title: 'Invitation Sent'
    });
  }, [success]);

  const documentScanned = useCallback((documentCount) => {
    return success(`${documentCount} document${documentCount > 1 ? 's' : ''} scanned successfully`, {
      title: 'Document Scan Complete'
    });
  }, [success]);

  const excelProcessed = useCallback((stats) => {
    const { visitors, invitations } = stats;
    return success(`Processed ${visitors} visitors and ${invitations} invitations`, {
      title: 'Excel Import Complete',
      duration: 8000,
      actions: [
        {
          label: 'View Results',
          onClick: () => console.log('View import results'),
          dismissOnClick: true
        }
      ]
    });
  }, [success]);

  // Get position-specific container styles
  const getContainerStyles = () => {
    const baseStyles = 'fixed z-50 pointer-events-none';
    
    switch (position) {
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'top-center':
        return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'bottom-center':
        return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      default:
        return `${baseStyles} top-4 right-4`;
    }
  };

  const contextValue = {
    // Core methods
    addToast,
    removeToast,
    clearAllToasts,
    
    // Type-specific methods
    success,
    error,
    warning,
    info,
    promise,
    
    // Domain-specific methods
    visitorCheckedIn,
    visitorCheckedOut,
    visitorOverdue,
    securityAlert,
    invitationSent,
    documentScanned,
    excelProcessed,
    
    // State
    toasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div className={getContainerStyles()}>
        <div className="space-y-2 pointer-events-auto">
          <AnimatePresence>
            {toasts.map((toast, index) => (
              <div
                key={toast.id}
                style={{
                  zIndex: 1000 - index // Ensure proper stacking
                }}
              >
                <ToastNotification
                  {...toast}
                  onClose={() => removeToast(toast.id)}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Higher-order component to wrap components with toast functionality
 */
export const withToast = (Component) => {
  return (props) => {
    const toast = useToast();
    return <Component {...props} toast={toast} />;
  };
};

export default ToastProvider;
