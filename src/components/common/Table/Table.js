// src/components/common/Table/Table.js
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import LoadingSpinner, { LoadingSkeleton } from '../LoadingSpinner/LoadingSpinner';

/**
 * Professional Table Component with sorting, pagination, and selection
 * Supports responsive design and customizable styling
 */
const Table = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  sortable = true,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  onSort,
  sortBy,
  sortDirection = 'asc',
  className = '',
  size = 'md',
  striped = false,
  bordered = false,
  hover = true,
  stickyHeader = false,
  maxHeight,
  responsive = true
}) => {
  const [internalSort, setInternalSort] = useState({
    column: sortBy,
    direction: sortDirection
  });

  // Handle sorting
  const handleSort = (column) => {
    if (!sortable || !column.sortable) return;

    const newDirection = 
      internalSort.column === column.key && internalSort.direction === 'asc' 
        ? 'desc' 
        : 'asc';

    const newSort = {
      column: column.key,
      direction: newDirection
    };

    setInternalSort(newSort);

    if (onSort) {
      onSort(column.key, newDirection);
    }
  };

  // Sort data internally if no external sorting
  const sortedData = useMemo(() => {
    if (!sortable || !internalSort.column || onSort) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[internalSort.column];
      const bValue = b[internalSort.column];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return internalSort.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, internalSort, sortable, onSort]);

  // Handle row selection
  const handleRowSelect = (rowId, checked) => {
    if (!selectable || !onSelectionChange) return;

    let newSelection;
    if (checked) {
      newSelection = [...selectedRows, rowId];
    } else {
      newSelection = selectedRows.filter(id => id !== rowId);
    }

    onSelectionChange(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (!selectable || !onSelectionChange) return;

    const allIds = data.map(row => row.id || row._id);
    onSelectionChange(checked ? allIds : []);
  };

  const isAllSelected = selectable && selectedRows.length === data.length && data.length > 0;
  const isIndeterminate = selectable && selectedRows.length > 0 && selectedRows.length < data.length;

  // Size classes
  const sizeClasses = {
    sm: {
      table: 'text-xs',
      padding: 'px-3 py-2'
    },
    md: {
      table: 'text-sm',
      padding: 'px-4 py-3'
    },
    lg: {
      table: 'text-base',
      padding: 'px-6 py-4'
    }
  };

  const tableClasses = classNames(
    'min-w-full divide-y divide-gray-200',
    sizeClasses[size].table,
    {
      'table-fixed': !responsive
    }
  );

  const containerClasses = classNames(
    'overflow-hidden',
    {
      'shadow ring-1 ring-black ring-opacity-5': bordered,
      'rounded-lg': bordered,
      'overflow-x-auto': responsive,
      'overflow-y-auto': maxHeight
    },
    className
  );

  const headerClasses = classNames(
    'bg-gray-50',
    {
      'sticky top-0 z-10': stickyHeader
    }
  );

  const cellClasses = classNames(
    sizeClasses[size].padding,
    'whitespace-nowrap'
  );

  const rowClasses = (index, row) => classNames(
    'transition-colors duration-150',
    {
      'bg-white': !striped || index % 2 === 0,
      'bg-gray-50': striped && index % 2 !== 0,
      'hover:bg-gray-100': hover && !loading,
      'cursor-pointer': onRowClick,
      'bg-blue-50': selectable && selectedRows.includes(row.id || row._id)
    }
  );

  // Render loading state
  if (loading) {
    return (
      <div className={containerClasses} style={{ maxHeight }}>
        <table className={tableClasses}>
          <thead className={headerClasses}>
            <tr>
              {selectable && <th className={cellClasses}><LoadingSkeleton height={4} width="1/2" /></th>}
              {columns.map((column, index) => (
                <th key={index} className={cellClasses}>
                  <LoadingSkeleton height={4} width="3/4" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 5 }, (_, index) => (
              <tr key={index}>
                {selectable && <td className={cellClasses}><LoadingSkeleton height={4} width="1/2" /></td>}
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className={cellClasses}>
                    <LoadingSkeleton height={4} width={colIndex === 0 ? 'full' : '2/3'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-lg font-medium text-gray-900 mb-2">No Data</div>
        <div className="text-gray-600">{emptyMessage}</div>
      </div>
    );
  }

  const SortIcon = ({ column, sortColumn, sortDirection }) => {
    if (!column.sortable) return null;

    const isActive = sortColumn === column.key;

    return (
      <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
        {isActive ? (
          sortDirection === 'asc' ? (
            <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          )
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        )}
      </span>
    );
  };

  return (
    <div className={containerClasses} style={{ maxHeight }}>
      <table className={tableClasses}>
        <thead className={headerClasses}>
          <tr>
            {selectable && (
              <th className={cellClasses}>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
            )}
            {columns.map((column, index) => (
              <th
                key={column.key || `column-${index}`}
                className={classNames(
                  cellClasses,
                  'text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  {
                    'cursor-pointer select-none group': column.sortable && sortable,
                    'hover:bg-gray-100': column.sortable && sortable
                  }
                )}
                onClick={() => handleSort(column)}
                style={{ width: column.width }}
              >
                <div className="flex items-center">
                  {typeof column.header === 'function' ? column.header() : column.header}
                  <SortIcon
                    column={column}
                    sortColumn={internalSort.column}
                    sortDirection={internalSort.direction}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <motion.tr
              key={row.id || row._id || index}
              className={rowClasses(index, row)}
              onClick={() => onRowClick?.(row)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {selectable && (
                <td className={cellClasses}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={selectedRows.includes(row.id || row._id)}
                    onChange={(e) => handleRowSelect(row.id || row._id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              {columns.map((column, colIndex) => (
                <td key={column.key || `col-${colIndex}`} className={cellClasses}>
                  {column.render ?
                    column.render(row[column.key], row, index) :
                    row[column.key]
                  }
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
    width: PropTypes.string,
    render: PropTypes.func
  })).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  emptyMessage: PropTypes.string,
  sortable: PropTypes.bool,
  selectable: PropTypes.bool,
  selectedRows: PropTypes.array,
  onSelectionChange: PropTypes.func,
  onRowClick: PropTypes.func,
  onSort: PropTypes.func,
  sortBy: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  striped: PropTypes.bool,
  bordered: PropTypes.bool,
  hover: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  maxHeight: PropTypes.string,
  responsive: PropTypes.bool
};

export default Table;