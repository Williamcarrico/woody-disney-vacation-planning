"use client"

import { useState, useMemo, useCallback } from 'react'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

// Magic UI Components
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Meteors } from '@/components/magicui/meteors'
import { NumberTicker } from '@/components/magicui/number-ticker'

// Icons
import {
    TreePine,
    Clock,
    Users,
    Utensils,
    Zap,
    Sparkles,
    Mountain,
    AlertTriangle,
    Timer,
    Music,
    Sun,
    PawPrint,
    Globe,
    Train,
    Bug,
    RefreshCw
} from 'lucide-react'

// Hooks
import {
    useAnimalKingdomOverview,
    useAnimalKingdomAttractions,
    useAnimalKingdomDining,
    useAnimalKingdomEntertainment,
    useAnimalKingdomSchedule,
    type AnimalKingdomOverview
} from '@/hooks/useAnimalKingdom'

// Types
interface LandIcon {
    [key: string]: React.ReactNode
}

interface LandColor {
    [key: string]: string
}

type SortBy = 'wait-time' | 'name'

// Land icons mapping
const landIcons: LandIcon = {
    'Discovery Island': <TreePine className="h-4 w-4" />,
    'Pandora - The World of Avatar': <Globe className="h-4 w-4" />,
    'Africa': <PawPrint className="h-4 w-4" />,
    'Asia': <Mountain className="h-4 w-4" />,
    'DinoLand U.S.A.': <Bug className="h-4 w-4" />,
    "Rafiki's Planet Watch": <Train className="h-4 w-4" />
}

// Land colors mapping
const landColors: LandColor = {
    'Discovery Island': 'bg-green-500',
    'Pandora - The World of Avatar': 'bg-blue-500',
    'Africa': 'bg-orange-500',
    'Asia': 'bg-red-500',
    'DinoLand U.S.A.': 'bg-purple-500',
    "Rafiki's Planet Watch": 'bg-yellow-500'
}

// Helper function to format wait time
function formatWaitTime(minutes: number): string {
    if (minutes === 0) return 'Walk-on'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// Helper function to get wait time color
function getWaitTimeColor(minutes: number): string {
    if (minutes === 0) return 'text-green-600'
    if (minutes <= 15) return 'text-green-500'
    if (minutes <= 30) return 'text-yellow-500'
    if (minutes <= 60) return 'text-orange-500'
    return 'text-red-500'
}

// Helper function to get crowd level color
function getCrowdLevelColor(level: number): string {
    if (level <= 2) return 'text-green-600'
    if (level <= 4) return 'text-green-500'
    if (level <= 6) return 'text-yellow-500'
    if (level <= 8) return 'text-orange-500'
    return 'text-red-500'
}

// Helper function to format time safely
function formatTime(timeString: string | undefined): string {
    if (!timeString) return 'N/A'
    try {
        return new Date(timeString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    } catch {
        return 'N/A'
    }
}

// Helper function to safely get time from any object
function safeGetTime(timeObj: unknown, property: string): string {
    if (!timeObj || typeof timeObj !== 'object') {
        return 'N/A'
    }

    const objWithProperty = timeObj as Record<string, unknown>
    const timeValue = objWithProperty[property]

    if (!timeValue || typeof timeValue !== 'string') {
        return 'N/A'
    }
    return formatTime(timeValue)
}

// Helper function to create skeleton array
function createSkeletonArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i)
}

// Skeleton loader for attraction card
function AttractionCardSkeleton() {
    return (
        <MagicCard className="group relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-12 w-20" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </CardContent>
        </MagicCard>
    )
}

