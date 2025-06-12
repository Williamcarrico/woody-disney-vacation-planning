import { auth } from './firebase.config'
import { getIdToken } from 'firebase/auth'

export interface AuthDebugInfo {
    isAuthenticated: boolean
    user: {
        uid?: string
        email?: string
        emailVerified?: boolean
        displayName?: string
        photoURL?: string
    } | null
    idToken?: string
    claims?: Record<string, any>
    error?: string
}

/**
 * Debug authentication state and token information
 */
export async function debugAuthState(): Promise<AuthDebugInfo> {
    try {
        const user = auth.currentUser

        if (!user) {
            return {
                isAuthenticated: false,
                user: null,
                error: 'No authenticated user found'
            }
        }

        // Get ID token and claims
        const idToken = await getIdToken(user, true) // Force refresh
        const idTokenResult = await user.getIdTokenResult(true)

        return {
            isAuthenticated: true,
            user: {
                uid: user.uid,
                email: user.email ?? undefined,
                emailVerified: user.emailVerified,
                displayName: user.displayName ?? undefined,
                photoURL: user.photoURL ?? undefined
            },
            idToken,
            claims: idTokenResult.claims
        }
    } catch (error) {
        console.error('Auth debug error:', error)
        return {
            isAuthenticated: false,
            user: null,
            error: error instanceof Error ? error.message : 'Unknown authentication error'
        }
    }
}

/**
 * Log detailed authentication information for debugging
 */
export async function logAuthDebugInfo(): Promise<void> {
    const debugInfo = await debugAuthState()

    console.group('🔐 Firebase Authentication Debug Info')
    console.log('Authenticated:', debugInfo.isAuthenticated)
    console.log('User:', debugInfo.user)

    if (debugInfo.idToken) {
        console.log('ID Token (first 50 chars):', debugInfo.idToken.substring(0, 50) + '...')
    }

    if (debugInfo.claims) {
        console.log('Claims:', debugInfo.claims)
    }

    if (debugInfo.error) {
        console.error('Error:', debugInfo.error)
    }

    console.groupEnd()
}

/**
 * Test Firestore permissions with current authentication state
 */
export async function testFirestorePermissions(): Promise<void> {
    try {
        const authInfo = await debugAuthState()

        if (!authInfo.isAuthenticated) {
            console.error('❌ Cannot test Firestore permissions: User not authenticated')
            return
        }

        console.group('🔥 Firestore Permissions Test')
        console.log('Testing with user:', authInfo.user?.uid)

        // Import Firestore here to avoid circular dependencies
        const { collection, getDocs, limit, query } = await import('firebase/firestore')
        const { firestore } = await import('./firebase.config')

        // Test reading attractions (should work - public read)
        try {
            const attractionsQuery = query(collection(firestore, 'attractions'), limit(1))
            const attractionsSnapshot = await getDocs(attractionsQuery)
            console.log('✅ Attractions read test: SUCCESS', attractionsSnapshot.size)
        } catch (error) {
            console.error('❌ Attractions read test: FAILED', error)
        }

        // Test reading user's own document
        if (authInfo.user?.uid) {
            try {
                const userQuery = query(collection(firestore, 'users'), limit(1))
                const userSnapshot = await getDocs(userQuery)
                console.log('✅ Users collection read test: SUCCESS', userSnapshot.size)
            } catch (error) {
                console.error('❌ Users collection read test: FAILED', error)
            }
        }

        console.groupEnd()
    } catch (error) {
        console.error('Error testing Firestore permissions:', error)
    }
}

/**
 * Hook for components to easily debug auth state
 */
export function useAuthDebug() {
    return {
        debugAuthState,
        logAuthDebugInfo,
        testFirestorePermissions
    }
}