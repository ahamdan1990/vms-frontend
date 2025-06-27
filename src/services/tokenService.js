// src/services/tokenService.js
/**
 * Token service for managing authentication tokens
 * Memory-based implementation for Claude.ai artifacts compatibility
 * FIXED: Better session validation and expiry logic
 */

// Token refresh interval (14 minutes - tokens expire in 15 minutes)
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000;

class TokenService {
  constructor() {
    this.refreshTimer = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
    
    // In-memory storage for session data
    this.sessionData = {
      sessionId: null,
      lastActivity: null,
      deviceFingerprint: null,
      rememberedEmail: null
    };
  }

  /**
   * Generate device fingerprint for security - COMPLETELY FIXED VERSION
   */
  generateDeviceFingerprint() {
    try {
      // Create a TRULY static fingerprint that never changes
      const staticComponents = [
        navigator.userAgent || 'unknown',
        navigator.language || 'en',
        window.screen.width || 0,
        window.screen.height || 0,
        new Date().getTimezoneOffset() || 0,
        navigator.platform || 'unknown'
      ];
      
      // Create a simple, consistent hash
      const fingerprint = staticComponents.join('|');
      let hash = 0;
      
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      // Convert to hex string
      const result = Math.abs(hash).toString(16).padStart(8, '0');
      
      console.log('🔒 Generated device fingerprint:', result);
      this.setDeviceFingerprint(result);
      return result;
    } catch (error) {
      console.warn('Failed to generate device fingerprint:', error);
      // Static fallback that never changes
      const fallback = 'static-fallback-12345678';
      this.setDeviceFingerprint(fallback);
      return fallback;
    }
  }

  /**
   * Get stored device fingerprint or generate new one
   * FIXED: Always return the same fingerprint for the session
   */
  getDeviceFingerprint() {
    if (!this.sessionData.deviceFingerprint) {
      this.sessionData.deviceFingerprint = this.generateDeviceFingerprint();
    }
    return this.sessionData.deviceFingerprint;
  }

  /**
   * Store device fingerprint
   */
  setDeviceFingerprint(fingerprint) {
    this.sessionData.deviceFingerprint = fingerprint;
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
   * Set session ID (for tracking purposes)
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
  }

  /**
   * Get remembered email
   */
  getRememberedEmail() {
    return this.sessionData.rememberedEmail;
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
   * Clear all stored data
   */
  clearAll() {
    // Clear session storage but preserve fingerprint
    const preservedFingerprint = this.sessionData.deviceFingerprint;
    this.sessionData = {
      sessionId: null,
      lastActivity: null,
      deviceFingerprint: preservedFingerprint, // Keep the same fingerprint
      rememberedEmail: this.sessionData.rememberedEmail // Keep remembered email
    };
    
    // Stop refresh timer
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
      promises: typeof Promise !== 'undefined'
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
   * Get token expiry time estimate (since we can't read HTTP-only cookies)
   */
  estimateTokenExpiry() {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return null;

    // Estimate token expiry (15 minutes from last activity)
    return new Date(lastActivity + (15 * 60 * 1000));
  }

  /**
   * ✅ FIXED: Check if token is likely expired
   */
  isTokenLikelyExpired() {
    const expiry = this.estimateTokenExpiry();
    if (!expiry) return true; // If no expiry estimate, consider expired
    
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
   * Create login credentials object with device fingerprint
   * FIXED: Use consistent device fingerprint
   */
  createLoginCredentials(email, password, rememberMe = false) {
    this.updateLastActivity();
    
    if (rememberMe) {
      this.rememberEmail(email);
    }

    // Ensure we use the same device fingerprint
    const deviceFingerprint = this.getDeviceFingerprint();

    return {
      email,
      password,
      rememberMe,
      deviceFingerprint
    };
  }

  /**
   * Handle successful login
   */
  handleLoginSuccess(response) {
    this.updateLastActivity();
    
    // Store session ID if provided
    if (response.sessionId) {
      this.setSessionId(response.sessionId);
    }

    // Return success indicator for refresh timer setup
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
   * ✅ FIXED: Validate session data
   */
  validateSession() {
    const state = this.getAuthState();
    const hasValidSession = state.hasSession && state.lastActivity;
    const isExpired = hasValidSession ? this.isTokenLikelyExpired() : true;
    const needsRefresh = hasValidSession ? this.getTimeUntilRefresh() < 60000 : false; // Less than 1 minute
    
    return {
      isValid: hasValidSession && state.isActive && !isExpired,
      needsRefresh,
      isExpired,
      state
    };
  }

  /**
   * Reset session data (keep device fingerprint and remembered email)
   */
  resetSession() {
    const rememberedEmail = this.sessionData.rememberedEmail;
    const deviceFingerprint = this.sessionData.deviceFingerprint;
    
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
        hasRefreshTimer: !!this.refreshTimer
      }
    };
  }
}

// Export singleton instance
const tokenService = new TokenService();

export default tokenService;