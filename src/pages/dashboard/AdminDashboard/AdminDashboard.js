import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { formatName } from '../../../utils/formatters';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome, {formatName(user?.firstName, user?.lastName)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Total Users
          </h3>
          <div className="text-3xl font-bold text-primary-600">0</div>
          <p className="text-sm text-gray-500">Active accounts</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            System Health
          </h3>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-green-700">Operational</span>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Today's Visits
          </h3>
          <div className="text-3xl font-bold text-success-600">0</div>
          <p className="text-sm text-gray-500">Across all locations</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Security Alerts
          </h3>
          <div className="text-3xl font-bold text-warning-600">0</div>
          <p className="text-sm text-gray-500">Require attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn btn-primary btn-sm">
              👥 Manage Users
            </button>
            <button className="btn btn-outline btn-sm">
              📊 View Reports
            </button>
            <button className="btn btn-outline btn-sm">
              ⚙️ System Config
            </button>
            <button className="btn btn-outline btn-sm">
              📋 Audit Logs
            </button>
            <button className="btn btn-outline btn-sm">
              🔄 Backup System
            </button>
            <button className="btn btn-outline btn-sm">
              📁 Bulk Import
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">FR System</span>
              <span className="text-sm font-medium text-gray-500">Not configured</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Email Service</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;