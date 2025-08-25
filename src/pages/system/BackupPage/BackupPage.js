// src/pages/system/BackupPage/BackupPage.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/slices/uiSlice';

// Components
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';

// Icons
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// Utils
import formatters from '../../../utils/formatters';

/**
 * Professional System Backup Management Page
 * Handles database backups, system exports, and data recovery operations
 */
const BackupPage = () => {
  const dispatch = useDispatch();
  
  // State management
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupHistory, setBackupHistory] = useState([]);
  const [lastBackup, setLastBackup] = useState(null);
  const [systemStatus, setSystemStatus] = useState({
    databaseSize: '2.3 GB',
    lastAutoBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    nextScheduledBackup: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours from now
    backupRetention: 30, // days
    autoBackupEnabled: true
  });

  useEffect(() => {
    dispatch(setPageTitle('System Backup'));
    loadBackupHistory();
  }, [dispatch]);

  const loadBackupHistory = async () => {
    // Mock backup history - replace with actual API call
    const mockHistory = [
      {
        id: 1,
        type: 'Automatic',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        size: '2.3 GB',
        status: 'Completed',
        duration: '4m 32s'
      },
      {
        id: 2,
        type: 'Manual',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        size: '2.1 GB', 
        status: 'Completed',
        duration: '3m 45s'
      },
      {
        id: 3,
        type: 'Automatic',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        size: '2.0 GB',
        status: 'Completed', 
        duration: '4m 12s'
      }
    ];
    
    setBackupHistory(mockHistory);
    setLastBackup(mockHistory[0]);
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    try {
      // Mock backup creation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup = {
        id: Date.now(),
        type: 'Manual',
        createdAt: new Date(),
        size: systemStatus.databaseSize,
        status: 'Completed',
        duration: '4m 15s'
      };
      
      setBackupHistory(prev => [newBackup, ...prev]);
      setLastBackup(newBackup);
      
      // You would show a success toast here
      console.log('✅ Backup created successfully');
    } catch (error) {
      console.error('❌ Backup failed:', error);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId) => {
    setRestoreLoading(true);
    try {
      // Mock restore operation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ System restored successfully');
    } catch (error) {
      console.error('❌ Restore failed:', error);
    } finally {
      setRestoreLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge color="green" size="sm">Completed</Badge>;
      case 'In Progress':
        return <Badge color="blue" size="sm">In Progress</Badge>;
      case 'Failed':
        return <Badge color="red" size="sm">Failed</Badge>;
      default:
        return <Badge color="gray" size="sm">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Backup</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage database backups, system exports, and data recovery
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => loadBackupHistory()}
            icon={<Cog6ToothIcon className="w-5 h-5" />}
          >
            Refresh
          </Button>
          
          <Button
            onClick={handleCreateBackup}
            loading={backupLoading}
            icon={<CloudArrowUpIcon className="w-5 h-5" />}
          >
            Create Backup
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
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
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Database Size</h3>
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
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Last Backup</h3>
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
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Next Backup</h3>
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
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Retention</h3>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.backupRetention} days</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Backup Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Backup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manual Backup</h3>
              <CloudArrowUpIcon className="w-6 h-6 text-gray-400" />
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Create an immediate backup of the entire database and system configuration.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleCreateBackup}
                loading={backupLoading}
                fullWidth
                icon={<CloudArrowUpIcon className="w-5 h-5" />}
              >
                {backupLoading ? 'Creating Backup...' : 'Create Full Backup'}
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                icon={<DocumentArrowDownIcon className="w-5 h-5" />}
              >
                Export Data Only
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Automatic Backup Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Automatic Backup</h3>
              <Cog6ToothIcon className="w-6 h-6 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto Backup Status</span>
                <Badge color={systemStatus.autoBackupEnabled ? "green" : "red"} size="sm">
                  {systemStatus.autoBackupEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backup Schedule</span>
                <span className="text-sm font-medium text-gray-900">Daily at 2:00 AM</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Retention Period</span>
                <span className="text-sm font-medium text-gray-900">{systemStatus.backupRetention} days</span>
              </div>
              
              <div className="pt-2">
                <Button variant="outline" fullWidth>
                  Configure Settings
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Backup History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Backup History</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backupHistory.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          backup.type === 'Automatic' ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900">{backup.type}</span>
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRestoreBackup(backup.id)}
                          disabled={restoreLoading}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          {restoreLoading ? 'Restoring...' : 'Restore'}
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                          Download
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

      {/* Warning Notice */}
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
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Backup Information
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Backup operations may temporarily affect system performance</li>
                  <li>Large backups will be compressed automatically to save storage space</li>
                  <li>Restore operations will require system maintenance mode</li>
                  <li>Always verify backup integrity before relying on them for recovery</li>
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