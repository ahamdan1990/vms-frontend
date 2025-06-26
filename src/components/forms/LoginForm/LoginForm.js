import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { validateLoginData } from '../../../utils/validators';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import { useDispatch } from 'react-redux';
import { showErrorToast } from '../../../store/slices/notificationSlice';

const LoginForm = ({ onSuccess }) => {
  const { login, loading, error } = useAuth();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user starts typing
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
    const validation = validateLoginData(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      const result = await login(formData);
      
      if (result.payload?.loginResponse?.isSuccess) {
        onSuccess?.();
      } else {
        dispatch(showErrorToast('Login Failed', result.payload?.loginResponse?.errorMessage || 'Invalid credentials'));
      }
    } catch (error) {
      dispatch(showErrorToast('Login Error', 'An unexpected error occurred'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="email"
        name="email"
        label="Email Address"
        value={formData.email}
        onChange={handleChange}
        error={validationErrors.email}
        required
        placeholder="Enter your email"
        icon="✉"
        disabled={loading}
      />

      <Input
        type="password"
        name="password"
        label="Password"
        value={formData.password}
        onChange={handleChange}
        error={validationErrors.password}
        required
        placeholder="Enter your password"
        icon="🔒"
        disabled={loading}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="form-checkbox"
            disabled={loading}
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
            Remember me
          </label>
        </div>

        <a
          href="/forgot-password"
          className="text-sm text-primary-600 hover:text-primary-500"
        >
          Forgot password?
        </a>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};

export default LoginForm;