import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/auth-session-server'
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { firestore } from '@/lib/firebase/firebase.config'

interface FCMTokenData {
    userId: string
    token: string
    timestamp: number
    userAgent?: string
    platform?: string
    lastUsed?: number
}

/**
 * POST - Save FCM token for user
 */
export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { userId, token, timestamp, userAgent, platform } = await request.json()

        // Validate required fields
        if (!userId || !token) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, token' },
                { status: 400 }
            )
        }

        // Ensure user can only manage their own tokens
        if (currentUser.uid !== userId) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // Save FCM token to Firestore
        const tokenData: FCMTokenData = {
            userId,
            token,
            timestamp: timestamp || Date.now(),
            userAgent,
            platform,
            lastUsed: Date.now()
        }

        // Use token as document ID to prevent duplicates
        const tokenHash = Buffer.from(token).toString('base64').slice(0, 32)
        const docRef = doc(firestore, 'fcmTokens', tokenHash)

        await setDoc(docRef, tokenData)

        // Also store in user's profile for quick access
        const userRef = doc(firestore, 'users', userId)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
            await setDoc(userRef, {
                fcmToken: token,
                fcmTokenUpdated: Date.now()
            }, { merge: true })
        }

        return NextResponse.json({
            success: true,
            message: 'FCM token saved successfully',
            tokenId: tokenHash
        })

    } catch (error) {
        console.error('Error saving FCM token:', error)
        return NextResponse.json(
            { error: 'Failed to save FCM token' },
            { status: 500 }
        )
    }
}

/**
 * DELETE - Remove FCM token for user
 */
export async function DELETE(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { userId, token } = await request.json()

        // Validate required fields
        if (!userId || !token) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, token' },
                { status: 400 }
            )
        }

        // Ensure user can only manage their own tokens
        if (currentUser.uid !== userId) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // Remove FCM token from Firestore
        const tokenHash = Buffer.from(token).toString('base64').slice(0, 32)
        const docRef = doc(firestore, 'fcmTokens', tokenHash)

        await deleteDoc(docRef)

        // Remove from user's profile
        const userRef = doc(firestore, 'users', userId)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
            await setDoc(userRef, {
                fcmToken: null,
                fcmTokenUpdated: Date.now()
            }, { merge: true })
        }

        return NextResponse.json({
            success: true,
            message: 'FCM token removed successfully'
        })

    } catch (error) {
        console.error('Error removing FCM token:', error)
        return NextResponse.json(
            { error: 'Failed to remove FCM token' },
            { status: 500 }
        )
    }
}

/**
 * GET - Get user's FCM tokens
 */
export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId parameter' },
                { status: 400 }
            )
        }

        // Ensure user can only access their own tokens
        if (currentUser.uid !== userId) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // Get FCM token from user's profile
        const userRef = doc(firestore, 'users', userId)
        const userDoc = await getDoc(userRef)

        if (!userDoc.exists()) {
            return NextResponse.json({
                success: true,
                fcmToken: null,
                message: 'User not found'
            })
        }

        const userData = userDoc.data()

        return NextResponse.json({
            success: true,
            fcmToken: userData.fcmToken || null,
            fcmTokenUpdated: userData.fcmTokenUpdated || null
        })

    } catch (error) {
        console.error('Error getting FCM token:', error)
        return NextResponse.json(
            { error: 'Failed to get FCM token' },
            { status: 500 }
        )
    }
}