// src/pages/locations/LocationsListPage/LocationsListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';

// Redux actions and selectors
import {
  getLocations,
  getLocationTree,
  createLocation,
  updateLocation,
  deleteLocation,
  updateFilters,
  resetFilters,
  setSelectedLocations,
  toggleLocationSelection,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  clearError
} from '../../../store/slices/locationsSlice';

import {
  selectSortedLocations,
  selectLocationHierarchy,
  selectLocationsByType,
  selectLocationsListLoading,
  selectLocationsCreateLoading,
  selectLocationsUpdateLoading,
  selectLocationsDeleteLoading,
  selectLocationsFilters,
  selectSelectedLocations,
  selectLocationStats,
  selectShowCreateModal,
  selectShowEditModal,
  selectShowDeleteModal,
  selectCurrentLocation,
  selectLocationsCreateError,
  selectLocationsUpdateError,
  selectLocationsDeleteError,
  selectHasSelectedLocations,
  selectSelectedLocationsCount
} from '../../../store/selectors/locationSelectors';
// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Table from '../../../components/common/Table/Table';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Badge from '../../../components/common/Badge/Badge';
import Card from '../../../components/common/Card/Card';
import LocationForm from '../../../components/forms/LocationForm/LocationForm';

// Icons
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Utils
import formatters from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Locations Management Page
 * Manages location CRUD operations with hierarchical structure support
 * Foundation component required for visitor destination management
 */
