// src/components/capacity/OccupancyCard/OccupancyCard.js
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

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
  title = 'Current Occupancy',
  showActions = false,
  onRefresh,
  onViewDetails,
  className = ''
}) => {
  // Calculate status
  const status = occupancy 
    ? capacityService.getOccupancyStatus(occupancy)
    : 'unknown';

  const statusText = capacityService.getStatusDisplayText(status);
  const statusColorClass = capacityService.getStatusColorClass(status);

  // Get utilization color
  const getUtilizationColor = (percentage) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Get progress bar color
  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  console.log(occupancy)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          
          {occupancy?.lastUpdated && (
            <span className="text-sm text-gray-500">
              Updated {formatDistanceToNow(new Date(occupancy.lastUpdated), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <p className="font-medium">Error Loading Occupancy</p>
              <p className="text-sm">{error}</p>
            </div>
            {onRefresh && (
              <Button
                variant="outline"
                onClick={onRefresh}
                size="sm"
              >
                Retry
              </Button>
            )}
          </div>
        ) : occupancy ? (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge
                variant={
                  status === 'at-capacity' ? 'error' :
                  status === 'warning' ? 'warning' : 'success'
                }
                size="lg"
                className="px-4 py-2"
              >
                {statusText}
              </Badge>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {occupancy.currentOccupancy}
                </div>
                <div className="text-sm text-gray-600">Current</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {occupancy.maxCapacity}
                </div>
                <div className="text-sm text-gray-600">Capacity</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600">
                  {occupancy.availableSlots}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl md:text-3xl font-bold ${getUtilizationColor(occupancy.occupancyPercentage)}`}>
                  {occupancy.occupancyPercentage}%
                </div>
                <div className="text-sm text-gray-600">Utilization</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Capacity Utilization</span>
                <span>{occupancy.occupancyPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(occupancy.occupancyPercentage)}`}
                  style={{ width: `${Math.min(occupancy.occupancyPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Warning Messages */}
            {occupancy.isAtCapacity && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium">
                  ⚠️ At maximum capacity - no additional visitors can be accommodated
                </p>
              </div>
            )}

            {occupancy.isWarningLevel && !occupancy.isAtCapacity && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm font-medium">
                  ⚠️ Approaching capacity limit - only {occupancy.availableSlots} slots remaining
                </p>
              </div>
            )}

            {/* Additional Information */}
            {(occupancy.locationId || occupancy.timeSlotId) && (
              <div className="border-t border-gray-200 pt-4">
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  {occupancy.locationId && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Location:</dt>
                      <dd className="text-gray-900 font-medium">{occupancy.locationName || `Location #${occupancy.locationId}`}</dd>
                    </div>
                  )}
                  {occupancy.timeSlotId && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Time Slot:</dt>
                      <dd className="text-gray-900 font-medium">{occupancy.timeSlotName || `Slot #${occupancy.timeSlotId}`}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Date/Time:</dt>
                    <dd className="text-gray-900 font-medium">
                      {new Date(occupancy.dateTime).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {onRefresh && (
                  <Button
                    variant="outline"
                    onClick={onRefresh}
                    size="sm"
                    className="flex-1"
                  >
                    Refresh
                  </Button>
                )}
                {onViewDetails && (
                  <Button
                    variant="outline"
                    onClick={onViewDetails}
                    size="sm"
                    className="flex-1"
                  >
                    View Details
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No occupancy data available</p>
            {onRefresh && (
              <Button
                variant="outline"
                onClick={onRefresh}
                size="sm"
                className="mt-4"
              >
                Load Data
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