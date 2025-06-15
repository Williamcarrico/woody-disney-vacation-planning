import { Firestore, enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence } from 'firebase/firestore'
import { Analytics, logEvent } from 'firebase/analytics'
import { Performance, trace as createTrace, Trace } from 'firebase/performance'
import { firestore, analytics, performance } from './firebase.config'

// Performance monitoring types
export interface OperationMetrics {
  operationName: string
  duration: number
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

export interface PerformanceReport {
  averageDuration: number
  totalOperations: number
  successRate: number
  errorRate: number
  p50Duration: number
  p95Duration: number
  p99Duration: number
}

// Connection pooling for Firestore operations
export class FirestoreConnectionPool {
  private static instance: FirestoreConnectionPool | null = null
  private activeConnections = 0
  private readonly maxConnections = 10
  private readonly connectionQueue: Array<() => void> = []
  private persistenceEnabled = false

  private constructor() {}

  static getInstance(): FirestoreConnectionPool {
    if (!this.instance) {
      this.instance = new FirestoreConnectionPool()
    }
    return this.instance
  }

  async enablePersistence(db: Firestore): Promise<void> {
    if (this.persistenceEnabled) return

    try {
      // Try multi-tab persistence first (better for multiple tabs)
      await enableMultiTabIndexedDbPersistence(db)
      this.persistenceEnabled = true
      console.log('Multi-tab offline persistence enabled')
    } catch (error: any) {
      if (error.code === 'failed-precondition') {
        // Multi-tab persistence failed, try single-tab
        try {
          await enableIndexedDbPersistence(db)
          this.persistenceEnabled = true
          console.log('Single-tab offline persistence enabled')
        } catch (fallbackError: any) {
          console.warn('Failed to enable offline persistence:', fallbackError.message)
        }
      } else if (error.code === 'unimplemented') {
        console.warn('Offline persistence not supported in this browser')
      }
    }
  }

  async acquireConnection(): Promise<() => void> {
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++
      return () => this.releaseConnection()
    }

    // Wait for a connection to be available
    return new Promise((resolve) => {
      this.connectionQueue.push(() => {
        this.activeConnections++
        resolve(() => this.releaseConnection())
      })
    })
  }

  private releaseConnection(): void {
    this.activeConnections--
    
    // Process waiting connections
    if (this.connectionQueue.length > 0) {
      const next = this.connectionQueue.shift()
      next?.()
    }
  }

  getActiveConnections(): number {
    return this.activeConnections
  }

  getQueueLength(): number {
    return this.connectionQueue.length
  }
}