const LocationsListPage = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'tree'
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingLocation, setViewingLocation] = useState(null);

  // Permissions
  const canRead = hasPermission('SystemConfig.Read');
  const canCreate = hasPermission('SystemConfig.Update');
  const canUpdate = hasPermission('SystemConfig.Update');
  const canDelete = hasPermission('SystemConfig.Delete');
  // Redux selectors
  const locations = useSelector(selectSortedLocations);
  const locationHierarchy = useSelector(selectLocationHierarchy);
  const locationsByType = useSelector(selectLocationsByType);
  const listLoading = useSelector(selectLocationsListLoading);
  const createLoading = useSelector(selectLocationsCreateLoading);
  const updateLoading = useSelector(selectLocationsUpdateLoading);
  const deleteLoading = useSelector(selectLocationsDeleteLoading);
  const filters = useSelector(selectLocationsFilters);
  const selectedLocations = useSelector(selectSelectedLocations);
  const stats = useSelector(selectLocationStats);
  const showCreateModalState = useSelector(selectShowCreateModal);
  const showEditModalState = useSelector(selectShowEditModal);
  const showDeleteModal = useSelector(selectShowDeleteModal);
  const currentLocation = useSelector(selectCurrentLocation);
  const createError = useSelector(selectLocationsCreateError);
  const updateError = useSelector(selectLocationsUpdateError);
  const deleteError = useSelector(selectLocationsDeleteError);
  const hasSelected = useSelector(selectHasSelectedLocations);
  const selectedCount = useSelector(selectSelectedLocationsCount);

  // Load locations on mount and when filters change
  useEffect(() => {
    dispatch(getLocations(filters));
    if (viewMode === 'tree') {
      dispatch(getLocationTree());
    }
  }, [dispatch, filters, viewMode]);

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.searchTerm) {
        dispatch(updateFilters({ searchTerm: searchInput }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.searchTerm, dispatch]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Event handlers
  const handleCreateLocation = async (locationData) => {
    try {
      await dispatch(createLocation(locationData)).unwrap();
      // Refresh the list to show the new item with proper filtering/sorting
      dispatch(getLocations(filters));
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Create location failed:', error);
    }
  };

  const handleUpdateLocation = async (locationData) => {
    try {
      await dispatch(updateLocation({ 
        id: currentLocation.id, 
        locationData 
      })).unwrap();
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Update location failed:', error);
    }
  };

  const handleDeleteLocation = async (hardDelete = false) => {
    try {
      await dispatch(deleteLocation({ 
        id: currentLocation.id, 
        hardDelete 
      })).unwrap();
      // Success handled by Redux state
    } catch (error) {
      // Error handled by Redux state
      console.error('Delete location failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedLocations.map(id => 
        dispatch(deleteLocation({ id, hardDelete: false })).unwrap()
      );
      await Promise.all(deletePromises);
      dispatch(clearSelections());
      setShowBulkConfirm(false);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  // Handle location actions (view, edit, delete)
  const handleLocationAction = (action, location) => {
    switch (action) {
      case 'view':
        setViewingLocation(location);
        setShowViewModal(true);
        break;
      case 'edit':
        dispatch(showEditModal(location));
        break;
      case 'delete':
        dispatch(showDeleteModal(location));
        break;
      default:
        break;
    }
  };

  const handleFilterChange = (filterName, value) => {
    dispatch(updateFilters({ [filterName]: value }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    dispatch(resetFilters());
  };
  // Helper function to get location type icon
  const getLocationTypeIcon = (locationType) => {
    switch (locationType?.toLowerCase()) {
      case 'building':
        return <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />;
      case 'floor':
        return <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">F</div>;
      case 'room':
        return <div className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">R</div>;
      case 'zone':
        return <MapPinIcon className="w-4 h-4 text-orange-600" />;
      default:
        return <MapPinIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  // Helper function to get hierarchy indent level
  const getIndentLevel = (location, allLocations, level = 0) => {
    if (!location.parentLocationId) return level;
    const parent = allLocations.find(l => l.id === location.parentLocationId);
    if (!parent) return level;
    return getIndentLevel(parent, allLocations, level + 1);
  };

  // Table columns configuration
  const columns = [
    {
      key: 'selection',
      header: '',
      width: '50px',
      sortable: false,
      render: (value, location) => (
        <input
          type="checkbox"
          checked={selectedLocations.includes(location.id)}
          onChange={(e) => {
            if (e.target.checked) {
              dispatch(setSelectedLocations([...selectedLocations, location.id]));
            } else {
              dispatch(setSelectedLocations(selectedLocations.filter(id => id !== location.id)));
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      )
    },
    {
      key: 'name',
      header: 'Location',
      sortable: true,
      render: (value, location) => (
        <div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${location.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="font-medium text-gray-900">{location.name}</span>
          </div>
          {location.description && (
            <div className="text-sm text-gray-500 mt-1">{location.description}</div>
          )}
          {location.address && (
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {location.address}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type & Hierarchy',
      sortable: true,
      render: (value, location) => (
        <div className="space-y-1">
          <div>
            <Badge variant="secondary" size="sm">
              {location.locationType || 'General'}
            </Badge>
          </div>
          {location.parentLocationName && (
            <div className="text-sm text-gray-500">
              Parent: {location.parentLocationName}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'capacity',
      header: 'Capacity',
      sortable: true,
      render: (value, location) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <UserGroupIcon className="w-4 h-4 text-gray-400" />
            <span className="font-medium">
              {location.maxCapacity ? `${location.maxCapacity} visitors` : 'Unlimited'}
            </span>
          </div>
          {location.currentOccupancy !== undefined && (
            <div className="text-sm text-gray-500">
              Current: {location.currentOccupancy}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, location) => (
        <Badge 
          variant={location.isActive ? 'success' : 'secondary'}
          size="sm"
        >
          {location.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      sortable: false,
      render: (value, location) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleLocationAction('view', location)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="View details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {canUpdate && (
            <button
              onClick={() => handleLocationAction('edit', location)}
              className="text-blue-600 hover:text-blue-900 transition-colors"
              title="Edit location"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleLocationAction('delete', location)}
              className="text-red-600 hover:text-red-900 transition-colors"
              title="Delete location"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage building locations, rooms, and capacity for visitor destinations
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'table'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'tree'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tree
            </button>
          </div>
          
          {canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              loading={createLoading}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              Add Location
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Locations</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.active}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">With Capacity</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.withCapacity}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Requires Escort</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.requiresEscort}</dd>
                </dl>
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search locations..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FunnelIcon className="w-5 h-5" />}
            >
              Filters
            </Button>
            
            {(filters.locationType || filters.includeInactive || filters.searchTerm || filters.rootOnly) && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Type
                  </label>
                  <select
                    value={filters.locationType}
                    onChange={(e) => handleFilterChange('locationType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="Building">Building</option>
                    <option value="Floor">Floor</option>
                    <option value="Room">Room</option>
                    <option value="Zone">Zone</option>
                    <option value="Parking">Parking</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeInactive"
                    checked={filters.includeInactive}
                    onChange={(e) => handleFilterChange('includeInactive', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeInactive" className="ml-2 block text-sm text-gray-700">
                    Include inactive locations
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rootOnly"
                    checked={filters.rootOnly}
                    onChange={(e) => handleFilterChange('rootOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rootOnly" className="ml-2 block text-sm text-gray-700">
                    Root locations only
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeChildren"
                    checked={filters.includeChildren}
                    onChange={(e) => handleFilterChange('includeChildren', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeChildren" className="ml-2 block text-sm text-gray-700">
                    Include child locations
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Type-based Statistics */}
      {stats.byType && Object.keys(stats.byType).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Locations by Type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="flex justify-center mb-2">
                  {getLocationTypeIcon(type)}
                </div>
                <div className="text-sm font-medium text-gray-900">{type}</div>
                <div className="text-2xl font-bold text-gray-700">{count}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {hasSelected && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {selectedCount} location{selectedCount !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                Clear Selection
              </Button>
            </div>
            
            {canDelete && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('delete');
                    setShowBulkConfirm(true);
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        {listLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : viewMode === 'table' ? (
          <Table
            data={locations}
            columns={columns}
            loading={listLoading}
            onRowSelectionChange={(selectedRowIds) => {
              const selectedIds = Object.keys(selectedRowIds).filter(id => selectedRowIds[id]);
              dispatch(setSelectedLocations(selectedIds.map(Number)));
            }}
            emptyMessage="No locations found"
            className="locations-table"
          />
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Location Hierarchy</h3>
            {/* Tree view component would go here */}
            <div className="text-center py-8 text-gray-500">
              Tree view coming soon...
            </div>
          </div>
        )}
      </Card>

      {/* View Location Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingLocation(null);
        }}
        title="Location Details"
        size="lg"
      >
        {viewingLocation && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{viewingLocation.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900">{viewingLocation.locationType || 'General'}</p>
              </div>
            </div>
            
            {viewingLocation.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{viewingLocation.description}</p>
              </div>
            )}
            
            {viewingLocation.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">{viewingLocation.address}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingLocation.maxCapacity ? `${viewingLocation.maxCapacity} visitors` : 'Unlimited'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge variant={viewingLocation.isActive ? 'success' : 'secondary'} size="sm">
                    {viewingLocation.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {viewingLocation.parentLocationName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Parent Location</label>
                <p className="mt-1 text-sm text-gray-900">{viewingLocation.parentLocationName}</p>
              </div>
            )}
            
            {viewingLocation.currentOccupancy !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Occupancy</label>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingLocation.currentOccupancy} / {viewingLocation.maxCapacity || '∞'} visitors
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingLocation(null);
                }}
              >
                Close
              </Button>
              {canUpdate && (
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handleLocationAction('edit', viewingLocation);
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModalState}
        onClose={() => dispatch(hideCreateModal())}
        title="Create Location"
        size="xl"
      >
        <LocationForm
          onSubmit={handleCreateLocation}
          onCancel={() => dispatch(hideCreateModal())}
          loading={createLoading}
          error={createError}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModalState}
        onClose={() => dispatch(hideEditModal())}
        title="Edit Location"
        size="xl"
      >
        {currentLocation && (
          <LocationForm
            initialData={currentLocation}
            onSubmit={handleUpdateLocation}
            onCancel={() => dispatch(hideEditModal())}
            loading={updateLoading}
            error={updateError}
            isEdit={true}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => dispatch(hideDeleteModal())}
        onConfirm={() => handleDeleteLocation(false)}
        title="Delete Location"
        message={
          currentLocation
            ? `Are you sure you want to delete "${currentLocation.name}"? This will deactivate the location but preserve historical data. Child locations will become orphaned.`
            : 'Are you sure you want to delete this location?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm && bulkAction === 'delete'}
        onClose={() => {
          setShowBulkConfirm(false);
          setBulkAction('');
        }}
        onConfirm={handleBulkDelete}
        title="Delete Selected Locations"
        message={`Are you sure you want to delete ${selectedCount} location${selectedCount !== 1 ? 's' : ''}? This will deactivate the locations but preserve historical data.`}
        confirmText="Delete Selected"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default LocationsListPage;