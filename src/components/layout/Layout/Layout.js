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
 * FIXED Main Layout Component with proper sidebar handling
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

    handleResize();
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
    document.title = `${currentTitle} - Visitor Management System`;
  }, [location.pathname, title, dispatch]);

  // Page loading overlay
  if (globalLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading application...</p>
        </div>
      </div>
    );
  }

  const containerClasses = classNames(
    'min-h-screen flex bg-gray-50 dark:bg-gray-900',
    {
      'dark': theme === 'dark'
    },
    className
  );

  return (
    <div className={containerClasses}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area with proper spacing */}
      <div className={classNames(
        'flex-1 flex flex-col min-h-screen transition-all duration-300',
        {
          // Desktop sidebar spacing
          'lg:ml-72': sidebarOpen && !sidebarCollapsed && !isMobile,
          'lg:ml-16': sidebarOpen && sidebarCollapsed && !isMobile,
          'ml-0': !sidebarOpen || isMobile
        }
      )}>
        {/* Header */}
        <Header />
        
        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          {pageLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
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
              <div className="h-full overflow-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

export default Layout;