'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    MapPin,
    Activity,
    Map,
    Users,
    Calendar,
    Download,
    Filter,
    RefreshCw,
    Zap,
    Route,
    Footprints,
    Target,
    AlertTriangle,
    CheckCircle
} from "lucide-react"
import { format, subDays, differenceInMinutes } from 'date-fns'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

// Import Magic UI components
import { MagicCard } from '@/components/magicui/magic-card'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { BlurFade } from '@/components/magicui/blur-fade'

interface LocationAnalyticsProps {
    vacationId: string
    className?: string
}

interface LocationPoint {
    id: string
    userId: string
    latitude: number
    longitude: number
    accuracy?: number
    altitude?: number
    speed?: number
    timestamp: string
    metadata?: {
        parkArea?: string
        attraction?: string
        activity?: string
        weather?: string
        temperature?: number
    }
}

interface UserJourney {
    userId: string
    userName: string
    totalDistance: number
    averageSpeed: number
    timeSpent: number
    attractionsVisited: string[]
    path: LocationPoint[]
}

interface Alert {
    id: string
    alertType: 'entry' | 'exit' | 'dwell'
    message: string
    triggeredAt: string
    distance?: number
}

export default function LocationAnalytics({ vacationId, className }: LocationAnalyticsProps) {
    // State management
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date()
    })
    const [selectedUser, setSelectedUser] = useState<string>('all')
    const [activeTab, setActiveTab] = useState('overview')
    const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

    // Fetch location data
    const { data: locationData, isLoading, refetch } = useQuery({
        queryKey: ['location-analytics', vacationId, selectedUser, dateRange],
        queryFn: async () => {
            const params = new URLSearchParams({
                vacationId,
                type: 'historical',
                includeAnalytics: 'true',
                limit: '1000'
            })

            if (selectedUser !== 'all') {
                params.append('userId', selectedUser)
            }

            if (dateRange?.from) {
                params.append('startDate', dateRange.from.toISOString())
            }

            if (dateRange?.to) {
                params.append('endDate', dateRange.to.toISOString())
            }

            const response = await fetch(`/api/user/location?${params}`)
            if (!response.ok) throw new Error('Failed to fetch location data')
            return response.json()
        },
        enabled: !!vacationId,
        refetchInterval: refreshInterval
    })

    // Fetch geofence alerts for the time period
    const { data: alertsData } = useQuery({
        queryKey: ['location-alerts', vacationId, dateRange],
        queryFn: async () => {
            const params = new URLSearchParams({
                vacationId,
                limit: '100'
            })

            if (dateRange?.from) {
                params.append('startDate', dateRange.from.toISOString())
            }

            if (dateRange?.to) {
                params.append('endDate', dateRange.to.toISOString())
            }

            const response = await fetch(`/api/geofences/alerts?${params}`)
            if (!response.ok) throw new Error('Failed to fetch alerts')
            return response.json()
        },
        enabled: !!vacationId
    })

    // Process user journeys
    const userJourneys = useMemo((): UserJourney[] => {
        if (!locationData?.data?.locations) return []

        // Use a plain object instead of Map for better TypeScript compatibility
        const journeyGroups: Record<string, LocationPoint[]> = {}

        // Group locations by user
        locationData.data.locations.forEach((location: LocationPoint) => {
            if (!journeyGroups[location.userId]) {
                journeyGroups[location.userId] = []
            }
            journeyGroups[location.userId].push(location)
        })

        // Process each user's journey
        return Object.entries(journeyGroups).map(([userId, points]) => {
            const sortedPoints = points.sort((a: LocationPoint, b: LocationPoint) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )

            let totalDistance = 0
            let totalTime = 0
            const attractionsVisited = new Set<string>()
            const speeds: number[] = []

            for (let i = 1; i < sortedPoints.length; i++) {
                const prev = sortedPoints[i - 1]
                const curr = sortedPoints[i]

                // Calculate distance using Haversine formula
                const distance = calculateDistance(
                    prev.latitude, prev.longitude,
                    curr.latitude, curr.longitude
                )
                totalDistance += distance

                // Calculate time difference
                const timeDiff = differenceInMinutes(
                    new Date(curr.timestamp),
                    new Date(prev.timestamp)
                )
                totalTime += timeDiff

                // Track speed if available
                if (curr.speed) {
                    speeds.push(curr.speed)
                }

                // Track attractions
                if (curr.metadata?.attraction) {
                    attractionsVisited.add(curr.metadata.attraction)
                }
            }

            const averageSpeed = speeds.length > 0
                ? speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
                : 0

            const journey: UserJourney = {
                userId,
                userName: `User ${userId.slice(-4)}`, // In a real app, you'd fetch user names
                totalDistance,
                averageSpeed,
                timeSpent: totalTime,
                attractionsVisited: Array.from(attractionsVisited),
                path: sortedPoints
            }

            return journey
        })
    }, [locationData])

    // Calculate distance between two points using Haversine formula
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371e3 // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180
        const φ2 = lat2 * Math.PI / 180
        const Δφ = (lat2 - lat1) * Math.PI / 180
        const Δλ = (lng2 - lng1) * Math.PI / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c
    }

    // Get analytics summary
    const analyticsSummary = useMemo(() => {
        const analytics = locationData?.data?.analytics
        const totalAlerts = alertsData?.alerts?.length || 0
        const entryAlerts = alertsData?.alerts?.filter((a: Alert) => a.alertType === 'entry').length || 0
        const exitAlerts = alertsData?.alerts?.filter((a: Alert) => a.alertType === 'exit').length || 0

        return {
            ...analytics,
            totalAlerts,
            entryAlerts,
            exitAlerts,
            totalJourneys: userJourneys.length,
            totalDistanceTraveled: userJourneys.reduce((sum, journey) => sum + journey.totalDistance, 0),
            totalTimeTracked: userJourneys.reduce((sum, journey) => sum + journey.timeSpent, 0)
        }
    }, [locationData, alertsData, userJourneys])

    // Format distance for display
    const formatDistance = (meters: number) => {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`
        }
        return `${Math.round(meters)} m`
    }

    // Format time for display
    const formatTime = (minutes: number) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60)
            const mins = minutes % 60
            return `${hours}h ${mins}m`
        }
        return `${Math.round(minutes)}m`
    }

    return (
        <div className={cn("w-full space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <SparklesText className="text-2xl font-bold tracking-tight">
                        Location Analytics
                    </SparklesText>
                    <p className="text-muted-foreground">
                        Insights into location tracking and movement patterns
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                        Refresh
                    </Button>

                    <ShimmerButton className="h-9">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </ShimmerButton>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <span className="font-medium">Filters:</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <DatePickerWithRange
                                date={dateRange}
                                onDateChange={setDateRange}
                            />
                        </div>

                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {userJourneys.map(journey => (
                                    <SelectItem key={journey.userId} value={journey.userId}>
                                        {journey.userName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Refresh rate" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10000">10 seconds</SelectItem>
                                <SelectItem value="30000">30 seconds</SelectItem>
                                <SelectItem value="60000">1 minute</SelectItem>
                                <SelectItem value="300000">5 minutes</SelectItem>
                                <SelectItem value="0">Manual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="journeys">User Journeys</TabsTrigger>
                    <TabsTrigger value="alerts">Geofence Activity</TabsTrigger>
                    <TabsTrigger value="heatmap">Location Heatmap</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <BlurFade delay={0.1}>
                            <MagicCard className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Location Points
                                        </p>
                                        <p className="text-2xl font-bold">
                                            <NumberTicker
                                                value={analyticsSummary?.totalLocationPoints || 0}
                                            />
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>
                        </BlurFade>

                        <BlurFade delay={0.2}>
                            <MagicCard className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Users className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Active Users
                                        </p>
                                        <p className="text-2xl font-bold">
                                            <NumberTicker
                                                value={analyticsSummary?.uniqueUsers || 0}
                                            />
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>
                        </BlurFade>

                        <BlurFade delay={0.3}>
                            <MagicCard className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Route className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Distance Traveled
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {formatDistance(analyticsSummary?.totalDistanceTraveled || 0)}
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>
                        </BlurFade>

                        <BlurFade delay={0.4}>
                            <MagicCard className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Zap className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Geofence Alerts
                                        </p>
                                        <p className="text-2xl font-bold">
                                            <NumberTicker
                                                value={analyticsSummary?.totalAlerts || 0}
                                            />
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>
                        </BlurFade>
                    </div>

                    {/* Detailed Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Movement Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Average Speed</span>
                                    <span className="font-medium">
                                        {analyticsSummary?.averageSpeed
                                            ? `${(analyticsSummary.averageSpeed * 3.6).toFixed(1)} km/h`
                                            : 'N/A'
                                        }
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Max Speed Recorded</span>
                                    <span className="font-medium">
                                        {analyticsSummary?.maxSpeed
                                            ? `${(analyticsSummary.maxSpeed * 3.6).toFixed(1)} km/h`
                                            : 'N/A'
                                        }
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Average Accuracy</span>
                                    <span className="font-medium">
                                        {analyticsSummary?.averageAccuracy
                                            ? `${analyticsSummary.averageAccuracy.toFixed(1)}m`
                                            : 'N/A'
                                        }
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Time Tracked</span>
                                    <span className="font-medium">
                                        {formatTime(analyticsSummary?.totalTimeTracked || 0)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Areas Visited
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analyticsSummary?.parkAreasVisited?.length > 0 ? (
                                    <div className="space-y-2">
                                        {analyticsSummary.parkAreasVisited.map((area: string, index: number) => (
                                            <BlurFade key={area} delay={index * 0.1}>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{area}</Badge>
                                                </div>
                                            </BlurFade>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No specific park areas tracked yet
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* User Journeys Tab */}
                <TabsContent value="journeys" className="space-y-4">
                    <ScrollArea className="h-[600px]">
                        <div className="space-y-4">
                            {userJourneys.length > 0 ? (
                                userJourneys.map((journey, index) => (
                                    <BlurFade key={journey.userId} delay={index * 0.1}>
                                        <MagicCard className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <Footprints className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{journey.userName}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {journey.path.length} location points
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {formatDistance(journey.totalDistance)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatTime(journey.timeSpent)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <p className="text-lg font-bold">
                                                        {journey.averageSpeed > 0
                                                            ? `${(journey.averageSpeed * 3.6).toFixed(1)}`
                                                            : '0'
                                                        }
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">km/h avg</p>
                                                </div>

                                                <div>
                                                    <p className="text-lg font-bold">
                                                        {journey.attractionsVisited.length}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">attractions</p>
                                                </div>

                                                <div>
                                                    <p className="text-lg font-bold">
                                                        {Math.round(journey.totalDistance / (journey.timeSpent || 1))}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">m/min</p>
                                                </div>
                                            </div>

                                            {journey.attractionsVisited.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium mb-2">Attractions Visited:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {journey.attractionsVisited.map((attraction: string) => (
                                                            <Badge key={attraction} variant="secondary" className="text-xs">
                                                                {attraction}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </MagicCard>
                                    </BlurFade>
                                ))
                            ) : (
                                <Card className="p-8 text-center">
                                    <Footprints className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-semibold mb-2">No journeys found</h3>
                                    <p className="text-muted-foreground">
                                        No location data available for the selected time period.
                                    </p>
                                </Card>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* Geofence Activity Tab */}
                <TabsContent value="alerts" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Entries</p>
                                    <p className="text-xl font-bold">{analyticsSummary?.entryAlerts || 0}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Exits</p>
                                    <p className="text-xl font-bold">{analyticsSummary?.exitAlerts || 0}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Alerts</p>
                                    <p className="text-xl font-bold">{analyticsSummary?.totalAlerts || 0}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <ScrollArea className="h-[500px]">
                        {alertsData?.alerts?.length > 0 ? (
                            <div className="space-y-4">
                                {alertsData.alerts.map((alert: Alert, index: number) => (
                                    <BlurFade key={alert.id} delay={index * 0.05}>
                                        <Card className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-full",
                                                    alert.alertType === 'entry' ? "bg-green-100 text-green-600" :
                                                        alert.alertType === 'exit' ? "bg-orange-100 text-orange-600" :
                                                            "bg-blue-100 text-blue-600"
                                                )}>
                                                    {alert.alertType === 'entry' ? <CheckCircle className="h-4 w-4" /> :
                                                        alert.alertType === 'exit' ? <AlertTriangle className="h-4 w-4" /> :
                                                            <Activity className="h-4 w-4" />}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium">{alert.message}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {alert.alertType}
                                                        </Badge>
                                                    </div>

                                                    <div className="text-sm text-muted-foreground">
                                                        {format(new Date(alert.triggeredAt), 'MMM d, h:mm a')}
                                                        {alert.distance && (
                                                            <span className="ml-2">
                                                                • {Math.round(alert.distance)}m from center
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </BlurFade>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <Zap className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
                                <p className="text-muted-foreground">
                                    No geofence alerts for the selected time period.
                                </p>
                            </Card>
                        )}
                    </ScrollArea>
                </TabsContent>

                {/* Heatmap Tab */}
                <TabsContent value="heatmap" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Map className="h-5 w-5" />
                                Location Heatmap
                            </CardTitle>
                            <CardDescription>
                                Visualize location density and movement patterns
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                <h3 className="text-lg font-semibold mb-2">Heatmap Coming Soon</h3>
                                <p className="text-muted-foreground">
                                    Interactive location heatmap will be available here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}