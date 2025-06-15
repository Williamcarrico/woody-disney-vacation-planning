/**
 * Optimized Middleware Chain
 * High-performance middleware system with minimal overhead and intelligent caching
 * 
 * @module api/optimized-middleware
 * @category API Performance
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Interface for middleware function
 */
export type MiddlewareFunction = (
    request: NextRequest,
    context: MiddlewareContext
) => Promise<NextResponse | null> | NextResponse | null

/**
 * Interface for middleware context
 */
export interface MiddlewareContext {
    startTime: number
    requestId: string
    path: string
    method: string
    skipCache?: boolean
    metadata: Record<string, unknown>
}

/**
 * Interface for middleware configuration
 */
export interface MiddlewareConfig {
    rateLimiting?: {
        enabled: boolean
        tier: string
        skipPaths?: string[]
    }
    security?: {
        enabled: boolean
        skipCSP?: boolean
        skipCORS?: boolean
    }
    authentication?: {
        enabled: boolean
        required: boolean
        skipPaths?: string[]
    }
    monitoring?: {
        enabled: boolean
        trackResponseSize?: boolean
        trackRequestSize?: boolean
    }
    caching?: {
        enabled: boolean
        defaultTTL: number
        skipPaths?: string[]
    }
    validation?: {
        enabled: boolean
        schemas: Record<string, z.ZodSchema>
    }
}

/**
 * High-performance middleware chain with intelligent optimizations
 */
export class OptimizedMiddlewareChain {
    private middlewares: Array<{
        name: string
        fn: MiddlewareFunction
        enabled: boolean
        priority: number
        conditions?: (request: NextRequest, context: MiddlewareContext) => boolean
    }> = []
    
    private config: MiddlewareConfig
    private pathCache = new Map<string, boolean>()
    private configCache = new Map<string, MiddlewareConfig>()
    
    constructor(config: MiddlewareConfig) {
        this.config = config
    }
    
    /**
     * Add middleware to the chain
     */
    use(
        name: string,
        middleware: MiddlewareFunction,
        options: {
            priority?: number
            enabled?: boolean
            conditions?: (request: NextRequest, context: MiddlewareContext) => boolean
        } = {}
    ): this {
        this.middlewares.push({
            name,
            fn: middleware,
            enabled: options.enabled ?? true,
            priority: options.priority ?? 100,
            conditions: options.conditions
        })
        
        // Sort by priority (lower number = higher priority)
        this.middlewares.sort((a, b) => a.priority - b.priority)
        
        return this
    }
    
    /**
     * Execute the middleware chain
     */
    async execute(request: NextRequest): Promise<NextResponse | null> {
        const startTime = performance.now()
        const requestId = crypto.randomUUID()
        const path = new URL(request.url).pathname
        const method = request.method
        
        const context: MiddlewareContext = {
            startTime,
            requestId,
            path,
            method,
            metadata: {}
        }
        
        // Fast path check for static files and known exempt paths
        if (this.shouldSkipMiddleware(path)) {
            return null
        }
        
        // Execute middlewares in priority order
        for (const middleware of this.middlewares) {
            if (!middleware.enabled) continue
            
            // Check conditions if specified
            if (middleware.conditions && !middleware.conditions(request, context)) {
                continue
            }
            
            try {
                const result = await middleware.fn(request, context)
                if (result) {
                    // Middleware returned a response, stop processing
                    this.recordMetrics(middleware.name, startTime, true)
                    return result
                }
            } catch (error) {
                console.error(`Middleware ${middleware.name} failed:`, error)
                // Continue with other middleware unless it's critical
                if (middleware.priority < 50) {
                    throw error
                }
            }
        }
        
        this.recordMetrics('chain', startTime, false)
        return null
    }
    
    /**
     * Fast path optimization for paths that should skip middleware
     */
    private shouldSkipMiddleware(path: string): boolean {
        // Check cache first
        if (this.pathCache.has(path)) {
            return this.pathCache.get(path)!
        }
        
        const skip = (
            path.startsWith('/_next/static/') ||
            path.startsWith('/_next/image/') ||
            path === '/favicon.ico' ||
            path.endsWith('.ico') ||
            path.endsWith('.png') ||
            path.endsWith('.jpg') ||
            path.endsWith('.jpeg') ||
            path.endsWith('.gif') ||
            path.endsWith('.svg') ||
            path.endsWith('.css') ||
            path.endsWith('.js') ||
            path.endsWith('.woff') ||
            path.endsWith('.woff2') ||
            path.endsWith('.ttf')
        )
        
        // Cache the result
        this.pathCache.set(path, skip)
        
        // Prevent cache from growing too large
        if (this.pathCache.size > 1000) {
            const firstKey = this.pathCache.keys().next().value
            this.pathCache.delete(firstKey)
        }
        
        return skip
    }
    
