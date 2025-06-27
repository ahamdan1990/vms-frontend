// src/pages/auth/LoginPage/LoginPage.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { NavigationHelper } from '../../../utils/navigationHelper';
import LoginForm from '../../../components/forms/LoginForm/LoginForm';

const LoginPage = () => {
  const { isAuthenticated, userRole } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={NavigationHelper.getDashboardRoute(userRole)} replace />;
  }

  const handleLoginSuccess = () => {
    // Navigation will be handled by the routing system
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">V</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome to the Visitor Management System
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;