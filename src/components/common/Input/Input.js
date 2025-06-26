import React, { forwardRef } from 'react';
import classNames from 'classnames';

const Input = forwardRef(({
  type = 'text',
  label,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const inputClasses = classNames(
    'form-input',
    {
      'form-input-error': error,
      'pl-10': icon && iconPosition === 'left',
      'pr-10': icon && iconPosition === 'right',
      'opacity-60 cursor-not-allowed': disabled
    },
    className
  );

  const containerClasses = classNames(
    'relative',
    containerClassName
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
