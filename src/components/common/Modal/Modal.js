import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import Button from '../Button/Button';
import { MODALS } from '../../../constants/uiConstants';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = MODALS.SIZES.MEDIUM,
  variant = MODALS.VARIANTS.DEFAULT,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  className = ''
}) => {
  const modalSizes = {
    [MODALS.SIZES.SMALL]: 'max-w-md',
    [MODALS.SIZES.MEDIUM]: 'max-w-lg',
    [MODALS.SIZES.LARGE]: 'max-w-4xl',
    [MODALS.SIZES.EXTRA_LARGE]: 'max-w-6xl'
  };

  const modalClasses = classNames(
    'modal-panel',
    modalSizes[size],
    className
  );

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const modalContent = (
    <div className="modal-container">
      <div className="modal-wrapper" onClick={handleBackdropClick}>
        <div className={modalClasses}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleBackdropClick} />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;