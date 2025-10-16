/**
 * Date manipulation and utility functions
 * Provides consistent date handling across the application
 */

// Constants
export const MILLISECONDS_IN_SECOND = 1000;
export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
export const DAYS_IN_WEEK = 7;
export const MONTHS_IN_YEAR = 12;

export const MILLISECONDS_IN_MINUTE = MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE;
export const MILLISECONDS_IN_HOUR = MILLISECONDS_IN_MINUTE * MINUTES_IN_HOUR;
export const MILLISECONDS_IN_DAY = MILLISECONDS_IN_HOUR * HOURS_IN_DAY;
export const MILLISECONDS_IN_WEEK = MILLISECONDS_IN_DAY * DAYS_IN_WEEK;

// Day names
export const DAY_NAMES = {
  FULL: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORT: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  MIN: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
};

// Month names
export const MONTH_NAMES = {
  FULL: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  SHORT: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

// Date creation and parsing
export const createDate = (year, month, day, hour = 0, minute = 0, second = 0) => {
  return new Date(year, month - 1, day, hour, minute, second);
};

export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const parseDateSafe = (dateString) => {
  try {
    return parseDate(dateString);
  } catch (error) {
    console.warn('Date parsing error:', error);
    return null;
  }
};

// Current date utilities
export const now = () => new Date();
export const today = () => startOfDay(new Date());
export const tomorrow = () => addDays(today(), 1);
export const yesterday = () => addDays(today(), -1);

// Date arithmetic
export const addMilliseconds = (date, milliseconds) => {
  const newDate = new Date(date);
  newDate.setTime(newDate.getTime() + milliseconds);
  return newDate;
};

export const addSeconds = (date, seconds) => {
  return addMilliseconds(date, seconds * MILLISECONDS_IN_SECOND);
};

export const addMinutes = (date, minutes) => {
  return addMilliseconds(date, minutes * MILLISECONDS_IN_MINUTE);
};

export const addHours = (date, hours) => {
  return addMilliseconds(date, hours * MILLISECONDS_IN_HOUR);
};

export const addDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

export const addWeeks = (date, weeks) => {
  return addDays(date, weeks * DAYS_IN_WEEK);
};

export const addMonths = (date, months) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

export const addYears = (date, years) => {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
};

// Subtraction functions (negative addition)
export const subDays = (date, days) => addDays(date, -days);
export const subWeeks = (date, weeks) => addWeeks(date, -weeks);
export const subMonths = (date, months) => addMonths(date, -months);
export const subYears = (date, years) => addYears(date, -years);

// Start/End of period functions
export const startOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const endOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

export const startOfWeek = (date, startDayOfWeek = 0) => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = (day - startDayOfWeek + 7) % 7;
  return startOfDay(subDays(newDate, diff));
};

export const endOfWeek = (date, startDayOfWeek = 0) => {
  return endOfDay(addDays(startOfWeek(date, startDayOfWeek), 6));
};

export const startOfMonth = (date) => {
  const newDate = new Date(date);
  newDate.setDate(1);
  return startOfDay(newDate);
};

export const endOfMonth = (date) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1, 0);
  return endOfDay(newDate);
};

export const startOfYear = (date) => {
  const newDate = new Date(date);
  newDate.setMonth(0, 1);
  return startOfDay(newDate);
};

export const endOfYear = (date) => {
  const newDate = new Date(date);
  newDate.setMonth(11, 31);
  return endOfDay(newDate);
};

// Comparison functions
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return startOfDay(date1).getTime() === startOfDay(date2).getTime();
};

export const isSameWeek = (date1, date2, startDayOfWeek = 0) => {
  if (!date1 || !date2) return false;
  const start1 = startOfWeek(date1, startDayOfWeek);
  const start2 = startOfWeek(date2, startDayOfWeek);
  return start1.getTime() === start2.getTime();
};

export const isSameMonth = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};

export const isSameYear = (date1, date2) => {
  if (!date1 || !date2) return false;
  return new Date(date1).getFullYear() === new Date(date2).getFullYear();
};

export const isBefore = (date1, date2) => {
  if (!date1 || !date2) return false;
  return new Date(date1) < new Date(date2);
};

export const isAfter = (date1, date2) => {
  if (!date1 || !date2) return false;
  return new Date(date1) > new Date(date2);
};

export const isEqual = (date1, date2) => {
  if (!date1 || !date2) return false;
  return new Date(date1).getTime() === new Date(date2).getTime();
};

export const isBetween = (date, startDate, endDate, inclusive = true) => {
  if (!date || !startDate || !endDate) return false;
  
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (inclusive) {
    return checkDate >= start && checkDate <= end;
  } else {
    return checkDate > start && checkDate < end;
  }
};

// Date queries
export const isToday = (date) => {
  if (!date) return false;
  return isSameDay(date, new Date());
};

export const isTomorrow = (date) => {
  if (!date) return false;
  return isSameDay(date, tomorrow());
};

