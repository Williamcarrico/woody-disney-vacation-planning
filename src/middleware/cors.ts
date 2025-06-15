import { NextRequest, NextResponse } from 'next/server'

/**
 * CORS middleware for API routes
 * Implements proper Cross-Origin Resource Sharing headers
 */
export function corsMiddleware(request: NextRequest, response: NextResponse) {
    // Get the origin from request headers
    const origin = request.headers.get('origin') || ''
    const isAllowedOrigin = [
        'https://woody-disney-vacation-planning.vercel.app',
        process.env['NEXT_PUBLIC_SITE_URL'] || '',
    ].includes(origin)

    // Configure CORS headers
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '')
    response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    )
    response.headers.set(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    return response
}

/**
 * Generate a CSRF token for form submission protection
 */
export function generateCsrfToken() {
    return crypto.randomUUID()
}

/**
 * Verify CSRF token in request headers against session token
 */
export function verifyCsrfToken(request: NextRequest, sessionToken: string) {
    const csrfToken = request.headers.get('X-CSRF-Token')
    // Simple validation - in production, use a more secure validation method
    return csrfToken && csrfToken === sessionToken
}