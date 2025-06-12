import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
    ArrowLeft,
    Star,
    MapPin,
    Clock,
    Phone,
    Utensils,
    Users,
    Calendar,
    DollarSign,
    Heart,
    Share2,
    ExternalLink,
    Timer,
    CheckCircle,
    AlertCircle,
    Sparkles,
    ChefHat
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BlurFade } from "@/components/magicui/blur-fade"
import { MagicCard } from "@/components/magicui/magic-card"

import { getRestaurantById } from "@/lib/data/restaurants"
import {
    getRestaurantStatus,
    getEstimatedWaitTime,
    formatPriceRange,
    getReservationDifficulty,
    getNextOpeningTime
} from "@/lib/utils/restaurant"

interface RestaurantPageProps {
    params: Promise<{ restaurantId: string }>
}

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
    const { restaurantId } = await params
    const restaurant = getRestaurantById(restaurantId)

    if (!restaurant) {
        return {
            title: "Restaurant Not Found",
            description: "The requested restaurant could not be found."
        }
    }

    return {
        title: `${restaurant.name} | Disney Dining Guide`,
        description: restaurant.shortDescription || restaurant.description,
        keywords: [
            restaurant.name,
            ...restaurant.cuisineTypes,
            restaurant.location.areaName,
            "Disney dining",
            "Walt Disney World"
        ]
    }
}

