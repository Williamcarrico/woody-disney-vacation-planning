/**
 * Enhanced WebSocket Service for Real-time Collaboration
 * Extends the base WebSocket service with advanced real-time features
 */

import { webSocketService, WebSocketEvents } from './websocket-service';
import { LocationData } from '@/lib/services/consolidated-geofencing';
import { z } from 'zod';

// Enhanced event types for collaboration
export enum CollaborationEvents {
    // Location sharing
    LOCATION_SHARE_STARTED = 'location_share_started',
    LOCATION_SHARE_STOPPED = 'location_share_stopped',
    LOCATION_BATCH_UPDATE = 'location_batch_update',
    
    // Trip planning
    TRIP_PLAN_CREATED = 'trip_plan_created',
    TRIP_PLAN_ITEM_ADDED = 'trip_plan_item_added',
    TRIP_PLAN_ITEM_REMOVED = 'trip_plan_item_removed',
    TRIP_PLAN_ITEM_REORDERED = 'trip_plan_item_reordered',
    TRIP_PLAN_VOTE = 'trip_plan_vote',
    
    // Messaging
    MESSAGE_SENT = 'message_sent',
    MESSAGE_EDITED = 'message_edited',
    MESSAGE_DELETED = 'message_deleted',
    TYPING_STARTED = 'typing_started',
    TYPING_STOPPED = 'typing_stopped',
    
    // Presence
    USER_ONLINE = 'user_online',
    USER_OFFLINE = 'user_offline',
    USER_IDLE = 'user_idle',
    USER_ACTIVE = 'user_active',
    
    // Synchronization
    SYNC_REQUEST = 'sync_request',
    SYNC_RESPONSE = 'sync_response',
    CONFLICT_DETECTED = 'conflict_detected',
    CONFLICT_RESOLVED = 'conflict_resolved',
}

// Enhanced message schemas
export const LocationShareMessageSchema = z.object({
    userId: z.string(),
    groupId: z.string(),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
        altitude: z.number().optional(),
        accuracy: z.number().optional(),
        heading: z.number().optional(),
        speed: z.number().optional(),
    }),
    battery: z.number().optional(),
    activity: z.enum(['stationary', 'walking', 'running', 'riding']).optional(),
    timestamp: z.string(),
});

export type LocationShareMessage = z.infer<typeof LocationShareMessageSchema>;

export const TripPlanItemSchema = z.object({
    id: z.string(),
    type: z.enum(['attraction', 'restaurant', 'show', 'break', 'custom']),
    name: z.string(),
    locationId: z.string().optional(),
    scheduledTime: z.string().optional(),
    duration: z.number().optional(), // minutes
    notes: z.string().optional(),
    votes: z.record(z.string(), z.boolean()), // userId -> vote
    addedBy: z.string(),
    addedAt: z.string(),
});

export type TripPlanItem = z.infer<typeof TripPlanItemSchema>;

