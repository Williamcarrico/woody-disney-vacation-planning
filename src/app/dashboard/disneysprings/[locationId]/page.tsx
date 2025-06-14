"use client"

import { useDisneySpringsLocation } from "@/lib/utils/disneySpringsData"
import Image from "next/image"
import Link from "next/link"
import { DiningLocation, LocationCategory } from "@/types/disneysprings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Clock, Phone, Tag, ArrowLeft, Share2, Heart, Calendar, Star, Utensils, ShoppingBag, Ticket, Users, Award, Car } from "lucide-react"

interface DisneySpringsDetailPageProps {
    params: Promise<{
        locationId: string
    }>
}

export default function DisneySpringsDetailPage({ params }: DisneySpringsDetailPageProps) {
    const [locationId, setLocationId] = useState<string | null>(null)

    useEffect(() => {
        params.then((resolvedParams) => {
            setLocationId(resolvedParams.locationId)
        })
    }, [params])

    const { location, loading, error } = useDisneySpringsLocation(locationId || '')

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950">
                <div className="relative h-80 w-full bg-gray-200 dark:bg-gray-800">
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">
                        <Skeleton className="h-8 w-64" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-8">
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                            <div className="space-y-6">
                                <Skeleton className="h-64 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Failed to load location details: {error}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    // Not found
    if (!location) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Location Not Found
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            The location you're looking for doesn't exist or has been moved.
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/disneysprings">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Disney Springs
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
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
                    <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className="bg-blue-600 text-white">
                            {location.category}
                        </Badge>
                        {location.popular && (
                            <Badge className="bg-yellow-600 text-white">
                                <Star className="h-3 w-3 mr-1" />
                                Popular
                            </Badge>
                        )}
                        {location.isNew && (
                            <Badge className="bg-green-600 text-white">
                                NEW!
                            </Badge>
                        )}
                        {location.artisanal && (
                            <Badge className="bg-purple-600 text-white">
                                <Award className="h-3 w-3 mr-1" />
                                Artisan
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{location.name}</h1>
                    <p className="text-white/90 text-lg">{location.description}</p>
                    {location.signature && (
                        <p className="text-yellow-200 font-medium mt-2">
                            Signature: {location.signature}
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between mb-8">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/disneysprings" className="flex items-center gap-2">
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
                        {location.websiteUrl && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={location.websiteUrl} target="_blank" rel="noopener noreferrer">
                                    Visit Website
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        {/* Basic Information */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Location Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                {location.priceRange && (
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-purple-500" />
                                        <span className="text-gray-700 dark:text-gray-300">Price Range: {location.priceRange}</span>
                                    </div>
                                )}

                                {location.size && (
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-indigo-500" />
                                        <span className="text-gray-700 dark:text-gray-300">{location.size}</span>
                                    </div>
                                )}

                                {location.capacity && (
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-orange-500" />
                                        <span className="text-gray-700 dark:text-gray-300">{location.capacity}</span>
                                    </div>
                                )}

                                {location.chef && (
                                    <div className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-yellow-500" />
                                        <span className="text-gray-700 dark:text-gray-300">Chef: {location.chef}</span>
                                    </div>
                                )}

                                {location.ticketRequired && (
                                    <div className="flex items-center gap-2">
                                        <Ticket className="h-5 w-5 text-red-500" />
                                        <span className="text-gray-700 dark:text-gray-300">Tickets Required</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {location.tags && location.tags.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-medium mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {location.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Features */}
                        {location.features && location.features.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Features & Highlights</h2>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {location.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {/* Dining-specific information */}
                        {isDiningLocation && diningLocation && (
                            <>
                                {diningLocation.menu && diningLocation.menu.length > 0 && (
                                    <Card className="p-6">
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <Utensils className="h-5 w-5" />
                                            Featured Menu Items
                                        </h2>
                                        <div className="space-y-4">
                                            {diningLocation.menu.map((item, index) => (
                                                <div key={index} className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium">{item.name}</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                                    </div>
                                                    {item.price && (
                                                        <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}

                                {diningLocation.cuisine && diningLocation.cuisine.length > 0 && (
                                    <Card className="p-6">
                                        <h2 className="text-xl font-bold mb-4">Cuisine Types</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {diningLocation.cuisine.map(cuisine => (
                                                <Badge key={cuisine} variant="outline" className="text-sm">
                                                    {cuisine}
                                                </Badge>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </>
                        )}

                        {/* Specialties */}
                        {location.specialties && location.specialties.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Specialties</h2>
                                <ul className="list-disc pl-5 space-y-1">
                                    {location.specialties.map((specialty, index) => (
                                        <li key={index} className="text-gray-700 dark:text-gray-300">{specialty}</li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {/* Featured Items */}
                        {location.featuredItems && location.featuredItems.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Featured Items</h2>
                                <ul className="list-disc pl-5 space-y-1">
                                    {location.featuredItems.map((item, index) => (
                                        <li key={index} className="text-gray-700 dark:text-gray-300">{item}</li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Location Information */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Location Information</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                {location.name} is located in the {location.area} area of Disney Springs.
                            </p>
                            {location.atmosphere && (
                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                    <strong>Atmosphere:</strong> {location.atmosphere}
                                </p>
                            )}
                            {location.theme && (
                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                    <strong>Theme:</strong> {location.theme}
                                </p>
                            )}
                            <div className="aspect-video relative w-full rounded-md overflow-hidden">
                                <Image
                                    src="/images/disney-springs/disney-springs-map.jpg"
                                    alt="Disney Springs Map"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </Card>

                        {/* Good to Know */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Good to Know</h2>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">Disney Springs is open from 10:00 AM to 11:00 PM daily</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Car className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">Parking is complimentary at Disney Springs</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">No admission tickets required to visit Disney Springs</span>
                                </li>
                                {isDiningLocation && diningLocation?.familyFriendly && (
                                    <li className="flex items-start gap-2">
                                        <Users className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">Family-friendly environment</span>
                                    </li>
                                )}
                                {location.dietary && (
                                    <li className="flex items-start gap-2">
                                        <Utensils className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{location.dietary}</span>
                                    </li>
                                )}
                            </ul>
                        </Card>

                        {/* Services */}
                        {location.services && location.services.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Services</h2>
                                <ul className="space-y-2">
                                    {location.services.map((service, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{service}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}