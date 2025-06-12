"use client"


import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, Clock, Users, Utensils, Heart, Share2, Calendar, AlertCircle, CheckCircle, Timer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { DisneyRestaurant } from "@/types/dining"
import { MagicCard } from "@/components/magicui/magic-card"
import {
    getRestaurantStatus,
    getEstimatedWaitTime,
    formatPriceRange,
    getReservationDifficulty
} from "@/lib/utils/restaurant"

interface RestaurantCardProps {
    restaurant: DisneyRestaurant
    variant?: "grid" | "list" | "featured"
    onFavorite?: (restaurant: DisneyRestaurant) => void
    isFavorite?: boolean
    className?: string
}

export default function RestaurantCard({
    restaurant,
    variant = "grid",
    onFavorite,
    isFavorite = false,
    className = ""
}: RestaurantCardProps) {


    const priceInfo = formatPriceRange(restaurant.priceRange)
    const restaurantStatus = getRestaurantStatus(restaurant)
    const waitTime = getEstimatedWaitTime(restaurant)
    const reservationDifficulty = getReservationDifficulty(restaurant)

    const getDiningPlanText = () => {
        if (!restaurant.diningPlanInfo.acceptsDiningPlan) return null

        const credits = restaurant.diningPlanInfo.tableServiceCredits || restaurant.diningPlanInfo.quickServiceCredits
        if (credits) {
            return `${credits} credit${credits > 1 ? 's' : ''}`
        }
        return "Accepts dining plan"
    }

    const getStatusBadge = () => {
        const { status } = restaurantStatus

        switch (status) {
            case 'open':
                return <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Open
                </Badge>
            case 'closed':
                return <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Closed
                </Badge>
            case 'closing-soon':
                return <Badge className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                    <Timer className="h-3 w-3 mr-1" />
                    Closing Soon
                </Badge>
            case 'opening-soon':
                return <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    <Clock className="h-3 w-3 mr-1" />
                    Opening Soon
                </Badge>
            default:
                return null
        }
    }

    const getReservationBadge = () => {
        if (!restaurant.reservationInfo.acceptsReservations) {
            return <Badge variant="outline" className="text-xs">Walk-up Only</Badge>
        }

        switch (reservationDifficulty) {
            case 'extremely-hard':
                return <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Very Hard to Book</Badge>
            case 'hard':
                return <Badge className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">Hard to Book</Badge>
            case 'moderate':
                return <Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Moderate</Badge>
            case 'easy':
                return <Badge variant="secondary" className="text-xs">Easy to Book</Badge>
            default:
                return null
        }
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
                            src={restaurant.imageUrl || "/images/restaurants/default-restaurant.webp"}
                            alt={restaurant.name}
                            fill
                            className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"

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
                                <div className="flex items-center gap-2 mb-2">
                                    {getStatusBadge()}
                                    {getReservationBadge()}
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
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <span className={`font-medium ${priceInfo.color}`}>
                                                {priceInfo.symbol}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{priceInfo.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                {waitTime && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Timer className="h-3 w-3" />
                                        <span>~{waitTime} min wait</span>
                                    </div>
                                )}
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
                        src={restaurant.imageUrl || "/images/restaurants/default-restaurant.webp"}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                        {restaurant.isNew && (
                            <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
                        )}
                        {restaurant.isPopular && (
                            <Badge className="bg-orange-500 hover:bg-orange-600">Popular</Badge>
                        )}
                        {restaurant.characterDining?.hasCharacterDining && (
                            <Badge className="bg-purple-500 hover:bg-purple-600">Character Dining</Badge>
                        )}
                        {getStatusBadge()}
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
                                    {priceInfo.symbol}
                                </span>
                                {waitTime && (
                                    <div className="flex items-center gap-1 text-xs">
                                        <Timer className="h-3 w-3" />
                                        <span>~{waitTime} min</span>
                                    </div>
                                )}
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
                        src={restaurant.imageUrl || "/images/restaurants/default-restaurant.webp"}
                        alt={restaurant.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                        {getStatusBadge()}
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
                        {waitTime && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Timer className="h-3 w-3" />
                                <span>~{waitTime} min</span>
                            </div>
                        )}
                    </div>

                    {/* Status Message */}
                    {restaurantStatus.message && (
                        <div className="text-xs text-muted-foreground">
                            {restaurantStatus.message}
                        </div>
                    )}
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
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <span className={`text-sm font-medium ${priceInfo.color}`}>
                                        {priceInfo.symbol}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{priceInfo.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
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