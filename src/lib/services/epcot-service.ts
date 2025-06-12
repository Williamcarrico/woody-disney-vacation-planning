/**
 * EPCOT-specific service
 * Enhanced functionality for EPCOT attractions, dining, festivals, and experiences
 */

import { cache } from 'react'
import * as themeParksAPI from './themeparks-api'
import type { LiveDataItem, ThemeParksEntity, ChildrenResponse } from '@/types/themeparks'

// EPCOT constants
export const EPCOT_ID = '47f90d2c-e191-4239-a466-5892ef59a88b'
export const EPCOT_PARENT_ID = 'e957da41-3552-4cf6-b636-5babc5cbc4e5'

// EPCOT Areas
export enum EpcotArea {
    WORLD_CELEBRATION = 'World Celebration',
    WORLD_DISCOVERY = 'World Discovery',
    WORLD_NATURE = 'World Nature',
    WORLD_SHOWCASE = 'World Showcase'
}

// World Showcase Countries
export enum WorldShowcaseCountry {
    MEXICO = 'Mexico',
    NORWAY = 'Norway',
    CHINA = 'China',
    GERMANY = 'Germany',
    ITALY = 'Italy',
    AMERICA = 'The American Adventure',
    JAPAN = 'Japan',
    MOROCCO = 'Morocco',
    FRANCE = 'France',
    UNITED_KINGDOM = 'United Kingdom',
    CANADA = 'Canada'
}

// EPCOT Festivals
export interface EpcotFestival {
    name: string
    startMonth: number
    endMonth: number
    description: string
    features: string[]
}

export const EPCOT_FESTIVALS: EpcotFestival[] = [
    {
        name: 'EPCOT International Festival of the Arts',
        startMonth: 1,
        endMonth: 2,
        description: 'Celebrate the visual, culinary, and performing arts',
        features: ['Art galleries', 'Live performances', 'Food studios', 'Interactive workshops']
    },
    {
        name: 'EPCOT International Flower & Garden Festival',
        startMonth: 3,
        endMonth: 5,
        description: 'Stunning topiaries, gardens, and outdoor kitchens',
        features: ['Character topiaries', 'Garden tours', 'Outdoor kitchens', 'Garden Rocks concerts']
    },
    {
        name: 'EPCOT International Food & Wine Festival',
        startMonth: 8,
        endMonth: 11,
        description: 'Global marketplace featuring cuisine from around the world',
        features: ['Global marketplaces', 'Culinary demonstrations', 'Eat to the Beat concerts', 'Wine tastings']
    },
    {
        name: 'EPCOT International Festival of the Holidays',
        startMonth: 11,
        endMonth: 12,
        description: 'Holiday traditions from around the world',
        features: ['Holiday kitchens', 'Candlelight Processional', 'Holiday storytellers', 'Cookie stroll']
    }
]

// Area mappings for attractions
export const AREA_ATTRACTIONS: Record<EpcotArea, string[]> = {
    [EpcotArea.WORLD_CELEBRATION]: [
        'Spaceship Earth',
        'Journey Into Imagination',
        'The Seas with Nemo & Friends',
        'Turtle Talk with Crush',
        'SeaBase',
        'ImageWorks',
        'DuckTales World Showcase Adventure',
        'Club Cool'
    ],
    [EpcotArea.WORLD_DISCOVERY]: [
        'Guardians of the Galaxy: Cosmic Rewind',
        'Mission: SPACE',
        'Test Track',
        'PLAY!'
    ],
    [EpcotArea.WORLD_NATURE]: [
        'Soarin\' Around the World',
        'Living with the Land',
        'The Land Pavilion',
        'Awesome Planet'
    ],
    [EpcotArea.WORLD_SHOWCASE]: [
        'Frozen Ever After',
        'Remy\'s Ratatouille Adventure',
        'Gran Fiesta Tour',
        'Reflections of China',
        'Impressions de France',
        'O Canada!',
        'The American Adventure'
    ]
}

/**
 * Get active festivals for a given date
 */
export function getActiveFestivals(date: Date = new Date()): EpcotFestival[] {
    const month = date.getMonth() + 1
    return EPCOT_FESTIVALS.filter(festival => {
        if (festival.startMonth <= festival.endMonth) {
            return month >= festival.startMonth && month <= festival.endMonth
        } else {
            // Festival spans year boundary (e.g., Nov-Dec to Jan-Feb)
            return month >= festival.startMonth || month <= festival.endMonth
        }
    })
}

/**
 * Determine which area an attraction belongs to
 */
