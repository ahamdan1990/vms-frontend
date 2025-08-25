// src/components/common/Form/FormField.js
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { TEXT_STYLES } from '../../../constants/typography';
import { 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Enhanced Form Field Component
 * Provides consistent field layout, validation states, and mobile optimization
 */
const FormField = ({ 
  label,
  children,
  required = false,
  error = null,
  warning = null,
  success = null,
  help = null,
  className = '',
  horizontal = false,
  fieldId,
  ...props 
}) => {
  const hasError = Boolean(error);
  const hasWarning = Boolean(warning) && !hasError;
  const hasSuccess = Boolean(success) && !hasError && !hasWarning;
  const hasValidation = hasError || hasWarning || hasSuccess;

  const getValidationIcon = () => {
    if (hasError) {
      return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
    }
    if (hasWarning) {
      return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
    }
    if (hasSuccess) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
    return null;
  };

  const getValidationMessage = () => {
    if (hasError) return error;
    if (hasWarning) return warning;
    if (hasSuccess) return success;
    return help;
  };

  const getValidationClasses = () => {
    if (hasError) return 'text-red-600';
    if (hasWarning) return 'text-yellow-600';
    if (hasSuccess) return 'text-green-600';
    return 'text-gray-600';
  };

  // Clone children to add validation props
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        id: fieldId || child.props.id,
        'aria-describedby': hasValidation ? `${fieldId}-validation` : child.props['aria-describedby'],
        'aria-invalid': hasError ? 'true' : child.props['aria-invalid'],
        className: classNames(child.props.className, {
          'border-red-300 focus:border-red-500 focus:ring-red-500': hasError,
          'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500': hasWarning,
          'border-green-300 focus:border-green-500 focus:ring-green-500': hasSuccess,
        })
      });
    }
    return child;
  });

  if (horizontal) {
    return (
      <div className={classNames('sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start', className)} {...props}>
        {/* Label Column */}
        {label && (
          <label 
            htmlFor={fieldId}
            className={classNames(
              `${TEXT_STYLES.label.md} sm:pt-3`,
              'text-gray-700 font-medium',
              { 'text-red-700': hasError }
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Field Column */}
        <div className="mt-1 sm:mt-0 sm:col-span-2">
          <div className="relative">
            {enhancedChildren}
            
            {/* Validation Icon */}
            {hasValidation && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {getValidationIcon()}
              </div>
            )}
          </div>

          {/* Validation Message */}
          {getValidationMessage() && (
            <div 
              id={`${fieldId}-validation`}
              className={classNames(
                `${TEXT_STYLES.body.sm} mt-2 flex items-start space-x-1`,
                getValidationClasses()
              )}
            >
              {hasValidation && !hasSuccess && (
                <span className="flex-shrink-0 mt-0.5">
                  {hasError ? (
                    <ExclamationCircleIcon className="w-4 h-4" />
                  ) : (
                    <InformationCircleIcon className="w-4 h-4" />
                  )}
                </span>
              )}
              <span>{getValidationMessage()}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vertical Layout (Default - Mobile Friendly)
  return (
    <div className={classNames('space-y-2', className)} {...props}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={fieldId}
          className={classNames(
            `${TEXT_STYLES.label.lg} text-gray-700 font-medium block`,
            { 'text-red-700': hasError }
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Field with Validation */}
      <div className="relative">
        {enhancedChildren}
        
        {/* Validation Icon for smaller inputs */}
        {hasValidation && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {getValidationIcon()}
          </div>
        )}
      </div>

      {/* Validation/Help Message */}
      {getValidationMessage() && (
        <div 
          id={`${fieldId}-validation`}
          className={classNames(
            `${TEXT_STYLES.body.sm} flex items-start space-x-1`,
            getValidationClasses()
          )}
        >
          {hasValidation && !hasSuccess && (
            <span className="flex-shrink-0 mt-0.5">
              {hasError ? (
                <ExclamationCircleIcon className="w-4 h-4" />
              ) : (
                <InformationCircleIcon className="w-4 h-4" />
              )}
            </span>
          )}
          <span>{getValidationMessage()}</span>
        </div>
      )}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
  warning: PropTypes.string,
  success: PropTypes.string,
  help: PropTypes.string,
  className: PropTypes.string,
  horizontal: PropTypes.bool,
  fieldId: PropTypes.string,
};

export default FormField;