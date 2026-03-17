// src/pages/capacity/CapacityDashboard/CapacityDashboard.js
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../../hooks/usePermissions';

// Redux actions
import {
  getOccupancy,
  getStatistics,
  getCapacityOverview,
  getCapacityTrends,
  setSelectedLocationId,
  setAutoRefresh,
  showStatisticsModal,
  hideStatisticsModal,
  showTrendsModal,
  hideTrendsModal
} from '../../../store/slices/capacitySlice';

import { getLocations } from '../../../store/slices/locationsSlice';

// Selectors
import {
  selectOccupancyData,
  selectOccupancyLoading,
  selectOccupancyError,
  selectStatisticsData,
  selectStatisticsLoading,
  selectStatisticsError,
  selectOverviewData,
  selectOverviewLoading,
  selectTrendsData,
  selectTrendsLoading,
  selectTrendsError,
  selectSelectedLocationId,
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

/**
 * Capacity Dashboard - Real-time monitoring and analytics
 */
const CapacityDashboard = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation('analytics');
  const { user: userPermissions, report: reportPermissions } = usePermissions();
  const locale = i18n.language === 'ar' ? 'ar' : 'en-US';

  const [refreshInterval, setRefreshIntervalState] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const occupancyData = useSelector(selectOccupancyData);
  const occupancyLoading = useSelector(selectOccupancyLoading);
  const occupancyError = useSelector(selectOccupancyError);

  const statisticsData = useSelector(selectStatisticsData);
  const statisticsLoading = useSelector(selectStatisticsLoading);
  const statisticsError = useSelector(selectStatisticsError);

  const overviewData = useSelector(selectOverviewData);
  const overviewLoading = useSelector(selectOverviewLoading);

  const trendsData = useSelector(selectTrendsData);
  const trendsLoading = useSelector(selectTrendsLoading);
  const trendsError = useSelector(selectTrendsError);

  const selectedLocationId = useSelector(selectSelectedLocationId);
  const autoRefresh = useSelector(selectAutoRefresh);
  const showStatisticsModalState = useSelector(selectShowStatisticsModal);
  const showTrendsModalState = useSelector(selectShowTrendsModal);

  const locations = useSelector(selectLocationsList);
  const locationsLoading = useSelector((state) => state.locations.loading);

  const canViewBasic = userPermissions.canActivate;
  const canViewReports = reportPermissions?.canGenerateAll || reportPermissions?.canExport;

  useEffect(() => {
    if (!canViewBasic) return;

    dispatch(getLocations());
    dispatch(getOccupancy({
      dateTime: new Date().toISOString(),
      locationId: selectedLocationId
    }));
    dispatch(getCapacityOverview({
      dateTime: new Date().toISOString()
    }));
  }, [dispatch, canViewBasic, selectedLocationId]);

  useEffect(() => {
    if (!autoRefresh || !canViewBasic) {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshIntervalState(null);
      }
      return;
    }

    const interval = setInterval(() => {
      dispatch(getOccupancy({
        dateTime: new Date().toISOString(),
        locationId: selectedLocationId
      }));
      dispatch(getCapacityOverview({
        dateTime: new Date().toISOString()
      }));
    }, 30000);

    setRefreshIntervalState(interval);

    return () => clearInterval(interval);
  }, [autoRefresh, canViewBasic, selectedLocationId, dispatch, refreshInterval]);

  useEffect(() => () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  }, [refreshInterval]);

  const handleLocationChange = (locationId) => {
    const normalizedLocationId = locationId || null;
    dispatch(setSelectedLocationId(normalizedLocationId));

    if (canViewBasic) {
      dispatch(getOccupancy({
        dateTime: new Date().toISOString(),
        locationId: normalizedLocationId
      }));
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);

    if (canViewBasic) {
      dispatch(getOccupancy({
        dateTime: new Date(date).toISOString(),
        locationId: selectedLocationId
      }));
    }
  };

  const handleRefresh = () => {
    if (!canViewBasic) return;

    dispatch(getOccupancy({
      dateTime: new Date(selectedDate).toISOString(),
      locationId: selectedLocationId
    }));
    dispatch(getCapacityOverview({
      dateTime: new Date().toISOString()
    }));
  };

  const handleViewStatistics = () => {
    if (!canViewReports) return;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    dispatch(getStatistics({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      locationId: selectedLocationId
    }));
    dispatch(showStatisticsModal());
  };

  const handleViewTrends = () => {
    if (!canViewReports) return;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    dispatch(getCapacityTrends({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      locationId: selectedLocationId,
      groupBy: 'day'
    }));
    dispatch(showTrendsModal());
  };

  const locationOptions = useMemo(() => [
    { value: '', label: t('capacityDashboard.filters.allLocations') },
    ...locations.map((location) => ({
      value: location.id.toString(),
      label: location.name
    }))
  ], [locations, t]);

  const occupancyStatus = occupancyData
    ? capacityService.getOccupancyStatus(occupancyData)
    : 'unknown';

  const toLocaleDate = (dateLike) => new Date(dateLike).toLocaleDateString(locale);
  const toLocaleDateTime = (dateLike) => new Date(dateLike).toLocaleString(locale);

  if (!canViewBasic) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('capacityDashboard.accessDeniedTitle')}</h3>
          <p className="text-gray-600 dark:text-gray-300">{t('capacityDashboard.accessDeniedDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('capacityDashboard.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('capacityDashboard.subtitle')}</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={occupancyLoading || overviewLoading}
          >
            {t('capacityDashboard.buttons.refresh')}
          </Button>

          <Button
            variant="outline"
            onClick={() => dispatch(setAutoRefresh(!autoRefresh))}
            className={autoRefresh ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700' : ''}
          >
            {autoRefresh ? t('capacityDashboard.buttons.autoOn') : t('capacityDashboard.buttons.autoOff')}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/70 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Select
              label={t('capacityDashboard.filters.location')}
              value={selectedLocationId?.toString() || ''}
              onChange={(e) => handleLocationChange(e.target.value)}
              options={locationOptions}
              loading={locationsLoading}
            />
          </div>

          <div className="flex-1">
            <Input
              type="date"
              label={t('capacityDashboard.filters.date')}
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex gap-2 items-end">
            {canViewReports && (
              <>
                <Button variant="outline" onClick={handleViewStatistics} size="sm">
                  {t('capacityDashboard.buttons.viewStatistics')}
                </Button>
                <Button variant="outline" onClick={handleViewTrends} size="sm">
                  {t('capacityDashboard.buttons.viewTrends')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('capacityDashboard.current.title')}</h2>
            {occupancyData?.lastUpdated && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('capacityDashboard.current.updatedAt', { time: toLocaleDateTime(occupancyData.lastUpdated) })}
              </span>
            )}
          </div>

          {occupancyLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : occupancyError ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-300">
                {t('capacityDashboard.current.errorPrefix')}: {occupancyError}
              </p>
              <Button variant="outline" onClick={handleRefresh} className="mt-4">
                {t('capacityDashboard.buttons.retry')}
              </Button>
            </div>
          ) : occupancyData ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {occupancyData.currentOccupancy}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('capacityDashboard.current.currentVisitors')}</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {occupancyData.maxCapacity}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('capacityDashboard.current.maxCapacity')}</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {occupancyData.availableSlots}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('capacityDashboard.current.availableSlots')}</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">
                  <Badge
                    variant={
                      occupancyStatus === 'at-capacity'
                        ? 'error'
                        : occupancyStatus === 'warning'
                          ? 'warning'
                          : 'success'
                    }
                    size="lg"
                  >
                    {occupancyData.occupancyPercentage}%
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('capacityDashboard.current.utilization')}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">{t('capacityDashboard.current.noData')}</p>
            </div>
          )}
        </Card>
      </motion.div>

      {overviewData && overviewData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('capacityDashboard.overview.title')}</h2>

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
                        location.isAtCapacity
                          ? 'error'
                          : location.isWarningLevel
                            ? 'warning'
                            : 'success'
                      }
                      size="sm"
                    >
                      {location.isAtCapacity
                        ? t('capacityDashboard.overview.statusFull')
                        : location.isWarningLevel
                          ? t('capacityDashboard.overview.statusWarning')
                          : t('capacityDashboard.overview.statusAvailable')}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('capacityDashboard.overview.currentLabel')}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{location.currentOccupancy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('capacityDashboard.overview.capacityLabel')}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{location.maxCapacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('capacityDashboard.overview.availableLabel')}</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{location.availableSlots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('capacityDashboard.overview.utilizationLabel')}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{location.occupancyPercentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{t('capacityDashboard.indicators.normal')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{t('capacityDashboard.indicators.warning')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{t('capacityDashboard.indicators.atCapacity')}</span>
            </div>
          </div>

          {autoRefresh && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-300">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm">{t('capacityDashboard.indicators.autoRefreshing')}</span>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showStatisticsModalState}
        onClose={() => dispatch(hideStatisticsModal())}
        title={t('capacityDashboard.statisticsModal.title')}
        size="lg"
      >
        <div className="space-y-6">
          {statisticsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : statisticsError ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-300">
                {t('capacityDashboard.statisticsModal.error')}: {statisticsError}
              </p>
              <Button variant="outline" onClick={handleViewStatistics} className="mt-4">
                {t('capacityDashboard.buttons.retry')}
              </Button>
            </div>
          ) : statisticsData ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {statisticsData.averageOccupancy}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{t('capacityDashboard.statisticsModal.averageOccupancy')}</div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                    {statisticsData.peakOccupancy}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{t('capacityDashboard.statisticsModal.peakOccupancy')}</div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                    {statisticsData.totalVisitors}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{t('capacityDashboard.statisticsModal.totalVisitors')}</div>
                </div>
              </div>

              {statisticsData.dailyStats && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('capacityDashboard.statisticsModal.dailyBreakdown')}</h3>
                  <div className="space-y-2">
                    {statisticsData.dailyStats.map((day, index) => (
                      <div key={index} className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-slate-900/60 rounded border border-gray-100 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{toLocaleDate(day.date)}</span>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                          <span>{t('capacityDashboard.statisticsModal.dayVisitors', { count: day.visitors })}</span>
                          <span>{t('capacityDashboard.statisticsModal.dayPeak', { value: day.peakOccupancy })}</span>
                          <span>{t('capacityDashboard.statisticsModal.dayAverage', { value: day.averageOccupancy })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">{t('capacityDashboard.statisticsModal.noData')}</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showTrendsModalState}
        onClose={() => dispatch(hideTrendsModal())}
        title={t('capacityDashboard.trendsModal.title')}
        size="lg"
      >
        <div className="space-y-6">
          {trendsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : trendsError ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-300">
                {t('capacityDashboard.trendsModal.error')}: {trendsError}
              </p>
              <Button variant="outline" onClick={handleViewTrends} className="mt-4">
                {t('capacityDashboard.buttons.retry')}
              </Button>
            </div>
          ) : trendsData ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('capacityDashboard.trendsModal.sevenDayTitle')}</h3>

                {trendsData.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-300">
                        {trendsData.summary.averageTrend > 0 ? '+' : ''}{trendsData.summary.averageTrend}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('capacityDashboard.trendsModal.averageChange')}</div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-4 rounded-lg">
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-300">
                        {trendsData.summary.peakDay}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('capacityDashboard.trendsModal.busiestDay')}</div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-lg">
                      <div className="text-xl font-bold text-green-600 dark:text-green-300">
                        {trendsData.summary.optimalTime}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('capacityDashboard.trendsModal.bestTime')}</div>
                    </div>
                  </div>
                )}
              </div>

              {trendsData.data && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">{t('capacityDashboard.trendsModal.dailyTrends')}</h4>
                  <div className="space-y-2">
                    {trendsData.data.map((trend, index) => (
                      <div key={index} className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-slate-900/60 rounded border border-gray-100 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{toLocaleDate(trend.date)}</span>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                          <span>{t('capacityDashboard.trendsModal.avg', { value: trend.averageOccupancy })}</span>
                          <span>{t('capacityDashboard.trendsModal.peak', { value: trend.peakOccupancy })}</span>
                          <span className={`font-medium ${
                            trend.trend > 0
                              ? 'text-green-600 dark:text-green-400'
                              : trend.trend < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-600 dark:text-gray-300'
                          }`}>
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
              <p className="text-gray-600 dark:text-gray-400">{t('capacityDashboard.trendsModal.noData')}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CapacityDashboard;
