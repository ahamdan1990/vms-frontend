/**
 * Utility functions for safe error message extraction
 * Prevents React errors when rendering error objects
 */

/**
 * Safely extracts error message from various error formats
 * @param {any} error - Error object, string, or array
 * @returns {string} - Safe error message string
 */
export const extractErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    // Check for details.errors array (backend API format)
    if (error.details && error.details.errors && Array.isArray(error.details.errors)) {
      if (error.details.errors.length > 0) {
        return error.details.errors[0]; // Return first error message
      }
    }

    // Check for originalError with details
    if (error.originalError && error.originalError.details && error.originalError.details.errors) {
      if (Array.isArray(error.originalError.details.errors) && error.originalError.details.errors.length > 0) {
        return error.originalError.details.errors[0];
      }
    }

    // Check for common error object properties
    if (error.message) {
      return error.message;
    }
    if (error.error) {
      return error.error;
    }
    if (error.detail) {
      return error.detail;
    }
    // If it's an error object without message, stringify it safely
    return JSON.stringify(error);
  }

  return 'An unknown error occurred';
};

/**
 * Safely extracts error messages from an array of errors
 * @param {array} errors - Array of errors
 * @returns {string[]} - Array of safe error message strings
 */
export const extractErrorMessages = (errors) => {
  if (!Array.isArray(errors)) {
    return [extractErrorMessage(errors)];
  }
  
  return errors.map(extractErrorMessage);
};

/**
 * Component helper for rendering error messages safely
 * @param {any} error - Error to render
 * @param {number} index - Index for key prop
 * @returns {React.Node} - Safe error display
 */
export const renderErrorMessage = (error, index) => (
  <li key={index}>
    {extractErrorMessage(error)}
  </li>
);

export default {
  extractErrorMessage,
  extractErrorMessages,
  renderErrorMessage
};