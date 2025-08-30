// src/services/signalr/handlers/DashboardEventHandler.js

/**
 * Handles SignalR events related to dashboard metrics and real-time updates
 * Extracted from useRealTimeDashboard to separate concerns
 */
class DashboardEventHandler {
  constructor() {
    // Set of callback functions that subscribe to dashboard events
    this.subscribers = new Set();
    
    // Map of event names to handler methods
    this.eventHandlers = new Map([
      // Dashboard-specific events
      ['DashboardMetricsUpdated', this.handleDashboardMetrics.bind(this)],
      ['SystemHealthUpdate', this.handleSystemHealthUpdate.bind(this)],
      ['SystemMetrics', this.handleSystemMetrics.bind(this)], // Alias for SystemHealthUpdate
      ['QueueUpdate', this.handleQueueUpdate.bind(this)],
      ['AuditLogCreated', this.handleAuditLogCreated.bind(this)],
      
      // System health events
      ['SystemHealth', this.handleSystemHealth.bind(this)] // Initial response
    ]);
  }

  /**
   * Subscribe to dashboard events
   * @param {Function} callback - Function to call when events occur
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Main handler method called by SignalR connection manager
   * @param {string} eventName - Name of the SignalR event
   * @param {*} data - Event data
   * @param {string} hubName - Name of the hub that triggered the event
   */
  handleEvent(eventName, data, hubName) {
    const handler = this.eventHandlers.get(eventName);
    if (handler) {
      try {
        handler(data, hubName);
      } catch (error) {
        console.error(`Error handling dashboard event ${eventName} from ${hubName} hub:`, error);
      }
    }
  }

  /**
   * Notify all subscribers of a dashboard event
   * @param {string} eventType - Type of event that occurred
   * @param {*} data - Event data
   * @param {string} hubName - Name of the hub that triggered the event
   */
  notifySubscribers(eventType, data, hubName = null) {
    this.subscribers.forEach(callback => {
      try {
        callback(eventType, data, hubName);
      } catch (error) {
        console.error('Error notifying dashboard subscriber:', error);
      }
    });
  }

  // ====== EVENT HANDLERS ======

  handleDashboardMetrics(data, hubName) {
    console.log('📊 Real-time dashboard metrics received:', data);
    this.notifySubscribers('dashboard-update', data, hubName);
  }

  handleSystemHealthUpdate(data, hubName) {
    //console.log('🏥 Real-time system health received:', data);
    this.notifySubscribers('system-health-update', data, hubName);
  }

  handleSystemMetrics(data, hubName) {
    // Handle both SystemMetrics and SystemHealth events
    console.log('📈 System metrics received:', data);
    //this.notifySubscribers('system-health-update', data, hubName);
  }

  handleSystemHealth(data, hubName) {
    // Initial system health response
    console.log('💚 Initial system health received:', data);
    this.notifySubscribers('system-health-update', data, hubName);
  }

  handleQueueUpdate(data, hubName) {
    console.log('📋 Real-time queue update received:', data);
    
    // Transform queue data to match dashboard expectations
    const dashboardUpdate = {
      waitingVisitors: data.WaitingCount || 0,
      processingVisitors: data.ProcessingCount || 0,
      lastUpdated: new Date()
    };
    
    this.notifySubscribers('queue-update', dashboardUpdate, hubName);
    this.notifySubscribers('dashboard-update', dashboardUpdate, hubName);
  }

  handleAuditLogCreated(data, hubName) {
    console.log('📝 New audit log detected via SignalR:', data);
    this.notifySubscribers('audit-log-created', data, hubName);
  }

  /**
   * Get list of all supported event names
   * @returns {string[]} Array of event names this handler supports
   */
  getSupportedEvents() {
    return Array.from(this.eventHandlers.keys());
  }

  /**
   * Check if this handler supports a specific event
   * @param {string} eventName - Name of the event to check
   * @returns {boolean} True if event is supported
   */
  supportsEvent(eventName) {
    return this.eventHandlers.has(eventName);
  }

  /**
   * Get the number of active subscribers
   * @returns {number} Number of active subscribers
   */
  getSubscriberCount() {
    return this.subscribers.size;
  }
}

// Export singleton instance to match existing patterns
export default new DashboardEventHandler();
