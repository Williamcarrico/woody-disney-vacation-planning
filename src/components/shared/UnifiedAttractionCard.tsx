"use client"

import { useState, memo, useMemo, useCallback } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Clock, Info, Plus, Accessibility, Star, Zap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Unified types that can accept both attraction formats
type UnifiedAttraction = {
    id: string
    name: string
    description?: string
    type?: string
    category?: string
    categories?: string[]
    rideCategory?: string[]
    location?: string
    waitTime?: number
    heightRequirement?: {
        inches?: number
        centimeters?: number
    }
    accessibility?: {
        wheelchairAccessible?: boolean
    }
    lightningLane?: {
        available?: boolean
        price?: number
    }
    rating?: number
    images?: string[]
    thrillLevel?: number
    isPopular?: boolean
    isNew?: boolean
    tags?: string[]
}

type UnifiedLiveData = {
    waitTime?: number
    status?: 'OPERATING' | 'DOWN' | 'CLOSED' | 'REFURBISHMENT'
    lightningLane?: {
        available?: boolean
        price?: number
        nextReturnTime?: string
    }
}

interface UnifiedAttractionCardProps {
    readonly attraction: UnifiedAttraction
    readonly liveData?: UnifiedLiveData
    readonly variant?: 'compact' | 'detailed' | 'dashboard'
    readonly showDetails?: boolean
    readonly onSelect?: () => void
    readonly onAddToItinerary?: () => void
    readonly recommended?: boolean
    readonly className?: string
}

