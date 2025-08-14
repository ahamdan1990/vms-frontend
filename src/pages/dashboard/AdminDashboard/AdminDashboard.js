// src/pages/dashboard/AdminDashboard/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/slices/uiSlice';
import Button from '../../../components/common/Button/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';

// Import stats selectors
import { selectUsersStatsSummary } from '../../../store/selectors/userSelectors';
import { selectVisitorStatistics } from '../../../store/selectors/visitorSelectors';

// Import actions to load stats
import { getUserStats } from '../../../store/slices/usersSlice';
import { getVisitorStatistics } from '../../../store/slices/visitorsSlice';

/**
 * Beautiful Admin Dashboard with comprehensive system overview and management tools
 */
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user, userName } = useAuth();
  const { 
    user: userPermissions, 
    systemConfig, 
    audit, 
    report,
    bulkImport,
    customField 
  } = usePermissions();
  
  // Get real data from selectors
  const userStats = useSelector(selectUsersStatsSummary);
  const visitorStats = useSelector(selectVisitorStatistics);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemData, setSystemData] = useState({
    systemHealth: 98.5,
    securityAlerts: 2,
    storageUsed: 65.2
  });

  // Load real data on mount
  useEffect(() => {
    dispatch(setPageTitle('Admin Dashboard'));
    dispatch(getUserStats());
    dispatch(getVisitorStatistics());
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [dispatch]);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'user_created',
      message: 'New user account created for Sarah Johnson',
      timestamp: '2 minutes ago',
      severity: 'info'
    },
    {
      id: 2,
      type: 'security_alert',
      message: 'Failed login attempts detected from IP 192.168.1.100',
      timestamp: '15 minutes ago',
      severity: 'warning'
    },
    {
      id: 3,
      type: 'system_update',
      message: 'Database backup completed successfully',
      timestamp: '1 hour ago',
      severity: 'success'
    },
    {
      id: 4,
      type: 'bulk_import',
      message: 'Bulk visitor import completed - 150 records processed',
      timestamp: '2 hours ago',
      severity: 'info'
    }
  ]);

  // useEffect(() => {
  //   dispatch(setPageTitle('Admin Dashboard'));
    
  //   // Update time every minute
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date());
  //   }, 60000);
    
  //   // Simulate real-time data updates
  //   const dataTimer = setInterval(() => {
  //     setSystemData(prev => ({
  //       ...prev,
  //       activeUsers: prev.activeUsers + (Math.random() > 0.7 ? 1 : 0),
  //       todaysVisitors: prev.todaysVisitors + (Math.random() > 0.8 ? 1 : 0),
  //       systemHealth: Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 0.1),
  //       securityAlerts: Math.max(0, prev.securityAlerts + (Math.random() > 0.95 ? 1 : 0))
  //     }));
  //   }, 30000);
    
  //   return () => {
  //     clearInterval(timer);
  //     clearInterval(dataTimer);
  //   };
  // }, [dispatch]);

  const adminActions = [
    {
      title: 'User Management',
      description: 'Manage user accounts and roles',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      href: '/users',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      permission: userPermissions.canManageUsers
    },
    {
      title: 'System Configuration',
      description: 'Configure system settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/system/config',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      permission: systemConfig.canManage
    },
    {
      title: 'Audit Logs',
      description: 'View system audit trails',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/system/audit',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      permission: audit.canRead
    },
    {
      title: 'Bulk Import',
      description: 'Import visitor data in bulk',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      href: '/bulk-import',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      permission: bulkImport.canManage
    },
    {
      title: 'Reports & Analytics',
      description: 'Generate system reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      href: '/reports',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      permission: report.canGenerate
    },
    {
      title: 'Custom Fields',
      description: 'Manage form customization',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      href: '/custom-fields',
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      permission: customField.canManage
    }
  ];

  const availableActions = adminActions.filter(action => action.permission);

  const StatCard = ({ title, value, icon, color, trend, trendColor, isLive = false, unit = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {isLive && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">LIVE</span>
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}
            {unit && <span className="text-lg font-normal text-gray-600">{unit}</span>}
          </p>
          {trend && (
            <p className={`text-sm font-medium ${trendColor} mt-1`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`w-14 h-14 ${color} rounded-lg flex items-center justify-center text-white shadow-md`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const QuickActionCard = ({ action, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Link
        to={action.href}
        className={`block ${action.color} ${action.hoverColor} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1`}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            {action.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{action.title}</h3>
            <p className="text-sm opacity-90">{action.description}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  const ActivityItem = ({ activity, index }) => {
    const severityConfig = {
      info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' },
      success: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500' },
      warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-500' },
      error: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500' }
    };

    const config = severityConfig[activity.severity] || severityConfig.info;

    const getIcon = (type) => {
      switch (type) {
        case 'user_created':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          );
        case 'security_alert':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          );
        case 'system_update':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        case 'bulk_import':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          );
        default:
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        className={`border rounded-lg p-4 ${config.bg} ${config.border}`}
      >
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.icon} bg-white`}>
            {getIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
            <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {userName?.split(' ')[0] || 'Administrator'}! ⚡
              </h1>
              <p className="text-indigo-100 mt-2">
                System Administration • {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-indigo-100 text-sm">System Health</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{systemData.systemHealth}%</p>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={userStats?.total || 0}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            color="bg-blue-500"
            trend={userStats?.totalChange ? `${userStats.totalChange > 0 ? '+' : ''}${userStats.totalChange} this month` : undefined}
            trendColor={userStats?.totalChange > 0 ? "text-green-600" : "text-red-600"}
          />
          
          <StatCard
            title="Active Users"
            value={userStats?.active || 0}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="bg-green-500"
            isLive={true}
          />
          
          <StatCard
            title="Total Visitors"
            value={visitorStats?.total || 0}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            color="bg-indigo-500"
            trend={visitorStats?.todayCount ? `${visitorStats.todayCount} today` : undefined}
            trendColor="text-blue-600"
          />
          
          <StatCard
            title="Storage Used"
            value={systemData.storageUsed}
            unit="%"
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            }
            color="bg-purple-500"
            trend="Within limits"
            trendColor="text-green-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Actions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Administration Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableActions.map((action, index) => (
                  <QuickActionCard key={action.title} action={action} index={index} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Activity
                </h2>
                <Link
                  to="/system/audit"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition-colors"
                >
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={activity.id} activity={activity} index={index} />
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link to="/system/audit">
                  <Button
                    variant="outline"
                    fullWidth
                    className="transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Detailed Audit Logs
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* System Health Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6"
        >
          <div className="flex items-start">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center mr-4 mt-1">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">System Status: Optimal Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-indigo-800 text-sm">
                <ul className="space-y-1">
                  <li>• All services running normally</li>
                  <li>• Database performance optimal</li>
                  <li>• Security monitoring active</li>
                </ul>
                <ul className="space-y-1">
                  <li>• Backup systems operational</li>
                  <li>• API response times normal</li>
                  <li>• User sessions stable</li>
                </ul>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <Link
                  to="/system/health"
                  className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-200 transition-colors"
                >
                  View Detailed Health Report
                </Link>
                <Link
                  to="/system/backup"
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-md hover:bg-green-200 transition-colors"
                >
                  Backup Management
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange-600">0</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Visitors</p>
                <p className="text-2xl font-bold text-blue-600">{systemData.todaysVisitors}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold text-green-600">{systemData.totalVisitors.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-indigo-600">{systemData.systemHealth}%</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;