// src/pages/admin/ExcelManagementPage.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Components
import ExcelInvitationManager from '../../components/excel/ExcelInvitationManager';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';

// Icons
import {
  DocumentArrowDownIcon,
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
    // Add to recent processing list
    const processedItem = {
      id: Date.now(),
      timestamp: new Date(),
      result: result,
      status: result.success ? 'success' : 'error'
    };

    setRecentProcessing(prev => [processedItem, ...prev.slice(0, 9)]); // Keep last 10

    // Update statistics
    if (result.success && result.summary) {
      setProcessingStats(prev => ({
        totalProcessed: prev.totalProcessed + 1,
        successfulInvitations: prev.successfulInvitations + (result.summary.submittedInvitations || 0) + (result.summary.draftInvitations || 0),
        failedInvitations: prev.failedInvitations,
        newVisitors: prev.newVisitors + (result.summary.newVisitors || 0),
        existingVisitors: prev.existingVisitors + (result.summary.existingVisitors || 0)
      }));
    } else {
      setProcessingStats(prev => ({
        ...prev,
        totalProcessed: prev.totalProcessed + 1,
        failedInvitations: prev.failedInvitations + 1
      }));
    }
  };

  // Render statistics cards
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Files Processed</h3>
            <p className="text-2xl font-bold text-blue-600">{processingStats.totalProcessed}</p>
          </div>
          <DocumentArrowUpIcon className="w-8 h-8 text-blue-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Invitations Created</h3>
            <p className="text-2xl font-bold text-green-600">{processingStats.successfulInvitations}</p>
          </div>
          <CheckCircleIcon className="w-8 h-8 text-green-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">New Visitors</h3>
            <p className="text-2xl font-bold text-purple-600">{processingStats.newVisitors}</p>
          </div>
          <UsersIcon className="w-8 h-8 text-purple-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Processing Errors</h3>
            <p className="text-2xl font-bold text-red-600">{processingStats.failedInvitations}</p>
          </div>
          <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
        </div>
      </Card>
    </div>
  );

  // Render recent processing activity
  const renderRecentActivity = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Processing Activity</h3>
      
      {recentProcessing.length === 0 ? (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No recent Excel processing activity</p>
          <p className="text-sm text-gray-400 mt-1">Upload Excel files to see processing results here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentProcessing.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge color={item.status === 'success' ? 'green' : 'red'}>
                      {item.status === 'success' ? 'Success' : 'Error'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatters.dateTime(item.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-1">
                    {item.result.message || (item.status === 'success' ? 'Excel file processed successfully' : 'Excel processing failed')}
                  </p>
                  
                  {item.result.summary && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        Visitors: {item.result.summary.newVisitors || 0} new, {item.result.summary.existingVisitors || 0} existing
                      </p>
                      <p>
                        Invitations: {item.result.summary.submittedInvitations || 0} submitted, {item.result.summary.draftInvitations || 0} draft
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  {item.status === 'success' && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  )}
                  {item.status === 'error' && (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  // Render usage instructions
  const renderUsageInstructions = () => (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <div className="flex items-start space-x-3">
        <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-blue-900 mb-3">Excel Invitation Management Guide</h4>
          
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <h5 className="font-medium mb-1">📥 Download Templates</h5>
              <p>Download Excel templates with pre-configured fields and dropdown lists. Choose between single visitor or multiple visitors per meeting.</p>
            </div>
            
            <div>
              <h5 className="font-medium mb-1">✏️ Fill Templates Offline</h5>
              <p>Complete the Excel template offline. Required fields are highlighted in red. Use dropdown lists for consistent data entry.</p>
            </div>
            
            <div>
              <h5 className="font-medium mb-1">📤 Upload & Process</h5>
              <p>Upload completed templates for automatic processing. The system will create visitors and invitations, then provide a detailed summary.</p>
            </div>
            
            <div>
              <h5 className="font-medium mb-1">📧 Email Templates</h5>
              <p>Send templates directly to hosts via email. Include custom messages and choose template types based on meeting requirements.</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
            <h6 className="font-medium text-blue-900 mb-1">Best Practices:</h6>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Validate data before uploading (check email formats, phone numbers)</li>
              <li>• Use existing visitor data when possible to avoid duplicates</li>
              <li>• Review generated invitations and approve as needed</li>
              <li>• Keep template files under 10MB for optimal performance</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Excel Invitation Management</h1>
        <p className="text-gray-600 mt-2">
          Manage visitor invitations using Excel templates for bulk processing and offline workflow
        </p>
      </div>

      {/* Statistics */}
      {renderStatsCards()}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Excel Manager - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <ExcelInvitationManager 
            onInvitationProcessed={handleInvitationProcessed}
            className="h-full"
          />
        </div>

        {/* Sidebar - Takes 1/3 of the space */}
        <div className="space-y-6">
          {/* Usage Instructions */}
          {renderUsageInstructions()}
          
          {/* Recent Activity */}
          {renderRecentActivity()}
        </div>
      </div>
    </div>
  );
};

export default ExcelManagementPage;
