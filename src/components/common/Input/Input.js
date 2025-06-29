// src/components/common/Input/Input.js
import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Professional Input Component with validation, icons, and multiple variants
 * Supports all input types with consistent styling and error handling
 */
const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  success,
  helperText,
  className = '',
  inputClassName = '',
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  rightElement,
  showPasswordToggle = false,
  autoComplete,
  id,
  name,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);
  const isPassword = type === 'password';
  const currentType = isPassword && showPassword ? 'text' : type;

  const containerClasses = classNames('relative', className);
  
  const labelClasses = classNames(
    'block text-sm font-medium mb-1.5 transition-colors',
    {
      'text-gray-700': !hasError && !hasSuccess,
      'text-red-600': hasError,
      'text-green-600': hasSuccess,
      'text-gray-400': disabled
    }
  );

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const inputClasses = classNames(
    'block w-full rounded-lg border shadow-sm transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'placeholder:text-gray-400',
    sizeClasses[size],
    {
      // Default state
      'border-gray-300 focus:border-blue-500 focus:ring-blue-500': 
        !hasError && !hasSuccess && variant === 'default',
      
      // Error state
      'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50': hasError,
      
      // Success state
      'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50': hasSuccess,
      
      // Focused state
      'ring-2': focused,
      
      // Icon padding
      'pl-10': leftIcon,
      'pr-10': rightIcon || rightElement || (isPassword && showPasswordToggle),
      
      // Variants
      'border-0 bg-gray-100 focus:bg-white focus:ring-gray-300': variant === 'filled',
      'border-0 border-b-2 rounded-none bg-transparent focus:ring-0 focus:border-blue-500': variant === 'underline'
    },
    inputClassName
  );

  const iconClasses = classNames(
    'absolute top-1/2 transform -translate-y-1/2 w-5 h-5',
    {
      'text-gray-400': !hasError && !hasSuccess,
      'text-red-500': hasError,
      'text-green-500': hasSuccess
    }
  );

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const EyeIcon = ({ open }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      )}
    </svg>
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={classNames(iconClasses, 'left-3')}>
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={currentType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && !rightElement && !(isPassword && showPasswordToggle) && (
          <div className={classNames(iconClasses, 'right-3')}>
            {rightIcon}
          </div>
        )}
        
        {rightElement && !(isPassword && showPasswordToggle) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightElement}
          </div>
        )}
        
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            className={classNames(
              iconClasses,
              'right-3 hover:text-gray-600 focus:outline-none transition-colors'
            )}
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>
      
      {(error || success || helperText) && (
        <div className="mt-1.5 text-sm">
          {error && (
            <p className="text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
          
          {success && !error && (
            <p className="text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </p>
          )}
          
          {helperText && !error && !success && (
            <p className="text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  success: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'filled', 'underline']),
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  rightElement: PropTypes.element,
  showPasswordToggle: PropTypes.bool,
  autoComplete: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string
};

export default Input;