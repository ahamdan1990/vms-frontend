import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { validatePasswordChange } from '../../../utils/validators';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import { useDispatch } from 'react-redux';
import { showSuccessToast, showErrorToast } from '../../../store/slices/notificationSlice';

const PasswordChangeForm = ({ onSuccess, onCancel }) => {
  const { changePassword, loading } = useAuth();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    const validation = validatePasswordChange(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      const result = await changePassword(formData);
      
      if (result.payload) {
        dispatch(showSuccessToast('Success', 'Password changed successfully'));
        onSuccess?.();
      } else {
        dispatch(showErrorToast('Error', 'Failed to change password'));
      }
    } catch (error) {
      dispatch(showErrorToast('Error', 'An unexpected error occurred'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="password"
        name="currentPassword"
        label="Current Password"
        value={formData.currentPassword}
        onChange={handleChange}
        error={validationErrors.currentPassword}
        required
        disabled={loading}
        icon="🔒"
      />

      <Input
        type="password"
        name="newPassword"
        label="New Password"
        value={formData.newPassword}
        onChange={handleChange}
        error={validationErrors.newPassword}
        required
        disabled={loading}
        icon="🔑"
        hint="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      />

      <Input
        type="password"
        name="confirmPassword"
        label="Confirm New Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={validationErrors.confirmPassword}
        required
        disabled={loading}
        icon="🔑"
      />

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
          Change Password
        </Button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;