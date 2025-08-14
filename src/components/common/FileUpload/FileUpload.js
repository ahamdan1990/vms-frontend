// src/components/common/FileUpload/FileUpload.js
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import {
  CloudArrowUpIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// Utils
import Button from '../Button/Button';
import Badge from '../Badge/Badge';

/**
 * File Upload Component
 * Handles file uploads with preview, validation, and progress
 * Supports images, documents, and drag & drop
 */
const FileUpload = ({
  onFileSelect,
  onFileRemove,
  accept = 'image/*,application/pdf,.doc,.docx',
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  files = [],
  label = 'Upload File',
  description = 'Drag and drop files here, or click to browse',
  disabled = false,
  error = null,
  required = false,
  showPreview = true,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // Handle file validation
  const validateFile = (file) => {
    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${formatFileSize(maxSize)}`);
    }

    // Check file type
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
      const mimeType = file.type;
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        } else if (type.includes('*')) {
          return mimeType.startsWith(type.split('*')[0]);
        } else {
          return mimeType === type;
        }
      });

      if (!isAccepted) {
        errors.push(`File type not supported. Accepted types: ${accept}`);
      }
    }

    return errors;
  };

  // Handle file selection
  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    
    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      return { error: `Maximum ${maxFiles} file(s) allowed` };
    }

    const validFiles = [];
    const errors = [];

    newFiles.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        // Add preview URL for images
        if (file.type.startsWith('image/')) {
          file.preview = URL.createObjectURL(file);
        }
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${fileErrors.join(', ')}`);
      }
    });

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }

    if (errors.length > 0) {
      return { error: errors.join('\n') };
    }

    return { success: true };
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Open file selector
  const openFileSelector = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove file
  const removeFile = (index) => {
    const fileToRemove = files[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    onFileRemove(index);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8 text-blue-500" />;
    } else {
      return <DocumentIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  // Get file type badge
  const getFileTypeBadge = (file) => {
    const extension = file.name.split('.').pop().toUpperCase();
    if (file.type.startsWith('image/')) {
      return <Badge variant="primary" size="xs">{extension}</Badge>;
    } else {
      return <Badge variant="secondary" size="xs">{extension}</Badge>;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 cursor-pointer
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-gray-400'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="text-center">
          <CloudArrowUpIcon 
            className={`mx-auto h-12 w-12 ${
              dragActive ? 'text-blue-400' : 'text-gray-400'
            }`} 
          />
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900">
              {description}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Max {maxFiles} file(s), up to {formatFileSize(maxSize)} each
            </p>
          </div>
        </div>

        {/* Drag overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-blue-600 font-medium">Drop files here</div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* File list */}
      {files.length > 0 && showPreview && (
        <div className="space-y-2">
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                {/* File icon/preview */}
                <div className="flex-shrink-0">
                  {file.type.startsWith('image/') && file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(file)
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    {getFileTypeBadge(file)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* File status */}
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center space-x-1">
                  {file.type.startsWith('image/') && file.preview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.preview, '_blank');
                      }}
                      icon={<EyeIcon className="w-4 h-4" />}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-red-600 hover:text-red-800"
                    icon={<TrashIcon className="w-4 h-4" />}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload more button */}
      {files.length > 0 && files.length < maxFiles && (
        <Button
          variant="outline"
          size="sm"
          onClick={openFileSelector}
          disabled={disabled}
          icon={<CloudArrowUpIcon className="w-4 h-4" />}
        >
          Upload More Files
        </Button>
      )}
    </div>
  );
};

// PropTypes validation
FileUpload.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  onFileRemove: PropTypes.func.isRequired,
  accept: PropTypes.string,
  maxSize: PropTypes.number,
  maxFiles: PropTypes.number,
  files: PropTypes.array,
  label: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  required: PropTypes.bool,
  showPreview: PropTypes.bool,
  className: PropTypes.string
};

export default FileUpload;