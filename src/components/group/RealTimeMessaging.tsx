'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
    MessageSquare,
    SendHorizontal,
    MapPin,
    Smile,
    Mic,
    MicOff,
    WifiOff,
    Wifi,
    Settings,
    Search,
    Reply,
    Edit,
    Volume2
} from "lucide-react"
import { format, isToday, isYesterday } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Picker from 'emoji-picker-react'

// Import Magic UI components
import { BorderBeam } from '@/components/magicui/border-beam'
import { MagicCard } from '@/components/magicui/magic-card'
import { TypingAnimation } from '@/components/magicui/typing-animation'
import { BlurFade } from '@/components/magicui/blur-fade'

// Import shared types
import type { SocketMessage, TypingUser } from '@/types/messaging'

interface RealTimeMessagingProps {
    vacationId: string
    className?: string
    isFullscreen?: boolean
    onToggleFullscreen?: () => void
}

// Voice recording hook
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

            const chunks: Blob[] = []
            mediaRecorder.ondataavailable = (event) => {
                chunks.push(event.data)
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' })
                setAudioBlob(blob)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setDuration(0)

            // Start timer
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
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            setAudioBlob(null)
            setDuration(0)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
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

export default function RealTimeMessaging({
    vacationId,
    className,
    isFullscreen: _isFullscreen = false,
    onToggleFullscreen: _onToggleFullscreen
}: RealTimeMessagingProps) {
    const { user } = useAuth()

    // State management
    const [messages, setMessages] = useState<SocketMessage[]>([])
    const [messageText, setMessageText] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [replyingTo, setReplyingTo] = useState<SocketMessage | null>(null)
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [autoScroll, setAutoScroll] = useState(true)
    const [compactMode, setCompactMode] = useState(false)

    // Voice recording
    const voiceRecording = useVoiceRecording()

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Socket.io integration
    const {
        isConnected,
        isAuthenticated,
        connectionError,
        sendMessage,
        sendReaction,
        shareLocation,
        sendVoiceMessage,
        startTyping,
        stopTyping,
        reconnect
    } = useSocket({
        vacationId,
        onMessage: (message) => {
            setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === message.id)) return prev
                return [...prev, message].sort((a, b) => a.timestamp - b.timestamp)
            })

            // Play notification sound for other users' messages
            if (soundEnabled && message.userId !== user?.uid) {
                const audio = new Audio('/sounds/message-receive.mp3')
                audio.play().catch(() => { }) // Ignore errors
            }

            // Auto-scroll to new messages
            if (autoScroll) {
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
            }
        },
        onLocationUpdate: (location: {
            userId: string
            userName: string
            latitude: number
            longitude: number
            accuracy?: number
            message?: string
            timestamp: number
            isEmergency: boolean
        }) => {
            // Handle location updates
            console.log('Location update:', location)
        },
        onUserTyping: (user) => {
            setTypingUsers(prev => {
                const filtered = prev.filter(u => u.userId !== user.userId)
                return user.isTyping ? [...filtered, user] : filtered
            })
        },
        onUserJoined: (user) => {
            setOnlineUsers(prev => new Set([...prev, user.userId]))
            toast.success(`${user.userName} joined the chat`)
        },
        onUserLeft: (user) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev)
                newSet.delete(user.userId)
                return newSet
            })
            toast.info(`${user.userName} left the chat`)
        },
        onReaction: (reaction) => {
            setMessages(prev => prev.map(msg =>
                msg.id === reaction.messageId
                    ? { ...msg, reactions: { ...msg.reactions, [reaction.userId]: reaction.reaction } }
                    : msg
            ))
        }
    })

    // Handle sending messages
    const handleSendMessage = useCallback(() => {
        const trimmedMessage = messageText.trim()

        if (!trimmedMessage && !voiceRecording.audioBlob) return

        if (voiceRecording.audioBlob) {
            // Send voice message
            sendVoiceMessage(voiceRecording.audioBlob, voiceRecording.duration)
            voiceRecording.cancelRecording()
        } else {
            // Send text message
            const success = sendMessage(
                trimmedMessage,
                'text',
                replyingTo?.id
            )

            if (success) {
                setMessageText('')
                setReplyingTo(null)
            }
        }
    }, [messageText, voiceRecording, sendMessage, sendVoiceMessage, replyingTo])

    // Handle typing indicators
    const handleTyping = useCallback(() => {
        startTyping()

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping()
        }, 3000)
    }, [startTyping, stopTyping])

    // Handle input changes
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setMessageText(value)

        if (value.length > 0) {
            handleTyping()
        }
    }, [handleTyping])

    // Handle key presses
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        } else if (e.key === 'Escape') {
            setReplyingTo(null)
        }
    }, [handleSendMessage])

    // Handle emoji selection
    const handleEmojiSelect = useCallback((emojiData: { emoji: string }) => {
        setMessageText(prev => prev + emojiData.emoji)
        setIsEmojiPickerOpen(false)
        inputRef.current?.focus()
    }, [])

    // Handle message reactions
    const handleReaction = useCallback((messageId: string, reaction: string) => {
        sendReaction(messageId, reaction)
    }, [sendReaction])

    // Handle location sharing
    const handleShareLocation = useCallback(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    shareLocation(
                        position.coords.latitude,
                        position.coords.longitude,
                        position.coords.accuracy,
                        'Shared current location'
                    )
                },
                (error) => {
                    console.error('Location error:', error)
                    toast.error('Failed to get location')
                }
            )
        } else {
            toast.error('Geolocation not supported')
        }
    }, [shareLocation])

    // Filter messages based on search
    const filteredMessages = useMemo(() => {
        if (!searchQuery) return messages
        return messages.filter(message =>
            message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.userName.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [messages, searchQuery])

    // Format message time
    const formatMessageTime = useCallback((timestamp: number) => {
        const date = new Date(timestamp)
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

    // Auto-scroll effect
    useEffect(() => {
        if (autoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, autoScroll])

    // Connection status indicator
    const ConnectionStatus = () => (
        <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
                <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Connected</span>
                </>
            ) : (
                <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Disconnected</span>
                    <Button size="sm" variant="outline" onClick={reconnect}>
                        Reconnect
                    </Button>
                </>
            )}
        </div>
    )

    // Typing indicator component
    const TypingIndicator = () => {
        if (typingUsers.length === 0) return null

        const typingText = typingUsers.length === 1
            ? `${typingUsers[0].userName} is typing...`
            : `${typingUsers.length} people are typing...`

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-4 py-2 text-sm text-muted-foreground"
            >
                <TypingAnimation text={typingText} className="text-sm" />
            </motion.div>
        )
    }

    // Message component
    const MessageComponent = ({ message, index }: { message: SocketMessage; index: number }) => {
        const isCurrentUser = message.userId === user?.uid
        const isSystem = message.type === 'system'

        if (isSystem) {
            return (
                <BlurFade key={message.id} delay={index * 0.05} inView>
                    <div className="flex justify-center my-4">
                        <Badge variant="secondary" className="text-xs">
                            {message.content}
                        </Badge>
                    </div>
                </BlurFade>
            )
        }

        return (
            <BlurFade key={message.id} delay={index * 0.05} inView>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "flex gap-3 p-4 hover:bg-muted/50 transition-colors",
                        isCurrentUser && "flex-row-reverse",
                        compactMode && "p-2"
                    )}
                >
                    <Avatar className={cn("h-8 w-8", compactMode && "h-6 w-6")}>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userName}`} />
                        <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
                    </Avatar>

                    <div className={cn("flex-1 space-y-1", isCurrentUser && "text-right")}>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{message.userName}</span>
                            <span className="text-xs text-muted-foreground">
                                {formatMessageTime(message.timestamp)}
                            </span>
                            {onlineUsers.has(message.userId) && (
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                            )}
                        </div>

                        {replyingTo?.id === message.id && (
                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                Replying to: {message.content.slice(0, 50)}...
                            </div>
                        )}

                        <div className={cn(
                            "bg-card border rounded-lg p-3 max-w-md",
                            isCurrentUser && "bg-primary text-primary-foreground ml-auto"
                        )}>
                            {message.type === 'voice' ? (
                                <div className="flex items-center gap-2">
                                    <Volume2 className="h-4 w-4" />
                                    <span>Voice message</span>
                                </div>
                            ) : message.type === 'location' ? (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>Shared location</span>
                                </div>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            )}
                        </div>

                        {/* Message reactions */}
                        {Object.keys(message.reactions).length > 0 && (
                            <div className="flex gap-1 mt-2">
                                {Object.entries(message.reactions).map(([userId, reaction]) => (
                                    <Badge key={userId} variant="outline" className="text-xs">
                                        {reaction}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Message actions */}
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReaction(message.id, '👍')}
                            >
                                👍
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setReplyingTo(message)}
                            >
                                <Reply className="h-3 w-3" />
                            </Button>
                            {isCurrentUser && (
                                <Button size="sm" variant="ghost">
                                    <Edit className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </BlurFade>
        )
    }

    return (
        <MagicCard className={cn("flex flex-col h-[600px]", className)}>
            <BorderBeam size={250} duration={12} />

            {/* Header */}
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Real-Time Chat
                        </CardTitle>
                        <CardDescription>
                            {onlineUsers.size} member{onlineUsers.size !== 1 ? 's' : ''} online
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <ConnectionStatus />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Settings panel */}
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 p-3 bg-muted rounded-lg"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Sound notifications</span>
                            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Auto-scroll</span>
                            <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Compact mode</span>
                            <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                        </div>
                    </motion.div>
                )}
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                    <div className="space-y-1">
                        {!isAuthenticated && (
                            <div className="flex items-center justify-center h-32">
                                <div className="text-center">
                                    <WifiOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        {connectionError || 'Connecting to chat...'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {filteredMessages.map((message, index) => (
                            <MessageComponent key={message.id} message={message} index={index} />
                        ))}

                        <AnimatePresence>
                            <TypingIndicator />
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t">
                {replyingTo && (
                    <div className="flex items-center justify-between bg-muted p-2 rounded mb-2">
                        <span className="text-sm">
                            Replying to {replyingTo.userName}: {replyingTo.content.slice(0, 50)}...
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                            ✕
                        </Button>
                    </div>
                )}

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Textarea
                            ref={inputRef}
                            placeholder="Type a message..."
                            value={messageText}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="min-h-[40px] max-h-[120px] resize-none pr-12"
                            disabled={!isAuthenticated}
                        />
                        <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-2 top-2"
                            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                        >
                            <Smile className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleShareLocation}
                        disabled={!isAuthenticated}
                    >
                        <MapPin className="h-4 w-4" />
                    </Button>

                    <Button
                        size="sm"
                        variant={voiceRecording.isRecording ? "destructive" : "outline"}
                        onClick={voiceRecording.isRecording ? voiceRecording.stopRecording : voiceRecording.startRecording}
                        disabled={!isAuthenticated}
                    >
                        {voiceRecording.isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>

                    <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() && !voiceRecording.audioBlob || !isAuthenticated}
                    >
                        <SendHorizontal className="h-4 w-4" />
                    </Button>
                </div>

                {/* Emoji picker */}
                {isEmojiPickerOpen && (
                    <div className="absolute bottom-20 right-4 z-50">
                        <Picker onEmojiClick={handleEmojiSelect} />
                    </div>
                )}
            </div>
        </MagicCard>
    )
}