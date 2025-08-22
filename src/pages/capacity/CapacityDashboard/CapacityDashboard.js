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

  // Redux state
  const {
    occupancy,
    statistics,
    overview,
    trends,
    selectedLocationId,
    selectedDateRange,
    autoRefresh
  } = useSelector(state => state.capacity);

  const { list: locations, loading: locationsLoading } = useSelector(state => state.locations);

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
  const occupancyStatus = occupancy.data 
    ? capacityService.getOccupancyStatus(occupancy.data)
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
          <h1 className="text-2xl font-semibold text-gray-900">Capacity Dashboard</h1>
          <p className="text-gray-600">Real-time visitor capacity monitoring</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={occupancy.loading || overview.loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="outline"
            onClick={() => dispatch(setAutoRefresh(!autoRefresh))}
            className={autoRefresh ? 'bg-green-50 text-green-700 border-green-200' : ''}
          >
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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
            {occupancy.lastUpdated && (
              <span className="text-sm text-gray-500">
                Updated {formatDistanceToNow(new Date(occupancy.lastUpdated), { addSuffix: true })}
              </span>
            )}
          </div>

          {occupancy.loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : occupancy.error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error: {occupancy.error}</p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : occupancy.data ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {occupancy.data.currentOccupancy}
                </div>
                <div className="text-sm text-gray-600">Current Visitors</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {occupancy.data.maxCapacity}
                </div>
                <div className="text-sm text-gray-600">Max Capacity</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {occupancy.data.availableSlots}
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
                    {occupancy.data.occupancyPercentage}%
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
      {overview.data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview.data.map((location) => (
                <div
                  key={location.locationId}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{location.locationName}</h3>
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
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium">{location.currentOccupancy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{location.maxCapacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium text-green-600">{location.availableSlots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilization:</span>
                      <span className="font-medium">{location.occupancyPercentage}%</span>
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
              <span className="text-sm text-gray-600">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Warning (80%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">At Capacity</span>
            </div>
          </div>
          
          {autoRefresh && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm">Auto-refreshing every 30s</span>
            </div>
          )}
        </div>
      </Card>

      {/* Modals will be added in the next step */}
    </div>
  );
};

export default CapacityDashboard;