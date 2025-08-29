// src/pages/analytics/UnifiedAnalyticsDashboard.js
/**
 * Unified Analytics Dashboard - Beautiful UI/UX Enhancement
 * 
 * Combines visitor analytics and capacity monitoring into one 
 * comprehensive dashboard using the enhanced design system.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Design System
import { TEXT_STYLES } from '../../constants/typography';

// Enhanced Components
import { ResponsiveNavigation } from '../../components/common/MobileNavigation/MobileNavigation';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

// Existing Components
import VisitorAnalyticsDashboard from '../../components/analytics/VisitorAnalyticsDashboard';
import CapacityDashboard from '../capacity/CapacityDashboard/CapacityDashboard';

// Services
import dashboardService from '../../services/dashboardService';
import useRealTimeDashboard from '../../hooks/useRealTimeDashboard';

// Icons
import {
  ChartBarIcon,
  ChartPieIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarDaysIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

// Utils
import formatters from '../../utils/formatters';
import { debounce } from '../../utils/asyncHelpers';

const UnifiedAnalyticsDashboard = () => {
  // Navigation state
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Real-time analytics connection
  const {
    refresh: refreshRealTimeData,
    lastUpdated: realTimeLastUpdated
  } = useRealTimeDashboard({
    enableAutoRefresh: activeTab === 'overview',
    onDashboardUpdate: (data) => {
      // Only trigger analytics reload if not already loading and if there are actual metric changes
      if (activeTab === 'overview' && !loading) {
        console.log('📊 Dashboard metrics updated, refreshing analytics:', data);
        // Use a debounced approach to prevent excessive reloading
        const debouncedReload = debounce(() => {
          loadAnalyticsData().catch(err => {
            console.error('Failed to reload analytics on dashboard update:', err);
          });
        }, 2000); // 2 second debounce
        
        debouncedReload();
      }
    },
    onError: (error) => {
      console.error('Real-time dashboard error:', error);
      // Don't set analytics error here to avoid conflicts
    }
  });
  
  // Analytics data - now using real API data
  const [analytics, setAnalytics] = useState({
    overview: {
      totalVisitors: 0,
      activeVisitors: 0,
      todayVisitors: 0,
      avgVisitDuration: 0,
      checkInRate: 0,
      currentOccupancy: 0,
      maxCapacity: 150,
      utilizationRate: 0,
      availableSlots: 150,
      capacityStatus: 'normal',
      visitorTrend: 0,
      capacityTrend: 0
    },
    insights: {
      peakHours: [],
      popularLocations: [],
      recommendations: []
    }
  });

  // Navigation configuration
  const navigationItems = useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      icon: <ChartBarIcon className="w-5 h-5" />,
      badge: analytics.overview.activeVisitors > 0 ? analytics.overview.activeVisitors : null
    },
    {
      id: 'visitors',
      label: 'Visitor Analytics', 
      icon: <UsersIcon className="w-5 h-5" />,
      badge: analytics.overview.todayVisitors
    },
    {
      id: 'capacity',
      label: 'Capacity Monitor',
      icon: <ChartPieIcon className="w-5 h-5" />,
      badge: `${analytics.overview.utilizationRate}%`
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <EyeIcon className="w-5 h-5" />,
      badge: analytics.insights.recommendations.length
    }
  ], [analytics]);

  // Real data loading with callback
  const loadAnalyticsData = useCallback(async () => {
    // Prevent concurrent calls
    if (loading) {
      console.log('Analytics already loading, skipping...');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const analyticsData = await dashboardService.getAnalyticsData();
      setAnalytics(analyticsData);
      setLastUpdated(realTimeLastUpdated || new Date());
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [realTimeLastUpdated, loading]); // Added loading to dependencies

  // Initial data load and tab changes - but prevent excessive calls
  useEffect(() => {
    // Only load analytics for overview tab
    if (activeTab === 'overview' && !loading) {
      loadAnalyticsData().catch(err => {
        console.error('Failed to load analytics on tab change:', err);
      });
    }
  }, [activeTab]); // Removed loadAnalyticsData from dependencies to prevent loops

  // Separate effect for initial load
  useEffect(() => {
    loadAnalyticsData().catch(err => {
      console.error('Failed to load initial analytics:', err);
    });
  }, []); // Empty dependency array for initial load only

  // Export analytics data
  const exportAnalytics = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      analytics,
      dateRange: 'Last 7 days'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unified-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Refresh data using real-time connection and manual reload
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshRealTimeData(); // Refresh SignalR data
      await loadAnalyticsData(); // Reload analytics
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  // Render overview cards
  const renderOverviewCards = () => {
    const cards = [
      {
        title: 'Active Visitors',
        value: analytics.overview.activeVisitors,
        subtitle: 'Currently in building',
        icon: <UsersIcon className="w-8 h-8 text-blue-500" />,
        trend: analytics.overview.visitorTrend,
        color: 'blue'
      },
      {
        title: 'Today\'s Visitors',
        value: analytics.overview.todayVisitors,
        subtitle: 'Checked in today',
        icon: <CalendarDaysIcon className="w-8 h-8 text-green-500" />,
        trend: 15.2,
        color: 'green'
      },
      {
        title: 'Capacity Utilization',
        value: `${analytics.overview.utilizationRate}%`,
        subtitle: `${analytics.overview.currentOccupancy}/${analytics.overview.maxCapacity}`,
        icon: <ChartPieIcon className="w-8 h-8 text-purple-500" />,
        trend: analytics.overview.capacityTrend,
        color: 'purple'
      },
      {
        title: 'Avg Visit Duration',
        value: `${analytics.overview.avgVisitDuration}m`,
        subtitle: 'Average time spent',
        icon: <ClockIcon className="w-8 h-8 text-orange-500" />,
        trend: -5.3,
        color: 'orange'
      },
      {
        title: 'Check-in Rate',
        value: `${analytics.overview.checkInRate}%`,
        subtitle: 'Successful check-ins',
        icon: <ArrowTrendingUpIcon className="w-8 h-8 text-indigo-500" />,
        trend: 8.7,
        color: 'indigo'
      },
      {
        title: 'Available Slots',
        value: analytics.overview.availableSlots,
        subtitle: 'Remaining capacity',
        icon: <BuildingOfficeIcon className="w-8 h-8 text-cyan-500" />,
        trend: 0,
        color: 'cyan'
      }
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card 
              className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary-500"
              hover={true}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`${TEXT_STYLES.label} mb-1`}>
                    {card.title}
                  </p>
                  <p className={`text-3xl font-bold mb-1 text-${card.color}-600`}>
                    {card.value}
                  </p>
                  <p className={`${TEXT_STYLES.helpText}`}>
                    {card.subtitle}
                  </p>
                  
                  {card.trend !== 0 && (
                    <div className={`flex items-center mt-3 ${
                      card.trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.trend > 0 ? 
                        <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> : 
                        <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                      }
                      <span className="text-sm font-medium">
                        {Math.abs(card.trend)}%
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs last week</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 bg-${card.color}-50 rounded-lg`}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  // Render insights section
  const renderInsights = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className={`${TEXT_STYLES.cardTitle} mb-4`}>Peak Hours</h3>
        <div className="space-y-3">
          {analytics.insights.peakHours.map((hour, index) => (
            <div key={hour} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                </div>
                <span className={TEXT_STYLES.bodyText}>{hour}</span>
              </div>
              <Badge variant="primary" size="sm">Peak</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className={`${TEXT_STYLES.cardTitle} mb-4`}>Popular Locations</h3>
        <div className="space-y-3">
          {analytics.insights.popularLocations.map((location, index) => (
            <div key={location} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <span className={TEXT_STYLES.bodyText}>{location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: `${100 - (index * 20)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{100 - (index * 20)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={TEXT_STYLES.pageTitle}>Unified Analytics</h1>
            <p className={`${TEXT_STYLES.helpText} mt-1`}>
              Comprehensive visitor and capacity analytics • Last updated {formatters.formatTime(lastUpdated)}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              loading={loading}
              icon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Refresh
            </Button>
            
            <Button
              size="sm" 
              variant="outline"
              onClick={exportAnalytics}
              icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="mt-6">
          <ResponsiveNavigation
            items={navigationItems}
            activeItem={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 py-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {loading && !analytics.overview.totalVisitors ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-gray-600">Loading analytics...</span>
                </div>
              ) : (
                <>
                  {renderOverviewCards()}
                  {renderInsights()}
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'visitors' && (
            <motion.div
              key="visitors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VisitorAnalyticsDashboard />
            </motion.div>
          )}

          {activeTab === 'capacity' && (
            <motion.div
              key="capacity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CapacityDashboard />
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h2 className={`${TEXT_STYLES.sectionTitle} mb-6`}>AI-Powered Insights</h2>
                
                <div className="space-y-4">
                  {analytics.insights.recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <p className={TEXT_STYLES.bodyText}>{recommendation}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UnifiedAnalyticsDashboard;