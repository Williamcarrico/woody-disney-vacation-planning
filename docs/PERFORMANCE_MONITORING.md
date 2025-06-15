# Performance Monitoring Setup

## 📊 **Performance Monitoring Strategy**

This document outlines the comprehensive performance monitoring setup for the Disney vacation planning app following the architectural optimizations.

## 🎯 **Key Performance Indicators (KPIs)**

### 1. Frontend Performance Metrics

#### Core Web Vitals
- **Largest Contentful Paint (LCP)**: Target < 2.5s
- **First Input Delay (FID)**: Target < 100ms  
- **Cumulative Layout Shift (CLS)**: Target < 0.1
- **First Contentful Paint (FCP)**: Target < 1.8s
- **Time to Interactive (TTI)**: Target < 3.5s

#### Bundle Metrics
- **Initial Bundle Size**: Monitor reduction from optimization
- **Code Splitting Effectiveness**: Track chunk sizes
- **Tree Shaking Results**: Monitor unused code elimination

### 2. Backend Performance Metrics

#### API Response Times
- **Parks API**: Target < 200ms (with caching)
- **Live Data API**: Target < 500ms
- **Search API**: Target < 300ms
- **Authentication**: Target < 150ms

#### Database Performance
- **Firebase Query Time**: Target < 100ms
- **Cache Hit Rate**: Target > 80%
- **Service Fallback Time**: Target < 1s

## 🛠️ **Implementation**

### 1. Built-in Performance Utilities

```typescript
// /src/lib/utils/optimized-utils.ts - Already implemented
export const performanceUtils = {
  // Measure function execution time
  measure: async <T>(name: string, fn: () => T | Promise<T>): Promise<T> => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
    return result
  },

  // Create a performance observer
  createObserver: (entryTypes: string[], callback: (entries: PerformanceObserverEntryList) => void) => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return null
    
    const observer = new PerformanceObserver(callback)
    observer.observe({ entryTypes })
    return observer
  }
}
```

### 2. Service Layer Monitoring

```typescript
// /src/lib/services/base-service.ts - Enhancement
export abstract class BaseService<T extends { id: string }> {
  private metrics = {
    requests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    avgResponseTime: 0
  }

  async getAll(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
    const startTime = performance.now()
    this.metrics.requests++

    try {
      const cacheKey = this.getCacheKey('all', options)
      
      // Check cache first
      if (this.config.cache?.enabled) {
        const cached = this.getFromCache(cacheKey)
        if (cached) {
          this.metrics.cacheHits++
          this.logMetrics('cache_hit', performance.now() - startTime)
          return cached
        }
        this.metrics.cacheMisses++
      }

      const data = await this.fetchAll(options)
      const result = this.paginateResults(data, options)
      
      // Cache and log metrics
      if (this.config.cache?.enabled) {
        this.setCache(cacheKey, result)
      }
      
      const responseTime = performance.now() - startTime
      this.updateAvgResponseTime(responseTime)
      this.logMetrics('success', responseTime)
      
      return result
    } catch (error) {
      this.metrics.errors++
      this.logMetrics('error', performance.now() - startTime, error)
      throw error
    }
  }

  private logMetrics(type: string, responseTime: number, error?: any) {
    const metrics = {
      service: this.config.name,
      type,
      responseTime,
      cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses),
      totalRequests: this.metrics.requests,
      errorRate: this.metrics.errors / this.metrics.requests,
      avgResponseTime: this.metrics.avgResponseTime,
      timestamp: new Date().toISOString(),
      ...(error && { error: error.message })
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Service Metrics:', metrics)
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metrics)
    }
  }

  private async sendToAnalytics(metrics: any) {
    try {
      // Send to your analytics service (e.g., Google Analytics, DataDog, etc.)
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      })
    } catch (error) {
      console.error('Failed to send metrics:', error)
    }
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0,
      errorRate: this.metrics.errors / this.metrics.requests || 0
    }
  }
}
```

### 3. API Monitoring

