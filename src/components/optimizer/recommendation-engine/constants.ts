import { RecommendationFilters, ParkId, AttractionType, DiningType, PriceRange } from "./types"

export const DEFAULT_RECOMMENDATION_FILTERS: RecommendationFilters = {
    parkId: "all",
    itemType: "all",
    attractionType: "all",
    diningType: "all",
    priceRange: "all",
    sortBy: "relevance",
    showOnlyAvailableGeniePlus: false,
    showOnlyAvailableLightningLane: false,
    maxWaitTime: 120,
}

export const PARK_OPTIONS: { value: ParkId | "all"; label: string }[] = [
    { value: "all", label: "All Parks" },
    { value: "magic-kingdom", label: "Magic Kingdom" },
    { value: "epcot", label: "Epcot" },
    { value: "hollywood-studios", label: "Hollywood Studios" },
    { value: "animal-kingdom", label: "Animal Kingdom" },
    { value: "typhoon-lagoon", label: "Typhoon Lagoon" },
    { value: "blizzard-beach", label: "Blizzard Beach" },
    { value: "disney-springs", label: "Disney Springs" },
]

export const ITEM_TYPE_OPTIONS: {
    value: "attraction" | "dining" | "show" | "event" | "all"
    label: string
}[] = [
        { value: "all", label: "All Types" },
        { value: "attraction", label: "Attractions" },
        { value: "dining", label: "Dining" },
        { value: "show", label: "Shows" },
        { value: "event", label: "Events" },
    ]

export const ATTRACTION_TYPE_OPTIONS: { value: AttractionType | "all"; label: string }[] = [
    { value: "all", label: "All Attraction Types" },
    { value: "thrill", label: "Thrill Rides" },
    { value: "family", label: "Family Friendly" },
    { value: "kids", label: "For Kids" },
    { value: "show", label: "Shows & Entertainment" }, // Note: 'show' here is an attraction type (e.g. indoor show)
    { value: "water", label: "Water Rides" },
    { value: "character-meet", label: "Character Meet & Greets" },
    { value: "parade", label: "Parades" }, // Attraction representing parade viewing spots/info
    { value: "fireworks", label: "Fireworks" }, // Attraction representing fireworks viewing spots/info
]

export const DINING_TYPE_OPTIONS: { value: DiningType | "all"; label: string }[] = [
    { value: "all", label: "All Dining Types" },
    { value: "quick-service", label: "Quick Service" },
    { value: "table-service", label: "Table Service" },
    { value: "fine-dining", label: "Fine/Signature Dining" },
    { value: "character-dining", label: "Character Dining" },
    { value: "bar-lounge", label: "Bars & Lounges" },
    { value: "snack", label: "Snacks & Carts" },
]

export const PRICE_RANGE_OPTIONS: { value: PriceRange | "all"; label: string }[] = [
    { value: "all", label: "All Price Ranges" },
    { value: "$", label: "$ (Under $14.99)" },
    { value: "$$", label: "$$ ($15 - $34.99)" },
    { value: "$$$", label: "$$$ ($35 - $59.99)" },
    { value: "$$$$", label: "$$$$ ($60 and up)" },
]

export const SORT_BY_OPTIONS: {
    value: "relevance" | "popularity" | "rating"
    label: string
}[] = [
        { value: "relevance", label: "Sort by Relevance" },
        { value: "popularity", label: "Sort by Popularity" },
        { value: "rating", label: "Sort by User Rating" },
    ]

// Weights for scoring - these would be fine-tuned
export const SCORING_WEIGHTS = {
    POPULARITY: 0.2,
    USER_RATING: 0.3,
    PREFERENCE_MATCH: 0.5, // Higher weight for direct preference matches
    PARK_MATCH: 0.1,
    CONTEXT_TIME_MATCH: 0.15, // e.g., fireworks at night
    AVOIDANCE_PENALTY: -0.8, // Strong penalty for avoided types
    PAST_POSITIVE_INTERACTION: 0.25,
    PAST_NEGATIVE_INTERACTION: -0.4,
    THRILL_LEVEL_MATCH: 0.1,
    PRICE_RANGE_MATCH: 0.1,
    CHARACTER_MATCH: 0.2,
    RECENCY_BOOST: 0.05, // Boost for newer items or recently updated info
    DIVERSITY_PENALTY_FACTOR: 0.05, // To penalize recommending too many similar items
    HIDDEN_GEM_BOOST: 0.1, // For less popular but highly-rated items
}

export const MAX_RECOMMENDATIONS_DEFAULT = 10

export const POPULARITY_THRESHOLD = 1000 // e.g., min number of ratings/views to be considered popular
export const HIGH_RATING_THRESHOLD = 4.0 // e.g., average rating above this is considered high