// Performance monitoring service
export class PerformanceMonitor {
  private static instance: PerformanceMonitor | null = null
  private metrics: Map<string, OperationMetrics[]> = new Map()
  private traces: Map<string, Trace> = new Map()
  private readonly maxMetricsPerOperation = 1000

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }

  // Start a performance trace
  startTrace(operationName: string, customAttributes?: Record<string, string>): Trace | null {
    if (!performance) return null

    try {
      const trace = createTrace(performance, operationName)
      
      // Add custom attributes
      if (customAttributes) {
        Object.entries(customAttributes).forEach(([key, value]) => {
          trace.putAttribute(key, value)
        })
      }

      trace.start()
      this.traces.set(operationName, trace)
      return trace
    } catch (error) {
      console.warn('Failed to start performance trace:', error)
      return null
    }
  }

  // Stop a performance trace
  stopTrace(operationName: string, metrics?: Record<string, number>): void {
    const trace = this.traces.get(operationName)
    if (!trace) return

    try {
      // Add custom metrics
      if (metrics) {
        Object.entries(metrics).forEach(([key, value]) => {
          trace.putMetric(key, value)
        })
      }

      trace.stop()
      this.traces.delete(operationName)
    } catch (error) {
      console.warn('Failed to stop performance trace:', error)
    }
  }

  // Record operation metrics
  recordOperation(metrics: OperationMetrics): void {
    const operations = this.metrics.get(metrics.operationName) || []
    
    // Add new metric
    operations.push({
      ...metrics,
      timestamp: Date.now()
    } as OperationMetrics & { timestamp: number })

    // Limit stored metrics
    if (operations.length > this.maxMetricsPerOperation) {
      operations.shift()
    }

    this.metrics.set(metrics.operationName, operations)

    // Log to analytics if available
    if (analytics) {
      this.logToAnalytics(metrics)
    }
  }

  // Get performance report for an operation
  getReport(operationName: string): PerformanceReport | null {
    const operations = this.metrics.get(operationName)
    if (!operations || operations.length === 0) return null

    const durations = operations.map(op => op.duration).sort((a, b) => a - b)
    const successCount = operations.filter(op => op.success).length
    const totalCount = operations.length

    return {
      averageDuration: durations.reduce((a, b) => a + b, 0) / totalCount,
      totalOperations: totalCount,
      successRate: (successCount / totalCount) * 100,
      errorRate: ((totalCount - successCount) / totalCount) * 100,
      p50Duration: this.getPercentile(durations, 50),
      p95Duration: this.getPercentile(durations, 95),
      p99Duration: this.getPercentile(durations, 99)
    }
  }

  // Get all operation names
  getOperationNames(): string[] {
    return Array.from(this.metrics.keys())
  }

  // Clear metrics for an operation
  clearMetrics(operationName?: string): void {
    if (operationName) {
      this.metrics.delete(operationName)
    } else {
      this.metrics.clear()
    }
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
    return sortedArray[index] || 0
  }

  private logToAnalytics(metrics: OperationMetrics): void {
    try {
      logEvent(analytics!, 'firebase_operation', {
        operation_name: metrics.operationName,
        duration_ms: metrics.duration,
        success: metrics.success,
        error_type: metrics.error,
        ...metrics.metadata
      })
    } catch (error) {
      // Silently fail analytics logging
    }
  }
}

// Intelligent caching system
export class SmartCache<T = any> {
  private cache: Map<string, { data: T; timestamp: number; hits: number }> = new Map()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes
  private readonly maxCacheSize = 1000
  private readonly monitor = PerformanceMonitor.getInstance()

  constructor(
    private readonly cacheName: string,
    private readonly options?: {
      ttl?: number
      maxSize?: number
      onEvict?: (key: string, data: T) => void
    }
  ) {}

