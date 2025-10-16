// src/pages/dashboard/StaffDashboard/StaffDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/slices/uiSlice';
import Button from '../../../components/common/Button/Button';

/**
 * Beautiful Staff Dashboard with role-specific widgets and quick actions
 */
const StaffDashboard = () => {
  console.log('🏠 StaffDashboard component rendering...');
  
  const dispatch = useDispatch();
  const { user, userName } = useAuth();
  const { invitation, profile, calendar } = usePermissions();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    console.log('🏠 StaffDashboard useEffect running, setting page title');
    dispatch(setPageTitle('Staff Dashboard'));
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [dispatch]);

  // Mock data - in real app, this would come from API
  const mockStats = {
    myInvitations: 12,
    activeVisits: 3,
    upcomingVisits: 8,
    thisWeekTotal: 25
  };

  const mockUpcomingVisits = [
    {
      id: 1,
      visitorName: 'John Smith',
      company: 'Tech Corp',
      date: 'Today',
      time: '2:00 PM',
      purpose: 'Business Meeting'
    },
    {
      id: 2,
      visitorName: 'Sarah Johnson',
      company: 'Design Studio',
      date: 'Tomorrow',
      time: '10:30 AM',
      purpose: 'Project Review'
    },
    {
      id: 3,
      visitorName: 'Mike Wilson',
      company: 'Consulting Inc',
      date: 'Friday',
      time: '3:15 PM',
      purpose: 'Consultation'
    }
  ];

  const quickActions = [
    {
      title: 'Create Invitation',
      description: 'Invite a new visitor',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      href: '/invitations/new',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      permission: invitation.canCreateSingle || invitation.canCreateSingleOwn
    },
    {
      title: 'View Calendar',
      description: 'Check your schedule',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/calendar',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      permission: calendar.canViewOwn
    },
    {
      title: 'My Profile',
      description: 'Update your information',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/profile',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      permission: profile.canUpdateOwn
    },
    {
      title: 'My Invitations',
      description: 'Manage your invitations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      href: '/invitations',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      permission: invitation.canReadOwn
    }
  ];

  const StatCard = ({ title, value, icon, color, change, changeColor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${changeColor} mt-1`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white shadow-md`}>
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

  const availableActions = quickActions.filter(action => action.permission);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {userName?.split(' ')[0] || 'Staff Member'}! 👋
              </h1>
              <p className="text-blue-100 mt-2">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-blue-100 text-sm">Current Time</p>
              <p className="text-xl font-semibold">
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="My Invitations"
            value={mockStats.myInvitations}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            color="bg-blue-500"
            change="+3 this week"
            changeColor="text-green-600"
          />
          
          <StatCard
            title="Active Visits"
            value={mockStats.activeVisits}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            color="bg-green-500"
          />
          
          <StatCard
            title="Upcoming Visits"
            value={mockStats.upcomingVisits}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="bg-orange-500"
          />
          
          <StatCard
            title="This Week Total"
            value={mockStats.thisWeekTotal}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            color="bg-purple-500"
            change="+15% from last week"
            changeColor="text-green-600"
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
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableActions.map((action, index) => (
                  <QuickActionCard key={action.title} action={action} index={index} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Upcoming Visits */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upcoming Visits
                </h2>
                <Link
                  to="/invitations"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
                >
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                {mockUpcomingVisits.map((visit, index) => (
                  <motion.div
                    key={visit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1), duration: 0.3 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{visit.visitorName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        visit.date === 'Today' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {visit.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{visit.company}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{visit.time}</span>
                      <span>{visit.purpose}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {invitation.canCreateSingleOwn && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link to="/invitations/new">
                    <Button
                      variant="outline"
                      fullWidth
                      className="transition-all duration-200 hover:shadow-md"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create New Invitation
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6"
        >
          <div className="flex items-start">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4 mt-1">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Tips</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Schedule invitations in advance to ensure smooth visitor processing</li>
                <li>• Include detailed visit purposes to help security and reception</li>
                <li>• Update your profile information to keep contact details current</li>
                <li>• Check your calendar regularly for upcoming appointments</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StaffDashboard;