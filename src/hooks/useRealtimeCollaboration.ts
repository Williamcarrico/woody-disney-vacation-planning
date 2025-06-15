import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
    enhancedWebSocket,
    CollaborationEvents,
    LocationShareMessage,
    ChatMessage,
    TripPlanItem,
    PresenceUpdate
} from '@/lib/websocket/enhanced-websocket-service';
import { LocationData } from '@/lib/services/consolidated-geofencing';
import { toast } from '@/components/ui/use-toast';

interface UseRealtimeCollaborationOptions {
    userId: string;
    roomId: string;
    roomType: 'location_sharing' | 'trip_planning' | 'group_chat';
    onMemberJoined?: (userId: string) => void;
    onMemberLeft?: (userId: string) => void;
    onLocationUpdate?: (update: LocationShareMessage) => void;
    onMessageReceived?: (message: ChatMessage) => void;
    onTripPlanUpdate?: (item: TripPlanItem) => void;
    onPresenceUpdate?: (presence: PresenceUpdate) => void;
    autoConnect?: boolean;
}

interface UseRealtimeCollaborationReturn {
    // Connection state
    isConnected: boolean;
    isConnecting: boolean;
    connectionError: string | null;
    
    // Actions
    connect: () => void;
    disconnect: () => void;
    
    // Location sharing
    shareLocation: (location: LocationData) => void;
    stopLocationSharing: () => void;
    memberLocations: Map<string, LocationShareMessage>;
    
    // Messaging
    sendMessage: (content: string, type?: ChatMessage['type']) => void;
    editMessage: (messageId: string, newContent: string) => void;
    deleteMessage: (messageId: string) => void;
    messages: ChatMessage[];
    typingUsers: Set<string>;
    setTyping: (isTyping: boolean) => void;
    
    // Trip planning
    addTripPlanItem: (item: Omit<TripPlanItem, 'id' | 'addedAt' | 'votes' | 'addedBy'>) => void;
    voteTripPlanItem: (itemId: string, vote: boolean) => void;
    removeTripPlanItem: (itemId: string) => void;
    tripPlan: TripPlanItem[];
    
    // Presence
    roomMembers: Map<string, PresenceUpdate>;
    updatePresence: (status: PresenceUpdate['status']) => void;
}

