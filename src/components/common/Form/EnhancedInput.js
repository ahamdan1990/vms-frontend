// src/components/common/Form/EnhancedInput.js
import React, { useState, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * Enhanced Input Component
 * Mobile-optimized with proper touch targets, validation states, and accessibility
 */
const EnhancedInput = forwardRef(({
  type = 'text',
  size = 'md',
  variant = 'default',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  readOnly = false,
  error = false,
  success = false,
  warning = false,
  icon = null,
  iconPosition = 'left',
  rightElement = null,
  className = '',
  containerClassName = '',
  autoComplete,
  inputMode,
  pattern,
  maxLength,
  minLength,
  min,
  max,
  step,
  rows = 4, // for textarea
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Use forwarded ref or internal ref
  const finalRef = ref || inputRef;

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    // Keep focus on input after toggling
    setTimeout(() => finalRef.current?.focus(), 0);
  };

  // Base input classes
  const baseClasses = classNames(
    'block w-full transition-colors duration-200',
    'border border-gray-300 rounded-lg shadow-sm',
    'placeholder-gray-400 text-gray-900',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
    'read-only:bg-gray-50 read-only:cursor-default'
  );

  // Size-specific classes - Mobile optimized with min-height for touch targets
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-sm min-h-[44px]', // 44px minimum for mobile touch
    lg: 'px-4 py-3 text-base min-h-[48px]'
  };

  // Validation state classes
  const validationClasses = {
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    default: ''
  };

  // Determine current validation state
  const currentValidation = error ? 'error' : warning ? 'warning' : success ? 'success' : 'default';

  // Icon styling
  const iconClasses = 'w-5 h-5 text-gray-400';
  
  // Padding adjustments for icons
  const paddingClasses = {
    'icon-left': 'pl-10',
    'icon-right': 'pr-10',
    'icon-both': 'px-10'
  };

  const getPaddingClass = () => {
    const hasLeftIcon = icon && iconPosition === 'left';
    const hasRightIcon = (icon && iconPosition === 'right') || rightElement || type === 'password';
    
    if (hasLeftIcon && hasRightIcon) return paddingClasses['icon-both'];
    if (hasLeftIcon) return paddingClasses['icon-left'];
    if (hasRightIcon) return paddingClasses['icon-right'];
    return '';
  };

  const inputClasses = classNames(
    baseClasses,
    sizeClasses[size],
    validationClasses[currentValidation],
    getPaddingClass(),
    className
  );

  // Common input props
  const commonProps = {
    ref: finalRef,
    type: type === 'password' ? (showPassword ? 'text' : 'password') : type,
    placeholder,
    value,
    onChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    disabled,
    readOnly,
    autoComplete,
    inputMode,
    pattern,
    maxLength,
    minLength,
    min,
    max,
    step,
    className: inputClasses,
    ...props
  };

  // Container for input with icons
  const inputContainer = (
    <div className={classNames('relative', containerClassName)}>
      {/* Left Icon */}
      {icon && iconPosition === 'left' && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {React.cloneElement(icon, { className: iconClasses })}
        </div>
      )}

      {/* Input Element */}
      {type === 'textarea' ? (
        <textarea
          {...commonProps}
          rows={rows}
          className={classNames(commonProps.className, 'resize-vertical')}
        />
      ) : (
        <input {...commonProps} />
      )}

      {/* Right Elements */}
      <div className="absolute inset-y-0 right-0 flex items-center">
        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={classNames(
              'px-3 text-gray-400 hover:text-gray-600 focus:outline-none',
              'transition-colors duration-150',
              'min-w-[44px] min-h-[44px] flex items-center justify-center' // Touch-friendly
            )}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className="px-3 pointer-events-none">
            {React.cloneElement(icon, { className: iconClasses })}
          </div>
        )}

        {/* Right Element */}
        {rightElement && (
          <div className="px-3">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );

  return inputContainer;
});

EnhancedInput.displayName = 'EnhancedInput';

EnhancedInput.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'textarea']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'outline', 'filled']),
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  error: PropTypes.bool,
  success: PropTypes.bool,
  warning: PropTypes.bool,
  icon: PropTypes.element,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  rightElement: PropTypes.node,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  autoComplete: PropTypes.string,
  inputMode: PropTypes.string,
  pattern: PropTypes.string,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rows: PropTypes.number,
};

export default EnhancedInput;