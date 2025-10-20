// src/App.js - UNIFIED NOTIFICATION SYSTEM
import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import { StorageProvider } from './hooks/useStorage';
import AppRoutes from './routes/AppRoutes';
import { useAuth } from './hooks/useAuth';
import { useDispatch } from 'react-redux';
import { initializeUI, setPageLoading } from './store/slices/uiSlice';
import { initializeNotifications } from './store/slices/notificationSlice';
import NotificationProvider from './components/notifications/NotificationProvider';
import NotificationCenter from './components/notifications/NotificationCenter.js';
import { HelmetProvider } from 'react-helmet-async';


/**
 * App initialization component
 * Note: SignalR initialization is now handled by useSignalR hook to avoid conflicts
 */
const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useAuth();
  const initialized = useRef(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Wait for initial auth check to complete
  useEffect(() => {
    if (!loading && !authChecked) {
      setAuthChecked(true);
    }
  }, [loading, authChecked]);

  useEffect(() => {
    if (!initialized.current && authChecked) {
      console.log('🚀 Initializing app...');

      dispatch(initializeUI());
      dispatch(initializeNotifications());

      initialized.current = true;
      console.log('✅ App initialization complete');

      setTimeout(() => {
        if (window.hideLoadingScreen) {
          window.hideLoadingScreen();
        }
      }, 100);
    }
  }, [dispatch, authChecked]);

  // Centralized loading management
  useEffect(() => {
    dispatch(setPageLoading(loading));
    return () => {
      dispatch(setPageLoading(false));
    };
  }, [loading, dispatch]);

  // Show loading screen while checking auth
  if (!authChecked) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Initializing application...</p>
        </div>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <StorageProvider>
        <HelmetProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <NotificationProvider
              position="top-right"
              maxToasts={5}
              defaultDuration={4000}
              enableDesktop={true}
              enableSound={true}
            >
              <AppInitializer>
                <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <AppRoutes />
                  <NotificationCenter />
                </div>
              </AppInitializer>
            </NotificationProvider>
          </BrowserRouter>
        </HelmetProvider>
      </StorageProvider>
    </Provider>
  );
}

export default App;