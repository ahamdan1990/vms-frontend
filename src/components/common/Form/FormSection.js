// src/components/common/Form/FormSection.js
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { TEXT_STYLES } from '../../../constants/typography';
import { motion } from 'framer-motion';

/**
 * Form Section Component
 * Groups related form fields with consistent styling and spacing
 */
const FormSection = ({ 
  title,
  description,
  children,
  className = '',
  animated = false,
  collapsible = false,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const content = (
    <div className={classNames('space-y-6', className)}>
      {/* Section Header */}
      {(title || description) && (
        <div 
          className={classNames(
            'border-b border-gray-200 pb-4',
            { 'cursor-pointer': collapsible }
          )}
          onClick={toggleExpanded}
        >
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className={`${TEXT_STYLES.cardTitle} text-gray-900`}>
                  {title}
                </h3>
              )}
              
              {description && (
                <p className={`${TEXT_STYLES.bodyText} mt-1`}>
                  {description}
                </p>
              )}
            </div>

            {/* Collapse/Expand Icon */}
            {collapsible && (
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
              >
                <svg 
                  className={classNames(
                    'w-5 h-5 text-gray-400 transition-transform duration-200',
                    { 'rotate-180': isExpanded }
                  )} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Section Content */}
      {(!collapsible || isExpanded) && (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

FormSection.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  animated: PropTypes.bool,
  collapsible: PropTypes.bool,
  defaultExpanded: PropTypes.bool,
};

export default FormSection;