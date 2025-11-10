// src/pages/capacity/CapacityDashboard/CapacityDashboard.js
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { usePermissions } from '../../../hooks/usePermissions';

// Redux actions
import {
  getOccupancy,
  getStatistics,
  getCapacityOverview,
  getCapacityTrends,
  setSelectedLocationId,
  setSelectedDateRange,
  setAutoRefresh,
  showStatisticsModal,
  showTrendsModal,
  clearError
} from '../../../store/slices/capacitySlice';

import { getLocations } from '../../../store/slices/locationsSlice';

// Import selectors
import {
  selectOccupancyData,
  selectOccupancyLoading,
  selectOccupancyError,
  selectStatisticsData,
  selectStatisticsLoading,
  selectStatisticsError,
  selectOverviewData,
  selectOverviewLoading,
  selectOverviewError,
  selectTrendsData,
  selectTrendsLoading,
  selectTrendsError,
  selectSelectedLocationId,
  selectSelectedDateRange,
  selectAutoRefresh,
  selectShowStatisticsModal,
  selectShowTrendsModal
} from '../../../store/selectors/capacitySelectors';

import { selectLocationsList } from '../../../store/selectors/locationSelectors';

// Components
import Button from '../../../components/common/Button/Button';
import Select from '../../../components/common/Select/Select';
import Input from '../../../components/common/Input/Input';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../components/common/Modal/Modal';

// Services
import capacityService from '../../../services/capacityService';

// Utils
import { formatDistanceToNow } from 'date-fns';

/**
 * Capacity Dashboard - Real-time monitoring and analytics
 */
