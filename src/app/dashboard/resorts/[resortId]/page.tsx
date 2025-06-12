"use client"

import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Resort } from "@/types/unified-resort"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {
    MapPin,
    Car,
    Utensils,
    Waves,
    RefreshCw,
    AlertCircle,
    ChevronLeft,
    Hotel,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import ResortMap from "@/components/resorts/ResortMap"

interface ResortDetailResponse {
    resort: Resort
    metadata: {
        totalAmenities: number
        totalDining: number
        totalRecreation: number
        totalTransportation: number
        priceRange: { min: number; max: number }
        nearestParks: Array<{ park: string; distance: number }>
        lastUpdated: string
    }
    meta: {
        timestamp: string
        cached: boolean
        dataSource: 'firestore' | 'static' | 'hybrid'
    }
}

interface ApiResponse {
    success: boolean
    message?: string
    data: ResortDetailResponse
}

export default function ResortPage() {
    const params = useParams()
    const resortId = params?.resortId as string
    const [resort, setResort] = useState<Resort | null>(null)
    const [metadata, setMetadata] = useState<ResortDetailResponse['metadata'] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("overview")

    // Fetch resort data from API
    useEffect(() => {
        const fetchResort = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`/api/resorts/${resortId}`)

                if (response.status === 404) {
                    notFound()
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json() as ApiResponse

                if (!data.success) {
                    throw new Error(data.message || 'Failed to fetch resort')
                }

                setResort(data.data.resort)
                setMetadata(data.data.metadata)
            } catch (err) {
                console.error('Error fetching resort:', err)
                setError(err instanceof Error ? err.message : 'Failed to load resort')
            } finally {
                setIsLoading(false)
            }
        }

        if (resortId) {
            fetchResort()
        }
    }, [resortId])

    const retryFetch = () => {
        const fetchResort = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`/api/resorts/${resortId}`)

                if (response.status === 404) {
                    notFound()
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json() as ApiResponse

                if (!data.success) {
                    throw new Error(data.message || 'Failed to fetch resort')
                }

                setResort(data.data.resort)
                setMetadata(data.data.metadata)
            } catch (err) {
                console.error('Error fetching resort:', err)
                setError(err instanceof Error ? err.message : 'Failed to load resort')
            } finally {
                setIsLoading(false)
            }
        }

        fetchResort()
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
                <div className="flex items-center gap-3 text-lg">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Loading resort details...
                </div>
            </div>
        )
    }

    // Error state
    if (error || !resort) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <Alert className="max-w-md mx-auto">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {error || 'Resort not found'}
                            </AlertDescription>
                        </Alert>
                        <div className="flex gap-4 justify-center mt-4">
                            <Button onClick={retryFetch} className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </Button>
                            <Link href="/dashboard/resorts">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <ChevronLeft className="h-4 w-4" />
                                    Back to Resorts
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const getCategoryColor = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'value':
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            case 'moderate':
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            case 'deluxe':
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            case 'villa':
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
            case 'campground':
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300"
        }
    }

    const getDiningCategoryColor = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'table service':
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
            case 'quick service':
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            case 'snack bar':
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            case 'lounge':
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            case 'room service':
                return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300"
        }
    }

    const getTransportationIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'bus':
                return <Car className="h-5 w-5" />
            case 'monorail':
                return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 15.5V5.5C4 4.4 4.9 3.5 6 3.5H18C19.1 3.5 20 4.4 20 5.5V15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 15.5H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 20.5L5 15.5H19L17 20.5H7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            case 'boat':
                return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3V9L5 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 9L19 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 20C2 20 4.18 17 12 17C19.82 17 22 20 22 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            case 'disney skyliner':
            case 'skyliner':
                return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 21V5C5 3.9 5.9 3 7 3H17C18.1 3 19 3.9 19 5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 21L18 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 10.5C9 9.4 9.9 8.5 11 8.5H13C14.1 8.5 15 9.4 15 10.5V21H9V10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            case 'walking path':
            case 'walking':
                return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" />
                    <path d="M14 8.857h2.857a1.143 1.143 0 0 1 1.143 1.143 1.143 1.143 0 0 1-1.143 1.143H14l-2.857 4.571-2.857-2.285v-4.57L14 8.857z" fill="currentColor" />
                    <path d="M10 19.143L7.143 24 5 22.714l3.429-5.714H8l-5.714 1.715L1.143 17.14 8 15.43l2.857 2.286-3.429 4.571" fill="currentColor" />
                </svg>
            default:
                return <Car className="h-5 w-5" />
        }
    }

    // Safe fallback for missing image URLs
    const getImageUrl = (baseUrl?: string) => {
        return baseUrl || '/images/resorts/placeholder.jpg'
    }

    // Get resort address string from location object
    const getResortAddress = (resort: Resort): string => {
        if (resort.location?.address) {
            const addr = resort.location.address
            return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`
        }
        return "Walt Disney World Resort, Orlando, FL"
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className="relative h-[60vh] w-full overflow-hidden">
                <Image
                    src={getImageUrl(resort.imageUrl)}
                    alt={resort.name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <Badge
                        className={cn(
                            "px-3 py-1 text-xs font-semibold rounded-full mb-4",
                            getCategoryColor(resort.category)
                        )}
                    >
                        {resort.category}
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                        {resort.name}
                    </h1>
                    <p className="text-xl md:text-2xl text-white max-w-3xl drop-shadow-md">
                        {resort.description}
                    </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
                <Link
                    href="/dashboard/resorts"
                    className="absolute top-6 left-6 flex items-center px-4 py-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-sm text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-900 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back to Resorts
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-5 max-w-3xl mb-8">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="rooms">Rooms</TabsTrigger>
                        <TabsTrigger value="dining">Dining</TabsTrigger>
                        <TabsTrigger value="recreation">Recreation</TabsTrigger>
                        <TabsTrigger value="transportation">Transportation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About the Resort</h2>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                        {resort.longDescription || resort.description || 'No description available.'}
                                    </p>
                                </div>

                                {/* Gallery */}
                                {resort.galleryImages && resort.galleryImages.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resort Gallery</h3>
                                        <Carousel className="w-full">
                                            <CarouselContent>
                                                {resort.galleryImages.map((image: string, index: number) => (
                                                    <CarouselItem key={`gallery-${resort.id}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                                                        <div className="p-1 h-60">
                                                            <div className="relative h-full w-full overflow-hidden rounded-lg">
                                                                <Image
                                                                    src={getImageUrl(image)}
                                                                    alt={`${resort.name} - Gallery Image ${index + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious />
                                            <CarouselNext />
                                        </Carousel>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resort Details</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Location</p>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        {getResortAddress(resort)}
                                                    </p>
                                                    {resort.location?.area && (
                                                        <p className="text-gray-600 dark:text-gray-400">{resort.location.area}</p>
                                                    )}
                                                </div>
                                            </div>



                                            {resort.roomTypes && resort.roomTypes.length > 0 && (
                                                <div className="flex items-start">
                                                    <Hotel className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">Room Types</p>
                                                        <p className="text-gray-600 dark:text-gray-400">{resort.roomTypes.length} available options</p>
                                                    </div>
                                                </div>
                                            )}

                                            {metadata && (
                                                <>
                                                    <div className="flex items-start">
                                                        <Utensils className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">Dining</p>
                                                            <p className="text-gray-600 dark:text-gray-400">{metadata.totalDining} dining locations</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start">
                                                        <Waves className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">Amenities</p>
                                                            <p className="text-gray-600 dark:text-gray-400">{metadata.totalAmenities} amenities</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Price Range */}
                                {metadata?.priceRange && (metadata.priceRange.min > 0 || metadata.priceRange.max > 0) && (
                                    <Card>
                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pricing</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700 dark:text-gray-300">Price Range</span>
                                                    <span className="text-gray-900 dark:text-white font-semibold">
                                                        ${metadata.priceRange.min} - ${metadata.priceRange.max}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                    *Prices are per night and subject to change. Additional taxes and fees may apply.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Nearest Parks */}
                                {metadata?.nearestParks && metadata.nearestParks.length > 0 && (
                                    <Card>
                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nearby Parks</h3>
                                            <ul className="space-y-2">
                                                {metadata.nearestParks.map((park, index) => (
                                                    <li key={`park-${index}`} className="flex items-start justify-between">
                                                        <span className="text-gray-700 dark:text-gray-300">{park.park}</span>
                                                        <span className="text-gray-600 dark:text-gray-400">{park.distance} mi</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Resort Location</h3>
                            <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                                <ResortMap resorts={[resort]} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="rooms" className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-3">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Room Types</h2>

                                {resort.roomTypes && resort.roomTypes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {resort.roomTypes.map((room) => (
                                            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                                <CardContent className="p-6">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{room.name}</h3>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-4">{room.description}</p>

                                                    <div className="space-y-4">
                                                        {room.maxOccupancy && (
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Sleeps</p>
                                                                <div className="flex items-center">
                                                                    {Array.from({ length: room.maxOccupancy }).map((_, i) => (
                                                                        <svg key={`occupancy-${room.id}-${i}`} className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                                                                            <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" fill="currentColor" />
                                                                            <path d="M21 21v-1a8 8 0 0 0-8-8h-2a8 8 0 0 0-8 8v1" stroke="currentColor" strokeWidth="2" />
                                                                        </svg>
                                                                    ))}
                                                                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">({room.maxOccupancy})</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {room.squareFootage && (
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Size</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{room.squareFootage} sq ft</p>
                                                            </div>
                                                        )}

                                                        {room.bedConfiguration && (
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Bed Configuration</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{room.bedConfiguration}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600 dark:text-gray-400">No room information available.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="dining" className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dining Options</h2>

                            {resort.dining && resort.dining.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {resort.dining.map((dining) => (
                                        <Card key={dining.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{dining.name}</h3>
                                                    <Badge
                                                        className={cn(
                                                            "px-3 py-1 text-xs font-semibold rounded-full",
                                                            getDiningCategoryColor(dining.type)
                                                        )}
                                                    >
                                                        {dining.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 mb-4">{dining.description}</p>

                                                <div className="space-y-4">
                                                    {dining.cuisine && (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Cuisine</p>
                                                            <Badge variant="outline" className="text-xs">
                                                                {dining.cuisine}
                                                            </Badge>
                                                        </div>
                                                    )}

                                                    {dining.priceRange && (
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Price Range</p>
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {dining.priceRange}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 dark:text-gray-400">No dining information available.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="recreation" className="space-y-8">
                        {/* Amenities Section */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Amenities</h2>

                            {resort.amenities && resort.amenities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {resort.amenities.map((amenity) => (
                                        <Card key={amenity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                            <CardContent className="p-6">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{amenity.name}</h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-4">{amenity.description}</p>

                                                <div className="flex flex-wrap gap-2">
                                                    {amenity.category && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {amenity.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 dark:text-gray-400">No amenity information available.</p>
                                </div>
                            )}
                        </div>

                        {/* Recreation Section */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recreation Activities</h2>

                            {resort.recreation && resort.recreation.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {resort.recreation.map((recreation) => (
                                        <Card key={recreation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                            <CardContent className="p-6">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{recreation.name}</h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-4">{recreation.description}</p>

                                                <div className="space-y-2 mb-4">
                                                    {recreation.hours && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            <strong>Hours:</strong> {recreation.hours.open && recreation.hours.close
                                                                ? `${recreation.hours.open} - ${recreation.hours.close}`
                                                                : 'Check with resort'}
                                                            {recreation.hours.seasonal && ' (Seasonal)'}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {recreation.type && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {recreation.type}
                                                        </Badge>
                                                    )}

                                                    {recreation.additionalFees && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Additional Fee
                                                        </Badge>
                                                    )}

                                                    {recreation.reservationRequired && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Reservation Required
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 dark:text-gray-400">No recreation activities available.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="transportation" className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transportation Options</h2>

                            {resort.transportation && resort.transportation.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {resort.transportation.map((transport, index) => (
                                        <Card key={`transport-${transport.type}-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-center mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                                                        {getTransportationIcon(transport.type)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{transport.type}</h3>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            To: {transport.destination}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    {transport.frequency && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Frequency: {transport.frequency}
                                                        </p>
                                                    )}
                                                    {transport.operatingHours && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Hours: {transport.operatingHours.start} - {transport.operatingHours.end}
                                                            {transport.operatingHours.notes && ` (${transport.operatingHours.notes})`}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 dark:text-gray-400">No transportation information available.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}