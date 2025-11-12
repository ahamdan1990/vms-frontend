import apiClient, { extractApiData } from './apiClient';

const LDAP_USERS_ENDPOINT = '/api/admin/ldap-settings';

const ldapUsersService = {
  async testConnection() {
    const response = await apiClient.get(`${LDAP_USERS_ENDPOINT}/test-connection`);
    return extractApiData(response);
  },

  async getAllUsers(maxResults = 1000) {
    const response = await apiClient.get(`${LDAP_USERS_ENDPOINT}/users`, {
      params: { maxResults }
    });
    return extractApiData(response);
  },

  async importUser(username, role) {
    const response = await apiClient.post(`${LDAP_USERS_ENDPOINT}/import-user`, {
      username,
      role
    });
    return extractApiData(response);
  },

  async importUsersBulk(usernames, role) {
    const response = await apiClient.post(`${LDAP_USERS_ENDPOINT}/import-users-bulk`, {
      usernames,
      role
    });
    return extractApiData(response);
  },

  async importUsersWithRoles(users) {
    const response = await apiClient.post(`${LDAP_USERS_ENDPOINT}/import-users-with-roles`, {
      users
    });
    return extractApiData(response);
  }
};

export default ldapUsersService;
