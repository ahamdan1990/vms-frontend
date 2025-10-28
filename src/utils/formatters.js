/**
 * Data formatting utilities for consistent data presentation
 * Handles formatting of dates, numbers, text, and other data types
 */

// Date formatting functions
export const formatDate = (date, format = 'MM/dd/yyyy') => {
  if (!date) return '';

  try {
    // Parse the date string
    let dateObj;

    if (typeof date === 'string') {
      // If the date string has 'Z' at the end, it's UTC and JavaScript will handle it correctly
      // If it doesn't have timezone info, JavaScript may interpret it as UTC (depending on format)
      // For ISO strings without 'Z' (like "2024-10-28T10:00:00"), we need to treat them as local time
      if (!date.includes('Z') && !date.match(/[+-]\d{2}:\d{2}$/)) {
        // No timezone indicator - the API is sending local time
        // Replace 'T' with space to force local interpretation, or parse manually
        const parts = date.split(/[T ]/);
        if (parts.length >= 2) {
          const [datePart, timePart] = parts;
          const [year, month, day] = datePart.split('-').map(Number);
          const [hour, minute, second = 0] = (timePart || '00:00:00').split(':').map(Number);
          // Create date using local timezone
          dateObj = new Date(year, month - 1, day, hour, minute, second);
        } else {
          dateObj = new Date(date);
        }
      } else {
        // Has timezone info or is just a date - let JavaScript handle it
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) return '';

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    // 12-hour format helpers
    const hours12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';

    const formatMap = {
      'MM/dd/yyyy': `${month}/${day}/${year}`,
      'dd/MM/yyyy': `${day}/${month}/${year}`,
      'yyyy-MM-dd': `${year}-${month}-${day}`,
      'MMMM dd, yyyy': dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      'MMM dd, yyyy': dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      'h:mm a': `${hours12}:${minutes} ${ampm}`,
      'HH:mm': `${String(hours).padStart(2, '0')}:${minutes}`,
      'MM/dd/yyyy h:mm a': `${month}/${day}/${year} ${hours12}:${minutes} ${ampm}`,
      'yyyy-MM-dd HH:mm:ss': `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes}:${seconds}`,
      'relative': formatRelativeTime(dateObj)
    };

    return formatMap[format] || formatMap['MM/dd/yyyy'];
  } catch (error) {
    console.warn('Date formatting error:', error);
    return '';
  }
};

export const formatTime = (date, format = 'h:mm a') => {
  if (!date) return '';
  return formatDate(date, format);
};

export const formatDateTime = (date, format = 'MM/dd/yyyy h:mm a') => {
  if (!date) return '';
  return formatDate(date, format);
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  } catch (error) {
    console.warn('Relative time formatting error:', error);
    return '';
  }
};

// Number formatting functions
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined || isNaN(number)) return '';
  
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true,
    locale = 'en-US'
  } = options;
  
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping
    }).format(number);
  } catch (error) {
    console.warn('Number formatting error:', error);
    return String(number);
  }
};

export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    console.warn('Currency formatting error:', error);
    return `${currency} ${formatNumber(amount)}`;
  }
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  } catch (error) {
    console.warn('Percentage formatting error:', error);
    return `${formatNumber(value, { maximumFractionDigits: decimals })}%`;
  }
};

export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

// Text formatting functions
export const formatName = (firstName, lastName, format = 'full') => {
  if (!firstName && !lastName) return '';
  
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  
  switch (format) {
    case 'full':
      return `${first} ${last}`.trim();
    case 'last-first':
      return last ? `${last}, ${first}` : first;
    case 'initials':
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    case 'first-initial':
      return last ? `${first} ${last.charAt(0)}.` : first;
    case 'first':
      return first;
    case 'last':
      return last;
    default:
      return `${first} ${last}`.trim();
  }
};

export const formatInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3); // Maximum 3 initials
};

export const formatPhone = (phoneNumber, format = 'US') => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (format === 'US') {
    // US format: (555) 123-4567
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.charAt(0) === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
  }
  
  // International format or fallback
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
  }
  
  return phoneNumber; // Return as-is if can't format
};

