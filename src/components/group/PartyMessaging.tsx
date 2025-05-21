'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
    Card,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
    MessageSquare,
    SendHorizontal,
    PlusCircle,
    Image as ImageIcon,
    MapPin,
    Calendar,
    Smile,
    Heart,
    ThumbsUp,
    Trash,
    Pin,
    PinOff,
    MoreHorizontal,
    BarChart4,
    Info,
    X,
} from "lucide-react"
import { format } from 'date-fns'
import { doc, collection, addDoc, updateDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, QueryDocumentSnapshot } from 'firebase/firestore'
import { firestore as db } from '@/lib/firebase/firebase.config'
import { cn } from '@/lib/utils'
import Picker from 'emoji-picker-react'
import { motion } from 'framer-motion'
import { User } from 'firebase/auth'
import Image from 'next/image'

// Types
// Custom User interface extending the base User type
interface AppUser extends User {
    isAdmin?: boolean
}

interface ItineraryData {
    id: string
    name: string
    date: string
}

interface LocationData {
    id: string
    name: string
    coordinates: {
        lat: number
        lng: number
    }
}

interface PollData {
    id: string
    name: string
    question: string
    options: Array<{
        text: string
        votes: string[]
    }>
}

interface ImageData {
    id: string
    name: string
    url: string
}

type AttachmentData = ItineraryData | LocationData | PollData | ImageData

type AttachmentType = 'itinerary' | 'location' | 'attraction' | 'dining' | 'poll' | 'image'

interface Attachment {
    type: AttachmentType
    id: string
    name: string
    data?: AttachmentData
}

interface Message {
    id: string
    userId: string
    displayName: string
    photoURL?: string
    content: string
    timestamp: Date
    attachments?: Attachment[]
    reactions: {
        [userId: string]: 'like' | 'love' | 'thumbsUp' | 'thumbsDown'
    }
    isPinned: boolean
}

interface PartyMessagingProps {
    readonly vacationId: string
}

