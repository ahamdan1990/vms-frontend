// src/services/tokenService.js - STABLE PRODUCTION VERSION
/**
 * Token service for managing authentication tokens
 * Memory-based implementation with stable device fingerprinting
 */

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes

class TokenService {
  constructor() {
    this.refreshTimer = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
    
    // ✅ PRODUCTION FIX: Store device fingerprint in memory with fallback to localStorage
    this.cachedFingerprint = null;
    
    // In-memory storage for session data
    this.sessionData = {
      sessionId: null,
      lastActivity: null,
      deviceFingerprint: null,
      rememberedEmail: null
    };

    // ✅ PRODUCTION FIX: Initialize fingerprint immediately
    this.initializeFingerprint();
  }

  /**
   * ✅ PRODUCTION FIX: Initialize device fingerprint with persistent storage
   */
  initializeFingerprint() {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem('vms_device_fingerprint');
      if (stored) {
        this.cachedFingerprint = stored;
        this.sessionData.deviceFingerprint = stored;
        return;
      }
    } catch (error) {
      // localStorage not available, continue with generation
    }

    // Generate new fingerprint
    this.cachedFingerprint = this.generateStableFingerprint();
    this.sessionData.deviceFingerprint = this.cachedFingerprint;

    // Try to store it
    try {
      localStorage.setItem('vms_device_fingerprint', this.cachedFingerprint);
    } catch (error) {
      // localStorage not available, but we have the fingerprint in memory
    }
  }

  /**
   * ✅ PRODUCTION FIX: Generate truly stable device fingerprint
   */
  generateStableFingerprint() {
    try {
      // Use truly static components that never change
      const components = [
        navigator.userAgent || 'unknown-ua',
        navigator.language || 'en-US',
        navigator.platform || 'unknown-platform',
        window.screen.width || 1920,
        window.screen.height || 1080,
        window.screen.colorDepth || 24,
        new Date().getTimezoneOffset() || 0,
        navigator.hardwareConcurrency || 4,
        navigator.maxTouchPoints || 0
      ];
      
      // Create a stable hash using a simple but effective algorithm
      const input = components.join('|');
      let hash = 0;
      
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      // Convert to positive hex string
      const fingerprint = (Math.abs(hash) >>> 0).toString(16).padStart(8, '0');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 Generated stable device fingerprint:', fingerprint);
      }
      
      return `fp_${fingerprint}`;
    } catch (error) {
      console.warn('Failed to generate device fingerprint:', error);
      // Ultra-stable fallback
      return 'fp_fallback_00000000';
    }
  }

  /**
   * ✅ PRODUCTION FIX: Always return the same fingerprint
   */
  getDeviceFingerprint() {
    if (!this.cachedFingerprint) {
      this.initializeFingerprint();
    }
    return this.cachedFingerprint;
  }

  /**
   * Set device fingerprint (shouldn't be needed but kept for compatibility)
   */
  setDeviceFingerprint(fingerprint) {
    this.cachedFingerprint = fingerprint;
    this.sessionData.deviceFingerprint = fingerprint;
    
    try {
      localStorage.setItem('vms_device_fingerprint', fingerprint);
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity() {
    this.sessionData.lastActivity = Date.now();
  }

  /**
   * Get last activity timestamp
   */
  getLastActivity() {
    return this.sessionData.lastActivity;
  }

  /**
   * Check if session is active based on last activity
   */
  isSessionActive(maxInactiveTime = 30 * 60 * 1000) { // 30 minutes default
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return false;
    
    const timeSinceActivity = Date.now() - lastActivity;
    return timeSinceActivity < maxInactiveTime;
  }

  /**
   * Set session ID
   */
  setSessionId(sessionId) {
    this.sessionData.sessionId = sessionId;
  }

  /**
   * Get session ID
   */
  getSessionId() {
    return this.sessionData.sessionId;
  }

  /**
   * Remember email for login form
   */
  rememberEmail(email) {
    this.sessionData.rememberedEmail = email || null;
    
    // ✅ PRODUCTION FIX: Also persist email to localStorage
    try {
      if (email) {
        localStorage.setItem('vms_remembered_email', email);
      } else {
        localStorage.removeItem('vms_remembered_email');
      }
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  /**
   * Get remembered email
   */
  getRememberedEmail() {
    // Try memory first, then localStorage
    if (this.sessionData.rememberedEmail) {
      return this.sessionData.rememberedEmail;
    }
    
    try {
      const stored = localStorage.getItem('vms_remembered_email');
      if (stored) {
        this.sessionData.rememberedEmail = stored;
        return stored;
      }
    } catch (error) {
      // Ignore localStorage errors
    }
    
    return null;
  }

  /**
   * Start automatic token refresh timer
   */
  startRefreshTimer(refreshCallback) {
    this.stopRefreshTimer();
    
    this.refreshTimer = setInterval(async () => {
      if (!this.isRefreshing) {
        try {
          this.isRefreshing = true;
          await refreshCallback();
          this.updateLastActivity();
        } catch (error) {
          console.warn('Automatic token refresh failed:', error);
        } finally {
          this.isRefreshing = false;
        }
      }
    }, TOKEN_REFRESH_INTERVAL);
  }

  /**
   * Stop automatic token refresh timer
   */
  stopRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * ✅ PRODUCTION FIX: Clear session data but preserve persistent data
   */
  clearAll() {
    // Clear session data but preserve fingerprint and remembered email
    const preservedFingerprint = this.cachedFingerprint;
    const preservedEmail = this.sessionData.rememberedEmail;
    
    this.sessionData = {
      sessionId: null,
      lastActivity: null,
      deviceFingerprint: preservedFingerprint,
      rememberedEmail: preservedEmail
    };
    
    this.stopRefreshTimer();
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  /**
   * Check if browser supports required features
   */
  checkBrowserSupport() {
    const features = {
      cookies: navigator.cookieEnabled,
      fetch: typeof fetch !== 'undefined',
      promises: typeof Promise !== 'undefined',
      localStorage: (() => {
        try {
          return typeof localStorage !== 'undefined';
        } catch {
          return false;
        }
      })()
    };

    const unsupported = Object.entries(features)
      .filter(([, supported]) => !supported)
      .map(([feature]) => feature);

    return {
      isSupported: unsupported.length === 0,
      unsupported,
      features
    };
  }

  /**
   * Get token expiry time estimate
   */
  estimateTokenExpiry() {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return null;

    return new Date(lastActivity + (15 * 60 * 1000));
  }

  /**
   * Check if token is likely expired
   */
  isTokenLikelyExpired() {
    const expiry = this.estimateTokenExpiry();
    if (!expiry) return true;
    
    return Date.now() > expiry.getTime();
  }

  /**
   * Get time until token refresh needed
   */
  getTimeUntilRefresh() {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return 0;

    const refreshTime = lastActivity + TOKEN_REFRESH_INTERVAL;
    const timeUntil = refreshTime - Date.now();
    
    return Math.max(0, timeUntil);
  }

  /**
   * ✅ PRODUCTION FIX: Create login credentials with stable fingerprint
   */
  createLoginCredentials(email, password, rememberMe = false) {
    this.updateLastActivity();
    
    if (rememberMe) {
      this.rememberEmail(email);
    }

    return {
      email,
      password,
      rememberMe,
      deviceFingerprint: this.getDeviceFingerprint() // Always stable
    };
  }

  /**
   * Handle successful login
   */
  handleLoginSuccess(response) {
    this.updateLastActivity();
    
    if (response.sessionId) {
      this.setSessionId(response.sessionId);
    }

    return response.isSuccess;
  }

  /**
   * Handle logout
   */
  handleLogout() {
    this.clearAll();
  }

  /**
   * Handle token refresh
   */
  handleTokenRefresh() {
    this.updateLastActivity();
  }

  /**
   * Get authentication state summary
   */
  getAuthState() {
    const lastActivity = this.getLastActivity();
    const sessionId = this.getSessionId();
    const deviceFingerprint = this.getDeviceFingerprint();
    const isActive = this.isSessionActive();
    const timeUntilRefresh = this.getTimeUntilRefresh();
    const tokenExpiry = this.estimateTokenExpiry();

    return {
      hasSession: !!sessionId,
      isActive,
      lastActivity: lastActivity ? new Date(lastActivity) : null,
      deviceFingerprint,
      sessionId,
      timeUntilRefresh,
      tokenExpiry,
      isRefreshing: this.isRefreshing,
      browserSupport: this.checkBrowserSupport(),
      rememberedEmail: this.getRememberedEmail()
    };
  }

  /**
   * Validate session data
   */
  validateSession() {
    const state = this.getAuthState();
    const hasValidSession = state.hasSession && state.lastActivity;
    const isExpired = hasValidSession ? this.isTokenLikelyExpired() : true;
    const needsRefresh = hasValidSession ? this.getTimeUntilRefresh() < 60000 : false;
    
    return {
      isValid: hasValidSession && state.isActive && !isExpired,
      needsRefresh,
      isExpired,
      state
    };
  }

  /**
   * Reset session data (keep fingerprint and remembered email)
   */
  resetSession() {
    const rememberedEmail = this.sessionData.rememberedEmail;
    const deviceFingerprint = this.cachedFingerprint;
    
    this.sessionData = {
      sessionId: null,
      lastActivity: null,
      deviceFingerprint,
      rememberedEmail
    };
    
    this.stopRefreshTimer();
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  /**
   * Get session statistics for debugging
   */
  getSessionStats() {
    const state = this.getAuthState();
    const validation = this.validateSession();
    
    return {
      ...state,
      validation,
      refreshInterval: TOKEN_REFRESH_INTERVAL,
      hasRefreshTimer: !!this.refreshTimer,
      memoryUsage: {
        sessionDataSize: JSON.stringify(this.sessionData).length,
        hasRefreshTimer: !!this.refreshTimer,
        fingerprintCached: !!this.cachedFingerprint
      }
    };
  }
}

// Export singleton instance
const tokenService = new TokenService();

export default tokenService;