// src/pages/time-slots/TimeSlotsListPage/TimeSlotsListPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../../../hooks/usePermissions';

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

// Notification actions
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from '../../../store/slices/notificationSlice';

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

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toISOString().split('T')[0]);

  // Redux state - Time Slots
  const {
    list: timeSlots,
    total,
    pagination,
    filters,
    loading,
    listLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    error,
    listError,
    createError,
    updateError,
    deleteError,
    currentTimeSlot,
    selectedTimeSlots,
    showCreateModal: isCreateModalOpen,
    showEditModal: isEditModalOpen,
    showDeleteModal: isDeleteModalOpen,
    showAvailabilityModal: isAvailabilityModalOpen,
    availableSlots
  } = useSelector(state => state.timeSlots);

  // Redux state - Locations
  const { list: locations, loading: locationsLoading } = useSelector(state => state.locations);

  // Check permissions
  const canRead = userPermissions.canActivate;
  const canCreate = userPermissions.canCreate;
  const canEdit = userPermissions.canEdit;
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
      dispatch(showSuccessToast('Time slot created successfully'));
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      dispatch(showErrorToast(`Failed to create time slot: ${errorMessage}`));
    }
  };

  // Handle update time slot
  const handleUpdateTimeSlot = async (timeSlotData) => {
    try {
      await dispatch(updateTimeSlot({ 
        id: currentTimeSlot.id, 
        timeSlotData 
      })).unwrap();
      dispatch(showSuccessToast('Time slot updated successfully'));
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      dispatch(showErrorToast(`Failed to update time slot: ${errorMessage}`));
    }
  };

  // Handle delete time slot
  const handleDeleteTimeSlot = async (hardDelete = false) => {
    try {
      await dispatch(deleteTimeSlot({ 
        id: currentTimeSlot.id, 
        hardDelete 
      })).unwrap();
      dispatch(showSuccessToast(`Time slot ${hardDelete ? 'permanently deleted' : 'deactivated'} successfully`));
      dispatch(hideDeleteModal());
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      dispatch(showErrorToast(`Failed to delete time slot: ${errorMessage}`));
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
        dispatch(showSuccessToast(`${selectedTimeSlots.length} time slots deactivated`));
      }
      
      dispatch(clearSelections());
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      dispatch(showErrorToast(`Bulk action failed: ${errorMessage}`));
    } finally {
      setShowBulkConfirm(false);
      setBulkAction('');
    }
  };

  // Handle check availability
  const handleCheckAvailability = () => {
    if (availabilityDate) {
      dispatch(getAvailableTimeSlots({ 
        date: availabilityDate,
        locationId: filters.locationId 
      }));
    }
  };

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
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_, timeSlot) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{timeSlot.name}</span>
          {timeSlot.locationName && (
            <span className="text-sm text-gray-500">{timeSlot.locationName}</span>
          )}
        </div>
      )
    },
    {
      key: 'timeRange',
      label: 'Time Range',
      render: (_, timeSlot) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900">
            {timeSlotsService.formatTimeForDisplay(timeSlot.startTime)} - {timeSlotsService.formatTimeForDisplay(timeSlot.endTime)}
          </span>
          <span className="text-xs text-gray-500">
            {timeSlotsService.calculateDuration(timeSlot.startTime, timeSlot.endTime)} minutes
          </span>
        </div>
      )
    },
    {
      key: 'maxVisitors',
      label: 'Max Visitors',
      sortable: true,
      render: (_, timeSlot) => (
        <Badge variant="neutral" size="sm">
          {timeSlot.maxVisitors}
        </Badge>
      )
    },
    {
      key: 'activeDays',
      label: 'Active Days',
      render: (_, timeSlot) => (
        <span className="text-sm text-gray-600">
          {timeSlotsService.getActiveDayNames(timeSlot.activeDays)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, timeSlot) => {
        const status = timeSlotsService.getTimeSlotStatus(timeSlot);
        const statusText = timeSlotsService.getStatusDisplayText(status);
        const colorClass = timeSlotsService.getStatusColorClass(status);
        
        return (
          <Badge 
            variant={status === 'available' ? 'success' : status === 'warning' ? 'warning' : status === 'full' ? 'error' : 'neutral'}
            size="sm"
          >
            {statusText}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, timeSlot) => (
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(showEditModal(timeSlot))}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(showDeleteModal(timeSlot))}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          )}
        </div>
      )
    }
  ], [canEdit, canDelete, dispatch]);
  
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
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
            loading={availableSlots.loading}
            disabled={!availabilityDate}
            className="w-full"
          >
            Check Availability
          </Button>

          {/* Available Slots Results */}
          {availableSlots.list.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Available Time Slots</h4>
              <div className="grid gap-3">
                {availableSlots.list.map((slot) => (
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

          {availableSlots.error && (
            <div className="text-center py-4">
              <p className="text-red-600">Error: {availableSlots.error}</p>
            </div>
          )}

          {!availableSlots.loading && availableSlots.list.length === 0 && availabilityDate && (
            <div className="text-center py-8">
              <EmptyState
                title="No Available Time Slots"
                description="No time slots are available for the selected date and location."
              />
            </div>
          )}
        </div>
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