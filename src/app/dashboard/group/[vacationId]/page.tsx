'use client'

import { use } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GroupChat from '@/components/group/GroupChat'
import LocationSharing from '@/components/group/LocationSharing'
import { useVacationRealtime } from '@/hooks/useRealtimeDatabase'
import {
    Users,
    MessageSquare,
    MapPin,
    Clock,
    Settings,
    Share2,
    Bell,
    Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

// Type definitions based on the realtime database interfaces
interface MemberLocation {
    userId: string
    userName: string
    userPhotoURL?: string
    isSharing: boolean
    lastUpdated: number
    location?: {
        latitude: number
        longitude: number
        accuracy?: number
        parkId?: string
        areaId?: string
        attractionId?: string
        name: string
    }
}

interface GroupMessage {
    userId: string
    userName: string
    userPhotoURL?: string
    content: string
    timestamp: number
    type: 'text' | 'location' | 'photo' | 'poll'
    reactions?: Record<string, string>
    replyTo?: string
    edited: boolean
    editedAt?: number
}

interface Notification {
    id: string
    type: string
    title: string
    message: string
    timestamp: number
    read: boolean
    data?: Record<string, unknown>
    vacationId?: string
}

interface GroupDashboardProps {
    params: Promise<{
        vacationId: string
    }>
}

export default function GroupDashboard({ params }: GroupDashboardProps) {
    const { vacationId } = use(params)
    const { user } = useAuth()

    const {
        messages,
        locationSharing,
        notifications,
        isLoading,
        hasError
    } = useVacationRealtime(vacationId)

    if (!user) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <p>Please sign in to access group features</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (hasError) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-destructive mb-4">Error loading group data</p>
                            <Button onClick={() => window.location.reload()}>
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const totalMessages = Object.keys(messages.messages || {}).length
    const activeSharers = Object.values(locationSharing.memberLocations || {})
        .filter((member: MemberLocation) => member.isSharing).length
    const unreadNotifications = notifications.unreadCount

    const handleInviteMembers = () => {
        // Generate shareable link
        const shareUrl = `${window.location.origin}/shared-itinerary/${vacationId}`

        if (navigator.share) {
            navigator.share({
                title: 'Join my Disney vacation planning',
                text: 'Join my vacation group to chat and share locations!',
                url: shareUrl
            }).catch(() => {
                // Fallback to clipboard
                navigator.clipboard.writeText(shareUrl)
                toast.success('Invite link copied to clipboard!')
            })
        } else {
            navigator.clipboard.writeText(shareUrl)
            toast.success('Invite link copied to clipboard!')
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Group Dashboard</h1>
                    <p className="text-muted-foreground">
                        Collaborate with your vacation party
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    {unreadNotifications > 0 && (
                        <div className="relative">
                            <Bell className="h-6 w-6" />
                            <Badge
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                                {unreadNotifications}
                            </Badge>
                        </div>
                    )}

                    <Button onClick={handleInviteMembers} variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Invite Members
                    </Button>

                    <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Group Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMessages}</div>
                        <p className="text-xs text-muted-foreground">
                            {messages.loading ? 'Loading...' : 'Total messages sent'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sharers</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeSharers}</div>
                        <p className="text-xs text-muted-foreground">
                            {locationSharing.loading ? 'Loading...' : 'Sharing locations'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalMessages > 0 ? (
                                formatDistanceToNow(
                                    new Date(
                                        Math.max(
                                            ...Object.values(messages.messages || {})
                                                .map((msg: GroupMessage) => msg.timestamp)
                                        )
                                    ),
                                    { addSuffix: true }
                                )
                            ) : (
                                'No activity'
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Last message sent
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="chat" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Group Chat
                        {totalMessages > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {totalMessages}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location Sharing
                        {activeSharers > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeSharers}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2">
                            <GroupChat vacationId={vacationId} />
                        </div>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={handleInviteMembers}
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Invite Members
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            // Navigate to itinerary
                                            window.location.href = `/dashboard/itinerary/${vacationId}`
                                        }}
                                    >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        View Itinerary
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Recent Notifications */}
                            {Object.keys(notifications.notifications || {}).length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Bell className="h-5 w-5" />
                                            Recent Notifications
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {Object.entries(notifications.notifications || {})
                                                .slice(0, 3)
                                                .map(([notificationId, notification]: [string, Notification]) => (
                                                    <div
                                                        key={notificationId}
                                                        className={`p-3 rounded-lg border text-sm ${notification.read
                                                            ? 'bg-muted/50'
                                                            : 'bg-primary/5 border-primary/20'
                                                            }`}
                                                    >
                                                        <p className="font-medium">{notification.title}</p>
                                                        <p className="text-muted-foreground text-xs">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="location" className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2">
                            <LocationSharing vacationId={vacationId} />
                        </div>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Location Tips</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                        <p>Enable location sharing to let your group know where you are</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                        <p>Use the emergency button if you need immediate assistance</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                                        <p>Your location is only shared with your vacation group</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}