import apiClient, { extractApiData } from './apiClient';

/**
 * File upload service for handling file uploads to the server
 */
const fileUploadService = {
  /**
   * Uploads a profile photo for the current user
   * POST /api/Users/profile/photo
   */
  async uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/Users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return extractApiData(response);
  },

  /**
   * Removes the profile photo for the current user
   * DELETE /api/Users/profile/photo
   */
  async removeProfilePhoto() {
    const response = await apiClient.delete('/api/Users/profile/photo');
    return extractApiData(response);
  },

  /**
   * Validates if file is a valid image for upload
   * @param {File} file - File to validate
   * @returns {Object} Validation result with isValid and error message
   */
  validateImageFile(file) {
    const validation = {
      isValid: true,
      error: null
    };

    // Check if file exists
    if (!file) {
      validation.isValid = false;
      validation.error = 'No file selected';
      return validation;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      validation.isValid = false;
      validation.error = 'File size must be less than 5MB';
      return validation;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      validation.isValid = false;
      validation.error = 'Only JPG, PNG, and GIF images are allowed';
      return validation;
    }

    return validation;
  },

  /**
   * Creates a preview URL for an image file
   * @param {File} file - Image file
   * @returns {Promise<string>} Preview URL
   */
  createImagePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Resizes an image file (client-side) if it's too large
   * @param {File} file - Image file to resize
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @param {number} quality - Image quality (0-1)
   * @returns {Promise<File>} Resized image file
   */
  async resizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas size and draw image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }
};

export default fileUploadService;