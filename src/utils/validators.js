/**
 * Form validation utilities for consistent validation across the application
 * Provides validators for common input types and custom validation rules
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

// Phone number validation
export const isValidPhone = (phone, format = 'US') => {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, '');
  
  switch (format) {
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

export const requiredPhone = combineValidators(
  createValidator(isRequired, 'Phone number is required'),
  createValidator(isValidPhone, 'Please enter a valid phone number')
);

// User-specific validators
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

  // Phone validation (optional)
  if (userData.phoneNumber && !isValidPhone(userData.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid phone number';
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