import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectVisitorsState = (state) => state.visitors;

// Basic selectors
export const selectVisitorsList = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.list
);

export const selectVisitorsTotal = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.total
);

export const selectVisitorsPageIndex = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.pageIndex
);

export const selectVisitorsPageSize = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.pageSize
);

export const selectCurrentVisitor = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.currentVisitor
);

// Loading selectors
export const selectVisitorsLoading = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.loading
);

export const selectVisitorsListLoading = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.listLoading
);

export const selectVisitorsCreateLoading = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.createLoading
);

export const selectVisitorsUpdateLoading = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.updateLoading
);

export const selectVisitorsDeleteLoading = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.deleteLoading
);

export const selectVisitorsSearchLoading = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.searchLoading
);

export const selectVisitorsStatusChangeLoading = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.statusChangeLoading
);

// Error selectors
export const selectVisitorsError = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.error
);

export const selectVisitorsListError = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.listError
);

export const selectVisitorsCreateError = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.createError
);

export const selectVisitorsUpdateError = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.updateError
);

export const selectVisitorsDeleteError = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.deleteError
);

export const selectVisitorsSearchError = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.searchError
);

export const selectVisitorsStatusChangeError = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.statusChangeError
);

// Filter selectors
export const selectVisitorsFilters = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.filters
);

// Selection selectors
export const selectSelectedVisitors = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.selectedVisitors
);

// Modal selectors
export const selectShowCreateModal = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.showCreateModal
);

export const selectShowEditModal = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.showEditModal
);

export const selectShowDeleteModal = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.showDeleteModal
);

export const selectShowDetailsModal = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.showDetailsModal
);

export const selectShowBlacklistModal = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.showBlacklistModal
);

export const selectShowAdvancedSearchModal = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.showAdvancedSearchModal
);

// Advanced search selectors
export const selectAdvancedSearchState = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.advancedSearch
);

export const selectAdvancedSearchResults = createSelector(
  [selectAdvancedSearchState],
  (advancedSearch) => advancedSearch.results
);

export const selectAdvancedSearchLoading = createSelector(
  [selectAdvancedSearchState],
  (advancedSearch) => advancedSearch.loading
);

export const selectAdvancedSearchError = createSelector(
  [selectAdvancedSearchState],
  (advancedSearch) => advancedSearch.error
);

export const selectIsAdvancedSearchActive = createSelector(
  [selectAdvancedSearchState],
  (advancedSearch) => advancedSearch.isActive
);

// Quick search selectors
export const selectQuickSearchResults = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.quickSearchResults
);

export const selectQuickSearchLoading = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.quickSearchLoading
);

export const selectQuickSearchTerm = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.quickSearchTerm
);
// VIP visitors selectors
export const selectVipVisitors = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.vipVisitors
);

export const selectVipVisitorsLoading = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.vipVisitorsLoading
);

export const selectVipVisitorsError = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.vipVisitorsError
);

// Blacklisted visitors selectors
export const selectBlacklistedVisitors = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.blacklistedVisitors
);

export const selectBlacklistedVisitorsLoading = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.blacklistedVisitorsLoading
);

export const selectBlacklistedVisitorsError = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.blacklistedVisitorsError
);

// Statistics selectors
export const selectVisitorStatistics = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.statistics
);

export const selectVisitorStatisticsLoading = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.statisticsLoading
);

export const selectVisitorStatisticsError = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.statisticsError
);

// Computed selectors with business logic

// Filtered visitors based on current filters
export const selectFilteredVisitors = createSelector(
  [selectVisitorsList, selectVisitorsFilters],
  (visitors, filters) => {
    let filtered = [...visitors];

    // Note: Most filtering is done server-side, but we can do additional client-side filtering
    // if needed for performance reasons

    return filtered;
  }
);

// Sorted visitors (server-side sorting is preferred, but this provides fallback)
export const selectSortedVisitors = createSelector(
  [selectFilteredVisitors, selectVisitorsFilters],
  (visitors, filters) => {
    console.log(visitors);
    return [...visitors].sort((a, b) => {
      const { sortBy, sortDirection } = filters;
      const direction = sortDirection === 'desc' ? -1 : 1;

      switch (sortBy) {
        case 'FullName':
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB) * direction;
        
        case 'Company':
          const companyA = (a.company || '').toLowerCase();
          const companyB = (b.company || '').toLowerCase();
          return companyA.localeCompare(companyB) * direction;
        
        case 'Email':
          const emailA = (a.email || '').toLowerCase();
          const emailB = (b.email || '').toLowerCase();
          return emailA.localeCompare(emailB) * direction;
        
        case 'CreatedAt':
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return (dateA - dateB) * direction;
        
        default:
          return 0;
      }
    });
  }
);

// Get visitor by ID
export const selectVisitorById = createSelector(
  [selectVisitorsList, (state, id) => id],
  (visitors, id) => {
    return visitors.find(visitor => visitor.id === id);
  }
);

// Get visitors by company
export const selectVisitorsByCompany = createSelector(
  [selectVisitorsList, (state, company) => company],
  (visitors, company) => {
    if (!company) return [];
    return visitors.filter(visitor => 
      visitor.company && visitor.company.toLowerCase().includes(company.toLowerCase())
    );
  }
);

