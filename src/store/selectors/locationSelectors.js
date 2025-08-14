import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectLocationsState = (state) => state.locations;

// Basic selectors
export const selectLocationsList = createSelector(
  [selectLocationsState],
  (locations) => locations.list
);

export const selectLocationsTree = createSelector(
  [selectLocationsState],
  (locations) => locations.tree
);

export const selectLocationsTotal = createSelector(
  [selectLocationsState],
  (locations) => locations.total
);

export const selectCurrentLocation = createSelector(
  [selectLocationsState],
  (locations) => locations.currentLocation
);

// Loading selectors
export const selectLocationsLoading = createSelector(
  [selectLocationsState],
  (locations) => locations.loading
);

export const selectLocationsListLoading = createSelector(
  [selectLocationsState],
  (locations) => locations.listLoading
);

export const selectLocationsTreeLoading = createSelector(
  [selectLocationsState],
  (locations) => locations.treeLoading
);

export const selectLocationsCreateLoading = createSelector(
  [selectLocationsState],
  (locations) => locations.createLoading
);

export const selectLocationsUpdateLoading = createSelector(
  [selectLocationsState],
  (locations) => locations.updateLoading
);

export const selectLocationsDeleteLoading = createSelector(
  [selectLocationsState],
  (locations) => locations.deleteLoading
);
// Error selectors
export const selectLocationsError = createSelector(
  [selectLocationsState],
  (locations) => locations.error
);

export const selectLocationsListError = createSelector(
  [selectLocationsState],
  (locations) => locations.listError
);

export const selectLocationsTreeError = createSelector(
  [selectLocationsState],
  (locations) => locations.treeError
);

export const selectLocationsCreateError = createSelector(
  [selectLocationsState],
  (locations) => locations.createError
);

export const selectLocationsUpdateError = createSelector(
  [selectLocationsState],
  (locations) => locations.updateError
);

export const selectLocationsDeleteError = createSelector(
  [selectLocationsState],
  (locations) => locations.deleteError
);

// Filter selectors
export const selectLocationsFilters = createSelector(
  [selectLocationsState],
  (locations) => locations.filters
);

// Selection selectors
export const selectSelectedLocations = createSelector(
  [selectLocationsState],
  (locations) => locations.selectedLocations
);

// Modal selectors
export const selectShowCreateModal = createSelector(
  [selectLocationsState],
  (locations) => locations.showCreateModal
);

export const selectShowEditModal = createSelector(
  [selectLocationsState],
  (locations) => locations.showEditModal
);

export const selectShowDeleteModal = createSelector(
  [selectLocationsState],
  (locations) => locations.showDeleteModal
);

// Active locations selectors (for dropdowns)
export const selectActiveLocations = createSelector(
  [selectLocationsState],
  (locations) => locations.activeLocations
);

export const selectActiveLocationsLoading = createSelector(
  [selectLocationsState],
  (locations) => locations.activeLocationsLoading
);

export const selectActiveLocationsError = createSelector(
  [selectLocationsState],
  (locations) => locations.activeLocationsError
);

// Root locations selectors (for hierarchy building)
export const selectRootLocations = createSelector(
  [selectLocationsState],
  (locations) => locations.rootLocations
);

export const selectRootLocationsLoading = createSelector(
  [selectLocationsState],
  (locations) => locations.rootLocationsLoading
);

export const selectRootLocationsError = createSelector(
  [selectLocationsState],
  (locations) => locations.rootLocationsError
);
// Computed selectors with business logic

// Filtered locations based on current filters
export const selectFilteredLocations = createSelector(
  [selectLocationsList, selectLocationsFilters],
  (locations, filters) => {
    let filtered = [...locations];

    // Filter by location type
    if (filters.locationType) {
      filtered = filtered.filter(location => 
        location.locationType?.toLowerCase() === filters.locationType.toLowerCase()
      );
    }

    // Filter by active status
    if (!filters.includeInactive) {
      filtered = filtered.filter(location => location.isActive);
    }

    // Filter by root only
    if (filters.rootOnly) {
      filtered = filtered.filter(location => !location.parentLocationId);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchLower) ||
        (location.code && location.code.toLowerCase().includes(searchLower)) ||
        (location.description && location.description.toLowerCase().includes(searchLower)) ||
        (location.building && location.building.toLowerCase().includes(searchLower)) ||
        (location.zone && location.zone.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }
);

// Sorted locations by display order and name
export const selectSortedLocations = createSelector(
  [selectFilteredLocations],
  (locations) => {
    return [...locations].sort((a, b) => {
      // Sort by display order first
      if (a.displayOrder !== b.displayOrder) {
        return (a.displayOrder || 999) - (b.displayOrder || 999);
      }
      // Then by name
      return a.name.localeCompare(b.name);
    });
  }
);

// Hierarchical tree structure (for tree components)
export const selectLocationHierarchy = createSelector(
  [selectFilteredLocations],
  (locations) => {
    const buildTree = (parentId = null) => {
      return locations
        .filter(location => location.parentLocationId === parentId)
        .map(location => ({
          ...location,
          children: buildTree(location.id)
        }))
        .sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) {
            return (a.displayOrder || 999) - (b.displayOrder || 999);
          }
          return a.name.localeCompare(b.name);
        });
    };

    return buildTree();
  }
);

