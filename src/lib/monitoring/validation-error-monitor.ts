/**
 * Validation Error Monitoring System
 * 
 * This module provides production-ready error monitoring for validation failures.
 * It tracks validation errors, provides analytics, and can integrate with external
 * monitoring services like Sentry, LogRocket, or custom logging endpoints.
 */

import { z } from 'zod'
import { ValidationError } from '@/lib/firebase/validated-firestore-service'

/**
 * Validation error metadata for tracking
 */
interface ValidationErrorMetadata {
  timestamp: number
  collection?: string
  documentId?: string
  operation?: 'get' | 'set' | 'update' | 'delete' | 'list' | 'subscribe'
  userId?: string
  errorPath?: string[]
  errorMessage?: string
  schemaName?: string
  rawData?: unknown
  environment: 'development' | 'staging' | 'production'
  userAgent?: string
  url?: string
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Configuration for the validation error monitor
 */
interface MonitorConfig {
  enabled: boolean
  environment: 'development' | 'staging' | 'production'
  samplingRate: number // 0-1, percentage of errors to track
  maxErrorsPerMinute: number
  enableConsoleLogging: boolean
  enableRemoteLogging: boolean
  remoteEndpoint?: string
  remoteApiKey?: string
  errorCallback?: (error: ValidationErrorMetadata) => void
}

/**
 * In-memory error store for analytics
 */
class ErrorStore {
  private errors: ValidationErrorMetadata[] = []
  private errorCounts = new Map<string, number>()
  private lastCleanup = Date.now()
  private readonly maxAge = 60 * 60 * 1000 // 1 hour

  add(error: ValidationErrorMetadata): void {
    this.errors.push(error)
    
    // Update counts
    const key = `${error.collection}:${error.operation}:${error.schemaName}`
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1)
    
    // Periodic cleanup
    if (Date.now() - this.lastCleanup > 5 * 60 * 1000) { // 5 minutes
      this.cleanup()
    }
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.maxAge
    this.errors = this.errors.filter(e => e.timestamp > cutoff)
    this.lastCleanup = Date.now()
  }

  getRecentErrors(minutes: number = 60): ValidationErrorMetadata[] {
    const cutoff = Date.now() - (minutes * 60 * 1000)
    return this.errors.filter(e => e.timestamp > cutoff)
  }

  getErrorCounts(): Map<string, number> {
    return new Map(this.errorCounts)
  }

  getErrorRate(minutes: number = 5): number {
    const recentErrors = this.getRecentErrors(minutes)
    return recentErrors.length / minutes
  }

  getMostCommonErrors(limit: number = 10): Array<{ key: string; count: number }> {
    return Array.from(this.errorCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([key, count]) => ({ key, count }))
  }
}

/**
 * Main validation error monitor class
 */
export class ValidationErrorMonitor {
  private static instance: ValidationErrorMonitor | null = null
  private config: MonitorConfig
  private errorStore = new ErrorStore()
  private rateLimiter = new Map<string, number>()

