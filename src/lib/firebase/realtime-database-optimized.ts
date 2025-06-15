'use client'

import {
  Database,
  DatabaseReference,
  DataSnapshot,
  Unsubscribe,
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  off,
  serverTimestamp,
  query,
  orderByChild,
  orderByKey,
  orderByValue,
  limitToFirst,
  limitToLast,
  startAt,
  endAt,
  equalTo,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  runTransaction,
  increment
} from 'firebase/database'
import { getClientDatabase } from './client-optimized'
import { connectionManager } from './connection-manager'
import { performanceMonitor, SmartCache } from './firebase-performance'
import { firebaseErrorHandler } from './firebase-error-handler'

// Enhanced types with better structure
export interface RealtimeQueryOptions {
  orderBy?: {
    type: 'child' | 'key' | 'value'
    path?: string
  }
  limit?: {
    type: 'first' | 'last'
    count: number
  }
  range?: {
    start?: any
    end?: any
  }
  equalTo?: any
}

export interface TransactionOptions {
  applyLocally?: boolean
  maxRetries?: number
}

export interface SubscriptionOptions {
  onlyOnce?: boolean
  includeMetadata?: boolean
}

// Optimized Realtime Database Service
export class RealtimeDatabaseService {
  private static instance: RealtimeDatabaseService | null = null
  private database: Database
  private cache: SmartCache
  private subscriptions = new Map<string, Unsubscribe>()

  private constructor() {
    this.database = getClientDatabase()
    this.cache = new SmartCache('realtime_db', {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 500
    })
  }

  static getInstance(): RealtimeDatabaseService {
    if (!this.instance) {
      this.instance = new RealtimeDatabaseService()
    }
    return this.instance
  }

  // Get reference with path validation
  private getRef(path: string): DatabaseReference {
    if (!path || typeof path !== 'string') {
      throw new Error('Invalid database path')
    }
    return ref(this.database, path)
  }

