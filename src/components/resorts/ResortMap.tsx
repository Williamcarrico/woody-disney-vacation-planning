"use client"

import { useEffect, useState } from 'react'
import { Resort, ResortCategory } from '@/types/resort'
import dynamic from 'next/dynamic'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Info } from 'lucide-react'
import L from 'leaflet'

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
    () => import('react-leaflet').then(mod => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then(mod => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then(mod => mod.Marker),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then(mod => mod.Popup),
    { ssr: false }
)

interface ResortMapProps {
    readonly resorts: Resort[]
}

export default function ResortMap({ resorts }: ResortMapProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [selectedResort, setSelectedResort] = useState<Resort | null>(null)

    useEffect(() => {
        // Only run on client side
        if (typeof window !== 'undefined') {
            // Import Leaflet CSS
            // This import is needed for the Leaflet styles
            // @ts-expect-error - CSS import module
            import('leaflet/dist/leaflet.css').catch(err => console.error('Could not import leaflet css', err))

            // Fix Leaflet icon issues
            // Solution based on: https://github.com/PaulLeCam/react-leaflet/issues/255
            // @ts-expect-error - Known workaround for Leaflet icon issues
            delete L.Icon.Default.prototype._getIconUrl

            // Define icon paths directly instead of using require()
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: '/icons/marker-icon-2x.png',
                iconUrl: '/icons/marker-icon.png',
                shadowUrl: '/icons/marker-shadow.png'
            })

            // Mark component as mounted
            setIsMounted(true)
        }

        return () => {
            setIsMounted(false)
        }
    }, [])

    // Get category color for styling

    const getCategoryColor = (category: ResortCategory) => {
        switch (category) {
            case ResortCategory.Value:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            case ResortCategory.Moderate:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            case ResortCategory.Deluxe:
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            case ResortCategory.DeluxeVilla:
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
            case ResortCategory.Campground:
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300"
        }
    }

    if (!isMounted) {
        return (
            <div className="flex justify-center items-center h-96 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
            </div>
        )
    }

    const disneyWorldCenter: [number, number] = [28.3852, -81.5639] // Disney World coordinates

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[800px]">
            <div className="w-full lg:w-2/3 h-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <MapContainer
                    center={disneyWorldCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {resorts.map(resort => {
                        if (typeof window !== 'undefined') {
                            const categoryColorMap = {
                                [ResortCategory.Value]: 'blue',
                                [ResortCategory.Moderate]: 'yellow',
                                [ResortCategory.Deluxe]: 'purple',
                                [ResortCategory.DeluxeVilla]: 'indigo',
                                [ResortCategory.Campground]: 'green'
                            }

                            const color = categoryColorMap[resort.category] || 'blue'

                            const icon = L.divIcon({
                                className: 'bg-transparent',
                                iconSize: [32, 32],
                                iconAnchor: [16, 32],
                                html: `
                  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-${color}-500 border-2 border-white shadow-lg text-white text-xs font-bold">
                    ${resort.category[0]}
                  </div>
                `
                            })

                            return (
                                <Marker
                                    key={resort.id}
                                    position={[resort.location.latitude, resort.location.longitude]}
                                    icon={icon}
                                    eventHandlers={{
                                        click: () => setSelectedResort(resort)
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold">{resort.name}</h3>
                                            <p className="text-sm">{resort.category}</p>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0 h-auto"
                                                onClick={() => setSelectedResort(resort)}
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        }

                        return null
                    })}
                </MapContainer>
            </div>

            <div className="w-full lg:w-1/3 h-full">
                <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-full flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Resort Locations
                    </h3>

                    {selectedResort ? (
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {selectedResort.name}
                                </h4>
                                <Badge
                                    className={cn(
                                        "px-3 py-1 text-xs font-semibold rounded-full",
                                        getCategoryColor(selectedResort.category)
                                    )}
                                >
                                    {selectedResort.category}
                                </Badge>
                            </div>

                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                {selectedResort.description}
                            </p>

                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                                <h5 className="font-bold text-gray-900 dark:text-white mb-2">Location</h5>
                                <p className="text-gray-700 dark:text-gray-300 mb-1">{selectedResort.address}</p>
                                <p className="text-gray-700 dark:text-gray-300">Area: {selectedResort.location.area}</p>
                            </div>

                            <div className="space-y-3">
                                <h5 className="font-bold text-gray-900 dark:text-white">Distance to Parks</h5>
                                {Object.entries(selectedResort.location.distanceToParks).map(([park, distance]) => (
                                    <div key={park} className="flex justify-between">
                                        <span className="text-gray-700 dark:text-gray-300">{park}</span>
                                        <span className="text-gray-900 dark:text-white font-medium">{distance} miles</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6">
                                <Link href={`/resorts/${selectedResort.id}`}>
                                    <Button className="w-full">
                                        View Resort Details
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <Info className="h-12 w-12 text-blue-500 mb-4" />
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Select a Resort
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Click on a marker on the map to view detailed information about that resort.
                            </p>
                        </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex flex-wrap gap-2">
                            {Object.values(ResortCategory).map(category => {
                                const categoryColorMap = {
                                    [ResortCategory.Value]: 'bg-blue-500',
                                    [ResortCategory.Moderate]: 'bg-yellow-500',
                                    [ResortCategory.Deluxe]: 'bg-purple-500',
                                    [ResortCategory.DeluxeVilla]: 'bg-indigo-500',
                                    [ResortCategory.Campground]: 'bg-green-500'
                                }

                                const colorClass = categoryColorMap[category] || 'bg-gray-500'

                                return (
                                    <div key={category} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                                        <span className="text-xs text-gray-700 dark:text-gray-300">{category}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}