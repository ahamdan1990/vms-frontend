// src/components/layout/Layout/Layout.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  console.log('📐 Layout component rendering...');

  const dispatch = useDispatch();
  const location = useLocation();
  const { t } = useTranslation(['common', 'navigation']);
  
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
      '/dashboard': t('navigation:pageTitles.dashboard'),
      '/staff/dashboard': t('navigation:pageTitles.staffDashboard'),
      '/operator/dashboard': t('navigation:pageTitles.operatorDashboard'),
      '/admin/dashboard': t('navigation:pageTitles.adminDashboard'),
      '/users': t('navigation:pageTitles.users'),
      '/invitations': t('navigation:pageTitles.invitations'),
      '/visitors': t('navigation:pageTitles.visitors'),
      '/checkin': t('navigation:pageTitles.checkin'),
      '/reports': t('navigation:pageTitles.reports'),
      '/system': t('navigation:pageTitles.system'),
      '/profile': t('navigation:pageTitles.profile')
    };

    const currentTitle = title || routeTitles[location.pathname] || 'VMS';
    dispatch(setPageTitle(currentTitle));
    document.title = `${currentTitle} - Visitor Management System`;
  }, [location.pathname, title, dispatch, t]);

  // Page loading overlay
  if (globalLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('loading.app')}</p>
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
          // Desktop sidebar spacing — using logical ms-* (margin-inline-start) for RTL support
          'lg:ms-72': sidebarOpen && !sidebarCollapsed && !isMobile,
          'lg:ms-16': sidebarOpen && sidebarCollapsed && !isMobile,
          'ms-0': !sidebarOpen || isMobile
        }
      )}>
        {/* Header */}
        <Header />
        
        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-0">
          {pageLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">{t('loading.page')}</p>
              </div>
            </div>
          ) : (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
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