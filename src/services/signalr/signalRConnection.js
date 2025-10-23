// src/services/signalr/signalRConnection.js
import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { store } from '../../store/store';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../store/slices/notificationSlice';
import { refreshToken } from '../apiClient';
import tokenService from '../tokenService';
import EventHandlerRegistry from './handlers';

class SignalRConnectionManager {
  constructor() {
    this.connections = new Map();
    this.isInitialized = false;
    this.initializationInProgress = false;
    this.initializationPromise = null;
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Initialize event handler registry
    this.eventHandlers = EventHandlerRegistry;
  }

  /**
   * Test authentication by making a simple API call before SignalR connection
   */
  async testAuthentication() {
    try {
      const response = await fetch(`${this.baseUrl}/api/Auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Authentication test passed:', userData);
        return true;
      } else {
        console.error('Authentication test failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Authentication test error:', error);
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
    
    console.log('Initializing SignalR connections for user:', user?.email);

    // Create a promise that can be awaited by other calls
    this.initializationPromise = this._doInitialization(user);
    
    try {
      await this.initializationPromise;
      return this.initializationPromise;
    } finally {
      this.initializationInProgress = false;
    }
  }  /**
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

      console.log('Connecting to hubs based on role/permissions:', {
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
      console.log('SignalR connections initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SignalR connections:', error);
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

    console.log('Hub selection based on permissions:', {
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
      await refreshToken();
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
      console.log(`Connected to ${hubName} hub`);

      // Store the connection
      this.connections.set(hubName, connection);
      this.reconnectAttempts.set(hubName, 0);

      // Join appropriate groups after connection
      await this.joinHubGroups(connection, hubName, user);

    } catch (error) {
      console.error(`Failed to connect to ${hubName} hub:`, error);
      
      // Enhanced error logging for debugging
      if (error.statusCode === 401) {
        console.error('Authentication failed for SignalR hub. Possible causes:');
        console.error('   1. User not logged in or session expired');
        console.error('   2. Authentication cookies not being sent');
        console.error('   3. CORS configuration issues');
        console.error('   4. Backend SignalR hub authorization settings');
        
        // Check if we have user context
        if (!user) {
          console.error('   User object is null/undefined');
        } else {
          console.error('   User object exists:', { email: user.email, role: user.role });
        }
      } else if (error.statusCode === 403) {
        console.error('Authorization failed for SignalR hub. User lacks required permissions for:', hubName);
      } else {
        console.error('Connection error details:', {
          message: error.message,
          statusCode: error.statusCode,
          url: `${this.baseUrl}/hubs/${hubName}`,
          hubName: hubName,
          errorType: error.constructor.name
        });
        
        // Check for CSP issues
        if (error.message && (error.message.includes('connect-src') || error.message.includes('content was blocked'))) {
          console.error('');
          console.error('CONTENT SECURITY POLICY (CSP) ERROR DETECTED!');
          console.error('=================================================');
          console.error('The browser is blocking WebSocket connections due to CSP restrictions.');
          console.error('');
          console.error('SOLUTION: Update your CSP to allow WebSocket connections');
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
   * Set up event handlers for a SignalR hub using the new event handler system
   */
  setupHubEventHandlers(connection, hubName, user) {
    // Connection state handlers with improved user feedback
    connection.onreconnecting(() => {
      console.log(`Reconnecting to ${hubName} hub...`);
    });

    connection.onreconnected(() => {
      console.log(`Reconnected to ${hubName} hub`);
      this.reconnectAttempts.set(hubName, 0);
      // Re-join groups after reconnection
      this.joinHubGroups(connection, hubName, user);
    });

    connection.onclose((error) => {
      console.log(`Disconnected from ${hubName} hub:`, error);
      
      const attempts = this.reconnectAttempts.get(hubName) || 0;
      if (attempts < this.maxReconnectAttempts && error) {
        // Show user feedback for unexpected disconnections
        if (error) {
          store.dispatch(showWarningToast(
            'Connection Lost',
            `Lost connection to ${hubName} services. Attempting to reconnect...`,
            { duration: 5000 }
          ));
        }
        
        // Attempt manual reconnection for unexpected disconnections
        setTimeout(() => this.reconnectToHub(hubName, user), 5000);
      } else if (attempts >= this.maxReconnectAttempts) {
        // Max attempts reached - inform user
        store.dispatch(showErrorToast(
          'Connection Failed',
          `Unable to reconnect to ${hubName} services. Please refresh the page.`,
          { persistent: true }
        ));
      }
    });

    // Set up unified event handling using the event handler registry
    this.setupUnifiedEventHandlers(connection, hubName);

    // Hub-specific setup with default case to fix the warning
    switch (hubName) {
      case 'operator':
        this.setupOperatorSpecificHandlers(connection, hubName);
        break;
      case 'host':
        this.setupHostSpecificHandlers(connection, hubName);
        break;
      case 'security':
        this.setupSecuritySpecificHandlers(connection, hubName);
        break;
      case 'admin':
        this.setupAdminSpecificHandlers(connection, hubName);
        break;
      default:
        console.log(`No specific setup required for ${hubName} hub`);
        break;
    }

    // Common error handler
    connection.on('Error', (error) => {
      this.eventHandlers.handleEvent('Error', error, hubName);
    });

    // Connection quality monitoring
    connection.onreconnecting(() => {
      console.log(`Reconnecting to ${hubName} hub...`);
      store.dispatch(showWarningToast(
        'Connection Issue',
        `Reconnecting to ${hubName} services...`,
        { duration: 3000 }
      ));
    });

    connection.onreconnected(() => {
      console.log(`Reconnected to ${hubName} hub`);
      this.reconnectAttempts.set(hubName, 0);
      
      store.dispatch(showSuccessToast(
        'Connection Restored',
        `${hubName.charAt(0).toUpperCase() + hubName.slice(1)} services reconnected`,
        { duration: 3000 }
      ));
      
      // Re-join groups after reconnection
      this.joinHubGroups(connection, hubName, user);
    });
  }

  /**
   * Set up unified event handlers that delegate to the event handler registry
   */
  setupUnifiedEventHandlers(connection, hubName) {
    // Get all supported events from the event handler registry
    const supportedEvents = this.eventHandlers.getAllSupportedEvents();

    // Register handlers for all supported events
    supportedEvents.forEach(eventName => {
      connection.on(eventName, (data) => {
        this.eventHandlers.handleEvent(eventName, data, hubName);
      });
    });
  }

  /**
   * Hub-specific setup methods (simplified since business logic moved to handlers)
   */
  setupOperatorSpecificHandlers(connection, hubName) {
    // Any operator-specific connection setup that doesn't involve business logic
    console.log('Operator hub connected with specific handlers');
  }

  setupHostSpecificHandlers(connection, hubName) {
    // Any host-specific connection setup that doesn't involve business logic
    console.log('Host hub connected with specific handlers');
  }

  setupSecuritySpecificHandlers(connection, hubName) {
    // Any security-specific connection setup that doesn't involve business logic
    console.log('Security hub connected with specific handlers');
  }

  setupAdminSpecificHandlers(connection, hubName) {
    // Any admin-specific connection setup that doesn't involve business logic
    console.log('Admin hub connected with specific handlers');
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
        default:
          console.log(`No group join method defined for ${hubName} hub`);
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
        console.log(`Manually reconnected to ${hubName} hub`);
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
    console.log('Disconnecting from all SignalR hubs...');

    for (const [hubName, connection] of this.connections) {
      try {
        // ✅ CRITICAL FIX: Remove all event handlers before stopping connection
        // This prevents handlers from processing events after logout
        const supportedEvents = this.eventHandlers.getAllSupportedEvents();
        supportedEvents.forEach(eventName => {
          connection.off(eventName);
        });

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
    console.log('All SignalR connections closed');
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
   * Get detailed connection health status
   */
  getConnectionHealth() {
    const health = {
      isHealthy: true,
      connectedHubs: [],
      disconnectedHubs: [],
      totalConnections: this.connections.size,
      healthyConnections: 0
    };

    for (const [hubName, connection] of this.connections) {
      if (connection.state === HubConnectionState.Connected) {
        health.connectedHubs.push(hubName);
        health.healthyConnections++;
      } else {
        health.disconnectedHubs.push({
          hubName,
          state: connection.state,
          reconnectAttempts: this.reconnectAttempts.get(hubName) || 0
        });
        health.isHealthy = false;
      }
    }

    return health;
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

  /**
   * Get event handler registry (for advanced usage)
   */
  getEventHandlers() {
    return this.eventHandlers;
  }
}

// Create singleton instance
export const signalRManager = new SignalRConnectionManager();

// For backward compatibility and global access (needed by useRealTimeDashboard)
if (typeof window !== 'undefined') {
  window.signalRManager = signalRManager;
}

export default signalRManager;
