'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
    MessageSquare,
    SendHorizontal,
    PlusCircle,
    MapPin,
    Smile,
    Heart,
    Trash,
    Pin,
    PinOff,
    MoreHorizontal,
    BarChart4,
    X,
    Mic,
    MicOff,
    Play,
    Pause,
    Search,
    Zap,
    CheckCheck,
    Waves,
    Copy,
    Reply,
    Forward,
    Edit,
    Camera,
    FileText,
    Settings,
    Moon,
    Sun,
    Maximize2,
    Minimize2,
    WifiOff,
    Monitor,
    Check
} from "lucide-react"
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import {
    collection,
    addDoc,
    deleteDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    limit,
    where,
    QueryDocumentSnapshot,
    getDocs
} from 'firebase/firestore'
import { firestore as db } from '@/lib/firebase/firebase.config'
import { cn } from '@/lib/utils'
import Picker from 'emoji-picker-react'
import { motion, AnimatePresence } from 'framer-motion'
import { geofencingService, GeofenceEvent } from '@/lib/services/geofencing'

// Import Magic UI components for futuristic effects
import { Particles } from '@/components/magicui/particles'
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { MorphingText } from '@/components/magicui/morphing-text'
import { TypingAnimation } from '@/components/magicui/typing-animation'
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card'
import { Meteors } from '@/components/magicui/meteors'
import { BlurFade } from '@/components/magicui/blur-fade'

// Enhanced Types
interface TypingIndicator {
    userId: string
    userName: string
    timestamp: Date
}

interface MessageStatus {
    delivered: boolean
    read: boolean
    readBy: string[]
    deliveredAt?: Date
    readAt?: Date
}

interface VoiceMessage {
    id: string
    url: string
    duration: number
    waveform?: number[]
}

interface LocationData {
    id: string
    name: string
    coordinates: {
        lat: number
        lng: number
    }
    parkArea?: string
    attraction?: string
    accuracy?: number
    timestamp: Date
}

interface ThreadMessage {
    id: string
    content: string
    userId: string
    timestamp: Date
}

interface MessageThread {
    id: string
    messages: ThreadMessage[]
    isCollapsed: boolean
}

interface Reaction {
    userId: string
    type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'thumbsUp' | 'thumbsDown'
    timestamp: Date
}

interface MessageAttachment {
    id: string
    type: 'image' | 'video' | 'file' | 'audio'
    url: string
    name?: string
    size?: number
    mimeType?: string
}

interface EnhancedMessage {
    id: string
    userId: string
    displayName: string
    photoURL?: string
    content: string
    timestamp: Date
    type: 'text' | 'voice' | 'image' | 'video' | 'location' | 'poll' | 'system' | 'file'
    attachments?: MessageAttachment[]
    reactions: Reaction[]
    status: MessageStatus
    isPinned: boolean
    isEdited: boolean
    editHistory?: { content: string; timestamp: Date }[]
    thread?: MessageThread
    replyTo?: {
        id: string
        content: string
        userId: string
        displayName: string
    }
    mentions?: string[]
    priority: 'low' | 'normal' | 'high' | 'urgent'
    voiceMessage?: VoiceMessage
    location?: LocationData
    metadata?: {
        device?: string
        platform?: string
        networkStatus?: string
    }
}

interface EnhancedPartyMessagingProps {
    readonly vacationId: string
    readonly className?: string
    readonly isFullscreen?: boolean
    readonly onToggleFullscreen?: () => void
}

// Voice Recording Hook
function useVoiceRecording() {
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [duration, setDuration] = useState(0)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder

            const audioChunks: BlobPart[] = []
            mediaRecorder.addEventListener('dataavailable', (event) => {
                audioChunks.push(event.data)
            })

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
                setAudioBlob(audioBlob)
                stream.getTracks().forEach(track => track.stop())
            })

            mediaRecorder.start()
            setIsRecording(true)
            setDuration(0)

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1)
            }, 1000)
        } catch (error) {
            console.error('Error starting recording:', error)
            toast.error('Failed to start recording')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }

    const cancelRecording = () => {
        stopRecording()
        setAudioBlob(null)
        setDuration(0)
    }

    return {
        isRecording,
        audioBlob,
        duration,
        startRecording,
        stopRecording,
        cancelRecording
    }
}

// Connection Status Hook
function useConnectionStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return isOnline
}

