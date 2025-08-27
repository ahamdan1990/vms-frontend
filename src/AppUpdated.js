// src/App.js - UPDATED WITH UNIFIED NOTIFICATION SYSTEM
import React, { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import { StorageProvider } from './hooks/useStorage';
import AppRoutes from './routes/AppRoutes';
import { useAuth } from './hooks/useAuth';
import { useDispatch } from 'react-redux';
import { initializeUI, setPageLoading } from './store/slices/uiSlice';
import { initializeNotifications, setSignalRConnected } from './store/slices/unifiedNotificationSlice';
import NotificationProvider from './components/notifications/NotificationProvider';
import NotificationCenter from './components/notifications/NotificationCenter.js';
import { signalRManager } from './services/signalr/signalRConnection';

/**
 * App initialization component with theme support
 */
const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useAuth();
  const initialized = useRef(false);
  const signalRInitialized = useRef(false);

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

  // Initialize SignalR when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !signalRInitialized.current) {
      console.log('🔗 Initializing SignalR connections...');
      signalRInitialized.current = true;
      
      signalRManager
        .initializeConnections(user)
        .then(() => {
          dispatch(setSignalRConnected(true));
          console.log('✅ SignalR connections established');
        })
        .catch(error => {
          console.error('❌ SignalR initialization failed:', error);
          dispatch(setSignalRConnected(false));
          signalRInitialized.current = false;
        });
    }
  }, [isAuthenticated, user, dispatch]);

  // Cleanup SignalR when user logs out
  useEffect(() => {
    if (!isAuthenticated && signalRInitialized.current) {
      console.log('🔌 Cleaning up SignalR connections...');
      signalRInitialized.current = false;
      
      signalRManager
        .disconnectAll()
        .then(() => {
          dispatch(setSignalRConnected(false));
          console.log('✅ SignalR connections closed');
        })
        .catch(error => {
          console.error('❌ SignalR cleanup error:', error);
        });
    }
  }, [isAuthenticated, dispatch]);

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
      </StorageProvider>
    </Provider>
  );
}

export default App;