/**
 * Enhanced authentication middleware for API routes
 * 
 * @module api/auth-middleware
 * @category API Security
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/auth-session-server'
import { createAuthError, withErrorHandler } from './error-handler'
import { RateLimiters, withRateLimit } from './rate-limit-middleware'

/**
 * User context interface for authenticated requests
 */
export interface AuthenticatedUser {
    uid: string
    email?: string
    displayName?: string
    emailVerified?: boolean
    customClaims?: Record<string, any>
    sessionDuration?: number
    lastLogin?: Date
}

/**
 * Extended context for authenticated handlers
 */
export interface AuthenticatedContext {
    user: AuthenticatedUser
    requestId?: string
    timestamp: number
    userAgent?: string
    ipAddress?: string
    [key: string]: any
}

/**
 * Handler function type for authenticated routes
 */
export type AuthenticatedHandler = (
    request: NextRequest,
    context: AuthenticatedContext
) => Promise<NextResponse>

/**
 * Security configuration for auth middleware
 */
interface SecurityConfig {
    requireEmailVerification?: boolean
    maxSessionAge?: number // in milliseconds
    allowedOrigins?: string[]
    logRequests?: boolean
    enforceHttps?: boolean
    checkUserAgent?: boolean
}

/**
 * Enhanced authentication middleware with comprehensive security features
 * 
 * @param handler - The API route handler that requires authentication
 * @param config - Security configuration options
 * @returns Wrapped handler with authentication protection
 * 
 * @example
 * ```ts
 * export const GET = withAuth(async (request, { user }) => {
 *   // User is guaranteed to be authenticated here
 *   const userData = await getUserData(user.uid)
 *   return successResponse(userData)
 * }, {
 *   requireEmailVerification: true,
 *   maxSessionAge: 24 * 60 * 60 * 1000, // 24 hours
 *   logRequests: true
 * })
 * ```
 */
export function withAuth(handler: AuthenticatedHandler, config: SecurityConfig = {}) {
    const {
        requireEmailVerification = false,
        maxSessionAge = 7 * 24 * 60 * 60 * 1000, // 7 days default
        allowedOrigins = [],
        logRequests = process.env.NODE_ENV === 'development',
        enforceHttps = process.env.NODE_ENV === 'production',
        checkUserAgent = true
    } = config

    return withRateLimit(RateLimiters.api)(withErrorHandler(async (request: NextRequest, context: any = {}) => {
        const requestId = crypto.randomUUID()
        const timestamp = Date.now()
        const userAgent = request.headers.get('user-agent')
        const ipAddress = getClientIP(request)

        // Security checks
        if (enforceHttps && !request.url.startsWith('https://')) {
            throw createAuthError('HTTPS required for secure authentication')
        }

        // Origin validation for CORS
        if (allowedOrigins.length > 0) {
            const origin = request.headers.get('origin')
            if (origin && !allowedOrigins.includes(origin)) {
                throw createAuthError('Origin not allowed')
            }
        }

        // Suspicious user agent check
        if (checkUserAgent && (!userAgent || isSuspiciousUserAgent(userAgent))) {
            if (logRequests) {
                console.warn(`⚠️ Suspicious user agent detected: ${userAgent} from IP: ${ipAddress}`)
            }
        }

        // Get current user from session
        const user = await getCurrentUser()
        
        // Check if user is authenticated
        if (!user?.uid) {
            if (logRequests) {
                console.warn(`🚫 Unauthorized access attempt from IP: ${ipAddress}`)
            }
            throw createAuthError('Authentication required')
        }

        // Verify user has valid session
        if (!user.email && !user.uid) {
            throw createAuthError('Invalid session')
        }

        // Email verification check
        if (requireEmailVerification && !user.emailVerified) {
            throw createAuthError('Email verification required')
        }

        // Session age validation
        const sessionAge = Date.now() - (user.lastLogin?.getTime() || 0)
        if (maxSessionAge > 0 && sessionAge > maxSessionAge) {
            throw createAuthError('Session expired, please log in again')
        }

        // Create authenticated context
        const authenticatedContext: AuthenticatedContext = {
            ...context,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified,
                customClaims: user.customClaims,
                sessionDuration: sessionAge,
                lastLogin: user.lastLogin
            },
            requestId,
            timestamp,
            userAgent,
            ipAddress
        }

        // Request logging
        if (logRequests) {
            console.log(`🔐 Authenticated request: ${request.method} ${request.url} - User: ${user.uid} - IP: ${ipAddress}`)
        }

        // Call the handler with authenticated context
        const response = await handler(request, authenticatedContext)

        // Add security headers
        response.headers.set('X-Request-ID', requestId)
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

        return response
    }))
}

