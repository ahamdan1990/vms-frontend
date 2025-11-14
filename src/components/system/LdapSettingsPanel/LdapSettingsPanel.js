import { useEffect, useState, useCallback } from 'react';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Select from '../../common/Select/Select';
import Switch from '../../common/Switch/Switch';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../../hooks/useNotifications';
import ldapSettingsService from '../../../services/ldapSettingsService';

const roleOptions = [
  { label: 'Staff', value: 'Staff' },
  { label: 'Receptionist', value: 'Receptionist' },
  { label: 'Administrator', value: 'Administrator' }
];

const buildFormState = (data = {}) => ({
  enabled: data.enabled ?? false,
  server: data.server || '',
  port: data.port || 389,
  domain: data.domain || '',
  userName: data.userName || '',
  password: '',
  baseDn: data.baseDn || '',
  autoCreateUsers: data.autoCreateUsers ?? true,
  syncProfileOnLogin: data.syncProfileOnLogin ?? true,
  includeDirectoryUsersInHostSearch: data.includeDirectoryUsersInHostSearch ?? true,
  defaultImportRole: data.defaultImportRole || 'Staff',
  allowRoleSelectionOnImport: data.allowRoleSelectionOnImport ?? false
});

const LdapSettingsPanel = ({ canEdit }) => {
  const toast = useToast();
  const [formState, setFormState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ldapSettingsService.getSettings();
      setFormState(buildFormState(data));
      setHasPassword(Boolean(data.hasPasswordConfigured));
    } catch (error) {
      toast.error('Failed to load LDAP settings');
      setFormState(prev => prev || buildFormState());
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formState) return;
    setSaving(true);
    try {
      await ldapSettingsService.updateSettings({
        enabled: formState.enabled,
        server: formState.server,
        port: Number(formState.port),
        domain: formState.domain,
        userName: formState.userName,
        password: formState.password || null,
        baseDn: formState.baseDn,
        autoCreateUsers: formState.autoCreateUsers,
        syncProfileOnLogin: formState.syncProfileOnLogin,
        includeDirectoryUsersInHostSearch: formState.includeDirectoryUsersInHostSearch,
        defaultImportRole: formState.defaultImportRole,
        allowRoleSelectionOnImport: formState.allowRoleSelectionOnImport
      });

      if (formState.password) {
        setHasPassword(true);
        handleChange('password', '');
      }

      toast.success('LDAP settings saved');
      await fetchSettings();
    } catch (error) {
      toast.error('Failed to save LDAP settings');
    } finally {
      setSaving(false);
    }
  };

  if ((loading && !formState) || !formState) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">LDAP Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure LDAP/Active Directory integration parameters.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!canEdit || saving}
          icon={saving ? <LoadingSpinner size="sm" /> : null}
        >
          Save Settings
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid md:grid-cols-2 gap-6">
          <Switch
            checked={formState.enabled}
            onChange={(value) => handleChange('enabled', value)}
            disabled={!canEdit}
            label="Enable LDAP"
            description="Toggle overall LDAP/AD integration."
          />

          <Switch
            checked={formState.includeDirectoryUsersInHostSearch}
            onChange={(value) => handleChange('includeDirectoryUsersInHostSearch', value)}
            disabled={!canEdit}
            label="Show Directory Users in Host Search"
            description="Allow receptionists to search domain users even if they have not signed in yet."
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Server"
            value={formState.server}
            onChange={(e) => handleChange('server', e.target.value)}
            disabled={!canEdit}
            required
          />
          <Input
            label="Port"
            type="number"
            value={formState.port}
            onChange={(e) => handleChange('port', e.target.value)}
            disabled={!canEdit}
            min={1}
            max={65535}
          />
          <Input
            label="Domain"
            value={formState.domain}
            onChange={(e) => handleChange('domain', e.target.value)}
            disabled={!canEdit}
          />
          <Input
            label="Base DN"
            value={formState.baseDn}
            onChange={(e) => handleChange('baseDn', e.target.value)}
            disabled={!canEdit}
          />
          <Input
            label="Service Account Username"
            value={formState.userName}
            onChange={(e) => handleChange('userName', e.target.value)}
            disabled={!canEdit}
          />
          <Input
            label="Service Account Password"
            type="password"
            placeholder={hasPassword ? 'Leave blank to keep existing password' : 'Enter password'}
            value={formState.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={!canEdit}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid md:grid-cols-2 gap-6">
          <Switch
            checked={formState.autoCreateUsers}
            onChange={(value) => handleChange('autoCreateUsers', value)}
            disabled={!canEdit}
            label="Auto-create Users on Login"
            description="Automatically provision LDAP users the first time they sign in."
          />
          <Switch
            checked={formState.syncProfileOnLogin}
            onChange={(value) => handleChange('syncProfileOnLogin', value)}
            disabled={!canEdit}
            label="Sync Profile on Login"
            description="Refresh LDAP attributes every time the user signs in."
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid md:grid-cols-2 gap-6">
          <Select
            label="Default Role for Imported Users"
            value={formState.defaultImportRole}
            onChange={(value) => handleChange('defaultImportRole', value)}
            options={roleOptions}
            disabled={!canEdit}
          />
          <Switch
            checked={formState.allowRoleSelectionOnImport}
            onChange={(value) => handleChange('allowRoleSelectionOnImport', value)}
            disabled={!canEdit}
            label="Allow Role Overrides on Import"
            description="Permit admins to assign a different role when importing directory users."
          />
        </div>
      </div>
    </div>
  );
};

export default LdapSettingsPanel;
