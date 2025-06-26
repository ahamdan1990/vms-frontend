import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { formatName } from '../../../utils/formatters';

const DashboardPage = () => {
  const { user, userRole } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {formatName(user?.firstName, user?.lastName)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your Role
          </h3>
          <p className="text-gray-600">{userRole}</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="btn btn-sm btn-outline w-full text-left">
              View Profile
            </button>
            <button className="btn btn-sm btn-outline w-full text-left">
              Change Password
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            System Status
          </h3>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
