/**
 * @fileoverview Next.js middleware for the Disney Vacation Planning application.
 * This middleware handles security, authentication, rate limiting, CORS, and Content Security Policy (CSP)
 * for all incoming requests to the application.
 *
 * The middleware provides:
 * - Content Security Policy (CSP) headers for XSS protection
 * - Rate limiting for API endpoints with different limits for auth vs general endpoints
 * - CORS handling for cross-origin requests
 * - Session token rotation detection and headers
 * - Request logging and error handling
 * - Path-based routing logic
 *
 * @module middleware
 * @version 1.0.0
 * @author Disney Vacation Planning Team
 * @since 2024-01-01
 *
 * @requires next/server - Next.js server utilities for middleware
 * @requires ./middleware/rateLimiter - Custom rate limiting implementation
 * @requires ./middleware/cors - CORS handling middleware
 * @requires @/lib/utils/logger - Application logging utilities
 * @requires next/dist/compiled/@edge-runtime/cookies - Edge runtime cookie types
 *
 * @example
 * // Middleware automatically runs on configured routes
 * // No direct usage required - configured via config export
 *
 * @see {@link https://nextjs.org/docs/advanced-features/middleware} - Next.js Middleware Documentation
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP} - Content Security Policy Documentation
 */

import { NextResponse, NextRequest } from 'next/server'
import { rateLimiter } from './middleware/rateLimiter'
import { corsMiddleware } from './middleware/cors'
import { createLogger } from '@/lib/utils/logger'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'

/**
 * Extended interface for RequestCookie to include the expires property.
 * This extends the base RequestCookie type from Next.js to handle cookie expiration
 * which is needed for session token rotation logic.
 *
 * @interface ExtendedRequestCookie
 * @extends {RequestCookie}
 *
 * @property {string | number | Date} [expires] - Optional expiration date/time for the cookie.
 *   Can be a string (ISO date), number (timestamp), or Date object.
 *
 * @example
 * const cookie = request.cookies.get('session') as ExtendedRequestCookie;
 * if (cookie.expires) {
 *   const expiryDate = new Date(cookie.expires);
 *   // Handle expiration logic
 * }
 *
 * @since 1.0.0
 */
interface ExtendedRequestCookie extends RequestCookie {
    expires?: string | number | Date
}

/**
 * Logger instance specifically for middleware operations.
 * Provides structured logging for middleware events, errors, and debugging information.
 *
 * @type {Logger}
 * @const
 * @since 1.0.0
 */
const middlewareLogger = createLogger('middleware')

/**
 * Public paths that should be accessible without authentication.
 * Currently commented out as the application allows access to all pages regardless of auth status.
 * These definitions are kept for potential future use when implementing stricter auth requirements.
 *
 * @type {string[]}
 * @const
 * @private
 * @deprecated Currently unused - all paths are publicly accessible
 *
 * @example
 * const PUBLIC_PATHS = [
 *   '/',           // Home page
 *   '/login',      // Login page
 *   '/signup',     // Registration page
 *   '/forgot-password', // Password reset
 *   '/api/auth/session' // Session endpoint
 * ];
 */
/*
const PUBLIC_PATHS = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/api/auth/session'
]
*/

/**
 * Paths that should redirect authenticated users away from them.
 * Currently commented out as the application allows access to all pages regardless of auth status.
 * These would typically include auth-related pages that logged-in users shouldn't access.
 *
 * @type {string[]}
 * @const
 * @private
 * @deprecated Currently unused - no redirects implemented
 *
 * @example
 * const AUTHED_REDIRECT_PATHS = [
 *   '/login',      // Redirect logged-in users away from login
 *   '/signup',     // Redirect logged-in users away from signup
 *   '/forgot-password' // Redirect logged-in users away from password reset
 * ];
 */
/*
const AUTHED_REDIRECT_PATHS = [
    '/login',
    '/signup',
    '/forgot-password'
]
*/

/**
 * Rate limiter instance for general API endpoints.
 * Configured to allow 60 requests per minute for standard API operations.
 * This provides protection against API abuse while allowing normal usage patterns.
 *
 * @type {Function}
 * @const
 *
 * @property {number} limit - Maximum number of requests allowed (60)
 * @property {number} windowMs - Time window in milliseconds (60,000ms = 1 minute)
 *
 * @example
 * // Usage within middleware
 * const limiterResponse = apiRateLimiter(request);
 * if (limiterResponse.status !== 200) {
 *   return limiterResponse; // Rate limit exceeded
 * }
 *
 * @since 1.0.0
 */
const apiRateLimiter = rateLimiter({
    limit: 60, // 60 requests per minute for general API endpoints
    windowMs: 60 * 1000 // 1 minute window
})

