'use client'

import { useState, useMemo } from 'react'
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
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
    Camera,
    Images,
    MapPin,
    Clock,
    Sun,
    Sunrise,
    Sunset,
    Star,
    Users,
    Heart,
    Share,
    Download,
    Grid,
    List,
    Timer,
    Target,
    Award,
    Gift,
    CheckCircle,
    Eye,
    Bookmark,
    Settings,
    CameraOff,
    Lightbulb,
    Route,
    Navigation
} from "lucide-react"
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// Import Magic UI components
import { MagicCard } from '@/components/magicui/magic-card'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { BorderBeam } from '@/components/magicui/border-beam'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { BlurFade } from '@/components/magicui/blur-fade'

interface PhotoPassSmartIntegrationProps {
    vacationId: string
    className?: string
}

interface PhotoOpportunity {
    id: string
    name: string
    type: 'attraction' | 'character' | 'landmark' | 'event' | 'scenic'
    location: {
        name: string
        coordinates: { lat: number; lng: number }
        distance: number
        parkArea: string
    }
    photographer?: {
        name: string
        rating: number
        specialties: string[]
    }
    optimalTimes: {
        start: string
        end: string
        reason: string
    }[]
    lightingScore: number
    crowdLevel: 'low' | 'medium' | 'high'
    difficulty: 'easy' | 'medium' | 'hard'
    tags: string[]
    priceEstimate: number
    recommendations: string[]
    similarPhotos: number
    timeToWalk: number
    expires?: Date
}

