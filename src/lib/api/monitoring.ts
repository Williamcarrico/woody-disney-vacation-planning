/**
 * API Monitoring and Metrics Collection System
 * Provides comprehensive monitoring, performance tracking, and analytics for API endpoints
 * 
 * @module api/monitoring
 * @category API Utilities
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Interface for API metrics data
 */
export interface ApiMetrics {
    endpoint: string
    method: string
    statusCode: number
    responseTime: number
    timestamp: number
    userAgent?: string
    ip?: string
    errorType?: string
    errorMessage?: string
    requestSize?: number
    responseSize?: number
    cacheHit?: boolean
    userId?: string
    region?: string
}

/**
 * Interface for aggregated metrics
 */
export interface AggregatedMetrics {
    endpoint: string
    method: string
    totalRequests: number
    successRate: number
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    errorCount: number
    lastHour: MetricsSummary
    lastDay: MetricsSummary
    errors: ErrorSummary[]
}

/**
 * Interface for metrics summary
 */
export interface MetricsSummary {
    requests: number
    avgResponseTime: number
    successRate: number
    errorRate: number
}

/**
 * Interface for error summary
 */
export interface ErrorSummary {
    type: string
    count: number
    message: string
    lastOccurrence: number
}

/**
 * Interface for health check data
 */
export interface HealthCheckData {
    status: 'healthy' | 'degraded' | 'unhealthy'
    timestamp: number
    services: ServiceHealth[]
    system: SystemHealth
    uptime: number
}

/**
 * Interface for service health
 */
export interface ServiceHealth {
    name: string
    status: 'up' | 'down' | 'degraded'
    responseTime?: number
    lastCheck: number
    errorMessage?: string
}

/**
 * Interface for system health
 */
export interface SystemHealth {
    memory: {
        used: number
        total: number
        percentage: number
    }
    cpu: {
        percentage: number
    }
    disk: {
        used: number
        total: number
        percentage: number
    }
}

/**
 * In-memory storage for metrics (use Redis/Database in production)
 */
class MetricsStore {
    private metrics: ApiMetrics[] = []
    private healthData: HealthCheckData | null = null
    private readonly maxMetrics = 10000 // Keep last 10k metrics in memory

    /**
     * Record a new metric
     */
    record(metric: ApiMetrics): void {
        this.metrics.push(metric)
        
