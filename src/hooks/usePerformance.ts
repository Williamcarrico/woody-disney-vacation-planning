import { useEffect, useRef, useState, useCallback } from 'react'
import { performanceMonitor } from '@/lib/firebase/firebase-performance'

// Hook to measure component render performance
export const useRenderPerformance = (componentName: string) => {
  const renderCount = useRef(0)
  const renderTimes = useRef<number[]>([])
  const lastRenderTime = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    const renderTime = now - lastRenderTime.current
    
    renderCount.current++
    renderTimes.current.push(renderTime)
    
    // Keep only last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift()
    }

    // Log slow renders
    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`)
    }

    // Report to performance monitor
    performanceMonitor.recordOperation({
      operationName: `render_${componentName}`,
      duration: renderTime,
      success: true,
      metadata: {
        renderCount: renderCount.current
      }
    })

    lastRenderTime.current = now
  })

  return {
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.length > 0
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
      : 0,
    lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0
  }
}

// Hook to detect memory leaks
export const useMemoryLeakDetector = (componentName: string) => {
  const listeners = useRef(new Set<() => void>())
  const timers = useRef(new Set<NodeJS.Timeout>())
  const subscriptions = useRef(new Set<{ unsubscribe: () => void }>())

  // Track event listeners
  const addEventListener = useCallback((
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    target.addEventListener(event, handler, options)
    const cleanup = () => target.removeEventListener(event, handler, options)
    listeners.current.add(cleanup)
    return cleanup
  }, [])

  // Track timers
  const setTimer = useCallback((
    callback: () => void,
    delay: number,
    type: 'timeout' | 'interval' = 'timeout'
  ) => {
    const timer = type === 'timeout'
      ? setTimeout(callback, delay)
      : setInterval(callback, delay)
    
    timers.current.add(timer)
    
    return () => {
      if (type === 'timeout') {
        clearTimeout(timer)
      } else {
        clearInterval(timer)
      }
      timers.current.delete(timer)
    }
  }, [])

  // Track subscriptions
  const addSubscription = useCallback((subscription: { unsubscribe: () => void }) => {
    subscriptions.current.add(subscription)
    return () => {
      subscription.unsubscribe()
      subscriptions.current.delete(subscription)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const leaks = []

      if (listeners.current.size > 0) {
        leaks.push(`${listeners.current.size} event listeners`)
        listeners.current.forEach(cleanup => cleanup())
      }

      if (timers.current.size > 0) {
        leaks.push(`${timers.current.size} timers`)
        timers.current.forEach(timer => {
          clearTimeout(timer)
          clearInterval(timer)
        })
      }

      if (subscriptions.current.size > 0) {
        leaks.push(`${subscriptions.current.size} subscriptions`)
        subscriptions.current.forEach(sub => sub.unsubscribe())
      }

      if (leaks.length > 0) {
        console.warn(`Memory leaks detected in ${componentName}:`, leaks.join(', '))
      }
    }
  }, [componentName])

  return {
    addEventListener,
    setTimer,
    addSubscription,
    getLeakCount: () => 
      listeners.current.size + timers.current.size + subscriptions.current.size
  }
}

// Hook to monitor component visibility for lazy loading
export const useVisibilityOptimization = (
  options: IntersectionObserverInit = {}
) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting) {
          setHasBeenVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return {
    ref: elementRef,
    isVisible,
    hasBeenVisible,
    shouldRender: hasBeenVisible // Render once visible, keep rendered
  }
}

// Hook to debounce expensive operations
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Hook to throttle expensive operations
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRun = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= limit) {
        setThrottledValue(value)
        lastRun.current = Date.now()
      }
    }, limit - (Date.now() - lastRun.current))

    return () => clearTimeout(handler)
  }, [value, limit])

  return throttledValue
}

// Hook to measure user interactions
export const useInteractionTracking = (componentName: string) => {
  const interactions = useRef<{
    type: string
    timestamp: number
    metadata?: any
  }[]>([])

  const trackInteraction = useCallback((
    type: string,
    metadata?: any
  ) => {
    const interaction = {
      type,
      timestamp: Date.now(),
      metadata
    }

    interactions.current.push(interaction)

    // Report to analytics
    performanceMonitor.recordOperation({
      operationName: `interaction_${componentName}_${type}`,
      duration: 0,
      success: true,
      metadata
    })

    // Keep only last 50 interactions
    if (interactions.current.length > 50) {
      interactions.current = interactions.current.slice(-50)
    }
  }, [componentName])

  const getInteractionStats = useCallback(() => {
    const stats: Record<string, number> = {}
    
    interactions.current.forEach(interaction => {
      stats[interaction.type] = (stats[interaction.type] || 0) + 1
    })

    return {
      total: interactions.current.length,
      byType: stats,
      lastInteraction: interactions.current[interactions.current.length - 1]
    }
  }, [])

  return {
    trackInteraction,
    getInteractionStats
  }
}

// Hook for animation performance
export const useAnimationPerformance = () => {
  const frameCount = useRef(0)
  const startTime = useRef(Date.now())
  const fps = useRef(0)
  const rafId = useRef<number>()

  const measureFPS = useCallback(() => {
    frameCount.current++
    const elapsed = Date.now() - startTime.current

    if (elapsed >= 1000) {
      fps.current = Math.round((frameCount.current * 1000) / elapsed)
      frameCount.current = 0
      startTime.current = Date.now()

      // Warn if FPS drops below 30
      if (fps.current < 30) {
        console.warn(`Low FPS detected: ${fps.current}`)
      }
    }

    rafId.current = requestAnimationFrame(measureFPS)
  }, [])

  useEffect(() => {
    measureFPS()
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [measureFPS])

  return {
    fps: fps.current,
    isPerformant: fps.current >= 30
  }
}

// Hook to prefetch data
export const usePrefetch = () => {
  const prefetchedUrls = useRef(new Set<string>())

  const prefetch = useCallback((url: string, priority: 'high' | 'low' = 'low') => {
    if (prefetchedUrls.current.has(url)) return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    link.as = 'fetch'
    
    if (priority === 'high') {
      link.setAttribute('importance', 'high')
    }

    document.head.appendChild(link)
    prefetchedUrls.current.add(url)

    return () => {
      document.head.removeChild(link)
      prefetchedUrls.current.delete(url)
    }
  }, [])

  const preload = useCallback((url: string, as: string) => {
    if (prefetchedUrls.current.has(url)) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = as

    document.head.appendChild(link)
    prefetchedUrls.current.add(url)

    return () => {
      document.head.removeChild(link)
      prefetchedUrls.current.delete(url)
    }
  }, [])

  return { prefetch, preload }
}