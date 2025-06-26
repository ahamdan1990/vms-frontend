import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { usePermissions } from '../../../hooks/usePermissions';
import { setSidebarOpen } from '../../../store/slices/uiSlice';
import { DASHBOARD_ROUTES, USER_ROUTES, PROFILE_ROUTES } from '../../../routes/routeConstants';

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { sidebarOpen, isMobile } = useSelector(state => state.ui);
  const { navigationAccess, userRole } = usePermissions();

  const closeSidebar = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  const sidebarClasses = classNames(
    'sidebar',
    {
      'sidebar-collapsed': !sidebarOpen
    }
  );

  const menuItems = [
    {
      name: 'Dashboard',
      href: DASHBOARD_ROUTES.DEFAULT,
      icon: '🏠',
      show: navigationAccess.showDashboard
    },
    {
      name: 'Users',
      href: USER_ROUTES.LIST,
      icon: '👥',
      show: navigationAccess.showUsers
    },
    {
      name: 'Profile',
      href: PROFILE_ROUTES.VIEW,
      icon: '👤',
      show: true
    }
  ].filter(item => item.show);

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">
                V
              </div>
              {sidebarOpen && (
                <span className="ml-3 text-lg font-semibold text-gray-900">
                  VMS
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  classNames(
                    'sidebar-item',
                    {
                      'sidebar-item-active': isActive
                    }
                  )
                }
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && (
                  <span className="ml-3">{item.name}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User info */}
          {sidebarOpen && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Role: {userRole}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
