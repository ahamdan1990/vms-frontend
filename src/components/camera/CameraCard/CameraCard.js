import React from 'react';
import { motion } from 'framer-motion';

// Components
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';
import Tooltip from '../../common/Tooltip/Tooltip';

// Constants and utilities
import { CAMERA_CONSTANTS } from '../../../constants/cameraConstants';
import { formatDateTime, formatTimeAgo } from '../../../utils/dateUtils';
import { hasPermission } from '../../../utils/authUtils';

// Icons
import {
  EyeIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlayIcon,
  StopIcon,
  CogIcon,
  TrashIcon,
  PencilIcon,
  SignalIcon,
  MapPinIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  XMarkIcon as XMarkIconSolid
} from '@heroicons/react/24/solid';

/**
 * CameraCard - Individual camera display component
 * Supports both list and grid view modes with comprehensive camera information
 */
const CameraCard = ({
  camera,
  viewMode = 'list',
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onTestConnection,
  onHealthCheck,
  onStartStream,
  onStopStream,
  className = ''
}) => {
  // Get status styling
  const getStatusBadge = (status, isOperational) => {
    const statusConfig = CAMERA_CONSTANTS.STATUS_OPTIONS.find(s => s.value === status);
    const color = statusConfig?.color || 'gray';
    
    return (
      <Badge
        variant={color}
        size="sm"
        className="flex items-center gap-1"
      >
        {isOperational ? (
          <CheckCircleIconSolid className="w-3 h-3" />
        ) : (
          <XMarkIconSolid className="w-3 h-3" />
        )}
        {statusConfig?.label || status}
      </Badge>
    );
  };

  // Get health status styling
  const getHealthStatus = (camera) => {
    if (!camera.minutesSinceLastHealthCheck) {
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
  const renderPriority = () => {
    const priorityColor = camera.priority <= 2 ? 'red' : 
                         camera.priority <= 4 ? 'orange' : 
                         camera.priority <= 6 ? 'yellow' : 'gray';
    
    return (
      <Tooltip content={`Priority: ${camera.priority}/10`}>
        <div className={`w-2 h-8 rounded-full bg-${priorityColor}-400`} />
      </Tooltip>
    );
  };

  // Render camera actions
  const renderActions = () => (
    <div className="flex items-center gap-1">
      {hasPermission('Camera.TestConnection') && (
        <Tooltip content="Test Connection">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTestConnection?.(camera.id)}
            icon={<WifiIcon className="w-4 h-4" />}
          />
        </Tooltip>
      )}
      
      {hasPermission('Camera.HealthCheck') && (
        <Tooltip content="Health Check">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onHealthCheck?.(camera.id)}
            icon={<SignalIcon className="w-4 h-4" />}
          />
        </Tooltip>
      )}
      
      {camera.isAvailableForStreaming && hasPermission('Camera.ManageStreaming') && (
        <Tooltip content="Start Stream">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStartStream?.(camera.id)}
            icon={<PlayIcon className="w-4 h-4" />}
          />
        </Tooltip>
      )}
      
      {hasPermission('Camera.Update') && (
        <Tooltip content="Edit Camera">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(camera)}
            icon={<PencilIcon className="w-4 h-4" />}
          />
        </Tooltip>
      )}
      
      {hasPermission('Camera.Delete') && (
        <Tooltip content="Delete Camera">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(camera)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            icon={<TrashIcon className="w-4 h-4" />}
          />
        </Tooltip>
      )}
    </div>
  );

  // List view render
  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={className}
      >
        <Card className={`p-4 ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Selection Checkbox */}
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect?.(camera.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              
              {/* Priority Indicator */}
              {renderPriority()}
              
              {/* Camera Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex items-center gap-2">
                    <CameraIcon className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{camera.name}</h3>
                  </div>
                  
                  <Badge variant="outline" size="sm">
                    {camera.cameraTypeDisplay}
                  </Badge>
                  
                  {getStatusBadge(camera.status, camera.isOperational)}
                  
                  {camera.enableFacialRecognition && (
                    <Badge variant="blue" size="sm">
                      Facial Recognition
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {camera.locationName && (
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {camera.locationName}
                    </div>
                  )}
                  
                  {camera.manufacturer && (
                    <span>{camera.manufacturer}</span>
                  )}
                  
                  {camera.model && (
                    <span>{camera.model}</span>
                  )}
                </div>
                
                {camera.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                    {camera.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Health Status and Last Check */}
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                {camera.lastHealthCheck && (
                  <div className="text-gray-600">
                    Last check: {formatTimeAgo(camera.lastHealthCheck)}
                  </div>
                )}
                
                {camera.failureCount > 0 && (
                  <div className="text-red-600">
                    {camera.failureCount} failures
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {(() => {
                  const health = getHealthStatus(camera);
                  return (
                    <Tooltip content={`Health: ${health.label}`}>
                      <health.icon className={`w-5 h-5 text-${health.color}-500`} />
                    </Tooltip>
                  );
                })()}
              </div>
              
              {renderActions()}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid view render
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={className}
    >
      <Card className={`p-6 h-full ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect?.(camera.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {camera.name}
                </h3>
                <Badge variant="outline" size="sm" className="mt-1">
                  {camera.cameraTypeDisplay}
                </Badge>
              </div>
            </div>
            
            {renderPriority()}
          </div>

          {/* Status and Health */}
          <div className="flex items-center gap-2 mb-4">
            {getStatusBadge(camera.status, camera.isOperational)}
            
            {(() => {
              const health = getHealthStatus(camera);
              return (
                <Badge variant={health.color} size="sm" className="flex items-center gap-1">
                  <health.icon className="w-3 h-3" />
                  {health.label}
                </Badge>
              );
            })()}
          </div>

          {/* Description */}
          {camera.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {camera.description}
            </p>
          )}

          {/* Details */}
          <div className="flex-1 space-y-2 text-sm text-gray-600">
            {camera.locationName && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                <span className="line-clamp-1">{camera.locationName}</span>
              </div>
            )}
            
            {camera.manufacturer && (
              <div>Manufacturer: {camera.manufacturer}</div>
            )}
            
            {camera.model && (
              <div>Model: {camera.model}</div>
            )}
            
            {camera.enableFacialRecognition && (
              <Badge variant="blue" size="sm">
                Facial Recognition Enabled
              </Badge>
            )}
            
            {camera.lastHealthCheck && (
              <div>
                Last check: {formatTimeAgo(camera.lastHealthCheck)}
              </div>
            )}
            
            {camera.failureCount > 0 && (
              <div className="text-red-600">
                {camera.failureCount} failures
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            {renderActions()}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CameraCard;