import { Metadata } from "next"
import Link from "next/link"
import { Utensils, MapPin, Star, Clock, Users, DollarSign, Calendar, ChefHat, Award, Sparkles } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import DiningGrid from "@/components/dining/dining-grid"
import { BlurFade } from "@/components/magicui/blur-fade"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { MagicCard } from "@/components/magicui/magic-card"

import { allRestaurants, getPopularRestaurants, getCharacterDiningRestaurants } from "@/lib/data/restaurants"
import { ServiceType, DisneyLocation } from "@/types/dining"

export const metadata: Metadata = {
    title: "Disney Dining Guide | Walt Disney World Vacation Planning",
    description: "Discover the ultimate Disney dining experience with our comprehensive guide to 400+ restaurants across Walt Disney World. Find character dining, signature restaurants, quick service options, and make reservations with expert tips and recommendations.",
    keywords: ["Disney dining", "Walt Disney World restaurants", "character dining", "Disney reservations", "dining plans", "Disney food guide"]
}

// Simple NumberTicker component as fallback
function NumberTicker({ value, decimals = 0, className = "" }: { value: number; decimals?: number; className?: string }) {
    return <span className={className}>{decimals > 0 ? value.toFixed(decimals) : value}</span>
}

// Calculate dining statistics
const diningStats = {
    totalRestaurants: allRestaurants.length,
    characterDining: getCharacterDiningRestaurants().length,
    signatureRestaurants: allRestaurants.filter(r => r.serviceType === ServiceType.SIGNATURE_DINING || r.serviceType === ServiceType.FINE_DINING).length,
    quickService: allRestaurants.filter(r => r.serviceType === ServiceType.QUICK_SERVICE).length,
    diningPlanLocations: allRestaurants.filter(r => r.diningPlanInfo.acceptsDiningPlan).length,
    averageRating: Number((allRestaurants.reduce((sum, r) => sum + (r.averageRating || 0), 0) / allRestaurants.length).toFixed(1))
}

// Location statistics
const locationStats = {
    [DisneyLocation.MAGIC_KINGDOM]: allRestaurants.filter(r => r.location.parkId === DisneyLocation.MAGIC_KINGDOM).length,
    [DisneyLocation.EPCOT]: allRestaurants.filter(r => r.location.parkId === DisneyLocation.EPCOT).length,
    [DisneyLocation.HOLLYWOOD_STUDIOS]: allRestaurants.filter(r => r.location.parkId === DisneyLocation.HOLLYWOOD_STUDIOS).length,
    [DisneyLocation.ANIMAL_KINGDOM]: allRestaurants.filter(r => r.location.parkId === DisneyLocation.ANIMAL_KINGDOM).length,
    [DisneyLocation.DISNEY_SPRINGS]: allRestaurants.filter(r => r.location.parkId === DisneyLocation.DISNEY_SPRINGS).length,
    resorts: allRestaurants.filter(r => r.location.resortId).length
}

// Featured restaurants
const featuredRestaurants = getPopularRestaurants().slice(0, 3)

