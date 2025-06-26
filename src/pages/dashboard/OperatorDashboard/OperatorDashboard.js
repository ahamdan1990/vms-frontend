import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { formatName } from '../../../utils/formatters';

const OperatorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operator Dashboard</h1>
        <p className="text-gray-600">
          Welcome, {formatName(user?.firstName, user?.lastName)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Today's Visitors
          </h3>
          <div className="text-3xl font-bold text-primary-600">0</div>
          <p className="text-sm text-gray-500">Expected arrivals</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Check-ins
          </h3>
          <div className="text-3xl font-bold text-success-600">0</div>
          <p className="text-sm text-gray-500">Completed today</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Active Alerts
          </h3>
          <div className="text-3xl font-bold text-warning-600">0</div>
          <p className="text-sm text-gray-500">Pending review</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Occupancy
          </h3>
          <div className="text-3xl font-bold text-info-600">0</div>
          <p className="text-sm text-gray-500">Current visitors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn btn-primary btn-sm">
              ✅ Process Check-in
            </button>
            <button className="btn btn-outline btn-sm">
              👤 Register Walk-in
            </button>
            <button className="btn btn-outline btn-sm">
              🎫 Print Badge
            </button>
            <button className="btn btn-outline btn-sm">
              🚨 Emergency Export
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;