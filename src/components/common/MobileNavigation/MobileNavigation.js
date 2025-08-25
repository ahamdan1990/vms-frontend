// src/components/common/MobileNavigation/MobileNavigation.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { TEXT_STYLES } from '../../../constants/typography';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Mobile Navigation Component
 * Converts horizontal navigation to mobile-friendly dropdown
 * Automatically switches between desktop tabs and mobile dropdown based on screen size
 */
const MobileNavigation = ({ 
  items = [], 
  activeItem, 
  onChange, 
  className = '',
  placeholder = "Select an option"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeItemData = items.find(item => item.id === activeItem);

  const handleSelect = (item) => {
    onChange(item.id);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={classNames('relative md:hidden', className)}>
      {/* Mobile Dropdown Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={classNames(
          'w-full flex items-center justify-between px-4 py-3 text-left',
          'bg-white border border-gray-300 rounded-lg shadow-sm',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'transition-colors duration-150'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={classNames(
          TEXT_STYLES.bodyText,
          activeItemData ? 'text-gray-900' : 'text-gray-500'
        )}>
          {activeItemData?.label || placeholder}
        </span>
        
        <ChevronDownIcon 
          className={classNames(
            'w-5 h-5 text-gray-400 transition-transform duration-150',
            { 'rotate-180': isOpen }
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={classNames(
              'absolute top-full left-0 right-0 mt-1 z-50',
              'bg-white border border-gray-200 rounded-lg shadow-lg',
              'max-h-60 overflow-auto'
            )}
            role="listbox"
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={classNames(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150',
                  'flex items-center justify-between',
                  {
                    'bg-primary-50 text-primary-700': item.id === activeItem,
                    'text-gray-700': item.id !== activeItem,
                  },
                  'first:rounded-t-lg last:rounded-b-lg'
                )}
                role="option"
                aria-selected={item.id === activeItem}
              >
                <div className="flex items-center space-x-3">
                  {/* Icon if provided */}
                  {item.icon && (
                    <span className={classNames(
                      'flex-shrink-0',
                      item.id === activeItem ? 'text-primary-600' : 'text-gray-400'
                    )}>
                      {item.icon}
                    </span>
                  )}
                  
                  <span className={TEXT_STYLES.bodyText}>
                    {item.label}
                  </span>
                </div>

                {/* Badge if provided */}
                {item.badge !== undefined && item.badge !== null && (
                  <span className={classNames(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    item.id === activeItem 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-gray-100 text-gray-700'
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

/**
 * Desktop Navigation Component (for comparison/fallback)
 * Horizontal tabs for larger screens
 */
export const DesktopNavigation = ({ 
  items = [], 
  activeItem, 
  onChange, 
  className = '' 
}) => {
  return (
    <div className={classNames('hidden md:block', className)}>
      <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={classNames(
              'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150',
              {
                'bg-white text-primary-700 shadow-sm': item.id === activeItem,
                'text-gray-600 hover:text-gray-800 hover:bg-white/50': item.id !== activeItem,
              }
            )}
          >
            {/* Icon */}
            {item.icon && (
              <span className="flex-shrink-0">
                {item.icon}
              </span>
            )}

            {/* Label */}
            <span>{item.label}</span>

            {/* Badge */}
            {item.badge !== undefined && item.badge !== null && (
              <span className={classNames(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                item.id === activeItem
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-200 text-gray-700'
              )}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

/**
 * Responsive Navigation Component
 * Automatically switches between desktop tabs and mobile dropdown
 */
export const ResponsiveNavigation = (props) => {
  return (
    <>
      <DesktopNavigation {...props} />
      <MobileNavigation {...props} />
    </>
  );
};

MobileNavigation.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  activeItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
};

DesktopNavigation.propTypes = MobileNavigation.propTypes;
ResponsiveNavigation.propTypes = MobileNavigation.propTypes;

export default MobileNavigation;