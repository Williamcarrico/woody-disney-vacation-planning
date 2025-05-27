import { NextRequest } from 'next/server'
import { getAuth } from './firebase-admin'

// Cookie name for session
const SESSION_COOKIE_NAME = 'session'

// Token rotation interval (in milliseconds)
const TOKEN_ROTATION_INTERVAL = 60 * 60 * 1000 // 1 hour

// Cookie for tracking token refresh time
const TOKEN_REFRESH_COOKIE = 'token_refresh'

/**
 * Validates session cookie from request and rotates token if needed
 */
export async function validateSessionCookie(request: NextRequest) {
    try {
        const session = request.cookies.get(SESSION_COOKIE_NAME)?.value
        const lastRefresh = request.cookies.get(TOKEN_REFRESH_COOKIE)?.value

        if (!session) {
            return { isValid: false }
        }

        const auth = getAuth()
        const decodedClaims = await auth.verifySessionCookie(session, true)

        // Check if token rotation is needed
        if (lastRefresh && shouldRotateToken(lastRefresh)) {
            // This flag will be checked by middleware to rotate the token
            return {
                isValid: true,
                uid: decodedClaims.uid,
                email: decodedClaims.email,
                decodedClaims,
                needsRotation: true
            }
        }

        return {
            isValid: true,
            uid: decodedClaims.uid,
            email: decodedClaims.email,
            decodedClaims
        }
    } catch (error) {
        console.error('Error validating session:', error)
        return { isValid: false }
    }
}

/**
 * Determines if token rotation is needed based on last refresh time
 */
function shouldRotateToken(lastRefreshTimestamp: string): boolean {
    const lastRefresh = parseInt(lastRefreshTimestamp, 10)
    const now = Date.now()
    return (now - lastRefresh) > TOKEN_ROTATION_INTERVAL
}