```typescript
// /src/lib/api/performance-middleware.ts
export function withPerformanceMonitoring<T>(
  handler: (request: NextRequest) => Promise<T>
) {
  return async (request: NextRequest) => {
    const startTime = performance.now()
    const url = new URL(request.url)
    const endpoint = url.pathname

    try {
      const result = await handler(request)
      const responseTime = performance.now() - startTime

      // Log successful request
      await logApiMetrics({
        endpoint,
        method: request.method,
        responseTime,
        status: 'success',
        timestamp: new Date().toISOString()
      })

      return result
    } catch (error) {
      const responseTime = performance.now() - startTime

      // Log failed request
      await logApiMetrics({
        endpoint,
        method: request.method,
        responseTime,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })

      throw error
    }
  }
}

async function logApiMetrics(metrics: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('API Metrics:', metrics)
  }
  
  // Store in database or send to monitoring service
  // Example: Store in Firebase for analysis
  try {
    await fetch('/api/internal/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    })
  } catch (error) {
    console.error('Failed to log API metrics:', error)
  }
}
```

### 4. Frontend Performance Monitoring

```typescript
// /src/components/shared/PerformanceMonitor.tsx
'use client'

import { useEffect, useRef } from 'react'

interface PerformanceData {
  metric: string
  value: number
  timestamp: number
}

export default function PerformanceMonitor() {
  const metricsRef = useRef<PerformanceData[]>([])

  useEffect(() => {
    // Core Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric: PerformanceData = {
          metric: entry.name,
          value: entry.value || (entry as any).processingStart || 0,
          timestamp: Date.now()
        }

        metricsRef.current.push(metric)

        // Send to analytics
        if (process.env.NODE_ENV === 'production') {
          sendMetricToAnalytics(metric)
        } else {
          console.log('Performance Metric:', metric)
        }
      }
    })

    // Observe Core Web Vitals
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }

    // Monitor page load times
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          
          const loadMetrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstByte: navigation.responseStart - navigation.requestStart,
            timestamp: Date.now()
          }

          Object.entries(loadMetrics).forEach(([key, value]) => {
            if (typeof value === 'number' && value > 0) {
              const metric: PerformanceData = { metric: key, value, timestamp: Date.now() }
              metricsRef.current.push(metric)
              
              if (process.env.NODE_ENV === 'production') {
                sendMetricToAnalytics(metric)
              }
            }
          })
        }, 0)
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return null // This component doesn't render anything
}

function sendMetricToAnalytics(metric: PerformanceData) {
  // Send to Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', 'performance_metric', {
      metric_name: metric.metric,
      metric_value: metric.value,
      custom_parameter_1: metric.timestamp
    })
  }

  // Send to custom analytics endpoint
  fetch('/api/analytics/frontend-performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric)
  }).catch(error => console.error('Failed to send metric:', error))
}
```

### 5. Bundle Analysis Monitoring

```typescript
// /src/lib/monitoring/bundle-analysis.ts
export interface BundleMetrics {
  totalSize: number
  jsSize: number
  cssSize: number
  imageSize: number
  chunkSizes: Record<string, number>
  timestamp: number
}

export function analyzeBundlePerformance(): BundleMetrics {
  if (typeof window === 'undefined') {
    return {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      imageSize: 0,
      chunkSizes: {},
      timestamp: Date.now()
    }
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  
  let jsSize = 0
  let cssSize = 0
  let imageSize = 0
  const chunkSizes: Record<string, number> = {}

  resources.forEach(resource => {
    const size = resource.transferSize || 0
    
    if (resource.name.includes('.js')) {
      jsSize += size
      if (resource.name.includes('chunks/')) {
        const chunkName = resource.name.split('/').pop() || 'unknown'
        chunkSizes[chunkName] = size
      }
    } else if (resource.name.includes('.css')) {
      cssSize += size
    } else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
      imageSize += size
    }
  })

  return {
    totalSize: jsSize + cssSize + imageSize,
    jsSize,
    cssSize,
    imageSize,
    chunkSizes,
    timestamp: Date.now()
  }
}
```

## 📈 **Monitoring Dashboard Setup**

### 1. Performance Analytics API

