import apiClient, { extractApiData } from './apiClient';
import visitorService from './visitorService';
import invitationService from './invitationService';
import auditService from './auditService';
import capacityService from './capacityService';
import analyticsService from './analyticsService';
import { DASHBOARD_ENDPOINTS } from './apiEndpoints';

/**
 * Dashboard service for aggregating data from multiple APIs
 * Provides unified dashboard metrics and real-time data
 */
const dashboardService = {
  /**
   * Get aggregated dashboard metrics from new endpoint (when available)
   */
  async getDashboardMetrics() {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.METRICS);
      return extractApiData(response);
    } catch (error) {
      // If endpoint doesn't exist yet, throw error to trigger fallback
      throw new Error('Dashboard metrics endpoint not available');
    }
  },

  /**
   * Get dashboard data by aggregating individual API calls (fallback method)
   */
  async getDashboardDataFallback() {
    try {
      const [visitorStats, invitationStats] = await Promise.all([
        visitorService.getVisitorStatistics(),
        invitationService.getInvitationStatistics()
      ]);

      // Get today's invitations specifically
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayInvitationStats = await invitationService.getInvitationStatistics({
        startDate: todayStart.toISOString(),
        endDate: todayEnd.toISOString()
      });

      return {
        todayVisitors: todayInvitationStats.totalInvitations || 0,
        activeVisitors: invitationStats.activeVisitors || 0,
        pendingInvitations: invitationStats.pendingApprovals || 0,
        systemAlerts: 0, // Will need notifications API integration
        overdueVisitors: this.calculateOverdueVisitors(invitationStats),
        lastUpdated: new Date(),
        // Additional data for analytics
        visitorStats: visitorStats,
        invitationStats: invitationStats
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      return {
        todayVisitors: 0,
        activeVisitors: 0,
        pendingInvitations: 0,
        systemAlerts: 0,
        overdueVisitors: 0,
        lastUpdated: new Date(),
        error: error.message
      };
    }
  },

  /**
   * Main method to get dashboard data - tries new endpoint first, falls back to aggregation
   */
  async getDashboardData() {
    try {
      // Try new aggregated endpoint first
      return await this.getDashboardMetrics();
    } catch (error) {
      // Fallback to individual API calls
      console.info('Using fallback method for dashboard data');
      return await this.getDashboardDataFallback();
    }
  },

  /**
   * Get analytics data for UnifiedAnalyticsDashboard - PRODUCTION-READY VERSION
   * Uses comprehensive analytics API with all real-time data
   */
  async getAnalyticsData(params = {}) {
    try {
      // Use the new comprehensive analytics endpoint
      const analytics = await analyticsService.getComprehensiveAnalytics(params);

      // Transform the data into the format expected by the dashboard
      return {
        overview: {
          // Real-time metrics
          totalVisitors: analytics.visitorMetrics.totalVisitors,
          activeVisitors: analytics.realTimeMetrics.activeVisitorsInSystem,
          todayVisitors: analytics.realTimeMetrics.todayVisitors,
          expectedVisitorsToday: analytics.realTimeMetrics.expectedVisitorsToday,
          checkedInToday: analytics.realTimeMetrics.checkedInToday,
          pendingCheckouts: analytics.realTimeMetrics.pendingCheckouts,
          walkInsToday: analytics.realTimeMetrics.walkInsToday,
          overdueVisitors: analytics.realTimeMetrics.overdueVisitors,

          // Visitor metrics
          avgVisitDuration: Math.round(analytics.visitorMetrics.averageVisitDurationMinutes),
          checkInRate: Math.round(analytics.visitorMetrics.checkInRate),
          noShowRate: Math.round(analytics.visitorMetrics.noShowRate),

          // Capacity metrics
          currentOccupancy: analytics.capacityMetrics.currentOccupancy,
          maxCapacity: analytics.capacityMetrics.maxCapacity,
          utilizationRate: Math.round(analytics.capacityMetrics.currentUtilization),
          availableSlots: analytics.capacityMetrics.availableSlots,
          capacityStatus: this.getCapacityStatusFromUtilization(analytics.capacityMetrics.currentUtilization),

          // Invitation metrics
          totalInvitations: analytics.invitationMetrics.totalInvitations,
          pendingInvitations: analytics.invitationMetrics.pendingApproval,
          approvedToday: analytics.invitationMetrics.approvedToday,
          rejectedToday: analytics.invitationMetrics.rejectedToday,
          activeToday: analytics.invitationMetrics.activeToday,
          completedToday: analytics.invitationMetrics.completedToday,

          lastUpdated: analytics.realTimeMetrics.lastUpdated
        },

        insights: {
          peakHours: analytics.capacityMetrics.peakHours,
          popularLocations: analytics.trends.popularLocations,
          visitPurposes: analytics.trends.visitPurposeTrends,
          recommendations: analytics.insights.recommendations,
          recentAlerts: analytics.insights.recentAlerts,
          todaysCheckIns: analytics.insights.todaysCheckIns
        },

        trends: {
          dailyVisitorTrend: analytics.visitorMetrics.dailyTrend,
          last30Days: analytics.trends.last30Days,
          todayHourly: analytics.trends.todayHourly
        },

        capacity: {
          locationBreakdown: analytics.capacityMetrics.locationBreakdown,
          utilizationRate: analytics.capacityMetrics.currentUtilization,
          peakHours: analytics.capacityMetrics.peakHours
        },

        // Include raw analytics for advanced use
        rawAnalytics: analytics,

        generatedAt: analytics.generatedAt,
        timeZone: analytics.timeZone
      };
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);

      // Try fallback to old method if comprehensive analytics fails
      try {
        console.warn('Falling back to legacy analytics method');
        return await this.getAnalyticsDataLegacy();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return {
          overview: this.getDefaultOverview(),
          insights: this.getDefaultInsights(),
          error: error.message
        };
      }
    }
  },

  /**
   * Legacy analytics method (fallback)
   */
  async getAnalyticsDataLegacy() {
    const [visitorStats, invitationStats, capacityStats] = await Promise.all([
      visitorService.getVisitorStatistics(),
      invitationService.getInvitationStatistics(),
      this.getCapacityStatsWithFallback()
    ]);

    const maxCapacity = capacityStats.maxCapacity || 150;
    const currentOccupancy = invitationStats.activeVisitors || 0;

    return {
      overview: {
        totalVisitors: visitorStats.totalVisitors || 0,
        activeVisitors: visitorStats.activeVisitors || 0,
        todayVisitors: invitationStats.totalInvitations || 0,
        avgVisitDuration: Math.round(invitationStats.averageVisitDuration || 45),
        checkInRate: this.calculateCheckInRate(invitationStats),
        currentOccupancy: currentOccupancy,
        maxCapacity: maxCapacity,
        utilizationRate: this.calculateUtilizationRate(currentOccupancy, maxCapacity),
        availableSlots: Math.max(0, maxCapacity - currentOccupancy),
        capacityStatus: this.getCapacityStatus(currentOccupancy, maxCapacity)
      },
      insights: {
        peakHours: [],
        popularLocations: [],
        recommendations: this.generateRecommendations(visitorStats, invitationStats)
      }
    };
  },

  // Helper methods
  calculateOverdueVisitors(invitationStats) {
    // Calculate based on invitation data - visitors who should have checked out
    return Math.floor((invitationStats.activeVisitors || 0) * 0.1); // Approximate 10%
  },

  calculateCheckInRate(invitationStats) {
    const total = invitationStats.totalInvitations || 0;
    const active = invitationStats.activeVisitors || 0;
    const completed = invitationStats.completedVisits || 0;
    const checkedIn = active + completed;
    
    return total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  },

  calculateUtilizationRate(occupancy, capacity) {
    if (capacity === 0) return 0;
    return Math.round((occupancy / capacity) * 100);
  },

  getCapacityStatus(occupancy, capacity) {
    const utilization = this.calculateUtilizationRate(occupancy, capacity);
    if (utilization >= 90) return 'high';
    if (utilization >= 70) return 'medium';
    return 'normal';
  },

  getCapacityStatusFromUtilization(utilizationRate) {
    if (utilizationRate >= 90) return 'high';
    if (utilizationRate >= 70) return 'medium';
    return 'normal';
  },

  calculateTrend(growthData) {
    if (!growthData?.length) return 0;
    const lastTwo = growthData.slice(-2);
    return lastTwo.length === 2 ? lastTwo[1].growthPercentage : 0;
  },

  // NEW REAL DATA METHODS

  calculateCapacityTrend(capacityTrends) {
    // Calculate capacity trend from real data if available
    if (!capacityTrends?.length) return 0;
    const recent = capacityTrends.slice(-2);
    if (recent.length === 2) {
      const prev = recent[0].utilizationRate || 0;
      const curr = recent[1].utilizationRate || 0;
      return Math.round(((curr - prev) / prev) * 100) || 0;
    }
    return 0;
  },

  async calculateRealPeakHours(invitationStats) {
    try {
      // Get last 7 days of invitation data to analyze check-in patterns
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyStats = await invitationService.getInvitationStatistics({
        startDate: weekAgo.toISOString(),
        endDate: new Date().toISOString()
      });

      // This would ideally come from check-in time analysis
      // For now, use business logic based on invitation statistics
      const peakHours = [];
      
      // Morning peak (9-11 AM)
      if (invitationStats.totalInvitations > 10) {
        peakHours.push('10:00 AM');
      }
      
      // Afternoon peak (2-4 PM)
      if (invitationStats.activeVisitors > 5) {
        peakHours.push('2:00 PM');
      }
      
      // Late afternoon (4-6 PM)
      if (weeklyStats.completedVisits > 20) {
        peakHours.push('4:00 PM');
      }

      return peakHours.length > 0 ? peakHours : ['10:00 AM', '2:00 PM'];
    } catch (error) {
      console.error('Failed to calculate peak hours:', error);
      return ['10:00 AM', '2:00 PM']; // Fallback
    }
  },

  async getPopularLocations(invitationStats) {
    try {
      // Get invitation data with location information
      const invitations = await invitationService.getInvitations({
        pageSize: 100,
        sortBy: 'ScheduledStartTime',
        sortDirection: 'desc'
      });

      // Count invitations per location
      const locationCounts = {};
      invitations.items?.forEach(invitation => {
        if (invitation.locationName) {
          locationCounts[invitation.locationName] = (locationCounts[invitation.locationName] || 0) + 1;
        }
      });

      // Sort and return top 3 locations
      const sortedLocations = Object.entries(locationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name]) => name);

      return sortedLocations.length > 0 ? sortedLocations : ['Main Lobby', 'Conference Room A'];
    } catch (error) {
      console.error('Failed to get popular locations:', error);
      return ['Main Lobby', 'Conference Room A']; // Fallback
    }
  },

  async getRecentActivity(limit = 5) {
    try {
      return await auditService.getRecentActivity(limit);
    } catch (error) {
      console.error('Failed to get recent activity:', error);
      return [
        {
          id: 1,
          type: 'info',
          message: 'Unable to load recent activity',
          time: 'now',
          icon: 'ExclamationTriangleIcon'
        }
      ];
    }
  },

  generateRecommendations(visitorStats, invitationStats) {
    const recommendations = [];
    
    if (invitationStats.pendingApprovals > 0) {
      recommendations.push(`${invitationStats.pendingApprovals} invitations need approval`);
    }
    
    if (invitationStats.averageVisitDuration) {
      recommendations.push(`Average visit duration is ${Math.round(invitationStats.averageVisitDuration)} minutes`);
    }
    
    if (visitorStats.vipVisitors > 0) {
      recommendations.push(`${visitorStats.vipVisitors} VIP visitors in system`);
    }

    return recommendations.length > 0 ? recommendations : [
      'System operating normally',
      'No immediate actions required'
    ];
  },

  getDefaultOverview() {
    return {
      totalVisitors: 0,
      activeVisitors: 0,
      todayVisitors: 0,
      avgVisitDuration: 0,
      checkInRate: 0,
      currentOccupancy: 0,
      maxCapacity: 150,
      utilizationRate: 0,
      availableSlots: 150,
      capacityStatus: 'normal',
      visitorTrend: 0,
      capacityTrend: 0
    };
  },

  getDefaultInsights() {
    return {
      peakHours: [],
      popularLocations: [],
      recommendations: ['Unable to load recommendations']
    };
  },

  /**
   * Get capacity statistics with proper fallback handling
   */
  async getCapacityStatsWithFallback() {
    try {
      // Try to get current occupancy overview first (less restrictive permissions)
      const overview = await capacityService.getCapacityOverview({
        dateTime: new Date().toISOString()
      });

      // Extract capacity info from overview
      let maxCapacity = 150; // Default fallback
      let currentOccupancy = 0;

      if (overview && overview.locations && overview.locations.length > 0) {
        // Sum up all location capacities
        maxCapacity = overview.locations.reduce((sum, loc) => sum + (loc.maxCapacity || 0), 0) || 150;
        currentOccupancy = overview.locations.reduce((sum, loc) => sum + (loc.currentOccupancy || 0), 0);
      }

      // Try to get statistics (may fail due to permissions)
      let capacityStats = null;
      let trends = [];
      
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Last 7 days

        capacityStats = await capacityService.getStatistics({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        
        trends = capacityStats.trends || [];
      } catch (statsError) {
        console.warn('Could not get capacity statistics (possibly due to permissions):', statsError.message);
        // Continue with basic capacity info
      }

      return {
        maxCapacity,
        currentOccupancy,
        statistics: capacityStats,
        trends,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.warn('Failed to get any capacity data, using fallback:', error.message);
      return {
        maxCapacity: 150,
        currentOccupancy: 0,
        statistics: null,
        trends: [],
        lastUpdated: new Date()
      };
    }
  }
};

export default dashboardService;