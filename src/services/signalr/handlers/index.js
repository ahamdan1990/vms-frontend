// src/services/signalr/handlers/index.js

import NotificationEventHandler from './NotificationEventHandler';
import DashboardEventHandler from './DashboardEventHandler';

/**
 * Central registry for all SignalR event handlers
 * Provides a unified interface for registering and handling events
 */
class EventHandlerRegistry {
  constructor() {
    this.handlers = [
      NotificationEventHandler,
      DashboardEventHandler
    ];
  }

  /**
   * Handle an event by delegating to appropriate handlers
   * @param {string} eventName - Name of the SignalR event
   * @param {*} data - Event data
   * @param {string} hubName - Name of the hub that triggered the event
   */
  handleEvent(eventName, data, hubName) {
    let handlerFound = false;

    this.handlers.forEach(handler => {
      if (handler.supportsEvent && handler.supportsEvent(eventName)) {
        handler.handleEvent(eventName, data, hubName);
        handlerFound = true;
      }
    });

    if (!handlerFound) {
      console.log(`No handler found for event: ${eventName} from ${hubName} hub`);
    }
  }

  /**
   * Get all supported events from all handlers
   * @returns {string[]} Array of all supported event names
   */
  getAllSupportedEvents() {
    const events = new Set();
    
    this.handlers.forEach(handler => {
      if (handler.getSupportedEvents) {
        handler.getSupportedEvents().forEach(event => events.add(event));
      }
    });

    return Array.from(events);
  }

  /**
   * Get notification handler instance
   * @returns {NotificationEventHandler} Notification handler instance
   */
  getNotificationHandler() {
    return NotificationEventHandler;
  }

  /**
   * Get dashboard handler instance
   * @returns {DashboardEventHandler} Dashboard handler instance
   */
  getDashboardHandler() {
    return DashboardEventHandler;
  }
}

// Export singleton instance and individual handlers
export default new EventHandlerRegistry();
export { NotificationEventHandler, DashboardEventHandler };
