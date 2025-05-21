"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, AlertTriangle, ListFilter, LayoutGrid, Rows, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRecommendationLogic } from "./use-recommendation-logic.hook"
import { RecommendationCard, RecommendationCardSkeleton } from "./recommendation-card"
import { RecommendationFilters } from "./recommendation-filters"
import {
    RecommendationEngineProps,
    RecommendableItem,
    Recommendation,
    RecommendationFilters as RecommendationFiltersType,
} from "./types"
import { DEFAULT_RECOMMENDATION_FILTERS } from "./constants"

// Placeholder for fetching actual data - replace with your data fetching solution
async function fetchMockItems(): Promise<RecommendableItem[]> {
    // In a real app, this would be an API call
    // For now, using a simplified mock structure. Ensure your actual data matches RecommendableItem types.
    await new Promise(resolve => setTimeout(resolve, 100))
    return [
        // Add 5-10 diverse mock items here matching AttractionItem, DiningItem, ShowItem, EventItem structure
        // Example Magic Kingdom Attractions
        {
            id: "mk-7dmt", type: "attraction", name: "Seven Dwarfs Mine Train", parkId: "magic-kingdom", attractionType: "thrill",
            description: "Race through the diamond mine from Snow White and the Seven Dwarfs on a swaying family coaster.",
            imageUrl: "/images/attractions/mk-7dmt.jpg", userRating: { average: 4.8, count: 15000 }, expectedWaitTime: 75, geniePlusAvailable: true, thrillLevel: "medium",
            location: "Fantasyland", tags: ["coaster", "family", "mining"], heightRequirement: 97
        },
        {
            id: "mk-hm", type: "attraction", name: "Haunted Mansion", parkId: "magic-kingdom", attractionType: "family",
            description: "Climb aboard a gloomy Doom Buggy for a spooky tour through this house of happy haunts.",
            imageUrl: "/images/attractions/mk-hm.jpg", userRating: { average: 4.6, count: 12000 }, expectedWaitTime: 45, individualLightningLaneAvailable: false, thrillLevel: "low",
            location: "Liberty Square", tags: ["dark-ride", "classic", "ghosts"], accessibilityFeatures: ["wheelchair-accessible"]
        },
        // Example Epcot Dining
        {
            id: "ep-les-halles", type: "dining", name: "Les Halles Boulangerie-Patisserie", parkId: "epcot", diningType: "quick-service",
            description: "Delight in French bakery classics, from sandwiches to pastries, in a charming Parisian setting.",
            imageUrl: "/images/dining/ep-les-halles.jpg", userRating: { average: 4.5, count: 8000 }, priceRange: "$", cuisine: ["French", "Bakery"],
            location: "World Showcase - France", mobileOrderAvailable: true
        },
        {
            id: "ep-space-220", type: "dining", name: "Space 220 Restaurant", parkId: "epcot", diningType: "table-service",
            description: "Dine among the stars in this out-of-this-world restaurant with panoramic views of Earth from 220 miles up.",
            imageUrl: "/images/dining/ep-space-220.jpg", userRating: { average: 4.2, count: 3500 }, priceRange: "$$$", cuisine: ["Modern American"],
            location: "World Discovery (Future World)", reservationsRecommended: true
        },
        // Example Hollywood Studios Show
        {
            id: "hs-fantasmic", type: "show", name: "Fantasmic!", parkId: "hollywood-studios", showType: "stage",
            description: "Behold the forces of good and evil in Mickey's dream as they battle on water and light.",
            imageUrl: "/images/shows/hs-fantasmic.jpg", userRating: { average: 4.9, count: 9500 }, duration: 30, showTimes: ["9:00 PM", "10:30 PM"],
            location: "Hollywood Hills Amphitheater", tags: ["nighttime", "water-show", "fireworks-finale"]
        },
        // Example Animal Kingdom Event (placeholder)
        {
            id: "ak-earth-month", type: "event", name: "Earth Month Celebration", parkId: "animal-kingdom", eventType: "seasonal",
            description: "Join Animal Kingdom in celebrating Earth Month with special activities, character meets, and conservation messages.",
            imageUrl: "/images/events/ak-earth-month.jpg", userRating: { average: 4.3, count: 1200 }, eventDates: { startDate: new Date("2024-04-01"), endDate: new Date("2024-04-30") },
            location: "Various locations", tags: ["conservation", "education", "limited-time"]
        },
        {
            id: "mk-pirates", type: "attraction", name: "Pirates of the Caribbean", parkId: "magic-kingdom", attractionType: "family",
            description: "Set sail on a swashbuckling voyage to a time when pirates ruled the seas.",
            imageUrl: "/images/attractions/mk-pirates.jpg", userRating: { average: 4.7, count: 13500 }, expectedWaitTime: 35, thrillLevel: "low",
            location: "Adventureland", tags: ["boat-ride", "classic", "audio-animatronics"]
        },
        {
            id: "ep-test-track", type: "attraction", name: "Test Track", parkId: "epcot", attractionType: "thrill",
            description: "Design a virtual concept car and then take it for a thrilling spin on the Test Track.",
            imageUrl: "/images/attractions/ep-test-track.jpg", userRating: { average: 4.5, count: 11000 }, expectedWaitTime: 65, geniePlusAvailable: true, thrillLevel: "high",
            location: "World Discovery (Future World)", heightRequirement: 102
        }
    ]
}

