// src/services/signalr/signalRConnection.js
import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { store } from '../../store/store';
import { addNotificationWithDesktop } from '../../store/slices/notificationSlice';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../store/slices/notificationSlice';
import { refreshToken } from '../apiClient';
import tokenService from '../tokenService';



class SignalRConnectionManager {
  constructor() {
    this.connections = new Map();
    this.isInitialized = false;
    this.initializationInProgress = false;
    this.initializationPromise = null;
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }

  /**
   * Test authentication by making a simple API call before SignalR connection
   */
  async testAuthentication() {
    try {
      const response = await fetch(`${this.baseUrl}/api/Auth/me`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Authentication test passed:', userData);
        return true;
      } else {
        console.error('❌ Authentication test failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Authentication test error:', error);
      return false;
    }
  }

  /**
   * Initialize SignalR connections based on user role/permissions
   */
  async initializeConnections(user) {
    // Prevent multiple concurrent initializations
    if (this.isInitialized) {
      console.log('SignalR already initialized - skipping');
      return;
    }

    if (this.initializationInProgress) {
      console.log('SignalR initialization already in progress - waiting...');
      return this.initializationPromise;
    }

    this.initializationInProgress = true;
    
    console.log('🔗 Initializing SignalR connections for user:', user?.email);

    // Create a promise that can be awaited by other calls
    this.initializationPromise = this._doInitialization(user);
    
    try {
      await this.initializationPromise;
      return this.initializationPromise;
    } finally {
      this.initializationInProgress = false;
    }
  }

  /**
   * Internal initialization method
   */
  async _doInitialization(user) {
    // Test authentication before attempting SignalR connections
    const isAuthenticated = await this.testAuthentication();
    if (!isAuthenticated) {
      throw new Error('User is not properly authenticated. Please log in again.');
    }

    try {
      const userRole = user?.role?.toLowerCase();
      const permissions = user?.permissions || [];


      // Determine which hubs to connect to based on role/permissions
      const hubsToConnect = this.getRequiredHubs(userRole, permissions);

      console.log('📋 Connecting to hubs based on role/permissions:', {
        role: userRole,
        permissionCount: permissions.length,
        hubs: hubsToConnect
      });

      // Connect to each required hub sequentially to avoid overwhelming the server
      for (const hubName of hubsToConnect) {
        try {
          await this.connectToHub(hubName, user);
        } catch (error) {
          console.error(`Failed to connect to ${hubName} hub, continuing with others...`, error);
          // Continue with other hubs even if one fails
        }
      }

      this.isInitialized = true;
      console.log('✅ SignalR connections initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SignalR connections:', error);
      throw error;
    }
  }

  /**
   * Determine which hubs to connect to based on user role and permissions
   */
  getRequiredHubs(userRole, permissions) {
    const hubs = [];

    // Everyone gets host hub (for their own visitor notifications)
    // But we need to check if they have the minimum required permission
    if (permissions.some(p => p.includes('Invitation.Read'))) {
      hubs.push('host');
    }

    // Role-specific hub connections
    if (userRole === 'administrator') {
      hubs.push('admin');
    }

    if (userRole === 'operator' || userRole === 'receptionist') {
      hubs.push('operator');
    }

    // Permission-based hub connections for security
    const securityPermissions = [
      'Alert.ViewFRAlerts',
      'Alert.ViewBlacklistAlerts', 
      'Alert.ViewSystemAlerts',
      'Alert.ViewVIPAlerts',
      'Emergency.ViewRoster',
      'Emergency.Lockdown'
    ];
    
    if (permissions.some(p => securityPermissions.some(sp => p.includes(sp)))) {
      hubs.push('security');
    }

    console.log('📋 Hub selection based on permissions:', {
      role: userRole,
      totalPermissions: permissions.length,
      relevantPermissions: permissions.filter(p => 
        p.includes('Invitation.Read') || 
        securityPermissions.some(sp => p.includes(sp))
      ),
      selectedHubs: hubs
    });

    return hubs;
  }

  /**
   * Connect to a specific SignalR hub
   */
  async connectToHub(hubName, user) {
    try {
      // Ensure token is valid before starting connection
      await refreshToken(); // your refreshToken function
      const fingerprint = tokenService.getDeviceFingerprint();

      const hubUrl = `${this.baseUrl}/hubs/${hubName}?deviceFingerprint=${fingerprint}`;
      
      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          // Cookie-based authentication configuration
          withCredentials: true,
          
          // Transport fallback strategy for CSP issues
          transport: undefined, // Let SignalR try all transports
          skipNegotiation: false,
          
          // Headers to ensure proper cookie handling
          headers: {
            'Content-Type': 'application/json'
          },
          
          // Timeout configuration
          timeout: 30000,
          
          // Additional options for transport fallback
          logMessageContent: process.env.NODE_ENV === 'development'
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            // Exponential backoff: 0, 2, 10, 30 seconds
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            return 30000;
          }
        })
        .configureLogging(process.env.NODE_ENV === 'development' ? LogLevel.Information : LogLevel.Warning)
        .build();

