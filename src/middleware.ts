import { NextResponse, NextRequest } from 'next/server'
import { rateLimiter } from './middleware/rateLimiter'
import { corsMiddleware } from './middleware/cors'
import { createLogger } from '@/lib/utils/logger'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'

// Extend RequestCookie type with expires property
interface ExtendedRequestCookie extends RequestCookie {
    expires?: string | number | Date
}

// Create a logger for middleware
const middlewareLogger = createLogger('middleware')

// Define paths that should be accessible to public (no auth required)
// Keeping these definitions commented out for potential future use
/*
const PUBLIC_PATHS = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/api/auth/session'
]

// Define paths that should redirect logged-in users away from
const AUTHED_REDIRECT_PATHS = [
    '/login',
    '/signup',
    '/forgot-password'
]
*/

// Create rate limiter instances with different configurations
const apiRateLimiter = rateLimiter({
    limit: 60, // 60 requests per minute for general API endpoints
    windowMs: 60 * 1000 // 1 minute window
})

// More strict rate limiter for authentication routes
const authRateLimiter = rateLimiter({
    limit: 10, // 10 requests per minute for auth endpoints
    windowMs: 60 * 1000, // 1 minute window
    message: 'Too many login attempts, please try again later.'
})

// Simple check for session cookie existence - Edge compatible
// Currently unused but kept for potential future use
/*
function hasSessionCookie(request: NextRequest): boolean {
    return !!request.cookies.get('session')?.value
}
*/

/**
 * Check if token needs rotation based on cookie expiry
 * This is a simplistic check that doesn't validate the token
 * but helps determine if token might need refresh
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

const generateCsp = () => {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    // Create CSP string
    const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.googletagmanager.com https://cdn.jsdelivr.net https://firebasestorage.googleapis.com`,
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com`,
        `img-src 'self' data: https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com *.google.com *.googleusercontent.com`,
        `font-src 'self' https://fonts.gstatic.com`,
        `frame-src 'self' *.google.com`,
        `connect-src 'self' https://maps.googleapis.com https://*.googleapis.com *.google.com https://*.google-analytics.com https://www.googletagmanager.com https://*.gstatic.com data: blob: https://firebasestorage.googleapis.com`,
        `worker-src 'self' blob:`,
        `form-action 'self'`,
        `frame-ancestors 'self'`,
        `base-uri 'self'`
    ].join(';')

    return { csp, nonce }
}

/**
 * Handle API routes with rate limiting and CORS
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
 * Handle authentication routes and redirects
 * Modified to allow access to all pages regardless of auth status
 */
function handleAuthRoutes(): NextResponse | null {
    // Always return null to allow access to all pages regardless of auth status
    return null;
}

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()
    const { pathname } = request.nextUrl

    // Generate CSP and nonce
    const { csp, nonce } = generateCsp()

    // Set CSP header
    // Note: 'unsafe-inline' for styles is often needed but try to restrict if possible
    // 'unsafe-eval' for scripts is also a security risk, review its necessity
    response.headers.set('Content-Security-Policy', csp)
    response.headers.set('X-Nonce', nonce) // Pass nonce to be used in _document.tsx or page components

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

// Configure middleware to run on all routes
export const config = {
    matcher: [
        // Apply this middleware to all pages except public ones
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}

// Configure which routes use the middleware
export const apiConfig = {
    matcher: [
        '/api/:path*'
    ]
}