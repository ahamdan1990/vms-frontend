// src/components/common/ConnectionStatus.js
import React from 'react';
import { useSignalR } from '../../hooks/useSignalR';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * Connection Status Indicator Component
 * Shows real-time SignalR connection health with visual indicators
 */
const ConnectionStatus = ({ showDetails = false, className = '' }) => {
  const { areConnectionsHealthy, getConnectionHealth } = useSignalR();
  
  const isHealthy = areConnectionsHealthy();
  const health = getConnectionHealth();

  // Determine status and styling
  const getStatusInfo = () => {
    if (health.totalConnections === 0) {
      return {
        status: 'Not Connected',
        icon: XCircleIcon,
        color: 'text-gray-400',
        bgColor: 'bg-gray-100',
        description: 'No real-time connections'
      };
    }
    
    if (isHealthy) {
      return {
        status: 'Connected',
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: `All ${health.totalConnections} connections healthy`
      };
    }
    
    if (health.healthyConnections > 0) {
      return {
        status: 'Partial',
        icon: ExclamationTriangleIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        description: `${health.healthyConnections}/${health.totalConnections} connections healthy`
      };
    }
    
    return {
      status: 'Reconnecting',
      icon: ArrowPathIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Attempting to reconnect...'
    };
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  if (!showDetails) {
    // Simple indicator version
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <Icon 
          className={`h-4 w-4 ${statusInfo.color} ${statusInfo.status === 'Reconnecting' ? 'animate-spin' : ''}`} 
        />
        <span className={`text-xs ${statusInfo.color}`}>
          {statusInfo.status}
        </span>
      </div>
    );
  }

  // Detailed version with connection breakdown
  return (
    <div className={`${className}`}>
      <div className={`flex items-center space-x-2 px-2 py-1 rounded-md ${statusInfo.bgColor}`}>
        <Icon 
          className={`h-4 w-4 ${statusInfo.color} ${statusInfo.status === 'Reconnecting' ? 'animate-spin' : ''}`} 
        />
        <div className="flex flex-col">
          <span className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.status}
          </span>
          <span className="text-xs text-gray-600">
            {statusInfo.description}
          </span>
        </div>
      </div>
      
      {showDetails && health.disconnectedHubs.length > 0 && (
        <div className="mt-2 text-xs">
          <span className="text-red-600 font-medium">Issues:</span>
          <ul className="mt-1 space-y-1">
            {health.disconnectedHubs.map((hub, index) => (
              <li key={index} className="text-red-600">
                • {hub.hubName}: {hub.state} (attempts: {hub.reconnectAttempts})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
