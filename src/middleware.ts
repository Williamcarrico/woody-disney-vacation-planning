import { NextResponse, NextRequest } from 'next/server'

// Define paths that should be accessible to public (no auth required)
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

// Check if the path should be public
function isPublicPath(path: string) {
    return PUBLIC_PATHS.some(publicPath =>
        path === publicPath || path.startsWith(`${publicPath}/`)
    )
}

// Check if the path should redirect authed users
function isAuthedRedirectPath(path: string) {
    return AUTHED_REDIRECT_PATHS.some(redirectPath =>
        path === redirectPath || path.startsWith(`${redirectPath}/`)
    )
}

// Simple check for session cookie existence - Edge compatible
// We can't verify the token in middleware due to Edge runtime limitations
// Full verification will happen in route handlers or server components
function hasSessionCookie(request: NextRequest): boolean {
    return !!request.cookies.get('session')?.value
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for static files and API routes (except specific auth ones)
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('/api/') && !pathname.includes('/api/auth/')
    ) {
        return NextResponse.next()
    }

    try {
        // Simple check if session cookie exists (no validation in middleware)
        const hasSession = hasSessionCookie(request)

        // If user is authenticated and tries to access auth pages, redirect to dashboard
        if (hasSession && isAuthedRedirectPath(pathname)) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // If path is public or user has a session cookie, continue
        if (isPublicPath(pathname) || hasSession) {
            return NextResponse.next()
        }

        // If user is not authenticated and tries to access protected route, redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
    } catch (error) {
        console.error('Middleware error:', error)

        // On error, allow access to public paths, redirect to login for protected paths
        if (isPublicPath(pathname)) {
            return NextResponse.next()
        }

        return NextResponse.redirect(new URL('/login', request.url))
    }
}

// Configure middleware to run on all routes
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)']
}