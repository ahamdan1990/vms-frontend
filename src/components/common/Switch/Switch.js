/**
 * Switch Component
 * A toggle switch component for boolean input controls
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'medium',
  label,
  description,
  name,
  id,
  className,
  ...props
}) => {
  const switchId = id || name || `switch-${Math.random().toString(36).substr(2, 9)}`;

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'h-4 w-7',
          toggle: 'h-3 w-3',
          translate: checked ? 'translate-x-3' : 'translate-x-0'
        };
      case 'large':
        return {
          container: 'h-7 w-12',
          toggle: 'h-6 w-6',
          translate: checked ? 'translate-x-5' : 'translate-x-0.5'
        };
      case 'medium':
      default:
        return {
          container: 'h-6 w-11',
          toggle: 'h-5 w-5',
          translate: checked ? 'translate-x-5' : 'translate-x-0'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const switchContainerClasses = classNames(
    'relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    sizeClasses.container,
    {
      'bg-blue-600': checked && !disabled,
      'bg-gray-200': !checked && !disabled,
      'bg-gray-300 cursor-not-allowed': disabled,
      'opacity-50': disabled
    }
  );

  const toggleClasses = classNames(
    'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
    sizeClasses.toggle,
    sizeClasses.translate
  );

  return (
    <div className={classNames('flex items-start', className)} {...props}>
      <div className="flex items-center">
        <button
          type="button"
          className={switchContainerClasses}
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${switchId}-label` : undefined}
          aria-describedby={description ? `${switchId}-description` : undefined}
          onClick={handleToggle}
          disabled={disabled}
          id={switchId}
          name={name}
        >
          <span className={toggleClasses} />
        </button>
      </div>

      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={switchId}
              id={`${switchId}-label`}
              className={classNames(
                'text-sm font-medium text-gray-900 cursor-pointer',
                {
                  'cursor-not-allowed text-gray-500': disabled
                }
              )}
            >
              {label}
            </label>
          )}
          
          {description && (
            <p
              id={`${switchId}-description`}
              className={classNames(
                'text-sm text-gray-500',
                label ? 'mt-1' : ''
              )}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  label: PropTypes.string,
  description: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string
};

export default Switch;
