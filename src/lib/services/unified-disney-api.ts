/**
 * Unified Disney API Service
 * Aggregates data from multiple Disney API sources with intelligent fallback and enrichment
 */

import { cache } from 'react'
import * as themeParksAPI from './themeparks-api'
import * as disneyAPI from './disney-api'
import type {
    ThemeParksPark,
    LiveDataItem,
    ScheduleEntry,
    ThemeParksEntity,
    EntityType
} from '@/types/themeparks'
import { PARK_IDS } from '@/types/themeparks'
import type { DisneyCharacter } from './disney-api'

// Enhanced types for unified data
export interface UnifiedParkData extends ThemeParksPark {
    currentWaitTimes?: UnifiedWaitTime[]
    todaySchedule?: ScheduleEntry
    crowdLevel?: number
    weatherForecast?: WeatherData
    associatedCharacters?: DisneyCharacter[]
    realTimeUpdates?: boolean
}

export interface UnifiedWaitTime {
    id: string
    name: string
    waitTime: number | null
    status: 'OPERATING' | 'CLOSED' | 'REFURBISHMENT' | 'DOWN'
    fastPassAvailable?: boolean
    lightningLaneAvailable?: boolean
    virtualQueueAvailable?: boolean
    lastUpdate: string
    trend?: 'INCREASING' | 'DECREASING' | 'STABLE'
    predictedWaitTime?: number
    associatedCharacters?: DisneyCharacter[]
}

export interface UnifiedAttractionData extends ThemeParksEntity {
    currentWaitTime?: UnifiedWaitTime
    description?: string
    restrictions?: {
        minHeight?: number
        maxHeight?: number
        ageRestrictions?: string
        accessibility?: string[]
    }
    associatedCharacters?: DisneyCharacter[]
    media?: {
        images?: string[]
        videos?: string[]
        virtualTour?: string
    }
    tips?: string[]
    bestTimes?: string[]
    averageRating?: number
}

export interface WeatherData {
    temperature: number
    feelsLike: number
    conditions: string
    precipitation: number
    windSpeed: number
    humidity: number
}

// Cache for aggregated data
const aggregatedCache = new Map<string, { data: any; timestamp: number }>()
const AGGREGATED_CACHE_TTL = 300 // 5 minutes for aggregated data

/**
 * Get comprehensive park data with all available information
 */
export const getUnifiedParkData = cache(async (
    parkId: string
): Promise<UnifiedParkData> => {
    const cacheKey = `unified-park-${parkId}`
    const cached = aggregatedCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < AGGREGATED_CACHE_TTL * 1000) {
        return cached.data
    }

    try {
        // Fetch all data in parallel
        const [
            parkData,
            liveData,
            scheduleData,
            childrenData
        ] = await Promise.allSettled([
            themeParksAPI.getEntity(parkId) as Promise<ThemeParksPark>,
            themeParksAPI.getLiveData(parkId),
            themeParksAPI.getSchedule(parkId),
            themeParksAPI.getChildren(parkId)
        ])

        // Process park data
        const park = parkData.status === 'fulfilled' ? parkData.value : null
        if (!park) throw new Error('Failed to fetch park data')

        // Process live data for wait times
        let currentWaitTimes: UnifiedWaitTime[] = []
        if (liveData.status === 'fulfilled') {
            currentWaitTimes = liveData.value.liveData
                .filter(item => item.entityType === EntityType.ATTRACTION)
                .map(item => ({
                    id: item.id,
                    name: item.name,
                    waitTime: item.queue?.STANDBY?.waitTime || null,
                    status: item.status,
                    fastPassAvailable: false, // Legacy
                    lightningLaneAvailable: !!item.queue?.PAID_RETURN_TIME,
                    virtualQueueAvailable: !!item.queue?.RETURN_TIME,
                    lastUpdate: liveData.value.lastUpdate,
                    trend: 'STABLE' // Would need historical data to calculate
                }))
        }

        // Get today's schedule
        let todaySchedule: ScheduleEntry | undefined
        if (scheduleData.status === 'fulfilled') {
            const today = new Date().toISOString().split('T')[0]
            todaySchedule = scheduleData.value.schedule.find(s => s.date === today)
        }

        // Get associated characters for the park
        let associatedCharacters: DisneyCharacter[] = []
        if (childrenData.status === 'fulfilled') {
            // Get attraction names for character lookup
            const attractionNames = childrenData.value.children
                .filter(child => child.entityType === EntityType.ATTRACTION)
                .map(attraction => attraction.name)

            // Fetch characters for each attraction (limited to first 5 to avoid too many requests)
            const characterPromises = attractionNames.slice(0, 5).map(name =>
                disneyAPI.getCharactersByParkAttraction(name).catch(() => [])
            )

            const characterResults = await Promise.all(characterPromises)
            associatedCharacters = Array.from(
                new Map(
                    characterResults.flat().map(char => [char._id, char])
                ).values()
            ).slice(0, 20) // Limit to 20 characters
        }

        const unifiedData: UnifiedParkData = {
            ...park,
            currentWaitTimes,
            todaySchedule,
            crowdLevel: calculateCrowdLevel(currentWaitTimes),
            associatedCharacters,
            realTimeUpdates: true
        }

        // Cache the result
        aggregatedCache.set(cacheKey, { data: unifiedData, timestamp: Date.now() })

        return unifiedData
    } catch (error) {
        console.error('Error fetching unified park data:', error)

        // Return cached data if available
        if (cached) {
            console.warn('Returning stale unified park data')
            return cached.data
        }

        throw error
    }
})

