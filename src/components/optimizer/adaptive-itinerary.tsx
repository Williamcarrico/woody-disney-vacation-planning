import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CircleAlert, CloudRain, Clock, RefreshCw, CloudSun, ThumbsUp, Zap, X } from "lucide-react"
import { format, addMinutes } from "date-fns"

interface ItineraryItem {
    type: string
    id?: string
    name: string
    startTime: string
    endTime: string
    waitTime?: number
    walkingTime?: number
    location?: string
    description?: string
    lightningLane?: {
        type: 'GENIE_PLUS' | 'INDIVIDUAL'
        price?: number
    }
    notes?: string
}

interface AdaptiveUpdate {
    id: string
    type: 'CLOSURE' | 'WAIT_TIME' | 'WEATHER' | 'CROWD' | 'SPECIAL_EVENT'
    title: string
    description: string
    affectedItems: string[]
    timestamp: Date
    severity: 'low' | 'medium' | 'high'
    recommendation?: {
        type: 'SKIP' | 'RESCHEDULE' | 'REPLACE' | 'LIGHTNING_LANE'
        replacementId?: string
        newTime?: string
    }
    acknowledged: boolean
}

interface AdaptiveItineraryProps {
    readonly itinerary: ItineraryItem[]
    readonly onRequestUpdate: () => void
}

