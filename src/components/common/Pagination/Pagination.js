// src/components/common/Pagination/Pagination.js
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Professional Pagination Component
 * Supports different styles and customizable page size selection
 */
const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showItemsInfo = true,
  showFirstLast = true,
  maxVisiblePages = 7,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Calculate visible page numbers
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'px-2 py-1 text-xs',
      select: 'text-xs px-2 py-1',
      text: 'text-xs'
    },
    md: {
      button: 'px-3 py-2 text-sm',
      select: 'text-sm px-3 py-2',
      text: 'text-sm'
    },
    lg: {
      button: 'px-4 py-2 text-base',
      select: 'text-base px-4 py-2',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Button variants
  const getButtonClasses = (isActive = false, isDisabled = false) => {
    const baseClasses = classNames(
      'relative inline-flex items-center border font-medium transition-colors duration-150',
      config.button,
      {
        'cursor-not-allowed opacity-50': isDisabled,
        'cursor-pointer': !isDisabled
      }
    );

    if (variant === 'minimal') {
      return classNames(baseClasses, {
        'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200': !isActive && !isDisabled,
        'border-transparent text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30': isActive,
        'border-transparent text-gray-300 dark:text-gray-700': isDisabled
      });
    }

    return classNames(baseClasses, {
      'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800': !isActive && !isDisabled,
      'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400': isActive,
      'border-gray-300 dark:border-gray-700 text-gray-300 dark:text-gray-700 bg-white dark:bg-gray-800': isDisabled
    });
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    const newTotalPages = Math.ceil(totalItems / newPageSize);
    const newCurrentPage = Math.min(currentPage, newTotalPages);
    
    onPageSizeChange?.(newPageSize);
    if (newCurrentPage !== currentPage) {
      onPageChange(newCurrentPage);
    }
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={classNames('flex items-center justify-between', className)}>
      {/* Items info and page size selector */}
      <div className="flex items-center space-x-4">
        {showItemsInfo && (
          <div className={classNames('text-gray-700 dark:text-gray-300', config.text)}>
            Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of{' '}
            {totalItems.toLocaleString()} results
          </div>
        )}

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <label className={classNames('text-gray-700 dark:text-gray-300', config.text)}>
              Show:
            </label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className={classNames(
                'border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                config.select
              )}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page button */}
        {showFirstLast && totalPages > maxVisiblePages && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={getButtonClasses(false, currentPage === 1)}
            aria-label="First page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Previous page button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={getButtonClasses(false, currentPage === 1)}
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={getButtonClasses(page === currentPage)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {/* Ellipsis and last pages */}
        {totalPages > maxVisiblePages && visiblePages[visiblePages.length - 1] < totalPages - 1 && (
          <>
            <span className={classNames('px-2 text-gray-500 dark:text-gray-400', config.text)}>…</span>
            <button
              onClick={() => handlePageChange(totalPages)}
              className={getButtonClasses(totalPages === currentPage)}
              aria-label={`Page ${totalPages}`}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next page button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={getButtonClasses(false, currentPage === totalPages)}
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Last page button */}
        {showFirstLast && totalPages > maxVisiblePages && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={getButtonClasses(false, currentPage === totalPages)}
            aria-label="Last page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number,
  totalItems: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func,
  showPageSizeSelector: PropTypes.bool,
  showItemsInfo: PropTypes.bool,
  showFirstLast: PropTypes.bool,
  maxVisiblePages: PropTypes.number,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'minimal'])
};

// Simple pagination component for basic use cases
export const SimplePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  return (
    <div className={classNames('flex items-center justify-center space-x-2', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        Previous
      </button>

      <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        Next
      </button>
    </div>
  );
};

SimplePagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default Pagination;