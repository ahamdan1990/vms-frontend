// src/components/layout/Layout/Layout.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import { setScreenSize, setPageTitle } from '../../../store/slices/uiSlice';
import { getBreakpointFromWidth } from '../../../constants/uiConstants';
import classNames from 'classnames';

/**
 * Main Layout Component that provides the application shell
 * Handles responsive behavior and layout state management
 */
const Layout = ({ children, title, showFooter = true, className = '' }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    theme, 
    isMobile, 
    pageLoading,
    globalLoading 
  } = useSelector(state => state.ui);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const screenSize = getBreakpointFromWidth(width);
      dispatch(setScreenSize(screenSize));
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  // Update page title based on route
  useEffect(() => {
    const routeTitles = {
      '/dashboard': 'Dashboard',
      '/staff/dashboard': 'Staff Dashboard',
      '/operator/dashboard': 'Operator Dashboard', 
      '/admin/dashboard': 'Admin Dashboard',
      '/users': 'User Management',
      '/invitations': 'Invitations',
      '/visitors': 'Visitors',
      '/checkin': 'Check-in',
      '/reports': 'Reports',
      '/system': 'System',
      '/profile': 'Profile'
    };

    const currentTitle = title || routeTitles[location.pathname] || 'VMS';
    dispatch(setPageTitle(currentTitle));
    
    // Update document title
    document.title = `${currentTitle} - Visitor Management System`;
  }, [location.pathname, title, dispatch]);

  // Calculate main content padding based on sidebar state
  const getMainContentClasses = () => {
    return classNames(
      'flex-1 flex flex-col min-h-0 transition-all duration-300',
      {
        'lg:ml-64': sidebarOpen && !sidebarCollapsed && !isMobile,
        'lg:ml-16': sidebarOpen && sidebarCollapsed && !isMobile,
        'ml-0': !sidebarOpen || isMobile
      }
    );
  };

  const containerClasses = classNames(
    'min-h-screen bg-gray-50 flex',
    {
      'dark': theme === 'dark'
    },
    className
  );

  // Page loading overlay
  if (globalLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className={getMainContentClasses()}>
        {/* Header */}
        <Header />
        
        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          {pageLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading page...</p>
              </div>
            </div>
          ) : (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <div className="h-full overflow-auto">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  {children}
                </div>
              </div>
            </motion.div>
          )}
        </main>
        
        {/* Footer */}
        {showFooter && <Footer />}
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  showFooter: PropTypes.bool,
  className: PropTypes.string
};

/**
 * Simple Layout without sidebar for auth pages
 */
export const AuthLayout = ({ children, className = '' }) => {
  const { theme } = useSelector(state => state.ui);

  const containerClasses = classNames(
    'min-h-screen bg-gray-50 flex flex-col',
    {
      'dark': theme === 'dark'
    },
    className
  );

  return (
    <div className={containerClasses}>
      {/* Simple header for auth pages */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Visitor Management System</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Simple footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 Visitor Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

/**
 * Full-width layout for special pages
 */
export const FullWidthLayout = ({ children, showHeader = true, showFooter = true, className = '' }) => {
  const { theme } = useSelector(state => state.ui);

  const containerClasses = classNames(
    'min-h-screen bg-gray-50 flex flex-col',
    {
      'dark': theme === 'dark'
    },
    className
  );

  return (
    <div className={containerClasses}>
      {showHeader && <Header />}
      
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

FullWidthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showHeader: PropTypes.bool,
  showFooter: PropTypes.bool,
  className: PropTypes.string
};

/**
 * Centered layout for error pages and simple content
 */
export const CenteredLayout = ({ children, maxWidth = 'md', className = '' }) => {
  const { theme } = useSelector(state => state.ui);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  const containerClasses = classNames(
    'min-h-screen bg-gray-50 flex items-center justify-center',
    {
      'dark': theme === 'dark'
    },
    className
  );

  return (
    <div className={containerClasses}>
      <div className={classNames('w-full', maxWidthClasses[maxWidth], 'px-4')}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

CenteredLayout.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl']),
  className: PropTypes.string
};

export default Layout;