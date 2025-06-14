/**
 * Rate limiting middleware for API routes
 * 
 * @module api/rate-limit-middleware
 * @category API Security
 */

import { NextRequest } from 'next/server'
import { rateLimiter } from '@/middleware/rateLimiter'
import { createRateLimitError, withErrorHandler } from './error-handler'

/**
 * Rate limiter configuration options
 */
export interface RateLimiterConfig {
    limit: number
    windowMs: number
    message?: string
    skipSuccessfulRequests?: boolean
    skipFailedRequests?: boolean
    keyGenerator?: (request: NextRequest) => string
}

/**
 * Default rate limiter configurations for different endpoint types
 */
export const RateLimiters = {
    // General API endpoints
    api: rateLimiter({
        limit: 60, // 60 requests per minute
        windowMs: 60 * 1000
    }),
    
    // Authentication endpoints (stricter)
    auth: rateLimiter({
        limit: 10, // 10 requests per minute
        windowMs: 60 * 1000,
        message: 'Too many authentication attempts, please try again later.'
    }),
    
    // Search endpoints (moderate)
    search: rateLimiter({
        limit: 30, // 30 requests per minute
        windowMs: 60 * 1000,
        message: 'Too many search requests, please slow down.'
    }),
    
    // Upload endpoints (very strict)
    upload: rateLimiter({
        limit: 5, // 5 requests per minute
        windowMs: 60 * 1000,
        message: 'Upload rate limit exceeded, please wait before uploading again.'
    }),
    
    // Public data endpoints (lenient)
    publicData: rateLimiter({
        limit: 120, // 120 requests per minute
        windowMs: 60 * 1000
    })
}

/**
 * Creates a rate limiting middleware wrapper
 * 
 * @param config - Rate limiter configuration or predefined limiter
 * @returns Middleware function that applies rate limiting
 * 
 * @example
 * ```ts
 * export const GET = withRateLimit(RateLimiters.api)(async (request) => {
 *   // Your API logic here
 *   return successResponse(data)
 * })
 * ```
 * 
 * @example
 * ```ts
 * export const POST = withRateLimit({
 *   limit: 5,
 *   windowMs: 60000,
 *   message: 'Custom rate limit message'
 * })(async (request) => {
 *   // Your API logic here
 *   return successResponse(data)
 * })
 * ```
 */
export function withRateLimit(
    config: RateLimiterConfig | ((request: NextRequest) => Response | null)
) {
    return function<TContext = unknown>(
        handler: (request: NextRequest, context: TContext) => Promise<Response>
    ) {
        return withErrorHandler(async (request: NextRequest, context: TContext) => {
            let limiterResponse: Response | null

            if (typeof config === 'function') {
                // Predefined rate limiter
                limiterResponse = config(request)
            } else {
                // Create rate limiter from config
                const limiter = rateLimiter(config)
                limiterResponse = limiter(request)
            }

            // Check if rate limit was exceeded
            if (limiterResponse && limiterResponse.status !== 200) {
                // Extract error message from rate limiter response
                let message = 'Rate limit exceeded'
                try {
                    const body = await limiterResponse.text()
                    const parsed = JSON.parse(body)
                    message = parsed.error || parsed.message || message
                } catch {
                    // Use default message if parsing fails
                }
                
                throw createRateLimitError(message)
            }

            // Rate limit passed, proceed with handler
            return await handler(request, context)
        })
    }
}

/**
 * Combines multiple rate limiters with AND logic
 * All rate limiters must pass for the request to proceed
 * 
 * @param limiters - Array of rate limiter functions
 * @returns Combined rate limiter middleware
 * 
 * @example
 * ```ts
 * export const POST = withMultipleRateLimits([
 *   RateLimiters.api,
 *   RateLimiters.auth
 * ])(async (request) => {
 *   // Must pass both API and auth rate limits
 *   return successResponse(data)
 * })
 * ```
 */