export default function AnimalKingdomPage() {
    const [selectedLand, setSelectedLand] = useState<string>('all')
    const [sortBy, setSortBy] = useState<SortBy>('wait-time')

    // Fetch data using hooks
    const overviewQuery = useAnimalKingdomOverview()
    const attractionsQuery = useAnimalKingdomAttractions()
    const diningQuery = useAnimalKingdomDining()
    const entertainmentQuery = useAnimalKingdomEntertainment()
    const _scheduleQuery = useAnimalKingdomSchedule()

    const overview = overviewQuery.data
    const overviewLoading = overviewQuery.isLoading
    const refetchOverview = overviewQuery.refetch

    const attractionsData = attractionsQuery.data
    const attractionsLoading = attractionsQuery.isLoading
    const refetchAttractions = attractionsQuery.refetch

    const diningData = diningQuery.data
    const diningLoading = diningQuery.isLoading

    const entertainmentData = entertainmentQuery.data
    const entertainmentLoading = entertainmentQuery.isLoading

    // Memoized filtered and sorted attractions
    const filteredAttractions = useMemo(() => {
        if (!attractionsData?.attractions) return []

        return attractionsData.attractions
            .filter((attraction) => selectedLand === 'all' || attraction.land === selectedLand)
            .sort((a, b) => {
                if (sortBy === 'wait-time') {
                    return b.waitTime - a.waitTime
                }
                return a.name.localeCompare(b.name)
            })
    }, [attractionsData?.attractions, selectedLand, sortBy])

    // Memoized filtered dining
    const filteredDining = useMemo(() => {
        if (!diningData?.dining) return []

        return diningData.dining.filter((restaurant) =>
            selectedLand === 'all' || restaurant.land === selectedLand
        )
    }, [diningData?.dining, selectedLand])

    // Memoized filtered entertainment
    const filteredEntertainment = useMemo(() => {
        if (!entertainmentData?.entertainment) return []

        return entertainmentData.entertainment.filter((show) =>
            selectedLand === 'all' || show.location === selectedLand
        )
    }, [entertainmentData?.entertainment, selectedLand])

    // Refresh all data
    const handleRefreshAll = useCallback(() => {
        refetchOverview()
        refetchAttractions()
    }, [refetchOverview, refetchAttractions])

    // Handle sort change
    const handleSortChange = useCallback((value: string) => {
        if (value === 'wait-time' || value === 'name') {
            setSortBy(value)
        }
    }, [])

    // Handle land filter change
    const handleLandChange = useCallback((land: string) => {
        setSelectedLand(land)
    }, [])

    // Use proper typing for overview data
    const typedOverview: AnimalKingdomOverview | undefined = overview

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-green-950 dark:via-blue-950 dark:to-orange-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 text-white">
                <div className="absolute inset-0 bg-black/20" />
                <Meteors number={20} />

                <div className="relative container mx-auto px-6 py-16">
                    <BlurFade delay={0.1}>
                        <div className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <TreePine className="h-12 w-12" />
                                <SparklesText className="text-5xl font-bold">
                                    {typedOverview?.park.name || "Disney's Animal Kingdom"}
                                </SparklesText>
                            </div>
                            <p className="text-xl text-green-100 max-w-3xl mx-auto">
                                Welcome to a magical kingdom where animals, adventure, and Disney storytelling come together.
                                Experience the wonder of nature and the thrill of discovery in Disney&apos;s wildest theme park.
                            </p>

                            {/* Quick Stats */}
                            {overviewLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
                                    {createSkeletonArray(4).map((i) => (
                                        <Skeleton key={i} className="h-24 bg-white/20" />
                                    ))}
                                </div>
                            ) : typedOverview && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
                                    <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                        <div className="text-center">
                                            <Clock className="h-6 w-6 mx-auto mb-2" />
                                            <p className="text-sm text-green-100">Park Status</p>
                                            <p className="text-lg font-bold">
                                                {typedOverview.currentStatus.isOpen ? 'Open' : 'Closed'}
                                            </p>
                                        </div>
                                    </MagicCard>
                                    <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                        <div className="text-center">
                                            <Users className="h-6 w-6 mx-auto mb-2" />
                                            <p className="text-sm text-green-100">Crowd Level</p>
                                            <p className={`text-lg font-bold ${getCrowdLevelColor(typedOverview.currentStatus.crowdLevel)}`}>
                                                {typedOverview.currentStatus.crowdLevel}/10
                                            </p>
                                        </div>
                                    </MagicCard>
                                    <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                        <div className="text-center">
                                            <Timer className="h-6 w-6 mx-auto mb-2" />
                                            <p className="text-sm text-green-100">Avg Wait</p>
                                            <p className="text-lg font-bold">
                                                <NumberTicker value={typedOverview.currentStatus.averageWaitTime} /> min
                                            </p>
                                        </div>
                                    </MagicCard>
                                    <MagicCard className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                                        <div className="text-center">
                                            <Sun className="h-6 w-6 mx-auto mb-2" />
                                            <p className="text-sm text-green-100">Weather</p>
                                            <p className="text-lg font-bold">
                                                {typedOverview.currentStatus.weather.temp}°F
                                            </p>
                                        </div>
                                    </MagicCard>
                                </div>
                            )}

                            {/* Today's Hours */}
                            {typedOverview?.todaySchedule && (
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
                                    <p className="text-sm text-green-100 mb-1">Today&apos;s Park Hours</p>
                                    <p className="text-xl font-bold">
                                        {safeGetTime(typedOverview.todaySchedule, 'openingTime')} - {safeGetTime(typedOverview.todaySchedule, 'closingTime')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </BlurFade>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                {/* Land Filter */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Explore the Lands</h2>
                        <Button
                            onClick={handleRefreshAll}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            aria-label="Refresh all data"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh Data
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedLand === 'all' ? 'default' : 'outline'}
                            onClick={() => handleLandChange('all')}
                            className="gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            All Lands
                        </Button>
                        {typedOverview?.lands.map((land) => (
                            <Button
                                key={land}
                                variant={selectedLand === land ? 'default' : 'outline'}
                                onClick={() => handleLandChange(land)}
                                className="gap-2"
                            >
                                {landIcons[land]}
                                {land}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="attractions" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                        <TabsTrigger value="attractions" className="gap-2">
                            <Zap className="h-4 w-4" />
                            Attractions
                        </TabsTrigger>
                        <TabsTrigger value="dining" className="gap-2">
                            <Utensils className="h-4 w-4" />
                            Dining
                        </TabsTrigger>
                        <TabsTrigger value="entertainment" className="gap-2">
                            <Music className="h-4 w-4" />
                            Entertainment
                        </TabsTrigger>
                    </TabsList>

                    {/* Attractions Tab */}
                    <TabsContent value="attractions" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold">
                                {selectedLand === 'all' ? 'All Attractions' : `${selectedLand} Attractions`}
                            </h3>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="px-4 py-2 rounded-lg border bg-background"
                                aria-label="Sort attractions by"
                            >
                                <option value="wait-time">Sort by Wait Time</option>
                                <option value="name">Sort by Name</option>
                            </select>
                        </div>

                        {attractionsLoading ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {createSkeletonArray(6).map((i) => (
                                    <AttractionCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredAttractions.map((attraction) => (
                                    <BlurFade key={attraction.id} delay={0.1}>
                                        <MagicCard className="group relative overflow-hidden hover:shadow-xl transition-all duration-300">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-lg mb-1">{attraction.name}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Badge variant="secondary" className={`${landColors[attraction.land]} text-white`}>
                                                                {attraction.land}
                                                            </Badge>
                                                            <Badge variant="outline">{attraction.type}</Badge>
                                                        </div>
                                                    </div>
                                                    {attraction.status === 'OPERATING' && attraction.waitTime > 0 && (
                                                        <div className="text-right">
                                                            <p className={`text-2xl font-bold ${getWaitTimeColor(attraction.waitTime)}`}>
                                                                {formatWaitTime(attraction.waitTime)}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">wait time</p>
                                                        </div>
                                                    )}
                                                    {attraction.status === 'CLOSED' && (
                                                        <Badge variant="destructive">Closed</Badge>
                                                    )}
                                                    {attraction.status === 'DOWN' && (
                                                        <Badge variant="destructive">Temporarily Down</Badge>
                                                    )}
                                                    {attraction.status === 'REFURBISHMENT' && (
                                                        <Badge variant="secondary">Refurbishment</Badge>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    {attraction.lightningLane && (
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="h-4 w-4 text-yellow-500" />
                                                            <span className="text-sm">Lightning Lane available</span>
                                                            {attraction.lightningLanePrice && (
                                                                <Badge variant="secondary">
                                                                    ${attraction.lightningLanePrice.amount}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                    {attraction.height && (
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <AlertTriangle className="h-4 w-4" />
                                                            Height: {attraction.height}
                                                        </div>
                                                    )}
                                                    {attraction.nextShowtime && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="h-4 w-4" />
                                                            Next show: {safeGetTime(attraction.nextShowtime, 'startTime')}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <BorderBeam />
                                        </MagicCard>
                                    </BlurFade>
                                ))}
                            </div>
                        )}

                        {!attractionsLoading && filteredAttractions.length === 0 && (
                            <Alert>
                                <AlertDescription>
                                    No attractions found for the selected filters.
                                </AlertDescription>
                            </Alert>
                        )}
                    </TabsContent>

                    {/* Dining Tab */}
                    <TabsContent value="dining" className="space-y-6">
                        <h3 className="text-xl font-semibold">
                            {selectedLand === 'all' ? 'All Dining' : `${selectedLand} Dining`}
                        </h3>

                        {diningLoading ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {createSkeletonArray(6).map((i) => (
                                    <Skeleton key={i} className="h-48" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredDining.map((restaurant) => (
                                    <BlurFade key={restaurant.id} delay={0.1}>
                                        <MagicCard className="hover:shadow-xl transition-all duration-300">
                                            <CardContent className="p-6">
                                                <h4 className="font-semibold text-lg mb-2">{restaurant.name}</h4>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Badge variant="secondary" className={`${landColors[restaurant.land]} text-white`}>
                                                        {restaurant.land}
                                                    </Badge>
                                                    <Badge variant="outline">{restaurant.type}</Badge>
                                                    <Badge variant={restaurant.status === 'OPERATING' ? 'default' : 'destructive'}>
                                                        {restaurant.status === 'OPERATING' ? 'Open' : 'Closed'}
                                                    </Badge>
                                                </div>
                                                {restaurant.operatingHours && restaurant.operatingHours.length > 0 && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Hours: {safeGetTime(restaurant.operatingHours[0], 'openingTime')} - {safeGetTime(restaurant.operatingHours[0], 'closingTime')}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </MagicCard>
                                    </BlurFade>
                                ))}
                            </div>
                        )}

                        {!diningLoading && filteredDining.length === 0 && (
                            <Alert>
                                <AlertDescription>
                                    No dining locations found for the selected filters.
                                </AlertDescription>
                            </Alert>
                        )}
                    </TabsContent>

                    {/* Entertainment Tab */}
                    <TabsContent value="entertainment" className="space-y-6">
                        <h3 className="text-xl font-semibold">Shows & Entertainment</h3>

                        {entertainmentLoading ? (
                            <div className="grid gap-6 md:grid-cols-2">
                                {createSkeletonArray(4).map((i) => (
                                    <Skeleton key={i} className="h-40" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2">
                                {filteredEntertainment.map((show) => (
                                    <BlurFade key={show.id} delay={0.1}>
                                        <MagicCard className="hover:shadow-xl transition-all duration-300">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-semibold text-lg">{show.name}</h4>
                                                    <Badge variant={show.status === 'OPERATING' ? 'default' : 'destructive'}>
                                                        {show.status === 'OPERATING' ? 'Available Today' : 'Not Available'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    Location: {show.location}
                                                </p>
                                                {show.showtimes && show.showtimes.length > 0 && (
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">Showtimes:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {show.showtimes.slice(0, 6).map((time, idx) => (
                                                                <Badge key={idx} variant="secondary">
                                                                    {safeGetTime(time, 'startTime')}
                                                                </Badge>
                                                            ))}
                                                            {show.showtimes.length > 6 && (
                                                                <Badge variant="outline">+{show.showtimes.length - 6} more</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </MagicCard>
                                    </BlurFade>
                                ))}
                            </div>
                        )}

                        {!entertainmentLoading && filteredEntertainment.length === 0 && (
                            <Alert>
                                <AlertDescription>
                                    No entertainment found for the selected filters.
                                </AlertDescription>
                            </Alert>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}