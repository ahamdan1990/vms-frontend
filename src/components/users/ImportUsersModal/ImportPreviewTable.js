// src/components/users/ImportUsersModal/ImportPreviewTable.js
import React, { useState, useMemo } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const STATUS_FILTERS = [
  { label: 'All rows', value: 'all' },
  { label: 'Valid only', value: 'valid' },
  { label: 'Errors only', value: 'invalid' },
];

/**
 * Displays parsed import rows in a table with inline error highlighting.
 * Each errored cell shows a tooltip with the exact error message.
 *
 * @param {object[]} rows      - Array of ImportUserRowResultDto from backend
 * @param {number}   validCount
 * @param {number}   invalidCount
 */
const ImportPreviewTable = ({ rows = [], validCount = 0, invalidCount = 0 }) => {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const filteredRows = useMemo(() => {
    if (filter === 'valid')   return rows.filter(r => !r.fieldErrors?.length);
    if (filter === 'invalid') return rows.filter(r =>  r.fieldErrors?.length);
    return rows;
  }, [rows, filter]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);
  const pageRows   = filteredRows.slice(page * pageSize, (page + 1) * pageSize);

  // Build a map: rowNumber → { columnName → errorMessage }
  const errorMap = useMemo(() => {
    const m = {};
    rows.forEach(r => {
      if (r.fieldErrors?.length) {
        m[r.rowNumber] = {};
        r.fieldErrors.forEach(fe => {
          m[r.rowNumber][fe.columnName] = fe.message;
        });
      }
    });
    return m;
  }, [rows]);

  const handleFilterChange = (val) => {
    setFilter(val);
    setPage(0);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
          <CheckCircleIcon className="h-4 w-4" />
          {validCount} ready to import
        </span>
        {invalidCount > 0 && (
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
            <XCircleIcon className="h-4 w-4" />
            {invalidCount} have errors
          </span>
        )}
        <span className="text-gray-500 dark:text-gray-400">
          Total: {rows.length}
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-3 py-1.5 text-sm rounded-t font-medium transition-colors
              ${filter === f.value
                ? 'bg-white dark:bg-gray-800 border border-b-white dark:border-b-gray-800 border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {f.label}
            {f.value === 'invalid' && invalidCount > 0 && (
              <span className="ml-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-1.5 py-0.5 rounded-full">
                {invalidCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">Row</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">First Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Errors</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400 dark:text-gray-500">
                  No rows match the current filter.
                </td>
              </tr>
            )}
            {pageRows.map(row => {
              const hasErrors = row.fieldErrors?.length > 0;
              const rowErrors = errorMap[row.rowNumber] ?? {};

              return (
                <tr
                  key={row.rowNumber}
                  className={hasErrors
                    ? 'bg-red-50 dark:bg-red-900/10'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }
                >
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {row.rowNumber}
                  </td>

                  <td className="px-3 py-2">
                    {hasErrors
                      ? <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-medium">
                          <XCircleIcon className="h-3.5 w-3.5" /> Error
                        </span>
                      : <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                          <CheckCircleIcon className="h-3.5 w-3.5" /> Valid
                        </span>
                    }
                  </td>

                  <CellWithError value={row.email} error={rowErrors['Email']} />
                  <CellWithError value={row.firstName} error={rowErrors['FirstName']} />
                  <CellWithError value={row.lastName} error={rowErrors['LastName']} />
                  <CellWithError value={row.role} error={rowErrors['Role']} />

                  {/* All errors column */}
                  <td className="px-3 py-2 max-w-xs">
                    {hasErrors && (
                      <ul className="space-y-0.5">
                        {row.fieldErrors.map((fe, i) => (
                          <li key={i} className="text-xs text-red-600 dark:text-red-400">
                            <span className="font-medium">{fe.columnName}:</span> {fe.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filteredRows.length)} of {filteredRows.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ‹ Prev
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CellWithError = ({ value, error }) => (
  <td className={`px-3 py-2 ${error ? 'relative' : ''}`}>
    {error
      ? (
        <span className="group relative inline-flex items-center gap-1">
          <ExclamationTriangleIcon className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-400 text-xs truncate max-w-[120px]">
            {value || '(empty)'}
          </span>
          {/* Tooltip */}
          <span className="absolute bottom-full left-0 z-50 mb-1 hidden group-hover:block
            bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 w-56 shadow-lg whitespace-normal">
            {error}
          </span>
        </span>
      )
      : (
        <span className="text-gray-800 dark:text-gray-200 text-xs truncate max-w-[120px] block">
          {value || '—'}
        </span>
      )
    }
  </td>
);

export default ImportPreviewTable;
