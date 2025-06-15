'use client'

import { useEffect, useRef } from 'react'

interface PerformanceData {
  metric: string
  value: number
  timestamp: number
  url?: string
}

interface PerformanceMonitorProps {
  enabled?: boolean
  debug?: boolean
}

export default function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'production',
  debug = process.env.NODE_ENV === 'development'
}: PerformanceMonitorProps) {
  const metricsRef = useRef<PerformanceData[]>([])
  const observerRef = useRef<PerformanceObserver | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Core Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        let metric: PerformanceData

        // Handle different entry types
        if (entry.entryType === 'largest-contentful-paint') {
          metric = {
            metric: 'LCP',
            value: entry.startTime,
            timestamp: Date.now(),
            url: window.location.pathname
          }
        } else if (entry.entryType === 'first-input') {
          metric = {
            metric: 'FID',
            value: (entry as PerformanceEventTiming).processingStart - entry.startTime,
            timestamp: Date.now(),
            url: window.location.pathname
          }
        } else if (entry.entryType === 'layout-shift') {
          // Only count unexpected layout shifts
          if (!(entry as any).hadRecentInput) {
            metric = {
              metric: 'CLS',
              value: (entry as any).value,
              timestamp: Date.now(),
              url: window.location.pathname
            }
          } else {
            continue
          }
        } else if (entry.entryType === 'navigation') {
          // Handle navigation timing
          const navEntry = entry as PerformanceNavigationTiming
          
          // Multiple metrics from navigation timing
          const metrics = [
            {
              metric: 'FCP',
              value: navEntry.responseStart - navEntry.requestStart,
              timestamp: Date.now(),
              url: window.location.pathname
            },
            {
              metric: 'TTI',
              value: navEntry.domInteractive - navEntry.navigationStart,
              timestamp: Date.now(),
              url: window.location.pathname
            },
            {
              metric: 'Load',
              value: navEntry.loadEventEnd - navEntry.loadEventStart,
              timestamp: Date.now(),
              url: window.location.pathname
            }
          ]

          metrics.forEach(m => {
            if (m.value > 0) {
              metricsRef.current.push(m)
              if (debug) console.log('Performance Metric:', m)
              if (enabled) sendMetricToAnalytics(m)
            }
          })
          continue
        } else {
          continue
        }

        // Store and send individual metrics
        metricsRef.current.push(metric)

        if (debug) {
          console.log('Performance Metric:', metric)
        }

        if (enabled) {
          sendMetricToAnalytics(metric)
        }
      }
    })

    observerRef.current = observer

    // Observe Core Web Vitals and navigation
    try {
      observer.observe({ 
        entryTypes: [
          'largest-contentful-paint', 
          'first-input', 
          'layout-shift',
          'navigation'
        ] 
      })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }

    // Monitor page load times with more detail
    if (typeof window !== 'undefined') {
      const handleLoad = () => {
        setTimeout(() => {
          try {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
            
            if (navigation) {
              const loadMetrics = [
                {
                  metric: 'TTFB',
                  value: navigation.responseStart - navigation.requestStart,
                  description: 'Time to First Byte'
                },
                {
                  metric: 'DOM_CONTENT_LOADED',
                  value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                  description: 'DOM Content Loaded'
                },
                {
                  metric: 'LOAD_COMPLETE',
                  value: navigation.loadEventEnd - navigation.loadEventStart,
                  description: 'Load Event Complete'
                },
                {
                  metric: 'DOM_INTERACTIVE',
                  value: navigation.domInteractive - navigation.navigationStart,
                  description: 'DOM Interactive'
                }
              ]

              loadMetrics.forEach(({ metric, value, description }) => {
                if (value > 0) {
                  const perfMetric: PerformanceData = { 
                    metric, 
                    value, 
                    timestamp: Date.now(),
                    url: window.location.pathname
                  }
                  
                  metricsRef.current.push(perfMetric)
                  
                  if (debug) {
                    console.log(`${description}:`, value, 'ms')
                  }
                  
                  if (enabled) {
                    sendMetricToAnalytics(perfMetric)
                  }
                }
              })
            }
          } catch (error) {
            console.warn('Failed to capture load metrics:', error)
          }
        }, 0)
      }

      if (document.readyState === 'complete') {
        handleLoad()
      } else {
        window.addEventListener('load', handleLoad, { once: true })
      }
    }

    // Monitor resource loading performance
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming
        
        // Focus on slow resources
        if (resource.duration > 1000) { // > 1 second
          const metric: PerformanceData = {
            metric: 'SLOW_RESOURCE',
            value: resource.duration,
            timestamp: Date.now(),
            url: resource.name
          }
          
          if (debug) {
            console.warn('Slow resource detected:', resource.name, resource.duration, 'ms')
          }
          
          if (enabled) {
            sendMetricToAnalytics(metric)
          }
        }
      }
    })

    try {
      resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('Resource observer not supported:', error)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      resourceObserver.disconnect()
    }
  }, [enabled, debug])

  // Monitor memory usage (if available)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const monitorMemory = () => {
      // @ts-ignore - memory API is experimental
      if (performance.memory) {
        // @ts-ignore
        const memory = performance.memory
        const metric: PerformanceData = {
          metric: 'MEMORY_USAGE',
          value: memory.usedJSHeapSize / memory.totalJSHeapSize,
          timestamp: Date.now(),
          url: window.location.pathname
        }

        if (debug && metric.value > 0.8) {
          console.warn('High memory usage detected:', (metric.value * 100).toFixed(1) + '%')
        }

        if (enabled) {
          sendMetricToAnalytics(metric)
        }
      }
    }

    // Monitor memory every 30 seconds
    const memoryInterval = setInterval(monitorMemory, 30000)
    
    return () => clearInterval(memoryInterval)
  }, [enabled, debug])

  return null // This component doesn't render anything
}

async function sendMetricToAnalytics(metric: PerformanceData) {
  try {
    // Send to Google Analytics 4 if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_name: metric.metric,
        metric_value: Math.round(metric.value),
        page_path: metric.url || window.location.pathname,
        custom_parameter_1: metric.timestamp
      })
    }

    // Send to custom analytics endpoint
    await fetch('/api/analytics/frontend-performance', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Timestamp': metric.timestamp.toString()
      },
      body: JSON.stringify({
        ...metric,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink
        } : null
      })
    })
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.warn('Failed to send performance metric:', error)
  }
}

// Export hook for components that want to measure their own performance
export function usePerformanceMetric(metricName: string) {
  const startTime = useRef<number>(0)

  const start = () => {
    startTime.current = performance.now()
  }

  const end = () => {
    if (startTime.current > 0) {
      const duration = performance.now() - startTime.current
      const metric: PerformanceData = {
        metric: `COMPONENT_${metricName.toUpperCase()}`,
        value: duration,
        timestamp: Date.now(),
        url: window.location.pathname
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`Component ${metricName} rendered in:`, duration, 'ms')
      }

      if (process.env.NODE_ENV === 'production') {
        sendMetricToAnalytics(metric)
      }

      startTime.current = 0
      return duration
    }
    return 0
  }

  return { start, end }
}