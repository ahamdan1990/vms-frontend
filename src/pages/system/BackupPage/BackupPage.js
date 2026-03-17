// src/pages/system/BackupPage/BackupPage.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setPageTitle } from '../../../store/slices/uiSlice';

import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';

import {
  CloudArrowUpIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

import formatters from '../../../utils/formatters';

/**
 * Professional System Backup Management Page
 * Handles database backups, system exports, and data recovery operations
 */
const BackupPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('system');

  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupHistory, setBackupHistory] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    databaseSize: '2.3 GB',
    lastAutoBackup: new Date(Date.now() - 2 * 60 * 60 * 1000),
    nextScheduledBackup: new Date(Date.now() + 10 * 60 * 60 * 1000),
    backupRetention: 30,
    autoBackupEnabled: true
  });

  useEffect(() => {
    dispatch(setPageTitle(t('backup.title')));
    loadBackupHistory();
  }, [dispatch, t]);

  const loadBackupHistory = async () => {
    const mockHistory = [
      {
        id: 1,
        type: 'automatic',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        size: '2.3 GB',
        status: 'completed',
        duration: '4m 32s'
      },
      {
        id: 2,
        type: 'manual',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        size: '2.1 GB',
        status: 'completed',
        duration: '3m 45s'
      },
      {
        id: 3,
        type: 'automatic',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        size: '2.0 GB',
        status: 'completed',
        duration: '4m 12s'
      }
    ];

    setBackupHistory(mockHistory);
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newBackup = {
        id: Date.now(),
        type: 'manual',
        createdAt: new Date(),
        size: systemStatus.databaseSize,
        status: 'completed',
        duration: '4m 15s'
      };

      setBackupHistory(prev => [newBackup, ...prev]);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    setRestoreLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setRestoreLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge color="green" size="sm">{t('backup.status_completed')}</Badge>;
      case 'inProgress':
        return <Badge color="blue" size="sm">{t('backup.status_inProgress')}</Badge>;
      case 'failed':
        return <Badge color="red" size="sm">{t('backup.status_failed')}</Badge>;
      default:
        return <Badge color="gray" size="sm">{t('backup.status_unknown')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('backup.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('backup.subtitle')}
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button
            variant="outline"
            onClick={() => loadBackupHistory()}
            icon={<Cog6ToothIcon className="w-5 h-5" />}
          >
            {t('backup.refresh')}
          </Button>

          <Button
            onClick={handleCreateBackup}
            loading={backupLoading}
            icon={<CloudArrowUpIcon className="w-5 h-5" />}
          >
            {t('backup.createBackup')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CloudArrowUpIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="ms-4">
                <h3 className="text-sm font-medium text-gray-600">{t('backup.databaseSize')}</h3>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.databaseSize}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="ms-4">
                <h3 className="text-sm font-medium text-gray-600">{t('backup.lastBackup')}</h3>
                <p className="text-lg font-bold text-gray-900">
                  {formatters.formatRelativeTime(systemStatus.lastAutoBackup)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="ms-4">
                <h3 className="text-sm font-medium text-gray-600">{t('backup.nextBackup')}</h3>
                <p className="text-lg font-bold text-gray-900">
                  {formatters.formatRelativeTime(systemStatus.nextScheduledBackup)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="ms-4">
                <h3 className="text-sm font-medium text-gray-600">{t('backup.retention')}</h3>
                <p className="text-2xl font-bold text-gray-900">{t('backup.retentionDays', { count: systemStatus.backupRetention })}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('backup.manualBackup')}</h3>
              <CloudArrowUpIcon className="w-6 h-6 text-gray-400" />
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {t('backup.manualBackupDesc')}
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleCreateBackup}
                loading={backupLoading}
                fullWidth
                icon={<CloudArrowUpIcon className="w-5 h-5" />}
              >
                {backupLoading ? t('backup.creatingBackup') : t('backup.createFullBackup')}
              </Button>

              <Button
                variant="outline"
                fullWidth
                icon={<DocumentArrowDownIcon className="w-5 h-5" />}
              >
                {t('backup.exportDataOnly')}
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('backup.automaticBackup')}</h3>
              <Cog6ToothIcon className="w-6 h-6 text-gray-400" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('backup.autoBackupStatus')}</span>
                <Badge color={systemStatus.autoBackupEnabled ? 'green' : 'red'} size="sm">
                  {systemStatus.autoBackupEnabled ? t('backup.enabled') : t('backup.disabled')}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('backup.backupSchedule')}</span>
                <span className="text-sm font-medium text-gray-900">{t('backup.scheduleValue')}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('backup.retentionPeriod')}</span>
                <span className="text-sm font-medium text-gray-900">{t('backup.retentionDays', { count: systemStatus.backupRetention })}</span>
              </div>

              <div className="pt-2">
                <Button variant="outline" fullWidth>
                  {t('backup.configureSettings')}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('backup.backupHistory')}</h3>
            <Button variant="outline" size="sm">
              {t('backup.viewAll')}
            </Button>
          </div>

          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('backup.type')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('backup.created')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('backup.size')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('backup.duration')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('backup.status')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('backup.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backupHistory.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full me-2 ${
                          backup.type === 'automatic' ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {backup.type === 'automatic' ? t('backup.type_automatic') : t('backup.type_manual')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatters.formatDateTime(backup.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(backup.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreBackup(backup.id)}
                          disabled={restoreLoading}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          {restoreLoading ? t('backup.restoring') : t('backup.restore')}
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                          {t('backup.download')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="p-4 bg-yellow-50 border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ms-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {t('backup.warningTitle')}
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('backup.warning1')}</li>
                  <li>{t('backup.warning2')}</li>
                  <li>{t('backup.warning3')}</li>
                  <li>{t('backup.warning4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default BackupPage;