export default function DiningPage() {
    return (
        <main className="container mx-auto py-8 px-4 md:px-6 space-y-12">
            {/* Hero Section */}
            <BlurFade delay={0.1}>
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <div className="space-y-4">
                        <AnimatedGradientText className="text-5xl md:text-6xl font-bold">
                            🍽️ Disney Dining Guide
                        </AnimatedGradientText>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                            Discover magical dining experiences across Walt Disney World Resort with our comprehensive restaurant guide,
                            expert recommendations, and insider tips for the perfect Disney meal.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <NumberTicker value={diningStats.totalRestaurants} className="font-bold text-lg" />
                            <span className="text-muted-foreground">Restaurants</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-2">
                            <NumberTicker value={diningStats.characterDining} className="font-bold text-lg" />
                            <span className="text-muted-foreground">Character Dining</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <NumberTicker value={diningStats.averageRating} decimals={1} className="font-bold text-lg" />
                            <span className="text-muted-foreground">Avg Rating</span>
                        </div>
                    </div>
                </div>
            </BlurFade>

            {/* Quick Stats */}
            <BlurFade delay={0.2}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MagicCard className="p-4 text-center">
                        <div className="space-y-2">
                            <div className="flex items-center justify-center">
                                <ChefHat className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <NumberTicker value={diningStats.signatureRestaurants} className="text-2xl font-bold" />
                                <p className="text-xs text-muted-foreground">Signature Dining</p>
                            </div>
                        </div>
                    </MagicCard>
                    <MagicCard className="p-4 text-center">
                        <div className="space-y-2">
                            <div className="flex items-center justify-center">
                                <Clock className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="space-y-1">
                                <NumberTicker value={diningStats.quickService} className="text-2xl font-bold" />
                                <p className="text-xs text-muted-foreground">Quick Service</p>
                            </div>
                        </div>
                    </MagicCard>
                    <MagicCard className="p-4 text-center">
                        <div className="space-y-2">
                            <div className="flex items-center justify-center">
                                <Users className="h-8 w-8 text-purple-500" />
                            </div>
                            <div className="space-y-1">
                                <NumberTicker value={diningStats.characterDining} className="text-2xl font-bold" />
                                <p className="text-xs text-muted-foreground">Character Dining</p>
                            </div>
                        </div>
                    </MagicCard>
                    <MagicCard className="p-4 text-center">
                        <div className="space-y-2">
                            <div className="flex items-center justify-center">
                                <Utensils className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <NumberTicker value={diningStats.diningPlanLocations} className="text-2xl font-bold" />
                                <p className="text-xs text-muted-foreground">Dining Plan</p>
                            </div>
                        </div>
                    </MagicCard>
                </div>
            </BlurFade>

            {/* Navigation Cards */}
            <BlurFade delay={0.3}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-500" />
                                <CardTitle>Character Dining</CardTitle>
                            </div>
                            <CardDescription>
                                Magical meals with your favorite Disney characters
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-4">
                                Create unforgettable memories dining with Disney Princesses, Mickey Mouse, and beloved characters
                                from your favorite films while enjoying delicious cuisine.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Available locations:</span>
                                    <Badge variant="secondary">{diningStats.characterDining} restaurants</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Photo packages included</span>
                                    <Badge variant="outline">Select locations</Badge>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/dashboard/dining?filter=character-dining">
                                    <Users className="h-4 w-4 mr-2" />
                                    Explore Character Dining
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-amber-500" />
                                <CardTitle>Signature Dining</CardTitle>
                            </div>
                            <CardDescription>
                                Award-winning fine dining experiences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-4">
                                Indulge in world-class cuisine at Disney&apos;s most prestigious restaurants, featuring
                                renowned chefs, premium ingredients, and exceptional service.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Signature restaurants:</span>
                                    <Badge variant="secondary">{diningStats.signatureRestaurants} locations</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Dress code required</span>
                                    <Badge variant="outline">Business casual</Badge>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/dashboard/dining?filter=signature-dining">
                                    <Award className="h-4 w-4 mr-2" />
                                    View Signature Dining
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Utensils className="h-5 w-5 text-blue-500" />
                                <CardTitle>Disney Dining Plans</CardTitle>
                            </div>
                            <CardDescription>
                                Convenient prepaid dining options for your vacation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-4">
                                Add convenience and flexibility to your vacation with prepaid dining plans that work
                                at over 200 locations throughout Walt Disney World Resort.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Participating locations:</span>
                                    <Badge variant="secondary">{diningStats.diningPlanLocations} restaurants</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Plans available</span>
                                    <Badge variant="outline">Quick Service & Table Service</Badge>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/dashboard/dining/dining-plans">
                                    <Utensils className="h-4 w-4 mr-2" />
                                    Learn About Dining Plans
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </BlurFade>

            {/* Location Overview */}
            <BlurFade delay={0.4}>
                <section className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold">Dining by Location</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Explore dining options across all Walt Disney World theme parks, Disney Springs, and resort hotels
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Card className="text-center p-4">
                            <div className="space-y-2">
                                <MapPin className="h-8 w-8 mx-auto text-purple-500" />
                                <h3 className="font-semibold">Magic Kingdom</h3>
                                <NumberTicker value={locationStats[DisneyLocation.MAGIC_KINGDOM]} className="text-2xl font-bold" />
                                <p className="text-xs text-muted-foreground">restaurants</p>
                            </div>
                        </Card>
                        <Card className="text-center p-4">
                            <div className="space-y-2">
                                <MapPin className="h-8 w-8 mx-auto text-blue-500" />
                                <h3 className="font-semibold">EPCOT</h3>
                                <NumberTicker value={locationStats[DisneyLocation.EPCOT]} className="text-2xl font-bold" />
                                <p className="text-xs text-muted-foreground">restaurants</p>
                            </div>
                        </Card>
                        <Card className="text-center p-4">
                            <div className="space-y-2">
                                <MapPin className="h-8 w-8 mx-auto text-red-500" />
                                <h3 className="font-semibold">Hollywood Studios</h3>
                                <NumberTicker value={locationStats[DisneyLocation.HOLLYWOOD_STUDIOS]} className="text-2xl font-bold" />
                                <p className="text-xs text-muted-foreground">restaurants</p>
                            </div>
                        </Card>
                        <Card className="text-center p-4">
                            <div className="space-y-2">
                                <MapPin className="h-8 w-8 mx-auto text-green-500" />
                                <h3 className="font-semibold">Animal Kingdom</h3>
                                <NumberTicker value={locationStats[DisneyLocation.ANIMAL_KINGDOM]} className="text-2xl font-bold" />
                                <p className="text-xs text-muted-foreground">restaurants</p>
                            </div>
                        </Card>
                        <Card className="text-center p-4">
                            <div className="space-y-2">
                                <MapPin className="h-8 w-8 mx-auto text-orange-500" />
                                <h3 className="font-semibold">Disney Springs</h3>
                                <NumberTicker value={locationStats[DisneyLocation.DISNEY_SPRINGS]} className="text-2xl font-bold" />
                                <p className="text-xs text-muted-foreground">restaurants</p>
                            </div>
                        </Card>
                        <Card className="text-center p-4">
                            <div className="space-y-2">
                                <MapPin className="h-8 w-8 mx-auto text-teal-500" />
                                <h3 className="font-semibold">Resort Hotels</h3>
                                <NumberTicker value={locationStats.resorts} className="text-2xl font-bold" />
                                <p className="text-xs text-muted-foreground">restaurants</p>
                            </div>
                        </Card>
                    </div>
                </section>
            </BlurFade>

            {/* Expert Tips */}
            <BlurFade delay={0.5}>
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <CardTitle>Expert Dining Tips</CardTitle>
                        </div>
                        <CardDescription>
                            Insider secrets for the best Disney dining experience
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold mb-1">Make Reservations Early</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Book dining reservations exactly 60 days in advance at 6 AM EST. Popular restaurants like
                                            Be Our Guest and Cinderella&apos;s Royal Table fill up within minutes.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold mb-1">Strategic Meal Times</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Book breakfast or late dinner reservations for better availability. Off-peak dining times
                                            often provide better service and ambiance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <DollarSign className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold mb-1">Dining Plan Value</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Dining plans offer the best value for families who prefer table service restaurants and character dining.
                                            Quick service plans work great for on-the-go families.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold mb-1">Character Dining Strategy</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Character dining provides guaranteed character interactions and often includes photo packages.
                                            Perfect for families with young children.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </BlurFade>

            {/* Main Restaurant Grid */}
            <BlurFade delay={0.6}>
                <section className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold">Explore All Restaurants</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Browse our complete collection of Disney restaurants with advanced filtering,
                            detailed information, and personalized recommendations
                        </p>
                    </div>

                    <DiningGrid
                        initialRestaurants={allRestaurants}
                        featuredRestaurants={featuredRestaurants}
                    />
                </section>
            </BlurFade>
        </main>
    )
}