// src/components/group/GroupCoordination.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    UserPlus,
    Users,
    MessageSquare,
    Bell,
    Map,
    ThumbsUp,
    CheckCircle,
    X,
    SendHorizontal,
    Plus,
    Heart,
    Trash,
    Pin,
    MapPin,
    Star
} from "lucide-react";
import { Vacation } from '@/lib/firebase/vacations';
import { cn } from '@/lib/utils';

// Internal types
interface UserProfile {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

interface GroupMessage {
    id: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
    content: string;
    timestamp: Date;
    attachments?: {
        type: 'itinerary' | 'location' | 'attraction' | 'image';
        id: string;
        name: string;
    }[];
    reactions?: {
        [userId: string]: 'like' | 'heart' | 'thumbsUp' | 'thumbsDown';
    };
    isPinned?: boolean;
}

interface GroupLocationUpdate {
    id: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
    location: {
        name: string;
        latitude: number;
        longitude: number;
        parkId?: string;
        attractionId?: string;
    };
    timestamp: Date;
    message?: string;
    isSharing: boolean;
}

interface GroupPoll {
    id: string;
    userId: string;
    userName: string;
    question: string;
    options: {
        id: string;
        text: string;
        votes: string[]; // Array of user IDs
    }[];
    timestamp: Date;
    expiresAt?: Date;
    isActive: boolean;
}

interface GroupNotification {
    id: string;
    userId: string;
    userName: string;
    type: 'message' | 'location' | 'poll' | 'decision' | 'invite' | 'itinerary';
    message: string;
    timestamp: Date;
    read: boolean;
    referenceId?: string;
}

// We'll keep this interface but mark it as unused to silence the error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface GroupPreference {
    userId: string;
    preferences: {
        rides?: string[];
        dining?: string[];
        priority?: 'thrills' | 'family' | 'all';
        pace?: 'relaxed' | 'moderate' | 'ambitious';
    };
}

interface GroupCoordinationProps {
    readonly vacationId: string;
}

// Add this interface near the top of the file with other interfaces
interface PollOption {
    id: string;
    text: string;
}

// Mock data - in a real app, this would come from Firebase
const mockMessages: GroupMessage[] = [
    {
        id: 'msg1',
        userId: 'user1',
        userName: 'John Doe',
        content: "I've just created a new itinerary for Magic Kingdom on Tuesday. Check it out!",
        timestamp: new Date(Date.now() - 3600000 * 2),
        attachments: [
            {
                type: 'itinerary',
                id: 'itin1',
                name: 'Magic Kingdom - Tuesday',
            },
        ],
        reactions: {
            'user2': 'like',
            'user3': 'thumbsUp',
        },
        isPinned: true,
    },
    {
        id: 'msg2',
        userId: 'user2',
        userName: 'Jane Smith',
        content: "I'm at Space Mountain right now, the wait is only 30 minutes!",
        timestamp: new Date(Date.now() - 3600000),
        attachments: [
            {
                type: 'location',
                id: 'loc1',
                name: 'Space Mountain',
            },
        ],
    },
    {
        id: 'msg3',
        userId: 'user3',
        userName: 'Alex Johnson',
        content: "Where should we meet for lunch?",
        timestamp: new Date(Date.now() - 1800000),
    },
];

const mockLocationUpdates: GroupLocationUpdate[] = [
    {
        id: 'loc1',
        userId: 'user2',
        userName: 'Jane Smith',
        location: {
            name: 'Space Mountain',
            latitude: 28.419,
            longitude: -81.577,
            parkId: 'magickingdom',
            attractionId: 'spacemountain',
        },
        timestamp: new Date(Date.now() - 3600000),
        isSharing: true,
    },
    {
        id: 'loc2',
        userId: 'user3',
        userName: 'Alex Johnson',
        location: {
            name: 'Tomorrowland Terrace',
            latitude: 28.418,
            longitude: -81.578,
            parkId: 'magickingdom',
        },
        timestamp: new Date(Date.now() - 1800000),
        message: "Taking a break here for about 30 minutes",
        isSharing: true,
    },
];

