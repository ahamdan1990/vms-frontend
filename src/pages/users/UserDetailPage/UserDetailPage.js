import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserById, createUser, updateUser } from '../../../store/slices/usersSlice';
import UserForm from '../../../components/forms/UserForm/UserForm';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Button from '../../../components/common/Button/Button';
import { USER_ROUTES } from '../../../routes/routeConstants';
import { formatName, formatDate } from '../../../utils/formatters';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    currentUser,
    loading,
    error,
    createLoading,
    updateLoading
  } = useSelector(state => state.users);

  const isEdit = Boolean(id);
  const [mode, setMode] = useState('view'); // 'view', 'edit', 'create'

  useEffect(() => {
    if (isEdit) {
      if (id !== 'new') {
        dispatch(getUserById(id));
        setMode('view');
      } else {
        setMode('create');
      }
    } else {
      setMode('create');
    }
  }, [dispatch, id, isEdit]);

  const handleSubmit = async (userData) => {
    try {
      if (mode === 'create') {
        await dispatch(createUser(userData)).unwrap();
        navigate(USER_ROUTES.LIST);
      } else {
        await dispatch(updateUser({ id, userData })).unwrap();
        setMode('view');
      }
    } catch (error) {
      // Error handling is done in the slice
      console.error('Failed to save user:', error);
    }
  };

  const handleCancel = () => {
    if (mode === 'create') {
      navigate(USER_ROUTES.LIST);
    } else {
      setMode('view');
    }
  };

  if (loading && !currentUser) {
    return <LoadingSpinner text="Loading user..." overlay />;
  }

  if (error && mode !== 'create') {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error loading user</div>
        <Button onClick={() => navigate(USER_ROUTES.LIST)}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create User' : 
             mode === 'edit' ? 'Edit User' : 'User Details'}
          </h1>
          {currentUser && mode === 'view' && (
            <p className="text-gray-600">
              {formatName(currentUser.firstName, currentUser.lastName)}
            </p>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(USER_ROUTES.LIST)}
          >
            Back to Users
          </Button>
          
          {mode === 'view' && (
            <Button
              variant="primary"
              onClick={() => setMode('edit')}
            >
              Edit User
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          {mode === 'view' && currentUser ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatName(currentUser.firstName, currentUser.lastName)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentUser.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <span className={`mt-1 inline-block badge badge-role-${currentUser.role.toLowerCase()}`}>
                    {currentUser.role}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span className={`mt-1 inline-block badge ${currentUser.isActive ? 'badge-success' : 'badge-gray'}`}>
                    {currentUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentUser.department || '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentUser.jobTitle || '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Employee ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentUser.employeeId || '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentUser.phoneNumber || '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Created On
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(currentUser.createdOn, 'MMMM dd, yyyy')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Login
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentUser.lastLoginDate ? 
                      formatDate(currentUser.lastLoginDate, 'MMMM dd, yyyy h:mm a') : 
                      'Never'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <UserForm
              user={mode === 'edit' ? currentUser : null}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={createLoading || updateLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
