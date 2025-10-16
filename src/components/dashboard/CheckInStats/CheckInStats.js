// src/components/dashboard/CheckInStats/CheckInStats.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Redux imports
import { getActiveInvitations } from '../../../store/slices/invitationsSlice';
import {
  selectActiveInvitations,
  selectActiveInvitationsLoading
} from '../../../store/selectors/invitationSelectors';

// Components
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';

// Icons
import {
  UserPlusIcon,
  UserMinusIcon,
  UserIcon,
  ClockIcon,
  TrendingUpIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/solid';

// Utils
import formatters from '../../../utils/formatters';

// Constants
import { CHECKIN_ROUTES } from '../../../constants/routeConstants';

/**
 * Check-in Statistics Component
 * Displays real-time visitor check-in statistics for dashboard
 * Shows current activity, today's summary, and quick actions
 */
const CheckInStats = ({ 
  refreshInterval = 30000, // 30 seconds
  showQuickActions = true,
  className = ''
}) => {
  const dispatch = useDispatch();

  // Redux selectors
  const activeInvitations = useSelector(selectActiveInvitations);
  const loading = useSelector(selectActiveInvitationsLoading);

  // Local state for computed statistics
  const [stats, setStats] = useState({
    activeVisitors: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    pendingCheckOuts: 0,
    averageVisitDuration: 0,
    peakHour: null,
    recentActivity: []
  });

  // Load active invitations on mount and set up refresh interval
  useEffect(() => {
    const loadData = () => {
      dispatch(getActiveInvitations());
    };

    loadData();
    const interval = setInterval(loadData, refreshInterval);

    return () => clearInterval(interval);
  }, [dispatch, refreshInterval]);

  // Calculate statistics when active invitations change
  useEffect(() => {
    if (activeInvitations && activeInvitations.length > 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Calculate basic stats
      const activeVisitors = activeInvitations.filter(invitation =>
        invitation.checkedInAt && !invitation.checkedOutAt
      ).length;

      const todayCheckIns = activeInvitations.filter(invitation =>
        invitation.checkedInAt && new Date(invitation.checkedInAt) >= today
      ).length;

      const todayCheckOuts = activeInvitations.filter(invitation =>
        invitation.checkedOutAt && new Date(invitation.checkedOutAt) >= today
      ).length;

      const pendingCheckOuts = activeInvitations.filter(invitation =>
        invitation.checkedInAt && !invitation.checkedOutAt
      ).length;

      // Calculate average visit duration for completed visits today
      const completedVisitsToday = activeInvitations.filter(invitation =>
        invitation.checkedInAt && invitation.checkedOutAt &&
        new Date(invitation.checkedInAt) >= today
      );

      let averageVisitDuration = 0;
      if (completedVisitsToday.length > 0) {
        const totalDuration = completedVisitsToday.reduce((sum, invitation) => {
          const checkIn = new Date(invitation.checkedInAt);
          const checkOut = new Date(invitation.checkedOutAt);
          return sum + (checkOut - checkIn);
        }, 0);
        averageVisitDuration = totalDuration / completedVisitsToday.length / (1000 * 60 * 60);
      }

      // Calculate peak hour
      const checkInsByHour = {};
      activeInvitations.forEach(invitation => {
        if (invitation.checkedInAt && new Date(invitation.checkedInAt) >= today) {
          const hour = new Date(invitation.checkedInAt).getHours();
          checkInsByHour[hour] = (checkInsByHour[hour] || 0) + 1;
        }
      });

      const peakHour = Object.keys(checkInsByHour).reduce((maxHour, hour) =>
        checkInsByHour[hour] > (checkInsByHour[maxHour] || 0) ? hour : maxHour
      , null);

      // Get recent activity (last 5 check-ins/check-outs)
      const recentActivity = activeInvitations
        .filter(invitation => invitation.checkedInAt)
        .sort((a, b) => {
          const aTime = new Date(a.checkedOutAt || a.checkedInAt);
          const bTime = new Date(b.checkedOutAt || b.checkedInAt);
          return bTime - aTime;
        })
        .slice(0, 5)
        .map(invitation => ({
          id: invitation.id,
          visitor: invitation.visitor,
          action: invitation.checkedOutAt ? 'checkout' : 'checkin',
          time: invitation.checkedOutAt || invitation.checkedInAt,
          subject: invitation.subject
        }));

      setStats({
        activeVisitors,
        todayCheckIns,
        todayCheckOuts,
        pendingCheckOuts,
        averageVisitDuration: Math.round(averageVisitDuration * 10) / 10,
        peakHour,
        recentActivity
      });
    }
  }, [activeInvitations]);

  // Format activity time
  const formatActivityTime = (time) => {
    const now = new Date();
    const activityTime = new Date(time);
    const diffMinutes = Math.floor((now - activityTime) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return formatters.formatDateTime(activityTime);
  };

  // Get activity icon
  const getActivityIcon = (action) => {
    return action === 'checkin' ? (
      <UserPlusIcon className="w-4 h-4 text-green-600" />
    ) : (
      <UserMinusIcon className="w-4 h-4 text-orange-600" />
    );
  };

  // Get activity badge
  const getActivityBadge = (action) => {
    return action === 'checkin' ? (
      <Badge variant="success" size="xs">Check In</Badge>
    ) : (
      <Badge variant="warning" size="xs">Check Out</Badge>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Visitors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-md">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Visitors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeVisitors}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Today's Check-ins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <UserPlusIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayCheckIns}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Pending Check-outs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-md">
                <ClockIconSolid className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Check-outs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingCheckOuts}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Average Duration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-md">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageVisitDuration > 0 ? `${stats.averageVisitDuration}h` : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <TrendingUpIcon className="w-5 h-5" />
              <span>Recent Activity</span>
            </h3>
            {loading && <LoadingSpinner size="sm" />}
          </div>

          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <motion.div
                  key={`${activity.id}-${activity.action}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.visitor?.firstName} {activity.visitor?.lastName}
                      </p>
                      {getActivityBadge(activity.action)}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{activity.subject}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {formatActivityTime(activity.time)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <UserIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No recent activity</p>
            </div>
          )}
        </Card>

        {/* Today's Summary & Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Summary</h3>
          
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.todayCheckIns}</p>
                <p className="text-sm text-blue-800">Check-ins</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{stats.todayCheckOuts}</p>
                <p className="text-sm text-orange-800">Check-outs</p>
              </div>
            </div>

            {/* Peak Hour */}
            {stats.peakHour && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Peak Hour</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.peakHour}:00 - {parseInt(stats.peakHour) + 1}:00
                </p>
              </div>
            )}

            {/* Quick Actions */}
            {showQuickActions && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
                <div className="space-y-2">
                  <Link to={CHECKIN_ROUTES.PROCESS}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                      icon={<EyeIcon className="w-4 h-4" />}
                    >
                      View Check-in Dashboard
                      <ArrowRightIcon className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/invitations?status=Approved">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                      icon={<CheckCircleIcon className="w-4 h-4" />}
                    >
                      View Approved Invitations
                      <ArrowRightIcon className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CheckInStats;