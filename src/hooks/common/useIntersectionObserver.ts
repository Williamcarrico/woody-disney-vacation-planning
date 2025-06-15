import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
}

interface IntersectionResult {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Hook that uses IntersectionObserver to detect when an element is visible
 * Useful for lazy loading, infinite scroll, animations on scroll, etc.
 */
export function useIntersectionObserver<T extends Element>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, IntersectionResult] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
    initialIsIntersecting = false,
  } = options;

  const elementRef = useRef<T>(null);
  const frozen = useRef(false);

  const [result, setResult] = useState<IntersectionResult>({
    isIntersecting: initialIsIntersecting,
    entry: null,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element || frozen.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        
        setResult({
          isIntersecting,
          entry,
        });

        // Freeze the observer once the element is visible
        if (isIntersecting && freezeOnceVisible) {
          frozen.current = true;
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return [elementRef, result];
}

/**
 * Hook for observing multiple elements with a single IntersectionObserver
 * More efficient than using multiple observers
 */
export function useIntersectionObserverMultiple<T extends Element>(
  refs: RefObject<T>[],
  options: IntersectionObserverInit = {}
): Map<T, IntersectionObserverEntry> {
  const [entries, setEntries] = useState<Map<T, IntersectionObserverEntry>>(new Map());

  useEffect(() => {
    const elements = refs
      .map(ref => ref.current)
      .filter((el): el is T => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        setEntries((prev) => {
          const next = new Map(prev);
          
          observerEntries.forEach((entry) => {
            next.set(entry.target as T, entry);
          });
          
          return next;
        });
      },
      options
    );

    elements.forEach(element => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [refs, options.threshold, options.root, options.rootMargin]);

  return entries;
}

/**
 * Hook that returns true when element is in viewport
 * Simpler API for basic visibility detection
 */
export function useIsInViewport<T extends Element>(
  options?: UseIntersectionObserverOptions
): [RefObject<T>, boolean] {
  const [ref, { isIntersecting }] = useIntersectionObserver<T>(options);
  return [ref, isIntersecting];
}

/**
 * Hook for implementing lazy loading
 * Returns ref and whether the element should be loaded
 */
export function useLazyLoad<T extends Element>(
  options?: UseIntersectionObserverOptions
): [RefObject<T>, boolean] {
  const [ref, isVisible] = useIsInViewport<T>({
    ...options,
    freezeOnceVisible: true,
  });
  
  return [ref, isVisible];
}