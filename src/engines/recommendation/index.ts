/*
 * Recommendation Engine
 * ----------------------
 * This module provides a sophisticated, preference-aware recommendation engine
 * for Walt Disney World attractions, dining venues, and events.  It leverages
 * live wait-time data, user preferences, party composition, location context,
 * and accessibility needs to rank experiences with an explainable scoring
 * model.
 *
 * Architectural notes:
 * • Functional & declarative style (no classes in external API)
 * • Explicit interfaces for all inputs & outputs
 * • Tree-shaken, side-effect-free helpers
 * • Narrow error handling with user-friendly messages
 *
 * Usage example:
 * --------------
 * const engine = createRecommendationEngine({
 *   parkId: 'magic-kingdom',
 *   party: { adults: 2, childrenAges: [8, 5] },
 *   preferences: {
 *     attractionTypes: [AttractionType.RIDE, AttractionType.SHOW],
 *     rideCategories: [RideCategory.Family, RideCategory.Kids],
 *     maxWaitTime: 45
 *   },
 *   currentLocation: { latitude: 28.4194, longitude: -81.5820 }
 * })
 *
 * const {
 *   attractions,
 *   dining,
 *   events
 * } = await engine.generate()
 */

import { getParkAttractions, getParkLiveData } from '@/lib/api/themeParks'
import type {
    Attraction,
    Coordinates,
    Event,
    DiningVenue
} from '@/types/api'
import {
    AttractionType
} from '@/types/api'
import {
    RideCategory
} from '@/types/attraction'

// -------------------------------------------------------------------------------------
// Input / Output Types
// -------------------------------------------------------------------------------------

/**
 * User party definition – used for suitability checks (height, mobility, etc.)
 */
interface Party {
    adults: number
    childrenAges?: number[]
    mobilityConsiderations?: boolean
}

/**
 * Fine-grained user preferences.  All fields are optional; sensible defaults apply.
 */
interface UserPreferences {
    /** Preferred attraction categories (e.g., RIDE, SHOW) */
    attractionTypes?: AttractionType[]
    /** Preferred ride styles (e.g., Thrill, Family) */
    rideCategories?: RideCategory[]
    /** Ride styles the user wishes to avoid */
    avoidRideCategories?: RideCategory[]
    /** Exclude specific attraction IDs */
    excludedAttractions?: string[]
    /** Must-do attraction IDs (always bubble to top, score boost) */
    mustIncludeAttractions?: string[]
    /** Maximum acceptable posted wait time (minutes) */
    maxWaitTime?: number
    /** Walking pace preference – influences distance penalty */
    walkingPace?: 'slow' | 'moderate' | 'fast'
}

/**
 * Engine configuration – immutable after instantiation.
 */
export interface RecommendationParameters {
    parkId: string
    date?: string // ISO yyyy-mm-dd, defaults to today
    currentTime?: string // ISO timestamp, defaults now
    currentLocation?: Coordinates
    maxResults?: number // per category; default 10
    party: Party
    preferences?: UserPreferences
}

/**
 * Single recommendation wrapper returned by the engine.
 */
export interface Recommendation<T extends { id: string; name: string }> {
    item: T
    score: number
    reasons: string[]
}

/**
 * Aggregate result returned by generate().
 */
export interface RecommendationResult {
    attractions: Recommendation<Attraction>[]
    dining: Recommendation<DiningVenue>[]
    events: Recommendation<Event>[]
}

// -------------------------------------------------------------------------------------
// Scoring Constants – tweak here to adjust weighting model
// -------------------------------------------------------------------------------------

const BASE_SCORE = 50 // starting score for every item
// Positive weights (added to BASE_SCORE)
const MATCHED_TYPE_BONUS = 25
const MATCHED_CATEGORY_BONUS = 15
const MUST_INCLUDE_BONUS = 50
// Negative penalties (subtracted from BASE_SCORE)
const WAIT_TIME_PENALTY_PER_MIN = 0.5
const DISTANCE_PENALTY_PER_KM = 8
const HEIGHT_REQUIREMENT_PENALTY = 30
const EXCLUDED_PENALTY = 1000 // effectively removes item from results

// -------------------------------------------------------------------------------------
// Utility helpers – pure functions, easily testable
// -------------------------------------------------------------------------------------

function haversineDistance(a: Coordinates, b: Coordinates): number {
    const R = 6371 // km
    const dLat = toRad(b.latitude - a.latitude)
    const dLon = toRad(b.longitude - a.longitude)
    const lat1 = toRad(a.latitude)
    const lat2 = toRad(b.latitude)

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2

    return 2 * R * Math.asin(Math.sqrt(h))
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180)
}

function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max)
}

// Height suitability – simple min height check (cm)
function isHeightUnsuitable(minHeightCm = 0, childrenAges?: number[]): boolean {
    if (!minHeightCm || !childrenAges || childrenAges.length === 0) return false

    // Rough heuristic: average child height in cm = age * 6.5 + 60
    const tallestChildHeight = Math.max(
        ...childrenAges.map(age => Math.round(age * 6.5 + 60))
    )
    return tallestChildHeight < minHeightCm
}

// Determine distance penalty multiplier based on walking pace
function getPaceMultiplier(pace: UserPreferences['walkingPace']): number {
    switch (pace) {
        case 'slow':
            return 1.3
        case 'fast':
            return 0.8
        default:
            return 1
    }
}

