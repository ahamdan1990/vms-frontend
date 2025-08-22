/**
 * Application Routing Configuration
 * 
 * This module defines the routing structure of the application, including:
 * - Authentication-protected routes
 * - Role-based access control
 * - Permission-based guards
 * - Lazy-loaded components for optimal performance
 * - Error handling routes
 * 
 * @module routes/AppRoutes
 */
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

// Route Constants
import {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  USER_ROUTES,
  INVITATION_ROUTES,
  VISITOR_ROUTES,
  CHECKIN_ROUTES,
  SYSTEM_ROUTES,
  CAPACITY_ROUTES,
  PROFILE_ROUTES
} from '../constants/routeConstants';

// Permission and Role Constants
import {
  USER_PERMISSIONS,
  INVITATION_PERMISSIONS,
  VISITOR_PERMISSIONS,
  CHECKIN_PERMISSIONS,
  SYSTEM_CONFIG_PERMISSIONS,
  CONFIGURATION_PERMISSIONS,
  AUDIT_PERMISSIONS
} from '../constants/permissions';

import { ROLES } from '../constants/role';

// Navigation helper
import { NavigationHelper } from '../utils/navigationHelper';

/**
 * Loading fallback component displayed during lazy loading
 * @component
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// === LAZY LOADED COMPONENTS ===

// Authentication Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage/ResetPasswordPage'));
const ChangePasswordPage = lazy(() => import('../pages/auth/ChangePasswordPage/ChangePasswordPage'));

// Dashboard Pages
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage/DashboardPage'));
const StaffDashboard = lazy(() => import('../pages/dashboard/StaffDashboard/StaffDashboard'));
const OperatorDashboard = lazy(() => import('../pages/dashboard/OperatorDashboard/OperatorDashboard'));
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard/AdminDashboard'));

// Advanced Dashboard Pages
const ReceptionistDashboard = lazy(() => import('../pages/receptionist/ReceptionistDashboard'));
const VisitorAnalyticsDashboard = lazy(() => import('../components/analytics/VisitorAnalyticsDashboard'));
const ExcelManagementPage = lazy(() => import('../pages/admin/ExcelManagementPage'));
const IntegratedVisitorManagement = lazy(() => import('../pages/IntegratedVisitorManagement'));

// User Management Pages
const UsersListPage = lazy(() => import('../pages/users/UsersListPage/UsersListPage'));
const UserDetailPage = lazy(() => import('../pages/users/UserDetailPage/UserDetailPage'));

// Profile Pages
const ProfilePage = lazy(() => import('../pages/users/ProfilePage/ProfilePage'));

// System Administration Pages
const ConfigurationPage = lazy(() => import('../pages/system/ConfigurationPage/ConfigurationPage'));
const AuditPage = lazy(() => import('../pages/system/AuditPage/AuditPage'));
const SystemManagement = lazy(() => import('../components/system/SystemManagement/SystemManagement'));
const VisitPurposesListPage = lazy(() => import('../pages/visit-purposes/VisitPurposesListPage/VisitPurposesListPage'));
const LocationsListPage = lazy(() => import('../pages/locations/LocationsListPage/LocationsListPage'));

// Time Slots and Capacity Management Pages
const TimeSlotsListPage = lazy(() => import('../pages/time-slots/TimeSlotsListPage/TimeSlotsListPage'));
const CapacityDashboard = lazy(() => import('../pages/capacity/CapacityDashboard/CapacityDashboard'));

// Visitor Management Pages
const VisitorsListPage = lazy(() => import('../pages/visitors/VisitorsListPage/VisitorsListPage'));

// Invitation Management Pages
const InvitationsListPage = lazy(() => import('../pages/invitations/InvitationsListPage/InvitationsListPage'));

// Check-in Management Pages
const CheckInDashboard = lazy(() => import('../pages/checkin/CheckInDashboard/CheckInDashboard'));

// Error Pages
const AccessDeniedPage = lazy(() => import('../pages/errors/AccessDeniedPage'));
const NotFoundPage = lazy(() => import('../pages/errors/NotFoundPage'));
const ServerErrorPage = lazy(() => import('../pages/errors/ServerErrorPage'));

/**
 * Role-based dashboard routing component
 * Dynamically renders the appropriate dashboard based on user role
 * @component
 */
const DashboardRouter = () => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  switch (userRole) {
    case ROLES.STAFF:
      return <StaffDashboard />;
    case ROLES.OPERATOR:
      return <OperatorDashboard />;
    case ROLES.ADMINISTRATOR:
      return <AdminDashboard />;
    default:
      return <DashboardPage />;
  }
};

/**
 * Main application routes component
 * Handles authentication, permissions, and component rendering
 * @component
 */
