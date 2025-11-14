/**
 * Tabs Component
 * A flexible tabs component for organizing content into sections
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Tabs = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  className,
  contentClassName,
  children,
  ...props
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab || (tabs[0]?.key));
  
  const currentActiveTab = activeTab !== undefined ? activeTab : internalActiveTab;

  const handleTabClick = (tabKey) => {
    if (disabled) return;
    
    if (onTabChange) {
      onTabChange(tabKey);
    } else {
      setInternalActiveTab(tabKey);
    }
  };

  const tabsContainerClasses = classNames(
    'tabs-container',
    {
      'tabs-full-width': fullWidth,
      'tabs-disabled': disabled,
      [`tabs-${variant}`]: variant !== 'default',
      [`tabs-${size}`]: size !== 'medium'
    },
    className
  );

const tabListClasses = classNames(
  'flex border-b border-gray-200 dark:border-gray-700',
    {
      'w-full': fullWidth,
      'space-x-8': !fullWidth
    }
  );

const contentClasses = classNames(
  'tab-content mt-4 text-gray-900 dark:text-gray-100',
    contentClassName
  );

  return (
    <div className={tabsContainerClasses} {...props}>
      {/* Tab Navigation */}
      <div className={tabListClasses} role="tablist">
        {tabs.map((tab) => {
          const isActive = currentActiveTab === tab.key;
          const isTabDisabled = disabled || tab.disabled;

          const tabClasses = classNames(
            'flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors duration-200',
            {
              'border-blue-500 text-blue-600 dark:text-blue-400': isActive && !isTabDisabled,
              'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500': 
                !isActive && !isTabDisabled,
              'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed': isTabDisabled,
              'cursor-pointer': !isTabDisabled,
              'flex-1 justify-center': fullWidth
            }
          );

          return (
            <button
              key={tab.key}
              className={tabClasses}
              onClick={() => handleTabClick(tab.key)}
              disabled={isTabDisabled}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              id={`tab-${tab.key}`}
              type="button"
            >
              {tab.icon && (
                <tab.icon 
                  className={classNames(
                    'w-5 h-5',
                    tab.label ? 'mr-2' : '',
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                  )} 
                />
              )}
              {tab.label && <span>{tab.label}</span>}
              {tab.badge && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className={contentClasses}>
        {tabs.map((tab) => {
          const isActive = currentActiveTab === tab.key;
          
          return (
            <div
              key={tab.key}
              className={classNames(
                'tab-panel',
                { 'hidden': !isActive }
              )}
              role="tabpanel"
              aria-labelledby={`tab-${tab.key}`}
              id={`tabpanel-${tab.key}`}
              hidden={!isActive}
            >
              {tab.content}
            </div>
          );
        })}
        {children}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string,
    content: PropTypes.node,
    icon: PropTypes.elementType,
    badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    disabled: PropTypes.bool
  })).isRequired,
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'pills', 'underline']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  children: PropTypes.node
};

export default Tabs;
