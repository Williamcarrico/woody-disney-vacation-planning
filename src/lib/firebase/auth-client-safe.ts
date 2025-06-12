/**
 * Client-safe authentication utilities
 * This module provides authentication functions that work in both client and server environments
 * without directly importing server-only modules like next/headers
 */

interface AuthUser {
    uid: string;
    email: string | null;
    decodedClaims?: Record<string, unknown>;
}

interface SessionResult {
    error?: string;
    [key: string]: unknown;
}

interface AuthSessionServerModule {
    getCurrentUser(): Promise<AuthUser | null>;
    createSessionCookie(idToken: string, rememberMe: boolean): Promise<SessionResult>;
    revokeSessionCookie(uid: string): Promise<SessionResult>;
}

/**
 * Gets current user in a client-safe way
 * Uses dynamic imports and environment checks to avoid server-only module issues
 */
export async function getCurrentUserSafe(): Promise<AuthUser | null> {
    // Only attempt server-side auth if we're actually on the server
    if (typeof window === 'undefined') {
        try {
            // Use eval to prevent webpack from analyzing the import at build time
            const importPath = './auth-session-server';
            const authModule = await eval(`import('${importPath}')`) as AuthSessionServerModule;
            return await authModule.getCurrentUser();
        } catch (error) {
            console.warn('Server-side auth failed:', error);
            return null;
        }
    }

    // Client-side: return null or implement client-side auth logic
    return null;
}

/**
 * Creates session cookie in a client-safe way
 */
export async function createSessionCookieSafe(idToken: string, rememberMe: boolean = false): Promise<SessionResult> {
    if (typeof window === 'undefined') {
        try {
            const importPath = './auth-session-server';
            const authModule = await eval(`import('${importPath}')`) as AuthSessionServerModule;
            return await authModule.createSessionCookie(idToken, rememberMe);
        } catch (error) {
            console.warn('Server-side session creation failed:', error);
            return { error: 'Failed to create session' };
        }
    }

    return { error: 'Session creation only available on server' };
}

/**
 * Revokes session cookie in a client-safe way
 */
export async function revokeSessionCookieSafe(uid: string): Promise<SessionResult> {
    if (typeof window === 'undefined') {
        try {
            const importPath = './auth-session-server';
            const authModule = await eval(`import('${importPath}')`) as AuthSessionServerModule;
            return await authModule.revokeSessionCookie(uid);
        } catch (error) {
            console.warn('Server-side session revocation failed:', error);
            return { error: 'Failed to revoke session' };
        }
    }

    return { error: 'Session revocation only available on server' };
}