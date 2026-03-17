import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Select from '../../common/Select/Select';
import Switch from '../../common/Switch/Switch';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../../hooks/useNotifications';
import ldapSettingsService from '../../../services/ldapSettingsService';

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
  const { t } = useTranslation('system');
  const toast = useToast();
  const [formState, setFormState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  const roleOptions = useMemo(
    () => [
      { label: t('ldap.roleStaff', { defaultValue: 'Staff' }), value: 'Staff' },
      { label: t('ldap.roleReceptionist', { defaultValue: 'Receptionist' }), value: 'Receptionist' },
      { label: t('ldap.roleAdministrator', { defaultValue: 'Administrator' }), value: 'Administrator' }
    ],
    [t]
  );

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ldapSettingsService.getSettings();
      setFormState(buildFormState(data));
      setHasPassword(Boolean(data.hasPasswordConfigured));
    } catch {
      toast.error(t('ldap.failedLoad'));
      setFormState(prev => prev || buildFormState());
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

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

      toast.success(t('ldap.saved'));
      await fetchSettings();
    } catch {
      toast.error(t('ldap.failedSave'));
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('ldap.settingsTitle')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('ldap.settingsSubtitle')}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!canEdit || saving}
          icon={saving ? <LoadingSpinner size="sm" /> : null}
        >
          {t('ldap.saveSettings')}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid md:grid-cols-2 gap-6">
          <Switch
            checked={formState.enabled}
            onChange={(value) => handleChange('enabled', value)}
            disabled={!canEdit}
            label={t('ldap.enableLdap')}
            description={t('ldap.enableLdapDesc')}
          />

          <Switch
            checked={formState.includeDirectoryUsersInHostSearch}
            onChange={(value) => handleChange('includeDirectoryUsersInHostSearch', value)}
            disabled={!canEdit}
            label={t('ldap.showDirectoryUsers')}
            description={t('ldap.showDirectoryUsersDesc')}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label={t('ldap.server')}
            value={formState.server}
            onChange={(e) => handleChange('server', e.target.value)}
            disabled={!canEdit}
            required
          />
          <Input
            label={t('ldap.port')}
            type="number"
            value={formState.port}
            onChange={(e) => handleChange('port', e.target.value)}
            disabled={!canEdit}
            min={1}
            max={65535}
          />
          <Input
            label={t('ldap.domain')}
            value={formState.domain}
            onChange={(e) => handleChange('domain', e.target.value)}
            disabled={!canEdit}
          />
          <Input
            label={t('ldap.baseDn')}
            value={formState.baseDn}
            onChange={(e) => handleChange('baseDn', e.target.value)}
            disabled={!canEdit}
          />
          <Input
            label={t('ldap.serviceAccountUsername')}
            value={formState.userName}
            onChange={(e) => handleChange('userName', e.target.value)}
            disabled={!canEdit}
          />
          <Input
            label={t('ldap.serviceAccountPassword')}
            type="password"
            placeholder={hasPassword ? t('ldap.passwordPlaceholderKeep') : t('ldap.passwordPlaceholderEnter')}
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
            label={t('ldap.autoCreateUsers')}
            description={t('ldap.autoCreateUsersDesc')}
          />
          <Switch
            checked={formState.syncProfileOnLogin}
            onChange={(value) => handleChange('syncProfileOnLogin', value)}
            disabled={!canEdit}
            label={t('ldap.syncProfile')}
            description={t('ldap.syncProfileDesc')}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid md:grid-cols-2 gap-6">
          <Select
            label={t('ldap.defaultRole')}
            value={formState.defaultImportRole}
            onChange={(e) => handleChange('defaultImportRole', e.target.value)}
            options={roleOptions}
            disabled={!canEdit}
          />
          <Switch
            checked={formState.allowRoleSelectionOnImport}
            onChange={(value) => handleChange('allowRoleSelectionOnImport', value)}
            disabled={!canEdit}
            label={t('ldap.allowRoleOverride')}
            description={t('ldap.allowRoleOverrideDesc')}
          />
        </div>
      </div>
    </div>
  );
};

export default LdapSettingsPanel;
