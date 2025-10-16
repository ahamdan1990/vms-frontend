import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectVisitPurposesState = (state) => state.visitPurposes;

// Basic selectors
export const selectVisitPurposesList = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.list
);

export const selectVisitPurposesTotal = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.total
);

export const selectCurrentVisitPurpose = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.currentVisitPurpose
);

// Loading selectors
export const selectVisitPurposesLoading = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.loading
);

export const selectVisitPurposesListLoading = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.listLoading
);

export const selectVisitPurposesCreateLoading = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.createLoading
);

export const selectVisitPurposesUpdateLoading = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.updateLoading
);

export const selectVisitPurposesDeleteLoading = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.deleteLoading
);
// Error selectors
export const selectVisitPurposesError = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.error
);

export const selectVisitPurposesListError = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.listError
);

export const selectVisitPurposesCreateError = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.createError
);

export const selectVisitPurposesUpdateError = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.updateError
);

export const selectVisitPurposesDeleteError = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.deleteError
);

// Filter selectors
export const selectVisitPurposesFilters = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.filters
);

// Selection selectors
export const selectSelectedVisitPurposes = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.selectedVisitPurposes
);

// Modal selectors
export const selectShowCreateModal = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.showCreateModal
);

export const selectShowEditModal = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.showEditModal
);

export const selectShowDeleteModal = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.showDeleteModal
);

// Active purposes selectors (for dropdowns)
export const selectActivePurposes = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.activePurposes
);

export const selectActivePurposesLoading = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.activePurposesLoading
);

export const selectActivePurposesError = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.activePurposesError
);
// Computed selectors with business logic

// Filtered visit purposes based on current filters
export const selectFilteredVisitPurposes = createSelector(
  [selectVisitPurposesList, selectVisitPurposesFilters],
  (visitPurposes, filters) => {
    let filtered = [...visitPurposes];

    // Filter by approval requirement
    if (filters.requiresApproval !== null) {
      filtered = filtered.filter(purpose => purpose.requiresApproval === filters.requiresApproval);
    }

    // Filter by active status
    if (!filters.includeInactive) {
      filtered = filtered.filter(purpose => purpose.isActive);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(purpose =>
        purpose.name.toLowerCase().includes(searchLower) ||
        (purpose.description && purpose.description.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }
);

// Sorted visit purposes by display order and name
export const selectSortedVisitPurposes = createSelector(
  [selectFilteredVisitPurposes],
  (visitPurposes) => {
    return [...visitPurposes].sort((a, b) => {
      // Sort by display order first
      if (a.displayOrder !== b.displayOrder) {
        return (a.displayOrder || 999) - (b.displayOrder || 999);
      }
      // Then by name
      return a.name.localeCompare(b.name);
    });
  }
);

// Active visit purposes only (cached version for dropdowns)
export const selectActiveVisitPurposesForDropdown = createSelector(
  [selectActivePurposes, selectVisitPurposesList],
  (cachedActive, allPurposes) => {
    // Use cached active purposes if available, otherwise filter from all
    if (cachedActive && cachedActive.length > 0) {
      return cachedActive.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return (a.displayOrder || 999) - (b.displayOrder || 999);
        }
        return a.name.localeCompare(b.name);
      });
    }

    // Fallback to filtering from all purposes
    return allPurposes
      .filter(purpose => purpose.isActive)
      .sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return (a.displayOrder || 999) - (b.displayOrder || 999);
        }
        return a.name.localeCompare(b.name);
      });
  }
);

// Get visit purpose by ID
export const selectVisitPurposeById = createSelector(
  [selectVisitPurposesList, (state, id) => id],
  (visitPurposes, id) => {
    return visitPurposes.find(purpose => purpose.id === id);
  }
);

// Selection state helpers
export const selectIsVisitPurposeSelected = createSelector(
  [selectSelectedVisitPurposes, (state, id) => id],
  (selectedIds, id) => {
    return selectedIds.includes(id);
  }
);

export const selectHasSelectedVisitPurposes = createSelector(
  [selectSelectedVisitPurposes],
  (selectedIds) => selectedIds.length > 0
);

export const selectSelectedVisitPurposesCount = createSelector(
  [selectSelectedVisitPurposes],
  (selectedIds) => selectedIds.length
);

// Business logic selectors
export const selectCanCreateVisitPurpose = createSelector(
  [selectVisitPurposesCreateLoading],
  (createLoading) => !createLoading
);

export const selectCanDeleteSelectedPurposes = createSelector(
  [selectHasSelectedVisitPurposes, selectVisitPurposesDeleteLoading],
  (hasSelected, deleteLoading) => hasSelected && !deleteLoading
);

// Statistics selectors
export const selectVisitPurposeStats = createSelector(
  [selectVisitPurposesList],
  (visitPurposes) => {
    const total = visitPurposes.length;
    const active = visitPurposes.filter(p => p.isActive).length;
    const requiresApproval = visitPurposes.filter(p => p.requiresApproval && p.isActive).length;
    
    return {
      total,
      active,
      inactive: total - active,
      requiresApproval,
      noApprovalRequired: active - requiresApproval
    };
  }
);

// Data freshness selector
export const selectVisitPurposesLastUpdated = createSelector(
  [selectVisitPurposesState],
  (visitPurposes) => visitPurposes.lastUpdated
);