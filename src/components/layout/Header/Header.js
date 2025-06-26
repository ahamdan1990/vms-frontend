import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../../hooks/useAuth';
import { toggleSidebar, toggleTheme } from '../../../store/slices/uiSlice';
import Button from '../../common/Button/Button';
import { formatName } from '../../../utils/formatters';

const Header = () => {
  const dispatch = useDispatch();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, sidebarOpen } = useSelector(state => state.ui);
  const { unreadCount } = useSelector(state => state.notifications);

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(toggleSidebar())}
          className="mr-4 lg:hidden"
        >
          <span className="sr-only">Toggle sidebar</span>
          ☰
        </Button>
        
        <h1 className="text-xl font-semibold text-gray-900">
          Visitor Management System
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="sm">
            <span className="sr-only">View notifications</span>
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(toggleTheme())}
        >
          <span className="sr-only">Toggle theme</span>
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>

        {/* User menu */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex sm:flex-col sm:text-right">
            <span className="text-sm font-medium text-gray-900">
              {formatName(user?.firstName, user?.lastName)}
            </span>
            <span className="text-xs text-gray-500">
              {user?.role}
            </span>
          </div>
          
          <div className="relative">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {formatName(user?.firstName, user?.lastName, 'initials')}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">Logout</span>
            ↗
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;