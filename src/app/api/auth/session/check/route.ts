import { NextRequest, NextResponse } from 'next/server'
import { validateSessionCookie } from '@/lib/firebase/auth-session'

export async function GET(request: NextRequest) {
    try {
        // Validate the session cookie and check if rotation is needed
        const sessionResult = await validateSessionCookie(request)

        if (!sessionResult.isValid) {
            return NextResponse.json(
                { isAuthenticated: false },
                { status: 401 }
            )
        }

        // Include needsRotation flag in response
        return NextResponse.json({
            isAuthenticated: true,
            needsRotation: sessionResult.needsRotation || false
        })
    } catch (error) {
        console.error('Session check error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}