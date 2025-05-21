"use client"

import { useState, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ResortCategory, DiningCategory, TransportationType } from "@/types/resort"
import { resorts } from "@/lib/utils/resortData"
import { ChevronLeft, Star, Utensils, Car, WavesLadder, Hotel, Calendar, MapPin, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import ResortMap from "@/components/resorts/ResortMap"

interface ResortPageProps {
    params: Promise<{
        resortId: string
    }>
}

export default function ResortPage({ params }: ResortPageProps) {
    const { resortId } = use(params)
    const resort = resorts.find(r => r.id === resortId)
    const [activeTab, setActiveTab] = useState("overview")

    if (!resort) {
        notFound()
    }

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

    const getDiningCategoryColor = (category: DiningCategory) => {
        switch (category) {
            case DiningCategory.TableService:
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
            case DiningCategory.QuickService:
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            case DiningCategory.SnackShop:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            case DiningCategory.Lounge:
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            case DiningCategory.CharacterDining:
                return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
            case DiningCategory.Signature:
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300"
        }
    }

    const getTransportationIcon = (type: TransportationType) => {
        switch (type) {
            case TransportationType.Bus:
                return <Car className="h-5 w-5" />
            case TransportationType.Monorail:
                return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 15.5V5.5C4 4.4 4.9 3.5 6 3.5H18C19.1 3.5 20 4.4 20 5.5V15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 15.5H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 20.5L5 15.5H19L17 20.5H7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            case TransportationType.Boat:
                return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3V9L5 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 9L19 11.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 20C2 20 4.18 17 12 17C19.82 17 22 20 22 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            case TransportationType.Skyliner:
                return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 21V5C5 3.9 5.9 3 7 3H17C18.1 3 19 3.9 19 5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 21L18 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 10.5C9 9.4 9.9 8.5 11 8.5H13C14.1 8.5 15 9.4 15 10.5V21H9V10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            case TransportationType.Walking:
                return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" />
                    <path d="M14 8.857h2.857a1.143 1.143 0 0 1 1.143 1.143 1.143 1.143 0 0 1-1.143 1.143H14l-2.857 4.571-2.857-2.285v-4.57L14 8.857z" fill="currentColor" />
                    <path d="M10 19.143L7.143 24 5 22.714l3.429-5.714H8l-5.714 1.715L1.143 17.14 8 15.43l2.857 2.286-3.429 4.571" fill="currentColor" />
                </svg>
            default:
                return <Car className="h-5 w-5" />
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className="relative h-[60vh] w-full overflow-hidden">
                <Image
                    src={resort.imageUrls.main}
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
                    href="/resorts"
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
                                        {resort.longDescription}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Theming & Architecture</h3>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                        {resort.themingDetails}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Featured Experiences</h3>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {resort.featuredExperiences.map((experience, index) => (
                                            <li key={`experience-${resort.id}-${index}`} className="flex items-start">
                                                <Star className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300">{experience}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {resort.imageUrls.gallery.map((image, index) => (
                                            <CarouselItem key={`gallery-${resort.id}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                                                <div className="p-1 h-60">
                                                    <div className="relative h-full w-full overflow-hidden rounded-lg">
                                                        <Image
                                                            src={image}
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

                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resort Details</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Location</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{resort.address}</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{resort.location.area} Area</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Opening Date</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{resort.openingDate}</p>
                                                    {resort.lastRefurbished && (
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            Last refurbished: {resort.lastRefurbished}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Hotel className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Room Types</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{resort.roomTypes.length} available options</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Utensils className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Dining</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{resort.dining.length} dining locations</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <WavesLadder className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Recreation</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{resort.recreation.length} activities</p>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white mb-2">Contact Information</p>
                                                <p className="text-gray-600 dark:text-gray-400">{resort.phoneNumber}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pricing</h3>

                                        <div className="space-y-3">
                                            {resort.pricing.valueRange.low > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700 dark:text-gray-300">Value Season</span>
                                                    <span className="text-gray-900 dark:text-white font-semibold">${resort.pricing.valueRange.low} - ${resort.pricing.valueRange.high}</span>
                                                </div>
                                            )}

                                            {resort.pricing.moderateRange.low > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700 dark:text-gray-300">Regular Season</span>
                                                    <span className="text-gray-900 dark:text-white font-semibold">${resort.pricing.moderateRange.low} - ${resort.pricing.moderateRange.high}</span>
                                                </div>
                                            )}

                                            {resort.pricing.deluxeRange.low > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700 dark:text-gray-300">Peak Season</span>
                                                    <span className="text-gray-900 dark:text-white font-semibold">${resort.pricing.deluxeRange.low} - ${resort.pricing.deluxeRange.high}</span>
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                *Prices are per night and subject to change. Additional taxes and fees may apply.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {resort.specialConsiderations && resort.specialConsiderations.length > 0 && (
                                    <Card>
                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Special Considerations</h3>

                                            <ul className="space-y-2">
                                                {resort.specialConsiderations.map((consideration, index) => (
                                                    <li key={`consideration-${resort.id}-${index}`} className="flex items-start">
                                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 mt-1.5" />
                                                        <span className="text-gray-700 dark:text-gray-300">{consideration}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nearby Attractions</h3>

                                        <ul className="space-y-2">
                                            {resort.nearbyAttractions.map((attraction, index) => (
                                                <li key={`attraction-${resort.id}-${index}`} className="flex items-start">
                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-1.5" />
                                                    <span className="text-gray-700 dark:text-gray-300">{attraction}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {resort.roomTypes.map(room => (
                                        <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                            {resort.imageUrls.rooms[room.id] && resort.imageUrls.rooms[room.id].length > 0 && (
                                                <div className="relative h-48 w-full">
                                                    <Image
                                                        src={resort.imageUrls.rooms[room.id][0]}
                                                        alt={room.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}

                                            <CardContent className="p-6">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{room.name}</h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-4">{room.description}</p>

                                                <div className="space-y-4">
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

                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Beds</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{room.bedConfiguration}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Size</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{room.squareFeet} sq ft</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Views</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {room.views.map(view => (
                                                                <Badge key={view} variant="outline" className="text-xs">
                                                                    {view}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Room Amenities</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {room.amenities.slice(0, 4).map(amenity => (
                                                                <Badge key={amenity} variant="secondary" className="text-xs">
                                                                    {amenity}
                                                                </Badge>
                                                            ))}
                                                            {room.amenities.length > 4 && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    +{room.amenities.length - 4} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                            ${room.priceRange.low} - ${room.priceRange.high}
                                                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> /night</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="dining" className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dining Options</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {resort.dining.map(dining => (
                                    <Card key={dining.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        {resort.imageUrls.dining[dining.id] && resort.imageUrls.dining[dining.id].length > 0 && (
                                            <div className="relative h-48 w-full">
                                                <Image
                                                    src={resort.imageUrls.dining[dining.id][0]}
                                                    alt={dining.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Badge
                                                    className={cn(
                                                        "absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full",
                                                        getDiningCategoryColor(dining.category)
                                                    )}
                                                >
                                                    {dining.category}
                                                </Badge>
                                            </div>
                                        )}

                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{dining.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">{dining.description}</p>

                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{dining.hours}</p>
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Cuisine</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {dining.cuisine.map(type => (
                                                            <Badge key={type} variant="outline" className="text-xs">
                                                                {type}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white mr-2">Price Range:</p>
                                                        <div className="flex">
                                                            {Array.from({ length: dining.priceRange }).map((_, i) => (
                                                                <span key={`price-filled-${dining.id}-${i}`} className="text-amber-500">$</span>
                                                            ))}
                                                            {Array.from({ length: 4 - dining.priceRange }).map((_, i) => (
                                                                <span key={`price-empty-${dining.id}-${i}`} className="text-gray-300 dark:text-gray-700">$</span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {dining.requiresReservation && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Reservations Recommended
                                                        </Badge>
                                                    )}
                                                </div>

                                                {dining.diningPlans.length > 0 && (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Dining Plans Accepted</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {dining.diningPlans.map(plan => (
                                                                <Badge key={plan} variant="secondary" className="text-xs">
                                                                    {plan}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="recreation" className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recreation & Activities</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {resort.recreation.map(activity => (
                                    <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        {resort.imageUrls.amenities[activity.id] && resort.imageUrls.amenities[activity.id].length > 0 && (
                                            <div className="relative h-48 w-full">
                                                <Image
                                                    src={resort.imageUrls.amenities[activity.id][0]}
                                                    alt={activity.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}

                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{activity.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">{activity.description}</p>

                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.hours}</p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {activity.category}
                                                    </Badge>

                                                    {activity.additionalFee && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Additional Fee Required
                                                        </Badge>
                                                    )}

                                                    {activity.reservationRequired && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Reservation Required
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Resort Amenities</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {resort.amenities.map(amenity => (
                                    <Card key={amenity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        {resort.imageUrls.amenities[amenity.id] && resort.imageUrls.amenities[amenity.id].length > 0 && (
                                            <div className="relative h-48 w-full">
                                                <Image
                                                    src={resort.imageUrls.amenities[amenity.id][0]}
                                                    alt={amenity.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}

                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{amenity.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">{amenity.description}</p>

                                            <Badge variant="outline" className="text-xs">
                                                {amenity.category}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="transportation" className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transportation Options</h2>

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
                                                        {transport.frequency} • {transport.hours}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Destinations Served</p>
                                                <ul className="space-y-1">
                                                    {transport.destinationsServed.map((destination, idx) => (
                                                        <li key={`destination-${transport.type}-${idx}`} className="flex items-start">
                                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-1.5" />
                                                            <span className="text-gray-700 dark:text-gray-300">{destination}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Distance to Parks</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Object.entries(resort.location.distanceToParks).map(([park, distance]) => (
                                    <Card key={park} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6 text-center">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{park}</h4>
                                            <div className="flex items-baseline justify-center">
                                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{distance}</span>
                                                <span className="text-gray-600 dark:text-gray-400 ml-1">miles</span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Approximate travel time: {Math.round(distance * 3)} minutes</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}