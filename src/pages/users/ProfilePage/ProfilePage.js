import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { formatName, formatDate } from '../../../utils/formatters';
import Button from '../../../components/common/Button/Button';
import Modal from '../../../components/common/Modal/Modal';
import PasswordChangeForm from '../../../components/forms/PasswordChangeForm/PasswordChangeForm';

const ProfilePage = () => {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handlePasswordChangeSuccess = () => {
    setShowPasswordModal(false);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-medium">
              {formatName(user.firstName, user.lastName, 'initials')}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {formatName(user.firstName, user.lastName)}
              </h2>
              <p className="text-gray-600">{user.role}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.firstName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.lastName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.phoneNumber || 'Not provided'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.department || 'Not assigned'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Title
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.jobTitle || 'Not specified'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.employeeId || 'Not assigned'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Login
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.lastLoginDate ? 
                  formatDate(user.lastLoginDate, 'MMMM dd, yyyy h:mm a') : 
                  'First login'
                }
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Security Settings
            </h3>
            
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="medium"
      >
        <PasswordChangeForm
          onSuccess={handlePasswordChangeSuccess}
          onCancel={() => setShowPasswordModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ProfilePage;