export function useRealtimeCollaboration(
    options: UseRealtimeCollaborationOptions
): UseRealtimeCollaborationReturn {
    const {
        userId,
        roomId,
        roomType,
        onMemberJoined,
        onMemberLeft,
        onLocationUpdate,
        onMessageReceived,
        onTripPlanUpdate,
        onPresenceUpdate,
        autoConnect = true,
    } = options;

    // State
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [memberLocations, setMemberLocations] = useState<Map<string, LocationShareMessage>>(new Map());
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [tripPlan, setTripPlan] = useState<TripPlanItem[]>([]);
    const [roomMembers, setRoomMembers] = useState<Map<string, PresenceUpdate>>(new Map());

    // Refs
    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Connect to WebSocket
    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        setIsConnecting(true);
        setConnectionError(null);

        const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000', {
            auth: {
                userId,
                roomId,
                roomType,
            },
            transports: ['websocket', 'polling'],
        });

        // Connection events
        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            setIsConnecting(false);
            
            // Join collaboration room
            socket.emit('join_collaboration', { roomId, roomType });
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setConnectionError(error.message);
            setIsConnecting(false);
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected from WebSocket:', reason);
            setIsConnected(false);
        });

        // Collaboration events
        socket.on(CollaborationEvents.USER_ONLINE, ({ userId: memberId }) => {
            onMemberJoined?.(memberId);
            toast({
                title: 'Member joined',
                description: `User ${memberId} joined the room`,
            });
        });

        socket.on(CollaborationEvents.USER_OFFLINE, ({ userId: memberId }) => {
            onMemberLeft?.(memberId);
            // Remove their location
            setMemberLocations(prev => {
                const next = new Map(prev);
                next.delete(memberId);
                return next;
            });
            // Remove from typing users
            setTypingUsers(prev => {
                const next = new Set(prev);
                next.delete(memberId);
                return next;
            });
        });

        // Location sharing events
        socket.on(CollaborationEvents.LOCATION_BATCH_UPDATE, (update: LocationShareMessage) => {
            setMemberLocations(prev => {
                const next = new Map(prev);
                next.set(update.userId, update);
                return next;
            });
            onLocationUpdate?.(update);
        });

        // Messaging events
        socket.on(CollaborationEvents.MESSAGE_SENT, (message: ChatMessage) => {
            setMessages(prev => [...prev, message]);
            onMessageReceived?.(message);
        });

        socket.on(CollaborationEvents.MESSAGE_EDITED, ({ messageId, newContent }: any) => {
            setMessages(prev => prev.map(msg => 
                msg.id === messageId 
                    ? { ...msg, content: newContent, edited: true, editedAt: new Date().toISOString() }
                    : msg
            ));
        });

        socket.on(CollaborationEvents.MESSAGE_DELETED, ({ messageId }: any) => {
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        });

        socket.on(CollaborationEvents.TYPING_STARTED, ({ userId: typingUserId }: any) => {
            if (typingUserId !== userId) {
                setTypingUsers(prev => new Set(prev).add(typingUserId));
            }
        });

        socket.on(CollaborationEvents.TYPING_STOPPED, ({ userId: typingUserId }: any) => {
            setTypingUsers(prev => {
                const next = new Set(prev);
                next.delete(typingUserId);
                return next;
            });
        });

        // Trip planning events
        socket.on(CollaborationEvents.TRIP_PLAN_ITEM_ADDED, ({ item }: any) => {
            setTripPlan(prev => [...prev, item]);
            onTripPlanUpdate?.(item);
        });

        socket.on(CollaborationEvents.TRIP_PLAN_ITEM_REMOVED, ({ itemId }: any) => {
            setTripPlan(prev => prev.filter(item => item.id !== itemId));
        });

        socket.on(CollaborationEvents.TRIP_PLAN_VOTE, ({ itemId, userId: voterId, vote }: any) => {
            setTripPlan(prev => prev.map(item => 
                item.id === itemId 
                    ? { ...item, votes: { ...item.votes, [voterId]: vote } }
                    : item
            ));
        });

        // Presence events
        socket.on('presence_update', (presence: PresenceUpdate) => {
            setRoomMembers(prev => {
                const next = new Map(prev);
                next.set(presence.userId, presence);
                return next;
            });
            onPresenceUpdate?.(presence);
        });

        // Initial data sync
        socket.on('sync_response', ({ messages: syncedMessages, tripPlan: syncedPlan, members }: any) => {
            if (syncedMessages) setMessages(syncedMessages);
            if (syncedPlan) setTripPlan(syncedPlan);
            if (members) {
                const membersMap = new Map();
                members.forEach((member: any) => {
                    membersMap.set(member.userId, member.presence);
                });
                setRoomMembers(membersMap);
            }
        });

        socketRef.current = socket;

        // Request initial sync
        socket.emit('sync_request', { roomId });
    }, [userId, roomId, roomType, onMemberJoined, onMemberLeft, onLocationUpdate, onMessageReceived, onTripPlanUpdate, onPresenceUpdate]);

    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setIsConnected(false);
        setMemberLocations(new Map());
        setMessages([]);
        setTypingUsers(new Set());
        setTripPlan([]);
        setRoomMembers(new Map());
    }, []);

    // Share location
    const shareLocation = useCallback((location: LocationData) => {
        if (!socketRef.current?.connected) return;

        socketRef.current.emit('share_location', {
            roomId,
            location,
        });
    }, [roomId]);

    // Stop location sharing
    const stopLocationSharing = useCallback(() => {
        if (locationIntervalRef.current) {
            clearInterval(locationIntervalRef.current);
            locationIntervalRef.current = null;
        }
        
        if (socketRef.current?.connected) {
            socketRef.current.emit('stop_location_sharing', { roomId });
        }
    }, [roomId]);

    // Send message
    const sendMessage = useCallback((content: string, type: ChatMessage['type'] = 'text') => {
        if (!socketRef.current?.connected) return;

        const message = {
            groupId: roomId,
            userId,
            userName: userId, // This should come from user profile
            content,
            type,
        };

        socketRef.current.emit('send_message', message);
    }, [roomId, userId]);

    // Edit message
    const editMessage = useCallback((messageId: string, newContent: string) => {
        if (!socketRef.current?.connected) return;

        socketRef.current.emit('edit_message', {
            roomId,
            messageId,
            newContent,
        });
    }, [roomId]);

    // Delete message
    const deleteMessage = useCallback((messageId: string) => {
        if (!socketRef.current?.connected) return;

        socketRef.current.emit('delete_message', {
            roomId,
            messageId,
        });
    }, [roomId]);

    // Set typing status
    const setTyping = useCallback((isTyping: boolean) => {
        if (!socketRef.current?.connected) return;

        socketRef.current.emit('typing_status', {
            roomId,
            isTyping,
        });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        // Auto-stop typing after 5 seconds
        if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
                setTyping(false);
            }, 5000);
        }
    }, [roomId]);

    // Add trip plan item
    const addTripPlanItem = useCallback((item: Omit<TripPlanItem, 'id' | 'addedAt' | 'votes' | 'addedBy'>) => {
        if (!socketRef.current?.connected) return;

        socketRef.current.emit('add_trip_plan_item', {
            roomId,
            item: {
                ...item,
                addedBy: userId,
            },
        });
    }, [roomId, userId]);

    // Vote on trip plan item
    const voteTripPlanItem = useCallback((itemId: string, vote: boolean) => {
        if (!socketRef.current?.connected) return;

        socketRef.current.emit('vote_trip_plan_item', {
            roomId,
            itemId,
            vote,
        });
    }, [roomId]);

    // Remove trip plan item
    const removeTripPlanItem = useCallback((itemId: string) => {
        if (!socketRef.current?.connected) return;

        socketRef.current.emit('remove_trip_plan_item', {
            roomId,
            itemId,
        });
    }, [roomId]);

    // Update presence
    const updatePresence = useCallback((status: PresenceUpdate['status']) => {
        if (!socketRef.current?.connected) return;

        socketRef.current.emit('update_presence', {
            roomId,
            status,
        });
    }, [roomId]);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            stopLocationSharing();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [stopLocationSharing]);

    return {
        // Connection state
        isConnected,
        isConnecting,
        connectionError,
        
        // Actions
        connect,
        disconnect,
        
        // Location sharing
        shareLocation,
        stopLocationSharing,
        memberLocations,
        
        // Messaging
        sendMessage,
        editMessage,
        deleteMessage,
        messages,
        typingUsers,
        setTyping,
        
        // Trip planning
        addTripPlanItem,
        voteTripPlanItem,
        removeTripPlanItem,
        tripPlan,
        
        // Presence
        roomMembers,
        updatePresence,
    };
}