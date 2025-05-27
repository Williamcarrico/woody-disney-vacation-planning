import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/auth-session-server'
import {
    sendGroupMessage,
    editMessage,
    removeMessage} from '@/lib/firebase/realtime-database'
import { ref, get } from 'firebase/database'
import { database } from '@/lib/firebase/firebase.config'
import {
    verifyMessagePermissions,
    validateIds,
    validateMessageContent,
    validateMessageType
} from '@/lib/utils/vacation-access'



/**
 * Get message details from Firebase Realtime Database
 * @param vacationId - The vacation ID
 * @param messageId - The message ID
 * @returns Promise<{ userId?: string, content?: string, timestamp?: number } | null>
 */
async function getMessageDetails(
    vacationId: string,
    messageId: string
): Promise<{ userId?: string, content?: string, timestamp?: number } | null> {
    try {
        const messageRef = ref(database, `groupMessages/${vacationId}/${messageId}`)
        const snapshot = await get(messageRef)

        if (!snapshot.exists()) {
            return null
        }

        return snapshot.val()
    } catch (error) {
        console.error('Error fetching message details:', error)
        return null
    }
}



// GET - Retrieve messages for a vacation
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const vacationId = searchParams.get('vacationId')
        const limit = parseInt(searchParams.get('limit') || '50')

        if (!vacationId) {
            return NextResponse.json(
                { error: 'Vacation ID is required' },
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

        // Verify user has access to this vacation and can read messages
        const permissionCheck = await verifyMessagePermissions(
            vacationId,
            currentUser.uid,
            'read'
        )

        if (!permissionCheck.canPerform) {
            return NextResponse.json(
                {
                    error: 'Access denied',
                    details: permissionCheck.error
                },
                { status: 403 }
            )
        }

        // Note: For real-time listening, this would typically be handled by the client
        // This endpoint is mainly for initial message loading or pagination
        return NextResponse.json({
            success: true,
            message: 'Use real-time listeners for message retrieval',
            vacationId,
            limit,
            userRole: permissionCheck.userRole,
            permissions: {
                canSend: true,
                canEdit: permissionCheck.userRole === 'owner',
                canDelete: permissionCheck.userRole === 'owner'
            }
        })

    } catch (error) {
        console.error('Error retrieving messages:', error)
        return NextResponse.json(
            { error: 'Failed to retrieve messages' },
            { status: 500 }
        )
    }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            vacationId,
            content,
            type = 'text',
            replyTo: _replyTo,
            attachments: _attachments,
            location: _location,
            voiceMessage: _voiceMessage
        } = body

        // Validate required fields
        if (!vacationId || !content) {
            return NextResponse.json(
                { error: 'Vacation ID and content are required' },
                { status: 400 }
            )
        }

        // Validate IDs format
        const idValidation = validateIds(vacationId)
        if (!idValidation.isValid) {
            return NextResponse.json(
                { error: idValidation.error },
                { status: 400 }
            )
        }

        // Validate content
        const contentValidation = validateMessageContent(content)
        if (!contentValidation.isValid) {
            return NextResponse.json(
                { error: contentValidation.error },
                { status: 400 }
            )
        }

        // Validate message type
        const typeValidation = validateMessageType(type)
        if (!typeValidation.isValid) {
            return NextResponse.json(
                { error: typeValidation.error },
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

        // Verify user has access to this vacation and can send messages
        const permissionCheck = await verifyMessagePermissions(
            vacationId,
            currentUser.uid,
            'send'
        )

        if (!permissionCheck.canPerform) {
            return NextResponse.json(
                {
                    error: 'Access denied',
                    details: permissionCheck.error
                },
                { status: 403 }
            )
        }

        // Send message to Firebase Realtime Database
        const messageId = await sendGroupMessage(
            vacationId,
            currentUser.uid,
            currentUser.email || 'Unknown User', // You might want to get display name from user profile
            content,
            type,
            undefined // photoURL - you might want to get this from user profile
        )

        return NextResponse.json({
            success: true,
            messageId,
            timestamp: Date.now(),
            userRole: permissionCheck.userRole,
            message: 'Message sent successfully'
        })

    } catch (error) {
        console.error('Error sending message:', error)
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        )
    }
}

// PUT - Edit an existing message
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { vacationId, messageId, content } = body

        // Validate required fields
        if (!vacationId || !messageId || !content) {
            return NextResponse.json(
                { error: 'Vacation ID, message ID, and content are required' },
                { status: 400 }
            )
        }

        // Validate content length
        if (content.length > 2000) {
            return NextResponse.json(
                { error: 'Message content too long (max 2000 characters)' },
                { status: 400 }
            )
        }

        // Validate IDs format (basic check)
        if (vacationId.length < 10 || messageId.length < 10) {
            return NextResponse.json(
                { error: 'Invalid vacation ID or message ID format' },
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

        // First, fetch the message to verify ownership
        const messageDetails = await getMessageDetails(vacationId, messageId)

        if (!messageDetails) {
            return NextResponse.json(
                { error: 'Message not found' },
                { status: 404 }
            )
        }

        // Verify user has access to this vacation and can edit this message
        const permissionCheck = await verifyMessagePermissions(
            vacationId,
            currentUser.uid,
            'edit',
            messageDetails.userId // Pass the actual message author's ID
        )

        if (!permissionCheck.canPerform) {
            return NextResponse.json(
                {
                    error: 'Access denied',
                    details: permissionCheck.error
                },
                { status: 403 }
            )
        }

        // Edit message in Firebase Realtime Database
        await editMessage(vacationId, messageId, content)

        return NextResponse.json({
            success: true,
            messageId,
            timestamp: Date.now(),
            userRole: permissionCheck.userRole,
            message: 'Message edited successfully'
        })

    } catch (error) {
        console.error('Error editing message:', error)
        return NextResponse.json(
            { error: 'Failed to edit message' },
            { status: 500 }
        )
    }
}

// DELETE - Remove a message
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const vacationId = searchParams.get('vacationId')
        const messageId = searchParams.get('messageId')

        // Validate required fields
        if (!vacationId || !messageId) {
            return NextResponse.json(
                { error: 'Vacation ID and message ID are required' },
                { status: 400 }
            )
        }

        // Validate IDs format (basic check)
        if (vacationId.length < 10 || messageId.length < 10) {
            return NextResponse.json(
                { error: 'Invalid vacation ID or message ID format' },
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

        // First, fetch the message to verify ownership
        const messageDetails = await getMessageDetails(vacationId, messageId)

        if (!messageDetails) {
            return NextResponse.json(
                { error: 'Message not found' },
                { status: 404 }
            )
        }

        // Verify user has access to this vacation and can delete this message
        const permissionCheck = await verifyMessagePermissions(
            vacationId,
            currentUser.uid,
            'delete',
            messageDetails.userId // Pass the actual message author's ID
        )

        if (!permissionCheck.canPerform) {
            return NextResponse.json(
                {
                    error: 'Access denied',
                    details: permissionCheck.error
                },
                { status: 403 }
            )
        }

        // Remove message from Firebase Realtime Database
        await removeMessage(vacationId, messageId)

        return NextResponse.json({
            success: true,
            messageId,
            userRole: permissionCheck.userRole,
            message: 'Message deleted successfully'
        })

    } catch (error) {
        console.error('Error deleting message:', error)
        return NextResponse.json(
            { error: 'Failed to delete message' },
            { status: 500 }
        )
    }
}