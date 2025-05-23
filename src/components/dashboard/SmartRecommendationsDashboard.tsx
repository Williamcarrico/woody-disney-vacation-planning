'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
    Sparkles,
    MapPin,
    Clock,
    Star,
    Users,
    Camera,
    Utensils,
    Calendar,
    TrendingUp,
    Coffee,
    PartyPopper,
    RefreshCw,
    Settings,
    AlertTriangle,
    Thermometer,
    Sun,
    Navigation,
    Route,
    Timer,
    Target
} from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { locationAwareRecommendationEngine } from '@/engines/recommendation/LocationAwareRecommendationEngine'

// Import Magic UI components
import { MagicCard } from '@/components/magicui/magic-card'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { BorderBeam } from '@/components/magicui/border-beam'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { BlurFade } from '@/components/magicui/blur-fade'

interface SmartRecommendationsDashboardProps {
    vacationId: string
    className?: string
}

// Define specific types for the recommendation data
interface RecommendationData {
    coordinates?: {
        lat: number
        lng: number
    }
    [key: string]: unknown
}

interface Recommendation {
    id: string
    type: 'attraction' | 'dining' | 'photo' | 'rest' | 'show' | 'shopping' | 'meeting'
    title: string
    description: string
    priority: number
    confidence: number
    estimatedTime: number
    walkingTime: number
    distanceFromUser: number
    reasons: string[]
    data: RecommendationData
    expiresAt?: Date
    weatherDependent?: boolean
}

// Define location type
interface Location {
    lat: number
    lng: number
    timestamp: Date
    accuracy?: number
}

interface PartyMember {
    id: string
    name: string
    age?: number
    preferences: {
        attractions: string[]
        dining: string[]
        accessibility: string[]
        energyLevel: 'low' | 'medium' | 'high'
    }
    currentLocation?: Location
}

// Define weather type
interface Weather {
    temperature: number
    condition: string
    precipitation: number
    uvIndex: number
    description: string
}