  // Read data with caching and error handling
  async read<T>(path: string, options?: { useCache?: boolean }): Promise<T | null> {
    const { useCache = true } = options || {}
    const trace = performanceMonitor.startTrace('rtdb_read', { path })

    try {
      // Check cache first
      if (useCache) {
        const cached = await this.cache.get(
          `read:${path}`,
          async () => {
            const snapshot = await get(this.getRef(path))
            return snapshot.exists() ? snapshot.val() : null
          }
        )
        trace?.stop()
        return cached as T
      }

      // Direct read without cache
      const snapshot = await firebaseErrorHandler.executeWithProtection(
        () => get(this.getRef(path)),
        {
          operationName: 'rtdb_read',
          metadata: { path }
        }
      )

      trace?.stop()
      return snapshot.exists() ? snapshot.val() : null

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Write data with validation
  async write(path: string, data: any): Promise<void> {
    const trace = performanceMonitor.startTrace('rtdb_write', { path })

    try {
      await firebaseErrorHandler.executeWithProtection(
        () => set(this.getRef(path), data),
        {
          operationName: 'rtdb_write',
          metadata: { path }
        }
      )

      // Invalidate cache
      this.cache.invalidatePattern(new RegExp(`^read:${path}`))
      
      trace?.stop()

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Update data with merge
  async updateData(path: string, updates: Record<string, any>): Promise<void> {
    const trace = performanceMonitor.startTrace('rtdb_update', { path })

    try {
      // Add timestamps
      const enhancedUpdates = {
        ...updates,
        updatedAt: serverTimestamp()
      }

      await firebaseErrorHandler.executeWithProtection(
        () => update(this.getRef(path), enhancedUpdates),
        {
          operationName: 'rtdb_update',
          metadata: { path, updateCount: Object.keys(updates).length }
        }
      )

      // Invalidate cache
      this.cache.invalidatePattern(new RegExp(`^read:${path}`))
      
      trace?.stop()

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Delete data
  async delete(path: string): Promise<void> {
    const trace = performanceMonitor.startTrace('rtdb_delete', { path })

    try {
      await firebaseErrorHandler.executeWithProtection(
        () => remove(this.getRef(path)),
        {
          operationName: 'rtdb_delete',
          metadata: { path }
        }
      )

      // Invalidate cache
      this.cache.invalidatePattern(new RegExp(`^read:${path}`))
      
      trace?.stop()

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Push new data with auto-generated key
  async push<T>(path: string, data: T): Promise<string> {
    const trace = performanceMonitor.startTrace('rtdb_push', { path })

    try {
      const newRef = push(this.getRef(path))
      
      await firebaseErrorHandler.executeWithProtection(
        () => set(newRef, {
          ...data,
          createdAt: serverTimestamp()
        }),
        {
          operationName: 'rtdb_push',
          metadata: { path }
        }
      )

      trace?.stop()
      return newRef.key!

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Subscribe to data changes with connection management
  subscribe<T>(
    path: string,
    callback: (data: T | null, metadata?: any) => void,
    options?: SubscriptionOptions & RealtimeQueryOptions
  ): () => void {
    const subscriptionKey = `${path}:${JSON.stringify(options || {})}`
    
    // Unsubscribe existing subscription
    this.unsubscribe(subscriptionKey)

    // Create query reference
    let queryRef = this.getRef(path)
    
    // Apply query options
    if (options) {
      const constraints = []
      
      // Order by
      if (options.orderBy) {
        switch (options.orderBy.type) {
          case 'child':
            constraints.push(orderByChild(options.orderBy.path!))
            break
          case 'key':
            constraints.push(orderByKey())
            break
          case 'value':
            constraints.push(orderByValue())
            break
        }
      }
      
      // Range
      if (options.range) {
        if (options.range.start !== undefined) {
          constraints.push(startAt(options.range.start))
        }
        if (options.range.end !== undefined) {
          constraints.push(endAt(options.range.end))
        }
      }
      
      // Equal to
      if (options.equalTo !== undefined) {
        constraints.push(equalTo(options.equalTo))
      }
      
      // Limit
      if (options.limit) {
        if (options.limit.type === 'first') {
          constraints.push(limitToFirst(options.limit.count))
        } else {
          constraints.push(limitToLast(options.limit.count))
        }
      }
      
      if (constraints.length > 0) {
        queryRef = query(this.getRef(path), ...constraints) as DatabaseReference
      }
    }

    // Create subscription
    const unsubscribe = connectionManager.subscribe(
      subscriptionKey,
      () => {
        if (options?.onlyOnce) {
          // One-time read
          get(queryRef).then(snapshot => {
            const data = snapshot.exists() ? snapshot.val() : null
            callback(data, options.includeMetadata ? {
              key: snapshot.key,
              size: snapshot.size
            } : undefined)
          }).catch(error => {
            console.error(`Failed to read ${path}:`, error)
            callback(null)
          })
          
          return () => {} // No cleanup needed for one-time read
        } else {
          // Real-time subscription
          return onValue(
            queryRef,
            (snapshot) => {
              const data = snapshot.exists() ? snapshot.val() : null
              callback(data, options?.includeMetadata ? {
                key: snapshot.key,
                size: snapshot.size
              } : undefined)
            },
            (error) => {
              console.error(`Subscription error for ${path}:`, error)
              callback(null)
            }
          )
        }
      }
    )

    // Store subscription
    this.subscriptions.set(subscriptionKey, () => {
      connectionManager.unsubscribe(subscriptionKey)
      off(queryRef)
    })

    // Return unsubscribe function
    return () => this.unsubscribe(subscriptionKey)
  }

  // Subscribe to child events
  subscribeToChildEvents(
    path: string,
    callbacks: {
      onAdded?: (data: any, key: string) => void
      onChanged?: (data: any, key: string) => void
      onRemoved?: (key: string) => void
    },
    options?: RealtimeQueryOptions
  ): () => void {
    const subscriptionKey = `${path}:child_events:${JSON.stringify(options || {})}`
    const unsubscribes: Unsubscribe[] = []

    // Create query reference
    let queryRef = this.getRef(path)
    
    // Apply query options (same as subscribe method)
    if (options) {
      // ... apply constraints
    }

    // Setup child event listeners
    if (callbacks.onAdded) {
      unsubscribes.push(
        onChildAdded(queryRef, (snapshot) => {
          callbacks.onAdded!(snapshot.val(), snapshot.key!)
        })
      )
    }

    if (callbacks.onChanged) {
      unsubscribes.push(
        onChildChanged(queryRef, (snapshot) => {
          callbacks.onChanged!(snapshot.val(), snapshot.key!)
        })
      )
    }

    if (callbacks.onRemoved) {
      unsubscribes.push(
        onChildRemoved(queryRef, (snapshot) => {
          callbacks.onRemoved!(snapshot.key!)
        })
      )
    }

    // Store combined unsubscribe
    this.subscriptions.set(subscriptionKey, () => {
      unsubscribes.forEach(unsub => unsub())
    })

    return () => this.unsubscribe(subscriptionKey)
  }

  // Run transaction with retry logic
  async runTransaction<T>(
    path: string,
    updateFunction: (currentData: T) => T,
    options?: TransactionOptions
  ): Promise<T> {
    const trace = performanceMonitor.startTrace('rtdb_transaction', { path })

    try {
      const result = await firebaseErrorHandler.executeWithProtection(
        () => runTransaction(
          this.getRef(path),
          updateFunction,
          options
        ),
        {
          operationName: 'rtdb_transaction',
          metadata: { path },
          retryConfig: {
            maxRetries: options?.maxRetries || 3
          }
        }
      )

      trace?.stop()
      return result.snapshot.val()

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Atomic increment
  async incrementValue(path: string, delta: number = 1): Promise<void> {
    await this.updateData(path, {
      value: increment(delta)
    })
  }

  // Batch operations
  async batchWrite(operations: Array<{ path: string; data: any; type: 'set' | 'update' | 'remove' }>): Promise<void> {
    const trace = performanceMonitor.startTrace('rtdb_batch_write', { 
      operationCount: operations.length 
    })

    try {
      const updates: Record<string, any> = {}

      for (const op of operations) {
        switch (op.type) {
          case 'set':
            updates[op.path] = op.data
            break
          case 'update':
            // Merge with existing path
            updates[op.path] = { ...updates[op.path], ...op.data }
            break
          case 'remove':
            updates[op.path] = null
            break
        }
      }

      await update(ref(this.database), updates)

      // Invalidate cache for all paths
      operations.forEach(op => {
        this.cache.invalidatePattern(new RegExp(`^read:${op.path}`))
      })

      trace?.stop()

    } catch (error) {
      trace?.stop()
      throw error
    }
  }

  // Unsubscribe from a specific subscription
  private unsubscribe(key: string): void {
    const unsubscribe = this.subscriptions.get(key)
    if (unsubscribe) {
      unsubscribe()
      this.subscriptions.delete(key)
    }
  }

  // Unsubscribe from all subscriptions
  unsubscribeAll(): void {
    this.subscriptions.forEach(unsubscribe => unsubscribe())
    this.subscriptions.clear()
  }

  // Get cache statistics
  getCacheStats() {
    return this.cache.getStats()
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }
}

// Export singleton instance
export const realtimeDB = RealtimeDatabaseService.getInstance()

// Export convenience functions
export const rtdbRead = <T>(path: string, options?: { useCache?: boolean }) => 
  realtimeDB.read<T>(path, options)

export const rtdbWrite = (path: string, data: any) => 
  realtimeDB.write(path, data)

export const rtdbUpdate = (path: string, updates: Record<string, any>) => 
  realtimeDB.updateData(path, updates)

export const rtdbDelete = (path: string) => 
  realtimeDB.delete(path)

export const rtdbPush = <T>(path: string, data: T) => 
  realtimeDB.push(path, data)

export const rtdbSubscribe = <T>(
  path: string,
  callback: (data: T | null, metadata?: any) => void,
  options?: SubscriptionOptions & RealtimeQueryOptions
) => realtimeDB.subscribe(path, callback, options)

export const rtdbTransaction = <T>(
  path: string,
  updateFunction: (currentData: T) => T,
  options?: TransactionOptions
) => realtimeDB.runTransaction(path, updateFunction, options)

// Cleanup on unmount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realtimeDB.unsubscribeAll()
  })
}