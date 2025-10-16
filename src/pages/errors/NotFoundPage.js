// src/pages/errors/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NavigationHelper } from '../../utils/navigationHelper';

const NotFoundPage = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-12 w-12 bg-gray-500 rounded-lg flex items-center justify-center mb-6">
          <span className="text-white text-xl">❓</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist. 
          It may have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="space-y-4">
          {isAuthenticated ? (
            <Link 
              to={NavigationHelper.getDashboardRoute(userRole)}
              className="inline-block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              to="/login"
              className="inline-block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          )}
          
          <button 
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;