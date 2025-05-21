"use client"

import React, { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Filter, XCircle } from "lucide-react"
import { RecommendationFilters as RecommendationFiltersType, ParkId, AttractionType, DiningType, PriceRange } from "./types"
import {
    PARK_OPTIONS,
    ITEM_TYPE_OPTIONS,
    ATTRACTION_TYPE_OPTIONS,
    DINING_TYPE_OPTIONS,
    PRICE_RANGE_OPTIONS,
    SORT_BY_OPTIONS,
    DEFAULT_RECOMMENDATION_FILTERS,
} from "./constants"
import { debounce } from "./utils"

interface RecommendationFiltersProps {
    initialFilters?: RecommendationFiltersType
    onFiltersChange: (filters: RecommendationFiltersType) => void
    isLoading?: boolean
}

/**
 * @component RecommendationFilters
 * @description Provides a UI for users to filter and sort recommendations.
 * Uses Shadcn UI components for a consistent look and feel.
 */
export function RecommendationFilters({
    initialFilters = DEFAULT_RECOMMENDATION_FILTERS,
    onFiltersChange,
    isLoading = false,
}: RecommendationFiltersProps) {
    const [filters, setFilters] = useState<RecommendationFiltersType>(initialFilters)
    const [isAccordionOpen, setIsAccordionOpen] = useState(false)

    const debouncedOnFiltersChange = React.useMemo(
        () => debounce((filters: RecommendationFiltersType) => onFiltersChange(filters), 500),
        [onFiltersChange]
    )

    useEffect(() => {
        debouncedOnFiltersChange(filters)
    }, [filters, debouncedOnFiltersChange])

    const handleFilterChange = <K extends keyof RecommendationFiltersType>(
        key: K,
        value: RecommendationFiltersType[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const handleResetFilters = () => {
        setFilters(DEFAULT_RECOMMENDATION_FILTERS)
        onFiltersChange(DEFAULT_RECOMMENDATION_FILTERS) // Apply immediately
    }

    const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen)

    return (
        <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg shadow-md">
            <Button onClick={toggleAccordion} variant="ghost" className="w-full justify-between text-lg font-semibold text-purple-300 hover:text-purple-200 mb-2">
                {isAccordionOpen ? "Hide Filters" : "Show Filters & Sort"}
                <Filter size={20} className={`transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`} />
            </Button>
            <Accordion type="single" collapsible className="w-[calc(100%-3rem)]" value={isAccordionOpen ? "filtersAccordion" : ""} onValueChange={(value) => setIsAccordionOpen(value === "filtersAccordion")}>
                <AccordionItem value="filtersAccordion" className="border-none">
                    <AccordionContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Park Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="parkFilter" className="text-slate-300">Park</Label>
                                <Select
                                    value={filters.parkId}
                                    onValueChange={(value: ParkId | "all") => handleFilterChange("parkId", value)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="parkFilter" className="bg-slate-700 border-slate-600 text-white">
                                        <SelectValue placeholder="Select Park" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-700 border-slate-600 text-white">
                                        {PARK_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value} className="hover:bg-slate-600">{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Item Type Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="itemTypeFilter" className="text-slate-300">Item Type</Label>
                                <Select
                                    value={filters.itemType}
                                    onValueChange={(value: "attraction" | "dining" | "show" | "event" | "all") => handleFilterChange("itemType", value)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="itemTypeFilter" className="bg-slate-700 border-slate-600 text-white">
                                        <SelectValue placeholder="Select Item Type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-700 border-slate-600 text-white">
                                        {ITEM_TYPE_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value} className="hover:bg-slate-600">{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Attraction Type Filter (Conditional) */}
                            {filters.itemType === "attraction" || filters.itemType === "all" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="attractionTypeFilter" className="text-slate-300">Attraction Type</Label>
                                    <Select
                                        value={filters.attractionType}
                                        onValueChange={(value: AttractionType | "all") => handleFilterChange("attractionType", value)}
                                        disabled={isLoading || (filters.itemType !== "attraction" && filters.itemType !== "all")}
                                    >
                                        <SelectTrigger id="attractionTypeFilter" className="bg-slate-700 border-slate-600 text-white">
                                            <SelectValue placeholder="Select Attraction Type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-700 border-slate-600 text-white">
                                            {ATTRACTION_TYPE_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value} className="hover:bg-slate-600">{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : null}

                            {/* Dining Type Filter (Conditional) */}
                            {filters.itemType === "dining" || filters.itemType === "all" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="diningTypeFilter" className="text-slate-300">Dining Type</Label>
                                    <Select
                                        value={filters.diningType}
                                        onValueChange={(value: DiningType | "all") => handleFilterChange("diningType", value)}
                                        disabled={isLoading || (filters.itemType !== "dining" && filters.itemType !== "all")}
                                    >
                                        <SelectTrigger id="diningTypeFilter" className="bg-slate-700 border-slate-600 text-white">
                                            <SelectValue placeholder="Select Dining Type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-700 border-slate-600 text-white">
                                            {DINING_TYPE_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value} className="hover:bg-slate-600">{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : null}

                            {/* Price Range Filter (Conditional) */}
                            {filters.itemType === "dining" || filters.itemType === "all" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="priceRangeFilter" className="text-slate-300">Price Range</Label>
                                    <Select
                                        value={filters.priceRange}
                                        onValueChange={(value: PriceRange | "all") => handleFilterChange("priceRange", value)}
                                        disabled={isLoading || (filters.itemType !== "dining" && filters.itemType !== "all")}
                                    >
                                        <SelectTrigger id="priceRangeFilter" className="bg-slate-700 border-slate-600 text-white">
                                            <SelectValue placeholder="Select Price Range" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-700 border-slate-600 text-white">
                                            {PRICE_RANGE_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value} className="hover:bg-slate-600">{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : null}

                            {/* Sort By */}
                            <div className="space-y-2">
                                <Label htmlFor="sortBy" className="text-slate-300">Sort By</Label>
                                <Select
                                    value={filters.sortBy}
                                    onValueChange={(value: "relevance" | "popularity" | "rating") => handleFilterChange("sortBy", value)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="sortBy" className="bg-slate-700 border-slate-600 text-white">
                                        <SelectValue placeholder="Sort By" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-700 border-slate-600 text-white">
                                        {SORT_BY_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value} className="hover:bg-slate-600">{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Genie+ & ILL Switches (Conditional) */}
                            {filters.itemType === "attraction" || filters.itemType === "all" ? (
                                <>
                                    <div className="flex items-center space-x-2 pt-4">
                                        <Switch
                                            id="geniePlusSwitch"
                                            checked={filters.showOnlyAvailableGeniePlus}
                                            onCheckedChange={(checked) => handleFilterChange("showOnlyAvailableGeniePlus", checked)}
                                            disabled={isLoading || (filters.itemType !== "attraction" && filters.itemType !== "all")}
                                            className="data-[state=checked]:bg-purple-500"
                                        />
                                        <Label htmlFor="geniePlusSwitch" className="text-slate-300">Only Genie+ Available</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-4">
                                        <Switch
                                            id="lightningLaneSwitch"
                                            checked={filters.showOnlyAvailableLightningLane}
                                            onCheckedChange={(checked) => handleFilterChange("showOnlyAvailableLightningLane", checked)}
                                            disabled={isLoading || (filters.itemType !== "attraction" && filters.itemType !== "all")}
                                            className="data-[state=checked]:bg-purple-500"
                                        />
                                        <Label htmlFor="lightningLaneSwitch" className="text-slate-300">Only Ind. Lightning Lane Available</Label>
                                    </div>
                                </>
                            ) : null}

                            {/* Max Wait Time Slider (Conditional) */}
                            {filters.itemType === "attraction" || filters.itemType === "all" ? (
                                <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
                                    <Label htmlFor="maxWaitTimeSlider" className="text-slate-300">Max Wait Time: {filters.maxWaitTime} min</Label>
                                    <Slider
                                        id="maxWaitTimeSlider"
                                        min={0}
                                        max={180}
                                        step={5}
                                        value={[filters.maxWaitTime || 120]}
                                        onValueChange={(value) => handleFilterChange("maxWaitTime", value[0])}
                                        disabled={isLoading || (filters.itemType !== "attraction" && filters.itemType !== "all")}
                                        className="[&>span:first-child]:h-1 [&>span:first-child]:bg-purple-500"
                                    />
                                </div>
                            ) : null}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button onClick={handleResetFilters} variant="outline" size="sm" disabled={isLoading} className="group">
                                <XCircle size={16} className="mr-2 transition-transform duration-300 group-hover:rotate-90" /> Reset Filters
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}