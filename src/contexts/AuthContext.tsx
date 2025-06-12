"use client"; // This tells Next.js this is a client component

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, UserCredential, getIdToken, signInWithCustomToken } from 'firebase/auth'; // Import User type and getIdToken
import { auth } from '@/lib/firebase/firebase.config';
import {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetPassword,
    logOut
} from '@/lib/firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean; // To know if we're still checking the initial auth state
    signUp: (email: string, password: string, displayName: string, rememberMe?: boolean) => Promise<UserCredential>;
    signIn: (email: string, password: string, rememberMe?: boolean) => Promise<UserCredential>;
    googleSignIn: (rememberMe?: boolean) => Promise<UserCredential>;
    forgotPassword: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
    setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// LocalStorage key for remember-me preference
const REMEMBER_ME_KEY = 'auth_remember_me';

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get remember-me preference from local storage
    const getRememberMePreference = (): boolean => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
        }
        return false;
    };

    // Save remember-me preference to local storage
    const saveRememberMePreference = (remember: boolean) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false');
        }
    };

    // Creates a server-side session
    const createSession = useCallback(async (user: User, rememberMe: boolean = false) => {
        try {
            console.log('Creating session for user:', user.uid);
            // Get the ID token with true to force refresh
            const idToken = await getIdToken(user, true);
            console.log('Got ID token, calling session API');

            // Save remember-me preference
            saveRememberMePreference(rememberMe);

            // Call API route to create session cookie
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken, rememberMe }),
            });

            if (!response.ok) {
                // Try to get more detailed error information
                try {
                    const errorData = await response.json();
                    console.error('Session API error response:', errorData);
                    const errorMessage = errorData?.error || `Failed to create session: ${response.status} ${response.statusText}`;
                    console.error(errorMessage);
                    setError(errorMessage);
                } catch (parseError) {
                    console.error(`Failed to parse error response: ${response.status} ${response.statusText}`);
                    console.error('Parse error:', parseError);
                    setError(`Failed to create session: ${response.status} ${response.statusText}`);
                }
                return false;
            }

            console.log('Session created successfully');
            return true;
        } catch (error) {
            console.error('Session creation error details:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown session creation error';
            console.error('Session creation error:', errorMessage);
            setError(`Session error: ${errorMessage}`);
            return false;
        }
    }, [setError]);

    // Rotates the session token for improved security
    const rotateToken = useCallback(async (uid: string) => {
        try {
            const rememberMe = getRememberMePreference();

            // Call the token rotation API
            const response = await fetch('/api/auth/session', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, rememberMe }),
            });

            if (!response.ok) {
                throw new Error(`Failed to rotate token: ${response.status}`);
            }

            const data = await response.json();

            if (data.customToken) {
                // Use the custom token to refresh the client-side auth state
                await signInWithCustomToken(auth, data.customToken);
                console.log('Token rotation successful');
            }

            return true;
        } catch (error) {
            console.error('Token rotation error:', error);
            return false;
        }
    }, []);

    useEffect(() => {
        let previousUser: User | null = null;

        // Enhanced auth state listener with sign-out detection
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            console.log('🔐 Auth state changed:', {
                previousUser: previousUser?.uid,
                currentUser: firebaseUser?.uid,
                emailVerified: firebaseUser?.emailVerified
            });

            // Detect automatic sign-out
            if (previousUser && !firebaseUser) {
                console.warn('⚠️ Automatic sign-out detected');
                setError('Session expired. Please sign in again.');
            }

            // Clear error when user successfully signs in
            if (firebaseUser && !previousUser) {
                setError(null);
            }

            setUser(firebaseUser);

            // If user is logged in, create a session
            if (firebaseUser) {
                try {
                    const rememberMe = getRememberMePreference();
                    const sessionCreated = await createSession(firebaseUser, rememberMe);

                    if (!sessionCreated) {
                        console.error('Failed to create session for authenticated user');
                    }
                } catch (error) {
                    console.error('Session creation failed during auth state change:', error);
                }
            }

            previousUser = firebaseUser;
            setLoading(false); // Done checking initial state
        });

        // Additional auth error listener
        const authErrorListener = auth.onIdTokenChanged(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Force token refresh to catch any token issues early
                    await getIdToken(firebaseUser, true);
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    setError('Authentication token expired. Please sign in again.');
                }
            }
        });

        // Clean up listeners when the component unmounts
        return () => {
            unsubscribe();
            authErrorListener();
        };
    }, [createSession]); // Include createSession in dependencies

    // Setup global fetch interceptor for token rotation
    useEffect(() => {
        if (!user) return;

        // Only run this in the browser
        if (typeof window === 'undefined') return;

        // Store the original fetch function
        const originalFetch = window.fetch;

        // Replace with our interceptor
        window.fetch = async (input, init) => {
            // Call the original fetch
            const response = await originalFetch(input, init);

            // Check for token rotation header
            if (response.headers.get('X-Token-Rotation-Required') === 'true' && user) {
                console.log('Token rotation required, rotating token');
                // Don't await to avoid blocking the response
                rotateToken(user.uid).catch(err => {
                    console.error('Token rotation failed:', err);
                });
            }

            return response;
        };

        // Clean up when component unmounts or user changes
        return () => {
            window.fetch = originalFetch;
        };
    }, [user, rotateToken]);

    const signUp = async (email: string, password: string, displayName: string, rememberMe: boolean = false) => {
        try {
            const userCredential = await signUpWithEmail(email, password, displayName);

            // Create session after signup
            if (userCredential.user) {
                await createSession(userCredential.user, rememberMe);
            }

            return userCredential;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown signup error';
            setError(errorMessage);
            throw error;
        }
    };

    const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
        try {
            const userCredential = await signInWithEmail(email, password);

            // Create session after sign in
            if (userCredential.user) {
                await createSession(userCredential.user, rememberMe);
            }

            return userCredential;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown signin error';
            setError(errorMessage);
            throw error;
        }
    };

    const googleSignIn = async (rememberMe: boolean = false) => {
        try {
            const userCredential = await signInWithGoogle();

            // Create session after Google sign in
            if (userCredential.user) {
                await createSession(userCredential.user, rememberMe);
            }

            return userCredential;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown Google signin error';
            setError(errorMessage);
            throw error;
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            return await resetPassword(email);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown password reset error';
            setError(errorMessage);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Get current user ID before logging out
            const uid = user?.uid;

            // Firebase client logout
            await logOut();

            // Clear remember me preference
            saveRememberMePreference(false);

            // If we had a user, also revoke the server session
            if (uid) {
                await fetch('/api/auth/session', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid }),
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown logout error';
            console.error('Logout error:', errorMessage);
            setError(errorMessage);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signUp,
            signIn,
            googleSignIn,
            forgotPassword,
            logout,
            error,
            setError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily access the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};