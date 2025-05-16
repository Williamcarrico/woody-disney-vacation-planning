import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
    Calendar,
    Car,
    Clock,
    Plus,
    User,
    ThumbsUp,
    ThumbsDown,
    Edit,
    Trash,
    MoreHorizontal,
    Star,
    Coffee,
    TicketIcon,
    PartyPopper,
    HelpCircle,
    CheckCircle2,
    Vote,
    Share2,
} from "lucide-react"
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Types
type VoteType = 'up' | 'down' | 'star'

interface ItineraryDay {
    date: string // ISO date string
    items: ItineraryItem[]
}

interface ItineraryItem {
    id: string
    type: 'attraction' | 'dining' | 'show' | 'rest' | 'transportation' | 'other'
    name: string
    time: string // HH:mm format
    duration: number // in minutes
    notes?: string
    location?: {
        name: string
        parkId?: string
        areaId?: string
    }
    votes: {
        userId: string
        vote: VoteType
    }[]
    suggestedBy: {
        userId: string
        userName: string
    }
    status: 'suggested' | 'approved' | 'rejected' | 'completed'
}

interface Poll {
    id: string
    title: string
    description?: string
    options: {
        id: string
        text: string
        votes: string[] // array of userIds
    }[]
    createdBy: {
        userId: string
        userName: string
    }
    status: 'active' | 'closed'
    createdAt: Date
    closesAt?: Date
}

interface CollaborativeItineraryProps {
    vacationId: string
}

