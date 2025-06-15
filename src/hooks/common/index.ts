/**
 * Common hooks for state management and performance optimization
 */

export * from './useDebounce';
export * from './useThrottle';
export * from './useLocalStorage';
export * from './useAsync';
export * from './usePrevious';
export * from './useIntersectionObserver';

// Re-export commonly used hooks with shorter names
export { useDebounce as useDebounced } from './useDebounce';
export { useThrottle as useThrottled } from './useThrottle';
export { useIsInViewport as useInView } from './useIntersectionObserver';