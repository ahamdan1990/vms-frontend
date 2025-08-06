import { useState, useCallback } from 'react';
import fileUploadService from '../services/fileUploadService';

/**
 * Custom hook for handling file uploads with validation and progress tracking
 */
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadProfilePhoto = useCallback(async (file) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Validate file
      const validation = fileUploadService.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Simulate progress (since we don't have actual upload progress from axios)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload file
      const result = await fileUploadService.uploadProfilePhoto(file);

      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);

      return result;
    } catch (error) {
      setError(error.message || 'Upload failed');
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000); // Reset progress after delay
    }
  }, []);

  const removeProfilePhoto = useCallback(async () => {
    try {
      setUploading(true);
      setError(null);
      
      await fileUploadService.removeProfilePhoto();
    } catch (error) {
      setError(error.message || 'Removal failed');
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  const validateFile = useCallback((file) => {
    return fileUploadService.validateImageFile(file);
  }, []);

  const createPreview = useCallback((file) => {
    return fileUploadService.createImagePreview(file);
  }, []);

  const resizeImage = useCallback((file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return fileUploadService.resizeImage(file, maxWidth, maxHeight, quality);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadProfilePhoto,
    removeProfilePhoto,
    validateFile,
    createPreview,
    resizeImage
  };
};

export default useFileUpload;