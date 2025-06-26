import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import apiClient, { shouldRetryRequest, getRetryDelay } from '../services/apiClient';
import { isRetryableError } from '../services/errorService';
import { addAlert } from '../store/slices/uiSlice';
import { incrementErrorCount } from '../store/slices/uiSlice';

/**
 * Custom hook for API calls with loading states, error handling, and retry logic
 * Provides a consistent interface for making API calls throughout the application
 * Integrated with the refactored apiClient and errorService
 */
export const useApi = () => {
  const dispatch = useDispatch();
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Execute an API call with comprehensive error handling and loading states
   */
  const execute = useCallback(async (apiCall, options = {}) => {
    const {
      onSuccess,
      onError,
      showSuccessMessage = false,
      showErrorMessage = true,
      successMessage = 'Operation completed successfully',
      retries = 0,
      retryDelay = 1000,
      abortController,
      skipErrorDispatch = false
    } = options;

    // Create abort controller if not provided
    const controller = abortController || new AbortController();
    abortControllerRef.current = controller;

    let currentRetry = 0;
    let lastError = null;

    const attemptApiCall = async () => {
      try {
        const result = await apiCall(controller.signal);
        
        // Check if component is still mounted
        if (!mountedRef.current) return null;

        // Handle success
        if (showSuccessMessage) {
          dispatch(addAlert({
            type: 'success',
            title: 'Success',
            message: successMessage
          }));
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        // Check if component is still mounted
        if (!mountedRef.current) return null;

        // Don't handle aborted requests
        if (error.name === 'AbortError') {
          return null;
        }

        lastError = error;

        // Increment error count for monitoring
        if (!skipErrorDispatch) {
          dispatch(incrementErrorCount());
        }

        // Check if we should retry
        if (currentRetry < retries && shouldRetryRequest(error, currentRetry, retries)) {
          currentRetry++;
          
          // Calculate retry delay
          const delay = retryDelay * currentRetry || getRetryDelay(currentRetry, error);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry if component is still mounted
          if (mountedRef.current) {
            return attemptApiCall();
          }
        }

        // Handle error - error is already processed by apiClient interceptors
        if (showErrorMessage && error.message) {
          dispatch(addAlert({
            type: 'error',
            title: 'Error',
            message: error.message,
            persistent: true
          }));
        }

        if (onError) {
          onError(error);
        }

        throw error;
      }
    };

    return attemptApiCall();
  }, [dispatch]);

  /**
   * Cancel any pending API calls
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    execute,
    cancel
  };
};

/**
 * Custom hook for API calls with automatic loading state management
 */
export const useApiCall = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastExecuted, setLastExecuted] = useState(null);
  const { execute, cancel } = useApi();

  const {
    immediate = false,
    dependencies = [],
    transform,
    ...executeOptions
  } = options;

  const call = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await execute(
        (signal) => apiFunction(...args, { signal }),
        {
          ...executeOptions,
          onError: (error) => {
            setError(error);
            if (executeOptions.onError) {
              executeOptions.onError(error);
            }
          },
          onSuccess: (result) => {
            const finalResult = transform ? transform(result) : result;
            setData(finalResult);
            setLastExecuted(new Date());
            if (executeOptions.onSuccess) {
              executeOptions.onSuccess(finalResult);
            }
          }
        }
      );

      return result;
    } catch (error) {
      // Error is already handled in execute
      throw error;
    } finally {
      setLoading(false);
    }
  }, [execute, apiFunction, transform, executeOptions]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLastExecuted(null);
    cancel();
  }, [cancel]);

  const retry = useCallback(() => {
    call();
  }, [call]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      call();
    }
  }, [immediate, call, ...dependencies]);

  return {
    data,
    loading,
    error,
    lastExecuted,
    call,
    retry,
    reset,
    cancel
  };
};

/**
 * Custom hook for paginated API calls
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { execute } = useApi();

  const {
    initialPageSize = 20,
    appendMode = false, // For infinite scroll
    transform,
    ...executeOptions
  } = options;

  const loadPage = useCallback(async (pageIndex = 0, pageSize = initialPageSize, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await execute(
        (signal) => apiFunction({ pageIndex, pageSize, ...params, signal }),
        {
          ...executeOptions,
          onError: (error) => {
            setError(error);
            if (executeOptions.onError) {
              executeOptions.onError(error);
            }
          }
        }
      );

      const transformedItems = transform ? transform(result.items) : result.items;

      if (appendMode && pageIndex > 0) {
        setItems(prev => [...prev, ...transformedItems]);
      } else {
        setItems(transformedItems);
      }

      setPagination({
        pageIndex: result.pageIndex || pageIndex,
        pageSize: result.pageSize || pageSize,
        totalCount: result.totalCount || 0,
        totalPages: result.totalPages || 0,
        hasNext: result.hasNextPage || false,
        hasPrevious: result.hasPreviousPage || false
      });

      if (executeOptions.onSuccess) {
        executeOptions.onSuccess(result);
      }

      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [execute, apiFunction, appendMode, transform, executeOptions, initialPageSize]);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      return loadPage(pagination.pageIndex + 1, pagination.pageSize);
    }
  }, [pagination, loadPage]);

  const previousPage = useCallback(() => {
    if (pagination.hasPrevious) {
      return loadPage(pagination.pageIndex - 1, pagination.pageSize);
    }
  }, [pagination, loadPage]);

  const goToPage = useCallback((pageIndex) => {
    return loadPage(pageIndex, pagination.pageSize);
  }, [pagination.pageSize, loadPage]);

  const changePageSize = useCallback((newPageSize) => {
    return loadPage(0, newPageSize);
  }, [loadPage]);

  const refresh = useCallback((params = {}) => {
    return loadPage(pagination.pageIndex, pagination.pageSize, params);
  }, [pagination, loadPage]);

  const reset = useCallback(() => {
    setItems([]);
    setPagination({
      pageIndex: 0,
      pageSize: initialPageSize,
      totalCount: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false
    });
    setError(null);
  }, [initialPageSize]);

  return {
    items,
    pagination,
    loading,
    error,
    loadPage,
    nextPage,
    previousPage,
    goToPage,
    changePageSize,
    refresh,
    reset
  };
};

/**
 * Custom hook for optimistic updates
 */
