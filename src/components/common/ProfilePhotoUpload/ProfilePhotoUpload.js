import React, { useState, useRef, useCallback } from 'react';

/**
 * ProfilePhotoUpload component for uploading and displaying user profile photos
 * Features: drag & drop, preview, remove functionality, placeholder with initials
 */
const ProfilePhotoUpload = ({ 
  currentPhotoUrl, 
  userInitials,
  onPhotoUpload,
  onPhotoRemove,
  disabled = false,
  size = 'large' // 'small', 'medium', 'large'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(currentPhotoUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Update preview when currentPhotoUrl changes
  React.useEffect(() => {
    console.log('ProfilePhotoUpload: currentPhotoUrl changed to:', currentPhotoUrl); // Debug log
    setPreview(currentPhotoUrl);
  }, [currentPhotoUrl]);

  const sizeClasses = {
    small: 'w-12 h-12 text-sm',
    medium: 'w-20 h-20 text-lg',
    large: 'w-32 h-32 text-2xl'
  };

  const handleFileSelect = useCallback(async (file) => {
    if (!file || disabled) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  }, [disabled, onPhotoUpload]);

  const handleUpload = useCallback(async (file) => {
    setUploading(true);
    try {
      await onPhotoUpload(file);
    } catch (error) {
      console.error('Photo upload failed:', error);
      setPreview(currentPhotoUrl); // Reset preview on error
    } finally {
      setUploading(false);
    }
  }, [onPhotoUpload, currentPhotoUrl]);

  const handleRemove = useCallback(async () => {
    try {
      setUploading(true);
      await onPhotoRemove();
      setPreview(null);
    } catch (error) {
      console.error('Photo removal failed:', error);
    } finally {
      setUploading(false);
    }
  }, [onPhotoRemove]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);
  
  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Photo Display/Upload Area */}
      <div
        className={`
          relative rounded-full border-2 border-dashed transition-all duration-200 cursor-pointer
          ${sizeClasses[size]}
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : disabled 
              ? 'border-gray-200 cursor-not-allowed' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Photo Display */}
        {preview ? (
          <>
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                console.error('ProfilePhotoUpload: Failed to load photo:', preview);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
              onLoad={(e) => {
                console.log('ProfilePhotoUpload: Photo loaded successfully:', preview);
                e.target.nextSibling.style.display = 'none';
              }}
            />
            <div 
              className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold"
              style={{ display: 'none' }}
            >
              {userInitials || '?'}
            </div>
          </>
        ) : (
          /* Initials Placeholder */
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {userInitials || '?'}
          </div>
        )}

        {/* Upload Icon Overlay */}
        {!disabled && !uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 group">
            <svg 
              className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>
      {/* Action Buttons */}
      {!disabled && (
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleClick}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {preview ? 'Change Photo' : 'Upload Photo'}
          </button>
          
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center max-w-xs">
        {disabled 
          ? 'Photo upload disabled' 
          : 'Drag and drop or click to upload. JPG, PNG, GIF up to 5MB'
        }
      </p>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePhotoUpload;