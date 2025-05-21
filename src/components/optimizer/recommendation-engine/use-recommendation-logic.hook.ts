"use client"

import { useState, useEffect, useCallback } from "react"
import {
    RecommendableItem,
    Recommendation,
    RecommendationEngineProps,
    RecommendationFilters,
    AttractionItem,
    DiningItem,
    ShowItem,
    PastVisit,
} from "./types"
import {
    SCORING_WEIGHTS,
    MAX_RECOMMENDATIONS_DEFAULT,
    POPULARITY_THRESHOLD,
    HIGH_RATING_THRESHOLD,
} from "./constants"
import { normalizeScore } from "./utils"

/**
 * @hook useRecommendationLogic
 * @description Encapsulates the core logic for generating and filtering recommendations.
 *
 * This hook implements several recommendation strategies:
 * 1. Popularity-based: Recommends items that are generally popular.
 * 2. Content-based: Matches items to explicit user preferences (e.g., preferred parks, attraction types).
 * 3. Contextual: Considers current context like time of day or current park (basic implementation).
 * 4. User History: Boosts items similar to positively-rated past visits and penalizes negatively-rated ones.
 * 5. Hidden Gems: Attempts to boost high-quality but less popular items.
 *
 * It also includes placeholders and comments for integrating more advanced
 * backend-driven features like collaborative filtering or AI-driven suggestions.
 */
