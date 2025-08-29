import apiClient, { extractApiData } from './apiClient';

/**
 * System management service for health checks and system statistics
 * Leverages existing /health endpoint from backend health checks
 */
const systemService = {
  /**
   * Get system health from existing /health endpoint
   * Uses the production-ready health checks already implemented
   */
  async getSystemHealth() {
    const response = await apiClient.get('/health');
    return extractApiData(response);
  },

  /**
   * Parse health data into frontend-compatible format
   * Converts backend health check format to UI display format
   */
  parseHealthData(healthData) {
    const checks = healthData.checks || [];
    
    return {
      database: this.getCheckStatus(checks, 'database'),
      emailService: this.getExternalServiceStatus(checks, 'emailService'),
      qrGenerator: this.getExternalServiceStatus(checks, 'qrCodeService') || 'Active',
      documentScanner: this.getExternalServiceStatus(checks, 'fileUploadService') || 'Limited',
      lastHealthCheck: new Date(),
      overall: healthData.status || 'Unknown',
      duration: healthData.duration,
      rawData: healthData // Keep raw data for debugging
    };
  },

  /**
   * Get status for a specific health check
   */
  getCheckStatus(checks, checkName) {
    const check = checks.find(c => c.name === checkName);
    if (!check) return 'Unknown';
    
    switch (check.status) {
      case 'Healthy':
        return 'Healthy';
      case 'Degraded':
        return 'Limited';
      case 'Unhealthy':
        return 'Down';
      default:
        return 'Unknown';
    }
  },

  /**
   * Get external service status from health check data
   */
  getExternalServiceStatus(checks, serviceName) {
    const externalServicesCheck = checks.find(c => c.name === 'external_services');
    if (!externalServicesCheck || !externalServicesCheck.data) {
      return 'Unknown';
    }

    const serviceStatus = externalServicesCheck.data[serviceName];
    if (!serviceStatus) return 'Unknown';

    switch (serviceStatus.toLowerCase()) {
      case 'connected':
      case 'operational':
        return 'Operational';
      case 'active':
        return 'Active';
      case 'limited':
      case 'degraded':
        return 'Limited';
      case 'error':
      case 'disconnected':
        return 'Down';
      default:
        return serviceStatus;
    }
  },

  /**
   * Get system statistics (placeholder for future implementation)
   */
  async getSystemStatistics() {
    try {
      const healthData = await this.getSystemHealth();
      const dbCheck = healthData.checks?.find(c => c.name === 'database');
      
      return {
        totalUsers: dbCheck?.data?.userCount || 0,
        activeLocations: 12, // Will be replaced with real API call
        visitPurposes: 8,    // Will be replaced with real API call
        timeSlots: 24,       // Will be replaced with real API call
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // Mock data
        systemUptime: '15 days, 4 hours' // Will be calculated from health data
      };
    } catch (error) {
      console.error('Failed to get system statistics:', error);
      return {
        totalUsers: 0,
        activeLocations: 0,
        visitPurposes: 0,
        timeSlots: 0,
        lastBackup: new Date(),
        systemUptime: 'Unknown'
      };
    }
  }
};

export default systemService;