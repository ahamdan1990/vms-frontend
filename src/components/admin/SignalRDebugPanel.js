// src/components/admin/SignalRDebugPanel.js
import React from 'react';
import { useSignalR } from '../../hooks/useSignalR';
import useRealTimeDashboard  from '../../hooks/useRealTimeDashboard';
import ConnectionStatus from '../common/ConnectionStatus';

/**
 * Debug panel to verify SignalR performance
 * TEMPORARY: Remove after testing
 */
const SignalRDebugPanel = () => {
  const { getConnectionHealth, areConnectionsHealthy } = useSignalR();
  const { connectionHealth, isSignalRConnected } = useRealTimeDashboard({
    enableAutoRefresh: true
  });

  const health = getConnectionHealth();

  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-4">
      <h3 className="font-bold mb-2">SignalR Debug Info</h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Connection Status:</strong>
          <ConnectionStatus showDetails={true} />
        </div>
        
        <div>
          <strong>Health Summary:</strong>
          <p>Healthy: {areConnectionsHealthy() ? '✅' : '❌'}</p>
          <p>Total: {health.totalConnections}</p>
          <p>Connected: {health.connectedHubs.join(', ')}</p>
          {health.disconnectedHubs.length > 0 && (
            <p className="text-red-600">
              Disconnected: {health.disconnectedHubs.map(h => h.hubName).join(', ')}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-600">
        <p>Dashboard Connected: {isSignalRConnected ? '✅' : '❌'}</p>
        <p>Last Health Check: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default SignalRDebugPanel;
