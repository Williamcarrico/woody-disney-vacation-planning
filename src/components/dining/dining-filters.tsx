"use client"

import { useState, useCallback, useMemo } from "react"
import { Search, Filter, X, Star, Users, Clock, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

import {
    DiningFilters,
    CuisineType,
    ServiceType,
    DiningExperience,
    PriceRange,
    SpecialFeature,
    DisneyLocation
} from "@/types/dining"

interface DiningFiltersComponentProps {
    filters: DiningFilters
    onFiltersChange: (filters: DiningFilters) => void
    resultCount: number
    isLoading?: boolean
}

const locationOptions = [
    { value: DisneyLocation.MAGIC_KINGDOM, label: "Magic Kingdom" },
    { value: DisneyLocation.EPCOT, label: "EPCOT" },
    { value: DisneyLocation.HOLLYWOOD_STUDIOS, label: "Hollywood Studios" },
    { value: DisneyLocation.ANIMAL_KINGDOM, label: "Animal Kingdom" },
    { value: DisneyLocation.DISNEY_SPRINGS, label: "Disney Springs" },
    { value: DisneyLocation.BOARDWALK, label: "BoardWalk" },
    { value: DisneyLocation.GRAND_FLORIDIAN, label: "Grand Floridian" },
    { value: DisneyLocation.POLYNESIAN, label: "Polynesian Village" },
    { value: DisneyLocation.CONTEMPORARY, label: "Contemporary" },
    { value: DisneyLocation.WILDERNESS_LODGE, label: "Wilderness Lodge" }
]

const cuisineOptions = Object.values(CuisineType).map(cuisine => ({
    value: cuisine,
    label: cuisine
}))

const serviceTypeOptions = Object.values(ServiceType).map(service => ({
    value: service,
    label: service
}))

const diningExperienceOptions = Object.values(DiningExperience).map(experience => ({
    value: experience,
    label: experience
}))

const priceRangeOptions = [
    { value: PriceRange.BUDGET, label: "$ (Under $15)", description: "Budget-friendly options" },
    { value: PriceRange.MODERATE, label: "$$ ($15-35)", description: "Moderate pricing" },
    { value: PriceRange.EXPENSIVE, label: "$$$ ($36-60)", description: "Premium dining" },
    { value: PriceRange.LUXURY, label: "$$$$ ($60+)", description: "Luxury dining" }
]

const specialFeatureOptions = Object.values(SpecialFeature).map(feature => ({
    value: feature,
    label: feature
}))

export default function DiningFiltersComponent({
    filters,
    onFiltersChange,
    resultCount,
    isLoading = false
}: DiningFiltersComponentProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "")

    // Handle search with debouncing
    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value)
        onFiltersChange({ ...filters, searchQuery: value || undefined })
    }, [filters, onFiltersChange])

    // Handle individual filter changes
    const handleLocationChange = useCallback((locations: string[]) => {
        onFiltersChange({ ...filters, parkIds: locations.length ? locations : undefined })
    }, [filters, onFiltersChange])

    const handleCuisineChange = useCallback((cuisines: CuisineType[]) => {
        onFiltersChange({ ...filters, cuisineTypes: cuisines.length ? cuisines : undefined })
    }, [filters, onFiltersChange])

    const handleServiceTypeChange = useCallback((services: ServiceType[]) => {
        onFiltersChange({ ...filters, serviceTypes: services.length ? services : undefined })
    }, [filters, onFiltersChange])

    const handleDiningExperienceChange = useCallback((experiences: DiningExperience[]) => {
        onFiltersChange({ ...filters, diningExperiences: experiences.length ? experiences : undefined })
    }, [filters, onFiltersChange])

    const handlePriceRangeChange = useCallback((prices: PriceRange[]) => {
        onFiltersChange({ ...filters, priceRanges: prices.length ? prices : undefined })
    }, [filters, onFiltersChange])

    const handleSpecialFeatureChange = useCallback((features: SpecialFeature[]) => {
        onFiltersChange({ ...filters, specialFeatures: features.length ? features : undefined })
    }, [filters, onFiltersChange])

    const handleRatingChange = useCallback((rating: number[]) => {
        onFiltersChange({ ...filters, rating: rating[0] > 0 ? rating[0] : undefined })
    }, [filters, onFiltersChange])

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setSearchQuery("")
        onFiltersChange({})
    }, [onFiltersChange])

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0
        if (filters.searchQuery) count++
        if (filters.parkIds?.length) count++
        if (filters.cuisineTypes?.length) count++
        if (filters.serviceTypes?.length) count++
        if (filters.diningExperiences?.length) count++
        if (filters.priceRanges?.length) count++
        if (filters.specialFeatures?.length) count++
        if (filters.hasCharacterDining) count++
        if (filters.acceptsDiningPlan) count++
        if (filters.acceptsReservations) count++
        if (filters.openNow) count++
        if (filters.rating) count++
        return count
    }, [filters])

    // Generate filter summary badges
    const getFilterBadges = useMemo(() => {
        const badges: { label: string; onRemove: () => void }[] = []

        if (filters.parkIds?.length) {
            filters.parkIds.forEach(parkId => {
                const location = locationOptions.find(l => l.value === parkId)
                if (location) {
                    badges.push({
                        label: location.label,
                        onRemove: () => handleLocationChange(filters.parkIds!.filter(id => id !== parkId))
                    })
                }
            })
        }

        if (filters.cuisineTypes?.length) {
            filters.cuisineTypes.forEach(cuisine => {
                badges.push({
                    label: cuisine,
                    onRemove: () => handleCuisineChange(filters.cuisineTypes!.filter(c => c !== cuisine))
                })
            })
        }

        if (filters.serviceTypes?.length) {
            filters.serviceTypes.forEach(service => {
                badges.push({
                    label: service,
                    onRemove: () => handleServiceTypeChange(filters.serviceTypes!.filter(s => s !== service))
                })
            })
        }

        if (filters.priceRanges?.length) {
            filters.priceRanges.forEach(price => {
                const priceOption = priceRangeOptions.find(p => p.value === price)
                if (priceOption) {
                    badges.push({
                        label: priceOption.label,
                        onRemove: () => handlePriceRangeChange(filters.priceRanges!.filter(p => p !== price))
                    })
                }
            })
        }

        return badges
    }, [filters, handleLocationChange, handleCuisineChange, handleServiceTypeChange, handlePriceRangeChange])

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search restaurants, cuisines, or experiences..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 pr-4 py-2 text-base"
                />
            </div>

            {/* Quick Filters and Filter Sheet */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Quick Filter Buttons */}
                <Button
                    variant={filters.hasCharacterDining ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, hasCharacterDining: !filters.hasCharacterDining })}
                    className="h-8"
                >
                    <Users className="h-3 w-3 mr-1" />
                    Character Dining
                </Button>

                <Button
                    variant={filters.acceptsDiningPlan ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, acceptsDiningPlan: !filters.acceptsDiningPlan })}
                    className="h-8"
                >
                    <Utensils className="h-3 w-3 mr-1" />
                    Dining Plan
                </Button>

                <Button
                    variant={filters.acceptsReservations ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, acceptsReservations: !filters.acceptsReservations })}
                    className="h-8"
                >
                    <Clock className="h-3 w-3 mr-1" />
                    Reservations
                </Button>

                <Button
                    variant={filters.openNow ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, openNow: !filters.openNow })}
                    className="h-8"
                >
                    <Star className="h-3 w-3 mr-1" />
                    Open Now
                </Button>

                {/* Advanced Filters Sheet */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 relative">
                            <Filter className="h-3 w-3 mr-1" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px]">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Filter Restaurants</SheetTitle>
                            <SheetDescription>
                                Refine your search to find the perfect dining experience
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 space-y-6">
                            <Tabs defaultValue="location" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="location">Location</TabsTrigger>
                                    <TabsTrigger value="cuisine">Cuisine</TabsTrigger>
                                    <TabsTrigger value="experience">Experience</TabsTrigger>
                                    <TabsTrigger value="features">Features</TabsTrigger>
                                </TabsList>

                                <TabsContent value="location" className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-3">Parks & Resorts</h4>
                                        <ScrollArea className="h-48">
                                            <div className="space-y-2">
                                                {locationOptions.map((location) => (
                                                    <div key={location.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={location.value}
                                                            checked={filters.parkIds?.includes(location.value) || false}
                                                            onCheckedChange={(checked) => {
                                                                const currentLocations = filters.parkIds || []
                                                                if (checked) {
                                                                    handleLocationChange([...currentLocations, location.value])
                                                                } else {
                                                                    handleLocationChange(currentLocations.filter(id => id !== location.value))
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={location.value} className="text-sm font-medium">
                                                            {location.label}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="font-medium mb-3">Price Range</h4>
                                        <div className="space-y-2">
                                            {priceRangeOptions.map((price) => (
                                                <div key={price.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={price.value}
                                                        checked={filters.priceRanges?.includes(price.value) || false}
                                                        onCheckedChange={(checked) => {
                                                            const currentPrices = filters.priceRanges || []
                                                            if (checked) {
                                                                handlePriceRangeChange([...currentPrices, price.value])
                                                            } else {
                                                                handlePriceRangeChange(currentPrices.filter(p => p !== price.value))
                                                            }
                                                        }}
                                                    />
                                                    <div>
                                                        <label htmlFor={price.value} className="text-sm font-medium">
                                                            {price.label}
                                                        </label>
                                                        <p className="text-xs text-muted-foreground">{price.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="cuisine" className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-3">Cuisine Types</h4>
                                        <ScrollArea className="h-64">
                                            <div className="grid grid-cols-1 gap-2">
                                                {cuisineOptions.map((cuisine) => (
                                                    <div key={cuisine.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={cuisine.value}
                                                            checked={filters.cuisineTypes?.includes(cuisine.value) || false}
                                                            onCheckedChange={(checked) => {
                                                                const currentCuisines = filters.cuisineTypes || []
                                                                if (checked) {
                                                                    handleCuisineChange([...currentCuisines, cuisine.value])
                                                                } else {
                                                                    handleCuisineChange(currentCuisines.filter(c => c !== cuisine.value))
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={cuisine.value} className="text-sm font-medium">
                                                            {cuisine.label}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </TabsContent>

                                <TabsContent value="experience" className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-3">Service Type</h4>
                                        <div className="space-y-2">
                                            {serviceTypeOptions.map((service) => (
                                                <div key={service.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={service.value}
                                                        checked={filters.serviceTypes?.includes(service.value) || false}
                                                        onCheckedChange={(checked) => {
                                                            const currentServices = filters.serviceTypes || []
                                                            if (checked) {
                                                                handleServiceTypeChange([...currentServices, service.value])
                                                            } else {
                                                                handleServiceTypeChange(currentServices.filter(s => s !== service.value))
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor={service.value} className="text-sm font-medium">
                                                        {service.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="font-medium mb-3">Dining Experience</h4>
                                        <div className="space-y-2">
                                            {diningExperienceOptions.map((experience) => (
                                                <div key={experience.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={experience.value}
                                                        checked={filters.diningExperiences?.includes(experience.value) || false}
                                                        onCheckedChange={(checked) => {
                                                            const currentExperiences = filters.diningExperiences || []
                                                            if (checked) {
                                                                handleDiningExperienceChange([...currentExperiences, experience.value])
                                                            } else {
                                                                handleDiningExperienceChange(currentExperiences.filter(e => e !== experience.value))
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor={experience.value} className="text-sm font-medium">
                                                        {experience.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="font-medium mb-3">Minimum Rating</h4>
                                        <div className="px-2">
                                            <Slider
                                                value={[filters.rating || 0]}
                                                onValueChange={handleRatingChange}
                                                max={5}
                                                min={0}
                                                step={0.5}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>Any</span>
                                                <span className="flex items-center">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    {filters.rating || 0}+
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="features" className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-3">Special Features</h4>
                                        <ScrollArea className="h-64">
                                            <div className="space-y-2">
                                                {specialFeatureOptions.map((feature) => (
                                                    <div key={feature.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={feature.value}
                                                            checked={filters.specialFeatures?.includes(feature.value) || false}
                                                            onCheckedChange={(checked) => {
                                                                const currentFeatures = filters.specialFeatures || []
                                                                if (checked) {
                                                                    handleSpecialFeatureChange([...currentFeatures, feature.value])
                                                                } else {
                                                                    handleSpecialFeatureChange(currentFeatures.filter(f => f !== feature.value))
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={feature.value} className="text-sm font-medium">
                                                            {feature.label}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={clearAllFilters}
                                    disabled={activeFilterCount === 0}
                                    className="flex-1"
                                >
                                    Clear All
                                </Button>
                                <Button onClick={() => setIsOpen(false)} className="flex-1">
                                    Show Results ({resultCount})
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Clear All Filters Button */}
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-8 text-muted-foreground"
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {/* Active Filter Badges */}
            {getFilterBadges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {getFilterBadges.map((badge, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                            {badge.label}
                            <button
                                onClick={badge.onRemove}
                                className="ml-1 hover:text-destructive"
                                title={`Remove ${badge.label} filter`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    {isLoading ? "Searching..." : `${resultCount} restaurants found`}
                </span>
                {activeFilterCount > 0 && (
                    <span>{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied</span>
                )}
            </div>
        </div>
    )
}