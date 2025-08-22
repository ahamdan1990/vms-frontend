// src/pages/dashboard/UnifiedDashboard/UnifiedDashboard.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/slices/uiSlice';

// Import existing page components - NO CHANGES TO THESE
import StaffDashboard from '../StaffDashboard/StaffDashboard';
import ReceptionistDashboard from '../../receptionist/ReceptionistDashboard';
import VisitorAnalyticsDashboard from '../../../components/analytics/VisitorAnalyticsDashboard';
import ExcelManagementPage from '../../admin/ExcelManagementPage';

// Import existing common components
import NotificationCenter from '../../../components/notifications/NotificationCenter';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';

// Import role constants
import { ROLES } from '../../../constants/role';

// Icons
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  UsersIcon,
  ShieldCheckIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

/**
 * Unified Dashboard Component
 * 
 * This component replaces both:
 * 1. Role-specific dashboards (Staff/Operator/Admin)
 * 2. IntegratedVisitorManagement dashboard
 * 
 * Features:
 * - Dynamic navigation based on role permissions
 * - Unified header with notifications
 * - Reuses ALL existing components without modification
 * - Role-based page visibility
 */
const UnifiedDashboard = () => {
  const dispatch = useDispatch();
  const { user, userRole, userName } = useAuth();
  const { 
    checkin, 
    visitor, 
    invitation, 
    audit, 
    systemConfig,
    bulkImport 
  } = usePermissions();
  
  // Navigation and UI state
  const [activeView, setActiveView] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // System state (for overview)
  const [systemStats, setSystemStats] = useState({
    todayVisitors: 24,
    activeVisitors: 7,
    pendingInvitations: 12,
    overdueVisitors: 2,
    systemAlerts: 1,
    lastUpdate: new Date()
  });

  // Set initial view based on user role
  useEffect(() => {
    dispatch(setPageTitle('Dashboard'));
    setActiveView(getDefaultView());
  }, [dispatch, userRole]);

  // Real-time data simulation (reused from IntegratedVisitorManagement)
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Navigation Configuration
   * Dynamically shows/hides navigation items based on role permissions
   */
  const getNavigationItems = () => {
    const items = [];

    // Staff gets their own lightweight dashboard
    if (userRole === ROLES.STAFF) {
      items.push({
        id: 'staff-dashboard',
        label: 'My Dashboard',
        icon: HomeIcon,
        description: 'Your invitations and visitors',
        show: true
      });
    }

    // Admin gets overview (system stats, quick actions)
    if (userRole === ROLES.ADMINISTRATOR) {
      items.push({
        id: 'overview',
        label: 'Overview',
        icon: HomeIcon,
        description: 'System overview and quick actions',
        show: true
      });
    }

    // Receptionist page - for Operators and Admins
    if (checkin.canProcess) {
      items.push({
        id: 'receptionist',
        label: 'Receptionist',
        icon: UsersIcon,
        description: 'Check-ins, walk-ins, and daily operations',
        show: true
      });
    }

    // Analytics - for all roles (with different permission levels)
    if (visitor.canRead) {
      items.push({
        id: 'analytics',
        label: 'Analytics',
        icon: ChartBarIcon,
        description: 'Visitor insights and reporting',
        show: true
      });
    }

    // Excel Management - Admin only
    if (userRole === ROLES.ADMINISTRATOR && bulkImport.canManage) {
      items.push({
        id: 'excel',
        label: 'Excel Management',
        icon: DocumentArrowDownIcon,
        description: 'Template downloads and bulk imports',
        show: true
      });
    }

    return items.filter(item => item.show);
  };

  // Remove getRoleConfig since we don't need header anymore
  // Get role-specific default view
  const getDefaultView = () => {
    switch (userRole) {
      case ROLES.STAFF:
        return 'staff-dashboard';
      case ROLES.OPERATOR:
        return 'receptionist';
      case ROLES.ADMINISTRATOR:
        return 'overview';
      default:
        return 'overview';
    }
  };

  /**
   * Overview Component - Professional Admin Dashboard
   */
  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Status Cards - Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-medium text-gray-600">Today's Visitors</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{systemStats.todayVisitors}</p>
              <p className="text-xs text-green-600 font-medium mt-1">↗ +12% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-medium text-gray-600">Active Now</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{systemStats.activeVisitors}</p>
              <p className="text-xs text-gray-500 mt-1">Currently on-site</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Pending</h3>
              <p className="text-2xl font-bold text-gray-900">{systemStats.pendingInvitations}</p>
              <p className="text-xs text-amber-600 font-medium mt-1">Awaiting approval</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Alerts</h3>
              <p className="text-2xl font-bold text-gray-900">{systemStats.overdueVisitors + systemStats.systemAlerts}</p>
              <p className="text-xs text-red-600 font-medium mt-1">Require attention</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <BellIconSolid className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions - Professional Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Admin Tools</span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveView('receptionist')}
            className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <UsersIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Receptionist</h4>
            <p className="text-xs text-gray-500">Visitor operations</p>
          </button>
          
          <button
            onClick={() => setActiveView('analytics')}
            className="group p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <ChartBarIcon className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Analytics</h4>
            <p className="text-xs text-gray-500">Insights & reports</p>
          </button>
          
          <button
            onClick={() => setActiveView('excel')}
            className="group p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
              <DocumentArrowDownIcon className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Excel Management</h4>
            <p className="text-xs text-gray-500">Import & export</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/system/management'}
            className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
              <CogIcon className="w-5 h-5 text-gray-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">System</h4>
            <p className="text-xs text-gray-500">Configuration</p>
          </button>
        </div>
      </motion.div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { name: 'Database Connection', status: 'Healthy', color: 'green' },
              { name: 'Email Service', status: 'Operational', color: 'green' },
              { name: 'QR Code Generator', status: 'Active', color: 'green' },
              { name: 'Document Scanner', status: 'Limited', color: 'yellow' }
            ].map((service, index) => (
              <div key={service.name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <span className="text-sm font-medium text-gray-700">{service.name}</span>
                <Badge color={service.color} size="sm">{service.status}</Badge>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { type: 'success', message: 'System backup completed successfully', time: '2h ago' },
              { type: 'info', message: 'New user account created', time: '4h ago' },
              { type: 'warning', message: 'Storage usage at 65%', time: '6h ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  /**
   * Render Navigation Tabs - Professional Design
   */
  const renderNavigation = () => {
    const navigationItems = getNavigationItems();

    return (
      <nav className="flex space-x-1" aria-label="Dashboard Navigation">
        {navigationItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`
              group relative px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
              flex items-center space-x-2 min-w-0 flex-1 justify-center
              ${activeView === item.id 
                ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
            aria-current={activeView === item.id ? 'page' : undefined}
          >
            <item.icon className={`
              w-5 h-5 flex-shrink-0 transition-colors duration-200
              ${activeView === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
            `} />
            <span className="truncate">{item.label}</span>
            
            {/* Active indicator */}
            {activeView === item.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-50 rounded-lg border border-blue-200 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </nav>
    );
  };

  /**
   * Render Active View Content
   */
  const renderActiveView = () => {
    switch (activeView) {
      case 'staff-dashboard':
        // Use existing StaffDashboard component - NO CHANGES
        return <StaffDashboard />;
        
      case 'overview':
        // Admin overview (similar to IntegratedVisitorManagement overview)
        return renderOverview();
        
      case 'receptionist':
        // Use existing ReceptionistDashboard component - NO CHANGES
        return <ReceptionistDashboard />;
        
      case 'analytics':
        // Use existing VisitorAnalyticsDashboard component - NO CHANGES
        return <VisitorAnalyticsDashboard />;
        
      case 'excel':
        // Use existing ExcelManagementPage component - NO CHANGES
        return <ExcelManagementPage />;
        
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs (only show if user has multiple pages) */}
      {getNavigationItems().length > 1 && (
        <div className="border-b border-gray-200 bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4">
            {renderNavigation()}
          </div>
        </div>
      )}
      
      {/* Active View Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[600px]"
        >
          {renderActiveView()}
        </motion.div>
      </AnimatePresence>

      {/* Notification Center */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationCenter
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedDashboard;