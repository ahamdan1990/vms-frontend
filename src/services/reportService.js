import apiClient from './apiClient';
import { REPORT_ENDPOINTS } from './apiEndpoints';

/**
 * Helper function to download a file from blob response
 */
const downloadFile = (response, defaultFileName) => {
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const disposition = response.headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const fileName = match?.[1] || defaultFileName;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Reporting service for accessing report-specific endpoints.
 */
const reportService = {
  /**
   * Fetches the current "who is in the building" report snapshot.
   * @param {Object} params Optional filter parameters.
   * @param {number} params.locationId Location filter.
   */
  async getInBuildingReport(params = {}) {
    const response = await apiClient.get(REPORT_ENDPOINTS.IN_BUILDING, {
      params
    });

    return response.data?.data ?? response.data;
  },

  /**
   * Downloads the "who is in the building" report as a CSV file.
   * @param {Object} params Optional filter parameters.
   * @param {number} params.locationId Location filter.
   */
  async exportInBuildingReport(params = {}) {
    const response = await apiClient.get(REPORT_ENDPOINTS.IN_BUILDING_EXPORT, {
      params,
      responseType: 'blob'
    });

    downloadFile(response, `in-building-report-${new Date().toISOString()}.csv`);
    return true;
  },

  /**
   * Fetches comprehensive visitor report with advanced filtering and pagination.
   * @param {Object} params Filter and pagination parameters.
   * @param {number} params.locationId Optional location filter.
   * @param {string} params.startDate Start date (ISO string).
   * @param {string} params.endDate End date (ISO string).
   * @param {string} params.status Invitation status filter.
   * @param {string} params.searchTerm Search term for visitor name, company, or email.
   * @param {number} params.hostId Filter by host ID.
   * @param {number} params.visitPurposeId Filter by visit purpose ID.
   * @param {string} params.department Filter by department.
   * @param {boolean} params.checkedInOnly Show only checked-in visitors.
   * @param {boolean} params.checkedOutOnly Show only checked-out visitors.
   * @param {boolean} params.overdueOnly Show only overdue visitors.
   * @param {number} params.pageIndex Page number (0-based).
   * @param {number} params.pageSize Page size (default 50).
   * @param {string} params.sortBy Sort column.
   * @param {string} params.sortDirection Sort direction ('asc' or 'desc').
   */
  async getComprehensiveReport(params = {}) {
    const response = await apiClient.get(REPORT_ENDPOINTS.COMPREHENSIVE, {
      params
    });

    return response.data?.data ?? response.data;
  },

  /**
   * Exports comprehensive visitor report as CSV.
   * @param {Object} params Same filter parameters as getComprehensiveReport.
   */
  async exportComprehensiveReport(params = {}) {
    const response = await apiClient.get(REPORT_ENDPOINTS.COMPREHENSIVE_EXPORT, {
      params,
      responseType: 'blob'
    });

    downloadFile(response, `visitor-report-${new Date().toISOString()}.csv`);
    return true;
  },

  /**
   * Fetches visitor statistics and analytics for a given time period.
   * @param {Object} params Filter parameters.
   * @param {string} params.startDate Start date (ISO string).
   * @param {string} params.endDate End date (ISO string).
   * @param {number} params.locationId Optional location filter.
   * @param {string} params.groupBy Time grouping ('daily', 'weekly', 'monthly').
   */
  async getStatistics(params = {}) {
    const response = await apiClient.get(REPORT_ENDPOINTS.STATISTICS, {
      params
    });

    return response.data?.data ?? response.data;
  },

  /**
   * Exports visitor statistics report as CSV.
   * @param {Object} params Same filter parameters as getStatistics.
   */
  async exportStatistics(params = {}) {
    const response = await apiClient.get(REPORT_ENDPOINTS.STATISTICS_EXPORT, {
      params,
      responseType: 'blob'
    });

    downloadFile(response, `visitor-statistics-${new Date().toISOString()}.csv`);
    return true;
  }
};

export default reportService;
