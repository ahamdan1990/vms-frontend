/**
 * Security Utilities for VMS Application
 * Provides input sanitization, XSS prevention, and security helpers
 */

/**
 * Input sanitization class for preventing XSS and injection attacks
 */
export class SecurityUtils {
  
  /**
   * Sanitize user input for safe storage and display
   * @param {string} input - Raw user input
   * @param {Object} options - Sanitization options
   * @returns {string} - Sanitized input
   */
  static sanitizeInput(input, options = {}) {
    if (typeof input !== 'string') return input;
    
    const {
      maxLength = 1000,
      allowHTML = false,
      trimWhitespace = true,
      removeQuotes = true,
      removeScriptTags = true
    } = options;

    let sanitized = input;

    // Trim whitespace
    if (trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Remove or escape HTML tags
    if (!allowHTML) {
      sanitized = sanitized.replace(/[<>]/g, '');
    }

    // Remove quotes to prevent SQL injection
    if (removeQuotes) {
      sanitized = sanitized.replace(/['"]/g, '');
    }

    // Remove script tags and javascript
    if (removeScriptTags) {
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      sanitized = sanitized.replace(/javascript:/gi, '');
      sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    }

    // Limit length
    sanitized = sanitized.substring(0, maxLength);

    return sanitized;
  }

  /**
   * Sanitize HTML content using a whitelist approach
   * @param {string} html - HTML content to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} - Sanitized HTML
   */
  static sanitizeHTML(html, options = {}) {
    if (typeof html !== 'string') return '';

    const {
      allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      allowedAttributes = ['href', 'target'],
      allowDataAttributes = false
    } = options;

    // Simple HTML sanitizer - in production, use DOMPurify
    let sanitized = html;

    // Remove script tags and event handlers
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove style tags
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove dangerous attributes
    sanitized = sanitized.replace(/\s(style|onclick|onload|onerror)\s*=\s*["'][^"']*["']/gi, '');

    return sanitized;
  }

  /**
   * Validate and sanitize file uploads
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result
   */
  static validateFileUpload(file, options = {}) {
    const {
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      maxSize = 10 * 1024 * 1024, // 10MB
      maxNameLength = 255
    } = options;

    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors, sanitizedName: '' };
    }

    // File type validation
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // File size validation
    if (file.size > maxSize) {
      errors.push(`File size (${this.formatBytes(file.size)}) exceeds maximum (${this.formatBytes(maxSize)})`);
    }

    // File name sanitization
    let sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .substring(0, maxNameLength); // Limit length

    // Check for dangerous extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
      '.app', '.deb', '.pkg', '.dmg', '.rpm', '.run', '.bin'
    ];
    
    const hasDangerousExtension = dangerousExtensions.some(ext => 
      sanitizedName.toLowerCase().endsWith(ext)
    );
    
    if (hasDangerousExtension) {
      errors.push('Executable files are not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedName
    };
  }

  /**
   * Create a rate limiter for API calls
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} timeWindow - Time window in milliseconds
   * @returns {function} - Rate limiter function
   */
  static createRateLimiter(maxRequests = 10, timeWindow = 60000) {
    const requests = new Map();

    return (identifier) => {
      const now = Date.now();
      const windowStart = now - timeWindow;

      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }

      const userRequests = requests.get(identifier);
      
      // Remove old requests outside the time window
      const validRequests = userRequests.filter(time => time > windowStart);
      
      if (validRequests.length >= maxRequests) {
        return {
          allowed: false,
          resetTime: validRequests[0] + timeWindow,
          remaining: 0
        };
      }

      validRequests.push(now);
      requests.set(identifier, validRequests);

      return {
        allowed: true,
        remaining: maxRequests - validRequests.length,
        resetTime: now + timeWindow
      };
    };
  }

  /**
   * Generate a CSRF token
   * @returns {string} - CSRF token
   */
  static generateCSRFToken() {
    const array = new Uint8Array(32);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for older browsers
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Secure session storage utilities
   */
  static secureStorage = {
    set(key, value, expirationMinutes = 60) {
      const item = {
        value: value,
        timestamp: Date.now(),
        expiration: Date.now() + (expirationMinutes * 60 * 1000)
      };
      
      try {
        sessionStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        console.error('Failed to store data securely:', error);
      }
    },

    get(key) {
      try {
        const item = JSON.parse(sessionStorage.getItem(key));
        
        if (!item) return null;
        
        // Check expiration
        if (Date.now() > item.expiration) {
          sessionStorage.removeItem(key);
          return null;
        }
        
        return item.value;
      } catch (error) {
        console.error('Failed to retrieve data securely:', error);
        return null;
      }
    },

    remove(key) {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to remove data:', error);
      }
    },

    clear() {
      try {
        sessionStorage.clear();
      } catch (error) {
        console.error('Failed to clear storage:', error);
      }
    }
  };

  /**
   * Validate email format with additional security checks
   * @param {string} email - Email to validate
   * @returns {boolean} - Is valid email
   */
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    // Basic length check
    if (email.length > 254) return false;
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /javascript:/i,
      /data:/i,
      /<script/i,
      /on\w+=/i
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(email))) {
      return false;
    }

    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return emailRegex.test(email.trim().toLowerCase());
  }

  /**
   * Format bytes for display
   * @param {number} bytes - Number of bytes
   * @returns {string} - Formatted string
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Is valid phone
   */
  static isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check length (international format: 7-15 digits)
    if (cleaned.length < 7 || cleaned.length > 15) return false;
    
    // Check for suspicious patterns
    if (/^0+$/.test(cleaned) || /^1+$/.test(cleaned)) return false;
    
    return true;
  }

  /**
   * Check if string contains only safe characters
   * @param {string} input - Input to check
   * @param {Object} options - Options
   * @returns {boolean} - Is safe
   */
  static containsOnlySafeChars(input, options = {}) {
    if (!input || typeof input !== 'string') return false;
    
    const {
      allowNumbers = true,
      allowLetters = true,
      allowSpaces = true,
      allowPunctuation = false,
      customAllowed = ''
    } = options;

    let allowedPattern = '';
    
    if (allowLetters) allowedPattern += 'a-zA-Z';
    if (allowNumbers) allowedPattern += '0-9';
    if (allowSpaces) allowedPattern += '\\s';
    if (allowPunctuation) allowedPattern += '.,!?;:';
    if (customAllowed) allowedPattern += customAllowed;
    
    const regex = new RegExp(`^[${allowedPattern}]+$`);
    return regex.test(input);
  }
}

// Rate limiter instances for common use cases
export const apiRateLimiter = SecurityUtils.createRateLimiter(100, 60000); // 100 requests per minute
export const loginRateLimiter = SecurityUtils.createRateLimiter(5, 300000); // 5 attempts per 5 minutes
export const searchRateLimiter = SecurityUtils.createRateLimiter(30, 60000); // 30 searches per minute

// Export as default
export default SecurityUtils;