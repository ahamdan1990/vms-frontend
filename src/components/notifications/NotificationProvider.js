// src/components/notifications/NotificationProvider.js - UNIFIED NOTIFICATION PROVIDER
import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeNotifications } from '../../store/slices/notificationSlice';
import ToastContainer from './ToastContainer';
import useNotifications from '../../hooks/useNotifications';

// Context for accessing notification system
const NotificationContext = createContext();

/**
 * Hook to access notification context
 */
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

/**
 * Unified Notification Provider
 * - Initializes the notification system
 * - Renders toast container
 * - Provides notification context
 */
const NotificationProvider = ({ 
  children,
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 4000,
  enableDesktop = true,
  enableSound = true 
}) => {
  const dispatch = useDispatch();
  const notifications = useNotifications();
  
  // Initialize notification system
  useEffect(() => {
    dispatch(initializeNotifications());
  }, [dispatch]);

  // Update settings based on props
  useEffect(() => {
    if (notifications.settings.position !== position || 
        notifications.settings.maxToasts !== maxToasts ||
        notifications.settings.defaultDuration !== defaultDuration ||
        notifications.settings.desktop !== enableDesktop ||
        notifications.settings.sound !== enableSound) {
      
      // Update settings would be dispatched here if we had the action
      console.log('Settings updated:', { position, maxToasts, defaultDuration, enableDesktop, enableSound });
    }
  }, [position, maxToasts, defaultDuration, enableDesktop, enableSound, notifications.settings]);

  const contextValue = {
    ...notifications,
    // Add any additional context-specific functionality here
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer 
        position={position}
        maxToasts={maxToasts}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;