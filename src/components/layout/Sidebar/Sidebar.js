// src/components/layout/Sidebar/Sidebar.js
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { setSidebarOpen } from '../../../store/slices/uiSlice';
import classNames from 'classnames';
import { NavItem } from 'reactstrap';  
/**
 * Professional Sidebar Component with role-based navigation
 * Responsive design with collapsible functionality
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
    // Dashboard - Always visible for authenticated users
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

    // Invitations - Staff and above
    {
      name: 'Invitations',
      href: '/invitations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      show: invitationPermissions.canRead || invitationPermissions.canCreate,
      badge: null
    },

    // Visitors - Operator and above
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

    // Check-in - Operator and above
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

    // Users - Admin only
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

    // Reports - Based on permissions
    {
      name: 'Reports',
      href: '/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      show: reportPermissions.canView || reportPermissions.canGenerate
    },

    // System - Admin only
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

  const sidebarClasses = classNames(
    'bg-white border-r border-gray-200 flex flex-col h-full',
    {
      'w-64': !sidebarCollapsed,
      'w-16': sidebarCollapsed && !isMobile
    }
  );

  const NavItem = ({ item, isCollapsed = false }) => {
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
    
    const linkClasses = classNames(
      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
      {
        'text-blue-700 bg-blue-50 border-r-2 border-blue-700': isActive,
        'text-gray-700 hover:text-blue-700 hover:bg-blue-50': !isActive,
        'justify-center': isCollapsed,
        'space-x-3': !isCollapsed
      }
    );

    return (
      <NavLink to={item.href} className={linkClasses}>
        <span className="flex-shrink-0">{item.icon}</span>
        {!isCollapsed && (
          <>
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  // Mobile backdrop
  if (isMobile && sidebarOpen) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
        <motion.aside
          variants={sidebarVariants}
          animate="open"
          initial="closed"
          className="fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-gray-200"
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
      <aside className={sidebarClasses}>
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

const SidebarContent = ({ navItems, bottomItems, isCollapsed }) => {
  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Role indicator */}
        {!isCollapsed && (
          <div className="mb-4 px-3 py-2 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Navigation
            </p>
          </div>
        )}

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
                      'flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200',
                      {
                        'text-blue-700 bg-blue-50': isActive,
                        'text-gray-600 hover:text-blue-700 hover:bg-blue-50': !isActive
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
      </nav>

      {/* Bottom navigation */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        {bottomItems.map((item) => (
          <NavItem key={item.name} item={item} isCollapsed={isCollapsed} />
        ))}
        
        {/* Version info */}
        {!isCollapsed && (
          <div className="pt-4">
            <p className="text-xs text-gray-400 text-center">
              VMS v1.0.0
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;