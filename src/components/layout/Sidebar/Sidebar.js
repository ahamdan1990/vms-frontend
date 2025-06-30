// src/components/layout/Sidebar/Sidebar.js
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { setSidebarOpen } from '../../../store/slices/uiSlice';
import classNames from 'classnames';

/**
 * FIXED NavItem Component - moved to top level
 */
const NavItem = ({ item, isCollapsed = false }) => {
  const location = useLocation();
  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
  
  const linkClasses = classNames(
    'flex items-center text-sm font-medium rounded-xl transition-all duration-200 group relative',
    'mx-3 my-1',
    {
      // Active state
      'bg-primary-100 text-primary-900 shadow-sm dark:bg-primary-900/30 dark:text-primary-100': isActive,
      // Inactive state  
      'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white': !isActive,
      // Collapsed sidebar
      'px-3 py-3 justify-center': isCollapsed,
      // Expanded sidebar
      'px-4 py-3 space-x-3': !isCollapsed
    }
  );

  return (
    <NavLink to={item.href} className={linkClasses}>
      <span className="flex-shrink-0">{item.icon}</span>
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.name}</span>
          {item.badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
              {item.badge}
            </span>
          )}
        </>
      )}
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {item.name}
        </div>
      )}
    </NavLink>
  );
};

/**
 * FIXED SidebarContent Component
 */
const SidebarContent = ({ navItems, bottomItems, isCollapsed }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className={classNames(
        'flex items-center border-b border-gray-200 dark:border-gray-700',
        {
          'px-6 py-4': !isCollapsed,
          'px-3 py-4 justify-center': isCollapsed
        }
      )}>
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">VMS</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {/* Role indicator */}
        {!isCollapsed && (
          <div className="px-3 mb-4">
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Navigation
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {navItems.map((item) => (
            <div key={item.name}>
              <NavItem item={item} isCollapsed={isCollapsed} />
              
              {/* Sub-navigation items */}
              {item.children && !isCollapsed && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.filter(child => child.show).map((child) => (
                    <NavLink
                      key={child.name}
                      to={child.href}
                      className={({ isActive }) => classNames(
                        'flex items-center px-4 py-2 text-xs font-medium rounded-lg transition-colors duration-200 mx-3',
                        {
                          'text-primary-700 bg-primary-50 dark:text-primary-200 dark:bg-primary-900/20': isActive,
                          'text-gray-600 hover:text-primary-700 hover:bg-primary-50 dark:text-gray-400 dark:hover:text-primary-200 dark:hover:bg-primary-900/20': !isActive
                        }
                      )}
                    >
                      {child.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <NavItem key={item.name} item={item} isCollapsed={isCollapsed} />
          ))}
        </div>
        
        {/* Version info */}
        {!isCollapsed && (
          <div className="pt-4 px-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              VMS v1.0.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * FIXED Main Sidebar Component
 */
const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { userRole, isAdmin, isOperator, isStaff } = useAuth();
  const { 
    user: userPermissions,
    invitation: invitationPermissions,
    visitor: visitorPermissions,
    checkin: checkinPermissions,
    report: reportPermissions,
    systemConfig: systemPermissions,
    audit: auditPermissions
  } = usePermissions();
  
  const { sidebarOpen, sidebarCollapsed, isMobile } = useSelector(state => state.ui);

  // Navigation items based on user role and permissions
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
      show: true
    },
    {
      name: 'Visitors',
      href: '/visitors',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      show: visitorPermissions.canRead || isOperator || isAdmin
    },
    {
      name: 'Check-in',
      href: '/checkin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      show: checkinPermissions.canProcess || isOperator || isAdmin
    },
    {
      name: 'Users',
      href: '/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      show: userPermissions.canRead || isAdmin
    },
    {
      name: 'System',
      href: '/system',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      show: systemPermissions.canRead || isAdmin,
      children: [
        {
          name: 'Configuration',
          href: '/system/config',
          show: systemPermissions.canUpdate || isAdmin
        },
        {
          name: 'Audit Logs',
          href: '/system/audit',
          show: auditPermissions.canRead || isAdmin
        },
        {
          name: 'Backup',
          href: '/system/backup',
          show: systemPermissions.canBackup || isAdmin
        }
      ]
    }
  ];

  const bottomNavigationItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      show: true
    },
    {
      name: 'Help',
      href: '/help',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      show: true
    }
  ];

  const visibleNavItems = navigationItems.filter(item => item.show);
  const visibleBottomItems = bottomNavigationItems.filter(item => item.show);

  // Animation variants
  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      x: '-100%',
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Mobile backdrop
  if (isMobile && sidebarOpen) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
        
        <motion.aside
          variants={sidebarVariants}
          animate="open"
          initial="closed"
          exit="closed"
          className="fixed left-0 top-0 z-50 h-full w-72 bg-white dark:bg-gray-800 shadow-strong border-r border-gray-200 dark:border-gray-700 lg:hidden"
        >
          <SidebarContent 
            navItems={visibleNavItems}
            bottomItems={visibleBottomItems}
            isCollapsed={false}
          />
        </motion.aside>
      </>
    );
  }

  // Desktop sidebar
  if (!isMobile && sidebarOpen) {
    return (
      <aside className={classNames(
        'fixed left-0 top-0 z-30 h-full bg-white dark:bg-gray-800 shadow-strong border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out',
        {
          'w-72': !sidebarCollapsed,
          'w-16': sidebarCollapsed
        }
      )}>
        <SidebarContent 
          navItems={visibleNavItems}
          bottomItems={visibleBottomItems}
          isCollapsed={sidebarCollapsed}
        />
      </aside>
    );
  }

  return null;
};

export default Sidebar;