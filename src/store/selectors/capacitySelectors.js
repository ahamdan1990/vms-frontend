// src/store/selectors/capacitySelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Base selectors
const selectCapacityState = (state) => state.capacity;

// Validation selectors
export const selectCapacityValidation = createSelector(
  [selectCapacityState],
  (capacity) => capacity.validation
);

export const selectValidationResult = createSelector(
  [selectCapacityValidation],
  (validation) => validation.result
);

export const selectValidationLoading = createSelector(
  [selectCapacityValidation],
  (validation) => validation.loading
);

export const selectValidationError = createSelector(
  [selectCapacityValidation],
  (validation) => validation.error
);

// Occupancy selectors
export const selectOccupancy = createSelector(
  [selectCapacityState],
  (capacity) => capacity.occupancy
);

export const selectOccupancyData = createSelector(
  [selectOccupancy],
  (occupancy) => occupancy.data
);

export const selectOccupancyLoading = createSelector(
  [selectOccupancy],
  (occupancy) => occupancy.loading
);

export const selectOccupancyError = createSelector(
  [selectOccupancy],
  (occupancy) => occupancy.error
);

export const selectOccupancyLastUpdated = createSelector(
  [selectOccupancy],
  (occupancy) => occupancy.lastUpdated
);

// Statistics selectors
export const selectStatistics = createSelector(
  [selectCapacityState],
  (capacity) => capacity.statistics
);

export const selectStatisticsData = createSelector(
  [selectStatistics],
  (statistics) => statistics.data
);

export const selectStatisticsLoading = createSelector(
  [selectStatistics],
  (statistics) => statistics.loading
);

export const selectStatisticsError = createSelector(
  [selectStatistics],
  (statistics) => statistics.error
);

export const selectStatisticsDateRange = createSelector(
  [selectStatistics],
  (statistics) => statistics.dateRange
);

// Alternatives selectors
export const selectAlternatives = createSelector(
  [selectCapacityState],
  (capacity) => capacity.alternatives
);

export const selectAlternativesList = createSelector(
  [selectAlternatives],
  (alternatives) => alternatives.list
);

export const selectAlternativesLoading = createSelector(
  [selectAlternatives],
  (alternatives) => alternatives.loading
);

export const selectAlternativesError = createSelector(
  [selectAlternatives],
  (alternatives) => alternatives.error
);

export const selectAlternativesOriginalRequest = createSelector(
  [selectAlternatives],
  (alternatives) => alternatives.originalRequest
);

// Overview selectors
export const selectOverview = createSelector(
  [selectCapacityState],
  (capacity) => capacity.overview
);

export const selectOverviewData = createSelector(
  [selectOverview],
  (overview) => overview.data
);

export const selectOverviewLoading = createSelector(
  [selectOverview],
  (overview) => overview.loading
);

export const selectOverviewError = createSelector(
  [selectOverview],
  (overview) => overview.error
);

export const selectOverviewLastUpdated = createSelector(
  [selectOverview],
  (overview) => overview.lastUpdated
);

// Trends selectors
export const selectTrends = createSelector(
  [selectCapacityState],
  (capacity) => capacity.trends
);

export const selectTrendsData = createSelector(
  [selectTrends],
  (trends) => trends.data
);

export const selectTrendsLoading = createSelector(
  [selectTrends],
  (trends) => trends.loading
);

export const selectTrendsError = createSelector(
  [selectTrends],
  (trends) => trends.error
);

export const selectTrendsParameters = createSelector(
  [selectTrends],
  (trends) => trends.parameters
);

// UI state selectors
export const selectSelectedLocationId = createSelector(
  [selectCapacityState],
  (capacity) => capacity.selectedLocationId
);

export const selectSelectedDateRange = createSelector(
  [selectCapacityState],
  (capacity) => capacity.selectedDateRange
);

export const selectAutoRefresh = createSelector(
  [selectCapacityState],
  (capacity) => capacity.autoRefresh
);

export const selectRefreshInterval = createSelector(
  [selectCapacityState],
  (capacity) => capacity.refreshInterval
);

// Modal selectors
export const selectShowAlternativesModal = createSelector(
  [selectCapacityState],
  (capacity) => capacity.showAlternativesModal
);

export const selectShowStatisticsModal = createSelector(
  [selectCapacityState],
  (capacity) => capacity.showStatisticsModal
);

export const selectShowTrendsModal = createSelector(
  [selectCapacityState],
  (capacity) => capacity.showTrendsModal
);

// Computed selectors
export const selectIsValidationAvailable = createSelector(
  [selectValidationResult],
  (result) => result?.isAvailable || false
);

