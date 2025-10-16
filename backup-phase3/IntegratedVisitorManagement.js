// src/pages/IntegratedVisitorManagement.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import ReceptionistDashboard from './receptionist/ReceptionistDashboard';
import VisitorAnalyticsDashboard from '../components/analytics/VisitorAnalyticsDashboard';
import ExcelManagementPage from './admin/ExcelManagementPage';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';
import Card from '../components/common/Card/Card';
import Button from '../components/common/Button/Button';
import Badge from '../components/common/Badge/Badge';

// Icons
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  BellIcon,
  CogIcon,
  QrCodeIcon,
  CameraIcon,
  DocumentTextIcon,
  UsersIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

// Utils
import formatters from '../utils/formatters';

/**
 * Integrated Visitor Management System
 * Unified dashboard combining all features:
 * - Receptionist operations
 * - Analytics and reporting
 * - Excel management
 * - Real-time notifications
 * - Quick actions and overview
 */
const IntegratedVisitorManagement = () => {
  // Navigation state
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'receptionist', 'analytics', 'excel'
  const [showNotifications, setShowNotifications] = useState(false);
  
  // System state
  const [systemStats, setSystemStats] = useState({
    todayVisitors: 24,
    activeVisitors: 7,
    pendingInvitations: 12,
    overdueVisitors: 2,
    systemAlerts: 1,
    lastUpdate: new Date()
  });

  // Real-time data simulation
  const [realtimeData, setRealtimeData] = useState({
    recentActivity: [
      {
        id: 1,
        type: 'checkin',
        visitor: 'John Smith',
        company: 'Tech Corp',
        time: new Date(Date.now() - 5 * 60 * 1000),
        host: 'Sarah Johnson'
      },
      {
        id: 2,
        type: 'invitation_sent',
        visitor: 'Emma Wilson',
        company: 'Design Studio',
        time: new Date(Date.now() - 15 * 60 * 1000),
        host: 'Mike Davis'
      },
      {
        id: 3,
        type: 'document_scanned',
        visitor: 'Robert Brown',
        documentType: 'ID Card',
        time: new Date(Date.now() - 25 * 60 * 1000)
      }
    ],
    quickActions: [
      { id: 'qr_scan', label: 'QR Scanner', icon: QrCodeIcon, color: 'blue', count: 0 },
      { id: 'walk_in', label: 'Walk-in Registration', icon: UserGroupIcon, color: 'green', count: 0 },
      { id: 'document_scan', label: 'Document Scanner', icon: DocumentTextIcon, color: 'purple', count: 0 },
      { id: 'excel_import', label: 'Excel Import', icon: DocumentArrowDownIcon, color: 'orange', count: 0 },
      { id: 'test_notifications', label: 'Test Notifications', icon: BellIcon, color: 'indigo', count: 0 }
    ]
  });

  const { toast, visitor } = useNotifications();

  // Navigation items
  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: HomeIcon,
      description: 'System overview and quick actions'
    },
    {
      id: 'receptionist',
      label: 'Receptionist',
      icon: UsersIcon,
      description: 'Check-ins, walk-ins, and daily operations'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      description: 'Visitor insights and reporting'
    },
    {
      id: 'excel',
      label: 'Excel Management',
      icon: DocumentArrowDownIcon,
      description: 'Template downloads and bulk imports'
    }
  ];

  // Load system data
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Simulate real-time notifications
  /*useEffect(() => {
    const notificationTimer = setTimeout(() => {
      // Simulate visitor check-in notification
      visitor.checkedIn('Alice Cooper', 'Tech Division');
    }, 5000);

    const overdueTimer = setTimeout(() => {
      // Simulate overdue visitor notification
      visitor.overdue('Bob Johnson', 15);
    }, 10000);

    return () => {
      clearTimeout(notificationTimer);
      clearTimeout(overdueTimer);
    };
  }, [visitor]);*/

  // Handle quick actions
  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'qr_scan':
        setActiveView('receptionist');
        toast.info('QR Scanner activated', { title: 'Quick Action' });
        break;
      case 'walk_in':
        setActiveView('receptionist');
        toast.info('Walk-in registration ready', { title: 'Quick Action' });
        break;
      case 'document_scan':
        setActiveView('receptionist');
        toast.info('Document scanner ready', { title: 'Quick Action' });
        break;
      case 'excel_import':
        setActiveView('excel');
        toast.info('Excel management opened', { title: 'Quick Action' });
        break;
      case 'test_notifications':
        // Demo all notification types
        setTimeout(() => toast.success('System operational!'), 100);
        setTimeout(() => toast.warning('Check visitor capacity'), 600);
        setTimeout(() => toast.info('New feature available'), 1100);
        setTimeout(() => toast.error('Demo error message'), 1600);
        break;
      default:
        toast.info(`${actionId} action triggered`);
    }
  };

  // Render system status
  const renderSystemStatus = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Today's Visitors</h3>
            <p className="text-3xl font-bold text-blue-600">{systemStats.todayVisitors}</p>
            <p className="text-xs text-gray-500 mt-1">+12% from yesterday</p>
          </div>
          <UsersIcon className="w-12 h-12 text-blue-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Active Now</h3>
            <p className="text-3xl font-bold text-green-600">{systemStats.activeVisitors}</p>
            <p className="text-xs text-gray-500 mt-1">Currently on-site</p>
          </div>
          <ShieldCheckIcon className="w-12 h-12 text-green-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            <p className="text-3xl font-bold text-orange-600">{systemStats.pendingInvitations}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </div>
          <ClockIcon className="w-12 h-12 text-orange-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Alerts</h3>
            <p className="text-3xl font-bold text-red-600">{systemStats.overdueVisitors + systemStats.systemAlerts}</p>
            <p className="text-xs text-gray-500 mt-1">Require attention</p>
          </div>
          <BellIconSolid className="w-12 h-12 text-red-500" />
        </div>
      </Card>
    </div>
  );

  // Render quick actions
  const renderQuickActions = () => (
    <Card className="p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {realtimeData.quickActions.map(action => (
          <Button
            key={action.id}
            variant="outline"
            onClick={() => handleQuickAction(action.id)}
            className="h-20 flex-col space-y-2"
          >
            <action.icon className={`w-6 h-6 text-${action.color}-500`} />
            <span className="text-sm font-medium">{action.label}</span>
            {action.count > 0 && (
              <Badge color={action.color} size="sm">{action.count}</Badge>
            )}
          </Button>
        ))}
      </div>
    </Card>
  );

  // Render recent activity
  const renderRecentActivity = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {realtimeData.recentActivity.map(activity => (
          <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              {activity.type === 'checkin' && (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                </div>
              )}
              {activity.type === 'invitation_sent' && (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <QrCodeIcon className="w-5 h-5 text-blue-600" />
                </div>
              )}
              {activity.type === 'document_scanned' && (
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">
                  {activity.visitor}
                </p>
                {activity.company && (
                  <Badge color="gray" size="sm">{activity.company}</Badge>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                {activity.type === 'checkin' && `Checked in with ${activity.host}`}
                {activity.type === 'invitation_sent' && `Invitation sent by ${activity.host}`}
                {activity.type === 'document_scanned' && `${activity.documentType} scanned`}
              </p>
            </div>
            
            <div className="text-xs text-gray-400">
              {formatters.formatRelativeTime(activity.time)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  // Render navigation
  const renderNavigation = () => (
    <div className="flex flex-wrap gap-2 mb-8">
      {navigationItems.map(item => (
        <Button
          key={item.id}
          variant={activeView === item.id ? 'primary' : 'outline'}
          onClick={() => setActiveView(item.id)}
          icon={<item.icon className="w-5 h-5" />}
          className="flex-col h-auto py-3 px-4"
        >
          <span className="font-medium">{item.label}</span>
          <span className="text-xs mt-1 opacity-75">{item.description}</span>
        </Button>
      ))}
    </div>
  );

  // Render overview
  const renderOverview = () => (
    <div className="space-y-8">
      {renderSystemStatus()}
      {renderQuickActions()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderRecentActivity()}
        
        {/* System Health */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Connection</span>
              <Badge color="green">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Service</span>
              <Badge color="green">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">QR Code Generator</span>
              <Badge color="green">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Document Scanner</span>
              <Badge color="yellow">Limited</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Visitor Management System
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Integrated platform for comprehensive visitor management
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* System status indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">System Online</span>
              </div>
              
              {/* Last update time */}
              <span className="text-xs text-gray-500">
                Updated {formatters.formatRelativeTime(systemStats.lastUpdate)}
              </span>
              
              {/* Notifications */}
              <Button
                variant="ghost"
                onClick={() => setShowNotifications(!showNotifications)}
                icon={<BellIcon className="w-5 h-5" />}
                className="relative"
              >
                {(systemStats.overdueVisitors + systemStats.systemAlerts) > 0 && (
                  <Badge 
                    color="red" 
                    size="xs" 
                    className="absolute -top-1 -right-1"
                  >
                    {systemStats.overdueVisitors + systemStats.systemAlerts}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderNavigation()}
        
        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderOverview()}
            </motion.div>
          )}
          
          {activeView === 'receptionist' && (
            <motion.div
              key="receptionist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReceptionistDashboard />
            </motion.div>
          )}
          
          {activeView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VisitorAnalyticsDashboard />
            </motion.div>
          )}
          
          {activeView === 'excel' && (
            <motion.div
              key="excel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ExcelManagementPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

export default IntegratedVisitorManagement;
