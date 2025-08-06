import apiClient, { extractApiData } from './apiClient';
import { buildQueryString } from './apiEndpoints';

/**
 * Audit management service for viewing system audit trails
 * Matches backend audit functionality
 */

// Audit endpoints
const AUDIT_ENDPOINTS = {
  BASE: '/api/Audit',
  BY_ID: (id) => `/api/Audit/${id}`,
  EXPORT: '/api/Audit/export',
  SEARCH: '/api/Audit/search',
  USER_ACTIVITY: '/api/Audit/user-activity',
  SYSTEM_EVENTS: '/api/Audit/system-events',
  SECURITY_EVENTS: '/api/Audit/security-events'
};

const auditService = {
  /**
   * Gets paginated audit logs
   * GET /api/Audit
   * Requires: Audit.Read.All permission
   */
  async getAuditLogs(params = {}) {
    const queryParams = {
      pageIndex: params.pageIndex || 0,
      pageSize: params.pageSize || 20,
      searchTerm: params.searchTerm || undefined,
      category: params.category || undefined,
      userId: params.userId || undefined,
      action: params.action || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
      sortBy: params.sortBy || 'Timestamp',
      sortDescending: params.sortDescending !== false
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    console.log('🔍 Audit Logs API Call:', {
      endpoint: AUDIT_ENDPOINTS.BASE,
      params: queryParams
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${AUDIT_ENDPOINTS.BASE}${queryString}`);
    
    console.log('📥 Audit Logs API Response:', {
      status: response.status,
      data: response.data,
      totalCount: response.data?.data?.totalCount,
      pageIndex: response.data?.data?.pageIndex,
      totalPages: response.data?.data?.totalPages,
      itemsCount: response.data?.data?.items?.length
    });

    return extractApiData(response);
  },

  /**
   * Gets specific audit log entry
   * GET /api/Audit/{id}
   * Requires: Audit.Read.All permission
   */
  async getAuditLog(id) {
    const response = await apiClient.get(AUDIT_ENDPOINTS.BY_ID(id));
    return extractApiData(response);
  },

  /**
   * Gets user activity audit logs
   * GET /api/Audit/user-activity
   * Requires: Audit.ViewUserActivity permission
   */
  async getUserActivity(params = {}) {
    const queryParams = {
      pageIndex: params.pageIndex || 0,
      pageSize: params.pageSize || 20,
      userId: params.userId || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
      action: params.action || undefined
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    console.log('🔍 User Activity API Call:', {
      endpoint: AUDIT_ENDPOINTS.USER_ACTIVITY,
      params: queryParams
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${AUDIT_ENDPOINTS.USER_ACTIVITY}${queryString}`);
    
    console.log('📥 User Activity API Response:', {
      status: response.status,
      data: response.data,
      totalCount: response.data?.data?.totalCount,
      pageIndex: response.data?.data?.pageIndex,
      totalPages: response.data?.data?.totalPages,
      itemsCount: response.data?.data?.items?.length
    });

    return extractApiData(response);
  },

  /**
   * Gets system events audit logs
   * GET /api/Audit/system-events
   * Requires: Audit.ViewSystemEvents permission
   */
  async getSystemEvents(params = {}) {
    const queryParams = {
      pageIndex: params.pageIndex || 0,
      pageSize: params.pageSize || 20,
      severity: params.severity || undefined,
      source: params.source || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${AUDIT_ENDPOINTS.SYSTEM_EVENTS}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Gets security events audit logs
   * GET /api/Audit/security-events
   * Requires: Audit.ViewSecurityEvents permission
   */
  async getSecurityEvents(params = {}) {
    const queryParams = {
      pageIndex: params.pageIndex || 0,
      pageSize: params.pageSize || 20,
      eventType: params.eventType || undefined,
      ipAddress: params.ipAddress || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
      riskLevel: params.riskLevel || undefined
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${AUDIT_ENDPOINTS.SECURITY_EVENTS}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Searches audit logs
   * GET /api/Audit/search
   * Requires: Audit.Search permission
   */
  async searchAuditLogs(searchTerm, params = {}) {
    const queryParams = {
      searchTerm: searchTerm,
      pageIndex: params.pageIndex || 0,
      pageSize: params.pageSize || 20,
      category: params.category || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${AUDIT_ENDPOINTS.SEARCH}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Exports audit logs
   * GET /api/Audit/export
   * Requires: Audit.Export permission
   */
  async exportAuditLogs(params = {}) {
    const queryParams = {
      format: params.format || 'csv',
      category: params.category || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
      includeDetails: params.includeDetails || false
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${AUDIT_ENDPOINTS.EXPORT}${queryString}`, {
      responseType: 'blob'
    });
    
    return response.data;
  },

  // Utility methods

  /**
   * Gets audit statistics
   */
  async getAuditStatistics(dateFrom, dateTo) {
    const logs = await this.getAuditLogs({
      dateFrom,
      dateTo,
      pageSize: 1000 // Get large batch for stats
    });

    if (!logs || !logs.items) {
      return {
        total: 0,
        byCategory: {},
        byAction: {},
        byUser: {},
        bySeverity: {}
      };
    }

    const stats = {
      total: logs.totalCount || logs.items.length,
      byCategory: {},
      byAction: {},
      byUser: {},
      bySeverity: {}
    };

    logs.items.forEach(log => {
      // Category counts
      if (log.category) {
        stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      }

      // Action counts
      if (log.action) {
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      }

      // User counts
      if (log.userName) {
        stats.byUser[log.userName] = (stats.byUser[log.userName] || 0) + 1;
      }

      // Severity counts
      if (log.severity) {
        stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      }
    });

    return stats;
  },

  /**
   * Gets available audit categories
   */
  async getAuditCategories() {
    // This would ideally be a backend endpoint, but for now extract from logs
    const logs = await this.getAuditLogs({ pageSize: 100 });
    
    const categories = new Set();
    if (logs && logs.items) {
      logs.items.forEach(log => {
        if (log.category) {
          categories.add(log.category);
        }
      });
    }

    return Array.from(categories).sort();
  },

  /**
   * Formats audit log for display
   */
  formatAuditLog(log) {
    return {
      ...log,
      formattedTimestamp: new Date(log.timestamp).toLocaleString(),
      formattedDetails: this.formatLogDetails(log.details),
      severityColor: this.getSeverityColor(log.severity),
      actionIcon: this.getActionIcon(log.action)
    };
  },

  /**
   * Formats log details for display
   */
  formatLogDetails(details) {
    if (!details) return '';
    
    if (typeof details === 'string') {
      try {
        return JSON.stringify(JSON.parse(details), null, 2);
      } catch {
        return details;
      }
    }
    
    return JSON.stringify(details, null, 2);
  },

  /**
   * Gets severity color for UI
   */
  getSeverityColor(severity) {
    const colors = {
      'Low': 'text-blue-600 bg-blue-100',
      'Medium': 'text-yellow-600 bg-yellow-100',
      'High': 'text-orange-600 bg-orange-100',
      'Critical': 'text-red-600 bg-red-100',
      'Info': 'text-gray-600 bg-gray-100'
    };
    
    return colors[severity] || colors['Info'];
  },

  /**
   * Gets action icon for UI
   */
  getActionIcon(action) {
    const icons = {
      'Login': 'login',
      'Logout': 'logout',
      'Create': 'plus',
      'Update': 'pencil',
      'Delete': 'trash',
      'View': 'eye',
      'Export': 'download',
      'Import': 'upload',
      'Error': 'exclamation-triangle'
    };
    
    return icons[action] || 'document-text';
  }
};

export default auditService;