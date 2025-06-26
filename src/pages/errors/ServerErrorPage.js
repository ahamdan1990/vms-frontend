import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NavigationHelper } from '../../routes/AppRoutes';
import Button from '../../components/common/Button/Button';

const ServerErrorPage = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-12 w-12 bg-red-500 rounded-lg flex items-center justify-center mb-6">
          <span className="text-white text-xl">⚠️</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Server Error
        </h1>
        
        <p className="text-gray-600 mb-8">
          Something went wrong on our end. 
          We're working to fix the issue. Please try again later.
        </p>

        <div className="space-y-4">
          <Button 
            variant="primary" 
            fullWidth
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
          
          {isAuthenticated ? (
            <Link 
              to={NavigationHelper.getDashboardRoute(userRole)}
              className="block"
            >
              <Button variant="outline" fullWidth>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="block">
              <Button variant="outline" fullWidth>
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
