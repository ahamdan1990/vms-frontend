// src/components/capacity/AlternativesModal/AlternativesModal.js
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

// Components
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../common/EmptyState/EmptyState';

// Services
import timeSlotsService from '../../../services/timeSlotsService';

// Utils
import { format, parseISO } from 'date-fns';

/**
 * Alternatives Modal Component
 * Shows alternative time slots when the requested slot is unavailable
 */
const AlternativesModal = ({
  isOpen,
  onClose,
  alternatives = [],
  loading = false,
  error = null,
  originalRequest = null,
  onSelectAlternative,
  title = 'Alternative Time Slots'
}) => {
  // Format the original request details
  const formatOriginalRequest = () => {
    if (!originalRequest) return '';
    
    const dateTime = originalRequest.originalDateTime 
      ? format(parseISO(originalRequest.originalDateTime), 'PPP p')
      : '';
    
    const visitors = originalRequest.expectedVisitors || 1;
    const location = originalRequest.locationName || 'Any location';
    
    return `${dateTime} • ${visitors} visitor${visitors !== 1 ? 's' : ''} • ${location}`;
  };

  // Get status badge variant
  const getStatusVariant = (alternative) => {
    if (!alternative.isRecommended) return 'neutral';
    if (alternative.availableCapacity >= alternative.maxCapacity * 0.8) return 'success';
    if (alternative.availableCapacity >= alternative.maxCapacity * 0.5) return 'warning';
    return 'error';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      className="max-h-[80vh]"
    >
      <div className="space-y-6">
        {/* Original Request Info */}
        {originalRequest && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Requested Appointment</h4>
            <p className="text-sm text-gray-600">{formatOriginalRequest()}</p>
            <p className="text-sm text-red-600 mt-1">
              This time slot is currently at capacity or unavailable.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Finding alternative time slots...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <p className="font-medium">Unable to Find Alternatives</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && alternatives.length === 0 && (
          <EmptyState
            title="No Alternative Time Slots Found"
            description="Unfortunately, there are no available alternative time slots that match your requirements."
            action={
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            }
          />
        )}

        {/* Alternatives List */}
        {!loading && !error && alternatives.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              Available Alternatives ({alternatives.length} found)
            </h4>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alternatives.map((alternative, index) => (
                <motion.div
                  key={`${alternative.dateTime}-${alternative.timeSlotId || index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`
                    border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors
                    ${alternative.isRecommended ? 'ring-2 ring-blue-100 border-blue-200' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Date and Time */}
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-medium text-gray-900">
                          {format(parseISO(alternative.dateTime), 'PPP')}
                        </h5>
                        {alternative.isRecommended && (
                          <Badge variant="success" size="sm">
                            Recommended
                          </Badge>
                        )}
                      </div>

                      {/* Time Slot Details */}
                      {alternative.timeSlotName && (
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {alternative.timeSlotName}
                          </span>
                          {alternative.startTime && alternative.endTime && (
                            <span className="text-sm text-gray-600">
                              {timeSlotsService.formatTimeForDisplay(alternative.startTime)} - {timeSlotsService.formatTimeForDisplay(alternative.endTime)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Capacity Information */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium text-green-600">
                            {alternative.availableCapacity || alternative.availableSlots}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Total Capacity:</span>
                          <span className="font-medium text-gray-900">
                            {alternative.maxCapacity}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Utilization:</span>
                          <Badge
                            variant={getStatusVariant(alternative)}
                            size="sm"
                          >
                            {alternative.occupancyPercentage 
                              ? `${alternative.occupancyPercentage}%`
                              : `${Math.round((1 - (alternative.availableCapacity / alternative.maxCapacity)) * 100)}%`
                            }
                          </Badge>
                        </div>
                      </div>

                      {/* Reason */}
                      {alternative.reason && (
                        <p className="text-sm text-gray-600 mt-2">
                          {alternative.reason}
                        </p>
                      )}
                    </div>

                    {/* Select Button */}
                    <div className="ml-4">
                      <Button
                        size="sm"
                        onClick={() => onSelectAlternative && onSelectAlternative(alternative)}
                        variant={alternative.isRecommended ? 'primary' : 'outline'}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Recommended alternatives are sorted by availability and proximity to your requested time.
                You can select any alternative that works for your schedule.
              </p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          
          {!loading && !error && alternatives.length === 0 && originalRequest && (
            <Button
              onClick={() => {
                // Could trigger a search with broader criteria
                console.log('Search with broader criteria');
              }}
            >
              Search Different Dates
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

AlternativesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  alternatives: PropTypes.arrayOf(PropTypes.shape({
    dateTime: PropTypes.string.isRequired,
    timeSlotId: PropTypes.number,
    timeSlotName: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    availableSlots: PropTypes.number,
    availableCapacity: PropTypes.number,
    maxCapacity: PropTypes.number,
    occupancyPercentage: PropTypes.number,
    isRecommended: PropTypes.bool,
    reason: PropTypes.string,
    name: PropTypes.string
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  originalRequest: PropTypes.shape({
    originalDateTime: PropTypes.string,
    expectedVisitors: PropTypes.number,
    locationId: PropTypes.number,
    locationName: PropTypes.string
  }),
  onSelectAlternative: PropTypes.func,
  title: PropTypes.string
};

export default AlternativesModal;