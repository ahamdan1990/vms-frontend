import React from 'react';
import classNames from 'classnames';
import Button from '../Button/Button';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelect = true,
  showInfo = true,
  maxVisiblePages = 7,
  className = ''
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={classNames('flex items-center justify-between', className)}>
      {/* Page info */}
      {showInfo && (
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Page size selector */}
        {showPageSizeSelect && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="form-select py-1 text-sm"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {/* First page */}
          {visiblePages[0] > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange?.(1)}
                className={classNames(
                  'min-w-[32px]',
                  currentPage === 1 ? 'bg-primary-100 text-primary-700' : ''
                )}
              >
                1
              </Button>
              {visiblePages[0] > 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {/* Visible pages */}
          {visiblePages.map(page => (
            <Button
              key={page}
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(page)}
              className={classNames(
                'min-w-[32px]',
                currentPage === page ? 'bg-primary-100 text-primary-700' : ''
              )}
            >
              {page}
            </Button>
          ))}

          {/* Last page */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange?.(totalPages)}
                className={classNames(
                  'min-w-[32px]',
                  currentPage === totalPages ? 'bg-primary-100 text-primary-700' : ''
                )}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