/**
 * Get unified attraction data with character associations
 */
export const getUnifiedAttractionData = cache(async (
    attractionId: string
): Promise<UnifiedAttractionData> => {
    const cacheKey = `unified-attraction-${attractionId}`
    const cached = aggregatedCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < AGGREGATED_CACHE_TTL * 1000) {
        return cached.data
    }

    try {
        // Fetch attraction and park data
        const [attractionData, parentParkLiveData] = await Promise.allSettled([
            themeParksAPI.getEntity(attractionId),
            // We'd need to know the parent park ID - for now, try all parks
            Promise.all([
                themeParksAPI.getLiveData(PARK_IDS.MAGIC_KINGDOM).catch(() => null),
                themeParksAPI.getLiveData(PARK_IDS.EPCOT).catch(() => null),
                themeParksAPI.getLiveData(PARK_IDS.HOLLYWOOD_STUDIOS).catch(() => null),
                themeParksAPI.getLiveData(PARK_IDS.ANIMAL_KINGDOM).catch(() => null),
            ])
        ])

        if (attractionData.status !== 'fulfilled') {
            throw new Error('Failed to fetch attraction data')
        }

        const attraction = attractionData.value

        // Find live data for this attraction
        let currentWaitTime: UnifiedWaitTime | undefined
        if (parentParkLiveData.status === 'fulfilled') {
            for (const parkLiveData of parentParkLiveData.value) {
                if (!parkLiveData) continue

                const liveItem = parkLiveData.liveData.find(item => item.id === attractionId)
                if (liveItem) {
                    currentWaitTime = {
                        id: liveItem.id,
                        name: liveItem.name,
                        waitTime: liveItem.queue?.STANDBY?.waitTime || null,
                        status: liveItem.status,
                        lightningLaneAvailable: !!liveItem.queue?.PAID_RETURN_TIME,
                        virtualQueueAvailable: !!liveItem.queue?.RETURN_TIME,
                        lastUpdate: parkLiveData.lastUpdate,
                        trend: 'STABLE'
                    }
                    break
                }
            }
        }

        // Get associated characters
        const associatedCharacters = await disneyAPI.getCharactersByParkAttraction(attraction.name)
            .catch(() => [])

        const unifiedData: UnifiedAttractionData = {
            ...attraction,
            currentWaitTime,
            associatedCharacters: associatedCharacters.slice(0, 10), // Limit to 10 characters
            // These would come from a CMS or additional data source
            description: `Experience the magic of ${attraction.name}`,
            tips: [
                'Visit during parades for shorter wait times',
                'Check for Lightning Lane availability'
            ],
            bestTimes: ['Early morning', 'Late evening']
        }

        // Cache the result
        aggregatedCache.set(cacheKey, { data: unifiedData, timestamp: Date.now() })

        return unifiedData
    } catch (error) {
        console.error('Error fetching unified attraction data:', error)

        if (cached) {
            console.warn('Returning stale unified attraction data')
            return cached.data
        }

        throw error
    }
})

