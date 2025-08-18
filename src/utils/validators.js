/**
 * Form validation utilities for consistent validation across the application
 * Provides validators for common input types and custom validation rules
 * Enhanced with Lebanon-specific phone number validation
 */

// Basic validation functions
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
};

export const hasMinLength = (value, minLength) => {
  if (!value) return false;
  return String(value).length >= minLength;
};

export const hasMaxLength = (value, maxLength) => {
  if (!value) return true; // Allow empty if not required
  return String(value).length <= maxLength;
};

export const hasExactLength = (value, length) => {
  if (!value) return false;
  return String(value).length === length;
};

export const isInRange = (value, min, max) => {
  const num = Number(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
};

// Email validation
export const isValidEmail = (email) => {
  if (!email) return false;
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email.trim().toLowerCase());
};

export const isValidEmailDomain = (email, allowedDomains = []) => {
  if (!isValidEmail(email)) return false;
  if (allowedDomains.length === 0) return true;
  
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.some(allowedDomain => 
    domain === allowedDomain.toLowerCase()
  );
};

// Password validation
export const validatePassword = (password, requirements = {}) => {
  const {
    minLength = 8,
    maxLength = 128,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
    allowSpaces = false,
    forbiddenPatterns = []
  } = requirements;

  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  // Length validation
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (password.length > maxLength) {
    errors.push(`Password must be no more than ${maxLength} characters long`);
  }

  // Character requirements
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (!allowSpaces && /\s/.test(password)) {
    errors.push('Password cannot contain spaces');
  }

  // Forbidden patterns
  forbiddenPatterns.forEach(pattern => {
    if (password.toLowerCase().includes(pattern.toLowerCase())) {
      errors.push(`Password cannot contain "${pattern}"`);
    }
  });

  // Common weak password patterns
  const weakPatterns = [
    /(.)\1{2,}/, // Repeated characters (aaa, 111)
    /123456789/, // Sequential numbers
    /abcdefgh/, // Sequential letters
    /qwertyui/ // Keyboard patterns
  ];

  weakPatterns.forEach(pattern => {
    if (pattern.test(password.toLowerCase())) {
      errors.push('Password contains a common weak pattern');
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

export const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Length bonus
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  // Additional complexity
  if (/[^\w\s]/.test(password)) score += 1; // Non-alphanumeric
  if (password.length > 20) score += 1;
  
  return Math.min(score, 5); // Max score of 5
};

export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

// Enhanced phone number validation with Lebanon support
export const isValidPhone = (phone, countryCode = 'US') => {
  if (!phone) return false;
  
  if (countryCode === '961' || countryCode === 'LB' || countryCode === 'Lebanon') {
    return validateLebanesePhoneNumber(phone, '961');
  }
  
  const cleaned = phone.replace(/\D/g, '');
  
  switch (countryCode) {
    case 'US':
      // US: 10 digits or 11 digits starting with 1
      return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
    
    case 'international':
      // International: 7-15 digits
      return cleaned.length >= 7 && cleaned.length <= 15;
    
    default:
      return cleaned.length >= 7 && cleaned.length <= 15;
  }
};

/**
 * Validates Lebanese phone numbers according to Lebanese numbering plan
 * @param {string} phoneNumber - The phone number to validate
 * @param {string} countryCode - The country code (961 for Lebanon)
 * @returns {boolean} - True if valid Lebanese phone number
 */
export const validateLebanesePhoneNumber = (phoneNumber, countryCode = '961') => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  // Clean the phone number - remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // If empty after cleaning, invalid
  if (!cleanNumber) {
    return false;
  }

  // Lebanese phone number validation based on country code
  if (countryCode === '961') {
    // Lebanon-specific validation
    return validateLebaneseNumber(cleanNumber);
  } else {
    // For other countries, use a more generic validation
    return validateInternationalNumber(cleanNumber, countryCode);
  }
};

/**
 * Validates Lebanese phone numbers (country code 961)
 * Lebanese format: National Significant Number (NSN) is 8 digits
 * Mobile prefixes: 03, 70, 71, 76, 78, 79, 81
 * Landline prefixes: 01, 04, 05, 06, 07, 08, 09
 */
const validateLebaneseNumber = (cleanNumber) => {
  // Lebanese phone number patterns
  const lebanesePatterns = [
    // National format (8 digits starting with 0)
    /^0([1-9]|70|71|76|78|79|81)\d{6}$/,
    
    // International format without country code (7-8 digits)
    /^([1-9]|70|71|76|78|79|81)\d{6}$/,
    
    // With country code 961 (11-12 digits total)
    /^961([1-9]|70|71|76|78|79|81)\d{6}$/
  ];

  // Test against Lebanese patterns
  for (const pattern of lebanesePatterns) {
    if (pattern.test(cleanNumber)) {
      return true;
    }
  }

  // More comprehensive Lebanese regex that handles all valid formats
  // This regex covers all Lebanese mobile and landline prefixes
  const comprehensiveLebaneseRegex = /^((\+?961|961|0)?([1-9]|03|70|71|76|78|79|81)\d{6})$/;
  
  return comprehensiveLebaneseRegex.test(cleanNumber);
};

/**
 * Generic international phone number validation for non-Lebanese numbers
 */
const validateInternationalNumber = (cleanNumber, countryCode) => {
  // Remove country code if present
  const numberWithoutCountryCode = cleanNumber.startsWith(countryCode) 
    ? cleanNumber.substring(countryCode.length) 
    : cleanNumber;

  // Basic international validation - between 6 and 15 digits
  return /^\d{6,15}$/.test(numberWithoutCountryCode);
};

/**
 * Formats a Lebanese phone number for display
 * @param {string} phoneNumber - Raw phone number
 * @param {string} countryCode - Country code
 * @param {string} format - 'national' or 'international'
 * @returns {string} - Formatted phone number
 */
export const formatLebanesePhoneNumber = (phoneNumber, countryCode = '961', format = 'national') => {
  if (!phoneNumber) return '';

  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (countryCode === '961' && cleanNumber) {
    // Handle Lebanese numbers
    let nationalNumber = cleanNumber;
    
    // Remove country code if present
    if (nationalNumber.startsWith('961')) {
      nationalNumber = nationalNumber.substring(3);
    }
    
    // Add leading zero if not present for national format
    if (!nationalNumber.startsWith('0') && format === 'national') {
      nationalNumber = '0' + nationalNumber;
    }
    
    // Remove leading zero for international format
    if (nationalNumber.startsWith('0') && format === 'international') {
      nationalNumber = nationalNumber.substring(1);
    }

    if (format === 'international') {
      // Format as +961 XX XXX XXX
      if (nationalNumber.length >= 7) {
        const areaCode = nationalNumber.substring(0, 2);
        const number = nationalNumber.substring(2);
        return `+961 ${areaCode} ${number.substring(0, 3)} ${number.substring(3)}`;
      }
      return `+961 ${nationalNumber}`;
    } else {
      // Format as 0XX XXX XXX
      if (nationalNumber.length === 8) {
        const areaCode = nationalNumber.substring(0, 3);
        const number = nationalNumber.substring(3);
        return `${areaCode} ${number.substring(0, 3)} ${number.substring(3)}`;
      }
      return nationalNumber;
    }
  }
  
  return phoneNumber; // Return as-is for non-Lebanese numbers
};

// URL validation
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidHttpUrl = (url) => {
  if (!isValidUrl(url)) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Date validation
export const isValidDate = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

export const isDateInRange = (date, minDate, maxDate) => {
  if (!isValidDate(date)) return false;
  
  const dateObj = new Date(date);
  
  if (minDate && dateObj < new Date(minDate)) return false;
  if (maxDate && dateObj > new Date(maxDate)) return false;
  
  return true;
};

export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false;
  return new Date(date) > new Date();
};

export const isPastDate = (date) => {
  if (!isValidDate(date)) return false;
  return new Date(date) < new Date();
};

export const isToday = (date) => {
  if (!isValidDate(date)) return false;
  
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.toDateString() === checkDate.toDateString();
};

// Number validation
export const isValidNumber = (value) => {
  return !isNaN(Number(value)) && isFinite(Number(value));
};

export const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

export const isPositive = (value) => {
  return isValidNumber(value) && Number(value) > 0;
};

export const isNonNegative = (value) => {
  return isValidNumber(value) && Number(value) >= 0;
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
    minWidth = null,
    minHeight = null,
    maxWidth = null,
    maxHeight = null
  } = options;

  const errors = [];

  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }

  // Size validation
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${formatBytes(maxSize)}`);
  }

  // Type validation
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Extension validation
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }
  }

  return { isValid: errors.length === 0, errors };
};

// Helper function for file size formatting
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Custom validation rules
export const createValidator = (validatorFn, errorMessage) => {
  return (value) => {
    const isValid = validatorFn(value);
    return {
      isValid,
      error: isValid ? null : errorMessage
    };
  };
};

export const combineValidators = (...validators) => {
  return (value) => {
    const errors = [];
    
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        errors.push(result.error);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
};

// Common validator combinations
export const requiredEmail = combineValidators(
  createValidator(isRequired, 'Email is required'),
  createValidator(isValidEmail, 'Please enter a valid email address')
);

export const requiredPassword = (requirements = {}) => 
  combineValidators(
    createValidator(isRequired, 'Password is required'),
    createValidator(
      (value) => validatePassword(value, requirements).isValid,
      'Password does not meet requirements'
    )
  );

export const requiredPhone = (countryCode = 'US') => combineValidators(
  createValidator(isRequired, 'Phone number is required'),
  createValidator(
    (value) => isValidPhone(value, countryCode), 
    'Please enter a valid phone number'
  )
);

// Enhanced user-specific validators with Lebanese phone support
export const validateUserData = (userData, isUpdate = false) => {
  const errors = {};

  // First name validation
  if (!isUpdate || userData.hasOwnProperty('firstName')) {
    if (!isRequired(userData.firstName)) {
      errors.firstName = 'First name is required';
    } else if (!hasMaxLength(userData.firstName, 50)) {
      errors.firstName = 'First name cannot exceed 50 characters';
    }
  }

  // Last name validation
  if (!isUpdate || userData.hasOwnProperty('lastName')) {
    if (!isRequired(userData.lastName)) {
      errors.lastName = 'Last name is required';
    } else if (!hasMaxLength(userData.lastName, 50)) {
      errors.lastName = 'Last name cannot exceed 50 characters';
    }
  }

  // Email validation
  if (!isUpdate || userData.hasOwnProperty('email')) {
    if (!isRequired(userData.email)) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(userData.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (!hasMaxLength(userData.email, 255)) {
      errors.email = 'Email cannot exceed 255 characters';
    }
  }

  // Enhanced phone validation with Lebanese support
  if (userData.phoneNumber) {
    const countryCode = userData.phoneCountryCode || '961'; // Default to Lebanon
    const isValidLebanesePhone = validateLebanesePhoneNumber(userData.phoneNumber, countryCode);
    
    if (countryCode === '961') {
      if (!isValidLebanesePhone) {
        errors.phoneNumber = 'Please enter a valid Lebanese phone number';
      }
    } else {
      // For other countries, use general phone validation
      if (!isValidPhone(userData.phoneNumber, countryCode)) {
        errors.phoneNumber = 'Please enter a valid phone number';
      }
    }
  }

  // Role validation
  if (!isUpdate || userData.hasOwnProperty('role')) {
    const validRoles = ['Staff', 'Operator', 'Administrator'];
    if (!isRequired(userData.role)) {
      errors.role = 'Role is required';
    } else if (!validRoles.includes(userData.role)) {
      errors.role = 'Please select a valid role';
    }
  }

  // Department validation (optional)
  if (userData.department && !hasMaxLength(userData.department, 100)) {
    errors.department = 'Department cannot exceed 100 characters';
  }

  // Job title validation (optional)
  if (userData.jobTitle && !hasMaxLength(userData.jobTitle, 100)) {
    errors.jobTitle = 'Job title cannot exceed 100 characters';
  }

  // Employee ID validation (optional)
  if (userData.employeeId && !hasMaxLength(userData.employeeId, 50)) {
    errors.employeeId = 'Employee ID cannot exceed 50 characters';
  }

  // Address validation
  if (userData.street1 && !hasMaxLength(userData.street1, 100)) {
    errors.street1 = 'Street address cannot exceed 100 characters';
  }
  if (userData.street2 && !hasMaxLength(userData.street2, 100)) {
    errors.street2 = 'Street address line 2 cannot exceed 100 characters';
  }
  if (userData.city && !hasMaxLength(userData.city, 50)) {
    errors.city = 'City cannot exceed 50 characters';
  }
  if (userData.state && !hasMaxLength(userData.state, 50)) {
    errors.state = 'State cannot exceed 50 characters';
  }
  if (userData.governorate && !hasMaxLength(userData.governorate, 50)) {
    errors.governorate = 'Governorate cannot exceed 50 characters';
  }
  if (userData.postalCode && !hasMaxLength(userData.postalCode, 20)) {
    errors.postalCode = 'Postal code cannot exceed 20 characters';
  }
  if (userData.country && !hasMaxLength(userData.country, 50)) {
    errors.country = 'Country cannot exceed 50 characters';
  }

  // Coordinate validation
  if (userData.latitude !== null && userData.latitude !== undefined && userData.latitude !== '') {
    const lat = parseFloat(userData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = 'Latitude must be between -90 and 90 degrees';
    }
  }
  if (userData.longitude !== null && userData.longitude !== undefined && userData.longitude !== '') {
    const lng = parseFloat(userData.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = 'Longitude must be between -180 and 180 degrees';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Login validation
export const validateLoginData = (loginData) => {
  const errors = {};

  if (!isRequired(loginData.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(loginData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isRequired(loginData.password)) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Password change validation
export const validatePasswordChange = (passwordData) => {
  const errors = {};

  if (!isRequired(passwordData.currentPassword)) {
    errors.currentPassword = 'Current password is required';
  }

  const passwordValidation = validatePassword(passwordData.newPassword);
  if (!passwordValidation.isValid) {
    errors.newPassword = passwordValidation.errors[0];
  }

  if (!passwordsMatch(passwordData.newPassword, passwordData.confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (passwordData.currentPassword === passwordData.newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Export validator collections
export const commonValidators = {
  required: createValidator(isRequired, 'This field is required'),
  email: createValidator(isValidEmail, 'Please enter a valid email address'),
  phone: createValidator(isValidPhone, 'Please enter a valid phone number'),
  lebanesePhone: createValidator(
    (value) => validateLebanesePhoneNumber(value, '961'), 
    'Please enter a valid Lebanese phone number'
  ),
  url: createValidator(isValidUrl, 'Please enter a valid URL'),
  number: createValidator(isValidNumber, 'Please enter a valid number'),
  integer: createValidator(isInteger, 'Please enter a whole number'),
  positive: createValidator(isPositive, 'Please enter a positive number'),
  date: createValidator(isValidDate, 'Please enter a valid date')
};

export const stringValidators = {
  minLength: (min) => createValidator(
    (value) => hasMinLength(value, min),
    `Must be at least ${min} characters long`
  ),
  maxLength: (max) => createValidator(
    (value) => hasMaxLength(value, max),
    `Cannot exceed ${max} characters`
  ),
  exactLength: (length) => createValidator(
    (value) => hasExactLength(value, length),
    `Must be exactly ${length} characters long`
  )
};

export const numberValidators = {
  min: (min) => createValidator(
    (value) => isValidNumber(value) && Number(value) >= min,
    `Must be at least ${min}`
  ),
  max: (max) => createValidator(
    (value) => isValidNumber(value) && Number(value) <= max,
    `Cannot exceed ${max}`
  ),
  range: (min, max) => createValidator(
    (value) => isInRange(value, min, max),
    `Must be between ${min} and ${max}`
  )
};

// Default export
export default {
  // Basic validators
  isRequired,
  hasMinLength,
  hasMaxLength,
  hasExactLength,
  isInRange,

  // Type-specific validators
  isValidEmail,
  isValidEmailDomain,
  validatePassword,
  calculatePasswordStrength,
  passwordsMatch,
  isValidPhone,
  validateLebanesePhoneNumber,
  formatLebanesePhoneNumber,
  isValidUrl,
  isValidHttpUrl,
  isValidDate,
  isDateInRange,
  isFutureDate,
  isPastDate,
  isToday,
  isValidNumber,
  isInteger,
  isPositive,
  isNonNegative,
  validateFile,

  // Validation helpers
  createValidator,
  combineValidators,

  // Pre-built validators
  requiredEmail,
  requiredPassword,
  requiredPhone,

  // Domain-specific validators
  validateUserData,
  validateLoginData,
  validatePasswordChange,

  // Validator collections
  commonValidators,
  stringValidators,
  numberValidators
};