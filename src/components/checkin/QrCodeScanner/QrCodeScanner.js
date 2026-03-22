// src/components/checkin/QrCodeScanner/QrCodeScanner.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Scanner, useDevices } from '@yudiel/react-qr-scanner';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('checkin');

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

  const scanCooldownRef = useRef(false);
  const lastScannedCodeRef = useRef(null);

  const devices = useDevices();

  useEffect(() => {
    if (devices && devices.length > 0 && !selectedDevice) {
      setAvailableDevices(devices);
      setSelectedDevice(devices[0].deviceId);
    }
  }, [devices, selectedDevice]);

  // Note: Camera cleanup is handled by the @yudiel/react-qr-scanner Scanner component
  // when it unmounts (isScanning becomes false). No manual getUserMedia cleanup needed here.

  const playSuccessBeep = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (beepError) {
      console.warn('Audio beep failed:', beepError);
    }
  }, []);

  const handleManualScan = async () => {
    if (!manualCode.trim()) {
      setError(t('qrScanner.errors.enterCode'));
      return;
    }

    try {
      setError(null);
      await onScan(manualCode.trim());
      playSuccessBeep();
      setScanResult(t('qrScanner.results.checkInSuccess'));
      setScanStats(prev => ({ ...prev, successful: prev.successful + 1 }));
      setLastScanTime(new Date());
      setManualCode('');
      setTimeout(() => setScanResult(null), 3000);
    } catch (scanError) {
      setScanStats(prev => ({ ...prev, failed: prev.failed + 1 }));
      setError(scanError.message || t('qrScanner.errors.checkInFailed'));
    }
  };

  const handleScan = useCallback(async (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0];
      const qrValue = code.rawValue;

      if (scanCooldownRef.current || qrValue === lastScannedCodeRef.current) {
        return;
      }

      scanCooldownRef.current = true;
      lastScannedCodeRef.current = qrValue;

      playSuccessBeep();
      setScanningStatus(t('qrScanner.scanning.detectedProcessing'));

      try {
        await onScan(qrValue);
        setScanResult(t('qrScanner.results.checkInSuccess'));
        setScanStats(prev => ({ ...prev, successful: prev.successful + 1 }));
        setLastScanTime(new Date());
        setError(null);

        setTimeout(() => {
          setScanResult(null);
          setScanningStatus(t('qrScanner.scanning.readyForNext'));
          scanCooldownRef.current = false;
          lastScannedCodeRef.current = null;
        }, 3000);
      } catch (scanError) {
        setScanStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        setError(scanError.message || t('qrScanner.errors.checkInFailed'));
        setScanningStatus(t('qrScanner.scanning.scanFailedRetry'));

        setTimeout(() => {
          setError(null);
          setScanningStatus(t('qrScanner.scanning.readyForNext'));
          scanCooldownRef.current = false;
          lastScannedCodeRef.current = null;
        }, 3000);
      }
    }
  }, [onScan, playSuccessBeep, t]);

  const handleError = useCallback((scanError) => {
    console.error('Scanner error:', scanError);
    setError(t('qrScanner.errors.cameraError', { message: scanError?.message || t('qrScanner.errors.cameraUnavailable') }));
  }, [t]);

  const toggleScanning = async () => {
    if (isScanning) {
      setIsScanning(false);
      setScanningStatus('');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());

        const updatedDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = updatedDevices.filter(device => device.kind === 'videoinput');

        setAvailableDevices(videoDevices);

        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }

        setIsScanning(true);
        setScanningStatus(t('qrScanner.scanning.cameraActive'));
        setError(null);
      } catch (permissionError) {
        console.error('Camera permission denied:', permissionError);
        setError(t('qrScanner.errors.cameraPermissionDenied'));
      }
    }
  };

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
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={scanMode === 'camera' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('camera')}
          icon={<CameraIcon className="w-4 h-4" />}
        >
          {t('qrScanner.modes.camera')}
        </Button>
        <Button
          variant={scanMode === 'manual' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('manual')}
          icon={<DocumentTextIcon className="w-4 h-4" />}
        >
          {t('qrScanner.modes.manual')}
        </Button>
      </div>

      {scanMode === 'camera' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {availableDevices.length > 1 && (
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('qrScanner.selectCamera')}
              </label>
              <select
                value={selectedDevice || ''}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isScanning}
              >
                {availableDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || t('qrScanner.cameraFallback', { id: device.deviceId.substring(0, 8) })}
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
                  <div className="qr-finder-overlay">
                    <div className="qr-corner qr-corner-tl"></div>
                    <div className="qr-corner qr-corner-tr"></div>
                    <div className="qr-corner qr-corner-bl"></div>
                    <div className="qr-corner qr-corner-br"></div>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md mx-auto bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center" style={{ minHeight: '300px' }}>
                  <div className="text-center p-8">
                    <p className="text-base text-gray-700 dark:text-gray-200 font-medium mb-2">{t('qrScanner.loadingCameras')}</p>
                  </div>
                </div>
              )
            ) : (
              <div className="w-full max-w-md mx-auto bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center" style={{ minHeight: '300px' }}>
                <div className="text-center p-8">
                  <QrCodeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-base text-gray-700 dark:text-gray-200 font-medium mb-2">{t('qrScanner.cameraReady')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('qrScanner.clickStartScanning')}</p>
                </div>
              </div>
            )}
          </div>

          {scanningStatus && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg mx-auto max-w-md">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-pulse">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{scanningStatus}</p>
              </div>
              <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-scan-line"></div>
              </div>
            </div>
          )}

          <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            <p>{t('qrScanner.tip')}</p>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              onClick={toggleScanning}
              disabled={loading}
              icon={isScanning ? <StopIcon className="w-4 h-4" /> : <CameraIcon className="w-4 h-4" />}
            >
              {isScanning ? t('qrScanner.buttons.stopScanning') : t('qrScanner.buttons.startScanning')}
            </Button>
          </div>

          {(scanStats.successful > 0 || scanStats.failed > 0) && (
            <div className="max-w-md mx-auto mt-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">{t('qrScanner.stats.sessionStatistics')}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{scanStats.successful}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('qrScanner.stats.successful')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{scanStats.failed}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('qrScanner.stats.failed')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{scanStats.successful + scanStats.failed}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('qrScanner.stats.total')}</div>
                  </div>
                </div>
                {lastScanTime && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('qrScanner.stats.lastScan', { time: lastScanTime.toLocaleTimeString() })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {scanMode === 'manual' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="max-w-md mx-auto">
            <Input
              label={t('qrScanner.manual.label')}
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder={t('qrScanner.manual.placeholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualCode.trim()) {
                  handleManualScan();
                }
              }}
              autoComplete="off"
              autoFocus
            />

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>{t('qrScanner.manual.hardwareTip')}</p>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleManualScan}
                disabled={loading || !manualCode.trim()}
                loading={loading}
                className="w-full"
                icon={<QrCodeIcon className="w-4 h-4" />}
              >
                {t('qrScanner.buttons.processCheckIn')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 20
            }
          }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="bg-red-50 border-2 border-red-300 rounded-lg p-4 max-w-md mx-auto shadow-lg"
        >
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-3">
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

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        {scanMode === 'camera' ? (
          <p>{t('qrScanner.instructions.camera')}</p>
        ) : (
          <p>{t('qrScanner.instructions.manual')}</p>
        )}
      </div>
    </div>
  );
};

QrCodeScanner.propTypes = {
  onScan: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default QrCodeScanner;
