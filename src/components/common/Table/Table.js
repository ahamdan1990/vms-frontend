import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import Button from '../Button/Button';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import Pagination from '../Pagination/Pagination';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  sortable = true,
  selectable = false,
  pagination = null,
  onSort,
  onSelectionChange,
  className = '',
  emptyMessage = 'No data available',
  density = 'standard'
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());

  const tableClasses = classNames(
    'table-container',
    className
  );

  const rowClasses = classNames(
    'table-row',
    {
      'h-8': density === 'compact',
      'h-12': density === 'standard',
      'h-16': density === 'comfortable'
    }
  );

  // Handle sorting
  const handleSort = (column) => {
    if (!sortable || !column.sortable) return;

    let direction = 'asc';
    if (sortConfig.key === column.key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const newSortConfig = { key: column.key, direction };
    setSortConfig(newSortConfig);

    if (onSort) {
      onSort(newSortConfig);
    }
  };

  // Handle row selection
  const handleRowSelect = (rowId, isSelected) => {
    const newSelection = new Set(selectedRows);
    
    if (isSelected) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    
    setSelectedRows(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection));
    }
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    const newSelection = isSelected ? new Set(data.map(row => row.id)) : new Set();
    setSelectedRows(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection));
    }
  };

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < data.length;

  return (
    <div className={tableClasses}>
      {loading && <LoadingSpinner overlay />}
      
      <table className="table">
        <thead className="table-header">
          <tr>
            {selectable && (
              <th className="table-header-cell w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={el => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="form-checkbox"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={classNames(
                  'table-header-cell',
                  {
                    'cursor-pointer select-none': sortable && column.sortable,
                    'text-left': column.align === 'left' || !column.align,
                    'text-center': column.align === 'center',
                    'text-right': column.align === 'right'
                  }
                )}
                onClick={() => handleSort(column)}
                style={{ width: column.width }}
              >
                <div className="flex items-center">
                  {column.title}
                  {sortable && column.sortable && (
                    <span className="ml-1">
                      {sortConfig.key === column.key ? (
                        sortConfig.direction === 'asc' ? '↑' : '↓'
                      ) : (
                        '↕'
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="table-body">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="table-cell text-center py-8 text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id || index} className={rowClasses}>
                {selectable && (
                  <td className="table-cell">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                      className="form-checkbox"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={classNames(
                      'table-cell',
                      {
                        'text-left': column.align === 'left' || !column.align,
                        'text-center': column.align === 'center',
                        'text-right': column.align === 'right'
                      }
                    )}
                  >
                    {column.render
                      ? column.render(row[column.key], row, index)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {pagination && (
        <div className="mt-4">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};

export default Table;