export const isYesterday = (date) => {
  if (!date) return false;
  return isSameDay(date, yesterday());
};

export const isThisWeek = (date) => {
  if (!date) return false;
  return isSameWeek(date, new Date());
};

export const isThisMonth = (date) => {
  if (!date) return false;
  return isSameMonth(date, new Date());
};

export const isThisYear = (date) => {
  if (!date) return false;
  return isSameYear(date, new Date());
};

export const isPast = (date) => {
  if (!date) return false;
  return isBefore(date, new Date());
};

export const isFuture = (date) => {
  if (!date) return false;
  return isAfter(date, new Date());
};

export const isWeekend = (date) => {
  if (!date) return false;
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const isWeekday = (date) => {
  return !isWeekend(date);
};

export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Difference calculations
export const diffInMilliseconds = (date1, date2) => {
  if (!date1 || !date2) return null;
  return new Date(date1).getTime() - new Date(date2).getTime();
};

export const diffInSeconds = (date1, date2) => {
  const diff = diffInMilliseconds(date1, date2);
  return diff !== null ? Math.floor(diff / MILLISECONDS_IN_SECOND) : null;
};

export const diffInMinutes = (date1, date2) => {
  const diff = diffInMilliseconds(date1, date2);
  return diff !== null ? Math.floor(diff / MILLISECONDS_IN_MINUTE) : null;
};

export const diffInHours = (date1, date2) => {
  const diff = diffInMilliseconds(date1, date2);
  return diff !== null ? Math.floor(diff / MILLISECONDS_IN_HOUR) : null;
};

export const diffInDays = (date1, date2) => {
  const diff = diffInMilliseconds(date1, date2);
  return diff !== null ? Math.floor(diff / MILLISECONDS_IN_DAY) : null;
};

export const diffInWeeks = (date1, date2) => {
  const diff = diffInDays(date1, date2);
  return diff !== null ? Math.floor(diff / DAYS_IN_WEEK) : null;
};

export const diffInMonths = (date1, date2) => {
  if (!date1 || !date2) return null;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  let months = (d1.getFullYear() - d2.getFullYear()) * 12;
  months += d1.getMonth() - d2.getMonth();
  
  return months;
};

export const diffInYears = (date1, date2) => {
  if (!date1 || !date2) return null;
  return new Date(date1).getFullYear() - new Date(date2).getFullYear();
};

// Age calculation
export const calculateAge = (birthDate, referenceDate = new Date()) => {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);
  
  let age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Date range utilities
export const createDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

export const getWorkingDays = (startDate, endDate, excludeWeekends = true) => {
  const dates = createDateRange(startDate, endDate);
  
  if (!excludeWeekends) return dates;
  
  return dates.filter(date => isWeekday(date));
};

export const getWeekdaysInMonth = (year, month) => {
  const startDate = createDate(year, month, 1);
  const endDate = endOfMonth(startDate);
  
  return getWorkingDays(startDate, endDate);
};

// Timezone utilities
export const getTimezoneOffset = (date = new Date()) => {
  return date.getTimezoneOffset();
};

export const getTimezoneOffsetHours = (date = new Date()) => {
  return getTimezoneOffset(date) / 60;
};

export const toUTC = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getTime() + d.getTimezoneOffset() * MILLISECONDS_IN_MINUTE);
};

export const fromUTC = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getTime() - d.getTimezoneOffset() * MILLISECONDS_IN_MINUTE);
};

// Format utilities (basic - complement formatters.js)
export const toISOString = (date) => {
  if (!date) return null;
  try {
    return new Date(date).toISOString();
  } catch (error) {
    console.warn('ISO string conversion error:', error);
    return null;
  }
};

export const toISODateString = (date) => {
  if (!date) return null;
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch (error) {
    console.warn('ISO date string conversion error:', error);
    return null;
  }
};

