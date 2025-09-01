// src/components/common/DocumentViewer/DocumentViewer.js
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

// Components
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

// Icons
import {
  DocumentTextIcon,
  PhotoIcon,
  CloudArrowDownIcon,
  EyeIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

/**
 * Document Viewer Component
 * Handles viewing and downloading of various document types
 */
const DocumentViewer = ({
  document,
  onDownload,
  onClose,
  className = '',
  showPreview = true,
  showMetadata = true,
  size = 'md'
}) => {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Determine if document can be previewed
  const canPreview = (doc) => {
    if (!doc) return false;
    
    const previewableTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return previewableTypes.includes(doc.contentType?.toLowerCase());
  };

  // Get document icon
  const getDocumentIcon = (doc) => {
    if (!doc) return DocumentTextIcon;
    
    if (doc.documentType === 'Photo' || canPreview(doc)) {
      return PhotoIcon;
    }
    
    return DocumentTextIcon;
  };

  // Handle download
  const handleDownload = async () => {
    if (!onDownload || !document) return;
    
    setLoading(true);
    try {
      await onDownload(document);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle external view
  const handleExternalView = () => {
    if (document?.downloadUrl) {
      window.open(document.downloadUrl, '_blank');
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  if (!document) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Selected</h3>
        <p className="text-gray-600">Select a document to view its details.</p>
      </div>
    );
  }

  const Icon = getDocumentIcon(document);

  return (
    <div className={`bg-white rounded-lg shadow-lg ${sizeClasses[size]} mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Icon className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {document.documentName || document.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="info" size="xs">
                {document.documentType}
              </Badge>
              <span className="text-xs text-gray-500">
                {document.formattedFileSize || document.fileSize}
              </span>
              {document.isExpired && (
                <Badge variant="danger" size="xs">Expired</Badge>
              )}
              {document.isSensitive && (
                <Badge variant="warning" size="xs">Sensitive</Badge>
              )}
            </div>
          </div>
        </div>
        
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Preview Section */}
        {showPreview && canPreview(document) && !imageError && (
          <div className="mb-6">
            <div className="relative bg-gray-50 rounded-lg p-4 text-center">
              <img
                src={document.downloadUrl || `/api/visitors/${document.visitorId}/documents/${document.id}/download`}
                alt={document.documentName}
                className="max-w-full max-h-96 mx-auto rounded-lg shadow-sm"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            </div>
          </div>
        )}

        {/* Preview not available message */}
        {showPreview && (!canPreview(document) || imageError) && (
          <div className="mb-6 text-center py-8 bg-gray-50 rounded-lg">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-sm font-medium text-gray-900 mb-2">Preview Not Available</h4>
            <p className="text-sm text-gray-600">
              This document type cannot be previewed in the browser.
            </p>
          </div>
        )}

        {/* Metadata */}
        {showMetadata && (
          <div className="space-y-4 mb-6">
            {document.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                <p className="text-sm text-gray-600">{document.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">File Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Original Name: {document.originalFileName}</div>
                  <div>Size: {document.formattedFileSize || document.fileSize}</div>
                  <div>Type: {document.contentType}</div>
                  {document.version && <div>Version: {document.version}</div>}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Upload Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Uploaded: {new Date(document.createdOn).toLocaleDateString()}</div>
                  {document.createdByName && <div>By: {document.createdByName}</div>}
                  {document.expirationDate && (
                    <div>
                      Expires: {new Date(document.expirationDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {document.tags && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {document.tags.split(',').map((tag, index) => (
                    <Badge key={index} variant="outline" size="xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleDownload}
            disabled={loading}
            variant="primary"
            size="sm"
            className="flex-1 max-w-xs"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <CloudArrowDownIcon className="w-4 h-4 mr-2" />
            )}
            Download
          </Button>

          {document.downloadUrl && (
            <Button
              onClick={handleExternalView}
              variant="outline"
              size="sm"
              className="flex-1 max-w-xs"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

DocumentViewer.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.number,
    visitorId: PropTypes.number,
    documentName: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    documentType: PropTypes.string,
    originalFileName: PropTypes.string,
    fileSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    formattedFileSize: PropTypes.string,
    contentType: PropTypes.string,
    downloadUrl: PropTypes.string,
    isExpired: PropTypes.bool,
    isSensitive: PropTypes.bool,
    isRequired: PropTypes.bool,
    version: PropTypes.number,
    tags: PropTypes.string,
    createdOn: PropTypes.string,
    createdByName: PropTypes.string,
    expirationDate: PropTypes.string
  }),
  onDownload: PropTypes.func,
  onClose: PropTypes.func,
  className: PropTypes.string,
  showPreview: PropTypes.bool,
  showMetadata: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl'])
};

export default DocumentViewer;