export const formatEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength - suffix.length) + suffix;
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const camelToTitle = (camelCase) => {
  if (!camelCase) return '';
  
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

// Status and state formatting
export const formatStatus = (status, statusMap = {}) => {
  if (!status) return '';
  
  // Default status formatting
  const defaultMap = {
    active: { text: 'Active', color: 'success' },
    inactive: { text: 'Inactive', color: 'secondary' },
    pending: { text: 'Pending', color: 'warning' },
    approved: { text: 'Approved', color: 'success' },
    rejected: { text: 'Rejected', color: 'danger' },
    cancelled: { text: 'Cancelled', color: 'secondary' },
    expired: { text: 'Expired', color: 'warning' },
    completed: { text: 'Completed', color: 'info' },
    draft: { text: 'Draft', color: 'secondary' },
    locked: { text: 'Locked', color: 'danger' }
  };
  
  const finalMap = { ...defaultMap, ...statusMap };
  const statusLower = status.toLowerCase();
  
  return finalMap[statusLower] || { 
    text: capitalizeFirst(status), 
    color: 'secondary' 
  };
};

export const formatRole = (role) => {
  const roleMap = {
    'Staff': { text: 'Staff Member', color: 'success', icon: 'user' },
    'Operator': { text: 'Front Desk Operator', color: 'info', icon: 'clipboard-check' },
    'Administrator': { text: 'System Administrator', color: 'danger', icon: 'shield-check' }
  };
  
  return roleMap[role] || { 
    text: role || 'Unknown', 
    color: 'secondary', 
    icon: 'user' 
  };
};

// Address formatting
export const formatAddress = (address, format = 'full') => {
  if (!address) return '';
  
  const {
    street,
    street2,
    city,
    state,
    zipCode,
    country
  } = address;
  
  switch (format) {
    case 'full':
      const parts = [
        street,
        street2,
        [city, state].filter(Boolean).join(', '),
        zipCode,
        country !== 'US' ? country : null
      ].filter(Boolean);
      return parts.join(', ');
      
    case 'short':
      return [city, state].filter(Boolean).join(', ');
      
    case 'city-state':
      return [city, state].filter(Boolean).join(', ');
      
    case 'zip':
      return zipCode || '';
      
    default:
      return formatAddress(address, 'full');
  }
};

// Array and list formatting
export const formatList = (items, options = {}) => {
  if (!Array.isArray(items) || items.length === 0) return '';
  
  const {
    conjunction = 'and',
    limit = null,
    suffix = 'others'
  } = options;
  
  let displayItems = items;
  let hasMore = false;
  
  if (limit && items.length > limit) {
    displayItems = items.slice(0, limit);
    hasMore = true;
  }
  
  if (displayItems.length === 1) {
    return displayItems[0];
  }
  
  if (displayItems.length === 2) {
    const result = `${displayItems[0]} ${conjunction} ${displayItems[1]}`;
    return hasMore ? `${result} ${conjunction} ${items.length - limit} ${suffix}` : result;
  }
  
  const lastItem = displayItems.pop();
  const result = `${displayItems.join(', ')}, ${conjunction} ${lastItem}`;
  
  return hasMore ? `${result} ${conjunction} ${items.length - limit} ${suffix}` : result;
};

// ID and code formatting
export const formatId = (id, prefix = '') => {
  if (!id) return '';
  
  if (prefix) {
    return `${prefix}-${String(id).padStart(6, '0')}`;
  }
  
  return String(id);
};

export const formatBadgeNumber = (number) => {
  if (!number) return '';
  return `#${String(number).padStart(4, '0')}`;
};

// Special formatting functions
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }
  
  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
};

export const formatFileSize = formatBytes; // Alias for consistency

export const formatVersion = (version) => {
  if (!version) return '';
  
  // Ensure version starts with 'v'
  return version.startsWith('v') ? version : `v${version}`;
};

// Validation and sanitization
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  // Basic HTML sanitization (remove script tags and event handlers)
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s*on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
};

// Export formatter collections for specific domains
export const userFormatters = {
  name: formatName,
  initials: formatInitials,
  email: formatEmail,
  phone: formatPhone,
  role: formatRole,
  status: formatStatus
};

export const dateFormatters = {
  date: formatDate,
  time: formatTime,
  dateTime: formatDateTime,
  relative: formatRelativeTime
};

export const numberFormatters = {
  number: formatNumber,
  currency: formatCurrency,
  percentage: formatPercentage,
  bytes: formatBytes,
  duration: formatDuration
};

export const textFormatters = {
  truncate: truncateText,
  capitalize: capitalizeFirst,
  capitalizeWords: capitalizeWords,
  camelToTitle: camelToTitle,
  sanitize: sanitizeHtml
};

// Default export with all formatters
export default {
  // Date/Time
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  
  // Numbers
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatBytes,
  formatDuration,
  
  // Text
  formatName,
  formatInitials,
  formatPhone,
  formatEmail,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  camelToTitle,
  
  // Status/State
  formatStatus,
  formatRole,
  formatAddress,
  formatList,
  formatId,
  formatBadgeNumber,
  formatVersion,
  
  // Utilities
  sanitizeHtml,
  
  // Collections
  userFormatters,
  dateFormatters,
  numberFormatters,
  textFormatters
};