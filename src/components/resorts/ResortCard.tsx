"use client"

import Image from "next/image"
import Link from "next/link"
import { Resort } from "@/types/unified-resort"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { StarIcon, Utensils, Car } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResortCardProps {
    readonly resort: Resort
}

export default function ResortCard({ resort }: ResortCardProps) {
    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case "value":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            case "moderate":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            case "deluxe":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            case "villa":
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
            case "campground":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300"
        }
    }

    // Extract key features to highlight
    const primaryDining = resort.dining && resort.dining.length > 0 ? resort.dining[0] : null
    const primaryTransportation = resort.transportation && resort.transportation.length > 0 ? resort.transportation[0] : null

    const getPricingDisplay = () => {
        if (resort.pricing?.deluxeRange?.low && resort.pricing.deluxeRange.low > 0) {
            return <>${resort.pricing.deluxeRange.low}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/night</span></>
        } else if (resort.pricing?.moderateRange?.low && resort.pricing.moderateRange.low > 0) {
            return <>${resort.pricing.moderateRange.low}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/night</span></>
        } else if (resort.pricing?.valueRange?.low && resort.pricing.valueRange.low > 0) {
            return <>${resort.pricing.valueRange.low}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/night</span></>
        } else {
            return <>Call for pricing</>
        }
    }

    // Get the main image URL - handle both unified and legacy formats
    const getMainImageUrl = () => {
        if (resort.imageUrl) {
            return resort.imageUrl
        }
        // Fallback to a default image if none available
        return "/images/resorts/default-resort.jpg"
    }

    // Get resort area for display
    const getResortArea = () => {
        if (resort.location?.area) {
            return resort.location.area
        }
        return "Disney World"
    }

    return (
        <Link href={`/dashboard/resorts/${resort.id}`} className="group">
            <Card className="overflow-hidden h-full border-gray-200 dark:border-gray-800 transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700">
                <div className="relative h-60 w-full">
                    <Image
                        src={getMainImageUrl()}
                        alt={resort.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                            // Fallback to default image on error
                            const target = e.target as HTMLImageElement
                            target.src = "/images/resorts/default-resort.jpg"
                        }}
                    />
                    <Badge
                        className={cn(
                            "absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full",
                            getCategoryColor(resort.category)
                        )}
                    >
                        {resort.category}
                    </Badge>
                </div>

                <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {resort.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {resort.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                            <StarIcon className="h-4 w-4 text-amber-500" />
                            <span>{resort.roomTypes?.length || 0} Room Types</span>
                        </div>

                        {primaryDining && (
                            <div className="flex items-center gap-1.5">
                                <Utensils className="h-4 w-4 text-red-500" />
                                <span>{resort.dining?.length || 0} Dining Options</span>
                            </div>
                        )}

                        {primaryTransportation && (
                            <div className="flex items-center gap-1.5">
                                <Car className="h-4 w-4 text-blue-500" />
                                <span>{primaryTransportation.type}</span>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 border-t border-gray-100 dark:border-gray-800">
                    <div className="w-full flex justify-between items-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {getPricingDisplay()}
                        </div>

                        <Badge variant="outline" className="text-xs">
                            {getResortArea()}
                        </Badge>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}