/**
 * Textarea Component
 * A flexible textarea input component with validation and character counting
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Textarea = ({
  value = '',
  onChange,
  placeholder,
  rows = 4,
  cols,
  disabled = false,
  readOnly = false,
  required = false,
  maxLength,
  minLength,
  autoResize = false,
  showCharacterCount = false,
  label,
  helpText,
  error,
  name,
  id,
  className,
  labelClassName,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const textareaRef = useRef(null);
  
  const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [currentValue, autoResize]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  const getCharacterCount = () => {
    return currentValue ? currentValue.length : 0;
  };

  const isOverMaxLength = maxLength && getCharacterCount() > maxLength;
  const hasError = error || isOverMaxLength;

  const textareaClasses = classNames(
    'block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-colors duration-200',
    {
      // Normal state
      'ring-gray-300 focus:ring-blue-600': !hasError && !disabled && !readOnly,
      
      // Error state
      'ring-red-300 focus:ring-red-500 text-red-900 placeholder:text-red-300': hasError && !disabled,
      
      // Disabled state
      'bg-gray-50 text-gray-500 ring-gray-200 cursor-not-allowed': disabled,
      
      // Read-only state
      'bg-gray-50 ring-gray-200': readOnly && !disabled,
      
      // Resize behavior
      'resize-none': autoResize,
      'resize-vertical': !autoResize
    },
    className
  );

  const labelClasses = classNames(
    'block text-sm font-medium leading-6 text-gray-900',
    {
      'text-red-700': hasError,
      'text-gray-500': disabled
    },
    labelClassName
  );

  return (
    <div>
      {label && (
        <label htmlFor={textareaId} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={label ? 'mt-2' : ''}>
        <textarea
          ref={textareaRef}
          id={textareaId}
          name={name}
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          cols={cols}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          className={textareaClasses}
          aria-describedby={
            classNames({
              [`${textareaId}-error`]: hasError,
              [`${textareaId}-help`]: helpText,
              [`${textareaId}-count`]: showCharacterCount
            })
          }
          {...props}
        />
        
        {/* Character count and max length info */}
        {(showCharacterCount || maxLength) && (
          <div className="mt-1 flex justify-between text-sm">
            <div></div>
            <div
              id={`${textareaId}-count`}
              className={classNames(
                'text-gray-500',
                {
                  'text-red-600': isOverMaxLength
                }
              )}
            >
              {showCharacterCount && (
                <span>
                  {getCharacterCount()}
                  {maxLength && ` / ${maxLength}`}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Help text */}
        {helpText && !hasError && (
          <p id={`${textareaId}-help`} className="mt-2 text-sm text-gray-600">
            {helpText}
          </p>
        )}
        
        {/* Error message */}
        {hasError && (
          <p id={`${textareaId}-error`} className="mt-2 text-sm text-red-600">
            {error || (isOverMaxLength && `Maximum ${maxLength} characters allowed`)}
          </p>
        )}
      </div>
    </div>
  );
};

Textarea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  cols: PropTypes.number,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  autoResize: PropTypes.bool,
  showCharacterCount: PropTypes.bool,
  label: PropTypes.string,
  helpText: PropTypes.string,
  error: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  labelClassName: PropTypes.string
};

export default Textarea;