/**
 * Get wait times across all WDW parks
 */
export const getAllParksWaitTimes = cache(async (): Promise<{
    parks: Array<{
        parkId: string
        parkName: string
        waitTimes: UnifiedWaitTime[]
        averageWaitTime: number
    }>
    lastUpdate: string
}> => {
    const parkIds = [
        { id: themeParksAPI.PARK_IDS.MAGIC_KINGDOM, name: 'Magic Kingdom' },
        { id: themeParksAPI.PARK_IDS.EPCOT, name: 'EPCOT' },
        { id: themeParksAPI.PARK_IDS.HOLLYWOOD_STUDIOS, name: 'Hollywood Studios' },
        { id: themeParksAPI.PARK_IDS.ANIMAL_KINGDOM, name: 'Animal Kingdom' }
    ]

    const parkDataPromises = parkIds.map(async ({ id, name }) => {
        try {
            const liveData = await themeParksAPI.getLiveData(id)
            const waitTimes: UnifiedWaitTime[] = liveData.liveData
                .filter(item => item.entityType === EntityType.ATTRACTION && item.queue?.STANDBY)
                .map(item => ({
                    id: item.id,
                    name: item.name,
                    waitTime: item.queue?.STANDBY?.waitTime || null,
                    status: item.status,
                    lightningLaneAvailable: !!item.queue?.PAID_RETURN_TIME,
                    virtualQueueAvailable: !!item.queue?.RETURN_TIME,
                    lastUpdate: liveData.lastUpdate,
                    trend: 'STABLE'
                }))

            const operatingAttractions = waitTimes.filter(wt => wt.status === 'OPERATING' && wt.waitTime !== null)
            const averageWaitTime = operatingAttractions.length > 0
                ? Math.round(operatingAttractions.reduce((sum, wt) => sum + (wt.waitTime || 0), 0) / operatingAttractions.length)
                : 0

            return {
                parkId: id,
                parkName: name,
                waitTimes,
                averageWaitTime
            }
        } catch (error) {
            console.error(`Error fetching wait times for ${name}:`, error)
            return {
                parkId: id,
                parkName: name,
                waitTimes: [],
                averageWaitTime: 0
            }
        }
    })

    const parks = await Promise.all(parkDataPromises)

    return {
        parks,
        lastUpdate: new Date().toISOString()
    }
})

/**
 * Search attractions across all parks with character associations
 */
export const searchAttractionsWithCharacters = cache(async (
    query: string
): Promise<UnifiedAttractionData[]> => {
    const allParksChildren = await Promise.all([
        themeParksAPI.getChildren(themeParksAPI.PARK_IDS.MAGIC_KINGDOM),
        themeParksAPI.getChildren(themeParksAPI.PARK_IDS.EPCOT),
        themeParksAPI.getChildren(themeParksAPI.PARK_IDS.HOLLYWOOD_STUDIOS),
        themeParksAPI.getChildren(themeParksAPI.PARK_IDS.ANIMAL_KINGDOM)
    ])

    const allAttractions = allParksChildren
        .flatMap(park => park.children)
        .filter(child =>
            child.entityType === EntityType.ATTRACTION &&
            child.name.toLowerCase().includes(query.toLowerCase())
        )

    // Get character data for matching attractions
    const attractionsWithCharacters = await Promise.all(
        allAttractions.slice(0, 10).map(async (attraction) => {
            const characters = await disneyAPI.getCharactersByParkAttraction(attraction.name)
                .catch(() => [])

            return {
                ...attraction,
                associatedCharacters: characters.slice(0, 5)
            } as UnifiedAttractionData
        })
    )

    return attractionsWithCharacters
})

/**
 * Calculate crowd level based on wait times
 */
