import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/auth-session-server'
import { addMessageReaction } from '@/lib/firebase/realtime-database'

// POST - Add a reaction to a message
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { vacationId, messageId, reaction } = body

        if (!vacationId || !messageId || !reaction) {
            return NextResponse.json(
                { error: 'Vacation ID, message ID, and reaction are required' },
                { status: 400 }
            )
        }

        // Validate reaction type
        const validReactions = ['like', 'love', 'laugh', 'wow', 'sad', 'angry', 'thumbsUp', 'thumbsDown']
        if (!validReactions.includes(reaction)) {
            return NextResponse.json(
                { error: 'Invalid reaction type' },
                { status: 400 }
            )
        }

        // Authenticate user
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // TODO: Verify user has access to this vacation
        // For now, we'll trust the authentication

        // Add reaction to Firebase Realtime Database
        await addMessageReaction(vacationId, messageId, currentUser.uid, reaction)

        return NextResponse.json({
            success: true,
            messageId,
            reaction,
            userId: currentUser.uid,
            timestamp: Date.now()
        })

    } catch (error) {
        console.error('Error adding reaction:', error)
        return NextResponse.json(
            { error: 'Failed to add reaction' },
            { status: 500 }
        )
    }
}

// DELETE - Remove a reaction from a message
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const vacationId = searchParams.get('vacationId')
        const messageId = searchParams.get('messageId')

        if (!vacationId || !messageId) {
            return NextResponse.json(
                { error: 'Vacation ID and message ID are required' },
                { status: 400 }
            )
        }

        // Authenticate user
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // TODO: Verify user has access to this vacation
        // For now, we'll trust the authentication

        // Remove reaction by setting it to null (Firebase way to delete)
        await addMessageReaction(vacationId, messageId, currentUser.uid, '')

        return NextResponse.json({
            success: true,
            messageId,
            userId: currentUser.uid,
            timestamp: Date.now()
        })

    } catch (error) {
        console.error('Error removing reaction:', error)
        return NextResponse.json(
            { error: 'Failed to remove reaction' },
            { status: 500 }
        )
    }
}