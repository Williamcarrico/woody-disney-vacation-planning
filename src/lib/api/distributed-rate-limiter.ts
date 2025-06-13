/**
 * Distributed rate limiting implementation using Redis
 * 
 * @module api/distributed-rate-limiter
 * @category API Utilities
 */

import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, ErrorCodes } from './response'
import Redis from 'ioredis'

/**
 * Rate limiter configuration options
 */
export interface RateLimiterConfig {
    /** Maximum number of requests allowed */
    limit: number
    /** Time window in milliseconds */
    windowMs: number
    /** Unique identifier for the rate limiter */
    keyPrefix?: string
    /** Skip rate limiting for certain conditions */
    skip?: (req: NextRequest) => boolean
    /** Custom key generator function */
    keyGenerator?: (req: NextRequest) => string
    /** Custom message for rate limit exceeded */
    message?: string
    /** Custom error code for rate limit exceeded */
    errorCode?: string
    /** Headers to include in response */
    standardHeaders?: boolean
    /** Legacy headers to include */
    legacyHeaders?: boolean
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
    /** Total number of hits */
    totalHits: number
    /** Time until reset (in milliseconds) */
    resetTime: number
    /** Remaining requests */
    remaining: number
    /** Whether the limit has been exceeded */
    exceeded: boolean
}

/**
 * Redis-based distributed rate limiter
 */
export class DistributedRateLimiter {
    private redis: Redis | null = null
    private config: Required<RateLimiterConfig>

    constructor(config: RateLimiterConfig) {
        this.config = {
            keyPrefix: 'rate_limit',
            skip: () => false,
            keyGenerator: this.defaultKeyGenerator,
            message: 'Too many requests, please try again later',
            errorCode: ErrorCodes.RATE_LIMIT,
            standardHeaders: true,
            legacyHeaders: false,
            ...config
        }

        // Initialize Redis connection if available
        this.initializeRedis()
    }

    /**
     * Initialize Redis connection
     */
    private initializeRedis(): void {
        try {
            const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING
            
            if (redisUrl) {
                this.redis = new Redis(redisUrl, {
                    maxRetriesPerRequest: 3,
                    retryDelayOnFailover: 100,
                    lazyConnect: true
                })

                this.redis.on('error', (error) => {
                    console.error('[DistributedRateLimiter] Redis connection error:', error)
                    // Fallback to in-memory rate limiting
                    this.redis = null
                })
            }
        } catch (error) {
            console.warn('[DistributedRateLimiter] Failed to initialize Redis, falling back to in-memory:', error)
            this.redis = null
        }
    }

    /**
     * Default key generator based on IP address
     */
    private defaultKeyGenerator = (req: NextRequest): string => {
        const ip = this.getClientIP(req)
        return `${this.config.keyPrefix}:${ip}`
    }

    /**
     * Extract client IP address from request
     */
    private getClientIP(req: NextRequest): string {
        const forwarded = req.headers.get('x-forwarded-for')
        const realIp = req.headers.get('x-real-ip')
        const remoteAddress = req.headers.get('x-vercel-forwarded-for')
        
        if (forwarded) {
            return forwarded.split(',')[0].trim()
        }
        
        return realIp || remoteAddress || 'unknown'
    }

    /**
     * Check rate limit using Redis (distributed)
     */
    private async checkRateLimitRedis(key: string): Promise<RateLimitStatus> {
        if (!this.redis) {
            throw new Error('Redis not available')
        }

        const windowStart = Date.now() - this.config.windowMs
        const now = Date.now()

        // Use Redis pipeline for atomic operations
        const pipeline = this.redis.pipeline()
        
        // Remove expired entries
        pipeline.zremrangebyscore(key, 0, windowStart)
        
        // Count current requests in window
        pipeline.zcard(key)
        
        // Add current request
        pipeline.zadd(key, now, `${now}-${Math.random()}`)
        
        // Set expiry on the key
        pipeline.expire(key, Math.ceil(this.config.windowMs / 1000))
        
        const results = await pipeline.exec()
        
        if (!results) {
            throw new Error('Redis pipeline failed')
        }

        // Extract count after removing expired entries
        const totalHits = (results[1][1] as number) + 1 // +1 for the request we just added
        const remaining = Math.max(0, this.config.limit - totalHits)
        const resetTime = windowStart + this.config.windowMs

        return {
            totalHits,
            resetTime,
            remaining,
            exceeded: totalHits > this.config.limit
        }
    }

    /**
     * In-memory rate limiting fallback
     */
    private inMemoryStore = new Map<string, { count: number; resetTime: number }>()

