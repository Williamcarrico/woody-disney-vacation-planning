'use client'

import { useEffect, useRef, useReducer, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'
import type {
    MessageAttachment,
    SocketMessage,
    LocationUpdate,
    TypingUser,
    UseSocketOptions
} from '@/types/messaging'

// =============================================================================
// STATE MANAGEMENT WITH REDUCER
// =============================================================================

interface SocketState {
    isConnected: boolean
    isAuthenticated: boolean
    connectionError: string | null
    reconnectAttempts: number
}

type SocketAction = 
    | { type: 'CONNECTED' }
    | { type: 'DISCONNECTED' }
    | { type: 'AUTHENTICATED' }
    | { type: 'AUTH_ERROR'; payload: string }
    | { type: 'CONNECTION_ERROR'; payload: string }
    | { type: 'RECONNECT_ATTEMPT' }
    | { type: 'RECONNECT_SUCCESS' }
    | { type: 'RESET_ATTEMPTS' }

const initialState: SocketState = {
    isConnected: false,
    isAuthenticated: false,
    connectionError: null,
    reconnectAttempts: 0
}

function socketReducer(state: SocketState, action: SocketAction): SocketState {
    switch (action.type) {
        case 'CONNECTED':
            return {
                ...state,
                isConnected: true,
                connectionError: null,
                reconnectAttempts: 0
            }
        case 'DISCONNECTED':
            return {
                ...state,
                isConnected: false,
                isAuthenticated: false
            }
        case 'AUTHENTICATED':
            return {
                ...state,
                isAuthenticated: true
            }
        case 'AUTH_ERROR':
            return {
                ...state,
                isAuthenticated: false,
                connectionError: action.payload
            }
        case 'CONNECTION_ERROR':
            return {
                ...state,
                connectionError: action.payload,
                reconnectAttempts: state.reconnectAttempts + 1
            }
        case 'RECONNECT_ATTEMPT':
            return {
                ...state,
                reconnectAttempts: state.reconnectAttempts + 1
            }
        case 'RECONNECT_SUCCESS':
            return {
                ...state,
                reconnectAttempts: 0
            }
        case 'RESET_ATTEMPTS':
            return {
                ...state,
                reconnectAttempts: 0
            }
        default:
            return state
    }
}

export function useSocket(options: UseSocketOptions) {
    const { vacationId, onMessage, onLocationUpdate, onUserTyping, onUserJoined, onUserLeft, onReaction } = options
    const { user } = useAuth()
    const socketRef = useRef<Socket | null>(null)
    const [state, dispatch] = useReducer(socketReducer, initialState)

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
            dispatch({ type: 'CONNECTED' })

            // Authenticate with the server
            socket.emit('authenticate', {
                vacationId,
                userId: user.uid,
                userName: user.displayName || user.email || 'Unknown User'
            })
        })

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason)
            dispatch({ type: 'DISCONNECTED' })
        })

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
            dispatch({ type: 'CONNECTION_ERROR', payload: error.message })
        })

        socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts')
            dispatch({ type: 'RECONNECT_SUCCESS' })
        })

        socket.on('reconnect_error', (error) => {
            console.error('Socket reconnection error:', error)
            dispatch({ type: 'RECONNECT_ATTEMPT' })
        })

        // Authentication event handlers
        socket.on('authenticated', (data) => {
            console.log('Socket authenticated:', data)
            dispatch({ type: 'AUTHENTICATED' })
        })

        socket.on('auth_error', (error) => {
            console.error('Socket authentication error:', error)
            dispatch({ type: 'AUTH_ERROR', payload: error.message })
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
            dispatch({ type: 'DISCONNECTED' })
        }
    }, [user, vacationId, onMessage, onLocationUpdate, onUserTyping, onUserJoined, onUserLeft, onReaction])

    // Send message function
    const sendMessage = useCallback((content: string, type: SocketMessage['type'] = 'text', replyTo?: string, attachments?: MessageAttachment[]) => {
        if (!socketRef.current || !state.isAuthenticated) {
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
    }, [vacationId, state.isAuthenticated])

    // Send reaction function
    const sendReaction = useCallback((messageId: string, reaction: string) => {
        if (!socketRef.current || !state.isAuthenticated) {
            console.warn('Socket not connected or not authenticated')
            return false
        }

        socketRef.current.emit('add_reaction', {
            vacationId,
            messageId,
            reaction
        })

        return true
    }, [vacationId, state.isAuthenticated])

    // Share location function
    const shareLocation = useCallback((latitude: number, longitude: number, accuracy?: number, message?: string, isEmergency = false) => {
        if (!socketRef.current || !state.isAuthenticated) {
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
    }, [vacationId, state.isAuthenticated])

    // Send voice message function
    const sendVoiceMessage = useCallback((audioBlob: Blob, duration: number) => {
        if (!socketRef.current || !state.isAuthenticated) {
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
    }, [vacationId, state.isAuthenticated])

    // Typing indicator functions
    const startTyping = useCallback(() => {
        if (!socketRef.current || !state.isAuthenticated) return

        socketRef.current.emit('typing_start', { vacationId })
    }, [vacationId, state.isAuthenticated])

    const stopTyping = useCallback(() => {
        if (!socketRef.current || !state.isAuthenticated) return

        socketRef.current.emit('typing_stop', { vacationId })
    }, [vacationId, state.isAuthenticated])

    // Reconnect function
    const reconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.connect()
        }
    }, [])

    return {
        ...state,
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