        // Keep only recent metrics to prevent memory issues
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics)
        }
    }

    /**
     * Get metrics for a specific endpoint
     */
    getMetrics(endpoint?: string, timeRange?: number): ApiMetrics[] {
        let filtered = this.metrics
        
        if (endpoint) {
            filtered = filtered.filter(m => m.endpoint === endpoint)
        }
        
        if (timeRange) {
            const cutoff = Date.now() - timeRange
            filtered = filtered.filter(m => m.timestamp >= cutoff)
        }
        
        return filtered
    }

    /**
     * Get aggregated metrics
     */
    getAggregatedMetrics(endpoint?: string): AggregatedMetrics[] {
        const metrics = endpoint ? this.getMetrics(endpoint) : this.metrics
        const grouped = this.groupMetricsByEndpoint(metrics)
        
        return Object.entries(grouped).map(([key, endpointMetrics]) => {
            const [endpointPath, method] = key.split('|')
            return this.calculateAggregatedMetrics(endpointPath, method, endpointMetrics)
        })
    }

    /**
     * Update health data
     */
    updateHealth(health: HealthCheckData): void {
        this.healthData = health
    }

    /**
     * Get current health data
     */
    getHealth(): HealthCheckData | null {
        return this.healthData
    }

    /**
     * Clear old metrics
     */
    cleanup(olderThan: number = 24 * 60 * 60 * 1000): void {
        const cutoff = Date.now() - olderThan
        this.metrics = this.metrics.filter(m => m.timestamp >= cutoff)
    }

    /**
     * Group metrics by endpoint and method
     */
    private groupMetricsByEndpoint(metrics: ApiMetrics[]): Record<string, ApiMetrics[]> {
        return metrics.reduce((acc, metric) => {
            const key = `${metric.endpoint}|${metric.method}`
            if (!acc[key]) {
                acc[key] = []
            }
            acc[key].push(metric)
            return acc
        }, {} as Record<string, ApiMetrics[]>)
    }

    /**
     * Calculate aggregated metrics for an endpoint
     */
    private calculateAggregatedMetrics(
        endpoint: string,
        method: string,
        metrics: ApiMetrics[]
    ): AggregatedMetrics {
        const responseTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b)
        const successCount = metrics.filter(m => m.statusCode >= 200 && m.statusCode < 400).length
        const errorCount = metrics.length - successCount
        
        const oneHourAgo = Date.now() - (60 * 60 * 1000)
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
        
        const lastHourMetrics = metrics.filter(m => m.timestamp >= oneHourAgo)
        const lastDayMetrics = metrics.filter(m => m.timestamp >= oneDayAgo)
        
        const errors = this.getErrorSummary(metrics.filter(m => m.errorType))
        
        return {
            endpoint,
            method,
            totalRequests: metrics.length,
            successRate: (successCount / metrics.length) * 100,
            averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
            p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)] || 0,
            errorCount,
            lastHour: this.calculateSummary(lastHourMetrics),
            lastDay: this.calculateSummary(lastDayMetrics),
            errors
        }
    }

    /**
     * Calculate summary for a set of metrics
     */
    private calculateSummary(metrics: ApiMetrics[]): MetricsSummary {
        if (metrics.length === 0) {
            return { requests: 0, avgResponseTime: 0, successRate: 0, errorRate: 0 }
        }
        
        const successCount = metrics.filter(m => m.statusCode >= 200 && m.statusCode < 400).length
        const avgResponseTime = metrics.reduce((a, b) => a + b.responseTime, 0) / metrics.length
        
        return {
            requests: metrics.length,
            avgResponseTime,
            successRate: (successCount / metrics.length) * 100,
            errorRate: ((metrics.length - successCount) / metrics.length) * 100
        }
    }

    /**
     * Get error summary
     */
    private getErrorSummary(errorMetrics: ApiMetrics[]): ErrorSummary[] {
        const errorGroups = errorMetrics.reduce((acc, metric) => {
            const key = metric.errorType || 'unknown'
            if (!acc[key]) {
                acc[key] = {
                    type: key,
                    count: 0,
                    message: metric.errorMessage || 'Unknown error',
                    lastOccurrence: 0
                }
            }
            acc[key].count++
            acc[key].lastOccurrence = Math.max(acc[key].lastOccurrence, metric.timestamp)
            return acc
        }, {} as Record<string, ErrorSummary>)
        
        return Object.values(errorGroups).sort((a, b) => b.count - a.count)
    }
}

// Global metrics store instance
const metricsStore = new MetricsStore()

/**
 * Monitoring middleware that tracks API performance
 */
export function withMonitoring(
    handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>,
    options: {
        trackResponseSize?: boolean
        trackRequestSize?: boolean
        trackUserAgent?: boolean
    } = {}
) {
    return async (request: NextRequest, context?: unknown) => {
        const startTime = Date.now()
        const endpoint = new URL(request.url).pathname
        
        let response: NextResponse
        let error: Error | null = null
        
        try {
            response = await handler(request, context)
        } catch (err) {
            error = err instanceof Error ? err : new Error(String(err))
            // Re-throw error to be handled by error middleware
            throw error
        } finally {
            // Record metrics even if there was an error
            const endTime = Date.now()
            const responseTime = endTime - startTime
            
            const metric: ApiMetrics = {
                endpoint,
                method: request.method,
                statusCode: error ? 500 : (response?.status || 200),
                responseTime,
                timestamp: startTime,
                userAgent: options.trackUserAgent ? request.headers.get('user-agent') || undefined : undefined,
                ip: getClientIP(request),
                errorType: error?.constructor.name,
                errorMessage: error?.message,
                requestSize: options.trackRequestSize ? await getRequestSize(request) : undefined,
                responseSize: options.trackResponseSize ? getResponseSize(response!) : undefined,
                cacheHit: response?.headers.get('x-cache') === 'HIT'
            }
            
            metricsStore.record(metric)
        }
        
        return response!
    }
}

/**
 * Performance monitoring decorator
 */
export function trackPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
        const startTime = performance.now()
        
        try {
            const result = await method.apply(this, args)
            const endTime = performance.now()
            
            console.log(`[PERF] ${target.constructor.name}.${propertyName}: ${(endTime - startTime).toFixed(2)}ms`)
            
            return result
        } catch (error) {
            const endTime = performance.now()
            
            console.error(`[PERF] ${target.constructor.name}.${propertyName}: ${(endTime - startTime).toFixed(2)}ms (ERROR)`, error)
            
            throw error
        }
    }
    
    return descriptor
}

/**
 * Health check utilities
 */
