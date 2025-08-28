// src/hooks/useSignalR.js
import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signalRManager } from '../services/signalr/signalRConnection';
import { HubConnectionState } from '@microsoft/signalr';
import { useToast } from './useNotifications';

/**
 * SignalR Hook for managing real-time connections
 * Provides connection status, methods to invoke hub methods, and auto-initialization
 */
export const useSignalR = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { error: errorToast } = useToast();
  const initializationAttempted = useRef(false);
  const initializationPromise = useRef(null);

  /**
   * Initialize SignalR connections when user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated && user && !initializationAttempted.current) {
      initializationAttempted.current = true;
      
      // Create initialization promise to prevent multiple attempts
      initializationPromise.current = signalRManager
        .initializeConnections(user)
        .catch(error => {
          console.error('SignalR initialization failed:', error);
          errorToast(
            'Connection Error',
            'Failed to establish real-time connection. Some features may be limited.',
            { persistent: true }
          );
        });
    }
  }, [isAuthenticated, user, errorToast]);

  /**
   * Cleanup connections when user logs out
   */
  useEffect(() => {
    if (!isAuthenticated && initializationAttempted.current) {
      initializationAttempted.current = false;
      initializationPromise.current = null;
      signalRManager.disconnectAll();
    }
  }, [isAuthenticated]);

  /**
   * Get connection status for a specific hub
   */
  const getConnectionStatus = useCallback((hubName) => {
    return signalRManager.getConnectionStatus(hubName);
  }, []);

  /**
   * Check if all connections are healthy
   */
  const areConnectionsHealthy = useCallback(() => {
    return signalRManager.areConnectionsHealthy();
  }, []);

  /**
   * Invoke a method on a specific hub
   */
  const invokeHubMethod = useCallback(async (hubName, methodName, ...args) => {
    try {
      // Wait for initialization if it's in progress
      if (initializationPromise.current) {
        await initializationPromise.current;
      }

      return await signalRManager.invokeHubMethod(hubName, methodName, ...args);
    } catch (error) {
      console.error(`Failed to invoke ${methodName} on ${hubName}:`, error);
      errorToast(
        'Connection Error',
        `Failed to perform action: ${error.message}`,
        { duration: 5000 }
      );
      throw error;
    }
  }, [errorToast]);

  /**
   * Operator-specific methods
   */
  const operatorMethods = {
    joinAsOperator: useCallback((locationId = null) => 
      invokeHubMethod('operator', 'JoinAsOperator', locationId), [invokeHubMethod]),
    
    updateStatus: useCallback((status) => 
      invokeHubMethod('operator', 'UpdateStatus', status), [invokeHubMethod]),
    
    acknowledgeAlert: useCallback((alertId) => 
      invokeHubMethod('operator', 'AcknowledgeAlert', alertId), [invokeHubMethod]),
    
    getVisitorQueue: useCallback(() => 
      invokeHubMethod('operator', 'GetVisitorQueue'), [invokeHubMethod])
  };

  /**
   * Host-specific methods
   */
  const hostMethods = {
    acknowledgeNotification: useCallback((notificationId) => 
      invokeHubMethod('host', 'AcknowledgeNotification', notificationId), [invokeHubMethod]),
    
    getTodaysVisitors: useCallback(() => 
      invokeHubMethod('host', 'GetTodaysVisitors'), [invokeHubMethod]),
    
    getNotificationHistory: useCallback((days = 7) => 
      invokeHubMethod('host', 'GetNotificationHistory', days), [invokeHubMethod]),
    
    updateAvailability: useCallback((isAvailable, reason = null) => 
      invokeHubMethod('host', 'UpdateAvailability', isAvailable, reason), [invokeHubMethod])
  };

  /**
   * Security-specific methods
   */
  const securityMethods = {
    acknowledgeSecurityAlert: useCallback((alertId, response = null) => 
      invokeHubMethod('security', 'AcknowledgeSecurityAlert', alertId, response), [invokeHubMethod]),
    
    getSecurityStatus: useCallback(() => 
      invokeHubMethod('security', 'GetSecurityStatus'), [invokeHubMethod]),
    
    initiateEmergencyProcedure: useCallback((procedureType, reason) => 
      invokeHubMethod('security', 'InitiateEmergencyProcedure', procedureType, reason), [invokeHubMethod]),
    
    getEmergencyRoster: useCallback(() => 
      invokeHubMethod('security', 'GetEmergencyRoster'), [invokeHubMethod])
  };

  /**
   * Admin-specific methods
   */
  const adminMethods = {
    getSystemHealth: useCallback(() => 
      invokeHubMethod('admin', 'GetSystemHealth'), [invokeHubMethod]),
    
    bulkApproveInvitations: useCallback((invitationIds, note = null) => 
      invokeHubMethod('admin', 'BulkApproveInvitations', invitationIds, note), [invokeHubMethod]),
    
    broadcastMaintenanceNotification: useCallback((message, scheduledTime = null) => 
      invokeHubMethod('admin', 'BroadcastMaintenanceNotification', message, scheduledTime), [invokeHubMethod]),
    
    getSystemMetrics: useCallback(() => 
      invokeHubMethod('admin', 'GetSystemMetrics'), [invokeHubMethod])
  };

  return {
    // Connection status
    getConnectionStatus,
    areConnectionsHealthy,
    isConnected: areConnectionsHealthy(),
    
    // Generic method invoker
    invokeHubMethod,
    
    // Hub-specific methods
    operator: operatorMethods,
    host: hostMethods,
    security: securityMethods,
    admin: adminMethods
  };
};

/**
 * Hook for operator-specific functionality
 */
export const useOperatorSignalR = () => {
  const { operator, getConnectionStatus } = useSignalR();
  const isConnected = getConnectionStatus('operator') === HubConnectionState.Connected;

  return {
    isConnected,
    ...operator
  };
};

/**
 * Hook for host-specific functionality
 */
export const useHostSignalR = () => {
  const { host, getConnectionStatus } = useSignalR();
  const isConnected = getConnectionStatus('host') === HubConnectionState.Connected;

  return {
    isConnected,
    ...host
  };
};

/**
 * Hook for security-specific functionality
 */
export const useSecuritySignalR = () => {
  const { security, getConnectionStatus } = useSignalR();
  const isConnected = getConnectionStatus('security') === HubConnectionState.Connected;

  return {
    isConnected,
    ...security
  };
};

/**
 * Hook for admin-specific functionality
 */
export const useAdminSignalR = () => {
  const { admin, getConnectionStatus } = useSignalR();
  const isConnected = getConnectionStatus('admin') === HubConnectionState.Connected;

  return {
    isConnected,
    ...admin
  };
};

export default useSignalR;
