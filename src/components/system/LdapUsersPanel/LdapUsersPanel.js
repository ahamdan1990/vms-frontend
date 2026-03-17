import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../common/Button/Button';
import Select from '../../common/Select/Select';
import Input from '../../common/Input/Input';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Badge from '../../common/Badge/Badge';
import ConfirmDialog from '../../common/ConfirmDialog/ConfirmDialog';
import { useToast } from '../../../hooks/useNotifications';
import ldapUsersService from '../../../services/ldapUsersService';
import {
  CheckIcon,
  XMarkIcon,
  UserPlusIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const LdapUsersPanel = ({ canEdit }) => {
  const { t, i18n } = useTranslation('system');
  const toast = useToast();
  const isRtl = i18n.dir() === 'rtl';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('Staff');
  const [individualRoles, setIndividualRoles] = useState({});
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [showRolesConfirm, setShowRolesConfirm] = useState(false);

  const roleOptions = useMemo(
    () => [
      { label: t('ldap.roleStaff', { defaultValue: 'Staff' }), value: 'Staff' },
      { label: t('ldap.roleReceptionist', { defaultValue: 'Receptionist' }), value: 'Receptionist' },
      { label: t('ldap.roleAdministrator', { defaultValue: 'Administrator' }), value: 'Administrator' }
    ],
    [t]
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ldapUsersService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error(t('ldap.failedLoadUsers'), error?.message);
    } finally {
      setLoading(false);
    }
  }, [t, toast]); // eslint-disable-line react-hooks/exhaustive-deps

  const testConnection = useCallback(async () => {
    setTestingConnection(true);
    try {
      const status = await ldapUsersService.testConnection();
      setConnectionStatus(status);
      if (status.isConnected) {
        toast.success(t('ldap.connectionSuccess'));
      } else {
        toast.error(t('ldap.connectionFailedMsg'), status.message);
      }
    } catch (error) {
      toast.error(t('ldap.failedTestConnection'), error?.message);
      setConnectionStatus({ isConnected: false, message: error.message });
    } finally {
      setTestingConnection(false);
    }
  }, [t, toast]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUsers();
    testConnection();
  }, [fetchUsers, testConnection]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      user =>
        user.displayName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const availableUsers = useMemo(() => {
    return filteredUsers.filter(user => !user.isAlreadyImported);
  }, [filteredUsers]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSelectAll = () => {
    if (selectedUsers.size === availableUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(availableUsers.map(u => u.username)));
    }
  };

  const handleSelectUser = username => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(username)) {
      newSelected.delete(username);
    } else {
      newSelected.add(username);
    }
    setSelectedUsers(newSelected);
  };

  const handleImportBulk = async () => {
    if (selectedUsers.size === 0) {
      toast.warning(t('ldap.noUsersSelected'), t('ldap.selectAtLeastOne'));
      return;
    }

    setShowBulkConfirm(false);
    setImporting(true);
    try {
      const usernames = Array.from(selectedUsers);
      const result = await ldapUsersService.importUsersBulk(usernames, selectedRole);

      if (result.successCount > 0) {
        toast.success(
          t('ldap.importSuccess'),
          t('ldap.importSuccessMsg', { success: result.successCount, failed: result.failureCount })
        );
        setSelectedUsers(new Set());
        await fetchUsers();
      } else {
        toast.error(t('ldap.importFailed'), t('ldap.importFailedMsg'));
      }
    } catch (error) {
      toast.error(t('ldap.failedImportUsers'), error?.message);
    } finally {
      setImporting(false);
    }
  };

  const handleImportWithRoles = async () => {
    if (selectedUsers.size === 0) {
      toast.warning(t('ldap.noUsersSelected'), t('ldap.selectAtLeastOne'));
      return;
    }

    setShowRolesConfirm(false);
    setImporting(true);
    try {
      const usersToImport = Array.from(selectedUsers).map(username => ({
        username,
        role: individualRoles[username] || selectedRole
      }));

      const result = await ldapUsersService.importUsersWithRoles(usersToImport);

      if (result.successCount > 0) {
        toast.success(
          t('ldap.importSuccess'),
          t('ldap.importSuccessMsg', { success: result.successCount, failed: result.failureCount })
        );
        setSelectedUsers(new Set());
        setIndividualRoles({});
        await fetchUsers();
      } else {
        toast.error(t('ldap.importFailed'), t('ldap.importFailedMsg'));
      }
    } catch (error) {
      toast.error(t('ldap.failedImportUsers'), error?.message);
    } finally {
      setImporting(false);
    }
  };

  const handleIndividualRoleChange = (username, role) => {
    setIndividualRoles(prev => ({
      ...prev,
      [username]: role
    }));
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {connectionStatus && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {connectionStatus.isConnected ? t('ldap.connectedToLdap') : t('ldap.connectionFailed')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{connectionStatus.message}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={testingConnection}
              icon={testingConnection ? <LoadingSpinner size="sm" /> : <ArrowPathIcon className="h-4 w-4" />}
            >
              {t('ldap.testConnection')}
            </Button>
          </div>
        </div>
      )}
      
      {/* Summary Stats */}
        {!loading && filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                {t('ldap.totalUsers')}
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{filteredUsers.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">
                {t('ldap.availableToImport')}
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{availableUsers.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                {t('ldap.alreadyImported')}
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {filteredUsers.length - availableUsers.length}
              </p>
            </div>
          </div>
      )}

      {/* Main Panel */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('ldap.usersTitle')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('ldap.usersSubtitle')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            icon={loading ? <LoadingSpinner size="sm" /> : <ArrowPathIcon className="h-4 w-4" />}
          >
            {t('ldap.refresh')}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder={t('ldap.searchUsers')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full">
                  <span className="text-white font-semibold text-sm">{selectedUsers.size}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {t('ldap.usersSelected', { count: selectedUsers.size })}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">{t('ldap.readyToImport')}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-48">
                  <Select
                    label={t('ldap.defaultRole2')}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    options={roleOptions}
                    disabled={!canEdit || importing}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUsers(new Set())}
                  disabled={importing}
                >
                  {t('ldap.clear')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowBulkConfirm(true)}
                  disabled={!canEdit || importing}
                  icon={importing ? <LoadingSpinner size="sm" /> : <UserGroupIcon className="h-4 w-4" />}
                >
                  {t('ldap.importAllAs', { role: selectedRole })}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowRolesConfirm(true)}
                  disabled={!canEdit || importing}
                  icon={importing ? <LoadingSpinner size="sm" /> : <UserPlusIcon className="h-4 w-4" />}
                >
                  {t('ldap.importWithCustomRoles')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/40">
                <tr>
                  <th className="px-6 py-4 text-start w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === availableUsers.length && availableUsers.length > 0}
                      onChange={handleSelectAll}
                      disabled={!canEdit || availableUsers.length === 0}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 bg-white dark:bg-gray-900 disabled:opacity-50"
                    />
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {t('ldap.user')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {t('ldap.email')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {t('ldap.department')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {t('ldap.jobTitle')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {t('ldap.status')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[180px]">
                    {t('ldap.role')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <UserGroupIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
                          {searchQuery ? t('ldap.noUsersMatch') : t('ldap.noUsersFound')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {searchQuery ? t('ldap.adjustSearch') : t('ldap.noUsersFoundDesc')}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, index) => (
                    <tr
                      key={user.username}
                      className={`transition-colors ${
                        selectedUsers.has(user.username)
                          ? 'bg-blue-50 dark:bg-blue-900/10'
                          : index % 2 === 0
                          ? 'bg-white dark:bg-gray-900'
                          : 'bg-gray-50/50 dark:bg-gray-900/40'
                      } hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        user.isAlreadyImported ? 'opacity-75' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.username)}
                          onChange={() => handleSelectUser(user.username)}
                          disabled={!canEdit || user.isAlreadyImported}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.firstName?.charAt(0) || user.displayName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {user.displayName || t('ldap.unknownUser')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.department || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.jobTitle || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {user.isAlreadyImported ? (
                          <Badge variant="success" size="sm" className="inline-flex items-center gap-1.5">
                            <CheckIcon className="h-3.5 w-3.5" />
                            {t('ldap.imported')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" size="sm" className="inline-flex items-center gap-1.5">
                            <XMarkIcon className="h-3.5 w-3.5" />
                            {t('ldap.available')}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.isAlreadyImported ? (
                          <Badge variant="outline" size="sm" className="font-medium">
                            {user.existingRole}
                          </Badge>
                        ) : selectedUsers.has(user.username) ? (
                          <div className="w-full max-w-[160px]">
                            <Select
                              value={individualRoles[user.username] || selectedRole}
                              onChange={(e) => handleIndividualRoleChange(user.username, e.target.value)}
                              options={roleOptions}
                              disabled={!canEdit || importing}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">{t('ldap.notSelected')}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t('ldap.showing')} <span className="font-semibold">{startIndex + 1}</span> {t('ldap.to')}{' '}
                    <span className="font-semibold">{Math.min(endIndex, filteredUsers.length)}</span> {t('ldap.of')}{' '}
                    <span className="font-semibold">{filteredUsers.length}</span> {t('ldap.users')}
                  </p>
                  {availableUsers.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('ldap.availableForImport', { count: availableUsers.length })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    icon={
                      isRtl
                        ? <ChevronRightIcon className="h-4 w-4" />
                        : <ChevronLeftIcon className="h-4 w-4" />
                    }
                  >
                    {t('ldap.previous')}
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    icon={
                      isRtl
                        ? <ChevronLeftIcon className="h-4 w-4" />
                        : <ChevronRightIcon className="h-4 w-4" />
                    }
                  >
                    {t('ldap.next')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleImportBulk}
        title={t('ldap.importUsersUnified')}
        message={t('ldap.importUsersUnifiedMsg', {
          count: selectedUsers.size,
          role: selectedRole
        })}
        confirmText={t('ldap.importUsers')}
        confirmVariant="primary"
      />

      <ConfirmDialog
        isOpen={showRolesConfirm}
        onClose={() => setShowRolesConfirm(false)}
        onConfirm={handleImportWithRoles}
        title={t('ldap.importUsersCustomRoles')}
        message={t('ldap.importUsersCustomRolesMsg', {
          count: selectedUsers.size
        })}
        confirmText={t('ldap.importUsers')}
        confirmVariant="primary"
      />
    </div>
  );
};

export default LdapUsersPanel;