    /**
     * Record middleware performance metrics
     */
    private recordMetrics(name: string, startTime: number, intercepted: boolean): void {
        const duration = performance.now() - startTime
        
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[MIDDLEWARE] ${name}: ${duration.toFixed(2)}ms ${intercepted ? '(intercepted)' : ''}`)
        }
    }
    
    /**
     * Update configuration at runtime
     */
    updateConfig(newConfig: Partial<MiddlewareConfig>): void {
        this.config = { ...this.config, ...newConfig }
        this.configCache.clear()
    }
    
    /**
     * Enable/disable specific middleware
     */
    toggleMiddleware(name: string, enabled: boolean): void {
        const middleware = this.middlewares.find(m => m.name === name)
        if (middleware) {
            middleware.enabled = enabled
        }
    }
    
    /**
     * Get middleware performance stats
     */
    getStats(): Record<string, { calls: number; totalTime: number; avgTime: number }> {
        // This would be implemented with actual metrics collection
        return {}
    }
}

/**
 * Optimized rate limiting middleware with intelligent caching
 */
export function createOptimizedRateLimiter(config: {
    tier: string
    limit: number
    windowMs: number
    skipPaths?: string[]
}): MiddlewareFunction {
    const cache = new Map<string, { count: number; resetTime: number }>()
    const pathSkipSet = new Set(config.skipPaths || [])
    
    return async (request: NextRequest, context: MiddlewareContext) => {
        // Fast skip for exempt paths
        if (pathSkipSet.has(context.path)) {
            return null
        }
        
        const ip = getClientIP(request)
        const key = `${config.tier}:${ip}`
        const now = Date.now()
        
        // Clean up expired entries efficiently
        if (cache.size > 10000) {
            for (const [k, v] of cache.entries()) {
                if (v.resetTime < now) {
                    cache.delete(k)
                }
                if (cache.size <= 5000) break // Keep reasonable size
            }
        }
        
        const entry = cache.get(key)
        
        if (!entry || entry.resetTime < now) {
            cache.set(key, { count: 1, resetTime: now + config.windowMs })
            return null
        }
        
        entry.count++
        
        if (entry.count > config.limit) {
            const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
            
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'Rate limit exceeded',
                        code: 'RATE_LIMIT_EXCEEDED',
                        details: { retryAfter }
                    }
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': retryAfter.toString(),
                        'X-RateLimit-Limit': config.limit.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': entry.resetTime.toString()
                    }
                }
            )
        }
        
        return null
    }
}

/**
 * Optimized security headers middleware
 */
export function createOptimizedSecurityHeaders(config: {
    skipCSP?: boolean
    skipCORS?: boolean
    nonceDuration?: number
}): MiddlewareFunction {
    // Pre-generate nonces and rotate them periodically
    let currentNonce = Buffer.from(crypto.randomUUID()).toString('base64')
    let nonceTimestamp = Date.now()
    const nonceDuration = config.nonceDuration || 60000 // 1 minute
    
    const staticSecurityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        'X-DNS-Prefetch-Control': 'off'
    }
    
    return async (request: NextRequest, context: MiddlewareContext) => {
        const response = NextResponse.next()
        
        // Rotate nonce if needed
        const now = Date.now()
        if (now - nonceTimestamp > nonceDuration) {
            currentNonce = Buffer.from(crypto.randomUUID()).toString('base64')
            nonceTimestamp = now
        }
        
        // Apply static headers efficiently
        Object.entries(staticSecurityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value)
        })
        
        // CSP header with current nonce
        if (!config.skipCSP) {
            const csp = [
                "default-src 'self'",
                `script-src 'self' 'nonce-${currentNonce}' https://maps.googleapis.com https://www.googletagmanager.com https://cdn.jsdelivr.net https://firebasestorage.googleapis.com https://www.gstatic.com`,
                `style-src 'self' 'nonce-${currentNonce}' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com`,
                `img-src 'self' data: blob: https: *.google.com *.googleapis.com *.gstatic.com *.ggpht.com *.googleusercontent.com`,
                `font-src 'self' https://fonts.gstatic.com`,
                `frame-src 'self' *.google.com`,
                `connect-src 'self' https: wss: https://maps.googleapis.com https://*.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com https://firebasestorage.googleapis.com https://api.tomorrow.io`,
                `worker-src 'self' blob:`,
                `form-action 'self'`,
                `frame-ancestors 'self'`,
                `base-uri 'self'`,
                `media-src 'self' data: blob:`,
                `object-src 'none'`,
                `manifest-src 'self'`,
                `upgrade-insecure-requests`
            ].join('; ')
            
