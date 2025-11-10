// src/services/signalr/handlers/NotificationEventHandler.js
import { store } from '../../../store/store';
import { addNotificationWithDesktop, showSuccessToast, showErrorToast, showWarningToast } from '../../../store/slices/notificationSlice';

/**
 * Handles SignalR events that result in user notifications
 * Extracted from SignalRConnectionManager to separate concerns
 */
class NotificationEventHandler {
  constructor() {
    // Set of callback functions that subscribe to notification events
    this.subscribers = new Set();

    // Map of event names to handler methods
    this.eventHandlers = new Map([
      // Operator Hub Events
      ['VisitorArrival', this.handleVisitorArrival.bind(this)],
      ['VipAlert', this.handleVipAlert.bind(this)],
      ['UnknownFaceAlert', this.handleUnknownFaceAlert.bind(this)],
      ['FRSystemOffline', this.handleFRSystemOffline.bind(this)],
      ['CapacityAlert', this.handleCapacityAlert.bind(this)],
      ['AlertAcknowledged', this.handleAlertAcknowledged.bind(this)],
      ['OperatorRegistered', this.handleOperatorRegistered.bind(this)],
      ['VisitorDelayed', this.handleVisitorDelayed.bind(this)],
      ['VisitorNoShow', this.handleVisitorNoShow.bind(this)],
      
      // Host Hub Events
      ['UserNotification', this.handleUserNotification.bind(this)],
      ['InvitationStatusUpdate', this.handleInvitationStatusUpdate.bind(this)],
      ['VisitorCheckIn', this.handleVisitorCheckIn.bind(this)],
      ['VisitorCheckOut', this.handleVisitorCheckOut.bind(this)],
      ['HostRegistered', this.handleHostRegistered.bind(this)],
      
      // Security Hub Events
      ['SecurityAlert', this.handleSecurityAlert.bind(this)],
      ['EmergencyAlert', this.handleEmergencyAlert.bind(this)],
      ['SecurityRegistered', this.handleSecurityRegistered.bind(this)],
      ['SecurityAlertAcknowledged', this.handleSecurityAlertAcknowledged.bind(this)],
      
      // Admin Hub Events
      ['BulkApprovalCompleted', this.handleBulkApprovalCompleted.bind(this)],
      ['MaintenanceNotification', this.handleMaintenanceNotification.bind(this)],
      ['CriticalAlert', this.handleCriticalAlert.bind(this)],
      ['BulkNotification', this.handleBulkNotification.bind(this)],
      ['AdminRegistered', this.handleAdminRegistered.bind(this)],
      ['DashboardMetricsUpdated', this.handleDashboardMetricsUpdated.bind(this)],
      ['SystemHealth', this.handleSystemHealth.bind(this)],
      ['SystemMetrics', this.handleSystemMetrics.bind(this)],
      ['AnalyticsData', this.handleAnalyticsData.bind(this)],
      ['BulkApprovalResult', this.handleBulkApprovalResult.bind(this)],

      // Host Hub Additional Events
      ['TodaysVisitors', this.handleTodaysVisitors.bind(this)],

      // Operator Hub Additional Events
      ['VisitorQueueUpdate', this.handleVisitorQueueUpdate.bind(this)],

      // Security Hub Additional Events
      ['EmergencyRoster', this.handleEmergencyRoster.bind(this)],
      ['SecurityStatus', this.handleSecurityStatus.bind(this)],

      // Notification History Event (from Host Hub)
      ['NotificationHistory', this.handleNotificationHistory.bind(this)],
      ['NotificationAcknowledged', this.handleNotificationAcknowledged.bind(this)],

      // Common Events
      ['Error', this.handleError.bind(this)]
    ]);
  }

