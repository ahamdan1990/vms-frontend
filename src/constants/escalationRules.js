// src/constants/escalationRules.js
/**
 * Escalation Rules Constants
 * Matching backend enums from NotificationEnums.cs
 */

// Alert Types - matching NotificationAlertType enum
export const ALERT_TYPES = {
  VisitorArrival: 'Visitor Arrival',
  VipArrival: 'VIP Arrival',
  UnknownFace: 'Unknown Face',
  BlacklistAlert: 'Blacklist Alert',
  VisitorCheckedIn: 'Visitor Checked In',
  VisitorCheckedOut: 'Visitor Checked Out',
  InvitationPendingApproval: 'Invitation Pending Approval',
  InvitationApproved: 'Invitation Approved',
  InvitationRejected: 'Invitation Rejected',
  SystemAlert: 'System Alert',
  FRSystemOffline: 'FR System Offline',
  CapacityAlert: 'Capacity Alert',
  EmergencyAlert: 'Emergency Alert',
  ManualOverride: 'Manual Override',
  VisitorOverstay: 'Visitor Overstay',
  BadgePrintingError: 'Badge Printing Error',
  Custom: 'Custom Alert'
};

// Alert Priorities - matching AlertPriority enum
export const ALERT_PRIORITIES = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical',
  Emergency: 'Emergency'
};

// Escalation Actions - matching EscalationAction enum
export const ESCALATION_ACTIONS = {
  EscalateToRole: 'Escalate to Role',
  EscalateToUser: 'Escalate to User',
  SendEmail: 'Send Email',
  SendSMS: 'Send SMS',
  CreateHighPriorityAlert: 'Create High Priority Alert',
  LogCriticalEvent: 'Log Critical Event'
};

// User Roles for target roles
export const TARGET_ROLES = {
  Staff: 'Staff',
  Operator: 'Operator', 
  Administrator: 'Administrator',
  Security: 'Security',
  Manager: 'Manager'
};

// Priority levels for display
export const PRIORITY_LEVELS = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
  5: 'Emergency'
};

// Priority colors for UI
export const PRIORITY_COLORS = {
  Emergency: 'red',
  Critical: 'red',
  High: 'orange',
  Medium: 'yellow',
  Low: 'gray'
};

// Alert type categories for grouping
export const ALERT_CATEGORIES = {
  VISITOR: [
    'VisitorArrival',
    'VipArrival',
    'VisitorCheckedIn',
    'VisitorCheckedOut',
    'VisitorOverstay'
  ],
  SECURITY: [
    'UnknownFace',
    'BlacklistAlert',
    'EmergencyAlert'
  ],
  SYSTEM: [
    'SystemAlert',
    'FRSystemOffline',
    'BadgePrintingError'
  ],
  INVITATION: [
    'InvitationPendingApproval',
    'InvitationApproved',
    'InvitationRejected'
  ],
  CAPACITY: [
    'CapacityAlert'
  ],
  OTHER: [
    'ManualOverride',
    'Custom'
  ]
};

// Default escalation rule values
export const DEFAULT_ESCALATION_RULE = {
  ruleName: '',
  alertType: '',
  alertPriority: 'Medium',
  targetRole: '',
  locationId: null,
  escalationDelayMinutes: 5,
  action: '',
  escalationTargetRole: '',
  escalationTargetUserId: null,
  escalationEmails: '',
  escalationPhones: '',
  maxAttempts: 3,
  isEnabled: true,
  rulePriority: 10,
  configuration: ''
};

export default {
  ALERT_TYPES,
  ALERT_PRIORITIES,
  ESCALATION_ACTIONS,
  TARGET_ROLES,
  PRIORITY_LEVELS,
  PRIORITY_COLORS,
  ALERT_CATEGORIES,
  DEFAULT_ESCALATION_RULE
};