const AppRoutes = () => {
  const { loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Routes>
      {/* === PUBLIC ROUTES - Guest Only === */}
      <Route 
        path={AUTH_ROUTES.LOGIN} 
        element={
          <GuestGuard>
            <Suspense fallback={<LoadingFallback />}>
              <LoginPage />
            </Suspense>
          </GuestGuard>
        } 
      />
      
      <Route 
        path={AUTH_ROUTES.FORGOT_PASSWORD} 
        element={
          <GuestGuard>
            <Suspense fallback={<LoadingFallback />}>
              <ForgotPasswordPage />
            </Suspense>
          </GuestGuard>
        } 
      />
      
      <Route 
        path={AUTH_ROUTES.RESET_PASSWORD} 
        element={
          <GuestGuard>
            <Suspense fallback={<LoadingFallback />}>
              <ResetPasswordPage />
            </Suspense>
          </GuestGuard>
        } 
      />

      {/* === AUTH REQUIRED ROUTES === */}
      <Route 
        path={AUTH_ROUTES.CHANGE_PASSWORD} 
        element={
          <AuthGuard>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <ChangePasswordPage />
              </Suspense>
            </Layout>
          </AuthGuard>
        } 
      />

      {/* === DASHBOARD ROUTES === */}
      <Route 
        path={DASHBOARD_ROUTES.DEFAULT} 
        element={
          <AuthGuard>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <DashboardRouter />
              </Suspense>
            </Layout>
          </AuthGuard>
        } 
      />

      <Route 
        path={DASHBOARD_ROUTES.STAFF} 
        element={
          <AuthGuard>
            <RoleGuard role={ROLES.STAFF} allowHigher={false}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <StaffDashboard />
                </Suspense>
              </Layout>
            </RoleGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={DASHBOARD_ROUTES.OPERATOR} 
        element={
          <AuthGuard>
            <RoleGuard role={ROLES.OPERATOR} allowHigher={false}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <OperatorDashboard />
                </Suspense>
              </Layout>
            </RoleGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={DASHBOARD_ROUTES.ADMIN} 
        element={
          <AuthGuard>
            <RoleGuard role={ROLES.ADMINISTRATOR} allowHigher={false}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              </Layout>
            </RoleGuard>
          </AuthGuard>
        } 
      />

      {/* === ADVANCED DASHBOARD ROUTES === */}
      <Route 
        path={DASHBOARD_ROUTES.RECEPTIONIST} 
        element={
          <AuthGuard>
            <PermissionGuard permission={CHECKIN_PERMISSIONS.PROCESS}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <ReceptionistDashboard />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={DASHBOARD_ROUTES.ANALYTICS} 
        element={
          <AuthGuard>
            <PermissionGuard permission={VISITOR_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <VisitorAnalyticsDashboard />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={DASHBOARD_ROUTES.EXCEL_MANAGEMENT} 
        element={
          <AuthGuard>
            <RoleGuard role={ROLES.ADMINISTRATOR}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <ExcelManagementPage />
                </Suspense>
              </Layout>
            </RoleGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={DASHBOARD_ROUTES.INTEGRATED} 
        element={
          <AuthGuard>
            <PermissionGuard permission={VISITOR_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <IntegratedVisitorManagement />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      {/* === USER MANAGEMENT ROUTES === */}
      <Route 
        path={USER_ROUTES.LIST} 
        element={
          <AuthGuard>
            <PermissionGuard permission={USER_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <UsersListPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={USER_ROUTES.CREATE} 
        element={
          <AuthGuard>
            <PermissionGuard permission={USER_PERMISSIONS.CREATE}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <UserDetailPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={USER_ROUTES.DETAIL} 
        element={
          <AuthGuard>
            <PermissionGuard permission={USER_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <UserDetailPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={USER_ROUTES.EDIT} 
        element={
          <AuthGuard>
            <PermissionGuard permission={USER_PERMISSIONS.UPDATE}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <UserDetailPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      {/* === PROFILE ROUTES === */}
      <Route 
        path={PROFILE_ROUTES.VIEW} 
        element={
          <AuthGuard>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePage />
              </Suspense>
            </Layout>
          </AuthGuard>
        } 
      />

      {/* === SYSTEM ADMINISTRATION ROUTES === */}
      <Route 
        path={SYSTEM_ROUTES.MANAGEMENT} 
        element={
          <AuthGuard>
            <PermissionGuard permission={CONFIGURATION_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <SystemManagement />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={SYSTEM_ROUTES.CONFIG} 
        element={
          <AuthGuard>
            <PermissionGuard permission={CONFIGURATION_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <ConfigurationPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={SYSTEM_ROUTES.VISIT_PURPOSES} 
        element={
          <AuthGuard>
            <PermissionGuard permission={SYSTEM_CONFIG_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <VisitPurposesListPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={SYSTEM_ROUTES.LOCATIONS} 
        element={
          <AuthGuard>
            <PermissionGuard permission={SYSTEM_CONFIG_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <LocationsListPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={SYSTEM_ROUTES.AUDIT} 
        element={
          <AuthGuard>
            <PermissionGuard permission={AUDIT_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <AuditPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={SYSTEM_ROUTES.TIME_SLOTS} 
        element={
          <AuthGuard>
            <PermissionGuard permission={SYSTEM_CONFIG_PERMISSIONS.MANAGE_CAPACITY}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <TimeSlotsListPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      {/* === CAPACITY MANAGEMENT ROUTES === */}
      <Route 
        path={CAPACITY_ROUTES.DASHBOARD} 
        element={
          <AuthGuard>
            <PermissionGuard permission="Dashboard.ViewBasic">
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <CapacityDashboard />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={CAPACITY_ROUTES.MONITOR} 
        element={
          <AuthGuard>
            <PermissionGuard permission="Dashboard.ViewBasic">
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <CapacityDashboard />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={CAPACITY_ROUTES.STATISTICS} 
        element={
          <AuthGuard>
            <PermissionGuard permission="Report.GenerateOwn">
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <CapacityDashboard />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={CAPACITY_ROUTES.TRENDS} 
        element={
          <AuthGuard>
            <PermissionGuard permission="Report.GenerateOwn">
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <CapacityDashboard />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      {/* === VISITOR MANAGEMENT ROUTES === */}
      <Route 
        path={VISITOR_ROUTES.LIST} 
        element={
          <AuthGuard>
            <PermissionGuard permission={VISITOR_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <VisitorsListPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      {/* === INVITATION MANAGEMENT ROUTES === */}
      <Route 
        path={INVITATION_ROUTES.LIST} 
        element={
          <AuthGuard>
            <PermissionGuard permission={INVITATION_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <InvitationsListPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={INVITATION_ROUTES.CREATE} 
        element={
          <AuthGuard>
            <PermissionGuard permission={INVITATION_PERMISSIONS.CREATE_SINGLE}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <InvitationsListPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={INVITATION_ROUTES.DETAIL} 
        element={
          <AuthGuard>
            <PermissionGuard permission={INVITATION_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <InvitationsListPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={INVITATION_ROUTES.EDIT} 
        element={
          <AuthGuard>
            <PermissionGuard permission={INVITATION_PERMISSIONS.UPDATE}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <InvitationsListPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={INVITATION_ROUTES.APPROVE} 
        element={
          <AuthGuard>
            <PermissionGuard permission={INVITATION_PERMISSIONS.APPROVE}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <InvitationsListPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      {/* === INVITATION MANAGEMENT ROUTES === */}
      <Route 
        path={INVITATION_ROUTES.LIST} 
        element={
          <AuthGuard>
            <PermissionGuard permission={INVITATION_PERMISSIONS.READ}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <InvitationsListPage />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      {/* === CHECK-IN MANAGEMENT ROUTES === */}
      <Route 
        path={CHECKIN_ROUTES.BASE} 
        element={
          <AuthGuard>
            <PermissionGuard permission={CHECKIN_PERMISSIONS.PROCESS}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <CheckInDashboard />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      <Route 
        path={CHECKIN_ROUTES.PROCESS} 
        element={
          <AuthGuard>
            <PermissionGuard permission={CHECKIN_PERMISSIONS.PROCESS}>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <CheckInDashboard />
                </Suspense>
              </Layout>
            </PermissionGuard>
          </AuthGuard>
        } 
      />

      {/* === ERROR PAGES (always accessible) === */}
      <Route 
        path={PUBLIC_ROUTES.ACCESS_DENIED} 
        element={
          <Suspense fallback={<LoadingFallback />}>
            <AccessDeniedPage />
          </Suspense>
        } 
      />
      
      <Route 
        path={PUBLIC_ROUTES.NOT_FOUND} 
        element={
          <Suspense fallback={<LoadingFallback />}>
            <NotFoundPage />
          </Suspense>
        } 
      />
      
      <Route 
        path={PUBLIC_ROUTES.SERVER_ERROR} 
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ServerErrorPage />
          </Suspense>
        } 
      />

      {/* === ROOT REDIRECT === */}
      <Route 
        path="/" 
        element={
          <AuthGuard fallback={<LoadingFallback />}>
            <Navigate to={DASHBOARD_ROUTES.DEFAULT} replace />
          </AuthGuard>
        } 
      />

      {/* === CATCH ALL - 404 === */}
      <Route 
        path="*" 
        element={
          <Navigate to={PUBLIC_ROUTES.NOT_FOUND} replace />
        } 
      />
    </Routes>
  );
};

// Export NavigationHelper for backwards compatibility
export { NavigationHelper };

export default AppRoutes;