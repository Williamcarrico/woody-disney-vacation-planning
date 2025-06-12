/**
 * ThemeParks.wiki API Service
 * Comprehensive service for all themeparks.wiki API interactions
 */

import { cache } from 'react'
import type {
    ThemeParksPark,
    ThemeParksDestination,
    ThemeParksEntity,
    LiveDataResponse,
    ScheduleResponse,
    ChildrenResponse
} from '@/types/themeparks'
import { PARK_IDS } from '@/types/themeparks'

// Re-export PARK_IDS for external use
export { PARK_IDS }

const BASE_URL = 'https://api.themeparks.wiki/v1'

// Cache configuration
const CACHE_TTL = {
    entity: 3600, // 1 hour for static data
    live: 60, // 1 minute for live data
    schedule: 1800, // 30 minutes for schedule
    children: 1800 // 30 minutes for children
}

// In-memory cache for runtime caching
const runtimeCache = new Map<string, { data: unknown; timestamp: number }>()

/**
 * Enhanced fetch with caching and error handling
 */
async function fetchWithCache<T>(
    url: string,
    ttl: number = CACHE_TTL.entity
): Promise<T> {
    const cacheKey = url
    const cached = runtimeCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < ttl * 1000) {
        return cached.data
    }

    try {
        console.log(`[ThemeParks API] Fetching: ${url}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Disney Vacation Planning App',
            },
            next: { revalidate: ttl },
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unable to read response')
            const error = new Error(`API request failed: ${response.status} ${response.statusText}. Response: ${errorText}`)
            console.error(`[ThemeParks API] HTTP Error for ${url}:`, {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                url,
            })
            throw error
        }

        const data = await response.json()

        // Store in runtime cache
        runtimeCache.set(cacheKey, { data, timestamp: Date.now() })
        console.log(`[ThemeParks API] Successfully fetched and cached: ${url}`)

        return data
    } catch (error) {
        console.error(`[ThemeParks API] Error fetching from ${url}:`, {
            error: error instanceof Error ? error.message : String(error),
            name: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? error.stack : undefined,
            url,
            timestamp: new Date().toISOString(),
        })

        // Specific handling for different error types
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after 10 seconds for ${url}`)
            }
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error(`Network error - unable to connect to ${url}. Check your internet connection and the API availability.`)
            }
        }

        // Return cached data if available, even if expired
        if (cached) {
            console.warn(`[ThemeParks API] Returning stale cached data due to API error for ${url}`)
            return cached.data
        }

        throw error
    }
}

/**
 * Get entity details (park, attraction, restaurant, etc.)
 */
export const getEntity = cache(async (entityId: string): Promise<ThemeParksPark | ThemeParksEntity> => {
    return fetchWithCache<ThemeParksPark | ThemeParksEntity>(
        `${BASE_URL}/entity/${entityId}`,
        CACHE_TTL.entity
    )
})

/**
 * Get live data for an entity (wait times, status, etc.)
 */
export const getLiveData = async (entityId: string): Promise<LiveDataResponse> => {
    return fetchWithCache<LiveDataResponse>(
        `${BASE_URL}/entity/${entityId}/live`,
        CACHE_TTL.live
    )
}

/**
 * Get children entities (attractions, restaurants, shows, etc.)
 */
export const getChildren = cache(async (entityId: string): Promise<ChildrenResponse> => {
    return fetchWithCache<ChildrenResponse>(
        `${BASE_URL}/entity/${entityId}/children`,
        CACHE_TTL.children
    )
})

/**
 * Get schedule for an entity
 */
export const getSchedule = cache(async (
    entityId: string,
    year?: number,
    month?: number
): Promise<ScheduleResponse> => {
    let url = `${BASE_URL}/entity/${entityId}/schedule`

    if (year && month) {
        url = `${url}/${year}/${String(month).padStart(2, '0')}`
    }

    return fetchWithCache<ScheduleResponse>(url, CACHE_TTL.schedule)
})

/**
 * Get all destinations
 */
export const getDestinations = cache(async (): Promise<ThemeParksDestination[]> => {
    const response = await fetchWithCache<{ destinations: ThemeParksDestination[] }>(
        `${BASE_URL}/destinations`,
        CACHE_TTL.entity
    )
    return response.destinations || []
})

/**
 * Get Disney destinations only
 */
export const getDisneyDestinations = cache(async (): Promise<ThemeParksDestination[]> => {
    const destinations = await getDestinations()
    return destinations.filter(dest =>
        dest.slug?.toLowerCase().includes('disney')
    )
})

/**
 * Get Magic Kingdom specific data
 */
export const getMagicKingdom = cache(async () => {
    return getEntity(PARK_IDS.MAGIC_KINGDOM) as Promise<ThemeParksPark>
})

/**
 * Get Magic Kingdom live data
 */
export const getMagicKingdomLive = async () => {
    return getLiveData(PARK_IDS.MAGIC_KINGDOM)
}

/**
 * Get Magic Kingdom attractions
 */
export const getMagicKingdomAttractions = cache(async () => {
    return getChildren(PARK_IDS.MAGIC_KINGDOM)
})

/**
 * Get Magic Kingdom schedule
 */
