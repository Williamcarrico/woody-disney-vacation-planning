import { NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

// Type definitions for Socket.IO server data
interface SocketData {
    userId?: string
    userName?: string
    vacationId?: string
}

interface AuthenticateData {
    vacationId?: string
    userId?: string
    userName?: string
}

interface MessageData {
    vacationId?: string
    content?: string
    type?: string
    replyTo?: string
    attachments?: unknown[]
}

interface ReactionData {
    messageId?: string
    reaction?: string
    vacationId?: string
}

interface LocationData {
    vacationId?: string
    latitude?: number
    longitude?: number
    accuracy?: number
    message?: string
    isEmergency?: boolean
}

interface VoiceData {
    vacationId?: string
    duration?: number
}

interface TypingData {
    vacationId?: string
}

// Store the Socket.io server instance
let io: SocketIOServer | null = null

// Initialize Socket.io server
function initializeSocketServer(server: HTTPServer) {
    if (io) return io

    io = new SocketIOServer(server, {
        path: '/api/socket',
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? [process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com']
                : ['http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000
    })

    // Handle connections
    io.on('connection', async (socket) => {
        console.log('User connected:', socket.id)

        // Handle authentication
        socket.on('authenticate', async (data: unknown) => {
            try {
                // Type guard for authentication data
                if (!data || typeof data !== 'object') {
                    socket.emit('auth_error', { message: 'Invalid authentication data format' })
                    return
                }

                const authData = data as AuthenticateData
                const { vacationId, userId, userName } = authData

                // Validate user session (you might want to pass session token)
                if (!userId || !userName || typeof userId !== 'string' || typeof userName !== 'string') {
                    socket.emit('auth_error', { message: 'Invalid authentication data' })
                    return
                }

                // Join vacation room
                if (vacationId && typeof vacationId === 'string') {
                    await socket.join(`vacation:${vacationId}`)
                    console.log(`User ${userName} joined vacation room: ${vacationId}`)
                }

                // Store user info in socket with proper typing
                const socketData: SocketData = { userId, userName, vacationId }
                socket.data = socketData

                // Notify successful authentication
                socket.emit('authenticated', { success: true })

                // Notify others in the room
                if (vacationId) {
                    socket.to(`vacation:${vacationId}`).emit('user_joined', {
                        userId,
                        userName,
                        timestamp: Date.now()
                    })
                }
            } catch (error) {
                console.error('Authentication error:', error)
                socket.emit('auth_error', { message: 'Authentication failed' })
            }
        })

        // Handle sending messages
        socket.on('send_message', async (messageData: unknown) => {
            try {
                // Type guard for message data
                if (!messageData || typeof messageData !== 'object') {
                    socket.emit('message_error', { message: 'Invalid message data format' })
                    return
                }

                const msgData = messageData as MessageData
                const { vacationId, content, type = 'text', replyTo, attachments } = msgData
                
                // Safe access to socket.data with type assertion
                const socketData = socket.data as SocketData | undefined
                const userId = socketData?.userId
                const userName = socketData?.userName

                if (!userId || !userName || !vacationId || typeof content !== 'string') {
                    socket.emit('message_error', { message: 'Not authenticated or invalid message content' })
                    return
                }

                // Create message object
                const message = {
                    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    userId,
                    userName,
                    content,
                    type: typeof type === 'string' ? type : 'text',
                    timestamp: Date.now(),
                    vacationId,
                    replyTo: typeof replyTo === 'string' ? replyTo : undefined,
                    attachments: Array.isArray(attachments) ? attachments : undefined,
                    reactions: {},
                    edited: false
                }

                // Broadcast to all users in the vacation room
                io?.to(`vacation:${vacationId}`).emit('receive_message', message)

                // Acknowledge message sent
                socket.emit('message_sent', { messageId: message.id, timestamp: message.timestamp })

                console.log(`Message sent in vacation ${vacationId} by ${userName}`)
            } catch (error) {
                console.error('Error sending message:', error)
                socket.emit('message_error', { message: 'Failed to send message' })
            }
        })

        // Handle message reactions
        socket.on('add_reaction', async (reactionData: unknown) => {
            try {
                // Type guard for reaction data
                if (!reactionData || typeof reactionData !== 'object') {
                    socket.emit('reaction_error', { message: 'Invalid reaction data format' })
                    return
                }

                const reactData = reactionData as ReactionData
                const { messageId, reaction, vacationId } = reactData
                
                // Safe access to socket.data
                const socketData = socket.data as SocketData | undefined
                const userId = socketData?.userId
                const userName = socketData?.userName

                if (!userId || !vacationId || typeof messageId !== 'string' || typeof reaction !== 'string') {
                    socket.emit('reaction_error', { message: 'Not authenticated or invalid reaction data' })
                    return
                }

                // Broadcast reaction to all users in the room
                io?.to(`vacation:${vacationId}`).emit('message_reaction', {
                    messageId,
                    userId,
                    userName,
                    reaction,
                    timestamp: Date.now()
                })

                console.log(`Reaction ${reaction} added to message ${messageId} by ${userName}`)
            } catch (error) {
                console.error('Error adding reaction:', error)
                socket.emit('reaction_error', { message: 'Failed to add reaction' })
            }
        })

        // Handle typing indicators
        socket.on('typing_start', (data: unknown) => {
            // Type guard for typing data
            if (!data || typeof data !== 'object') {
                return
            }

            const typingData = data as TypingData
            const { vacationId } = typingData
            
            // Safe access to socket.data
            const socketData = socket.data as SocketData | undefined
            const userId = socketData?.userId
            const userName = socketData?.userName

            if (userId && userName && vacationId && typeof vacationId === 'string') {
                socket.to(`vacation:${vacationId}`).emit('user_typing', {
                    userId,
                    userName,
                    isTyping: true
                })
            }
        })

        socket.on('typing_stop', (data: unknown) => {
            // Type guard for typing data
            if (!data || typeof data !== 'object') {
                return
            }

            const typingData = data as TypingData
            const { vacationId } = typingData
            
            // Safe access to socket.data
            const socketData = socket.data as SocketData | undefined
            const userId = socketData?.userId
            const userName = socketData?.userName

            if (userId && userName && vacationId && typeof vacationId === 'string') {
                socket.to(`vacation:${vacationId}`).emit('user_typing', {
                    userId,
                    userName,
                    isTyping: false
                })
            }
        })

        // Handle location sharing
        socket.on('share_location', async (locationData: unknown) => {
            try {
                // Type guard for location data
                if (!locationData || typeof locationData !== 'object') {
                    socket.emit('location_error', { message: 'Invalid location data format' })
                    return
                }

                const locData = locationData as LocationData
                const { vacationId, latitude, longitude, accuracy, message } = locData
                
                // Safe access to socket.data
                const socketData = socket.data as SocketData | undefined
                const userId = socketData?.userId
                const userName = socketData?.userName

                if (!userId || !userName || !vacationId || typeof latitude !== 'number' || typeof longitude !== 'number') {
                    socket.emit('location_error', { message: 'Not authenticated or invalid location data' })
                    return
                }

                const locationUpdate = {
                    userId,
                    userName,
                    latitude,
                    longitude,
                    accuracy: typeof accuracy === 'number' ? accuracy : undefined,
                    message: typeof message === 'string' ? message : undefined,
                    timestamp: Date.now(),
                    isEmergency: Boolean(locData.isEmergency)
                }

                // Broadcast location to all users in the room
                io?.to(`vacation:${vacationId}`).emit('location_update', locationUpdate)

                console.log(`Location shared by ${userName} in vacation ${vacationId}`)
            } catch (error) {
                console.error('Error sharing location:', error)
                socket.emit('location_error', { message: 'Failed to share location' })
            }
        })

        // Handle voice message events
        socket.on('voice_message', async (voiceData: unknown) => {
            try {
                // Type guard for voice data
                if (!voiceData || typeof voiceData !== 'object') {
                    socket.emit('voice_error', { message: 'Invalid voice data format' })
                    return
                }

                const vData = voiceData as VoiceData
                const { vacationId, duration } = vData
                
                // Safe access to socket.data
                const socketData = socket.data as SocketData | undefined
                const userId = socketData?.userId
                const userName = socketData?.userName

                if (!userId || !userName || !vacationId || typeof duration !== 'number') {
                    socket.emit('voice_error', { message: 'Not authenticated or invalid voice data' })
                    return
                }

                // In a real implementation, you'd upload the audio blob to storage
                // For now, we'll just broadcast the voice message metadata
                const voiceMessage = {
                    id: `voice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    userId,
                    userName,
                    type: 'voice' as const,
                    duration,
                    timestamp: Date.now(),
                    vacationId
                }

                io?.to(`vacation:${vacationId}`).emit('receive_message', voiceMessage)

                console.log(`Voice message sent by ${userName} in vacation ${vacationId}`)
            } catch (error) {
                console.error('Error sending voice message:', error)
                socket.emit('voice_error', { message: 'Failed to send voice message' })
            }
        })

        // Handle disconnection
        socket.on('disconnect', () => {
            // Safe access to socket.data with proper typing
            const socketData = socket.data as SocketData | undefined
            const userId = socketData?.userId
            const userName = socketData?.userName
            const vacationId = socketData?.vacationId

            if (vacationId && userId && userName) {
                // Notify others in the room
                socket.to(`vacation:${vacationId}`).emit('user_left', {
                    userId,
                    userName,
                    timestamp: Date.now()
                })
            }

            console.log('User disconnected:', socket.id)
        })

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error)
        })
    })

    return io
}

// HTTP endpoint for Socket.io server info
export async function GET() {
    return NextResponse.json({
        message: 'Socket.io server endpoint',
        path: '/api/socket',
        status: io ? 'initialized' : 'not initialized'
    })
}

// Export the Socket.io server instance for use in other parts of the app
export { io, initializeSocketServer }