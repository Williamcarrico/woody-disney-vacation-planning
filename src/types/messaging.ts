/**
 * Messaging and Socket Communication Types
 * Strongly typed socket events with proper callback typing
 */

// =============================================================================
// CORE MESSAGE TYPE UNIONS
// =============================================================================

/** Media content message types */
export type MediaType = 'image' | 'video' | 'audio' | 'file';

/** System/text message types */
export type SystemType = 'text' | 'voice' | 'location' | 'poll' | 'system';

/** All message types (union of media and system types) */
export type MessageType = MediaType | SystemType;

// =============================================================================
// MESSAGE ATTACHMENT INTERFACE
// =============================================================================

/** File attachment for messages */
export interface MessageAttachment {
    /** Unique attachment identifier */
    id: string;
    /** Type of attachment */
    type: MediaType;
    /** URL to the attachment */
    url: string;
    /** Display name of the file */
    name: string;
    /** File size in bytes */
    size?: number;
    /** MIME type */
    mimeType?: string;
    /** Thumbnail URL for media files */
    thumbnailUrl?: string;
    /** Duration for audio/video files (in seconds) */
    duration?: number;
    /** Dimensions for images/videos */
    dimensions?: {
        width: number;
        height: number;
    };
}

// =============================================================================
// CORE MESSAGE INTERFACE
// =============================================================================

/** Main socket message interface */
export interface SocketMessage {
    /** Unique message identifier */
    id: string;
    /** User ID of the sender */
    userId: string;
    /** Display name of the sender */
    userName: string;
    /** Message content */
    content: string;
    /** Message type classification */
    type: MessageType;
    /** Unix timestamp */
    timestamp: number;
    /** Associated vacation ID */
    vacationId: string;
    /** ID of message being replied to */
    replyTo?: string;
    /** File attachments */
    attachments?: MessageAttachment[];
    /** Emoji reactions (emoji -> array of user IDs) */
    reactions: Record<string, string[]>;
    /** Whether message has been edited */
    edited: boolean;
    /** Timestamp of last edit */
    editedAt?: number;
    /** Whether message is deleted (soft delete) */
    deleted?: boolean;
    /** Whether message is pinned */
    pinned?: boolean;
    /** Thread information if this starts a thread */
    threadId?: string;
    /** Parent message ID if this is part of a thread */
    parentId?: string;
    /** Mentions (user IDs mentioned in the message) */
    mentions?: string[];
    /** Priority level for system messages */
    priority?: 'low' | 'normal' | 'high' | 'urgent';
}

// =============================================================================
// USER ACTIVITY INTERFACES
// =============================================================================

/** Typing indicator information */
export interface TypingUser {
    /** User ID who is typing */
    userId: string;
    /** Display name of typing user */
    userName: string;
    /** Whether currently typing */
    isTyping: boolean;
    /** When typing started */
    startedAt?: number;
    /** Profile photo URL */
    photoURL?: string;
}

/** User presence in the chat */
export interface UserPresence {
    /** User ID */
    userId: string;
    /** Display name */
    userName: string;
    /** Online status */
    status: 'online' | 'away' | 'busy' | 'offline';
    /** Last seen timestamp */
    lastSeen: number;
    /** Current activity */
    activity?: string;
    /** Profile photo URL */
    photoURL?: string;
}

// =============================================================================
// LOCATION AND GEOFENCING
// =============================================================================

/** Location update from users */
export interface LocationUpdate {
    /** User ID sharing location */
    userId: string;
    /** Display name */
    userName: string;
    /** Latitude coordinate */
    latitude: number;
    /** Longitude coordinate */
    longitude: number;
    /** Location accuracy in meters */
    accuracy?: number;
    /** Optional location message */
    message?: string;
    /** Timestamp of location update */
    timestamp: number;
    /** Whether this is an emergency location share */
    isEmergency: boolean;
    /** Battery level (0-100) when sharing emergency location */
    batteryLevel?: number;
    /** Speed in meters per second */
    speed?: number;
    /** Heading in degrees */
    heading?: number;
    /** Altitude in meters */
    altitude?: number;
}

// =============================================================================
// SYSTEM EVENT INTERFACES
// =============================================================================

/** User joining/leaving events */
export interface UserEvent {
    /** User ID */
    userId: string;
    /** Display name */
    userName: string;
    /** Event timestamp */
    timestamp: number;
    /** User's profile photo */
    photoURL?: string;
    /** User's role in the vacation */
    role?: 'admin' | 'member' | 'guest';
}

/** Message reaction events */
export interface ReactionEvent {
    /** Message being reacted to */
    messageId: string;
    /** User adding/removing reaction */
    userId: string;
    /** Display name */
    userName: string;
    /** Emoji reaction */
    reaction: string;
    /** Event timestamp */
    timestamp: number;
    /** Whether reaction was added or removed */
    action: 'add' | 'remove';
}

/** Vacation/group update events */
export interface VacationUpdateEvent {
    /** Type of update */
    updateType: 'itinerary' | 'settings' | 'member' | 'general';
    /** User making the update */
    userId: string;
    /** Display name */
    userName: string;
    /** Description of the update */
    description: string;
    /** Timestamp */
    timestamp: number;
    /** Additional data related to the update */
    data?: Record<string, unknown>;
}

// =============================================================================
// STRONGLY TYPED SOCKET EVENTS MAP
// =============================================================================

