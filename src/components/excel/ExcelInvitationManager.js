// src/components/excel/ExcelInvitationManager.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// Services
import excelService from '../../services/excelService';

// Components
import Card from '../common/Card/Card';
import Button from '../common/Button/Button';
import Input from '../common/Input/Input';
import Badge from '../common/Badge/Badge';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import FileUpload from '../common/FileUpload/FileUpload';

// Icons
import {
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UsersIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CloudArrowUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// Utils
import { extractErrorMessage } from '../../utils/errorUtils';

/**
 * Excel Invitation Manager Component
 * Handles Excel template downloads, uploads, and email sending
 * Provides complete workflow for Excel-based invitation management
 */
const ExcelInvitationManager = ({
  onInvitationProcessed = null, // Callback when invitations are created from Excel
  className = ''
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('download'); // 'download', 'upload', 'email'
  
  // Download state
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  
  // Email state
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailData, setEmailData] = useState({
    hostName: '',
    hostEmail: '',
    includeMultipleVisitors: true,
    customMessage: ''
  });

  // Handle template download
  const handleDownloadTemplate = async (multipleVisitors = true) => {
    try {
      setDownloading(true);
      setDownloadError(null);
      
      await excelService.downloadInvitationTemplate(multipleVisitors);
      
      // Success feedback
      setTimeout(() => setDownloading(false), 1000);
    } catch (error) {
      setDownloadError(extractErrorMessage(error));
      setDownloading(false);
    }
  };

  // Handle file selection and validation
  const handleFileSelect = async (files) => {
    if (files.length === 0) return;
    
    const file = files[0];
    setSelectedFile(file);
    setUploadError(null);
    setUploadResult(null);
    setValidationResult(null);

    // Client-side validation
    const clientValidation = excelService.validateFileBeforeUpload(file);
    if (!clientValidation.isValid) {
      setUploadError(clientValidation.errors.join(', '));
      return;
    }

    // Server-side validation
    try {
      const serverValidation = await excelService.validateExcelFile(file);
      setValidationResult(serverValidation);
      
      if (!serverValidation.isValid) {
        setUploadError(`Validation failed: ${serverValidation.errors?.join(', ') || 'Invalid file structure'}`);
      }
    } catch (error) {
      setUploadError(`Validation failed: ${extractErrorMessage(error)}`);
    }
  };

  // Handle file upload and processing
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadError(null);
      
      const result = await excelService.uploadFilledInvitation(selectedFile);
      setUploadResult(result);
      
      // Callback to parent component
      if (onInvitationProcessed) {
        onInvitationProcessed(result);
      }
      
      // Clear file selection
      setSelectedFile(null);
      setValidationResult(null);
    } catch (error) {
      setUploadError(extractErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  // Handle email template sending
  const handleSendTemplate = async () => {
    try {
      setEmailSending(true);
      setEmailError(null);
      setEmailSuccess(false);

      await excelService.sendTemplateByEmail(emailData);
      setEmailSuccess(true);
      
      // Clear form
      setEmailData({
        hostName: '',
        hostEmail: '',
        includeMultipleVisitors: true,
        customMessage: ''
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (error) {
      setEmailError(extractErrorMessage(error));
    } finally {
      setEmailSending(false);
    }
  };

  // Render download tab
  const renderDownloadTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <ClipboardDocumentListIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Invitation Templates</h3>
        <p className="text-gray-600 mb-6">
          Download Excel templates to create invitations offline. Fill out the template and upload it back to automatically create visitors and invitations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single Visitor Template */}
        <Card className="p-6 hover:bg-gray-50 transition-colors">
          <div className="text-center">
            <UserIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Single Visitor</h4>
            <p className="text-sm text-gray-600 mb-4">
              Template for creating one invitation with one visitor
            </p>
            <Button
              onClick={() => handleDownloadTemplate(false)}
              loading={downloading}
              disabled={downloading}
              icon={<DocumentArrowDownIcon className="w-4 h-4" />}
              variant="outline"
              className="w-full"
            >
              Download Single Visitor Template
            </Button>
          </div>
        </Card>

        {/* Multiple Visitors Template */}
        <Card className="p-6 hover:bg-gray-50 transition-colors">
          <div className="text-center">
            <UsersIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Multiple Visitors</h4>
            <p className="text-sm text-gray-600 mb-4">
              Template for creating one meeting with multiple visitors
            </p>
            <Button
              onClick={() => handleDownloadTemplate(true)}
              loading={downloading}
              disabled={downloading}
              icon={<DocumentArrowDownIcon className="w-4 h-4" />}
              variant="outline"
              className="w-full"
            >
              Download Multiple Visitors Template
            </Button>
          </div>
        </Card>
      </div>

      {/* Download instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-1">How to use templates:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Download the appropriate template</li>
              <li>Fill in all required fields (marked in red)</li>
              <li>Save the file and upload it using the Upload tab</li>
              <li>Review the created invitations and approve as needed</li>
            </ol>
          </div>
        </div>
      </Card>

      {downloadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">{downloadError}</span>
          </div>
        </div>
      )}
    </div>
  );

  // Render upload tab
  const renderUploadTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CloudArrowUpIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Filled Template</h3>
        <p className="text-gray-600 mb-6">
          Upload your completed Excel template to automatically create visitors and invitations.
        </p>
      </div>

      {/* File Upload */}
      <Card className="p-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedTypes={['.xlsx']}
          maxSize={10 * 1024 * 1024} // 10MB
          multiple={false}
          label="Select Excel Template"
          description="Only .xlsx files up to 10MB are accepted"
        />
      </Card>

      {/* File validation results */}
      {selectedFile && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Selected File</h4>
            <Badge color={validationResult?.isValid ? 'green' : uploadError ? 'red' : 'gray'}>
              {validationResult?.isValid ? 'Valid' : uploadError ? 'Invalid' : 'Validating...'}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>File:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
          </div>

          {validationResult?.isValid && (
            <div className="mt-4">
              <Button
                onClick={handleFileUpload}
                loading={uploading}
                disabled={uploading}
                icon={<DocumentArrowUpIcon className="w-4 h-4" />}
                className="w-full"
              >
                {uploading ? 'Processing...' : 'Process Excel File'}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Upload results */}
      {uploadResult && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-800">Upload Successful!</h4>
          </div>
          
          <div className="text-sm text-green-700 space-y-2">
            <p>{uploadResult.message}</p>
            
            {uploadResult.summary && (
              <div className="mt-3 p-3 bg-white rounded border">
                <h5 className="font-medium mb-2">Summary:</h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p>New Visitors: <strong>{uploadResult.summary.newVisitors || 0}</strong></p>
                    <p>Existing Visitors: <strong>{uploadResult.summary.existingVisitors || 0}</strong></p>
                  </div>
                  <div>
                    <p>Draft Invitations: <strong>{uploadResult.summary.draftInvitations || 0}</strong></p>
                    <p>Submitted Invitations: <strong>{uploadResult.summary.submittedInvitations || 0}</strong></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">{uploadError}</span>
          </div>
        </div>
      )}
    </div>
  );

  // Render email tab
  const renderEmailTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <EnvelopeIcon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Template to Host</h3>
        <p className="text-gray-600 mb-6">
          Send Excel templates directly to hosts via email for offline invitation creation.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Host Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host Name *
            </label>
            <Input
              value={emailData.hostName}
              onChange={(e) => setEmailData(prev => ({ ...prev, hostName: e.target.value }))}
              placeholder="Enter host full name"
              required
            />
          </div>

          {/* Host Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host Email *
            </label>
            <Input
              type="email"
              value={emailData.hostEmail}
              onChange={(e) => setEmailData(prev => ({ ...prev, hostEmail: e.target.value }))}
              placeholder="host@company.com"
              required
            />
          </div>

          {/* Template Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Type
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="templateType"
                  checked={!emailData.includeMultipleVisitors}
                  onChange={() => setEmailData(prev => ({ ...prev, includeMultipleVisitors: false }))}
                  className="mr-2"
                />
                Single Visitor
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="templateType"
                  checked={emailData.includeMultipleVisitors}
                  onChange={() => setEmailData(prev => ({ ...prev, includeMultipleVisitors: true }))}
                  className="mr-2"
                />
                Multiple Visitors
              </label>
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Message (Optional)
            </label>
            <textarea
              value={emailData.customMessage}
              onChange={(e) => setEmailData(prev => ({ ...prev, customMessage: e.target.value }))}
              placeholder="Add a custom message to include in the email..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendTemplate}
            loading={emailSending}
            disabled={emailSending || !emailData.hostName || !emailData.hostEmail}
            icon={<EnvelopeIcon className="w-4 h-4" />}
            className="w-full"
          >
            {emailSending ? 'Sending...' : 'Send Template via Email'}
          </Button>
        </div>
      </Card>

      {/* Email success */}
      {emailSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">
              Template sent successfully to {emailData.hostEmail}!
            </span>
          </div>
        </div>
      )}

      {/* Email error */}
      {emailError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">{emailError}</span>
          </div>
        </div>
      )}
    </div>
  );

  // Render tab navigation
  const renderTabNavigation = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
      {[
        { id: 'download', label: 'Download Templates', icon: DocumentArrowDownIcon },
        { id: 'upload', label: 'Upload & Process', icon: DocumentArrowUpIcon },
        { id: 'email', label: 'Email Templates', icon: EnvelopeIcon }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <tab.icon className="w-5 h-5" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {renderTabNavigation()}

      <AnimatePresence mode="wait">
        {activeTab === 'download' && (
          <motion.div
            key="download"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderDownloadTab()}
          </motion.div>
        )}

        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderUploadTab()}
          </motion.div>
        )}

        {activeTab === 'email' && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderEmailTab()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

ExcelInvitationManager.propTypes = {
  onInvitationProcessed: PropTypes.func,
  className: PropTypes.string
};

export default ExcelInvitationManager;
