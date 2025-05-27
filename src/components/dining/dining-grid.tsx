"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Grid3x3, List, Heart, TrendingUp, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import DiningFiltersComponent from "./dining-filters"
import RestaurantCard from "./restaurant-card"
import { DisneyRestaurant, DiningFilters } from "@/types/dining"
import { allRestaurants } from "@/lib/data/restaurants"
import { filterRestaurants, sortRestaurants } from "@/lib/utils/restaurant"

interface DiningGridProps {
    initialRestaurants?: DisneyRestaurant[]
    featuredRestaurants?: DisneyRestaurant[]
    className?: string
}

type SortOption = "name" | "rating" | "price-low" | "price-high" | "popular" | "newest"
type ViewMode = "grid" | "list"

const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "name", label: "Alphabetical" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" }
]

export default function DiningGrid({
    initialRestaurants = allRestaurants,
    featuredRestaurants = [],
    className = ""
}: DiningGridProps) {
    const [filters, setFilters] = useState<DiningFilters>({})
    const [sortBy, setSortBy] = useState<SortOption>("popular")
    const [viewMode, setViewMode] = useState<ViewMode>("grid")
    const [favorites, setFavorites] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(false)

    // Apply filters to restaurants using utility function
    const filteredRestaurants = useMemo(() => {
        return filterRestaurants(initialRestaurants, filters)
    }, [initialRestaurants, filters])

    // Sort restaurants using utility function
    const sortedRestaurants = useMemo(() => {
        return sortRestaurants(filteredRestaurants, sortBy)
    }, [filteredRestaurants, sortBy])

    // Handle favorite toggle
    const handleFavorite = useCallback((restaurant: DisneyRestaurant) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev)
            if (newFavorites.has(restaurant.id)) {
                newFavorites.delete(restaurant.id)
            } else {
                newFavorites.add(restaurant.id)
            }
            return newFavorites
        })
    }, [])

    // Get featured restaurants for display
    const displayFeaturedRestaurants = useMemo(() => {
        if (featuredRestaurants.length > 0) return featuredRestaurants
        return sortedRestaurants.filter(r => r.isPopular).slice(0, 3)
    }, [featuredRestaurants, sortedRestaurants])

    // Get cuisine stats for insights
    const cuisineStats = useMemo(() => {
        const stats: Record<string, number> = {}
        sortedRestaurants.forEach(restaurant => {
            restaurant.cuisineTypes.forEach(cuisine => {
                stats[cuisine] = (stats[cuisine] || 0) + 1
            })
        })
        return Object.entries(stats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
    }, [sortedRestaurants])

    // Get filter insights
    const filterInsights = useMemo(() => {
        const openNow = sortedRestaurants.filter(r => {
            try {
                const now = new Date()
                const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
                const hours = r.operatingHours[dayName]
                return hours && hours !== "Closed"
            } catch {
                return true
            }
        }).length

        const characterDining = sortedRestaurants.filter(r => r.characterDining?.hasCharacterDining).length
        const acceptsReservations = sortedRestaurants.filter(r => r.reservationInfo.acceptsReservations).length
        const acceptsDiningPlan = sortedRestaurants.filter(r => r.diningPlanInfo.acceptsDiningPlan).length

        return {
            openNow,
            characterDining,
            acceptsReservations,
            acceptsDiningPlan
        }
    }, [sortedRestaurants])

    // Loading simulation
    useEffect(() => {
        setIsLoading(true)
        const timer = setTimeout(() => setIsLoading(false), 300)
        return () => clearTimeout(timer)
    }, [filters, sortBy])

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Featured Restaurants Section */}
            {displayFeaturedRestaurants.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-bold">Featured Restaurants</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayFeaturedRestaurants.map((restaurant, index) => (
                            <motion.div
                                key={restaurant.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <RestaurantCard
                                    restaurant={restaurant}
                                    variant="featured"
                                    onFavorite={handleFavorite}
                                    isFavorite={favorites.has(restaurant.id)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Filters */}
            <DiningFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                resultCount={sortedRestaurants.length}
                isLoading={isLoading}
            />

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">View:</span>
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                        <TabsList className="grid grid-cols-2 w-[140px]">
                            <TabsTrigger value="grid" className="text-xs">
                                <Grid3x3 className="h-3 w-3 mr-1" />
                                Grid
                            </TabsTrigger>
                            <TabsTrigger value="list" className="text-xs">
                                <List className="h-3 w-3 mr-1" />
                                List
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Sort by:</span>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Insights Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cuisineStats.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Popular Cuisines</CardTitle>
                            <CardDescription>
                                Most common cuisine types in your current selection
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {cuisineStats.map(([cuisine, count]) => (
                                    <Badge key={cuisine} variant="secondary" className="text-xs">
                                        {cuisine} ({count})
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Quick Stats</CardTitle>
                        <CardDescription>
                            Key information about your current selection
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span>Open now:</span>
                                <Badge variant="secondary">{filterInsights.openNow}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Character dining:</span>
                                <Badge variant="secondary">{filterInsights.characterDining}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Take reservations:</span>
                                <Badge variant="secondary">{filterInsights.acceptsReservations}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Dining plan:</span>
                                <Badge variant="secondary">{filterInsights.acceptsDiningPlan}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`grid gap-6 ${viewMode === "grid"
                            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1"
                            }`}
                    >
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Card key={index} className="overflow-hidden">
                                <div className="aspect-[4/3] relative">
                                    <Skeleton className="w-full h-full" />
                                </div>
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-8 w-24" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </motion.div>
                ) : sortedRestaurants.length > 0 ? (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`grid gap-6 ${viewMode === "grid"
                            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1"
                            }`}
                    >
                        {sortedRestaurants.map((restaurant, index) => (
                            <motion.div
                                key={restaurant.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <RestaurantCard
                                    restaurant={restaurant}
                                    variant={viewMode}
                                    onFavorite={handleFavorite}
                                    isFavorite={favorites.has(restaurant.id)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12"
                    >
                        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Utensils className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
                        <p className="text-muted-foreground mb-4">
                            Try adjusting your filters or search criteria to find more restaurants.
                        </p>
                        <Button onClick={() => setFilters({})} variant="outline">
                            Clear All Filters
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Favorites Summary */}
            {favorites.size > 0 && (
                <Card className="border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            Your Favorites ({favorites.size})
                        </CardTitle>
                        <CardDescription>
                            Restaurants you&apos;ve saved for your Disney vacation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 flex-wrap">
                            {Array.from(favorites).slice(0, 5).map((favoriteId) => {
                                const restaurant = initialRestaurants.find(r => r.id === favoriteId)
                                return restaurant ? (
                                    <Badge key={favoriteId} variant="secondary" className="text-xs">
                                        {restaurant.name}
                                    </Badge>
                                ) : null
                            })}
                            {favorites.size > 5 && (
                                <Badge variant="outline" className="text-xs">
                                    +{favorites.size - 5} more
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}