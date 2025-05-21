import { RecommendableItem, Recommendation, ParkId, AttractionItem, PriceRange, AttractionType, DiningType } from "./types"

/**
 * Generates a more descriptive reason string based on recommendation properties.
 * @param {Recommendation} recommendation - The recommendation object.
 * @returns {string} A descriptive reason for the recommendation.
 */
export function getDescriptiveReason(recommendation: Recommendation): string {
    if (recommendation.reasoning && recommendation.reasoning.length > 0) {
        return recommendation.reasoning.join(". ")
    }

    let reason = `A good option in ${getParkName(recommendation.item.parkId)}.`

    if (recommendation.source === "popularity") {
        reason = `Popular choice at ${getParkName(recommendation.item.parkId)}.`
    } else if (recommendation.source === "user-history" && recommendation.item.userRating && recommendation.item.userRating.average >= 4) {
        reason = `You previously enjoyed similar items. This one is highly rated!`
    }

    if (recommendation.item.type === "attraction") {
        const attraction = recommendation.item as AttractionItem
        if (attraction.attractionType === "thrill") reason += " Get ready for some thrills!"
        if (attraction.expectedWaitTime && attraction.expectedWaitTime <= 30) reason += ` Low wait time reported.`
    }
    return reason
}

/**
 * Gets the display name for a ParkId.
 * @param {ParkId} parkId - The park identifier.
 * @returns {string} The human-readable park name.
 */
export function getParkName(parkId: ParkId): string {
    const parkNames: Record<ParkId, string> = {
        "magic-kingdom": "Magic Kingdom",
        "epcot": "Epcot",
        "hollywood-studios": "Hollywood Studios",
        "animal-kingdom": "Animal Kingdom",
        "typhoon-lagoon": "Typhoon Lagoon",
        "blizzard-beach": "Blizzard Beach",
        "disney-springs": "Disney Springs",
    }
    return parkNames[parkId] || "Unknown Park"
}

/**
 * Normalizes a score to be within a 0-1 range, if it isn't already.
 * This is a placeholder, as real normalization might depend on min/max possible scores.
 * @param {number} score - The raw score.
 * @param {number} minScore - The minimum possible score in the original scale.
 * @param {number} maxScore - The maximum possible score in the original scale.
 * @returns {number} The normalized score (0-1).
 */
export function normalizeScore(score: number, minScore = 0, maxScore = 1): number {
    if (maxScore === minScore) return 0.5 // Avoid division by zero, return a neutral score
    const boundedScore = Math.max(minScore, Math.min(score, maxScore))
    return (boundedScore - minScore) / (maxScore - minScore)
}

/**
 * Formats a duration from minutes to a more readable string.
 * @param {number} durationInMinutes - The duration in minutes.
 * @returns {string} Formatted duration string (e.g., "1h 30m", "45m").
 */
export function formatDuration(durationInMinutes?: number): string {
    if (typeof durationInMinutes !== "number" || durationInMinutes <= 0) return ""
    const hours = Math.floor(durationInMinutes / 60)
    const minutes = durationInMinutes % 60
    let formatted = ""
    if (hours > 0) formatted += `${hours}h `
    if (minutes > 0) formatted += `${minutes}m`
    return formatted.trim()
}

/**
 * Gets a placeholder image URL if the item's imageUrl is missing.
 * @param {RecommendableItem} item - The recommendable item.
 * @returns {string} The item's image URL or a default placeholder.
 */
export function getItemImageUrl(item: RecommendableItem): string {
    return item.imageUrl || "/images/placeholder-disney.jpg" // Ensure you have this placeholder image
}

/**
 * Converts a PriceRange to a more descriptive string.
 * @param {PriceRange} priceRange - The price range symbol.
 * @returns {string} A descriptive string for the price range.
 */
export function getPriceRangeDescription(priceRange?: PriceRange): string {
    if (!priceRange) return "Price not available"
    switch (priceRange) {
        case "$":
            return "Under $14.99 per adult"
        case "$$":
            return "$15 to $34.99 per adult"
        case "$$$":
            return "$35 to $59.99 per adult"
        case "$$$$":
            return "$60 and up per adult"
        default:
            return "Price not specified"
    }
}

/**
 * Provides a human-readable label for attraction types.
 * @param {AttractionType} type - The attraction type.
 * @returns {string} Human-readable label.
 */
export function getAttractionTypeLabel(type: AttractionType): string {
    const labels: Record<AttractionType, string> = {
        "thrill": "Thrill Ride",
        "family": "Family Friendly",
        "kids": "Kid-Friendly",
        "show": "Show / Entertainment",
        "water": "Water Ride",
        "character-meet": "Character Meet & Greet",
        "parade": "Parade",
        "fireworks": "Fireworks Spectacular"
    };
    return labels[type] || type;
}

/**
 * Provides a human-readable label for dining types.
 * @param {DiningType} type - The dining type.
 * @returns {string} Human-readable label.
 */
export function getDiningTypeLabel(type: DiningType): string {
    const labels: Record<DiningType, string> = {
        "quick-service": "Quick Service",
        "table-service": "Table Service",
        "fine-dining": "Fine/Signature Dining",
        "character-dining": "Character Dining",
        "bar-lounge": "Bar/Lounge",
        "snack": "Snack Location"
    };
    return labels[type] || type;
}

/**
 * A simple debounce function.
 * @param func - The function to debounce
 * @param waitFor - Time to wait in milliseconds
 * @returns A debounced version of the function that returns a promise
 */
export function debounce<T extends unknown[], R>(
    func: (...args: T) => R,
    waitFor: number
): (...args: T) => Promise<R> {
    let timeout: NodeJS.Timeout

    return (...args: T): Promise<R> =>
        new Promise(resolve => {
            if (timeout) {
                clearTimeout(timeout)
            }

            timeout = setTimeout(() => resolve(func(...args)), waitFor)
        })
}