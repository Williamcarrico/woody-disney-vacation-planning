"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { resorts } from "@/lib/utils/resortData"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResortCategory, ResortArea } from "@/types/resort"
import ResortCategorySection from "@/components/resorts/ResortCategorySection"
import ResortHero from "@/components/resorts/ResortHero"
import ResortMap from "@/components/resorts/ResortMap"
import { BlurFade } from "@/components/ui/blur-fade"
import { Particles } from "@/components/ui/particles"
import {
    Search,
    Map,
    Grid3X3,
    BarChart3,
    DollarSign,
    Utensils,
    Building,
    Sparkles,
    Heart,
    SlidersHorizontal,
    RefreshCw
} from "lucide-react"

import { useTheme } from "next-themes"

// Enhanced interfaces for advanced features
interface FilterState {
    category: ResortCategory | "all"
    priceRange: [number, number]
    area: ResortArea | "all"
    amenities: string[]
    transportation: string[]
    sortBy: "name" | "price" | "rating" | "distance"
    sortOrder: "asc" | "desc"
}

interface ViewState {
    mode: "grid" | "list" | "map" | "comparison"
    showFilters: boolean
    showStats: boolean
    selectedResorts: string[]
}

export default function ResortsPage() {
    const { theme } = useTheme()
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Advanced filter state
    const [filters, setFilters] = useState<FilterState>({
        category: "all",
        priceRange: [0, 2000],
        area: "all",
        amenities: [],
        transportation: [],
        sortBy: "name",
        sortOrder: "asc"
    })

    // View state management
    const [viewState, setViewState] = useState<ViewState>({
        mode: "grid",
        showFilters: false,
        showStats: true,
        selectedResorts: []
    })

    // Memoized filtered and sorted resorts
    const filteredResorts = useMemo(() => {
        const filtered = resorts.filter(resort => {
            // Category filter
            const matchesCategory = filters.category === "all" || resort.category === filters.category

            // Search filter
            const matchesSearch = searchTerm === "" ||
                resort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resort.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resort.longDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resort.themingDetails.toLowerCase().includes(searchTerm.toLowerCase())

            // Area filter
            const matchesArea = filters.area === "all" || resort.location.area === filters.area

            // Price range filter
            const resortPrice = Math.max(
                resort.pricing.valueRange.low,
                resort.pricing.moderateRange.low,
                resort.pricing.deluxeRange.low
            )
            const matchesPrice = resortPrice >= filters.priceRange[0] && resortPrice <= filters.priceRange[1]

            // Amenities filter
            const matchesAmenities = filters.amenities.length === 0 ||
                filters.amenities.every(amenity =>
                    resort.amenities.some(resortAmenity =>
                        resortAmenity.name.toLowerCase().includes(amenity.toLowerCase())
                    )
                )

            // Transportation filter
            const matchesTransportation = filters.transportation.length === 0 ||
                filters.transportation.every(transport =>
                    resort.transportation.some(resortTransport =>
                        resortTransport.type.toLowerCase().includes(transport.toLowerCase())
                    )
                )

            return matchesCategory && matchesSearch && matchesArea && matchesPrice &&
                matchesAmenities && matchesTransportation
        })

        // Sort results
        filtered.sort((a, b) => {
            let comparison = 0

            switch (filters.sortBy) {
                case "name":
                    comparison = a.name.localeCompare(b.name)
                    break
                case "price":
                    const priceA = Math.max(a.pricing.valueRange.low, a.pricing.moderateRange.low, a.pricing.deluxeRange.low)
                    const priceB = Math.max(b.pricing.valueRange.low, b.pricing.moderateRange.low, b.pricing.deluxeRange.low)
                    comparison = priceA - priceB
                    break
                case "rating":
                    // Simulate rating based on amenities count and category
                    const ratingA = a.amenities.length + (a.category === ResortCategory.Deluxe ? 2 : 0)
                    const ratingB = b.amenities.length + (b.category === ResortCategory.Deluxe ? 2 : 0)
                    comparison = ratingB - ratingA
                    break
                case "distance":
                    const distanceA = a.location.distanceToParks["Magic Kingdom"] || 0
                    const distanceB = b.location.distanceToParks["Magic Kingdom"] || 0
                    comparison = distanceA - distanceB
                    break
            }

            return filters.sortOrder === "desc" ? -comparison : comparison
        })

        return filtered
    }, [searchTerm, filters])

    // Statistics calculations
    const stats = useMemo(() => {
        const totalResorts = filteredResorts.length
        const avgPrice = filteredResorts.reduce((sum, resort) => {
            const price = Math.max(
                resort.pricing.valueRange.low,
                resort.pricing.moderateRange.low,
                resort.pricing.deluxeRange.low
            )
            return sum + price
        }, 0) / totalResorts || 0

        const categoryDistribution = filteredResorts.reduce((acc, resort) => {
            acc[resort.category] = (acc[resort.category] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const totalAmenities = filteredResorts.reduce((sum, resort) => sum + resort.amenities.length, 0)
        const avgAmenities = totalAmenities / totalResorts || 0

        return {
            totalResorts,
            avgPrice: Math.round(avgPrice),
            categoryDistribution,
            avgAmenities: Math.round(avgAmenities * 10) / 10,
            totalDining: filteredResorts.reduce((sum, resort) => sum + resort.dining.length, 0)
        }
    }, [filteredResorts])

    // Categorized resorts
    const categorizedResorts = useMemo(() => ({
        value: filteredResorts.filter(resort => resort.category === ResortCategory.Value),
        moderate: filteredResorts.filter(resort => resort.category === ResortCategory.Moderate),
        deluxe: filteredResorts.filter(resort => resort.category === ResortCategory.Deluxe),
        deluxeVilla: filteredResorts.filter(resort => resort.category === ResortCategory.DeluxeVilla),
        campground: filteredResorts.filter(resort => resort.category === ResortCategory.Campground)
    }), [filteredResorts])

    // Handlers
    const handleFilterChange = useCallback((key: keyof FilterState, value: string | [number, number] | string[]) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }, [])

    const handleViewChange = useCallback((key: keyof ViewState, value: string | boolean | string[]) => {
        setViewState(prev => ({ ...prev, [key]: value }))
    }, [])

    const resetFilters = useCallback(() => {
        setFilters({
            category: "all",
            priceRange: [0, 2000],
            area: "all",
            amenities: [],
            transportation: [],
            sortBy: "name",
            sortOrder: "asc"
        })
        setSearchTerm("")
    }, [])

    // Simulate loading for smooth transitions
    useEffect(() => {
        setIsLoading(true)
        const timer = setTimeout(() => setIsLoading(false), 300)
        return () => clearTimeout(timer)
    }, [filters, searchTerm])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
            {/* Enhanced Hero Section with Particles */}
            <div className="relative">
                <ResortHero />
                <Particles
                    className="absolute inset-0 pointer-events-none"
                    quantity={50}
                    ease={80}
                    color={theme === "dark" ? "#ffffff" : "#000000"}
                    refresh
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header with Advanced Controls */}
                <BlurFade delay={0.1}>
                    <div className="flex flex-col gap-8 mb-12">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    Disney World Resorts
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    Discover magical accommodations for your perfect Disney vacation
                                </p>
                            </div>

                            {/* View Mode Controls */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border">
                                    {[
                                        { mode: "grid" as const, icon: Grid3X3, label: "Grid" },
                                        { mode: "map" as const, icon: Map, label: "Map" },
                                        { mode: "comparison" as const, icon: BarChart3, label: "Compare" }
                                    ].map(({ mode, icon: Icon, label }) => (
                                        <Button
                                            key={mode}
                                            variant={viewState.mode === mode ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => handleViewChange("mode", mode)}
                                            className="flex items-center gap-2"
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="hidden sm:inline">{label}</span>
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewChange("showFilters", !viewState.showFilters)}
                                    className="flex items-center gap-2"
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filters
                                </Button>
                            </div>
                        </div>

                        {/* Search and Quick Filters */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search resorts, amenities, or themes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-12 text-lg"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="price">Price</SelectItem>
                                        <SelectItem value="rating">Rating</SelectItem>
                                        <SelectItem value="distance">Distance</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
                                >
                                    {filters.sortOrder === "asc" ? "↑" : "↓"}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>
                </BlurFade>

                {/* Advanced Filters Panel */}
                <AnimatePresence>
                    {viewState.showFilters && (
                        <BlurFade delay={0.2}>
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8"
                            >
                                <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Category Filter */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Category</label>
                                            <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    {Object.values(ResortCategory).map(category => (
                                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Area Filter */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Resort Area</label>
                                            <Select value={filters.area} onValueChange={(value) => handleFilterChange("area", value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Areas</SelectItem>
                                                    {Object.values(ResortArea).map(area => (
                                                        <SelectItem key={area} value={area}>{area}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Price Range */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                                            </label>
                                            <Slider
                                                value={filters.priceRange}
                                                onValueChange={(value) => handleFilterChange("priceRange", value as [number, number])}
                                                max={2000}
                                                min={0}
                                                step={50}
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Quick Amenity Filters */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Quick Filters</label>
                                            <div className="flex flex-wrap gap-2">
                                                {["Pool", "Spa", "Fitness", "Dining"].map(amenity => (
                                                    <Badge
                                                        key={amenity}
                                                        variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            const newAmenities = filters.amenities.includes(amenity)
                                                                ? filters.amenities.filter(a => a !== amenity)
                                                                : [...filters.amenities, amenity]
                                                            handleFilterChange("amenities", newAmenities)
                                                        }}
                                                    >
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </BlurFade>
                    )}
                </AnimatePresence>

                {/* Statistics Dashboard */}
                <AnimatePresence>
                    {viewState.showStats && (
                        <BlurFade delay={0.3}>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                                <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                    <div className="flex items-center gap-3">
                                        <Building className="h-8 w-8" />
                                        <div>
                                            <p className="text-sm opacity-90">Total Resorts</p>
                                            <p className="text-2xl font-bold">{stats.totalResorts}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-8 w-8" />
                                        <div>
                                            <p className="text-sm opacity-90">Avg. Price</p>
                                            <p className="text-2xl font-bold">${stats.avgPrice}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="h-8 w-8" />
                                        <div>
                                            <p className="text-sm opacity-90">Avg. Amenities</p>
                                            <p className="text-2xl font-bold">{stats.avgAmenities}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                                    <div className="flex items-center gap-3">
                                        <Utensils className="h-8 w-8" />
                                        <div>
                                            <p className="text-sm opacity-90">Dining Options</p>
                                            <p className="text-2xl font-bold">{stats.totalDining}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                                    <div className="flex items-center gap-3">
                                        <Heart className="h-8 w-8" />
                                        <div>
                                            <p className="text-sm opacity-90">Favorites</p>
                                            <p className="text-2xl font-bold">0</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </BlurFade>
                    )}
                </AnimatePresence>

                {/* Loading State */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center py-12"
                        >
                            <div className="flex items-center gap-3 text-lg">
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                Loading resorts...
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    {!isLoading && (
                        <motion.div
                            key={viewState.mode}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {viewState.mode === "map" ? (
                                <BlurFade delay={0.4}>
                                    <ResortMap resorts={filteredResorts} />
                                </BlurFade>
                            ) : viewState.mode === "comparison" ? (
                                <BlurFade delay={0.4}>
                                    <div className="text-center py-12">
                                        <h3 className="text-2xl font-bold mb-4">Resort Comparison Tool</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                                            Select resorts from the grid view to compare features, pricing, and amenities
                                        </p>
                                        <Button onClick={() => handleViewChange("mode", "grid")}>
                                            Go to Grid View
                                        </Button>
                                    </div>
                                </BlurFade>
                            ) : (
                                <Tabs
                                    defaultValue="all"
                                    className="w-full"
                                    onValueChange={(value) => handleFilterChange("category", value as ResortCategory | "all")}
                                >
                                    <TabsList className="grid grid-cols-6 max-w-3xl mb-8 bg-white dark:bg-gray-800 shadow-sm">
                                        <TabsTrigger value="all" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                                            All ({filteredResorts.length})
                                        </TabsTrigger>
                                        <TabsTrigger value={ResortCategory.Value}>
                                            Value ({categorizedResorts.value.length})
                                        </TabsTrigger>
                                        <TabsTrigger value={ResortCategory.Moderate}>
                                            Moderate ({categorizedResorts.moderate.length})
                                        </TabsTrigger>
                                        <TabsTrigger value={ResortCategory.Deluxe}>
                                            Deluxe ({categorizedResorts.deluxe.length})
                                        </TabsTrigger>
                                        <TabsTrigger value={ResortCategory.DeluxeVilla}>
                                            Villas ({categorizedResorts.deluxeVilla.length})
                                        </TabsTrigger>
                                        <TabsTrigger value={ResortCategory.Campground}>
                                            Campground ({categorizedResorts.campground.length})
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="all" className="space-y-12">
                                        {categorizedResorts.value.length > 0 && (
                                            <BlurFade delay={0.1}>
                                                <ResortCategorySection
                                                    title="Value Resorts"
                                                    description="Immersive theming, playful experiences, and budget-friendly options for families"
                                                    resorts={categorizedResorts.value}
                                                />
                                            </BlurFade>
                                        )}

                                        {categorizedResorts.moderate.length > 0 && (
                                            <BlurFade delay={0.2}>
                                                <ResortCategorySection
                                                    title="Moderate Resorts"
                                                    description="Enchanting themes, enhanced amenities, and a perfect balance of comfort and value"
                                                    resorts={categorizedResorts.moderate}
                                                />
                                            </BlurFade>
                                        )}

                                        {categorizedResorts.deluxe.length > 0 && (
                                            <BlurFade delay={0.3}>
                                                <ResortCategorySection
                                                    title="Deluxe Resorts"
                                                    description="Premium accommodations, exceptional dining, and extraordinary service with signature Disney elegance"
                                                    resorts={categorizedResorts.deluxe}
                                                />
                                            </BlurFade>
                                        )}

                                        {categorizedResorts.deluxeVilla.length > 0 && (
                                            <BlurFade delay={0.4}>
                                                <ResortCategorySection
                                                    title="Deluxe Villas"
                                                    description="Spacious home-like accommodations with multiple bedrooms and full kitchens"
                                                    resorts={categorizedResorts.deluxeVilla}
                                                />
                                            </BlurFade>
                                        )}

                                        {categorizedResorts.campground.length > 0 && (
                                            <BlurFade delay={0.5}>
                                                <ResortCategorySection
                                                    title="Campgrounds"
                                                    description="Rustic charm with modern amenities in a natural setting"
                                                    resorts={categorizedResorts.campground}
                                                />
                                            </BlurFade>
                                        )}
                                    </TabsContent>

                                    <TabsContent value={ResortCategory.Value}>
                                        <BlurFade delay={0.1}>
                                            <ResortCategorySection
                                                title="Value Resorts"
                                                description="Immersive theming, playful experiences, and budget-friendly options for families"
                                                resorts={categorizedResorts.value}
                                            />
                                        </BlurFade>
                                    </TabsContent>

                                    <TabsContent value={ResortCategory.Moderate}>
                                        <BlurFade delay={0.1}>
                                            <ResortCategorySection
                                                title="Moderate Resorts"
                                                description="Enchanting themes, enhanced amenities, and a perfect balance of comfort and value"
                                                resorts={categorizedResorts.moderate}
                                            />
                                        </BlurFade>
                                    </TabsContent>

                                    <TabsContent value={ResortCategory.Deluxe}>
                                        <BlurFade delay={0.1}>
                                            <ResortCategorySection
                                                title="Deluxe Resorts"
                                                description="Premium accommodations, exceptional dining, and extraordinary service with signature Disney elegance"
                                                resorts={categorizedResorts.deluxe}
                                            />
                                        </BlurFade>
                                    </TabsContent>

                                    <TabsContent value={ResortCategory.DeluxeVilla}>
                                        <BlurFade delay={0.1}>
                                            <ResortCategorySection
                                                title="Deluxe Villas"
                                                description="Spacious home-like accommodations with multiple bedrooms and full kitchens"
                                                resorts={categorizedResorts.deluxeVilla}
                                            />
                                        </BlurFade>
                                    </TabsContent>

                                    <TabsContent value={ResortCategory.Campground}>
                                        <BlurFade delay={0.1}>
                                            <ResortCategorySection
                                                title="Campgrounds"
                                                description="Rustic charm with modern amenities in a natural setting"
                                                resorts={categorizedResorts.campground}
                                            />
                                        </BlurFade>
                                    </TabsContent>
                                </Tabs>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* No Results State */}
                {!isLoading && filteredResorts.length === 0 && (
                    <BlurFade delay={0.4}>
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Search className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">No resorts found</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Try adjusting your search criteria or filters to find more results
                            </p>
                            <Button onClick={resetFilters} className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Reset Filters
                            </Button>
                        </div>
                    </BlurFade>
                )}
            </div>
        </div>
    )
}