const mockPolls: GroupPoll[] = [
    {
        id: 'poll1',
        userId: 'user1',
        userName: 'John Doe',
        question: "Where should we have dinner tonight?",
        options: [
            {
                id: 'opt1',
                text: "Be Our Guest",
                votes: ['user1', 'user3'],
            },
            {
                id: 'opt2',
                text: "Cinderella's Royal Table",
                votes: ['user2'],
            },
            {
                id: 'opt3',
                text: "Liberty Tree Tavern",
                votes: [],
            },
        ],
        timestamp: new Date(Date.now() - 86400000),
        isActive: true,
    },
    {
        id: 'poll2',
        userId: 'user2',
        userName: 'Jane Smith',
        question: "Which park should we visit on Thursday?",
        options: [
            {
                id: 'opt1',
                text: "Magic Kingdom",
                votes: ['user3'],
            },
            {
                id: 'opt2',
                text: "Epcot",
                votes: ['user1', 'user2'],
            },
            {
                id: 'opt3',
                text: "Hollywood Studios",
                votes: [],
            },
            {
                id: 'opt4',
                text: "Animal Kingdom",
                votes: [],
            },
        ],
        timestamp: new Date(Date.now() - 172800000),
        isActive: true,
    },
];

const mockNotifications: GroupNotification[] = [
    {
        id: 'notif1',
        userId: 'user2',
        userName: 'Jane Smith',
        type: 'message',
        message: "Jane mentioned you in a message",
        timestamp: new Date(Date.now() - 1800000),
        read: false,
        referenceId: 'msg2',
    },
    {
        id: 'notif2',
        userId: 'user1',
        userName: 'John Doe',
        type: 'poll',
        message: "John created a new poll about dinner options",
        timestamp: new Date(Date.now() - 86400000),
        read: true,
        referenceId: 'poll1',
    },
    {
        id: 'notif3',
        userId: 'user1',
        userName: 'John Doe',
        type: 'itinerary',
        message: "John updated the Magic Kingdom itinerary",
        timestamp: new Date(Date.now() - 3600000 * 3),
        read: false,
        referenceId: 'itin1',
    },
];

const mockMembers: Pick<UserProfile, 'id' | 'displayName' | 'email' | 'photoURL'>[] = [
    {
        id: 'user1',
        displayName: 'John Doe',
        email: 'john@example.com',
        photoURL: '',
    },
    {
        id: 'user2',
        displayName: 'Jane Smith',
        email: 'jane@example.com',
        photoURL: '',
    },
    {
        id: 'user3',
        displayName: 'Alex Johnson',
        email: 'alex@example.com',
        photoURL: '',
    },
];

