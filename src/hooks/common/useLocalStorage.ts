import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

/**
 * Hook for syncing state with localStorage
 * Supports SSR and handles JSON serialization/deserialization
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  }
): [T, SetValue<T>, () => void] {
  // Custom serialization functions
  const serialize = options?.serialize || JSON.stringify;
  const deserialize = options?.deserialize || JSON.parse;

  // Get initial value from localStorage or use provided initial value
  const getStoredValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Update localStorage when value changes
  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore));
          
          // Dispatch storage event for other tabs
          window.dispatchEvent(
            new StorageEvent('storage', {
              key,
              newValue: serialize(valueToStore),
              storageArea: window.localStorage,
            })
          );
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serialize, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Dispatch storage event for other tabs
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: null,
            storageArea: window.localStorage,
          })
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes in other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === window.localStorage) {
        try {
          if (e.newValue === null) {
            setStoredValue(initialValue);
          } else {
            setStoredValue(deserialize(e.newValue));
          }
        } catch (error) {
          console.error(`Error handling storage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, deserialize]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing multiple localStorage values with a shared prefix
 */
export function useLocalStorageNamespace(namespace: string) {
  const get = useCallback(
    <T>(key: string, defaultValue: T): T => {
      if (typeof window === 'undefined') return defaultValue;

      try {
        const item = window.localStorage.getItem(`${namespace}:${key}`);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    [namespace]
  );

  const set = useCallback(
    <T>(key: string, value: T): void => {
      if (typeof window === 'undefined') return;

      try {
        window.localStorage.setItem(`${namespace}:${key}`, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting localStorage key "${namespace}:${key}":`, error);
      }
    },
    [namespace]
  );

  const remove = useCallback(
    (key: string): void => {
      if (typeof window === 'undefined') return;

      try {
        window.localStorage.removeItem(`${namespace}:${key}`);
      } catch (error) {
        console.error(`Error removing localStorage key "${namespace}:${key}":`, error);
      }
    },
    [namespace]
  );

  const clear = useCallback((): void => {
    if (typeof window === 'undefined') return;

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key?.startsWith(`${namespace}:`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => window.localStorage.removeItem(key));
    } catch (error) {
      console.error(`Error clearing localStorage namespace "${namespace}":`, error);
    }
  }, [namespace]);

  return { get, set, remove, clear };
}