/**
 * Rate limiter instance for authentication endpoints.
 * Configured with stricter limits (10 requests per minute) to prevent brute force attacks
 * and other authentication-related abuse. Includes a custom message for rate limit violations.
 *
 * @type {Function}
 * @const
 *
 * @property {number} limit - Maximum number of requests allowed (10)
 * @property {number} windowMs - Time window in milliseconds (60,000ms = 1 minute)
 * @property {string} message - Custom message returned when rate limit is exceeded
 *
 * @example
 * // Usage for auth endpoints
 * const limiterResponse = authRateLimiter(request);
 * if (limiterResponse.status !== 200) {
 *   // Returns: "Too many login attempts, please try again later."
 *   return limiterResponse;
 * }
 *
 * @since 1.0.0
 * @security Critical for preventing brute force authentication attacks
 */
const authRateLimiter = rateLimiter({
    limit: 10, // 10 requests per minute for auth endpoints
    windowMs: 60 * 1000, // 1 minute window
    message: 'Too many login attempts, please try again later.'
})

/**
 * Simple check for session cookie existence - Edge runtime compatible.
 * Currently unused but kept for potential future authentication implementation.
 * This function provides a basic way to determine if a user has a session cookie.
 *
 * @function hasSessionCookie
 * @private
 * @deprecated Currently unused - kept for potential future use
 *
 * @param {NextRequest} request - The incoming Next.js request object
 * @returns {boolean} True if session cookie exists and has a value, false otherwise
 *
 * @example
 * const hasSession = hasSessionCookie(request);
 * if (hasSession) {
 *   // User has a session cookie
 * }
 *
 * @since 1.0.0
 * @see {@link NextRequest} - Next.js request type
 */
/*
function hasSessionCookie(request: NextRequest): boolean {
    return !!request.cookies.get('session')?.value
}
*/

/**
 * Checks if a session token needs rotation based on cookie expiry time.
 * This function provides a simplistic check that doesn't validate the token content
 * but helps determine if the token might need refresh based on its expiration time.
 *
 * The function implements the following logic:
 * 1. Checks if session cookie exists
 * 2. Extracts expiry information from cookie
 * 3. Calculates time remaining until expiry
 * 4. Determines if rotation is needed (< 15 minutes remaining)
 * 5. Returns validity and rotation status
 *
 * @function checkSessionRotation
 * @param {NextRequest} request - The incoming Next.js request object containing cookies
 *
 * @returns {{isValid: boolean, needsRotation: boolean}} Object containing session status:
 *   - isValid: Whether the session is still valid (not expired)
 *   - needsRotation: Whether the session should be rotated (< 15 minutes remaining)
 *
 * @example
 * const sessionResult = checkSessionRotation(request);
 * if (sessionResult.isValid && sessionResult.needsRotation) {
 *   response.headers.set('X-Token-Rotation-Required', 'true');
 * }
 *
 * @example
 * // Possible return values:
 * { isValid: false, needsRotation: false } // No session cookie
 * { isValid: true, needsRotation: false }  // Valid session, no rotation needed
 * { isValid: true, needsRotation: true }   // Valid session, rotation recommended
 * { isValid: false, needsRotation: false } // Expired session
 *
 * @since 1.0.0
 * @performance Lightweight operation, safe for frequent calls
 * @security Does not validate token signature, only expiry time
 *
 * @see {@link ExtendedRequestCookie} - Extended cookie interface used internally
 */
function checkSessionRotation(request: NextRequest): { isValid: boolean, needsRotation: boolean } {
    const sessionCookie = request.cookies.get('session')

    if (!sessionCookie?.value) {
        return { isValid: false, needsRotation: false }
    }

    // Get expiry from cookie (if expires attribute is set)
    const expires = (sessionCookie as ExtendedRequestCookie).expires
    if (expires) {
        const expiryDate = new Date(expires)
        const now = new Date()

        // Calculate time remaining in seconds
        const secondsRemaining = Math.floor((expiryDate.getTime() - now.getTime()) / 1000)

        // If less than 15 minutes remaining, suggest rotation
        const needsRotation = secondsRemaining < 15 * 60

        // Consider valid if not expired
        const isValid = secondsRemaining > 0

        return { isValid, needsRotation }
    }

    // If no expiry, consider it valid but not needing rotation
    return { isValid: true, needsRotation: false }
}

