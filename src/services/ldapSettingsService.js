// src/services/ldapSettingsService.js
import apiClient, { extractApiData } from './apiClient';

const LDAP_SETTINGS_ENDPOINT = '/api/admin/ldap-settings';

const ldapSettingsService = {
  async getSettings() {
    const response = await apiClient.get(LDAP_SETTINGS_ENDPOINT);
    return extractApiData(response);
  },

  async updateSettings(payload) {
    const response = await apiClient.put(LDAP_SETTINGS_ENDPOINT, payload);
    return extractApiData(response);
  }
};

export default ldapSettingsService;
