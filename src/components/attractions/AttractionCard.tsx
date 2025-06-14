"use client"

import { useState, memo, useMemo, useCallback } from "react"
import Image from "next/image"
import { Attraction } from "@/types/attraction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Clock, Info, Plus, Accessibility } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface AttractionCardProps {
    readonly attraction: Attraction
    readonly isOperating?: boolean
    readonly waitTime?: number
    readonly showDetails?: boolean
    readonly onSelect?: () => void
    readonly onAddToItinerary?: () => void
    readonly className?: string
}

const AttractionCard = memo(function AttractionCard({
    attraction,
    isOperating = true,
    waitTime,
    showDetails = false,
    onSelect,
    onAddToItinerary,
    className
}: AttractionCardProps) {
    const [expanded, setExpanded] = useState(showDetails)

    // Memoize expensive calculations
    const rideCategories = useMemo(() => {
        if (!attraction.rideCategory || attraction.rideCategory.length === 0) return null

        // Only show at most 2 categories in the card
        const displayCategories = attraction.rideCategory.slice(0, 2)

        return (
            <div className="flex flex-wrap gap-1 mt-1">
                {displayCategories.map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                    </Badge>
                ))}
                {attraction.rideCategory.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                        +{attraction.rideCategory.length - 2} more
                    </Badge>
                )}
            </div>
        )
    }, [attraction.rideCategory])

    // Memoize wait time color class
    const waitTimeColorClass = useMemo(() => {
        if (!waitTime) return ""
        if (waitTime <= 10) return "text-green-600 dark:text-green-400"
        if (waitTime <= 30) return "text-blue-600 dark:text-blue-400"
        if (waitTime <= 60) return "text-amber-600 dark:text-amber-400"
        return "text-red-600 dark:text-red-400"
    }, [waitTime])

    // Memoize wait time display
    const waitTimeDisplay = useMemo(() => {
        if (!isOperating || waitTime === undefined) return null

        const waitClass = cn("font-medium", waitTimeColorClass)

        return (
            <div className="flex flex-col items-end">
                <span className={cn(waitClass, "text-2xl font-bold")}>{waitTime} min</span>
                <span className="text-xs text-muted-foreground mt-1">
                    Current Wait
                </span>
            </div>
        )
    }, [isOperating, waitTime, waitTimeColorClass])

    // Memoize status badge
    const statusBadge = useMemo(() => {
        if (isOperating) {
            return (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Open
                </Badge>
            )
        } else {
            return (
                <Badge variant="outline" className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    Closed
                </Badge>
            )
        }
    }, [isOperating])

    // Memoize height requirement display
    const heightRequirement = useMemo(() => {
        if (!attraction.heightRequirement) return null
        return (
            <Badge variant="outline" className="text-xs">
                Height: {attraction.heightRequirement.minHeight || `${attraction.heightRequirement.min} ${attraction.heightRequirement.unit}`}
            </Badge>
        )
    }, [attraction.heightRequirement])

    // Memoize accessibility badge
    const accessibilityBadge = useMemo(() => {
        const { wheelchairAccessible } = attraction.accessibilityInfo

        return (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Accessibility className="h-3 w-3" />
                {wheelchairAccessible.split(' ')[0]}
            </Badge>
        )
    }, [attraction.accessibilityInfo.wheelchairAccessible])

    // Memoize duration badge
    const durationBadge = useMemo(() => {
        if (!attraction.duration) return null

        return (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {attraction.duration} min
            </Badge>
        )
    }, [attraction.duration])

    // Memoize callback functions to prevent unnecessary re-renders
    const handleExpandToggle = useCallback(() => {
        setExpanded(!expanded)
    }, [expanded])

    const handleSelect = useCallback(() => {
        onSelect?.()
    }, [onSelect])

    const handleAddToItinerary = useCallback(() => {
        onAddToItinerary?.()
    }, [onAddToItinerary])

    return (
        <Card
            className={cn(
                "overflow-hidden transition-all hover:shadow-lg",
                !isOperating && "opacity-70",
                className
            )}
        >
            <div className="relative h-48 w-full">
                <Image
                    src={attraction.imageUrl}
                    alt={attraction.name}
                    fill
                    className="object-cover"
                />
                <Badge
                    className="absolute top-3 left-3 bg-blue-600/90 text-white"
                >
                    {attraction.park}
                </Badge>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-lg line-clamp-1 pr-2">{attraction.name}</CardTitle>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {statusBadge}
                            {heightRequirement}
                            {accessibilityBadge}
                        </div>
                    </div>
                    {isOperating && waitTimeDisplay}
                </div>
            </CardHeader>

            {expanded && (
                <CardContent className="p-4 pt-2">
                    <div className="text-sm text-muted-foreground">
                        {attraction.shortDescription || attraction.description}
                    </div>

                    {rideCategories}

                    <div className="flex flex-wrap gap-1 mt-3">
                        {attraction.tags.slice(0, 4).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs bg-secondary/20">
                                {tag}
                            </Badge>
                        ))}
                        {attraction.tags.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                                +{attraction.tags.length - 4} more
                            </Badge>
                        )}
                    </div>

                    {attraction.schedule && (
                        <div className="mt-3 text-sm">
                            <span className="font-medium">Hours: </span>
                            {attraction.schedule.openingTime} - {attraction.schedule.closingTime}
                        </div>
                    )}

                    {attraction.schedule?.performanceTimes && (
                        <div className="mt-3 text-sm">
                            <span className="font-medium">Performance Times: </span>
                            {attraction.schedule.performanceTimes.join(", ")}
                        </div>
                    )}

                    {durationBadge}
                </CardContent>
            )}

            <CardFooter className="p-3 pt-0 flex justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExpandToggle}
                    className="text-xs"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Less Info
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            More Info
                        </>
                    )}
                </Button>

                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelect}
                                >
                                    <Info className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                View Details
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleAddToItinerary}
                                    disabled={!isOperating}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Add to Itinerary
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardFooter>
        </Card>
    )
}, (prevProps, nextProps) => {
    // Custom comparison for optimal re-rendering
    return (
        prevProps.attraction.id === nextProps.attraction.id &&
        prevProps.waitTime === nextProps.waitTime &&
        prevProps.isOperating === nextProps.isOperating &&
        prevProps.showDetails === nextProps.showDetails &&
        prevProps.className === nextProps.className
    )
})

export default AttractionCard