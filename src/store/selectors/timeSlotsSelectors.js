// src/store/selectors/timeSlotsSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Base selectors
const selectTimeSlotsState = (state) => state.timeSlots;

// List and pagination selectors
export const selectTimeSlotsList = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.list
);

export const selectTimeSlotsTotal = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.total
);

export const selectTimeSlotsPagination = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.pagination
);

export const selectTimeSlotsFilters = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.filters
);

// Current time slot selector
export const selectCurrentTimeSlot = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.currentTimeSlot
);

// Loading state selectors
export const selectTimeSlotsLoading = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.loading
);

export const selectTimeSlotsListLoading = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.listLoading
);

export const selectTimeSlotsCreateLoading = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.createLoading
);

export const selectTimeSlotsUpdateLoading = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.updateLoading
);

export const selectTimeSlotsDeleteLoading = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.deleteLoading
);

// Error state selectors
export const selectTimeSlotsError = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.error
);

export const selectTimeSlotsListError = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.listError
);

export const selectTimeSlotsCreateError = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.createError
);

export const selectTimeSlotsUpdateError = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.updateError
);

export const selectTimeSlotsDeleteError = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.deleteError
);

// Available slots selectors
export const selectAvailableSlots = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.availableSlots
);

export const selectAvailableSlotsList = createSelector(
  [selectAvailableSlots],
  (availableSlots) => availableSlots.list
);

export const selectAvailableSlotsLoading = createSelector(
  [selectAvailableSlots],
  (availableSlots) => availableSlots.loading
);

export const selectAvailableSlotsError = createSelector(
  [selectAvailableSlots],
  (availableSlots) => availableSlots.error
);

export const selectAvailableSlotsDate = createSelector(
  [selectAvailableSlots],
  (availableSlots) => availableSlots.date
);

export const selectAvailableSlotsLocationId = createSelector(
  [selectAvailableSlots],
  (availableSlots) => availableSlots.locationId
);

// Selection selectors
export const selectSelectedTimeSlots = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.selectedTimeSlots
);

// Modal state selectors
export const selectShowCreateModal = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.showCreateModal
);

export const selectShowEditModal = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.showEditModal
);

export const selectShowDeleteModal = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.showDeleteModal
);

export const selectShowAvailabilityModal = createSelector(
  [selectTimeSlotsState],
  (timeSlots) => timeSlots.showAvailabilityModal
);

// Table data selector (formatted for display)
export const selectTimeSlotsTableData = createSelector(
  [selectTimeSlotsList],
  (timeSlots) => timeSlots.map(timeSlot => ({
    ...timeSlot,
    id: timeSlot.id,
    name: timeSlot.name || '',
    timeRange: `${timeSlot.startTime} - ${timeSlot.endTime}`,
    location: timeSlot.locationName || 'No specific location',
    status: timeSlot.isActive ? 'Active' : 'Inactive',
    capacity: timeSlot.maxVisitors || 0,
    duration: timeSlot.durationMinutes || 0,
    activeDaysText: timeSlot.activeDays || '',
    displayOrder: timeSlot.displayOrder || 0,
    createdAt: timeSlot.createdAt,
    modifiedAt: timeSlot.modifiedAt
  }))
);

// Active time slots selector
export const selectActiveTimeSlots = createSelector(
  [selectTimeSlotsList],
  (timeSlots) => timeSlots.filter(timeSlot => timeSlot.isActive)
);

// Time slots by location selector
export const selectTimeSlotsByLocation = createSelector(
  [selectTimeSlotsList],
  (timeSlots) => {
    const grouped = timeSlots.reduce((acc, timeSlot) => {
      const locationKey = timeSlot.locationId || 'unassigned';
      if (!acc[locationKey]) {
        acc[locationKey] = {
          locationId: timeSlot.locationId,
          locationName: timeSlot.locationName || 'Unassigned',
          timeSlots: []
        };
      }
      acc[locationKey].timeSlots.push(timeSlot);
      return acc;
    }, {});

    return Object.values(grouped);
  }
);

// Time slots summary selector
export const selectTimeSlotsSummary = createSelector(
  [selectTimeSlotsList],
  (timeSlots) => {
    const total = timeSlots.length;
    const active = timeSlots.filter(ts => ts.isActive).length;
    const inactive = total - active;
    const totalCapacity = timeSlots.reduce((sum, ts) => sum + (ts.maxVisitors || 0), 0);
    const averageCapacity = total > 0 ? Math.round(totalCapacity / total) : 0;
    const locationsUsed = new Set(timeSlots.map(ts => ts.locationId).filter(Boolean)).size;

    return {
      total,
      active,
      inactive,
      totalCapacity,
      averageCapacity,
      locationsUsed
    };
  }
);

// Filtered time slots selector (applies current filters)
export const selectFilteredTimeSlots = createSelector(
  [selectTimeSlotsList, selectTimeSlotsFilters],
  (timeSlots, filters) => {
    return timeSlots.filter(timeSlot => {
      // Location filter
      if (filters.locationId && timeSlot.locationId !== parseInt(filters.locationId)) {
        return false;
      }

      // Active only filter
      if (filters.activeOnly && !timeSlot.isActive) {
        return false;
      }

      return true;
    });
  }
);