export function AdaptiveItinerary({ itinerary, onRequestUpdate }: AdaptiveItineraryProps) {
    const [currentItinerary, setCurrentItinerary] = useState<ItineraryItem[]>(itinerary)
    const [updates, setUpdates] = useState<AdaptiveUpdate[]>([])
    const [lastChecked, setLastChecked] = useState<Date>(new Date())
    const [isChecking, setIsChecking] = useState(false)
    const [weatherCondition, setWeatherCondition] = useState<'sunny' | 'cloudy' | 'rainy'>('sunny')

    const generateWaitTimeUpdate = useCallback(() => {
        // Pick a random ride from the itinerary
        const rides = currentItinerary.filter(item => item.type === "RIDE" && !item.lightningLane)
        if (rides.length === 0) return

        const randomRide = rides[Math.floor(Math.random() * rides.length)]
        const originalWaitTime = randomRide.waitTime || 0
        const newWaitTime = Math.max(5, originalWaitTime + (Math.random() > 0.5 ? 20 : -10))

        // Only create update if the wait time changed significantly
        if (Math.abs(originalWaitTime - newWaitTime) < 10) return

        // Create wait time update
        const newUpdate: AdaptiveUpdate = {
            id: `wait-${Date.now()}`,
            type: 'WAIT_TIME',
            title: `Wait time changed for ${randomRide.name}`,
            description: `Wait time ${newWaitTime > originalWaitTime ? 'increased' : 'decreased'} from ${originalWaitTime} to ${newWaitTime} minutes`,
            affectedItems: [randomRide.id || ''],
            timestamp: new Date(),
            severity: newWaitTime > originalWaitTime ? 'medium' : 'low',
            recommendation: newWaitTime > originalWaitTime + 20 ? {
                type: 'LIGHTNING_LANE'
            } : undefined,
            acknowledged: false
        }

        setUpdates(prev => [newUpdate, ...prev])

        // Update the itinerary with the new wait time
        setCurrentItinerary(prev =>
            prev.map(item =>
                item.id === randomRide.id
                    ? { ...item, waitTime: newWaitTime }
                    : item
            )
        )
    }, [currentItinerary])

    const checkForUpdates = useCallback(async () => {
        setIsChecking(true)

        try {
            // In a real implementation, this would fetch from an API
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            // For demo purposes, sometimes generate a wait time update
            if (Math.random() > 0.5) {
                generateWaitTimeUpdate()
            }

            setLastChecked(new Date())
        } finally {
            setIsChecking(false)
        }
    }, [generateWaitTimeUpdate])

    const generateWeatherUpdate = useCallback(() => {
        // Filter outdoor attractions
        const outdoorAttractions = currentItinerary.filter(item =>
            (item.type === "RIDE" || item.type === "SHOW") &&
            !item.lightningLane &&
            (item.notes?.toLowerCase().includes('outdoor') || Math.random() > 0.7)
        )

        if (outdoorAttractions.length === 0) return

        // Create weather update affecting all outdoor attractions
        const newUpdate: AdaptiveUpdate = {
            id: `weather-${Date.now()}`,
            type: 'WEATHER',
            title: `Rain expected in the next hour`,
            description: `Several outdoor attractions may be affected. Consider adjusting your plan.`,
            affectedItems: outdoorAttractions.map(item => item.id || ''),
            timestamp: new Date(),
            severity: 'high',
            recommendation: {
                type: 'RESCHEDULE',
                newTime: format(addMinutes(new Date(), 120), "yyyy-MM-dd'T'HH:mm:ss")
            },
            acknowledged: false
        }

        setUpdates(prev => [newUpdate, ...prev])
    }, [currentItinerary])

    // Simulate real-time updates and monitoring
    useEffect(() => {
        // Initial check
        checkForUpdates()

        // Set up periodic checks (every 15 minutes)
        const intervalId = setInterval(() => {
            checkForUpdates()
        }, 15 * 60 * 1000)

        // Simulate a weather change after 10 seconds (for demo purposes)
        const weatherTimerId = setTimeout(() => {
            setWeatherCondition('rainy')
            generateWeatherUpdate()
        }, 10000)

        return () => {
            clearInterval(intervalId)
            clearTimeout(weatherTimerId)
        }
    }, [checkForUpdates, generateWeatherUpdate])

    const acknowledgeUpdate = (updateId: string) => {
        setUpdates(prev =>
            prev.map(update =>
                update.id === updateId
                    ? { ...update, acknowledged: true }
                    : update
            )
        )
    }

    const applyRecommendation = (update: AdaptiveUpdate) => {
        // In a real implementation, this would call the optimizer to generate a new plan
        // For demo purposes, we'll just acknowledge the update
        acknowledgeUpdate(update.id)
        onRequestUpdate()
    }

    const refreshData = () => {
        checkForUpdates()
    }

    const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
        switch (severity) {
            case 'low': return 'text-green-500 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
            case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
            case 'high': return 'text-red-500 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
        }
    }

    const getUpdateIcon = (type: AdaptiveUpdate['type']) => {
        switch (type) {
            case 'CLOSURE': return <CircleAlert className="h-5 w-5 text-red-500" />
            case 'WAIT_TIME': return <Clock className="h-5 w-5 text-blue-500" />
            case 'WEATHER': return <CloudRain className="h-5 w-5 text-blue-500" />
            case 'CROWD': return <ThumbsUp className="h-5 w-5 text-orange-500" />
            case 'SPECIAL_EVENT': return <Zap className="h-5 w-5 text-purple-500" />
        }
    }

    const unacknowledgedUpdates = updates.filter(update => !update.acknowledged)

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-green-500" />
                            Real-Time Itinerary Monitoring
                        </CardTitle>
                        <CardDescription>
                            Your plan automatically adapts to changing conditions
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {weatherCondition === 'sunny' && <CloudSun className="h-5 w-5 text-yellow-500" />}
                        {weatherCondition === 'cloudy' && <CloudSun className="h-5 w-5 text-gray-500" />}
                        {weatherCondition === 'rainy' && <CloudRain className="h-5 w-5 text-blue-500" />}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshData}
                            disabled={isChecking}
                        >
                            {isChecking ? 'Checking...' : 'Check for Updates'}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {unacknowledgedUpdates.length > 0 ? (
                    <div className="space-y-4">
                        {unacknowledgedUpdates.map((update) => (
                            <Alert key={update.id} className="relative">
                                <div className="flex items-start gap-3">
                                    {getUpdateIcon(update.type)}
                                    <div className="flex-1">
                                        <AlertTitle className="flex items-center gap-2">
                                            {update.title}
                                            <Badge className={`${getSeverityColor(update.severity)}`}>
                                                {update.severity}
                                            </Badge>
                                        </AlertTitle>
                                        <AlertDescription className="mt-1">
                                            <p className="text-sm mb-2">{update.description}</p>

                                            {update.recommendation && (
                                                <div className="mt-3 bg-muted/50 p-2 rounded-md">
                                                    <div className="text-sm font-medium mb-1">Recommendation:</div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {update.recommendation.type === 'SKIP' && 'Consider skipping this attraction.'}
                                                        {update.recommendation.type === 'RESCHEDULE' && 'Consider rescheduling to later in the day.'}
                                                        {update.recommendation.type === 'REPLACE' && 'We recommend an alternative attraction.'}
                                                        {update.recommendation.type === 'LIGHTNING_LANE' && 'Consider using Lightning Lane if available.'}
                                                    </p>
                                                    <div className="mt-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => applyRecommendation(update)}
                                                            className="mr-2"
                                                        >
                                                            Apply Recommendation
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => acknowledgeUpdate(update.id)}
                                                        >
                                                            Ignore
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-xs text-muted-foreground mt-2">
                                                Update received: {format(update.timestamp, "h:mm a")}
                                            </div>
                                        </AlertDescription>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 h-6 w-6 p-0"
                                    onClick={() => acknowledgeUpdate(update.id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Alert>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="mb-3 bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                            <ThumbsUp className="h-6 w-6 text-green-500" />
                        </div>
                        <h3 className="text-lg font-medium">Your itinerary is up to date</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                            We&apos;re continuously monitoring for changes in wait times, weather, and park conditions.
                        </p>
                        <div className="text-xs text-muted-foreground mt-4">
                            Last checked: {format(lastChecked, "h:mm a")}
                        </div>
                    </div>
                )}
            </CardContent>
            {updates.length > 0 && (
                <CardFooter className="flex-col items-stretch border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-medium">Previous Updates</div>
                        <Badge variant="outline" className="ml-2">
                            {updates.length}
                        </Badge>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {updates
                            .filter(update => update.acknowledged)
                            .slice(0, 5)
                            .map(update => (
                                <div key={update.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {getUpdateIcon(update.type)}
                                    <span className="flex-1">{update.title}</span>
                                    <span className="text-xs">{format(update.timestamp, "h:mm a")}</span>
                                </div>
                            ))}
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}