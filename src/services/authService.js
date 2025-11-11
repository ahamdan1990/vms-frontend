import apiClient, { extractApiData } from './apiClient';
import { AUTH_ENDPOINTS } from './apiEndpoints';
import tokenService from './tokenService';
/**
 * Authentication service that matches the backend API endpoints exactly
 * All endpoints use HTTP-only cookies for JWT token management
 * Now properly uses endpoint constants for maintainability
 */
const authService = {
  /**
   * Authenticates user and sets secure cookies
   * POST /api/Auth/login or /api/Auth/ldap-login based on loginMethod
   */
  async login(credentials) {
    const loginMethod = credentials.loginMethod || 'standard';
    const endpoint = loginMethod === 'ldap' ? AUTH_ENDPOINTS.LDAP_LOGIN : AUTH_ENDPOINTS.LOGIN;

    const payload = loginMethod === 'ldap'
      ? {
          username: credentials.username,
          password: credentials.password,
          rememberMe: credentials.rememberMe || false,
          deviceFingerprint: credentials.deviceFingerprint || null
        }
      : {
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe || false,
          deviceFingerprint: credentials.deviceFingerprint || null
        };

    const response = await apiClient.post(endpoint, payload);

    const result = extractApiData(response);

    // Store the backend's fingerprint for future use
    if (result.deviceFingerprint) {
      tokenService.setDeviceFingerprint(result.deviceFingerprint);
    }

    return result;
  },

  /**
   * Registers a new user account
   * POST /api/Auth/signup
   */
  async signup(userData) {
    const response = await apiClient.post(AUTH_ENDPOINTS.SIGNUP, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword
    });

    return extractApiData(response);
  },

  /**
   * Refreshes access token using refresh token from cookies
   * POST /api/Auth/refresh
   */
  async refreshToken() {
    const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH);
    return extractApiData(response);
  },

  /**
   * Logs out user and clears authentication cookies
   * POST /api/Auth/logout
   */
  async logout(logoutFromAllDevices = false) {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT, null, {
      params: { logoutFromAllDevices }
    });
    
    return extractApiData(response);
  },

  /**
   * Changes user password
   * POST /api/Auth/change-password
   */
  async changePassword(passwordData) {
    const response = await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword
    });
    
    return extractApiData(response);
  },

  /**
   * Initiates password reset process
   * POST /api/Auth/forgot-password
   */
  async forgotPassword(email) {
    const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      email: email
    });
    
    return extractApiData(response);
  },

  /**
   * Resets password using reset token
   * POST /api/Auth/reset-password
   */
  async resetPassword(resetData) {
    const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      email: resetData.email,
      token: resetData.token,
      newPassword: resetData.newPassword,
      confirmPassword: resetData.confirmPassword
    });
    
    return extractApiData(response);
  },

  /**
   * Gets current user information
   * GET /api/Auth/me
   */
  async getCurrentUser() {
    const response = await apiClient.get(AUTH_ENDPOINTS.ME);
    return extractApiData(response);
  },

  /**
   * Gets user permissions
   * GET /api/Auth/permissions
   */
  async getUserPermissions() {
    const response = await apiClient.get(AUTH_ENDPOINTS.PERMISSIONS);
    return extractApiData(response);
  },

  /**
   * Validates current access token
   * POST /api/Auth/validate-token
   */
  async validateToken() {
    const response = await apiClient.post(AUTH_ENDPOINTS.VALIDATE_TOKEN);
    return extractApiData(response);
  },

  /**
   * Gets user's active sessions
   * GET /api/Auth/sessions
   */
  async getUserSessions() {
    const response = await apiClient.get(AUTH_ENDPOINTS.SESSIONS);
    return extractApiData(response);
  },

  /**
   * Terminates a specific session
   * DELETE /api/Auth/sessions/{sessionId}
   */
  async terminateSession(sessionId) {
    const response = await apiClient.delete(AUTH_ENDPOINTS.TERMINATE_SESSION(sessionId));
    return extractApiData(response);
  },

  /**
   * Debug endpoint to view user claims (development only)
   * GET /api/Auth/debug-claims
   */
  async getDebugClaims() {
    const response = await apiClient.get('/api/Auth/debug-claims');
    return extractApiData(response);
  }
};

export default authService;