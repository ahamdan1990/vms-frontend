// src/components/capacity/OccupancyCard/OccupancyCard.js
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Components
import Card from '../../common/Card/Card';
import Badge from '../../common/Badge/Badge';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Button from '../../common/Button/Button';

// Services
import capacityService from '../../../services/capacityService';

// Utils
import { formatDistanceToNow } from 'date-fns';

/**
 * Reusable Occupancy Card Component
 * Displays current occupancy status with visual indicators
 */
const OccupancyCard = ({
  occupancy,
  loading = false,
  error = null,
  title,
  showActions = false,
  onRefresh,
  onViewDetails,
  className = ''
}) => {
  const { t } = useTranslation('analytics');

  const status = occupancy ? capacityService.getOccupancyStatus(occupancy) : 'unknown';

  const statusText = {
    'at-capacity': t('capacityDashboard.overview.statusFull'),
    warning: t('capacityDashboard.overview.statusWarning'),
    normal: t('capacityDashboard.overview.statusAvailable'),
    unknown: t('capacityDashboard.current.statusUnknown')
  }[status] || t('capacityDashboard.current.statusUnknown');

  const getUtilizationColor = (percentage) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title || t('capacityDashboard.current.title')}</h3>

          {occupancy?.lastUpdated && (
            <span className="text-sm text-gray-500">
              {t('capacityDashboard.current.updatedAt', {
                time: formatDistanceToNow(new Date(occupancy.lastUpdated), { addSuffix: true })
              })}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <p className="font-medium">{t('capacityDashboard.current.errorLoading')}</p>
              <p className="text-sm">{error}</p>
            </div>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh} size="sm">
                {t('capacityDashboard.buttons.retry')}
              </Button>
            )}
          </div>
        ) : occupancy ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Badge
                variant={
                  status === 'at-capacity'
                    ? 'error'
                    : status === 'warning'
                      ? 'warning'
                      : 'success'
                }
                size="lg"
                className="px-4 py-2"
              >
                {statusText}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{occupancy.currentOccupancy}</div>
                <div className="text-sm text-gray-600">{t('capacityDashboard.overview.currentLabel')}</div>
              </div>

              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{occupancy.maxCapacity}</div>
                <div className="text-sm text-gray-600">{t('capacityDashboard.overview.capacityLabel')}</div>
              </div>

              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600">{occupancy.availableSlots}</div>
                <div className="text-sm text-gray-600">{t('capacityDashboard.overview.availableLabel')}</div>
              </div>

              <div className="text-center">
                <div className={`text-2xl md:text-3xl font-bold ${getUtilizationColor(occupancy.occupancyPercentage)}`}>
                  {occupancy.occupancyPercentage}%
                </div>
                <div className="text-sm text-gray-600">{t('capacityDashboard.overview.utilizationLabel')}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('capacityDashboard.current.capacityUtilization')}</span>
                <span>{occupancy.occupancyPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(occupancy.occupancyPercentage)}`}
                  style={{ width: `${Math.min(occupancy.occupancyPercentage, 100)}%` }}
                />
              </div>
            </div>

            {occupancy.isAtCapacity && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium">{t('capacityDashboard.current.atCapacityWarning')}</p>
              </div>
            )}

            {occupancy.isWarningLevel && !occupancy.isAtCapacity && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm font-medium">
                  {t('capacityDashboard.current.approachingCapacityWarning', { count: occupancy.availableSlots })}
                </p>
              </div>
            )}

            {(occupancy.locationId || occupancy.timeSlotId) && (
              <div className="border-t border-gray-200 pt-4">
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  {occupancy.locationId && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">{t('capacityDashboard.current.locationLabel')}</dt>
                      <dd className="text-gray-900 font-medium">
                        {occupancy.locationName || t('capacityDashboard.current.locationFallback', { id: occupancy.locationId })}
                      </dd>
                    </div>
                  )}
                  {occupancy.timeSlotId && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">{t('capacityDashboard.current.timeSlotLabel')}</dt>
                      <dd className="text-gray-900 font-medium">
                        {occupancy.timeSlotName || t('capacityDashboard.current.timeSlotFallback', { id: occupancy.timeSlotId })}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">{t('capacityDashboard.current.dateTimeLabel')}</dt>
                    <dd className="text-gray-900 font-medium">{new Date(occupancy.dateTime).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>
            )}

            {showActions && (
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {onRefresh && (
                  <Button variant="outline" onClick={onRefresh} size="sm" className="flex-1">
                    {t('capacityDashboard.buttons.refresh')}
                  </Button>
                )}
                {onViewDetails && (
                  <Button variant="outline" onClick={onViewDetails} size="sm" className="flex-1">
                    {t('capacityDashboard.current.viewDetails')}
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">{t('capacityDashboard.current.noData')}</p>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh} size="sm" className="mt-4">
                {t('capacityDashboard.current.loadData')}
              </Button>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

OccupancyCard.propTypes = {
  occupancy: PropTypes.shape({
    currentOccupancy: PropTypes.number,
    maxCapacity: PropTypes.number,
    availableSlots: PropTypes.number,
    occupancyPercentage: PropTypes.number,
    isAtCapacity: PropTypes.bool,
    isWarningLevel: PropTypes.bool,
    dateTime: PropTypes.string,
    locationId: PropTypes.number,
    locationName: PropTypes.string,
    timeSlotId: PropTypes.number,
    timeSlotName: PropTypes.string,
    lastUpdated: PropTypes.string
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  showActions: PropTypes.bool,
  onRefresh: PropTypes.func,
  onViewDetails: PropTypes.func,
  className: PropTypes.string
};

export default OccupancyCard;