export default function PartyMessaging({ vacationId }: PartyMessagingProps) {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [messageText, setMessageText] = useState('')
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
    const [replyingTo, setReplyingTo] = useState<Message | null>(null)
    const [attachmentType, setAttachmentType] = useState<AttachmentType | null>(null)
    const [attachmentData, setAttachmentData] = useState<AttachmentData | null>(null)
    const [pinnedMessagesExpanded, setPinnedMessagesExpanded] = useState(false)

    // Type assertion for user to include isAdmin property
    const appUser = user as AppUser | null

    // Parse document into message object
    const parseMessageDoc = (doc: QueryDocumentSnapshot): Message => {
        const data = doc.data()
        return {
            id: doc.id,
            userId: data.userId,
            displayName: data.displayName,
            photoURL: data.photoURL,
            content: data.content,
            timestamp: data.timestamp?.toDate() || new Date(),
            attachments: data.attachments || [],
            reactions: data.reactions || {},
            isPinned: data.isPinned || false
        } as Message
    }

    // Real-time messages subscription
    const { data: messages, isLoading } = useQuery({
        queryKey: ['vacationMessages', vacationId],
        queryFn: () => {
            return new Promise<Message[]>((resolve) => {
                const messagesRef = collection(db, 'vacations', vacationId, 'messages')
                const q = query(messagesRef, orderBy('timestamp', 'asc'))

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const messagesData = snapshot.docs.map(parseMessageDoc)
                    resolve(messagesData)
                })

                // Return a cleanup function
                return () => unsubscribe()
            })
        },
        enabled: !!vacationId,
        staleTime: Infinity, // This data is managed via onSnapshot
    })

    // Get pinned messages
    const pinnedMessages = messages?.filter(msg => msg.isPinned) || []

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (message: { content: string, attachments?: Attachment[] }) => {
            if (!user) throw new Error('User not authenticated')

            const messagesRef = collection(db, 'vacations', vacationId, 'messages')

            const messageData = {
                userId: user.uid,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL,
                content: message.content,
                timestamp: serverTimestamp(),
                attachments: message.attachments || [],
                reactions: {},
                isPinned: false,
                replyTo: replyingTo ? {
                    id: replyingTo.id,
                    content: replyingTo.content,
                    displayName: replyingTo.displayName
                } : null
            }

            const messageAttachments = attachmentData && attachmentType ? [
                {
                    type: attachmentType,
                    id: attachmentData.id || Date.now().toString(),
                    name: attachmentData.name,
                    data: attachmentData
                }
            ] : undefined

            const docRef = await addDoc(messagesRef, { ...messageData, attachments: messageAttachments })
            return { id: docRef.id, ...messageData, attachments: messageAttachments }
        },
        onSuccess: () => {
            setMessageText('')
            setAttachmentType(null)
            setAttachmentData(null)
            setReplyingTo(null)

            // Scroll to bottom when a new message is sent
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        },
        onError: (error) => {
            toast.error("Error sending message", {
                description: error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    })

    // React to message mutation
    const reactToMessageMutation = useMutation({
        mutationFn: async ({ messageId, reaction }: { messageId: string, reaction: string }) => {
            if (!user) throw new Error('User not authenticated')

            const messageRef = doc(db, 'vacations', vacationId, 'messages', messageId)

            // Get current message to see if user has already reacted
            const messagesData = queryClient.getQueryData<Message[]>(['vacationMessages', vacationId])
            const message = messagesData?.find(m => m.id === messageId)

            if (!message) throw new Error('Message not found')

            const userReaction = message.reactions[user.uid]

            if (userReaction === reaction) {
                // Remove reaction if clicking the same one
                await updateDoc(messageRef, {
                    [`reactions.${user.uid}`]: deleteField()
                })
            } else {
                // Add or change reaction
                await updateDoc(messageRef, {
                    [`reactions.${user.uid}`]: reaction
                })
            }

            return { messageId, reaction }
        }
    })

    // Pin/unpin message mutation
    const togglePinMessageMutation = useMutation({
        mutationFn: async ({ messageId, isPinned }: { messageId: string, isPinned: boolean }) => {
            const messageRef = doc(db, 'vacations', vacationId, 'messages', messageId)
            await updateDoc(messageRef, { isPinned: !isPinned })
            return { messageId, isPinned: !isPinned }
        }
    })

    // Delete message mutation
    const deleteMessageMutation = useMutation({
        mutationFn: async (messageId: string) => {
            const messageRef = doc(db, 'vacations', vacationId, 'messages', messageId)
            await deleteDoc(messageRef)
            return messageId
        }
    })

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault()

        if (!messageText.trim() && !attachmentData) return

        const messageContent = messageText.trim()
        const messageAttachments = attachmentData && attachmentType ? [
            {
                type: attachmentType,
                id: attachmentData.id || Date.now().toString(),
                name: attachmentData.name,
                data: attachmentData
            }
        ] : undefined

        sendMessageMutation.mutate({
            content: messageContent,
            attachments: messageAttachments
        })
    }

    const handleEmojiSelect = (emojiData: { emoji: string }) => {
        setMessageText(prev => prev + emojiData.emoji)
        setIsEmojiPickerOpen(false)
    }

    const handleReaction = (messageId: string, reaction: string) => {
        reactToMessageMutation.mutate({ messageId, reaction })
    }

    const handlePinMessage = (messageId: string, isPinned: boolean) => {
        togglePinMessageMutation.mutate({ messageId, isPinned })
    }

    const handleDeleteMessage = (messageId: string) => {
        if (confirm('Are you sure you want to delete this message? This cannot be undone.')) {
            deleteMessageMutation.mutate(messageId)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const formatReactionCount = (reactions: Message['reactions'], type: string) => {
        const count = Object.values(reactions).filter(r => r === type).length
        return count > 0 ? count.toString() : ''
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const formatMessageTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        if (diff < 24 * 60 * 60 * 1000) {
            return format(date, 'h:mm a')
        } else if (diff < 7 * 24 * 60 * 60 * 1000) {
            return format(date, 'EEE h:mm a')
        } else {
            return format(date, 'MMM d, h:mm a')
        }
    }

    const renderMessageAttachment = (attachment: Attachment) => {
        switch (attachment.type) {
            case 'itinerary':
                return (
                    <div className="mt-2 p-3 rounded-md bg-primary/10 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                            <div className="font-medium">{attachment.name}</div>
                            <div className="text-xs text-muted-foreground">Shared Itinerary</div>
                        </div>
                    </div>
                )

            case 'location':
                return (
                    <div className="mt-2 p-3 rounded-md bg-primary/10 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                            <div className="font-medium">{attachment.name}</div>
                            <div className="text-xs text-muted-foreground">Shared Location</div>
                        </div>
                    </div>
                )

            case 'poll':
                return (
                    <div className="mt-2 p-3 rounded-md bg-primary/10">
                        <div className="font-medium flex items-center gap-2 mb-2">
                            <BarChart4 className="h-5 w-5 text-primary" />
                            {(attachment.data as PollData).question}
                        </div>
                        <div className="space-y-2">
                            {(attachment.data as PollData).options.map((option) => (
                                <div key={`${(attachment.data as PollData).id}-${option.text}`} className="flex items-center justify-between">
                                    <div>{option.text}</div>
                                    <Badge variant="outline">{option.votes.length} votes</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            case 'image':
                return (
                    <div className="mt-2 rounded-md overflow-hidden max-w-xs">
                        <Image
                            src={(attachment.data as ImageData).url}
                            alt={(attachment.data as ImageData).name}
                            width={300}
                            height={200}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )

            default:
                return null
        }
    }

    const renderMessage = (message: Message) => {
        const isCurrentUser = message.userId === user?.uid
        const hasAttachments = message.attachments && message.attachments.length > 0

        return (
            <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "group flex mb-4",
                    isCurrentUser ? "justify-end" : "justify-start"
                )}
            >
                {!isCurrentUser && (
                    <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={message.photoURL} />
                        <AvatarFallback>{getInitials(message.displayName)}</AvatarFallback>
                    </Avatar>
                )}

                <div className={cn(
                    "relative max-w-[80%]",
                    isCurrentUser ? "order-1" : "order-2"
                )}>
                    {!isCurrentUser && (
                        <div className="text-xs font-medium mb-1">{message.displayName}</div>
                    )}

                    <div className={cn(
                        "p-3 rounded-lg relative group",
                        isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted rounded-tl-none"
                    )}>
                        {message.isPinned && (
                            <div className="absolute -top-2 -left-1">
                                <Badge variant="outline" className="h-4 bg-background">
                                    <Pin className="h-3 w-3 mr-1" />
                                    Pinned
                                </Badge>
                            </div>
                        )}

                        {/* Message content */}
                        <div className="whitespace-pre-wrap break-words">{message.content}</div>

                        {/* Attachments */}
                        {hasAttachments && message.attachments?.map((attachment) => (
                            <div key={attachment.id}>{renderMessageAttachment(attachment)}</div>
                        ))}

                        {/* Message timestamp */}
                        <div className={cn(
                            "text-[10px] absolute bottom-1 opacity-70",
                            isCurrentUser ? "left-2" : "right-2"
                        )}>
                            {formatMessageTime(message.timestamp)}
                        </div>

                        {/* Reaction buttons - shown on hover */}
                        <div className={cn(
                            "absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-full border p-1 shadow-sm flex gap-1",
                            isCurrentUser ? "right-0" : "left-0"
                        )}>
                            <button
                                type="button"
                                aria-label="Like message"
                                className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted"
                                onClick={() => handleReaction(message.id, 'like')}
                            >
                                <ThumbsUp className={cn(
                                    "h-3 w-3",
                                    message.reactions[user?.uid as string] === 'like' && "text-blue-500 fill-blue-500"
                                )} />
                            </button>

                            <button
                                type="button"
                                aria-label="Love message"
                                className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted"
                                onClick={() => handleReaction(message.id, 'love')}
                            >
                                <Heart className={cn(
                                    "h-3 w-3",
                                    message.reactions[user?.uid as string] === 'love' && "text-red-500 fill-red-500"
                                )} />
                            </button>

                            {(isCurrentUser || appUser?.isAdmin) && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button type="button" aria-label="More options" className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted">
                                            <MoreHorizontal className="h-3 w-3" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-32 p-1">
                                        <div className="space-y-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start h-8 px-2"
                                                onClick={() => handlePinMessage(message.id, message.isPinned)}
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

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start h-8 px-2 text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteMessage(message.id)}
                                            >
                                                <Trash className="h-3.5 w-3.5 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    </div>

                    {/* Reaction counters - always visible if reactions exist */}
                    {Object.keys(message.reactions).length > 0 && (
                        <div className="flex gap-1 mt-1">
                            {formatReactionCount(message.reactions, 'like') && (
                                <Badge variant="secondary" className="h-5 text-xs">
                                    <ThumbsUp className="h-3 w-3 mr-1 text-blue-500 fill-blue-500" />
                                    {formatReactionCount(message.reactions, 'like')}
                                </Badge>
                            )}

                            {formatReactionCount(message.reactions, 'love') && (
                                <Badge variant="secondary" className="h-5 text-xs">
                                    <Heart className="h-3 w-3 mr-1 text-red-500 fill-red-500" />
                                    {formatReactionCount(message.reactions, 'love')}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        )
    }

    const getAttachmentIcon = (type: AttachmentType | null) => {
        if (type === 'image') return <ImageIcon className="h-4 w-4" />
        if (type === 'location') return <MapPin className="h-4 w-4" />
        if (type === 'poll') return <BarChart4 className="h-4 w-4" />
        return <Calendar className="h-4 w-4" />
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Party Chat
                        </CardTitle>
                        <CardDescription>
                            Chat with your vacation party members
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Tabs defaultValue="chat">
                    <TabsList className="w-full rounded-none border-b h-11">
                        <TabsTrigger value="chat" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                            Chat
                        </TabsTrigger>
                        <TabsTrigger value="pinned" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                            Pinned <Badge variant="secondary" className="ml-1">{pinnedMessages.length}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="chat" className="mt-0">
                        <div className="pt-0">
                            {/* Pinned Messages Summary (Collapsible) */}
                            {pinnedMessages.length > 0 && (
                                <div className="border-b bg-muted/50 px-4 py-2">
                                    <button
                                        className="w-full flex items-center justify-between text-sm font-medium"
                                        onClick={() => setPinnedMessagesExpanded(!pinnedMessagesExpanded)}
                                    >
                                        <div className="flex items-center">
                                            <Pin className="h-4 w-4 mr-2" />
                                            {pinnedMessages.length} pinned {pinnedMessages.length === 1 ? 'message' : 'messages'}
                                        </div>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </button>

                                    {pinnedMessagesExpanded && (
                                        <div className="mt-2 space-y-2 border-t pt-2">
                                            {pinnedMessages.slice(0, 3).map(message => (
                                                <div key={message.id} className="text-xs text-muted-foreground flex items-start">
                                                    <div className="mt-0.5 mr-2">
                                                        <Pin className="h-3 w-3" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <div className="font-medium">{message.displayName}</div>
                                                        <div className="truncate">{message.content}</div>
                                                    </div>
                                                </div>
                                            ))}

                                            {pinnedMessages.length > 3 && (
                                                <div className="text-xs text-primary">
                                                    +{pinnedMessages.length - 3} more pinned messages
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Messages Area */}
                            <ScrollArea className="h-[400px] px-4 py-4">
                                {messages && messages.length > 0 ? (
                                    <div className="space-y-1">
                                        {messages.map(message => renderMessage(message))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <div className="text-center">
                                            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                            <p>No messages yet</p>
                                            <p className="text-sm">Start the conversation!</p>
                                        </div>
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Message Input Area */}
                            <div className="border-t p-4">
                                {replyingTo && (
                                    <div className="flex justify-between items-center bg-muted p-2 rounded-md mb-2 text-sm">
                                        <div className="truncate">
                                            <span className="font-medium">Replying to {replyingTo.displayName}:</span> {replyingTo.content}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {attachmentData && (
                                    <div className="flex justify-between items-center bg-muted p-2 rounded-md mb-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            {getAttachmentIcon(attachmentType)}
                                            <span>Attaching: {attachmentData.name}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => {
                                            setAttachmentType(null)
                                            setAttachmentData(null)
                                        }}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
                                    <div className="relative">
                                        <Textarea
                                            placeholder="Type your message..."
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="min-h-[80px] resize-none pr-12"
                                        />

                                        <div className="absolute right-2 bottom-2">
                                            <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" type="button">
                                                        <Smile className="h-5 w-5 text-muted-foreground" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent side="top" align="end" className="p-0 w-auto">
                                                    <Picker onEmojiClick={handleEmojiSelect} />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-1">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" type="button">
                                                        <PlusCircle className="h-5 w-5 text-muted-foreground" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent side="top" align="start" className="p-2 w-48">
                                                    <div className="space-y-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full justify-start"
                                                            onClick={() => {
                                                                // Mock attachment for now
                                                                setAttachmentType('image')
                                                                setAttachmentData({
                                                                    id: 'img1',
                                                                    name: 'Vacation Photo',
                                                                    url: 'https://example.com/image.jpg'
                                                                })
                                                            }}
                                                        >
                                                            <ImageIcon className="h-4 w-4 mr-2" />
                                                            Image
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full justify-start"
                                                            onClick={() => {
                                                                // Mock attachment for now
                                                                setAttachmentType('location')
                                                                setAttachmentData({
                                                                    id: 'loc1',
                                                                    name: 'Current Location',
                                                                    coordinates: {
                                                                        lat: 28.4177,
                                                                        lng: -81.5812
                                                                    }
                                                                })
                                                            }}
                                                        >
                                                            <MapPin className="h-4 w-4 mr-2" />
                                                            Location
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full justify-start"
                                                            onClick={() => {
                                                                // Mock attachment for now
                                                                setAttachmentType('itinerary')
                                                                setAttachmentData({
                                                                    id: 'itin1',
                                                                    name: 'My Itinerary',
                                                                    date: new Date().toISOString()
                                                                })
                                                            }}
                                                        >
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            Itinerary
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full justify-start"
                                                            onClick={() => {
                                                                // Mock attachment for now
                                                                setAttachmentType('poll')
                                                                setAttachmentData({
                                                                    id: 'poll1',
                                                                    name: 'Quick Poll',
                                                                    question: 'Where should we eat?',
                                                                    options: [
                                                                        { text: 'Option 1', votes: [] },
                                                                        { text: 'Option 2', votes: [] }
                                                                    ]
                                                                })
                                                            }}
                                                        >
                                                            <BarChart4 className="h-4 w-4 mr-2" />
                                                            Poll
                                                        </Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <Button type="submit" disabled={!messageText.trim() && !attachmentData}>
                                            <SendHorizontal className="h-5 w-5 mr-1" />
                                            Send
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="pinned" className="mt-0">
                        {pinnedMessages.length > 0 ? (
                            <ScrollArea className="h-[460px] px-4 py-4">
                                <div className="space-y-4">
                                    {pinnedMessages.map(message => (
                                        <div key={message.id} className="border rounded-lg p-4 relative">
                                            <div className="flex items-start gap-3 mb-2">
                                                <Avatar>
                                                    <AvatarImage src={message.photoURL} />
                                                    <AvatarFallback>{getInitials(message.displayName)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{message.displayName}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {format(message.timestamp, 'PPP p')}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => handlePinMessage(message.id, true)}
                                                >
                                                    <PinOff className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="pl-11">
                                                <div className="text-sm whitespace-pre-wrap break-words">
                                                    {message.content}
                                                </div>

                                                {message.attachments && message.attachments.length > 0 && (
                                                    <div className="mt-2">
                                                        {message.attachments.map((attachment) => (
                                                            <div key={attachment.id}>{renderMessageAttachment(attachment)}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex items-center justify-center h-[460px] text-muted-foreground">
                                <div className="text-center">
                                    <Pin className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    <p>No pinned messages</p>
                                    <p className="text-sm">Pin important messages to find them easily</p>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

// This function would normally be imported from Firebase
function deleteField() {
    return {
        "__type__": "FieldValue",
        "stringValue": "DeleteField"
    }
}