// -------------------------------------------------------------------------------------
// Core recommendation engine factory
// -------------------------------------------------------------------------------------

export function createRecommendationEngine(params: RecommendationParameters) {
    const {
        parkId,
        date = new Date().toISOString().slice(0, 10),
        currentTime = new Date().toISOString(),
        currentLocation,
        maxResults = 10,
        party,
        preferences = {}
    } = params

    /**
     * Fetch static & live data in parallel.
     */
    async function loadData() {
        const [attractions, liveData] = await Promise.all([
            getParkAttractions(parkId),
            getParkLiveData(parkId)
        ])

        // Merge live wait-times onto static attractions list for convenience
        const enriched = attractions.map(attraction => {
            const live = liveData.attractions[attraction.id]
            return {
                ...attraction,
                waitTime: live?.waitTime?.standby ?? attraction.waitTime?.standby ?? -1,
                status: live?.status ?? attraction.status,
                lastUpdate: live?.lastUpdate ?? attraction.lastUpdate
            }
        })

        return { attractions: enriched }
    }

    /**
     * Calculate a composite score for a single attraction.
     */
    function scoreAttraction(attraction: Attraction): Recommendation<Attraction> {
        let score = BASE_SCORE
        const reasons: string[] = []

        // Exclusion & must-include handling --------------------------------------------------
        if (preferences.excludedAttractions?.includes(attraction.id)) {
            score -= EXCLUDED_PENALTY
            reasons.push('Excluded by user')
        }

        if (preferences.mustIncludeAttractions?.includes(attraction.id)) {
            score += MUST_INCLUDE_BONUS
            reasons.push('Marked as must-do')
        }

        // Attraction type -------------------------------------------------------------------
        if (
            preferences.attractionTypes?.length &&
            preferences.attractionTypes.includes(attraction.attractionType)
        ) {
            score += MATCHED_TYPE_BONUS
            reasons.push(`Matches preferred type ${attraction.attractionType}`)
        }

        // Ride category ---------------------------------------------------------------------
        if (attraction.tags?.length && preferences.rideCategories?.length) {
            const matched = attraction.tags.filter(tag =>
                preferences.rideCategories!.includes(tag as unknown as RideCategory)
            )
            if (matched.length) {
                score += MATCHED_CATEGORY_BONUS
                reasons.push(`Matches preferred category ${matched.join(', ')}`)
            }
        }

        if (attraction.tags?.length && preferences.avoidRideCategories?.length) {
            const avoided = attraction.tags.filter(tag =>
                preferences.avoidRideCategories!.includes(tag as unknown as RideCategory)
            )
            if (avoided.length) {
                score -= MATCHED_CATEGORY_BONUS
                reasons.push(`Avoided categories (${avoided.join(',')})`) // negative weight
            }
        }

        // Wait time -------------------------------------------------------------------------
        const wait = attraction.waitTime ?? -1
        if (wait >= 0) {
            const penalty = wait * WAIT_TIME_PENALTY_PER_MIN
            score -= penalty
            reasons.push(`Wait time ${wait}m (-${penalty.toFixed(1)})`)

            if (preferences.maxWaitTime && wait > preferences.maxWaitTime) {
                score -= 25 // additional hard penalty
                reasons.push(`Exceeds preferred max wait ${preferences.maxWaitTime}m`)
            }
        }

        // Distance --------------------------------------------------------------------------
        if (currentLocation && attraction.location) {
            const distKm = haversineDistance(currentLocation, attraction.location)
            const paceMult = getPaceMultiplier(preferences.walkingPace)
            const penalty = distKm * DISTANCE_PENALTY_PER_KM * paceMult
            score -= penalty
            reasons.push(`Distance ${distKm.toFixed(2)}km (-${penalty.toFixed(1)})`)
        }

        // Height suitability ----------------------------------------------------------------
        const minHeightCm = attraction.heightRequirement?.min ?? 0
        if (isHeightUnsuitable(minHeightCm, party.childrenAges)) {
            score -= HEIGHT_REQUIREMENT_PENALTY
            reasons.push(`Height requirement ${minHeightCm}cm not met`)
        }

        // Mobility considerations -----------------------------------------------------------
        if (party.mobilityConsiderations && attraction.tags?.includes('STAIRS')) {
            score -= 20
            reasons.push('Mobility unfriendly (stairs)')
        }

        // Clamp score within reasonable bounds
        score = clamp(score, -200, 200)

        return { item: attraction, score, reasons }
    }

    /**
     * Generate attraction recommendations list sorted by score.
     */
    function generateAttractionRecommendations(
        attractions: Attraction[]
    ): Recommendation<Attraction>[] {
        return attractions
            .map(scoreAttraction)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults)
    }

    // For now dining & events are placeholders; implement later -----------------------------
    function generateDiningRecommendations(): Recommendation<DiningVenue>[] {
        return []
    }

    function generateEventRecommendations(): Recommendation<Event>[] {
        return []
    }

    /**
     * Public generator – orchestrates data loading & scoring.
     */
    async function generate(): Promise<RecommendationResult> {
        const { attractions } = await loadData()

        return {
            attractions: generateAttractionRecommendations(attractions),
            dining: generateDiningRecommendations(),
            events: generateEventRecommendations()
        }
    }

    // Expose public API -------------------------------------------------------------
    return {
        /** ISO date engine was created */
        createdAt: currentTime,
        generate
    }
}