// Flat list grouped by type
export const selectLocationsByType = createSelector(
  [selectFilteredLocations],
  (locations) => {
    const grouped = {};
    
    locations.forEach(location => {
      const type = location.locationType || 'Other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(location);
    });

    // Sort within each group
    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return (a.displayOrder || 999) - (b.displayOrder || 999);
        }
        return a.name.localeCompare(b.name);
      });
    });

    return grouped;
  }
);

// Active locations for dropdowns (cached version)
export const selectActiveLocationsForDropdown = createSelector(
  [selectActiveLocations, selectLocationsList],
  (cachedActive, allLocations) => {
    // Use cached active locations if available, otherwise filter from all
    if (cachedActive && cachedActive.length > 0) {
      return cachedActive.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return (a.displayOrder || 999) - (b.displayOrder || 999);
        }
        return a.name.localeCompare(b.name);
      });
    }

    // Fallback to filtering from all locations
    return allLocations
      .filter(location => location.isActive)
      .sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return (a.displayOrder || 999) - (b.displayOrder || 999);
        }
        return a.name.localeCompare(b.name);
      });
  }
);

// Get location by ID
export const selectLocationById = createSelector(
  [selectLocationsList, (state, id) => id],
  (locations, id) => {
    return locations.find(location => location.id === id);
  }
);

// Get children of a specific location
export const selectLocationChildren = createSelector(
  [selectLocationsList, (state, parentId) => parentId],
  (locations, parentId) => {
    return locations
      .filter(location => location.parentLocationId === parentId)
      .sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return (a.displayOrder || 999) - (b.displayOrder || 999);
        }
        return a.name.localeCompare(b.name);
      });
  }
);

// Get parent location
export const selectLocationParent = createSelector(
  [selectLocationsList, (state, location) => location],
  (locations, location) => {
    if (!location?.parentLocationId) return null;
    return locations.find(loc => loc.id === location.parentLocationId);
  }
);

// Selection state helpers
export const selectIsLocationSelected = createSelector(
  [selectSelectedLocations, (state, id) => id],
  (selectedIds, id) => {
    return selectedIds.includes(id);
  }
);

export const selectHasSelectedLocations = createSelector(
  [selectSelectedLocations],
  (selectedIds) => selectedIds.length > 0
);

export const selectSelectedLocationsCount = createSelector(
  [selectSelectedLocations],
  (selectedIds) => selectedIds.length
);

// Business logic selectors
export const selectCanCreateLocation = createSelector(
  [selectLocationsCreateLoading],
  (createLoading) => !createLoading
);

export const selectCanDeleteSelectedLocations = createSelector(
  [selectHasSelectedLocations, selectLocationsDeleteLoading],
  (hasSelected, deleteLoading) => hasSelected && !deleteLoading
);

// Statistics selectors
export const selectLocationStats = createSelector(
  [selectLocationsList],
  (locations) => {
    const total = locations.length;
    const active = locations.filter(l => l.isActive).length;
    const byType = {};
    const withCapacity = locations.filter(l => l.maxCapacity && l.maxCapacity > 0).length;
    const requiresEscort = locations.filter(l => l.requiresEscort).length;
    
    // Count by type
    locations.forEach(location => {
      const type = location.locationType || 'Other';
      byType[type] = (byType[type] || 0) + 1;
    });
    
    return {
      total,
      active,
      inactive: total - active,
      byType,
      withCapacity,
      requiresEscort
    };
  }
);

// Data freshness selector
export const selectLocationsLastUpdated = createSelector(
  [selectLocationsState],
  (locations) => locations.lastUpdated
);