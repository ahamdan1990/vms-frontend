// src/pages/system/SystemManagementPage/SystemManagementPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setPageTitle } from '../../../store/slices/uiSlice';

// Components
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';

// Services
import systemService from '../../../services/systemService';
import useRealTimeDashboard from '../../../hooks/useRealTimeDashboard';

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
  const { t } = useTranslation('system');
  const dispatch = useDispatch();
  
  // Real-time system data using SignalR
  const {
    systemHealth: realTimeSystemHealth,
    recentActivity,
    lastUpdated,
    isLoading,
    error: systemError,
    refresh
  } = useRealTimeDashboard({
    enableAutoRefresh: true,
    onSystemHealthUpdate: (health) => {
      console.log('System health updated:', health);
    },
    onError: (error) => {
      console.error('System management error:', error);
    }
  });

  // Local state for system health (parsed from real-time data)
  const [systemHealth, setSystemHealth] = useState({
    overall: t('common:loading.data'),
    database: t('common:loading.data'),
    emailService: t('common:loading.data'),
    qrGenerator: t('common:loading.data'),
    documentScanner: t('common:loading.data'),
    lastHealthCheck: new Date(),
    loading: true
  });

  // Local state for system statistics 
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeLocations: 0,
    visitPurposes: 0,
    timeSlots: 0,
    lastBackup: new Date(),
    systemUptime: t('common:loading.data'),
    loading: true
  });

  useEffect(() => {
    dispatch(setPageTitle(t('systemManagement.title')));
  }, [dispatch, t]);

  // Fetch system health data (initial and when real-time data changes)
  useEffect(() => {
    let isMounted = true;

    const fetchSystemData = async () => {
      try {
        // Fetch real system health data
        const healthData = await systemService.getSystemHealth();
        const parsedHealth = systemService.parseHealthData(healthData);
        
        if (isMounted) {
          setSystemHealth({
            ...parsedHealth,
            loading: false
          });
        }

        // Fetch system statistics
        const stats = await systemService.getSystemStatistics();
        
        if (isMounted) {
          setSystemStats({
            ...stats,
            loading: false
          });
        }
      } catch (error) {
        console.error('Failed to fetch system data:', error);
        if (isMounted) {
          setSystemHealth(prev => ({
            ...prev,
            overall: t('common:alerts.error'),
            database: t('common:alerts.error'),
            loading: false
          }));
          setSystemStats(prev => ({
            ...prev,
            loading: false
          }));
        }
      }
    };

    // Initial fetch
    fetchSystemData();
    
    // Update when real-time system health changes
    if (realTimeSystemHealth) {
      if (isMounted) {
        setSystemHealth(prev => ({
          ...prev,
          ...realTimeSystemHealth,
          loading: false
        }));
      }
    }

    return () => {
      isMounted = false;
    };
  }, [realTimeSystemHealth, t]);

  
  // Helper function for relative time formatting
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return t('systemManagement.justNow');
    if (hours < 24) return t('systemManagement.hoursAgo', { count: hours });
    const days = Math.floor(hours / 24);
    return t('systemManagement.daysAgo', { count: days });
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
      title: t('systemManagement.mod_configuration_title'),
      description: t('systemManagement.mod_configuration_desc'),
      icon: Cog6ToothIcon,
      href: '/system/config',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
      stats: t('systemManagement.mod_configuration_stats')
    },
    {
      id: 'locations',
      title: t('systemManagement.mod_locations_title'),
      description: t('systemManagement.mod_locations_desc'),
      icon: MapPinIcon,
      href: '/system/locations',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
      stats: t('systemManagement.mod_locations_stats', { count: systemStats.activeLocations })
    },
    {
      id: 'visit-purposes',
      title: t('systemManagement.mod_visitPurposes_title'),
      description: t('systemManagement.mod_visitPurposes_desc'),
      icon: DocumentTextIcon,
      href: '/system/visit-purposes',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
      stats: t('systemManagement.mod_visitPurposes_stats', { count: systemStats.visitPurposes })
    },
    {
      id: 'time-slots',
      title: t('systemManagement.mod_timeSlots_title'),
      description: t('systemManagement.mod_timeSlots_desc'),
      icon: ClockIcon,
      href: '/system/time-slots',
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
      stats: t('systemManagement.mod_timeSlots_stats', { count: systemStats.timeSlots })
    },
    {
      id: 'escalation-rules',
      title: t('systemManagement.mod_escalation_title'),
      description: t('systemManagement.mod_escalation_desc'),
      icon: ExclamationTriangleIcon,
      href: '/system/escalation-rules',
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
      stats: t('systemManagement.mod_escalation_stats')
    },
    {
      id: 'users',
      title: t('systemManagement.mod_users_title'),
      description: t('systemManagement.mod_users_desc'),
      icon: UserGroupIcon,
      href: '/users',
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
      stats: t('systemManagement.mod_users_stats', { count: systemStats.totalUsers })
    },
    {
      id: 'audit',
      title: t('systemManagement.mod_audit_title'),
      description: t('systemManagement.mod_audit_desc'),
      icon: ShieldCheckIcon,
      href: '/system/audit',
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-200',
      stats: t('systemManagement.mod_audit_stats')
    },
    {
      id: 'backup',
      title: t('systemManagement.mod_backup_title'),
      description: t('systemManagement.mod_backup_desc'),
      icon: CloudArrowUpIcon,
      href: '/system/backup',
      color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-200',
      stats: t('systemManagement.mod_backup_stats', { time: formatRelativeTime(systemStats.lastBackup) })
    },
    {
      id: 'analytics',
      title: t('systemManagement.mod_analytics_title'),
      description: t('systemManagement.mod_analytics_desc'),
      icon: ChartBarIcon,
      href: '/analytics',
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300',
      stats: t('systemManagement.mod_analytics_stats')
    }
  ];


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('systemManagement.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('systemManagement.subtitle')}
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button
            variant="outline"
            icon={<ArrowTopRightOnSquareIcon className="w-5 h-5" />}
          >
            {t('systemManagement.systemStatus')}
          </Button>
          
          <Link to="/system/config">
            <Button
              icon={<Cog6ToothIcon className="w-5 h-5" />}
            >
              {t('systemManagement.configuration')}
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('systemManagement.healthOverview')}</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-300 font-medium">{t('systemManagement.allOperational')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/60 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('systemManagement.database')}</span>
              {getHealthBadge(systemHealth.database)}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/60 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('systemManagement.emailService')}</span>
              {getHealthBadge(systemHealth.emailService)}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/60 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('systemManagement.qrGenerator')}</span>
              {getHealthBadge(systemHealth.qrGenerator)}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/60 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('systemManagement.documentScanner')}</span>
              {getHealthBadge(systemHealth.documentScanner)}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{t('systemManagement.uptime', { value: systemStats.systemUptime })}</span>
            <span>{t('systemManagement.lastHealthCheck', { time: formatRelativeTime(systemHealth.lastHealthCheck) })}</span>
          </div>
        </Card>
      </motion.div>

      {/* Management Modules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('systemManagement.modules')}</h3>
          
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
                  className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900/60"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${module.color}`}>
                      <module.icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                        {module.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {module.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('systemManagement.recentActivity')}</h3>
            <Link 
              to="/system/audit"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-colors"
            >
              {t('systemManagement.viewAllActivity')}
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-lg"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      activity.type === 'success'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : activity.type === 'warning'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30'
                        : activity.type === 'error'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}
                  >
                    {activity.type === 'success' && <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-300" />}
                    {activity.type === 'warning' && <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-300" />}
                    {activity.type === 'error' && <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-300" />}
                    {activity.type === 'info' && <UserGroupIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('systemManagement.noRecentActivity')}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SystemManagementPage;

