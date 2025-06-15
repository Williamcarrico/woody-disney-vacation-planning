'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { ChatMessage } from '@/lib/websocket/enhanced-websocket-service';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import {
    Send,
    MapPin,
    Image as ImageIcon,
    MoreVertical,
    Edit2,
    Trash2,
    Users,
    Loader2,
    AlertCircle
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

interface RealtimeGroupChatProps {
    userId: string;
    userName: string;
    userAvatar?: string;
    roomId: string;
    className?: string;
    height?: string | number;
}

export function RealtimeGroupChat({
    userId,
    userName,
    userAvatar,
    roomId,
    className,
    height = 500
}: RealtimeGroupChatProps) {
    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        isConnected,
        isConnecting,
        connectionError,
        messages,
        sendMessage,
        editMessage,
        deleteMessage,
        typingUsers,
        setTyping: updateTypingStatus,
        roomMembers,
        shareLocation,
    } = useRealtimeCollaboration({
        userId,
        roomId,
        roomType: 'group_chat',
        onMessageReceived: (message) => {
            // Show notification for messages from others
            if (message.userId !== userId) {
                toast({
                    title: message.userName,
                    description: message.content,
                });
            }
        },
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle typing indicator
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
        
        if (!isTyping && e.target.value.length > 0) {
            setIsTyping(true);
            updateTypingStatus(true);
        } else if (isTyping && e.target.value.length === 0) {
            setIsTyping(false);
            updateTypingStatus(false);
        }
    };

    // Send message
    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        if (editingMessageId) {
            // Edit existing message
            editMessage(editingMessageId, messageInput.trim());
            setEditingMessageId(null);
            setEditingContent('');
        } else {
            // Send new message
            sendMessage(messageInput.trim());
        }

        setMessageInput('');
        setIsTyping(false);
        updateTypingStatus(false);
        inputRef.current?.focus();
    };

    // Share current location
    const handleShareLocation = () => {
        if (!navigator.geolocation) {
            toast({
                title: 'Location not supported',
                description: 'Your browser doesn\'t support location sharing',
                variant: 'destructive',
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date(),
                };
                
                shareLocation(location);
                sendMessage(
                    `📍 Shared location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
                    'location'
                );
            },
            (error) => {
                toast({
                    title: 'Location error',
                    description: 'Failed to get your location',
                    variant: 'destructive',
                });
            }
        );
    };

    // Start editing a message
    const handleStartEdit = (message: ChatMessage) => {
        setEditingMessageId(message.id);
        setEditingContent(message.content);
        setMessageInput(message.content);
        inputRef.current?.focus();
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditingContent('');
        setMessageInput('');
    };

    // Format message timestamp
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        
        if (isToday(date)) {
            return format(date, 'h:mm a');
        } else if (isYesterday(date)) {
            return `Yesterday ${format(date, 'h:mm a')}`;
        } else {
            return format(date, 'MMM d, h:mm a');
        }
    };

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {} as Record<string, ChatMessage[]>);

    if (connectionError) {
        return (
            <Card className={cn('w-full', className)} style={{ height }}>
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Failed to connect to chat</p>
                        <p className="text-xs text-muted-foreground mt-1">{connectionError}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isConnecting || !isConnected) {
        return (
            <Card className={cn('w-full', className)} style={{ height }}>
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Connecting to chat...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('w-full flex flex-col', className)} style={{ height }}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Group Chat</CardTitle>
                    <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {roomMembers.size} online
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea ref={scrollAreaRef} className="h-full px-4">
                    {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                        <div key={date}>
                            <div className="flex items-center gap-2 my-4">
                                <Separator className="flex-1" />
                                <span className="text-xs text-muted-foreground px-2">
                                    {isToday(new Date(date))
                                        ? 'Today'
                                        : isYesterday(new Date(date))
                                        ? 'Yesterday'
                                        : format(new Date(date), 'MMM d, yyyy')}
                                </span>
                                <Separator className="flex-1" />
                            </div>
                            
                            {dateMessages.map((message) => {
                                const isOwnMessage = message.userId === userId;
                                const isEditing = editingMessageId === message.id;
                                
                                return (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            'mb-4 flex',
                                            isOwnMessage ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        <div className={cn(
                                            'flex gap-2 max-w-[70%]',
                                            isOwnMessage && 'flex-row-reverse'
                                        )}>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={message.userAvatar} />
                                                <AvatarFallback>
                                                    {getInitials(message.userName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            
                                            <div className={cn(
                                                'space-y-1',
                                                isOwnMessage && 'text-right'
                                            )}>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium">
                                                        {message.userName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatTimestamp(message.timestamp)}
                                                    </span>
                                                    {message.edited && (
                                                        <span className="text-xs text-muted-foreground italic">
                                                            (edited)
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className={cn(
                                                    'rounded-lg px-3 py-2 inline-block',
                                                    isOwnMessage
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted',
                                                    isEditing && 'ring-2 ring-primary'
                                                )}>
                                                    {message.type === 'location' && (
                                                        <MapPin className="h-4 w-4 inline mr-1" />
                                                    )}
                                                    {message.content}
                                                </div>
                                                
                                                {isOwnMessage && (
                                                    <div className="flex justify-end">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0"
                                                                >
                                                                    <MoreVertical className="h-3 w-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStartEdit(message)}
                                                                >
                                                                    <Edit2 className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => deleteMessage(message.id)}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    
                    {typingUsers.size > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <div className="flex gap-1">
                                <span className="animate-pulse">●</span>
                                <span className="animate-pulse animation-delay-200">●</span>
                                <span className="animate-pulse animation-delay-400">●</span>
                            </div>
                            <span>
                                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing
                            </span>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            
            <CardFooter className="p-3">
                {editingMessageId && (
                    <div className="w-full mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
                        <span className="text-sm">Editing message</span>
                        <Button
                            onClick={handleCancelEdit}
                            size="sm"
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
                
                <div className="flex gap-2 w-full">
                    <Button
                        onClick={handleShareLocation}
                        size="icon"
                        variant="outline"
                    >
                        <MapPin className="h-4 w-4" />
                    </Button>
                    <Input
                        ref={inputRef}
                        value={messageInput}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSendMessage}
                        size="icon"
                        disabled={!messageInput.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

// Add animation delay utility classes
const style = document.createElement('style');
style.textContent = `
    .animation-delay-200 {
        animation-delay: 200ms;
    }
    .animation-delay-400 {
        animation-delay: 400ms;
    }
`;
document.head.appendChild(style);