export const ChatMessageSchema = z.object({
    id: z.string(),
    groupId: z.string(),
    userId: z.string(),
    userName: z.string(),
    userAvatar: z.string().optional(),
    content: z.string(),
    type: z.enum(['text', 'location', 'image', 'plan_update']),
    metadata: z.any().optional(),
    timestamp: z.string(),
    edited: z.boolean().default(false),
    editedAt: z.string().optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const PresenceUpdateSchema = z.object({
    userId: z.string(),
    groupId: z.string(),
    status: z.enum(['online', 'offline', 'idle', 'active']),
    lastSeen: z.string(),
    currentActivity: z.string().optional(),
    device: z.object({
        type: z.enum(['mobile', 'tablet', 'desktop']),
        os: z.string().optional(),
        browser: z.string().optional(),
    }).optional(),
});

export type PresenceUpdate = z.infer<typeof PresenceUpdateSchema>;

// Collaboration room management
interface CollaborationRoom {
    id: string;
    type: 'location_sharing' | 'trip_planning' | 'group_chat';
    members: Map<string, {
        userId: string;
        socketId: string;
        role: 'owner' | 'admin' | 'member';
        joinedAt: Date;
        lastActivity: Date;
        presence: PresenceUpdate;
    }>;
    settings: {
        maxMembers: number;
        allowGuests: boolean;
        requireApproval: boolean;
        features: string[];
    };
    data: Map<string, any>; // Shared state storage
}

export class EnhancedWebSocketService {
    private static instance: EnhancedWebSocketService;
    private collaborationRooms: Map<string, CollaborationRoom> = new Map();
    private userSessions: Map<string, Set<string>> = new Map(); // userId -> socketIds
    private typingTimers: Map<string, NodeJS.Timeout> = new Map();

    private constructor() {
        this.setupEnhancedHandlers();
    }

    static getInstance(): EnhancedWebSocketService {
        if (!EnhancedWebSocketService.instance) {
            EnhancedWebSocketService.instance = new EnhancedWebSocketService();
        }
        return EnhancedWebSocketService.instance;
    }

    /**
     * Setup enhanced event handlers
     */
    private setupEnhancedHandlers(): void {
        // Enhanced handlers would be set up when WebSocket server is initialized
        console.log('Enhanced WebSocket handlers configured');
    }

    /**
     * Create a collaboration room
     */
    createCollaborationRoom(
        roomId: string,
        type: CollaborationRoom['type'],
        ownerId: string,
        settings?: Partial<CollaborationRoom['settings']>
    ): CollaborationRoom {
        const room: CollaborationRoom = {
            id: roomId,
            type,
            members: new Map(),
            settings: {
                maxMembers: 50,
                allowGuests: false,
                requireApproval: false,
                features: ['location_sharing', 'messaging', 'trip_planning'],
                ...settings,
            },
            data: new Map(),
        };

        this.collaborationRooms.set(roomId, room);
        return room;
    }

    /**
     * Join collaboration room
     */
    joinCollaborationRoom(
        roomId: string,
        userId: string,
        socketId: string,
        role: 'owner' | 'admin' | 'member' = 'member'
    ): boolean {
        const room = this.collaborationRooms.get(roomId);
        if (!room) return false;

        // Check room capacity
        if (room.members.size >= room.settings.maxMembers) {
            return false;
        }

        // Add member to room
        room.members.set(userId, {
            userId,
            socketId,
            role,
            joinedAt: new Date(),
            lastActivity: new Date(),
            presence: {
                userId,
                groupId: roomId,
                status: 'online',
                lastSeen: new Date().toISOString(),
            },
        });

        // Track user session
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, new Set());
        }
        this.userSessions.get(userId)!.add(socketId);

        // Broadcast user joined
        this.broadcastToRoom(roomId, CollaborationEvents.USER_ONLINE, {
            userId,
            roomId,
            timestamp: new Date().toISOString(),
        });

        return true;
    }

    /**
     * Leave collaboration room
     */
    leaveCollaborationRoom(roomId: string, userId: string, socketId: string): void {
        const room = this.collaborationRooms.get(roomId);
        if (!room) return;

        room.members.delete(userId);

        // Update user sessions
        const sessions = this.userSessions.get(userId);
        if (sessions) {
            sessions.delete(socketId);
            if (sessions.size === 0) {
                this.userSessions.delete(userId);
            }
        }

        // Broadcast user left
        this.broadcastToRoom(roomId, CollaborationEvents.USER_OFFLINE, {
            userId,
            roomId,
            timestamp: new Date().toISOString(),
        });

        // Clean up empty rooms
        if (room.members.size === 0) {
            this.collaborationRooms.delete(roomId);
        }
    }

    /**
     * Share location update
     */
    shareLocation(roomId: string, userId: string, location: LocationData): void {
        const room = this.collaborationRooms.get(roomId);
        if (!room || !room.members.has(userId)) return;

        // Update member's last activity
        const member = room.members.get(userId);
        if (member) {
            member.lastActivity = new Date();
        }

        // Store latest location in room data
        room.data.set(`location:${userId}`, location);

        // Broadcast location update
        const message: LocationShareMessage = {
            userId,
            groupId: roomId,
            location: {
                lat: location.lat,
                lng: location.lng,
                altitude: location.altitude,
                accuracy: location.accuracy,
                heading: location.heading,
                speed: location.speed,
            },
            timestamp: new Date().toISOString(),
        };

        this.broadcastToRoom(roomId, CollaborationEvents.LOCATION_BATCH_UPDATE, message, userId);
    }

    /**
     * Send chat message
     */
    sendMessage(roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
        const room = this.collaborationRooms.get(roomId);
        if (!room || !room.members.has(message.userId)) {
            throw new Error('User not in room');
        }

        const fullMessage: ChatMessage = {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
        };

        // Store message in room data
        const messages = room.data.get('messages') || [];
        messages.push(fullMessage);
        room.data.set('messages', messages);

        // Broadcast message
        this.broadcastToRoom(roomId, CollaborationEvents.MESSAGE_SENT, fullMessage);

        return fullMessage;
    }

    /**
     * Update typing status
     */
    updateTypingStatus(roomId: string, userId: string, isTyping: boolean): void {
        const room = this.collaborationRooms.get(roomId);
        if (!room || !room.members.has(userId)) return;

        const timerKey = `${roomId}:${userId}`;

        if (isTyping) {
            // Clear existing timer
            if (this.typingTimers.has(timerKey)) {
                clearTimeout(this.typingTimers.get(timerKey)!);
            }

            // Broadcast typing started
            this.broadcastToRoom(
                roomId,
                CollaborationEvents.TYPING_STARTED,
                { userId, roomId },
                userId
            );

            // Auto-stop typing after 5 seconds
            const timer = setTimeout(() => {
                this.updateTypingStatus(roomId, userId, false);
            }, 5000);

            this.typingTimers.set(timerKey, timer);
        } else {
            // Clear timer
            if (this.typingTimers.has(timerKey)) {
                clearTimeout(this.typingTimers.get(timerKey)!);
                this.typingTimers.delete(timerKey);
            }

            // Broadcast typing stopped
            this.broadcastToRoom(
                roomId,
                CollaborationEvents.TYPING_STOPPED,
                { userId, roomId },
                userId
            );
        }
    }

    /**
     * Add trip plan item
     */
    addTripPlanItem(roomId: string, userId: string, item: Omit<TripPlanItem, 'id' | 'addedAt' | 'votes'>): TripPlanItem {
        const room = this.collaborationRooms.get(roomId);
        if (!room || !room.members.has(userId)) {
            throw new Error('User not in room');
        }

        const fullItem: TripPlanItem = {
            ...item,
            id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            addedAt: new Date().toISOString(),
            votes: { [userId]: true }, // Creator auto-votes yes
        };

        // Store in room data
        const tripPlan = room.data.get('tripPlan') || [];
        tripPlan.push(fullItem);
        room.data.set('tripPlan', tripPlan);

        // Broadcast update
        this.broadcastToRoom(roomId, CollaborationEvents.TRIP_PLAN_ITEM_ADDED, {
            roomId,
            userId,
            item: fullItem,
        });

        return fullItem;
    }

    /**
     * Vote on trip plan item
     */
    voteTripPlanItem(roomId: string, userId: string, itemId: string, vote: boolean): void {
        const room = this.collaborationRooms.get(roomId);
        if (!room || !room.members.has(userId)) return;

        const tripPlan = room.data.get('tripPlan') || [];
        const item = tripPlan.find((i: TripPlanItem) => i.id === itemId);
        
        if (item) {
            item.votes[userId] = vote;
            room.data.set('tripPlan', tripPlan);

            // Broadcast vote update
            this.broadcastToRoom(roomId, CollaborationEvents.TRIP_PLAN_VOTE, {
                roomId,
                userId,
                itemId,
                vote,
            });
        }
    }

    /**
     * Get room members with presence
     */
    getRoomMembers(roomId: string): Array<{
        userId: string;
        presence: PresenceUpdate;
        role: string;
    }> {
        const room = this.collaborationRooms.get(roomId);
        if (!room) return [];

        return Array.from(room.members.values()).map(member => ({
            userId: member.userId,
            presence: member.presence,
            role: member.role,
        }));
    }

    /**
     * Get room shared data
     */
    getRoomData(roomId: string, key: string): any {
        const room = this.collaborationRooms.get(roomId);
        if (!room) return null;

        return room.data.get(key);
    }

    /**
     * Broadcast to room members
     */
    private broadcastToRoom(roomId: string, event: string, data: any, excludeUserId?: string): void {
        const room = this.collaborationRooms.get(roomId);
        if (!room) return;

        // Use the base WebSocket service to emit to room
        // This would integrate with the actual Socket.IO instance
        console.log(`Broadcasting ${event} to room ${roomId}`, data);
    }

    /**
     * Clean up inactive rooms and sessions
     */
    cleanup(): void {
        const now = new Date();
        const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

        // Clean up inactive rooms
        for (const [roomId, room] of this.collaborationRooms.entries()) {
            // Remove inactive members
            for (const [userId, member] of room.members.entries()) {
                if (now.getTime() - member.lastActivity.getTime() > inactiveThreshold) {
                    this.leaveCollaborationRoom(roomId, userId, member.socketId);
                }
            }

            // Remove empty rooms
            if (room.members.size === 0) {
                this.collaborationRooms.delete(roomId);
            }
        }

        // Clean up typing timers
        for (const [key, timer] of this.typingTimers.entries()) {
            clearTimeout(timer);
        }
        this.typingTimers.clear();
    }
}

// Export singleton instance
export const enhancedWebSocket = EnhancedWebSocketService.getInstance();