export default function SmartRecommendationsDashboard({
    vacationId,
    className
}: SmartRecommendationsDashboardProps) {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    // State management
    const [activeTab, setActiveTab] = useState('recommendations')
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [refreshInterval] = useState(300000) // 5 minutes
    const [showExpired, setShowExpired] = useState(false)
    const [filterType, setFilterType] = useState<string>('all')
    const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium')
    const [currentWeather, setCurrentWeather] = useState<Weather | null>(null)

    // Mock party data (in real app, fetch from vacation API)
    const [partyMembers] = useState<PartyMember[]>([
        {
            id: user?.uid || 'user1',
            name: user?.displayName || 'You',
            age: 30,
            preferences: {
                attractions: ['thrills', 'family', 'shows'],
                dining: ['american', 'italian', 'quick-service'],
                accessibility: [],
                energyLevel: energyLevel
            }
        }
    ])

    // Fetch recommendations
    const { data: recommendations, isLoading, refetch } = useQuery({
        queryKey: ['smart-recommendations', vacationId, energyLevel, filterType],
        queryFn: async () => {
            try {
                // Get current location data for party members
                const locationResponse = await fetch(`/api/user/location?vacationId=${vacationId}&type=current`)
                const locationData = await locationResponse.json()

                // Update party members with current locations
                const updatedPartyMembers = partyMembers.map(member => {
                    const userLocation = locationData.data?.locationsByUser?.[member.id]?.[0]
                    return {
                        ...member,
                        currentLocation: userLocation,
                        preferences: {
                            ...member.preferences,
                            energyLevel
                        }
                    }
                })

                // Generate recommendations
                const recs = await locationAwareRecommendationEngine.generateRecommendations(
                    vacationId,
                    updatedPartyMembers
                )

                return recs
            } catch (error) {
                console.error('Failed to generate recommendations:', error)
                return []
            }
        },
        enabled: !!vacationId && !!user,
        refetchInterval: autoRefresh ? refreshInterval : false
    })

    // Fetch current weather
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Mock weather data (in real app, fetch from weather API)
                setCurrentWeather({
                    temperature: 28,
                    condition: 'sunny',
                    precipitation: 0,
                    uvIndex: 7,
                    description: 'Sunny and warm'
                })
            } catch (error) {
                console.error('Failed to fetch weather:', error)
            }
        }

        fetchWeather()
    }, [])

    // Filter recommendations
    const filteredRecommendations = useMemo(() => {
        if (!recommendations) return []

        let filtered = recommendations

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(rec => rec.type === filterType)
        }

        // Filter expired if not showing them
        if (!showExpired) {
            const now = new Date()
            filtered = filtered.filter(rec => !rec.expiresAt || rec.expiresAt > now)
        }

        return filtered
    }, [recommendations, filterType, showExpired])

    // Add to itinerary mutation
    const addToItineraryMutation = useMutation({
        mutationFn: async (recommendation: Recommendation) => {
            // Mock implementation - in real app, integrate with itinerary API
            const response = await fetch(`/api/itinerary/${vacationId}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: recommendation.title,
                    description: recommendation.description,
                    type: recommendation.type,
                    estimatedDuration: recommendation.estimatedTime,
                    location: recommendation.data.coordinates,
                    scheduledTime: new Date()
                })
            })

            if (!response.ok) throw new Error('Failed to add to itinerary')
            return response.json()
        },
        onSuccess: (data, recommendation) => {
            toast.success(`Added "${recommendation.title}" to your itinerary!`)
            queryClient.invalidateQueries({ queryKey: ['itinerary'] })
        },
        onError: (error) => {
            toast.error('Failed to add to itinerary', {
                description: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    })

    // Share recommendation with party
    const shareRecommendationMutation = useMutation({
        mutationFn: async (recommendation: Recommendation) => {
            // Mock implementation - in real app, send to party chat
            const message = `🎯 Smart Recommendation: ${recommendation.title}\n${recommendation.description}\n\nReasons: ${recommendation.reasons.join(', ')}`

            // This would integrate with your messaging system
            await fetch(`/api/vacations/${vacationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: message,
                    type: 'recommendation',
                    data: recommendation
                })
            })
        },
        onSuccess: (data, recommendation) => {
            toast.success(`Shared "${recommendation.title}" with your party!`)
        },
        onError: () => {
            toast.error('Failed to share recommendation')
        }
    })

    // Get recommendation type icon
    const getRecommendationIcon = (type: string) => {
        switch (type) {
            case 'attraction': return <Star className="h-4 w-4" />
            case 'dining': return <Utensils className="h-4 w-4" />
            case 'photo': return <Camera className="h-4 w-4" />
            case 'rest': return <Coffee className="h-4 w-4" />
            case 'show': return <PartyPopper className="h-4 w-4" />
            case 'meeting': return <Users className="h-4 w-4" />
            case 'shopping': return <Target className="h-4 w-4" />
            default: return <Sparkles className="h-4 w-4" />
        }
    }

    // Get priority color
    const getPriorityColor = (priority: number) => {
        if (priority >= 8) return 'bg-red-500'
        if (priority >= 6) return 'bg-orange-500'
        if (priority >= 4) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    // Get confidence color
    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-600'
        if (confidence >= 0.6) return 'text-yellow-600'
        return 'text-red-600'
    }

    // Calculate stats
    const stats = useMemo(() => {
        if (!filteredRecommendations) return {}

        const totalTime = filteredRecommendations.reduce((sum, rec) => sum + rec.estimatedTime, 0)
        const avgConfidence = filteredRecommendations.reduce((sum, rec) => sum + rec.confidence, 0) / filteredRecommendations.length
        const highPriority = filteredRecommendations.filter(rec => rec.priority >= 7).length
        const expiringSoon = filteredRecommendations.filter(rec =>
            rec.expiresAt && rec.expiresAt.getTime() - Date.now() < 30 * 60 * 1000 // 30 minutes
        ).length

        return {
            totalRecommendations: filteredRecommendations.length,
            totalTime,
            avgConfidence,
            highPriority,
            expiringSoon
        }
    }, [filteredRecommendations])

    return (
        <div className={cn("w-full space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <SparklesText className="text-2xl font-bold tracking-tight">
                        Smart Recommendations
                    </SparklesText>
                    <p className="text-muted-foreground">
                        AI-powered suggestions based on your location and preferences
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
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </ShimmerButton>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <BlurFade delay={0.1}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active Recommendations</p>
                                <p className="text-xl font-bold">
                                    <NumberTicker value={stats.totalRecommendations || 0} />
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>

                <BlurFade delay={0.2}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">High Priority</p>
                                <p className="text-xl font-bold">
                                    <NumberTicker value={stats.highPriority || 0} />
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>

                <BlurFade delay={0.3}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Clock className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Time</p>
                                <p className="text-xl font-bold">
                                    {Math.floor((stats.totalTime || 0) / 60)}h {(stats.totalTime || 0) % 60}m
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>

                <BlurFade delay={0.4}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                                <p className="text-xl font-bold">
                                    <NumberTicker value={stats.expiringSoon || 0} />
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>
            </div>

            {/* Weather & Context */}
            {currentWeather && (
                <BlurFade delay={0.5}>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Sun className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Current Conditions</p>
                                        <p className="text-sm text-muted-foreground">
                                            {currentWeather.temperature}°C • {currentWeather.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Thermometer className="h-4 w-4" />
                                        <span>{currentWeather.temperature}°C</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Target className="h-4 w-4" />
                                        <span>UV {currentWeather.uvIndex}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </BlurFade>
            )}

            {/* Controls */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Label>Filter:</Label>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="attraction">Attractions</SelectItem>
                                    <SelectItem value="dining">Dining</SelectItem>
                                    <SelectItem value="photo">Photos</SelectItem>
                                    <SelectItem value="show">Shows</SelectItem>
                                    <SelectItem value="rest">Rest</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Label>Energy Level:</Label>
                            <Select value={energyLevel} onValueChange={(value) => setEnergyLevel(value as 'low' | 'medium' | 'high')}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={autoRefresh}
                                onCheckedChange={setAutoRefresh}
                            />
                            <Label>Auto-refresh</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={showExpired}
                                onCheckedChange={setShowExpired}
                            />
                            <Label>Show expired</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="schedule">Smart Schedule</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-4">
                    <ScrollArea className="h-[600px]">
                        <div className="space-y-4">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                                ))
                            ) : filteredRecommendations.length > 0 ? (
                                filteredRecommendations.map((recommendation, index) => (
                                    <BlurFade key={recommendation.id} delay={index * 0.1}>
                                        <MagicCard className="p-6 relative overflow-hidden">
                                            {recommendation.priority >= 8 && <BorderBeam />}

                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "p-3 rounded-lg",
                                                        recommendation.type === 'attraction' && "bg-purple-100 text-purple-600",
                                                        recommendation.type === 'dining' && "bg-orange-100 text-orange-600",
                                                        recommendation.type === 'photo' && "bg-blue-100 text-blue-600",
                                                        recommendation.type === 'rest' && "bg-green-100 text-green-600",
                                                        recommendation.type === 'show' && "bg-pink-100 text-pink-600",
                                                        recommendation.type === 'meeting' && "bg-yellow-100 text-yellow-600"
                                                    )}>
                                                        {getRecommendationIcon(recommendation.type)}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold text-lg">
                                                                {recommendation.title}
                                                            </h3>

                                                            <div className="flex items-center gap-2">
                                                                <div className={cn(
                                                                    "w-2 h-2 rounded-full",
                                                                    getPriorityColor(recommendation.priority)
                                                                )} />

                                                                <Badge variant="outline" className="text-xs">
                                                                    {recommendation.type}
                                                                </Badge>

                                                                {recommendation.expiresAt && (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        <Clock className="h-3 w-3 mr-1" />
                                                                        Expires {formatDistanceToNow(recommendation.expiresAt, { addSuffix: true })}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <p className="text-muted-foreground mb-3">
                                                            {recommendation.description}
                                                        </p>

                                                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                                                            <div className="flex items-center gap-1">
                                                                <Timer className="h-4 w-4 text-muted-foreground" />
                                                                <span>{recommendation.estimatedTime} min</span>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <Navigation className="h-4 w-4 text-muted-foreground" />
                                                                <span>{recommendation.walkingTime} min walk</span>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <Target className="h-4 w-4 text-muted-foreground" />
                                                                <span className={getConfidenceColor(recommendation.confidence)}>
                                                                    {Math.round(recommendation.confidence * 100)}% match
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {recommendation.reasons.length > 0 && (
                                                            <div className="mb-4">
                                                                <p className="text-sm font-medium mb-2">Why this recommendation:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {recommendation.reasons.map((reason, i) => (
                                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                                            {reason}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-2">
                                                            <ShimmerButton
                                                                className="h-9"
                                                                onClick={() => addToItineraryMutation.mutate(recommendation)}
                                                                disabled={addToItineraryMutation.isPending}
                                                            >
                                                                <Calendar className="h-4 w-4 mr-2" />
                                                                Add to Itinerary
                                                            </ShimmerButton>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => shareRecommendationMutation.mutate(recommendation)}
                                                                disabled={shareRecommendationMutation.isPending}
                                                            >
                                                                <Users className="h-4 w-4 mr-2" />
                                                                Share
                                                            </Button>

                                                            <Button variant="ghost" size="sm">
                                                                <MapPin className="h-4 w-4 mr-2" />
                                                                Navigate
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="mb-2">
                                                        <div className="text-lg font-bold text-primary">
                                                            {recommendation.priority}/10
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Priority</div>
                                                    </div>

                                                    <Progress
                                                        value={recommendation.priority * 10}
                                                        className="w-16 h-2"
                                                    />
                                                </div>
                                            </div>
                                        </MagicCard>
                                    </BlurFade>
                                ))
                            ) : (
                                <Card className="p-8 text-center">
                                    <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-semibold mb-2">No recommendations available</h3>
                                    <p className="text-muted-foreground mb-4">
                                        We&apos;re generating personalized recommendations for you.
                                    </p>
                                    <Button onClick={() => refetch()}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh Recommendations
                                    </Button>
                                </Card>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* Smart Schedule Tab */}
                <TabsContent value="schedule" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Route className="h-5 w-5" />
                                Optimized Schedule
                            </CardTitle>
                            <CardDescription>
                                AI-generated schedule based on recommendations and your preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Route className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                <h3 className="text-lg font-semibold mb-2">Smart Schedule Coming Soon</h3>
                                <p className="text-muted-foreground">
                                    AI-powered itinerary optimization will be available here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Recommendation Insights
                            </CardTitle>
                            <CardDescription>
                                Analytics and trends from your personalized recommendations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                <h3 className="text-lg font-semibold mb-2">Insights Coming Soon</h3>
                                <p className="text-muted-foreground">
                                    Detailed analytics about your recommendations and preferences.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}