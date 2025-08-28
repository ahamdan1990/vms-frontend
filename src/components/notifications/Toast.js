// src/components/notifications/Toast.js - UNIFIED TOAST COMPONENT
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { removeToast } from '../../store/slices/notificationSlice';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon,
  UserPlusIcon,
  UserMinusIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

/**
 * Toast Notification Component
 * Displays individual toast with auto-dismiss and progress bar
 */
const Toast = ({ toast, index = 0, position = 'top-right' }) => {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(100);
  
  const { id, type, title, message, duration, persistent, actions } = toast;

  // Auto-dismiss timer and progress bar
  useEffect(() => {
    if (persistent || duration <= 0) return;

    const startTime = Date.now();
    
    const timer = setTimeout(() => {
      dispatch(removeToast(id));
    }, duration);

    // Update progress bar
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const newProgress = (remaining / duration) * 100;
      setProgress(newProgress);
      
      if (remaining <= 0) {
        clearInterval(progressInterval);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [dispatch, id, duration, persistent]);

  // Handle manual close
  const handleClose = () => {
    dispatch(removeToast(id));
  };

  // Handle action click
  const handleActionClick = (action) => {
    if (action.dismissOnClick !== false) {
      handleClose();
    }
    
    if (action.onClick) {
      action.onClick();
    }
  };

  // Get type configuration
  const getTypeConfig = () => {
    const configs = {
      success: {
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-500',
        titleColor: 'text-green-800',
        messageColor: 'text-green-700',
        progressColor: 'bg-green-500'
      },
      error: {
        icon: XCircleIcon,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500',
        titleColor: 'text-red-800',
        messageColor: 'text-red-700',
        progressColor: 'bg-red-500'
      },
      warning: {
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-500',
        titleColor: 'text-yellow-800',
        messageColor: 'text-yellow-700',
        progressColor: 'bg-yellow-500'
      },
      info: {
        icon: InformationCircleIcon,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-800',
        messageColor: 'text-blue-700',
        progressColor: 'bg-blue-500'
      },      visitor_checkin: {
        icon: UserPlusIcon,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-500',
        titleColor: 'text-green-800',
        messageColor: 'text-green-700',
        progressColor: 'bg-green-500'
      },
      visitor_checkout: {
        icon: UserMinusIcon,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-800',
        messageColor: 'text-blue-700',
        progressColor: 'bg-blue-500'
      },
      visitor_overdue: {
        icon: ClockIcon,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        iconColor: 'text-orange-500',
        titleColor: 'text-orange-800',
        messageColor: 'text-orange-700',
        progressColor: 'bg-orange-500'
      },
      loading: {
        icon: () => (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ),
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        iconColor: 'text-gray-500',
        titleColor: 'text-gray-800',
        messageColor: 'text-gray-700',
        progressColor: 'bg-gray-500'
      }
    };

    return configs[type] || configs.info;
  };

  // Get animation variants based on position
  const getAnimationVariants = () => {
    const isTop = position.includes('top');
    const isRight = position.includes('right');
    const isCenter = position.includes('center');
    
    let x = 0;
    let y = 0;
    
    if (isCenter) {
      y = isTop ? -50 : 50;
    } else {
      x = isRight ? 50 : -50;
      y = isTop ? -20 : 20;
    }

    return {
      initial: { opacity: 0, x, y, scale: 0.8 },
      animate: { opacity: 1, x: 0, y: 0, scale: 1 },
      exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
    };
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;
  const variants = getAnimationVariants();
  return (
    <motion.div
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: 1000 - index }}
      className={`
        max-w-sm w-full border rounded-lg shadow-lg pointer-events-auto overflow-hidden
        ${config.bgColor} ${config.borderColor}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          
          {/* Content */}
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className={`text-sm font-medium ${config.titleColor}`}>
                {title}
              </p>
            )}
            {message && (
              <p className={`text-sm mt-1 ${config.messageColor}`}>
                {message}
              </p>
            )}
            
            {/* Actions */}
            {actions && actions.length > 0 && (
              <div className="mt-3 flex space-x-3">
                {actions.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    type="button"
                    className={`text-sm font-medium underline hover:no-underline focus:outline-none ${config.titleColor}`}
                    onClick={() => handleActionClick(action)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Close Button */}
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className={`rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      {!persistent && duration > 0 && (
        <div className="h-1 bg-gray-200">
          <div
            className={`h-full transition-all duration-75 ${config.progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Toast;