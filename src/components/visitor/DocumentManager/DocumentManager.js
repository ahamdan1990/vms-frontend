// src/components/visitor/DocumentManager/DocumentManager.js
import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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
  FolderIcon
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
  const { t } = useTranslation('visitors');
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

  const getDocumentTypeKey = (type) => {
    switch (type) {
      case 'Passport':
        return 'passport';
      case 'National ID':
        return 'nationalId';
      case 'Driver License':
        return 'driverLicense';
      case 'Visa':
        return 'visa';
      case 'Work Permit':
        return 'workPermit';
      case 'Health Certificate':
        return 'healthCertificate';
      case 'Background Check':
        return 'backgroundCheck';
      case 'Photo':
        return 'photo';
      case 'Other':
      default:
        return 'other';
    }
  };

  const getDocumentTypeLabel = (type) =>
    t(`documentManager.types.${getDocumentTypeKey(type)}`, {
      defaultValue: type || t('documentManager.types.other')
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
        alert(
          t('documentManager.alerts.fileTooLarge', {
            name: file.name,
            size: Math.floor(maxFileSize / (1024 * 1024))
          })
        );
        return false;
      }
      
      // Validate file extension
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        alert(
          t('documentManager.alerts.unsupportedFormat', {
            name: file.name,
            types: allowedExtensions.join(', ')
          })
        );
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
        alert(t('documentManager.alerts.partialUpload', { successful, failed }));
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

  // Get document type stats
  const typeStats = allowedTypes.reduce((stats, type) => {
    stats[type] = documents.filter(doc => doc.documentType === type).length;
    return stats;
  }, {});

  return (
    <div className={`bg-white dark:bg-slate-900/70 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderIcon className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('documentManager.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('documentManager.summary', {
                  total: documents.length,
                  selected: selectedDocuments.length
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className={showFilters ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'dark:text-gray-200'}
            >
              <FunnelIcon className="w-4 h-4 me-1" />
              {t('documentManager.actions.filters')}
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
              size="sm"
            >
              <PlusIcon className="w-4 h-4 me-1" />
              {t('documentManager.actions.addDocuments')}
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
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder={t('documentManager.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
                    size="sm"
                  />
                </div>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <option value="">{t('documentManager.filters.allTypes')}</option>
                  {allowedTypes.map(type => (
                    <option key={type} value={type}>
                      {getDocumentTypeLabel(type)} ({typeStats[type] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedDocuments.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/40">
                  <span className="text-sm text-blue-800 dark:text-blue-100">
                    {t('documentManager.selectedCount', { count: selectedDocuments.length })}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedDocuments([])}
                      variant="ghost"
                      size="xs"
                    >
                      {t('common:buttons.clear')}
                    </Button>
                    <Button
                      onClick={() => setShowDeleteModal(true)}
                      variant="outline"
                      size="xs"
                      className="text-red-600 border-red-200"
                    >
                      <TrashIcon className="w-3 h-3 me-1" />
                      {t('documentManager.actions.deleteSelected')}
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
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-slate-900/60'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('documentManager.empty.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {dragOver ? t('documentManager.empty.dropNow') : t('documentManager.empty.dragHint')}
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
            >
              <PlusIcon className="w-4 h-4 me-2" />
              {t('documentManager.actions.uploadDocuments')}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t('documentManager.empty.supported', {
                extensions: allowedExtensions.join(', '),
                size: Math.floor(maxFileSize / (1024 * 1024))
              })}
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
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl border-2 border-blue-500">
                    <CloudArrowUpIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-blue-900 dark:text-blue-200 text-center">
                      {t('documentManager.empty.dropNow')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Documents by Type */}
            {Object.entries(groupedDocuments).map(([type, docs]) => (
              <div key={type} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <DocumentTextIcon className="w-4 h-4 me-2" />
                    {getDocumentTypeLabel(type)} ({docs.length})
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
              className={`mt-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-slate-900/60'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('documentManager.quickDrop.prefix')}{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 underline dark:text-blue-300 dark:hover:text-blue-200"
                >
                  {t('documentManager.quickDrop.clickToSelect')}
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
        title={t('documentManager.modals.uploadTitle')}
        size="xl"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('documentManager.modals.uploadDescription')}
            </p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {uploadQueue.map((item) => (
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

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setShowUploadModal(false)}
              variant="outline"
              disabled={uploading}
            >
              {t('common:buttons.cancel')}
            </Button>
            <Button
              onClick={handleProcessUploads}
              variant="primary"
              loading={uploading}
              disabled={uploadQueue.length === 0}
            >
              {t('documentManager.actions.uploadCount', { count: uploadQueue.length })}
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
        title={t('documentManager.modals.deleteTitle')}
        message={t('documentManager.modals.deleteMessage', { count: selectedDocuments.length })}
        confirmText={t('common:buttons.delete')}
        cancelText={t('common:buttons.cancel')}
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
  const { t } = useTranslation('visitors');
  const Icon = document.documentType === 'Photo' ? PhotoIcon : DocumentTextIcon;
  
  return (
    <div className={`relative bg-white dark:bg-slate-900/70 border rounded-xl p-4 hover:shadow-md transition-shadow ${
      selected ? 'ring-2 ring-blue-500 border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Selection Checkbox */}
      <div className="absolute top-2 start-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
      </div>

      {/* Document Info */}
      <div className="ps-6">
        <div className="flex items-start justify-between mb-3">
          <Icon className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <div className="flex gap-1 ms-2">
            {document.isSensitive && (
              <Badge variant="warning" size="xs">{t('documentManager.badges.sensitive')}</Badge>
            )}
            {document.isRequired && (
              <Badge variant="info" size="xs">{t('documentManager.badges.required')}</Badge>
            )}
            {document.isExpired && (
              <Badge variant="danger" size="xs">{t('documentManager.badges.expired')}</Badge>
            )}
          </div>
        </div>

        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate" title={document.documentName}>
          {document.documentName}
        </h4>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {t('documentManager.card.meta', {
            size: document.formattedFileSize,
            date: formatDate(document.createdOn)
          })}
        </p>

        {document.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {document.description}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            <Button
              onClick={onView}
              variant="ghost"
              size="xs"
              className="flex-1"
            >
              <EyeIcon className="w-3 h-3 me-1" />
              {t('common:buttons.view')}
            </Button>
            
            <Button
              onClick={onDownload}
              variant="ghost"
              size="xs"
              className="flex-1"
            >
              <CloudArrowDownIcon className="w-3 h-3 me-1" />
              {t('common:buttons.download')}
            </Button>
            
            <Button
              onClick={onDelete}
              variant="ghost"
              size="xs"
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
  const { t } = useTranslation('visitors');
  const Icon = item.documentType === 'Photo' ? PhotoIcon : DocumentTextIcon;
  const getDocumentTypeKey = (type) => {
    switch (type) {
      case 'Passport':
        return 'passport';
      case 'National ID':
        return 'nationalId';
      case 'Driver License':
        return 'driverLicense';
      case 'Visa':
        return 'visa';
      case 'Work Permit':
        return 'workPermit';
      case 'Health Certificate':
        return 'healthCertificate';
      case 'Background Check':
        return 'backgroundCheck';
      case 'Photo':
        return 'photo';
      case 'Other':
      default:
        return 'other';
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-slate-900/70">
      <div className="flex items-start gap-3">
        <Icon className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {item.file.name}
            </h4>
            <Button
              onClick={onRemove}
              variant="ghost"
              size="xs"
              className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('documentManager.upload.fields.title')}
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
              <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('documentManager.upload.fields.type')}
              </label>
              <select
                value={item.documentType}
                onChange={(e) => onChange({ documentType: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                {allowedTypes.map(type => (
                  <option key={type} value={type}>
                    {t(`documentManager.types.${getDocumentTypeKey(type)}`, { defaultValue: type })}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('documentManager.upload.fields.description')}
              </label>
              <Input
                type="text"
                value={item.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder={t('documentManager.upload.placeholders.description')}
                size="sm"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('documentManager.upload.fields.tags')}
              </label>
              <Input
                type="text"
                value={item.tags}
                onChange={(e) => onChange({ tags: e.target.value })}
                placeholder={t('documentManager.upload.placeholders.tags')}
                size="sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={item.isSensitive}
                  onChange={(e) => onChange({ isSensitive: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 me-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">{t('documentManager.badges.sensitive')}</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={item.isRequired}
                  onChange={(e) => onChange({ isRequired: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 me-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">{t('documentManager.badges.required')}</span>
              </label>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t('documentManager.upload.fileMeta', {
              size: (item.file.size / 1024 / 1024).toFixed(1),
              type: item.file.type || t('documentManager.upload.unknownType')
            })}
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