```typescript
// /src/app/api/analytics/performance/route.ts
import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/api/error-handler'
import { successResponse } from '@/lib/api/response'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const metrics = await request.json()
  
  // Store metrics in database (Firebase, MongoDB, etc.)
  await storeMetrics(metrics)
  
  // Trigger alerts if thresholds are exceeded
  await checkThresholds(metrics)
  
  return successResponse({ status: 'recorded' })
})

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const timeframe = searchParams.get('timeframe') || '24h'
  const type = searchParams.get('type') || 'all'
  
  // Retrieve and aggregate metrics
  const metrics = await getMetrics(timeframe, type)
  
  return successResponse(metrics)
})

async function storeMetrics(metrics: any) {
  // Store in your preferred database
  // Example: Firebase Firestore
  await db.collection('performance_metrics').add({
    ...metrics,
    createdAt: new Date()
  })
}

async function checkThresholds(metrics: any) {
  const thresholds = {
    responseTime: 1000, // 1 second
    errorRate: 0.05,    // 5%
    cacheHitRate: 0.8   // 80%
  }

  if (metrics.responseTime > thresholds.responseTime) {
    await sendAlert('High response time', metrics)
  }
  
  if (metrics.errorRate > thresholds.errorRate) {
    await sendAlert('High error rate', metrics)
  }
  
  if (metrics.cacheHitRate < thresholds.cacheHitRate) {
    await sendAlert('Low cache hit rate', metrics)
  }
}
```

### 2. Real-time Performance Dashboard

```typescript
// /src/components/admin/PerformanceDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricSummary {
  avgResponseTime: number
  errorRate: number
  cacheHitRate: number
  totalRequests: number
  lastUpdated: string
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<MetricSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/analytics/performance?timeframe=1h')
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading performance metrics...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Avg Response Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics?.avgResponseTime.toFixed(0)}ms
          </div>
          <div className={`text-sm ${metrics?.avgResponseTime < 500 ? 'text-green-600' : 'text-red-600'}`}>
            Target: <500ms
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {((metrics?.errorRate || 0) * 100).toFixed(2)}%
          </div>
          <div className={`text-sm ${(metrics?.errorRate || 0) < 0.05 ? 'text-green-600' : 'text-red-600'}`}>
            Target: <5%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cache Hit Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {((metrics?.cacheHitRate || 0) * 100).toFixed(1)}%
          </div>
          <div className={`text-sm ${(metrics?.cacheHitRate || 0) > 0.8 ? 'text-green-600' : 'text-orange-600'}`}>
            Target: >80%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics?.totalRequests.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Last hour
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## ⚠️ **Alerting System**

### 1. Alert Configuration

```typescript
// /src/lib/monitoring/alerts.ts
export interface AlertRule {
  metric: string
  threshold: number
  operator: 'gt' | 'lt' | 'eq'
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
}

export const ALERT_RULES: AlertRule[] = [
  {
    metric: 'responseTime',
    threshold: 1000,
    operator: 'gt',
    severity: 'high',
    enabled: true
  },
  {
    metric: 'errorRate',
    threshold: 0.05,
    operator: 'gt',
    severity: 'critical',
    enabled: true
  },
  {
    metric: 'cacheHitRate',
    threshold: 0.7,
    operator: 'lt',
    severity: 'medium',
    enabled: true
  }
]

export async function sendAlert(message: string, metrics: any) {
  const alertData = {
    message,
    metrics,
    timestamp: new Date().toISOString(),
    severity: determineSeverity(metrics)
  }

  // Send to multiple channels
  await Promise.allSettled([
    sendSlackAlert(alertData),
    sendEmailAlert(alertData),
    logToDatabase(alertData)
  ])
}
```

## 🎯 **Performance Targets After Optimization**

### Frontend Targets
- **Bundle Size Reduction**: 15-25% smaller than pre-optimization
- **First Load Time**: <3 seconds on 3G
- **Cache Hit Rate**: >85% for repeated visits
- **Core Web Vitals**: All metrics in "Good" range

### Backend Targets  
- **API Response Time**: <200ms for cached responses
- **Service Response Time**: <500ms for database queries
- **Error Rate**: <1% for all endpoints
- **Cache Effectiveness**: >80% hit rate

### Infrastructure Targets
- **Memory Usage**: Stable with no memory leaks
- **CPU Usage**: <70% average load
- **Database Connections**: Efficient connection pooling
- **CDN Cache Hit Rate**: >90% for static assets

This monitoring setup will provide comprehensive visibility into the performance improvements from our architectural optimizations! 📊✨