/**
 * Generates a Content Security Policy (CSP) header with a unique nonce.
 * This function creates a comprehensive CSP that allows the application to function
 * while providing protection against XSS attacks and other security vulnerabilities.
 *
 * The CSP includes directives for:
 * - Script sources (including Google Maps, Firebase, CDNs)
 * - Style sources (including Google Fonts)
 * - Image sources (including Google services)
 * - Font sources
 * - Frame sources
 * - Connection sources (APIs, analytics)
 * - Worker sources
 * - Form actions
 * - Frame ancestors
 * - Base URI
 *
 * @function generateCsp
 * @returns {{csp: string, nonce: string}} Object containing:
 *   - csp: Complete CSP header string ready for use
 *   - nonce: Base64 encoded nonce for inline scripts/styles
 *
 * @example
 * const { csp, nonce } = generateCsp();
 * response.headers.set('Content-Security-Policy', csp);
 * response.headers.set('X-Nonce', nonce);
 *
 * @example
 * // Example CSP output (simplified):
 * "default-src 'self'; script-src 'self' 'nonce-abc123' ..."
 *
 * @since 1.0.0
 * @security Critical security function - generates XSS protection headers
 * @performance Generates new nonce on each call for security
 *
 * @note The CSP includes 'unsafe-inline' and 'unsafe-eval' which reduce security.
 *       These should be reviewed and removed if possible for better security.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP} - CSP Documentation
 */
const generateCsp = () => {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    // Create CSP string - enhanced security with proper nonce usage and restricted directives
    const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://maps.googleapis.com https://www.googletagmanager.com https://cdn.jsdelivr.net https://firebasestorage.googleapis.com https://www.gstatic.com`,
        `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com`,
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

    return { csp, nonce }
}

/**
 * Handles API routes with rate limiting and CORS middleware.
 * This function processes all API requests, applying appropriate security measures
 * based on the endpoint being accessed.
 *
 * The function implements:
 * 1. CORS handling for cross-origin requests
 * 2. OPTIONS request handling for CORS preflight
 * 3. Different rate limiting for auth vs general endpoints
 * 4. Session endpoint special handling (bypasses auth rate limiting)
 * 5. Response merging for middleware chain
 *
 * @function handleApiRoute
 * @param {NextRequest} request - The incoming Next.js request object
 * @param {NextResponse} response - The Next.js response object to modify
 *
 * @returns {NextResponse | null} Modified response with security headers applied,
 *   or null if the request should continue to the next handler
 *
 * @example
 * // Internal usage within main middleware
 * const apiResponse = handleApiRoute(request, response);
 * if (apiResponse) {
 *   return apiResponse; // Security check failed or CORS preflight
 * }
 *
 * @since 1.0.0
 * @security Applies rate limiting and CORS protection
 * @performance Optimized to bypass rate limiting for frequently called session endpoints
 *
 * @see {@link apiRateLimiter} - General API rate limiter
 * @see {@link authRateLimiter} - Authentication endpoint rate limiter
 * @see {@link corsMiddleware} - CORS handling function
 */
function handleApiRoute(request: NextRequest, response: NextResponse): NextResponse | null {
    const { pathname } = request.nextUrl

    // Apply CORS for all API routes
    const corsResponse = corsMiddleware(request, response)

    // Handle OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
        return corsResponse
    }

    // Apply stricter rate limiting for auth endpoints
    if (pathname.startsWith('/api/auth/')) {
        // Skip rate limiting for session endpoint as it's called frequently
        if (!pathname.includes('/api/auth/session')) {
            const limiterResponse = authRateLimiter(request)
            if (limiterResponse.status !== 200) {
                return corsMiddleware(request, limiterResponse)
            }
        }
    } else {
        // Apply general API rate limiting
        const limiterResponse = apiRateLimiter(request)
        if (limiterResponse.status !== 200) {
            return corsMiddleware(request, limiterResponse)
        }
    }

    // For API routes not requiring auth, proceed normally
    if (!pathname.includes('/api/auth/')) {
        return corsResponse
    }

    return null
}

/**
 * Handles authentication routes and redirects.
 * Currently modified to allow access to all pages regardless of authentication status.
 * This function is a placeholder for future authentication logic.
 *
 * @function handleAuthRoutes
 * @returns {NextResponse | null} Always returns null to allow access to all pages
 *
 * @example
 * const authResponse = handleAuthRoutes();
 * if (authResponse) {
 *   return authResponse; // Would redirect if auth logic was active
 * }
 *
 * @since 1.0.0
 * @deprecated Currently allows all access - placeholder for future auth implementation
 * @todo Implement proper authentication logic when required
 */
function handleAuthRoutes(): NextResponse | null {
    // Always return null to allow access to all pages regardless of auth status
    return null;
}

