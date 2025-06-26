import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { formatName } from '../../../utils/formatters';

const StaffDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600">
          Welcome, {formatName(user?.firstName, user?.lastName)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            My Invitations
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No recent invitations</p>
            <button className="btn btn-primary btn-sm mt-4">
              Create Invitation
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Visits
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No upcoming visits</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="btn btn-outline btn-sm w-full text-left">
              📝 Create Invitation
            </button>
            <button className="btn btn-outline btn-sm w-full text-left">
              📅 View Calendar
            </button>
            <button className="btn btn-outline btn-sm w-full text-left">
              📊 View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;