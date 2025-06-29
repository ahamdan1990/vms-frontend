// src/components/layout/Footer/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';

/**
 * Professional Footer Component with role-based links
 */
const Footer = () => {
  const { isAuthenticated, userRole } = useAuth();
  const { canManageSystem, canViewReports } = usePermissions();

  const currentYear = new Date().getFullYear();

  if (!isAuthenticated) {
    return (
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">
                © {currentYear} Visitor Management System. All rights reserved.
              </span>
            </div>
            <div className="mt-2 md:mt-0">
              <p className="text-xs text-gray-500">
                Secure • Reliable • Professional
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const quickLinks = [
    {
      name: 'Help Center',
      href: '/help',
      show: true
    },
    {
      name: 'System Status',
      href: '/system/status', 
      show: canManageSystem
    },
    {
      name: 'Reports',
      href: '/reports',
      show: canViewReports
    },
    {
      name: 'Privacy Policy',
      href: '/privacy',
      show: true
    }
  ].filter(link => link.show);

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand and Description */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">VMS</span>
            </div>
            <p className="text-sm text-gray-600">
              Streamlined visitor management with advanced security features and real-time monitoring.
            </p>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>Role:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                {userRole}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* System Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              System Info
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Version:</span>
                <span className="font-medium">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Updated:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-500">
              © {currentYear} Visitor Management System. All rights reserved.
            </p>
            <div className="mt-2 md:mt-0 flex items-center space-x-4 text-sm text-gray-500">
              <span>Built with ❤️ for security</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Secure Connection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;