export default function EnhancedPartyMessaging({
    vacationId,
    className,
    isFullscreen = false,
    onToggleFullscreen
}: EnhancedPartyMessagingProps) {
    const { user } = useAuth()
    const isOnline = useConnectionStatus()

    // Enhanced state management
    const [messageText, setMessageText] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [replyingTo, setReplyingTo] = useState<EnhancedMessage | null>(null)
    const [editingMessage, setEditingMessage] = useState<EnhancedMessage | null>(null)
    const [compactMode, setCompactMode] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [animationsEnabled, setAnimationsEnabled] = useState(true)
    const [autoScroll, setAutoScroll] = useState(true)
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'auto'>('auto')

    // NEW: Geofencing and location state
    const [recentGeofenceEvents, setRecentGeofenceEvents] = useState<GeofenceEvent[]>([])
    const [locationSharingEnabled, setLocationSharingEnabled] = useState(true)
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number
        longitude: number
        accuracy?: number
        timestamp: Date
    } | null>(null)

    // Voice recording
    const voiceRecording = useVoiceRecording()

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement | null>(null)

    // Real-time typing indicators
    const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Helper function to extract mentions from message text
    const extractMentions = useCallback((text: string): string[] => {
        const mentionRegex = /@(\w+)/g
        const mentions: string[] = []
        let match

        while ((match = mentionRegex.exec(text)) !== null) {
            mentions.push(match[1])
        }

        return mentions
    }, [])

    // Enhanced message sending mutation must be defined before handleSendMessage
    const sendMessageMutation = useMutation({
        mutationFn: async (messageData: {
            content: string
            type?: string
            attachments?: MessageAttachment[]
            voiceMessage?: VoiceMessage
            location?: LocationData
            priority?: string
            mentions?: string[]
        }) => {
            if (!user) throw new Error('User not authenticated')

            const messagesRef = collection(db, 'vacations', vacationId, 'messages')

            const enhancedMessageData = {
                userId: user.uid,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL,
                content: messageData.content,
                timestamp: serverTimestamp(),
                type: messageData.type || 'text',
                attachments: messageData.attachments || [],
                reactions: [],
                status: {
                    delivered: true,
                    read: false,
                    readBy: []
                },
                isPinned: false,
                isEdited: false,
                editHistory: [],
                replyTo: replyingTo ? {
                    id: replyingTo.id,
                    content: replyingTo.content,
                    userId: replyingTo.userId,
                    displayName: replyingTo.displayName
                } : null,
                mentions: messageData.mentions || [],
                priority: messageData.priority || 'normal',
                voiceMessage: messageData.voiceMessage,
                location: messageData.location,
                metadata: {
                    device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
                    platform: navigator.platform,
                    networkStatus: navigator.onLine ? 'online' : 'offline'
                }
            }

            const docRef = await addDoc(messagesRef, enhancedMessageData)
            return { id: docRef.id, ...enhancedMessageData }
        },
        onSuccess: () => {
            setMessageText('')
            setReplyingTo(null)
            voiceRecording.cancelRecording()

            if (soundEnabled) {
                // Play send sound
                const audio = new Audio('/sounds/message-send.mp3')
                audio.play().catch(() => { }) // Ignore errors
            }

            if (autoScroll) {
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
            }
        },
        onError: (error) => {
            toast.error("Failed to send message", {
                description: error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    })

    // Enhanced handler functions
    const handleSendMessage = useCallback(() => {
        const trimmedMessage = messageText.trim()

        if (!trimmedMessage && !voiceRecording.audioBlob) return

        if (voiceRecording.audioBlob) {
            // Handle voice message sending
            const voiceMessage: VoiceMessage = {
                id: Date.now().toString(),
                url: URL.createObjectURL(voiceRecording.audioBlob),
                duration: voiceRecording.duration
            }

            sendMessageMutation.mutate({
                content: '🎤 Voice message',
                type: 'voice',
                voiceMessage
            })
        } else {
            // Handle text message sending
            const mentions = extractMentions(trimmedMessage)

            sendMessageMutation.mutate({
                content: trimmedMessage,
                type: 'text',
                mentions,
                priority: trimmedMessage.includes('!urgent') ? 'urgent' : 'normal'
            })
        }
    }, [messageText, voiceRecording.audioBlob, voiceRecording.duration, sendMessageMutation, extractMentions])

    const handleTyping = useCallback(() => {
        if (!user || !vacationId) return

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Send typing indicator
        const typingRef = collection(db, 'vacations', vacationId, 'typing')
        addDoc(typingRef, {
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            timestamp: serverTimestamp()
        }).catch(console.error)

        // Set timeout to clear typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            // Remove typing indicator after 3 seconds
            const typingQuery = query(
                typingRef,
                where('userId', '==', user.uid)
            )
            getDocs(typingQuery).then(snapshot => {
                snapshot.docs.forEach(doc => deleteDoc(doc.ref))
            }).catch(console.error)
        }, 3000)
    }, [user, vacationId])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        } else if (e.key === 'Escape') {
            if (replyingTo) {
                setReplyingTo(null)
            }
            if (editingMessage) {
                setEditingMessage(null)
            }
        }
    }, [handleSendMessage, replyingTo, editingMessage])

    const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setMessageText(value)

        // Trigger typing indicator when user starts typing
        if (value.length > 0) {
            handleTyping()
        }
    }, [handleTyping])

    const handleEmojiSelect = useCallback((emojiData: { emoji: string }) => {
        setMessageText(prev => prev + emojiData.emoji)
        setIsEmojiPickerOpen(false)

        // Focus back on input after emoji selection
        setTimeout(() => {
            inputRef.current?.focus()
        }, 100)
    }, [])

    // NEW: Geofence event listening
    useEffect(() => {
        if (!vacationId) return

        // Load geofences for this vacation
        geofencingService.loadGeofences(vacationId).catch(console.error)

        const handleGeofenceEvent = (event: GeofenceEvent) => {
            // Add to recent events
            setRecentGeofenceEvents(prev => [event, ...prev.slice(0, 9)]) // Keep last 10 events

            // Send automatic message about geofence event
            if (event.user.id === user?.uid) {
                const message = `📍 I just ${event.type === 'entry' ? 'entered' : 'left'} ${event.geofence.name}`

                sendMessageMutation.mutate({
                    content: message,
                    type: 'location',
                    location: {
                        id: event.geofence.id,
                        name: event.geofence.name,
                        coordinates: {
                            lat: event.user.location.latitude,
                            lng: event.user.location.longitude
                        },
                        accuracy: event.user.location.accuracy,
                        timestamp: event.timestamp
                    }
                })
            }
        }

        geofencingService.addEventListener('entry', handleGeofenceEvent)
        geofencingService.addEventListener('exit', handleGeofenceEvent)

        return () => {
            geofencingService.removeEventListener('entry', handleGeofenceEvent)
            geofencingService.removeEventListener('exit', handleGeofenceEvent)
        }
    }, [vacationId, user?.uid, sendMessageMutation])

    // NEW: Enhanced location tracking
    useEffect(() => {
        if (!locationSharingEnabled || !user || !vacationId) return

        let watchId: number | null = null

        const startLocationTracking = () => {
            if ('geolocation' in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    async (position) => {
                        interface NavigatorWithConnection extends Navigator {
                            connection?: {
                                effectiveType?: string
                            }
                            getBattery?: () => Promise<{ level: number }>
                        }

                        const location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            altitude: position.coords.altitude,
                            heading: position.coords.heading,
                            speed: position.coords.speed,
                            timestamp: new Date().toISOString(),
                            metadata: {
                                deviceInfo: navigator.userAgent,
                                networkType: (navigator as NavigatorWithConnection).connection?.effectiveType || 'unknown',
                                batteryLevel: (navigator as NavigatorWithConnection).getBattery ?
                                    await (navigator as NavigatorWithConnection).getBattery!().then((battery) => Math.round(battery.level * 100)) :
                                    undefined,
                                isBackground: document.hidden
                            }
                        }

                        setCurrentLocation({
                            latitude: location.latitude,
                            longitude: location.longitude,
                            accuracy: location.accuracy || undefined,
                            timestamp: new Date()
                        })

                        // Send location update to API
                        try {
                            await fetch('/api/user/location', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ...location,
                                    userId: user.uid,
                                    userName: user.displayName || 'Anonymous',
                                    vacationId
                                })
                            })
                        } catch (error) {
                            console.error('Failed to update location:', error)
                        }
                    },
                    (error) => {
                        console.error('Location error:', error)
                        setLocationSharingEnabled(false)
                    },
                    {
                        enableHighAccuracy: true,
                        maximumAge: 30000, // 30 seconds
                        timeout: 15000     // 15 seconds
                    }
                )
            }
        }

        startLocationTracking()

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId)
            }
        }
    }, [locationSharingEnabled, user, vacationId])

    // Enhanced message parsing
    const parseMessageDoc = useCallback((doc: QueryDocumentSnapshot): EnhancedMessage => {
        const data = doc.data()
        return {
            id: doc.id,
            userId: data.userId,
            displayName: data.displayName,
            photoURL: data.photoURL,
            content: data.content,
            timestamp: data.timestamp?.toDate() || new Date(),
            type: data.type || 'text',
            attachments: data.attachments || [],
            reactions: data.reactions || [],
            status: data.status || { delivered: true, read: false, readBy: [] },
            isPinned: data.isPinned || false,
            isEdited: data.isEdited || false,
            editHistory: data.editHistory || [],
            thread: data.thread,
            replyTo: data.replyTo,
            mentions: data.mentions || [],
            priority: data.priority || 'normal',
            voiceMessage: data.voiceMessage,
            location: data.location,
            metadata: data.metadata
        } satisfies EnhancedMessage
    }, [])

    // Real-time messages subscription with enhanced features
    const { data: messages, isLoading } = useQuery({
        queryKey: ['enhancedVacationMessages', vacationId],
        queryFn: () => {
            return new Promise<EnhancedMessage[]>((resolve) => {
                const messagesRef = collection(db, 'vacations', vacationId, 'messages')
                const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50))

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const messagesData = snapshot.docs.map(parseMessageDoc).reverse()
                    resolve(messagesData)
                })

                return () => unsubscribe()
            })
        },
        enabled: !!vacationId,
        staleTime: Infinity,
    })

    // Typing indicators subscription
    useEffect(() => {
        if (!vacationId) return

        const typingRef = collection(db, 'vacations', vacationId, 'typing')
        const q = query(typingRef, where('timestamp', '>', new Date(Date.now() - 10000)))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const typingData = snapshot.docs
                .map(doc => ({
                    userId: doc.data().userId,
                    userName: doc.data().userName,
                    timestamp: doc.data().timestamp?.toDate() || new Date()
                }))
                .filter(typing => typing.userId !== user?.uid)

            setTypingUsers(typingData)
        })

        return () => unsubscribe()
    }, [vacationId, user?.uid])

    // NEW: Share current location function
    const shareCurrentLocation = useCallback(async () => {
        if (!currentLocation || !user) return

        try {
            // Get location name from reverse geocoding (simplified)
            const locationName = `Location (${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)})`

            const locationData: LocationData = {
                id: Date.now().toString(),
                name: locationName,
                coordinates: {
                    lat: currentLocation.latitude,
                    lng: currentLocation.longitude
                },
                accuracy: currentLocation.accuracy,
                timestamp: currentLocation.timestamp
            }

            sendMessageMutation.mutate({
                content: `📍 Shared my current location`,
                type: 'location',
                location: locationData
            })
        } catch {
            toast.error("Failed to share location")
        }
    }, [currentLocation, user, sendMessageMutation])

    // Enhanced message reactions
    const handleReaction = useCallback((messageId: string, reactionType: string) => {
        // Implementation for enhanced reactions
        console.log('Reaction:', messageId, reactionType)
    }, [])

    // Filtered and searched messages
    const filteredMessages = useMemo(() => {
        if (!messages) return []

        let filtered = messages

        if (searchQuery) {
            filtered = filtered.filter(message =>
                message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                message.displayName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }, [messages, searchQuery])

    // Enhanced message time formatting
    const formatMessageTime = useCallback((date: Date) => {
        if (isToday(date)) {
            return format(date, 'h:mm a')
        } else if (isYesterday(date)) {
            return `Yesterday ${format(date, 'h:mm a')}`
        } else {
            return format(date, 'MMM d, h:mm a')
        }
    }, [])

    // Get user initials
    const getInitials = useCallback((name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }, [])

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (autoScroll && messages) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, autoScroll])

    // Enhanced message rendering with advanced animations
    const renderEnhancedMessage = useCallback((message: EnhancedMessage, index: number) => {
        const isCurrentUser = message.userId === user?.uid
        const isVoiceMessage = message.type === 'voice'
        const isLocationMessage = message.type === 'location'
        const hasReplyTo = !!message.replyTo

        return (
            <BlurFade key={message.id} delay={index * 0.02} inView>
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        delay: index * 0.02
                    }}
                    className={cn(
                        "group flex mb-4 relative",
                        isCurrentUser ? "justify-end" : "justify-start",
                        compactMode && "mb-2"
                    )}
                    whileHover={{ scale: 1.01 }}
                >
                    {/* Message glow effect for important messages */}
                    {message.priority === 'urgent' && (
                        <motion.div
                            className="absolute inset-0 bg-red-500/20 rounded-lg blur-sm -z-10"
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    )}

                    {/* Avatar with presence indicator */}
                    {!isCurrentUser && (
                        <div className="relative mr-3">
                            <Avatar className={cn(
                                "transition-all duration-300",
                                compactMode ? "h-6 w-6" : "h-8 w-8"
                            )}>
                                <AvatarImage src={message.photoURL} />
                                <AvatarFallback className="text-xs">
                                    {getInitials(message.displayName)}
                                </AvatarFallback>
                            </Avatar>

                            {/* Online status indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-background rounded-full" />
                        </div>
                    )}

                    <div className={cn(
                        "relative max-w-[80%]",
                        isCurrentUser ? "order-1" : "order-2"
                    )}>
                        {/* User name and timestamp */}
                        {!isCurrentUser && !compactMode && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">
                                    {message.displayName}
                                </span>
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                    {formatMessageTime(message.timestamp)}
                                </Badge>
                                {message.priority === 'urgent' && (
                                    <Badge variant="destructive" className="text-xs px-1 py-0">
                                        <Zap className="w-3 h-3 mr-1" />
                                        Urgent
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Reply indicator */}
                        {hasReplyTo && (
                            <motion.div
                                className="mb-2 p-2 rounded-md bg-muted/50 border-l-2 border-primary"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="text-xs text-muted-foreground">
                                    Replying to {message.replyTo!.displayName}
                                </div>
                                <div className="text-xs truncate">
                                    {message.replyTo!.content}
                                </div>
                            </motion.div>
                        )}

                        {/* Main message container */}
                        <NeonGradientCard className={cn(
                            "relative group/message transition-all duration-300",
                            isCurrentUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-card",
                            message.isPinned && "ring ring-yellow-400",
                            isVoiceMessage && "bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                        )}>
                            {/* Pin indicator */}
                            {message.isPinned && (
                                <motion.div
                                    className="absolute -top-2 -left-1"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                >
                                    <Badge variant="outline" className="h-4 bg-background">
                                        <Pin className="h-3 w-3 mr-1" />
                                        Pinned
                                    </Badge>
                                </motion.div>
                            )}

                            {/* Message content */}
                            <div className="p-3">
                                {isVoiceMessage ? (
                                    <VoiceMessagePlayer
                                        voiceMessage={message.voiceMessage!}
                                    />
                                ) : isLocationMessage ? (
                                    <LocationMessageDisplay
                                        location={message.location!}
                                    />
                                ) : (
                                    <div className="whitespace-pre-wrap break-words">
                                        <TypingAnimation
                                            text={message.content}
                                            className="text-sm"
                                            duration={20}
                                        />
                                    </div>
                                )}

                                {/* Message metadata */}
                                <div className={cn(
                                    "flex items-center gap-2 mt-2 text-xs opacity-70",
                                    isCurrentUser ? "justify-start" : "justify-end"
                                )}>
                                    <span>{formatMessageTime(message.timestamp)}</span>

                                    {message.isEdited && (
                                        <Badge variant="outline" className="text-xs">
                                            <Edit className="w-3 h-3 mr-1" />
                                            Edited
                                        </Badge>
                                    )}

                                    {isCurrentUser && (
                                        <div className="flex items-center gap-1">
                                            {message.status.delivered && (
                                                <CheckCheck className={cn(
                                                    "w-3 h-3",
                                                    message.status.read ? "text-blue-400" : "text-muted-foreground"
                                                )} />
                                            )}
                                        </div>
                                    )}

                                    {/* Connection status */}
                                    {message.metadata?.networkStatus === 'offline' && (
                                        <WifiOff className="w-3 h-3 text-orange-400" />
                                    )}
                                </div>
                            </div>

                            {/* Enhanced reaction area */}
                            <AnimatePresence>
                                {message.reactions.length > 0 && (
                                    <motion.div
                                        className="px-3 pb-2"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(
                                                message.reactions.reduce((acc, reaction) => {
                                                    acc[reaction.type] = (acc[reaction.type] || 0) + 1
                                                    return acc
                                                }, {} as Record<string, number>)
                                            ).map(([type, count]) => (
                                                <motion.button
                                                    key={type}
                                                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                                                    onClick={() => handleReaction(message.id, type)}
                                                    whileTap={{ scale: 0.95 }}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                >
                                                    <span className="text-xs">{getReactionEmoji(type)}</span>
                                                    <span className="text-xs">{count}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Hover actions */}
                            <motion.div
                                className={cn(
                                    "absolute top-2 opacity-0 group-hover/message:opacity-100 transition-opacity",
                                    "flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 border",
                                    isCurrentUser ? "left-2" : "right-2"
                                )}
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileHover={{ scale: 1, opacity: 1 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setReplyingTo(message)}
                                >
                                    <Reply className="h-3 w-3" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleReaction(message.id, 'like')}
                                >
                                    <Heart className="h-3 w-3" />
                                </Button>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-2">
                                        <EnhancedMessageActions
                                            message={message}
                                            isCurrentUser={isCurrentUser}
                                            onPin={() => {/* Handle pin */ }}
                                            onEdit={() => setEditingMessage(message)}
                                            onDelete={() => {/* Handle delete */ }}
                                            onCopy={() => navigator.clipboard.writeText(message.content)}
                                            onForward={() => {/* Handle forward */ }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </motion.div>

                            {/* Border beam for urgent messages */}
                            {message.priority === 'urgent' && <BorderBeam />}
                        </NeonGradientCard>
                    </div>
                </motion.div>
            </BlurFade>
        )
    }, [user?.uid, compactMode, formatMessageTime, getInitials, handleReaction])

    // Loading state with particles
    if (isLoading) {
        return (
            <div className="relative flex items-center justify-center h-64">
                <Particles className="absolute inset-0" quantity={50} />
                <div className="relative z-10 text-center">
                    <motion.div
                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <TypingAnimation text="Loading magical messages..." className="text-sm text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "relative w-full",
            isFullscreen ? "h-screen" : "h-auto",
            className
        )}>
            {/* Background particles for ambiance */}
            <Particles className="absolute inset-0 pointer-events-none" quantity={30} />

            <MagicCard className="w-full h-full overflow-hidden">
                {/* Enhanced header */}
                <CardHeader className="relative pb-3 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
                    <Meteors number={5} />

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <MessageSquare className="h-6 w-6" />
                                <motion.div
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>

                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <span>Party Chat</span>
                                    {!isOnline && (
                                        <Badge variant="destructive" className="text-xs">
                                            <WifiOff className="w-3 h-3 mr-1" />
                                            Offline
                                        </Badge>
                                    )}
                                    {/* NEW: Location sharing indicator */}
                                    {locationSharingEnabled && currentLocation && (
                                        <Badge variant="secondary" className="text-xs">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            Live Location
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <span>Magical communication with your party</span>
                                    {typingUsers.length > 0 && (
                                        <motion.div
                                            className="flex items-center gap-1 text-primary"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <Waves className="w-3 h-3 animate-pulse" />
                                            <TypingAnimation
                                                text={`${typingUsers[0].userName} is typing...`}
                                                className="text-xs"
                                            />
                                        </motion.div>
                                    )}
                                    {/* NEW: Recent geofence events indicator */}
                                    {recentGeofenceEvents.length > 0 && (
                                        <motion.div
                                            className="flex items-center gap-1 text-orange-500"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <Zap className="w-3 h-3" />
                                            <span className="text-xs">
                                                {recentGeofenceEvents.length} recent alerts
                                            </span>
                                        </motion.div>
                                    )}
                                </CardDescription>
                            </div>
                        </div>

                        {/* Header actions */}
                        <div className="flex items-center gap-2">
                            {/* NEW: Location sharing toggle */}
                            <Button
                                variant={locationSharingEnabled ? "default" : "outline"}
                                size="sm"
                                onClick={() => setLocationSharingEnabled(!locationSharingEnabled)}
                            >
                                <MapPin className="h-4 w-4" />
                            </Button>

                            {/* Search */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Search Messages</h4>
                                        <Input
                                            placeholder="Search in conversation..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Settings */}
                            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4">
                                    <ChatSettings
                                        compactMode={compactMode}
                                        setCompactMode={setCompactMode}
                                        soundEnabled={soundEnabled}
                                        setSoundEnabled={setSoundEnabled}
                                        animationsEnabled={animationsEnabled}
                                        setAnimationsEnabled={setAnimationsEnabled}
                                        autoScroll={autoScroll}
                                        setAutoScroll={setAutoScroll}
                                        currentTheme={currentTheme}
                                        setCurrentTheme={setCurrentTheme}
                                        locationSharingEnabled={locationSharingEnabled}
                                        setLocationSharingEnabled={setLocationSharingEnabled}
                                    />
                                </PopoverContent>
                            </Popover>

                            {/* Fullscreen toggle */}
                            {onToggleFullscreen && (
                                <Button variant="ghost" size="sm" onClick={onToggleFullscreen}>
                                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* NEW: Geofence events ticker */}
                    {recentGeofenceEvents.length > 0 && (
                        <motion.div
                            className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <div className="flex items-center gap-2 text-sm">
                                <Zap className="h-4 w-4 text-orange-500" />
                                <span className="font-medium">Recent Location Activity:</span>
                            </div>
                            <div className="mt-1 space-y-1">
                                {recentGeofenceEvents.slice(0, 3).map((event) => (
                                    <div key={`${event.geofence.id}-${event.timestamp.getTime()}`} className="text-xs text-orange-700">
                                        {event.user.name} {event.type === 'entry' ? 'entered' : 'left'} {event.geofence.name}
                                        <span className="ml-2 text-orange-500">
                                            {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </CardHeader>

                <CardContent className="p-0 flex flex-col h-full">
                    {/* Main chat area */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Messages container */}
                        <ScrollArea
                            ref={messagesContainerRef}
                            className={cn(
                                "flex-1 px-4 py-4",
                                isFullscreen ? "h-[calc(100vh-200px)]" : "h-[500px]"
                            )}
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredMessages && filteredMessages.length > 0 ? (
                                    <div className="space-y-1">
                                        {filteredMessages.map((message, index) =>
                                            renderEnhancedMessage(message, index)
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                ) : (
                                    <motion.div
                                        className="flex items-center justify-center h-full text-muted-foreground"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <div className="text-center">
                                            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                            <MorphingText
                                                texts={[
                                                    "No messages yet",
                                                    "Start the conversation!",
                                                    "Share the magic!"
                                                ]}
                                                className="text-lg font-medium mb-2"
                                            />
                                            <p className="text-sm">Begin your magical journey together</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </ScrollArea>

                        {/* Enhanced message input area */}
                        <div className="border-t bg-background/50 backdrop-blur-sm">
                            <EnhancedMessageInput
                                messageText={messageText}
                                onSend={handleSendMessage}
                                onKeyDown={handleKeyDown}
                                onChange={handleMessageChange}
                                replyingTo={replyingTo}
                                onCancelReply={() => setReplyingTo(null)}
                                voiceRecording={voiceRecording}
                                isEmojiPickerOpen={isEmojiPickerOpen}
                                setIsEmojiPickerOpen={setIsEmojiPickerOpen}
                                onEmojiSelect={handleEmojiSelect}
                                inputRef={inputRef}
                                currentLocation={currentLocation}
                                onShareLocation={shareCurrentLocation}
                                locationSharingEnabled={locationSharingEnabled}
                            />
                        </div>
                    </div>
                </CardContent>
            </MagicCard>
        </div>
    )
}

// Helper component for voice message player
function VoiceMessagePlayer({
    voiceMessage
}: {
    voiceMessage: VoiceMessage
}) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        const audio = new Audio(voiceMessage.url)
        audioRef.current = audio

        audio.addEventListener('timeupdate', () => {
            setCurrentTime(audio.currentTime)
        })

        audio.addEventListener('ended', () => {
            setIsPlaying(false)
            setCurrentTime(0)
        })

        return () => {
            audio.pause()
            audio.removeEventListener('timeupdate', () => { })
            audio.removeEventListener('ended', () => { })
        }
    }, [voiceMessage.url])

    const togglePlayback = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="flex items-center gap-3 p-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayback}
                className="h-8 w-8 rounded-full"
            >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <Waves className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">Voice Message</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentTime / voiceMessage.duration) * 100}%` }}
                            transition={{ duration: 0.1 }}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {formatTime(currentTime)} / {formatTime(voiceMessage.duration)}
                    </span>
                </div>
            </div>
        </div>
    )
}

// Helper component for location message display
function LocationMessageDisplay({
    location
}: {
    location: LocationData
}) {
    return (
        <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{location.name}</span>
            </div>

            <div className="text-sm text-muted-foreground mb-2">
                Shared location • {format(location.timestamp, 'h:mm a')}
            </div>

            {location.parkArea && (
                <Badge variant="outline" className="text-xs">
                    {location.parkArea}
                </Badge>
            )}

            <div className="mt-2">
                <ShimmerButton
                    className="w-full"
                    onClick={() => {
                        // Open location in maps
                        const url = `https://maps.google.com/?q=${location.coordinates.lat},${location.coordinates.lng}`
                        window.open(url, '_blank')
                    }}
                >
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                </ShimmerButton>
            </div>
        </div>
    )
}

// Helper component for enhanced message actions
function EnhancedMessageActions({
    message,
    isCurrentUser,
    onPin,
    onEdit,
    onDelete,
    onCopy,
    onForward
}: {
    message: EnhancedMessage
    isCurrentUser: boolean
    onPin: () => void
    onEdit: () => void
    onDelete: () => void
    onCopy: () => void
    onForward: () => void
}) {
    return (
        <div className="space-y-1">
            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 px-2"
                onClick={onCopy}
            >
                <Copy className="h-3.5 w-3.5 mr-2" />
                Copy
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 px-2"
                onClick={onForward}
            >
                <Forward className="h-3.5 w-3.5 mr-2" />
                Forward
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 px-2"
                onClick={onPin}
            >
                {message.isPinned ? (
                    <>
                        <PinOff className="h-3.5 w-3.5 mr-2" />
                        Unpin
                    </>
                ) : (
                    <>
                        <Pin className="h-3.5 w-3.5 mr-2" />
                        Pin
                    </>
                )}
            </Button>

            {isCurrentUser && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8 px-2"
                        onClick={onEdit}
                    >
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        Edit
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8 px-2 text-destructive hover:text-destructive"
                        onClick={onDelete}
                    >
                        <Trash className="h-3.5 w-3.5 mr-2" />
                        Delete
                    </Button>
                </>
            )}
        </div>
    )
}

// Enhanced message input component with location sharing
function EnhancedMessageInput({
    messageText,
    onSend,
    onKeyDown,
    onChange,
    replyingTo,
    onCancelReply,
    voiceRecording,
    isEmojiPickerOpen,
    setIsEmojiPickerOpen,
    onEmojiSelect,
    inputRef,
    currentLocation,
    onShareLocation,
    locationSharingEnabled
}: {
    messageText: string
    onSend: () => void
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    replyingTo: EnhancedMessage | null
    onCancelReply: () => void
    voiceRecording: ReturnType<typeof useVoiceRecording>
    isEmojiPickerOpen: boolean
    setIsEmojiPickerOpen: (open: boolean) => void
    onEmojiSelect: (emoji: { emoji: string }) => void
    inputRef: React.RefObject<HTMLTextAreaElement | null>
    currentLocation?: { latitude: number; longitude: number } | null
    onShareLocation?: () => void
    locationSharingEnabled?: boolean
}) {
    const [showAttachments, setShowAttachments] = useState(false)

    return (
        <div className="p-4 space-y-3">
            {/* Reply indicator */}
            <AnimatePresence>
                {replyingTo && (
                    <motion.div
                        className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border-l-4 border-primary"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-primary mb-1">
                                Replying to {replyingTo.displayName}
                            </div>
                            <div className="text-sm truncate text-muted-foreground">
                                {replyingTo.content}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancelReply}
                            className="h-6 w-6 p-0 shrink-0 ml-2"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Voice recording indicator */}
            <AnimatePresence>
                {voiceRecording.isRecording && (
                    <motion.div
                        className="flex items-center justify-between bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="w-3 h-3 bg-red-500 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            <span className="text-sm font-medium">Recording...</span>
                            <span className="text-sm text-muted-foreground">
                                {Math.floor(voiceRecording.duration / 60)}:{(voiceRecording.duration % 60).toString().padStart(2, '0')}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={voiceRecording.cancelRecording}
                                className="h-8 text-destructive hover:text-destructive"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={voiceRecording.stopRecording}
                                className="h-8"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main input area */}
            <div className="space-y-3">
                <div className="relative">
                    <Textarea
                        ref={inputRef}
                        placeholder="Type your magical message..."
                        value={messageText}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        className={cn(
                            "min-h-[80px] resize-none pr-12 transition-all duration-300",
                            "focus:ring-primary/50 focus:border-primary",
                            "bg-background/50 backdrop-blur-sm"
                        )}
                        disabled={voiceRecording.isRecording}
                    />

                    {/* Emoji picker trigger */}
                    <div className="absolute right-2 bottom-2">
                        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Smile className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="end" className="p-0 w-auto">
                                <Picker onEmojiClick={onEmojiSelect} />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Input controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Voice recording */}
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-9 w-9 p-0",
                                    voiceRecording.isRecording ? "bg-red-500/20 text-red-500" : ""
                                )}
                                onClick={voiceRecording.isRecording ? voiceRecording.stopRecording : voiceRecording.startRecording}
                            >
                                {voiceRecording.isRecording ? (
                                    <MicOff className="h-4 w-4" />
                                ) : (
                                    <Mic className="h-4 w-4" />
                                )}
                            </Button>
                        </motion.div>

                        {/* Attachments */}
                        <Popover open={showAttachments} onOpenChange={setShowAttachments}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                    <PlusCircle className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="start" className="w-64 p-3">
                                <AttachmentOptions
                                    onClose={() => setShowAttachments(false)}
                                    onShareLocation={onShareLocation}
                                    currentLocation={currentLocation}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* NEW: Quick location share button */}
                        {locationSharingEnabled && currentLocation && (
                            <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 text-blue-500 hover:text-blue-600"
                                    onClick={onShareLocation}
                                >
                                    <MapPin className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}
                    </div>

                    {/* Send button */}
                    <motion.div whileTap={{ scale: 0.95 }}>
                        {voiceRecording.audioBlob ? (
                            <RainbowButton
                                onClick={onSend}
                                className="h-9"
                            >
                                <SendHorizontal className="h-4 w-4 mr-2" />
                                Send Voice
                            </RainbowButton>
                        ) : (
                            <ShimmerButton
                                onClick={onSend}
                                disabled={!messageText.trim()}
                                className="h-9"
                            >
                                <SendHorizontal className="h-4 w-4 mr-2" />
                                Send
                            </ShimmerButton>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

// Chat settings component with location sharing
function ChatSettings({
    compactMode,
    setCompactMode,
    soundEnabled,
    setSoundEnabled,
    animationsEnabled,
    setAnimationsEnabled,
    autoScroll,
    setAutoScroll,
    currentTheme,
    setCurrentTheme,
    locationSharingEnabled,
    setLocationSharingEnabled
}: {
    compactMode: boolean
    setCompactMode: (value: boolean) => void
    soundEnabled: boolean
    setSoundEnabled: (value: boolean) => void
    animationsEnabled: boolean
    setAnimationsEnabled: (value: boolean) => void
    autoScroll: boolean
    setAutoScroll: (value: boolean) => void
    currentTheme: 'light' | 'dark' | 'auto'
    setCurrentTheme: (theme: 'light' | 'dark' | 'auto') => void
    locationSharingEnabled: boolean
    setLocationSharingEnabled: (value: boolean) => void
}) {
    return (
        <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Chat Settings
            </h4>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Compact Mode</label>
                    <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Sound Effects</label>
                    <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Animations</label>
                    <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto-scroll</label>
                    <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
                </div>

                {/* NEW: Location sharing setting */}
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Location Sharing</label>
                    <Switch checked={locationSharingEnabled} onCheckedChange={setLocationSharingEnabled} />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['light', 'dark', 'auto'] as const).map((theme) => (
                            <Button
                                key={theme}
                                variant={currentTheme === theme ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentTheme(theme)}
                                className="capitalize"
                            >
                                {theme === 'light' && <Sun className="h-3 w-3 mr-1" />}
                                {theme === 'dark' && <Moon className="h-3 w-3 mr-1" />}
                                {theme === 'auto' && <Monitor className="h-3 w-3 mr-1" />}
                                {theme}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Updated AttachmentOptions component to include location sharing
function AttachmentOptions({
    onClose,
    onShareLocation,
    currentLocation
}: {
    onClose: () => void
    onShareLocation?: () => void
    currentLocation?: { latitude: number; longitude: number } | null
}) {
    const handleAttachment = (type: string) => {
        if (type === 'location' && onShareLocation) {
            onShareLocation()
        } else {
            console.log('Attachment type:', type)
        }
        onClose()
    }

    return (
        <div className="space-y-2">
            <h4 className="font-medium text-sm">Add to message</h4>

            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-12 flex-col gap-1"
                    onClick={() => handleAttachment('image')}
                >
                    <Camera className="h-4 w-4" />
                    <span className="text-xs">Photo</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-12 flex-col gap-1",
                        !currentLocation && "opacity-50"
                    )}
                    onClick={() => handleAttachment('location')}
                    disabled={!currentLocation}
                >
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs">Location</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-12 flex-col gap-1"
                    onClick={() => handleAttachment('file')}
                >
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">File</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-12 flex-col gap-1"
                    onClick={() => handleAttachment('poll')}
                >
                    <BarChart4 className="h-4 w-4" />
                    <span className="text-xs">Poll</span>
                </Button>
            </div>
        </div>
    )
}

// Helper function to get reaction emoji
function getReactionEmoji(type: string): string {
    const emojiMap: Record<string, string> = {
        like: '👍',
        love: '❤️',
        laugh: '😂',
        wow: '😮',
        sad: '😢',
        angry: '😠',
        thumbsUp: '👍',
        thumbsDown: '👎'
    }
    return emojiMap[type] || '👍'
}