export function getAttractionArea(attractionName: string): EpcotArea | null {
    for (const [area, attractions] of Object.entries(AREA_ATTRACTIONS)) {
        if (attractions.some(name =>
            attractionName.toLowerCase().includes(name.toLowerCase())
        )) {
            return area as EpcotArea
        }
    }

    // Check if it's in World Showcase by country
    const countries = Object.values(WorldShowcaseCountry)
    if (countries.some(country =>
        attractionName.toLowerCase().includes(country.toLowerCase())
    )) {
        return EpcotArea.WORLD_SHOWCASE
    }

    return null
}

/**
 * Get World Showcase country for an entity
 */
export function getWorldShowcaseCountry(entityName: string): WorldShowcaseCountry | null {
    for (const country of Object.values(WorldShowcaseCountry)) {
        if (entityName.toLowerCase().includes(country.toLowerCase())) {
            return country as WorldShowcaseCountry
        }
    }
    return null
}

/**
 * Get EPCOT attractions grouped by area
 */
export const getEpcotAttractionsByArea = cache(async () => {
    const childrenData = await themeParksAPI.getEpcotAttractions()

    const attractionsByArea: Record<EpcotArea, ThemeParksEntity[]> = {
        [EpcotArea.WORLD_CELEBRATION]: [],
        [EpcotArea.WORLD_DISCOVERY]: [],
        [EpcotArea.WORLD_NATURE]: [],
        [EpcotArea.WORLD_SHOWCASE]: []
    }

    childrenData.children
        .filter(child => child.entityType === 'ATTRACTION')
        .forEach(attraction => {
            const area = getAttractionArea(attraction.name)
            if (area) {
                attractionsByArea[area].push(attraction)
            }
        })

    return attractionsByArea
})

/**
 * Get EPCOT dining grouped by area and country
 */
export const getEpcotDining = cache(async () => {
    const childrenData = await themeParksAPI.getEpcotAttractions()

    const restaurants = childrenData.children.filter(
        child => child.entityType === 'RESTAURANT'
    )

    const diningByArea: Record<string, ThemeParksEntity[]> = {
        [EpcotArea.WORLD_CELEBRATION]: [],
        [EpcotArea.WORLD_DISCOVERY]: [],
        [EpcotArea.WORLD_NATURE]: [],
        [EpcotArea.WORLD_SHOWCASE]: []
    }

    // Group World Showcase restaurants by country
    const worldShowcaseByCountry: Record<string, ThemeParksEntity[]> = {}

    restaurants.forEach(restaurant => {
        const area = getAttractionArea(restaurant.name)
        if (area === EpcotArea.WORLD_SHOWCASE) {
            const country = getWorldShowcaseCountry(restaurant.name)
            if (country) {
                if (!worldShowcaseByCountry[country]) {
                    worldShowcaseByCountry[country] = []
                }
                worldShowcaseByCountry[country].push(restaurant)
            } else {
                diningByArea[EpcotArea.WORLD_SHOWCASE].push(restaurant)
            }
        } else if (area) {
            diningByArea[area].push(restaurant)
        }
    })

    return {
        byArea: diningByArea,
        worldShowcaseByCountry
    }
})

/**
 * Get current wait times grouped by area
 */
export const getEpcotWaitTimesByArea = async () => {
    const liveData = await themeParksAPI.getEpcotLive()

    const waitTimesByArea: Record<EpcotArea, LiveDataItem[]> = {
        [EpcotArea.WORLD_CELEBRATION]: [],
        [EpcotArea.WORLD_DISCOVERY]: [],
        [EpcotArea.WORLD_NATURE]: [],
        [EpcotArea.WORLD_SHOWCASE]: []
    }

    liveData.liveData
        .filter(item => item.queue?.STANDBY?.waitTime !== null)
        .forEach(item => {
            const area = getAttractionArea(item.name)
            if (area) {
                waitTimesByArea[area].push(item)
            }
        })

    // Calculate area statistics
    const areaStats = Object.entries(waitTimesByArea).map(([area, items]) => {
        const waitTimes = items
            .map(item => item.queue?.STANDBY?.waitTime || 0)
            .filter(time => time > 0)

        const average = waitTimes.length > 0
            ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
            : 0

        const max = waitTimes.length > 0 ? Math.max(...waitTimes) : 0
        const min = waitTimes.length > 0 ? Math.min(...waitTimes) : 0

        return {
            area,
            attractions: items,
            stats: {
                average,
                max,
                min,
                totalAttractions: items.length
            }
        }
    })

    return {
        byArea: waitTimesByArea,
        areaStats,
        lastUpdate: liveData.lastUpdate
    }
}

/**
 * Get festival-specific offerings
 */
