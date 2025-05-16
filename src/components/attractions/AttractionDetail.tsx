"use client"

import Image from "next/image"
import { Attraction, AttractionType } from "@/types/attraction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Clock,
    Calendar,
    Users,
    Ruler,
    Accessibility,
    VolumeX,
    Volume2,
    Eye,
    Zap,
    MessageSquare,
    Heart,
    MapPin,
    BarChart,
    ChevronLeft
} from "lucide-react"

interface AttractionDetailProps {
    readonly attraction: Attraction
    readonly isOperating?: boolean
    readonly waitTime?: number
    readonly onAddToItinerary?: () => void
    readonly onBack?: () => void
}

export default function AttractionDetail({
    attraction,
    isOperating = true,
    waitTime,
    onAddToItinerary,
    onBack
}: AttractionDetailProps) {
    const formatAttractionTypes = () => {
        if (!attraction.attractionType || attraction.attractionType.length === 0) return null

        return (
            <div className="flex flex-wrap gap-2">
                {attraction.attractionType.map(type => (
                    <Badge key={type} variant="secondary">
                        {type}
                    </Badge>
                ))}
            </div>
        )
    }

    const formatRideCategories = () => {
        if (!attraction.rideCategory || attraction.rideCategory.length === 0) return null

        return (
            <div className="flex flex-wrap gap-2 mt-4">
                {attraction.rideCategory.map(category => (
                    <Badge key={category} variant="outline">
                        {category}
                    </Badge>
                ))}
            </div>
        )
    }

    const renderAccessibilitySection = () => {
        const { accessibilityInfo } = attraction

        return (
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Accessibility className="h-5 w-5" />
                    Accessibility Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                        <Badge variant={accessibilityInfo.wheelchairAccessible === "May Remain in Wheelchair/ECV" ? "default" : "outline"}>
                            Wheelchair Access: {accessibilityInfo.wheelchairAccessible}
                        </Badge>
                    </div>

                    <div className="flex items-start gap-2">
                        <Badge variant={accessibilityInfo.serviceAnimalsAllowed ? "default" : "outline"}>
                            {accessibilityInfo.serviceAnimalsAllowed ? "Service Animals Allowed" : "No Service Animals"}
                        </Badge>
                    </div>

                    {accessibilityInfo.hasAssistiveListening && (
                        <div className="flex items-start gap-2">
                            <Badge variant="default">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Assistive Listening
                            </Badge>
                        </div>
                    )}

                    {accessibilityInfo.hasClosedCaptioning && (
                        <div className="flex items-start gap-2">
                            <Badge variant="default">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Closed Captioning
                            </Badge>
                        </div>
                    )}

                    {accessibilityInfo.hasAudioDescription && (
                        <div className="flex items-start gap-2">
                            <Badge variant="default">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Audio Description
                            </Badge>
                        </div>
                    )}

                    {accessibilityInfo.hasReflectiveCaption && (
                        <div className="flex items-start gap-2">
                            <Badge variant="default">
                                <Eye className="h-3 w-3 mr-1" />
                                Reflective Captioning
                            </Badge>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderScheduleSection = () => {
        if (!attraction.schedule) return null

        return (
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule
                </h3>

                {attraction.schedule.openingTime && attraction.schedule.closingTime && (
                    <div className="flex items-center gap-2 text-sm mb-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Hours: {attraction.schedule.openingTime} - {attraction.schedule.closingTime}</span>
                    </div>
                )}

                {attraction.schedule.performanceTimes && attraction.schedule.performanceTimes.length > 0 && (
                    <div className="mt-2">
                        <h4 className="font-medium mb-2">Performance Times</h4>
                        <div className="flex flex-wrap gap-2">
                            {attraction.schedule.performanceTimes.map((time, index) => (
                                <Badge key={index} variant="outline">{time}</Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const getWaitTimeStatus = () => {
        if (!isOperating) {
            return (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-2 rounded-md mb-6 flex items-center">
                    <VolumeX className="h-5 w-5 mr-2" />
                    <span className="font-medium">This attraction is currently closed.</span>
                </div>
            )
        }

        if (waitTime !== undefined) {
            const waitTimeClass = waitTime <= 15
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                : waitTime <= 30
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    : waitTime <= 60
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"

            return (
                <div className={`${waitTimeClass} px-4 py-2 rounded-md mb-6 flex items-center`}>
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-medium">Current Wait Time: {waitTime} minutes</span>
                </div>
            )
        }

        return (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-md mb-6 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                <span className="font-medium">This attraction is currently operating.</span>
            </div>
        )
    }

    const isAnimalExperience = attraction.attractionType.includes(AttractionType.AnimalExperience)

    return (
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
            <div className="relative h-72 w-full">
                <Image
                    src={attraction.imageUrl}
                    alt={attraction.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <Badge className="mb-2 bg-blue-600/90 self-start">
                        {attraction.park}
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {attraction.name}
                    </h1>
                    {formatAttractionTypes()}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white"
                    onClick={onBack}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
            </div>

            <div className="p-6">
                {getWaitTimeStatus()}

                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-base">{attraction.description}</p>
                </div>

                {formatRideCategories()}

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {attraction.heightRequirement && (
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center text-center">
                                <Ruler className="h-8 w-8 text-primary mb-2" />
                                <h3 className="font-medium">Height Requirement</h3>
                                <p className="text-sm text-muted-foreground">
                                    {attraction.heightRequirement.minHeight ||
                                        `${attraction.heightRequirement.min} ${attraction.heightRequirement.unit}`}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {attraction.duration && (
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center text-center">
                                <Clock className="h-8 w-8 text-primary mb-2" />
                                <h3 className="font-medium">Duration</h3>
                                <p className="text-sm text-muted-foreground">{attraction.duration} minutes</p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Users className="h-8 w-8 text-primary mb-2" />
                            <h3 className="font-medium">Suitable For</h3>
                            <p className="text-sm text-muted-foreground">
                                {attraction.tags.includes("All Ages") ? "All Ages" :
                                    attraction.tags.includes("Kids") ? "Families with Kids" : "Thrill Seekers"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Separator className="my-8" />

                {renderAccessibilitySection()}

                {renderScheduleSection()}

                <div className="mt-8 flex flex-col md:flex-row gap-4 justify-end">
                    {isAnimalExperience && (
                        <Button variant="outline" className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Learn About Conservation
                        </Button>
                    )}

                    {attraction.location && (
                        <Button variant="outline" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            View on Map
                        </Button>
                    )}

                    <Button variant="outline" className="flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        View Wait Times
                    </Button>

                    <Button
                        onClick={onAddToItinerary}
                        disabled={!isOperating}
                        className="flex items-center gap-2"
                    >
                        <Zap className="h-4 w-4" />
                        Add to Itinerary
                    </Button>
                </div>
            </div>
        </div>
    )
}