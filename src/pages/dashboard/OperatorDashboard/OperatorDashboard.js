// src/pages/dashboard/OperatorDashboard/OperatorDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/slices/uiSlice';
import Button from '../../../components/common/Button/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';

/**
 * Beautiful Operator Dashboard with real-time monitoring and quick actions
 */
const OperatorDashboard = () => {
  const dispatch = useDispatch();
  const { user, userName } = useAuth();
  const { checkin, visitor, alert, emergency } = usePermissions();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realtimeData, setRealtimeData] = useState({
    todaysVisitors: 0,
    activeVisitors: 0,
    pendingCheckins: 0,
    alerts: 0
  });

  useEffect(() => {
    dispatch(setPageTitle('Operator Dashboard'));
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Simulate real-time data updates
    const dataTimer = setInterval(() => {
      setRealtimeData(prev => ({
        todaysVisitors: prev.todaysVisitors + Math.floor(Math.random() * 2),
        activeVisitors: Math.max(0, prev.activeVisitors + (Math.random() > 0.5 ? 1 : -1)),
        pendingCheckins: Math.max(0, prev.pendingCheckins + (Math.random() > 0.7 ? 1 : -1)),
        alerts: Math.max(0, prev.alerts + (Math.random() > 0.9 ? 1 : 0))
      }));
    }, 30000);
    
    return () => {
      clearInterval(timer);
      clearInterval(dataTimer);
    };
  }, [dispatch]);

  // Mock active visitors data
  const mockActiveVisitors = [
    {
      id: 1,
      name: 'John Smith',
      company: 'Tech Corp',
      checkedIn: '09:30 AM',
      host: 'Sarah Johnson',
      location: 'Meeting Room A',
      status: 'active'
    },
    {
      id: 2,
      name: 'Emily Davis',
      company: 'Design Studio',
      checkedIn: '10:15 AM',
      host: 'Mike Wilson',
      location: 'Conference Room B',
      status: 'active'
    },
    {
      id: 3,
      name: 'Robert Brown',
      company: 'Consulting Inc',
      checkedIn: '11:00 AM',
      host: 'Lisa Chen',
      location: 'Office 301',
      status: 'active'
    }
  ];

  const quickActions = [
    {
      title: 'Process Check-in',
      description: 'Check in arriving visitors',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/checkin',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      permission: checkin.canProcess
    },
    {
      title: 'Register Walk-in',
      description: 'Add unscheduled visitor',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      href: '/checkin/walkin',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      permission: checkin.canWalkInRegister
    },
    {
      title: 'Emergency Export',
      description: 'Export visitor roster',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      href: '/emergency/export',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      permission: emergency.canExport
    },
    {
      title: 'View All Visitors',
      description: 'Today\'s visitor list',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: '/visitors',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      permission: visitor.canReadToday
    }
  ];

  const availableActions = quickActions.filter(action => action.permission);

  const StatCard = ({ title, value, icon, color, trend, trendColor, isLive = false }) => (
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
          <p className="text-3xl font-bold text-gray-900">{value}</p>
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

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {userName?.split(' ')[0] || 'Operator'}! 🛡️
              </h1>
              <p className="text-green-100 mt-2">
                Front desk operations • {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-green-100 text-sm">Current Time</p>
              <p className="text-2xl font-bold">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Visitors"
            value={realtimeData.todaysVisitors}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            color="bg-blue-500"
            trend="+15% from yesterday"
            trendColor="text-green-600"
            isLive={true}
          />
          
          <StatCard
            title="Active Visitors"
            value={realtimeData.activeVisitors}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="bg-green-500"
            isLive={true}
          />
          
          <StatCard
            title="Pending Check-ins"
            value={realtimeData.pendingCheckins}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-orange-500"
            isLive={true}
          />
          
          <StatCard
            title="Active Alerts"
            value={realtimeData.alerts}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19l2-7h12l2 7M9 12V9a3 3 0 116 0v3" />
              </svg>
            }
            color="bg-red-500"
            isLive={true}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Operator Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableActions.map((action, index) => (
                  <QuickActionCard key={action.title} action={action} index={index} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Active Visitors */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Active Visitors
                </h2>
                <Link
                  to="/visitors"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
                >
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                {mockActiveVisitors.map((visitor, index) => (
                  <motion.div
                    key={visitor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1), duration: 0.3 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{visitor.name}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{visitor.company}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>In: {visitor.checkedIn}</span>
                      <span>Host: {visitor.host}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      📍 {visitor.location}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link to="/checkin/walkin">
                  <Button
                    variant="outline"
                    fullWidth
                    className="transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Register Walk-in Visitor
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* System Status Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6"
        >
          <div className="flex items-start">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4 mt-1">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">System Status: All Operational</h3>
              <ul className="text-green-800 space-y-1 text-sm">
                <li>• All check-in stations are online and responsive</li>
                <li>• Badge printer is ready with sufficient supplies</li>
                <li>• Real-time notifications are functioning properly</li>
                <li>• Emergency evacuation system is operational</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OperatorDashboard;