import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  called: boolean;
}

interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: () => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for managing async operations with loading, error, and data states
 * Prevents state updates on unmounted components
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = false
): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: immediate,
    called: false,
  });

  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Execute the async function
  const execute = useCallback(async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState((prev) => ({
      ...prev,
      loading: true,
      called: true,
      error: null,
    }));

    try {
      const data = await asyncFunction();
      
      if (mountedRef.current) {
        setState({
          data,
          error: null,
          loading: false,
          called: true,
        });
      }
      
      return data;
    } catch (error) {
      if (mountedRef.current) {
        setState({
          data: null,
          error: error instanceof Error ? error : new Error(String(error)),
          loading: false,
          called: true,
        });
      }
      return null;
    }
  }, [asyncFunction]);

  // Reset state
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState({
      data: null,
      error: null,
      loading: false,
      called: false,
    });
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for managing multiple async operations
 */
export function useAsyncMultiple<T extends Record<string, () => Promise<any>>>() {
  const [states, setStates] = useState<
    Record<keyof T, AsyncState<any>>
  >({} as Record<keyof T, AsyncState<any>>);

  const mountedRef = useRef(true);

  const execute = useCallback(
    async <K extends keyof T>(
      key: K,
      asyncFunction: T[K]
    ): Promise<ReturnType<T[K]> | null> => {
      setStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          loading: true,
          called: true,
          error: null,
        },
      }));

      try {
        const data = await asyncFunction();
        
        if (mountedRef.current) {
          setStates((prev) => ({
            ...prev,
            [key]: {
              data,
              error: null,
              loading: false,
              called: true,
            },
          }));
        }
        
        return data;
      } catch (error) {
        if (mountedRef.current) {
          setStates((prev) => ({
            ...prev,
            [key]: {
              data: null,
              error: error instanceof Error ? error : new Error(String(error)),
              loading: false,
              called: true,
            },
          }));
        }
        return null;
      }
    },
    []
  );

  const reset = useCallback(<K extends keyof T>(key?: K) => {
    if (key) {
      setStates((prev) => ({
        ...prev,
        [key]: {
          data: null,
          error: null,
          loading: false,
          called: false,
        },
      }));
    } else {
      setStates({} as Record<keyof T, AsyncState<any>>);
    }
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    states,
    execute,
    reset,
  };
}