export function useRecommendationLogic({
    userPreferences,
    allItems,
    currentContext,
    maxRecommendations = MAX_RECOMMENDATIONS_DEFAULT,
}: RecommendationEngineProps) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const scoreItem = useCallback(
        (item: RecommendableItem): Recommendation | null => {
            let score = 0
            const reasoning: string[] = []

            // 1. Popularity Score (Base)
            if (item.userRating && item.userRating.count > 0) {
                const popularityScore = normalizeScore(item.userRating.count, 0, POPULARITY_THRESHOLD * 2) // Max count can be higher than threshold
                score += popularityScore * SCORING_WEIGHTS.POPULARITY
                if (item.userRating.count > POPULARITY_THRESHOLD) reasoning.push("Popular item")
            }

            // 2. User Rating Score
            if (item.userRating && item.userRating.average > 0) {
                const ratingScore = normalizeScore(item.userRating.average, 1, 5)
                score += ratingScore * SCORING_WEIGHTS.USER_RATING
                if (item.userRating.average >= HIGH_RATING_THRESHOLD) reasoning.push("Highly rated by users")
            }

            // 3. Content-Based Filtering (User Preferences)
            if (userPreferences.preferredParks?.includes(item.parkId)) {
                score += SCORING_WEIGHTS.PARK_MATCH
                reasoning.push(`Located in a preferred park: ${item.parkId}`)
            }

            if (item.type === "attraction") {
                const attraction = item as AttractionItem
                if (userPreferences.preferredAttractionTypes?.includes(attraction.attractionType)) {
                    score += SCORING_WEIGHTS.PREFERENCE_MATCH
                    reasoning.push(`Matches preferred attraction type: ${attraction.attractionType}`)
                }
                if (userPreferences.avoidedAttractionTypes?.includes(attraction.attractionType)) {
                    score += SCORING_WEIGHTS.AVOIDANCE_PENALTY
                    reasoning.push(`Matches an avoided attraction type: ${attraction.attractionType}`)
                }
                if (userPreferences.preferredIntensity && attraction.thrillLevel === userPreferences.preferredIntensity) {
                    score += SCORING_WEIGHTS.THRILL_LEVEL_MATCH
                    reasoning.push(`Matches preferred intensity: ${attraction.thrillLevel}`)
                }
            } else if (item.type === "dining") {
                const dining = item as DiningItem
                if (userPreferences.preferredDiningTypes?.includes(dining.diningType)) {
                    score += SCORING_WEIGHTS.PREFERENCE_MATCH
                    reasoning.push(`Matches preferred dining type: ${dining.diningType}`)
                }
                if (userPreferences.preferredPriceRanges?.includes(dining.priceRange!)) {
                    score += SCORING_WEIGHTS.PRICE_RANGE_MATCH
                    reasoning.push(`Matches preferred price range: ${dining.priceRange}`)
                }
            }

            // 4. User History
            userPreferences.pastVisits?.forEach((visit: PastVisit) => {
                if (visit.itemId === item.id) {
                    if (visit.rating && visit.rating >= 4) {
                        score += SCORING_WEIGHTS.PAST_POSITIVE_INTERACTION
                        reasoning.push("You previously enjoyed this.")
                    } else if (visit.rating && visit.rating <= 2) {
                        score += SCORING_WEIGHTS.PAST_NEGATIVE_INTERACTION
                        reasoning.push("You previously rated this low.")
                    }
                }
                // TODO: Add logic for similarity to past visits (requires item similarity metric)
                // e.g., if item is similar to a highly-rated past visit, boost score.
            })

            // 5. Contextual Factors (Basic)
            if (currentContext?.currentPark && item.parkId === currentContext.currentPark) {
                score += SCORING_WEIGHTS.PARK_MATCH * 1.5 // Boost if in current park
                reasoning.push("Located in your current park!")
            }
            if (currentContext?.timeOfDay) {
                // Example: Boost fireworks at night
                if (item.type === "show" && (item as ShowItem).showType === "fireworks" && (currentContext.timeOfDay === "evening" || currentContext.timeOfDay === "night")) {
                    score += SCORING_WEIGHTS.CONTEXT_TIME_MATCH
                    reasoning.push("Perfect for this time of day!")
                }
                // Example: Boost indoor activities if rainy
                if (currentContext.weather === "rainy" && item.tags?.includes("indoor")) {
                    score += SCORING_WEIGHTS.CONTEXT_TIME_MATCH * 0.5;
                    reasoning.push("Good choice for rainy weather.");
                }
            }

            // 6. Favorite Characters (Basic)
            if (userPreferences.favoriteCharacters && userPreferences.favoriteCharacters.length > 0) {
                const characterMatch = userPreferences.favoriteCharacters.some(char =>
                    item.name.toLowerCase().includes(char.toLowerCase()) ||
                    item.description.toLowerCase().includes(char.toLowerCase()) ||
                    item.tags?.some(tag => tag.toLowerCase().includes(char.toLowerCase()))
                )
                if (characterMatch) {
                    score += SCORING_WEIGHTS.CHARACTER_MATCH
                    reasoning.push("Features one of your favorite characters!")
                }
            }

            // 7. Hidden Gem Boost
            if (item.userRating && item.userRating.average >= HIGH_RATING_THRESHOLD && item.userRating.count < POPULARITY_THRESHOLD) {
                score += SCORING_WEIGHTS.HIDDEN_GEM_BOOST
                reasoning.push("Highly-rated hidden gem!")
            }

            // Ensure score is not negative unless due to strong avoidance
            if (score < 0 && SCORING_WEIGHTS.AVOIDANCE_PENALTY === 0) score = 0.01 // Small positive if no hard avoidance
            else if (score < 0 && reasoning.some(r => r.includes("avoided"))) {
                // Allow negative score if it's due to avoidance
            } else if (score < 0) {
                score = 0.01
            }

            // TODO: More sophisticated scoring based on collaborative filtering (backend integration)
            // e.g., fetch collaborative scores for items based on similar user behavior.

            // TODO: AI-driven scoring (backend integration)
            // e.g., use an ML model to predict user preference score.

            if (score <= 0 && !reasoning.some(r => r.includes("avoided"))) return null // Don't recommend if score is too low and not an avoided item.

            return {
                item,
                score: normalizeScore(score, -1, 3), // Normalize: score can range, e.g. -1 (avoid) to ~3 (many boosts)
                reasoning: Array.from(new Set(reasoning)), // Unique reasons
                source: "content-based", // This would be dynamic with more sources
            }
        },
        [userPreferences, currentContext] // allItems is not a dependency here as it's processed once
    )

    const generateRecommendations = useCallback(() => {
        setIsLoading(true)
        setError(null)

        try {
            // Simulate API call delay
            setTimeout(() => {
                const scoredItems = allItems
                    .map(item => scoreItem(item))
                    .filter(Boolean) as Recommendation[]

                // Apply Diversity Penalty (simple version)
                // This is a naive implementation. True diversity requires more complex logic.
                const finalRecommendations: Recommendation[] = []
                const typeCounts: Record<string, number> = {}

                scoredItems.sort((a, b) => (b.priority || 0) - (a.priority || 0) || b.score - a.score)

                for (const rec of scoredItems) {
                    if (finalRecommendations.length >= maxRecommendations) break

                    const itemTypeKey = rec.item.type === "attraction" ? (rec.item as AttractionItem).attractionType : rec.item.type
                    typeCounts[itemTypeKey] = (typeCounts[itemTypeKey] || 0) + 1

                    let diversityPenalty = 0
                    if (typeCounts[itemTypeKey] > 2) { // Penalize after 2 items of the same specific type
                        diversityPenalty = (typeCounts[itemTypeKey] - 2) * SCORING_WEIGHTS.DIVERSITY_PENALTY_FACTOR
                    }

                    const finalScore = rec.score - diversityPenalty

                    if (finalScore > 0.1 || rec.reasoning.some(r => r.includes("avoided"))) { // Threshold to include, or if it's an explicitly avoided item (to show *why* it's not recommended if we choose to show such)
                        finalRecommendations.push({ ...rec, score: Math.max(0, finalScore) })
                    }
                }

                // Sort again after diversity penalty
                finalRecommendations.sort((a, b) => b.score - a.score);

                setRecommendations(finalRecommendations.slice(0, maxRecommendations))
                setIsLoading(false)
            }, 500)
        } catch (e) {
            console.error("Error generating recommendations:", e)
            setError("Could not generate recommendations at this time.")
            setIsLoading(false)
        }
    }, [allItems, scoreItem, maxRecommendations])

    useEffect(() => {
        if (allItems && allItems.length > 0 && userPreferences) {
            generateRecommendations()
        }
    }, [allItems, userPreferences, generateRecommendations])

    const applyFilters = useCallback(
        (filters: RecommendationFilters, currentRecs: Recommendation[]): Recommendation[] => {
            let filtered = [...currentRecs]

            if (filters.parkId && filters.parkId !== "all") {
                filtered = filtered.filter(r => r.item.parkId === filters.parkId)
            }

            if (filters.itemType && filters.itemType !== "all") {
                filtered = filtered.filter(r => r.item.type === filters.itemType)
            }

            if (filters.attractionType && filters.attractionType !== "all") {
                filtered = filtered.filter(r =>
                    r.item.type === "attraction" &&
                    (r.item as AttractionItem).attractionType === filters.attractionType
                )
            }

            if (filters.diningType && filters.diningType !== "all") {
                filtered = filtered.filter(r =>
                    r.item.type === "dining" &&
                    (r.item as DiningItem).diningType === filters.diningType
                )
            }

            if (filters.priceRange && filters.priceRange !== "all") {
                filtered = filtered.filter(r => r.item.type === "dining" && (r.item as DiningItem).priceRange === filters.priceRange)
            }

            if (filters.showOnlyAvailableGeniePlus) {
                filtered = filtered.filter(r => r.item.type === "attraction" && (r.item as AttractionItem).geniePlusAvailable)
            }

            if (filters.showOnlyAvailableLightningLane) {
                filtered = filtered.filter(r => r.item.type === "attraction" && (r.item as AttractionItem).individualLightningLaneAvailable)
            }

            if (filters.maxWaitTime) {
                filtered = filtered.filter(r => {
                    if (r.item.type === "attraction") {
                        const attraction = r.item as AttractionItem
                        return attraction.expectedWaitTime === undefined || attraction.expectedWaitTime <= filters.maxWaitTime!
                    }
                    return true
                })
            }

            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case "popularity":
                        filtered.sort((a, b) => (b.item.userRating?.count || 0) - (a.item.userRating?.count || 0))
                        break
                    case "rating":
                        filtered.sort((a, b) => (b.item.userRating?.average || 0) - (a.item.userRating?.average || 0))
                        break
                    case "relevance": // Default sort is already by score (relevance)
                    default:
                        filtered.sort((a, b) => b.score - a.score)
                        break
                }
            }
            return filtered.slice(0, maxRecommendations)
        },
        [maxRecommendations]
    )

    const updateRecommendationsWithFilters = useCallback(
        (filters: RecommendationFilters) => {
            // Re-generate initial recommendations if not already done or if crucial inputs change.
            // For now, we assume initial generation is done and we filter the existing set.
            // A more robust solution might re-score or fetch new server-side recs based on filters.
            setIsLoading(true);
            // Simulate filtering delay
            setTimeout(() => {
                const newFilteredRecs = applyFilters(filters, recommendations); // Apply to the current full set of recommendations
                setRecommendations(newFilteredRecs);
                setIsLoading(false);
            }, 300);
        },
        [applyFilters, recommendations] // recommendations is a dependency here
    );


    return { recommendations, isLoading, error, generateRecommendations, applyFilters: updateRecommendationsWithFilters }
}