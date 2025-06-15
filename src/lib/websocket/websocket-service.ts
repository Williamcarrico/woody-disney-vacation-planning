/**
 * WebSocket Service for Real-time Features
 *
 * Provides real-time communication for resort updates, wait times,
 * user notifications, and collaborative features.
 */

import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { NextApiRequest } from 'next'
import { ResortService } from '@/lib/firebase/firestore-service'
import { resortCache } from '@/lib/cache/cache-service'

// Event types
export enum WebSocketEvents {
    // Connection events
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    JOIN_ROOM = 'join_room',
    LEAVE_ROOM = 'leave_room',

    // Resort events
    RESORT_UPDATED = 'resort_updated',
    RESORT_AVAILABILITY_CHANGED = 'resort_availability_changed',
    RESORT_PRICING_UPDATED = 'resort_pricing_updated',

    // Wait time events
    WAIT_TIME_UPDATED = 'wait_time_updated',
    PARK_STATUS_CHANGED = 'park_status_changed',

    // User events
    USER_NOTIFICATION = 'user_notification',
    USER_LOCATION_UPDATED = 'user_location_updated',
    USER_ITINERARY_UPDATED = 'user_itinerary_updated',

    // Collaborative events
    VACATION_MEMBER_JOINED = 'vacation_member_joined',
    VACATION_MEMBER_LEFT = 'vacation_member_left',
    VACATION_PLAN_UPDATED = 'vacation_plan_updated',

    // System events
    SYSTEM_MAINTENANCE = 'system_maintenance',
    CACHE_INVALIDATED = 'cache_invalidated',

    // Error events
    ERROR = 'error',
    RATE_LIMITED = 'rate_limited'
}

// Room types for organizing connections
export enum RoomTypes {
    RESORT = 'resort',
    PARK = 'park',
    USER = 'user',
    VACATION = 'vacation',
    GLOBAL = 'global'
}

// Message interfaces
interface BaseMessage {
    timestamp: string
    userId?: string
    sessionId: string
}

interface ResortUpdateMessage extends BaseMessage {
    resortId: string
    changes: Partial<any>
    type: 'availability' | 'pricing' | 'amenities' | 'general'
}

interface WaitTimeMessage extends BaseMessage {
    parkId: string
    attractionId: string
    waitTime: number
    status: 'operating' | 'down' | 'closed'
}

interface UserNotificationMessage extends BaseMessage {
    userId: string
    type: 'info' | 'warning' | 'error' | 'success'
    title: string
    message: string
    actionUrl?: string
}

interface VacationUpdateMessage extends BaseMessage {
    vacationId: string
    memberId: string
    action: 'joined' | 'left' | 'updated_plan'
    data?: any
}

// Rate limiting configuration
interface RateLimitConfig {
    windowMs: number
    maxRequests: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
    default: { windowMs: 60000, maxRequests: 100 }, // 100 requests per minute
    resort_updates: { windowMs: 10000, maxRequests: 10 }, // 10 updates per 10 seconds
    location_updates: { windowMs: 5000, maxRequests: 20 } // 20 location updates per 5 seconds
}

// Connection tracking
interface ConnectionInfo {
    userId?: string
    sessionId: string
    connectedAt: Date
    lastActivity: Date
    rooms: Set<string>
    requestCounts: Map<string, { count: number; resetTime: number }>
}

export class WebSocketService {
    private static instance: WebSocketService
    private io: SocketIOServer | null = null
    private connections = new Map<string, ConnectionInfo>()
    private roomSubscriptions = new Map<string, Set<string>>() // room -> socket IDs
    private cleanupInterval: NodeJS.Timeout | null = null

