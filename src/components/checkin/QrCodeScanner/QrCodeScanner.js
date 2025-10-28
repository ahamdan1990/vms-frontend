// src/components/checkin/QrCodeScanner/QrCodeScanner.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Scanner, useDevices } from '@yudiel/react-qr-scanner';

// Styles
import './QrCodeScanner.css';

// Components
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';

// Icons
import {
  QrCodeIcon,
  CameraIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StopIcon
} from '@heroicons/react/24/outline';

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
  const [scanMode, setScanMode] = useState('camera');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanningStatus, setScanningStatus] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [scanStats, setScanStats] = useState({ successful: 0, failed: 0 });
  const [lastScanTime, setLastScanTime] = useState(null);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [scanCooldown, setScanCooldown] = useState(false);

  // Use refs for debouncing to avoid re-creating callback
  const scanCooldownRef = useRef(false);
  const lastScannedCodeRef = useRef(null);

  // Get available cameras
  const devices = useDevices();

  // Auto-select first camera when devices are loaded
  useEffect(() => {
    if (devices && devices.length > 0 && !selectedDevice) {
      console.log('📷 Available cameras:', devices);
      setAvailableDevices(devices);
      setSelectedDevice(devices[0].deviceId);
      console.log('✅ Selected camera:', devices[0].label || devices[0].deviceId);
    }
  }, [devices, selectedDevice]);

  // Cleanup: Stop camera when component unmounts
  useEffect(() => {
    return () => {
      // Stop all video tracks when unmounting
      if (isScanning) {
        const stopAllTracks = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('🛑 Camera stopped on unmount');
          } catch (err) {
            // Camera might already be stopped, ignore error
          }
        };
        stopAllTracks();
      }
    };
  }, [isScanning]);

  // Audio beep on successful scan
  const playSuccessBeep = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (err) {
      console.warn('Audio beep failed:', err);
    }
  }, []);

  // Handle manual QR code input
  const handleManualScan = async () => {
    if (!manualCode.trim()) {
      setError('Please enter a QR code or invitation number');
      return;
    }

    try {
      setError(null);
      await onScan(manualCode.trim());
      playSuccessBeep();
      setScanResult('✅ Check-in successful!');
      setScanStats(prev => ({ ...prev, successful: prev.successful + 1 }));
      setLastScanTime(new Date());
      setManualCode('');
      setTimeout(() => setScanResult(null), 3000);
    } catch (error) {
      setScanStats(prev => ({ ...prev, failed: prev.failed + 1 }));
      setError(error.message || 'Check-in failed');
    }
  };

  // Handle QR scan from camera - CORRECT format for @yudiel/react-qr-scanner
  const handleScan = useCallback(async (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0]; // Get first detected code
      const qrValue = code.rawValue;

      // Prevent duplicate scans within cooldown period (3 seconds) using refs
      if (scanCooldownRef.current || qrValue === lastScannedCodeRef.current) {
        return;
      }

      console.log('🎉 QR CODE DETECTED!');
      console.log('Format:', code.format);
      console.log('Value:', qrValue);

      // Set cooldown and remember this code in both state and ref
      scanCooldownRef.current = true;
      lastScannedCodeRef.current = qrValue;
      setScanCooldown(true);
      setLastScannedCode(qrValue);

      playSuccessBeep();
      setScanningStatus('✅ QR Code detected! Processing...');

      try {
        await onScan(qrValue);
        setScanResult('✅ Check-in successful!');
        setScanStats(prev => ({ ...prev, successful: prev.successful + 1 }));
        setLastScanTime(new Date());
        setError(null);

        // Pause to show success, then resume
        setTimeout(() => {
          setScanResult(null);
          setScanningStatus('📷 Camera active - Ready for next scan');
          scanCooldownRef.current = false;
          lastScannedCodeRef.current = null;
          setScanCooldown(false);
          setLastScannedCode(null);
        }, 3000);
      } catch (error) {
        setScanStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        setError(error.message || 'Check-in failed');
        setScanningStatus('⚠️ Scan failed - Ready to try again');

        // Keep cooldown for failed scans to prevent spam
        setTimeout(() => {
          setError(null);
          setScanningStatus('📷 Camera active - Ready for next scan');
          scanCooldownRef.current = false;
          lastScannedCodeRef.current = null;
          setScanCooldown(false);
          setLastScannedCode(null);
        }, 3000);
      }
    }
  }, [onScan, playSuccessBeep]);

  // Handle scan error
  const handleError = useCallback((error) => {
    console.error('Scanner error:', error);
    setError(`Camera error: ${error?.message || 'Unable to access camera'}`);
  }, []);

  // Toggle scanning
  const toggleScanning = async () => {
    if (isScanning) {
      setIsScanning(false);
      setScanningStatus('');
    } else {
      // Request camera permission first to get proper device info
      try {
        console.log('🔐 Requesting camera permission...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // Stop the stream immediately, we just needed permission
        stream.getTracks().forEach(track => track.stop());

        console.log('✅ Camera permission granted');

        // Now get updated device list with proper IDs
        const updatedDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = updatedDevices.filter(device => device.kind === 'videoinput');

        console.log('📷 Updated cameras with IDs:', videoDevices);
        setAvailableDevices(videoDevices);

        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
          console.log('✅ Using camera:', videoDevices[0].label || videoDevices[0].deviceId);
        }

        setIsScanning(true);
        setScanningStatus('📷 Camera active - Point QR code at camera');
        setError(null);
      } catch (err) {
        console.error('❌ Camera permission denied:', err);
        setError('Camera permission denied. Please allow camera access.');
      }
    }
  };

  // Clear error when switching modes
  const handleModeChange = (mode) => {
    setScanMode(mode);
    setError(null);
    setScanResult(null);
    if (mode === 'manual') {
      setIsScanning(false);
      setScanningStatus('');
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
          {/* Camera Selection */}
          {availableDevices.length > 1 && (
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Camera
              </label>
              <select
                value={selectedDevice || ''}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isScanning}
              >
                {availableDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.substring(0, 8)}...`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            {isScanning ? (
              selectedDevice ? (
                <div className="mx-auto qr-scanner-container" style={{ maxWidth: '600px' }}>
                  <Scanner
                    onScan={handleScan}
                    onError={handleError}
                    constraints={{
                      deviceId: selectedDevice
                    }}
                    formats={['qr_code']}
                    scanDelay={500}
                    allowMultiple={false}
                    components={{
                      audio: false,
                      finder: true,
                      torch: false,
                      zoom: false,
                      onOff: false
                    }}
                  />
                  {/* Animated corner overlays */}
                  <div className="qr-finder-overlay">
                    <div className="qr-corner qr-corner-tl"></div>
                    <div className="qr-corner qr-corner-tr"></div>
                    <div className="qr-corner qr-corner-bl"></div>
                    <div className="qr-corner qr-corner-br"></div>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center" style={{ minHeight: '300px' }}>
                  <div className="text-center p-8">
                    <p className="text-base text-gray-700 font-medium mb-2">Loading cameras...</p>
                  </div>
                </div>
              )
            ) : (
              <div className="w-full max-w-md mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center" style={{ minHeight: '300px' }}>
                <div className="text-center p-8">
                  <QrCodeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-base text-gray-700 font-medium mb-2">Camera Scanner Ready</p>
                  <p className="text-sm text-gray-600">Click "Start Scanning" to activate camera</p>
                </div>
              </div>
            )}
          </div>

          {/* Scanning Status Indicator */}
          {scanningStatus && (
            <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg mx-auto max-w-md">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-pulse">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-blue-800">{scanningStatus}</p>
              </div>
              <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-scan-line"></div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-4 text-center text-xs text-gray-600 max-w-md mx-auto">
            <p>💡 <strong>Tips:</strong> Hold QR code steady within the finder box</p>
          </div>

          <div className="flex justify-center space-x-3">
            <Button
              onClick={toggleScanning}
              disabled={loading}
              icon={isScanning ? <StopIcon className="w-4 h-4" /> : <CameraIcon className="w-4 h-4" />}
            >
              {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </Button>
          </div>

          {/* Scan Statistics */}
          {(scanStats.successful > 0 || scanStats.failed > 0) && (
            <div className="max-w-md mx-auto mt-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Session Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{scanStats.successful}</div>
                    <div className="text-xs text-gray-500 mt-1">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{scanStats.failed}</div>
                    <div className="text-xs text-gray-500 mt-1">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {scanStats.successful + scanStats.failed}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Total</div>
                  </div>
                </div>
                {lastScanTime && (
                  <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                    <div className="text-xs text-gray-500">
                      Last scan: {lastScanTime.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
              placeholder="Scan with hardware scanner or type manually..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && manualCode.trim()) {
                  handleManualScan();
                }
              }}
              autoComplete="off"
              autoFocus
            />

            <div className="mt-2 text-xs text-gray-500 text-center">
              <p>💡 Hardware QR scanners are supported - just scan and press Enter</p>
            </div>

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
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 20
            }
          }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="bg-red-50 border-2 border-red-300 rounded-lg p-4 max-w-md mx-auto shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 }
              }}
            >
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            </motion.div>
            <div className="text-sm font-medium text-red-700">{error}</div>
          </div>
        </motion.div>
      )}

      {/* Success Display */}
      {scanResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: [0.8, 1.1, 1],
            transition: {
              duration: 0.5,
              times: [0, 0.6, 1]
            }
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-green-50 border-2 border-green-300 rounded-lg p-4 max-w-md mx-auto shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{
                duration: 0.6,
                times: [0, 0.5, 1]
              }}
            >
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
            </motion.div>
            <div className="text-sm font-medium text-green-700">{scanResult}</div>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2 }}
            className="mt-2 h-1 bg-green-400 rounded-full origin-left"
          />
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 max-w-md mx-auto">
        {scanMode === 'camera' ? (
          <p>
            Position the QR code within the finder box. Detection is automatic with beep sound.
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
