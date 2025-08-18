// src/components/camera/CameraCapture.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Button from '../common/Button/Button';
import Card from '../common/Card/Card';

// Icons
import {
  CameraIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
  StopIcon
} from '@heroicons/react/24/outline';

/**
 * Camera Capture Component
 * Provides live camera interface for capturing visitor photos
 * Includes photo preview, retake functionality, and automatic sizing
 */
const CameraCapture = ({
  onPhotoCapture,
  onCancel,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.8,
  className = ''
}) => {
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Request camera permission and stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: maxWidth },
          height: { ideal: maxHeight },
          facingMode: 'user' // Front-facing camera for visitor photos
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setCameraPermission('granted');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      
      if (error.name === 'NotAllowedError') {
        setError('Camera access denied. Please enable camera permissions and try again.');
        setCameraPermission('denied');
      } else if (error.name === 'NotFoundError') {
        setError('No camera found. Please ensure a camera is connected.');
      } else if (error.name === 'NotReadableError') {
        setError('Camera is being used by another application.');
      } else {
        setError('Unable to access camera. Please check your camera settings.');
      }
    } finally {
      setLoading(false);
    }
  }, [maxWidth, maxHeight]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob with specified quality
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedPhoto({
            blob,
            url,
            width: canvas.width,
            height: canvas.height
          });
          stopCamera();
        }
      },
      'image/jpeg',
      quality
    );
  }, [quality, stopCamera]);

  // Confirm captured photo
  const confirmPhoto = useCallback(() => {
    if (capturedPhoto && onPhotoCapture) {
      // Create File object from blob
      const file = new File([capturedPhoto.blob], 'visitor-photo.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      onPhotoCapture({
        file,
        url: capturedPhoto.url,
        width: capturedPhoto.width,
        height: capturedPhoto.height
      });
    }
  }, [capturedPhoto, onPhotoCapture]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto.url);
      setCapturedPhoto(null);
    }
    startCamera();
  }, [capturedPhoto, startCamera]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    stopCamera();
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto.url);
    }
    if (onCancel) {
      onCancel();
    }
  }, [stopCamera, capturedPhoto, onCancel]);

  // Check camera permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'camera' });
          setCameraPermission(permission.state);
          
          permission.onchange = () => {
            setCameraPermission(permission.state);
          };
        }
      } catch (error) {
        console.warn('Permission API not supported');
      }
    };

    checkPermission();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (capturedPhoto) {
        URL.revokeObjectURL(capturedPhoto.url);
      }
    };
  }, [stopCamera, capturedPhoto]);

  // Render camera interface
  const renderCameraInterface = () => (
    <div className="space-y-4">
      {/* Video preview */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Camera controls overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              icon={<XMarkIcon className="w-4 h-4" />}
            >
              Cancel
            </Button>
            
            <Button
              onClick={capturePhoto}
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 rounded-full w-16 h-16"
              icon={<CameraIcon className="w-8 h-8" />}
            />
            
            <Button
              variant="secondary"
              size="sm"
              onClick={stopCamera}
              icon={<StopIcon className="w-4 h-4" />}
            >
              Stop
            </Button>
          </div>
        </div>

        {/* Camera indicator */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>LIVE</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600">
        <p>Position the visitor's face in the center of the frame and click the capture button</p>
      </div>
    </div>
  );

  // Render photo preview
  const renderPhotoPreview = () => (
    <div className="space-y-4">
      {/* Photo preview */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src={capturedPhoto.url}
          alt="Captured visitor photo"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Photo actions */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          onClick={retakePhoto}
          icon={<ArrowPathIcon className="w-4 h-4" />}
        >
          Retake Photo
        </Button>
        
        <Button
          onClick={confirmPhoto}
          icon={<CheckIcon className="w-4 h-4" />}
        >
          Use This Photo
        </Button>
      </div>

      {/* Photo info */}
      <div className="text-center text-sm text-gray-500">
        <p>Photo captured: {capturedPhoto.width} × {capturedPhoto.height}px</p>
      </div>
    </div>
  );

  // Render initial state
  const renderInitialState = () => (
    <div className="text-center py-12">
      <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Capture Visitor Photo</h3>
      <p className="text-gray-600 mb-6">
        Take a photo of the visitor for their profile
      </p>
      
      {cameraPermission === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">
              Camera permission denied. Please enable camera access in your browser settings.
            </span>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <Button
          onClick={startCamera}
          loading={loading}
          disabled={loading || cameraPermission === 'denied'}
          icon={<VideoCameraIcon className="w-5 h-5" />}
        >
          {loading ? 'Starting Camera...' : 'Start Camera'}
        </Button>
        
        <div>
          <Button
            variant="outline"
            onClick={handleCancel}
            icon={<XMarkIcon className="w-4 h-4" />}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {!isCameraActive && !capturedPhoto && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderInitialState()}
            </motion.div>
          )}

          {isCameraActive && !capturedPhoto && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {renderCameraInterface()}
            </motion.div>
          )}

          {capturedPhoto && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {renderPhotoPreview()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

CameraCapture.propTypes = {
  onPhotoCapture: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  maxWidth: PropTypes.number,
  maxHeight: PropTypes.number,
  quality: PropTypes.number,
  className: PropTypes.string
};

export default CameraCapture;
