import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSignalR } from './useSignalR';
import dashboardService from '../services/dashboardService';
import { debounce } from '../utils/asyncHelpers';
import { HubConnectionState } from '@microsoft/signalr';
import { signalRManager } from '../services/signalr/signalRConnection';

/**
 * Real-time dashboard hook that uses SignalR with event handlers
 * Provides real-time updates for dashboard metrics, system health, and activity
 */
const useRealTimeDashboard = (options = {}) => {
  const {
    enableAutoRefresh = true,
    fallbackIntervalMs = 30000,
    onDashboardUpdate,
    onSystemHealthUpdate,
    onActivityUpdate,
    onError
  } = options;

  // SignalR connection
  const {
    getConnectionStatus,
    areConnectionsHealthy,
    getConnectionHealth,
    admin: adminMethods
  } = useSignalR();

  const isAdminConnected = getConnectionStatus('admin') === HubConnectionState.Connected;

  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fallbackInterval = useRef(null);
  const mounted = useRef(true);
  const dashboardEventSubscription = useRef(null);
  const setupAttemptTimestamp = useRef(0);
  const SETUP_COOLDOWN = 2000; // 2 seconds cooldown between setup attempts

  /**
   * Fetch dashboard data manually
   */
  const fetchDashboardData = useCallback(async () => {
    if (!mounted.current || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const dashboard = await dashboardService.getDashboardData();

      if (mounted.current) {
        setDashboardData(dashboard);
        setLastUpdated(new Date());
        onDashboardUpdate?.(dashboard);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      if (mounted.current) {
        setError(err.message);
        onError?.(err);
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, [onDashboardUpdate, onError, isLoading]);

  /**
   * Fetch recent activity separately
   * Only if user has Audit.ReadAll permission
   */
  const fetchRecentActivity = useCallback(async () => {
    if (!mounted.current) return;

    try {
      const activity = await dashboardService.getRecentActivity(5);

      if (mounted.current) {
        setRecentActivity(prevActivity => {
          if (JSON.stringify(prevActivity) !== JSON.stringify(activity)) {
            console.log('Recent activity updated with new data');
            onActivityUpdate?.(activity);
            return activity;
          } else {
            console.log('Recent activity unchanged, skipping update');
            return prevActivity;
          }
        });
      }
    } catch (err) {
      // Silently handle 403 errors (permission denied) for audit logs
      if (err.response?.status === 403 || err.status === 403 || err.message?.includes('403')) {
        console.log('No audit log permission - skipping recent activity');
        return;
      }
      console.error('Failed to fetch recent activity:', err);
    }
  }, [onActivityUpdate]);

  // Debounced version for activity updates
  const debouncedFetchRecentActivity = useMemo(() =>
    debounce(fetchRecentActivity, 5000),
    [fetchRecentActivity]
  );

  /**
   * Set up SignalR dashboard event listeners using the new event handler system
   */
  useEffect(() => {
    if (!isAdminConnected || !enableAutoRefresh) {
      // Clean up subscription if connection lost
      if (dashboardEventSubscription.current) {
        console.log('Connection lost, cleaning up SignalR dashboard listeners');
        dashboardEventSubscription.current();
        dashboardEventSubscription.current = null;
      }
      return;
    }

    if (dashboardEventSubscription.current) return; // already subscribed

    // Cooldown check to prevent rapid reconnection loops
    const now = Date.now();
    if (now - setupAttemptTimestamp.current < SETUP_COOLDOWN) {
      console.log('SignalR setup cooldown active, skipping setup');
      return;
    }
    setupAttemptTimestamp.current = now;

    console.log('Setting up real-time dashboard event listeners');

    // Get the dashboard event handler from the SignalR manager
    const eventHandlers = signalRManager.getEventHandlers();
    const dashboardHandler = eventHandlers.getDashboardHandler();

    // Subscribe to dashboard events
    dashboardEventSubscription.current = dashboardHandler.subscribe((eventType, data) => {
      if (!mounted.current) return;

      switch (eventType) {
        case 'dashboard-update':
          console.log('Real-time dashboard metrics received:', data);
          setDashboardData(prev => ({ ...prev, ...data }));
          setLastUpdated(new Date());
          onDashboardUpdate?.(data);
          break;

        case 'system-health-update':
          console.log('Real-time system health received:', data);
          setSystemHealth(data);
          onSystemHealthUpdate?.(data);
          break;

        case 'queue-update':
          console.log('Real-time queue update received:', data);
          setDashboardData(prev => ({
            ...prev,
            waitingVisitors: data.waitingVisitors || 0,
            processingVisitors: data.processingVisitors || 0,
            lastUpdated: new Date()
          }));
          onDashboardUpdate?.(data);
          break;

        case 'audit-log-created':
          console.log('New audit log detected via SignalR:', data);
          debouncedFetchRecentActivity();
          break;

        default:
          console.log('Unhandled dashboard event:', eventType);
          break;
      }
    });

    // Request initial system metrics (with error handling to prevent loops)
    if (adminMethods?.getSystemMetrics) {
      adminMethods.getSystemMetrics().catch(err => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Failed to get system metrics (expected if WebSocket not ready):', err.message);
        }
      });
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up SignalR dashboard listeners');
      if (dashboardEventSubscription.current) {
        dashboardEventSubscription.current();
        dashboardEventSubscription.current = null;
      }
    };
  }, [enableAutoRefresh, isAdminConnected]); // ✅ FIXED: Removed unstable dependencies

  /**
   * Setup fallback polling when SignalR is not available
   * ✅ FIXED: Simplified to prevent infinite loop
   */
  useEffect(() => {
    if (!enableAutoRefresh || !fallbackIntervalMs) {
      // Clear any existing interval
      if (fallbackInterval.current) {
        clearInterval(fallbackInterval.current);
        fallbackInterval.current = null;
      }
      return;
    }

    // Check SignalR health periodically (not on every render)
    const checkHealthAndSetupFallback = () => {
      const isSignalRHealthy = areConnectionsHealthy();

      if (!isSignalRHealthy && !fallbackInterval.current) {
        console.log('SignalR not healthy, setting up fallback polling');

        fallbackInterval.current = setInterval(() => {
          fetchDashboardData();
        }, fallbackIntervalMs);
      }

      if (isSignalRHealthy && fallbackInterval.current) {
        console.log('SignalR is healthy, stopping fallback polling');
        clearInterval(fallbackInterval.current);
        fallbackInterval.current = null;
      }
    };

    // Initial check
    checkHealthAndSetupFallback();

    // Periodic health check (every 10 seconds)
    const healthCheckInterval = setInterval(checkHealthAndSetupFallback, 10000);

    return () => {
      clearInterval(healthCheckInterval);
      if (fallbackInterval.current) {
        clearInterval(fallbackInterval.current);
        fallbackInterval.current = null;
      }
    };
  }, [enableAutoRefresh, fallbackIntervalMs]); // ✅ FIXED: Stable dependencies only

  /**
   * Initial data fetch on mount
   */
  useEffect(() => {
    const initialFetch = async () => {
      await fetchDashboardData();
      await fetchRecentActivity();
    };
    
    initialFetch();
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (dashboardEventSubscription.current) {
        dashboardEventSubscription.current();
      }
    };
  }, []);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchDashboardData();
    if (adminMethods?.getSystemMetrics) {
      adminMethods.getSystemMetrics().catch(console.error);
    }
  }, [fetchDashboardData, adminMethods]);

  /**
   * Manual refresh recent activity only
   */
  const refreshActivity = useCallback(async () => {
    await fetchRecentActivity();
  }, [fetchRecentActivity]);

  /**
   * Memoized recent activity to prevent unnecessary re-renders
   */
  const memoizedRecentActivity = useMemo(() => recentActivity, [recentActivity]);

  return {
    // Data
    dashboardData,
    systemHealth,
    recentActivity: memoizedRecentActivity,
    lastUpdated,
    
    // State
    isLoading,
    error,
    isSignalRConnected: areConnectionsHealthy(),
    connectionHealth: getConnectionHealth(),
    
    // Actions
    refresh,
    refreshActivity
  };
};

export default useRealTimeDashboard;
