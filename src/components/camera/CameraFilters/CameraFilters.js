import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

// Components
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Select from '../../common/Select/Select';
import RangeSlider from '../../common/RangeSlider/RangeSlider';
import Switch from '../../common/Switch/Switch';
import DateRangePicker from '../../common/DateRangePicker/DateRangePicker';

// Constants
import { CAMERA_CONSTANTS } from '../../../constants/cameraConstants';

// Icons
import {
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

/**
 * CameraFilters - Advanced filtering component for camera list
 * Provides comprehensive filtering options for camera management
 */
const CameraFilters = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  // Local state for form values
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Get locations from Redux store for location filter
  const { list: locations } = useSelector(state => state.locations);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle filter value changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      cameraType: null,
      status: null,
      locationId: null,
      isActive: null,
      enableFacialRecognition: null,
      minPriority: null,
      maxPriority: null,
      manufacturer: '',
      model: '',
      serialNumber: '',
      minFailureCount: null,
      maxFailureCount: null,
      lastHealthCheckFrom: null,
      lastHealthCheckTo: null,
      createdFrom: null,
      createdTo: null,
      modifiedFrom: null,
      modifiedTo: null
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(localFilters).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  };

  // Prepare location options
  const locationOptions = [
    { value: '', label: 'All Locations' },
    ...locations.map(location => ({
      value: location.id.toString(),
      label: location.name
    }))
  ];

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {hasActiveFilters() && (
            <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            icon={<XMarkIcon className="w-4 h-4" />}
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Camera Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Camera Type
          </label>
          <Select
            value={localFilters.cameraType || ''}
            onChange={(value) => handleFilterChange('cameraType', value || null)}
            options={[
              { value: '', label: 'All Types' },
              ...CAMERA_CONSTANTS.TYPE_OPTIONS.map(type => ({
                value: type.value,
                label: type.label
              }))
            ]}
            placeholder="Select camera type"
            className="w-full"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Select
            value={localFilters.status || ''}
            onChange={(value) => handleFilterChange('status', value || null)}
            options={[
              { value: '', label: 'All Statuses' },
              ...CAMERA_CONSTANTS.STATUS_OPTIONS.map(status => ({
                value: status.value,
                label: status.label
              }))
            ]}
            placeholder="Select status"
            className="w-full"
          />
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <Select
            value={localFilters.locationId || ''}
            onChange={(value) => handleFilterChange('locationId', value ? parseInt(value) : null)}
            options={locationOptions}
            placeholder="Select location"
            className="w-full"
          />
        </div>

        {/* Manufacturer Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manufacturer
          </label>
          <input
            type="text"
            value={localFilters.manufacturer || ''}
            onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
            placeholder="Enter manufacturer"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Model Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <input
            type="text"
            value={localFilters.model || ''}
            onChange={(e) => handleFilterChange('model', e.target.value)}
            placeholder="Enter model"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Serial Number Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Serial Number
          </label>
          <input
            type="text"
            value={localFilters.serialNumber || ''}
            onChange={(e) => handleFilterChange('serialNumber', e.target.value)}
            placeholder="Enter serial number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Active Status Switch */}
        <div className="flex flex-col justify-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Active Status
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="isActive"
                checked={localFilters.isActive === null}
                onChange={() => handleFilterChange('isActive', null)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">All</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="isActive"
                checked={localFilters.isActive === true}
                onChange={() => handleFilterChange('isActive', true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active Only</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="isActive"
                checked={localFilters.isActive === false}
                onChange={() => handleFilterChange('isActive', false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Inactive Only</span>
            </label>
          </div>
        </div>

        {/* Facial Recognition Switch */}
        <div className="flex flex-col justify-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facial Recognition
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="enableFacialRecognition"
                checked={localFilters.enableFacialRecognition === null}
                onChange={() => handleFilterChange('enableFacialRecognition', null)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">All</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="enableFacialRecognition"
                checked={localFilters.enableFacialRecognition === true}
                onChange={() => handleFilterChange('enableFacialRecognition', true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enabled</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="enableFacialRecognition"
                checked={localFilters.enableFacialRecognition === false}
                onChange={() => handleFilterChange('enableFacialRecognition', false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Disabled</span>
            </label>
          </div>
        </div>
      </div>

      {/* Priority Range Filter */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Priority Range
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Minimum Priority
            </label>
            <Select
              value={localFilters.minPriority || ''}
              onChange={(value) => handleFilterChange('minPriority', value ? parseInt(value) : null)}
              options={[
                { value: '', label: 'No minimum' },
                ...CAMERA_CONSTANTS.PRIORITY_OPTIONS.map(priority => ({
                  value: priority.value.toString(),
                  label: priority.label
                }))
              ]}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Maximum Priority
            </label>
            <Select
              value={localFilters.maxPriority || ''}
              onChange={(value) => handleFilterChange('maxPriority', value ? parseInt(value) : null)}
              options={[
                { value: '', label: 'No maximum' },
                ...CAMERA_CONSTANTS.PRIORITY_OPTIONS.map(priority => ({
                  value: priority.value.toString(),
                  label: priority.label
                }))
              ]}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Failure Count Range */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Failure Count Range
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Minimum Failures
            </label>
            <input
              type="number"
              min="0"
              value={localFilters.minFailureCount || ''}
              onChange={(e) => handleFilterChange('minFailureCount', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="No minimum"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Maximum Failures
            </label>
            <input
              type="number"
              min="0"
              value={localFilters.maxFailureCount || ''}
              onChange={(e) => handleFilterChange('maxFailureCount', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="No maximum"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Date Filters
        </label>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Last Health Check */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              Last Health Check
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={localFilters.lastHealthCheckFrom || ''}
                onChange={(e) => handleFilterChange('lastHealthCheckFrom', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="From date"
              />
              <input
                type="date"
                value={localFilters.lastHealthCheckTo || ''}
                onChange={(e) => handleFilterChange('lastHealthCheckTo', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="To date"
              />
            </div>
          </div>

          {/* Created Date */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              Created Date
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={localFilters.createdFrom || ''}
                onChange={(e) => handleFilterChange('createdFrom', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="From date"
              />
              <input
                type="date"
                value={localFilters.createdTo || ''}
                onChange={(e) => handleFilterChange('createdTo', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="To date"
              />
            </div>
          </div>

          {/* Modified Date */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              Modified Date
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={localFilters.modifiedFrom || ''}
                onChange={(e) => handleFilterChange('modifiedFrom', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="From date"
              />
              <input
                type="date"
                value={localFilters.modifiedTo || ''}
                onChange={(e) => handleFilterChange('modifiedTo', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="To date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters() && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([key, value]) => {
              if (!value && value !== false) return null;
              
              let displayValue;
              switch (key) {
                case 'cameraType':
                  displayValue = CAMERA_CONSTANTS.TYPE_OPTIONS.find(t => t.value === value)?.label;
                  break;
                case 'status':
                  displayValue = CAMERA_CONSTANTS.STATUS_OPTIONS.find(s => s.value === value)?.label;
                  break;
                case 'locationId':
                  displayValue = locations.find(l => l.id === value)?.name;
                  break;
                case 'isActive':
                  displayValue = value ? 'Active' : 'Inactive';
                  break;
                case 'enableFacialRecognition':
                  displayValue = value ? 'Facial Recognition Enabled' : 'Facial Recognition Disabled';
                  break;
                default:
                  displayValue = value;
              }
              
              if (!displayValue) return null;
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {displayValue}
                  <button
                    onClick={() => handleFilterChange(key, null)}
                    className="hover:text-blue-900"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default CameraFilters;