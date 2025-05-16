"use client"; // This tells Next.js this is a client component

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserCredential, getIdToken } from 'firebase/auth'; // Import User type and getIdToken
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
    signUp: (email: string, password: string, displayName: string) => Promise<UserCredential>;
    signIn: (email: string, password: string) => Promise<UserCredential>;
    googleSignIn: () => Promise<UserCredential>;
    forgotPassword: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
    setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Creates a server-side session
    const createSession = async (user: User) => {
        try {
            console.log('Creating session for user:', user.uid);
            // Get the ID token with true to force refresh
            const idToken = await getIdToken(user, true);
            console.log('Got ID token, calling session API');

            // Call API route to create session cookie
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
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
    };

    useEffect(() => {
        // onAuthStateChanged runs client-side and listens for changes
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            setUser(firebaseUser);

            // If user is logged in, create a session
            if (firebaseUser) {
                await createSession(firebaseUser);
            }

            setLoading(false); // Done checking initial state
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    }, []); // Empty dependency array means this runs once on mount

    const signUp = async (email: string, password: string, displayName: string) => {
        try {
            const userCredential = await signUpWithEmail(email, password, displayName);

            // Create session after signup
            if (userCredential.user) {
                await createSession(userCredential.user);
            }

            return userCredential;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown signup error';
            setError(errorMessage);
            throw error;
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmail(email, password);

            // Create session after sign in
            if (userCredential.user) {
                await createSession(userCredential.user);
            }

            return userCredential;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown signin error';
            setError(errorMessage);
            throw error;
        }
    };

    const googleSignIn = async () => {
        try {
            const userCredential = await signInWithGoogle();

            // Create session after Google sign in
            if (userCredential.user) {
                await createSession(userCredential.user);
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