export const getMagicKingdomSchedule = cache(async (year?: number, month?: number) => {
    return getSchedule(PARK_IDS.MAGIC_KINGDOM, year, month)
})

/**
 * Get EPCOT specific data
 */
export const getEpcot = cache(async () => {
    return getEntity(PARK_IDS.EPCOT) as Promise<ThemeParksPark>
})

/**
 * Get EPCOT live data
 */
export const getEpcotLive = async () => {
    return getLiveData(PARK_IDS.EPCOT)
}

/**
 * Get EPCOT attractions
 */
export const getEpcotAttractions = cache(async () => {
    return getChildren(PARK_IDS.EPCOT)
})

/**
 * Get EPCOT schedule
 */
export const getEpcotSchedule = cache(async (year?: number, month?: number) => {
    return getSchedule(PARK_IDS.EPCOT, year, month)
})

/**
 * Get Hollywood Studios specific data
 */
export const getHollywoodStudios = cache(async () => {
    return getEntity(PARK_IDS.HOLLYWOOD_STUDIOS) as Promise<ThemeParksPark>
})

/**
 * Get Hollywood Studios live data
 */
export const getHollywoodStudiosLive = async () => {
    return getLiveData(PARK_IDS.HOLLYWOOD_STUDIOS)
}

/**
 * Get Hollywood Studios attractions
 */
export const getHollywoodStudiosAttractions = cache(async () => {
    return getChildren(PARK_IDS.HOLLYWOOD_STUDIOS)
})

/**
 * Get Hollywood Studios schedule
 */
export const getHollywoodStudiosSchedule = cache(async (year?: number, month?: number) => {
    return getSchedule(PARK_IDS.HOLLYWOOD_STUDIOS, year, month)
})

/**
 * Get Animal Kingdom specific data
 */
export const getAnimalKingdom = cache(async () => {
    return getEntity(PARK_IDS.ANIMAL_KINGDOM) as Promise<ThemeParksPark>
})

/**
 * Get Animal Kingdom live data
 */
export const getAnimalKingdomLive = async () => {
    return getLiveData(PARK_IDS.ANIMAL_KINGDOM)
}

/**
 * Get Animal Kingdom attractions
 */
export const getAnimalKingdomAttractions = cache(async () => {
    return getChildren(PARK_IDS.ANIMAL_KINGDOM)
})

/**
 * Get Animal Kingdom schedule
 */
export const getAnimalKingdomSchedule = cache(async (year?: number, month?: number) => {
    return getSchedule(PARK_IDS.ANIMAL_KINGDOM, year, month)
})

/**
 * Get all Walt Disney World children (all parks, hotels, etc.)
 */
export const getWaltDisneyWorldChildren = cache(async () => {
    return getChildren(PARK_IDS.WALT_DISNEY_WORLD_RESORT)
})

/**
 * Get Walt Disney World live data
 */
export const getWaltDisneyWorldLive = async () => {
    return getLiveData(PARK_IDS.WALT_DISNEY_WORLD_RESORT)
}

/**
 * Get park by slug mapping
 */
const SLUG_TO_ID_MAP: Record<string, string> = {
    'magic-kingdom': PARK_IDS.MAGIC_KINGDOM,
    'epcot': PARK_IDS.EPCOT,
    'hollywood-studios': PARK_IDS.HOLLYWOOD_STUDIOS,
    'animal-kingdom': PARK_IDS.ANIMAL_KINGDOM
}

export const getParkBySlug = cache(async (slug: string): Promise<ThemeParksPark> => {
    const parkId = SLUG_TO_ID_MAP[slug]
    if (!parkId) {
        throw new Error(`Unknown park slug: ${slug}`)
    }
    return getEntity(parkId) as Promise<ThemeParksPark>
})

/**
 * Get live data for park by slug
 */
export const getParkLiveDataBySlug = async (slug: string) => {
    const parkId = SLUG_TO_ID_MAP[slug]
    if (!parkId) {
        throw new Error(`Unknown park slug: ${slug}`)
    }
    return getLiveData(parkId)
}

/**
 * Get attractions for park by slug
 */
export const getParkAttractionsBySlug = cache(async (slug: string) => {
    const parkId = SLUG_TO_ID_MAP[slug]
    if (!parkId) {
        throw new Error(`Unknown park slug: ${slug}`)
    }
    return getChildren(parkId)
})

/**
 * Get schedule for park by slug
 */
export const getParkScheduleBySlug = cache(async (
    slug: string,
    year?: number,
    month?: number
) => {
    const parkId = SLUG_TO_ID_MAP[slug]
    if (!parkId) {
        throw new Error(`Unknown park slug: ${slug}`)
    }
    return getSchedule(parkId, year, month)
})

/**
 * Clear runtime cache (useful for testing or forced refresh)
 */
export function clearCache() {
    runtimeCache.clear()
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
    const stats = {
        size: runtimeCache.size,
        entries: [] as Array<{ key: string; age: number }>
    }

    runtimeCache.forEach((value, key) => {
        stats.entries.push({
            key,
            age: Math.floor((Date.now() - value.timestamp) / 1000)
        })
    })

    return stats
}