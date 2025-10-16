/**
 * SearchInput Component
 * A specialized input component for search functionality with debouncing and clear functionality
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchInput = ({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',
  disabled = false,
  size = 'medium',
  debounceMs = 300,
  showClearButton = true,
  autoFocus = false,
  className,
  inputClassName,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const isControlled = value !== undefined;

  // Auto focus on mount if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Sync internal value with controlled value
  useEffect(() => {
    if (isControlled) {
      setInternalValue(value);
    }
  }, [value, isControlled]);

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (internalValue !== undefined) {
      timeoutRef.current = setTimeout(() => {
        if (onSearch) {
          onSearch(internalValue);
        }
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [internalValue, debounceMs, onSearch]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  const handleClear = () => {
    const clearedValue = '';
    
    if (!isControlled) {
      setInternalValue(clearedValue);
    }
    
    if (onClear) {
      onClear();
    }
    
    if (onChange) {
      const syntheticEvent = {
        target: { value: clearedValue }
      };
      onChange(syntheticEvent);
    }
    
    // Focus back on input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'text-sm',
          input: 'py-1.5 pl-8 pr-8',
          icon: 'h-4 w-4',
          clearButton: 'h-4 w-4'
        };
      case 'large':
        return {
          container: 'text-base',
          input: 'py-3 pl-10 pr-10',
          icon: 'h-6 w-6',
          clearButton: 'h-5 w-5'
        };
      case 'medium':
      default:
        return {
          container: 'text-sm',
          input: 'py-2 pl-9 pr-9',
          icon: 'h-5 w-5',
          clearButton: 'h-4 w-4'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const currentValue = isControlled ? value : internalValue;
  const showClear = showClearButton && currentValue && currentValue.length > 0;

  const containerClasses = classNames(
    'relative flex items-center',
    sizeClasses.container,
    className
  );

  const inputClasses = classNames(
    'block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:leading-6 transition-colors duration-200',
    sizeClasses.input,
    {
      'bg-gray-50 text-gray-500 ring-gray-200 cursor-not-allowed': disabled,
      'ring-blue-300': isFocused && !disabled
    },
    inputClassName
  );

  const iconClasses = classNames(
    'absolute left-2.5 text-gray-400 pointer-events-none',
    sizeClasses.icon
  );

  const clearButtonClasses = classNames(
    'absolute right-2.5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200',
    sizeClasses.clearButton,
    {
      'hover:text-gray-300 cursor-not-allowed': disabled
    }
  );

  return (
    <div className={containerClasses} {...props}>
      {/* Search Icon */}
      <MagnifyingGlassIcon className={iconClasses} />
      
      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        aria-label="Search"
      />
      
      {/* Clear Button */}
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className={clearButtonClasses}
          aria-label="Clear search"
        >
          <XMarkIcon />
        </button>
      )}
    </div>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  debounceMs: PropTypes.number,
  showClearButton: PropTypes.bool,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string
};

export default SearchInput;
