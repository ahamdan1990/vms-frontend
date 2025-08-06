// src/routes/AppRoutes.js
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Guards
import AuthGuard from '../guards/AuthGuard';
import GuestGuard from '../guards/GuestGuard';
import PermissionGuard from '../guards/PermissionGuard';
import RoleGuard from '../guards/RoleGuard';

// Layout components
import Layout from '../components/layout/Layout/Layout';

// Navigation helper
import { NavigationHelper } from '../utils/navigationHelper';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Lazy load components for code splitting
const LoginPage = lazy(() => import('../pages/auth/LoginPage/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage/ResetPasswordPage'));

// Dashboard pages
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage/DashboardPage'));
const StaffDashboard = lazy(() => import('../pages/dashboard/StaffDashboard/StaffDashboard'));
const OperatorDashboard = lazy(() => import('../pages/dashboard/OperatorDashboard/OperatorDashboard'));
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard/AdminDashboard'));

// User management pages
const UsersListPage = lazy(() => import('../pages/users/UsersListPage/UsersListPage'));
const UserDetailPage = lazy(() => import('../pages/users/UserDetailPage/UserDetailPage'));

// Profile pages
const ProfilePage = lazy(() => import('../pages/users/ProfilePage/ProfilePage'));

// System pages
const ConfigurationPage = lazy(() => import('../pages/system/ConfigurationPage/ConfigurationPage'));
const AuditPage = lazy(() => import('../pages/system/AuditPage/AuditPage'));

// Error pages
const AccessDeniedPage = lazy(() => import('../pages/errors/AccessDeniedPage'));
const NotFoundPage = lazy(() => import('../pages/errors/NotFoundPage'));
const ServerErrorPage = lazy(() => import('../pages/errors/ServerErrorPage'));

/**
 * Role-based dashboard routing component
 */
const DashboardRouter = () => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  switch (userRole) {
    case 'Staff':
      return <StaffDashboard />;
    case 'Operator':
      return <OperatorDashboard />;
    case 'Administrator':
      return <AdminDashboard />;
    default:
      return <DashboardPage />;
  }
};

/**
 * Main application routes component
 */
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Routes>
      {/* Public Routes - wrapped with GuestGuard */}
      <Route path="/login" element={
        <GuestGuard>
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        </GuestGuard>
      } />
      
      <Route path="/forgot-password" element={
        <GuestGuard>
          <Suspense fallback={<LoadingFallback />}>
            <ForgotPasswordPage />
          </Suspense>
        </GuestGuard>
      } />
      
      <Route path="/reset-password" element={
        <GuestGuard>
          <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordPage />
          </Suspense>
        </GuestGuard>
      } />

      {/* Protected Routes - wrapped with AuthGuard and Layout */}
      <Route path="/dashboard" element={
        <AuthGuard>
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <DashboardRouter />
            </Suspense>
          </Layout>
        </AuthGuard>
      } />

      <Route path="/staff/dashboard" element={
        <AuthGuard>
          <RoleGuard role="Staff" allowHigher={false}>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <StaffDashboard />
              </Suspense>
            </Layout>
          </RoleGuard>
        </AuthGuard>
      } />

      <Route path="/operator/dashboard" element={
        <AuthGuard>
          <RoleGuard role="Operator" allowHigher={false}>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <OperatorDashboard />
              </Suspense>
            </Layout>
          </RoleGuard>
        </AuthGuard>
      } />

      <Route path="/admin/dashboard" element={
        <AuthGuard>
          <RoleGuard role="Administrator" allowHigher={false}>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            </Layout>
          </RoleGuard>
        </AuthGuard>
      } />

      {/* User Management Routes */}
      <Route path="/users" element={
        <AuthGuard>
          <PermissionGuard permission="User.Read">
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <UsersListPage />
              </Suspense>
            </Layout>
          </PermissionGuard>
        </AuthGuard>
      } />

      <Route path="/users/new" element={
        <AuthGuard>
          <PermissionGuard permission="User.Create">
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <UserDetailPage />
              </Suspense>
            </Layout>
          </PermissionGuard>
        </AuthGuard>
      } />

      <Route path="/users/:id" element={
        <AuthGuard>
          <PermissionGuard permission="User.Read">
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <UserDetailPage />
              </Suspense>
            </Layout>
          </PermissionGuard>
        </AuthGuard>
      } />

      <Route path="/users/:id/edit" element={
        <AuthGuard>
          <PermissionGuard permission="User.Update">
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <UserDetailPage />
              </Suspense>
            </Layout>
          </PermissionGuard>
        </AuthGuard>
      } />

      {/* Profile Routes */}
      <Route path="/profile" element={
        <AuthGuard>
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          </Layout>
        </AuthGuard>
      } />

      {/* System Administration Routes */}
      <Route path="/system/config" element={
        <AuthGuard>
          <PermissionGuard permission="Configuration.Read">
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <ConfigurationPage />
              </Suspense>
            </Layout>
          </PermissionGuard>
        </AuthGuard>
      } />

      <Route path="/system/audit" element={
        <AuthGuard>
          <PermissionGuard permission="Audit.Read.All">
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <AuditPage />
              </Suspense>
            </Layout>
          </PermissionGuard>
        </AuthGuard>
      } />

      {/* Error Pages (always accessible) */}
      <Route path="/access-denied" element={
        <Suspense fallback={<LoadingFallback />}>
          <AccessDeniedPage />
        </Suspense>
      } />
      
      <Route path="/not-found" element={
        <Suspense fallback={<LoadingFallback />}>
          <NotFoundPage />
        </Suspense>
      } />
      
      <Route path="/server-error" element={
        <Suspense fallback={<LoadingFallback />}>
          <ServerErrorPage />
        </Suspense>
      } />

      {/* Root redirect */}
      <Route path="/" element={
        isAuthenticated 
          ? <Navigate to="/dashboard" replace />
          : <Navigate to="/login" replace />
      } />

      {/* Catch all - redirect based on auth status */}
      <Route path="*" element={
        isAuthenticated 
          ? <Navigate to="/dashboard" replace />
          : <Navigate to="/login" replace />
      } />
    </Routes>
  );
};

// Export NavigationHelper for backwards compatibility
export { NavigationHelper };

export default AppRoutes;