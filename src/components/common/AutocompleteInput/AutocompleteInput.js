// src/components/common/AutocompleteInput/AutocompleteInput.js
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AutocompleteInput = ({
  value = null,
  onChange,
  onSelect,
  onBlur,
  options = [],
  placeholder = 'Search...',
  disabled = false,
  loading = false,
  error = null,
  label = null,
  required = false,
  clearable = true,
  maxDisplayOptions = 10,
  formatOption = (option) => option?.label || option?.name || option?.toString() || '',
  getOptionLabel = null, // Support for getOptionLabel prop
  getOptionDescription = null, // Support for getOptionDescription prop
  filterOption = (option, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') return true;
    const formatter = getOptionLabel || formatOption;
    const optionText = formatter(option).toLowerCase();
    return optionText.includes(searchTerm.toLowerCase());
  },
  className = '',
  inputClassName = '',
  optionsClassName = '',
  ...inputProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const optionsRef = useRef(null);

  // Get display text from value
  const getDisplayValue = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    const formatter = getOptionLabel || formatOption;
    return formatter(val);
  };

  // Update search term when value changes externally
  useEffect(() => {
    setSearchTerm(getDisplayValue(value));
  }, [value]);

  // Filter and limit options
  const filteredOptions = options
    .filter(option => filterOption(option, searchTerm || ''))
    .slice(0, maxDisplayOptions);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setHighlightedIndex(-1);
    setIsOpen(true);
    // Don't call onChange when user is just typing, only when selecting an option
  };

  const handleOptionSelect = (option) => {
    const formatter = getOptionLabel || formatOption;
    const optionText = formatter(option);
    setSearchTerm(optionText);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect?.(option);
    onChange?.(option); // Pass the full option object, not just the text
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange?.(null); // Pass null for cleared value
    onSelect?.(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      setHighlightedIndex(0);
      e.preventDefault();
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBlur = (e) => {
    // Call parent's onBlur if provided
    if (onBlur) {
      onBlur(e);
    }

    // Close dropdown when clicking outside
    setTimeout(() => {
      if (!optionsRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }, 150);
  };

  const inputClasses = `
    relative w-full px-3 py-2 pr-10
    border border-gray-300 rounded-lg
    bg-white text-gray-900
    placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200
    ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
    ${inputClassName}
  `.trim();

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          {...inputProps}
        />

        {/* Icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {clearable && searchTerm && searchTerm.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="mr-1 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isOpen ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div
            ref={optionsRef}
            className={`
              absolute z-50 w-full mt-1
              bg-white border border-gray-300 rounded-lg shadow-lg
              max-h-60 overflow-y-auto
              ${optionsClassName}
            `}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`
                    w-full px-3 py-2 text-left
                    hover:bg-gray-50 transition-colors
                    ${index === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                    ${index === 0 ? 'rounded-t-lg' : ''}
                    ${index === filteredOptions.length - 1 ? 'rounded-b-lg' : ''}
                  `}
                >
                  <div>
                    <div className="font-medium">
                      {getOptionLabel ? getOptionLabel(option) : formatOption(option)}
                    </div>
                    {getOptionDescription && (
                      <div className="text-sm text-gray-500 mt-1">
                        {getOptionDescription(option)}
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default AutocompleteInput;