"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"

// UI primitives
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Icons
import {
    Zap,
    Clock,
    MapPin,
    Sparkles,
    XCircle,
    ListChecks,
    SlidersHorizontal,
    X
} from "lucide-react"

import type { Attraction } from "@/components/attractions/types"

/**
 * Internal mock data – in a real application replace with an API call or context hook.
 * We purposefully keep this small and focused on Genie+ eligible attractions to
 * keep the example readable while still showing realistic data structures.
 */
const mockGeniePlusAttractions: Attraction[] = [
    {
        id: "mk-7dmt",
        name: "Seven Dwarfs Mine Train",
        parkId: "MK",
        parkName: "Magic Kingdom",
        land: "Fantasyland",
        imageUrl: "/images/attractions/mk-7dmt.jpg",
        thumbnailUrl: "/images/attractions/mk-7dmt-thumb.jpg",
        description:
            "Race through the diamond mine from Snow White and the Seven Dwarfs on a swaying family coaster.",
        waitTime: 65,
        status: "Operating",
        geniePlus: {
            available: true,
            nextAvailableTime: "11:10 AM",
            isLightningLane: false
        },
        riderSwitchAvailable: true,
        heightRequirement: "38in (97cm)",
        thrillLevels: ["Coaster", "Gentle"],
        tags: ["Outdoor", "Family"],
        duration: "3 minutes",
        userRating: 4.8
    },
    {
        id: "mk-pirates",
        name: "Pirates of the Caribbean",
        parkId: "MK",
        parkName: "Magic Kingdom",
        land: "Adventureland",
        imageUrl: "/images/attractions/mk-pirates.jpg",
        thumbnailUrl: "/images/attractions/mk-pirates-thumb.jpg",
        description: "Set sail on a swashbuckling voyage where pirates rule the seas.",
        waitTime: 40,
        status: "Operating",
        geniePlus: {
            available: true,
            nextAvailableTime: "10:45 AM",
            isLightningLane: false
        },
        riderSwitchAvailable: false,
        heightRequirement: null,
        thrillLevels: ["Dark Ride", "Water Ride"],
        tags: ["Indoor", "Classic", "Slow", "Boat Ride"],
        duration: "8 minutes",
        userRating: 4.7
    },
    {
        id: "ep-test-track",
        name: "Test Track",
        parkId: "EP",
        parkName: "Epcot",
        land: "World Discovery",
        imageUrl: "/images/attractions/ep-test-track.jpg",
        thumbnailUrl: "/images/attractions/ep-test-track-thumb.jpg",
        description: "Design a virtual concept car and take it for a thrilling spin.",
        waitTime: 70,
        status: "Operating",
        geniePlus: {
            available: true,
            nextAvailableTime: "01:05 PM",
            isLightningLane: false
        },
        riderSwitchAvailable: true,
        heightRequirement: "40in (102cm)",
        thrillLevels: ["Coaster", "Dark Ride"],
        tags: ["Indoor", "Fast", "Interactive"],
        duration: "5 minutes",
        userRating: 4.5
    },
    {
        id: "hs-slinky-dog",
        name: "Slinky Dog Dash",
        parkId: "HS",
        parkName: "Hollywood Studios",
        land: "Toy Story Land",
        imageUrl: "/images/attractions/slinky-dog.jpg",
        thumbnailUrl: "/images/attractions/slinky-dog-thumb.jpg",
        description: "Take a wild ride as Slinky Dog stretches through Toy Story Land!",
        waitTime: 85,
        status: "Operating",
        geniePlus: {
            available: true,
            nextAvailableTime: "12:25 PM",
            isLightningLane: false
        },
        riderSwitchAvailable: true,
        heightRequirement: "38in (97cm)",
        thrillLevels: ["Coaster", "Gentle"],
        tags: ["Outdoor", "Popular", "Family"],
        duration: "2 minutes",
        userRating: 4.6
    }
]

/* -------------------------------------------------------------------------------------------------
 * Types & Helper functions
 * -----------------------------------------------------------------------------------------------*/

