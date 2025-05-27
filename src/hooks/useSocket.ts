'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'
import type {
    MessageAttachment,
    SocketMessage,
    LocationUpdate,
    TypingUser,
    UseSocketOptions
} from '@/types/messaging'

export function useSocket(options: UseSocketOptions) {
    const { vacationId, onMessage, onLocationUpdate, onUserTyping, onUserJoined, onUserLeft, onReaction } = options
    const { user } = useAuth()
    const socketRef = useRef<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const [reconnectAttempts, setReconnectAttempts] = useState(0)

    // Initialize socket connection
    useEffect(() => {
        if (!user || !vacationId) return

        // Create socket connection
        const socket = io({
            path: '/api/socket',
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        })

        socketRef.current = socket

        // Connection event handlers
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id)
            setIsConnected(true)
            setConnectionError(null)
            setReconnectAttempts(0)

            // Authenticate with the server
            socket.emit('authenticate', {
                vacationId,
                userId: user.uid,
                userName: user.displayName || user.email || 'Unknown User'
            })
        })

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason)
            setIsConnected(false)
            setIsAuthenticated(false)
        })

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
            setConnectionError(error.message)
            setReconnectAttempts(prev => prev + 1)
        })

        socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts')
            setReconnectAttempts(0)
        })

        socket.on('reconnect_error', (error) => {
            console.error('Socket reconnection error:', error)
            setReconnectAttempts(prev => prev + 1)
        })

        // Authentication event handlers
        socket.on('authenticated', (data) => {
            console.log('Socket authenticated:', data)
            setIsAuthenticated(true)
        })

        socket.on('auth_error', (error) => {
            console.error('Socket authentication error:', error)
            setConnectionError(error.message)
            setIsAuthenticated(false)
        })

        // Message event handlers
        socket.on('receive_message', (message: SocketMessage) => {
            console.log('Received message:', message)
            onMessage?.(message)
        })

        socket.on('message_reaction', (reaction) => {
            console.log('Received reaction:', reaction)
            onReaction?.(reaction)
        })

        // User presence event handlers
        socket.on('user_joined', (user) => {
            console.log('User joined:', user)
            onUserJoined?.(user)
        })

        socket.on('user_left', (user) => {
            console.log('User left:', user)
            onUserLeft?.(user)
        })

        socket.on('user_typing', (user: TypingUser) => {
            onUserTyping?.(user)
        })

        // Location event handlers
        socket.on('location_update', (location: LocationUpdate) => {
            console.log('Received location update:', location)
            onLocationUpdate?.(location)
        })

        // Error handlers
        socket.on('message_error', (error) => {
            console.error('Message error:', error)
        })

        socket.on('location_error', (error) => {
            console.error('Location error:', error)
        })

        socket.on('voice_error', (error) => {
            console.error('Voice error:', error)
        })

        socket.on('reaction_error', (error) => {
            console.error('Reaction error:', error)
        })

        // Cleanup on unmount
        return () => {
            console.log('Cleaning up socket connection')
            socket.disconnect()
            socketRef.current = null
            setIsConnected(false)
            setIsAuthenticated(false)
        }
    }, [user, vacationId, onMessage, onLocationUpdate, onUserTyping, onUserJoined, onUserLeft, onReaction])

    // Send message function
    const sendMessage = useCallback((content: string, type: SocketMessage['type'] = 'text', replyTo?: string, attachments?: MessageAttachment[]) => {
        if (!socketRef.current || !isAuthenticated) {
            console.warn('Socket not connected or not authenticated')
            return false
        }

        socketRef.current.emit('send_message', {
            vacationId,
            content,
            type,
            replyTo,
            attachments
        })

        return true
    }, [vacationId, isAuthenticated])

    // Send reaction function
    const sendReaction = useCallback((messageId: string, reaction: string) => {
        if (!socketRef.current || !isAuthenticated) {
            console.warn('Socket not connected or not authenticated')
            return false
        }

        socketRef.current.emit('add_reaction', {
            vacationId,
            messageId,
            reaction
        })

        return true
    }, [vacationId, isAuthenticated])

    // Share location function
    const shareLocation = useCallback((latitude: number, longitude: number, accuracy?: number, message?: string, isEmergency = false) => {
        if (!socketRef.current || !isAuthenticated) {
            console.warn('Socket not connected or not authenticated')
            return false
        }

        socketRef.current.emit('share_location', {
            vacationId,
            latitude,
            longitude,
            accuracy,
            message,
            isEmergency
        })

        return true
    }, [vacationId, isAuthenticated])

    // Send voice message function
    const sendVoiceMessage = useCallback((audioBlob: Blob, duration: number) => {
        if (!socketRef.current || !isAuthenticated) {
            console.warn('Socket not connected or not authenticated')
            return false
        }

        // In a real implementation, you'd upload the audio blob to storage first
        // For now, we'll just send the metadata
        socketRef.current.emit('voice_message', {
            vacationId,
            audioBlob: null, // Would be the storage URL
            duration
        })

        return true
    }, [vacationId, isAuthenticated])

    // Typing indicator functions
    const startTyping = useCallback(() => {
        if (!socketRef.current || !isAuthenticated) return

        socketRef.current.emit('typing_start', { vacationId })
    }, [vacationId, isAuthenticated])

    const stopTyping = useCallback(() => {
        if (!socketRef.current || !isAuthenticated) return

        socketRef.current.emit('typing_stop', { vacationId })
    }, [vacationId, isAuthenticated])

    // Reconnect function
    const reconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.connect()
        }
    }, [])

    return {
        isConnected,
        isAuthenticated,
        connectionError,
        reconnectAttempts,
        sendMessage,
        sendReaction,
        shareLocation,
        sendVoiceMessage,
        startTyping,
        stopTyping,
        reconnect,
        socket: socketRef.current
    }
}