export default async function RestaurantDetailPage({ params }: RestaurantPageProps) {
    const { restaurantId } = await params
    const restaurant = getRestaurantById(restaurantId)

    if (!restaurant) {
        notFound()
    }

    const status = getRestaurantStatus(restaurant)
    const waitTime = getEstimatedWaitTime(restaurant)
    const priceInfo = formatPriceRange(restaurant.priceRange)
    const reservationDifficulty = getReservationDifficulty(restaurant)
    const nextOpening = getNextOpeningTime(restaurant)

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    const getStatusIcon = () => {
        switch (status.status) {
            case 'open':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'closed':
                return <AlertCircle className="h-4 w-4 text-red-500" />
            case 'closing-soon':
                return <Timer className="h-4 w-4 text-orange-500" />
            case 'opening-soon':
                return <Clock className="h-4 w-4 text-blue-500" />
            default:
                return <Clock className="h-4 w-4 text-gray-500" />
        }
    }

    const getReservationBadge = () => {
        if (!restaurant.reservationInfo.acceptsReservations) {
            return <Badge variant="outline">Walk-up Only</Badge>
        }

        switch (reservationDifficulty) {
            case 'extremely-hard':
                return <Badge variant="destructive">Very Hard to Book</Badge>
            case 'hard':
                return <Badge className="bg-orange-500 hover:bg-orange-600">Hard to Book</Badge>
            case 'moderate':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Moderate</Badge>
            case 'easy':
                return <Badge variant="secondary">Easy to Book</Badge>
            default:
                return null
        }
    }

    return (
        <main className="container mx-auto py-8 px-4 md:px-6">
            {/* Back Navigation */}
            <BlurFade delay={0.1}>
                <div className="mb-6">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/dashboard/dining">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dining Guide
                        </Link>
                    </Button>
                </div>
            </BlurFade>

            {/* Hero Section */}
            <BlurFade delay={0.2}>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Image */}
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                        <Image
                            src={restaurant.imageUrl || "/images/restaurants/default-restaurant.webp"}
                            alt={restaurant.name}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                            {restaurant.isNew && (
                                <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
                            )}
                            {restaurant.isPopular && (
                                <Badge className="bg-orange-500 hover:bg-orange-600">Popular</Badge>
                            )}
                            {restaurant.characterDining?.hasCharacterDining && (
                                <Badge className="bg-purple-500 hover:bg-purple-600">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Character Dining
                                </Badge>
                            )}
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Heart className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                <MapPin className="h-4 w-4" />
                                <span>{restaurant.location.areaName}</span>
                                <Separator orientation="vertical" className="h-4" />
                                <Utensils className="h-4 w-4" />
                                <span>{restaurant.serviceType}</span>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {restaurant.shortDescription || restaurant.description}
                            </p>
                        </div>

                        {/* Quick Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <MagicCard className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    {getStatusIcon()}
                                    <span className="font-medium">Status</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{status.message}</p>
                                {nextOpening && !status.isOpen && (
                                    <p className="text-xs text-muted-foreground mt-1">Next: {nextOpening}</p>
                                )}
                            </MagicCard>

                            <MagicCard className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="font-medium">Price Range</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold ${priceInfo.color}`}>{priceInfo.symbol}</span>
                                    <span className="text-sm text-muted-foreground">{priceInfo.description}</span>
                                </div>
                            </MagicCard>

                            {restaurant.averageRating && (
                                <MagicCard className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <span className="font-medium">Rating</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold">{restaurant.averageRating.toFixed(1)}</span>
                                        <span className="text-sm text-muted-foreground">
                                            ({restaurant.reviewCount} reviews)
                                        </span>
                                    </div>
                                </MagicCard>
                            )}

                            {waitTime && (
                                <MagicCard className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Timer className="h-4 w-4" />
                                        <span className="font-medium">Wait Time</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">~{waitTime} minutes</p>
                                </MagicCard>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {restaurant.reservationInfo.reservationUrl && (
                                <Button asChild>
                                    <Link href={restaurant.reservationInfo.reservationUrl} target="_blank">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Make Reservation
                                        <ExternalLink className="h-3 w-3 ml-2" />
                                    </Link>
                                </Button>
                            )}
                            {restaurant.phoneNumber && (
                                <Button variant="outline" asChild>
                                    <Link href={`tel:${restaurant.phoneNumber}`}>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call Restaurant
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {/* Reservation Info */}
                        <div className="flex items-center gap-2">
                            {getReservationBadge()}
                            {restaurant.reservationInfo.advanceReservationDays && (
                                <Badge variant="outline">
                                    Book {restaurant.reservationInfo.advanceReservationDays} days ahead
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </BlurFade>

            {/* Detailed Information Tabs */}
            <BlurFade delay={0.3}>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="hours">Hours & Info</TabsTrigger>
                        <TabsTrigger value="menu">Menu</TabsTrigger>
                        <TabsTrigger value="character">Characters</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>About {restaurant.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="leading-relaxed">{restaurant.description}</p>
                            </CardContent>
                        </Card>

                        {/* Features & Amenities */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Features & Amenities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium mb-3">Cuisine Types</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {restaurant.cuisineTypes.map((cuisine) => (
                                                <Badge key={cuisine} variant="secondary">
                                                    {cuisine}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-3">Special Features</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {restaurant.specialFeatures.map((feature) => (
                                                <Badge key={feature} variant="outline">
                                                    {feature.replace(/_/g, ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dining Plan Info */}
                        {restaurant.diningPlanInfo.acceptsDiningPlan && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Utensils className="h-5 w-5" />
                                        Disney Dining Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Accepts Disney Dining Plans</span>
                                        </div>
                                        {restaurant.diningPlanInfo.tableServiceCredits && (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">
                                                    {restaurant.diningPlanInfo.tableServiceCredits} Table Service Credit{restaurant.diningPlanInfo.tableServiceCredits > 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                        )}
                                        {restaurant.diningPlanInfo.quickServiceCredits && (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">
                                                    {restaurant.diningPlanInfo.quickServiceCredits} Quick Service Credit{restaurant.diningPlanInfo.quickServiceCredits > 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                        )}
                                        {restaurant.diningPlanInfo.notes && (
                                            <p className="text-sm text-muted-foreground">
                                                {restaurant.diningPlanInfo.notes}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="hours" className="space-y-6 mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Operating Hours */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Operating Hours
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Day</TableHead>
                                                <TableHead>Hours</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {daysOfWeek.map((day) => (
                                                <TableRow key={day}>
                                                    <TableCell className="font-medium">{day}</TableCell>
                                                    <TableCell>
                                                        {restaurant.operatingHours[day] || 'Closed'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Reservation Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Reservations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        {restaurant.reservationInfo.acceptsReservations ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                        <span>
                                            {restaurant.reservationInfo.acceptsReservations
                                                ? 'Accepts Reservations'
                                                : 'Walk-up Only'
                                            }
                                        </span>
                                    </div>

                                    {restaurant.reservationInfo.reservationTips && (
                                        <div>
                                            <h4 className="font-medium mb-2">Reservation Tips</h4>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                {restaurant.reservationInfo.reservationTips.map((tip, index) => (
                                                    <li key={index}>• {tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {restaurant.reservationInfo.peakTimes && (
                                        <div>
                                            <h4 className="font-medium mb-2">Peak Times</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {restaurant.reservationInfo.peakTimes.map((time, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {time}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {restaurant.reservationInfo.bestTimesToVisit && (
                                        <div>
                                            <h4 className="font-medium mb-2">Best Times to Visit</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {restaurant.reservationInfo.bestTimesToVisit.map((time, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {time}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="menu" className="space-y-6 mt-6">
                        {restaurant.menu && restaurant.menu.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ChefHat className="h-5 w-5" />
                                        Menu Items
                                    </CardTitle>
                                    <CardDescription>
                                        Featured menu items and popular selections
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {restaurant.menu.map((item, index) => (
                                            <div key={index} className="border-b pb-4 last:border-b-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-medium">{item.name}</h4>
                                                        {item.isSignature && (
                                                            <Badge variant="secondary" className="text-xs mt-1">
                                                                Signature Item
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {item.price && (
                                                        <span className="font-medium text-lg">
                                                            ${item.price}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">Menu Information Not Available</h3>
                                    <p className="text-muted-foreground">
                                        Contact the restaurant directly for current menu and pricing information.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="character" className="space-y-6 mt-6">
                        {restaurant.characterDining?.hasCharacterDining ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-purple-500" />
                                        Character Dining Experience
                                    </CardTitle>
                                    <CardDescription>
                                        Meet your favorite Disney characters while you dine
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {restaurant.characterDining.characters && (
                                        <div>
                                            <h4 className="font-medium mb-3">Featured Characters</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {restaurant.characterDining.characters.map((character) => (
                                                    <Badge key={character} variant="secondary" className="text-sm">
                                                        {character}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {restaurant.characterDining.characterMeals && (
                                        <div>
                                            <h4 className="font-medium mb-3">Character Meal Times</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {restaurant.characterDining.characterMeals.map((meal) => (
                                                    <Badge key={meal} variant="outline">
                                                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {restaurant.characterDining.characterExperience && (
                                        <div>
                                            <h4 className="font-medium mb-2">Experience Details</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {restaurant.characterDining.characterExperience}
                                            </p>
                                        </div>
                                    )}

                                    {restaurant.characterDining.photoPackageIncluded && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">Photo package included</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">No Character Dining</h3>
                                    <p className="text-muted-foreground">
                                        This restaurant doesn&apos;t offer character dining experiences.
                                    </p>
                                    <Button variant="outline" className="mt-4" asChild>
                                        <Link href="/dashboard/dining?filter=character-dining">
                                            Find Character Dining Options
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </BlurFade>
        </main>
    )
}