            response.headers.set('Content-Security-Policy', csp)
            response.headers.set('X-Nonce', currentNonce)
        }
        
        // CORS headers for API routes
        if (!config.skipCORS && context.path.startsWith('/api/')) {
            response.headers.set('Access-Control-Allow-Origin', '*')
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            response.headers.set('Access-Control-Max-Age', '86400')
        }
        
        return null // Let request continue
    }
}

/**
 * Optimized monitoring middleware with sampling
 */
export function createOptimizedMonitoring(config: {
    sampleRate?: number
    trackResponseSize?: boolean
    trackRequestSize?: boolean
}): MiddlewareFunction {
    const sampleRate = config.sampleRate || 1.0
    
    return async (request: NextRequest, context: MiddlewareContext) => {
        // Sample requests to reduce overhead
        if (Math.random() > sampleRate) {
            return null
        }
        
        // Store metrics in context for later collection
        context.metadata.monitoringEnabled = true
        context.metadata.trackResponseSize = config.trackResponseSize
        context.metadata.trackRequestSize = config.trackRequestSize
        
        return null
    }
}

/**
 * Utility function to get client IP with caching
 */
const ipCache = new Map<string, string>()

function getClientIP(request: NextRequest): string {
    const cacheKey = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    if (ipCache.has(cacheKey)) {
        return ipCache.get(cacheKey)!
    }
    
    const headers = [
        'x-forwarded-for',
        'x-real-ip',
        'cf-connecting-ip',
        'x-client-ip'
    ]
    
    for (const header of headers) {
        const value = request.headers.get(header)
        if (value) {
            const ip = value.split(',')[0].trim()
            ipCache.set(cacheKey, ip)
            
            // Prevent cache from growing too large
            if (ipCache.size > 1000) {
                const firstKey = ipCache.keys().next().value
                ipCache.delete(firstKey)
            }
            
            return ip
        }
    }
    
    return 'unknown'
}

/**
 * Pre-configured optimized middleware chain
 */
export function createOptimizedApiMiddleware(config: MiddlewareConfig): OptimizedMiddlewareChain {
    const chain = new OptimizedMiddlewareChain(config)
    
    // Add security middleware (highest priority)
    if (config.security?.enabled) {
        chain.use(
            'security',
            createOptimizedSecurityHeaders({
                skipCSP: config.security.skipCSP,
                skipCORS: config.security.skipCORS
            }),
            { priority: 10 }
        )
    }
    
    // Add rate limiting (high priority)
    if (config.rateLimiting?.enabled) {
        chain.use(
            'rateLimiting',
            createOptimizedRateLimiter({
                tier: config.rateLimiting.tier,
                limit: 100, // Default limit
                windowMs: 60000, // 1 minute
                skipPaths: config.rateLimiting.skipPaths
            }),
            { priority: 20 }
        )
    }
    
    // Add monitoring (low priority)
    if (config.monitoring?.enabled) {
        chain.use(
            'monitoring',
            createOptimizedMonitoring({
                sampleRate: 0.1, // Sample 10% of requests
                trackResponseSize: config.monitoring.trackResponseSize,
                trackRequestSize: config.monitoring.trackRequestSize
            }),
            { priority: 90 }
        )
    }
    
    return chain
}

/**
 * Export optimized middleware utilities
 */
export {
    OptimizedMiddlewareChain,
    createOptimizedRateLimiter,
    createOptimizedSecurityHeaders,
    createOptimizedMonitoring,
    createOptimizedApiMiddleware
}