/**
 * Main middleware function that processes all incoming requests.
 * This is the entry point for request processing and applies various security
 * and functionality layers to requests before they reach their destinations.
 *
 * The middleware processes requests in the following order:
 * 1. Generates and applies CSP headers with nonce
 * 2. Handles session token rotation detection
 * 3. Processes API routes with rate limiting and CORS
 * 4. Skips processing for static files and session endpoints
 * 5. Handles authentication logic (currently allows all access)
 * 6. Provides error handling and logging
 *
 * @async
 * @function middleware
 * @param {NextRequest} request - The incoming Next.js request object
 *
 * @returns {Promise<NextResponse>} Promise resolving to the modified response object
 *   with appropriate headers and handling applied
 *
 * @throws {Error} Logs errors but continues processing to maintain application stability
 *
 * @example
 * // Middleware runs automatically on configured routes
 * // Example of what it does internally:
 * export async function middleware(request) {
 *   const response = NextResponse.next();
 *   // Apply security headers, rate limiting, etc.
 *   return response;
 * }
 *
 * @since 1.0.0
 * @security Applies multiple security layers including CSP, rate limiting, and CORS
 * @performance Optimized to skip unnecessary processing for static files
 * @reliability Includes comprehensive error handling to prevent middleware failures
 *
 * @see {@link generateCsp} - CSP header generation
 * @see {@link checkSessionRotation} - Session token rotation logic
 * @see {@link handleApiRoute} - API route processing
 * @see {@link handleAuthRoutes} - Authentication handling
 */
export async function middleware(request: NextRequest) {
    const response = NextResponse.next()
    const { pathname } = request.nextUrl

    // Skip CSP for server actions (they use special internal requests)
    const isServerAction = request.headers.get('content-type')?.includes('multipart/form-data') ||
                          request.headers.get('next-action') ||
                          pathname.startsWith('/_next/static/chunks/') ||
                          (request.method === 'POST' && request.headers.get('next-router-state-tree'))

    if (!isServerAction) {
        // Generate CSP and nonce
        const { csp, nonce } = generateCsp()

        // Set comprehensive security headers
        response.headers.set('Content-Security-Policy', csp)
        response.headers.set('X-Nonce', nonce) // Pass nonce to be used in _document.tsx or page components
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-XSS-Protection', '1; mode=block')
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()')
        response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
        response.headers.set('X-DNS-Prefetch-Control', 'off')
    }

    // Skip token rotation for API routes that would cause infinite loops
    if (pathname.startsWith('/api/auth/session')) {
        return response
    }

    // Check if the session needs rotation based on cookie expiry
    const sessionResult = checkSessionRotation(request)

    // If session is valid but needs rotation, set a header that can be read by client
    if (sessionResult.isValid && sessionResult.needsRotation) {
        response.headers.set('X-Token-Rotation-Required', 'true')
    }

    // Handle API routes
    if (pathname.startsWith('/api/')) {
        const apiResponse = handleApiRoute(request, response)
        if (apiResponse) {
            return apiResponse
        }
    }

    // Skip middleware for static files
    if (pathname.startsWith('/_next')) {
        return response
    }

    // Skip processing for session endpoints to avoid circular issues
    if (pathname === '/api/auth/session' || pathname === '/api/auth/session/check') {
        return response
    }

    try {
        // Handle authentication routes - will always allow access now
        const authResponse = handleAuthRoutes()
        if (authResponse) {
            return authResponse
        }

        // For handling non-existent routes:
        if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
            return response
        }

        // Return the response directly instead of rewriting to /not-found
        return response;
    } catch (error) {
        middlewareLogger.error('Middleware error:', error)

        // On error, allow access to all paths
        return response
    }
}

/**
 * Configuration object that determines which routes the middleware should process.
 * This matcher configuration ensures the middleware runs on all routes except
 * static files and Next.js internal paths.
 *
 * @type {Object}
 * @property {string[]} matcher - Array of path patterns to match
 *
 * @example
 * // The current matcher processes all routes except:
 * // - /_next/static/* (static files)
 * // - /_next/image/* (Next.js image optimization)
 * // - /favicon.ico (favicon)
 *
 * @since 1.0.0
 * @see {@link https://nextjs.org/docs/advanced-features/middleware#matcher} - Next.js Matcher Documentation
 */
export const config = {
    matcher: [
        // Apply this middleware to all pages except public ones
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}

/**
 * Additional API-specific configuration for middleware matching.
 * This configuration specifically targets API routes for processing.
 * Currently unused but kept for potential future API-specific middleware logic.
 *
 * @type {Object}
 * @property {string[]} matcher - Array of API path patterns to match
 * @deprecated Currently unused - main config handles all routes
 *
 * @example
 * // Would match all routes under /api/
 * matcher: ['/api/:path*']
 *
 * @since 1.0.0
 */
export const apiConfig = {
    matcher: [
        '/api/:path*'
    ]
}