/** Complete mapping of socket event types to their data structures */
export interface SocketEvents {
    /** New message received */
    message: SocketMessage;
    /** Location update received */
    location: LocationUpdate;
    /** User typing status change */
    typing: TypingUser;
    /** User joined the vacation */
    userJoined: UserEvent;
    /** User left the vacation */
    userLeft: UserEvent;
    /** Message reaction added/removed */
    reaction: ReactionEvent;
    /** User presence status change */
    presence: UserPresence;
    /** Vacation/group data updated */
    vacationUpdate: VacationUpdateEvent;
    /** Connection status change */
    connectionStatus: {
        status: 'connected' | 'disconnected' | 'reconnecting' | 'error';
        timestamp: number;
        reason?: string;
    };
    /** Error event */
    error: {
        code: string;
        message: string;
        timestamp: number;
        data?: unknown;
    };
}

// =============================================================================
// STRONGLY TYPED CALLBACK FUNCTIONS
// =============================================================================

/** Generic socket listener type using mapped types */
export type SocketListener<K extends keyof SocketEvents> = (data: SocketEvents[K]) => void;

/** Collection of all possible socket listeners */
export interface SocketListeners {
    onMessage?: SocketListener<'message'>;
    onLocationUpdate?: SocketListener<'location'>;
    onUserTyping?: SocketListener<'typing'>;
    onUserJoined?: SocketListener<'userJoined'>;
    onUserLeft?: SocketListener<'userLeft'>;
    onReaction?: SocketListener<'reaction'>;
    onPresence?: SocketListener<'presence'>;
    onVacationUpdate?: SocketListener<'vacationUpdate'>;
    onConnectionStatus?: SocketListener<'connectionStatus'>;
    onError?: SocketListener<'error'>;
}

// =============================================================================
// SOCKET HOOK OPTIONS
// =============================================================================

/** Options for useSocket hook with strongly typed callbacks */
export interface UseSocketOptions extends SocketListeners {
    /** Vacation ID to connect to */
    vacationId: string;
    /** Whether to auto-connect */
    autoConnect?: boolean;
    /** Reconnection options */
    reconnection?: {
        enabled: boolean;
        attempts?: number;
        delay?: number;
        backoff?: 'linear' | 'exponential';
    };
    /** Debug mode */
    debug?: boolean;
}

// =============================================================================
// SOCKET HOOK RETURN TYPE
// =============================================================================

/** Return type for useSocket hook */
export interface UseSocketReturn {
    /** Whether socket is connected */
    isConnected: boolean;
    /** Whether currently reconnecting */
    isReconnecting: boolean;
    /** Current connection status */
    connectionStatus: 'connected' | 'disconnected' | 'reconnecting' | 'error';
    /** Last error if any */
    error?: string;
    /** Send a message */
    sendMessage: (content: string, type?: SystemType, attachments?: MessageAttachment[]) => void;
    /** Send location update */
    sendLocation: (location: Omit<LocationUpdate, 'userId' | 'userName' | 'timestamp'>) => void;
    /** Send typing indicator */
    sendTyping: (isTyping: boolean) => void;
    /** Send reaction to message */
    sendReaction: (messageId: string, reaction: string, action: 'add' | 'remove') => void;
    /** Update presence status */
    updatePresence: (status: UserPresence['status'], activity?: string) => void;
    /** Manually connect */
    connect: () => void;
    /** Manually disconnect */
    disconnect: () => void;
    /** Force reconnection */
    reconnect: () => void;
    /** Join a vacation room */
    joinVacation: (vacationId: string) => void;
    /** Leave a vacation room */
    leaveVacation: (vacationId: string) => void;
}

// =============================================================================
// MESSAGE FILTERING AND SEARCH
// =============================================================================

/** Message filter options */
export interface MessageFilter {
    /** Filter by message type */
    types?: MessageType[];
    /** Filter by user ID */
    userId?: string;
    /** Filter by date range */
    dateRange?: {
        start: number;
        end: number;
    };
    /** Filter by content search */
    searchQuery?: string;
    /** Filter by has attachments */
    hasAttachments?: boolean;
    /** Filter by attachment type */
    attachmentType?: MediaType;
    /** Filter by reactions */
    hasReactions?: boolean;
    /** Filter edited messages */
    edited?: boolean;
    /** Filter pinned messages */
    pinned?: boolean;
    /** Filter by thread */
    threadId?: string;
}

/** Message search result */
export interface MessageSearchResult {
    /** The message */
    message: SocketMessage;
    /** Relevance score */
    relevance: number;
    /** Matched text highlights */
    highlights: string[];
    /** Context messages (before/after) */
    context?: SocketMessage[];
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Message draft for composing */
export interface MessageDraft {
    /** Draft content */
    content: string;
    /** Message type */
    type: SystemType;
    /** Attached files */
    attachments: MessageAttachment[];
    /** Reply to message ID */
    replyTo?: string;
    /** Thread ID if continuing thread */
    threadId?: string;
    /** Mentioned users */
    mentions: string[];
}

/** Message composition state */
export interface MessageComposer {
    /** Current draft */
    draft: MessageDraft;
    /** Whether currently typing */
    isTyping: boolean;
    /** Upload progress for attachments */
    uploadProgress: Record<string, number>;
    /** Whether currently uploading */
    isUploading: boolean;
    /** Update draft content */
    updateContent: (content: string) => void;
    /** Add attachment */
    addAttachment: (file: File) => Promise<void>;
    /** Remove attachment */
    removeAttachment: (attachmentId: string) => void;
    /** Send message */
    sendMessage: () => Promise<void>;
    /** Clear draft */
    clearDraft: () => void;
}

// =============================================================================
// EXPORT TYPES FOR CONVENIENCE
// =============================================================================

export type {
    SocketEvents,
    SocketListener,
    SocketListeners
};