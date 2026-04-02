// src/pages/system/BackupPage/BackupPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setPageTitle } from '../../../store/slices/uiSlice';
import apiClient from '../../../services/apiClient';
import signalRManager from '../../../services/signalr/signalRConnection';

import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';

import {
  CloudArrowUpIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  CircleStackIcon,
  ServerIcon,
  XCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

import formatters from '../../../utils/formatters';

// ── API helpers ────────────────────────────────────────────────────────────────

const BASE = '/api/system/backup';

const fetchHealth           = () => apiClient.get(`${BASE}/health`).then(r => r.data.data);
const fetchHistory          = (n = 20) => apiClient.get(`${BASE}/history?count=${n}`).then(r => r.data.data);
const postExecute           = () => apiClient.post(`${BASE}/execute`).then(r => r.data);
const putSettings           = (body) => apiClient.put(`${BASE}/settings`, body).then(r => r.data);
const postTestPath          = (path) => apiClient.post(`${BASE}/test-path`, { path }).then(r => r.data);
const fetchPurgePreview     = () => apiClient.get(`${BASE}/purge/preview`).then(r => r.data.data);
const postPurge             = () => apiClient.post(`${BASE}/purge`).then(r => r.data);
const fetchRetentionSettings = () => apiClient.get(`${BASE}/purge/settings`).then(r => r.data.data);
const putRetentionSettings  = (body) => apiClient.put(`${BASE}/purge/settings`, body).then(r => r.data);
const fetchLogHealth        = () => apiClient.get('/api/system/logs/health').then(r => r.data.data);
const postLogPurge          = () => apiClient.post('/api/system/logs/purge').then(r => r.data);
const fetchLogSettings      = () => apiClient.get('/api/system/logs/settings').then(r => r.data.data);
const putLogSettings        = (body) => apiClient.put('/api/system/logs/settings', body).then(r => r.data);

// ── Constants ──────────────────────────────────────────────────────────────────

const POLL_IDLE_MS   = 60_000;
const POLL_ACTIVE_MS = 10_000;

const ALERT_LEVEL_COLOR = { None: 'green', Warning: 'yellow', High: 'orange', Critical: 'red' };
const ALERT_LEVEL_BG    = {
  None:     'bg-green-50 border-green-200 text-green-800',
  Warning:  'bg-yellow-50 border-yellow-200 text-yellow-800',
  High:     'bg-orange-50 border-orange-200 text-orange-800',
  Critical: 'bg-red-50 border-red-200 text-red-800',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function StorageBar({ label, usedMb, totalMb, usedPercent, alertLevel, unit = 'MB' }) {
  const pct = Math.min(Math.round(usedPercent), 100);
  const barColor = alertLevel === 'Critical' ? 'bg-red-500'
                 : alertLevel === 'High'     ? 'bg-orange-500'
                 : alertLevel === 'Warning'  ? 'bg-yellow-500'
                 : 'bg-green-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-medium">
          {totalMb > 0
            ? `${(usedMb / 1024).toFixed(1)} GB / ${(totalMb / 1024).toFixed(0)} GB (${pct}%)`
            : `${(usedMb / 1024).toFixed(1)} GB`}
        </span>
      </div>
      {totalMb > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${barColor} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }) {
  if (status === 'Completed') return <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />;
  if (status === 'Failed')    return <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />;
  if (status === 'Running')   return <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />;
  return <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />;
}

// ── Settings Modal (tabbed: Backup · Retention · Log Files) ────────────────────

const TABS = ['backup', 'retention', 'logs'];
const TAB_LABELS = { backup: 'Backup', retention: 'Data Retention', logs: 'Log Files' };

function SettingsModal({ settings, retentionSettings, logSettings, onClose, onSaved, initialTab = 'backup' }) {
  const [tab, setTab] = useState(initialTab);

  // Backup form
  const [bForm, setBForm] = useState({ ...settings });
  const [bSaving, setBSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [bError, setBError] = useState(null);
  const setB = (key, val) => setBForm(f => ({ ...f, [key]: val }));

  // Retention form
  const [rForm, setRForm] = useState({ ...(retentionSettings ?? {
    autoPurgeAfterBackup: false, scheduleEnabled: false, scheduleTime: '03:00',
    scheduleDayOfWeek: 'Sunday', retentionDays: 90,
    purgeInvitations: true, purgeNotifications: true, purgeAuditLogs: false,
    purgeOccupancyLogs: true, shrinkDbAfterPurge: false,
  }) });
  const [rSaving, setRSaving] = useState(false);
  const [rError, setRError] = useState(null);
  const setR = (key, val) => setRForm(f => ({ ...f, [key]: val }));

  // Log settings form
  const [lForm, setLForm] = useState({ ...(logSettings ?? {
    retentionDays: 30, autoPurgeEnabled: false, scheduleEnabled: false,
    scheduleTime: '04:00', maxFolderSizeMb: 500,
  }) });
  const [lSaving, setLSaving] = useState(false);
  const [lError, setLError] = useState(null);
  const setL = (key, val) => setLForm(f => ({ ...f, [key]: val }));

  const handleTestPath = async () => {
    setTesting(true); setTestResult(null);
    try {
      const res = await postTestPath(bForm.destinationPath);
      setTestResult({ ok: res.success, msg: res.message });
    } catch (e) {
      setTestResult({ ok: false, msg: e.response?.data?.message ?? 'Request failed' });
    } finally { setTesting(false); }
  };

  const handleSaveBackup = async () => {
    setBSaving(true); setBError(null);
    try {
      const res = await putSettings(bForm);
      if (res.success) { onSaved(); onClose(); }
      else setBError(res.message ?? 'Failed to save.');
    } catch (e) {
      setBError(e.response?.data?.message ?? 'Failed to save settings.');
    } finally { setBSaving(false); }
  };

  const handleSaveRetention = async () => {
    setRSaving(true); setRError(null);
    try {
      const res = await putRetentionSettings(rForm);
      if (res.success) { onSaved(); onClose(); }
      else setRError(res.message ?? 'Failed to save.');
    } catch (e) {
      setRError(e.response?.data?.message ?? 'Failed to save retention settings.');
    } finally { setRSaving(false); }
  };

  const handleSaveLogs = async () => {
    setLSaving(true); setLError(null);
    try {
      const res = await putLogSettings(lForm);
      if (res.success) { onSaved(); onClose(); }
      else setLError(res.message ?? 'Failed to save.');
    } catch (e) {
      setLError(e.response?.data?.message ?? 'Failed to save log settings.');
    } finally { setLSaving(false); }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none';
  const checkRow = (checked, onChange, label, sublabel) => (
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" checked={!!checked} onChange={onChange} className="w-4 h-4 rounded text-blue-600 mt-0.5 shrink-0" />
      <span className="text-sm text-gray-700">{label}{sublabel && <span className="block text-xs text-gray-500 mt-0.5">{sublabel}</span>}</span>
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
            {/* Tabs */}
            <div className="flex gap-0 mt-3">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 self-start mt-1">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* ── TAB: Backup ────────────────────────────────────────── */}
          {tab === 'backup' && (
            <div className="space-y-5">
              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Scheduled Backup</legend>
                {checkRow(bForm.enabled, e => setB('enabled', e.target.checked), 'Enable automatic daily backup')}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Backup time</label>
                    <input type="time" value={bForm.scheduleTime} onChange={e => setB('scheduleTime', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Retain backups (days)</label>
                    <input type="number" min={1} max={365} value={bForm.retentionDays}
                      onChange={e => setB('retentionDays', parseInt(e.target.value, 10))} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Backup destination folder</label>
                  <div className="flex gap-2">
                    <input type="text" value={bForm.destinationPath}
                      onChange={e => { setB('destinationPath', e.target.value); setTestResult(null); }}
                      placeholder="C:\VMS_Backups" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <Button variant="outline" size="sm" onClick={handleTestPath} loading={testing}>Test</Button>
                  </div>
                  {testResult && (
                    <p className={`mt-1 text-xs ${testResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.ok ? '✓' : '✗'} {testResult.msg}
                    </p>
                  )}
                </div>
              </fieldset>

              <fieldset className="space-y-3 border-t pt-4">
                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Storage Alerts</legend>
                {checkRow(bForm.alertEnabled, e => setB('alertEnabled', e.target.checked), 'Enable storage monitoring alerts')}
                {checkRow(bForm.autoBackupOnAlert, e => setB('autoBackupOnAlert', e.target.checked),
                  `Auto-backup when DB reaches alert level (${bForm.dbAlertThresholdPercent}%)`)}
                {checkRow(bForm.autoBackupOnCritical, e => {
                  if (!e.target.checked && !window.confirm('No automatic backup will be taken when the database is nearly full. Are you sure?')) return;
                  setB('autoBackupOnCritical', e.target.checked);
                }, `Auto-backup when DB reaches critical level (${bForm.dbCriticalThresholdPercent}%) — recommended`)}
              </fieldset>

              {bError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{bError}</div>}
            </div>
          )}

          {/* ── TAB: Data Retention ────────────────────────────────── */}
          {tab === 'retention' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                Purging <strong>permanently deletes</strong> old records from the database to free space within the
                10 GB SQL Server Express limit. Always take a backup before purging.
              </div>

              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Retention Period</legend>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Delete records older than (days)</label>
                  <input type="number" min={7} max={3650} value={rForm.retentionDays}
                    onChange={e => setR('retentionDays', parseInt(e.target.value, 10))} className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">Minimum 7 days. Only completed/expired/cancelled records are eligible.</p>
                </div>
              </fieldset>

              <fieldset className="space-y-3 border-t pt-4">
                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">What to Purge</legend>
                {checkRow(rForm.purgeInvitations, e => setR('purgeInvitations', e.target.checked),
                  'Invitations', 'Completed, cancelled, expired, and rejected visits')}
                {checkRow(rForm.purgeNotifications, e => setR('purgeNotifications', e.target.checked),
                  'Notification alerts', 'All alert history older than the retention period')}
                {checkRow(rForm.purgeAuditLogs, e => setR('purgeAuditLogs', e.target.checked),
                  'Audit logs', 'System audit trail entries (disable if compliance requires long retention)')}
                {checkRow(rForm.purgeOccupancyLogs, e => setR('purgeOccupancyLogs', e.target.checked),
                  'Occupancy logs', 'Historical occupancy/capacity tracking data')}
                {checkRow(rForm.shrinkDbAfterPurge, e => setR('shrinkDbAfterPurge', e.target.checked),
                  'Shrink database after purge', 'Runs DBCC SHRINKDATABASE to return freed pages to the OS (adds 1-5 min)')}
              </fieldset>

              <fieldset className="space-y-3 border-t pt-4">
                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Triggers</legend>
                {checkRow(rForm.autoPurgeAfterBackup, e => setR('autoPurgeAfterBackup', e.target.checked),
                  'Prompt to purge after each backup completes', 'Shows a preview and confirmation before any deletion')}
                {checkRow(rForm.scheduleEnabled, e => setR('scheduleEnabled', e.target.checked),
                  'Enable scheduled automatic purge')}
                {rForm.scheduleEnabled && (
                  <div className="grid grid-cols-2 gap-3 pl-7">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Run at</label>
                      <input type="time" value={rForm.scheduleTime} onChange={e => setR('scheduleTime', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Day</label>
                      <select value={rForm.scheduleDayOfWeek} onChange={e => setR('scheduleDayOfWeek', e.target.value)} className={inputCls}>
                        {['Daily','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </fieldset>

              {rError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{rError}</div>}
            </div>
          )}

          {/* ── TAB: Log Files ─────────────────────────────────────── */}
          {tab === 'logs' && (
            <div className="space-y-5">
              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Log File Retention</legend>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Delete log files older than (days)</label>
                  <input type="number" min={1} max={365} value={lForm.retentionDays}
                    onChange={e => setL('retentionDays', parseInt(e.target.value, 10))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Warn when log folder exceeds (MB)</label>
                  <input type="number" min={50} max={10240} value={lForm.maxFolderSizeMb}
                    onChange={e => setL('maxFolderSizeMb', parseInt(e.target.value, 10))} className={inputCls} />
                </div>
              </fieldset>

              <fieldset className="space-y-3 border-t pt-4">
                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Schedule</legend>
                {checkRow(lForm.scheduleEnabled, e => setL('scheduleEnabled', e.target.checked),
                  'Enable scheduled daily log cleanup')}
                {lForm.scheduleEnabled && (
                  <div className="pl-7">
                    <label className="block text-xs text-gray-500 mb-1">Run at</label>
                    <input type="time" value={lForm.scheduleTime} onChange={e => setL('scheduleTime', e.target.value)}
                      className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                )}
              </fieldset>

              {lError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{lError}</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {tab === 'backup'    && <Button onClick={handleSaveBackup}    loading={bSaving}>Save</Button>}
          {tab === 'retention' && <Button onClick={handleSaveRetention} loading={rSaving}>Save</Button>}
          {tab === 'logs'      && <Button onClick={handleSaveLogs}      loading={lSaving}>Save</Button>}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

const BackupPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('system');

  const [health, setHealth]           = useState(null);
  const [history, setHistory]         = useState([]);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('backup');
  const [error, setError]             = useState(null);

  const [retentionSettings, setRetentionSettings] = useState(null);
  const [logHealth, setLogHealth]     = useState(null);
  const [logSettings, setLogSettings] = useState(null);
  const [purgePreview, setPurgePreview] = useState(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purging, setPurging]         = useState(false);
  const [purgingLogs, setPurgingLogs] = useState(false);
  const [purgeResult, setPurgeResult] = useState(null);
  const [logPurgeResult, setLogPurgeResult] = useState(null);

  const pollRef = useRef(null);
  const prevWasRunningRef = useRef(false);

  useEffect(() => {
    dispatch(setPageTitle(t('backup.title', 'Backup & Storage')));
  }, [dispatch, t]);

  // ── Data loading ─────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    try {
      const [h, hist, retSt, lh, lSt] = await Promise.all([
        fetchHealth(), fetchHistory(20),
        fetchRetentionSettings(), fetchLogHealth(), fetchLogSettings(),
      ]);
      setHealth(h);
      setHistory(hist);
      setRetentionSettings(retSt);
      setLogHealth(lh);
      setLogSettings(lSt);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load backup data.');
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  // Adaptive polling: fast when a backup is running
  useEffect(() => {
    loadAll();
    const schedule = () => {
      const interval = health?.jobState?.isRunning ? POLL_ACTIVE_MS : POLL_IDLE_MS;
      pollRef.current = setTimeout(async () => { await loadAll(); schedule(); }, interval);
    };
    schedule();
    return () => clearTimeout(pollRef.current);
  }, [loadAll, health?.jobState?.isRunning]);

  // ── SignalR: real-time storage alerts ────────────────────────────────────

  useEffect(() => {
    const conn = signalRManager.connections?.get?.('admin');
    if (!conn) return;

    const handler = (payload) => {
      // Refresh health immediately when any storage alert arrives
      loadAll();
    };

    conn.on('StorageAlert', handler);
    return () => conn.off?.('StorageAlert', handler);
  }, [loadAll]);

  // Post-backup purge prompt: fires when backup transitions running → done
  useEffect(() => {
    const nowRunning = health?.jobState?.isRunning ?? false;
    if (prevWasRunningRef.current && !nowRunning && retentionSettings?.autoPurgeAfterBackup) {
      fetchPurgePreview().then(preview => {
        setPurgePreview(preview);
        if (preview?.totalRows > 0) setShowPurgeConfirm(true);
      }).catch(() => {});
    }
    prevWasRunningRef.current = nowRunning;
  }, [health?.jobState?.isRunning, retentionSettings?.autoPurgeAfterBackup]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleRunBackup = async () => {
    if (health?.jobState?.isRunning) return;
    setBackupLoading(true);
    try {
      await postExecute();
      // Start fast polling immediately
      await loadAll();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to start backup.';
      if (err.response?.status === 409) {
        alert('A backup is already in progress.');
      } else {
        setError(msg);
      }
    } finally {
      setBackupLoading(false);
    }
  };

  const handlePreviewPurge = async () => {
    try {
      const preview = await fetchPurgePreview();
      setPurgePreview(preview);
      setShowPurgeConfirm(true);
    } catch (e) {
      alert('Failed to load purge preview.');
    }
  };

  const handlePurge = async () => {
    setPurging(true); setPurgeResult(null);
    try {
      const res = await postPurge();
      setPurgeResult({ success: res.success, message: res.message });
      if (res.success) { setShowPurgeConfirm(false); await loadAll(); }
    } catch (e) {
      setPurgeResult({ success: false, message: e.response?.data?.message ?? 'Purge failed.' });
    } finally { setPurging(false); }
  };

  const handleLogPurge = async () => {
    if (!window.confirm(
      `Delete log files older than ${logSettings?.retentionDays ?? 30} days? This cannot be undone.`
    )) return;
    setPurgingLogs(true); setLogPurgeResult(null);
    try {
      const res = await postLogPurge();
      setLogPurgeResult({ success: res.success, message: res.message });
      if (res.success) await loadAll();
    } catch (e) {
      setLogPurgeResult({ success: false, message: e.response?.data?.message ?? 'Log purge failed.' });
    } finally { setPurgingLogs(false); }
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const db = health?.database;
  const drives = health?.drives ?? [];
  const jobState = health?.jobState;
  const settings = health?.settings;
  const warnings = health?.activeWarnings ?? [];
  const overallStatus = health?.overallStatus ?? 'Healthy';
  const isRunning = jobState?.isRunning ?? false;
  const isExpressBound = db?.isExpressEdition;

  const worstDriveAlert = drives.reduce((worst, d) => {
    const levels = ['None', 'Warning', 'High', 'Critical'];
    return levels.indexOf(d.alertLevel) > levels.indexOf(worst) ? d.alertLevel : worst;
  }, 'None');

  const overallAlertLevel = overallStatus === 'Critical' ? 'Critical'
    : overallStatus === 'Warning'  ? 'Warning'
    : 'None';

  // ── Render ────────────────────────────────────────────────────────────────

  if (loadingHealth && !health) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('backup.title', 'Backup & Storage')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('backup.subtitle', 'Monitor database storage, disk space, and manage backups.')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button variant="outline" onClick={loadAll} icon={<ArrowPathIcon className="w-5 h-5" />}>
            {t('backup.refresh', 'Refresh')}
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(true)} icon={<Cog6ToothIcon className="w-5 h-5" />}>
            {t('backup.configureSettings', 'Settings')}
          </Button>
          <Button
            onClick={handleRunBackup}
            loading={backupLoading || isRunning}
            disabled={isRunning}
            icon={<CloudArrowUpIcon className="w-5 h-5" />}
          >
            {isRunning ? 'Backup Running…' : t('backup.createBackup', 'Backup Now')}
          </Button>
        </div>
      </div>

      {/* ── System health banner ── */}
      {warnings.length > 0 && (
        <div className={`rounded-xl border p-4 ${ALERT_LEVEL_BG[overallAlertLevel] || ALERT_LEVEL_BG.Warning}`}>
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">
                {overallStatus === 'Critical' ? 'Critical Storage Alert' : 'Storage Warning'}
              </p>
              <ul className="text-sm space-y-0.5 list-disc list-inside">
                {warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="rounded-xl border bg-red-50 border-red-200 p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* ── Active backup progress ── */}
      {isRunning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-4 bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Backup in progress</p>
                <p className="text-xs text-blue-600">
                  {jobState?.currentTriggerType ?? 'Running'} — started{' '}
                  {jobState?.startedAt ? formatters.formatRelativeTime(new Date(jobState.startedAt)) : 'just now'}.
                  Page will refresh automatically.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DB storage */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                db?.alertLevel === 'Critical' ? 'bg-red-100' : db?.alertLevel === 'High' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                <CircleStackIcon className={`w-5 h-5 ${
                  db?.alertLevel === 'Critical' ? 'text-red-600' : db?.alertLevel === 'High' ? 'text-orange-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Database (Data)</p>
                <p className="text-lg font-bold text-gray-900">
                  {db ? `${(db.totalDataAllocatedMb / 1024).toFixed(1)} GB` : '—'}
                </p>
              </div>
            </div>
            {isExpressBound && db && (
              <StorageBar
                label={`Express limit: ${(db.expressLimitMb / 1024).toFixed(0)} GB`}
                usedMb={db.totalDataAllocatedMb}
                totalMb={db.expressLimitMb}
                usedPercent={db.usagePercent}
                alertLevel={db.alertLevel}
              />
            )}
            {!isExpressBound && db && (
              <p className="text-xs text-gray-500">No size limit ({db.sqlEdition?.split(' ')[0]})</p>
            )}
          </Card>
        </motion.div>

        {/* Log file */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <ServerIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Transaction Log</p>
                <p className="text-lg font-bold text-gray-900">
                  {db ? `${(db.totalLogAllocatedMb / 1024).toFixed(1)} GB` : '—'}
                </p>
                <p className="text-xs text-gray-400">{db?.recoveryModel ?? ''} recovery</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Backup drive */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                worstDriveAlert === 'Critical' ? 'bg-red-100' : worstDriveAlert === 'Warning' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <ServerIcon className={`w-5 h-5 ${
                  worstDriveAlert === 'Critical' ? 'text-red-600' : worstDriveAlert === 'Warning' ? 'text-yellow-600' : 'text-green-600'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Disk Space</p>
                {drives.length === 0 && <p className="text-sm text-gray-400">—</p>}
                {drives.slice(0, 1).map(d => (
                  <p key={d.driveLetter} className="text-sm font-bold text-gray-900">
                    {(d.freeBytes / (1024 ** 3)).toFixed(1)} GB free
                  </p>
                ))}
              </div>
            </div>
            {drives.slice(0, 1).map(d => (
              <StorageBar
                key={d.driveLetter}
                label={`${d.driveLetter} — ${d.purpose}`}
                usedMb={(d.totalBytes - d.freeBytes) / (1024 * 1024)}
                totalMb={d.totalBytes / (1024 * 1024)}
                usedPercent={100 - d.freePercent}
                alertLevel={d.alertLevel}
              />
            ))}
          </Card>
        </motion.div>

        {/* Last backup */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                {health?.lastSuccess
                  ? <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  : <XCircleIcon className="w-5 h-5 text-gray-400" />}
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Backup</p>
                <p className="text-sm font-bold text-gray-900">
                  {health?.lastSuccess?.completedAt
                    ? formatters.formatRelativeTime(new Date(health.lastSuccess.completedAt))
                    : 'Never'}
                </p>
                {health?.lastSuccess && (
                  <p className="text-xs text-gray-400">{health.lastSuccess.fileSizeDisplay}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Schedule + Auto-backup info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Scheduled Backup</h3>
              <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Auto-backup</span>
                <Badge color={settings?.enabled ? 'green' : 'red'} size="sm">
                  {settings?.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Schedule</span>
                <span className="font-medium text-gray-900">{settings?.scheduleTime ?? '—'} daily</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Retention</span>
                <span className="font-medium text-gray-900">{settings?.retentionDays ?? '—'} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Destination</span>
                <span className="font-medium text-gray-900 truncate max-w-xs text-right" title={settings?.destinationPath}>
                  {settings?.destinationPath ?? '—'}
                </span>
              </div>
              {health?.nextScheduledAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Next run</span>
                  <span className="font-medium text-gray-900">
                    {formatters.formatRelativeTime(new Date(health.nextScheduledAt))}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button variant="outline" fullWidth onClick={() => setShowSettings(true)}>
                Configure Settings
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Storage Alert Triggers</h3>
              <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Storage monitoring</span>
                <Badge color={settings?.alertEnabled ? 'green' : 'gray'} size="sm">
                  {settings?.alertEnabled ? 'Active' : 'Off'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">
                  Auto-backup at {settings?.dbAlertThresholdPercent ?? 85}% DB usage
                </span>
                <Badge color={settings?.autoBackupOnAlert ? 'blue' : 'gray'} size="sm">
                  {settings?.autoBackupOnAlert ? 'On' : 'Off'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">
                  Auto-backup at {settings?.dbCriticalThresholdPercent ?? 95}% DB usage
                </span>
                <Badge color={settings?.autoBackupOnCritical ? 'green' : 'red'} size="sm">
                  {settings?.autoBackupOnCritical ? 'On' : 'Disabled ⚠️'}
                </Badge>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              A backup provides a recovery point but does <strong>not</strong> free database space. To reduce
              DB size you must archive or delete old records.
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Database file detail ── */}
      {db?.files?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Database Files</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['File', 'Type', 'Allocated', 'Used', 'Free (inside)', 'Growth', 'Path'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {db.files.map((f, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{f.fileName}</td>
                      <td className="px-4 py-2">
                        <Badge color={f.fileType === 'ROWS' ? 'blue' : 'purple'} size="sm">{f.fileType}</Badge>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{f.allocatedMb?.toFixed(0)} MB</td>
                      <td className="px-4 py-2 text-gray-700">{f.usedMb?.toFixed(0)} MB</td>
                      <td className="px-4 py-2 text-gray-500">{f.freeMbInsideFile?.toFixed(0)} MB</td>
                      <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{f.growthSetting}</td>
                      <td className="px-4 py-2 text-gray-400 truncate max-w-xs" title={f.physicalPath}>{f.physicalPath}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Backup history ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Backup History</h3>
            <ClockIcon className="w-5 h-5 text-gray-400" />
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No backups on record yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Trigger', 'By', 'Started', 'Duration', 'Size', 'Status', 'File'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {history.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${b.triggerType === 'Manual' ? 'bg-green-500' : b.triggerType === 'StorageAlert' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                          {b.triggerType}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{b.triggeredByDisplay}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatters.formatDateTime(new Date(b.startedAt))}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.durationDisplay}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.fileSizeDisplay}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <StatusDot status={b.status} />
                          <span className="text-sm text-gray-700">{b.status}</span>
                        </div>
                        {b.errorMessage && (
                          <p className="text-xs text-red-500 mt-0.5 truncate max-w-xs" title={b.errorMessage}>{b.errorMessage}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 truncate max-w-xs" title={b.filePath}>
                        {b.fileName ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Data Retention ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.43 }}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrashIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Data Retention</h3>
                <p className="text-xs text-gray-500">
                  Purge old records to free DB space within the 10 GB Express limit ·{' '}
                  {retentionSettings?.retentionDays ?? 90}-day retention period
                </p>
              </div>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => { setSettingsInitialTab('retention'); setShowSettings(true); }}
              icon={<Cog6ToothIcon className="w-4 h-4" />}
            >Configure</Button>
          </div>

          {purgePreview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Invitations', count: purgePreview.invitationsToDelete, enabled: retentionSettings?.purgeInvitations },
                { label: 'Notifications', count: purgePreview.notificationsToDelete, enabled: retentionSettings?.purgeNotifications },
                { label: 'Audit logs', count: purgePreview.auditLogsToDelete, enabled: retentionSettings?.purgeAuditLogs },
                { label: 'Occupancy logs', count: purgePreview.occupancyLogsToDelete, enabled: retentionSettings?.purgeOccupancyLogs },
              ].map(({ label, count, enabled }) => (
                <div key={label} className={`rounded-lg border p-3 text-center ${enabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                  <p className="text-2xl font-bold text-gray-900">{count != null ? count.toLocaleString() : '—'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  {!enabled && <p className="text-xs text-gray-400 italic">skipped</p>}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline" size="sm"
              onClick={handlePreviewPurge}
              icon={<ArrowPathIcon className="w-4 h-4" />}
            >
              {purgePreview ? 'Refresh preview' : 'Preview eligible records'}
            </Button>
            {purgePreview && (
              <Button
                size="sm"
                variant={purgePreview.totalRows > 0 ? 'danger' : 'outline'}
                disabled={purgePreview.totalRows === 0}
                onClick={() => purgePreview.totalRows > 0 && setShowPurgeConfirm(true)}
                icon={<TrashIcon className="w-4 h-4" />}
              >
                {purgePreview.totalRows > 0
                  ? `Purge ${purgePreview.totalRows.toLocaleString()} records`
                  : 'Nothing to purge'}
              </Button>
            )}
          </div>

          <div className="mt-3 flex items-center gap-5 text-xs text-gray-500">
            <span>Auto-purge after backup: <strong>{retentionSettings?.autoPurgeAfterBackup ? 'On' : 'Off'}</strong></span>
            <span>Scheduled: <strong>
              {retentionSettings?.scheduleEnabled
                ? `${retentionSettings.scheduleTime} · ${retentionSettings.scheduleDayOfWeek}`
                : 'Off'}
            </strong></span>
          </div>

          {purgeResult && (
            <div className={`mt-3 rounded-lg p-3 text-sm border ${purgeResult.success
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'}`}>
              {purgeResult.message}
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Log Files ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                logHealth?.alertLevel === 'Critical' ? 'bg-red-100'
                : logHealth?.alertLevel === 'Warning' ? 'bg-yellow-100' : 'bg-indigo-100'}`}>
                <DocumentTextIcon className={`w-5 h-5 ${
                  logHealth?.alertLevel === 'Critical' ? 'text-red-600'
                  : logHealth?.alertLevel === 'Warning' ? 'text-yellow-600' : 'text-indigo-600'}`} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Log Files</h3>
                <p className="text-xs text-gray-500">
                  {logHealth
                    ? `${logHealth.fileCount} files · ${logHealth.totalSizeDisplay}`
                    : 'Backend application logs (Serilog)'}
                </p>
              </div>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => { setSettingsInitialTab('logs'); setShowSettings(true); }}
              icon={<Cog6ToothIcon className="w-4 h-4" />}
            >Configure</Button>
          </div>

          {logHealth && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg border bg-gray-50 p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{logHealth.fileCount}</p>
                <p className="text-xs text-gray-500">Files</p>
              </div>
              <div className="rounded-lg border bg-gray-50 p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{logHealth.totalSizeDisplay}</p>
                <p className="text-xs text-gray-500">Total size</p>
              </div>
              <div className={`rounded-lg border p-3 text-center ${
                logHealth.alertLevel !== 'None' ? (ALERT_LEVEL_BG[logHealth.alertLevel] ?? 'bg-gray-50') : 'bg-gray-50'}`}>
                <p className="text-sm font-bold">{logHealth.alertLevel}</p>
                <p className="text-xs text-gray-500">Alert level</p>
              </div>
            </div>
          )}

          {logHealth?.oldestFileDate && (
            <p className="text-xs text-gray-400 mb-3">
              Oldest: {formatters.formatDateTime(new Date(logHealth.oldestFileDate))}
              {logHealth.newestFileDate && ` · Newest: ${formatters.formatDateTime(new Date(logHealth.newestFileDate))}`}
              {logHealth.folderPath && <> · <span className="font-mono">{logHealth.folderPath}</span></>}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline" size="sm"
              onClick={handleLogPurge}
              loading={purgingLogs}
              disabled={!logHealth || logHealth.fileCount === 0}
              icon={<TrashIcon className="w-4 h-4" />}
            >
              Purge Old Logs
            </Button>
            <span className="text-xs text-gray-500">
              Scheduled: <strong>
                {logSettings?.scheduleEnabled ? `daily at ${logSettings.scheduleTime}` : 'Off'}
              </strong>
            </span>
          </div>

          {logPurgeResult && (
            <div className={`mt-3 rounded-lg p-3 text-sm border ${logPurgeResult.success
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'}`}>
              {logPurgeResult.message}
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Restore guidance ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card className="p-4 bg-yellow-50 border border-yellow-200">
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Restore Guidance</p>
              <p>
                To restore a backup: <strong>(1)</strong> Stop the VMS application.{' '}
                <strong>(2)</strong> Open SQL Server Management Studio.{' '}
                <strong>(3)</strong> Use <em>Restore Database</em> from the .bak file located at{' '}
                <code className="bg-yellow-100 px-1 rounded">{settings?.destinationPath ?? 'configured backup path'}</code>.{' '}
                <strong>(4)</strong> Active connections must be closed before restoration can proceed.
              </p>
              <p className="mt-1 text-xs text-yellow-700">
                ⚠ Do not restore while the application is running. Back up files offsite for disaster recovery — local backups only protect against data loss, not against hardware failure.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Purge confirmation modal ── */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <TrashIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Confirm Data Purge</h3>
                <p className="text-xs text-gray-500">This action permanently deletes records and cannot be undone.</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 mb-4">
              <strong>{purgePreview?.totalRows?.toLocaleString() ?? '?'} records</strong> older than{' '}
              {retentionSettings?.retentionDays ?? 90} days will be permanently deleted.
              Ensure you have a recent backup before proceeding.
            </div>
            {purgeResult && !purgeResult.success && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                {purgeResult.message}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowPurgeConfirm(false); setPurgeResult(null); }}>Cancel</Button>
              <Button
                variant="danger"
                onClick={handlePurge}
                loading={purging}
                icon={<TrashIcon className="w-4 h-4" />}
              >
                Delete Records
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings modal ── */}
      {showSettings && settings && (
        <SettingsModal
          settings={settings}
          retentionSettings={retentionSettings}
          logSettings={logSettings}
          initialTab={settingsInitialTab}
          onClose={() => { setShowSettings(false); setSettingsInitialTab('backup'); }}
          onSaved={loadAll}
        />
      )}
    </div>
  );
};

export default BackupPage;
