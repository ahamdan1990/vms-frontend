// src/pages/admin/ExcelManagementPage.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Components
import ExcelInvitationManager from '../../components/excel/ExcelInvitationManager';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';

// Icons
import {
  DocumentArrowUpIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Utils
import formatters from '../../utils/formatters';

/**
 * Excel Management Page for Administrators
 * Provides comprehensive Excel-based invitation management including:
 * - Template downloads and customization
 * - Excel file upload and processing
 * - Email template distribution
 * - Processing results and statistics
 */
const ExcelManagementPage = () => {
  const { t } = useTranslation('invitations');

  // State for processing results and statistics
  const [recentProcessing, setRecentProcessing] = useState([]);
  const [processingStats, setProcessingStats] = useState({
    totalProcessed: 0,
    successfulInvitations: 0,
    failedInvitations: 0,
    newVisitors: 0,
    existingVisitors: 0
  });

  // Handle invitation processing results
  const handleInvitationProcessed = (result) => {
    const processedItem = {
      id: Date.now(),
      timestamp: new Date(),
      result,
      status: result.success ? 'success' : 'error'
    };

    setRecentProcessing((prev) => [processedItem, ...prev.slice(0, 9)]);

    if (result.success && result.summary) {
      setProcessingStats((prev) => ({
        totalProcessed: prev.totalProcessed + 1,
        successfulInvitations: prev.successfulInvitations + (result.summary.submittedInvitations || 0) + (result.summary.draftInvitations || 0),
        failedInvitations: prev.failedInvitations,
        newVisitors: prev.newVisitors + (result.summary.newVisitors || 0),
        existingVisitors: prev.existingVisitors + (result.summary.existingVisitors || 0)
      }));
      return;
    }

    setProcessingStats((prev) => ({
      ...prev,
      totalProcessed: prev.totalProcessed + 1,
      failedInvitations: prev.failedInvitations + 1
    }));
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('excel.stats.filesProcessed')}</h3>
            <p className="text-2xl font-bold text-blue-600">{processingStats.totalProcessed}</p>
          </div>
          <DocumentArrowUpIcon className="w-8 h-8 text-blue-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('excel.stats.invitationsCreated')}</h3>
            <p className="text-2xl font-bold text-green-600">{processingStats.successfulInvitations}</p>
          </div>
          <CheckCircleIcon className="w-8 h-8 text-green-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('excel.stats.newVisitors')}</h3>
            <p className="text-2xl font-bold text-purple-600">{processingStats.newVisitors}</p>
          </div>
          <UsersIcon className="w-8 h-8 text-purple-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('excel.stats.processingErrors')}</h3>
            <p className="text-2xl font-bold text-red-600">{processingStats.failedInvitations}</p>
          </div>
          <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
        </div>
      </Card>
    </div>
  );

  const renderRecentActivity = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('excel.recentActivity.title')}</h3>

      {recentProcessing.length === 0 ? (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{t('excel.recentActivity.empty')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('excel.recentActivity.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentProcessing.map((item) => (
            <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color={item.status === 'success' ? 'green' : 'red'}>
                      {item.status === 'success' ? t('excel.recentActivity.success') : t('excel.recentActivity.error')}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatters.dateTime(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
                    {item.result.message || (item.status === 'success' ? t('excel.recentActivity.processedSuccessfully') : t('excel.recentActivity.processingFailed'))}
                  </p>

                  {item.result.summary && (
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <p>
                        {t('excel.recentActivity.visitors', {
                          newCount: item.result.summary.newVisitors || 0,
                          existingCount: item.result.summary.existingVisitors || 0
                        })}
                      </p>
                      <p>
                        {t('excel.recentActivity.invitations', {
                          submittedCount: item.result.summary.submittedInvitations || 0,
                          draftCount: item.result.summary.draftInvitations || 0
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ms-4">
                  {item.status === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                  {item.status === 'error' && <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const renderUsageInstructions = () => (
    <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
      <div className="flex items-start gap-3">
        <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-300 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">{t('excel.guide.title')}</h4>

          <div className="space-y-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h5 className="font-medium mb-1">{t('excel.guide.downloadTitle')}</h5>
              <p>{t('excel.guide.downloadDesc')}</p>
            </div>
            <div>
              <h5 className="font-medium mb-1">{t('excel.guide.fillTitle')}</h5>
              <p>{t('excel.guide.fillDesc')}</p>
            </div>
            <div>
              <h5 className="font-medium mb-1">{t('excel.guide.uploadTitle')}</h5>
              <p>{t('excel.guide.uploadDesc')}</p>
            </div>
            <div>
              <h5 className="font-medium mb-1">{t('excel.guide.emailTitle')}</h5>
              <p>{t('excel.guide.emailDesc')}</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded border border-blue-300 dark:border-blue-700">
            <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-1">{t('excel.guide.bestPractices')}</h6>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>- {t('excel.guide.practice1')}</li>
              <li>- {t('excel.guide.practice2')}</li>
              <li>- {t('excel.guide.practice3')}</li>
              <li>- {t('excel.guide.practice4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('excel.pageTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{t('excel.pageSubtitle')}</p>
      </div>

      {renderStatsCards()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ExcelInvitationManager
            onInvitationProcessed={handleInvitationProcessed}
            className="h-full"
          />
        </div>

        <div className="space-y-6">
          {renderUsageInstructions()}
          {renderRecentActivity()}
        </div>
      </div>
    </div>
  );
};

export default ExcelManagementPage;
