// src/pages/dashboard/DashboardPage/DashboardPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/slices/uiSlice';
import { motion } from 'framer-motion';

// Import role-specific dashboards
import StaffDashboard from '../StaffDashboard/StaffDashboard';
import OperatorDashboard from '../OperatorDashboard/OperatorDashboard';
import AdminDashboard from '../AdminDashboard/AdminDashboard';

/**
 * Main Dashboard Page that routes to role-specific dashboards
 * Acts as a smart router based on user role
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    dispatch(setPageTitle('Dashboard'));
  }, [dispatch]);

  // Show loading while checking authentication
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Route to appropriate dashboard based on role
  const renderDashboard = () => {
    switch (userRole) {
      case 'Staff':
        return <StaffDashboard />;
      case 'Operator':
        return <OperatorDashboard />;
      case 'Administrator':
        return <AdminDashboard />;
      default:
        // Fallback for unknown roles - redirect to appropriate dashboard
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
        
        return (
          <div className="flex items-center justify-center min-h-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center"
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Role Not Recognized</h3>
              <p className="text-gray-600 mb-4">
                Your account role is not recognized. Please contact your system administrator.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-full"
    >
      {renderDashboard()}
    </motion.div>
  );
};

export default DashboardPage;