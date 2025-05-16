import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { getAuth } from './firebase-admin'

// Cookie name for session
const SESSION_COOKIE_NAME = 'session'

// Session cookie expiration (in seconds)
// 5 days matches Firebase default session duration
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 5

/**
 * Creates session cookie after user is verified
 */
export async function createSessionCookie(idToken: string) {
    try {
        console.log('Initializing Firebase Admin');
        const auth = getAuth()

        // Create session cookie with Firebase admin
        console.log('Creating session cookie with idToken');
        const sessionCookie = await auth.createSessionCookie(idToken, {
            expiresIn: SESSION_EXPIRATION_SECONDS * 1000, // Convert to milliseconds
        })

        console.log('Setting cookie in response');
        // Set cookie in the browser
        const cookieStore = await cookies()
        await cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
            maxAge: SESSION_EXPIRATION_SECONDS,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        })

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
 * Validates session cookie from request
 */
export async function validateSessionCookie(request: NextRequest) {
    try {
        const session = request.cookies.get(SESSION_COOKIE_NAME)?.value

        if (!session) {
            return { isValid: false }
        }

        const auth = getAuth()
        const decodedClaims = await auth.verifySessionCookie(session, true)

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
 * Revokes user session and clears cookie
 */
export async function revokeSessionCookie(uid: string) {
    try {
        const auth = getAuth()

        // Revoke all refresh tokens for user
        await auth.revokeRefreshTokens(uid)

        // Clear cookie in the browser
        const cookieStore = await cookies()
        await cookieStore.delete(SESSION_COOKIE_NAME)

        return { success: true }
    } catch (error) {
        console.error('Error revoking session:', error)
        return { error: 'Failed to revoke session' }
    }
}

/**
 * Gets the current user from the session if available
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
        const user = await auth.getUser(decodedClaims.uid)

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
        }
    } catch (error) {
        console.error('Error getting current user:', error)
        return null
    }
}