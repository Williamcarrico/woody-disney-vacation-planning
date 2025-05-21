import admin from 'firebase-admin'
import { getApps } from 'firebase-admin/app'

// Format private key correctly if it's in environment variable format
function formatPrivateKey(key: string) {
    if (!key) return '';

    // Remove any quotes if present
    const unquotedKey = key.replace(/^["']|["']$/g, '')

    // Replace literal \n with actual newlines
    const formattedKey = unquotedKey.replace(/\\n/g, '\n')

    // Check if the key is properly formatted
    if (!formattedKey.includes('BEGIN PRIVATE KEY') || !formattedKey.includes('END PRIVATE KEY')) {
        console.warn('Warning: Private key may not be properly formatted')
    }

    return formattedKey
}

export function initAdmin() {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    if (!clientEmail) {
        throw new Error('Missing Firebase Admin credentials: FIREBASE_CLIENT_EMAIL not set')
    }

    if (!projectId) {
        throw new Error('Missing Firebase Admin credentials: NEXT_PUBLIC_FIREBASE_PROJECT_ID not set')
    }

    if (!privateKey) {
        throw new Error('Missing Firebase Admin credentials: FIREBASE_PRIVATE_KEY not set')
    }

    // Only initialize once
    if (getApps().length === 0) {
        try {
            // Format the private key
            const formattedKey = formatPrivateKey(privateKey)

            // Initialize the app
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: formattedKey,
                }),
                databaseURL: `https://${projectId}.firebaseio.com`,
            })
            console.log('Firebase Admin initialized successfully');
        } catch (error) {
            console.error('Firebase Admin initialization error:', error);
            throw new Error(`Failed to initialize Firebase Admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    return admin
}

// Helper to get auth instance
export function getAuth() {
    return initAdmin().auth()
}

// Helper to get firestore instance
export function getFirestore() {
    return initAdmin().firestore()
}