// Create a hook to handle automatic refresh after create operations
// src/hooks/useAutoRefresh.js
import { useEffect } from 'react';

export const useAutoRefresh = (needsRefresh, refreshAction, dispatch) => {
  useEffect(() => {
    if (needsRefresh) {
      // Small delay to ensure the server has processed the change
      const timeoutId = setTimeout(() => {
        dispatch(refreshAction);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [needsRefresh, refreshAction, dispatch]);
};