  /**
   * Subscribe to notification events
   * @param {Function} callback - Function to call when events occur
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers of a notification event
   * @param {string} eventType - Type of event that occurred
   * @param {*} data - Event data
   * @param {string} hubName - Name of the hub that triggered the event
   */
  notifySubscribers(eventType, data, hubName = null) {
    this.subscribers.forEach(callback => {
      try {
        callback(eventType, data, hubName);
      } catch (error) {
        console.error('Error notifying notification subscriber:', error);
      }
    });
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
        console.error(`Error handling ${eventName} event from ${hubName} hub:`, error);
        this.handleError(`Failed to process ${eventName} event: ${error.message}`, hubName);
      }
    }
  }

  // ====== OPERATOR HUB EVENT HANDLERS ======

  handleOperatorRegistered(data) {
    store.dispatch(showSuccessToast('Connected', 'You are now online as an operator'));
  }

  handleVisitorArrival(data) {
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
  }

  handleVipAlert(data) {
    store.dispatch(addNotificationWithDesktop({
      type: 'vip_arrival',
      title: 'VIP Arrival',
      message: `VIP ${data.VisitorName} has arrived at ${data.Location}`,
      priority: 'high',
      persistent: true,
      data: data,
      actions: [
        { label: 'Acknowledge', action: 'acknowledge_vip' },
        { label: 'View Details', action: 'view_visitor' }
      ]
    }));
  }

  handleUnknownFaceAlert(data) {
    store.dispatch(addNotificationWithDesktop({
      type: 'unknown_face',
      title: 'Unknown Person Detected',
      message: `Unknown person detected at ${data.CameraLocation}`,
      priority: 'medium',
      persistent: true,
      data: data,
      actions: [
        { label: 'Review', action: 'review_detection' },
        { label: 'Dismiss', action: 'dismiss_alert' }
      ]
    }));
  }

  handleFRSystemOffline(data, hubName) {
    const isSecurityHub = hubName === 'security';
    
    store.dispatch(addNotificationWithDesktop({
      type: 'system_alert',
      title: isSecurityHub ? 'SECURITY: FR System Offline' : 'Facial Recognition System Offline',
      message: isSecurityHub 
        ? 'Facial recognition system is offline. Manual security monitoring required.'
        : 'The facial recognition system is currently offline. Manual processing required.',
      priority: isSecurityHub ? 'high' : 'medium',
      persistent: true,
      data: data,
      actions: isSecurityHub ? [
        { label: 'Acknowledge', action: 'acknowledge_system_alert' },
        { label: 'Manual Override', action: 'manual_security_mode' }
      ] : [
        { label: 'Acknowledge', action: 'acknowledge_system_alert' },
        { label: 'Check Status', action: 'check_fr_status' }
      ]
    }));
  }

  handleCapacityAlert(data) {
    store.dispatch(addNotificationWithDesktop({
      type: 'capacity_alert',
      title: 'Capacity Alert',
      message: `${data.LocationName} is at ${data.PercentageFull}% capacity (${data.CurrentOccupancy}/${data.MaxCapacity})`,
      priority: data.PercentageFull >= 95 ? 'high' : 'medium',
      data: data,
      actions: [
        { label: 'View Location', action: 'view_location' },
        { label: 'Manage Capacity', action: 'manage_capacity' }
      ]
    }));
  }

  handleAlertAcknowledged(data) {
    store.dispatch(showSuccessToast('Alert Handled', 'Alert acknowledged by operator'));
  }

  handleVisitorDelayed(data) {
    store.dispatch(addNotificationWithDesktop({
      type: 'visitor_delayed',
      title: 'Visitor Delayed',
      message: `${data.VisitorName} is ${data.DelayMinutes} minutes late for their appointment`,
      priority: 'medium',
      persistent: true,
      data: data,
      actions: [
        { label: 'View Invitation', action: 'view_invitation' },
        { label: 'Contact Visitor', action: 'contact_visitor' }
      ]
    }));

    // Notify subscribers for dashboard updates
    this.notifySubscribers('visitor-delayed', data, 'operator');
  }

  handleVisitorNoShow(data) {
    store.dispatch(addNotificationWithDesktop({
      type: 'visitor_no_show',
      title: 'Visitor No-Show',
      message: `${data.VisitorName} has not arrived for their scheduled visit (${data.ScheduledTime})`,
      priority: 'high',
      persistent: true,
      data: data,
      actions: [
        { label: 'View Invitation', action: 'view_invitation' },
        { label: 'Mark as No-Show', action: 'mark_no_show' },
        { label: 'Contact Visitor', action: 'contact_visitor' }
      ]
    }));

    // Notify subscribers for dashboard updates
    this.notifySubscribers('visitor-no-show', data, 'operator');
  }

  // ====== HOST HUB EVENT HANDLERS ======

  handleHostRegistered(data) {
    console.log('Host registered:', data);
  }

  handleUserNotification(data) {
    store.dispatch(addNotificationWithDesktop({
      type: data.Type || 'visitor_update',
      title: data.Title || 'Visitor Update',
      message: data.Message,
      priority: data.Priority?.toLowerCase() || 'medium',
      data: data,
      actions: data.actions || []
    }));
  }

  handleInvitationStatusUpdate(data) {
    store.dispatch(addNotificationWithDesktop({
      type: data.Approved ? 'invitation_approved' : 'invitation_rejected',
      title: data.Approved ? 'Invitation Approved' : 'Invitation Rejected',
      message: data.Note || `Your invitation has been ${data.Approved ? 'approved' : 'rejected'}`,
      priority: 'medium',
      data: data,
      actions: [
        { label: 'View Details', action: 'view_invitation' }
      ]
    }));
  }

  handleVisitorCheckIn(data) {
    store.dispatch(addNotificationWithDesktop({
      type: 'visitor_checkin',
      title: 'Visitor Checked In',
      message: `${data.visitorName || data.VisitorName} has checked in`,
      priority: 'low',
      data: data,
      actions: [
        { label: 'View Details', action: 'view_visitor' }
      ]
    }));

    // Notify subscribers for dashboard updates
    this.notifySubscribers('visitor-checked-in', data, 'host');
  }

  handleVisitorCheckOut(data) {
    store.dispatch(addNotificationWithDesktop({
      type: 'visitor_checkout',
      title: 'Visitor Checked Out',
      message: `${data.visitorName || data.VisitorName} has checked out`,
      priority: 'low',
      data: data
    }));

    // Notify subscribers for dashboard updates
    this.notifySubscribers('visitor-checked-out', data, 'host');
  }

  handleNotificationHistory(data) {
    // Handle notification history response from backend
    // This is typically a response to GetNotificationHistory call
    console.log('Received notification history:', {
      days: data.Days,
      notificationCount: data.Notifications?.length || 0,
      timestamp: data.Timestamp
    });

    // You can dispatch this to Redux if needed for historical notification viewing
    // For now, just log it as it's mainly used for initial loading
  }

  // ====== SECURITY HUB EVENT HANDLERS ======

  handleSecurityRegistered(data) {
    console.log('Security registered:', data);
  }

  handleSecurityAlert(data) {
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
  }

  handleEmergencyAlert(data) {
    store.dispatch(addNotificationWithDesktop({
      type: 'emergency',
      title: `EMERGENCY: ${data.Type}`,
      message: data.Reason,
      priority: 'emergency',
      persistent: true,
      data: data
    }));
  }

  handleSecurityAlertAcknowledged(data) {
    console.log('Security alert acknowledged:', data);
  }

  // ====== ADMIN HUB EVENT HANDLERS ======

  handleAdminRegistered(data) {
    console.log('Admin registered:', data);
  }

  handleBulkApprovalCompleted(data) {
    store.dispatch(showSuccessToast(
      'Bulk Approval Complete', 
      `${data.ApprovedCount} invitations approved`
    ));
  }

  handleMaintenanceNotification(data) {
    store.dispatch(showWarningToast(
      'Maintenance Notice',
      data.Message,
      { persistent: true }
    ));
  }

  handleCriticalAlert(data) {
    store.dispatch(addNotificationWithDesktop({
      type: 'critical_alert',
      title: 'CRITICAL SYSTEM ALERT',
      message: data.Message,
      priority: 'emergency',
      persistent: true,
      data: data,
      actions: [
        { label: 'Investigate', action: 'investigate_critical' },
        { label: 'System Status', action: 'view_system_status' }
      ]
    }));
  }

  handleBulkNotification(data) {
    store.dispatch(addNotificationWithDesktop({
      type: data.Type || 'bulk_notification',
      title: data.Title || 'System Notification',
      message: data.Message,
      priority: data.Priority?.toLowerCase() || 'medium',
      data: data,
      persistent: data.Priority === 'High' || data.Priority === 'Critical'
    }));
  }

  handleDashboardMetricsUpdated(data) {
    console.log('Dashboard metrics updated:', {
      timestamp: data.GeneratedAt,
      activeVisitors: data.RealTimeMetrics?.ActiveVisitorsInSystem
    });

    // Notify subscribers for dashboard updates
    this.notifySubscribers('dashboard-metrics-updated', data, 'admin');
  }

  handleSystemHealth(data) {
    const isHealthy = data.Status === 'Healthy';

    if (!isHealthy) {
      store.dispatch(showWarningToast(
        'System Health Alert',
        data.Message || `System status: ${data.Status}`,
        { persistent: data.Status === 'Critical' }
      ));
    }

    // Notify subscribers for system health monitoring
    this.notifySubscribers('system-health', data, 'admin');
  }

  handleSystemMetrics(data) {
    console.log('System metrics received:', {
      cpuUsage: data.CpuUsage,
      memoryUsage: data.MemoryUsage,
      activeConnections: data.ActiveConnections
    });

    // Notify subscribers for monitoring dashboards
    this.notifySubscribers('system-metrics', data, 'admin');
  }

  handleAnalyticsData(data) {
    console.log('Analytics data received');

    // Notify subscribers (primarily for analytics dashboards)
    this.notifySubscribers('analytics-data', data, 'admin');
  }

  handleBulkApprovalResult(data) {
    const successCount = data.SuccessCount || 0;
    const failureCount = data.FailureCount || 0;

    if (failureCount > 0) {
      store.dispatch(showWarningToast(
        'Bulk Approval Completed',
        `${successCount} approved, ${failureCount} failed`,
        { duration: 6000 }
      ));
    } else {
      store.dispatch(showSuccessToast(
        'Bulk Approval Successful',
        `${successCount} invitations approved`
      ));
    }

    // Notify subscribers for list refreshes
    this.notifySubscribers('bulk-approval-result', data, 'admin');
  }

  // ====== HOST HUB ADDITIONAL EVENT HANDLERS ======

  handleTodaysVisitors(data) {
    console.log('Todays visitors data received:', {
      total: data.Total,
      checkedIn: data.CheckedIn,
      pending: data.Pending
    });

    // Notify subscribers for host dashboard updates
    this.notifySubscribers('todays-visitors', data, 'host');
  }

  // ====== OPERATOR HUB ADDITIONAL EVENT HANDLERS ======

  handleVisitorQueueUpdate(data) {
    console.log('Visitor queue updated:', {
      queueLength: data.QueueLength,
      waitingVisitors: data.WaitingVisitors
    });

    // Notify subscribers for operator dashboard updates
    this.notifySubscribers('visitor-queue-update', data, 'operator');
  }

  // ====== SECURITY HUB ADDITIONAL EVENT HANDLERS ======

  handleEmergencyRoster(data) {
    store.dispatch(addNotificationWithDesktop({
      type: 'emergency_roster',
      title: 'Emergency Roster Update',
      message: `Emergency roster has been updated. ${data.ActiveSecurityCount || 0} security personnel active.`,
      priority: 'high',
      persistent: true,
      data: data,
      actions: [
        { label: 'View Roster', action: 'view_emergency_roster' }
      ]
    }));

    // Notify subscribers for security dashboard updates
    this.notifySubscribers('emergency-roster', data, 'security');
  }

  handleSecurityStatus(data) {
    console.log('Security status update:', {
      status: data.Status,
      activePersonnel: data.ActivePersonnel
    });

    // Notify subscribers for security monitoring
    this.notifySubscribers('security-status', data, 'security');
  }

  // ====== NOTIFICATION EVENT HANDLERS ======

  handleNotificationAcknowledged(data) {
    console.log('Notification acknowledged:', {
      notificationId: data.NotificationId,
      acknowledgedBy: data.AcknowledgedBy
    });

    // Notify subscribers to update notification lists
    this.notifySubscribers('notification-acknowledged', data);
  }

  // ====== COMMON EVENT HANDLERS ======

  handleError(errorMessage, hubName) {
    // Don't show toast for permission errors during initial connection
    if (!errorMessage.includes('Insufficient permissions') && 
        !errorMessage.includes('security permissions') &&
        !errorMessage.includes('Authentication failed')) {
      store.dispatch(showErrorToast(
        `${hubName?.charAt(0).toUpperCase() + hubName?.slice(1)} Connection Error`, 
        errorMessage,
        { duration: 8000 }
      ));
    }
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
}

// Export singleton instance to match existing patterns
export default new NotificationEventHandler();
