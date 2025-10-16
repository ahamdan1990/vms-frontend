/**
 * DateRangePicker Component
 * A date range picker component using react-datepicker
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import classNames from 'classnames';
import { CalendarIcon } from '@heroicons/react/24/outline';
import 'react-datepicker/dist/react-datepicker.css';

const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  onStartDateChange,
  onEndDateChange,
  selectsRange = true,
  isClearable = true,
  placeholderText = 'Select date range',
  dateFormat = 'MM/dd/yyyy',
  maxDate,
  minDate,
  disabled = false,
  className,
  inputClassName,
  label,
  error,
  required = false,
  showTimeSelect = false,
  timeFormat = 'HH:mm',
  timeIntervals = 15,
  ...props
}) => {
  const [internalStartDate, setInternalStartDate] = useState(startDate);
  const [internalEndDate, setInternalEndDate] = useState(endDate);
  
  const isControlled = onChange || (onStartDateChange && onEndDateChange);
  const currentStartDate = isControlled ? startDate : internalStartDate;
  const currentEndDate = isControlled ? endDate : internalEndDate;

  const handleDateChange = (dates) => {
    if (selectsRange) {
      const [start, end] = dates;
      
      if (!isControlled) {
        setInternalStartDate(start);
        setInternalEndDate(end);
      }
      
      if (onChange) {
        onChange({ startDate: start, endDate: end });
      } else {
        if (onStartDateChange) onStartDateChange(start);
        if (onEndDateChange) onEndDateChange(end);
      }
    }
  };

  const containerClasses = classNames(
    'date-range-picker',
    className
  );

  const inputClasses = classNames(
    'block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6',
    {
      'ring-red-300 focus:ring-red-500': error,
      'bg-gray-50 text-gray-500 ring-gray-200 cursor-not-allowed': disabled
    },
    inputClassName
  );

  const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        value={value || ''}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
        className={inputClasses}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <CalendarIcon className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  ));

  CustomInput.displayName = 'CustomInput';

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <DatePicker
        selected={currentStartDate}
        startDate={currentStartDate}
        endDate={currentEndDate}
        onChange={handleDateChange}
        selectsRange={selectsRange}
        isClearable={isClearable}
        placeholderText={placeholderText}
        dateFormat={showTimeSelect ? `${dateFormat} ${timeFormat}` : dateFormat}
        maxDate={maxDate}
        minDate={minDate}
        disabled={disabled}
        showTimeSelect={showTimeSelect}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        customInput={<CustomInput />}
        {...props}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

DateRangePicker.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
  onStartDateChange: PropTypes.func,
  onEndDateChange: PropTypes.func,
  selectsRange: PropTypes.bool,
  isClearable: PropTypes.bool,
  placeholderText: PropTypes.string,
  dateFormat: PropTypes.string,
  maxDate: PropTypes.instanceOf(Date),
  minDate: PropTypes.instanceOf(Date),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  showTimeSelect: PropTypes.bool,
  timeFormat: PropTypes.string,
  timeIntervals: PropTypes.number
};

export default DateRangePicker;