      // Set up event handlers
      this.setupHubEventHandlers(connection, hubName, user);

      // Connect to the hub
      await connection.start();
      console.log(`✅ Connected to ${hubName} hub`);

      // Store the connection
      this.connections.set(hubName, connection);
      this.reconnectAttempts.set(hubName, 0);

      // Join appropriate groups after connection
      await this.joinHubGroups(connection, hubName, user);

    } catch (error) {
      console.error(`❌ Failed to connect to ${hubName} hub:`, error);
      
      // Enhanced error logging for debugging
      if (error.statusCode === 401) {
        console.error('🚫 Authentication failed for SignalR hub. Possible causes:');
        console.error('   1. User not logged in or session expired');
        console.error('   2. Authentication cookies not being sent');
        console.error('   3. CORS configuration issues');
        console.error('   4. Backend SignalR hub authorization settings');
        
        // Check if we have user context
        if (!user) {
          console.error('   → User object is null/undefined');
        } else {
          console.error('   → User object exists:', { email: user.email, role: user.role });
        }
      } else if (error.statusCode === 403) {
        console.error('🚫 Authorization failed for SignalR hub. User lacks required permissions for:', hubName);
      } else {
        console.error('🔌 Connection error details:', {
          message: error.message,
          statusCode: error.statusCode,
          url: `${this.baseUrl}/hubs/${hubName}`,
          hubName: hubName,
          errorType: error.constructor.name
        });
        
        // Check for CSP issues
        if (error.message && (error.message.includes('connect-src') || error.message.includes('content was blocked'))) {
          console.error('');
          console.error('🛡️  CONTENT SECURITY POLICY (CSP) ERROR DETECTED!');
          console.error('=================================================');
          console.error('The browser is blocking WebSocket connections due to CSP restrictions.');
          console.error('');
          console.error('💡 SOLUTION: Update your CSP to allow WebSocket connections');
          console.error('');
          console.error('Add this to your public/index.html <meta> CSP tag:');
          console.error('   ws://localhost:5000');
          console.error('');
          console.error('Or update your server CSP headers to include:');
          console.error('   connect-src \'self\' ws://localhost:5000 wss://localhost:5000');
          console.error('=================================================');
          console.error('');
        }
      }
      
      throw error;
    }
  }

  /**
   * Set up event handlers for a SignalR hub
   */
  setupHubEventHandlers(connection, hubName, user) {
    // Connection state handlers
    connection.onreconnecting(() => {
      console.log(`🔄 Reconnecting to ${hubName} hub...`);
    });

    connection.onreconnected(() => {
      console.log(`✅ Reconnected to ${hubName} hub`);
      this.reconnectAttempts.set(hubName, 0);
      // Re-join groups after reconnection
      this.joinHubGroups(connection, hubName, user);
    });

    connection.onclose((error) => {
      console.log(`❌ Disconnected from ${hubName} hub:`, error);
      
      const attempts = this.reconnectAttempts.get(hubName) || 0;
      if (attempts < this.maxReconnectAttempts && error) {
        // Attempt manual reconnection for unexpected disconnections
        setTimeout(() => this.reconnectToHub(hubName, user), 5000);
      }
    });

    // Hub-specific event handlers
    switch (hubName) {
      case 'operator':
        this.setupOperatorHubHandlers(connection);
        break;
      case 'host':
        this.setupHostHubHandlers(connection);
        break;
      case 'security':
        this.setupSecurityHubHandlers(connection);
        break;
      case 'admin':
        this.setupAdminHubHandlers(connection);
        break;
    }

    // Common error handler
    connection.on('Error', (error) => {
      console.error(`${hubName} hub error:`, error);
      
      // Don't show toast for permission errors during initial connection
      if (!error.includes('Insufficient permissions') && !error.includes('security permissions')) {
        store.dispatch(showErrorToast('Connection Error', error));
      }
    });
  }

  /**
   * Set up Operator Hub specific event handlers
   */
  setupOperatorHubHandlers(connection) {
    // Operator registration confirmation
    connection.on('OperatorRegistered', (data) => {
      console.log('Operator registered:', data);
      store.dispatch(showSuccessToast('Connected', 'You are now online as an operator'));
    });

    // Visitor arrival notifications
    connection.on('VisitorArrival', (data) => {
      console.log('Visitor arrival:', data);
      store.dispatch(addNotificationWithDesktop({
        type: 'visitor_arrival',
        title: 'Visitor Arrival',
        message: `${data.visitorName} from ${data.company || 'N/A'} has arrived`,
        priority: 'high',
        persistent: true,
        data: data,
        actions: [
          { label: 'Process Check-in', action: 'process_checkin' },
          { label: 'View Details', action: 'view_visitor' }
        ]
      }));
    });

    // Queue updates
    connection.on('VisitorQueueUpdate', (data) => {
      console.log('Queue update:', data);
      // Update queue metrics in real-time
      // This would update dashboard components
    });

    // Operator status changes
    connection.on('OperatorStatusChanged', (data) => {
      console.log('Operator status changed:', data);
      // Update operator status display
    });

    
    // Operator capacityalert 
    connection.on('CapacityAlert', (data) => {
      console.log('Capacity Alert:', data);
      // Update operator status display
    });

    // Alert acknowledgments
    connection.on('AlertAcknowledged', (data) => {
      console.log('Alert acknowledged:', data);
      store.dispatch(showSuccessToast('Alert Handled', `Alert acknowledged by operator`));
    });
  }

  /**
   * Set up Host Hub specific event handlers
   */
  setupHostHubHandlers(connection) {
    // Host registration confirmation
    connection.on('HostRegistered', (data) => {
      console.log('Host registered:', data);
    });

    // Visitor notifications for hosts
    connection.on('VisitorNotification', (data) => {
      console.log('Visitor notification:', data);
      store.dispatch(addNotificationWithDesktop({
        type: data.notificationType || 'visitor_update',
        title: data.title || 'Visitor Update',
        message: data.message,
        priority: data.priority || 'medium',
        data: data,
        actions: data.actions || []
      }));
    });

    // Today's visitors updates
    connection.on('TodaysVisitors', (data) => {
      console.log('Today\'s visitors update:', data);
      // Update today's schedule display
    });

    // Notification history
    connection.on('NotificationHistory', (data) => {
      console.log('Notification history:', data);
      // Update notification center with history
    });

    // Host availability changes
    connection.on('HostAvailabilityChanged', (data) => {
      console.log('Host availability changed:', data);
      // Update host status display
    });
  }

  /**
   * Set up Security Hub specific event handlers
   */
  setupSecurityHubHandlers(connection) {
    // Security registration confirmation
    connection.on('SecurityRegistered', (data) => {
      console.log('Security registered:', data);
    });

    // Security alerts
    connection.on('SecurityAlert', (data) => {
      console.log('Security alert:', data);
      store.dispatch(addNotificationWithDesktop({
        type: 'security_alert',
        title: data.title || 'Security Alert',
        message: data.message,
        priority: 'emergency',
        persistent: true,
        data: data,
        actions: [
          { label: 'Acknowledge', action: 'acknowledge_security' },
          { label: 'View Location', action: 'view_location' },
          { label: 'Contact Security', action: 'contact_security' }
        ]
      }));
    });

    // Emergency alerts
    connection.on('EmergencyAlert', (data) => {
      console.log('Emergency alert:', data);
      store.dispatch(addNotificationWithDesktop({
        type: 'emergency',
        title: `EMERGENCY: ${data.Type}`,
        message: data.Reason,
        priority: 'emergency',
        persistent: true,
        data: data
      }));
    });

    // Security status updates
    connection.on('SecurityStatus', (data) => {
      console.log('Security status:', data);
      // Update security dashboard metrics
    });

    // Alert acknowledgments
    connection.on('SecurityAlertAcknowledged', (data) => {
      console.log('Security alert acknowledged:', data);
    });
  }

  /**
   * Set up Admin Hub specific event handlers
   */
  setupAdminHubHandlers(connection) {
    // Admin registration confirmation
    connection.on('AdminRegistered', (data) => {
      console.log('Admin registered:', data);
    });

    // System health updates
    connection.on('SystemHealth', (data) => {
      console.log('System health update:', data);
      // Update admin dashboard with system metrics
    });

    // Handle both 'SystemHealth' and 'SystemHealthUpdate' event names
    connection.on('SystemHealthUpdate', (data) => {
      console.log('System health update (alt):', data);
      // Update admin dashboard with system metrics
    });

    // Bulk approval results
    connection.on('BulkApprovalCompleted', (data) => {
      console.log('Bulk approval completed:', data);
      store.dispatch(showSuccessToast(
        'Bulk Approval Complete', 
        `${data.ApprovedCount} invitations approved`
      ));
    });

    // Maintenance notifications
    connection.on('MaintenanceNotification', (data) => {
      console.log('Maintenance notification:', data);
      store.dispatch(showWarningToast(
        'Maintenance Notice',
        data.Message,
        { persistent: true }
      ));
    });

      // Admin capacityalert 
      connection.on('CapacityAlert', (data) => {
      console.log('Capacity Alert:', data);
      // Update operator status display
    });

    // System metrics updates
    connection.on('SystemMetrics', (data) => {
      console.log('System metrics update:', data);
      // Update real-time system metrics display
    });
  }

  /**
   * Join appropriate groups after connecting to a hub
   */
  async joinHubGroups(connection, hubName, user) {
    try {
      switch (hubName) {
        case 'operator':
          await connection.invoke('JoinAsOperator', user.locationId || null);
          break;
        case 'host':
          await connection.invoke('JoinAsHost');
          break;
        case 'security':
          await connection.invoke('JoinAsSecurity');
          break;
        case 'admin':
          await connection.invoke('JoinAsAdmin');
          break;
      }
    } catch (error) {
      console.error(`Failed to join ${hubName} hub groups:`, error);
    }
  }

  /**
   * Manually reconnect to a hub
   */
  async reconnectToHub(hubName, user) {
    const attempts = this.reconnectAttempts.get(hubName) || 0;
    
    if (attempts >= this.maxReconnectAttempts) {
      console.log(`Max reconnection attempts reached for ${hubName} hub`);
      return;
    }

    this.reconnectAttempts.set(hubName, attempts + 1);
    
    try {
      const connection = this.connections.get(hubName);
      if (connection && connection.state === HubConnectionState.Disconnected) {
        await connection.start();
        await this.joinHubGroups(connection, hubName, user);
        console.log(`✅ Manually reconnected to ${hubName} hub`);
      }
    } catch (error) {
      console.error(`Failed to manually reconnect to ${hubName} hub:`, error);
      // Retry after delay
      setTimeout(() => this.reconnectToHub(hubName, user), 10000);
    }
  }

  /**
   * Disconnect from all hubs
   */
  async disconnectAll() {
    console.log('🔌 Disconnecting from all SignalR hubs...');
    
    for (const [hubName, connection] of this.connections) {
      try {
        if (connection.state !== HubConnectionState.Disconnected) {
          await connection.stop();
        }
        console.log(`Disconnected from ${hubName} hub`);
      } catch (error) {
        console.error(`Error disconnecting from ${hubName} hub:`, error);
      }
    }

    this.connections.clear();
    this.reconnectAttempts.clear();
    this.isInitialized = false;
    console.log('✅ All SignalR connections closed');
  }

  /**
   * Get connection status for a specific hub
   */
  getConnectionStatus(hubName) {
    const connection = this.connections.get(hubName);
    return connection ? connection.state : HubConnectionState.Disconnected;
  }

  /**
   * Check if all connections are healthy
   */
  areConnectionsHealthy() {
    if (this.connections.size === 0) return false;
    
    for (const connection of this.connections.values()) {
      if (connection.state !== HubConnectionState.Connected) {
        return false;
      }
    }
    return true;
  }

  /**
   * Invoke a method on a specific hub
   */
  async invokeHubMethod(hubName, methodName, ...args) {
    const connection = this.connections.get(hubName);
    
    if (!connection || connection.state !== HubConnectionState.Connected) {
      throw new Error(`${hubName} hub is not connected`);
    }

    try {
      return await connection.invoke(methodName, ...args);
    } catch (error) {
      console.error(`Failed to invoke ${methodName} on ${hubName} hub:`, error);
      throw error;
    }
  }
}

// Create singleton instance
export const signalRManager = new SignalRConnectionManager();
export default signalRManager;
