"use client"

import { useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ClockIcon,
    DownloadIcon,
    Zap,
    MapPinIcon,
    MoonIcon,
    PrinterIcon,
    SaveIcon,
    Share2Icon,
    SunIcon,
    ThumbsUpIcon,
    UmbrellaIcon,
    FootprintsIcon,
} from "lucide-react"
import { format, parseISO } from "date-fns"

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

interface OptimizationStats {
    totalAttractions: number
    expectedWaitTime: number
    walkingDistance: number
    startTime: string
    endTime: string
    coveragePercentage: number
    lightningLaneUsage: number
    lightningLaneCost?: number
}

interface OptimizationAlternatives {
    morningAlternative?: ItineraryItem[]
    afternoonAlternative?: ItineraryItem[]
    eveningAlternative?: ItineraryItem[]
    rainyDayPlan?: ItineraryItem[]
    lowWaitTimePlan?: ItineraryItem[]
    maxAttractionsPlan?: ItineraryItem[]
}

interface OptimizationResult {
    itinerary: ItineraryItem[]
    stats: OptimizationStats
    alternatives: OptimizationAlternatives
}

interface OptimizerResultsProps {
    result: OptimizationResult
}

export default function OptimizerResults({ result }: OptimizerResultsProps) {
    const [selectedPlanType, setSelectedPlanType] = useState<string>("main")

    const getItineraryToDisplay = () => {
        switch (selectedPlanType) {
            case "main":
                return result.itinerary
            case "morning":
                return result.alternatives.morningAlternative || []
            case "afternoon":
                return result.alternatives.afternoonAlternative || []
            case "evening":
                return result.alternatives.eveningAlternative || []
            case "rainy":
                return result.alternatives.rainyDayPlan || []
            case "low-wait":
                return result.alternatives.lowWaitTimePlan || []
            case "max-attractions":
                return result.alternatives.maxAttractionsPlan || []
            default:
                return result.itinerary
        }
    }

    // Format time from ISO to readable format (e.g. 9:30 AM)
    const formatTime = (isoTime: string) => {
        try {
            return format(parseISO(isoTime), "h:mm a")
        } catch {
            return isoTime
        }
    }

    const getItemColor = (type: string) => {
        switch (type) {
            case "RIDE":
                return "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900"
            case "SHOW":
                return "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-900"
            case "MEET_AND_GREET":
                return "bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-900"
            case "DINING":
                return "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-900"
            case "BREAK":
            case "FLEXIBLE_TIME":
                return "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900"
            default:
                return "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800"
        }
    }

    const getItemIcon = (type: string) => {
        switch (type) {
            case "RIDE":
                return <Badge variant="secondary">Ride</Badge>
            case "SHOW":
                return <Badge variant="secondary">Show</Badge>
            case "MEET_AND_GREET":
                return <Badge variant="secondary">Character</Badge>
            case "DINING":
                return <Badge variant="secondary">Dining</Badge>
            case "BREAK":
                return <Badge variant="secondary">Break</Badge>
            case "FLEXIBLE_TIME":
                return <Badge variant="secondary">Flexible</Badge>
            default:
                return <Badge variant="secondary">Activity</Badge>
        }
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">Your Optimized Itinerary</CardTitle>
                            <CardDescription>
                                Customize your day with our AI-optimized plan
                            </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                                <PrinterIcon className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                            <Button variant="outline" size="sm">
                                <DownloadIcon className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                            <Button variant="outline" size="sm">
                                <SaveIcon className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                            <Button size="sm">
                                <Share2Icon className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <ClockIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                                        <div className="text-sm font-medium">Wait Time</div>
                                    </div>
                                    <div className="text-xl font-bold">{result.stats.expectedWaitTime} min</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <ThumbsUpIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                                        <div className="text-sm font-medium">Attractions</div>
                                    </div>
                                    <div className="text-xl font-bold">{result.stats.totalAttractions}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FootprintsIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                                        <div className="text-sm font-medium">Walking</div>
                                    </div>
                                    <div className="text-xl font-bold">{result.stats.walkingDistance} km</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="timeline">
                        <TabsList>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                            <TabsTrigger value="map">Map</TabsTrigger>
                            <TabsTrigger value="stats">Statistics</TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline" className="mt-6">
                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Button
                                        variant={selectedPlanType === "main" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedPlanType("main")}
                                    >
                                        Main Plan
                                    </Button>
                                    {result.alternatives.morningAlternative && (
                                        <Button
                                            variant={selectedPlanType === "morning" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedPlanType("morning")}
                                        >
                                            <SunIcon className="h-4 w-4 mr-2" />
                                            Morning Focus
                                        </Button>
                                    )}
                                    {result.alternatives.afternoonAlternative && (
                                        <Button
                                            variant={selectedPlanType === "afternoon" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedPlanType("afternoon")}
                                        >
                                            <SunIcon className="h-4 w-4 mr-2" />
                                            Afternoon Focus
                                        </Button>
                                    )}
                                    {result.alternatives.eveningAlternative && (
                                        <Button
                                            variant={selectedPlanType === "evening" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedPlanType("evening")}
                                        >
                                            <MoonIcon className="h-4 w-4 mr-2" />
                                            Evening Focus
                                        </Button>
                                    )}
                                    {result.alternatives.rainyDayPlan && (
                                        <Button
                                            variant={selectedPlanType === "rainy" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedPlanType("rainy")}
                                        >
                                            <UmbrellaIcon className="h-4 w-4 mr-2" />
                                            Rainy Day
                                        </Button>
                                    )}
                                    {result.alternatives.lowWaitTimePlan && (
                                        <Button
                                            variant={selectedPlanType === "low-wait" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedPlanType("low-wait")}
                                        >
                                            <ClockIcon className="h-4 w-4 mr-2" />
                                            Low Wait Times
                                        </Button>
                                    )}
                                    {result.alternatives.maxAttractionsPlan && (
                                        <Button
                                            variant={selectedPlanType === "max-attractions" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedPlanType("max-attractions")}
                                        >
                                            <ThumbsUpIcon className="h-4 w-4 mr-2" />
                                            Max Attractions
                                        </Button>
                                    )}
                                </div>

                                <div className="relative border-l-2 border-muted pl-6 space-y-6 ml-2">
                                    {getItineraryToDisplay().map((item, index) => (
                                        <div
                                            key={index}
                                            className={`relative p-4 rounded-lg border ${getItemColor(item.type)}`}
                                        >
                                            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 h-3 w-3 rounded-full bg-primary"></div>
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center">
                                                        <span className="font-semibold text-sm text-muted-foreground mr-2">
                                                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                        </span>
                                                        {getItemIcon(item.type)}
                                                        {item.lightningLane && (
                                                            <Badge variant="outline" className="ml-2 flex items-center">
                                                                <Zap className="h-3 w-3 mr-1" />
                                                                {item.lightningLane.type === 'GENIE_PLUS' ? 'Genie+' : 'Lightning Lane'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                                    {item.description && (
                                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                                    )}
                                                </div>
                                                <div className="mt-2 md:mt-0 flex flex-col md:items-end space-y-1">
                                                    {item.waitTime !== undefined && (
                                                        <div className="flex items-center text-sm">
                                                            <ClockIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                                                            <span>Wait: <strong>{item.waitTime}</strong> min</span>
                                                        </div>
                                                    )}
                                                    {item.walkingTime !== undefined && item.walkingTime > 0 && (
                                                        <div className="flex items-center text-sm">
                                                            <FootprintsIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                                                            <span>Walk: <strong>{item.walkingTime}</strong> min</span>
                                                        </div>
                                                    )}
                                                    {item.location && (
                                                        <div className="flex items-center text-sm">
                                                            <MapPinIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                                                            <span>{item.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {item.notes && (
                                                <div className="mt-2 text-sm bg-background/50 p-2 rounded border border-muted">
                                                    <p className="italic text-muted-foreground">{item.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="map" className="mt-6">
                            <div className="flex items-center justify-center">
                                <div className="text-center p-12 border-2 border-dashed rounded-lg w-full">
                                    <MapPinIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                                    <h3 className="text-lg font-medium mt-4">Interactive Park Map</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        A visual representation of your itinerary will appear here.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="stats" className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Itinerary Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Total Attractions:</dt>
                                                <dd className="font-medium">{result.stats.totalAttractions}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Start Time:</dt>
                                                <dd className="font-medium">{formatTime(result.stats.startTime)}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">End Time:</dt>
                                                <dd className="font-medium">{formatTime(result.stats.endTime)}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Coverage:</dt>
                                                <dd className="font-medium">{result.stats.coveragePercentage}%</dd>
                                            </div>
                                        </dl>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Wait Times</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Total Wait Time:</dt>
                                                <dd className="font-medium">{result.stats.expectedWaitTime} minutes</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Average Per Attraction:</dt>
                                                <dd className="font-medium">
                                                    {result.stats.totalAttractions > 0
                                                        ? Math.round(result.stats.expectedWaitTime / result.stats.totalAttractions)
                                                        : 0} minutes
                                                </dd>
                                            </div>
                                        </dl>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Walking & Movement</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Walking Distance:</dt>
                                                <dd className="font-medium">{result.stats.walkingDistance} km</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Estimated Steps:</dt>
                                                <dd className="font-medium">{Math.round(result.stats.walkingDistance * 1312)} steps</dd>
                                            </div>
                                        </dl>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Lightning Lane Usage</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Lightning Lanes Used:</dt>
                                                <dd className="font-medium">{result.stats.lightningLaneUsage}</dd>
                                            </div>
                                            {result.stats.lightningLaneCost !== undefined && (
                                                <div className="flex justify-between">
                                                    <dt className="text-muted-foreground">Total Cost:</dt>
                                                    <dd className="font-medium">${result.stats.lightningLaneCost.toFixed(2)}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pro Tips for Your Day</CardTitle>
                    <CardDescription>
                        Get the most out of your Disney park experience
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Arrive 30-45 minutes before park opening</AccordionTrigger>
                            <AccordionContent>
                                Getting to the park before it officially opens allows you to be among the first to enter. This &quot;rope drop&quot;
                                strategy can help you experience popular attractions with minimal wait times.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Take mid-day breaks to avoid peak crowds</AccordionTrigger>
                            <AccordionContent>
                                Parks are typically most crowded between 11am and 3pm. This is a great time to enjoy a leisurely meal,
                                rest at your hotel, or explore less crowded areas of the park.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Use mobile ordering for meals</AccordionTrigger>
                            <AccordionContent>
                                Disney&apos;s mobile ordering service allows you to order food in advance from select quick-service restaurants.
                                This saves time waiting in line and ensures you can eat when you want.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Stay hydrated and pack essentials</AccordionTrigger>
                            <AccordionContent>
                                Bring a refillable water bottle, sunscreen, portable charger, and comfortable shoes.
                                Being prepared will keep you comfortable throughout the day.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Be flexible with your plan</AccordionTrigger>
                            <AccordionContent>
                                While this itinerary is optimized for efficiency, unexpected changes can occur.
                                Attractions may close temporarily, wait times may fluctuate, or weather can change.
                                Be prepared to adapt your plan as needed.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    )
}