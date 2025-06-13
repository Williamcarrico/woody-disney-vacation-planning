/**
 * @fileoverview Server-side authentication utilities for the Disney Vacation Planning application.
 * This module provides authentication helpers for server-side operations, integrating with
 * Firebase Auth to handle user session validation and user data retrieval in server contexts.
 *
 * The module serves as a bridge between Firebase client-side authentication and server-side
 * operations, enabling secure access to user information in API routes, middleware, and
 * server-side rendered pages.
 *
 * @module auth
 * @version 1.0.0
 * @author Disney Vacation Planning Team
 * @since 2024-01-01
 *
 * @requires ./firebase/auth-client-safe - Safe Firebase auth utilities for server context
 *
 * @example
 * // Usage in API routes
 * import { auth } from '@/lib/auth';
 *
 * export async function GET() {
 *   const session = await auth();
 *   if (!session) {
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 *   // Use session.user data
 * }
 *
 * @example
 * // Usage in server components
 * import { auth } from '@/lib/auth';
 *
 * export default async function ProtectedPage() {
 *   const session = await auth();
 *   if (!session) {
 *     redirect('/login');
 *   }
 *   return <div>Welcome, {session.user.name}!</div>;
 * }
 *
 * @see {@link https://firebase.google.com/docs/auth} - Firebase Authentication Documentation
 * @see {@link https://nextjs.org/docs/app/building-your-application/authentication} - Next.js Authentication
 */

import { getCurrentUserSafe } from './firebase/auth-client-safe'

/**
 * Interface defining the structure of an authenticated user session.
 * This interface standardizes user data across the application and provides
 * type safety for user-related operations.
 *
 * @interface AuthSession
 *
 * @property {AuthUser} user - The authenticated user object containing profile information
 *
 * @since 1.0.0
 * @see {@link AuthUser} - User profile data structure
 *
 * @example
 * const session: AuthSession = {
 *   user: {
 *     id: 'firebase-uid-123',
 *     email: 'user@example.com',
 *     name: 'John Doe',
 *     image: 'https://avatar-url.com/image.jpg',
 *     emailVerified: true
 *   }
 * };
 */
interface AuthSession {
    user: AuthUser;
}

/**
 * Interface defining the authenticated user profile data.
 * Represents the normalized user information extracted from Firebase Auth claims
 * and session data.
 *
 * @interface AuthUser
 *
 * @property {string} id - Unique Firebase user identifier (UID).
 *   This is the primary key for user identification across the application
 * @property {string | null} email - User's email address.
 *   Null if the user authenticated without email (e.g., anonymous auth)
 * @property {string | null | undefined} name - User's display name.
 *   Extracted from Firebase custom claims or display name field
 * @property {string | null | undefined} image - URL to user's profile picture.
 *   Typically provided by OAuth providers or custom uploads
 * @property {boolean | undefined} emailVerified - Email verification status.
 *   True if the user has verified their email address
 *
 * @since 1.0.0
 *
 * @example
 * const user: AuthUser = {
 *   id: 'firebase-uid-123',
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   image: 'https://lh3.googleusercontent.com/...',
 *   emailVerified: true
 * };
 *
 * @example
 * // Handling optional fields
 * const displayName = user.name || user.email || 'Anonymous User';
 * const avatar = user.image || '/default-avatar.png';
 */
interface AuthUser {
    id: string;
    email: string | null;
    name?: string | null;
    image?: string | null;
    emailVerified?: boolean;
}

/**
 * Server-side authentication helper function that retrieves and validates
 * the current authenticated user from session cookies.
 *
 * This function serves as the primary entry point for server-side authentication
 * in the Disney Vacation Planning application. It safely extracts user information
 * from Firebase session cookies and returns a standardized user object.
 *
 * The function handles the following scenarios:
 * - Valid authenticated session: Returns user data
 * - Invalid or expired session: Returns null
 * - Missing session cookie: Returns null
 * - Server-side safety: Works in all server contexts (API routes, middleware, SSR)
 *
 * @async
 * @function auth
 * @returns {Promise<AuthSession | null>} Promise resolving to:
 *   - AuthSession object with user data if authenticated
 *   - null if not authenticated or session is invalid
 *
 * @throws {Error} May throw if Firebase authentication service is unavailable
 *   or if there are critical server configuration issues
 *
 * @example
 * // Basic usage in API route
 * import { auth } from '@/lib/auth';
 *
 * export async function GET() {
 *   const session = await auth();
 *
 *   if (!session) {
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 *
 *   // User is authenticated
 *   const userId = session.user.id;
 *   const userEmail = session.user.email;
 *
 *   return Response.json({
 *     message: `Hello, ${session.user.name || 'User'}!`,
 *     userId
 *   });
 * }
 *
 * @example
 * // Usage in server component with redirect
 * import { auth } from '@/lib/auth';
 * import { redirect } from 'next/navigation';
 *
 * export default async function ProfilePage() {
 *   const session = await auth();
 *
 *   if (!session) {
 *     redirect('/login?returnUrl=/profile');
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {session.user.name}!</h1>
 *       <p>Email: {session.user.email}</p>
 *       <p>Verified: {session.user.emailVerified ? 'Yes' : 'No'}</p>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Usage in middleware
 * import { auth } from '@/lib/auth';
 * import { NextRequest, NextResponse } from 'next/server';
 *
 * export async function middleware(request: NextRequest) {
 *   const session = await auth();
 *
 *   if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
 *     return NextResponse.redirect(new URL('/login', request.url));
 *   }
 *
 *   return NextResponse.next();
 * }
 *
 * @example
 * // Conditional logic based on authentication
 * const session = await auth();
 *
 * if (session) {
 *   // Authenticated user logic
 *   const userPreferences = await getUserPreferences(session.user.id);
 *   const personalizedContent = await getPersonalizedContent(session.user);
 * } else {
 *   // Anonymous user logic
 *   const defaultContent = await getDefaultContent();
 * }
 *
 * @since 1.0.0
 * @performance This function should be called once per request and the result cached
 *   if multiple components need authentication data in the same request cycle
 * @security This function validates session integrity and handles expired sessions gracefully
 * @compatibility Works in all Next.js server contexts including App Router and Pages Router
 *
 * @see {@link getCurrentUserSafe} - Underlying Firebase auth validation function
 * @see {@link AuthSession} - Return type interface
 * @see {@link AuthUser} - User data structure
 */
export async function auth(): Promise<AuthSession | null> {
    const currentUser = await getCurrentUserSafe()

    if (!currentUser) {
        return null
    }

    // Adapt the return object to include a user property
    return {
        user: {
            id: currentUser.uid,
            email: currentUser.email,
            name: currentUser.decodedClaims?.name || currentUser.decodedClaims?.display_name,
            image: currentUser.decodedClaims?.picture,
            emailVerified: currentUser.decodedClaims?.email_verified
        }
    }
}