interface VacationPhoto {
    id: string
    url: string
    thumbnailUrl: string
    location: string
    timestamp: Date
    tags: string[]
    people: string[]
    photographer?: string
    rating?: number
    isDownloaded: boolean
    isFavorite: boolean
    type: 'attraction' | 'character' | 'dining' | 'scenic' | 'group'
    metadata: {
        camera?: string
        settings?: {
            aperture?: string
            shutterSpeed?: string
            iso?: number
            focalLength?: string
        }
        weather?: string
        crowdLevel?: string
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PhotoMilestone {
    id: string
    name: string
    description: string
    progress: number
    total: number
    reward?: string
    isCompleted: boolean
}

interface SmartPhotoSuggestion {
    id: string
    type: 'timing' | 'location' | 'lighting' | 'composition' | 'memory'
    title: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    confidence: number
    location?: PhotoOpportunity['location']
    timeframe: string
    actions: string[]
    potentialSavings?: number
}

export default function PhotoPassSmartIntegration({
    vacationId,
    className
}: PhotoPassSmartIntegrationProps) {
    const { } = useAuth()

    // State management
    const [selectedTab, setSelectedTab] = useState('opportunities')
    const [filterType, setFilterType] = useState<string>('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [autoSuggestionsEnabled, setAutoSuggestionsEnabled] = useState(true)
    const [locationBasedReminders, setLocationBasedReminders] = useState(true)
    const [weatherBasedTiming, setWeatherBasedTiming] = useState(true)
    const [smartOrganization, setSmartOrganization] = useState(true)

    // Fetch photo opportunities
    const { data: photoOpportunities, isLoading: opportunitiesLoading } = useQuery({
        queryKey: ['photo-opportunities', vacationId],
        queryFn: async () => {
            // Mock photo opportunities (in real app, fetch from Disney API + AI analysis)
            const opportunities: PhotoOpportunity[] = [
                {
                    id: 'castle-sunset',
                    name: 'Castle at Golden Hour',
                    type: 'landmark',
                    location: {
                        name: 'Cinderella Castle',
                        coordinates: { lat: 28.4177, lng: -81.5812 },
                        distance: 320,
                        parkArea: 'Fantasyland'
                    },
                    photographer: {
                        name: 'Sarah M.',
                        rating: 4.9,
                        specialties: ['Portraits', 'Landscapes', 'Magic Hour']
                    },
                    optimalTimes: [
                        {
                            start: '18:30',
                            end: '19:15',
                            reason: 'Golden hour lighting with warm castle glow'
                        },
                        {
                            start: '07:00',
                            end: '08:00',
                            reason: 'Empty park with soft morning light'
                        }
                    ],
                    lightingScore: 9.5,
                    crowdLevel: 'medium',
                    difficulty: 'easy',
                    tags: ['sunset', 'iconic', 'romantic', 'family'],
                    priceEstimate: 35,
                    recommendations: [
                        'Arrive 15 minutes early for best positioning',
                        'Bring layers - evening can get cool',
                        'Consider character poses with castle backdrop'
                    ],
                    similarPhotos: 1247,
                    timeToWalk: 5
                },
                {
                    id: 'space-mountain-action',
                    name: 'Space Mountain Action Shot',
                    type: 'attraction',
                    location: {
                        name: 'Space Mountain',
                        coordinates: { lat: 28.4156, lng: -81.5776 },
                        distance: 150,
                        parkArea: 'Tomorrowland'
                    },
                    optimalTimes: [
                        {
                            start: '20:00',
                            end: '21:30',
                            reason: 'Tomorrowland lights create dramatic backdrop'
                        }
                    ],
                    lightingScore: 8.2,
                    crowdLevel: 'high',
                    difficulty: 'medium',
                    tags: ['action', 'attraction', 'excitement', 'night'],
                    priceEstimate: 25,
                    recommendations: [
                        'Capture the moment just before entering',
                        'Use flash for group shots in darker areas',
                        'On-ride photo available for purchase'
                    ],
                    similarPhotos: 892,
                    timeToWalk: 2,
                    expires: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours
                },
                {
                    id: 'mickey-character-meet',
                    name: 'Mickey Mouse Character Meet',
                    type: 'character',
                    location: {
                        name: 'Town Square Theater',
                        coordinates: { lat: 28.4171, lng: -81.5810 },
                        distance: 400,
                        parkArea: 'Main Street USA'
                    },
                    photographer: {
                        name: 'Cast Member',
                        rating: 4.7,
                        specialties: ['Character Interactions', 'Family Photos']
                    },
                    optimalTimes: [
                        {
                            start: '09:00',
                            end: '11:00',
                            reason: 'Mickey is most energetic in the morning'
                        },
                        {
                            start: '16:00',
                            end: '18:00',
                            reason: 'Afternoon light filters nicely through theater'
                        }
                    ],
                    lightingScore: 7.8,
                    crowdLevel: 'low',
                    difficulty: 'easy',
                    tags: ['character', 'classic', 'children', 'disney magic'],
                    priceEstimate: 30,
                    recommendations: [
                        'Have autograph book ready',
                        'Children should practice Mickey pose',
                        'Ask for action shots during interaction'
                    ],
                    similarPhotos: 2156,
                    timeToWalk: 6
                }
            ]

            return opportunities.sort((a, b) => {
                // Sort by proximity and optimal timing
                const aScore = (10 - a.location.distance / 100) + a.lightingScore
                const bScore = (10 - b.location.distance / 100) + b.lightingScore
                return bScore - aScore
            })
        },
        enabled: !!vacationId,
        refetchInterval: 300000 // Refresh every 5 minutes
    })

    // Fetch vacation photos
    const { data: vacationPhotos, isLoading: photosLoading } = useQuery({
        queryKey: ['vacation-photos', vacationId],
        queryFn: async () => {
            // Mock vacation photos (in real app, fetch from PhotoPass API)
            const photos: VacationPhoto[] = [
                {
                    id: 'photo-1',
                    url: '/api/photos/large/photo-1.jpg',
                    thumbnailUrl: '/api/photos/thumb/photo-1.jpg',
                    location: 'Cinderella Castle',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                    tags: ['family', 'castle', 'sunset'],
                    people: ['Emma', 'Dad', 'Mom'],
                    photographer: 'Sarah M.',
                    rating: 5,
                    isDownloaded: false,
                    isFavorite: true,
                    type: 'scenic',
                    metadata: {
                        camera: 'Canon EOS R5',
                        weather: 'Partly Cloudy',
                        crowdLevel: 'medium'
                    }
                },
                {
                    id: 'photo-2',
                    url: '/api/photos/large/photo-2.jpg',
                    thumbnailUrl: '/api/photos/thumb/photo-2.jpg',
                    location: 'Space Mountain',
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                    tags: ['attraction', 'action', 'excitement'],
                    people: ['Emma'],
                    isDownloaded: true,
                    isFavorite: false,
                    type: 'attraction',
                    metadata: {
                        camera: 'On-ride Camera',
                        crowdLevel: 'high'
                    }
                }
            ]

            return photos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        },
        enabled: !!vacationId
    })

    // Fetch photo milestones
    const { data: photoMilestones } = useQuery({
        queryKey: ['photo-milestones', vacationId],
        queryFn: async () => {
            return [
                {
                    id: 'first-castle-photo',
                    name: 'Castle Memories',
                    description: 'Take 5 photos at different castle locations',
                    progress: 3,
                    total: 5,
                    reward: '15% off next PhotoPass purchase',
                    isCompleted: false
                },
                {
                    id: 'character-collection',
                    name: 'Character Collector',
                    description: 'Meet and photograph 10 different characters',
                    progress: 4,
                    total: 10,
                    reward: 'Exclusive character photo frame',
                    isCompleted: false
                },
                {
                    id: 'attraction-memories',
                    name: 'Thrill Seeker',
                    description: 'Capture memories at 8 major attractions',
                    progress: 8,
                    total: 8,
                    reward: 'Free attraction photo compilation',
                    isCompleted: true
                }
            ]
        },
        enabled: !!vacationId
    })

    // Fetch smart suggestions
    const { data: smartSuggestions } = useQuery({
        queryKey: ['photo-suggestions', vacationId],
        queryFn: async () => {
            if (!autoSuggestionsEnabled) return []

            const suggestions: SmartPhotoSuggestion[] = []
            const currentTime = new Date()

            // Check for optimal timing opportunities
            photoOpportunities?.forEach(opportunity => {
                opportunity.optimalTimes.forEach(timeSlot => {
                    const startTime = parseISO(`${format(currentTime, 'yyyy-MM-dd')}T${timeSlot.start}:00`)
                    const timeDiff = (startTime.getTime() - currentTime.getTime()) / (1000 * 60) // minutes

                    if (timeDiff > 0 && timeDiff <= 60) { // Within next hour
                        suggestions.push({
                            id: `timing-${opportunity.id}`,
                            type: 'timing',
                            title: `Perfect Timing for ${opportunity.name}`,
                            description: `Optimal lighting window starts in ${Math.round(timeDiff)} minutes. ${timeSlot.reason}`,
                            priority: timeDiff <= 30 ? 'high' : 'medium',
                            confidence: 0.9,
                            location: opportunity.location,
                            timeframe: `${Math.round(timeDiff)} minutes`,
                            actions: ['Set reminder', 'Navigate now', 'Add to itinerary']
                        })
                    }
                })
            })

            // Location-based suggestions
            if (locationBasedReminders) {
                suggestions.push({
                    id: 'location-nearby',
                    type: 'location',
                    title: 'Photo Opportunity Nearby',
                    description: 'You\'re close to several great photo spots with current excellent lighting',
                    priority: 'medium',
                    confidence: 0.75,
                    timeframe: 'now',
                    actions: ['View nearby spots', 'Get directions', 'See examples']
                })
            }

            // Memory completion suggestions
            if (photoMilestones) {
                photoMilestones.forEach(milestone => {
                    if (!milestone.isCompleted && milestone.progress >= milestone.total * 0.8) {
                        suggestions.push({
                            id: `milestone-${milestone.id}`,
                            type: 'memory',
                            title: `Almost There: ${milestone.name}`,
                            description: `You're ${milestone.total - milestone.progress} photos away from completing this milestone and earning: ${milestone.reward}`,
                            priority: 'medium',
                            confidence: 0.85,
                            timeframe: 'vacation',
                            actions: ['Find locations', 'View progress', 'See reward details']
                        })
                    }
                })
            }

            return suggestions.sort((a, b) => {
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
                return priorityOrder[b.priority] - priorityOrder[a.priority]
            })
        },
        enabled: !!vacationId && autoSuggestionsEnabled,
        refetchInterval: 300000 // Refresh every 5 minutes
    })

    // Filter opportunities
    const filteredOpportunities = useMemo(() => {
        if (!photoOpportunities) return []

        if (filterType === 'all') return photoOpportunities

        return photoOpportunities.filter(opp => opp.type === filterType)
    }, [photoOpportunities, filterType])

    // Photo stats
    const photoStats = useMemo(() => {
        if (!vacationPhotos) return { total: 0, favorites: 0, downloaded: 0, byType: {} }

        const stats = {
            total: vacationPhotos.length,
            favorites: vacationPhotos.filter(p => p.isFavorite).length,
            downloaded: vacationPhotos.filter(p => p.isDownloaded).length,
            byType: vacationPhotos.reduce((acc, photo) => {
                acc[photo.type] = (acc[photo.type] || 0) + 1
                return acc
            }, {} as Record<string, number>)
        }

        return stats
    }, [vacationPhotos])

    // Get lighting condition info
    const getLightingInfo = (score: number) => {
        if (score >= 9) return { icon: <Sun className="h-4 w-4" />, label: 'Excellent', color: 'text-yellow-500' }
        if (score >= 7) return { icon: <Sunrise className="h-4 w-4" />, label: 'Good', color: 'text-orange-500' }
        if (score >= 5) return { icon: <Sunset className="h-4 w-4" />, label: 'Fair', color: 'text-blue-500' }
        return { icon: <CameraOff className="h-4 w-4" />, label: 'Poor', color: 'text-gray-500' }
    }

    // Get crowd level color
    const getCrowdLevelColor = (level: string) => {
        switch (level) {
            case 'low': return 'text-green-500'
            case 'medium': return 'text-yellow-500'
            case 'high': return 'text-red-500'
            default: return 'text-gray-500'
        }
    }

    return (
        <div className={cn("w-full space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <SparklesText className="text-2xl font-bold tracking-tight">
                        PhotoPass Smart Assistant
                    </SparklesText>
                    <p className="text-muted-foreground">
                        AI-powered photo recommendations and vacation memory management
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <ShimmerButton className="h-9">
                        <Settings className="h-4 w-4 mr-2" />
                        Photo Settings
                    </ShimmerButton>
                </div>
            </div>

            {/* Photo Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <BlurFade delay={0.1}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Images className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Photos</p>
                                <p className="text-xl font-bold">
                                    <NumberTicker value={photoStats.total} />
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>

                <BlurFade delay={0.2}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Heart className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Favorites</p>
                                <p className="text-xl font-bold">
                                    <NumberTicker value={photoStats.favorites} />
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>

                <BlurFade delay={0.3}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Download className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Downloaded</p>
                                <p className="text-xl font-bold">
                                    <NumberTicker value={photoStats.downloaded} />
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>

                <BlurFade delay={0.4}>
                    <MagicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Target className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Opportunities</p>
                                <p className="text-xl font-bold">
                                    <NumberTicker value={filteredOpportunities?.length || 0} />
                                </p>
                            </div>
                        </div>
                    </MagicCard>
                </BlurFade>
            </div>

            {/* Smart Suggestions */}
            {smartSuggestions && smartSuggestions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" />
                            Smart Photo Suggestions
                        </CardTitle>
                        <CardDescription>
                            Real-time recommendations based on your location and preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {smartSuggestions.map((suggestion, index) => (
                                <BlurFade key={suggestion.id} delay={index * 0.1}>
                                    <Alert className={cn(
                                        suggestion.priority === 'high' && "border-orange-500 bg-orange-50",
                                        suggestion.priority === 'urgent' && "border-red-500 bg-red-50"
                                    )}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    {suggestion.type === 'timing' && <Timer className="h-4 w-4" />}
                                                    {suggestion.type === 'location' && <MapPin className="h-4 w-4" />}
                                                    {suggestion.type === 'memory' && <Award className="h-4 w-4" />}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold">{suggestion.title}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {suggestion.priority}
                                                        </Badge>
                                                    </div>

                                                    <AlertDescription className="mb-3">
                                                        {suggestion.description}
                                                    </AlertDescription>

                                                    <div className="flex flex-wrap gap-2">
                                                        {suggestion.actions.map((action, i) => (
                                                            <Button
                                                                key={i}
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    toast.success(`Action: ${action}`)
                                                                }}
                                                            >
                                                                {action}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3 inline mr-1" />
                                                {suggestion.timeframe}
                                            </div>
                                        </div>
                                    </Alert>
                                </BlurFade>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Photo Milestones */}
            {photoMilestones && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Photo Milestones
                        </CardTitle>
                        <CardDescription>
                            Complete challenges to unlock special rewards
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {photoMilestones.map((milestone, index) => (
                                <BlurFade key={milestone.id} delay={index * 0.1}>
                                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                                        <div className={cn(
                                            "p-3 rounded-full",
                                            milestone.isCompleted ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                        )}>
                                            {milestone.isCompleted ? <CheckCircle className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{milestone.name}</h3>
                                                {milestone.isCompleted && (
                                                    <Badge variant="default">Completed!</Badge>
                                                )}
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-2">
                                                {milestone.description}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Progress</span>
                                                    <span>{milestone.progress} / {milestone.total}</span>
                                                </div>
                                                <Progress
                                                    value={(milestone.progress / milestone.total) * 100}
                                                    className="h-2"
                                                />
                                            </div>

                                            {milestone.reward && (
                                                <div className="mt-2 text-sm">
                                                    <Gift className="h-3 w-3 inline mr-1 text-yellow-500" />
                                                    <span className="text-yellow-600 font-medium">Reward: {milestone.reward}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </BlurFade>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="opportunities">Photo Opportunities</TabsTrigger>
                    <TabsTrigger value="gallery">My Photos</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Photo Opportunities Tab */}
                <TabsContent value="opportunities" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="attraction">Attractions</SelectItem>
                                    <SelectItem value="character">Characters</SelectItem>
                                    <SelectItem value="landmark">Landmarks</SelectItem>
                                    <SelectItem value="scenic">Scenic Views</SelectItem>
                                    <SelectItem value="event">Special Events</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {opportunitiesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <div className={cn(
                            viewMode === 'grid'
                                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                                : "space-y-4"
                        )}>
                            {filteredOpportunities?.map((opportunity, index) => {
                                const lightingInfo = getLightingInfo(opportunity.lightingScore)

                                return (
                                    <BlurFade key={opportunity.id} delay={index * 0.1}>
                                        <MagicCard className="p-6 relative overflow-hidden">
                                            {opportunity.expires && <BorderBeam />}

                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="text-lg font-semibold">{opportunity.name}</h3>
                                                            <Badge variant="outline" className="text-xs">
                                                                {opportunity.type}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                <span>{opportunity.location.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Route className="h-3 w-3" />
                                                                <span>{opportunity.timeToWalk}m walk</span>
                                                            </div>
                                                        </div>

                                                        {opportunity.photographer && (
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                                                    <Camera className="h-3 w-3" />
                                                                </div>
                                                                <span className="text-sm">{opportunity.photographer.name}</span>
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                                                    <span className="text-sm">{opportunity.photographer.rating}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-primary">
                                                            ${opportunity.priceEstimate}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">estimated</div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <span className={lightingInfo.color}>
                                                            {lightingInfo.icon}
                                                        </span>
                                                        <span>{lightingInfo.label} Light</span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Users className={cn("h-4 w-4", getCrowdLevelColor(opportunity.crowdLevel))} />
                                                        <span className="capitalize">{opportunity.crowdLevel} Crowds</span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Target className="h-4 w-4 text-muted-foreground" />
                                                        <span className="capitalize">{opportunity.difficulty}</span>
                                                    </div>
                                                </div>

                                                {opportunity.optimalTimes.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium">Optimal Times:</p>
                                                        {opportunity.optimalTimes.map((timeSlot, i) => (
                                                            <div key={i} className="p-2 bg-muted/50 rounded text-sm">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-medium">{timeSlot.start} - {timeSlot.end}</span>
                                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                                </div>
                                                                <p className="text-muted-foreground text-xs">{timeSlot.reason}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-1">
                                                    {opportunity.tags.map((tag, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <Button size="sm" className="flex-1">
                                                        <Camera className="h-4 w-4 mr-2" />
                                                        Book PhotoPass
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Navigation className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Bookmark className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </MagicCard>
                                    </BlurFade>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* My Photos Tab */}
                <TabsContent value="gallery" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Your Vacation Photos</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download All
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share className="h-4 w-4 mr-2" />
                                Share Album
                            </Button>
                        </div>
                    </div>

                    {photosLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {vacationPhotos?.map((photo, index) => (
                                <BlurFade key={photo.id} delay={index * 0.05}>
                                    <div className="relative group cursor-pointer">
                                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                                <Camera className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        </div>

                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="secondary">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="secondary">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="secondary">
                                                    <Heart className={cn(
                                                        "h-4 w-4",
                                                        photo.isFavorite && "fill-red-500 text-red-500"
                                                    )} />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="absolute top-2 left-2 flex gap-1">
                                            {photo.isFavorite && (
                                                <Badge variant="destructive" className="text-xs">
                                                    <Heart className="h-3 w-3 mr-1 fill-current" />
                                                    Favorite
                                                </Badge>
                                            )}
                                            {photo.isDownloaded && (
                                                <Badge variant="default" className="text-xs">
                                                    <Download className="h-3 w-3 mr-1" />
                                                    Downloaded
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-xs rounded-b-lg">
                                            <p className="font-medium">{photo.location}</p>
                                            <p className="text-white/80">{format(photo.timestamp, 'MMM d, h:mm a')}</p>
                                        </div>
                                    </div>
                                </BlurFade>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Photo Assistant Settings</CardTitle>
                            <CardDescription>
                                Customize your PhotoPass smart features
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="auto-suggestions">Smart Photo Suggestions</Label>
                                        <Switch
                                            id="auto-suggestions"
                                            checked={autoSuggestionsEnabled}
                                            onCheckedChange={setAutoSuggestionsEnabled}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="location-reminders">Location-Based Reminders</Label>
                                        <Switch
                                            id="location-reminders"
                                            checked={locationBasedReminders}
                                            onCheckedChange={setLocationBasedReminders}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="weather-timing">Weather-Based Timing</Label>
                                        <Switch
                                            id="weather-timing"
                                            checked={weatherBasedTiming}
                                            onCheckedChange={setWeatherBasedTiming}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="smart-organization">Smart Photo Organization</Label>
                                        <Switch
                                            id="smart-organization"
                                            checked={smartOrganization}
                                            onCheckedChange={setSmartOrganization}
                                        />
                                    </div>

                                    <div>
                                        <Label>Notification Preferences</Label>
                                        <Select>
                                            <SelectTrigger className="mt-2">
                                                <SelectValue placeholder="Select notification level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Suggestions</SelectItem>
                                                <SelectItem value="important">Important Only</SelectItem>
                                                <SelectItem value="urgent">Urgent Only</SelectItem>
                                                <SelectItem value="none">None</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}