interface DisneyGeniePlannerProps {
    /**
     * Optional vacation identifier to scope stateful user selections.
     * In a real application this would be used to load/save preferences.
     */
    vacationId?: string
    /** Maximum Genie+ selections allowed – guests start with one at a time but can accumulate. */
    maxSelections?: number
}

/**
 * Parse a human-readable time (e.g. "1:05 PM") into minutes since midnight for easy comparison.
 */
function parseParkTime(time?: string): number | null {
    if (!time) return null
    const [timePart, period] = time.split(" ")
    const [h, m] = timePart.split(":").map(Number)
    const hours24 = (period === "PM" && h !== 12 ? h + 12 : period === "AM" && h === 12 ? 0 : h)
    return hours24 * 60 + m
}

/* -------------------------------------------------------------------------------------------------
 * Main Component
 * -----------------------------------------------------------------------------------------------*/

/**
 * DisneyGeniePlanner – an immersive planning tool that mimics the core flow of Disney's Genie+
 * experience. Guests can browse eligible attractions, select their desired Lightning Lane return
 * times, and visualize their day at a glance.
 */
function DisneyGeniePlanner({ vacationId, maxSelections = 8 }: DisneyGeniePlannerProps) {
    /* ------------------------------------------------------------------
     * State management
     * ---------------------------------------------------------------*/
    const [allAttractions, setAllAttractions] = useState<Attraction[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [activeTab, setActiveTab] = useState<"available" | "myDay">("available")

    /* ------------------------------------------------------------------
     * Data loading – pretend API call
     * ---------------------------------------------------------------*/
    useEffect(() => {
        async function load() {
            setLoading(true)
            // Simulate latency so the skeleton UI shows for demonstration purposes.
            await new Promise(res => setTimeout(res, 800))
            setAllAttractions(mockGeniePlusAttractions)
            setLoading(false)
        }
        load()
    }, [vacationId])

    /* ------------------------------------------------------------------
     * Derived data
     * ---------------------------------------------------------------*/
    const selectedAttractions = useMemo(
        () => allAttractions.filter(a => selectedIds.has(a.id)),
        [allAttractions, selectedIds]
    )

    const progressPercent = (selectedAttractions.length / maxSelections) * 100

    /**
     * Sort selected attractions by their Lightning Lane return time so users can see chronological order.
     */
    const sortedMyDay = useMemo(() => {
        return [...selectedAttractions].sort((a, b) => {
            const timeA = parseParkTime(a.geniePlus.nextAvailableTime) ?? Infinity
            const timeB = parseParkTime(b.geniePlus.nextAvailableTime) ?? Infinity
            return timeA - timeB
        })
    }, [selectedAttractions])

    /* ------------------------------------------------------------------
     * Event handlers
     * ---------------------------------------------------------------*/
    function toggleSelection(id: string) {
        setSelectedIds(prev => {
            const clone = new Set(prev)
            if (clone.has(id)) clone.delete(id)
            else if (clone.size < maxSelections) clone.add(id)
            return clone
        })
    }

    /* ------------------------------------------------------------------
     * Render helpers
     * ---------------------------------------------------------------*/
    function renderAttractionCard(att: Attraction, compact = false) {
        const isSelected = selectedIds.has(att.id)
        return (
            <Card
                key={att.id}
                className={`group relative overflow-hidden hover:shadow-lg transition-shadow ${compact ? "flex" : ""
                    } ${isSelected ? "border-primary/60 ring-[2px] ring-primary/40" : ""}`}
            >
                {/* Thumbnail */}
                <div className={compact ? "relative w-20 h-20 flex-shrink-0" : "relative w-full h-40"}>
                    {att.thumbnailUrl ? (
                        <Image
                            src={att.thumbnailUrl}
                            alt={att.name}
                            fill
                            style={{ objectFit: "cover" }}
                            className="transition-transform duration-300 ease-in-out group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-muted" />
                    )}
                    {isSelected && (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground" variant="default">
                            Selected
                        </Badge>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow">
                    <CardHeader className={`${compact ? "p-3 pb-1" : ""}`}>
                        <CardTitle className={`text-lg font-semibold ${compact ? "text-base" : ""}`}>{att.name}</CardTitle>
                        {!compact && (
                            <CardDescription className="text-xs text-muted-foreground mt-0.5 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" /> {att.parkName}
                            </CardDescription>
                        )}
                    </CardHeader>

                    <CardContent className={`${compact ? "p-3 pt-0" : ""}`}>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-primary" />
                                {att.geniePlus.nextAvailableTime ?? "—"}
                            </div>
                            <div className="flex items-center">
                                <Zap className="h-4 w-4 text-yellow-400 mr-1" /> Genie+
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className={`mt-auto ${compact ? "p-3 pt-0" : ""}`}>
                        <Button
                            variant={isSelected ? "destructive" : "secondary"}
                            size="sm"
                            className="w-full"
                            onClick={() => toggleSelection(att.id)}
                        >
                            {isSelected ? (
                                <>
                                    Remove <X className="h-4 w-4 ml-1" />
                                </>
                            ) : (
                                <>
                                    Reserve <Sparkles className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </div>
            </Card>
        )
    }

    /* ------------------------------------------------------------------
     * Component markup
     * ---------------------------------------------------------------*/
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center">
                        <Zap className="h-6 w-6 mr-2 text-yellow-400" /> Genie+ Planner
                    </h2>
                    <p className="text-muted-foreground max-w-prose">
                        Browse eligible attractions and reserve Lightning Lane return times to optimize your day.
                    </p>
                </div>

                <div className="w-full md:w-1/3 space-y-1">
                    <Progress value={progressPercent} />
                    <p className="text-xs text-muted-foreground text-right">
                        {selectedAttractions.length}/{maxSelections} selections
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={val => setActiveTab(val as "available" | "myDay")} className="space-y-6">
                <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b-0 px-0">
                    <TabsTrigger value="available" className="py-2 px-4 flex items-center">
                        <SlidersHorizontal className="h-4 w-4 mr-2" /> Available
                    </TabsTrigger>
                    <TabsTrigger value="myDay" className="py-2 px-4 flex items-center">
                        <ListChecks className="h-4 w-4 mr-2" /> My Day
                    </TabsTrigger>
                </TabsList>

                {/* Available attractions */}
                <TabsContent value="available" className="space-y-4">
                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <AttractionCardSkeleton key={`skel-${i}`} />
                            ))}
                        </div>
                    ) : (
                        <ScrollArea className="h-[600px]">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                                {allAttractions.map(att => renderAttractionCard(att))}
                            </div>
                            <ScrollBar orientation="vertical" />
                        </ScrollArea>
                    )}
                </TabsContent>

                {/* My Day timeline */}
                <TabsContent value="myDay" className="space-y-4">
                    {selectedAttractions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <XCircle className="h-10 w-10 mb-4" />
                            <p>No selections yet. Reserve a Lightning Lane to start building your day!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedMyDay.map(att => (
                                <Card key={`myday-${att.id}`} className="flex items-center p-4 hover:shadow-lg transition-shadow">
                                    <div className="relative w-16 h-16 flex-shrink-0 mr-4">
                                        {att.thumbnailUrl ? (
                                            <Image src={att.thumbnailUrl} alt={att.name} fill style={{ objectFit: "cover" }} />
                                        ) : (
                                            <div className="absolute inset-0 bg-muted" />
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium flex items-center">
                                            {att.name}
                                            <Badge variant="outline" className="ml-2 py-0.5 px-1 text-[10px]">
                                                {att.parkName}
                                            </Badge>
                                        </p>
                                        <p className="text-sm flex items-center text-muted-foreground">
                                            <Clock className="h-3 w-3 mr-1" /> {att.geniePlus.nextAvailableTime}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => toggleSelection(att.id)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

/* -------------------------------------------------------------------------------------------------
 * Skeleton Card
 * -----------------------------------------------------------------------------------------------*/

function AttractionCardSkeleton() {
    return (
        <Card className="overflow-hidden animate-pulse flex">
            <div className="relative w-20 h-20 flex-shrink-0 bg-muted" />
            <div className="flex flex-col flex-grow p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full mt-auto" />
            </div>
        </Card>
    )
}

export default DisneyGeniePlanner