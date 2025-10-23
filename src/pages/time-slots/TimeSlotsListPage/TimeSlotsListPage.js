// src/pages/time-slots/TimeSlotsListPage/TimeSlotsListPage.js
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../../../hooks/usePermissions';

// Icons
import {
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  CalendarDaysIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Redux actions
import {
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getAvailableTimeSlots,
  updateFilters,
  resetFilters,
  setSelectedTimeSlots,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  showAvailabilityModal,
  hideAvailabilityModal,
  clearError
} from '../../../store/slices/timeSlotsSlice';

import { getLocations } from '../../../store/slices/locationsSlice';

// Import selectors
import {
  selectTimeSlotsList,
  selectTimeSlotsTotal,
  selectTimeSlotsPagination,
  selectTimeSlotsFilters,
  selectTimeSlotsListLoading,
  selectTimeSlotsCreateLoading,
  selectTimeSlotsUpdateLoading,
  selectTimeSlotsDeleteLoading,
  selectTimeSlotsListError,
  selectTimeSlotsCreateError,
  selectTimeSlotsUpdateError,
  selectTimeSlotsDeleteError,
  selectCurrentTimeSlot,
  selectSelectedTimeSlots,
  selectShowCreateModal,
  selectShowEditModal,
  selectShowDeleteModal,
  selectShowAvailabilityModal,
  selectAvailableSlotsList,
  selectAvailableSlotsLoading,
  selectAvailableSlotsError
} from '../../../store/selectors/timeSlotsSelectors';

import { selectLocationsList } from '../../../store/selectors/locationSelectors';

// Notification hook
import { useToast } from '../../../hooks/useNotifications';

// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Table from '../../../components/common/Table/Table';
import Pagination from '../../../components/common/Pagination/Pagination';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import Badge from '../../../components/common/Badge/Badge';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import TimeSlotForm from '../../../components/time-slots/TimeSlotForm/TimeSlotForm';

// Services
import timeSlotsService from '../../../services/timeSlotsService';

// Utils
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Time Slots Management Page with comprehensive CRUD operations
 */
const TimeSlotsListPage = () => {
  const dispatch = useDispatch();
  const { user: userPermissions } = usePermissions();
  const toast = useToast();

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toISOString().split('T')[0]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingTimeSlot, setViewingTimeSlot] = useState(null);

  // Redux state using selectors
  const timeSlots = useSelector(selectTimeSlotsList);
  const total = useSelector(selectTimeSlotsTotal);
  const pagination = useSelector(selectTimeSlotsPagination);
  const filters = useSelector(selectTimeSlotsFilters);
  const listLoading = useSelector(selectTimeSlotsListLoading);
  const createLoading = useSelector(selectTimeSlotsCreateLoading);
  const updateLoading = useSelector(selectTimeSlotsUpdateLoading);
  const deleteLoading = useSelector(selectTimeSlotsDeleteLoading);
  const listError = useSelector(selectTimeSlotsListError);
  const createError = useSelector(selectTimeSlotsCreateError);
  const updateError = useSelector(selectTimeSlotsUpdateError);
  const deleteError = useSelector(selectTimeSlotsDeleteError);
  const currentTimeSlot = useSelector(selectCurrentTimeSlot);
  const selectedTimeSlots = useSelector(selectSelectedTimeSlots);
  const isCreateModalOpen = useSelector(selectShowCreateModal);
  const isEditModalOpen = useSelector(selectShowEditModal);
  const isDeleteModalOpen = useSelector(selectShowDeleteModal);
  const isAvailabilityModalOpen = useSelector(selectShowAvailabilityModal);
  const availableSlotsList = useSelector(selectAvailableSlotsList);
  const availableSlotsLoading = useSelector(selectAvailableSlotsLoading);
  const availableSlotsError = useSelector(selectAvailableSlotsError);

  // Redux state - Locations
  const locations = useSelector(selectLocationsList);
  const locationsLoading = useSelector(state => state.locations.loading);

  // Check permissions
  const canRead = userPermissions.canActivate;
  const canCreate = userPermissions.canCreate;
  const canEdit = userPermissions.canUpdate || userPermissions.canEdit;
  const canDelete = userPermissions.canDelete;

  // Initialize data
  useEffect(() => {
    if (canRead) {
      dispatch(getTimeSlots());
      dispatch(getLocations());
    }
  }, [dispatch, canRead]);

  // Handle search input changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.searchTerm) {
        handleFilterChange({ searchTerm: searchInput });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.searchTerm]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    dispatch(updateFilters(newFilters));
    dispatch(getTimeSlots({ ...filters, ...newFilters, pageIndex: 0 }));
  };

  // Handle pagination
  const handlePageChange = (newPageIndex) => {
    dispatch(getTimeSlots({ ...filters, pageIndex: newPageIndex }));
  };

  // Handle sorting
  const handleSort = (sortBy, sortDirection) => {
    handleFilterChange({ sortBy, sortDirection });
  };

  // Handle row selection
  const handleRowSelect = (selectedRowIds) => {
    dispatch(setSelectedTimeSlots(selectedRowIds));
  };

  // Handle create time slot
  const handleCreateTimeSlot = async (timeSlotData) => {
    try {
      await dispatch(createTimeSlot(timeSlotData)).unwrap();
      toast.success('Success', 'Time slot created successfully');
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error('Error', `Failed to create time slot: ${errorMessage}`);
    }
  };

  // Handle update time slot
  const handleUpdateTimeSlot = async (timeSlotData) => {
    try {
      await dispatch(updateTimeSlot({ 
        id: currentTimeSlot.id, 
        timeSlotData 
      })).unwrap();
      toast.success('Success', 'Time slot updated successfully');
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error('Error', `Failed to update time slot: ${errorMessage}`);
    }
  };

  // Handle delete time slot
  const handleDeleteTimeSlot = async (hardDelete = false) => {
    try {
      await dispatch(deleteTimeSlot({ 
        id: currentTimeSlot.id, 
        hardDelete 
      })).unwrap();
      toast.success('Success', `Time slot ${hardDelete ? 'permanently deleted' : 'deactivated'} successfully`);
      dispatch(hideDeleteModal());
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error('Error', `Failed to delete time slot: ${errorMessage}`);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedTimeSlots.length === 0) return;

    try {
      if (bulkAction === 'delete') {
        const promises = selectedTimeSlots.map(id => 
          dispatch(deleteTimeSlot({ id, hardDelete: false })).unwrap()
        );
        await Promise.all(promises);
        toast.success('Success', `${selectedTimeSlots.length} time slots deactivated`);
      }
      
      dispatch(clearSelections());
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error('Error', `Bulk action failed: ${errorMessage}`);
    } finally {
      setShowBulkConfirm(false);
      setBulkAction('');
    }
  };

  // Helper function to get day names from active days string
  const getActiveDayNames = useCallback((activeDaysString) => {
    if (!activeDaysString) return 'None';
    
    const dayNames = {
      1: 'Monday',
      2: 'Tuesday', 
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
      7: 'Sunday'
    };
    
    try {
      const days = activeDaysString
        .split(',')
        .map(day => parseInt(day.trim()))
        .filter(day => day >= 1 && day <= 7)
        .sort((a, b) => a - b)
        .map(day => dayNames[day])
        .filter(Boolean);
        
      return days.length > 0 ? days.join(', ') : 'None';
    } catch (error) {
      console.error('Error parsing active days:', error);
      return 'Invalid format';
    }
  }, []);

  // Handle check availability
  const handleCheckAvailability = () => {
    if (availabilityDate) {
      dispatch(getAvailableTimeSlots({ 
        date: availabilityDate,
        locationId: filters.locationId 
      }));
    }
  };

  // Handle time slot actions (view, edit, delete)
  const handleTimeSlotAction = useCallback((action, timeSlot) => {
    switch (action) {
      case 'view':
        setViewingTimeSlot(timeSlot);
        setShowViewModal(true);
        break;
      case 'availability':
        dispatch(showAvailabilityModal({ timeSlot, date: availabilityDate }));
        break;
      case 'edit':
        dispatch(showEditModal(timeSlot));
        break;
      case 'delete':
        dispatch(showDeleteModal(timeSlot));
        break;
      default:
        break;
    }
  }, [dispatch, availabilityDate]);

  // Clear errors when modals open/close
  useEffect(() => {
    if (!isCreateModalOpen && !isEditModalOpen && !isDeleteModalOpen) {
      dispatch(clearError());
    }
  }, [isCreateModalOpen, isEditModalOpen, isDeleteModalOpen, dispatch]);

  // Location options for filter
  const locationOptions = useMemo(() => [
    { value: '', label: 'All Locations' },
    ...locations.map(location => ({
      value: location.id.toString(),
      label: location.name
    }))
  ], [locations]);

  // Table columns configuration
  const columns = useMemo(() => [
    {
      key: 'selection',
      header: '',
      width: '50px',
      sortable: false,
      render: (value, timeSlot) => (
        <input
          type="checkbox"
          checked={selectedTimeSlots.includes(timeSlot.id)}
          onChange={(e) => {
            if (e.target.checked) {
              dispatch(setSelectedTimeSlots([...selectedTimeSlots, timeSlot.id]));
            } else {
              dispatch(setSelectedTimeSlots(selectedTimeSlots.filter(id => id !== timeSlot.id)));
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      )
    },
    {
      key: 'name',
      header: 'Time Slot',
      sortable: true,
      render: (value, timeSlot) => (
        <div>
          <div className="font-medium text-gray-900">{timeSlot.name}</div>
          {timeSlot.locationName && (
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {timeSlot.locationName}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'timeRange',
      header: 'Time Range',
      sortable: true,
      render: (value, timeSlot) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              {timeSlotsService.formatTimeForDisplay(timeSlot.startTime)} - {timeSlotsService.formatTimeForDisplay(timeSlot.endTime)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Duration: {timeSlotsService.calculateDuration(timeSlot.startTime, timeSlot.endTime)} min
          </div>
        </div>
      )
    },
    {
      key: 'capacity',
      header: 'Capacity',
      sortable: true,
      render: (value, timeSlot) => (
        <div className="text-center">
          <Badge variant="neutral" size="sm">
            {timeSlot.maxVisitors} visitors
          </Badge>
          {timeSlot.bufferTime && (
            <div className="text-xs text-gray-500 mt-1">
              Buffer: {timeSlot.bufferTime}min
            </div>
          )}
        </div>
      )
    },
    {
      key: 'activeDays',
      header: 'Active Days',
      sortable: false,
      render: (value, timeSlot) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
            </svg>
            <span className="text-gray-600">
              {getActiveDayNames(timeSlot.activeDays)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, timeSlot) => (
        <Badge 
          variant={timeSlot.isActive ? 'success' : 'secondary'}
          size="sm"
        >
          {timeSlot.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      sortable: false,
      render: (value, timeSlot) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTimeSlotAction('view', timeSlot)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="View details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleTimeSlotAction('availability', timeSlot)}
            className="text-green-600 hover:text-green-900 transition-colors"
            title="Check availability"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          {canEdit && (
            <button
              onClick={() => handleTimeSlotAction('edit', timeSlot)}
              className="text-blue-600 hover:text-blue-900 transition-colors"
              title="Edit time slot"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleTimeSlotAction('delete', timeSlot)}
              className="text-red-600 hover:text-red-900 transition-colors"
              title="Delete time slot"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )
    }
  ], [selectedTimeSlots, canEdit, canDelete, handleTimeSlotAction]);
  
  if (!canRead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view time slots.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Time Slots</h1>
          <p className="text-gray-600">Manage time slots for visitor appointments</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => dispatch(showAvailabilityModal())}
          >
            Check Availability
          </Button>
          
          {canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              loading={createLoading}
            >
              Add Time Slot
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 border-gray-700 ">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search time slots..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-3">
            <Select
              value={filters.locationId || ''}
              onChange={(e) => handleFilterChange({ locationId: e.target.value || null })}
              options={locationOptions}
              loading={locationsLoading}
              className="w-48"
            />
            
            <Select
              value={filters.activeOnly ? 'true' : 'false'}
              onChange={(e) => handleFilterChange({ activeOnly: e.target.value === 'true' })}
              options={[
                { value: 'true', label: 'Active Only' },
                { value: 'false', label: 'All Time Slots' }
              ]}
              className="w-36"
            />
            
            <Button
              variant="outline"
              onClick={() => {
                dispatch(resetFilters());
                setSearchInput('');
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTimeSlots.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedTimeSlots.length} time slot{selectedTimeSlots.length !== 1 ? 's' : ''} selected
            </span>
            
            <div className="flex gap-2">
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('delete');
                    setShowBulkConfirm(true);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Deactivate Selected
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 border-gray-700">
        {listError ? (
          <div className="p-6 text-center">
            <p className="text-red-600">Error loading time slots: {listError}</p>
            <Button
              variant="outline"
              onClick={() => dispatch(getTimeSlots(filters))}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : (
          <Table
            data={timeSlots}
            columns={columns}
            loading={listLoading}
            selectable={canDelete}
            selectedRows={selectedTimeSlots}
            onSelectionChange={handleRowSelect}
            onSort={handleSort}
            sortBy={filters.sortBy}
            sortDirection={filters.sortDirection}
            emptyMessage="No time slots found"
          />
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination
              currentPage={pagination.pageIndex}
              totalPages={pagination.totalPages}
              totalItems={total}
              itemsPerPage={pagination.pageSize}
              onPageChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      
      {/* Create Time Slot Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => dispatch(hideCreateModal())}
        title="Create Time Slot"
        size="lg"
      >
        <TimeSlotForm
          onSubmit={handleCreateTimeSlot}
          onCancel={() => dispatch(hideCreateModal())}
          loading={createLoading}
          error={createError}
          submitText="Create Time Slot"
        />
      </Modal>

      {/* Edit Time Slot Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => dispatch(hideEditModal())}
        title="Edit Time Slot"
        size="lg"
      >
        {currentTimeSlot && (
          <TimeSlotForm
            timeSlot={currentTimeSlot}
            onSubmit={handleUpdateTimeSlot}
            onCancel={() => dispatch(hideEditModal())}
            loading={updateLoading}
            error={updateError}
            submitText="Update Time Slot"
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => dispatch(hideDeleteModal())}
        onConfirm={() => handleDeleteTimeSlot(false)}
        title="Deactivate Time Slot"
        message={
          currentTimeSlot
            ? `Are you sure you want to deactivate "${currentTimeSlot.name}"? This will make it unavailable for new appointments but won't affect existing ones.`
            : 'Are you sure you want to deactivate this time slot?'
        }
        confirmText="Deactivate"
        variant="warning"
        loading={deleteLoading}
      />

      {/* Availability Check Modal */}
      <Modal
        isOpen={isAvailabilityModalOpen}
        onClose={() => dispatch(hideAvailabilityModal())}
        title="Check Time Slot Availability"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              value={availabilityDate}
              onChange={(e) => setAvailabilityDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            
            <Select
              label="Location"
              value={filters.locationId || ''}
              onChange={(e) => handleFilterChange({ locationId: e.target.value || null })}
              options={locationOptions}
              loading={locationsLoading}
            />
          </div>

          <Button
            onClick={handleCheckAvailability}
            loading={availableSlotsLoading}
            disabled={!availabilityDate}
            className="w-full"
          >
            Check Availability
          </Button>

          {/* Available Slots Results */}
          {availableSlotsList && availableSlotsList.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Available Time Slots</h4>
              <div className="grid gap-3">
                {availableSlotsList.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{slot.name}</span>
                        {slot.locationName && (
                          <Badge variant="neutral" size="sm">{slot.locationName}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {timeSlotsService.formatTimeForDisplay(slot.startTime)} - {timeSlotsService.formatTimeForDisplay(slot.endTime)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {slot.availableSlots} / {slot.maxVisitors} available
                      </div>
                      <Badge
                        variant={slot.isAvailable ? 'success' : 'error'}
                        size="sm"
                      >
                        {slot.isAvailable ? 'Available' : 'Full'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableSlotsError && (
            <div className="text-center py-4">
              <p className="text-red-600">Error: {availableSlotsError}</p>
            </div>
          )}

          {!availableSlotsLoading && (!availableSlotsList || availableSlotsList.length === 0) && availabilityDate && (
            <div className="text-center py-8">
              <EmptyState
                title="No Available Time Slots"
                description="No time slots are available for the selected date and location."
              />
            </div>
          )}
        </div>
      </Modal>
      
      {/* View TimeSlot Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingTimeSlot(null);
        }}
        title="Time Slot Details"
        size="lg"
      >
        {viewingTimeSlot && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{viewingTimeSlot.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge variant={viewingTimeSlot.isActive ? 'success' : 'secondary'} size="sm">
                    {viewingTimeSlot.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Range</label>
                <p className="mt-1 text-sm text-gray-900">
                  {timeSlotsService.formatTimeForDisplay(viewingTimeSlot.startTime)} - {timeSlotsService.formatTimeForDisplay(viewingTimeSlot.endTime)}
                </p>
                <p className="text-sm text-gray-500">
                  Duration: {timeSlotsService.calculateDuration(viewingTimeSlot.startTime, viewingTimeSlot.endTime)} minutes
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingTimeSlot.maxVisitors} visitors maximum
                </p>
                {viewingTimeSlot.bufferTime && (
                  <p className="text-sm text-gray-500">
                    Buffer time: {viewingTimeSlot.bufferTime} minutes
                  </p>
                )}
              </div>
            </div>
            
            {viewingTimeSlot.locationName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 text-sm text-gray-900">{viewingTimeSlot.locationName}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Active Days</label>
              <p className="mt-1 text-sm text-gray-900">
                {getActiveDayNames(viewingTimeSlot.activeDays)}
              </p>
            </div>
            
            {viewingTimeSlot.displayOrder !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Order</label>
                <p className="mt-1 text-sm text-gray-900">{viewingTimeSlot.displayOrder}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingTimeSlot(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  handleTimeSlotAction('availability', viewingTimeSlot);
                }}
              >
                Check Availability
              </Button>
              {canEdit && (
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handleTimeSlotAction('edit', viewingTimeSlot);
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
      
      {/* Bulk Confirm Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkAction}
        title="Confirm Bulk Action"
        message={`Are you sure you want to ${bulkAction} ${selectedTimeSlots.length} time slot${selectedTimeSlots.length !== 1 ? 's' : ''}?`}
        confirmText="Confirm"
        variant="warning"
      />
    </div>
  );
};

export default TimeSlotsListPage;