"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { MapPin, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { DisneySpringLocation, LocationCategory, LocationArea } from "@/types/disneysprings"

interface DisneySpringsCardProps {
    readonly location: DisneySpringLocation
}

export default function DisneySpringsCard({ location }: DisneySpringsCardProps) {
    const getCategoryColor = (category: LocationCategory) => {
        switch (category) {
            case LocationCategory.Shopping:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            case LocationCategory.Dining:
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            case LocationCategory.Entertainment:
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            case LocationCategory.Experience:
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300"
        }
    }

    const getAreaIcon = (area: LocationArea) => {
        switch (area) {
            case LocationArea.Marketplace:
                return "🛍️"
            case LocationArea.TheLanding:
                return "🛥️"
            case LocationArea.TownCenter:
                return "🏙️"
            case LocationArea.WestSide:
                return "🎭"
            default:
                return "📍"
        }
    }

    return (
        <Link href={`/disneysprings/${location.id}`} className="group">
            <Card className="overflow-hidden h-full border-gray-200 dark:border-gray-800 transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700">
                <div className="relative h-48 w-full">
                    <Image
                        src={location.imageUrl}
                        alt={location.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                    <Badge
                        className={cn(
                            "absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full",
                            getCategoryColor(location.category)
                        )}
                    >
                        {location.category}
                    </Badge>

                    {location.isNew && (
                        <Badge
                            className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        >
                            NEW!
                        </Badge>
                    )}

                    {location.isComingSoon && (
                        <Badge
                            className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                        >
                            Coming Soon
                        </Badge>
                    )}
                </div>

                <CardContent className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {location.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                        {location.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                            <span>{getAreaIcon(location.area)} {location.area}</span>
                        </div>

                        {location.hours && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                                <span>{location.hours}</span>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t border-gray-100 dark:border-gray-800">
                    <div className="w-full flex justify-between items-center">
                        {location.priceRange ? (
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {location.priceRange}
                            </div>
                        ) : (
                            <div></div>
                        )}

                        <div className="flex flex-wrap gap-1">
                            {location.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}