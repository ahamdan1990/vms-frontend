import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';

/**
 * In-memory storage implementation for Claude.ai artifacts compatibility
 * Replaces localStorage/sessionStorage with memory-based storage
 */

// Global in-memory storage
const memoryStorage = new Map();
const sessionMemoryStorage = new Map();

// Storage context for sharing across components
const StorageContext = createContext({
  memoryStorage,
  sessionMemoryStorage,
  listeners: new Map()
});

/**
 * Storage provider component
 */
export const StorageProvider = ({ children }) => {
  const listenersRef = useRef(new Map());

  const contextValue = {
    memoryStorage,
    sessionMemoryStorage,
    listeners: listenersRef.current
  };

  return (
    <StorageContext.Provider value={contextValue}>
      {children}
    </StorageContext.Provider>
  );
};

/**
 * Custom hook for in-memory storage with React state-like interface
 * Replaces useLocalStorage with memory-based implementation
 */
export const useMemoryStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    validator = null,
    errorHandler = console.error,
    persistent = true // false = session-like, true = persistent-like
  } = options;

  const { memoryStorage, sessionMemoryStorage, listeners } = useContext(StorageContext);
  const storage = persistent ? memoryStorage : sessionMemoryStorage;
  
  // Initialize state
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = storage.get(key);
      if (item === undefined) {
        return initialValue;
      }

      const parsedValue = typeof item === 'string' ? deserialize(item) : item;
      
      // Validate the value if validator is provided
      if (validator && !validator(parsedValue)) {
        errorHandler(`Invalid value for key "${key}":`, parsedValue);
        return initialValue;
      }

      return parsedValue;
    } catch (error) {
      errorHandler(`Error reading memory storage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update storage and state
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function for lazy initialization
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Validate the value if validator is provided
      if (validator && !validator(valueToStore)) {
        errorHandler(`Invalid value for key "${key}":`, valueToStore);
        return false;
      }

      setStoredValue(valueToStore);

      if (valueToStore === undefined) {
        storage.delete(key);
      } else {
        const serializedValue = typeof valueToStore === 'string' ? valueToStore : serialize(valueToStore);
        storage.set(key, serializedValue);
      }

      // Notify listeners
      const keyListeners = listeners.get(key) || [];
      keyListeners.forEach(listener => {
        try {
          listener(valueToStore, key);
        } catch (error) {
          errorHandler(`Storage listener error for key "${key}":`, error);
        }
      });

      return true;
    } catch (error) {
      errorHandler(`Error setting memory storage key "${key}":`, error);
      return false;
    }
  }, [key, serialize, storedValue, validator, errorHandler, storage, listeners]);

  // Remove item from storage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(undefined);
      storage.delete(key);

      // Notify listeners
      const keyListeners = listeners.get(key) || [];
      keyListeners.forEach(listener => {
        try {
          listener(undefined, key);
        } catch (error) {
          errorHandler(`Storage listener error for key "${key}":`, error);
        }
      });

      return true;
    } catch (error) {
      errorHandler(`Error removing memory storage key "${key}":`, error);
      return false;
    }
  }, [key, errorHandler, storage, listeners]);

  // Check if key exists in storage
  const hasValue = useCallback(() => {
    return storage.has(key);
  }, [key, storage]);

  // Get raw value from storage (without deserialization)
  const getRawValue = useCallback(() => {
    return storage.get(key);
  }, [key, storage]);

  // Update from storage (useful for syncing across components)
  const refresh = useCallback(() => {
    try {
      const item = storage.get(key);
      if (item === undefined) {
        setStoredValue(initialValue);
        return;
      }

      const parsedValue = typeof item === 'string' ? deserialize(item) : item;
      
      if (validator && !validator(parsedValue)) {
        errorHandler(`Invalid value for key "${key}":`, parsedValue);
        setStoredValue(initialValue);
        return;
      }

      setStoredValue(parsedValue);
    } catch (error) {
      errorHandler(`Error refreshing memory storage key "${key}":`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue, deserialize, validator, errorHandler, storage]);

  // Subscribe to storage changes
  useEffect(() => {
    if (!listeners.has(key)) {
      listeners.set(key, []);
    }

    const handleStorageChange = (newValue, storageKey) => {
      if (storageKey === key) {
        setStoredValue(newValue);
      }
    };

    listeners.get(key).push(handleStorageChange);

    return () => {
      const keyListeners = listeners.get(key) || [];
      const index = keyListeners.indexOf(handleStorageChange);
      if (index > -1) {
        keyListeners.splice(index, 1);
      }
    };
  }, [key, listeners]);

  return [storedValue, setValue, removeValue, { hasValue, getRawValue, refresh }];
};

/**
 * Alias for backward compatibility with useLocalStorage
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  return useMemoryStorage(key, initialValue, { ...options, persistent: true });
};

/**
 * Alias for session storage (memory-based)
 */
export const useSessionStorage = (key, initialValue, options = {}) => {
  return useMemoryStorage(key, initialValue, { ...options, persistent: false });
};

/**
 * Custom hook for managing multiple storage keys as a single object
 */
export const useStorageObject = (keyPrefix, initialState = {}, options = {}) => {
  const {
    debounceMs = 0,
    validator = null,
    errorHandler = console.error,
    persistent = true
  } = options;

  const [state, setState] = useState(initialState);
  const { memoryStorage, sessionMemoryStorage } = useContext(StorageContext);
  const storage = persistent ? memoryStorage : sessionMemoryStorage;
  const debounceTimeoutRef = useRef();

  // Load initial state from storage
  useEffect(() => {
    const loadedState = { ...initialState };
    let hasChanges = false;

    Object.keys(initialState).forEach(key => {
      try {
        const fullKey = `${keyPrefix}_${key}`;
        const item = storage.get(fullKey);
        
        if (item !== undefined) {
          const parsedValue = typeof item === 'string' ? JSON.parse(item) : item;
          
          if (validator && !validator(key, parsedValue)) {
            errorHandler(`Invalid value for key "${fullKey}":`, parsedValue);
            return;
          }

          loadedState[key] = parsedValue;
          hasChanges = true;
        }
      } catch (error) {
        errorHandler(`Error loading storage key "${keyPrefix}_${key}":`, error);
      }
    });

    if (hasChanges) {
      setState(loadedState);
    }
  }, [keyPrefix, initialState, validator, errorHandler, storage]);

  // Save state to storage (with debouncing)
  const saveToStorage = useCallback((newState) => {
    if (debounceMs > 0) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        Object.entries(newState).forEach(([key, value]) => {
          try {
            const fullKey = `${keyPrefix}_${key}`;
            
            if (value === undefined) {
              storage.delete(fullKey);
            } else {
              const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
              storage.set(fullKey, serializedValue);
            }
          } catch (error) {
            errorHandler(`Error saving storage key "${keyPrefix}_${key}":`, error);
          }
        });
      }, debounceMs);
    } else {
      Object.entries(newState).forEach(([key, value]) => {
        try {
          const fullKey = `${keyPrefix}_${key}`;
          
          if (value === undefined) {
            storage.delete(fullKey);
          } else {
            const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
            storage.set(fullKey, serializedValue);
          }
        } catch (error) {
          errorHandler(`Error saving storage key "${keyPrefix}_${key}":`, error);
        }
      });
    }
  }, [keyPrefix, debounceMs, errorHandler, storage]);

  // Update state and save to storage
  const updateState = useCallback((updates) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  // Update a single key
  const setKey = useCallback((key, value) => {
    updateState({ [key]: value });
  }, [updateState]);

  // Remove a key
  const removeKey = useCallback((key) => {
    setState(prevState => {
      const newState = { ...prevState };
      delete newState[key];
      
      try {
        storage.delete(`${keyPrefix}_${key}`);
      } catch (error) {
        errorHandler(`Error removing storage key "${keyPrefix}_${key}":`, error);
      }
      
      return newState;
    });
  }, [keyPrefix, errorHandler, storage]);

  // Clear all keys
  const clearAll = useCallback(() => {
    setState(initialState);
    
    Object.keys(state).forEach(key => {
      try {
        storage.delete(`${keyPrefix}_${key}`);
      } catch (error) {
        errorHandler(`Error removing storage key "${keyPrefix}_${key}":`, error);
      }
    });
  }, [keyPrefix, initialState, state, errorHandler, storage]);

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return [state, updateState, { setKey, removeKey, clearAll }];
};

/**
 * Alias for backward compatibility
 */
export const useLocalStorageObject = (keyPrefix, initialState = {}, options = {}) => {
  return useStorageObject(keyPrefix, initialState, { ...options, persistent: true });
};

/**
 * Custom hook for storage with expiration
 */
export const useStorageWithExpiry = (key, initialValue, expiryMs, options = {}) => {
  const [value, setValue, removeValue, utils] = useMemoryStorage(
    key,
    { value: initialValue, expiry: null },
    options
  );

  const setValueWithExpiry = useCallback((newValue) => {
    const expiry = expiryMs ? Date.now() + expiryMs : null;
    return setValue({ value: newValue, expiry });
  }, [setValue, expiryMs]);

  const getCurrentValue = useCallback(() => {
    if (!value || value.value === undefined) {
      return initialValue;
    }

    // Check if expired
    if (value.expiry && Date.now() > value.expiry) {
      removeValue();
      return initialValue;
    }

    return value.value;
  }, [value, initialValue, removeValue]);

  const isExpired = useCallback(() => {
    return value?.expiry && Date.now() > value.expiry;
  }, [value]);

  const getTimeUntilExpiry = useCallback(() => {
    if (!value?.expiry) return null;
    const remaining = value.expiry - Date.now();
    return remaining > 0 ? remaining : 0;
  }, [value]);

  return [
    getCurrentValue(),
    setValueWithExpiry,
    removeValue,
    { ...utils, isExpired, getTimeUntilExpiry }
  ];
};

/**
 * Alias for backward compatibility
 */
export const useLocalStorageWithExpiry = (key, initialValue, expiryMs, options = {}) => {
  return useStorageWithExpiry(key, initialValue, expiryMs, { ...options, persistent: true });
};

/**
 * Hook to get storage statistics
 */
export const useStorageStats = () => {
  const { memoryStorage, sessionMemoryStorage } = useContext(StorageContext);

  return {
    persistent: {
      size: memoryStorage.size,
      keys: Array.from(memoryStorage.keys())
    },
    session: {
      size: sessionMemoryStorage.size,
      keys: Array.from(sessionMemoryStorage.keys())
    }
  };
};

/**
 * Clear all storage
 */
export const clearAllStorage = () => {
  memoryStorage.clear();
  sessionMemoryStorage.clear();
};

/**
 * Export storage for direct access if needed
 */
export const getMemoryStorage = () => memoryStorage;
export const getSessionMemoryStorage = () => sessionMemoryStorage;

export default useMemoryStorage;