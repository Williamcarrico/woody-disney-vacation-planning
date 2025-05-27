'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGroupMessages } from '@/hooks/useRealtimeDatabase'
import { Send, MapPin, Camera, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface GroupChatProps {
    vacationId: string
    className?: string
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡']

export default function GroupChat({ vacationId, className }: GroupChatProps) {
    const [messageInput, setMessageInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const {
        messages,
        loading,
        error,
        sendMessage,
        addReaction
    } = useGroupMessages(vacationId)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async () => {
        if (!messageInput.trim()) return

        try {
            setIsTyping(true)
            await sendMessage(messageInput.trim())
            setMessageInput('')
            toast.success('Message sent!')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to send message')
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleAddReaction = async (messageId: string, reaction: string) => {
        try {
            await addReaction(messageId, reaction)
        } catch {
            toast.error('Failed to add reaction')
        }
    }

    const sortedMessages = Object.entries(messages || {})
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    }

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center h-96">
                    <p className="text-destructive">Error loading chat: {error}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Group Chat
                    <Badge variant="secondary" className="ml-auto">
                        {sortedMessages.length} messages
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                <ScrollArea className="h-96 px-4">
                    <div className="space-y-4">
                        {sortedMessages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            sortedMessages.map(([messageId, message]) => (
                                <div key={messageId} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={message.userPhotoURL} />
                                        <AvatarFallback className="text-xs">
                                            {getInitials(message.userName)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-medium">{message.userName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                            </p>
                                            {message.edited && (
                                                <Badge variant="outline" className="text-xs">
                                                    edited
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="bg-muted rounded-lg px-3 py-2 mb-2">
                                            {message.type === 'location' ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    Shared location: {message.content}
                                                </div>
                                            ) : message.type === 'photo' ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Camera className="h-4 w-4 text-primary" />
                                                    Shared a photo
                                                </div>
                                            ) : (
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            )}
                                        </div>

                                        {/* Reactions */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                {Object.entries(message.reactions || {}).map(([userId, reaction]) => (
                                                    <Badge key={userId} variant="outline" className="text-xs px-1">
                                                        {reaction}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Add reaction dropdown */}
                                            <TooltipProvider>
                                                <div className="flex gap-1">
                                                    {EMOJI_REACTIONS.map((emoji) => (
                                                        <Tooltip key={emoji}>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0 hover:bg-secondary"
                                                                    onClick={() => handleAddReaction(messageId, emoji)}
                                                                >
                                                                    {emoji}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>React with {emoji}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="pt-4">
                <div className="flex w-full gap-2">
                    <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isTyping}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || isTyping}
                        size="sm"
                    >
                        {isTyping ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}