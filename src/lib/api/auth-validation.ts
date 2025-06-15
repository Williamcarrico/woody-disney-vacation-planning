/**
 * Authentication Validation Functions
 * Provides secure authentication validation for API routes using Firebase Admin SDK
 * 
 * @module api/auth-validation
 * @category API Security
 */

import { NextRequest } from 'next/server'
import { getAuth } from '../firebase/firebase-admin'
import { AuthenticationError, createAuthError } from './unified-error-handler'

/**
 * Interface for authenticated user information
 */
export interface AuthenticatedUser {
    uid: string
    email?: string
    emailVerified: boolean
    displayName?: string
    photoURL?: string
    phoneNumber?: string
    customClaims?: Record<string, unknown>
    disabled: boolean
    metadata: {
        creationTime?: string
        lastSignInTime?: string
        lastRefreshTime?: string
    }
}

/**
 * Interface for session information
 */
export interface SessionInfo {
    userId: string
    email?: string
    expiresAt: number
    issuedAt: number
    claims?: Record<string, unknown>
}

/**
 * Validates a Firebase Authentication token (JWT)
 * 
 * @param token - The JWT token to validate
 * @param checkRevoked - Whether to check if the token has been revoked (default: true)
 * @returns Promise resolving to authenticated user information
 * @throws AuthenticationError if token is invalid
 */
export async function validateAuthToken(token: string, checkRevoked: boolean = true): Promise<AuthenticatedUser> {
    try {
        if (!token || typeof token !== 'string') {
            throw createAuthError('Invalid token format')
        }

        // Verify the ID token
        const decodedToken = await getAuth().verifyIdToken(token, checkRevoked)
        
        // Get user record for additional information
        const userRecord = await getAuth().getUser(decodedToken.uid)
        
        return {
            uid: userRecord.uid,
            email: userRecord.email,
            emailVerified: userRecord.emailVerified,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            phoneNumber: userRecord.phoneNumber,
            customClaims: userRecord.customClaims,
            disabled: userRecord.disabled,
            metadata: {
                creationTime: userRecord.metadata.creationTime,
                lastSignInTime: userRecord.metadata.lastSignInTime,
                lastRefreshTime: userRecord.metadata.lastRefreshTime
            }
        }
    } catch (error) {
        if (error instanceof AuthenticationError) {
            throw error
        }
        
        // Handle Firebase Auth specific errors
        if (error && typeof error === 'object' && 'code' in error) {
            const firebaseError = error as { code: string; message: string }
            
            switch (firebaseError.code) {
                case 'auth/id-token-expired':
                    throw createAuthError('Authentication token has expired')
                case 'auth/id-token-revoked':
                    throw createAuthError('Authentication token has been revoked')
                case 'auth/invalid-id-token':
                    throw createAuthError('Invalid authentication token')
                case 'auth/user-disabled':
                    throw createAuthError('User account has been disabled')
                case 'auth/user-not-found':
                    throw createAuthError('User account not found')
                default:
                    throw createAuthError(`Authentication failed: ${firebaseError.message}`)
            }
        }
        
        throw createAuthError('Authentication service unavailable')
    }
}

/**
 * Validates a session cookie
 * 
 * @param sessionCookie - The session cookie to validate
 * @param checkRevoked - Whether to check if the session has been revoked (default: true)
 * @returns Promise resolving to session information
 * @throws AuthenticationError if session is invalid
 */
export async function validateSessionCookie(sessionCookie: string, checkRevoked: boolean = true): Promise<SessionInfo> {
    try {
        if (!sessionCookie || typeof sessionCookie !== 'string') {
            throw createAuthError('Invalid session cookie format')
        }

        // Verify the session cookie
        const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, checkRevoked)
        
        return {
            userId: decodedClaims.uid,
            email: decodedClaims.email,
            expiresAt: decodedClaims.exp * 1000, // Convert to milliseconds
            issuedAt: decodedClaims.iat * 1000, // Convert to milliseconds
            claims: decodedClaims
        }
    } catch (error) {
        if (error instanceof AuthenticationError) {
            throw error
        }
        
        // Handle Firebase Auth specific errors
        if (error && typeof error === 'object' && 'code' in error) {
            const firebaseError = error as { code: string; message: string }
            
            switch (firebaseError.code) {
                case 'auth/session-cookie-expired':
                    throw createAuthError('Session has expired')
                case 'auth/session-cookie-revoked':
                    throw createAuthError('Session has been revoked')
                case 'auth/invalid-session-cookie':
                    throw createAuthError('Invalid session cookie')
                default:
                    throw createAuthError(`Session validation failed: ${firebaseError.message}`)
            }
        }
        
        throw createAuthError('Session validation service unavailable')
    }
}

/**
 * Extracts authentication information from request headers and cookies
 * 
 * @param request - The NextRequest object
 * @returns Object containing extracted auth information
 */
