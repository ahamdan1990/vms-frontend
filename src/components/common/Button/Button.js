import React from 'react';
import classNames from 'classnames';
import { BUTTONS } from '../../../constants/uiConstants';

const Button = ({
  children,
  variant = BUTTONS.VARIANTS.PRIMARY,
  size = BUTTONS.SIZES.MEDIUM,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) => {
  const buttonClasses = classNames(
    'btn',
    {
      // Variants
      'btn-primary': variant === BUTTONS.VARIANTS.PRIMARY,
      'btn-secondary': variant === BUTTONS.VARIANTS.SECONDARY,
      'btn-success': variant === BUTTONS.VARIANTS.SUCCESS,
      'btn-danger': variant === BUTTONS.VARIANTS.DANGER,
      'btn-warning': variant === BUTTONS.VARIANTS.WARNING,
      'btn-info': variant === BUTTONS.VARIANTS.INFO,
      'btn-outline': variant === BUTTONS.VARIANTS.OUTLINE,
      'btn-outline-primary': variant === BUTTONS.VARIANTS.OUTLINE,
      'btn-ghost': variant === BUTTONS.VARIANTS.GHOST,
      
      // Sizes
      'btn-sm': size === BUTTONS.SIZES.SMALL,
      'btn-md': size === BUTTONS.SIZES.MEDIUM,
      'btn-lg': size === BUTTONS.SIZES.LARGE,
      
      // States
      'loading': loading,
      'w-full': fullWidth,
      'opacity-60 cursor-not-allowed': disabled || loading
    },
    className
  );

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="loading-spinner mr-2" />
          Loading...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </div>
      )}
    </button>
  );
};

export default Button;