const CapacityDashboard = () => {
  const dispatch = useDispatch();
  const { user: userPermissions } = usePermissions();

  // Local state
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Redux state using selectors
  const occupancyData = useSelector(selectOccupancyData);
  const occupancyLoading = useSelector(selectOccupancyLoading);
  const occupancyError = useSelector(selectOccupancyError);
  
  const statisticsData = useSelector(selectStatisticsData);
  const statisticsLoading = useSelector(selectStatisticsLoading);
  const statisticsError = useSelector(selectStatisticsError);
  
  const overviewData = useSelector(selectOverviewData);
  const overviewLoading = useSelector(selectOverviewLoading);
  const overviewError = useSelector(selectOverviewError);
  
  const trendsData = useSelector(selectTrendsData);
  const trendsLoading = useSelector(selectTrendsLoading);
  const trendsError = useSelector(selectTrendsError);
  
  const selectedLocationId = useSelector(selectSelectedLocationId);
  const selectedDateRange = useSelector(selectSelectedDateRange);
  const autoRefresh = useSelector(selectAutoRefresh);
  const showStatisticsModalState = useSelector(selectShowStatisticsModal);
  const showTrendsModalState = useSelector(selectShowTrendsModal);

  const locations = useSelector(selectLocationsList);
  const locationsLoading = useSelector(state => state.locations.loading);

  // Check permissions
  const canViewBasic = userPermissions.canActivate;
  const canViewReports = userPermissions.canActivate;

  // Initialize data
  useEffect(() => {
    if (canViewBasic) {
      dispatch(getLocations());
      dispatch(getOccupancy({ 
        dateTime: new Date().toISOString(),
        locationId: selectedLocationId 
      }));
      dispatch(getCapacityOverview({ 
        dateTime: new Date().toISOString() 
      }));
    }
  }, [dispatch, canViewBasic, selectedLocationId]);

  // Auto refresh setup
  useEffect(() => {
    if (autoRefresh && canViewBasic) {
      const interval = setInterval(() => {
        dispatch(getOccupancy({ 
          dateTime: new Date().toISOString(),
          locationId: selectedLocationId 
        }));
        dispatch(getCapacityOverview({ 
          dateTime: new Date().toISOString() 
        }));
      }, 30000); // Refresh every 30 seconds

      setRefreshInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh, canViewBasic, selectedLocationId, dispatch]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Handle location change
  const handleLocationChange = (locationId) => {
    dispatch(setSelectedLocationId(locationId || null));
    
    if (canViewBasic) {
      dispatch(getOccupancy({ 
        dateTime: new Date().toISOString(),
        locationId: locationId || null 
      }));
    }
  };

  // Handle date change for specific occupancy check
  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    if (canViewBasic) {
      dispatch(getOccupancy({ 
        dateTime: new Date(date).toISOString(),
        locationId: selectedLocationId 
      }));
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (canViewBasic) {
      dispatch(getOccupancy({ 
        dateTime: new Date(selectedDate).toISOString(),
        locationId: selectedLocationId 
      }));
      dispatch(getCapacityOverview({ 
        dateTime: new Date().toISOString() 
      }));
    }
  };

  // Handle statistics request
  const handleViewStatistics = () => {
    if (canViewReports) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30); // Last 30 days

      dispatch(getStatistics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        locationId: selectedLocationId
      }));
      dispatch(showStatisticsModal());
    }
  };

  // Handle trends request
  const handleViewTrends = () => {
    if (canViewReports) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7); // Last 7 days

      dispatch(getCapacityTrends({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        locationId: selectedLocationId,
        groupBy: 'day'
      }));
      dispatch(showTrendsModal());
    }
  };

  // Location options
  const locationOptions = useMemo(() => [
    { value: '', label: 'All Locations' },
    ...locations.map(location => ({
      value: location.id.toString(),
      label: location.name
    }))
  ], [locations]);

  // Current occupancy status
  const occupancyStatus = occupancyData 
    ? capacityService.getOccupancyStatus(occupancyData)
    : 'unknown';

  if (!canViewBasic) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view capacity dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Capacity Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time visitor capacity monitoring</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={occupancyLoading || overviewLoading}
          >
            Refresh
          </Button>
          
          <Button
            variant="outline"
            onClick={() => dispatch(setAutoRefresh(!autoRefresh))}
            className={autoRefresh ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700' : ''}
          >
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900/70 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Select
              label="Location"
              value={selectedLocationId?.toString() || ''}
              onChange={(e) => handleLocationChange(e.target.value)}
              options={locationOptions}
              loading={locationsLoading}
            />
          </div>
          
          <div className="flex-1">
            <Input
              type="date"
              label="Date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="flex gap-2 items-end">
            {canViewReports && (
              <>
                <Button
                  variant="outline"
                  onClick={handleViewStatistics}
                  size="sm"
                >
                  View Statistics
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleViewTrends}
                  size="sm"
                >
                  View Trends
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Current Occupancy Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Occupancy</h2>
            {occupancyData?.lastUpdated && (
              <span className="text-sm text-gray-500">
                Updated {formatDistanceToNow(new Date(occupancyData.lastUpdated), { addSuffix: true })}
              </span>
            )}
          </div>

          {occupancyLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : occupancyError ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error: {occupancyError}</p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : occupancyData ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {occupancyData.currentOccupancy}
                </div>
                <div className="text-sm text-gray-600">Current Visitors</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {occupancyData.maxCapacity}
                </div>
                <div className="text-sm text-gray-600">Max Capacity</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {occupancyData.availableSlots}
                </div>
                <div className="text-sm text-gray-600">Available Slots</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  <Badge
                    variant={
                      occupancyStatus === 'at-capacity' ? 'error' :
                      occupancyStatus === 'warning' ? 'warning' : 'success'
                    }
                    size="lg"
                  >
                    {occupancyData.occupancyPercentage}%
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">Utilization</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No occupancy data available</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Overview Cards */}
      {overviewData && overviewData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overviewData.map((location) => (
                <div
                  key={location.locationId || location.id || location.locationName}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{location.locationName}</h3>
                    <Badge
                      variant={
                        location.isAtCapacity ? 'error' :
                        location.isWarningLevel ? 'warning' : 'success'
                      }
                      size="sm"
                    >
                      {location.isAtCapacity ? 'Full' : 
                       location.isWarningLevel ? 'Warning' : 'Available'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{location.currentOccupancy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{location.maxCapacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Available:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{location.availableSlots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Utilization:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{location.occupancyPercentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Status Indicators */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Warning (80%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">At Capacity</span>
            </div>
          </div>
          
          {autoRefresh && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-300">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm">Auto-refreshing every 30s</span>
            </div>
          )}
        </div>
      </Card>

      {/* Statistics Modal */}
      <Modal
        isOpen={showStatisticsModalState}
        onClose={() => dispatch({ type: 'capacity/hideStatisticsModal' })}
        title="Capacity Statistics"
        size="lg"
      >
        <div className="space-y-6">
          {statisticsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : statisticsError ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading statistics: {statisticsError}</p>
              <Button
                variant="outline"
                onClick={handleViewStatistics}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : statisticsData ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {statisticsData.averageOccupancy}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Average Occupancy</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                    {statisticsData.peakOccupancy}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Peak Occupancy</div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                    {statisticsData.totalVisitors}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Visitors</div>
                </div>
              </div>
              
              {statisticsData.dailyStats && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Daily Breakdown</h3>
                  <div className="space-y-2">
                    {statisticsData.dailyStats.map((day, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900/60 rounded border border-gray-100 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex gap-4 text-sm text-gray-700 dark:text-gray-300">
                          <span>Visitors: {day.visitors}</span>
                          <span>Peak: {day.peakOccupancy}%</span>
                          <span>Avg: {day.averageOccupancy}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No statistics available</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Trends Modal */}
      <Modal
        isOpen={showTrendsModalState}
        onClose={() => dispatch({ type: 'capacity/hideTrendsModal' })}
        title="Capacity Trends"
        size="lg"
      >
        <div className="space-y-6">
          {trendsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : trendsError ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading trends: {trendsError}</p>
              <Button
                variant="outline"
                onClick={handleViewTrends}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : trendsData ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">7-Day Capacity Trends</h3>
                
                {trendsData.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-300">
                        {trendsData.summary.averageTrend > 0 ? '+' : ''}{trendsData.summary.averageTrend}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Average Change</div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-4 rounded-lg">
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-300">
                        {trendsData.summary.peakDay}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Busiest Day</div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-lg">
                      <div className="text-xl font-bold text-green-600 dark:text-green-300">
                        {trendsData.summary.optimalTime}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Best Time</div>
                    </div>
                  </div>
                )}
              </div>
              
              {trendsData.data && (
                <div>
                  <h4 className="font-semibold mb-3">Daily Trends</h4>
                  <div className="space-y-2">
                    {trendsData.data.map((trend, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900/60 rounded border border-gray-100 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(trend.date).toLocaleDateString()}</span>
                        <div className="flex gap-4 text-sm text-gray-700 dark:text-gray-300">
                          <span>Avg: {trend.averageOccupancy}%</span>
                          <span>Peak: {trend.peakOccupancy}%</span>
                          <span className={`font-medium ${trend.trend > 0 ? 'text-green-600 dark:text-green-400' : trend.trend < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                            {trend.trend > 0 ? '+' : ''}{trend.trend}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No trends data available</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CapacityDashboard;
