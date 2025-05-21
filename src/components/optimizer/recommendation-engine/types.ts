export type AttractionType =
    | "thrill"
    | "family"
    | "kids"
    | "show"
    | "water"
    | "character-meet"
    | "parade"
    | "fireworks"

export type DiningType =
    | "quick-service"
    | "table-service"
    | "fine-dining"
    | "character-dining"
    | "bar-lounge"
    | "snack"

export type PriceRange = "$" | "$$" | "$$$" | "$$$$"

export type ParkId =
    | "magic-kingdom"
    | "epcot"
    | "hollywood-studios"
    | "animal-kingdom"
    | "typhoon-lagoon"
    | "blizzard-beach"
    | "disney-springs"

export interface UserPreferences {
    userId: string
    preferredParks?: ParkId[]
    preferredAttractionTypes?: AttractionType[]
    preferredDiningTypes?: DiningType[]
    avoidedAttractionTypes?: AttractionType[]
    preferredPriceRanges?: PriceRange[]
    partySize?: number
    hasYoungChildren?: boolean
    favoriteCharacters?: string[]
    pastVisits?: PastVisit[]
    preferredIntensity?: "low" | "medium" | "high"
    mobilityNeeds?: boolean
    preferredPace?: "relaxed" | "moderate" | "fast"
}

export interface PastVisit {
    itemId: string
    itemType: "attraction" | "dining" | "show" | "event"
    rating?: 1 | 2 | 3 | 4 | 5 // 1-5 stars
    lastVisited?: Date
}

export interface ItemBase {
    id: string
    name: string
    description: string
    parkId: ParkId
    location?: string // e.g., "Fantasyland", "World Showcase - Italy Pavilion"
    tags?: string[] // General tags like "indoor", "outdoor", "interactive"
    imageUrl?: string
    userRating?: {
        average: number
        count: number
    }
    officialRating?: string // e.g., "Must-do", "Popular"
    heightRequirement?: number // in cm
    accessibilityFeatures?: string[]
}

export interface AttractionItem extends ItemBase {
    type: "attraction"
    attractionType: AttractionType
    duration?: number // in minutes
    thrillLevel?: "low" | "medium" | "high"
    geniePlusAvailable?: boolean
    individualLightningLaneAvailable?: boolean
    expectedWaitTime?: number // current or average, in minutes
}

export interface DiningItem extends ItemBase {
    type: "dining"
    diningType: DiningType
    cuisine?: string[]
    priceRange?: PriceRange
    reservationsRecommended?: boolean
    mobileOrderAvailable?: boolean
    menuUrl?: string
}

export interface ShowItem extends ItemBase {
    type: "show"
    showType: "stage" | "street-performance" | "fireworks" | "parade"
    duration?: number // in minutes
    showTimes?: string[] // e.g., ["10:00 AM", "2:00 PM", "7:30 PM"]
}

export interface EventItem extends ItemBase {
    type: "event"
    eventType: "special-ticketed" | "festival" | "seasonal"
    eventDates?: { startDate: Date; endDate: Date }
    eventTimes?: string[]
}

export type RecommendableItem = AttractionItem | DiningItem | ShowItem | EventItem

export interface Recommendation {
    item: RecommendableItem
    score: number // 0-1, indicating relevance
    reasoning: string[] // Why this is recommended, e.g., "Matches your preference for thrill rides"
    source:
    | "popularity"
    | "content-based"
    | "collaborative-filtering"
    | "contextual"
    | "user-history"
    | "hidden-gem"
    priority?: number // For tie-breaking or boosting certain recommendations
}

export interface RecommendationEngineProps {
    userPreferences: UserPreferences
    allItems: RecommendableItem[] // This would ideally come from a context or API
    currentContext?: {
        timeOfDay?: "morning" | "afternoon" | "evening" | "night"
        currentPark?: ParkId
        weather?: "sunny" | "cloudy" | "rainy"
    }
    maxRecommendations?: number
}

export interface RecommendationFilters {
    parkId?: ParkId | "all"
    itemType?: "attraction" | "dining" | "show" | "event" | "all"
    attractionType?: AttractionType | "all"
    diningType?: DiningType | "all"
    priceRange?: PriceRange | "all"
    sortBy?: "relevance" | "popularity" | "rating"
    showOnlyAvailableGeniePlus?: boolean
    showOnlyAvailableLightningLane?: boolean
    maxWaitTime?: number // in minutes
}