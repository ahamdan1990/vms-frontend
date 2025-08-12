import apiClient, { extractApiData } from './apiClient';
import { buildQueryString } from './apiEndpoints';

/**
 * Configuration management service that matches the backend API endpoints exactly
 * All endpoints require appropriate admin permissions
 */

// Configuration endpoints following the backend structure
const CONFIG_ENDPOINTS = {
  BASE: '/api/admin/configuration',
  BY_CATEGORY: (category) => `/api/admin/configuration/${category}`,
  BY_KEY: (category, key) => `/api/admin/configuration/${category}/${key}`,
  HISTORY: (category, key) => `/api/admin/configuration/${category}/${key}/history`,
  SEARCH: '/api/admin/configuration/search',
  VALIDATE: (category, key) => `/api/admin/configuration/${category}/${key}/validate`,
  CACHE_INVALIDATE: '/api/admin/configuration/cache/invalidate'
};

const configurationService = {
  /**
   * Gets all configurations grouped by category
   * GET /api/admin/configuration
   * Requires: Configuration.ReadAll permission
   */
  async getAllConfigurations() {
    const response = await apiClient.get(CONFIG_ENDPOINTS.BASE);
    return extractApiData(response);
  },

  /**
   * Gets all configurations for a specific category
   * GET /api/admin/configuration/{category}
   * Requires: Configuration.Read permission
   */
  async getCategoryConfiguration(category) {
    const response = await apiClient.get(CONFIG_ENDPOINTS.BY_CATEGORY(category));
    return extractApiData(response);
  },

  /**
   * Gets a specific configuration value with metadata
   * GET /api/admin/configuration/{category}/{key}
   * Requires: Configuration.Read permission
   */
  async getConfiguration(category, key) {
    const response = await apiClient.get(CONFIG_ENDPOINTS.BY_KEY(category, key));
    return extractApiData(response);
  },

  /**
   * Updates a configuration value
   * PUT /api/admin/configuration/{category}/{key}
   * Requires: Configuration.Update permission
   */
  async updateConfiguration(category, key, value, reason = null) {
    const response = await apiClient.put(CONFIG_ENDPOINTS.BY_KEY(category, key), {
      value: value,
      reason: reason
    });
    return extractApiData(response);
  },

  /**
   * Creates a new configuration
   * POST /api/admin/configuration
   * Requires: Configuration.Create permission
   */
  async createConfiguration(configData) {
    const response = await apiClient.post(CONFIG_ENDPOINTS.BASE, {
      category: configData.category,
      key: configData.key,
      value: configData.value,
      dataType: configData.dataType,
      description: configData.description || null,
      requiresRestart: configData.requiresRestart || false,
      isEncrypted: configData.isEncrypted || false,
      isSensitive: configData.isSensitive || false,
      isReadOnly: configData.isReadOnly || false,
      defaultValue: configData.defaultValue || null,
      validationRules: configData.validationRules || null,
      group: configData.group || null,
      environment: configData.environment || 'All',
      displayOrder: configData.displayOrder || 0
    });
    return extractApiData(response);
  },

  /**
   * Deletes a configuration
   * DELETE /api/admin/configuration/{category}/{key}
   * Requires: Configuration.Delete permission
   */
  async deleteConfiguration(category, key, reason = null) {
    const response = await apiClient.delete(CONFIG_ENDPOINTS.BY_KEY(category, key), {
      data: { reason: reason }
    });
    return extractApiData(response);
  },

  /**
   * Gets configuration history/audit trail
   * GET /api/admin/configuration/{category}/{key}/history
   * Requires: Configuration.ViewHistory permission
   */
  async getConfigurationHistory(category, key, pageSize = 50) {
    const queryParams = { pageSize };
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${CONFIG_ENDPOINTS.HISTORY(category, key)}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Searches configurations
   * GET /api/admin/configuration/search
   * Requires: Configuration.Read permission
   */
  async searchConfigurations(searchTerm, category = null) {
    const queryParams = {
      searchTerm: searchTerm,
      category: category
    };
    
    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === null) {
        delete queryParams[key];
      }
    });

    const queryString = buildQueryString(queryParams);
    const response = await apiClient.get(`${CONFIG_ENDPOINTS.SEARCH}${queryString}`);
    return extractApiData(response);
  },

  /**
   * Validates a configuration value without saving
   * POST /api/admin/configuration/{category}/{key}/validate
   * Requires: Configuration.Read permission
   */
  async validateConfiguration(category, key, value) {
    const response = await apiClient.post(CONFIG_ENDPOINTS.VALIDATE(category, key), {
      value: value
    });
    return extractApiData(response);
  },

  /**
   * Invalidates configuration cache
   * POST /api/admin/configuration/cache/invalidate
   * Requires: Configuration.InvalidateCache permission
   */
  async invalidateCache(category = null) {
    const queryParams = category ? { category } : {};
    const queryString = buildQueryString(queryParams);
    const response = await apiClient.post(`${CONFIG_ENDPOINTS.CACHE_INVALIDATE}${queryString}`);
    return extractApiData(response);
  },

  // Utility methods for frontend

  /**
   * Gets configurations by group
   */
  async getConfigurationsByGroup(group) {
    const allConfigs = await this.getAllConfigurations();
    return Object.keys(allConfigs).reduce((grouped, category) => {
      const categoryConfigs = allConfigs[category].filter(config => config.group === group);
      if (categoryConfigs.length > 0) {
        grouped[category] = categoryConfigs;
      }
      return grouped;
    }, {});
  },

  /**
   * Gets security-related configurations
   */
  async getSecurityConfigurations() {
    const securityCategories = ['Security', 'Authentication', 'JWT', 'RateLimit', 'Password'];
    const allConfigs = await this.getAllConfigurations();
    
    return securityCategories.reduce((security, category) => {
      if (allConfigs[category]) {
        security[category] = allConfigs[category];
      }
      return security;
    }, {});
  },

  /**
   * Gets configurations that require restart
   */
  async getRestartRequiredConfigurations() {
    const allConfigs = await this.getAllConfigurations();
    const restartRequired = {};
    
    Object.keys(allConfigs).forEach(category => {
      const configs = allConfigs[category].filter(config => config.requiresRestart);
      if (configs.length > 0) {
        restartRequired[category] = configs;
      }
    });
    
    return restartRequired;
  },

  /**
   * Validates configuration data before submission
   */
  validateConfigurationData(configData, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      if (!configData.category?.trim()) {
        errors.push('Category is required');
      }
      if (!configData.key?.trim()) {
        errors.push('Key is required');
      }
      if (!configData.dataType?.trim()) {
        errors.push('Data type is required');
      }
    }

    if (configData.value === undefined || configData.value === null) {
      errors.push('Value is required');
    }

    // Category validation
    if (configData.category && configData.category.length > 50) {
      errors.push('Category cannot exceed 50 characters');
    }

    // Key validation
    if (configData.key && configData.key.length > 100) {
      errors.push('Key cannot exceed 100 characters');
    }

    // Description validation
    if (configData.description && configData.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }

    // Data type validation
    const validDataTypes = ['String', 'Integer', 'Boolean', 'Decimal', 'DateTime', 'JSON'];
    if (configData.dataType && !validDataTypes.includes(configData.dataType)) {
      errors.push('Invalid data type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default configurationService;