'use client';

import React, { useState, useEffect } from 'react';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { PresenceUpdate } from '@/lib/websocket/enhanced-websocket-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Circle,
    MapPin,
    Clock,
    Smartphone,
    Monitor,
    Tablet,
    Activity,
    Zap,
    Coffee,
    Eye,
    EyeOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActiveUsersPresenceProps {
    userId: string;
    roomId: string;
    className?: string;
    showDetails?: boolean;
    compact?: boolean;
}

interface UserPresence extends PresenceUpdate {
    userName?: string;
    userAvatar?: string;
    location?: {
        lat: number;
        lng: number;
        name?: string;
    };
}

export function ActiveUsersPresence({
    userId,
    roomId,
    className,
    showDetails = true,
    compact = false
}: ActiveUsersPresenceProps) {
    const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
    const [showOfflineUsers, setShowOfflineUsers] = useState(false);

    const {
        isConnected,
        roomMembers,
        memberLocations,
        updatePresence,
    } = useRealtimeCollaboration({
        userId,
        roomId,
        roomType: 'location_sharing',
    });

    // Update own presence periodically
    useEffect(() => {
        if (!isConnected) return;

        // Set initial presence
        updatePresence('active');

        // Update presence based on activity
        let idleTimer: NodeJS.Timeout;
        const resetIdleTimer = () => {
            clearTimeout(idleTimer);
            updatePresence('active');
            idleTimer = setTimeout(() => {
                updatePresence('idle');
            }, 5 * 60 * 1000); // 5 minutes
        };

        // Listen for user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetIdleTimer, true);
        });

        // Set offline status on page unload
        const handleUnload = () => {
            updatePresence('offline');
        };
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            clearTimeout(idleTimer);
            events.forEach(event => {
                document.removeEventListener(event, resetIdleTimer, true);
            });
            window.removeEventListener('beforeunload', handleUnload);
            updatePresence('offline');
        };
    }, [isConnected, updatePresence]);

    // Get user initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Get status color
    const getStatusColor = (status: PresenceUpdate['status']) => {
        switch (status) {
            case 'online':
            case 'active':
                return 'bg-green-500';
            case 'idle':
                return 'bg-yellow-500';
            case 'offline':
            default:
                return 'bg-gray-400';
        }
    };

    // Get status icon
    const getStatusIcon = (status: PresenceUpdate['status']) => {
        switch (status) {
            case 'active':
                return <Zap className="h-3 w-3" />;
            case 'idle':
                return <Coffee className="h-3 w-3" />;
            case 'offline':
                return <Circle className="h-3 w-3" />;
            default:
                return <Circle className="h-3 w-3" />;
        }
    };

    // Get device icon
    const getDeviceIcon = (device?: PresenceUpdate['device']) => {
        if (!device) return null;
        
        switch (device.type) {
            case 'mobile':
                return <Smartphone className="h-4 w-4" />;
            case 'tablet':
                return <Tablet className="h-4 w-4" />;
            case 'desktop':
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    // Get activity description
    const getActivityDescription = (presence: UserPresence) => {
        if (presence.currentActivity) {
            return presence.currentActivity;
        }
        
        const location = memberLocations.get(presence.userId);
        if (location) {
            if (location.activity === 'stationary') {
                return 'At a location';
            } else if (location.activity === 'walking') {
                return 'Walking';
            } else if (location.activity === 'running') {
                return 'Moving quickly';
            } else if (location.activity === 'riding') {
                return 'On a ride';
            }
        }
        
        return presence.status === 'active' ? 'Active in app' : 'Away';
    };

    // Toggle user expansion
    const toggleUserExpansion = (userId: string) => {
        setExpandedUsers(prev => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    // Separate online and offline users
    const onlineUsers = Array.from(roomMembers.entries())
        .filter(([_, presence]) => presence.status !== 'offline')
        .map(([id, presence]) => ({ ...presence, userId: id }));
    
    const offlineUsers = Array.from(roomMembers.entries())
        .filter(([_, presence]) => presence.status === 'offline')
        .map(([id, presence]) => ({ ...presence, userId: id }));

    if (!isConnected) {
        return null;
    }

    if (compact) {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <div className="flex -space-x-2">
                    {onlineUsers.slice(0, 3).map((user) => (
                        <TooltipProvider key={user.userId}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Avatar className="h-8 w-8 border-2 border-background">
                                        <AvatarImage src={user.userAvatar} />
                                        <AvatarFallback>
                                            {getInitials(user.userName || user.userId)}
                                        </AvatarFallback>
                                        <div className={cn(
                                            'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                                            getStatusColor(user.status)
                                        )} />
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{user.userName || user.userId}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                    {onlineUsers.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs font-medium">+{onlineUsers.length - 3}</span>
                        </div>
                    )}
                </div>
                <Badge variant="secondary" className="text-xs">
                    {onlineUsers.length} online
                </Badge>
            </div>
        );
    }

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Active Users</CardTitle>
                    <Badge variant="outline">
                        <Activity className="h-3 w-3 mr-1" />
                        {onlineUsers.length} / {roomMembers.size}
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent>
                <ScrollArea className="h-[300px]">
                    {/* Online users */}
                    <div className="space-y-2">
                        {onlineUsers.map((user) => {
                            const isExpanded = expandedUsers.has(user.userId);
                            const location = memberLocations.get(user.userId);
                            const isCurrentUser = user.userId === userId;
                            
                            return (
                                <div
                                    key={user.userId}
                                    className={cn(
                                        'p-3 rounded-lg border transition-all',
                                        isExpanded && 'bg-muted/50',
                                        isCurrentUser && 'border-primary'
                                    )}
                                >
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => showDetails && toggleUserExpansion(user.userId)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.userAvatar} />
                                                    <AvatarFallback>
                                                        {getInitials(user.userName || user.userId)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className={cn(
                                                    'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background flex items-center justify-center',
                                                    getStatusColor(user.status)
                                                )}>
                                                    {getStatusIcon(user.status)}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm">
                                                        {user.userName || user.userId}
                                                    </p>
                                                    {isCurrentUser && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            You
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {getActivityDescription(user)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {user.device && getDeviceIcon(user.device)}
                                            {location && (
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    {showDetails && isExpanded && (
                                        <div className="mt-3 pt-3 border-t space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Last seen</span>
                                                <span>{formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}</span>
                                            </div>
                                            
                                            {user.device && (
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Device</span>
                                                    <span className="capitalize">
                                                        {user.device.type}
                                                        {user.device.os && ` • ${user.device.os}`}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {location && (
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Location</span>
                                                    <span>
                                                        {location.location.lat.toFixed(4)}, {location.location.lng.toFixed(4)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Offline users */}
                    {offlineUsers.length > 0 && (
                        <>
                            <div className="my-4">
                                <Button
                                    onClick={() => setShowOfflineUsers(!showOfflineUsers)}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                >
                                    {showOfflineUsers ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                    {showOfflineUsers ? 'Hide' : 'Show'} offline users ({offlineUsers.length})
                                </Button>
                            </div>
                            
                            {showOfflineUsers && (
                                <div className="space-y-2 opacity-60">
                                    {offlineUsers.map((user) => (
                                        <div
                                            key={user.userId}
                                            className="p-3 rounded-lg border"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10 opacity-50">
                                                        <AvatarImage src={user.userAvatar} />
                                                        <AvatarFallback>
                                                            {getInitials(user.userName || user.userId)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className={cn(
                                                        'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                                                        getStatusColor('offline')
                                                    )} />
                                                </div>
                                                
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {user.userName || user.userId}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Last seen {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}