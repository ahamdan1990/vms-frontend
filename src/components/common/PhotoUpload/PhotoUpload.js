// src/components/common/PhotoUpload/PhotoUpload.js
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

// Components
import Button from '../Button/Button';

// Icons
import {
  CameraIcon,
  UserIcon,
  TrashIcon,
  PencilIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * Photo Upload Component
 * Specialized component for uploading visitor profile photos
 * Includes photo preview, cropping area, and validation
 */
const PhotoUpload = ({
  photo,
  onPhotoUpload,
  onPhotoRemove,
  disabled = false,
  size = 'large', // 'small', 'medium', 'large'
  className = ''
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Size configurations
  const sizeConfig = {
    small: { wrapper: 'w-16 h-16', icon: 'w-6 h-6' },
    medium: { wrapper: 'w-24 h-24', icon: 'w-8 h-8' },
    large: { wrapper: 'w-32 h-32', icon: 'w-12 h-12' }
  };

  const config = sizeConfig[size] || sizeConfig.large;

  // Validate and process file
  const handleFileSelect = (file) => {
    setUploadError(null);

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setUploadError('Image must be smaller than 5MB');
      return;
    }

    // Create file reader to get preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoData = {
        file,
        preview: e.target.result,
        name: file.name,
        size: file.size,
        type: file.type
      };
      onPhotoUpload(photoData);
    };
    reader.readAsDataURL(file);
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
      handleFileSelect(droppedFiles[0]); // Only take the first file
    }
  };

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
    // Reset input value
    e.target.value = '';
  };

  // Handle photo removal
  const handleRemovePhoto = () => {
    setUploadError(null);
    onPhotoRemove();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Photo Display/Upload Area */}
      <div className="flex items-center space-x-4">
        {/* Photo Preview or Upload Area */}
        <div
          className={`relative ${config.wrapper} rounded-full border-2 border-dashed ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : disabled
              ? 'border-gray-200 bg-gray-50'
              : photo
              ? 'border-gray-300'
              : 'border-gray-300 hover:border-gray-400 cursor-pointer'
          } overflow-hidden transition-colors duration-200`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !photo && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          {photo ? (
            // Display uploaded photo
            <img
              src={photo.preview || photo.url}
              alt="Visitor photo"
              className="w-full h-full object-cover"
            />
          ) : (
            // Upload placeholder
            <div className="flex items-center justify-center w-full h-full bg-gray-50">
              {dragActive ? (
                <CameraIcon className={`${config.icon} text-blue-500`} />
              ) : (
                <UserIcon className={`${config.icon} text-gray-400`} />
              )}
            </div>
          )}

          {/* Overlay for existing photo */}
          {photo && !disabled && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <PencilIcon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          {!photo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              icon={<CameraIcon className="w-4 h-4" />}
            >
              Upload Photo
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                icon={<PencilIcon className="w-4 h-4" />}
              >
                Change Photo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={disabled}
                className="text-red-600 hover:text-red-800"
                icon={<TrashIcon className="w-4 h-4" />}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Photo Info */}
      {photo && (
        <div className="text-xs text-gray-500">
          <p className="font-medium">{photo.name}</p>
          <p>{(photo.size / 1024).toFixed(1)}KB • {photo.type}</p>
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-md p-3"
        >
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{uploadError}</span>
          </div>
        </motion.div>
      )}

      {/* Upload Instructions */}
      {!photo && (
        <div className="text-xs text-gray-500">
          <p>Upload a clear photo for visitor identification</p>
          <p>Accepted formats: JPEG, PNG, WebP (max 5MB)</p>
        </div>
      )}
    </div>
  );
};

// PropTypes validation
PhotoUpload.propTypes = {
  photo: PropTypes.object,
  onPhotoUpload: PropTypes.func.isRequired,
  onPhotoRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string
};

export default PhotoUpload;