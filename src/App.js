// src/App.js - UNIFIED NOTIFICATION SYSTEM
import React, { useEffect, useRef } from 'react';
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
  const { loading } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
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
  }, [dispatch]);

  // Centralized loading management
  useEffect(() => {
    dispatch(setPageLoading(loading));
    return () => {
      dispatch(setPageLoading(false));
    };
  }, [loading, dispatch]);

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <StorageProvider>
        <HelmetProvider>
          <BrowserRouter>
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