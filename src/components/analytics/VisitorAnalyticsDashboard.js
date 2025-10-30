// src/components/analytics/VisitorAnalyticsDashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

// Services
import visitorService from '../../services/visitorService';
import invitationService from '../../services/invitationService';

// Components
import Card from '../common/Card/Card';
import Button from '../common/Button/Button';
import Badge from '../common/Badge/Badge';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';

// Icons
import {
  ChartBarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  ChartPieIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

// Utils
import formatters from '../../utils/formatters';
import { extractErrorMessage } from '../../utils/errorUtils';

/**
 * Advanced Visitor Analytics Dashboard
 * Provides comprehensive insights into visitor patterns, metrics, and trends
 * Includes real-time data, historical analysis, and predictive insights
 */
const VisitorAnalyticsDashboard = () => {
  // State for analytics data
  const [analytics, setAnalytics] = useState({
    overview: {
      totalVisitors: 0,
      totalInvitations: 0,
      averageVisitDuration: 0,
      checkInRate: 0,
      noShowRate: 0
    },
    trends: {
      dailyVisitors: [],
      weeklyTrends: [],
      monthlyComparison: []
    },
    demographics: {
      byCompany: [],
      byLocation: [],
      byPurpose: [],
      byTimeOfDay: []
    },
    performance: {
      popularHosts: [],
      busyLocations: [],
      peakTimes: [],
      averageWaitTime: 0
    }
  });

  const [dateRange, setDateRange] = useState('7d'); // '1d', '7d', '30d', '3m', '1y'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const startDate = getStartDateForRange(dateRange);

      // Fetch invitation data (invitations represent actual visits with date ranges)
      // Note: Visitors are entities without date ranges, so we analyze based on invitations
      const invitationsData = await invitationService.getInvitations({
        pageSize: 1000,
        pageIndex: 0,
        includeDeleted: false
      });

      // Filter invitations by date range on the client side
      // (Backend doesn't support date filtering in the list endpoint)
      const filteredInvitations = (invitationsData?.items || []).filter(inv => {
        const invDate = new Date(inv.scheduledStartTime || inv.createdAt);
        return invDate >= startDate && invDate <= now;
      });

      // Get unique visitors from filtered invitations
      const uniqueVisitorIds = new Set(filteredInvitations.map(inv => inv.visitorId));

      // Create a visitor lookup object from invitation data
      const visitorsLookup = {};
      filteredInvitations.forEach(inv => {
        if (inv.visitor && !visitorsLookup[inv.visitorId]) {
          visitorsLookup[inv.visitorId] = inv.visitor;
        }
      });

      const visitorsData = Object.values(visitorsLookup);

      // Process analytics
      const processedAnalytics = processAnalyticsData(
        { items: visitorsData },
        { items: filteredInvitations },
        startDate,
        now
      );
      setAnalytics(processedAnalytics);
      setLastUpdated(new Date());

    } catch (error) {
      setError(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Get start date based on range
  const getStartDateForRange = (range) => {
    const now = new Date();
    switch (range) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3m':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  };

  // Process raw data into analytics
  const processAnalyticsData = (visitorsData, invitationsData, startDate, endDate) => {
    const visitors = visitorsData?.items || visitorsData?.data?.items || [];
    const invitations = invitationsData?.items || invitationsData?.data?.items || [];

    return {
      overview: {
        totalVisitors: visitors.length,
        totalInvitations: invitations.length,
        averageVisitDuration: calculateAverageVisitDuration(invitations),
        checkInRate: calculateCheckInRate(invitations),
        noShowRate: calculateNoShowRate(invitations)
      },
      trends: {
        dailyVisitors: generateDailyVisitorTrend(invitations, startDate, endDate),
        weeklyTrends: generateWeeklyTrends(invitations),
        monthlyComparison: generateMonthlyComparison(invitations)
      },
      demographics: {
        byCompany: aggregateByCompany(visitors),
        byLocation: aggregateByLocation(invitations),
        byPurpose: aggregateByPurpose(invitations),
        byTimeOfDay: aggregateByTimeOfDay(invitations)
      },
      performance: {
        popularHosts: getPopularHosts(invitations),
        busyLocations: getBusyLocations(invitations),
        peakTimes: getPeakTimes(invitations),
        averageWaitTime: calculateAverageWaitTime(invitations)
      }
    };
  };

  // Analytics calculation functions
  const calculateAverageVisitDuration = (invitations) => {
    const completedVisits = invitations.filter(inv => inv.checkedInAt && inv.checkedOutAt);
    if (completedVisits.length === 0) return 0;

    const totalDuration = completedVisits.reduce((sum, inv) => {
      const checkIn = new Date(inv.checkedInAt);
      const checkOut = new Date(inv.checkedOutAt);
      return sum + (checkOut - checkIn);
    }, 0);

    return Math.round(totalDuration / completedVisits.length / (1000 * 60)); // Minutes
  };

  const calculateCheckInRate = (invitations) => {
    if (invitations.length === 0) return 0;
    const checkedIn = invitations.filter(inv => inv.checkedInAt).length;
    return Math.round((checkedIn / invitations.length) * 100);
  };

  const calculateNoShowRate = (invitations) => {
    const overdueInvitations = invitations.filter(inv => {
      const scheduled = new Date(inv.scheduledStartTime);
      const now = new Date();
      return !inv.checkedInAt && scheduled < now && (now - scheduled) > 30 * 60 * 1000; // 30 min grace period
    });

    if (invitations.length === 0) return 0;
    return Math.round((overdueInvitations.length / invitations.length) * 100);
  };

  const generateDailyVisitorTrend = (invitations, startDate, endDate) => {
    const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
    const trend = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayInvitations = invitations.filter(inv => {
        const invDate = new Date(inv.scheduledStartTime);
        return invDate.toDateString() === date.toDateString();
      });

      trend.push({
        date: date.toISOString().split('T')[0],
        visitors: dayInvitations.length,
        checkedIn: dayInvitations.filter(inv => inv.checkedInAt).length
      });
    }

    return trend;
  };

  const generateWeeklyTrends = (invitations) => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyData = weekdays.map(day => ({ day, count: 0 }));

    invitations.forEach(inv => {
      const date = new Date(inv.scheduledStartTime);
      const dayIndex = date.getDay();
      weeklyData[dayIndex].count++;
    });

    return weeklyData;
  };

  const generateMonthlyComparison = (invitations) => {
    const monthlyData = {};
    
    invitations.forEach(inv => {
      const date = new Date(inv.scheduledStartTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey]++;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const aggregateByCompany = (visitors) => {
    const companyData = {};
    
    visitors.forEach(visitor => {
      const company = visitor.company || 'Unknown';
      companyData[company] = (companyData[company] || 0) + 1;
    });

    return Object.entries(companyData)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const aggregateByLocation = (invitations) => {
    const locationData = {};
    
    invitations.forEach(inv => {
      const location = inv.location?.name || 'Unknown';
      locationData[location] = (locationData[location] || 0) + 1;
    });

    return Object.entries(locationData)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
  };

  const aggregateByPurpose = (invitations) => {
    const purposeData = {};
    
    invitations.forEach(inv => {
      const purpose = inv.visitPurpose?.name || inv.purpose || 'General Meeting';
      purposeData[purpose] = (purposeData[purpose] || 0) + 1;
    });

    return Object.entries(purposeData)
      .map(([purpose, count]) => ({ purpose, count }))
      .sort((a, b) => b.count - a.count);
  };

  const aggregateByTimeOfDay = (invitations) => {
    const hourData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    
    invitations.forEach(inv => {
      const hour = new Date(inv.scheduledStartTime).getHours();
      hourData[hour].count++;
    });

    return hourData.filter(h => h.count > 0);
  };

  const getPopularHosts = (invitations) => {
    const hostData = {};
    
    invitations.forEach(inv => {
      const hostName = inv.host?.fullName || 'Unknown Host';
      if (!hostData[hostName]) {
        hostData[hostName] = { 
          name: hostName, 
          invitations: 0, 
          checkedIn: 0,
          avgRating: 0 
        };
      }
      hostData[hostName].invitations++;
      if (inv.checkedInAt) {
        hostData[hostName].checkedIn++;
      }
    });

    return Object.values(hostData)
      .map(host => ({
        ...host,
        checkInRate: host.invitations > 0 ? Math.round((host.checkedIn / host.invitations) * 100) : 0
      }))
      .sort((a, b) => b.invitations - a.invitations)
      .slice(0, 10);
  };

  const getBusyLocations = (invitations) => {
    const locationData = {};
    
    invitations.forEach(inv => {
      const locationName = inv.location?.name || 'Unknown Location';
      if (!locationData[locationName]) {
        locationData[locationName] = { 
          name: locationName, 
          visits: 0, 
          avgDuration: 0 
        };
      }
      locationData[locationName].visits++;
    });

    return Object.values(locationData)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);
  };

  const getPeakTimes = (invitations) => {
    const hourCounts = Array(24).fill(0);
    
    invitations.forEach(inv => {
      const hour = new Date(inv.scheduledStartTime).getHours();
      hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts);
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > maxCount * 0.8) // Within 80% of peak
      .sort((a, b) => b.count - a.count);

    return peakHours.slice(0, 3);
  };

  const calculateAverageWaitTime = (invitations) => {
    const waitTimes = invitations
      .filter(inv => inv.checkedInAt && inv.scheduledStartTime)
      .map(inv => {
        const scheduled = new Date(inv.scheduledStartTime);
        const checkedIn = new Date(inv.checkedInAt);
        return Math.max(0, checkedIn - scheduled);
      });

    if (waitTimes.length === 0) return 0;
    
    const avgWaitTime = waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length;
    return Math.round(avgWaitTime / (1000 * 60)); // Convert to minutes
  };

  // Auto-refresh functionality
  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (dateRange === '1d') {
        loadAnalytics(); // Refresh every 5 minutes for real-time data
      }
    }, 5 * 60 * 1000);

    setRefreshInterval(interval);
    return () => clearInterval(interval);
  }, [dateRange]);

  // Calculate trend direction
  const getTrendDirection = (data, key) => {
    if (data.length < 2) return 'neutral';
    const recent = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    return recent > previous ? 'up' : recent < previous ? 'down' : 'neutral';
  };

  // Export analytics data
  const exportAnalytics = () => {
    const exportData = {
      dateRange,
      generatedAt: new Date().toISOString(),
      analytics
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visitor-analytics-${dateRange}-${formatters.formatDate(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render overview metrics
  const renderOverviewMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Visitors</h3>
            <p className="text-2xl font-bold text-blue-600">{analytics.overview.totalVisitors}</p>
          </div>
          <UsersIcon className="w-8 h-8 text-blue-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Invitations</h3>
            <p className="text-2xl font-bold text-green-600">{analytics.overview.totalInvitations}</p>
          </div>
          <CalendarIcon className="w-8 h-8 text-green-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Avg Visit Duration</h3>
            <p className="text-2xl font-bold text-purple-600">{analytics.overview.averageVisitDuration}m</p>
          </div>
          <ClockIcon className="w-8 h-8 text-purple-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Check-in Rate</h3>
            <p className="text-2xl font-bold text-orange-600">{analytics.overview.checkInRate}%</p>
          </div>
          <ArrowTrendingUpIcon className="w-8 h-8 text-orange-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">No-show Rate</h3>
            <p className="text-2xl font-bold text-red-600">{analytics.overview.noShowRate}%</p>
          </div>
          <ArrowTrendingDownIcon className="w-8 h-8 text-red-500" />
        </div>
      </Card>
    </div>
  );

  // Render date range selector
  const renderDateRangeSelector = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visitor Analytics</h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {formatters.formatDateTime(lastUpdated)}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { label: '24h', value: '1d' },
            { label: '7d', value: '7d' },
            { label: '30d', value: '30d' },
            { label: '3m', value: '3m' },
            { label: '1y', value: '1y' }
          ].map(range => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                dateRange === range.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={exportAnalytics}
          icon={<ArrowDownTrayIcon className="w-4 h-4" />}
        >
          Export
        </Button>

        <Button
          size="sm"
          onClick={loadAnalytics}
          loading={loading}
          icon={<ChartBarIcon className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>
    </div>
  );

  if (loading && !analytics.overview.totalVisitors) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {renderDateRangeSelector()}
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {renderOverviewMetrics()}

      {/* Trends and Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Visitor Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Visitor Trend</h3>
          <div className="space-y-3">
            {analytics.trends.dailyVisitors.slice(-7).map(day => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {formatters.formatDate(new Date(day.date))}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(day.visitors / Math.max(...analytics.trends.dailyVisitors.map(d => d.visitors))) * 100}%` }}
                    />
                  </div>
                  <Badge color="blue" size="sm">{day.visitors}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Popular Companies */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Companies</h3>
          <div className="space-y-3">
            {analytics.demographics.byCompany.slice(0, 6).map((company, index) => (
              <div key={company.company} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                  </div>
                  <span className="text-sm text-gray-900 truncate">{company.company}</span>
                </div>
                <Badge color="green" size="sm">{company.count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular Hosts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Hosts</h3>
          <div className="space-y-3">
            {analytics.performance.popularHosts.slice(0, 5).map(host => (
              <div key={host.name} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{host.name}</p>
                  <p className="text-xs text-gray-500">{host.invitations} invitations</p>
                </div>
                <Badge 
                  color={host.checkInRate >= 80 ? 'green' : host.checkInRate >= 60 ? 'yellow' : 'red'} 
                  size="sm"
                >
                  {host.checkInRate}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Busy Locations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Busy Locations</h3>
          <div className="space-y-3">
            {analytics.performance.busyLocations.map(location => (
              <div key={location.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{location.name}</span>
                </div>
                <Badge color="purple" size="sm">{location.visits}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Peak Times */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Times</h3>
          <div className="space-y-3">
            {analytics.performance.peakTimes.map(time => (
              <div key={time.hour} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {formatters.formatTime(new Date().setHours(time.hour, 0, 0, 0))}
                  </span>
                </div>
                <Badge color="orange" size="sm">{time.count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VisitorAnalyticsDashboard;
