"use client"

import { useState, useMemo } from "react"
import { useDisneySpringsLocations } from "@/lib/utils/disneySpringsData"
import { LocationCategory, LocationArea, PriceRange, LocationFilters } from "@/types/disneysprings"
import { filterLocationsByCategory, filterLocationsByArea, filterLocationsByPriceRange, searchLocations, getLocationsByTags, getPopularLocations, getNewLocations } from "@/lib/utils/disneySpringsData"
import DisneySpringsHero from "@/components/disneysprings/DisneySpringsHero"
import DisneySpringsFilterBar from "@/components/disneysprings/DisneySpringsFilterBar"
import DisneySpringsLocationCategory from "@/components/disneysprings/DisneySpringsCategory"
import DisneySpringsMap from "@/components/disneysprings/DisneySpringsMap"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function DisneySpringsPage() {
    const { locations, loading, error } = useDisneySpringsLocations()

    // Filter states
    const [activeCategory, setActiveCategory] = useState<LocationCategory | "all">("all")
    const [activeArea, setActiveArea] = useState<LocationArea | "all">("all")
    const [activePriceRanges, setActivePriceRanges] = useState<PriceRange[]>([])
    const [activeFeatures, setActiveFeatures] = useState<string[]>([])
    const [showMap, setShowMap] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [showOnlyPopular, setShowOnlyPopular] = useState(false)
    const [showOnlyNew, setShowOnlyNew] = useState(false)

    // Memoized filtered locations for performance
    const filteredLocations = useMemo(() => {
        if (!locations || locations.length === 0) return []

        let filtered = [...locations]

        // Apply category filter
        filtered = filterLocationsByCategory(filtered, activeCategory)

        // Apply area filter
        filtered = filterLocationsByArea(filtered, activeArea)

        // Apply price range filter
        if (activePriceRanges.length > 0) {
            filtered = filterLocationsByPriceRange(filtered, activePriceRanges)
        }

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = searchLocations(filtered, searchTerm)
        }

        // Apply feature filter
        if (activeFeatures.length > 0) {
            filtered = getLocationsByTags(filtered, activeFeatures)
        }

        // Apply popular filter
        if (showOnlyPopular) {
            filtered = getPopularLocations(filtered)
        }

        // Apply new locations filter
        if (showOnlyNew) {
            filtered = getNewLocations(filtered)
        }

        return filtered
    }, [locations, activeCategory, activeArea, activePriceRanges, searchTerm, activeFeatures, showOnlyPopular, showOnlyNew])

    // Categorized filtered locations
    const filteredShoppingLocations = useMemo(() =>
        filteredLocations.filter(location => location.category === LocationCategory.Shopping),
        [filteredLocations]
    )

    const filteredDiningLocations = useMemo(() =>
        filteredLocations.filter(location => location.category === LocationCategory.Dining),
        [filteredLocations]
    )

    const filteredEntertainmentLocations = useMemo(() =>
        filteredLocations.filter(location => location.category === LocationCategory.Entertainment),
        [filteredLocations]
    )

    // Loading skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950">
                <DisneySpringsHero />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col gap-8">
                        <Skeleton className="h-12 w-80" />
                        <Skeleton className="h-32 w-full" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-80 w-full" />
                            ))}
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
                <DisneySpringsHero />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Failed to load Disney Springs locations: {error}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <DisneySpringsHero />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Explore Disney Springs
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                            Discover {locations.length} unique shopping, dining, and entertainment experiences across four themed districts.
                            {filteredLocations.length !== locations.length && (
                                <span className="ml-2 text-blue-600 dark:text-blue-400">
                                    ({filteredLocations.length} matching your filters)
                                </span>
                            )}
                        </p>
                    </div>

                    <DisneySpringsFilterBar
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        activeArea={activeArea}
                        setActiveArea={setActiveArea}
                        activePriceRanges={activePriceRanges}
                        setActivePriceRanges={setActivePriceRanges}
                        activeFeatures={activeFeatures}
                        setActiveFeatures={setActiveFeatures}
                        showMap={showMap}
                        setShowMap={setShowMap}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        showOnlyPopular={showOnlyPopular}
                        setShowOnlyPopular={setShowOnlyPopular}
                        showOnlyNew={showOnlyNew}
                        setShowOnlyNew={setShowOnlyNew}
                    />

                    {filteredLocations.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-lg text-gray-500 dark:text-gray-400">
                                No locations match your current filters. Try adjusting your search criteria.
                            </p>
                        </div>
                    ) : showMap ? (
                        <DisneySpringsMap locations={filteredLocations} />
                    ) : (
                        <Tabs
                            value={activeCategory === "all" ? "all" : activeCategory}
                            onValueChange={(value) => setActiveCategory(value as LocationCategory | "all")}
                            className="w-full"
                        >
                            <TabsList className="grid grid-cols-4 max-w-md mb-8">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value={LocationCategory.Shopping}>Shopping</TabsTrigger>
                                <TabsTrigger value={LocationCategory.Dining}>Dining</TabsTrigger>
                                <TabsTrigger value={LocationCategory.Entertainment}>Entertainment</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-12">
                                {filteredShoppingLocations.length > 0 && (
                                    <DisneySpringsLocationCategory
                                        title="Shopping"
                                        description="From world-class boutiques to one-of-a-kind treasures, Disney Springs offers a variety of shopping experiences."
                                        locations={filteredShoppingLocations}
                                    />
                                )}

                                {filteredDiningLocations.length > 0 && (
                                    <DisneySpringsLocationCategory
                                        title="Dining"
                                        description="Savor a diverse range of dining options, from quick bites to signature restaurants by award-winning chefs."
                                        locations={filteredDiningLocations}
                                    />
                                )}

                                {filteredEntertainmentLocations.length > 0 && (
                                    <DisneySpringsLocationCategory
                                        title="Entertainment & Experiences"
                                        description="Enjoy live performances, unique experiences, and family-friendly attractions throughout Disney Springs."
                                        locations={filteredEntertainmentLocations}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value={LocationCategory.Shopping}>
                                {filteredShoppingLocations.length > 0 ? (
                                    <DisneySpringsLocationCategory
                                        title="Shopping"
                                        description="From world-class boutiques to one-of-a-kind treasures, Disney Springs offers a variety of shopping experiences."
                                        locations={filteredShoppingLocations}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-lg text-gray-500 dark:text-gray-400">
                                            No shopping locations match your current filters.
                                        </p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value={LocationCategory.Dining}>
                                {filteredDiningLocations.length > 0 ? (
                                    <DisneySpringsLocationCategory
                                        title="Dining"
                                        description="Savor a diverse range of dining options, from quick bites to signature restaurants by award-winning chefs."
                                        locations={filteredDiningLocations}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-lg text-gray-500 dark:text-gray-400">
                                            No dining locations match your current filters.
                                        </p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value={LocationCategory.Entertainment}>
                                {filteredEntertainmentLocations.length > 0 ? (
                                    <DisneySpringsLocationCategory
                                        title="Entertainment & Experiences"
                                        description="Enjoy live performances, unique experiences, and family-friendly attractions throughout Disney Springs."
                                        locations={filteredEntertainmentLocations}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-lg text-gray-500 dark:text-gray-400">
                                            No entertainment locations match your current filters.
                                        </p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    )
}