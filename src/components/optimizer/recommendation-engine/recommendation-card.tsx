"use client"

import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MapPin, Info, PlusCircle, Ban } from "lucide-react"
import {
    Recommendation,
    AttractionItem,
    DiningItem,
    ShowItem,
    EventItem,
    RecommendableItem
} from "./types"
import {
    getParkName,
    formatDuration,
    getItemImageUrl,
    getDescriptiveReason,
    getPriceRangeDescription,
    getAttractionTypeLabel,
    getDiningTypeLabel
} from "./utils"

interface RecommendationCardProps {
    recommendation: Recommendation
    onAddToItinerary?: (item: RecommendableItem) => void
    onNotInterested?: (itemId: string) => void
    isLoading?: boolean
}

/**
 * @component RecommendationCard
 * @description Displays a single recommendation item with an immersive and informative design.
 * It includes item details, image, reasoning, and action buttons.
 */
export function RecommendationCard({
    recommendation,
    onAddToItinerary,
    onNotInterested,
    isLoading = false,
}: RecommendationCardProps) {
    const { item, score, reasoning, source } = recommendation

    if (isLoading) {
        return <RecommendationCardSkeleton />
    }

    const descriptiveReason = getDescriptiveReason(recommendation)

    const renderItemSpecificDetails = () => {
        switch (item.type) {
            case "attraction":
                const attraction = item as AttractionItem
                return (
                    <>
                        <Badge variant="outline" className="text-xs">
                            {getAttractionTypeLabel(attraction.attractionType)}
                        </Badge>
                        {attraction.thrillLevel && <Badge variant="secondary" className="text-xs">{attraction.thrillLevel} thrill</Badge>}
                        {attraction.expectedWaitTime !== undefined && (
                            <Badge variant={attraction.expectedWaitTime <= 30 ? "default" : "secondary"} className="text-xs">
                                {attraction.expectedWaitTime} min wait
                            </Badge>
                        )}
                        {formatDuration(attraction.duration) && <Badge variant="outline" className="text-xs">{formatDuration(attraction.duration)}</Badge>}
                        {attraction.geniePlusAvailable && <Badge variant="default" className="text-xs">Genie+</Badge>}
                        {attraction.individualLightningLaneAvailable && <Badge variant="default" className="text-xs">ILL</Badge>}
                    </>
                )
            case "dining":
                const dining = item as DiningItem
                return (
                    <>
                        <Badge variant="outline" className="text-xs">{getDiningTypeLabel(dining.diningType)}</Badge>
                        {dining.priceRange && <Badge variant="secondary" className="text-xs">{getPriceRangeDescription(dining.priceRange)}</Badge>}
                        {dining.cuisine?.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                        {dining.reservationsRecommended && <Badge variant="secondary" className="text-xs">Reservations Recommended</Badge>}
                    </>
                )
            case "show":
                const show = item as ShowItem
                return (
                    <>
                        <Badge variant="outline" className="text-xs">{show.showType}</Badge>
                        {formatDuration(show.duration) && <Badge variant="secondary" className="text-xs">{formatDuration(show.duration)}</Badge>}
                        {show.showTimes && show.showTimes.length > 0 && <Badge variant="outline" className="text-xs">{show.showTimes.slice(0, 2).join(", ")}</Badge>}
                    </>
                )
            case "event":
                const event = item as EventItem
                return (
                    <>
                        <Badge variant="outline" className="text-xs">{event.eventType} Event</Badge>
                        {event.eventDates && <Badge variant="secondary" className="text-xs">{new Date(event.eventDates.startDate).toLocaleDateString()} - {new Date(event.eventDates.endDate).toLocaleDateString()}</Badge>}
                    </>
                )
            default:
                return null
        }
    }

    return (
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-purple-700">
            <CardHeader className="p-0 relative">
                <div className="w-full h-48 relative">
                    <Image
                        src={getItemImageUrl(item)}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                        <CardTitle className="text-lg font-bold text-shadow-md">{item.name}</CardTitle>
                        <div className="flex items-center text-xs text-amber-400 mt-1">
                            <MapPin size={14} className="mr-1" />
                            {getParkName(item.parkId)} {item.location && `- ${item.location}`}
                        </div>
                    </div>
                </div>
                <Badge className="absolute top-2 right-2 text-xs bg-amber-500 text-black" variant="default">
                    Score: {score.toFixed(2)}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap gap-2 text-xs">
                    {renderItemSpecificDetails()}
                </div>
                <p className="text-xs text-purple-300 italic flex items-start">
                    <Info size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                    <span>{descriptiveReason}</span>
                </p>
                {reasoning.length > 0 && source !== "popularity" && (
                    <details className="text-xs text-slate-400">
                        <summary className="cursor-pointer hover:text-slate-300">More details...</summary>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            {recommendation.reasoning.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </details>
                )}
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center bg-black/30">
                <div className="flex items-center text-xs">
                    {item.userRating && (
                        <>
                            <Star size={16} className="mr-1 text-yellow-400" />
                            <span>{item.userRating.average.toFixed(1)} ({item.userRating.count} ratings)</span>
                        </>
                    )}
                </div>
                <div className="flex gap-2">
                    {onAddToItinerary && (
                        <Button variant="default" size="sm" onClick={() => onAddToItinerary(item)} className="group">
                            <PlusCircle size={16} className="mr-2 transition-transform duration-300 group-hover:rotate-90" /> Add
                        </Button>
                    )}
                    {onNotInterested && (
                        <Button variant="destructive" size="sm" onClick={() => onNotInterested(item.id)} className="group">
                            <Ban size={16} className="mr-2 transition-transform duration-300 group-hover:scale-125" /> Hide
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}

/**
 * @component RecommendationCardSkeleton
 * @description Displays a skeleton loader for the RecommendationCard.
 */
export function RecommendationCardSkeleton() {
    return (
        <Card className="overflow-hidden shadow-lg bg-slate-800 border-slate-700 animate-pulse">
            <CardHeader className="p-0 relative">
                <div className="w-full h-48 bg-slate-700" />
                <div className="absolute bottom-0 left-0 p-4">
                    <div className="h-5 w-3/4 bg-slate-600 rounded mb-1"></div>
                    <div className="h-3 w-1/2 bg-slate-600 rounded"></div>
                </div>
                <div className="absolute top-2 right-2 h-5 w-16 bg-slate-600 rounded"></div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                    <div className="h-5 w-20 bg-slate-700 rounded"></div>
                    <div className="h-5 w-24 bg-slate-700 rounded"></div>
                    <div className="h-5 w-16 bg-slate-700 rounded"></div>
                </div>
                <div className="h-4 w-full bg-slate-700 rounded mt-1"></div>
                <div className="h-4 w-3/4 bg-slate-700 rounded"></div>
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center bg-slate-700/50">
                <div className="flex items-center">
                    <div className="h-5 w-24 bg-slate-600 rounded"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-9 w-20 bg-slate-600 rounded"></div>
                    <div className="h-9 w-20 bg-slate-600 rounded"></div>
                </div>
            </CardFooter>
        </Card>
    )
}