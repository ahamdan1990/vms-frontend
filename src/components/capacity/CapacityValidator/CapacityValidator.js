// src/components/capacity/CapacityValidator/CapacityValidator.js
import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

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

// Services
import capacityService from '../../../services/capacityService';

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
  expectedVisitors = 1,
  isVipRequest = false,
  excludeInvitationId = null,
  onValidationChange,
  autoValidate = true,
  showAlternatives = true,
  className = ''
}) => {
  const dispatch = useDispatch();
  
  // Local state
  const [hasValidated, setHasValidated] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(0);

  // Redux state
  const {
    validation,
    alternatives,
    showAlternativesModal: isAlternativesModalOpen
  } = useSelector(state => state.capacity);

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce(() => {
      if (!dateTime) return;

      const validationRequest = {
        locationId,
        timeSlotId,
        dateTime,
        expectedVisitors,
        isVipRequest,
        excludeInvitationId
      };

      dispatch(validateCapacity(validationRequest));
      setHasValidated(true);
    }, 500),
    [locationId, timeSlotId, dateTime, expectedVisitors, isVipRequest, excludeInvitationId, dispatch]
  );

  // Auto-validate when parameters change
  useEffect(() => {
    if (autoValidate && dateTime) {
      debouncedValidate();
    }

    return () => {
      debouncedValidate.cancel();
    };
  }, [autoValidate, dateTime, debouncedValidate]);

  // Manual validation trigger
  const handleManualValidation = () => {
    setValidationTrigger(prev => prev + 1);
    debouncedValidate();
  };

  // Handle validation result changes
  useEffect(() => {
    if (onValidationChange && validation.result !== null) {
      onValidationChange(validation.result);
    }
  }, [validation.result, onValidationChange]);

  // Handle show alternatives
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

  // Handle alternative selection
  const handleSelectAlternative = (alternative) => {
    // Emit the selected alternative back to parent
    if (onValidationChange) {
      onValidationChange({
        isAvailable: true,
        selectedAlternative: alternative,
        alternativeSelected: true
      });
    }
    
    dispatch(hideAlternativesModal());
  };

  // Clear validation when component unmounts or dateTime changes significantly
  useEffect(() => {
    return () => {
      dispatch(clearValidation());
    };
  }, [dispatch]);

  // Don't render if no dateTime provided
  if (!dateTime) {
    return null;
  }

  // Validation status
  const isLoading = validation.loading;
  const hasError = validation.error && validation.error.length > 0;
  const hasResult = validation.result !== null;
  const isAvailable = validation.result?.isAvailable || false;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Validation Status */}
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
            <span>Checking capacity...</span>
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
                <p className="font-medium">Validation Error</p>
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
              ${isAvailable 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700'
              }
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={isAvailable ? 'success' : 'error'}
                    size="sm"
                  >
                    {isAvailable ? 'Available' : 'Not Available'}
                  </Badge>
                  
                  {validation.result.isWarningLevel && isAvailable && (
                    <Badge variant="warning" size="sm">
                      Limited Availability
                    </Badge>
                  )}
                </div>

                {/* Capacity Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {validation.result.isCurrentTime ? 'Current:' : 'Scheduled:'}
                    </span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                      {validation.result.currentOccupancy}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                      {validation.result.maxCapacity}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Available:</span>
                    <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                      {validation.result.availableSlots}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Utilization:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                      {validation.result.occupancyPercentage}%
                    </span>
                  </div>
                </div>

                {/* Messages */}
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

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualValidation}
                  loading={isLoading}
                  className="text-xs"
                >
                  Refresh
                </Button>

                {!isAvailable && showAlternatives && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowAlternatives}
                    className="text-xs"
                  >
                    Show Alternatives
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Validation Button */}
      {!autoValidate && !hasValidated && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualValidation}
          loading={isLoading}
          className="w-full"
        >
          Check Capacity
        </Button>
      )}

      {/* Alternatives Modal */}
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
  expectedVisitors: PropTypes.number,
  isVipRequest: PropTypes.bool,
  excludeInvitationId: PropTypes.number,
  onValidationChange: PropTypes.func,
  autoValidate: PropTypes.bool,
  showAlternatives: PropTypes.bool,
  className: PropTypes.string
};

export default CapacityValidator;