  async get(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number; force?: boolean }
  ): Promise<T> {
    const startTime = Date.now()
    const trace = this.monitor.startTrace(`cache_${this.cacheName}_get`, { key })

    try {
      // Check if force refresh is requested
      if (!options?.force) {
        const cached = this.cache.get(key)
        if (cached && this.isValid(cached.timestamp, options?.ttl)) {
          cached.hits++
          
          this.monitor.recordOperation({
            operationName: `cache_${this.cacheName}_hit`,
            duration: Date.now() - startTime,
            success: true,
            metadata: { key, hits: cached.hits }
          })

          trace?.putMetric('cache_hit', 1)
          trace?.stop()
          
          return cached.data
        }
      }

      // Cache miss - fetch data
      const data = await fetcher()
      
      // Store in cache
      this.set(key, data)

      this.monitor.recordOperation({
        operationName: `cache_${this.cacheName}_miss`,
        duration: Date.now() - startTime,
        success: true,
        metadata: { key }
      })

      trace?.putMetric('cache_miss', 1)
      trace?.stop()

      return data
    } catch (error) {
      this.monitor.recordOperation({
        operationName: `cache_${this.cacheName}_error`,
        duration: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: { key }
      })

      trace?.putMetric('cache_error', 1)
      trace?.stop()

      throw error
    }
  }

  set(key: string, data: T): void {
    // Evict old entries if cache is full
    if (this.cache.size >= (this.options?.maxSize || this.maxCacheSize)) {
      this.evictLRU()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    })
  }

  invalidate(key: string): void {
    const cached = this.cache.get(key)
    if (cached) {
      this.cache.delete(key)
      this.options?.onEvict?.(key, cached.data)
    }
  }

  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = []
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.invalidate(key))
  }

  clear(): void {
    if (this.options?.onEvict) {
      this.cache.forEach((value, key) => {
        this.options.onEvict!(key, value.data)
      })
    }
    this.cache.clear()
  }

  getStats(): {
    size: number
    hitRate: number
    totalHits: number
    entries: Array<{ key: string; hits: number; age: number }>
  } {
    let totalHits = 0
    const entries: Array<{ key: string; hits: number; age: number }> = []
    const now = Date.now()

    this.cache.forEach((value, key) => {
      totalHits += value.hits
      entries.push({
        key,
        hits: value.hits,
        age: now - value.timestamp
      })
    })

    const totalRequests = totalHits + this.cache.size
    const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0

    return {
      size: this.cache.size,
      hitRate,
      totalHits,
      entries: entries.sort((a, b) => b.hits - a.hits)
    }
  }

  private isValid(timestamp: number, ttl?: number): boolean {
    const maxAge = ttl || this.options?.ttl || this.defaultTTL
    return Date.now() - timestamp < maxAge
  }

  private evictLRU(): void {
    let lruKey: string | null = null
    let lruHits = Infinity
    let lruTimestamp = Infinity

    // Find least recently used entry
    this.cache.forEach((value, key) => {
      if (value.hits < lruHits || 
          (value.hits === lruHits && value.timestamp < lruTimestamp)) {
        lruKey = key
        lruHits = value.hits
        lruTimestamp = value.timestamp
      }
    })

    if (lruKey) {
      this.invalidate(lruKey)
    }
  }
}

// Batch operation manager
export class BatchOperationManager {
  private queues: Map<string, Array<{
    operation: () => Promise<any>
    resolve: (value: any) => void
    reject: (error: any) => void
  }>> = new Map()
  
  private flushTimers: Map<string, NodeJS.Timeout> = new Map()
  private readonly flushInterval = 100 // ms
  private readonly maxBatchSize = 500

  async addOperation<T>(
    queueName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Get or create queue
      const queue = this.queues.get(queueName) || []
      
      // Add operation to queue
      queue.push({ operation, resolve, reject })
      this.queues.set(queueName, queue)

      // Schedule flush
      this.scheduleFlush(queueName)

      // Flush immediately if batch is full
      if (queue.length >= this.maxBatchSize) {
        this.flush(queueName)
      }
    })
  }

  private scheduleFlush(queueName: string): void {
    // Clear existing timer
    const existingTimer = this.flushTimers.get(queueName)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.flush(queueName)
    }, this.flushInterval)

    this.flushTimers.set(queueName, timer)
  }

  private async flush(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName)
    if (!queue || queue.length === 0) return

    // Clear the queue
    this.queues.set(queueName, [])
    
    // Clear timer
    const timer = this.flushTimers.get(queueName)
    if (timer) {
      clearTimeout(timer)
      this.flushTimers.delete(queueName)
    }

    // Execute all operations in parallel
    const results = await Promise.allSettled(
      queue.map(item => item.operation())
    )

    // Resolve/reject promises
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        queue[index].resolve(result.value)
      } else {
        queue[index].reject(result.reason)
      }
    })
  }

  // Force flush all queues
  async flushAll(): Promise<void> {
    const queueNames = Array.from(this.queues.keys())
    await Promise.all(queueNames.map(name => this.flush(name)))
  }
}

// Export singleton instances
export const connectionPool = FirestoreConnectionPool.getInstance()
export const performanceMonitor = PerformanceMonitor.getInstance()
export const batchManager = new BatchOperationManager()

// Initialize persistence on startup
if (typeof window !== 'undefined' && firestore) {
  connectionPool.enablePersistence(firestore).catch(console.warn)
}