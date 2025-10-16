/**
 * Scroll utilities for smooth scrolling and scroll management
 * Provides helper functions for scroll behavior across the application
 */

// Smooth scroll to element by ID
export const scrollToElement = (elementId, options = {}) => {
  const {
    behavior = 'smooth',
    block = 'start',
    inline = 'nearest',
    offset = 0,
    duration = 500
  } = options;
  
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID "${elementId}" not found`);
    return false;
  }
  
  // Calculate position with offset
  const elementRect = element.getBoundingClientRect();
  const absoluteElementTop = elementRect.top + window.scrollY;
  const targetPosition = absoluteElementTop - offset;
  
  // Use smooth scroll if supported
  if (behavior === 'smooth' && 'scrollBehavior' in document.documentElement.style) {
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  } else {
    // Fallback to animated scroll
    smoothScrollTo(targetPosition, duration);
  }
  
  return true;
};

// Smooth scroll to top of page
export const scrollToTop = (options = {}) => {
  const { behavior = 'smooth', duration = 500 } = options;
  
  if (behavior === 'smooth' && 'scrollBehavior' in document.documentElement.style) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } else {
    smoothScrollTo(0, duration);
  }
};

// Smooth scroll to bottom of page
export const scrollToBottom = (options = {}) => {
  const { behavior = 'smooth', duration = 500 } = options;
  const targetPosition = document.documentElement.scrollHeight - window.innerHeight;
  
  if (behavior === 'smooth' && 'scrollBehavior' in document.documentElement.style) {
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  } else {
    smoothScrollTo(targetPosition, duration);
  }
};

// Animated scroll to position (fallback)
const smoothScrollTo = (targetPosition, duration = 500) => {
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();
  
  const easeInOutQuad = (time, start, change, duration) => {
    time /= duration / 2;
    if (time < 1) return change / 2 * time * time + start;
    time--;
    return -change / 2 * (time * (time - 2) - 1) + start;
  };
  
  const animation = (currentTime) => {
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    
    window.scrollTo(0, run);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      window.scrollTo(0, targetPosition);
    }
  };
  
  requestAnimationFrame(animation);
};

// Get current scroll position
export const getScrollPosition = () => {
  return {
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset
  };
};

// Get element's position relative to viewport
export const getElementPosition = (element) => {
  if (!element) return null;
  
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2
  };
};

// Check if element is in viewport
export const isElementInViewport = (element, threshold = 0) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top >= -threshold &&
    rect.left >= -threshold &&
    rect.bottom <= windowHeight + threshold &&
    rect.right <= windowWidth + threshold
  );
};

// Check if element is partially in viewport
export const isElementPartiallyInViewport = (element, threshold = 0) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.bottom >= threshold &&
    rect.right >= threshold &&
    rect.top <= windowHeight - threshold &&
    rect.left <= windowWidth - threshold
  );
};

// Save scroll position
export const saveScrollPosition = (key = 'scrollPosition') => {
  const position = getScrollPosition();
  sessionStorage.setItem(key, JSON.stringify(position));
  return position;
};

// Restore scroll position
export const restoreScrollPosition = (key = 'scrollPosition') => {
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const position = JSON.parse(saved);
      window.scrollTo(position.x, position.y);
      return position;
    }
  } catch (error) {
    console.warn('Error restoring scroll position:', error);
  }
  return null;
};

// Clear saved scroll position
export const clearScrollPosition = (key = 'scrollPosition') => {
  sessionStorage.removeItem(key);
};

// Lock scroll (prevent scrolling)
export const lockScroll = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = getScrollbarWidth() + 'px';
};

// Unlock scroll (restore scrolling)
export const unlockScroll = () => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
};

// Get scrollbar width
export const getScrollbarWidth = () => {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.msOverflowStyle = 'scrollbar';
  document.body.appendChild(outer);
  
  const inner = document.createElement('div');
  outer.appendChild(inner);
  
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode.removeChild(outer);
  
  return scrollbarWidth;
};

// Debounced scroll event handler
export const createScrollHandler = (callback, delay = 100) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(null, args), delay);
  };
};

// Throttled scroll event handler
export const createThrottledScrollHandler = (callback, delay = 100) => {
  let lastExecution = 0;
  
  return (...args) => {
    const now = Date.now();
    if (now - lastExecution >= delay) {
      callback.apply(null, args);
      lastExecution = now;
    }
  };
};

// Get scroll direction
let lastScrollY = window.scrollY;
let scrollDirection = 'up';

export const getScrollDirection = () => {
  const currentScrollY = window.scrollY;
  
  if (currentScrollY > lastScrollY) {
    scrollDirection = 'down';
  } else if (currentScrollY < lastScrollY) {
    scrollDirection = 'up';
  }
  
  lastScrollY = currentScrollY;
  return scrollDirection;
};

// Check if scrolled past element
export const isScrolledPast = (element, offset = 0) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return rect.top + rect.height + offset < 0;
};

// Scroll into view with custom options
export const scrollIntoView = (element, options = {}) => {
  if (!element) return false;
  
  const {
    behavior = 'smooth',
    block = 'nearest',
    inline = 'nearest',
    ...customOptions
  } = options;
  
  if (element.scrollIntoView) {
    element.scrollIntoView({
      behavior,
      block,
      inline,
      ...customOptions
    });
    return true;
  }
  
  return false;
};

// Create intersection observer for scroll-triggered animations
export const createScrollObserver = (callback, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    root = null
  } = options;
  
  if (!('IntersectionObserver' in window)) {
    console.warn('IntersectionObserver not supported');
    return null;
  }
  
  return new IntersectionObserver(callback, {
    threshold,
    rootMargin,
    root
  });
};

export default {
  scrollToElement,
  scrollToTop,
  scrollToBottom,
  getScrollPosition,
  getElementPosition,
  isElementInViewport,
  isElementPartiallyInViewport,
  saveScrollPosition,
  restoreScrollPosition,
  clearScrollPosition,
  lockScroll,
  unlockScroll,
  getScrollbarWidth,
  createScrollHandler,
  createThrottledScrollHandler,
  getScrollDirection,
  isScrolledPast,
  scrollIntoView,
  createScrollObserver
};