// Helper Components
const MessageList = ({
    messages,
    handleReactToMessage,
    user,
    getInitials
}: {
    messages: GroupMessage[] | undefined,
    handleReactToMessage: (messageId: string, reaction: string) => void,
    user: { uid?: string; photoURL?: string | null; displayName?: string | null } | null,
    getInitials: (name: string) => string
}) => {
    if (!messages?.length) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No messages yet. Start the conversation!
            </div>
        );
    }

    return (
        <>
            {/* Pinned Messages */}
            {messages.some(m => m.isPinned) && (
                <div className="mb-4">
                    <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                        <Pin className="h-3 w-3 mr-1" />
                        PINNED MESSAGES
                    </div>
                    {messages
                        .filter(m => m.isPinned)
                        .map(message => (
                            <div
                                key={message.id}
                                className="bg-secondary/20 p-2 rounded-lg mb-2 text-sm border-l-2 border-primary"
                            >
                                <div className="font-medium">{message.userName}</div>
                                <div>{message.content}</div>
                            </div>
                        ))}
                </div>
            )}

            {/* Messages */}
            {messages.map(message => {
                const isCurrentUser = user?.uid === message.userId;
                const hasAttachments = message.attachments && message.attachments.length > 0;
                const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;

                return (
                    <div
                        key={message.id}
                        className={cn(
                            "flex",
                            isCurrentUser ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "max-w-[80%]",
                            isCurrentUser ? "order-2" : "order-1"
                        )}>
                            {!isCurrentUser && (
                                <div className="flex items-center mb-1">
                                    <Avatar className="h-6 w-6 mr-2">
                                        {message.userPhotoURL ? (
                                            <AvatarImage src={message.userPhotoURL} alt={message.userName} />
                                        ) : (
                                            <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
                                        )}
                                    </Avatar>
                                    <span className="text-sm font-medium">{message.userName}</span>
                                </div>
                            )}

                            <div className={cn(
                                "rounded-lg p-3",
                                isCurrentUser
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary",
                                message.isPinned && "border-l-2 border-yellow-500"
                            )}>
                                <div>{message.content}</div>

                                {/* Attachments */}
                                {hasAttachments && (
                                    <div className="mt-2 space-y-2">
                                        {message.attachments?.map((attachment, index) => (
                                            <div
                                                key={`${message.id}-attachment-${index}`}
                                                className={cn(
                                                    "text-sm py-1 px-2 rounded flex items-center",
                                                    isCurrentUser
                                                        ? "bg-primary-foreground/10"
                                                        : "bg-background/80"
                                                )}
                                            >
                                                {attachment.type === 'itinerary' && (
                                                    <Map className="h-3.5 w-3.5 mr-1.5" />
                                                )}
                                                {attachment.type === 'location' && (
                                                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                                                )}
                                                {attachment.type === 'attraction' && (
                                                    <Star className="h-3.5 w-3.5 mr-1.5" />
                                                )}
                                                {attachment.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Reactions and timestamp */}
                            <div className="flex justify-between items-center mt-1">
                                <div className="text-xs text-muted-foreground">
                                    {format(message.timestamp, 'h:mm a')}
                                </div>

                                <div className="flex items-center space-x-1">
                                    {hasReactions && (
                                        <div className="flex bg-secondary/50 rounded-full p-0.5 text-xs">
                                            {Object.values(message.reactions || {}).includes('like') && (
                                                <div className="flex items-center mr-1">
                                                    <ThumbsUp className="h-3 w-3 text-blue-500" />
                                                    <span className="ml-0.5">
                                                        {Object.values(message.reactions || {}).filter(r => r === 'like').length}
                                                    </span>
                                                </div>
                                            )}
                                            {Object.values(message.reactions || {}).includes('thumbsUp') && (
                                                <div className="flex items-center mr-1">
                                                    <ThumbsUp className="h-3 w-3 text-green-500" />
                                                    <span className="ml-0.5">
                                                        {Object.values(message.reactions || {}).filter(r => r === 'thumbsUp').length}
                                                    </span>
                                                </div>
                                            )}
                                            {Object.values(message.reactions || {}).includes('heart') && (
                                                <div className="flex items-center">
                                                    <Heart className="h-3 w-3 text-red-500" />
                                                    <span className="ml-0.5">
                                                        {Object.values(message.reactions || {}).filter(r => r === 'heart').length}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleReactToMessage(message.id, 'like')}
                                    >
                                        <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {isCurrentUser && (
                            <Avatar className="h-6 w-6 ml-2 order-1 self-end mb-2">
                                {user.photoURL ? (
                                    <AvatarImage src={user.photoURL} alt={user.displayName || ''} />
                                ) : (
                                    <AvatarFallback>{user.displayName ? getInitials(user.displayName) : 'U'}</AvatarFallback>
                                )}
                            </Avatar>
                        )}
                    </div>
                );
            })}
        </>
    );
};

const LocationList = ({
    locationUpdates,
    getInitials
}: {
    locationUpdates: GroupLocationUpdate[] | undefined,
    getInitials: (name: string) => string
}) => {
    if (!locationUpdates?.length) {
        return (
            <div className="text-center py-4 text-muted-foreground">
                No one is sharing their location right now.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {locationUpdates.map(update => (
                <div key={update.id} className="flex items-center bg-secondary/20 p-3 rounded-lg">
                    <Avatar className="h-10 w-10 mr-3">
                        {update.userPhotoURL ? (
                            <AvatarImage src={update.userPhotoURL} alt={update.userName} />
                        ) : (
                            <AvatarFallback>{getInitials(update.userName)}</AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <div className="font-medium">{update.userName}</div>
                            <div className="text-xs text-muted-foreground">
                                {format(update.timestamp, 'h:mm a')}
                            </div>
                        </div>

                        <div className="flex items-center text-sm">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
                            {update.location.name}
                        </div>

                        {update.message && (
                            <div className="text-sm mt-1">{update.message}</div>
                        )}
                    </div>

                    <Button variant="outline" size="sm" className="ml-2">
                        Navigate
                    </Button>
                </div>
            ))}
        </div>
    );
};

const PollList = ({
    polls,
    user,
    handleVotePoll
}: {
    polls: GroupPoll[] | undefined,
    user: { uid?: string; photoURL?: string | null; displayName?: string | null } | null,
    handleVotePoll: (pollId: string, optionId: string) => void
}) => {
    if (!polls?.length) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No polls have been created yet.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {polls.map(poll => {
                // Calculate total votes
                const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);

                // Check if current user has voted
                const userVoted = user && poll.options.some(opt =>
                    opt.votes.includes(user.uid || '')
                );

                // Find which option the user voted for
                const userVotedOption = user && poll.options.find(opt =>
                    opt.votes.includes(user?.uid || '')
                );

                return (
                    <Card key={poll.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{poll.question}</CardTitle>
                                    <CardDescription>
                                        Created by {poll.userName} • {format(poll.timestamp, 'MMM d, h:mm a')}
                                    </CardDescription>
                                </div>
                                <Badge variant={poll.isActive ? "default" : "secondary"}>
                                    {poll.isActive ? "Active" : "Closed"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {poll.options.map(option => {
                                    const percentage = totalVotes === 0
                                        ? 0
                                        : Math.round((option.votes.length / totalVotes) * 100);

                                    const isUserVote = user && option.votes.includes(user.uid || '');

                                    return (
                                        <div key={option.id} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="flex items-center">
                                                    {isUserVote && (
                                                        <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                                    )}
                                                    {option.text}
                                                </span>
                                                <span className="font-medium">{percentage}%</span>
                                            </div>

                                            <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "absolute inset-y-0 left-0 bg-primary rounded-full",
                                                        isUserVote && "bg-primary",
                                                        `w-[${percentage}%]`
                                                    )}
                                                ></div>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                <span>{option.votes.length} vote{option.votes.length !== 1 ? 's' : ''}</span>
                                                {poll.isActive && !userVoted && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-xs"
                                                        onClick={() => handleVotePoll(poll.id, option.id)}
                                                    >
                                                        Vote
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                        <CardFooter className="text-sm text-muted-foreground">
                            {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
                            {userVotedOption && (
                                <span className="ml-2">
                                    You voted for &quot;{userVotedOption.text}&quot;
                                </span>
                            )}
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
};

const NotificationList = ({
    notifications,
    handleMarkNotificationRead
}: {
    notifications: GroupNotification[] | undefined,
    handleMarkNotificationRead: (notificationId: string) => void
}) => {
    if (!notifications?.length) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                You have no notifications.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={cn(
                        "p-3 rounded-lg border flex items-start",
                        !notification.read && "bg-primary/5 border-primary/20"
                    )}
                >
                    <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center mr-3 flex-shrink-0",
                        !notification.read ? "bg-primary/10" : "bg-secondary"
                    )}>
                        {notification.type === 'message' && (
                            <MessageSquare className="h-4 w-4 text-primary" />
                        )}
                        {notification.type === 'location' && (
                            <Map className="h-4 w-4 text-primary" />
                        )}
                        {notification.type === 'poll' && (
                            <Users className="h-4 w-4 text-primary" />
                        )}
                        {notification.type === 'itinerary' && (
                            <Map className="h-4 w-4 text-primary" />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="font-medium text-sm">{notification.message}</div>
                        <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-muted-foreground">
                                {format(notification.timestamp, 'MMM d, h:mm a')}
                            </div>

                            {!notification.read && (
                                <Badge variant="outline" className="text-[10px] h-4 bg-primary/5">
                                    New
                                </Badge>
                            )}
                        </div>
                    </div>

                    {!notification.read && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-2"
                            onClick={() => handleMarkNotificationRead(notification.id)}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
};

// Add a new component to handle member list rendering
const MemberList = ({
    members,
    user,
    getInitials,
    handleRemoveVacationMember
}: {
    members: Pick<UserProfile, 'id' | 'displayName' | 'email' | 'photoURL'>[] | undefined,
    user: { uid?: string; photoURL?: string | null; displayName?: string | null } | null,
    getInitials: (name: string) => string,
    handleRemoveVacationMember: (userId: string) => void
}) => {
    if (!members?.length) {
        return (
            <div className="text-center py-4 text-muted-foreground">
                No members yet. Invite someone to join!
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {members.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                            {member.photoURL ? (
                                <AvatarImage src={member.photoURL} alt={member.displayName} />
                            ) : (
                                <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                            )}
                        </Avatar>

                        <div>
                            <div className="font-medium">
                                {member.displayName}
                                {member.id === user?.uid && (
                                    <span className="text-xs text-muted-foreground ml-2">(You)</span>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {member.email}
                            </div>
                        </div>
                    </div>

                    {user?.uid !== member.id && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveVacationMember(member.id)}
                        >
                            <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default function GroupCoordination({ vacationId }: GroupCoordinationProps) {
    const [activeTab, setActiveTab] = useState('chat');
    const [messageInput, setMessageInput] = useState('');
    const [shareEmail, setShareEmail] = useState('');
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showPollDialog, setShowPollDialog] = useState(false);
    const [isCreatingPoll, setIsCreatingPoll] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState<PollOption[]>([
        { id: crypto.randomUUID(), text: '' },
        { id: crypto.randomUUID(), text: '' }
    ]);
    const [locationSharingActive, setLocationSharingActive] = useState(false);

    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Mock queries - in a real app, these would fetch from Firebase
    useQuery({
        queryKey: ['vacation', vacationId],
        queryFn: () => ({ id: vacationId, name: 'Our Disney Vacation' } as Vacation),
    });

    const { data: messages, isLoading: isLoadingMessages } = useQuery({
        queryKey: ['vacationMessages', vacationId],
        queryFn: () => mockMessages,
    });

    const { data: locationUpdates, isLoading: isLoadingLocations } = useQuery({
        queryKey: ['locationUpdates', vacationId],
        queryFn: () => mockLocationUpdates,
    });

    const { data: polls, isLoading: isLoadingPolls } = useQuery({
        queryKey: ['vacationPolls', vacationId],
        queryFn: () => mockPolls,
    });

    const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
        queryKey: ['vacationNotifications', vacationId],
        queryFn: () => mockNotifications,
    });

    const { data: members, isLoading: isLoadingMembers } = useQuery({
        queryKey: ['vacationMembers', vacationId],
        queryFn: () => mockMembers,
    });

    // Mock mutations - in a real app, these would update Firebase
    const sendMessageMutation = useMutation({
        mutationFn: (message: string) => {
            // In a real app, this would save to Firebase
            console.log('Sending message:', message);
            return Promise.resolve();
        },
        onSuccess: () => {
            // Refetch messages
            queryClient.invalidateQueries({ queryKey: ['vacationMessages', vacationId] });
            // Clear input
            setMessageInput('');
        },
    });

    const shareVacationMutation = useMutation({
        mutationFn: (email: string) => {
            // In a real app, this would share with the user
            console.log('Sharing vacation with:', email);
            return Promise.resolve();
        },
        onSuccess: () => {
            // Refetch members
            queryClient.invalidateQueries({ queryKey: ['vacationMembers', vacationId] });
            // Clear input and close dialog
            setShareEmail('');
            setShowShareDialog(false);
        },
    });

    const toggleLocationSharingMutation = useMutation({
        mutationFn: (isActive: boolean) => {
            // In a real app, this would update location sharing status
            console.log('Toggling location sharing:', isActive);
            return Promise.resolve();
        },
        onSuccess: () => {
            // Update location sharing state
            setLocationSharingActive(!locationSharingActive);
        },
    });

    const createPollMutation = useMutation({
        mutationFn: (poll: { question: string; options: string[] }) => {
            // In a real app, this would create a poll
            console.log('Creating poll:', poll);
            return Promise.resolve();
        },
        onSuccess: () => {
            // Refetch polls
            queryClient.invalidateQueries({ queryKey: ['vacationPolls', vacationId] });
            // Reset poll state and close dialog
            setPollQuestion('');
            setPollOptions([
                { id: crypto.randomUUID(), text: '' },
                { id: crypto.randomUUID(), text: '' }
            ]);
            setShowPollDialog(false);
            setIsCreatingPoll(false);
        },
    });

    const votePollMutation = useMutation({
        mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) => {
            // In a real app, this would update the poll votes
            console.log('Voting in poll:', pollId, optionId);
            return Promise.resolve();
        },
        onSuccess: () => {
            // Refetch polls
            queryClient.invalidateQueries({ queryKey: ['vacationPolls', vacationId] });
        },
    });

    const reactToMessageMutation = useMutation({
        mutationFn: ({ messageId, reaction }: { messageId: string; reaction: string }) => {
            // In a real app, this would update the message reactions
            console.log('Reacting to message:', messageId, reaction);
            return Promise.resolve();
        },
        onSuccess: () => {
            // Refetch messages
            queryClient.invalidateQueries({ queryKey: ['vacationMessages', vacationId] });
        },
    });

    const markNotificationReadMutation = useMutation({
        mutationFn: (notificationId: string) => {
            // In a real app, this would mark notification as read
            console.log('Marking notification as read:', notificationId);
            return Promise.resolve();
        },
        onSuccess: () => {
            // Refetch notifications
            queryClient.invalidateQueries({ queryKey: ['vacationNotifications', vacationId] });
        },
    });

    const removeVacationMemberMutation = useMutation({
        mutationFn: (userId: string) => {
            // In a real app, this would remove the member
            console.log('Removing vacation member:', userId);
            return Promise.resolve();
        },
        onSuccess: () => {
            // Refetch members
            queryClient.invalidateQueries({ queryKey: ['vacationMembers', vacationId] });
        },
    });

    // Handle sending a message
    const handleSendMessage = () => {
        if (messageInput.trim() === '') return;
        sendMessageMutation.mutate(messageInput);
    };

    // Handle sharing the vacation
    const handleShareVacation = () => {
        if (shareEmail.trim() === '') return;
        shareVacationMutation.mutate(shareEmail);
    };

    // Handle toggling location sharing
    const handleToggleLocationSharing = () => {
        toggleLocationSharingMutation.mutate(!locationSharingActive);
    };

    // Handle creating a poll
    const handleCreatePoll = () => {
        // Validate poll inputs
        if (pollQuestion.trim() === '') return;
        if (pollOptions.filter(opt => opt.text.trim() !== '').length < 2) return;

        // Create poll
        createPollMutation.mutate({
            question: pollQuestion,
            options: pollOptions.filter(opt => opt.text.trim() !== '').map(opt => opt.text),
        });
    };

    // Handle voting in a poll
    const handleVotePoll = (pollId: string, optionId: string) => {
        votePollMutation.mutate({ pollId, optionId });
    };

    // Handle adding a poll option
    const handleAddPollOption = () => {
        setPollOptions([...pollOptions, { id: crypto.randomUUID(), text: '' }]);
    };

    // Handle updating a poll option
    const handleUpdatePollOption = (id: string, value: string) => {
        setPollOptions(pollOptions.map(option =>
            option.id === id ? { ...option, text: value } : option
        ));
    };

    // Handle removing a poll option
    const handleRemovePollOption = (id: string) => {
        if (pollOptions.length <= 2) return; // Keep at least 2 options
        setPollOptions(pollOptions.filter(option => option.id !== id));
    };

    // Handle reacting to a message
    const handleReactToMessage = (messageId: string, reaction: string) => {
        reactToMessageMutation.mutate({ messageId, reaction });
    };

    // Handle marking a notification as read
    const handleMarkNotificationRead = (notificationId: string) => {
        markNotificationReadMutation.mutate(notificationId);
    };

    // Handle removing a vacation member
    const handleRemoveVacationMember = (userId: string) => {
        if (!user) return;
        removeVacationMemberMutation.mutate(userId);
    };

    // Helper to get initials from a name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    // Get unread notifications count
    const unreadNotificationsCount = notifications?.filter(n => !n.read).length || 0;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Group Coordination</CardTitle>
                            <CardDescription>
                                Collaborate with your travel party
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowShareDialog(true)}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full bg-background border-b rounded-none">
                            <TabsTrigger value="chat" className="flex-1">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat
                            </TabsTrigger>
                            <TabsTrigger value="locations" className="flex-1">
                                <Map className="h-4 w-4 mr-2" />
                                Locations
                            </TabsTrigger>
                            <TabsTrigger value="polls" className="flex-1">
                                <Users className="h-4 w-4 mr-2" />
                                Polls
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="flex-1 relative">
                                <Bell className="h-4 w-4 mr-2" />
                                Alerts
                                {unreadNotificationsCount > 0 && (
                                    <span className="absolute top-0 right-0 flex h-4 w-4 -translate-y-1/3 translate-x-1/3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-xs text-white items-center justify-center">
                                            {unreadNotificationsCount}
                                        </span>
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Chat Tab */}
                        <TabsContent value="chat" className="p-0">
                            <div className="flex flex-col h-[500px]">
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {isLoadingMessages ? (
                                            <div className="flex justify-center py-8">
                                                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                            </div>
                                        ) : (
                                            <MessageList
                                                messages={messages}
                                                handleReactToMessage={handleReactToMessage}
                                                user={user}
                                                getInitials={getInitials}
                                            />
                                        )}
                                    </div>
                                </ScrollArea>

                                {/* Message Input */}
                                <div className="p-3 border-t">
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            onClick={handleSendMessage}
                                            disabled={messageInput.trim() === ''}
                                        >
                                            <SendHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Locations Tab */}
                        <TabsContent value="locations" className="p-4">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-medium">Location Sharing</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Share your location with your travel party
                                        </p>
                                    </div>

                                    <div className="flex items-center">
                                        <span className={cn(
                                            "h-2.5 w-2.5 rounded-full mr-2",
                                            locationSharingActive ? "bg-green-500" : "bg-gray-400"
                                        )}></span>
                                        <span className="text-sm mr-3">
                                            {locationSharingActive ? "Active" : "Off"}
                                        </span>
                                        <Button
                                            variant={locationSharingActive ? "destructive" : "default"}
                                            onClick={handleToggleLocationSharing}
                                        >
                                            {locationSharingActive ? "Stop Sharing" : "Start Sharing"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-secondary/20 rounded-lg p-4 text-center">
                                    <Map className="h-8 w-8 mx-auto mb-2 text-primary" />
                                    <h3 className="font-medium">Walt Disney World Resort Map</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Interactive map showing party member locations
                                    </p>
                                    <Button className="w-full">View Map</Button>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Party Locations</h3>

                                    {(() => {
                                        if (isLoadingLocations) {
                                            return (
                                                <div className="flex justify-center py-4">
                                                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                                </div>
                                            );
                                        }

                                        if (locationUpdates?.length === 0) {
                                            return (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    No one is sharing their location right now.
                                                </div>
                                            );
                                        }

                                        return (
                                            <LocationList
                                                locationUpdates={locationUpdates}
                                                getInitials={getInitials}
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Polls Tab */}
                        <TabsContent value="polls" className="p-4">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-medium">Group Polls</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Make decisions together with your travel party
                                        </p>
                                    </div>

                                    <Button onClick={() => setShowPollDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Poll
                                    </Button>
                                </div>

                                {isLoadingPolls ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                    </div>
                                ) : (() => {
                                    if (polls?.length === 0) {
                                        return (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No polls have been created yet.
                                            </div>
                                        );
                                    }

                                    return (
                                        <PollList
                                            polls={polls}
                                            user={user}
                                            handleVotePoll={handleVotePoll}
                                        />
                                    );
                                })()}
                            </div>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications" className="p-4">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-medium">Notifications</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Stay updated with your travel party
                                        </p>
                                    </div>

                                    <Button variant="outline" size="sm">
                                        Mark All as Read
                                    </Button>
                                </div>

                                {(() => {
                                    if (isLoadingNotifications) {
                                        return (
                                            <div className="flex justify-center py-8">
                                                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                            </div>
                                        );
                                    }

                                    if (notifications?.length === 0) {
                                        return (
                                            <div className="text-center py-8 text-muted-foreground">
                                                You have no notifications.
                                            </div>
                                        );
                                    }

                                    return (
                                        <NotificationList
                                            notifications={notifications}
                                            handleMarkNotificationRead={handleMarkNotificationRead}
                                        />
                                    );
                                })()}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Group Members Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Group Members</CardTitle>
                    <CardDescription>
                        {members?.length || 0} people in this vacation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {(() => {
                        if (isLoadingMembers) {
                            return (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                            )
                        }

                        if (members?.length === 0) {
                            return (
                                <div className="text-center py-4 text-muted-foreground">
                                    No members yet. Invite someone to join!
                                </div>
                            )
                        }

                        return (
                            <MemberList
                                members={members}
                                user={user}
                                getInitials={getInitials}
                                handleRemoveVacationMember={handleRemoveVacationMember}
                            />
                        )
                    })()}
                </CardContent>
                <CardFooter className="pt-0">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowShareDialog(true)}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite More People
                    </Button>
                </CardFooter>
            </Card>

            {/* Share Dialog */}
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share Vacation Plan</DialogTitle>
                        <DialogDescription>
                            Invite others to collaborate on this vacation plan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                            />
                        </div>

                        <div className="bg-secondary/20 p-3 rounded-lg text-sm">
                            <h4 className="font-medium mb-1">What they&apos;ll have access to:</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li className="flex items-center">
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                    View and edit itineraries
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                    Participate in group chat and polls
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                    Share location during the trip
                                </li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleShareVacation}>
                            Share Vacation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Poll Dialog */}
            <Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a Poll</DialogTitle>
                        <DialogDescription>
                            Ask the group to vote on a decision.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="question">Question</Label>
                            <Input
                                id="question"
                                placeholder="What would you like to ask?"
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Options</Label>
                            {pollOptions.map((option) => (
                                <div key={option.id} className="flex items-center gap-2">
                                    <Input
                                        placeholder={`Option ${pollOptions.findIndex(o => o.id === option.id) + 1}`}
                                        value={option.text}
                                        onChange={(e) => handleUpdatePollOption(option.id, e.target.value)}
                                    />
                                    {pollOptions.length > 2 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleRemovePollOption(option.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={handleAddPollOption}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Option
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPollDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreatePoll}
                            disabled={
                                isCreatingPoll ||
                                pollQuestion.trim() === '' ||
                                pollOptions.filter(o => o.text.trim() !== '').length < 2
                            }
                        >
                            {isCreatingPoll ? (
                                <>
                                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                                    Creating...
                                </>
                            ) : (
                                'Create Poll'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}