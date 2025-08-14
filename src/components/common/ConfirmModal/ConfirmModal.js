// src/components/common/ConfirmModal/ConfirmModal.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import Button from '../Button/Button';

const ConfirmModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  loading = false,
  disabled = false,
  size = 'md' // 'sm', 'md', 'lg'
}) => {
  const getIcon = () => {
    const iconClass = 'w-6 h-6';
    switch (type) {
      case 'danger':
        return <XCircleIcon className={`${iconClass} text-red-600`} />;
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-600`} />;
      case 'info':
        return <InformationCircleIcon className={`${iconClass} text-blue-600`} />;
      case 'warning':
      default:
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-600`} />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-100';
      case 'success':
        return 'bg-green-100';
      case 'info':
        return 'bg-blue-100';
      case 'warning':
      default:
        return 'bg-yellow-100';
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'danger';
      case 'success':
        return 'primary';
      case 'info':
        return 'primary';
      case 'warning':
      default:
        return 'warning';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-2xl';
      case 'md':
      default:
        return 'max-w-lg';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
    } else if (e.key === 'Enter' && !loading && !disabled) {
      onConfirm?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`
                relative w-full ${getSizeClasses()}
                bg-white rounded-lg shadow-xl
                transform transition-all
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Content */}
              <div className="p-6">
                <div className="flex items-start">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 mx-auto flex items-center justify-center
                    h-12 w-12 rounded-full ${getIconBgColor()}
                    sm:mx-0 sm:h-10 sm:w-10
                  `}>
                    {getIcon()}
                  </div>

                  {/* Text Content */}
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <Button
                    onClick={onConfirm}
                    variant={getConfirmButtonVariant()}
                    loading={loading}
                    disabled={disabled}
                    className="w-full sm:w-auto sm:ml-3"
                  >
                    {confirmText}
                  </Button>
                  
                  <Button
                    onClick={onClose}
                    variant="secondary"
                    disabled={loading}
                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                  >
                    {cancelText}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;