export const useOptimisticApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const { execute } = useApi();

  const executeOptimistic = useCallback(async (optimisticData, apiParams, executeOptions = {}) => {
    const originalData = data;
    
    // Apply optimistic update immediately
    setData(optimisticData);
    setIsOptimistic(true);
    setLoading(true);
    setError(null);

    try {
      const result = await execute(
        (signal) => apiFunction(apiParams, { signal }),
        {
          ...executeOptions,
          onError: (error) => {
            // Revert optimistic update on error
            setData(originalData);
            setError(error);
            if (executeOptions.onError) {
              executeOptions.onError(error);
            }
          },
          onSuccess: (result) => {
            // Update with real data from server
            setData(result);
            if (executeOptions.onSuccess) {
              executeOptions.onSuccess(result);
            }
          }
        }
      );

      return result;
    } finally {
      setLoading(false);
      setIsOptimistic(false);
    }
  }, [data, execute, apiFunction]);

  const updateData = useCallback((newData) => {
    setData(newData);
  }, []);

  const reset = useCallback(() => {
    setData(options.initialData || null);
    setError(null);
    setIsOptimistic(false);
  }, [options.initialData]);

  return {
    data,
    loading,
    error,
    isOptimistic,
    executeOptimistic,
    updateData,
    reset
  };
};

/**
 * Custom hook for batch API operations
 */
export const useBatchApi = (apiFunction, options = {}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const { execute } = useApi();

  const executeBatch = useCallback(async (items, batchOptions = {}) => {
    const {
      batchSize = 5,
      delayBetweenBatches = 100,
      stopOnError = false,
      ...executeOptions
    } = { ...options, ...batchOptions };

    setLoading(true);
    setProgress(0);
    setResults([]);
    setErrors([]);

    const totalItems = items.length;
    const batches = [];
    const allResults = []; // Fixed: Use local array to accumulate results
    const allErrors = []; // Fixed: Use local array to accumulate errors
    
    // Split items into batches
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    let processedCount = 0;

    try {
      for (const batch of batches) {
        const batchPromises = batch.map(async (item, index) => {
          try {
            const result = await execute(
              (signal) => apiFunction(item, { signal }),
              { ...executeOptions, showErrorMessage: false }
            );
            
            processedCount++;
            setProgress((processedCount / totalItems) * 100);
            
            const resultObj = { item, result, success: true, index: processedCount - 1 };
            allResults.push(resultObj);
            setResults(prev => [...prev, resultObj]);
            
            return resultObj;
          } catch (error) {
            processedCount++;
            setProgress((processedCount / totalItems) * 100);
            
            const errorObj = { item, error, success: false, index: processedCount - 1 };
            allErrors.push(errorObj);
            setErrors(prev => [...prev, errorObj]);
            
            if (stopOnError) {
              throw error;
            }
            
            return errorObj;
          }
        });

        const batchResults = await Promise.all(batchPromises);

        // Delay between batches
        if (delayBetweenBatches > 0 && batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }
    } finally {
      setLoading(false);
    }

    // Fixed: Use accumulated results instead of state
    const successResults = allResults.filter(r => r.success);
    const errorResults = allErrors;

    return {
      total: totalItems,
      successful: successResults.length,
      failed: errorResults.length,
      results: successResults,
      errors: errorResults
    };
  }, [execute, apiFunction, options]);

  const reset = useCallback(() => {
    setResults([]);
    setErrors([]);
    setProgress(0);
  }, []);

  return {
    results,
    errors,
    loading,
    progress,
    executeBatch,
    reset
  };
};

/**
 * Custom hook for real-time API calls with polling
 */
export const usePollingApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const { execute, cancel } = useApi();
  const intervalRef = useRef(null);

  const {
    interval = 5000, // 5 seconds default
    immediate = false,
    ...executeOptions
  } = options;

  const poll = useCallback(async () => {
    if (!isPolling) return;

    try {
      const result = await execute(
        (signal) => apiFunction({ signal }),
        {
          ...executeOptions,
          showErrorMessage: false,
          onSuccess: (result) => {
            setData(result);
            setError(null);
            if (executeOptions.onSuccess) {
              executeOptions.onSuccess(result);
            }
          },
          onError: (error) => {
            setError(error);
            if (executeOptions.onError) {
              executeOptions.onError(error);
            }
          }
        }
      );
      return result;
    } catch (error) {
      // Error handling is done in execute
    }
  }, [execute, apiFunction, executeOptions, isPolling]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // Already polling

    setIsPolling(true);
    setLoading(true);

    // Initial call
    poll().finally(() => setLoading(false));

    // Set up interval
    intervalRef.current = setInterval(poll, interval);
  }, [poll, interval]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    cancel();
  }, [cancel]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await poll();
    } finally {
      setLoading(false);
    }
  }, [poll]);

  // Start polling immediately if requested
  useEffect(() => {
    if (immediate) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [immediate, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refresh
  };
};

export default useApi;