// Get active visitors only
export const selectActiveVisitors = createSelector(
  [selectVisitorsList],
  (visitors) => {
    return visitors.filter(visitor => visitor.isActive);
  }
);

// Get VIP visitors from main list (when not using cached version)
export const selectVipVisitorsFromList = createSelector(
  [selectVisitorsList],
  (visitors) => {
    return visitors.filter(visitor => visitor.isVip && visitor.isActive);
  }
);

// Get blacklisted visitors from main list (when not using cached version)
export const selectBlacklistedVisitorsFromList = createSelector(
  [selectVisitorsList],
  (visitors) => {
    return visitors.filter(visitor => visitor.isBlacklisted);
  }
);

// Visitors grouped by company
export const selectVisitorsByCompanyGrouped = createSelector(
  [selectVisitorsList],
  (visitors) => {
    const grouped = {};
    
    visitors.forEach(visitor => {
      const company = visitor.company || 'No Company';
      if (!grouped[company]) {
        grouped[company] = [];
      }
      grouped[company].push(visitor);
    });

    // Sort companies and visitors within each company
    const sortedGrouped = {};
    Object.keys(grouped)
      .sort()
      .forEach(company => {
        sortedGrouped[company] = grouped[company].sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );
      });

    return sortedGrouped;
  }
);

// Visitors grouped by nationality
export const selectVisitorsByNationality = createSelector(
  [selectVisitorsList],
  (visitors) => {
    const grouped = {};
    
    visitors.forEach(visitor => {
      const nationality = visitor.nationality || 'Unknown';
      if (!grouped[nationality]) {
        grouped[nationality] = [];
      }
      grouped[nationality].push(visitor);
    });

    return grouped;
  }
);

// Selection state helpers
export const selectIsVisitorSelected = createSelector(
  [selectSelectedVisitors, (state, id) => id],
  (selectedIds, id) => {
    return selectedIds.includes(id);
  }
);

export const selectHasSelectedVisitors = createSelector(
  [selectSelectedVisitors],
  (selectedIds) => selectedIds.length > 0
);

export const selectSelectedVisitorsCount = createSelector(
  [selectSelectedVisitors],
  (selectedIds) => selectedIds.length
);

export const selectSelectedVisitorsData = createSelector(
  [selectVisitorsList, selectSelectedVisitors],
  (visitors, selectedIds) => {
    return visitors.filter(visitor => selectedIds.includes(visitor.id));
  }
);

// Business logic selectors
export const selectCanCreateVisitor = createSelector(
  [selectVisitorsCreateLoading],
  (createLoading) => !createLoading
);

export const selectCanDeleteSelectedVisitors = createSelector(
  [selectHasSelectedVisitors, selectVisitorsDeleteLoading],
  (hasSelected, deleteLoading) => hasSelected && !deleteLoading
);

export const selectCanPerformStatusChange = createSelector(
  [selectVisitorsStatusChangeLoading],
  (statusChangeLoading) => !statusChangeLoading
);

// Pagination selectors
export const selectHasPreviousPage = createSelector(
  [selectVisitorsPageIndex],
  (pageIndex) => pageIndex > 0
);

export const selectHasNextPage = createSelector(
  [selectVisitorsPageIndex, selectVisitorsPageSize, selectVisitorsTotal],
  (pageIndex, pageSize, total) => {
    return (pageIndex + 1) * pageSize < total;
  }
);

export const selectTotalPages = createSelector(
  [selectVisitorsPageSize, selectVisitorsTotal],
  (pageSize, total) => {
    return Math.ceil(total / pageSize);
  }
);

export const selectCurrentPageRange = createSelector(
  [selectVisitorsPageIndex, selectVisitorsPageSize, selectVisitorsTotal],
  (pageIndex, pageSize, total) => {
    const start = pageIndex * pageSize + 1;
    const end = Math.min((pageIndex + 1) * pageSize, total);
    return { start, end, total };
  }
);

// Statistics computed selectors
export const selectVisitorStatsComputed = createSelector(
  [selectVisitorsList],
  (visitors) => {
    const total = visitors.length;
    const active = visitors.filter(v => v.isActive).length;
    const vip = visitors.filter(v => v.isVip && v.isActive).length;
    const blacklisted = visitors.filter(v => v.isBlacklisted).length;
    
    // Group by company
    const companies = {};
    visitors.forEach(visitor => {
      const company = visitor.company || 'No Company';
      companies[company] = (companies[company] || 0) + 1;
    });
    
    // Group by nationality
    const nationalities = {};
    visitors.forEach(visitor => {
      const nationality = visitor.nationality || 'Unknown';
      nationalities[nationality] = (nationalities[nationality] || 0) + 1;
    });
    
    return {
      total,
      active,
      inactive: total - active,
      vip,
      blacklisted,
      byCompany: companies,
      byNationality: nationalities,
      topCompanies: Object.entries(companies)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      topNationalities: Object.entries(nationalities)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }
);

// Data freshness selectors
export const selectVisitorsLastUpdated = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.lastUpdated
);

export const selectVipVisitorsLastFetch = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.vipVisitorsLastFetch
);

export const selectBlacklistedVisitorsLastFetch = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.blacklistedVisitorsLastFetch
);

export const selectStatisticsLastFetch = createSelector(
  [selectVisitorsState],
  (visitors) => visitors.statisticsLastFetch
);