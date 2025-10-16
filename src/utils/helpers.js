/**
 * General helper functions and utilities
 * Common utilities that don't fit into specific categories
 */

// Object manipulation utilities
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

export const deepMerge = (target, source) => {
  const result = deepClone(target);
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
};

export const omit = (obj, keys) => {
  const keysToOmit = Array.isArray(keys) ? keys : [keys];
  const result = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !keysToOmit.includes(key)) {
      result[key] = obj[key];
    }
  }
  
  return result;
};

export const pick = (obj, keys) => {
  const keysToPick = Array.isArray(keys) ? keys : [keys];
  const result = {};
  
  keysToPick.forEach(key => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  });
  
  return result;
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const isEqual = (a, b) => {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => isEqual(a[key], b[key]));
  }
  
  return false;
};

export const get = (obj, path, defaultValue = undefined) => {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || !result.hasOwnProperty(key)) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result;
};

export const set = (obj, path, value) => {
  const keys = Array.isArray(path) ? path : path.split('.');
  const result = deepClone(obj);
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
};

// Array utilities
export const unique = (array, keyOrFn) => {
  if (!Array.isArray(array)) return [];
  
  if (!keyOrFn) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  const result = [];
  
  for (const item of array) {
    const key = typeof keyOrFn === 'function' ? keyOrFn(item) : item[keyOrFn];
    
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  
  return result;
};

export const groupBy = (array, keyOrFn) => {
  if (!Array.isArray(array)) return {};
  
  return array.reduce((groups, item) => {
    const key = typeof keyOrFn === 'function' ? keyOrFn(item) : item[keyOrFn];
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, keyOrFn, descending = false) => {
  if (!Array.isArray(array)) return [];
  
  const sorted = [...array].sort((a, b) => {
    const aValue = typeof keyOrFn === 'function' ? keyOrFn(a) : a[keyOrFn];
    const bValue = typeof keyOrFn === 'function' ? keyOrFn(b) : b[keyOrFn];
    
    if (aValue < bValue) return descending ? 1 : -1;
    if (aValue > bValue) return descending ? -1 : 1;
    return 0;
  });
  
  return sorted;
};

export const chunk = (array, size) => {
  if (!Array.isArray(array) || size <= 0) return [];
  
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
};

export const flatten = (array, depth = 1) => {
  if (!Array.isArray(array)) return [];
  
  return array.reduce((acc, val) => {
    if (Array.isArray(val) && depth > 0) {
      acc.push(...flatten(val, depth - 1));
    } else {
      acc.push(val);
    }
    return acc;
  }, []);
};

export const intersection = (array1, array2) => {
  if (!Array.isArray(array1) || !Array.isArray(array2)) return [];
  
  return array1.filter(item => array2.includes(item));
};

export const difference = (array1, array2) => {
  if (!Array.isArray(array1) || !Array.isArray(array2)) return array1 || [];
  
  return array1.filter(item => !array2.includes(item));
};

// String utilities
export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const randomString = (length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

export const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const highlight = (text, query, className = 'highlight') => {
  if (!text || !query) return text;
  
  const escapedQuery = escapeRegex(query);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  
  return text.replace(regex, `<span class="${className}">$1</span>`);
};

// Number utilities
export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomFloat = (min, max, decimals = 2) => {
  const random = Math.random() * (max - min) + min;
  return parseFloat(random.toFixed(decimals));
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const round = (value, decimals = 0) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const sum = (numbers) => {
  return numbers.reduce((total, num) => total + (Number(num) || 0), 0);
};

export const average = (numbers) => {
  if (!numbers.length) return 0;
  return sum(numbers) / numbers.length;
};

export const median = (numbers) => {
  if (!numbers.length) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

// Function utilities
export const debounce = (func, delay) => {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const memoize = (func, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return function (...args) {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
};

export const once = (func) => {
  let called = false;
  let result;
  
  return function (...args) {
    if (!called) {
      called = true;
      result = func.apply(this, args);
    }
    return result;
  };
};

export const retry = async (func, maxAttempts = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await func();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

// Type checking utilities
export const getType = (value) => {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

export const isString = (value) => typeof value === 'string';
export const isNumber = (value) => typeof value === 'number' && !isNaN(value);
export const isBoolean = (value) => typeof value === 'boolean';
export const isFunction = (value) => typeof value === 'function';
export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export const isArray = (value) => Array.isArray(value);
export const isDate = (value) => value instanceof Date;
export const isNull = (value) => value === null;
export const isUndefined = (value) => value === undefined;
export const isNil = (value) => value === null || value === undefined;

// URL utilities
export const buildUrl = (baseUrl, path = '', params = {}) => {
  let url = baseUrl;
  
  if (path) {
    url = url.endsWith('/') ? url + path : url + '/' + path;
  }
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

export const parseQuery = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
};

export const updateUrlParams = (params) => {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  
  window.history.replaceState({}, '', url);
};

// Environment utilities
export const isBrowser = () => typeof window !== 'undefined';
export const isNode = () => typeof process !== 'undefined' && process.versions && process.versions.node;
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isTest = () => process.env.NODE_ENV === 'test';

// Device detection utilities
export const isMobile = () => {
  if (!isBrowser()) return false;
  return window.innerWidth <= 768;
};

export const isTablet = () => {
  if (!isBrowser()) return false;
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isDesktop = () => {
  if (!isBrowser()) return false;
  return window.innerWidth > 1024;
};

export const getTouchSupport = () => {
  if (!isBrowser()) return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Color utilities
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const getContrastColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// File utilities
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getFileName = (filename) => {
  if (!filename) return '';
  return filename.split('.').slice(0, -1).join('.');
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Performance utilities
export const measureTime = async (func, label = 'Operation') => {
  const start = performance.now();
  const result = await func();
  const end = performance.now();
  
  console.log(`${label} took ${end - start} milliseconds`);
  return result;
};

export const createLazyFunction = (fn) => {
  let result;
  let executed = false;
  
  return () => {
    if (!executed) {
      result = fn();
      executed = true;
    }
    return result;
  };
};

// Error handling utilities
export const createError = (message, code, details = {}) => {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  error.timestamp = new Date().toISOString();
  return error;
};

export const isErrorOfType = (error, type) => {
  return error && error.code === type;
};

// Export collections and default
export const objectUtils = {
  deepClone,
  deepMerge,
  omit,
  pick,
  isEmpty,
  isEqual,
  get,
  set
};

export const arrayUtils = {
  unique,
  groupBy,
  sortBy,
  chunk,
  flatten,
  intersection,
  difference
};

export const stringUtils = {
  slugify,
  randomString,
  generateId,
  escapeRegex,
  highlight
};

export const numberUtils = {
  randomInt,
  randomFloat,
  clamp,
  round,
  sum,
  average,
  median
};

export const functionUtils = {
  debounce,
  throttle,
  memoize,
  once,
  retry
};

export default {
  // Object utilities
  ...objectUtils,
  
  // Array utilities
  ...arrayUtils,
  
  // String utilities
  ...stringUtils,
  
  // Number utilities
  ...numberUtils,
  
  // Function utilities
  ...functionUtils,
  
  // Type checking
  getType,
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isObject,
  isArray,
  isDate,
  isNull,
  isUndefined,
  isNil,
  
  // URL utilities
  buildUrl,
  parseQuery,
  updateUrlParams,
  
  // Environment utilities
  isBrowser,
  isNode,
  isDevelopment,
  isProduction,
  isTest,
  
  // Device detection
  isMobile,
  isTablet,
  isDesktop,
  getTouchSupport,
  
  // Color utilities
  hexToRgb,
  rgbToHex,
  getContrastColor,
  
  // File utilities
  getFileExtension,
  getFileName,
  formatFileSize,
  
  // Performance utilities
  measureTime,
  createLazyFunction,
  
  // Error handling
  createError,
  isErrorOfType
};