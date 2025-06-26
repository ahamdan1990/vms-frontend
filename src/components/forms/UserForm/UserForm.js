import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { validateUserData } from '../../../utils/validators';
import { getAvailableRoles } from '../../../store/slices/usersSlice';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import { showSuccessToast, showErrorToast } from '../../../store/slices/notificationSlice';

const UserForm = ({ user = null, onSubmit, onCancel, loading = false }) => {
  const dispatch = useDispatch();
  const { availableRoles } = useSelector(state => state.users);
  const isEdit = Boolean(user);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'Staff',
    department: '',
    jobTitle: '',
    employeeId: '',
    mustChangePassword: !isEdit,
    sendWelcomeEmail: !isEdit,
    ...user
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    dispatch(getAvailableRoles());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateUserData(formData, isEdit);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(formData);
      dispatch(showSuccessToast(
        'Success',
        `User ${isEdit ? 'updated' : 'created'} successfully`
      ));
    } catch (error) {
      dispatch(showErrorToast(
        'Error',
        `Failed to ${isEdit ? 'update' : 'create'} user`
      ));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          name="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
          error={validationErrors.firstName}
          required
          disabled={loading}
        />

        <Input
          name="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          error={validationErrors.lastName}
          required
          disabled={loading}
        />

        <Input
          type="email"
          name="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange}
          error={validationErrors.email}
          required
          disabled={loading}
        />

        <Input
          type="tel"
          name="phoneNumber"
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={validationErrors.phoneNumber}
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-select"
            required
            disabled={loading}
          >
            {availableRoles.map(role => (
              <option key={role.name} value={role.name}>
                {role.displayName || role.name}
              </option>
            ))}
          </select>
          {validationErrors.role && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.role}</p>
          )}
        </div>

        <Input
          name="department"
          label="Department"
          value={formData.department}
          onChange={handleChange}
          error={validationErrors.department}
          disabled={loading}
        />

        <Input
          name="jobTitle"
          label="Job Title"
          value={formData.jobTitle}
          onChange={handleChange}
          error={validationErrors.jobTitle}
          disabled={loading}
        />

        <Input
          name="employeeId"
          label="Employee ID"
          value={formData.employeeId}
          onChange={handleChange}
          error={validationErrors.employeeId}
          disabled={loading}
        />
      </div>

      {!isEdit && (
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="mustChangePassword"
              name="mustChangePassword"
              type="checkbox"
              checked={formData.mustChangePassword}
              onChange={handleChange}
              className="form-checkbox"
              disabled={loading}
            />
            <label htmlFor="mustChangePassword" className="ml-2 text-sm text-gray-600">
              Require password change on first login
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="sendWelcomeEmail"
              name="sendWelcomeEmail"
              type="checkbox"
              checked={formData.sendWelcomeEmail}
              onChange={handleChange}
              className="form-checkbox"
              disabled={loading}
            />
            <label htmlFor="sendWelcomeEmail" className="ml-2 text-sm text-gray-600">
              Send welcome email to user
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {isEdit ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;