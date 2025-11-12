import { useState, useEffect } from 'react';
import departmentService from '../../../services/departmentService';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const DepartmentSelect = ({
  value,
  onChange,
  label = 'Department',
  placeholder = 'Select a department...',
  required = false,
  disabled = false,
  error = null,
  showHierarchy = true,
  className = ''
}) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await departmentService.getDepartments({
        pageSize: 1000,
        sortBy: 'DisplayOrder',
        sortDirection: 'asc'
      });

      // Ensure we always set an array
      let departmentsArray = [];
      if (Array.isArray(result)) {
        departmentsArray = result;
      } else if (result && Array.isArray(result.items)) {
        departmentsArray = result.items;
      } else if (result && result.data && Array.isArray(result.data)) {
        departmentsArray = result.data;
      }

      setDepartments(departmentsArray);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setLoadError('Failed to load departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchicalOptions = (depts) => {
    // Ensure depts is an array
    if (!Array.isArray(depts)) {
      console.warn('buildHierarchicalOptions received non-array:', depts);
      return [];
    }

    // Group departments by parent
    const roots = depts.filter(d => !d.parentDepartmentId);
    const childMap = {};

    depts.forEach(dept => {
      if (dept.parentDepartmentId) {
        if (!childMap[dept.parentDepartmentId]) {
          childMap[dept.parentDepartmentId] = [];
        }
        childMap[dept.parentDepartmentId].push(dept);
      }
    });

    // Build hierarchical options
    const options = [];

    const addDepartment = (dept, level = 0) => {
      options.push({
        value: dept.id,
        label: dept.name,
        code: dept.code,
        level,
        hasChildren: childMap[dept.id]?.length > 0
      });

      // Add children
      const children = childMap[dept.id] || [];
      children.forEach(child => addDepartment(child, level + 1));
    };

    roots.forEach(root => addDepartment(root));
    return options;
  };

  const hierarchicalOptions = showHierarchy
    ? buildHierarchicalOptions(departments)
    : Array.isArray(departments)
      ? departments.map(d => ({ value: d.id, label: d.name, code: d.code, level: 0 }))
      : [];

  const selectedDept = Array.isArray(departments)
    ? departments.find(d => d.id === value)
    : null;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <BuildingOffice2Icon className="h-5 w-5 text-gray-400" />
        </div>

        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
          disabled={disabled || loading}
          className={`
            block w-full pl-10 pr-10 py-2
            border rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}
            appearance-none
          `}
        >
          <option value="">{loading ? 'Loading...' : placeholder}</option>
          {hierarchicalOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {showHierarchy && option.level > 0 && '└─ '.repeat(option.level)}
              {option.label}
              {option.code && ` (${option.code})`}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* Selected Department Info */}
      {selectedDept && !error && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
              {selectedDept.code?.charAt(0) || selectedDept.name?.charAt(0) || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                {selectedDept.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {selectedDept.code && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedDept.code}
                  </span>
                )}
                {selectedDept.managerName && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    • Manager: {selectedDept.managerName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {loadError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{loadError}</p>}
    </div>
  );
};

export default DepartmentSelect;