    private constructor() {
        this.startCleanupInterval()
    }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService()
        }
        return WebSocketService.instance
    }

    /**
     * Initialize WebSocket server
     */
    public initialize(server: HTTPServer): void {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env['NEXT_PUBLIC_APP_URL'] || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling'],
            pingTimeout: 60000,
            pingInterval: 25000
        })

        this.setupEventHandlers()
        console.log('WebSocket service initialized')
    }

    /**
     * Setup event handlers
     */
    private setupEventHandlers(): void {
        if (!this.io) return

        this.io.on(WebSocketEvents.CONNECT, (socket) => {
            console.log(`Client connected: ${socket.id}`)

            // Initialize connection info
            this.connections.set(socket.id, {
                sessionId: socket.id,
                connectedAt: new Date(),
                lastActivity: new Date(),
                rooms: new Set(),
                requestCounts: new Map()
            })

            // Handle authentication
            socket.on('authenticate', (data: { userId?: string; token?: string }) => {
                this.handleAuthentication(socket, data)
            })

            // Handle room management
            socket.on(WebSocketEvents.JOIN_ROOM, (data: { room: string; type: RoomTypes }) => {
                this.handleJoinRoom(socket, data)
            })

            socket.on(WebSocketEvents.LEAVE_ROOM, (data: { room: string }) => {
                this.handleLeaveRoom(socket, data)
            })

            // Handle resort subscriptions
            socket.on('subscribe_resort', (data: { resortId: string }) => {
                this.handleResortSubscription(socket, data)
            })

            socket.on('unsubscribe_resort', (data: { resortId: string }) => {
                this.handleResortUnsubscription(socket, data)
            })

            // Handle user location updates
            socket.on('location_update', (data: { latitude: number; longitude: number }) => {
                this.handleLocationUpdate(socket, data)
            })

            // Handle vacation collaboration
            socket.on('join_vacation', (data: { vacationId: string }) => {
                this.handleVacationJoin(socket, data)
            })

            // Handle disconnect
            socket.on(WebSocketEvents.DISCONNECT, (reason) => {
                this.handleDisconnect(socket, reason)
            })

            // Send welcome message
            socket.emit('connected', {
                sessionId: socket.id,
                timestamp: new Date().toISOString(),
                message: 'Connected to Disney Vacation Planning WebSocket'
            })
        })
    }

    /**
     * Handle user authentication
     */
    private handleAuthentication(socket: any, data: { userId?: string; token?: string }): void {
        const connection = this.connections.get(socket.id)
        if (!connection) return

        // TODO: Validate token with your auth service
        if (data.userId) {
            connection.userId = data.userId
            socket.join(`user:${data.userId}`)
            connection.rooms.add(`user:${data.userId}`)

            socket.emit('authenticated', {
                userId: data.userId,
                timestamp: new Date().toISOString()
            })
        }
    }

    /**
     * Handle joining rooms
     */
    private handleJoinRoom(socket: any, data: { room: string; type: RoomTypes }): void {
        if (!this.isRateLimited(socket.id, 'join_room')) {
            const roomKey = `${data.type}:${data.room}`
            socket.join(roomKey)

            const connection = this.connections.get(socket.id)
            if (connection) {
                connection.rooms.add(roomKey)
                connection.lastActivity = new Date()
            }

            // Track room subscriptions
            if (!this.roomSubscriptions.has(roomKey)) {
                this.roomSubscriptions.set(roomKey, new Set())
            }
            this.roomSubscriptions.get(roomKey)!.add(socket.id)

            socket.emit('room_joined', {
                room: roomKey,
                timestamp: new Date().toISOString()
            })
        }
    }

    /**
     * Handle leaving rooms
     */
    private handleLeaveRoom(socket: any, data: { room: string }): void {
        socket.leave(data.room)

        const connection = this.connections.get(socket.id)
        if (connection) {
            connection.rooms.delete(data.room)
            connection.lastActivity = new Date()
        }

        // Update room subscriptions
        const roomSubs = this.roomSubscriptions.get(data.room)
        if (roomSubs) {
            roomSubs.delete(socket.id)
            if (roomSubs.size === 0) {
                this.roomSubscriptions.delete(data.room)
            }
        }

        socket.emit('room_left', {
            room: data.room,
            timestamp: new Date().toISOString()
        })
    }

    /**
     * Handle resort subscription
     */
    private handleResortSubscription(socket: any, data: { resortId: string }): void {
        if (!this.isRateLimited(socket.id, 'resort_subscription')) {
            const roomKey = `${RoomTypes.RESORT}:${data.resortId}`
            this.handleJoinRoom(socket, { room: data.resortId, type: RoomTypes.RESORT })

            // Send current resort data
            ResortService.getResort(data.resortId).then(resort => {
                if (resort) {
                    socket.emit(WebSocketEvents.RESORT_UPDATED, {
                        resortId: data.resortId,
                        resort,
                        timestamp: new Date().toISOString()
                    })
                }
            })
        }
    }

    /**
     * Handle resort unsubscription
     */
    private handleResortUnsubscription(socket: any, data: { resortId: string }): void {
        const roomKey = `${RoomTypes.RESORT}:${data.resortId}`
        this.handleLeaveRoom(socket, { room: roomKey })
    }

    /**
     * Handle location updates
     */
    private handleLocationUpdate(socket: any, data: { latitude: number; longitude: number }): void {
        if (!this.isRateLimited(socket.id, 'location_updates')) {
            const connection = this.connections.get(socket.id)
            if (connection && connection.userId) {
                // Broadcast to vacation members if user is in a vacation
                this.io?.to(`user:${connection.userId}`).emit(WebSocketEvents.USER_LOCATION_UPDATED, {
                    userId: connection.userId,
                    location: data,
                    timestamp: new Date().toISOString()
                })
            }
        }
    }

    /**
     * Handle vacation collaboration
     */
    private handleVacationJoin(socket: any, data: { vacationId: string }): void {
        const connection = this.connections.get(socket.id)
        if (connection && connection.userId) {
            const roomKey = `${RoomTypes.VACATION}:${data.vacationId}`
            this.handleJoinRoom(socket, { room: data.vacationId, type: RoomTypes.VACATION })

            // Notify other vacation members
            socket.to(roomKey).emit(WebSocketEvents.VACATION_MEMBER_JOINED, {
                vacationId: data.vacationId,
                userId: connection.userId,
                timestamp: new Date().toISOString()
            })
        }
    }

    /**
     * Handle disconnect
     */
    private handleDisconnect(socket: any, reason: string): void {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`)

        const connection = this.connections.get(socket.id)
        if (connection) {
            // Clean up room subscriptions
            for (const room of connection.rooms) {
                const roomSubs = this.roomSubscriptions.get(room)
                if (roomSubs) {
                    roomSubs.delete(socket.id)
                    if (roomSubs.size === 0) {
                        this.roomSubscriptions.delete(room)
                    }
                }
            }

            this.connections.delete(socket.id)
        }
    }

    /**
     * Rate limiting check
     */
    private isRateLimited(socketId: string, action: string): boolean {
        const connection = this.connections.get(socketId)
        if (!connection) return true

        const limit = RATE_LIMITS[action] || RATE_LIMITS['default']
        const now = Date.now()
        const requestInfo = connection.requestCounts.get(action)

        if (!requestInfo || now > requestInfo.resetTime) {
            // Reset or initialize counter
            connection.requestCounts.set(action, {
                count: 1,
                resetTime: now + limit!.windowMs
            })
            return false
        }

        if (requestInfo.count >= limit!.maxRequests) {
            // Rate limited
            this.io?.to(socketId).emit(WebSocketEvents.RATE_LIMITED, {
                action,
                retryAfter: requestInfo.resetTime - now,
                timestamp: new Date().toISOString()
            })
            return true
        }

        requestInfo.count++
        return false
    }

    /**
     * Broadcast resort update
     */
    public broadcastResortUpdate(resortId: string, changes: any, type: string = 'general'): void {
        if (!this.io) return

        const message: ResortUpdateMessage = {
            resortId,
            changes,
            type: type as any,
            timestamp: new Date().toISOString(),
            sessionId: 'system'
        }

        const roomKey = `${RoomTypes.RESORT}:${resortId}`
        this.io.to(roomKey).emit(WebSocketEvents.RESORT_UPDATED, message)

        // Invalidate cache
        resortCache.invalidateResort(resortId)
    }

    /**
     * Broadcast wait time update
     */
    public broadcastWaitTimeUpdate(parkId: string, attractionId: string, waitTime: number, status: string): void {
        if (!this.io) return

        const message: WaitTimeMessage = {
            parkId,
            attractionId,
            waitTime,
            status: status as any,
            timestamp: new Date().toISOString(),
            sessionId: 'system'
        }

        const roomKey = `${RoomTypes.PARK}:${parkId}`
        this.io.to(roomKey).emit(WebSocketEvents.WAIT_TIME_UPDATED, message)
    }

    /**
     * Send user notification
     */
    public sendUserNotification(userId: string, notification: Omit<UserNotificationMessage, 'userId' | 'timestamp' | 'sessionId'>): void {
        if (!this.io) return

        const message: UserNotificationMessage = {
            ...notification,
            userId,
            timestamp: new Date().toISOString(),
            sessionId: 'system'
        }

        this.io.to(`user:${userId}`).emit(WebSocketEvents.USER_NOTIFICATION, message)
    }

    /**
     * Broadcast vacation update
     */
    public broadcastVacationUpdate(vacationId: string, memberId: string, action: string, data?: any): void {
        if (!this.io) return

        const message: VacationUpdateMessage = {
            vacationId,
            memberId,
            action: action as any,
            data,
            timestamp: new Date().toISOString(),
            sessionId: 'system'
        }

        const roomKey = `${RoomTypes.VACATION}:${vacationId}`
        this.io.to(roomKey).emit(WebSocketEvents.VACATION_PLAN_UPDATED, message)
    }

    /**
     * Broadcast system maintenance notification
     */
    public broadcastSystemMaintenance(message: string, scheduledTime?: Date): void {
        if (!this.io) return

        this.io.emit(WebSocketEvents.SYSTEM_MAINTENANCE, {
            message,
            scheduledTime: scheduledTime?.toISOString(),
            timestamp: new Date().toISOString(),
            sessionId: 'system'
        })
    }

    /**
     * Get connection statistics
     */
    public getStats(): {
        totalConnections: number
        authenticatedUsers: number
        totalRooms: number
        connectionsByRoom: Record<string, number>
        averageConnectionTime: number
    } {
        const now = new Date()
        let authenticatedUsers = 0
        let totalConnectionTime = 0

        for (const connection of this.connections.values()) {
            if (connection.userId) authenticatedUsers++
            totalConnectionTime += now.getTime() - connection.connectedAt.getTime()
        }

        const connectionsByRoom: Record<string, number> = {}
        for (const [room, sockets] of this.roomSubscriptions.entries()) {
            connectionsByRoom[room] = sockets.size
        }

        return {
            totalConnections: this.connections.size,
            authenticatedUsers,
            totalRooms: this.roomSubscriptions.size,
            connectionsByRoom,
            averageConnectionTime: this.connections.size > 0 ? totalConnectionTime / this.connections.size : 0
        }
    }

    /**
     * Cleanup inactive connections
     */
    private startCleanupInterval(): void {
        this.cleanupInterval = setInterval(() => {
            const now = new Date()
            const inactiveThreshold = 30 * 60 * 1000 // 30 minutes

            for (const [socketId, connection] of this.connections.entries()) {
                if (now.getTime() - connection.lastActivity.getTime() > inactiveThreshold) {
                    // Force disconnect inactive connections
                    this.io?.to(socketId).disconnectSockets()
                    this.connections.delete(socketId)
                }
            }
        }, 5 * 60 * 1000) // Check every 5 minutes
    }

    /**
     * Shutdown the service
     */
    public async shutdown(): Promise<void> {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
        }

        if (this.io) {
            this.io.close()
        }

        this.connections.clear()
        this.roomSubscriptions.clear()
    }
}

// Export singleton instance
export const webSocketService = WebSocketService.getInstance()

// Export types for use in other files
export type {
    ResortUpdateMessage,
    WaitTimeMessage,
    UserNotificationMessage,
    VacationUpdateMessage
}