import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSignalR } from './useSignalR';
import dashboardService from '../services/dashboardService';
import { debounce } from '../utils/asyncHelpers';

/**
 * Real-time dashboard hook that uses SignalR instead of setInterval polling
 * Provides real-time updates for dashboard metrics, system health, and activity
 */
const useRealTimeDashboard = (options = {}) => {
  const {
    enableAutoRefresh = true,
    fallbackIntervalMs = 30000, // Fallback polling interval if SignalR fails
    onDashboardUpdate,
    onSystemHealthUpdate,
    onActivityUpdate,
    onError
  } = options;

  // SignalR connection
  const { 
    getConnectionStatus, 
    areConnectionsHealthy,
    adminMethods 
  } = useSignalR();

  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fallbackInterval = useRef(null);
  // Refs for cleanup and preventing multiple calls
  const mounted = useRef(true);
  const signalRListeners = useRef(new Set());

  /**
   * Fetch dashboard data manually (without recent activity)
   */
  const fetchDashboardData = useCallback(async () => {
    if (!mounted.current || isLoading) return; // Prevent multiple concurrent calls

    setIsLoading(true);
    setError(null);

    try {
      const dashboard = await dashboardService.getDashboardData();

      if (mounted.current) {
        setDashboardData(dashboard);
        setLastUpdated(new Date());

        // Notify parent components
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
   * Fetch recent activity separately (only when needed)
   */
  const fetchRecentActivity = useCallback(async () => {
    if (!mounted.current) return;

    try {
      const activity = await dashboardService.getRecentActivity(5);
      
      if (mounted.current) {
        // Only update if activity data has actually changed (prevent unnecessary re-renders)
        setRecentActivity(prevActivity => {
          // Compare the activities to see if they're different
          if (JSON.stringify(prevActivity) !== JSON.stringify(activity)) {
            console.log('📝 Recent activity updated with new data');
            onActivityUpdate?.(activity);
            return activity;
          } else {
            console.log('📝 Recent activity unchanged, skipping update');
            return prevActivity; // Return previous state to prevent re-render
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch recent activity:', err);
      // Don't set main error state for activity failures
    }
  }, [onActivityUpdate]);

  // Debounced version to prevent rapid successive calls
  const debouncedFetchDashboardData = useCallback(
    debounce(fetchDashboardData, 1000), // 1 second debounce
    [fetchDashboardData]
  );

  // Separate debounced function for recent activity (longer delay since it updates less frequently)
  const debouncedFetchRecentActivity = useCallback(
    debounce(fetchRecentActivity, 5000), // 5 second debounce for activity
    [fetchRecentActivity]
  );

  /**
   * Fetch system health data
   */
  const fetchSystemHealth = useCallback(async () => {
    try {
      if (adminMethods?.getSystemHealth) {
        // Use SignalR method if available
        const health = await adminMethods.getSystemHealth();
        if (mounted.current) {
          setSystemHealth(health);
          onSystemHealthUpdate?.(health);
        }
      }
    } catch (err) {
      console.error('Failed to fetch system health via SignalR:', err);
    }
  }, [adminMethods, onSystemHealthUpdate]);

  /**
   * Setup SignalR event listeners
   */
  useEffect(() => {
    // Don't set up listeners if not enabled
    if (!enableAutoRefresh) return;

    const signalRConnection = window.signalRManager?.connections?.get('admin');
    if (!signalRConnection || signalRConnection.state !== 'Connected') {
      console.log('Admin SignalR connection not available, using fallback polling');
      return;
    }

    console.log('🔗 Setting up real-time dashboard listeners');

    // Dashboard metrics updates
    const onDashboardMetricsUpdate = (metrics) => {
      console.log('📊 Real-time dashboard metrics received:', metrics);
      if (mounted.current) {
        setDashboardData(prev => ({ ...prev, ...metrics }));
        setLastUpdated(new Date());
        onDashboardUpdate?.(metrics);
      }
    };

    // System health updates
    const onSystemHealthUpdateReceived = (health) => {
      console.log('🏥 Real-time system health received:', health);
      if (mounted.current) {
        setSystemHealth(health);
        onSystemHealthUpdate?.(health);
      }
    };

    // Queue updates (for operator dashboards)
    const onQueueUpdate = (queueData) => {
      console.log('📋 Real-time queue update received:', queueData);
      if (mounted.current) {
        setDashboardData(prev => ({
          ...prev,
          waitingVisitors: queueData.WaitingCount || 0,
          processingVisitors: queueData.ProcessingCount || 0,
          lastUpdated: new Date()
        }));
        onDashboardUpdate?.(queueData);
      }
    };

    // Activity updates (ONLY when new audit logs are created via SignalR)
    const onNewAuditLogCreated = async (auditLogData) => {
      console.log('📝 New audit log detected via SignalR:', auditLogData);
      // Use debounced fetch to prevent rapid consecutive updates
      debouncedFetchRecentActivity();
    };

    // Register event listeners
    signalRConnection.on('DashboardMetricsUpdated', onDashboardMetricsUpdate);
    signalRConnection.on('SystemHealthUpdate', onSystemHealthUpdateReceived);
    signalRConnection.on('QueueUpdate', onQueueUpdate);
    signalRConnection.on('AuditLogCreated', onNewAuditLogCreated); // Only updates when new audit logs
    signalRConnection.on('SystemMetrics', onSystemHealthUpdateReceived);

    // Keep track of listeners for cleanup
    signalRListeners.current.add('DashboardMetricsUpdated');
    signalRListeners.current.add('SystemHealthUpdate');
    signalRListeners.current.add('QueueUpdate');
    signalRListeners.current.add('AuditLogCreated');
    signalRListeners.current.add('SystemMetrics');

    // Request initial system metrics
    fetchSystemHealth();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up SignalR dashboard listeners');
      signalRListeners.current.forEach(eventName => {
        signalRConnection.off(eventName);
      });
      signalRListeners.current.clear();
    };
  }, [enableAutoRefresh, onDashboardUpdate, onSystemHealthUpdate, onActivityUpdate, fetchSystemHealth]);

  /**
   * Setup fallback polling when SignalR is not available
   */
  useEffect(() => {
    if (!enableAutoRefresh) return;

    // Check if SignalR is working
    const isSignalRHealthy = areConnectionsHealthy();
    
    if (!isSignalRHealthy && fallbackIntervalMs && !fallbackInterval.current) {
      console.log('🔄 SignalR not healthy, setting up fallback polling');
      
      fallbackInterval.current = setInterval(() => {
        debouncedFetchDashboardData(); // Use debounced version
      }, fallbackIntervalMs);
    }

    // Cleanup fallback interval when SignalR becomes healthy
    if (isSignalRHealthy && fallbackInterval.current) {
      console.log('✅ SignalR is healthy, stopping fallback polling');
      clearInterval(fallbackInterval.current);
      fallbackInterval.current = null;
    }

    return () => {
      if (fallbackInterval.current) {
        clearInterval(fallbackInterval.current);
        fallbackInterval.current = null;
      }
    };
  }, [enableAutoRefresh, fallbackIntervalMs, areConnectionsHealthy, debouncedFetchDashboardData]);

  /**
   * Initial data fetch (fetch both dashboard data and recent activity on mount)
   */
  useEffect(() => {
    const initialFetch = async () => {
      await fetchDashboardData();
      await fetchRecentActivity(); // Initial fetch of recent activity
    };
    
    initialFetch();
  }, []); // Empty dependency array - only run on mount

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchDashboardData();
    await fetchSystemHealth();
  }, [fetchDashboardData, fetchSystemHealth]);

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
    
    // Actions
    refresh,
    refreshActivity
  };
};

export default useRealTimeDashboard;