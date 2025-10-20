// src/components/visitor/DocumentManager/DocumentManager.js
import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';
import Input from '../../common/Input/Input';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import DocumentPreview from '../../documents/DocumentPreview';
import Modal, { ConfirmModal } from '../../common/Modal/Modal';

// Icons
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  PhotoIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CloudArrowDownIcon,
  XMarkIcon,
  FolderIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Utils
import { formatDate } from '../../../utils/formatters';

/**
 * Enhanced Document Manager Component
 * Provides comprehensive document management for visitors
 */
const DocumentManager = ({
  visitorId,
  documents = [],
  loading = false,
  onUpload,
  onDelete,
  onDownload,
  onRefresh,
  allowedTypes = ['Passport', 'National ID', 'Driver License', 'Visa', 'Work Permit', 'Health Certificate', 'Background Check', 'Photo', 'Other'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx'],
  className = ''
}) => {
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // File input ref
  const fileInputRef = useRef(null);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.originalFileName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedType || doc.documentType === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Group documents by type
  const groupedDocuments = filteredDocuments.reduce((groups, doc) => {
    const type = doc.documentType || 'Other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(doc);
    return groups;
  }, {});

  // Handle file selection
  const handleFileSelect = useCallback((files) => {
    const validFiles = Array.from(files).filter(file => {
      // Validate file size
      if (file.size > maxFileSize) {
        alert(`File "${file.name}" is too large. Maximum size is ${Math.floor(maxFileSize / (1024 * 1024))}MB.`);
        return false;
      }
      
      // Validate file extension
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        alert(`File "${file.name}" has an unsupported format. Allowed types: ${allowedExtensions.join(', ')}`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      // Add to upload queue with metadata
      const queueItems = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        file,
        title: file.name.split('.')[0],
        documentType: getDefaultDocumentType(file),
        description: '',
        isSensitive: false,
        isRequired: false,
        tags: '',
        status: 'pending'
      }));
      
      setUploadQueue(queueItems);
      setShowUploadModal(true);
    }
  }, [maxFileSize, allowedExtensions]);

  // Get default document type based on file
  const getDefaultDocumentType = (file) => {
    const filename = file.name.toLowerCase();
    const extension = filename.split('.').pop();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'Photo';
    }
    if (filename.includes('passport')) return 'Passport';
    if (filename.includes('license') || filename.includes('driving')) return 'Driver License';
    if (filename.includes('id') || filename.includes('identity')) return 'National ID';
    if (filename.includes('visa')) return 'Visa';
    
    return 'Other';
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
    e.target.value = ''; // Reset input
  };

  // Handle upload queue processing
  const handleProcessUploads = async () => {
    if (!onUpload) return;
    
    setUploading(true);
    
    try {
      const results = await Promise.allSettled(
        uploadQueue.map(async (item) => {
          return await onUpload(item.file, {
            title: item.title,
            documentType: item.documentType,
            description: item.description,
            isSensitive: item.isSensitive,
            isRequired: item.isRequired,
            tags: item.tags
          });
        })
      );

      // Show results
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0 && failed === 0) {
        // All successful
        setShowUploadModal(false);
        setUploadQueue([]);
        if (onRefresh) onRefresh();
      } else if (failed > 0) {
        // Some failed
        alert(`Uploaded ${successful} documents successfully. ${failed} failed.`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle document selection
  const handleDocumentSelect = (docId, selected) => {
    setSelectedDocuments(prev => 
      selected 
        ? [...prev, docId]
        : prev.filter(id => id !== docId)
    );
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (!onDelete || selectedDocuments.length === 0) return;

    try {
      await Promise.all(selectedDocuments.map(docId => onDelete(docId)));
      setSelectedDocuments([]);
      setShowDeleteModal(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  // Get document icon
  const getDocumentIcon = (doc) => {
    if (doc.documentType === 'Photo' || doc.contentType?.startsWith('image/')) {
      return PhotoIcon;
    }
    return DocumentTextIcon;
  };

  // Get document type stats
  const typeStats = allowedTypes.reduce((stats, type) => {
    stats[type] = documents.filter(doc => doc.documentType === type).length;
    return stats;
  }, {});

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FolderIcon className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <p className="text-sm text-gray-600">
                {documents.length} documents • {selectedDocuments.length} selected
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className={showFilters ? 'bg-blue-50 text-blue-600' : ''}
            >
              <FunnelIcon className="w-4 h-4 mr-1" />
              Filters
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
              size="sm"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Documents
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<MagnifyingGlassIcon className="w-4 h-4" />}
                    size="sm"
                  />
                </div>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {allowedTypes.map(type => (
                    <option key={type} value={type}>
                      {type} ({typeStats[type] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedDocuments.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-800">
                    {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setSelectedDocuments([])}
                      variant="ghost"
                      size="xs"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() => setShowDeleteModal(true)}
                      variant="outline"
                      size="xs"
                      className="text-red-600 border-red-200"
                    >
                      <TrashIcon className="w-3 h-3 mr-1" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : documents.length === 0 ? (
          /* Empty State with Drag & Drop */
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
            <p className="text-gray-600 mb-4">
              {dragOver ? 'Drop files here to upload' : 'Drag and drop files here, or click to select'}
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Supported: {allowedExtensions.join(', ')} • Max {Math.floor(maxFileSize / (1024 * 1024))}MB per file
            </p>
          </div>
        ) : (
          /* Documents List */
          <div>
            {/* Drag & Drop Overlay */}
            <AnimatePresence>
              {dragOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-blue-500 bg-opacity-20 z-50 flex items-center justify-center"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="bg-white rounded-lg p-8 shadow-2xl border-2 border-blue-500">
                    <CloudArrowUpIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-blue-900 text-center">
                      Drop files to upload
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Documents by Type */}
            {Object.entries(groupedDocuments).map(([type, docs]) => (
              <div key={type} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    {type} ({docs.length})
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      selected={selectedDocuments.includes(doc.id)}
                      onSelect={(selected) => handleDocumentSelect(doc.id, selected)}
                      onView={() => {
                        setSelectedDocument(doc);
                        setShowDocumentViewer(true);
                      }}
                      onDownload={() => onDownload && onDownload(doc)}
                      onDelete={() => onDelete && onDelete(doc.id)}
                      showActions={true}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Quick Upload Zone */}
            <div
              className={`mt-6 border border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p className="text-sm text-gray-600">
                Drop more files here or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  click to select
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedExtensions.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => !uploading && setShowUploadModal(false)}
        title="Upload Documents"
        size="xl"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Review and configure your documents before uploading.
            </p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {uploadQueue.map((item, index) => (
              <UploadQueueItem
                key={item.id}
                item={item}
                allowedTypes={allowedTypes}
                onChange={(updatedItem) => {
                  setUploadQueue(prev => 
                    prev.map(qi => qi.id === item.id ? { ...qi, ...updatedItem } : qi)
                  );
                }}
                onRemove={() => {
                  setUploadQueue(prev => prev.filter(qi => qi.id !== item.id));
                }}
              />
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <Button
              onClick={() => setShowUploadModal(false)}
              variant="outline"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcessUploads}
              variant="primary"
              loading={uploading}
              disabled={uploadQueue.length === 0}
            >
              Upload {uploadQueue.length} Document{uploadQueue.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <DocumentPreview
          visitorId={visitorId}
          document={selectedDocument}
          isOpen={showDocumentViewer}
          onClose={() => {
            setShowDocumentViewer(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Delete Documents"
        message={`Are you sure you want to delete ${selectedDocuments.length} document${selectedDocuments.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

/**
 * Individual Document Card Component
 */
const DocumentCard = ({ 
  document, 
  selected, 
  onSelect, 
  onView, 
  onDownload, 
  onDelete, 
  showActions = true 
}) => {
  const Icon = document.documentType === 'Photo' ? PhotoIcon : DocumentTextIcon;
  
  return (
    <div className={`relative bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
      selected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
    }`}>
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      {/* Document Info */}
      <div className="pl-6">
        <div className="flex items-start justify-between mb-3">
          <Icon className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <div className="flex space-x-1 ml-2">
            {document.isSensitive && (
              <Badge variant="warning" size="xs">Sensitive</Badge>
            )}
            {document.isRequired && (
              <Badge variant="info" size="xs">Required</Badge>
            )}
            {document.isExpired && (
              <Badge variant="danger" size="xs">Expired</Badge>
            )}
          </div>
        </div>

        <h4 className="font-medium text-gray-900 text-sm mb-1 truncate" title={document.documentName}>
          {document.documentName}
        </h4>
        
        <p className="text-xs text-gray-500 mb-2">
          {document.formattedFileSize} • {formatDate(document.createdOn)}
        </p>

        {document.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {document.description}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={onView}
              variant="ghost"
              size="xs"
              className="flex-1"
            >
              <EyeIcon className="w-3 h-3 mr-1" />
              View
            </Button>
            
            <Button
              onClick={onDownload}
              variant="ghost"
              size="xs"
              className="flex-1"
            >
              <CloudArrowDownIcon className="w-3 h-3 mr-1" />
              Download
            </Button>
            
            <Button
              onClick={onDelete}
              variant="ghost"
              size="xs"
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Upload Queue Item Component
 */
const UploadQueueItem = ({ item, allowedTypes, onChange, onRemove }) => {
  const Icon = item.documentType === 'Photo' ? PhotoIcon : DocumentTextIcon;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <Icon className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 truncate">
              {item.file.name}
            </h4>
            <Button
              onClick={onRemove}
              variant="ghost"
              size="xs"
              className="text-gray-400 hover:text-red-600 flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Document Title *
              </label>
              <Input
                type="text"
                value={item.title}
                onChange={(e) => onChange({ title: e.target.value })}
                size="sm"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Document Type *
              </label>
              <select
                value={item.documentType}
                onChange={(e) => onChange({ documentType: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {allowedTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                type="text"
                value={item.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Optional description..."
                size="sm"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Tags
              </label>
              <Input
                type="text"
                value={item.tags}
                onChange={(e) => onChange({ tags: e.target.value })}
                placeholder="Comma-separated tags..."
                size="sm"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={item.isSensitive}
                  onChange={(e) => onChange({ isSensitive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">Sensitive</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={item.isRequired}
                  onChange={(e) => onChange({ isRequired: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">Required</span>
              </label>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Size: {(item.file.size / 1024 / 1024).toFixed(1)} MB • 
            Type: {item.file.type || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes
DocumentManager.propTypes = {
  visitorId: PropTypes.number.isRequired,
  documents: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  onUpload: PropTypes.func,
  onDelete: PropTypes.func,
  onDownload: PropTypes.func,
  onRefresh: PropTypes.func,
  allowedTypes: PropTypes.arrayOf(PropTypes.string),
  maxFileSize: PropTypes.number,
  allowedExtensions: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string
};

DocumentCard.propTypes = {
  document: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  onView: PropTypes.func,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool
};

UploadQueueItem.propTypes = {
  item: PropTypes.object.isRequired,
  allowedTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired
};

export default DocumentManager;