export function withMultipleRateLimits(
    limiters: ((request: NextRequest) => Response | null)[]
) {
    return function<TContext = unknown>(
        handler: (request: NextRequest, context: TContext) => Promise<Response>
    ) {
        return withErrorHandler(async (request: NextRequest, context: TContext) => {
            // Check all rate limiters
            for (const limiter of limiters) {
                const limiterResponse = limiter(request)
                
                if (limiterResponse && limiterResponse.status !== 200) {
                    // Extract error message
                    let message = 'Rate limit exceeded'
                    try {
                        const body = await limiterResponse.text()
                        const parsed = JSON.parse(body)
                        message = parsed.error || parsed.message || message
                    } catch {
                        // Use default message if parsing fails
                    }
                    
                    throw createRateLimitError(message)
                }
            }

            // All rate limits passed, proceed with handler
            return await handler(request, context)
        })
    }
}

/**
 * Dynamic rate limiter that chooses different limits based on endpoint
 * 
 * @param limiterMap - Map of path patterns to rate limiters
 * @param defaultLimiter - Default rate limiter if no pattern matches
 * @returns Dynamic rate limiter middleware
 * 
 * @example
 * ```ts
 * export const handler = withDynamicRateLimit({
 *   '/api/auth/*': RateLimiters.auth,
 *   '/api/search/*': RateLimiters.search,
 *   '/api/upload/*': RateLimiters.upload
 * }, RateLimiters.api)
 * ```
 */
export function withDynamicRateLimit(
    limiterMap: Record<string, (request: NextRequest) => Response | null>,
    defaultLimiter: (request: NextRequest) => Response | null
) {
    return function<TContext = unknown>(
        handler: (request: NextRequest, context: TContext) => Promise<Response>
    ) {
        return withErrorHandler(async (request: NextRequest, context: TContext) => {
            const pathname = new URL(request.url).pathname
            
            // Find matching pattern
            let selectedLimiter = defaultLimiter
            for (const [pattern, limiter] of Object.entries(limiterMap)) {
                if (pathname.match(pattern.replace('*', '.*'))) {
                    selectedLimiter = limiter
                    break
                }
            }

            // Apply selected rate limiter
            const limiterResponse = selectedLimiter(request)
            
            if (limiterResponse && limiterResponse.status !== 200) {
                let message = 'Rate limit exceeded'
                try {
                    const body = await limiterResponse.text()
                    const parsed = JSON.parse(body)
                    message = parsed.error || parsed.message || message
                } catch {
                    // Use default message if parsing fails
                }
                
                throw createRateLimitError(message)
            }

            return await handler(request, context)
        })
    }
}

/**
 * Rate limiter that applies different limits based on authentication status
 * 
 * @param authenticatedLimiter - Rate limiter for authenticated users
 * @param unauthenticatedLimiter - Rate limiter for unauthenticated users
 * @returns Conditional rate limiter middleware
 * 
 * @example
 * ```ts
 * export const GET = withConditionalRateLimit(
 *   RateLimiters.publicData, // Authenticated users get higher limits
 *   RateLimiters.api        // Unauthenticated users get standard limits
 * )(async (request) => {
 *   return successResponse(data)
 * })
 * ```
 */
export function withConditionalRateLimit(
    authenticatedLimiter: (request: NextRequest) => Response | null,
    unauthenticatedLimiter: (request: NextRequest) => Response | null
) {
    return function<TContext = unknown>(
        handler: (request: NextRequest, context: TContext) => Promise<Response>
    ) {
        return withErrorHandler(async (request: NextRequest, context: TContext) => {
            // Check if user is authenticated (simple check for session cookie)
            const isAuthenticated = !!request.cookies.get('session')?.value
            
            const selectedLimiter = isAuthenticated 
                ? authenticatedLimiter 
                : unauthenticatedLimiter

            const limiterResponse = selectedLimiter(request)
            
            if (limiterResponse && limiterResponse.status !== 200) {
                let message = 'Rate limit exceeded'
                try {
                    const body = await limiterResponse.text()
                    const parsed = JSON.parse(body)
                    message = parsed.error || parsed.message || message
                } catch {
                    // Use default message if parsing fails
                }
                
                throw createRateLimitError(message)
            }

            return await handler(request, context)
        })
    }
}