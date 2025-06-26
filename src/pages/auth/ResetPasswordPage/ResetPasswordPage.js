import React, { useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { validatePassword, passwordsMatch } from '../../../utils/validators';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import { AUTH_ROUTES } from '../../../routes/routeConstants';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const { resetPassword, loading } = useAuth();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Redirect if no token or email
  if (!token || !email) {
    return <Navigate to={AUTH_ROUTES.LOGIN} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validate password
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      newErrors.newPassword = passwordValidation.errors[0];
    }
    
    // Validate password match
    if (!passwordsMatch(formData.newPassword, formData.confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await resetPassword({
        email: decodeURIComponent(email),
        token: decodeURIComponent(token),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      setSuccess(true);
    } catch (error) {
      setErrors({ general: 'Failed to reset password. Please try again.' });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-success-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">✓</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Password reset successful
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You can now sign in with your new password
            </p>
            <a
              href={AUTH_ROUTES.LOGIN}
              className="mt-4 inline-block text-primary-600 hover:text-primary-500"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">V</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="password"
              name="newPassword"
              label="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              required
              icon="🔑"
              hint="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
              disabled={loading}
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              icon="🔑"
              disabled={loading}
            />

            {errors.general && (
              <div className="alert-error">
                {errors.general}
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
              Reset password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