  private constructor(config: Partial<MonitorConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      environment: (process.env.NODE_ENV as any) || 'development',
      samplingRate: 1.0,
      maxErrorsPerMinute: 100,
      enableConsoleLogging: process.env.NODE_ENV !== 'production',
      enableRemoteLogging: process.env.NODE_ENV === 'production',
      ...config
    }
  }

  /**
   * Get or create the singleton instance
   */
  static getInstance(config?: Partial<MonitorConfig>): ValidationErrorMonitor {
    if (!ValidationErrorMonitor.instance) {
      ValidationErrorMonitor.instance = new ValidationErrorMonitor(config)
    }
    return ValidationErrorMonitor.instance
  }

  /**
   * Log a validation error
   */
  logError(
    error: z.ZodError | ValidationError | Error,
    metadata: Partial<ValidationErrorMetadata> = {}
  ): void {
    if (!this.config.enabled) return
    
    // Sample rate check
    if (Math.random() > this.config.samplingRate) return
    
    // Rate limiting
    const now = Date.now()
    const minute = Math.floor(now / 60000)
    const rateKey = `${minute}`
    const currentCount = this.rateLimiter.get(rateKey) || 0
    
    if (currentCount >= this.config.maxErrorsPerMinute) {
      return
    }
    
    this.rateLimiter.set(rateKey, currentCount + 1)
    
    // Clean up old rate limit entries
    for (const [key, ] of this.rateLimiter) {
      if (parseInt(key) < minute - 1) {
        this.rateLimiter.delete(key)
      }
    }
    
    // Build error metadata
    const errorMetadata: ValidationErrorMetadata = {
      timestamp: now,
      environment: this.config.environment,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...metadata
    }
    
    // Extract error details
    if (error instanceof z.ZodError) {
      errorMetadata.errorPath = error.errors[0]?.path.map(String)
      errorMetadata.errorMessage = error.errors[0]?.message
    } else if (error instanceof ValidationError) {
      errorMetadata.errorMessage = error.message
      errorMetadata.schemaName = error.schemaName
    } else {
      errorMetadata.errorMessage = error.message
    }
    
    // Store error
    this.errorStore.add(errorMetadata)
    
    // Log to console in development
    if (this.config.enableConsoleLogging) {
      console.error('[Validation Error]', errorMetadata)
    }
    
    // Send to remote logging service
    if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
      this.sendToRemote(errorMetadata)
    }
    
    // Call custom callback if provided
    if (this.config.errorCallback) {
      try {
        this.config.errorCallback(errorMetadata)
      } catch (e) {
        console.error('Error in validation error callback:', e)
      }
    }
  }

  /**
   * Send error to remote logging service
   */
  private async sendToRemote(error: ValidationErrorMetadata): Promise<void> {
    if (!this.config.remoteEndpoint) return
    
    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.remoteApiKey && {
            'Authorization': `Bearer ${this.config.remoteApiKey}`
          })
        },
        body: JSON.stringify({
          type: 'validation_error',
          ...error
        })
      })
    } catch (e) {
      // Silently fail to avoid infinite loops
      if (this.config.enableConsoleLogging) {
        console.error('Failed to send validation error to remote:', e)
      }
    }
  }

  /**
   * Get analytics about validation errors
   */
  getAnalytics() {
    return {
      recentErrors: this.errorStore.getRecentErrors(60),
      errorRate: {
        lastMinute: this.errorStore.getErrorRate(1),
        last5Minutes: this.errorStore.getErrorRate(5),
        lastHour: this.errorStore.getErrorRate(60)
      },
      mostCommonErrors: this.errorStore.getMostCommonErrors(),
      errorCounts: Object.fromEntries(this.errorStore.getErrorCounts()),
      summary: {
        total: this.errorStore.getRecentErrors(60).length,
        bySeverity: this.categorizeErrorsBySeverity(),
        byCollection: this.categorizeErrorsByCollection()
      }
    }
  }

  /**
   * Categorize errors by severity
   */
  private categorizeErrorsBySeverity() {
    const errors = this.errorStore.getRecentErrors(60)
    const severity = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0
    }
    
    errors.forEach(error => {
      // Determine severity based on operation and collection
      if (error.operation === 'set' || error.operation === 'update') {
        severity[ErrorSeverity.HIGH]++
      } else if (error.collection === 'users' || error.collection === 'auth') {
        severity[ErrorSeverity.CRITICAL]++
      } else if (error.operation === 'get' || error.operation === 'list') {
        severity[ErrorSeverity.MEDIUM]++
      } else {
        severity[ErrorSeverity.LOW]++
      }
    })
    
    return severity
  }

  /**
   * Categorize errors by collection
   */
  private categorizeErrorsByCollection() {
    const errors = this.errorStore.getRecentErrors(60)
    const collections: Record<string, number> = {}
    
    errors.forEach(error => {
      const collection = error.collection || 'unknown'
      collections[collection] = (collections[collection] || 0) + 1
    })
    
    return collections
  }

  /**
   * Export errors for analysis
   */
  exportErrors(format: 'json' | 'csv' = 'json'): string {
    const errors = this.errorStore.getRecentErrors(24 * 60) // Last 24 hours
    
    if (format === 'json') {
      return JSON.stringify(errors, null, 2)
    } else {
      // CSV format
      const headers = [
        'timestamp',
        'collection',
        'operation',
        'errorMessage',
        'userId',
        'environment'
      ]
      
      const rows = errors.map(error => [
        new Date(error.timestamp).toISOString(),
        error.collection || '',
        error.operation || '',
        error.errorMessage || '',
        error.userId || '',
        error.environment
      ])
      
      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
    }
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errorStore = new ErrorStore()
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Export singleton instance
export const validationMonitor = ValidationErrorMonitor.getInstance()

// Helper function to wrap validated service methods with monitoring
export function withValidationMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  metadata: Partial<ValidationErrorMetadata> = {}
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      if (error instanceof z.ZodError || error instanceof ValidationError) {
        validationMonitor.logError(error, metadata)
      }
      throw error
    }
  }) as T
} 