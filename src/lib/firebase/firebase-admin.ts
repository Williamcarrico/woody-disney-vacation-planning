import admin from 'firebase-admin'
import { getApps } from 'firebase-admin/app'

// Format private key correctly if it's in environment variable format
function formatPrivateKey(key: string) {
    // Remove any quotes if present
    const unquotedKey = key.replace(/^["']|["']$/g, '')

    // Replace literal \n with actual newlines
    return unquotedKey.replace(/\\n/g, '\n')
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

    // Debug private key format (first few characters for safety)
    console.log('Private key format check:', {
        length: privateKey.length,
        startsWith: privateKey.substring(0, 27),
        containsNewlines: privateKey.includes('\n'),
        containsLiteralNewlines: privateKey.includes('\\n')
    })

    // Only initialize once
    if (getApps().length === 0) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    // Format the private key correctly
                    privateKey: formatPrivateKey(privateKey),
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