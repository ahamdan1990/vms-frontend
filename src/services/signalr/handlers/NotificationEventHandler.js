// src/services/signalr/handlers/NotificationEventHandler.js
import { store } from '../../../store/store';
import { addNotificationWithDesktop, showSuccessToast, showErrorToast, showWarningToast } from '../../../store/slices/notificationSlice';

/**
 * Handles SignalR events that result in user notifications
 * Extracted from SignalRConnectionManager to separate concerns
 */
class NotificationEventHandler {
  constructor() {
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
      
      // Common Events
      ['Error', this.handleError.bind(this)]
    ]);
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
      message: `${data.VisitorName} has checked in at ${data.Location}`,
      priority: 'low',
      data: data,
      actions: [
        { label: 'View Details', action: 'view_visitor' }
      ]
    }));
  }

  handleVisitorCheckOut(data) {
    store.dispatch(addNotificationWithDesktop({
      type: 'visitor_checkout',
      title: 'Visitor Checked Out',
      message: `${data.VisitorName} has checked out at ${data.CheckOutTime}`,
      priority: 'low',
      data: data
    }));
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
