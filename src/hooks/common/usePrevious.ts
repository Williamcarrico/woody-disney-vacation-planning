import { useRef, useEffect } from 'react';

/**
 * Hook that returns the previous value of a variable
 * Useful for comparing current and previous values in effects
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook that tracks multiple previous values
 * Returns an array of previous values up to the specified count
 */
export function usePreviousValues<T>(value: T, count: number = 1): T[] {
  const ref = useRef<T[]>([]);

  useEffect(() => {
    ref.current = [value, ...ref.current.slice(0, count - 1)];
  }, [value, count]);

  return ref.current;
}

/**
 * Hook that detects if a value has changed
 * Returns true only on the render where the value changed
 */
export function useValueChanged<T>(
  value: T,
  isEqual: (a: T, b: T) => boolean = (a, b) => a === b
): boolean {
  const previousValue = usePrevious(value);
  
  if (previousValue === undefined) {
    return false;
  }

  return !isEqual(previousValue, value);
}

/**
 * Hook that tracks the number of times a value has changed
 */
export function useChangeCount<T>(value: T): number {
  const countRef = useRef(0);
  const previousValue = usePrevious(value);

  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      countRef.current += 1;
    }
  }, [value, previousValue]);

  return countRef.current;
}