export default function CollaborativeItinerary({ vacationId }: CollaborativeItineraryProps) {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('itinerary')
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [newPollDialogOpen, setNewPollDialogOpen] = useState(false)
    const [pollTitle, setPollTitle] = useState('')
    const [pollDescription, setPollDescription] = useState('')
    const [pollOptions, setPollOptions] = useState([
        { id: crypto.randomUUID(), text: '' },
        { id: crypto.randomUUID(), text: '' }
    ])

    // Fetch itinerary data
    const { data: itinerary, isLoading: isItineraryLoading } = useQuery({
        queryKey: ['itinerary', vacationId],
        queryFn: async () => {
            // In a real app, this would fetch from Firestore
            // For now, we'll use mock data
            const mockItinerary: ItineraryDay[] = [
                {
                    date: '2023-12-15',
                    items: [
                        {
                            id: 'item1',
                            type: 'attraction',
                            name: 'Space Mountain',
                            time: '10:00',
                            duration: 60,
                            location: {
                                name: 'Tomorrowland',
                                parkId: 'magickingdom'
                            },
                            votes: [
                                { userId: 'user1', vote: 'up' },
                                { userId: 'user2', vote: 'up' },
                                { userId: 'user3', vote: 'star' }
                            ],
                            suggestedBy: {
                                userId: 'user1',
                                userName: 'John Doe'
                            },
                            status: 'approved'
                        },
                        {
                            id: 'item2',
                            type: 'dining',
                            name: 'Cosmic Ray\'s Starlight Café',
                            time: '12:00',
                            duration: 90,
                            location: {
                                name: 'Tomorrowland',
                                parkId: 'magickingdom'
                            },
                            votes: [
                                { userId: 'user1', vote: 'up' },
                                { userId: 'user3', vote: 'down' }
                            ],
                            suggestedBy: {
                                userId: 'user2',
                                userName: 'Jane Smith'
                            },
                            status: 'suggested'
                        },
                        {
                            id: 'item3',
                            type: 'attraction',
                            name: 'Haunted Mansion',
                            time: '14:00',
                            duration: 45,
                            location: {
                                name: 'Liberty Square',
                                parkId: 'magickingdom'
                            },
                            votes: [
                                { userId: 'user1', vote: 'up' },
                                { userId: 'user2', vote: 'up' },
                                { userId: 'user3', vote: 'up' }
                            ],
                            suggestedBy: {
                                userId: 'user3',
                                userName: 'Alex Johnson'
                            },
                            status: 'approved'
                        }
                    ]
                },
                {
                    date: '2023-12-16',
                    items: [
                        {
                            id: 'item4',
                            type: 'attraction',
                            name: 'Test Track',
                            time: '09:30',
                            duration: 60,
                            location: {
                                name: 'Future World',
                                parkId: 'epcot'
                            },
                            votes: [
                                { userId: 'user1', vote: 'up' },
                                { userId: 'user2', vote: 'star' }
                            ],
                            suggestedBy: {
                                userId: 'user1',
                                userName: 'John Doe'
                            },
                            status: 'approved'
                        }
                    ]
                }
            ]

            return mockItinerary
        },
        enabled: !!vacationId
    })

    // Fetch active polls
    const { data: polls, isLoading: isPollsLoading } = useQuery({
        queryKey: ['polls', vacationId],
        queryFn: async () => {
            // In a real app, this would fetch from Firestore
            // For now, we'll use mock data
            const mockPolls: Poll[] = [
                {
                    id: 'poll1',
                    title: 'Where should we eat dinner on Tuesday?',
                    description: 'We need to decide where to eat dinner on our first day at Magic Kingdom.',
                    options: [
                        { id: 'opt1', text: 'Be Our Guest Restaurant', votes: ['user1', 'user3'] },
                        { id: 'opt2', text: 'Liberty Tree Tavern', votes: ['user2'] },
                        { id: 'opt3', text: 'The Plaza Restaurant', votes: [] }
                    ],
                    createdBy: {
                        userId: 'user1',
                        userName: 'John Doe'
                    },
                    status: 'active',
                    createdAt: new Date(Date.now() - 86400000) // 1 day ago
                },
                {
                    id: 'poll2',
                    title: 'Which park should we visit on Thursday?',
                    options: [
                        { id: 'opt1', text: 'Hollywood Studios', votes: ['user1', 'user2'] },
                        { id: 'opt2', text: 'Animal Kingdom', votes: ['user3'] }
                    ],
                    createdBy: {
                        userId: 'user2',
                        userName: 'Jane Smith'
                    },
                    status: 'active',
                    createdAt: new Date(Date.now() - 172800000) // 2 days ago
                }
            ]

            return mockPolls
        },
        enabled: !!vacationId
    })

    // Set selected day to first day if not selected
    useEffect(() => {
        if (itinerary && itinerary.length > 0 && !selectedDay) {
            setSelectedDay(itinerary[0].date)
        }
    }, [itinerary, selectedDay])

    // Event handlers
    const handleDaySelect = (date: string) => {
        setSelectedDay(date)
    }

    const handleVote = (itemId: string, vote: VoteType) => {
        // In a real app, this would update Firestore
        toast.success("Vote recorded", {
            description: `You voted ${vote} for this item.`
        })
    }

    const handlePollVote = (pollId: string, optionId: string) => {
        void (pollId);
        void (optionId);
        // In a real app, this would update Firestore
        toast.success("Vote recorded", {
            description: "Your vote has been recorded."
        })
    }

    const handleCreatePoll = (e: React.FormEvent) => {
        e.preventDefault()

        // Validate inputs
        if (!pollTitle.trim()) {
            toast.error("Error", {
                description: "Poll title is required"
            })
            return
        }

        const validOptions = pollOptions.filter(option => option.text.trim())
        if (validOptions.length < 2) {
            toast.error("Error", {
                description: "At least two valid options are required"
            })
            return
        }

        // In a real app, this would create a new poll in Firestore
        toast.success("Poll created", {
            description: "Your poll has been created and shared with the party."
        })

        // Reset form
        setPollTitle('')
        setPollDescription('')
        setPollOptions([
            { id: crypto.randomUUID(), text: '' },
            { id: crypto.randomUUID(), text: '' }
        ])
        setNewPollDialogOpen(false)
    }

    const handleAddPollOption = () => {
        setPollOptions([...pollOptions, { id: crypto.randomUUID(), text: '' }])
    }

    const handleRemovePollOption = (id: string) => {
        const newOptions = pollOptions.filter(option => option.id !== id)
        setPollOptions(newOptions)
    }

    const handleChangePollOption = (id: string, value: string) => {
        const newOptions = pollOptions.map(option =>
            option.id === id ? { ...option, text: value } : option
        )
        setPollOptions(newOptions)
    }

    // Render helpers
    const getItemIcon = (type: ItineraryItem['type']) => {
        switch (type) {
            case 'attraction':
                return <TicketIcon className="h-4 w-4" />
            case 'dining':
                return <Coffee className="h-4 w-4" />
            case 'show':
                return <PartyPopper className="h-4 w-4" />
            case 'rest':
                return <Coffee className="h-4 w-4" />
            case 'transportation':
                return <Car className="h-4 w-4" />
            default:
                return <HelpCircle className="h-4 w-4" />
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, 'EEE, MMM d')
    }

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':')
        const date = new Date()
        date.setHours(parseInt(hours, 10))
        date.setMinutes(parseInt(minutes, 10))

        return format(date, 'h:mm a')
    }

    const getStatusBadge = (status: ItineraryItem['status']) => {
        switch (status) {
            case 'suggested':
                return <Badge variant="outline" className="ml-2">Suggested</Badge>
            case 'approved':
                return <Badge variant="default" className="ml-2 bg-green-500">Approved</Badge>
            case 'rejected':
                return <Badge variant="destructive" className="ml-2">Rejected</Badge>
            case 'completed':
                return <Badge variant="secondary" className="ml-2">Completed</Badge>
            default:
                return null
        }
    }

    const getVoteCount = (votes: ItineraryItem['votes'], type: VoteType) => {
        return votes.filter(v => v.vote === type).length
    }

    const getUserVote = (votes: ItineraryItem['votes']) => {
        if (!user) return null
        const userVote = votes.find(v => v.userId === user.uid)
        return userVote ? userVote.vote : null
    }

    if (isItineraryLoading || isPollsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const selectedDayData = itinerary?.find(day => day.date === selectedDay)

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Collaborative Planning
                        </CardTitle>
                        <CardDescription>
                            Plan and vote on activities with your party
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full rounded-none border-b h-11">
                        <TabsTrigger value="itinerary" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                            <Calendar className="h-4 w-4 mr-2" />
                            Itinerary
                        </TabsTrigger>
                        <TabsTrigger value="polls" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                            <Vote className="h-4 w-4 mr-2" />
                            Polls & Voting
                        </TabsTrigger>
                        <TabsTrigger value="suggestions" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                            <Star className="h-4 w-4 mr-2" />
                            Suggestions
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="itinerary" className="p-0 mt-0">
                        <div className="border-b">
                            <ScrollArea className="whitespace-nowrap pb-2 pt-2">
                                <div className="flex space-x-2 px-4">
                                    {itinerary?.map(day => (
                                        <button
                                            key={day.date}
                                            onClick={() => handleDaySelect(day.date)}
                                            className={cn(
                                                "inline-flex flex-col items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                                                selectedDay === day.date ? "bg-primary text-primary-foreground" : "bg-background"
                                            )}
                                        >
                                            {formatDate(day.date)}
                                            <span className="mt-1 text-xs">
                                                {day.items.length} {day.items.length === 1 ? 'item' : 'items'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="px-4 py-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">
                                    {selectedDay ? formatDate(selectedDay) : 'No day selected'}
                                </h3>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>

                            {selectedDayData && selectedDayData.items.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedDayData.items.map(item => (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "border rounded-lg p-4",
                                                item.status === 'approved' ? "border-green-500/20 bg-green-50/50 dark:bg-green-950/10" :
                                                    item.status === 'rejected' ? "border-red-500/20 bg-red-50/50 dark:bg-red-950/10" :
                                                        "border-muted bg-muted/10"
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-primary/10 rounded-md p-2 text-primary mt-1">
                                                        {getItemIcon(item.type)}
                                                    </div>

                                                    <div>
                                                        <div className="font-medium flex items-center">
                                                            {item.name}
                                                            {getStatusBadge(item.status)}
                                                        </div>

                                                        <div className="text-sm text-muted-foreground">
                                                            {formatTime(item.time)} • {item.duration} min
                                                            {item.location && ` • ${item.location.name}`}
                                                        </div>

                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Suggested by {item.suggestedBy.userName}
                                                        </div>
                                                    </div>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Share2 className="h-4 w-4 mr-2" />
                                                            Share
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive">
                                                            <Trash className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {item.notes && (
                                                <div className="mt-2 text-sm bg-background/80 p-2 rounded-md">
                                                    {item.notes}
                                                </div>
                                            )}

                                            <div className="mt-3 pt-2 border-t flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn(
                                                            "h-8 px-2 text-xs gap-1",
                                                            getUserVote(item.votes) === 'up' && "bg-primary/10 text-primary"
                                                        )}
                                                        onClick={() => handleVote(item.id, 'up')}
                                                    >
                                                        <ThumbsUp className="h-3.5 w-3.5" />
                                                        {getVoteCount(item.votes, 'up')}
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn(
                                                            "h-8 px-2 text-xs gap-1",
                                                            getUserVote(item.votes) === 'down' && "bg-primary/10 text-primary"
                                                        )}
                                                        onClick={() => handleVote(item.id, 'down')}
                                                    >
                                                        <ThumbsDown className="h-3.5 w-3.5" />
                                                        {getVoteCount(item.votes, 'down')}
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn(
                                                            "h-8 px-2 text-xs gap-1",
                                                            getUserVote(item.votes) === 'star' && "bg-primary/10 text-primary"
                                                        )}
                                                        onClick={() => handleVote(item.id, 'star')}
                                                    >
                                                        <Star className="h-3.5 w-3.5" />
                                                        {getVoteCount(item.votes, 'star')}
                                                    </Button>
                                                </div>

                                                {item.status === 'suggested' && (
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                                            <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                                                            Reject
                                                        </Button>
                                                        <Button size="sm" className="h-7 px-2 text-xs">
                                                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                            Approve
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 text-muted-foreground border rounded-md">
                                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    <p>No items for this day</p>
                                    <p className="text-sm">Add some activities to your itinerary</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="polls" className="p-4 mt-0">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Active Polls</h3>
                            <Button size="sm" onClick={() => setNewPollDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Poll
                            </Button>
                        </div>

                        {polls && polls.length > 0 ? (
                            <div className="space-y-4">
                                {polls.map(poll => (
                                    <div key={poll.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{poll.title}</h4>
                                                {poll.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">{poll.description}</p>
                                                )}
                                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    Created by {poll.createdBy.userName}
                                                    <span className="mx-1">•</span>
                                                    <Clock className="h-3 w-3" />
                                                    {format(poll.createdAt, 'MMM d, h:mm a')}
                                                </div>
                                            </div>

                                            <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                                                {poll.status === 'active' ? 'Active' : 'Closed'}
                                            </Badge>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            {poll.options.map(option => {
                                                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)
                                                const votePercentage = totalVotes > 0
                                                    ? Math.round((option.votes.length / totalVotes) * 100)
                                                    : 0
                                                const hasVoted = user && option.votes.includes(user.uid)

                                                return (
                                                    <div key={option.id} className="rounded-md border p-2">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex-1">
                                                                <div className="font-medium text-sm">{option.text}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {option.votes.length} {option.votes.length === 1 ? 'vote' : 'votes'} ({votePercentage}%)
                                                                </div>
                                                            </div>

                                                            <Button
                                                                variant={hasVoted ? "default" : "outline"}
                                                                size="sm"
                                                                className="h-8 px-3"
                                                                onClick={() => handlePollVote(poll.id, option.id)}
                                                                disabled={poll.status !== 'active'}
                                                            >
                                                                {hasVoted ? (
                                                                    <>
                                                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                                                        Voted
                                                                    </>
                                                                ) : (
                                                                    'Vote'
                                                                )}
                                                            </Button>
                                                        </div>

                                                        {/* Progress bar for votes */}
                                                        <div className="mt-2 w-full bg-muted rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="bg-primary h-full rounded-full transition-all"
                                                                style={{ width: `${votePercentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 text-muted-foreground border rounded-md">
                                <Vote className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>No active polls</p>
                                <p className="text-sm">Create a poll to get your party&apos;s opinion</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="suggestions" className="p-4 mt-0">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Suggested Activities</h3>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Suggest Activity
                            </Button>
                        </div>

                        <div className="text-center p-8 text-muted-foreground border rounded-md">
                            <Star className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p>No suggestions yet</p>
                            <p className="text-sm">Suggest activities for your vacation</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>

            {/* New Poll Dialog */}
            <Dialog open={newPollDialogOpen} onOpenChange={setNewPollDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Poll</DialogTitle>
                        <DialogDescription>
                            Create a poll to get your party&apos;s opinion on activities, dining, or other vacation decisions.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreatePoll}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Poll Question</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Where should we eat on Tuesday?"
                                    value={pollTitle}
                                    onChange={(e) => setPollTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Add more details about the poll"
                                    value={pollDescription}
                                    onChange={(e) => setPollDescription(e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Options</Label>
                                <div className="space-y-2">
                                    {pollOptions.map((option) => (
                                        <div key={option.id} className="flex gap-2">
                                            <Input
                                                placeholder={`Option ${pollOptions.indexOf(option) + 1}`}
                                                value={option.text}
                                                onChange={(e) => handleChangePollOption(option.id, e.target.value)}
                                                required
                                            />
                                            {pollOptions.length > 2 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemovePollOption(option.id)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
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

                            <div className="space-y-2">
                                <Label htmlFor="duration">Poll Duration</Label>
                                <Select defaultValue="24h">
                                    <SelectTrigger id="duration">
                                        <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="12h">12 hours</SelectItem>
                                        <SelectItem value="24h">24 hours</SelectItem>
                                        <SelectItem value="48h">48 hours</SelectItem>
                                        <SelectItem value="7d">7 days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setNewPollDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Create Poll</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

// Missing imports
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"