// Available slots for specific criteria
export const selectAvailableSlotsForDate = createSelector(
  [selectAvailableSlotsList],
  (availableSlots) => availableSlots.filter(slot => slot.isAvailable)
);

// Bulk action capability selectors
export const selectCanBulkDeactivate = createSelector(
  [selectSelectedTimeSlots, selectTimeSlotsList],
  (selectedIds, timeSlots) => {
    if (selectedIds.length === 0) return false;
    
    const selectedTimeSlots = timeSlots.filter(ts => selectedIds.includes(ts.id));
    return selectedTimeSlots.some(ts => ts.isActive);
  }
);

export const selectCanBulkActivate = createSelector(
  [selectSelectedTimeSlots, selectTimeSlotsList],
  (selectedIds, timeSlots) => {
    if (selectedIds.length === 0) return false;
    
    const selectedTimeSlots = timeSlots.filter(ts => selectedIds.includes(ts.id));
    return selectedTimeSlots.some(ts => !ts.isActive);
  }
);

export const selectCanBulkDelete = createSelector(
  [selectSelectedTimeSlots],
  (selectedIds) => selectedIds.length > 0
);

// Time slot form data selector (for editing)
export const selectTimeSlotFormData = createSelector(
  [selectCurrentTimeSlot],
  (timeSlot) => {
    if (!timeSlot) return null;

    return {
      name: timeSlot.name || '',
      startTime: timeSlot.startTime || '',
      endTime: timeSlot.endTime || '',
      maxVisitors: timeSlot.maxVisitors || 1,
      activeDays: timeSlot.activeDays || '',
      locationId: timeSlot.locationId || null,
      bufferMinutes: timeSlot.bufferMinutes || 0,
      displayOrder: timeSlot.displayOrder || 0,
      isActive: timeSlot.isActive !== undefined ? timeSlot.isActive : true
    };
  }
);

// Loading state aggregation
export const selectIsAnyTimeSlotsLoading = createSelector(
  [
    selectTimeSlotsLoading,
    selectTimeSlotsListLoading,
    selectTimeSlotsCreateLoading,
    selectTimeSlotsUpdateLoading,
    selectTimeSlotsDeleteLoading,
    selectAvailableSlotsLoading
  ],
  (loading, listLoading, createLoading, updateLoading, deleteLoading, availableLoading) =>
    loading || listLoading || createLoading || updateLoading || deleteLoading || availableLoading
);

// Error state aggregation
export const selectTimeSlotsErrors = createSelector(
  [
    selectTimeSlotsError,
    selectTimeSlotsListError,
    selectTimeSlotsCreateError,
    selectTimeSlotsUpdateError,
    selectTimeSlotsDeleteError,
    selectAvailableSlotsError
  ],
  (error, listError, createError, updateError, deleteError, availableError) => {
    const errors = [];
    
    if (error) errors.push({ type: 'general', error });
    if (listError) errors.push({ type: 'list', error: listError });
    if (createError) errors.push({ type: 'create', error: createError });
    if (updateError) errors.push({ type: 'update', error: updateError });
    if (deleteError) errors.push({ type: 'delete', error: deleteError });
    if (availableError) errors.push({ type: 'available', error: availableError });
    
    return errors;
  }
);

// Export all selectors
export default {
  // List and pagination
  selectTimeSlotsList,
  selectTimeSlotsTotal,
  selectTimeSlotsPagination,
  selectTimeSlotsFilters,
  
  // Current time slot
  selectCurrentTimeSlot,
  
  // Loading states
  selectTimeSlotsLoading,
  selectTimeSlotsListLoading,
  selectTimeSlotsCreateLoading,
  selectTimeSlotsUpdateLoading,
  selectTimeSlotsDeleteLoading,
  
  // Error states
  selectTimeSlotsError,
  selectTimeSlotsListError,
  selectTimeSlotsCreateError,
  selectTimeSlotsUpdateError,
  selectTimeSlotsDeleteError,
  
  // Available slots
  selectAvailableSlots,
  selectAvailableSlotsList,
  selectAvailableSlotsLoading,
  selectAvailableSlotsError,
  selectAvailableSlotsDate,
  selectAvailableSlotsLocationId,
  
  // Selection
  selectSelectedTimeSlots,
  
  // Modals
  selectShowCreateModal,
  selectShowEditModal,
  selectShowDeleteModal,
  selectShowAvailabilityModal,
  
  // Computed data
  selectTimeSlotsTableData,
  selectActiveTimeSlots,
  selectTimeSlotsByLocation,
  selectTimeSlotsSummary,
  selectFilteredTimeSlots,
  selectAvailableSlotsForDate,
  
  // Bulk actions
  selectCanBulkDeactivate,
  selectCanBulkActivate,
  selectCanBulkDelete,
  
  // Form data
  selectTimeSlotFormData,
  
  // Aggregated states
  selectIsAnyTimeSlotsLoading,
  selectTimeSlotsErrors
};