/**
 * @component RecommendationEngine
 * @description Main component for displaying and filtering recommendations.
 * It fetches items, uses the recommendation logic hook, and renders cards and filters.
 * Provides an immersive and interactive experience for discovering Disney park activities.
 */
export function RecommendationEngine(props: RecommendationEngineProps) {
    const [allItems, setAllItems] = useState<RecommendableItem[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [activeFilters, setActiveFilters] = useState<RecommendationFiltersType>(DEFAULT_RECOMMENDATION_FILTERS)

    useEffect(() => {
        async function loadItems() {
            setInitialLoading(true)
            try {
                // In a real app, props.allItems might be passed directly or fetched via a more robust system.
                // If props.allItems is not provided, we fetch mock items.
                const itemsToUse = props.allItems && props.allItems.length > 0 ? props.allItems : await fetchMockItems();
                setAllItems(itemsToUse)
            } catch (error) {
                console.error("Failed to load items for recommendation engine:", error)
                // Potentially set an error state to display to the user
            }
            setInitialLoading(false)
        }
        loadItems()
    }, [props.allItems]) // Re-fetch/re-set if props.allItems changes

    const enginePropsWithFetchedItems: RecommendationEngineProps = {
        ...props,
        allItems: allItems,
    }

    const { recommendations, isLoading: recommendationsLoading, error, applyFilters } = useRecommendationLogic(enginePropsWithFetchedItems)

    const handleFiltersChange = (newFilters: RecommendationFiltersType) => {
        setActiveFilters(newFilters)
        applyFilters(newFilters, recommendations) // Pass current recommendations to be filtered
    }

    const handleAddToItinerary = (item: RecommendableItem) => {
        console.log("Add to Itinerary:", item.name) // Replace with actual logic
        // Example: trackEvent('add_to_itinerary', { item_id: item.id, item_name: item.name });
    }

    const handleNotInterested = (itemId: string) => {
        console.log("Not Interested:", itemId) // Replace with actual logic, e.g., update user preferences
        // Example: trackEvent('hide_recommendation', { item_id: itemId });
        // Potentially re-fetch or re-filter recommendations after this action
    }

    const isLoading = initialLoading || recommendationsLoading

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.3,
                ease: "easeOut"
            }
        })
    };

    return (
        <div className="container mx-auto py-8 px-4 bg-gradient-to-b from-slate-950 via-purple-950 to-black min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 mb-4 md:mb-0">
                    Magical Suggestions For You
                </h1>
                <div className="flex items-center space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={viewMode === 'grid' ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode('grid')} className="text-white hover:bg-purple-700">
                                    <LayoutGrid size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-white border-slate-700"><p>Grid View</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={viewMode === 'list' ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode('list')} className="text-white hover:bg-purple-700">
                                    <Rows size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-white border-slate-700"><p>List View</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <RecommendationFilters
                initialFilters={DEFAULT_RECOMMENDATION_FILTERS}
                onFiltersChange={handleFiltersChange}
                isLoading={isLoading}
            />

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center p-6 mb-6 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-center"
                >
                    <AlertTriangle size={48} className="mb-3 text-red-500" />
                    <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong.</h3>
                    <p>{error}</p>
                    <Button onClick={() => applyFilters(activeFilters, recommendations)} variant="outline" className="mt-4 text-red-300 border-red-500 hover:bg-red-800/50 hover:text-red-200">
                        Try Reloading Suggestions
                    </Button>
                </motion.div>
            )}

            {isLoading && recommendations.length === 0 && (
                <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {Array.from({ length: props.maxRecommendations || 8 }).map((_, index) => (
                        <RecommendationCardSkeleton key={`skel-${index}`} />
                    ))}
                </div>
            )}

            {!isLoading && recommendations.length === 0 && !error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-10 my-10 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 text-center shadow-xl"
                >
                    <SearchX size={64} className="mb-6 text-purple-400" />
                    <h3 className="text-2xl font-semibold mb-3 text-slate-200">No Recommendations Found</h3>
                    <p className="max-w-md">
                        We couldn't find any recommendations matching your current preferences and filters.
                        Try adjusting your filter settings or broadening your choices!
                    </p>
                </motion.div>
            )}

            {!isLoading && recommendations.length > 0 && (
                <motion.div
                    className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence>
                        {recommendations.map((rec, index) => (
                            <motion.div key={rec.item.id} custom={index} variants={cardVariants} layout>
                                <RecommendationCard
                                    recommendation={rec}
                                    onAddToItinerary={handleAddToItinerary}
                                    onNotInterested={handleNotInterested}
                                    isLoading={isLoading} // Individual card loading not implemented, but prop exists
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    )
}