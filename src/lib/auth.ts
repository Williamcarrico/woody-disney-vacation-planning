import { getCurrentUser } from './firebase/auth-session-server'

/**
 * Server-side auth helper function
 * Returns the current authenticated user from session cookies
 */
export async function auth() {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
        return null
    }

    // Adapt the return object to include a user property
    return {
        user: {
            id: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName,
            image: currentUser.photoURL,
            emailVerified: currentUser.emailVerified
        }
    }
}