/**
 * RangeSlider Component
 * A dual-handle range slider component for selecting value ranges
 */

import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const RangeSlider = ({
  min = 0,
  max = 100,
  step = 1,
  value = [min, max],
  onChange,
  disabled = false,
  label,
  showValues = true,
  formatValue,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const sliderRef = useRef(null);
  const isControlled = onChange !== undefined;
  
  const currentValue = isControlled ? value : internalValue;
  const [minValue, maxValue] = currentValue;

  // Ensure values are within bounds
  const clampValue = useCallback((val) => {
    return Math.max(min, Math.min(max, val));
  }, [min, max]);

  const handleValueChange = useCallback((newValue) => {
    const [newMin, newMax] = newValue;
    const clampedMin = clampValue(newMin);
    const clampedMax = clampValue(Math.max(newMin, newMax));
    const finalValue = [clampedMin, clampedMax];

    if (!isControlled) {
      setInternalValue(finalValue);
    }

    if (onChange) {
      onChange(finalValue);
    }
  }, [clampValue, isControlled, onChange]);

  const getPercentage = useCallback((val) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const getValueFromPosition = useCallback((clientX) => {
    if (!sliderRef.current) return min;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const value = min + (percentage / 100) * (max - min);
    
    // Round to nearest step
    return Math.round(value / step) * step;
  }, [min, max, step]);

  const formatDisplayValue = (val) => {
    if (formatValue) {
      return formatValue(val);
    }
    return val.toString();
  };

  const handleTrackClick = (e) => {
    if (disabled) return;
    
    const newValue = getValueFromPosition(e.clientX);
    const distanceToMin = Math.abs(newValue - minValue);
    const distanceToMax = Math.abs(newValue - maxValue);
    
    if (distanceToMin <= distanceToMax) {
      handleValueChange([newValue, maxValue]);
    } else {
      handleValueChange([minValue, newValue]);
    }
  };

  const minPercentage = getPercentage(minValue);
  const maxPercentage = getPercentage(maxValue);

  const trackClasses = classNames(
    'relative h-2 bg-gray-200 rounded-full cursor-pointer',
    {
      'cursor-not-allowed opacity-50': disabled
    }
  );

  const rangeClasses = classNames(
    'absolute h-full bg-blue-500 rounded-full pointer-events-none',
    {
      'bg-gray-400': disabled
    }
  );

  const thumbClasses = classNames(
    'absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 shadow-md transition-colors duration-200',
    {
      'border-gray-400 cursor-not-allowed': disabled,
      'hover:border-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-200': !disabled
    }
  );

  return (
    <div className={classNames('w-full', className)} {...props}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {showValues && (
            <div className="text-sm text-gray-500">
              {formatDisplayValue(minValue)} - {formatDisplayValue(maxValue)}
            </div>
          )}
        </div>
      )}
      
      <div className="relative py-3">
        <div
          ref={sliderRef}
          className={trackClasses}
          onClick={handleTrackClick}
        >
          {/* Selected range */}
          <div
            className={rangeClasses}
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
          
          {/* Min thumb */}
          <div
            className={thumbClasses}
            style={{
              left: `${minPercentage}%`,
              top: '50%'
            }}
            onMouseDown={(e) => {
              if (disabled) return;
              e.preventDefault();
              
              const handleMouseMove = (moveEvent) => {
                const newValue = getValueFromPosition(moveEvent.clientX);
                handleValueChange([Math.min(newValue, maxValue), maxValue]);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={minValue}
            aria-label="Minimum value"
            onKeyDown={(e) => {
              if (disabled) return;
              
              let newValue = minValue;
              switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowDown':
                  newValue = Math.max(min, minValue - step);
                  break;
                case 'ArrowRight':
                case 'ArrowUp':
                  newValue = Math.min(maxValue, minValue + step);
                  break;
                case 'Home':
                  newValue = min;
                  break;
                case 'End':
                  newValue = maxValue;
                  break;
                default:
                  return;
              }
              
              e.preventDefault();
              handleValueChange([newValue, maxValue]);
            }}
          />
          
          {/* Max thumb */}
          <div
            className={thumbClasses}
            style={{
              left: `${maxPercentage}%`,
              top: '50%'
            }}
            onMouseDown={(e) => {
              if (disabled) return;
              e.preventDefault();
              
              const handleMouseMove = (moveEvent) => {
                const newValue = getValueFromPosition(moveEvent.clientX);
                handleValueChange([minValue, Math.max(newValue, minValue)]);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={maxValue}
            aria-label="Maximum value"
            onKeyDown={(e) => {
              if (disabled) return;
              
              let newValue = maxValue;
              switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowDown':
                  newValue = Math.max(minValue, maxValue - step);
                  break;
                case 'ArrowRight':
                case 'ArrowUp':
                  newValue = Math.min(max, maxValue + step);
                  break;
                case 'Home':
                  newValue = minValue;
                  break;
                case 'End':
                  newValue = max;
                  break;
                default:
                  return;
              }
              
              e.preventDefault();
              handleValueChange([minValue, newValue]);
            }}
          />
        </div>
      </div>
      
      {!showValues && !label && (
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>{formatDisplayValue(min)}</span>
          <span>{formatDisplayValue(max)}</span>
        </div>
      )}
    </div>
  );
};

RangeSlider.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  value: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  showValues: PropTypes.bool,
  formatValue: PropTypes.func,
  className: PropTypes.string
};

export default RangeSlider;