export const toTimeString = (date, include24Hour = false) => {
  if (!date) return null;
  
  try {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    if (include24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    } else {
      const hours12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${hours12}:${minutes} ${ampm}`;
    }
  } catch (error) {
    console.warn('Time string conversion error:', error);
    return null;
  }
};

// Date validation
export const isValidDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
};

export const isValidDateRange = (startDate, endDate) => {
  return isValidDate(startDate) && isValidDate(endDate) && !isAfter(startDate, endDate);
};

// Business date utilities
export const getNextWorkingDay = (date, excludeWeekends = true) => {
  let nextDay = addDays(date, 1);
  
  if (excludeWeekends) {
    while (isWeekend(nextDay)) {
      nextDay = addDays(nextDay, 1);
    }
  }
  
  return nextDay;
};

export const getPreviousWorkingDay = (date, excludeWeekends = true) => {
  let prevDay = subDays(date, 1);
  
  if (excludeWeekends) {
    while (isWeekend(prevDay)) {
      prevDay = subDays(prevDay, 1);
    }
  }
  
  return prevDay;
};

export const addWorkingDays = (date, days, excludeWeekends = true) => {
  let currentDate = new Date(date);
  let remainingDays = Math.abs(days);
  const direction = days >= 0 ? 1 : -1;
  
  while (remainingDays > 0) {
    currentDate = addDays(currentDate, direction);
    
    if (!excludeWeekends || isWeekday(currentDate)) {
      remainingDays--;
    }
  }
  
  return currentDate;
};

// Date range presets for common use cases
export const getDateRangePresets = () => {
  const today = new Date();
  
  return {
    today: {
      start: startOfDay(today),
      end: endOfDay(today),
      label: 'Today'
    },
    yesterday: {
      start: startOfDay(yesterday()),
      end: endOfDay(yesterday()),
      label: 'Yesterday'
    },
    thisWeek: {
      start: startOfWeek(today),
      end: endOfWeek(today),
      label: 'This Week'
    },
    lastWeek: {
      start: startOfWeek(subWeeks(today, 1)),
      end: endOfWeek(subWeeks(today, 1)),
      label: 'Last Week'
    },
    thisMonth: {
      start: startOfMonth(today),
      end: endOfMonth(today),
      label: 'This Month'
    },
    lastMonth: {
      start: startOfMonth(subMonths(today, 1)),
      end: endOfMonth(subMonths(today, 1)),
      label: 'Last Month'
    },
    thisYear: {
      start: startOfYear(today),
      end: endOfYear(today),
      label: 'This Year'
    },
    lastYear: {
      start: startOfYear(subYears(today, 1)),
      end: endOfYear(subYears(today, 1)),
      label: 'Last Year'
    },
    last7Days: {
      start: startOfDay(subDays(today, 6)),
      end: endOfDay(today),
      label: 'Last 7 Days'
    },
    last30Days: {
      start: startOfDay(subDays(today, 29)),
      end: endOfDay(today),
      label: 'Last 30 Days'
    },
    last90Days: {
      start: startOfDay(subDays(today, 89)),
      end: endOfDay(today),
      label: 'Last 90 Days'
    }
  };
};

// Formatting functions for time ago and date time
export const formatTimeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  }
  if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
};

export const formatDateTime = (date, options = {}) => {
  if (!date) return '';
  
  const {
    includeTime = true,
    includeSeconds = false,
    format24Hour = false,
    includeDate = true,
    dateFormat = 'MM/DD/YYYY',
    separator = ' '
  } = options;
  
  const d = new Date(date);
  let result = '';
  
  if (includeDate) {
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    
    switch (dateFormat.toLowerCase()) {
      case 'dd/mm/yyyy':
        result = `${day}/${month}/${year}`;
        break;
      case 'yyyy-mm-dd':
        result = `${year}-${month}-${day}`;
        break;
      default: // 'mm/dd/yyyy'
        result = `${month}/${day}/${year}`;
    }
  }
  
  if (includeTime) {
    if (includeDate) result += separator;
    
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    let ampm = '';
    
    if (!format24Hour) {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12 || 12;
    }
    
    let timeString = `${hours.toString().padStart(2, '0')}:${minutes}`;
    
    if (includeSeconds) {
      const seconds = d.getSeconds().toString().padStart(2, '0');
      timeString += `:${seconds}`;
    }
    
    result += timeString + ampm;
  }
  
  return result;
};

// Export all utilities
export default {
  // Constants
  MILLISECONDS_IN_SECOND,
  SECONDS_IN_MINUTE,
  MINUTES_IN_HOUR,
  HOURS_IN_DAY,
  DAYS_IN_WEEK,
  MONTHS_IN_YEAR,
  MILLISECONDS_IN_MINUTE,
  MILLISECONDS_IN_HOUR,
  MILLISECONDS_IN_DAY,
  MILLISECONDS_IN_WEEK,
  DAY_NAMES,
  MONTH_NAMES,

  // Creation and parsing
  createDate,
  parseDate,
  parseDateSafe,
  now,
  today,
  tomorrow,
  yesterday,

  // Arithmetic
  addMilliseconds,
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,

  // Start/End of periods
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,

  // Comparisons
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  isBefore,
  isAfter,
  isEqual,
  isBetween,

  // Queries
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isPast,
  isFuture,
  isWeekend,
  isWeekday,
  isLeapYear,

  // Differences
  diffInMilliseconds,
  diffInSeconds,
  diffInMinutes,
  diffInHours,
  diffInDays,
  diffInWeeks,
  diffInMonths,
  diffInYears,
  calculateAge,

  // Ranges
  createDateRange,
  getWorkingDays,
  getWeekdaysInMonth,

  // Timezone
  getTimezoneOffset,
  getTimezoneOffsetHours,
  toUTC,
  fromUTC,

  // Formatting
  toISOString,
  toISODateString,
  toTimeString,
  formatTimeAgo,
  formatDateTime,

  // Validation
  isValidDate,
  isValidDateRange,

  // Business dates
  getNextWorkingDay,
  getPreviousWorkingDay,
  addWorkingDays,

  // Presets
  getDateRangePresets
};