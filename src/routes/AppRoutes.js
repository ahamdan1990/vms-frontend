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

// Route constants
import {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  USER_ROUTES,
  PROFILE_ROUTES,
  SYSTEM_ROUTES
} from './routeConstants';

// Loading component
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner" />
    <p>Loading...</p>
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
 * Protected routes wrapper with layout
 */
const ProtectedRoutes = () => {
  return (
    <AuthGuard fallback={<LoadingFallback />}>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/staff/dashboard" element={
              <RoleGuard role="Staff" allowHigher={false}>
                <StaffDashboard />
              </RoleGuard>
            } />
            <Route path="/operator/dashboard" element={
              <RoleGuard role="Operator" allowHigher={false}>
                <OperatorDashboard />
              </RoleGuard>
            } />
            <Route path="/admin/dashboard" element={
              <RoleGuard role="Administrator" allowHigher={false}>
                <AdminDashboard />
              </RoleGuard>
            } />

            {/* User Management Routes */}
            <Route path="/users" element={
              <PermissionGuard permission="User.Read">
                <UsersListPage />
              </PermissionGuard>
            } />
            <Route path="/users/new" element={
              <PermissionGuard permission="User.Create">
                <UserDetailPage />
              </PermissionGuard>
            } />
            <Route path="/users/:id" element={
              <PermissionGuard permission="User.Read">
                <UserDetailPage />
              </PermissionGuard>
            } />
            <Route path="/users/:id/edit" element={
              <PermissionGuard permission="User.Update">
                <UserDetailPage />
              </PermissionGuard>
            } />

            {/* Profile Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfilePage />} />
            <Route path="/profile/security" element={<ProfilePage />} />
            <Route path="/profile/preferences" element={<ProfilePage />} />

            {/* System Administration Routes */}
            <Route path="/system/*" element={
              <RoleGuard role="Administrator">
                <SystemRoutes />
              </RoleGuard>
            } />

            {/* Default redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </AuthGuard>
  );
};

/**
 * System administration sub-routes
 */
const SystemRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <div className="system-overview">
          <h1>System Administration</h1>
          <p>Welcome to the system administration panel.</p>
        </div>
      } />
      <Route path="/config" element={
        <div className="system-config">
          <h1>System Configuration</h1>
          <p>Configure system settings.</p>
        </div>
      } />
      <Route path="/audit" element={
        <PermissionGuard permission="Audit.Read">
          <div className="audit-logs">
            <h1>Audit Logs</h1>
            <p>View system audit logs.</p>
          </div>
        </PermissionGuard>
      } />
      <Route path="*" element={<Navigate to="/system" replace />} />
    </Routes>
  );
};

/**
 * Public routes (no authentication required)
 */
const PublicRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Authentication Routes */}
        <Route path={AUTH_ROUTES.LOGIN} element={
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        } />
        <Route path={AUTH_ROUTES.FORGOT_PASSWORD} element={
          <GuestGuard>
            <ForgotPasswordPage />
          </GuestGuard>
        } />
        <Route path={AUTH_ROUTES.RESET_PASSWORD} element={
          <GuestGuard>
            <ResetPasswordPage />
          </GuestGuard>
        } />

        {/* Error Pages */}
        <Route path={PUBLIC_ROUTES.ACCESS_DENIED} element={<AccessDeniedPage />} />
        <Route path={PUBLIC_ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route path={PUBLIC_ROUTES.SERVER_ERROR} element={<ServerErrorPage />} />

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to={AUTH_ROUTES.LOGIN} replace />} />
      </Routes>
    </Suspense>
  );
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
      {/* Protected Routes */}
      {isAuthenticated && <Route path="/*" element={<ProtectedRoutes />} />}
      
      {/* Public Routes */}
      {!isAuthenticated && <Route path="/*" element={<PublicRoutes />} />}
      
      {/* Error Routes (always available) */}
      <Route path={PUBLIC_ROUTES.ACCESS_DENIED} element={
        <Suspense fallback={<LoadingFallback />}>
          <AccessDeniedPage />
        </Suspense>
      } />
      <Route path={PUBLIC_ROUTES.NOT_FOUND} element={
        <Suspense fallback={<LoadingFallback />}>
          <NotFoundPage />
        </Suspense>
      } />
      <Route path={PUBLIC_ROUTES.SERVER_ERROR} element={
        <Suspense fallback={<LoadingFallback />}>
          <ServerErrorPage />
        </Suspense>
      } />
      
      {/* Catch all routes */}
      <Route path="*" element={
        isAuthenticated 
          ? <Navigate to="/dashboard" replace />
          : <Navigate to={AUTH_ROUTES.LOGIN} replace />
      } />
    </Routes>
  );
};