const UnifiedAttractionCard = memo(function UnifiedAttractionCard({
    attraction,
    liveData,
    variant = 'detailed',
    showDetails = false,
    onSelect,
    onAddToItinerary,
    recommended = false,
    className
}: UnifiedAttractionCardProps) {
    const [expanded, setExpanded] = useState(showDetails)

    // Memoize wait time display
    const waitTimeDisplay = useMemo(() => {
        const waitTime = liveData?.waitTime ?? attraction.waitTime
        if (!waitTime || waitTime <= 0) return null
        
        return (
            <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                <span>{waitTime} min</span>
            </div>
        )
    }, [liveData?.waitTime, attraction.waitTime])

    // Memoize status display
    const statusDisplay = useMemo(() => {
        const status = liveData?.status
        if (!status) return null
        
        const statusConfig = {
            OPERATING: { color: 'bg-green-500', text: 'Operating' },
            DOWN: { color: 'bg-red-500', text: 'Temporarily Down' },
            CLOSED: { color: 'bg-gray-500', text: 'Closed' },
            REFURBISHMENT: { color: 'bg-orange-500', text: 'Refurbishment' }
        }
        
        const config = statusConfig[status]
        return (
            <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", config.color)} />
                <span className="text-sm text-muted-foreground">{config.text}</span>
            </div>
        )
    }, [liveData?.status])

    // Memoize categories display
    const categoriesDisplay = useMemo(() => {
        const categories = attraction.categories || attraction.rideCategory || []
        if (categories.length === 0) return null

        const displayCategories = categories.slice(0, 2)
        
        return (
            <div className="flex flex-wrap gap-1 mt-1">
                {displayCategories.map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                    </Badge>
                ))}
                {categories.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                        +{categories.length - 2} more
                    </Badge>
                )}
            </div>
        )
    }, [attraction.categories, attraction.rideCategory])

    // Memoize Lightning Lane display
    const lightningLaneDisplay = useMemo(() => {
        const llData = liveData?.lightningLane || attraction.lightningLane
        if (!llData?.available) return null
        
        return (
            <div className="flex items-center gap-1 text-sm text-blue-600">
                <Zap className="h-4 w-4" />
                <span>Lightning Lane</span>
                {llData.price && <span>${llData.price}</span>}
            </div>
        )
    }, [liveData?.lightningLane, attraction.lightningLane])

    // Memoize height requirement display
    const heightRequirementDisplay = useMemo(() => {
        const height = attraction.heightRequirement
        if (!height?.inches) return null
        
        return (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Min Height: {height.inches}"</span>
                {height.centimeters && <span>({height.centimeters}cm)</span>}
            </div>
        )
    }, [attraction.heightRequirement])

    // Callbacks
    const handleToggleExpanded = useCallback(() => {
        setExpanded(prev => !prev)
    }, [])

    const handleSelect = useCallback(() => {
        onSelect?.()
    }, [onSelect])

    const handleAddToItinerary = useCallback(() => {
        onAddToItinerary?.()
    }, [onAddToItinerary])

    // Render variants
    if (variant === 'compact') {
        return (
            <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", className)} onClick={handleSelect}>
                <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">{attraction.name}</h3>
                            {attraction.location && (
                                <p className="text-xs text-muted-foreground">{attraction.location}</p>
                            )}
                            {categoriesDisplay}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {waitTimeDisplay}
                            {lightningLaneDisplay}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn(
            "cursor-pointer hover:shadow-lg transition-shadow duration-200",
            recommended && "ring-2 ring-blue-500",
            className
        )}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{attraction.name}</CardTitle>
                        {attraction.location && (
                            <p className="text-sm text-muted-foreground mt-1">{attraction.location}</p>
                        )}
                        {categoriesDisplay}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {recommended && (
                            <Badge variant="default" className="bg-blue-600">
                                <Star className="h-3 w-3 mr-1" />
                                Recommended
                            </Badge>
                        )}
                        {attraction.isNew && (
                            <Badge variant="default" className="bg-green-600">
                                New
                            </Badge>
                        )}
                        {attraction.isPopular && (
                            <Badge variant="secondary">
                                Popular
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-3">
                    {/* Status and Wait Time */}
                    <div className="flex justify-between items-center">
                        {statusDisplay}
                        {waitTimeDisplay}
                    </div>

                    {/* Lightning Lane */}
                    {lightningLaneDisplay}

                    {/* Height Requirement */}
                    {heightRequirementDisplay}

                    {/* Accessibility */}
                    {attraction.accessibility?.wheelchairAccessible && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Accessibility className="h-4 w-4" />
                            <span>Wheelchair Accessible</span>
                        </div>
                    )}

                    {/* Description (expandable) */}
                    {attraction.description && (
                        <div>
                            <p className={cn(
                                "text-sm text-muted-foreground",
                                !expanded && "line-clamp-2"
                            )}>
                                {attraction.description}
                            </p>
                            {attraction.description.length > 100 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleToggleExpanded}
                                    className="mt-1 p-0 h-auto text-xs"
                                >
                                    {expanded ? (
                                        <>
                                            <ChevronUp className="h-3 w-3 mr-1" />
                                            Show Less
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-3 w-3 mr-1" />
                                            Show More
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Expanded Details */}
                    {expanded && (
                        <div className="space-y-2 text-sm">
                            {attraction.thrillLevel && (
                                <div>
                                    <span className="font-medium">Thrill Level: </span>
                                    <span>{attraction.thrillLevel}/5</span>
                                </div>
                            )}
                            {attraction.tags && attraction.tags.length > 0 && (
                                <div>
                                    <span className="font-medium">Tags: </span>
                                    <span className="text-muted-foreground">
                                        {attraction.tags.join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-3 gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleSelect}>
                            <Info className="h-4 w-4 mr-1" />
                            Details
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>View attraction details</p>
                    </TooltipContent>
                </Tooltip>

                {onAddToItinerary && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="default" size="sm" onClick={handleAddToItinerary}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add to Itinerary
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add to your itinerary</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </CardFooter>
        </Card>
    )
}, (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
        prevProps.attraction.id === nextProps.attraction.id &&
        prevProps.liveData?.waitTime === nextProps.liveData?.waitTime &&
        prevProps.liveData?.status === nextProps.liveData?.status &&
        prevProps.recommended === nextProps.recommended &&
        prevProps.variant === nextProps.variant
    )
})

UnifiedAttractionCard.displayName = "UnifiedAttractionCard"

export default UnifiedAttractionCard