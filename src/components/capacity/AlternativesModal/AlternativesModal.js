// src/components/capacity/AlternativesModal/AlternativesModal.js
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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
  title
}) => {
  const { t } = useTranslation('analytics');

  const formatOriginalRequest = () => {
    if (!originalRequest) return '';

    const dateTime = originalRequest.originalDateTime
      ? format(parseISO(originalRequest.originalDateTime), 'PPP p')
      : '';

    const visitors = originalRequest.expectedVisitors || 1;
    const location = originalRequest.locationName || t('capacityDashboard.alternatives.anyLocation');

    return t('capacityDashboard.alternatives.requestSummary', {
      dateTime,
      visitors,
      visitorLabel: visitors === 1
        ? t('capacityDashboard.alternatives.visitorSingular')
        : t('capacityDashboard.alternatives.visitorPlural'),
      location
    });
  };

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
      title={title || t('capacityDashboard.alternatives.title')}
      size="lg"
      className="max-h-[80vh]"
    >
      <div className="space-y-6">
        {originalRequest && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{t('capacityDashboard.alternatives.requestedAppointment')}</h4>
            <p className="text-sm text-gray-600">{formatOriginalRequest()}</p>
            <p className="text-sm text-red-600 mt-1">{t('capacityDashboard.alternatives.requestUnavailable')}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ms-3 text-gray-600">{t('capacityDashboard.alternatives.finding')}</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <p className="font-medium">{t('capacityDashboard.alternatives.unableToFind')}</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && alternatives.length === 0 && (
          <EmptyState
            title={t('capacityDashboard.alternatives.emptyTitle')}
            description={t('capacityDashboard.alternatives.emptyDescription')}
            action={
              <Button variant="outline" onClick={onClose}>
                {t('common:buttons.close')}
              </Button>
            }
          />
        )}

        {!loading && !error && alternatives.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              {t('capacityDashboard.alternatives.availableCount', { count: alternatives.length })}
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
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-medium text-gray-900">{format(parseISO(alternative.dateTime), 'PPP')}</h5>
                        {alternative.isRecommended && (
                          <Badge variant="success" size="sm">
                            {t('capacityDashboard.alternatives.recommended')}
                          </Badge>
                        )}
                      </div>

                      {alternative.timeSlotName && (
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-sm font-medium text-gray-700">{alternative.timeSlotName}</span>
                          {alternative.startTime && alternative.endTime && (
                            <span className="text-sm text-gray-600">
                              {timeSlotsService.formatTimeForDisplay(alternative.startTime)} - {timeSlotsService.formatTimeForDisplay(alternative.endTime)}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{t('capacityDashboard.overview.availableLabel')}</span>
                          <span className="font-medium text-green-600">
                            {alternative.availableCapacity || alternative.availableSlots}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{t('capacityDashboard.alternatives.totalCapacityLabel')}</span>
                          <span className="font-medium text-gray-900">{alternative.maxCapacity}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{t('capacityDashboard.overview.utilizationLabel')}</span>
                          <Badge variant={getStatusVariant(alternative)} size="sm">
                            {alternative.occupancyPercentage
                              ? `${alternative.occupancyPercentage}%`
                              : `${Math.round((1 - (alternative.availableCapacity / alternative.maxCapacity)) * 100)}%`}
                          </Badge>
                        </div>
                      </div>

                      {alternative.reason && <p className="text-sm text-gray-600 mt-2">{alternative.reason}</p>}
                    </div>

                    <div className="ms-4">
                      <Button
                        size="sm"
                        onClick={() => onSelectAlternative && onSelectAlternative(alternative)}
                        variant={alternative.isRecommended ? 'primary' : 'outline'}
                      >
                        {t('capacityDashboard.alternatives.select')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">{t('capacityDashboard.alternatives.tip')}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            {t('common:buttons.close')}
          </Button>

          {!loading && !error && alternatives.length === 0 && originalRequest && (
            <Button
              onClick={() => {
                // Placeholder action for a future broad search flow.
                console.log('Search with broader criteria');
              }}
            >
              {t('capacityDashboard.alternatives.searchDifferentDates')}
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