export function calculateCrowdLevel(waitTimesOrAverage: UnifiedWaitTime[] | number): number {
    let averageWait: number

    if (typeof waitTimesOrAverage === 'number') {
        averageWait = waitTimesOrAverage
    } else {
        const operatingAttractions = waitTimesOrAverage.filter(
            wt => wt.status === 'OPERATING' && wt.waitTime !== null
        )

        if (operatingAttractions.length === 0) return 0

        averageWait = operatingAttractions.reduce(
            (sum, wt) => sum + (wt.waitTime || 0), 0
        ) / operatingAttractions.length
    }

    // Crowd level scale 1-10
    if (averageWait < 15) return 1
    if (averageWait < 25) return 3
    if (averageWait < 35) return 5
    if (averageWait < 50) return 7
    if (averageWait < 70) return 9
    return 10
}

/**
 * Get recommended attractions based on wait times and preferences
 */
export const getRecommendedAttractions = cache(async (
    parkId: string,
    preferences?: {
        maxWaitTime?: number
        characterPreferences?: string[]
        attractionTypes?: string[]
    }
): Promise<UnifiedAttractionData[]> => {
    const [parkChildren, liveData] = await Promise.all([
        themeParksAPI.getChildren(parkId),
        themeParksAPI.getLiveData(parkId)
    ])

    const attractions = parkChildren.children.filter(
        child => child.entityType === EntityType.ATTRACTION
    )

    // Create a map of live data
    const liveDataMap = new Map(
        liveData.liveData.map(item => [item.id, item])
    )

    // Score and filter attractions
    const scoredAttractions = await Promise.all(
        attractions.map(async (attraction) => {
            const live = liveDataMap.get(attraction.id)
            const waitTime = live?.queue?.STANDBY?.waitTime || 0

            // Skip if wait time exceeds preference
            if (preferences?.maxWaitTime && waitTime > preferences.maxWaitTime) {
                return null
            }

            // Get character associations
            const characters = await disneyAPI.getCharactersByParkAttraction(attraction.name)
                .catch(() => [])

            // Calculate score
            let score = 100 - waitTime // Base score inversely proportional to wait time

            // Bonus for matching character preferences
            if (preferences?.characterPreferences && characters.length > 0) {
                const matchingCharacters = characters.filter(char =>
                    preferences.characterPreferences?.some(pref =>
                        char.name.toLowerCase().includes(pref.toLowerCase())
                    )
                )
                score += matchingCharacters.length * 20
            }

            // Bonus for operating status
            if (live?.status === 'OPERATING') {
                score += 50
            }

            return {
                attraction: {
                    ...attraction,
                    associatedCharacters: characters.slice(0, 5),
                    currentWaitTime: {
                        id: attraction.id,
                        name: attraction.name,
                        waitTime,
                        status: live?.status || 'CLOSED',
                        lightningLaneAvailable: !!live?.queue?.PAID_RETURN_TIME,
                        virtualQueueAvailable: !!live?.queue?.RETURN_TIME,
                        lastUpdate: liveData.lastUpdate,
                        trend: 'STABLE'
                    }
                } as UnifiedAttractionData,
                score
            }
        })
    )

    // Filter out nulls and sort by score
    const validAttractions = scoredAttractions
        .filter(item => item !== null)
        .sort((a, b) => b!.score - a!.score)
        .slice(0, 10)
        .map(item => item!.attraction)

    return validAttractions
})

/**
 * Clear all unified caches
 */
export function clearUnifiedCache() {
    aggregatedCache.clear()
    themeParksAPI.clearCache()
    disneyAPI.clearDisneyAPICache()
}

/**
 * Get unified cache statistics
 */
export function getUnifiedCacheStats() {
    return {
        unified: {
            size: aggregatedCache.size,
            entries: Array.from(aggregatedCache.entries()).map(([key, value]) => ({
                key,
                age: Math.floor((Date.now() - value.timestamp) / 1000)
            }))
        },
        themeparks: themeParksAPI.getCacheStats(),
        disney: disneyAPI.getDisneyAPICacheStats()
    }
}