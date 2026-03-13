// src/components/common/LanguageToggle/LanguageToggle.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../../../store/slices/uiSlice';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Language toggle button — switches between English and Arabic.
 * Triggers RTL/LTR document direction change via uiSlice → i18n.
 */
const LanguageToggle = ({ variant = 'default', className = '' }) => {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.ui.preferences.language);
  const isArabic = language === 'ar';

  const handleToggle = () => {
    dispatch(setLanguage(isArabic ? 'en' : 'ar'));
  };

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
        className={classNames(
          'p-2 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400',
          'transition-colors font-medium text-sm',
          className
        )}
      >
        {isArabic ? 'EN' : 'ع'}
      </button>
    );
  }

  // Full pill variant — used on login page
  return (
    <div
      className={classNames(
        'inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1',
        className
      )}
    >
      <button
        type="button"
        onClick={() => dispatch(setLanguage('en'))}
        className={classNames(
          'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
          !isArabic
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => dispatch(setLanguage('ar'))}
        className={classNames(
          'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
          isArabic
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        )}
      >
        ع
      </button>
    </div>
  );
};

LanguageToggle.propTypes = {
  variant: PropTypes.oneOf(['default', 'minimal']),
  className: PropTypes.string
};

export default LanguageToggle;
