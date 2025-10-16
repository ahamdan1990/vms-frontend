/**
 * Accordion Component
 * A collapsible content component that can expand and collapse sections
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultOpenItems = [],
  className,
  itemClassName,
  headerClassName,
  contentClassName,
  ...props
}) => {
  const [openItems, setOpenItems] = useState(
    new Set(defaultOpenItems.map(item => typeof item === 'string' ? item : item.toString()))
  );

  const toggleItem = (itemKey) => {
    setOpenItems(prev => {
      const newOpenItems = new Set(prev);
      
      if (newOpenItems.has(itemKey)) {
        newOpenItems.delete(itemKey);
      } else {
        if (!allowMultiple) {
          newOpenItems.clear();
        }
        newOpenItems.add(itemKey);
      }
      
      return newOpenItems;
    });
  };

  const accordionClasses = classNames(
    'accordion divide-y divide-gray-200 border border-gray-200 rounded-lg',
    className
  );

  return (
    <div className={accordionClasses} {...props}>
      {items.map((item, index) => {
        const itemKey = item.key || index.toString();
        const isOpen = openItems.has(itemKey);
        const isDisabled = item.disabled;

        const itemClasses = classNames(
          'accordion-item',
          {
            'bg-gray-50': isDisabled
          },
          itemClassName
        );

        const headerClasses = classNames(
          'accordion-header w-full px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-200',
          {
            'hover:bg-gray-50 cursor-pointer': !isDisabled,
            'cursor-not-allowed text-gray-400': isDisabled,
            'bg-gray-50': isOpen && !isDisabled
          },
          headerClassName
        );

        const contentClasses = classNames(
          'accordion-content px-4 pb-4',
          contentClassName
        );

        return (
          <div key={itemKey} className={itemClasses}>
            {/* Header */}
            <button
              className={headerClasses}
              onClick={() => !isDisabled && toggleItem(itemKey)}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${itemKey}`}
              id={`accordion-header-${itemKey}`}
              disabled={isDisabled}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                  {typeof item.header === 'string' ? (
                    <span className="text-sm font-medium text-gray-900">
                      {item.header}
                    </span>
                  ) : (
                    item.header
                  )}
                </div>
                
                <ChevronDownIcon
                  className={classNames(
                    'h-5 w-5 text-gray-500 transition-transform duration-200',
                    {
                      'transform rotate-180': isOpen,
                      'text-gray-300': isDisabled
                    }
                  )}
                />
              </div>
              
              {item.subtitle && (
                <div className="mt-1 text-sm text-gray-500 text-left">
                  {item.subtitle}
                </div>
              )}
            </button>

            {/* Content */}
            {isOpen && (
              <div
                className={contentClasses}
                id={`accordion-content-${itemKey}`}
                aria-labelledby={`accordion-header-${itemKey}`}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Individual AccordionItem component for more flexible usage
export const AccordionItem = ({
  header,
  subtitle,
  content,
  isOpen = false,
  onToggle,
  disabled = false,
  className,
  headerClassName,
  contentClassName,
  ...props
}) => {
  const itemClasses = classNames(
    'accordion-item border border-gray-200 rounded-lg',
    {
      'bg-gray-50': disabled
    },
    className
  );

  const headerClasses = classNames(
    'accordion-header w-full px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-200',
    {
      'hover:bg-gray-50 cursor-pointer': !disabled,
      'cursor-not-allowed text-gray-400': disabled,
      'bg-gray-50': isOpen && !disabled
    },
    headerClassName
  );

  const contentClasses = classNames(
    'accordion-content px-4 pb-4',
    contentClassName
  );

  return (
    <div className={itemClasses} {...props}>
      <button
        className={headerClasses}
        onClick={() => !disabled && onToggle && onToggle()}
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 text-left">
            {typeof header === 'string' ? (
              <span className="text-sm font-medium text-gray-900">
                {header}
              </span>
            ) : (
              header
            )}
          </div>
          
          <ChevronDownIcon
            className={classNames(
              'h-5 w-5 text-gray-500 transition-transform duration-200',
              {
                'transform rotate-180': isOpen,
                'text-gray-300': disabled
              }
            )}
          />
        </div>
        
        {subtitle && (
          <div className="mt-1 text-sm text-gray-500 text-left">
            {subtitle}
          </div>
        )}
      </button>

      {isOpen && (
        <div className={contentClasses}>
          {content}
        </div>
      )}
    </div>
  );
};

Accordion.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    content: PropTypes.node.isRequired,
    disabled: PropTypes.bool
  })).isRequired,
  allowMultiple: PropTypes.bool,
  defaultOpenItems: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string
};

AccordionItem.propTypes = {
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.node.isRequired,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string
};

export default Accordion;
