import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Components
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';
import Tabs from '../../common/Tabs/Tabs';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import Alert from '../../common/Alert/Alert';
import Tooltip from '../../common/Tooltip/Tooltip';
import ConfirmDialog from '../../common/ConfirmDialog/ConfirmDialog';
import CameraForm from '../CameraForm/CameraForm';

// Redux actions
import {
  fetchCameraById,
  clearCurrentCamera,
  deleteCamera,
  testCameraConnection,
  performHealthCheck,
  startCameraStream,
  stopCameraStream,
  getStreamInfo,
  captureFrame
} from '../../../store/slices/camerasSlice';

// Constants and utilities
import { CAMERA_CONSTANTS } from '../../../constants/cameraConstants';
import { formatDateTime, formatTimeAgo } from '../../../utils/dateUtils';
import { hasPermission } from '../../../utils/authUtils';

// Icons
import {
  CameraIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  WifiIcon,
  SignalIcon,
  PlayIcon,
  StopIcon,
  PhotoIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  XMarkIcon as XMarkIconSolid
} from '@heroicons/react/24/solid';

/**
 * CameraDetails - Detailed camera view component
 * Shows comprehensive camera information with management actions
 */
const CameraDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const {
    currentCamera: camera,
    loading,
    error,
    operationLoading,
    streamInfo,
    healthResults,
    connectionTestResults
  } = useSelector(state => state.cameras);

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [operationResult, setOperationResult] = useState(null);

  // Fetch camera details on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchCameraById({ 
        id: parseInt(id),
        includeSensitiveData: hasPermission('Camera.ViewSensitiveData')
      }));
    }

    return () => {
      dispatch(clearCurrentCamera());
    };
  }, [dispatch, id]);

  // Get current stream info and health status
  const currentStreamInfo = streamInfo[parseInt(id)] || {};
  const currentHealthResult = healthResults[parseInt(id)] || {};
  const currentConnectionTest = connectionTestResults[parseInt(id)] || {};

  // Handle operations
  const handleTestConnection = async () => {
    const result = await dispatch(testCameraConnection({ id: parseInt(id) }));
    setOperationResult({
      type: result.type.endsWith('fulfilled') ? 'success' : 'error',
      message: result.type.endsWith('fulfilled') 
        ? 'Connection test completed successfully'
        : result.payload || 'Connection test failed'
    });
  };

  const handleHealthCheck = async () => {
    const result = await dispatch(performHealthCheck(parseInt(id)));
    setOperationResult({
      type: result.type.endsWith('fulfilled') ? 'success' : 'error',
      message: result.type.endsWith('fulfilled')
        ? 'Health check completed successfully'
        : result.payload || 'Health check failed'
    });
  };

  const handleStartStream = async () => {
    const result = await dispatch(startCameraStream(parseInt(id)));
    setOperationResult({
      type: result.type.endsWith('fulfilled') ? 'success' : 'error',
      message: result.type.endsWith('fulfilled')
        ? 'Camera stream started successfully'
        : result.payload || 'Failed to start stream'
    });
    
    // Refresh stream info
    dispatch(getStreamInfo(parseInt(id)));
  };

  const handleStopStream = async () => {
    const result = await dispatch(stopCameraStream({ id: parseInt(id) }));
    setOperationResult({
      type: result.type.endsWith('fulfilled') ? 'success' : 'error',
      message: result.type.endsWith('fulfilled')
        ? 'Camera stream stopped successfully'
        : result.payload || 'Failed to stop stream'
    });
    
    // Refresh stream info
    dispatch(getStreamInfo(parseInt(id)));
  };

  const handleCaptureFrame = async () => {
    const result = await dispatch(captureFrame(parseInt(id)));
    setOperationResult({
      type: result.type.endsWith('fulfilled') ? 'success' : 'error',
      message: result.type.endsWith('fulfilled')
        ? 'Frame captured successfully'
        : result.payload || 'Failed to capture frame'
    });
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteCamera({ id: parseInt(id) }));
    if (result.type.endsWith('fulfilled')) {
      navigate('/cameras');
    } else {
      setOperationResult({
        type: 'error',
        message: result.payload || 'Failed to delete camera'
      });
    }
    setShowDeleteModal(false);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    // Refresh camera data
    dispatch(fetchCameraById({ 
      id: parseInt(id),
      includeSensitiveData: hasPermission('Camera.ViewSensitiveData')
    }));
  };

  // Get status styling
  const getStatusBadge = (status, isOperational) => {
    const statusConfig = CAMERA_CONSTANTS.STATUS_OPTIONS.find(s => s.value === status);
    const color = statusConfig?.color || 'gray';
    
    return (
      <Badge
        variant={color}
        size="lg"
        className="flex items-center gap-2"
      >
        {isOperational ? (
          <CheckCircleIconSolid className="w-4 h-4" />
        ) : (
          <XMarkIconSolid className="w-4 h-4" />
        )}
        {statusConfig?.label || status}
      </Badge>
    );
  };

  // Get health status
  const getHealthStatus = (camera) => {
    if (!camera?.minutesSinceLastHealthCheck) {
      return { label: 'Unknown', color: 'gray', icon: XMarkIcon };
    }

    const minutes = camera.minutesSinceLastHealthCheck;
    
    if (minutes <= 2) return { label: 'Excellent', color: 'green', icon: CheckCircleIcon };
    if (minutes <= 5) return { label: 'Healthy', color: 'green', icon: CheckCircleIcon };
    if (minutes <= 15) return { label: 'Good', color: 'yellow', icon: ExclamationTriangleIcon };
    if (minutes <= 30) return { label: 'Stale', color: 'orange', icon: ExclamationTriangleIcon };
    
    return { label: 'Outdated', color: 'red', icon: XMarkIcon };
  };

  // Render priority indicator
  const renderPriority = (priority) => {
    const priorityColor = priority <= 2 ? 'red' : 
                         priority <= 4 ? 'orange' : 
                         priority <= 6 ? 'yellow' : 'gray';
    
    return (
      <div className={`flex items-center gap-2`}>
        <div className={`w-3 h-3 rounded-full bg-${priorityColor}-400`} />
        <span className="text-sm text-gray-600">Priority {priority}/10</span>
      </div>
    );
  };

  // Render tabs content
  const renderTabContent = () => {
    if (!camera) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900 font-medium">{camera.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <Badge variant="outline">{camera.cameraTypeDisplay}</Badge>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div>{getStatusBadge(camera.status, camera.isOperational)}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <div>{renderPriority(camera.priority)}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{camera.locationName || 'Not assigned'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Facial Recognition</label>
                    <Badge variant={camera.enableFacialRecognition ? 'green' : 'gray'}>
                      {camera.enableFacialRecognition ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Health Status</label>
                    {(() => {
                      const health = getHealthStatus(camera);
                      return (
                        <div className="flex items-center gap-2">
                          <health.icon className={`w-4 h-4 text-${health.color}-500`} />
                          <span className={`text-${health.color}-600 font-medium`}>{health.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Active</label>
                    <Badge variant={camera.isActive ? 'green' : 'gray'}>
                      {camera.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {camera.description && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900 mt-1">{camera.description}</p>
                </div>
              )}
            </Card>

            {/* Hardware Information */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hardware Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {camera.manufacturer && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Manufacturer</label>
                      <p className="text-gray-900">{camera.manufacturer}</p>
                    </div>
                  )}
                  
                  {camera.model && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Model</label>
                      <p className="text-gray-900">{camera.model}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {camera.firmwareVersion && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Firmware Version</label>
                      <p className="text-gray-900">{camera.firmwareVersion}</p>
                    </div>
                  )}
                  
                  {camera.serialNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Serial Number</label>
                      <p className="text-gray-900 font-mono text-sm">{camera.serialNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Failure Count</label>
                  <p className={`text-2xl font-bold ${camera.failureCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {camera.failureCount}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Health Check</label>
                  <p className="text-gray-900">
                    {camera.lastHealthCheck ? formatTimeAgo(camera.lastHealthCheck) : 'Never'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Online</label>
                  <p className="text-gray-900">
                    {camera.lastOnlineTime ? formatTimeAgo(camera.lastOnlineTime) : 'Unknown'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'connection':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Connection String</label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">
                    {camera.connectionString || 'Not configured'}
                  </p>
                </div>
                
                {camera.username && hasPermission('Camera.ViewSensitiveData') && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Username</label>
                    <p className="text-gray-900">{camera.username}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Connection Test</label>
                  {currentConnectionTest.testedAt ? (
                    <div className="flex items-center gap-2">
                      {currentConnectionTest.success ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <XMarkIcon className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-gray-900">
                        {formatTimeAgo(currentConnectionTest.testedAt)}
                      </span>
                      {currentConnectionTest.success && (
                        <span className="text-green-600">✓ Successful</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No tests performed</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Stream Information */}
            {currentStreamInfo.isStreaming && (
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Stream Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge variant="green">Streaming</Badge>
                  </div>
                  
                  {currentStreamInfo.startedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Started At</label>
                      <p className="text-gray-900">{formatDateTime(currentStreamInfo.startedAt)}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        );

      case 'configuration':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Video Configuration</h3>
              
              {camera.configuration && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Resolution</label>
                      <p className="text-gray-900">
                        {camera.configuration.resolutionWidth} × {camera.configuration.resolutionHeight}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Frame Rate</label>
                      <p className="text-gray-900">{camera.configuration.frameRate} FPS</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Quality</label>
                      <p className="text-gray-900">{camera.configuration.quality}%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Max Connections</label>
                      <p className="text-gray-900">{camera.configuration.maxConnections}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Connection Timeout</label>
                      <p className="text-gray-900">{camera.configuration.connectionTimeoutSeconds}s</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Auto Start</label>
                      <Badge variant={camera.configuration.autoStart ? 'green' : 'gray'}>
                        {camera.configuration.autoStart ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Feature Configuration */}
            {camera.configuration && (
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Motion Detection</label>
                      <Badge variant={camera.configuration.enableMotionDetection ? 'green' : 'gray'}>
                        {camera.configuration.enableMotionDetection ? 'Enabled' : 'Disabled'}
                      </Badge>
                      {camera.configuration.enableMotionDetection && (
                        <p className="text-sm text-gray-600 mt-1">
                          Sensitivity: {camera.configuration.motionSensitivity}%
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Recording</label>
                      <Badge variant={camera.configuration.enableRecording ? 'green' : 'gray'}>
                        {camera.configuration.enableRecording ? 'Enabled' : 'Disabled'}
                      </Badge>
                      {camera.configuration.enableRecording && (
                        <p className="text-sm text-gray-600 mt-1">
                          Duration: {camera.configuration.recordingDurationMinutes === 0 
                            ? 'Continuous' 
                            : `${camera.configuration.recordingDurationMinutes} minutes`
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Facial Recognition</label>
                      <Badge variant={camera.enableFacialRecognition ? 'green' : 'gray'}>
                        {camera.enableFacialRecognition ? 'Enabled' : 'Disabled'}
                      </Badge>
                      {camera.enableFacialRecognition && camera.configuration.facialRecognitionThreshold && (
                        <p className="text-sm text-gray-600 mt-1">
                          Threshold: {camera.configuration.facialRecognitionThreshold}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{formatDateTime(camera.createdOn)}</span>
                    {camera.createdByName && (
                      <>
                        <span className="text-gray-400">by</span>
                        <span className="text-gray-900">{camera.createdByName}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {camera.modifiedOn && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Modified</label>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{formatDateTime(camera.modifiedOn)}</span>
                      {camera.modifiedByName && (
                        <>
                          <span className="text-gray-400">by</span>
                          <span className="text-gray-900">{camera.modifiedByName}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Health Check History */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Health Check History</h3>
              
              {currentHealthResult.checkedAt ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {currentHealthResult.isHealthy ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      )}
                      
                      <div>
                        <p className="font-medium text-gray-900">
                          {currentHealthResult.isHealthy ? 'Healthy' : 'Unhealthy'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(currentHealthResult.checkedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Response: {currentHealthResult.responseTimeMs}ms
                      </p>
                      {currentHealthResult.healthScore && (
                        <p className="text-sm text-gray-600">
                          Score: {currentHealthResult.healthScore}/100
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {currentHealthResult.errorMessage && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                      {currentHealthResult.errorMessage}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No health check history available</p>
              )}
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-8">
          <LoadingSpinner size="lg" />
          <p className="text-center text-gray-600 mt-4">Loading camera details...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-8">
          <div className="text-center">
            <XMarkIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Camera</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate('/cameras')}
                icon={<ArrowLeftIcon className="w-5 h-5" />}
              >
                Back to Cameras
              </Button>
              <Button
                onClick={() => dispatch(fetchCameraById({ id: parseInt(id) }))}
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!camera) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-8">
          <div className="text-center">
            <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Camera Not Found</p>
            <p className="text-gray-600 mb-4">The requested camera does not exist or has been deleted.</p>
            <Button
              onClick={() => navigate('/cameras')}
              icon={<ArrowLeftIcon className="w-5 h-5" />}
            >
              Back to Cameras
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Define tab options
  const tabOptions = [
    { id: 'overview', label: 'Overview', icon: <InformationCircleIcon className="w-4 h-4" /> },
    { id: 'connection', label: 'Connection', icon: <WifiIcon className="w-4 h-4" /> },
    { id: 'configuration', label: 'Configuration', icon: <Cog6ToothIcon className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <CalendarIcon className="w-4 h-4" /> }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Operation Result Alert */}
      {operationResult && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <Alert
            type={operationResult.type}
            message={operationResult.message}
            onClose={() => setOperationResult(null)}
          />
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/cameras')}
            icon={<ArrowLeftIcon className="w-5 h-5" />}
          >
            Back to Cameras
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <CameraIcon className="w-8 h-8 text-blue-600" />
              {camera.displayName || camera.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {getStatusBadge(camera.status, camera.isOperational)}
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{camera.cameraTypeDisplay}</span>
              {camera.locationName && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{camera.locationName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {hasPermission('Camera.TestConnection') && (
            <Tooltip content="Test Connection">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={operationLoading}
                icon={<WifiIcon className="w-4 h-4" />}
              >
                Test
              </Button>
            </Tooltip>
          )}
          
          {hasPermission('Camera.HealthCheck') && (
            <Tooltip content="Health Check">
              <Button
                variant="outline"
                onClick={handleHealthCheck}
                disabled={operationLoading}
                icon={<SignalIcon className="w-4 h-4" />}
              >
                Health Check
              </Button>
            </Tooltip>
          )}
          
          {camera.isAvailableForStreaming && hasPermission('Camera.ManageStreaming') && (
            <>
              {currentStreamInfo.isStreaming ? (
                <Tooltip content="Stop Stream">
                  <Button
                    variant="outline"
                    onClick={handleStopStream}
                    disabled={operationLoading}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    icon={<StopIcon className="w-4 h-4" />}
                  >
                    Stop Stream
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip content="Start Stream">
                  <Button
                    variant="outline"
                    onClick={handleStartStream}
                    disabled={operationLoading}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    icon={<PlayIcon className="w-4 h-4" />}
                  >
                    Start Stream
                  </Button>
                </Tooltip>
              )}
            </>
          )}
          
          {hasPermission('Camera.CaptureFrame') && (
            <Tooltip content="Capture Frame">
              <Button
                variant="outline"
                onClick={handleCaptureFrame}
                disabled={operationLoading}
                icon={<PhotoIcon className="w-4 h-4" />}
              >
                Capture
              </Button>
            </Tooltip>
          )}
          
          {hasPermission('Camera.Update') && (
            <Button
              variant="outline"
              onClick={handleEdit}
              icon={<PencilIcon className="w-4 h-4" />}
            >
              Edit
            </Button>
          )}
          
          {hasPermission('Camera.Delete') && (
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
              icon={<TrashIcon className="w-4 h-4" />}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {renderTabContent()}
      </motion.div>

      {/* Modals */}
      {showEditModal && (
        <CameraForm
          camera={camera}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDeleteModal && (
        <ConfirmDialog
          isOpen={showDeleteModal}
          title="Delete Camera"
          message={`Are you sure you want to delete "${camera.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmClassName="bg-red-600 hover:bg-red-700"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default CameraDetails;