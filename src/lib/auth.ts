import { getCurrentUserSafe } from './firebase/auth-client-safe'

/**
 * Server-side auth helper function
 * Returns the current authenticated user from session cookies
 */
export async function auth() {
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