import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    UserCredential,
    User,
    sendEmailVerification,
    applyActionCode,
    checkActionCode,
    ActionCodeSettings,
    AuthError
} from 'firebase/auth'
import { auth } from './firebase.config'

// Error handling utility function
function handleAuthError(error: unknown, operation: string): never {
    console.error(`Error during ${operation}:`, error)

    if (error instanceof Error) {
        const authError = error as AuthError
        // Add context to the error
        authError.message = `${operation} failed: ${authError.message}`
        throw authError
    }

    // If it's not an Error object, wrap it in one
    throw new Error(`${operation} failed: ${String(error)}`)
}

// Regular email/password signup
export async function signUpWithEmail(
    email: string,
    password: string,
    displayName: string
): Promise<UserCredential> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        // Update the user's profile with display name
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName })
            // Send verification email
            await sendVerificationEmail(userCredential.user)
        }
        return userCredential
    } catch (error) {
        handleAuthError(error, 'Email signup')
    }
}

// Regular email/password login
export async function signInWithEmail(
    email: string,
    password: string
): Promise<UserCredential> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        // If email is not verified, send verification email again
        if (userCredential.user && !userCredential.user.emailVerified) {
            await sendVerificationEmail(userCredential.user)
        }
        return userCredential
    } catch (error) {
        handleAuthError(error, 'Email login')
    }
}

// Google sign-in
export async function signInWithGoogle(): Promise<UserCredential> {
    try {
        const provider = new GoogleAuthProvider()
        return await signInWithPopup(auth, provider)
    } catch (error) {
        handleAuthError(error, 'Google sign-in')
    }
}

// Password reset
export async function resetPassword(email: string): Promise<void> {
    try {
        await sendPasswordResetEmail(auth, email)
    } catch (error) {
        handleAuthError(error, 'Password reset')
    }
}

// Logout
export async function logOut(): Promise<void> {
    try {
        await signOut(auth)
    } catch (error) {
        handleAuthError(error, 'Logout')
    }
}

// Get current user
export function getCurrentUser(): User | null {
    return auth.currentUser
}

// Send verification email
export async function sendVerificationEmail(user: User): Promise<void> {
    const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/login?email=${user.email}`,
        handleCodeInApp: true
    }

    try {
        await sendEmailVerification(user, actionCodeSettings)
    } catch (error) {
        handleAuthError(error, 'Sending verification email')
    }
}

// Resend verification email
export async function resendVerificationEmail(user: User): Promise<void> {
    try {
        await sendVerificationEmail(user)
    } catch (error) {
        handleAuthError(error, 'Resending verification email')
    }
}

// Verify email with action code
export async function verifyEmail(actionCode: string): Promise<void> {
    try {
        // Check the action code first to validate it
        await checkActionCode(auth, actionCode)
        // Apply the action code to verify the email
        await applyActionCode(auth, actionCode)
    } catch (error) {
        handleAuthError(error, 'Email verification')
    }
}