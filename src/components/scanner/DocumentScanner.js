// src/components/scanner/DocumentScanner.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// Services
import visitorDocumentService from '../../services/visitorDocumentService';

// Components
import Button from '../common/Button/Button';
import Card from '../common/Card/Card';
import Badge from '../common/Badge/Badge';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';

// Icons
import {
  DocumentScannerIcon,
  CameraIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon,
  CloudArrowUpIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// Utils
import { extractErrorMessage } from '../../utils/errorUtils';

/**
 * Document Scanner Component
 * Provides document scanning functionality using camera
 * Includes scan preview, quality adjustment, and auto-upload options
 */
const DocumentScanner = ({
  onDocumentScanned,
  onCancel,
  visitorId = null, // If provided, will auto-upload scanned documents
  documentType = 'Other',
  autoUpload = false,
  className = ''
}) => {
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // State
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImages, setScannedImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  
  // Scanner settings
  const [scanSettings, setScanSettings] = useState({
    quality: 0.9,
    maxWidth: 1200,
    maxHeight: 1600,
    autoEnhance: true
  });

  // Start camera for scanning
  const startScanning = useCallback(() => {
    if (isScanning || loading) return;
    setError(null);
    setShowSettings(false);
    setIsScanning(true);
  }, [isScanning, loading]);

  // Stop camera
  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setShowSettings(false);
  }, []);

  const waitForVideoElement = useCallback(() => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30;

      const checkElement = () => {
        if (!isScanning) {
          reject(new Error('Scanning cancelled'));
          return;
        }

        if (videoRef.current) {
          resolve(videoRef.current);
          return;
        }

        attempts += 1;
        if (attempts > maxAttempts) {
          reject(new Error('Video element not ready'));
          return;
        }

        requestAnimationFrame(checkElement);
      };

      checkElement();
    });
  }, [isScanning]);

  // Initialize camera stream once scanning UI is active
  useEffect(() => {
    if (!isScanning || streamRef.current) return;
    let isCancelled = false;

    const initializeStream = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📷 Starting document scanner...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment'
          },
          audio: false
        });

        if (isCancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        console.log('✅ Camera stream obtained:', stream.active);

        let videoElement;
        try {
          videoElement = await waitForVideoElement();
        } catch (videoError) {
          console.error('❌ Video element unavailable:', videoError);
          stream.getTracks().forEach(track => track.stop());
          if (!isCancelled) {
            setError('Scanner preview unavailable. Please try again.');
            setIsScanning(false);
          }
          return;
        }

        if (isCancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        videoElement.srcObject = stream;
        streamRef.current = stream;

        try {
          await videoElement.play();
          console.log('✅ Video playing');
        } catch (playError) {
          console.warn('Video play failed:', playError);
        }

        console.log('✅ Scanner state set to active');
      } catch (error) {
        if (isCancelled) return;

        console.error('❌ Camera access error:', error);

        if (error.name === 'NotAllowedError') {
          setError('Camera access denied. Please enable camera permissions.');
        } else if (error.name === 'NotFoundError') {
          setError('No camera found. Please ensure a camera is connected.');
        } else {
          setError('Unable to access camera for document scanning.');
        }
        setIsScanning(false);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    initializeStream();

    return () => {
      isCancelled = true;
    };
  }, [isScanning, waitForVideoElement]);

  // Capture document scan
  const captureDocument = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = Math.min(video.videoWidth, scanSettings.maxWidth);
    canvas.height = Math.min(video.videoHeight, scanSettings.maxHeight);

    // Apply scaling if needed
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = video.videoWidth * scale;
    const scaledHeight = video.videoHeight * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Clear canvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    context.drawImage(video, offsetX, offsetY, scaledWidth, scaledHeight);

    // Apply auto-enhancement if enabled
    if (scanSettings.autoEnhance) {
      enhanceDocument(context, canvas.width, canvas.height);
    }

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const scanData = {
            id: Date.now(),
            blob,
            url,
            width: canvas.width,
            height: canvas.height,
            timestamp: new Date(),
            type: documentType
          };

          setScannedImages(prev => [...prev, scanData]);
        }
      },
      'image/jpeg',
      scanSettings.quality
    );
  }, [scanSettings, documentType]);

  // Basic document enhancement
  const enhanceDocument = (context, width, height) => {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Simple contrast and brightness adjustment
    const contrast = 1.2;
    const brightness = 10;

    for (let i = 0; i < data.length; i += 4) {
      // Apply contrast and brightness
      data[i] = Math.min(255, Math.max(0, contrast * data[i] + brightness));     // Red
      data[i + 1] = Math.min(255, Math.max(0, contrast * data[i + 1] + brightness)); // Green
      data[i + 2] = Math.min(255, Math.max(0, contrast * data[i + 2] + brightness)); // Blue
    }

    context.putImageData(imageData, 0, 0);
  };

  // Upload scanned document
  const uploadDocument = async (scanData, index) => {
    if (!visitorId || !autoUpload) return;

    try {
      setUploadingIndex(index);
      
      const file = new File([scanData.blob], `scanned-document-${scanData.id}.jpg`, {
        type: 'image/jpeg',
        lastModified: scanData.timestamp.getTime()
      });

      const result = await visitorDocumentService.uploadVisitorDocument(
        visitorId,
        file,
        `Scanned Document ${scannedImages.length + 1}`,
        documentType,
        {
          description: `Document scanned on ${scanData.timestamp.toLocaleString()}`,
          isSensitive: false,
          isRequired: false,
          tags: 'scanned,document,receptionist'
        }
      );

      // Update scan data with upload result
      setScannedImages(prev => prev.map((scan, i) => 
        i === index ? { ...scan, uploaded: true, uploadResult: result } : scan
      ));

    } catch (error) {
      console.error('Document upload failed:', error);
      setError(`Upload failed: ${extractErrorMessage(error)}`);
    } finally {
      setUploadingIndex(-1);
    }
  };

  // Confirm all scanned documents
  const confirmDocuments = () => {
    if (onDocumentScanned) {
      onDocumentScanned(scannedImages);
    }
  };

  // Remove scanned document
  const removeDocument = (index) => {
    const documentToRemove = scannedImages[index];
    if (documentToRemove) {
      URL.revokeObjectURL(documentToRemove.url);
      setScannedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Handle cancel
  const handleCancel = () => {
    stopScanning();
    
    // Clean up URLs
    scannedImages.forEach(scan => {
      URL.revokeObjectURL(scan.url);
    });
    
    if (onCancel) {
      onCancel();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
      scannedImages.forEach(scan => {
        URL.revokeObjectURL(scan.url);
      });
    };
  }, [stopScanning, scannedImages]);

  useEffect(() => {
    if (!isScanning) {
      setShowSettings(false);
    }
  }, [isScanning]);

  // Render scanning interface
  const renderScanningInterface = () => (
    <div className="space-y-4">
      {/* Video preview */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Scanning guide overlay */}
        <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-60">
          <div className="absolute top-2 left-2 right-2">
            <p className="text-white text-sm text-center bg-black bg-opacity-50 rounded px-2 py-1">
              Align document within this frame
            </p>
          </div>
        </div>

        {/* Scanning controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={stopScanning}
              icon={<XMarkIcon className="w-4 h-4" />}
            >
              Stop
            </Button>
            
            <Button
              onClick={captureDocument}
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 rounded-full w-16 h-16"
              icon={<DocumentTextIcon className="w-8 h-8" />}
            />
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(prev => !prev)}
              icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
            >
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Scan settings */}
      {showSettings && (
        <Card className="p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Scan Settings</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality: {Math.round(scanSettings.quality * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.1"
                value={scanSettings.quality}
                onChange={(e) => setScanSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoEnhance"
                checked={scanSettings.autoEnhance}
                onChange={(e) => setScanSettings(prev => ({ ...prev, autoEnhance: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="autoEnhance" className="text-sm text-gray-700">
                Auto-enhance document
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600">
        <p>Position the document flat and well-lit. Tap the scan button to capture.</p>
      </div>
    </div>
  );

  // Render scanned documents
  const renderScannedDocuments = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Scanned Documents ({scannedImages.length})
        </h3>
        {scannedImages.length > 0 && (
          <Button
            size="sm"
            onClick={startScanning}
            icon={<DocumentTextIcon className="w-4 h-4" />}
          >
            Scan Another
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scannedImages.map((scan, index) => (
          <Card key={scan.id} className="p-4">
            <div className="space-y-3">
              {/* Document preview */}
              <div className="relative">
                <img
                  src={scan.url}
                  alt={`Scanned document ${index + 1}`}
                  className="w-full h-32 object-cover rounded border"
                />
                
                {/* Upload status */}
                {autoUpload && visitorId && (
                  <div className="absolute top-2 right-2">
                    {uploadingIndex === index ? (
                      <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <LoadingSpinner size="xs" />
                        <span>Uploading...</span>
                      </div>
                    ) : scan.uploaded ? (
                      <Badge color="green" size="sm">Uploaded</Badge>
                    ) : (
                      <Badge color="gray" size="sm">Local</Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Document info */}
              <div className="text-sm text-gray-600">
                <p><strong>Size:</strong> {scan.width} × {scan.height}px</p>
                <p><strong>Scanned:</strong> {scan.timestamp.toLocaleTimeString()}</p>
                <p><strong>Type:</strong> {scan.type}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => window.open(scan.url, '_blank')}
                  icon={<EyeIcon className="w-3 h-3" />}
                >
                  View
                </Button>
                
                {autoUpload && visitorId && !scan.uploaded && (
                  <Button
                    size="xs"
                    onClick={() => uploadDocument(scan, index)}
                    loading={uploadingIndex === index}
                    icon={<CloudArrowUpIcon className="w-3 h-3" />}
                  >
                    Upload
                  </Button>
                )}
                
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => removeDocument(index)}
                  icon={<XMarkIcon className="w-3 h-3" />}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Actions */}
      {scannedImages.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            icon={<XMarkIcon className="w-4 h-4" />}
          >
            Cancel
          </Button>
          
          <Button
            onClick={confirmDocuments}
            icon={<CheckIcon className="w-4 h-4" />}
          >
            Confirm {scannedImages.length} Document{scannedImages.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );

  // Render initial state
  const renderInitialState = () => (
    <div className="text-center py-12">
      <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Document Scanner</h3>
      <p className="text-gray-600 mb-6">
        Scan visitor documents using your device camera
      </p>
      
      <div className="space-y-3">
        <Button
          onClick={startScanning}
          loading={loading}
          disabled={loading}
          icon={<CameraIcon className="w-5 h-5" />}
        >
          {loading ? 'Starting Scanner...' : 'Start Scanning'}
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
      {/* Hidden canvas for image processing */}
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
          {!isScanning && scannedImages.length === 0 && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderInitialState()}
            </motion.div>
          )}

          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {renderScanningInterface()}
            </motion.div>
          )}

          {!isScanning && scannedImages.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {renderScannedDocuments()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

DocumentScanner.propTypes = {
  onDocumentScanned: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  visitorId: PropTypes.number,
  documentType: PropTypes.string,
  autoUpload: PropTypes.bool,
  className: PropTypes.string
};

export default DocumentScanner;
