import { NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

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
        socket.on('authenticate', async (data) => {
            try {
                const { vacationId, userId, userName } = data

                // Validate user session (you might want to pass session token)
                if (!userId || !userName) {
                    socket.emit('auth_error', { message: 'Invalid authentication data' })
                    return
                }

                // Join vacation room
                if (vacationId) {
                    await socket.join(`vacation:${vacationId}`)
                    console.log(`User ${userName} joined vacation room: ${vacationId}`)
                }

                // Store user info in socket
                socket.data = { userId, userName, vacationId }

                // Notify successful authentication
                socket.emit('authenticated', { success: true })

                // Notify others in the room
                socket.to(`vacation:${vacationId}`).emit('user_joined', {
                    userId,
                    userName,
                    timestamp: Date.now()
                })
            } catch (error) {
                console.error('Authentication error:', error)
                socket.emit('auth_error', { message: 'Authentication failed' })
            }
        })

        // Handle sending messages
        socket.on('send_message', async (messageData) => {
            try {
                const { vacationId, content, type = 'text', replyTo, attachments } = messageData
                const { userId, userName } = socket.data

                if (!userId || !userName || !vacationId) {
                    socket.emit('message_error', { message: 'Not authenticated' })
                    return
                }

                // Create message object
                const message = {
                    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId,
                    userName,
                    content,
                    type,
                    timestamp: Date.now(),
                    vacationId,
                    replyTo,
                    attachments,
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
        socket.on('add_reaction', async (reactionData) => {
            try {
                const { messageId, reaction, vacationId } = reactionData
                const { userId, userName } = socket.data

                if (!userId || !vacationId) {
                    socket.emit('reaction_error', { message: 'Not authenticated' })
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
        socket.on('typing_start', (data) => {
            const { vacationId } = data
            const { userId, userName } = socket.data

            if (userId && vacationId) {
                socket.to(`vacation:${vacationId}`).emit('user_typing', {
                    userId,
                    userName,
                    isTyping: true
                })
            }
        })

        socket.on('typing_stop', (data) => {
            const { vacationId } = data
            const { userId, userName } = socket.data

            if (userId && vacationId) {
                socket.to(`vacation:${vacationId}`).emit('user_typing', {
                    userId,
                    userName,
                    isTyping: false
                })
            }
        })

        // Handle location sharing
        socket.on('share_location', async (locationData) => {
            try {
                const { vacationId, latitude, longitude, accuracy, message } = locationData
                const { userId, userName } = socket.data

                if (!userId || !vacationId) {
                    socket.emit('location_error', { message: 'Not authenticated' })
                    return
                }

                const locationUpdate = {
                    userId,
                    userName,
                    latitude,
                    longitude,
                    accuracy,
                    message,
                    timestamp: Date.now(),
                    isEmergency: locationData.isEmergency || false
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
        socket.on('voice_message', async (voiceData) => {
            try {
                const { vacationId, duration } = voiceData
                const { userId, userName } = socket.data

                if (!userId || !vacationId) {
                    socket.emit('voice_error', { message: 'Not authenticated' })
                    return
                }

                // In a real implementation, you'd upload the audio blob to storage
                // For now, we'll just broadcast the voice message metadata
                const voiceMessage = {
                    id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId,
                    userName,
                    type: 'voice',
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
            const { userId, userName, vacationId } = socket.data || {}

            if (vacationId && userId) {
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