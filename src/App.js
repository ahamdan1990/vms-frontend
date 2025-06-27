// src/App.js
import React, { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import { StorageProvider } from './hooks/useStorage';
import AppRoutes from './routes/AppRoutes';
import { useAuth } from './hooks/useAuth';
import { useDispatch } from 'react-redux';
import { initializeUI } from './store/slices/uiSlice';
import { initializeNotifications } from './store/slices/notificationSlice';
import Notification from './components/common/Notification/Notification';

/**
 * App initialization component - FIXED VERSION
 */
const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (!initialized.current) {
      console.log('🚀 Initializing app...');
      
      // Initialize UI state first
      dispatch(initializeUI());
      
      // Initialize notifications without automatic permission request
      dispatch(initializeNotifications());
      
      initialized.current = true;
      console.log('✅ App initialization complete');

      // FIXED: Hide the HTML loading screen now that React is ready
      setTimeout(() => {
        if (window.hideLoadingScreen) {
          window.hideLoadingScreen();
        }
      }, 100); // Small delay to ensure React has rendered
    }
  }, [dispatch]);

  // ✅ FIXED: Reduce authentication state change logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 App: Authentication state - isAuthenticated: ${isAuthenticated}`);
    }
  }, [isAuthenticated]);

  return children;
};

/**
 * Main App component
 */
function App() {
  return (
    <Provider store={store}>
      <StorageProvider>
        <BrowserRouter>
          <AppInitializer>
            <div className="App min-h-screen bg-gray-50">
              <AppRoutes />
              <Notification />
            </div>
          </AppInitializer>
        </BrowserRouter>
      </StorageProvider>
    </Provider>
  );
}

export default App;