"use client"

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { disneySpringsLocations } from "@/lib/utils/disneySpringsData"
import { DiningLocation, LocationCategory } from "@/types/disneysprings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Clock, Phone, Tag, ArrowLeft, Share2, Heart, Calendar } from "lucide-react"

interface DisneySpringsDetailPageProps {
    params: {
        locationId: string
    }
}

export default function DisneySpringsDetailPage({ params }: DisneySpringsDetailPageProps) {
    const location = disneySpringsLocations.find(loc => loc.id === params.locationId)

    if (!location) {
        notFound()
    }

    const isDiningLocation = location.category === LocationCategory.Dining
    const diningLocation = isDiningLocation ? location as DiningLocation : null

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className="relative h-80 w-full bg-gray-200 dark:bg-gray-800">
                <Image
                    src={location.imageUrl}
                    alt={location.name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-6 max-w-3xl">
                    <Badge className="mb-2">
                        {location.category}
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{location.name}</h1>
                    <p className="text-white/90 text-lg">{location.description}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between mb-8">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/disneysprings" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Disney Springs
                        </Link>
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                        {isDiningLocation && diningLocation?.requiresReservation && (
                            <Button size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Make Reservation
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <Card className="p-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-500" />
                                    <span className="text-gray-700 dark:text-gray-300">{location.area}</span>
                                </div>

                                {location.hours && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-amber-500" />
                                        <span className="text-gray-700 dark:text-gray-300">{location.hours}</span>
                                    </div>
                                )}

                                {location.phoneNumber && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-5 w-5 text-green-500" />
                                        <span className="text-gray-700 dark:text-gray-300">{location.phoneNumber}</span>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 items-center">
                                    <Tag className="h-5 w-5 text-purple-500" />
                                    {location.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {isDiningLocation && diningLocation?.menu && diningLocation.menu.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Featured Menu Items</h2>
                                <div className="space-y-4">
                                    {diningLocation.menu.map((item) => (
                                        <div key={item.name} className="flex justify-between">
                                            <div>
                                                <h3 className="font-medium">{item.name}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                            </div>
                                            {item.price && (
                                                <span className="font-semibold">${item.price.toFixed(2)}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {isDiningLocation && diningLocation?.cuisine && (
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Cuisine</h2>
                                <div className="flex flex-wrap gap-2">
                                    {diningLocation.cuisine.map(cuisine => (
                                        <Badge key={cuisine} variant="outline">
                                            {cuisine}
                                        </Badge>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {location.featuredItems && location.featuredItems.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Featured Items</h2>
                                <ul className="list-disc pl-5 space-y-1">
                                    {location.featuredItems.map((item) => (
                                        <li key={item} className="text-gray-700 dark:text-gray-300">{item}</li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Location Information</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                {location.name} is located in the {location.area} area of Disney Springs.
                            </p>
                            <div className="aspect-video relative w-full rounded-md overflow-hidden">
                                <Image
                                    src="/images/disney-springs/disney-springs-map.jpg"
                                    alt="Disney Springs Map"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Good to Know</h2>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">Disney Springs is open from 10:00 AM to 11:00 PM daily</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">Parking is complimentary at Disney Springs</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">No admission tickets required to visit Disney Springs</span>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}