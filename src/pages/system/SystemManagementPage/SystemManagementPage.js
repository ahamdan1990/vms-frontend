// src/pages/system/SystemManagementPage/SystemManagementPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/slices/uiSlice';

// Components
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';

// Icons
import {
  Cog6ToothIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

/**
 * Professional System Management Overview Page
 * Central hub for all system administration tasks and monitoring
 */
const SystemManagementPage = () => {
  const dispatch = useDispatch();
  
  // System health state
  const [systemHealth, setSystemHealth] = useState({
    overall: 98.5,
    database: 'Healthy',
    emailService: 'Operational', 
    qrGenerator: 'Active',
    documentScanner: 'Limited',
    lastHealthCheck: new Date()
  });

  // System statistics
  const [systemStats, setSystemStats] = useState({
    totalUsers: 156,
    activeLocations: 12,
    visitPurposes: 8,
    timeSlots: 24,
    lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000),
    systemUptime: '15 days, 4 hours'
  });

  useEffect(() => {
    dispatch(setPageTitle('System Management'));
    
    // Simulate periodic health checks
    const healthCheckInterval = setInterval(() => {
      setSystemHealth(prev => ({
        ...prev,
        lastHealthCheck: new Date()
      }));
    }, 30000);

    return () => clearInterval(healthCheckInterval);
  }, [dispatch]);

  
  // Helper function for relative time formatting
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getHealthBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'operational':
      case 'active':
        return <Badge color="green" size="sm">{status}</Badge>;
      case 'limited':
      case 'warning':
        return <Badge color="yellow" size="sm">{status}</Badge>;
      case 'down':
      case 'error':
        return <Badge color="red" size="sm">{status}</Badge>;
      default:
        return <Badge color="gray" size="sm">{status}</Badge>;
    }
  };
  
  // Management modules configuration
  const managementModules = [
    {
      id: 'configuration',
      title: 'System Configuration',
      description: 'Manage global system settings and preferences',
      icon: Cog6ToothIcon,
      href: '/system/config',
      color: 'bg-blue-100 text-blue-600',
      stats: 'Last updated 2 days ago'
    },
    {
      id: 'locations',
      title: 'Locations Management',
      description: 'Configure office locations and building settings',
      icon: MapPinIcon,
      href: '/system/locations',
      color: 'bg-green-100 text-green-600',
      stats: `${systemStats.activeLocations} active locations`
    },
    {
      id: 'visit-purposes',
      title: 'Visit Purposes',
      description: 'Define and manage visit categories and types',
      icon: DocumentTextIcon,
      href: '/system/visit-purposes',
      color: 'bg-purple-100 text-purple-600',
      stats: `${systemStats.visitPurposes} purpose types`
    },
    {
      id: 'time-slots',
      title: 'Time Slots',
      description: 'Configure availability windows and scheduling',
      icon: ClockIcon,
      href: '/system/time-slots',
      color: 'bg-orange-100 text-orange-600',
      stats: `${systemStats.timeSlots} time slots configured`
    },
    {
      id: 'escalation-rules',
      title: 'Escalation Rules',
      description: 'Configure alert escalation and notification rules',
      icon: ExclamationTriangleIcon,
      href: '/system/escalation-rules',
      color: 'bg-red-100 text-red-600',
      stats: 'Alert management'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: UserGroupIcon,
      href: '/users',
      color: 'bg-indigo-100 text-indigo-600',
      stats: `${systemStats.totalUsers} total users`
    },
    {
      id: 'audit',
      title: 'Audit & Monitoring',
      description: 'View system logs and audit trails',
      icon: ShieldCheckIcon,
      href: '/system/audit',
      color: 'bg-gray-100 text-gray-600',
      stats: 'Real-time monitoring'
    },
    {
      id: 'backup',
      title: 'Backup & Recovery',
      description: 'Manage database backups and system recovery',
      icon: CloudArrowUpIcon,
      href: '/system/backup',
      color: 'bg-cyan-100 text-cyan-600',
      stats: `Last backup ${formatRelativeTime(systemStats.lastBackup)}`
    },
    {
      id: 'analytics',
      title: 'System Analytics',
      description: 'View system performance and usage statistics',
      icon: ChartBarIcon,
      href: '/analytics',
      color: 'bg-yellow-100 text-yellow-600',
      stats: 'Live dashboard available'
    }
  ];


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Central hub for system administration and configuration
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            icon={<ArrowTopRightOnSquareIcon className="w-5 h-5" />}
          >
            System Status
          </Button>
          
          <Link to="/system/config">
            <Button
              icon={<Cog6ToothIcon className="w-5 h-5" />}
            >
              Configuration
            </Button>
          </Link>
        </div>
      </div>

      {/* System Health Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Health Overview</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Database</span>
              {getHealthBadge(systemHealth.database)}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Email Service</span>
              {getHealthBadge(systemHealth.emailService)}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">QR Generator</span>
              {getHealthBadge(systemHealth.qrGenerator)}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Document Scanner</span>
              {getHealthBadge(systemHealth.documentScanner)}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>System Uptime: {systemStats.systemUptime}</span>
            <span>Last Health Check: {formatRelativeTime(systemHealth.lastHealthCheck)}</span>
          </div>
        </Card>
      </motion.div>

      {/* Quick Statistics */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Active Locations</h3>
                <p className="text-2xl font-bold text-gray-900">{systemStats.activeLocations}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Visit Purposes</h3>
                <p className="text-2xl font-bold text-gray-900">{systemStats.visitPurposes}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Time Slots</h3>
                <p className="text-2xl font-bold text-gray-900">{systemStats.timeSlots}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div> */}

      {/* Management Modules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Management Modules</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {managementModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + (index * 0.1) }}
              >
                <Link
                  to={module.href}
                  className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${module.color}`}>
                      <module.icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {module.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {module.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {module.stats}
                      </p>
                    </div>
                    
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent System Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent System Activity</h3>
            <Link 
              to="/system/audit"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all activity →
            </Link>
          </div>
          
          <div className="space-y-3">
            {[
              {
                type: 'success',
                message: 'Automatic backup completed successfully',
                time: '2 hours ago',
                icon: CheckCircleIcon
              },
              {
                type: 'info', 
                message: 'New user account created: sarah.johnson@company.com',
                time: '4 hours ago',
                icon: UserGroupIcon
              },
              {
                type: 'warning',
                message: 'System configuration updated: email settings',
                time: '6 hours ago',
                icon: ExclamationTriangleIcon
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <activity.icon className={`w-4 h-4 ${
                    activity.type === 'success' ? 'text-green-600' :
                    activity.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SystemManagementPage;