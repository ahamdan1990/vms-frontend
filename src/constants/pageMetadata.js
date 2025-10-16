/**
 * Page Metadata Constants
 * Centralized metadata for SEO and page information
 */

// Default metadata for the application
export const DEFAULT_METADATA = {
  title: 'Visitor Management System',
  description: 'Comprehensive visitor management system with real-time tracking, camera integration, and analytics',
  keywords: 'visitor management, security, access control, camera integration, real-time tracking',
  author: 'VMS Development Team',
  viewport: 'width=device-width, initial-scale=1.0',
  robots: 'index, follow',
  language: 'en-US'
};

// Page-specific metadata
export const PAGE_METADATA = {
  // Dashboard
  dashboard: {
    title: 'Dashboard - Visitor Management System',
    description: 'Real-time dashboard showing visitor statistics, camera status, and system overview',
    keywords: 'dashboard, visitor statistics, real-time monitoring, system overview'
  },

  // Authentication
  login: {
    title: 'Login - Visitor Management System',
    description: 'Secure login to the Visitor Management System',
    keywords: 'login, authentication, security, access control'
  },
  
  register: {
    title: 'Register - Visitor Management System',
    description: 'Create a new account for the Visitor Management System',
    keywords: 'register, signup, new account, user registration'
  },

  forgotPassword: {
    title: 'Forgot Password - Visitor Management System',
    description: 'Reset your password for the Visitor Management System',
    keywords: 'forgot password, password reset, account recovery'
  },

  // Visitors
  visitors: {
    title: 'Visitors - Visitor Management System',
    description: 'Manage and track all visitors with comprehensive visitor management tools',
    keywords: 'visitors, visitor management, guest tracking, check-in, check-out'
  },

  visitorDetails: {
    title: 'Visitor Details - Visitor Management System',
    description: 'View detailed information about a specific visitor including visit history and documents',
    keywords: 'visitor details, visitor profile, visit history, visitor information'
  },

  checkIn: {
    title: 'Check In - Visitor Management System',
    description: 'Quick and easy visitor check-in process with digital forms and camera capture',
    keywords: 'check-in, visitor registration, arrival, guest entry'
  },

  // Cameras
  cameras: {
    title: 'Camera Management - Visitor Management System',
    description: 'Configure and manage security cameras with real-time monitoring and analytics',
    keywords: 'camera management, security cameras, video surveillance, monitoring'
  },

  cameraDetails: {
    title: 'Camera Details - Visitor Management System',
    description: 'View camera configuration, status, and manage camera-specific settings',
    keywords: 'camera details, camera configuration, video settings, camera status'
  },

  // Locations
  locations: {
    title: 'Location Management - Visitor Management System',
    description: 'Manage facility locations, buildings, and access points for visitor tracking',
    keywords: 'location management, buildings, facilities, access points, zones'
  },

  // Users and Administration
  users: {
    title: 'User Management - Visitor Management System',
    description: 'Manage system users, roles, and permissions for secure access control',
    keywords: 'user management, roles, permissions, access control, system users'
  },

  profile: {
    title: 'User Profile - Visitor Management System',
    description: 'View and edit your user profile information and preferences',
    keywords: 'user profile, account settings, personal information, preferences'
  },

  settings: {
    title: 'Settings - Visitor Management System',
    description: 'Configure system settings, preferences, and administrative options',
    keywords: 'settings, configuration, system preferences, administration'
  },

  // Analytics and Reports
  analytics: {
    title: 'Analytics - Visitor Management System',
    description: 'Comprehensive analytics and insights about visitor patterns and system usage',
    keywords: 'analytics, visitor insights, reports, statistics, data analysis'
  },

  reports: {
    title: 'Reports - Visitor Management System',
    description: 'Generate detailed reports on visitor activity, security events, and system performance',
    keywords: 'reports, visitor reports, security reports, data export, analytics'
  },

  // Notifications
  notifications: {
    title: 'Notifications - Visitor Management System',
    description: 'View and manage system notifications, alerts, and important messages',
    keywords: 'notifications, alerts, messages, system events, communication'
  },

  // Time Slots and Scheduling
  timeSlots: {
    title: 'Time Slots - Visitor Management System',
    description: 'Manage visitor appointment time slots and scheduling preferences',
    keywords: 'time slots, scheduling, appointments, visitor slots, booking'
  },

  // Invitations
  invitations: {
    title: 'Invitations - Visitor Management System',
    description: 'Send and manage visitor invitations with pre-registration capabilities',
    keywords: 'invitations, pre-registration, guest invites, visitor scheduling'
  },

  // System Monitoring
  systemHealth: {
    title: 'System Health - Visitor Management System',
    description: 'Monitor system health, performance metrics, and component status',
    keywords: 'system health, monitoring, performance, diagnostics, system status'
  },

  // Help and Support
  help: {
    title: 'Help & Support - Visitor Management System',
    description: 'Get help and support for using the Visitor Management System',
    keywords: 'help, support, documentation, user guide, assistance'
  },

  // Error Pages
  notFound: {
    title: 'Page Not Found - Visitor Management System',
    description: 'The requested page could not be found',
    keywords: '404, not found, error, missing page'
  },

  serverError: {
    title: 'Server Error - Visitor Management System',
    description: 'An internal server error occurred',
    keywords: '500, server error, internal error, system error'
  },

  accessDenied: {
    title: 'Access Denied - Visitor Management System',
    description: 'You do not have permission to access this resource',
    keywords: 'access denied, forbidden, unauthorized, permissions'
  }
};

// Helper function to get page metadata
export const getPageMetadata = (pageKey, customData = {}) => {
  const baseMetadata = PAGE_METADATA[pageKey] || {};
  const defaultData = DEFAULT_METADATA;
  
  return {
    ...defaultData,
    ...baseMetadata,
    ...customData
  };
};

// Helper function to format page title
export const formatPageTitle = (pageTitle, includeAppName = true) => {
  if (includeAppName) {
    return `${pageTitle} - ${DEFAULT_METADATA.title}`;
  }
  return pageTitle;
};

// Helper function to get meta tags for HTML head
export const getMetaTags = (metadata) => {
  return [
    { name: 'description', content: metadata.description },
    { name: 'keywords', content: metadata.keywords },
    { name: 'author', content: metadata.author },
    { name: 'viewport', content: metadata.viewport },
    { name: 'robots', content: metadata.robots },
    { name: 'language', content: metadata.language },
    
    // Open Graph tags
    { property: 'og:title', content: metadata.title },
    { property: 'og:description', content: metadata.description },
    { property: 'og:type', content: 'website' },
    
    // Twitter Card tags
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: metadata.title },
    { name: 'twitter:description', content: metadata.description }
  ];
};

const pageMetadata = {
  DEFAULT_METADATA,
  PAGE_METADATA,
  getPageMetadata,
  formatPageTitle,
  getMetaTags
};

export default pageMetadata;
