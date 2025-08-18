// src/components/checkin/QrCodeScanner/QrCodeScanner.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// Services
import invitationService from '../../../services/invitationService';

// Components
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Card from '../../common/Card/Card';
import Badge from '../../common/Badge/Badge';

// Icons
import {
  QrCodeIcon,
  CameraIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  EyeIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  StopIcon
} from '@heroicons/react/24/outline';

// Utils
import { extractErrorMessage } from '../../../utils/errorUtils';
import formatters from '../../../utils/formatters';

/**
 * QR Code Scanner Component
 * Provides QR code scanning functionality for visitor check-in
 * Includes both camera scanning and manual input options
 */
const QrCodeScanner = ({
  onScan,
  loading = false,
  className = ''
}) => {
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle manual QR code input
  const handleManualScan = async () => {
    if (!manualCode.trim()) {
      setError('Please enter a QR code or invitation number');
      return;
    }

    try {
      setError(null);
      await onScan(manualCode.trim());
      setScanResult('Check-in successful!');
      setManualCode('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setScanResult(null), 3000);
    } catch (error) {
      setError(error.message || 'Check-in failed');
    }
  };

  // Simulate camera scanning (in a real app, this would use a QR scanning library)
  const startCameraScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      // In a real implementation, this would access the camera
      // For now, we'll simulate the scanning interface
      setTimeout(() => {
        setIsScanning(false);
        setError('Camera scanning is not available in this demo. Please use manual input.');
      }, 2000);

    } catch (error) {
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  }, []);

  const stopScanning = () => {
    setIsScanning(false);
  };

  // Clear error when switching modes
  const handleModeChange = (mode) => {
    setScanMode(mode);
    setError(null);
    setScanResult(null);
    if (mode === 'manual') {
      stopScanning();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mode Selector */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant={scanMode === 'camera' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('camera')}
          icon={<CameraIcon className="w-4 h-4" />}
        >
          Camera
        </Button>
        <Button
          variant={scanMode === 'manual' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('manual')}
          icon={<DocumentTextIcon className="w-4 h-4" />}
        >
          Manual
        </Button>
      </div>

      {/* Camera Scanner */}
      {scanMode === 'camera' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="relative">
            <div className="w-80 h-60 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden">
              {isScanning ? (
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-2 text-sm text-gray-600">Scanning for QR codes...</p>
                </div>
              ) : (
                <div className="text-center">
                  <QrCodeIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Camera view will appear here</p>
                </div>
              )}
              
              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
                </div>
              )}
            </div>
            
            {/* Hidden video element for camera access */}
            <video
              ref={videoRef}
              className="hidden"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex justify-center space-x-3">
            {!isScanning ? (
              <Button
                onClick={startCameraScanning}
                disabled={loading}
                icon={<CameraIcon className="w-4 h-4" />}
              >
                Start Scanning
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={stopScanning}
                icon={<ExclamationTriangleIcon className="w-4 h-4" />}
              >
                Stop Scanning
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Manual Input */}
      {scanMode === 'manual' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="max-w-md mx-auto">
            <Input
              label="QR Code or Invitation Number"
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter QR code data or invitation number..."
              onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
              autoComplete="off"
            />
            
            <div className="mt-4">
              <Button
                onClick={handleManualScan}
                disabled={loading || !manualCode.trim()}
                loading={loading}
                className="w-full"
                icon={<QrCodeIcon className="w-4 h-4" />}
              >
                Process Check-in
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md mx-auto"
        >
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </motion.div>
      )}

      {/* Success Display */}
      {scanResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-md p-4 max-w-md mx-auto"
        >
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <div className="text-sm text-green-700">{scanResult}</div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 max-w-md mx-auto">
        {scanMode === 'camera' ? (
          <p>
            Position the QR code within the camera view. The scanner will automatically detect and process the code.
          </p>
        ) : (
          <p>
            Enter the QR code data or invitation number manually. You can find this on the visitor's invitation or printed badge.
          </p>
        )}
      </div>
    </div>
  );
};

// PropTypes validation
QrCodeScanner.propTypes = {
  onScan: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default QrCodeScanner;