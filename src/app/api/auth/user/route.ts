import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/auth-session-server'

// Get current authenticated user from session cookie
export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401 }
            )
        }

        return NextResponse.json({
            authenticated: true,
            user
        })
    } catch (error) {
        console.error('Error getting current user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}