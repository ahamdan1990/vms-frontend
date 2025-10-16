// Enhanced Notification Diagnostics Component
// Production-grade debugging and monitoring for notification acknowledgment flow

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  acknowledgeNotificationAsync, 
  fetchNotifications,
  markNotificationAsRead 
} from '../../store/slices/notificationSlice';
import { usePermissions } from '../../hooks/usePermissions';
import notificationService from '../../services/notificationService';

/**
 * Production Notification System Diagnostics
 * Comprehensive testing and debugging component for notification acknowledgment
 * 
 * Key Implementation Considerations:
 * - Real-time permission validation
 * - API connectivity testing
 * - Redux state monitoring
 * - Performance profiling
 * - Error classification and recovery
 */
const NotificationDiagnostics = ({ testNotificationId = null }) => {
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  
  // Redux state monitoring
  const { notifications, unreadCount, loading, error } = useSelector(state => state.notifications);
  
  // Diagnostic state
  const [diagnosticResults, setDiagnosticResults] = useState({});
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Permission diagnostic
  const canAcknowledge = hasPermission('Notification.Acknowledge');
  const canRead = hasPermission('Notification.Read');

  /**
   * Comprehensive Acknowledgment Flow Test
   * Tests the complete flow from UI trigger to state update
   */
  const runAcknowledgmentFlowTest = async (notificationId) => {
    const testLog = [];
    
    try {
      setIsRunningTests(true);
      testLog.push({ step: 'START', status: 'INFO', message: 'Beginning acknowledgment flow test' });

      // Step 1: Permission Validation
      testLog.push({ 
        step: 'PERMISSIONS', 
        status: canAcknowledge ? 'PASS' : 'FAIL',
        message: `Acknowledge permission: ${canAcknowledge}`,
        data: { canAcknowledge, canRead }
      });

      if (!canAcknowledge) {
        throw new Error('Insufficient permissions for acknowledgment');
      }

      // Step 2: Pre-state Capture
      const preState = notifications.find(n => n.id === notificationId);
      testLog.push({ 
        step: 'PRE_STATE', 
        status: preState ? 'PASS' : 'FAIL',
        message: `Notification found: ${!!preState}`,
        data: { 
          notificationExists: !!preState, 
          currentReadStatus: preState?.read,
          unreadCountBefore: unreadCount
        }
      });

      // Step 3: Direct API Test
      const apiStartTime = performance.now();
      try {
        const apiResult = await notificationService.acknowledgeNotification(notificationId, 'Test acknowledgment');
        const apiEndTime = performance.now();
        
        testLog.push({ 
          step: 'API_DIRECT', 
          status: 'PASS',
          message: `API call successful (${Math.round(apiEndTime - apiStartTime)}ms)`,
          data: { apiResult, responseTime: apiEndTime - apiStartTime }
        });
      } catch (apiError) {
        testLog.push({ 
          step: 'API_DIRECT', 
          status: 'FAIL',
          message: `API call failed: ${apiError.message}`,
          data: { error: apiError }
        });
        throw apiError;
      }

      // Step 4: Redux Action Test
      const reduxStartTime = performance.now();
      try {
        const reduxResult = await dispatch(acknowledgeNotificationAsync({ 
          notificationId, 
          notes: 'Redux test acknowledgment' 
        })).unwrap();
        const reduxEndTime = performance.now();
        
        testLog.push({ 
          step: 'REDUX_ACTION', 
          status: 'PASS',
          message: `Redux action successful (${Math.round(reduxEndTime - reduxStartTime)}ms)`,
          data: { reduxResult, actionTime: reduxEndTime - reduxStartTime }
        });
      } catch (reduxError) {
        testLog.push({ 
          step: 'REDUX_ACTION', 
          status: 'FAIL',
          message: `Redux action failed: ${reduxError.message}`,
          data: { error: reduxError }
        });
        throw reduxError;
      }

      // Step 5: Post-state Validation (with timeout for state propagation)
      await new Promise(resolve => setTimeout(resolve, 500)); // Allow state update
      
      const postState = notifications.find(n => n.id === notificationId);
      const stateChanged = preState?.read !== postState?.read;
      
      testLog.push({ 
        step: 'POST_STATE', 
        status: stateChanged ? 'PASS' : 'WARNING',
        message: `State update detected: ${stateChanged}`,
        data: { 
          readStatusBefore: preState?.read,
          readStatusAfter: postState?.read,
          unreadCountAfter: unreadCount,
          stateChanged
        }
      });

      // Step 6: UI Update Verification
      testLog.push({ 
        step: 'UI_UPDATE', 
        status: 'PASS',
        message: 'UI should reflect acknowledgment status',
        data: { 
          recommendedAction: 'Check if acknowledge button disappeared/changed state',
          uiValidationRequired: true
        }
      });

      testLog.push({ step: 'COMPLETE', status: 'PASS', message: 'Acknowledgment flow test completed successfully' });

    } catch (error) {
      testLog.push({ 
        step: 'ERROR', 
        status: 'FAIL', 
        message: `Test failed: ${error.message}`,
        data: { error: error.toString() }
      });
    } finally {
      setIsRunningTests(false);
      setTestResults(prev => [...prev, ...testLog]);
    }
  };

  /**
   * System Health Check
   * Validates overall notification system configuration
   */
  const runSystemHealthCheck = async () => {
    const healthCheck = {};
    
    try {
      // Redux store health
      healthCheck.reduxStore = {
        status: 'HEALTHY',
        notificationCount: notifications.length,
        unreadCount,
        loadingState: loading,
        errorState: error
      };

      // API connectivity
      try {
        await notificationService.getNotifications({ pageSize: 1 });
        healthCheck.apiConnectivity = { status: 'HEALTHY', message: 'API endpoint responsive' };
      } catch (apiError) {
        healthCheck.apiConnectivity = { status: 'ERROR', message: apiError.message };
      }

      // Permission validation
      healthCheck.permissions = {
        status: canAcknowledge ? 'HEALTHY' : 'WARNING',
        acknowledge: canAcknowledge,
        read: canRead,
        message: canAcknowledge ? 'All required permissions present' : 'Missing acknowledge permission'
      };

      setDiagnosticResults(healthCheck);
      
    } catch (error) {
      setDiagnosticResults({ 
        systemError: { 
          status: 'CRITICAL', 
          message: error.message 
        } 
      });
    }
  };

  // Auto-run health check on component mount
  useEffect(() => {
    runSystemHealthCheck();
  }, []);

  /**
   * Enhanced Acknowledgment Handler with Comprehensive Logging
   * Production-ready acknowledgment with full diagnostic tracking
   */
  const handleDiagnosticAcknowledgment = async (notificationId) => {
    console.group(`🔧 DIAGNOSTIC: Acknowledging notification ${notificationId}`);
    
    try {
      // Pre-acknowledgment state logging
      const preState = notifications.find(n => n.id === notificationId);
      console.log('📊 Pre-state:', { 
        exists: !!preState, 
        read: preState?.read, 
        unreadCount 
      });

      // Execute acknowledgment with timing
      const startTime = performance.now();
      const result = await dispatch(acknowledgeNotificationAsync({ 
        notificationId, 
        notes: 'Diagnostic acknowledgment with full logging' 
      })).unwrap();
      const endTime = performance.now();

      console.log('✅ Acknowledgment successful:', { 
        result, 
        executionTime: `${Math.round(endTime - startTime)}ms` 
      });

      // Post-acknowledgment validation
      setTimeout(() => {
        const postState = notifications.find(n => n.id === notificationId);
        console.log('📈 Post-state:', { 
          read: postState?.read, 
          unreadCount,
          stateChanged: preState?.read !== postState?.read
        });
        console.groupEnd();
      }, 200);

    } catch (error) {
      console.error('❌ Acknowledgment failed:', error);
      console.groupEnd();
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">🔧 Notification System Diagnostics</h3>
      
      {/* System Health Status */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">System Health Check</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(diagnosticResults).map(([key, value]) => (
            <div key={key} className={`p-3 rounded border ${
              value.status === 'HEALTHY' ? 'bg-green-50 border-green-200' :
              value.status === 'WARNING' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="font-medium text-sm">{key}</div>
              <div className={`text-xs ${
                value.status === 'HEALTHY' ? 'text-green-700' :
                value.status === 'WARNING' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {value.message || value.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Acknowledgment Flow Testing</h4>
        <div className="flex space-x-4">
          <button
            onClick={() => testNotificationId && runAcknowledgmentFlowTest(testNotificationId)}
            disabled={!testNotificationId || isRunningTests}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunningTests ? 'Running Test...' : 'Test Acknowledgment Flow'}
          </button>
          
          <button
            onClick={runSystemHealthCheck}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Refresh Health Check
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Test Results</h4>
          <div className="max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className={`p-2 mb-2 rounded text-sm ${
                result.status === 'PASS' ? 'bg-green-100 text-green-800' :
                result.status === 'FAIL' ? 'bg-red-100 text-red-800' :
                result.status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                <strong>{result.step}:</strong> {result.message}
                {result.data && (
                  <pre className="mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Notification Testing */}
      {notifications.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Live Notification Testing</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notifications.slice(0, 5).map(notification => (
              <div key={notification.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex-1">
                  <div className="text-sm font-medium">{notification.title}</div>
                  <div className="text-xs text-gray-500">
                    ID: {notification.id} | Read: {notification.read ? '✅' : '❌'}
                  </div>
                </div>
                <button
                  onClick={() => handleDiagnosticAcknowledgment(notification.id)}
                  disabled={notification.read || !canAcknowledge}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Test Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDiagnostics;