export const getFestivalOfferings = cache(async (festivalName?: string) => {
    const childrenData = await themeParksAPI.getEpcotAttractions()
    const activeFestivals = getActiveFestivals()

    if (!festivalName && activeFestivals.length === 0) {
        return { message: 'No active festivals', offerings: [] }
    }

    const targetFestival = festivalName
        ? EPCOT_FESTIVALS.find(f => f.name.toLowerCase().includes(festivalName.toLowerCase()))
        : activeFestivals[0]

    if (!targetFestival) {
        return { message: 'Festival not found', offerings: [] }
    }

    // Filter entities that might be festival-related
    const festivalKeywords = ['festival', 'booth', 'marketplace', 'kitchen', 'studio']
    const festivalOfferings = childrenData.children.filter(entity =>
        festivalKeywords.some(keyword =>
            entity.name.toLowerCase().includes(keyword)
        )
    )

    return {
        festival: targetFestival,
        offerings: festivalOfferings,
        activeFestivals
    }
})

/**
 * Get recommended EPCOT experiences by interest
 */
export interface EpcotRecommendation {
    category: string
    attractions: ThemeParksEntity[]
    restaurants?: ThemeParksEntity[]
    description: string
}

export const getEpcotRecommendations = cache(async (interests: string[]) => {
    const [attractionsData, diningData] = await Promise.all([
        getEpcotAttractionsByArea(),
        getEpcotDining()
    ])

    const recommendations: EpcotRecommendation[] = []

    // Thrill seekers
    if (interests.includes('thrills')) {
        recommendations.push({
            category: 'Thrill Seekers',
            description: 'High-speed and intense experiences',
            attractions: [
                ...attractionsData[EpcotArea.WORLD_DISCOVERY].filter(a =>
                    ['Guardians', 'Test Track', 'Mission: SPACE'].some(name =>
                        a.name.includes(name)
                    )
                )
            ]
        })
    }

    // Food lovers
    if (interests.includes('food')) {
        const worldShowcaseDining = Object.values(diningData.worldShowcaseByCountry).flat()
        recommendations.push({
            category: 'Food & Wine Enthusiasts',
            description: 'Culinary journey around the world',
            attractions: attractionsData[EpcotArea.WORLD_SHOWCASE],
            restaurants: worldShowcaseDining.slice(0, 10) // Top 10 restaurants
        })
    }

    // Families with young children
    if (interests.includes('family')) {
        recommendations.push({
            category: 'Family Friendly',
            description: 'Perfect for all ages',
            attractions: [
                ...attractionsData[EpcotArea.WORLD_CELEBRATION].filter(a =>
                    ['Seas with Nemo', 'Turtle Talk', 'Journey Into Imagination'].some(name =>
                        a.name.includes(name)
                    )
                ),
                ...attractionsData[EpcotArea.WORLD_SHOWCASE].filter(a =>
                    ['Frozen Ever After', 'Remy\'s Ratatouille'].some(name =>
                        a.name.includes(name)
                    )
                )
            ]
        })
    }

    // Educational experiences
    if (interests.includes('education')) {
        recommendations.push({
            category: 'Educational Adventures',
            description: 'Learn while having fun',
            attractions: [
                ...attractionsData[EpcotArea.WORLD_CELEBRATION].filter(a =>
                    a.name.includes('Spaceship Earth')
                ),
                ...attractionsData[EpcotArea.WORLD_NATURE].filter(a =>
                    ['Living with the Land', 'Awesome Planet'].some(name =>
                        a.name.includes(name)
                    )
                ),
                ...attractionsData[EpcotArea.WORLD_SHOWCASE].filter(a =>
                    ['American Adventure', 'Reflections of China', 'O Canada'].some(name =>
                        a.name.includes(name)
                    )
                )
            ]
        })
    }

    return recommendations
})

/**
 * Get EPCOT park statistics
 */
export const getEpcotStats = async () => {
    const [parkData, childrenData, liveData] = await Promise.all([
        themeParksAPI.getEpcot(),
        themeParksAPI.getEpcotAttractions(),
        themeParksAPI.getEpcotLive()
    ])

    const attractions = childrenData.children.filter(c => c.entityType === 'ATTRACTION')
    const restaurants = childrenData.children.filter(c => c.entityType === 'RESTAURANT')
    const shops = childrenData.children.filter(c => c.entityType === 'MERCHANDISE')

    const operatingAttractions = liveData.liveData.filter(
        item => item.status === 'OPERATING' && item.entityType === 'ATTRACTION'
    )

    const waitTimes = liveData.liveData
        .filter(item => item.queue?.STANDBY?.waitTime)
        .map(item => item.queue!.STANDBY!.waitTime!)

    return {
        park: parkData,
        totals: {
            attractions: attractions.length,
            restaurants: restaurants.length,
            shops: shops.length,
            worldShowcaseCountries: 11
        },
        current: {
            operatingAttractions: operatingAttractions.length,
            averageWaitTime: waitTimes.length > 0
                ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
                : 0,
            maxWaitTime: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
            activeFestivals: getActiveFestivals()
        },
        lastUpdate: liveData.lastUpdate
    }
}