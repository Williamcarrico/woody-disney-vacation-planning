export interface MessageAttachment {
    id: string
    type: 'image' | 'video' | 'file' | 'audio'
    url: string
    name: string
    size?: number
    mimeType?: string
}

export interface SocketMessage {
    id: string
    userId: string
    userName: string
    content: string
    type: 'text' | 'voice' | 'image' | 'video' | 'location' | 'poll' | 'system' | 'file'
    timestamp: number
    vacationId: string
    replyTo?: string
    attachments?: MessageAttachment[]
    reactions: Record<string, string>
    edited: boolean
}

export interface TypingUser {
    userId: string
    userName: string
    isTyping: boolean
}

export interface LocationUpdate {
    userId: string
    userName: string
    latitude: number
    longitude: number
    accuracy?: number
    message?: string
    timestamp: number
    isEmergency: boolean
}

export interface UseSocketOptions {
    vacationId: string
    onMessage?: (message: SocketMessage) => void
    onLocationUpdate?: (location: LocationUpdate) => void
    onUserTyping?: (user: TypingUser) => void
    onUserJoined?: (user: { userId: string; userName: string; timestamp: number }) => void
    onUserLeft?: (user: { userId: string; userName: string; timestamp: number }) => void
    onReaction?: (reaction: { messageId: string; userId: string; userName: string; reaction: string; timestamp: number }) => void
}