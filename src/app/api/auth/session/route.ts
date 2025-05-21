import { NextRequest, NextResponse } from 'next/server'
import { createSessionCookie, revokeSessionCookie, rotateSessionToken } from '@/lib/firebase/auth-session'

// Create a session (after successful login)
export async function POST(request: NextRequest) {
    try {
        console.log('Session API route called');
        const { idToken, rememberMe } = await request.json()

        if (!idToken) {
            console.error('idToken missing in request');
            return NextResponse.json(
                { error: 'idToken is required' },
                { status: 400 }
            )
        }

        console.log('Creating session cookie with Firebase Admin');
        const result = await createSessionCookie(idToken, rememberMe)

        if ('error' in result) {
            console.error('Error from createSessionCookie:', result.error);
            return NextResponse.json(
                { error: result.error },
                { status: 401 }
            )
        }

        console.log('Session created successfully');
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Session creation error details:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Session creation error:', errorMessage);
        return NextResponse.json(
            { error: `Internal server error: ${errorMessage}` },
            { status: 500 }
        )
    }
}

// Rotate a session token (for enhanced security)
export async function PATCH(request: NextRequest) {
    try {
        const { uid, rememberMe } = await request.json()

        if (!uid) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        const result = await rotateSessionToken(uid, rememberMe)

        if ('error' in result) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            customToken: result.customToken
        })
    } catch (error) {
        console.error('Token rotation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// End a session (logout)
export async function DELETE(request: NextRequest) {
    try {
        const { uid } = await request.json()

        if (!uid) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        const result = await revokeSessionCookie(uid)

        if ('error' in result) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Session deletion error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}