/**
 * Route configuration for dynamic route generation
 */
export const ROUTE_CONFIG = {
  public: [
    {
      path: AUTH_ROUTES.LOGIN,
      component: LoginPage,
      exact: true,
      guard: 'guest'
    },
    {
      path: AUTH_ROUTES.FORGOT_PASSWORD,
      component: ForgotPasswordPage,
      exact: true,
      guard: 'guest'
    },
    {
      path: AUTH_ROUTES.RESET_PASSWORD,
      component: ResetPasswordPage,
      exact: true,
      guard: 'guest'
    }
  ],
  
  protected: [
    {
      path: DASHBOARD_ROUTES.DEFAULT,
      component: DashboardRouter,
      exact: true,
      guard: 'auth'
    },
    {
      path: USER_ROUTES.LIST,
      component: UsersListPage,
      guard: 'permission',
      permission: 'User.Read'
    },
    {
      path: USER_ROUTES.CREATE,
      component: UserDetailPage,
      guard: 'permission',
      permission: 'User.Create'
    },
    {
      path: PROFILE_ROUTES.VIEW,
      component: ProfilePage,
      guard: 'auth'
    }
  ]
};

/**
 * Navigation helper for programmatic routing
 */
export const NavigationHelper = {
  // Get the appropriate dashboard route for a user role
  getDashboardRoute: (userRole) => {
    switch (userRole) {
      case 'Staff':
        return DASHBOARD_ROUTES.STAFF;
      case 'Operator':
        return DASHBOARD_ROUTES.OPERATOR;
      case 'Administrator':
        return DASHBOARD_ROUTES.ADMIN;
      default:
        return DASHBOARD_ROUTES.DEFAULT;
    }
  },

  // Get login redirect path
  getLoginRedirect: (intendedPath) => {
    if (!intendedPath || intendedPath === '/' || intendedPath === AUTH_ROUTES.LOGIN) {
      return AUTH_ROUTES.LOGIN;
    }
    return `${AUTH_ROUTES.LOGIN}?from=${encodeURIComponent(intendedPath)}`;
  },

  // Get post-login redirect path
  getPostLoginRedirect: (searchParams, userRole) => {
    const from = searchParams.get('from');
    
    if (from && from.startsWith('/') && !from.startsWith('//')) {
      try {
        return decodeURIComponent(from);
      } catch (error) {
        console.warn('Invalid redirect URL:', from);
      }
    }
    
    return NavigationHelper.getDashboardRoute(userRole);
  },

  // Check if route requires specific role
  requiresRole: (path, role) => {
    const config = ROUTE_CONFIG.protected.find(route => 
      path.startsWith(route.path.replace('/*', ''))
    );
    
    return config?.roles?.includes(role) || false;
  },

  // Check if route requires specific permission
  requiresPermission: (path, permission) => {
    const config = ROUTE_CONFIG.protected.find(route => 
      path.startsWith(route.path.replace('/*', ''))
    );
    
    return config?.permission === permission;
  }
};

/**
 * Error boundary for route errors
 */
export class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="route-error">
          <h2>Something went wrong</h2>
          <p>There was an error loading this page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Route preloader for better UX
 */
export const RoutePreloader = ({ children }) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouteErrorBoundary>
        {children}
      </RouteErrorBoundary>
    </Suspense>
  );
};

export default AppRoutes;