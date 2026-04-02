// src/services/importUsersService.js
import apiClient, { extractApiData } from './apiClient';
import { USER_ENDPOINTS } from './apiEndpoints';

/**
 * Service for all user import operations.
 * All file uploads go to the backend for parsing and validation —
 * no client-side Excel parsing is required.
 */
const importUsersService = {

  /**
   * Downloads the blank import template.
   * GET /api/Users/import/template?format=xlsx|csv
   */
  async downloadTemplate(format = 'xlsx') {
    const response = await apiClient.get(USER_ENDPOINTS.IMPORT_TEMPLATE(format), {
      responseType: 'blob',
    });

    const mimeType = format === 'csv'
      ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `import-users-template.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  },

  /**
   * Validates an uploaded file without creating any users (dry-run).
   * POST /api/Users/import/validate
   * @param {File} file - The .xlsx or .csv file
   * @returns {Promise<ImportValidationResult>}
   */
  async validateFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(USER_ENDPOINTS.IMPORT_VALIDATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60 s for large files
    });

    return extractApiData(response);
  },

  /**
   * Batch-checks which emails / employeeIds already exist in the DB.
   * POST /api/Users/check-duplicates
   * @param {string[]} emails
   * @param {string[]} employeeIds
   */
  async checkDuplicates(emails, employeeIds) {
    const response = await apiClient.post(USER_ENDPOINTS.CHECK_DUPLICATES, {
      emails: emails ?? [],
      employeeIds: employeeIds ?? [],
    });
    return extractApiData(response);
  },

  /**
   * Executes the import.
   * POST /api/Users/import?skipInvalidRows=true&dryRun=false
   * @param {File} file
   * @param {object} options
   * @param {boolean} options.skipInvalidRows - Default true
   * @param {boolean} options.dryRun         - Default false
   */
  async importUsers(file, { skipInvalidRows = true, dryRun = false } = {}) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${USER_ENDPOINTS.IMPORT}?skipInvalidRows=${skipInvalidRows}&dryRun=${dryRun}`;

    const response = await apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 120 s for up to 500 rows + welcome emails
    });

    return extractApiData(response);
  },

  /**
   * Generates an error-report CSV from the import result rows.
   * All processing is client-side — no extra API call needed.
   * The result is triggered as a browser download.
   *
   * @param {Array} rowResults - Array of ImportUserRowResultDto from the backend
   * @param {string} originalFileName - Used to name the report file
   */
  downloadErrorReport(rowResults, originalFileName = 'import') {
    const headers = [
      'RowNumber', 'Email', 'FirstName', 'LastName', 'Role',
      'ImportStatus', 'ErrorMessage', 'FieldErrors'
    ];

    const escape = (val) => {
      if (val == null) return '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str}"`
        : str;
    };

    const lines = [
      headers.join(','),
      ...rowResults.map(r => [
        escape(r.rowNumber),
        escape(r.email),
        escape(r.firstName),
        escape(r.lastName),
        escape(r.role),
        escape(r.status),
        escape(r.errorMessage),
        escape(r.fieldErrors?.map(fe => `${fe.columnName}: ${fe.message}`).join('; ') ?? ''),
      ].join(','))
    ];

    const csv = lines.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel compatibility
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${originalFileName}-error-report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Client-side file guard before upload.
   * Catches obvious mistakes before sending to the server.
   */
  validateFileLocally(file) {
    const errors = [];

    if (!file) {
      errors.push('No file selected.');
      return { isValid: false, errors };
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      errors.push(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.csv')) {
      errors.push('Only .xlsx and .csv files are supported.');
    }

    return { isValid: errors.length === 0, errors };
  },
};

export default importUsersService;