    private checkRateLimitInMemory(key: string): RateLimitStatus {
        const now = Date.now()
        const record = this.inMemoryStore.get(key)

        // Clean up expired entries periodically
        if (Math.random() < 0.01) { // 1% chance to cleanup
            this.cleanupInMemoryStore()
        }

        if (!record || now > record.resetTime) {
            // New window
            const newRecord = {
                count: 1,
                resetTime: now + this.config.windowMs
            }
            this.inMemoryStore.set(key, newRecord)
            
            return {
                totalHits: 1,
                resetTime: newRecord.resetTime,
                remaining: this.config.limit - 1,
                exceeded: false
            }
        }

        // Existing window
        record.count++
        const remaining = Math.max(0, this.config.limit - record.count)

        return {
            totalHits: record.count,
            resetTime: record.resetTime,
            remaining,
            exceeded: record.count > this.config.limit
        }
    }

    /**
     * Clean up expired in-memory entries
     */
    private cleanupInMemoryStore(): void {
        const now = Date.now()
        for (const [key, record] of this.inMemoryStore.entries()) {
            if (now > record.resetTime) {
                this.inMemoryStore.delete(key)
            }
        }
    }

    /**
     * Add rate limit headers to response
     */
    private addHeaders(response: NextResponse, status: RateLimitStatus): void {
        if (this.config.standardHeaders) {
            response.headers.set('RateLimit-Limit', this.config.limit.toString())
            response.headers.set('RateLimit-Remaining', status.remaining.toString())
            response.headers.set('RateLimit-Reset', Math.ceil(status.resetTime / 1000).toString())
        }

        if (this.config.legacyHeaders) {
            response.headers.set('X-RateLimit-Limit', this.config.limit.toString())
            response.headers.set('X-RateLimit-Remaining', status.remaining.toString())
            response.headers.set('X-RateLimit-Reset', Math.ceil(status.resetTime / 1000).toString())
        }
    }

    /**
     * Check if request should be rate limited
     */
    async check(req: NextRequest): Promise<NextResponse | null> {
        // Skip rate limiting if configured
        if (this.config.skip(req)) {
            return null
        }

        const key = this.config.keyGenerator(req)

        try {
            let status: RateLimitStatus

            if (this.redis) {
                status = await this.checkRateLimitRedis(key)
            } else {
                status = this.checkRateLimitInMemory(key)
            }

            if (status.exceeded) {
                const response = errorResponse(
                    this.config.message,
                    this.config.errorCode,
                    429,
                    {
                        retryAfter: Math.ceil((status.resetTime - Date.now()) / 1000)
                    }
                )

                this.addHeaders(response, status)
                response.headers.set('Retry-After', Math.ceil((status.resetTime - Date.now()) / 1000).toString())

                return response
            }

            // Request is allowed, but we still want to add headers to the eventual response
            return null

        } catch (error) {
            console.error('[DistributedRateLimiter] Error checking rate limit:', error)
            
            // In case of error, allow the request but log the issue
            // This prevents the rate limiter from breaking the API
            return null
        }
    }

    /**
     * Middleware function to apply rate limiting
     */
    middleware() {
        return async (req: NextRequest) => {
            const result = await this.check(req)
            if (result) {
                return result
            }
            // Continue to next middleware or route handler
            return NextResponse.next()
        }
    }
}

/**
 * Create a new distributed rate limiter instance
 */
export function createRateLimiter(config: RateLimiterConfig): DistributedRateLimiter {
    return new DistributedRateLimiter(config)
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimiters = {
    /** General API endpoints - 100 requests per minute */
    api: createRateLimiter({
        limit: 100,
        windowMs: 60 * 1000,
        keyPrefix: 'api_rate_limit'
    }),

    /** Authentication endpoints - 5 requests per minute */
    auth: createRateLimiter({
        limit: 5,
        windowMs: 60 * 1000,
        keyPrefix: 'auth_rate_limit',
        message: 'Too many authentication attempts, please try again later'
    }),

    /** Strict rate limiting for sensitive endpoints - 10 requests per minute */
    strict: createRateLimiter({
        limit: 10,
        windowMs: 60 * 1000,
        keyPrefix: 'strict_rate_limit',
        message: 'Rate limit exceeded for this endpoint'
    }),

    /** Generous rate limiting for public endpoints - 1000 requests per hour */
    generous: createRateLimiter({
        limit: 1000,
        windowMs: 60 * 60 * 1000,
        keyPrefix: 'generous_rate_limit'
    })
}

/**
 * Rate limiting middleware decorator
 */
export function withRateLimit(config: RateLimiterConfig) {
    const rateLimiter = createRateLimiter(config)
    
    return function <T extends any[]>(
        target: (...args: T) => Promise<NextResponse>,
        _context: ClassMethodDecoratorContext
    ) {
        return async function (this: any, ...args: T): Promise<NextResponse> {
            const req = args[0] as NextRequest
            
            const limitResult = await rateLimiter.check(req)
            if (limitResult) {
                return limitResult
            }
            
            return target.apply(this, args)
        }
    }
}