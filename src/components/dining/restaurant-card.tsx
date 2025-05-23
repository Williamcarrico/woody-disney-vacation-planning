"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, Clock, Phone, Users, Utensils, ExternalLink, Heart, Share2, DollarSign, Calendar, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

import { DisneyRestaurant, PriceRange } from "@/types/dining"
import { Shimmer } from "@/components/magicui/shimmer-button"
import { MagicCard } from "@/components/magicui/magic-card"

interface RestaurantCardProps {
    restaurant: DisneyRestaurant
    variant?: "grid" | "list" | "featured"
    showDetails?: boolean
    onFavorite?: (restaurant: DisneyRestaurant) => void
    isFavorite?: boolean
    className?: string
}

export default function RestaurantCard({
    restaurant,
    variant = "grid",
    showDetails = true,
    onFavorite,
    isFavorite = false,
    className = ""
}: RestaurantCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [showFullDescription, setShowFullDescription] = useState(false)

    const getPriceRangeColor = (priceRange: PriceRange) => {
        switch (priceRange) {
            case PriceRange.BUDGET:
                return "text-green-600 dark:text-green-400"
            case PriceRange.MODERATE:
                return "text-blue-600 dark:text-blue-400"
            case PriceRange.EXPENSIVE:
                return "text-orange-600 dark:text-orange-400"
            case PriceRange.LUXURY:
                return "text-purple-600 dark:text-purple-400"
            default:
                return "text-muted-foreground"
        }
    }

    const getDiningPlanText = () => {
        if (!restaurant.diningPlanInfo.acceptsDiningPlan) return null

        const credits = restaurant.diningPlanInfo.tableServiceCredits || restaurant.diningPlanInfo.quickServiceCredits
        if (credits) {
            return `${credits} credit${credits > 1 ? 's' : ''}`
        }
        return "Accepts dining plan"
    }

    const isOpen = () => {
        const now = new Date()
        const day = now.toLocaleLowerCase(undefined, { weekday: 'long' })
        const hours = restaurant.operatingHours[day]
        return hours && hours !== "Closed"
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-3 w-3 ${i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : i < rating
                        ? "fill-yellow-200 text-yellow-200"
                        : "text-gray-300"
                    }`}
            />
        ))
    }

    if (variant === "list") {
        return (
            <Card className={`hover:shadow-lg transition-all duration-300 ${className}`}>
                <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative md:w-48 md:h-32 w-full h-48 flex-shrink-0">
                        <Image
                            src={restaurant.imageUrl || "/images/restaurants/placeholder.jpg"}
                            alt={restaurant.name}
                            fill
                            className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                            onLoad={() => setImageLoaded(true)}
                        />
                        {restaurant.isNew && (
                            <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
                                New
                            </Badge>
                        )}
                        {restaurant.isPopular && (
                            <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600">
                                Popular
                            </Badge>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold text-lg leading-tight mb-1">
                                    {restaurant.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <MapPin className="h-3 w-3" />
                                    <span>{restaurant.location.areaName}</span>
                                    <Separator orientation="vertical" className="h-3" />
                                    <span className="flex items-center gap-1">
                                        <Utensils className="h-3 w-3" />
                                        {restaurant.serviceType}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onFavorite?.(restaurant)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Heart
                                        className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                                            }`}
                                    />
                                </Button>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {restaurant.shortDescription || restaurant.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                                {restaurant.averageRating && (
                                    <div className="flex items-center gap-1">
                                        {renderStars(restaurant.averageRating)}
                                        <span className="ml-1 font-medium">{restaurant.averageRating}</span>
                                        <span className="text-muted-foreground">
                                            ({restaurant.reviewCount})
                                        </span>
                                    </div>
                                )}
                                <span className={`font-medium ${getPriceRangeColor(restaurant.priceRange)}`}>
                                    {restaurant.priceRange}
                                </span>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/dashboard/dining/${restaurant.id}`}>
                                    View Details
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    if (variant === "featured") {
        return (
            <MagicCard className={`relative overflow-hidden ${className}`}>
                <div className="relative h-80 w-full">
                    <Image
                        src={restaurant.imageUrl || "/images/restaurants/placeholder.jpg"}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                        onLoad={() => setImageLoaded(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        {restaurant.isNew && (
                            <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
                        )}
                        {restaurant.isPopular && (
                            <Badge className="bg-orange-500 hover:bg-orange-600">Popular</Badge>
                        )}
                        {restaurant.characterDining?.hasCharacterDining && (
                            <Badge className="bg-purple-500 hover:bg-purple-600">Character Dining</Badge>
                        )}
                    </div>

                    {/* Favorite Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFavorite?.(restaurant)}
                        className="absolute top-4 right-4 h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40"
                    >
                        <Heart
                            className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"
                                }`}
                        />
                    </Button>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="font-bold text-xl mb-2">{restaurant.name}</h3>
                        <div className="flex items-center gap-2 text-sm mb-3">
                            <MapPin className="h-4 w-4" />
                            <span>{restaurant.location.areaName}</span>
                            <Separator orientation="vertical" className="h-4 bg-white/30" />
                            <span>{restaurant.serviceType}</span>
                        </div>
                        <p className="text-sm text-white/90 mb-4 line-clamp-2">
                            {restaurant.shortDescription || restaurant.description}
                        </p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {restaurant.averageRating && (
                                    <div className="flex items-center gap-1">
                                        {renderStars(restaurant.averageRating)}
                                        <span className="ml-1 font-medium">{restaurant.averageRating}</span>
                                    </div>
                                )}
                                <span className="font-medium text-yellow-400">
                                    {restaurant.priceRange}
                                </span>
                            </div>
                            <Button asChild variant="secondary" size="sm">
                                <Link href={`/dashboard/dining/${restaurant.id}`}>
                                    Explore
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </MagicCard>
        )
    }

    // Default grid variant
    return (
        <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}>
            <CardHeader className="p-0">
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={restaurant.imageUrl || "/images/restaurants/placeholder.jpg"}
                        alt={restaurant.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onLoad={() => setImageLoaded(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {restaurant.isNew && (
                            <Badge className="text-xs bg-green-500 hover:bg-green-600">New</Badge>
                        )}
                        {restaurant.isPopular && (
                            <Badge className="text-xs bg-orange-500 hover:bg-orange-600">Popular</Badge>
                        )}
                        {!isOpen() && (
                            <Badge variant="destructive" className="text-xs">Closed</Badge>
                        )}
                    </div>

                    {/* Favorite Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFavorite?.(restaurant)}
                        className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <Heart
                            className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
                                }`}
                        />
                    </Button>

                    {/* Quick Actions Overlay */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-1">
                            {restaurant.reservationInfo.reservationUrl && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="secondary" size="sm" className="h-8 w-8 p-0" asChild>
                                                <Link href={restaurant.reservationInfo.reservationUrl} target="_blank">
                                                    <Calendar className="h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Make Reservation</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                                            <Share2 className="h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Share Restaurant</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div>
                        <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                            {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{restaurant.location.areaName}</span>
                            <Separator orientation="vertical" className="h-3" />
                            <span className="flex items-center gap-1">
                                <Utensils className="h-3 w-3" />
                                {restaurant.serviceType}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {restaurant.shortDescription || restaurant.description}
                    </p>

                    {/* Cuisine Tags */}
                    <div className="flex flex-wrap gap-1">
                        {restaurant.cuisineTypes.slice(0, 2).map((cuisine) => (
                            <Badge key={cuisine} variant="secondary" className="text-xs">
                                {cuisine}
                            </Badge>
                        ))}
                        {restaurant.cuisineTypes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{restaurant.cuisineTypes.length - 2} more
                            </Badge>
                        )}
                    </div>

                    {/* Character Dining */}
                    {restaurant.characterDining?.hasCharacterDining && (
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-3 w-3 text-purple-500" />
                            <span className="text-purple-600 dark:text-purple-400 font-medium">
                                Character Dining
                            </span>
                            {restaurant.characterDining.characters && (
                                <span className="text-muted-foreground">
                                    ({restaurant.characterDining.characters.slice(0, 2).join(", ")}
                                    {restaurant.characterDining.characters.length > 2 && " +"})
                                </span>
                            )}
                        </div>
                    )}

                    {/* Features */}
                    <div className="flex items-center gap-4 text-xs">
                        {restaurant.diningPlanInfo.acceptsDiningPlan && (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <Utensils className="h-3 w-3" />
                                <span>{getDiningPlanText()}</span>
                            </div>
                        )}
                        {restaurant.reservationInfo.acceptsReservations && (
                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <Clock className="h-3 w-3" />
                                <span>Reservations</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <div className="flex items-center justify-between w-full">
                    {/* Rating and Price */}
                    <div className="flex items-center gap-3">
                        {restaurant.averageRating && (
                            <div className="flex items-center gap-1">
                                {renderStars(restaurant.averageRating)}
                                <span className="ml-1 text-sm font-medium">{restaurant.averageRating}</span>
                                <span className="text-xs text-muted-foreground">
                                    ({restaurant.reviewCount})
                                </span>
                            </div>
                        )}
                        <span className={`text-sm font-medium ${getPriceRangeColor(restaurant.priceRange)}`}>
                            {restaurant.priceRange}
                        </span>
                    </div>

                    {/* Action Button */}
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/dining/${restaurant.id}`}>
                            View Details
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}