/**
 * Optional authentication middleware that provides user context
 * if available but doesn't require authentication
 * 
 * @param handler - The API route handler
 * @param config - Security configuration options
 * @returns Wrapped handler with optional user context
 * 
 * @example
 * ```ts
 * export const GET = withOptionalAuth(async (request, { user }) => {
 *   if (user) {
 *     // User is authenticated, provide personalized content
 *     return getPersonalizedData(user.uid)
 *   }
 *   // User is not authenticated, provide public content
 *   return getPublicData()
 * })
 * ```
 */
export function withOptionalAuth(
    handler: (request: NextRequest, context: { user?: AuthenticatedUser; requestId: string; timestamp: number }) => Promise<NextResponse>,
    config: SecurityConfig = {}
) {
    const { logRequests = process.env.NODE_ENV === 'development' } = config

    return withRateLimit(RateLimiters.publicData)(withErrorHandler(async (request: NextRequest, context: any = {}) => {
        const requestId = crypto.randomUUID()
        const timestamp = Date.now()

        try {
            const user = await getCurrentUser()
            
            const extendedContext = {
                ...context,
                user: user?.uid ? {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    emailVerified: user.emailVerified,
                    customClaims: user.customClaims,
                    lastLogin: user.lastLogin
                } : undefined,
                requestId,
                timestamp
            }

            if (logRequests) {
                console.log(`📊 Public request: ${request.method} ${request.url} - User: ${user?.uid || 'anonymous'}`)
            }

            const response = await handler(request, extendedContext)
            response.headers.set('X-Request-ID', requestId)
            return response
        } catch (error) {
            // If authentication fails, continue without user context
            const response = await handler(request, { ...context, user: undefined, requestId, timestamp })
            response.headers.set('X-Request-ID', requestId)
            return response
        }
    }))
}

/**
 * Role-based authentication middleware with enhanced security
 * 
 * @param requiredRoles - Array of roles required to access the endpoint
 * @param handler - The API route handler
 * @param config - Security configuration options
 * @returns Wrapped handler with role-based protection
 * 
 * @example
 * ```ts
 * export const GET = withRoles(['admin', 'moderator'], async (request, { user }) => {
 *   // User is guaranteed to have admin or moderator role
 *   return getAdminData()
 * }, {
 *   requireEmailVerification: true,
 *   logRequests: true
 * })
 * ```
 */
export function withRoles(requiredRoles: string[], handler: AuthenticatedHandler, config: SecurityConfig = {}) {
    return withAuth(async (request: NextRequest, context: AuthenticatedContext) => {
        const userRoles = context.user.customClaims?.roles || []
        
        // Check if user has any of the required roles
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
        
        if (!hasRequiredRole) {
            console.warn(`🚨 Access denied for user ${context.user.uid}: Required roles: ${requiredRoles.join(', ')}, User roles: ${userRoles.join(', ')}`)
            throw createAuthError('Insufficient permissions')
        }

        console.log(`✅ Role check passed for user ${context.user.uid}: ${userRoles.join(', ')}`)
        return await handler(request, context)
    }, config)
}

/**
 * Email verification middleware
 * 
 * @param handler - The API route handler
 * @param config - Security configuration options
 * @returns Wrapped handler that requires email verification
 * 
 * @example
 * ```ts
 * export const POST = withEmailVerification(async (request, { user }) => {
 *   // User email is guaranteed to be verified
 *   return processVerifiedUserAction(user.uid)
 * })
 * ```
 */
