import React, { ComponentType, memo, MemoExoticComponent } from 'react';

/**
 * Deep comparison function for React.memo
 * Use this when you need to compare complex objects or arrays
 */
export function deepMemoCompare<P extends object>(
  prevProps: Readonly<P>,
  nextProps: Readonly<P>
): boolean {
  // Simple deep comparison without lodash
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}

/**
 * Shallow comparison with specific keys
 * More performant than deep comparison when you know which props matter
 */
export function createSelectiveCompare<P extends object>(
  keys: (keyof P)[]
): (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean {
  return (prevProps, nextProps) => {
    return keys.every(key => prevProps[key] === nextProps[key]);
  };
}

/**
 * HOC that adds React.memo with custom comparison
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): MemoExoticComponent<ComponentType<P>> {
  return memo(Component, propsAreEqual);
}

/**
 * HOC that adds React.memo with selective key comparison
 */
export function withSelectiveMemo<P extends object>(
  Component: ComponentType<P>,
  keys: (keyof P)[]
): MemoExoticComponent<ComponentType<P>> {
  return memo(Component, createSelectiveCompare(keys));
}

/**
 * Batch state updates to reduce re-renders
 * Useful when you need to update multiple state values
 */
export function batchUpdates<T extends Record<string, any>>(
  updates: Partial<T>,
  setState: (updates: Partial<T>) => void
): void {
  // React 18 automatically batches updates, but this ensures batching
  queueMicrotask(() => {
    setState(updates);
  });
}

/**
 * Create a stable callback that doesn't change between renders
 * Alternative to useCallback when you need more control
 */
export function createStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = { current: callback };
  
  // Update the ref on each render
  callbackRef.current = callback;
  
  // Return a stable function that calls the current callback
  return ((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }) as T;
}

/**
 * Memoize expensive computations with custom cache
 */
export function createMemoizer<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => TResult,
  getCacheKey: (...args: TArgs) => string,
  maxCacheSize: number = 10
): (...args: TArgs) => TResult {
  const cache = new Map<string, { value: TResult; timestamp: number }>();
  
  return (...args: TArgs): TResult => {
    const key = getCacheKey(...args);
    
    // Check if we have a cached value
    const cached = cache.get(key);
    if (cached) {
      // Move to end (LRU)
      cache.delete(key);
      cache.set(key, cached);
      return cached.value;
    }
    
    // Calculate new value
    const value = fn(...args);
    
    // Add to cache
    cache.set(key, { value, timestamp: Date.now() });
    
    // Evict oldest if cache is too large
    if (cache.size > maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return value;
  };
}

/**
 * Defer expensive operations until after render
 */
export function deferOperation(operation: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(operation);
  } else {
    setTimeout(operation, 0);
  }
}

/**
 * Create a lazy-loaded component with loading state
 */
export function createLazyComponent<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent?: ComponentType
): ComponentType<P> {
  let Component: ComponentType<P> | null = null;
  let promise: Promise<void> | null = null;
  
  return memo((props: P) => {
    if (Component) {
      return <Component {...props} />;
    }
    
    if (!promise) {
      promise = loader().then(module => {
        Component = module.default;
      });
    }
    
    throw promise;
  });
}

/**
 * Performance monitoring decorator
 */
export function measurePerformance(componentName: string) {
  return function <P extends object>(Component: ComponentType<P>): ComponentType<P> {
    return memo((props: P) => {
      const startTime = performance.now();
      
      // Measure render time
      const result = <Component {...props} />;
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log slow renders
      if (renderTime > 16) { // More than one frame (16ms)
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      return result;
    });
  };
}

/**
 * Virtual list helper for rendering large lists efficiently
 */
export interface VirtualListConfig {
  itemHeight: number;
  overscan?: number;
  getItemKey?: (index: number) => string | number;
}

export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemCount: number,
  config: VirtualListConfig
): { start: number; end: number } {
  const { itemHeight, overscan = 3 } = config;
  
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(itemCount, start + visibleCount + overscan * 2);
  
  return { start, end };
}

/**
 * Debounce render updates for frequently changing values
 */
export function useRenderDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  const mountedRef = React.useRef(true);
  
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        setDebouncedValue(value);
      }
    }, delay);
    
    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);
  
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  return debouncedValue;
}