export function extractAuthInfo(request: NextRequest): {
    authToken?: string
    sessionCookie?: string
    authType: 'token' | 'session' | 'none'
} {
    // Check for Authorization header (Bearer token)
    const authHeader = request.headers.get('authorization')
    const authToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    
    // Check for session cookie
    const sessionCookie = request.cookies.get('session')?.value
    
    // Determine auth type
    let authType: 'token' | 'session' | 'none' = 'none'
    if (authToken) {
        authType = 'token'
    } else if (sessionCookie) {
        authType = 'session'
    }
    
    return {
        authToken,
        sessionCookie,
        authType
    }
}

/**
 * Validates authentication from request (either token or session)
 * 
 * @param request - The NextRequest object
 * @param options - Validation options
 * @returns Promise resolving to authenticated user information
 * @throws AuthenticationError if authentication fails
 */
export async function validateAuthentication(
    request: NextRequest,
    options: {
        required?: boolean
        checkRevoked?: boolean
        preferSessionCookie?: boolean
    } = {}
): Promise<AuthenticatedUser | null> {
    const { required = true, checkRevoked = true, preferSessionCookie = false } = options
    
    const { authToken, sessionCookie, authType } = extractAuthInfo(request)
    
    if (authType === 'none') {
        if (required) {
            throw createAuthError('Authentication required')
        }
        return null
    }
    
    try {
        // Choose validation method based on preference or availability
        if (preferSessionCookie && sessionCookie) {
            const sessionInfo = await validateSessionCookie(sessionCookie, checkRevoked)
            // Convert session info to user info (simplified)
            return {
                uid: sessionInfo.userId,
                email: sessionInfo.email,
                emailVerified: true, // Assume verified for session-based auth
                disabled: false,
                metadata: {}
            } as AuthenticatedUser
        } else if (authToken) {
            return await validateAuthToken(authToken, checkRevoked)
        } else if (sessionCookie) {
            const sessionInfo = await validateSessionCookie(sessionCookie, checkRevoked)
            // Convert session info to user info (simplified)
            return {
                uid: sessionInfo.userId,
                email: sessionInfo.email,
                emailVerified: true, // Assume verified for session-based auth
                disabled: false,
                metadata: {}
            } as AuthenticatedUser
        }
        
        if (required) {
            throw createAuthError('No valid authentication credentials provided')
        }
        return null
    } catch (error) {
        if (error instanceof AuthenticationError) {
            throw error
        }
        
        if (required) {
            throw createAuthError('Authentication validation failed')
        }
        return null
    }
}

/**
 * Creates a session cookie from an ID token
 * 
 * @param idToken - The Firebase ID token
 * @param expiresIn - Session duration in milliseconds (default: 5 days)
 * @returns Promise resolving to session cookie string
 */
export async function createSessionCookie(idToken: string, expiresIn: number = 5 * 24 * 60 * 60 * 1000): Promise<string> {
    try {
        return await getAuth().createSessionCookie(idToken, { expiresIn })
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
            const firebaseError = error as { code: string; message: string }
            throw createAuthError(`Failed to create session: ${firebaseError.message}`)
        }
        throw createAuthError('Session creation service unavailable')
    }
}

/**
 * Revokes all refresh tokens for a user
 * 
 * @param uid - The user ID
 * @returns Promise that resolves when tokens are revoked
 */
export async function revokeRefreshTokens(uid: string): Promise<void> {
    try {
        await getAuth().revokeRefreshTokens(uid)
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
            const firebaseError = error as { code: string; message: string }
            throw createAuthError(`Failed to revoke tokens: ${firebaseError.message}`)
        }
        throw createAuthError('Token revocation service unavailable')
    }
}

/**
 * Checks if a user has specific custom claims (for role-based access)
 * 
 * @param user - The authenticated user
 * @param requiredClaims - Object with required claim key-value pairs
 * @returns Boolean indicating if user has all required claims
 */
export function hasRequiredClaims(user: AuthenticatedUser, requiredClaims: Record<string, unknown>): boolean {
    if (!user.customClaims) {
        return Object.keys(requiredClaims).length === 0
    }
    
    return Object.entries(requiredClaims).every(([key, value]) => {
        return user.customClaims![key] === value
    })
}

/**
 * Middleware helper for role-based access control
 * 
 * @param user - The authenticated user
 * @param allowedRoles - Array of allowed roles
 * @returns Boolean indicating if user has access
 */
export function hasRole(user: AuthenticatedUser, allowedRoles: string[]): boolean {
    if (!user.customClaims || !user.customClaims.role) {
        return false
    }
    
    const userRole = user.customClaims.role as string
    return allowedRoles.includes(userRole)
}

/**
 * Export all validation functions
 */
export {
    validateAuthToken,
    validateSessionCookie,
    extractAuthInfo,
    validateAuthentication,
    createSessionCookie,
    revokeRefreshTokens,
    hasRequiredClaims,
    hasRole
}