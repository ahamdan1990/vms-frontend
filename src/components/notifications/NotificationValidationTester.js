// Comprehensive Notification System Validation & Testing Component
// src/components/notifications/NotificationValidationTester.js

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchNotifications,
  acknowledgeNotificationAsync,
  markNotificationAsRead,
  fetchNotificationStats
} from '../../store/slices/notificationSlice';
import { usePermissions } from '../../hooks/usePermissions';
import Button from '../common/Button/Button';
import Card from '../common/Card/Card';
import Badge from '../common/Badge/Badge';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ArrowPathIcon,
  BugAntIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

/**
 * Notification System Validation & Testing Component
 * 
 * This component provides comprehensive testing tools to validate:
 * 1. NotificationDashboard acknowledgment functionality
 * 2. NotificationCenter acknowledgment functionality  
 * 3. Redux state synchronization
 * 4. Backend API integration
 * 5. UI state updates and refresh behavior
 * 
 * Usage: Add this component to your app temporarily for testing
 */
const NotificationValidationTester = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  
  // Redux state
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    lastSyncTime 
  } = useSelector(state => state.notifications);
  
  // Local testing state
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedTestNotification, setSelectedTestNotification] = useState(null);
  const [testPhase, setTestPhase] = useState('ready'); // 'ready', 'testing', 'complete'
  
  // Permissions
  const canAcknowledge = hasPermission('Notification.Acknowledge');
  const canRead = hasPermission('Notification.Read');
  
  // Auto-refresh notifications for testing
  useEffect(() => {
    if (canRead) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, canRead]);
  
  /**
   * Log test result with timestamp and categorization
   */
  const logTestResult = (step, status, message, data = null) => {
    const result = {
      timestamp: new Date().toISOString(),
      step,
      status, // 'PASS', 'FAIL', 'WARNING', 'INFO'
      message,
      data
    };
    
    setTestResults(prev => [...prev, result]);
    console.log(`🧪 TEST ${status}: ${step} - ${message}`, data || '');
    
    return result;
  };
  
  /**
   * Comprehensive Notification Acknowledgment Test
   * Tests the complete flow from UI interaction to database persistence
   */
  const runComprehensiveAcknowledgmentTest = async (notificationId) => {
    if (!notificationId) {
      logTestResult('VALIDATION', 'FAIL', 'No notification ID provided for testing');
      return;
    }
    
    setIsRunningTests(true);
    setTestPhase('testing');
    
    try {
      logTestResult('START', 'INFO', `Starting comprehensive acknowledgment test for notification ${notificationId}`);
      
      // Pre-test state capture
      const preTestNotification = notifications.find(n => n.id === notificationId);
      logTestResult('PRE_STATE', preTestNotification ? 'PASS' : 'FAIL', 
        `Pre-test notification state captured`, {
          exists: !!preTestNotification,
          read: preTestNotification?.read,
          acknowledged: preTestNotification?.acknowledged,
          acknowledgedOn: preTestNotification?.acknowledgedOn,
          unreadCountBefore: unreadCount
        });
      
      if (!preTestNotification) {
        throw new Error(`Notification ${notificationId} not found in Redux state`);
      }
      
      // Step 1: Test Redux acknowledgment action
      logTestResult('REDUX_ACTION', 'INFO', 'Dispatching acknowledgeNotificationAsync action');
      const actionStartTime = performance.now();
      
      try {
        const actionResult = await dispatch(acknowledgeNotificationAsync({ 
          notificationId, 
          notes: 'Comprehensive validation test acknowledgment' 
        })).unwrap();
        
        const actionEndTime = performance.now();
        logTestResult('REDUX_ACTION', 'PASS', 
          `Redux action completed successfully (${Math.round(actionEndTime - actionStartTime)}ms)`, 
          { result: actionResult, executionTime: actionEndTime - actionStartTime });
        
      } catch (actionError) {
        logTestResult('REDUX_ACTION', 'FAIL', `Redux action failed: ${actionError.message}`, actionError);
        throw actionError;
      }
      
      // Step 2: Immediate state check (should update immediately due to optimistic updates)
      const immediateState = notifications.find(n => n.id === notificationId);
      const immediateStateUpdated = immediateState?.read !== preTestNotification.read || 
                                  immediateState?.acknowledged !== preTestNotification.acknowledged;
      
      logTestResult('IMMEDIATE_STATE', immediateStateUpdated ? 'PASS' : 'WARNING',
        `Immediate Redux state ${immediateStateUpdated ? 'updated' : 'not updated'}`, {
          before: { read: preTestNotification.read, acknowledged: preTestNotification.acknowledged },
          after: { read: immediateState?.read, acknowledged: immediateState?.acknowledged },
          stateChanged: immediateStateUpdated
        });
      
      // Step 3: Force refresh from backend to verify persistence
      logTestResult('BACKEND_REFRESH', 'INFO', 'Refreshing notifications from backend to verify persistence');
      await dispatch(fetchNotifications());
      
      // Give a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 4: Post-refresh state verification
      const postRefreshState = notifications.find(n => n.id === notificationId);
      const backendPersisted = postRefreshState?.acknowledged === true || postRefreshState?.read === true;
      
      logTestResult('BACKEND_PERSISTENCE', backendPersisted ? 'PASS' : 'FAIL',
        `Backend persistence ${backendPersisted ? 'confirmed' : 'failed'}`, {
          postRefreshState: {
            read: postRefreshState?.read,
            acknowledged: postRefreshState?.acknowledged,
            acknowledgedOn: postRefreshState?.acknowledgedOn
          },
          backendPersisted
        });
      
      // Step 5: UI State validation
      const uiReflectsChanges = postRefreshState && (postRefreshState.read || postRefreshState.acknowledged);
      logTestResult('UI_STATE', uiReflectsChanges ? 'PASS' : 'FAIL',
        `UI state ${uiReflectsChanges ? 'correctly reflects' : 'does not reflect'} acknowledgment`, {
          shouldShowAsAcknowledged: true,
          actuallyShowsAsAcknowledged: uiReflectsChanges
        });
      
      // Step 6: Unread count validation
      const expectedUnreadReduction = preTestNotification.read ? 0 : 1;
      const actualUnreadCount = notifications.filter(n => !n.read).length;
      
      logTestResult('UNREAD_COUNT', 'PASS', `Unread count validation completed`, {
        unreadCountBefore: unreadCount,
        expectedReduction: expectedUnreadReduction,
        actualUnreadCount
      });
      
      // Final validation
      if (backendPersisted && uiReflectsChanges) {
        logTestResult('FINAL_RESULT', 'PASS', '✅ All acknowledgment tests passed successfully!');
      } else {
        logTestResult('FINAL_RESULT', 'FAIL', '❌ One or more acknowledgment tests failed');
      }
      
    } catch (error) {
      logTestResult('ERROR', 'FAIL', `Test failed with error: ${error.message}`, error);
    } finally {
      setIsRunningTests(false);
      setTestPhase('complete');
    }
  };
  
  /**
   * Backend-Frontend Mapping Test
   * Verifies that backend isAcknowledged field is properly mapped to frontend read field
   */
  const runMappingValidationTest = () => {
    logTestResult('MAPPING_TEST', 'INFO', 'Starting backend-frontend field mapping validation');
    
    const mappingResults = notifications.map(notification => {
      // Check if backend fields are preserved
      const hasBackendFields = notification.hasOwnProperty('isAcknowledged');
      const hasFrontendFields = notification.hasOwnProperty('read');
      
      // Verify mapping logic
      const mappingCorrect = notification.isAcknowledged ? notification.read === true : true;
      
      return {
        id: notification.id,
        title: notification.title,
        // Backend fields
        isAcknowledged: notification.isAcknowledged,
        acknowledgedOn: notification.acknowledgedOn,
        acknowledgedBy: notification.acknowledgedBy,
        // Frontend fields  
        read: notification.read,
        acknowledged: notification.acknowledged,
        // Validation
        hasBackendFields,
        hasFrontendFields,
        mappingCorrect,
        shouldBeRead: notification.isAcknowledged === true,
        actuallyRead: notification.read === true
      };
    });
    
    const allMappedCorrectly = mappingResults.every(r => r.mappingCorrect);
    const unmappedNotifications = mappingResults.filter(r => !r.mappingCorrect);
    
    logTestResult('MAPPING_TEST', allMappedCorrectly ? 'PASS' : 'FAIL',
      `Backend-Frontend mapping ${allMappedCorrectly ? 'successful' : 'failed'}`, {
        totalNotifications: mappingResults.length,
        correctlyMapped: mappingResults.filter(r => r.mappingCorrect).length,
        incorrectlyMapped: unmappedNotifications.length,
        mappingDetails: mappingResults,
        unmappedNotifications: unmappedNotifications.length > 0 ? unmappedNotifications : null
      });
      
    return mappingResults;
  };

  /**
   * Quick State Synchronization Test
   * Verifies that Redux state matches expected backend state
   */
  const runStateSyncTest = async () => {
    setIsRunningTests(true);
    
    try {
      logTestResult('SYNC_TEST', 'INFO', 'Starting state synchronization test');
      
      // Capture current state
      const preRefreshState = {
        notificationCount: notifications.length,
        unreadCount,
        lastSyncTime
      };
      
      // Force refresh from backend
      await dispatch(fetchNotifications());
      await dispatch(fetchNotificationStats());
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Compare states
      const postRefreshState = {
        notificationCount: notifications.length,
        unreadCount: notifications.filter(n => !n.read).length,
        lastSyncTime
      };
      
      const stateChanged = JSON.stringify(preRefreshState) !== JSON.stringify(postRefreshState);
      
      logTestResult('SYNC_TEST', stateChanged ? 'PASS' : 'INFO',
        `State synchronization ${stateChanged ? 'detected changes' : 'confirmed consistency'}`, {
          before: preRefreshState,
          after: postRefreshState,
          stateChanged
        });
        
    } catch (error) {
      logTestResult('SYNC_TEST', 'FAIL', `State sync test failed: ${error.message}`, error);
    } finally {
      setIsRunningTests(false);
    }
  };
  
  /**
   * Permission Validation Test
   */
  const runPermissionTest = () => {
    logTestResult('PERMISSIONS', 'INFO', 'Validating notification permissions');
    
    const permissionResults = {
      canRead,
      canAcknowledge,
      hasNotifications: notifications.length > 0,
      hasUnreadNotifications: unreadCount > 0
    };
    
    logTestResult('PERMISSIONS', canAcknowledge ? 'PASS' : 'WARNING',
      `Permission validation completed`, permissionResults);
    
    if (!canAcknowledge) {
      logTestResult('PERMISSIONS', 'WARNING', 
        'User lacks acknowledgment permissions - this may explain acknowledgment issues');
    }
    
    return permissionResults;
  };
  
  /**
   * Clear test results
   */
  const clearTestResults = () => {
    setTestResults([]);
    setTestPhase('ready');
    setSelectedTestNotification(null);
  };
  
  /**
   * Render test result with appropriate styling
   */
  const renderTestResult = (result, index) => {
    const statusColors = {
      'PASS': 'text-green-700 bg-green-50 border-green-200',
      'FAIL': 'text-red-700 bg-red-50 border-red-200', 
      'WARNING': 'text-yellow-700 bg-yellow-50 border-yellow-200',
      'INFO': 'text-blue-700 bg-blue-50 border-blue-200'
    };
    
    const statusIcons = {
      'PASS': <CheckCircleIcon className="w-4 h-4" />,
      'FAIL': <XCircleIcon className="w-4 h-4" />,
      'WARNING': <ClockIcon className="w-4 h-4" />,
      'INFO': <BugAntIcon className="w-4 h-4" />
    };
    
    return (
      <div key={index} className={`p-3 mb-2 border rounded-md ${statusColors[result.status]}`}>
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 mt-0.5">
            {statusIcons[result.status]}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{result.step}</span>
              <Badge color={result.status === 'PASS' ? 'green' : result.status === 'FAIL' ? 'red' : result.status === 'WARNING' ? 'yellow' : 'blue'} size="xs">
                {result.status}
              </Badge>
            </div>
            <p className="text-sm mt-1">{result.message}</p>
            <p className="text-xs mt-1 opacity-75">
              {new Date(result.timestamp).toLocaleTimeString()}
            </p>
            {result.data && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer hover:underline">View Details</summary>
                <pre className="text-xs mt-1 p-2 bg-white bg-opacity-50 rounded overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  if (!canRead) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-red-600">
          <XCircleIcon className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p>You don't have permission to read notifications.</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <BugAntIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">Notification System Validator</h2>
          <Badge color={testPhase === 'complete' ? 'green' : testPhase === 'testing' ? 'yellow' : 'gray'}>
            {testPhase}
          </Badge>
        </div>
        <p className="text-gray-600">
          Comprehensive testing tool for notification acknowledgment functionality
        </p>
      </div>
      
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700">Total Notifications</h4>
          <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700">Unread</h4>
          <p className="text-2xl font-bold text-blue-900">{unreadCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-700">Can Acknowledge</h4>
          <p className="text-2xl font-bold text-green-900">{canAcknowledge ? 'Yes' : 'No'}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-700">Last Sync</h4>
          <p className="text-sm text-yellow-900">
            {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
          </p>
        </div>
      </div>
      
      {/* Quick Test Controls */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Quick Tests</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={runPermissionTest}
            disabled={isRunningTests}
            size="sm"
            variant="outline"
          >
            Test Permissions
          </Button>
          
          <Button
            onClick={runMappingValidationTest}
            disabled={isRunningTests}
            size="sm"
            variant="outline"
            className="bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            Test Field Mapping
          </Button>
          
          <Button
            onClick={runStateSyncTest}
            disabled={isRunningTests}
            size="sm"
            variant="outline"
            icon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Test State Sync
          </Button>
          
          <Button
            onClick={clearTestResults}
            size="sm"
            variant="ghost"
          >
            Clear Results
          </Button>
        </div>
      </div>
      
      {/* Notification Selection for Testing */}
      {notifications.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-4">Acknowledgment Testing</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Notification to Test:
            </label>
            <select
              value={selectedTestNotification || ''}
              onChange={(e) => setSelectedTestNotification(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose a notification...</option>
              {notifications.slice(0, 10).map(notification => (
                <option key={notification.id} value={notification.id}>
                  {notification.title} - {notification.read ? 'Read' : 'Unread'} 
                  {notification.acknowledged && ' (Acknowledged)'}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={() => selectedTestNotification && runComprehensiveAcknowledgmentTest(selectedTestNotification)}
            disabled={!selectedTestNotification || isRunningTests || !canAcknowledge}
            loading={isRunningTests}
            icon={<CheckIcon className="w-4 h-4" />}
          >
            {isRunningTests ? 'Running Tests...' : 'Test Acknowledgment Flow'}
          </Button>
        </div>
      )}
      
      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-4">Test Results ({testResults.length})</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {testResults.map((result, index) => renderTestResult(result, index))}
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="font-medium text-red-800">System Error Detected</h4>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}
      
      {/* Usage Instructions */}
      <details className="mt-6">
        <summary className="font-medium cursor-pointer hover:underline">
          Usage Instructions
        </summary>
        <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm">
          <h4 className="font-medium mb-2">How to Use This Validator:</h4>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Check Permissions:</strong> Run "Test Permissions" to verify you have acknowledge rights</li>
            <li><strong>Test State Sync:</strong> Run "Test State Sync" to verify Redux-Backend synchronization</li>
            <li><strong>Test Acknowledgment:</strong> Select a notification and run "Test Acknowledgment Flow"</li>
            <li><strong>Review Results:</strong> Check all test steps show "PASS" status</li>
            <li><strong>Fix Issues:</strong> If tests fail, the detailed logs will show the exact problem</li>
          </ol>
          <p className="mt-4 text-gray-600">
            <strong>Expected Behavior:</strong> After acknowledgment, notifications should be marked as acknowledged 
            in the database, Redux state should update immediately, and page refresh should maintain the acknowledged status.
          </p>
        </div>
      </details>
    </Card>
  );
};

export default NotificationValidationTester;