export const selectIsAtCapacity = createSelector(
  [selectOccupancyData],
  (occupancy) => occupancy?.isAtCapacity || false
);

export const selectIsWarningLevel = createSelector(
  [selectOccupancyData],
  (occupancy) => occupancy?.isWarningLevel || false
);

export const selectOccupancyPercentage = createSelector(
  [selectOccupancyData],
  (occupancy) => occupancy?.occupancyPercentage || 0
);

export const selectAvailableSlots = createSelector(
  [selectOccupancyData],
  (occupancy) => occupancy?.availableSlots || 0
);

export const selectRecommendedAlternatives = createSelector(
  [selectAlternativesList],
  (alternatives) => alternatives.filter(alt => alt.isRecommended)
);

export const selectOverviewSummary = createSelector(
  [selectOverviewData],
  (overviewData) => {
    if (!Array.isArray(overviewData) || overviewData.length === 0) {
      return {
        totalLocations: 0,
        totalCapacity: 0,
        totalOccupancy: 0,
        atCapacityCount: 0,
        warningLevelCount: 0,
        averageUtilization: 0
      };
    }

    const totalLocations = overviewData.length;
    const totalCapacity = overviewData.reduce((sum, loc) => sum + (loc.maxCapacity || 0), 0);
    const totalOccupancy = overviewData.reduce((sum, loc) => sum + (loc.currentOccupancy || 0), 0);
    const atCapacityCount = overviewData.filter(loc => loc.isAtCapacity).length;
    const warningLevelCount = overviewData.filter(loc => loc.isWarningLevel && !loc.isAtCapacity).length;
    const averageUtilization = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

    return {
      totalLocations,
      totalCapacity,
      totalOccupancy,
      atCapacityCount,
      warningLevelCount,
      averageUtilization
    };
  }
);

// Loading state selectors
export const selectIsAnyCapacityLoading = createSelector(
  [selectValidationLoading, selectOccupancyLoading, selectStatisticsLoading, selectAlternativesLoading, selectOverviewLoading, selectTrendsLoading],
  (validationLoading, occupancyLoading, statisticsLoading, alternativesLoading, overviewLoading, trendsLoading) =>
    validationLoading || occupancyLoading || statisticsLoading || alternativesLoading || overviewLoading || trendsLoading
);

export const selectCapacityErrors = createSelector(
  [selectValidationError, selectOccupancyError, selectStatisticsError, selectAlternativesError, selectOverviewError, selectTrendsError],
  (validationError, occupancyError, statisticsError, alternativesError, overviewError, trendsError) => {
    const errors = [];
    
    if (validationError) errors.push({ type: 'validation', error: validationError });
    if (occupancyError) errors.push({ type: 'occupancy', error: occupancyError });
    if (statisticsError) errors.push({ type: 'statistics', error: statisticsError });
    if (alternativesError) errors.push({ type: 'alternatives', error: alternativesError });
    if (overviewError) errors.push({ type: 'overview', error: overviewError });
    if (trendsError) errors.push({ type: 'trends', error: trendsError });
    
    return errors;
  }
);

export default {
  // Validation
  selectCapacityValidation,
  selectValidationResult,
  selectValidationLoading,
  selectValidationError,
  
  // Occupancy
  selectOccupancy,
  selectOccupancyData,
  selectOccupancyLoading,
  selectOccupancyError,
  selectOccupancyLastUpdated,
  
  // Statistics
  selectStatistics,
  selectStatisticsData,
  selectStatisticsLoading,
  selectStatisticsError,
  selectStatisticsDateRange,
  
  // Alternatives
  selectAlternatives,
  selectAlternativesList,
  selectAlternativesLoading,
  selectAlternativesError,
  selectAlternativesOriginalRequest,
  
  // Overview
  selectOverview,
  selectOverviewData,
  selectOverviewLoading,
  selectOverviewError,
  selectOverviewLastUpdated,
  
  // Trends
  selectTrends,
  selectTrendsData,
  selectTrendsLoading,
  selectTrendsError,
  selectTrendsParameters,
  
  // UI State
  selectSelectedLocationId,
  selectSelectedDateRange,
  selectAutoRefresh,
  selectRefreshInterval,
  
  // Modals
  selectShowAlternativesModal,
  selectShowStatisticsModal,
  selectShowTrendsModal,
  
  // Computed
  selectIsValidationAvailable,
  selectIsAtCapacity,
  selectIsWarningLevel,
  selectOccupancyPercentage,
  selectAvailableSlots,
  selectRecommendedAlternatives,
  selectOverviewSummary,
  selectIsAnyCapacityLoading,
  selectCapacityErrors
};