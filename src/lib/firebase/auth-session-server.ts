import { cookies } from 'next/headers'
import { getAuth } from './firebase-admin'

// Cookie name for session
const SESSION_COOKIE_NAME = 'session'

// Session cookie expirations (in seconds)
// Min 5 minutes (300 seconds), Max 2 weeks (1,209,600 seconds)
const DEFAULT_SESSION_EXPIRATION = 60 * 60 * 24 // 1 day (86,400 seconds)
const EXTENDED_SESSION_EXPIRATION = 60 * 60 * 24 * 14 // 14 days (1,209,600 seconds) - Max allowed

// Token rotation interval (in milliseconds)
const _TOKEN_ROTATION_INTERVAL = 60 * 60 * 1000 // 1 hour

// Cookie for tracking token refresh time
const TOKEN_REFRESH_COOKIE = 'token_refresh'

// Min and max allowed expiration times in milliseconds for Firebase session cookies
const MIN_SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MAX_SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks

/**
 * Creates session cookie after user is verified (Server-only)
 */
export async function createSessionCookie(idToken: string, rememberMe: boolean = false) {
    try {
        console.log('Initializing Firebase Admin');
        const auth = getAuth()

        // Set expiration based on remember-me flag
        const expirationSeconds = rememberMe
            ? EXTENDED_SESSION_EXPIRATION
            : DEFAULT_SESSION_EXPIRATION;

        // Convert to milliseconds and ensure it's within allowed range
        const expirationMs = expirationSeconds * 1000;
        const validExpirationMs = Math.min(
            Math.max(expirationMs, MIN_SESSION_DURATION_MS),
            MAX_SESSION_DURATION_MS
        );

        console.log(`Creating session cookie with idToken (expires in ${validExpirationMs / 1000}s)`);

        // Create session cookie with Firebase admin
        const sessionCookie = await auth.createSessionCookie(idToken, {
            expiresIn: validExpirationMs, // Using validated milliseconds value
        })

        console.log('Setting cookie in response');

        // Set cookie in the browser
        const cookieStore = await cookies()

        // Cookie options for better cross-environment compatibility
        const isProduction = process.env.NODE_ENV === 'production'
        const cookieOptions = {
            maxAge: validExpirationMs, // Using validated milliseconds value
            httpOnly: true,
            secure: isProduction,
            path: '/',
            sameSite: isProduction ? 'none' as const : 'lax' as const,
            // Set domain explicitly if using custom domain
            ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})
        }

        await cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, cookieOptions)

        // Set token refresh timestamp with same options
        await cookieStore.set(TOKEN_REFRESH_COOKIE, Date.now().toString(), cookieOptions)

        console.log('Session cookie created successfully');
        return { success: true }
    } catch (error) {
        console.error('Detailed error creating session cookie:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error creating session cookie:', errorMessage);

        // Check if it's a Firebase auth error and provide more specific messages
        if (errorMessage.includes('auth/')) {
            if (errorMessage.includes('auth/id-token-expired')) {
                return { error: 'Authentication token expired. Please sign in again.' };
            }
            if (errorMessage.includes('auth/id-token-revoked')) {
                return { error: 'Authentication token revoked. Please sign in again.' };
            }
            if (errorMessage.includes('auth/invalid-id-token')) {
                return { error: 'Invalid authentication token. Please sign in again.' };
            }
        }

        return { error: 'Failed to create session: ' + errorMessage }
    }
}

/**
 * Rotates the session token to improve security (Server-only)
 */
export async function rotateSessionToken(uid: string, rememberMe: boolean = false) {
    try {
        const auth = getAuth()

        // Revoke refresh tokens to force new token generation
        await auth.revokeRefreshTokens(uid)

        // Create new custom token
        const customToken = await auth.createCustomToken(uid)

        // Set up new session with the custom token
        // Note: In a real implementation, this would need client involvement
        // to exchange the custom token for an ID token

        const cookieStore = await cookies()

        // Calculate expiration time within allowed bounds
        const expirationSeconds = rememberMe ? EXTENDED_SESSION_EXPIRATION : DEFAULT_SESSION_EXPIRATION;
        const expirationMs = expirationSeconds * 1000;
        const validExpirationMs = Math.min(
            Math.max(expirationMs, MIN_SESSION_DURATION_MS),
            MAX_SESSION_DURATION_MS
        );

        // Update token refresh timestamp
        await cookieStore.set(TOKEN_REFRESH_COOKIE, Date.now().toString(), {
            maxAge: validExpirationMs,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        })

        return { success: true, customToken }
    } catch (error) {
        console.error('Error rotating session token:', error)
        return { error: 'Failed to rotate session token', details: error }
    }
}

/**
 * Revokes user session and clears cookie (Server-only)
 */
export async function revokeSessionCookie(uid: string) {
    try {
        const auth = getAuth()

        // Revoke all refresh tokens for user
        await auth.revokeRefreshTokens(uid)

        // Clear cookies in the browser
        const cookieStore = await cookies()
        await cookieStore.delete(SESSION_COOKIE_NAME)
        await cookieStore.delete(TOKEN_REFRESH_COOKIE)

        return { success: true }
    } catch (error) {
        console.error('Error revoking session:', error)
        return { error: 'Failed to revoke session' }
    }
}

/**
 * Gets current user from session cookie (Server-only)
 */
export async function getCurrentUser() {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get(SESSION_COOKIE_NAME)?.value

        if (!session) {
            return null
        }

        const auth = getAuth()
        const decodedClaims = await auth.verifySessionCookie(session, true)

        return {
            uid: decodedClaims.uid,
            email: decodedClaims.email,
            decodedClaims
        }
    } catch (error) {
        console.error('Error getting current user:', error)
        return null
    }
}