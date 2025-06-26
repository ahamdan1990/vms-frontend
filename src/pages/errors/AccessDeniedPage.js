import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NavigationHelper } from '../../routes/AppRoutes';
import Button from '../../components/common/Button/Button';

const AccessDeniedPage = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-12 w-12 bg-red-500 rounded-lg flex items-center justify-center mb-6">
          <span className="text-white text-xl">🚫</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource. 
          Please contact your administrator if you believe this is an error.
        </p>

        <div className="space-y-4">
          {isAuthenticated ? (
            <Link 
              to={NavigationHelper.getDashboardRoute(userRole)}
              className="block"
            >
              <Button variant="primary" fullWidth>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="block">
              <Button variant="primary" fullWidth>
                Sign In
              </Button>
            </Link>
          )}
          
          <Button 
            variant="outline" 
            fullWidth
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;