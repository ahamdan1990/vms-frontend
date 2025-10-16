import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

// Components
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Select from '../../common/Select/Select';
import Switch from '../../common/Switch/Switch';
import Textarea from '../../common/Textarea/Textarea';
import Accordion from '../../common/Accordion/Accordion';
import Alert from '../../common/Alert/Alert';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';

// Redux actions
import { createCamera, updateCamera, testConnectionParameters } from '../../../store/slices/camerasSlice';
import { getActiveLocations } from '../../../store/slices/locationsSlice';

// Constants and utilities
import { CAMERA_CONSTANTS } from '../../../constants/cameraConstants';
import { validateConnectionString, generateTestConnectionData } from '../../../utils/cameraUtils';

// Icons
import {
  CameraIcon,
  WifiIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * CameraForm - Create/Edit camera form component
 * Comprehensive form with validation, connection testing, and configuration
 */
const CameraForm = ({
  camera = null,
  isOpen,
  onClose,
  onSuccess,
  className = ''
}) => {
  const dispatch = useDispatch();
  const isEditMode = !!camera;

  // Redux state
  const { createLoading, updateLoading, operationLoading } = useSelector(state => state.cameras);
  const { list: locations, activeLocationsLoading } = useSelector(state => state.locations);

  // Form state
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isValid, isDirty }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      cameraType: CAMERA_CONSTANTS.FORM_DEFAULTS.cameraType,
      connectionString: '',
      username: '',
      password: '',
      locationId: '',
      priority: CAMERA_CONSTANTS.FORM_DEFAULTS.priority,
      isActive: CAMERA_CONSTANTS.FORM_DEFAULTS.isActive,
      enableFacialRecognition: CAMERA_CONSTANTS.FORM_DEFAULTS.enableFacialRecognition,
      manufacturer: '',
      model: '',
      firmwareVersion: '',
      serialNumber: '',
      metadata: '',
      // Configuration fields
      resolutionWidth: CAMERA_CONSTANTS.DEFAULT_CONFIG.resolutionWidth,
      resolutionHeight: CAMERA_CONSTANTS.DEFAULT_CONFIG.resolutionHeight,
      frameRate: CAMERA_CONSTANTS.DEFAULT_CONFIG.frameRate,
      quality: CAMERA_CONSTANTS.DEFAULT_CONFIG.quality,
      autoStart: CAMERA_CONSTANTS.DEFAULT_CONFIG.autoStart,
      maxConnections: CAMERA_CONSTANTS.DEFAULT_CONFIG.maxConnections,
      connectionTimeoutSeconds: CAMERA_CONSTANTS.DEFAULT_CONFIG.connectionTimeoutSeconds,
      retryIntervalSeconds: CAMERA_CONSTANTS.DEFAULT_CONFIG.retryIntervalSeconds,
      maxRetryAttempts: CAMERA_CONSTANTS.DEFAULT_CONFIG.maxRetryAttempts,
      enableMotionDetection: CAMERA_CONSTANTS.DEFAULT_CONFIG.enableMotionDetection,
      motionSensitivity: CAMERA_CONSTANTS.DEFAULT_CONFIG.motionSensitivity,
      enableRecording: CAMERA_CONSTANTS.DEFAULT_CONFIG.enableRecording,
      recordingDurationMinutes: CAMERA_CONSTANTS.DEFAULT_CONFIG.recordingDurationMinutes,
      facialRecognitionThreshold: CAMERA_CONSTANTS.DEFAULT_CONFIG.facialRecognitionThreshold
    }
  });

  // Watch form values for connection testing
  const watchedCameraType = watch('cameraType');
  const watchedConnectionString = watch('connectionString');
  const watchedUsername = watch('username');
  const watchedPassword = watch('password');

  // Local state
  const [connectionTestResult, setConnectionTestResult] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  // Load locations on mount
  useEffect(() => {
    if (isOpen) {
      dispatch(getActiveLocations());
    }
  }, [dispatch, isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (camera && isOpen) {
      const config = camera.configuration || {};
      
      reset({
        name: camera.name || '',
        description: camera.description || '',
        cameraType: camera.cameraType || CAMERA_CONSTANTS.FORM_DEFAULTS.cameraType,
        connectionString: camera.connectionString || '',
        username: camera.username || '',
        password: camera.password || '',
        locationId: camera.locationId?.toString() || '',
        priority: camera.priority || CAMERA_CONSTANTS.FORM_DEFAULTS.priority,
        isActive: camera.isActive !== undefined ? camera.isActive : CAMERA_CONSTANTS.FORM_DEFAULTS.isActive,
        enableFacialRecognition: camera.enableFacialRecognition !== undefined ? camera.enableFacialRecognition : CAMERA_CONSTANTS.FORM_DEFAULTS.enableFacialRecognition,
        manufacturer: camera.manufacturer || '',
        model: camera.model || '',
        firmwareVersion: camera.firmwareVersion || '',
        serialNumber: camera.serialNumber || '',
        metadata: camera.metadata || '',
        // Configuration fields
        resolutionWidth: config.resolutionWidth || CAMERA_CONSTANTS.DEFAULT_CONFIG.resolutionWidth,
        resolutionHeight: config.resolutionHeight || CAMERA_CONSTANTS.DEFAULT_CONFIG.resolutionHeight,
        frameRate: config.frameRate || CAMERA_CONSTANTS.DEFAULT_CONFIG.frameRate,
        quality: config.quality || CAMERA_CONSTANTS.DEFAULT_CONFIG.quality,
        autoStart: config.autoStart !== undefined ? config.autoStart : CAMERA_CONSTANTS.DEFAULT_CONFIG.autoStart,
        maxConnections: config.maxConnections || CAMERA_CONSTANTS.DEFAULT_CONFIG.maxConnections,
        connectionTimeoutSeconds: config.connectionTimeoutSeconds || CAMERA_CONSTANTS.DEFAULT_CONFIG.connectionTimeoutSeconds,
        retryIntervalSeconds: config.retryIntervalSeconds || CAMERA_CONSTANTS.DEFAULT_CONFIG.retryIntervalSeconds,
        maxRetryAttempts: config.maxRetryAttempts || CAMERA_CONSTANTS.DEFAULT_CONFIG.maxRetryAttempts,
        enableMotionDetection: config.enableMotionDetection !== undefined ? config.enableMotionDetection : CAMERA_CONSTANTS.DEFAULT_CONFIG.enableMotionDetection,
        motionSensitivity: config.motionSensitivity || CAMERA_CONSTANTS.DEFAULT_CONFIG.motionSensitivity,
        enableRecording: config.enableRecording !== undefined ? config.enableRecording : CAMERA_CONSTANTS.DEFAULT_CONFIG.enableRecording,
        recordingDurationMinutes: config.recordingDurationMinutes || CAMERA_CONSTANTS.DEFAULT_CONFIG.recordingDurationMinutes,
        facialRecognitionThreshold: config.facialRecognitionThreshold || CAMERA_CONSTANTS.DEFAULT_CONFIG.facialRecognitionThreshold
      });
    }
  }, [camera, isOpen, reset]);

  // Handle form submission
  const onSubmit = async (data) => {
    setSubmitError(null);
    
    try {
      // Build configuration object
      const configuration = {
        resolutionWidth: parseInt(data.resolutionWidth),
        resolutionHeight: parseInt(data.resolutionHeight),
        frameRate: parseInt(data.frameRate),
        quality: parseInt(data.quality),
        autoStart: data.autoStart,
        maxConnections: parseInt(data.maxConnections),
        connectionTimeoutSeconds: parseInt(data.connectionTimeoutSeconds),
        retryIntervalSeconds: parseInt(data.retryIntervalSeconds),
        maxRetryAttempts: parseInt(data.maxRetryAttempts),
        enableMotionDetection: data.enableMotionDetection,
        motionSensitivity: parseInt(data.motionSensitivity),
        enableRecording: data.enableRecording,
        recordingDurationMinutes: parseInt(data.recordingDurationMinutes),
        facialRecognitionThreshold: parseInt(data.facialRecognitionThreshold)
      };

      // Build camera data
      const cameraData = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        cameraType: data.cameraType,
        connectionString: data.connectionString.trim(),
        username: data.username?.trim() || null,
        password: data.password?.trim() || null,
        locationId: parseInt(data.locationId),
        priority: parseInt(data.priority),
        isActive: data.isActive,
        enableFacialRecognition: data.enableFacialRecognition,
        manufacturer: data.manufacturer?.trim() || null,
        model: data.model?.trim() || null,
        firmwareVersion: data.firmwareVersion?.trim() || null,
        serialNumber: data.serialNumber?.trim() || null,
        metadata: data.metadata?.trim() || null,
        configuration
      };

      let result;
      if (isEditMode) {
        result = await dispatch(updateCamera({ 
          id: camera.id, 
          cameraData,
          testConnection: !!connectionTestResult?.success 
        }));
      } else {
        result = await dispatch(createCamera(cameraData));
      }

      if (result.type.endsWith('fulfilled')) {
        onSuccess?.();
      } else {
        setSubmitError(result.payload || 'An error occurred while saving the camera');
      }
    } catch (error) {
      setSubmitError(error.message || 'An unexpected error occurred');
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    const values = getValues();
    
    if (!values.connectionString) {
      setConnectionTestResult({
        success: false,
        message: 'Connection string is required for testing'
      });
      return;
    }

    setTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const testData = {
        cameraType: values.cameraType,
        connectionString: values.connectionString,
        username: values.username || null,
        password: values.password || null,
        timeoutSeconds: values.connectionTimeoutSeconds || 30
      };

      const result = await dispatch(testConnectionParameters(testData));
      
      if (result.type.endsWith('fulfilled')) {
        setConnectionTestResult({
          success: result.payload.success,
          status: result.payload.status,
          message: result.payload.success ? 'Connection successful!' : result.payload.errorMessage,
          responseTime: result.payload.responseTimeMs,
          details: result.payload.details
        });
      } else {
        setConnectionTestResult({
          success: false,
          message: result.payload || 'Connection test failed'
        });
      }
    } catch (error) {
      setConnectionTestResult({
        success: false,
        message: error.message || 'Failed to test connection'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Validate connection string based on camera type
  const validateConnectionStringForType = (connectionString, cameraType) => {
    if (!connectionString) return CAMERA_CONSTANTS.ERROR_MESSAGES.CONNECTION_STRING_REQUIRED;
    
    switch (cameraType) {
      case CAMERA_CONSTANTS.TYPES.RTSP:
        if (!CAMERA_CONSTANTS.CONNECTION_PATTERNS.RTSP.test(connectionString)) {
          return CAMERA_CONSTANTS.ERROR_MESSAGES.INVALID_RTSP_URL;
        }
        break;
      case CAMERA_CONSTANTS.TYPES.IP:
        if (!CAMERA_CONSTANTS.CONNECTION_PATTERNS.HTTP.test(connectionString)) {
          return CAMERA_CONSTANTS.ERROR_MESSAGES.INVALID_IP_URL;
        }
        break;
      case CAMERA_CONSTANTS.TYPES.USB:
        if (!CAMERA_CONSTANTS.CONNECTION_PATTERNS.USB_DEVICE.test(connectionString)) {
          return 'Invalid USB device path format';
        }
        break;
    }
    
    return true;
  };

  // Prepare location options
  const locationOptions = [
    { value: '', label: 'Select a location' },
    ...locations.map(location => ({
      value: location.id.toString(),
      label: location.name
    }))
  ];

  const isLoading = createLoading || updateLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <CameraIcon className="w-6 h-6 text-blue-600" />
          {isEditMode ? `Edit Camera: ${camera?.name}` : 'Add New Camera'}
        </div>
      }
      size="2xl"
      className={className}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Alert */}
        {submitError && (
          <Alert
            type="error"
            title="Error"
            message={submitError}
            onClose={() => setSubmitError(null)}
          />
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Camera Name"
            required
            {...register('name', {
              required: CAMERA_CONSTANTS.ERROR_MESSAGES.NAME_REQUIRED,
              minLength: {
                value: CAMERA_CONSTANTS.VALIDATION.NAME_MIN_LENGTH,
                message: `Name must be at least ${CAMERA_CONSTANTS.VALIDATION.NAME_MIN_LENGTH} character`
              },
              maxLength: {
                value: CAMERA_CONSTANTS.VALIDATION.NAME_MAX_LENGTH,
                message: `Name must be no more than ${CAMERA_CONSTANTS.VALIDATION.NAME_MAX_LENGTH} characters`
              }
            })}
            error={errors.name?.message}
            placeholder="Enter camera name"
          />

          <Select
            label="Camera Type"
            required
            {...register('cameraType', { required: 'Camera type is required' })}
            error={errors.cameraType?.message}
            options={CAMERA_CONSTANTS.TYPE_OPTIONS.map(type => ({
              value: type.value,
              label: type.label
            }))}
          />
        </div>

        <Textarea
          label="Description"
          {...register('description', {
            maxLength: {
              value: CAMERA_CONSTANTS.VALIDATION.DESCRIPTION_MAX_LENGTH,
              message: `Description must be no more than ${CAMERA_CONSTANTS.VALIDATION.DESCRIPTION_MAX_LENGTH} characters`
            }
          })}
          error={errors.description?.message}
          placeholder="Enter camera description (optional)"
          rows={3}
        />

        {/* Connection Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Connection Settings</h3>
          
          <div className="space-y-4">
            <Input
              label="Connection String"
              required
              {...register('connectionString', {
                required: CAMERA_CONSTANTS.ERROR_MESSAGES.CONNECTION_STRING_REQUIRED,
                validate: (value) => validateConnectionStringForType(value, watchedCameraType)
              })}
              error={errors.connectionString?.message}
              placeholder={
                watchedCameraType === CAMERA_CONSTANTS.TYPES.RTSP ? 'rtsp://192.168.1.100:554/stream' :
                watchedCameraType === CAMERA_CONSTANTS.TYPES.IP ? 'http://192.168.1.100:8080/video' :
                watchedCameraType === CAMERA_CONSTANTS.TYPES.USB ? '/dev/video0 or COM1' :
                'Enter connection string'
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Username (Optional)"
                {...register('username', {
                  maxLength: {
                    value: CAMERA_CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH,
                    message: `Username must be no more than ${CAMERA_CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH} characters`
                  }
                })}
                error={errors.username?.message}
                placeholder="Enter username if required"
              />

              <Input
                type="password"
                label="Password (Optional)"
                {...register('password', {
                  maxLength: {
                    value: CAMERA_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH,
                    message: `Password must be no more than ${CAMERA_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH} characters`
                  }
                })}
                error={errors.password?.message}
                placeholder="Enter password if required"
              />
            </div>

            {/* Connection Test */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Connection Test</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={testingConnection || !watchedConnectionString}
                  icon={testingConnection ? <LoadingSpinner size="sm" /> : <WifiIcon className="w-4 h-4" />}
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>

              {connectionTestResult && (
                <div className={`flex items-center gap-2 text-sm ${
                  connectionTestResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {connectionTestResult.success ? (
                    <CheckCircleIcon className="w-4 h-4" />
                  ) : (
                    <ExclamationTriangleIcon className="w-4 h-4" />
                  )}
                  <span>{connectionTestResult.message}</span>
                  {connectionTestResult.responseTime && (
                    <span className="text-gray-600">
                      ({connectionTestResult.responseTime}ms)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location and Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Location"
            required
            {...register('locationId', { required: CAMERA_CONSTANTS.ERROR_MESSAGES.LOCATION_REQUIRED })}
            error={errors.locationId?.message}
            options={locationOptions}
            loading={activeLocationsLoading}
          />

          <Select
            label="Priority"
            {...register('priority', { valueAsNumber: true })}
            error={errors.priority?.message}
            options={CAMERA_CONSTANTS.PRIORITY_OPTIONS.map(priority => ({
              value: priority.value.toString(),
              label: priority.label
            }))}
          />
        </div>

        {/* Hardware Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Hardware Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Manufacturer"
              {...register('manufacturer')}
              placeholder="e.g., Hikvision, Dahua"
            />

            <Input
              label="Model"
              {...register('model')}
              placeholder="e.g., DS-2CD2021G1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Firmware Version"
              {...register('firmwareVersion')}
              placeholder="e.g., V5.5.0"
            />

            <Input
              label="Serial Number"
              {...register('serialNumber')}
              placeholder="Enter serial number"
            />
          </div>
        </div>

        {/* Status Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Switch
              {...register('isActive')}
              label="Active"
              description="Camera is active and can be used"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              {...register('enableFacialRecognition')}
              label="Facial Recognition"
              description="Enable facial recognition processing"
            />
          </div>
        </div>

        {/* Advanced Configuration */}
        <Accordion
          title="Advanced Configuration"
          open={showAdvancedConfig}
          onToggle={() => setShowAdvancedConfig(!showAdvancedConfig)}
        >
          <div className="space-y-6 pt-4">
            {/* Video Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Video Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="Resolution Width"
                  {...register('resolutionWidth', {
                    valueAsNumber: true,
                    min: { value: 320, message: 'Minimum width is 320' },
                    max: { value: 7680, message: 'Maximum width is 7680' }
                  })}
                  error={errors.resolutionWidth?.message}
                  placeholder="1920"
                />

                <Input
                  type="number"
                  label="Resolution Height"
                  {...register('resolutionHeight', {
                    valueAsNumber: true,
                    min: { value: 240, message: 'Minimum height is 240' },
                    max: { value: 4320, message: 'Maximum height is 4320' }
                  })}
                  error={errors.resolutionHeight?.message}
                  placeholder="1080"
                />

                <Select
                  label="Frame Rate"
                  {...register('frameRate', { valueAsNumber: true })}
                  options={CAMERA_CONSTANTS.FRAME_RATE_OPTIONS.map(option => ({
                    value: option.value.toString(),
                    label: option.label
                  }))}
                />
              </div>

              <Select
                label="Quality"
                {...register('quality', { valueAsNumber: true })}
                options={CAMERA_CONSTANTS.QUALITY_OPTIONS.map(option => ({
                  value: option.value.toString(),
                  label: option.label
                }))}
              />
            </div>

            {/* Connection Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Connection Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="Max Connections"
                  {...register('maxConnections', {
                    valueAsNumber: true,
                    min: { value: CAMERA_CONSTANTS.VALIDATION.MIN_CONNECTIONS, message: `Minimum ${CAMERA_CONSTANTS.VALIDATION.MIN_CONNECTIONS} connection` },
                    max: { value: CAMERA_CONSTANTS.VALIDATION.MAX_CONNECTIONS, message: `Maximum ${CAMERA_CONSTANTS.VALIDATION.MAX_CONNECTIONS} connections` }
                  })}
                  error={errors.maxConnections?.message}
                />

                <Input
                  type="number"
                  label="Timeout (seconds)"
                  {...register('connectionTimeoutSeconds', {
                    valueAsNumber: true,
                    min: { value: CAMERA_CONSTANTS.VALIDATION.MIN_TIMEOUT, message: `Minimum ${CAMERA_CONSTANTS.VALIDATION.MIN_TIMEOUT} seconds` },
                    max: { value: CAMERA_CONSTANTS.VALIDATION.MAX_TIMEOUT, message: `Maximum ${CAMERA_CONSTANTS.VALIDATION.MAX_TIMEOUT} seconds` }
                  })}
                  error={errors.connectionTimeoutSeconds?.message}
                />

                <Input
                  type="number"
                  label="Retry Interval (seconds)"
                  {...register('retryIntervalSeconds', {
                    valueAsNumber: true,
                    min: { value: CAMERA_CONSTANTS.VALIDATION.MIN_RETRY_INTERVAL, message: `Minimum ${CAMERA_CONSTANTS.VALIDATION.MIN_RETRY_INTERVAL} seconds` },
                    max: { value: CAMERA_CONSTANTS.VALIDATION.MAX_RETRY_INTERVAL, message: `Maximum ${CAMERA_CONSTANTS.VALIDATION.MAX_RETRY_INTERVAL} seconds` }
                  })}
                  error={errors.retryIntervalSeconds?.message}
                />
              </div>

              <Input
                type="number"
                label="Max Retry Attempts"
                {...register('maxRetryAttempts', {
                  valueAsNumber: true,
                  min: { value: CAMERA_CONSTANTS.VALIDATION.MIN_RETRY_ATTEMPTS, message: `Minimum ${CAMERA_CONSTANTS.VALIDATION.MIN_RETRY_ATTEMPTS} attempt` },
                  max: { value: CAMERA_CONSTANTS.VALIDATION.MAX_RETRY_ATTEMPTS, message: `Maximum ${CAMERA_CONSTANTS.VALIDATION.MAX_RETRY_ATTEMPTS} attempts` }
                })}
                error={errors.maxRetryAttempts?.message}
                className="md:w-1/3"
              />

              <div className="flex items-center gap-2">
                <Switch
                  {...register('autoStart')}
                  label="Auto Start"
                  description="Automatically start stream when camera becomes active"
                />
              </div>
            </div>

            {/* Motion Detection */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Motion Detection</h4>
              
              <div className="flex items-center gap-2 mb-4">
                <Switch
                  {...register('enableMotionDetection')}
                  label="Enable Motion Detection"
                  description="Detect motion in camera feed"
                />
              </div>

              <Input
                type="range"
                label={`Motion Sensitivity: ${watch('motionSensitivity')}%`}
                min="1"
                max="100"
                {...register('motionSensitivity', { valueAsNumber: true })}
                className="md:w-1/2"
              />
            </div>

            {/* Recording */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recording Settings</h4>
              
              <div className="flex items-center gap-2 mb-4">
                <Switch
                  {...register('enableRecording')}
                  label="Enable Recording"
                  description="Record video from this camera"
                />
              </div>

              <Input
                type="number"
                label="Recording Duration (minutes, 0 = continuous)"
                {...register('recordingDurationMinutes', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Duration cannot be negative' }
                })}
                error={errors.recordingDurationMinutes?.message}
                className="md:w-1/2"
              />
            </div>

            {/* Facial Recognition */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Facial Recognition</h4>
              
              <Input
                type="range"
                label={`Recognition Threshold: ${watch('facialRecognitionThreshold')}%`}
                min="50"
                max="95"
                {...register('facialRecognitionThreshold', { valueAsNumber: true })}
                className="md:w-1/2"
              />
            </div>

            {/* Metadata */}
            <Textarea
              label="Metadata (JSON)"
              {...register('metadata')}
              placeholder='{"location_details": "Main entrance", "notes": "Special configuration"}'
              rows={3}
            />
          </div>
        </Accordion>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading || !isValid}
            loading={isLoading}
            icon={!isLoading && <CameraIcon className="w-4 h-4" />}
          >
            {isEditMode ? 'Update Camera' : 'Create Camera'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CameraForm;