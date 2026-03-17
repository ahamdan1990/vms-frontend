// src/pages/locations/LocationsListPage/LocationsListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('system');
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
  const showDeleteModalState = useSelector(selectShowDeleteModal);
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
        return <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">{t('locations.typeBadge.floor')}</div>;
      case 'room':
        return <div className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">{t('locations.typeBadge.room')}</div>;
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
          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
        />
      )
    },
    {
      key: 'name',
      header: t('locations.columns.location'),
      sortable: true,
      render: (value, location) => (
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${location.isActive ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'}`} />
            <span className="font-medium text-gray-900 dark:text-gray-100">{location.name}</span>
          </div>
          {location.description && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{location.description}</div>
          )}
          {location.address && (
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <MapPinIcon className="w-4 h-4 me-1 text-gray-400 dark:text-gray-500" />
              {location.address}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      header: t('locations.columns.typeHierarchy'),
      sortable: true,
      render: (value, location) => (
        <div className="space-y-1">
          <div>
            <Badge variant="secondary" size="sm">
              {location.locationType || t('locations.typeGeneral')}
            </Badge>
          </div>
          {location.parentLocationName && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('locations.parent', { name: location.parentLocationName })}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'capacity',
      header: t('locations.columns.capacity'),
      sortable: true,
      render: (value, location) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {location.maxCapacity ? t('locations.visitors', { count: location.maxCapacity }) : t('locations.unlimited')}
            </span>
          </div>
          {location.currentOccupancy !== undefined && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('locations.current', { count: location.currentOccupancy })}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: t('locations.columns.status'),
      sortable: true,
      render: (value, location) => (
        <Badge 
          variant={location.isActive ? 'success' : 'secondary'}
          size="sm"
        >
          {location.isActive ? t('locations.active') : t('locations.inactive')}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('locations.columns.actions'),
      width: '120px',
      sortable: false,
      render: (value, location) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLocationAction('view', location)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            title={t('common:buttons.view')}
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
              title={t('common:buttons.edit')}
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleLocationAction('delete', location)}
              className="text-red-600 hover:text-red-900 transition-colors"
              title={t('common:buttons.delete')}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="container mx-auto px-4 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('locations.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('locations.subtitle')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'table'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {t('locations.viewTable')}
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'tree'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {t('locations.viewTree')}
            </button>
          </div>
          
          {canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              loading={createLoading}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              {t('locations.createButton')}
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
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{t('locations.statTotal')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-300">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-300" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{t('locations.statActive')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-300">{stats.active}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{t('locations.statWithCapacity')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-300">{stats.withCapacity}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                </div>
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{t('locations.statRequiresEscort')}</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-300">{stats.requiresEscort}</dd>
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
              placeholder={t('locations.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FunnelIcon className="w-5 h-5" />}
            >
              {t('locations.filters')}
            </Button>
            
            {(filters.locationType || filters.includeInactive || filters.searchTerm || filters.rootOnly) && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
              >
                {t('locations.clearFilters')}
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
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('locations.locationType')}
                  </label>
                  <select
                    value={filters.locationType}
                    onChange={(e) => handleFilterChange('locationType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500"
                  >
                    <option value="">{t('locations.allTypes')}</option>
                    <option value="Building">{t('locations.types.building')}</option>
                    <option value="Floor">{t('locations.types.floor')}</option>
                    <option value="Room">{t('locations.types.room')}</option>
                    <option value="Zone">{t('locations.types.zone')}</option>
                    <option value="Parking">{t('locations.types.parking')}</option>
                    <option value="Other">{t('locations.types.other')}</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeInactive"
                    checked={filters.includeInactive}
                    onChange={(e) => handleFilterChange('includeInactive', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                  />
                  <label htmlFor="includeInactive" className="ms-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('locations.includeInactive')}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rootOnly"
                    checked={filters.rootOnly}
                    onChange={(e) => handleFilterChange('rootOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                  />
                  <label htmlFor="rootOnly" className="ms-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('locations.rootOnly')}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeChildren"
                    checked={filters.includeChildren}
                    onChange={(e) => handleFilterChange('includeChildren', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                  />
                  <label htmlFor="includeChildren" className="ms-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('locations.includeChildren')}
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('locations.locationsByType')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="flex justify-center mb-2">
                  {getLocationTypeIcon(type)}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{type}</div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{count}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {hasSelected && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('locations.bulkSelected', { count: selectedCount })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                {t('locations.clearSelection')}
              </Button>
            </div>
            
            {canDelete && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('delete');
                    setShowBulkConfirm(true);
                  }}
                  className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <TrashIcon className="w-4 h-4 me-2" />
                  {t('locations.deleteSelected')}
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
            emptyMessage={t('locations.emptyMessage')}
            className="locations-table"
          />
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('locations.hierarchyTitle')}</h3>
            {/* Tree view component would go here */}
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('locations.treeComingSoon')}
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
        title={t('locations.details.title')}
        size="lg"
      >
        {viewingLocation && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('locations.details.name')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{viewingLocation.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('locations.details.type')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{viewingLocation.locationType || t('locations.typeGeneral')}</p>
              </div>
            </div>
            
            {viewingLocation.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('locations.details.description')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{viewingLocation.description}</p>
              </div>
            )}
            
            {viewingLocation.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('locations.details.address')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{viewingLocation.address}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('locations.details.capacity')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {viewingLocation.maxCapacity ? t('locations.visitors', { count: viewingLocation.maxCapacity }) : t('locations.unlimited')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('locations.details.status')}</label>
                <div className="mt-1">
                  <Badge variant={viewingLocation.isActive ? 'success' : 'secondary'} size="sm">
                    {viewingLocation.isActive ? t('locations.active') : t('locations.inactive')}
                  </Badge>
                </div>
              </div>
            </div>
            
            {viewingLocation.parentLocationName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('locations.details.parentLocation')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{viewingLocation.parentLocationName}</p>
              </div>
            )}
            
            {viewingLocation.currentOccupancy !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('locations.details.currentOccupancy')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {t('locations.details.occupancyValue', {
                    current: viewingLocation.currentOccupancy,
                    max: viewingLocation.maxCapacity || '\u221e'
                  })}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingLocation(null);
                }}
              >
                {t('locations.details.close')}
              </Button>
              {canUpdate && (
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handleLocationAction('edit', viewingLocation);
                  }}
                >
                  {t('locations.details.edit')}
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
        title={t('locations.createTitle')}
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
        title={t('locations.editTitle')}
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
        isOpen={showDeleteModalState}
        onClose={() => dispatch(hideDeleteModal())}
        onConfirm={() => handleDeleteLocation(false)}
        title={t('locations.deleteTitle')}
        message={
          currentLocation
            ? t('locations.deleteMessage', { name: currentLocation.name })
            : t('locations.deleteMessageGeneric')
        }
        confirmText={t('locations.deleteConfirm')}
        cancelText={t('locations.cancel')}
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
        title={t('locations.bulkDeleteTitle')}
        message={t('locations.bulkDeleteMessage', { count: selectedCount })}
        confirmText={t('locations.deleteSelected')}
        cancelText={t('locations.cancel')}
        variant="danger"
        loading={deleteLoading}
      />
    </div>
    </div>
  );
};

export default LocationsListPage;