export class HealthChecker {
    private services: Map<string, ServiceHealth> = new Map()
    private systemStartTime = Date.now()
    
    /**
     * Register a service for health monitoring
     */
    registerService(name: string, checkFn: () => Promise<ServiceHealth>): void {
        setInterval(async () => {
            try {
                const health = await checkFn()
                this.services.set(name, health)
            } catch (error) {
                this.services.set(name, {
                    name,
                    status: 'down',
                    lastCheck: Date.now(),
                    errorMessage: error instanceof Error ? error.message : String(error)
                })
            }
        }, 30000) // Check every 30 seconds
    }
    
    /**
     * Get current health status
     */
    async getHealth(): Promise<HealthCheckData> {
        const services = Array.from(this.services.values())
        const systemHealth = await this.getSystemHealth()
        
        // Determine overall status
        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
        
        const downServices = services.filter(s => s.status === 'down')
        const degradedServices = services.filter(s => s.status === 'degraded')
        
        if (downServices.length > 0) {
            status = 'unhealthy'
        } else if (degradedServices.length > 0) {
            status = 'degraded'
        }
        
        const healthData: HealthCheckData = {
            status,
            timestamp: Date.now(),
            services,
            system: systemHealth,
            uptime: Date.now() - this.systemStartTime
        }
        
        metricsStore.updateHealth(healthData)
        return healthData
    }
    
    /**
     * Get system health metrics
     */
    private async getSystemHealth(): Promise<SystemHealth> {
        // Get memory usage
        const memoryUsage = process.memoryUsage()
        
        return {
            memory: {
                used: memoryUsage.heapUsed,
                total: memoryUsage.heapTotal,
                percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
            },
            cpu: {
                percentage: await this.getCpuUsage()
            },
            disk: {
                used: 0, // Would need filesystem access
                total: 0,
                percentage: 0
            }
        }
    }
    
    /**
     * Get CPU usage (simplified)
     */
    private async getCpuUsage(): Promise<number> {
        const startUsage = process.cpuUsage()
        
        // Wait 100ms
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const endUsage = process.cpuUsage(startUsage)
        const totalUsage = endUsage.user + endUsage.system
        
        // Convert to percentage (rough estimate)
        return (totalUsage / 100000) * 100
    }
}

/**
 * Metrics API utilities
 */
export class MetricsAPI {
    /**
     * Get metrics for dashboard
     */
    static getMetrics(endpoint?: string, timeRange?: number): ApiMetrics[] {
        return metricsStore.getMetrics(endpoint, timeRange)
    }
    
    /**
     * Get aggregated metrics
     */
    static getAggregatedMetrics(endpoint?: string): AggregatedMetrics[] {
        return metricsStore.getAggregatedMetrics(endpoint)
    }
    
    /**
     * Get health status
     */
    static getHealth(): HealthCheckData | null {
        return metricsStore.getHealth()
    }
    
    /**
     * Clean up old metrics
     */
    static cleanup(): void {
        metricsStore.cleanup()
    }
}

/**
 * Utility functions
 */
function getClientIP(request: NextRequest): string {
    const headers = [
        'x-forwarded-for',
        'x-real-ip',
        'cf-connecting-ip',
        'x-client-ip'
    ]
    
    for (const header of headers) {
        const value = request.headers.get(header)
        if (value) {
            return value.split(',')[0].trim()
        }
    }
    
    return 'unknown'
}

async function getRequestSize(request: NextRequest): Promise<number> {
    try {
        const contentLength = request.headers.get('content-length')
        if (contentLength) {
            return parseInt(contentLength, 10)
        }
        
        // If no content-length, try to read the body
        const clone = request.clone()
        const body = await clone.text()
        return new Blob([body]).size
    } catch {
        return 0
    }
}

function getResponseSize(response: NextResponse): number {
    const contentLength = response.headers.get('content-length')
    if (contentLength) {
        return parseInt(contentLength, 10)
    }
    
    // Estimate based on JSON response
    try {
        const body = JSON.stringify(response)
        return new Blob([body]).size
    } catch {
        return 0
    }
}

// Initialize health checker
export const healthChecker = new HealthChecker()

// Set up automatic cleanup
setInterval(() => {
    MetricsAPI.cleanup()
}, 60 * 60 * 1000) // Clean up every hour

/**
 * Export all monitoring utilities
 */
export {
    metricsStore,
    withMonitoring,
    trackPerformance,
    MetricsAPI,
    HealthChecker
}