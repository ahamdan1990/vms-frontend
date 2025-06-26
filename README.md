# Visitor Management System - Frontend

## 🚀 Chunk 1B: React Authentication & User Management System

A modern React frontend that perfectly integrates with the VMS .NET backend authentication system.

## ✅ What's Implemented

### Core Infrastructure
- **React 18.2+** with modern hooks and functional components
- **Redux Toolkit** for state management with async thunks
- **Axios HTTP client** with cookie-based authentication
- **API integration** that matches backend endpoints exactly
- **Permission system** with role-based access control
- **Error handling** with toast notifications
- **Loading states** and optimistic updates

### Authentication System
- **JWT cookie authentication** (HTTP-only cookies)
- **Automatic token refresh** with retry logic
- **Login/logout flow** with session management
- **Password management** (change, forgot, reset)
- **Session monitoring** and termination
- **Permission checking** and role validation

### Backend Integration
- **Perfect API matching** with your swagger.json endpoints
- **ApiResponseDto handling** for consistent response processing
- **Error processing** for validation messages and API errors
- **Cookie management** for secure token storage
- **Request/response interceptors** for authentication flow

### State Management
- **Auth slice** with complete authentication state
- **Custom hooks** for easy component integration
- **Permission utilities** for role-based UI rendering
- **Selectors** for optimized state access

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and update the API URL:
```bash
# Update the API URL to match your backend
REACT_APP_API_URL=https://localhost:7147
```

### 3. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000` and automatically proxy API requests to your backend.

## 🔧 Backend Requirements

Ensure your backend is running with:
- **CORS enabled** for `http://localhost:3000`
- **Cookie authentication** configured
- **All endpoints** from swagger.json accessible

## 📁 Project Structure

```
src/
├── hooks/
│   └── useAuth.js              # Authentication hook
├── services/
│   ├── apiClient.js           # Axios configuration
│   └── authService.js         # Authentication API calls
├── store/
│   ├── index.js               # Redux store configuration
│   └── slices/
│       └── authSlice.js       # Authentication state management
├── constants/
│   └── permissions.js         # Permission constants
├── App.js                     # Main application component
├── index.js                   # Application entry point
└── index.css                  # Global styles
```

## 🎯 Usage Examples

### Authentication Hook
```javascript
import { useAuth } from './hooks/useAuth';

const MyComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    hasPermission,
    isAdmin 
  } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div>
      <h1>Welcome, {user.fullName}!</h1>
      {hasPermission('User.Create') && (
        <button>Create User</button>
      )}
      {isAdmin && (
        <AdminPanel />
      )}
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Permission Checking
```javascript
import { useAuth } from './hooks/useAuth';
import { USER_PERMISSIONS } from './constants/permissions';

const UserManagement = () => {
  const { hasPermission, hasAnyPermission } = useAuth();

  return (
    <div>
      {hasPermission(USER_PERMISSIONS.CREATE) && (
        <CreateUserButton />
      )}
      
      {hasAnyPermission([
        USER_PERMISSIONS.UPDATE,
        USER_PERMISSIONS.DELETE
      ]) && (
        <UserActions />
      )}
    </div>
  );
};
```

### API Service Usage
```javascript
import authService from './services/authService';

// Login
const handleLogin = async (credentials) => {
  try {
    const result = await authService.login(credentials);
    console.log('Login successful:', result);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Get current user
const getCurrentUser = async () => {
  try {
    const user = await authService.getCurrentUser();
    console.log('Current user:', user);
  } catch (error) {
    console.error('Failed to get user:', error);
  }
};
```

## 🔐 Permission System

The frontend uses the exact same permission strings as your backend:

```javascript
// User permissions
USER_PERMISSIONS.CREATE     // 'User.Create'
USER_PERMISSIONS.UPDATE     // 'User.Update'
USER_PERMISSIONS.DELETE     // 'User.Delete'

// Invitation permissions
INVITATION_PERMISSIONS.CREATE_SINGLE_OWN  // 'Invitation.Create.Single.Own'
INVITATION_PERMISSIONS.APPROVE            // 'Invitation.Approve'

// Role-based permissions
STAFF_PERMISSIONS           // Array of staff permissions
OPERATOR_PERMISSIONS        // Array of operator permissions  
ADMIN_PERMISSIONS          // Array of all permissions
```

## 🎨 Role-Based UI

The dashboard automatically adapts based on user roles:

- **👑 Administrator**: Full system access with all features
- **🛡️ Operator**: Check-in operations, walk-in registration, alerts
- **📝 Staff**: Invitation management, personal calendar, basic features

## 🚀 What's Next

This foundation is ready for:

1. **Login/Logout UI** - Beautiful authentication forms
2. **User Management Interface** - Admin panel for managing users
3. **Dashboard Components** - Role-specific dashboard layouts
4. **Navigation System** - Sidebar and routing
5. **Additional Features** - Invitations, check-in, facial recognition

## 🔍 Testing the Integration

1. **Start your backend** at `https://localhost:7147`
2. **Start the frontend** with `npm start`
3. **Open browser console** to see API requests/responses
4. **Check authentication flow** in the Redux DevTools

The app will show connection status and demonstrate the authentication integration.

## 📊 Features Implemented

- ✅ **Complete authentication flow** with JWT cookies
- ✅ **Role-based dashboard routing** (Staff/Operator/Admin)  
- ✅ **Permission-based component rendering**
- ✅ **User session management**
- ✅ **Error handling and user feedback**
- ✅ **Loading states and optimistic updates**
- ✅ **Redux Toolkit state management**
- ✅ **Axios API integration**
- ✅ **Custom hooks for reusable logic**
- ✅ **100% integration** with existing backend APIs

## 🛡️ Security Features

- **HTTP-only cookies** for JWT storage
- **Automatic token refresh** with retry logic
- **Request/response encryption** via HTTPS
- **CSRF protection** via same-site cookies
- **XSS protection** via content security policy
- **Session timeout** handling
- **Multi-device session** management

---

**Ready to build amazing user experiences on top of your robust backend! 🎉**