export function withEmailVerification(handler: AuthenticatedHandler, config: SecurityConfig = {}) {
    return withAuth(async (request: NextRequest, context: AuthenticatedContext) => {
        if (!context.user.emailVerified) {
            throw createAuthError('Email verification required')
        }

        return await handler(request, context)
    }, { ...config, requireEmailVerification: true })
}

/**
 * Admin-only authentication middleware
 * 
 * @param handler - The API route handler
 * @param config - Security configuration options
 * @returns Wrapped handler that requires admin role
 */
export function withAdminAuth(handler: AuthenticatedHandler, config: SecurityConfig = {}) {
    return withRoles(['admin'], handler, config)
}

/**
 * Moderator or admin authentication middleware
 * 
 * @param handler - The API route handler
 * @param config - Security configuration options
 * @returns Wrapped handler that requires moderator or admin role
 */
export function withModeratorAuth(handler: AuthenticatedHandler, config: SecurityConfig = {}) {
    return withRoles(['admin', 'moderator'], handler, config)
}

/**
 * Combined authentication and rate limiting for sensitive operations
 * 
 * @param handler - The API route handler
 * @param config - Security configuration options
 * @returns Wrapped handler with strict security
 */
export function withStrictAuth(handler: AuthenticatedHandler, config: SecurityConfig = {}) {
    return withRateLimit(RateLimiters.auth)(withAuth(handler, {
        requireEmailVerification: true,
        enforceHttps: true,
        logRequests: true,
        checkUserAgent: true,
        ...config
    }))
}

/**
 * Utility functions for security checks
 */

function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cloudflareIP = request.headers.get('cf-connecting-ip')
    
    return cloudflareIP || realIP || (forwarded ? forwarded.split(',')[0].trim() : 'unknown')
}

function isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /curl/i,
        /wget/i,
        /python/i,
        /java/i,
        /go-http-client/i,
        /^$/,
        /^-$/
    ]
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent))
}

/**
 * Create middleware factory for custom authentication requirements
 * 
 * @param requirements - Custom authentication requirements
 * @returns Middleware factory function
 */
export function createAuthMiddleware(requirements: {
    roles?: string[]
    emailVerified?: boolean
    maxSessionAge?: number
    rateLimit?: 'strict' | 'moderate' | 'lenient'
    customValidator?: (user: AuthenticatedUser) => Promise<boolean>
}) {
    return function(handler: AuthenticatedHandler, config: SecurityConfig = {}) {
        let middleware = withAuth

        // Apply rate limiting based on requirement
        if (requirements.rateLimit === 'strict') {
            middleware = (h: AuthenticatedHandler, c: SecurityConfig) => withRateLimit(RateLimiters.auth)(withAuth(h, c))
        } else if (requirements.rateLimit === 'moderate') {
            middleware = (h: AuthenticatedHandler, c: SecurityConfig) => withRateLimit(RateLimiters.search)(withAuth(h, c))
        }

        // Apply role-based protection if needed
        if (requirements.roles && requirements.roles.length > 0) {
            return withRoles(requirements.roles, handler, {
                requireEmailVerification: requirements.emailVerified,
                maxSessionAge: requirements.maxSessionAge,
                ...config
            })
        }

        // Apply custom validation if provided
        if (requirements.customValidator) {
            return middleware(async (request: NextRequest, context: AuthenticatedContext) => {
                const isValid = await requirements.customValidator!(context.user)
                if (!isValid) {
                    throw createAuthError('Custom validation failed')
                }
                return await handler(request, context)
            }, {
                requireEmailVerification: requirements.emailVerified,
                maxSessionAge: requirements.maxSessionAge,
                ...config
            })
        }

        return middleware(handler, {
            requireEmailVerification: requirements.emailVerified,
            maxSessionAge: requirements.maxSessionAge,
            ...config
        })
    }
}