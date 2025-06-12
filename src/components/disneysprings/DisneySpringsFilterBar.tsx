"use client"

import { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Map, List, Filter, X } from "lucide-react"
import { LocationCategory, LocationArea, PriceRange } from "@/types/disneysprings"

interface DisneySpringsFilterBarProps {
    readonly activeCategory: LocationCategory | "all"
    readonly setActiveCategory: Dispatch<SetStateAction<LocationCategory | "all">>
    readonly activeArea: LocationArea | "all"
    readonly setActiveArea: Dispatch<SetStateAction<LocationArea | "all">>
    readonly activePriceRanges: PriceRange[]
    readonly setActivePriceRanges: Dispatch<SetStateAction<PriceRange[]>>
    readonly activeFeatures: string[]
    readonly setActiveFeatures: Dispatch<SetStateAction<string[]>>
    readonly showMap: boolean
    readonly setShowMap: Dispatch<SetStateAction<boolean>>
    readonly searchTerm: string
    readonly setSearchTerm: Dispatch<SetStateAction<string>>
    readonly showOnlyPopular: boolean
    readonly setShowOnlyPopular: Dispatch<SetStateAction<boolean>>
    readonly showOnlyNew: boolean
    readonly setShowOnlyNew: Dispatch<SetStateAction<boolean>>
}

const popularFeatures = [
    "Family-friendly",
    "Live entertainment",
    "Waterfront dining",
    "Celebrity chef",
    "Artisan",
    "Disney exclusive",
    "Ticketed",
    "Interactive",
    "Photo opportunities"
]

export default function DisneySpringsFilterBar({
    activeCategory,
    setActiveCategory,
    activeArea,
    setActiveArea,
    activePriceRanges,
    setActivePriceRanges,
    activeFeatures,
    setActiveFeatures,
    showMap,
    setShowMap,
    searchTerm,
    setSearchTerm,
    showOnlyPopular,
    setShowOnlyPopular,
    showOnlyNew,
    setShowOnlyNew
}: DisneySpringsFilterBarProps) {

    const hasActiveFilters = activeCategory !== "all" ||
        activeArea !== "all" ||
        activePriceRanges.length > 0 ||
        activeFeatures.length > 0 ||
        showOnlyPopular ||
        showOnlyNew ||
        searchTerm.trim() !== ""

    const clearAllFilters = () => {
        setActiveCategory("all")
        setActiveArea("all")
        setActivePriceRanges([])
        setActiveFeatures([])
        setSearchTerm("")
        setShowOnlyPopular(false)
        setShowOnlyNew(false)
    }

    const togglePriceRange = (priceRange: PriceRange) => {
        setActivePriceRanges(prev =>
            prev.includes(priceRange)
                ? prev.filter(p => p !== priceRange)
                : [...prev, priceRange]
        )
    }

    const toggleFeature = (feature: string) => {
        setActiveFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        )
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
            {/* Search and View Toggle */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search locations, cuisine, features..."
                        className="pl-9 h-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                            className="flex items-center gap-2"
                        >
                            <X className="h-4 w-4" />
                            Clear All
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMap(!showMap)}
                        className="flex items-center gap-2"
                    >
                        {showMap ? (
                            <>
                                <List className="h-4 w-4" />
                                <span className="hidden sm:inline">List View</span>
                            </>
                        ) : (
                            <>
                                <Map className="h-4 w-4" />
                                <span className="hidden sm:inline">Map View</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Primary Filters */}
            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={() => setActiveCategory("all")}
                    variant={activeCategory === "all" ? "default" : "outline"}
                    size="sm"
                >
                    All Categories
                </Button>
                <Button
                    onClick={() => setActiveCategory(LocationCategory.Shopping)}
                    variant={activeCategory === LocationCategory.Shopping ? "default" : "outline"}
                    size="sm"
                >
                    Shopping
                </Button>
                <Button
                    onClick={() => setActiveCategory(LocationCategory.Dining)}
                    variant={activeCategory === LocationCategory.Dining ? "default" : "outline"}
                    size="sm"
                >
                    Dining
                </Button>
                <Button
                    onClick={() => setActiveCategory(LocationCategory.Entertainment)}
                    variant={activeCategory === LocationCategory.Entertainment ? "default" : "outline"}
                    size="sm"
                >
                    Entertainment
                </Button>
            </div>

            {/* Secondary Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Area Filter */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Area</label>
                    <Select value={activeArea} onValueChange={(value) => setActiveArea(value as LocationArea | "all")}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Areas</SelectItem>
                            <SelectItem value={LocationArea.Marketplace}>Marketplace</SelectItem>
                            <SelectItem value={LocationArea.TheLanding}>The Landing</SelectItem>
                            <SelectItem value={LocationArea.TownCenter}>Town Center</SelectItem>
                            <SelectItem value={LocationArea.WestSide}>West Side</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <div className="flex flex-wrap gap-1">
                        {Object.values(PriceRange).map(priceRange => (
                            <Button
                                key={priceRange}
                                variant={activePriceRanges.includes(priceRange) ? "default" : "outline"}
                                size="sm"
                                onClick={() => togglePriceRange(priceRange)}
                                className="h-8 text-xs"
                            >
                                {priceRange}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Quick Filters */}
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Quick Filters</label>
                    <div className="space-y-1">
                        <Button
                            variant={showOnlyPopular ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowOnlyPopular(!showOnlyPopular)}
                            className="w-full h-8 text-xs"
                        >
                            Popular Only
                        </Button>
                        <Button
                            variant={showOnlyNew ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowOnlyNew(!showOnlyNew)}
                            className="w-full h-8 text-xs"
                        >
                            New Locations
                        </Button>
                    </div>
                </div>

                {/* Features Filter */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Features</label>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {popularFeatures.map(feature => (
                            <Badge
                                key={feature}
                                variant={activeFeatures.includes(feature) ? "default" : "outline"}
                                className="cursor-pointer text-xs"
                                onClick={() => toggleFeature(feature)}
                            >
                                {feature}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active filters:</span>

                    {activeCategory !== "all" && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setActiveCategory("all")}>
                            Category: {activeCategory} <X className="ml-1 h-3 w-3" />
                        </Badge>
                    )}

                    {activeArea !== "all" && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setActiveArea("all")}>
                            Area: {activeArea} <X className="ml-1 h-3 w-3" />
                        </Badge>
                    )}

                    {activePriceRanges.map(priceRange => (
                        <Badge
                            key={priceRange}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => togglePriceRange(priceRange)}
                        >
                            {priceRange} <X className="ml-1 h-3 w-3" />
                        </Badge>
                    ))}

                    {activeFeatures.map(feature => (
                        <Badge
                            key={feature}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => toggleFeature(feature)}
                        >
                            {feature} <X className="ml-1 h-3 w-3" />
                        </Badge>
                    ))}

                    {showOnlyPopular && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setShowOnlyPopular(false)}>
                            Popular Only <X className="ml-1 h-3 w-3" />
                        </Badge>
                    )}

                    {showOnlyNew && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setShowOnlyNew(false)}>
                            New Locations <X className="ml-1 h-3 w-3" />
                        </Badge>
                    )}

                    {searchTerm.trim() && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm("")}>
                            Search: "{searchTerm}" <X className="ml-1 h-3 w-3" />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}