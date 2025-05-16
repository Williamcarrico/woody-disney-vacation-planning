"use client"

import { useState } from "react"
import { DisneySpringLocation, LocationCategory } from "@/types/disneysprings"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { MapPin, ShoppingBag, Utensils, Ticket } from "lucide-react"

interface DisneySpringsMapProps {
    readonly locations: DisneySpringLocation[]
}

export default function DisneySpringsMap({ locations }: DisneySpringsMapProps) {
    const [selectedLocation, setSelectedLocation] = useState<DisneySpringLocation | null>(null)

    // In a real implementation, you would use actual latitude/longitude coordinates
    // and a proper mapping library like Mapbox or Google Maps
    // For now, we'll use a placeholder Disney Springs map

    const getCategoryIcon = (category: LocationCategory) => {
        switch (category) {
            case LocationCategory.Shopping:
                return <ShoppingBag className="h-5 w-5 text-blue-500" />
            case LocationCategory.Dining:
                return <Utensils className="h-5 w-5 text-green-500" />
            case LocationCategory.Entertainment:
                return <Ticket className="h-5 w-5 text-purple-500" />
            default:
                return <MapPin className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-md">
            <div className="relative w-full h-[500px]">
                <Image
                    src="/images/disney-springs/disney-springs-map.jpg"
                    alt="Disney Springs Map"
                    fill
                    className="object-cover"
                />

                {/* This would be replaced with actual map markers based on coordinates */}
                <div className="absolute inset-0 p-4">
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 rounded-lg max-w-sm">
                        <h3 className="text-lg font-bold mb-2">Disney Springs Interactive Map</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                            This is a placeholder for an interactive map. In a production version, this would display
                            the actual Disney Springs layout with interactive markers for each location.
                        </p>

                        <div className="space-y-2 max-h-[300px] overflow-auto">
                            {locations.map(location => (
                                <div
                                    key={location.id}
                                    className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setSelectedLocation(location)}
                                >
                                    {getCategoryIcon(location.category)}
                                    <span>{location.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {selectedLocation && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-start gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                            <Image
                                src={selectedLocation.imageUrl}
                                alt={selectedLocation.name}
                                fill
                                className="object-cover rounded-md"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 dark:text-white">{selectedLocation.name}</h3>
                                <Badge className="h-5">{selectedLocation.area}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{selectedLocation.description}</p>
                            {selectedLocation.hours && (
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    Hours: {selectedLocation.hours}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}