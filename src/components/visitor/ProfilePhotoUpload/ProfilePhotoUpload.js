// src/components/visitor/ProfilePhotoUpload/ProfilePhotoUpload.js
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

// Components
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';

// Icons
import {
  UserIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  TrashIcon,
  CameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Profile Photo Upload Component
 * Provides profile photo management with upload, preview, and removal functionality
 */
const ProfilePhotoUpload = ({
  currentPhotoUrl = null,
  onUpload,
  onRemove,
  loading = false,
  size = 'lg', // 'sm', 'md', 'lg', 'xl'
  allowRemove = true,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  className = ''
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Size configurations
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      alert(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      alert(`File too large. Maximum size: ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`);
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      setShowUploadModal(true);
    };
    reader.readAsDataURL(file);

    // Reset file input
    event.target.value = '';
  };

  // Handle upload confirmation
  const handleUploadConfirm = async () => {
    if (!selectedFile || !onUpload) return;

    setUploading(true);
    try {
      await onUpload(selectedFile);
      setShowUploadModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle upload cancellation
  const handleUploadCancel = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Handle photo removal
  const handleRemove = async () => {
    if (!onRemove) return;

    try {
      await onRemove();
      setShowRemoveModal(false);
    } catch (error) {
      console.error('Photo removal failed:', error);
      alert('Failed to remove photo. Please try again.');
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Simulate file input selection
      const fakeEvent = {
        target: { files: [file] }
      };
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      {/* Photo Display */}
      <div className="relative group">
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-white shadow-lg bg-gray-100 overflow-hidden cursor-pointer transition-transform hover:scale-105`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {currentPhotoUrl ? (
            <img
              src={currentPhotoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <UserIcon className={`${iconSizes[size]} text-gray-400`} />
            </div>
          )}
          
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <LoadingSpinner size="sm" className="text-white" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <CameraIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {(currentPhotoUrl && allowRemove) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRemoveModal(true);
            }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            title="Remove photo"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upload hint */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Click or drag photo to upload
        </p>
        <p className="text-xs text-gray-400">
          Max {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Confirmation Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={!uploading ? handleUploadCancel : undefined}
        title="Upload Profile Photo"
        size="md"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-block">
              <div className={`${sizeClasses.lg} rounded-full border-4 border-gray-200 overflow-hidden mx-auto mb-4`}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload this photo?
            </h3>
            {selectedFile && (
              <p className="text-sm text-gray-600">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              onClick={handleUploadCancel}
              variant="outline"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadConfirm}
              variant="primary"
              loading={uploading}
              disabled={!selectedFile}
            >
              Upload Photo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Profile Photo"
        size="md"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Remove profile photo?
            </h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone. The current profile photo will be permanently removed.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowRemoveModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemove}
              variant="danger"
              loading={loading}
            >
              Remove Photo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

ProfilePhotoUpload.propTypes = {
  currentPhotoUrl: PropTypes.string,
  onUpload: PropTypes.func,
  onRemove: PropTypes.func,
  loading: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  allowRemove: PropTypes.bool,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string),
  maxFileSize: PropTypes.number,
  className: PropTypes.string
};

export default ProfilePhotoUpload;
