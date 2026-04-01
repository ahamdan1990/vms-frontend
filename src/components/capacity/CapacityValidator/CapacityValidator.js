// src/components/capacity/CapacityValidator/CapacityValidator.js
import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Redux actions
import {
  validateCapacity,
  getAlternativeTimeSlots,
  clearValidation,
  showAlternativesModal,
  hideAlternativesModal
} from '../../../store/slices/capacitySlice';

// Components
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import AlternativesModal from '../AlternativesModal/AlternativesModal';

// Utils
import { debounce } from 'lodash';

/**
 * Capacity Validator Component
 * Provides real-time capacity validation for forms
 */
const CapacityValidator = ({
  locationId,
  timeSlotId,
  dateTime,
  endDateTime = null,
  expectedVisitors = 1,
  isVipRequest = false,
  excludeInvitationId = null,
  onValidationChange,
  autoValidate = true,
  showAlternatives = true,
  className = ''
}) => {
  const { t } = useTranslation('analytics');
  const dispatch = useDispatch();

  const [hasValidated, setHasValidated] = useState(false);

  const {
    validation,
    alternatives,
    showAlternativesModal: isAlternativesModalOpen
  } = useSelector(state => state.capacity);

  const debouncedValidate = useCallback(
    debounce(() => {
      if (!dateTime) return;

      const validationRequest = {
        locationId,
        timeSlotId,
        dateTime,
        endDateTime,
        expectedVisitors,
        isVipRequest,
        excludeInvitationId
      };

      dispatch(validateCapacity(validationRequest));
      setHasValidated(true);
    }, 500),
    [locationId, timeSlotId, dateTime, endDateTime, expectedVisitors, isVipRequest, excludeInvitationId, dispatch]
  );

  useEffect(() => {
    if (autoValidate && dateTime) {
      debouncedValidate();
    }

    return () => {
      debouncedValidate.cancel();
    };
  }, [autoValidate, dateTime, debouncedValidate]);

  const handleManualValidation = () => {
    debouncedValidate();
  };

  useEffect(() => {
    if (onValidationChange && validation.result !== null) {
      onValidationChange(validation.result);
    }
  }, [validation.result, onValidationChange]);

  const handleShowAlternatives = () => {
    if (!dateTime) return;

    const alternativesRequest = {
      originalDateTime: dateTime,
      expectedVisitors,
      locationId
    };

    dispatch(getAlternativeTimeSlots(alternativesRequest));
    dispatch(showAlternativesModal(alternativesRequest));
  };

  const handleSelectAlternative = (alternative) => {
    if (onValidationChange) {
      onValidationChange({
        isAvailable: true,
        selectedAlternative: alternative,
        alternativeSelected: true
      });
    }

    dispatch(hideAlternativesModal());
  };

  useEffect(() => {
    return () => {
      dispatch(clearValidation());
    };
  }, [dispatch]);

  if (!dateTime) {
    return null;
  }

  const isLoading = validation.loading;
  const hasError = validation.error && validation.error.length > 0;
  const hasResult = validation.result !== null;
  const isAvailable = validation.result?.isAvailable || false;

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-300"
          >
            <LoadingSpinner size="sm" />
            <span>{t('capacityDashboard.validator.checking')}</span>
          </motion.div>
        )}

        {hasError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-700 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <div className="text-red-600 dark:text-red-200 text-sm">
                <p className="font-medium">{t('capacityDashboard.validator.validationError')}</p>
                <ul className="mt-1 list-disc list-inside">
                  {validation.error.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {hasResult && !hasError && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              border rounded-lg p-4
              ${
                isAvailable
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700'
              }
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={isAvailable ? 'success' : 'error'} size="sm">
                    {isAvailable
                      ? t('capacityDashboard.validator.available')
                      : t('capacityDashboard.validator.notAvailable')}
                  </Badge>

                  {validation.result.isWarningLevel && isAvailable && (
                    <Badge variant="warning" size="sm">
                      {t('capacityDashboard.validator.limitedAvailability')}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {validation.result.isCurrentTime
                        ? t('capacityDashboard.validator.currentLabel')
                        : t('capacityDashboard.validator.scheduledLabel')}
                    </span>
                    <span className="ms-1 font-medium text-gray-900 dark:text-gray-100">
                      {validation.result.currentOccupancy}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t('capacityDashboard.overview.capacityLabel')}</span>
                    <span className="ms-1 font-medium text-gray-900 dark:text-gray-100">
                      {validation.result.maxCapacity}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t('capacityDashboard.overview.availableLabel')}</span>
                    <span className="ms-1 font-medium text-green-600 dark:text-green-400">
                      {validation.result.availableSlots}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t('capacityDashboard.overview.utilizationLabel')}</span>
                    <span className="ms-1 font-medium text-gray-900 dark:text-gray-100">
                      {validation.result.occupancyPercentage}%
                    </span>
                  </div>
                </div>

                {validation.result.messages && validation.result.messages.length > 0 && (
                  <div className="mt-2">
                    {validation.result.messages.map((message, index) => (
                      <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
                        {message}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualValidation}
                  loading={isLoading}
                  className="text-xs"
                >
                  {t('capacityDashboard.buttons.refresh')}
                </Button>

                {!isAvailable && showAlternatives && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowAlternatives}
                    className="text-xs"
                  >
                    {t('capacityDashboard.validator.showAlternatives')}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!autoValidate && !hasValidated && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualValidation}
          loading={isLoading}
          className="w-full"
        >
          {t('capacityDashboard.validator.checkCapacity')}
        </Button>
      )}

      <AlternativesModal
        isOpen={isAlternativesModalOpen}
        onClose={() => dispatch(hideAlternativesModal())}
        alternatives={alternatives.list}
        loading={alternatives.loading}
        error={alternatives.error}
        originalRequest={alternatives.originalRequest}
        onSelectAlternative={handleSelectAlternative}
      />
    </div>
  );
};

CapacityValidator.propTypes = {
  locationId: PropTypes.number,
  timeSlotId: PropTypes.number,
  dateTime: PropTypes.string,
  endDateTime: PropTypes.string,
  expectedVisitors: PropTypes.number,
  isVipRequest: PropTypes.bool,
  excludeInvitationId: PropTypes.number,
  onValidationChange: PropTypes.func,
  autoValidate: PropTypes.bool,
  showAlternatives: PropTypes.bool,
  className: PropTypes.string
};

export default CapacityValidator;
